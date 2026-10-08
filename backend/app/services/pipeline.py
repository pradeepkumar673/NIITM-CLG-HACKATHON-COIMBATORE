import asyncio
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional

import torch
import cv2
import numpy as np

from backend.app.db import session as db_session
from backend.app.db.models import Study, StudyStatus, BodyPart
from backend.app.services.inference.registry import UnifiedModelRegistry
from backend.app.services.gate.gatekeeper import evaluate_gate
from backend.app.services.rules import RuleEngine
# No bad import
from backend.app.services.lungseg import segment_lungs

log = logging.getLogger(__name__)
ROOT = Path(__file__).resolve().parent.parent.parent.parent

_gpu_semaphore = asyncio.Semaphore(1)
_registry = None
_rule_engine = None
_config_uncertainty = None
_event_listeners: Dict[int, list[asyncio.Queue]] = {}

def get_registry():
    global _registry
    if _registry is None:
        _registry = UnifiedModelRegistry(
            models_yaml_path=str(ROOT / "config/models.yaml"),
            models_dir=str(ROOT / "models")
        )
    return _registry

def get_rule_engine():
    global _rule_engine
    if _rule_engine is None:
        _rule_engine = RuleEngine()
    return _rule_engine

def load_config():
    global _config_uncertainty
    if _config_uncertainty is None:
        import yaml
        with open(ROOT / "config/uncertainty.yaml", "r") as f:
            _config_uncertainty = yaml.safe_load(f)
    return _config_uncertainty

def init_pipeline():
    # Warm up models
    reg = get_registry()
    get_rule_engine()
    load_config()
    # Eagerly load some models if needed, but registry handles lazy loading.
    
def subscribe_events(study_id: int) -> asyncio.Queue:
    if study_id not in _event_listeners:
        _event_listeners[study_id] = []
    q = asyncio.Queue()
    _event_listeners[study_id].append(q)
    return q
    
def _notify(study_id: int, event: str, data: dict = None):
    if study_id in _event_listeners:
        msg = {"event": event, "data": data or {}}
        for q in _event_listeners[study_id]:
            q.put_nowait(msg)

def _generate_heatmap(model_name: str, image_path: str, label_idx: int, out_path: str, threshold: float = 0.5):
    # Generating real heatmaps for ViT models requires Attention Rollout, which is not currently implemented.
    # We will NOT generate a fake/dummy heatmap to comply with strict medical data rules.
    log.warning(f"Heatmap generation not supported for this model architecture ({model_name}).")

def _generate_vit_heatmap(image_path: str, out_path: str, unc_path: str = None):
    import cv2
    import numpy as np
    import torch
    from backend.app.services.inference.hf_models import get_fracture_pipeline
    try:
        from pytorch_grad_cam import EigenCAM
        from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
        from pytorch_grad_cam.utils.image import show_cam_on_image
    except ImportError:
        log.warning("pytorch_grad_cam not installed – fracture heatmap skipped.")
        return None
    
    try:
        pipe = get_fracture_pipeline()
        model = pipe.model
        processor = pipe.image_processor
        
        class ViTOutputWrapper(torch.nn.Module):
            def __init__(self, m):
                super().__init__()
                self.m = m
                self.vit = m.vit
            def forward(self, x):
                return self.m(x).logits
                
        wrapped_model = ViTOutputWrapper(model)
        
        def reshape_transform(tensor, height=14, width=14):
            result = tensor[:, 1:, :].reshape(tensor.size(0), height, width, tensor.size(2))
            return result.transpose(2, 3).transpose(1, 2)
            
        target_layers = [wrapped_model.vit.encoder.layer[-1].layernorm_before]
        cam = EigenCAM(model=wrapped_model, target_layers=target_layers, reshape_transform=reshape_transform)
        
        img_bgr = cv2.imread(image_path, cv2.IMREAD_COLOR)
        if img_bgr is None:
            return None
            
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        inputs = processor(images=img_rgb, return_tensors="pt")
        input_tensor = inputs["pixel_values"].to(model.device)
        
        targets = [ClassifierOutputTarget(0)]  # 0 is fractured
        
        # 1. Base Heatmap
        grayscale_cam = cam(input_tensor=input_tensor, targets=targets)[0, :]
        
        orig_h, orig_w = img_bgr.shape[:2]
        grayscale_cam = cv2.resize(grayscale_cam, (orig_w, orig_h))
        heatmap = cv2.applyColorMap(np.uint8(255 * grayscale_cam), cv2.COLORMAP_JET)
        cv2.imwrite(out_path, heatmap)
        log.info(f"ViT heatmap saved to {out_path}")

        # 2. MC Dropout Uncertainty (if unc_path is provided)
        uncertainty_stats = None
        if unc_path:
            # Enable dropout
            for module in wrapped_model.modules():
                if isinstance(module, (torch.nn.Dropout, torch.nn.Dropout2d, torch.nn.AlphaDropout)):
                    module.train()
            
            n_passes = 10
            cams = []
            for _ in range(n_passes):
                mc_cam = cam(input_tensor=input_tensor, targets=targets)[0, :]
                cams.append(mc_cam)
            wrapped_model.eval()

            stacked = np.stack(cams, axis=0)
            std_map = np.std(stacked, axis=0)
            if std_map.max() > 0:
                std_map = (std_map / std_map.max()).astype(np.float32)
            
            std_map_full = cv2.resize(std_map, (orig_w, orig_h))
            img_vis = cv2.resize(img_bgr, (224, 224)).astype(np.float32) / 255.0
            img_vis_full = cv2.resize(img_vis, (orig_w, orig_h))
            unc_overlay = show_cam_on_image(img_vis_full, std_map_full, use_rgb=True, colormap=cv2.COLORMAP_JET)
            unc_bgr = cv2.cvtColor((unc_overlay * 255).astype(np.uint8), cv2.COLOR_RGB2BGR)
            cv2.imwrite(unc_path, unc_bgr)

            uncertainty_stats = {
                "std_map_64x64": cv2.resize(std_map, (64, 64)).tolist(),
                "mean_std": float(std_map.mean()),
                "max_std": float(std_map.max()),
                "n_passes": n_passes,
                "method": "mc_dropout_eigencam_vit",
                "top_label": "fracture"
            }
            log.info(f"ViT uncertainty saved to {unc_path}")
        
        return uncertainty_stats
    except Exception as e:
        log.warning(f"Failed to generate ViT heatmap/uncertainty: {e}")
        return None

async def run_analysis_task(study_id: int, history_flags: dict, age: Optional[int], sex: Optional[str]):
    import time
    t0 = time.perf_counter()
    async with _gpu_semaphore:
        t_wait = time.perf_counter() - t0
        db = db_session._SessionLocal()
        study = db.query(Study).filter(Study.id == study_id).first()
        if not study:
            db.close()
            return
            
        study.status = StudyStatus.processing
        db.commit()
        _notify(study_id, "stage", {"stage": "processing", "message": "Starting analysis..."})
        
        t_start_gpu = time.perf_counter()
        t_cpu = 0
        try:
            cfg = load_config()
            result_json: Dict[str, Any] = {
                "findings": {},
                "interactions": [],
                "interaction_graph": {"nodes": [], "edges": []},
                "triage": {"level": "routine", "reasons": []},
            }
            uncertainty_result: Dict[str, Any] = {}
            
            # ── helpers ──────────────────────────────────────────────────
            def get_hm_path(label_name: str) -> str:
                base_dir = Path(study.image_path).parent / f"study_{study.id}_heatmaps"
                base_dir.mkdir(parents=True, exist_ok=True)
                return str(base_dir / f"heatmap_{label_name}.png")

            def get_uncertainty_path() -> str:
                base_dir = Path(study.image_path).parent / f"study_{study.id}_heatmaps"
                base_dir.mkdir(parents=True, exist_ok=True)
                return str(base_dir / "uncertainty.png")
            
            # ═══════════════════════════════════════════════════════════
            if study.body_part == BodyPart.chest:
                # ── 1. Classification ───────────────────────────────────
                _notify(study_id, "stage", {"stage": "classification", "message": "Analyzing chest abnormalities..."})
                try:
                    import cv2 as _cv2
                    import numpy as _np
                    from backend.app.services.inference.hf_models import predict_chest, get_chest_xrv_model
                    import torchxrayvision as xrv
                    import torchvision
                    import torch as _torch
                    from skimage.io import imread

                    res = predict_chest(study.image_path)
                    result_json["findings"] = res

                    # Pre-build img_tensor once – reused by heatmap + uncertainty
                    xrv_model, pathologies = get_chest_xrv_model()
                    raw_img = imread(study.image_path)
                    if raw_img.ndim == 3:
                        raw_img = raw_img.mean(2)
                    img_norm = xrv.datasets.normalize(raw_img, 255)[None, ...]
                    tfm = torchvision.transforms.Compose([
                        xrv.datasets.XRayCenterCrop(),
                        xrv.datasets.XRayResizer(224),
                    ])
                    img_tensor = _torch.from_numpy(tfm(img_norm)).unsqueeze(0).float()

                    top_idx = int(_np.argmax([res[k]["probability"] for k in res]))
                    top_label = list(res.keys())[top_idx]

                    # Read full-size BGR for overlay
                    img_bgr_full = _cv2.imread(study.image_path, _cv2.IMREAD_COLOR)
                    img_vis = _cv2.resize(img_bgr_full, (224, 224)).astype(_np.float32) / 255.0

                except Exception as e:
                    log.error(f"Chest inference error: {e}")
                    img_tensor = None
                    top_idx = 0
                    top_label = "unknown"
                    img_vis = None
                    img_bgr_full = None

                # ── 2. Heatmap generation (GradCAM++) ───────────────────
                _notify(study_id, "stage", {"stage": "heatmap", "message": "Synthesizing Grad-CAM saliency mapping and localization..."})
                if img_tensor is not None:
                    try:
                        from backend.app.services.explain.cam import generate_gradcam
                        target_layer = xrv_model.features[-1]
                        raw_cam, overlay, saliency = generate_gradcam(
                            xrv_model, img_tensor, top_idx, target_layer, img_vis
                        )
                        out_path = get_hm_path(top_label)
                        overlay_bgr = cv2.cvtColor((overlay * 255).astype(np.uint8), cv2.COLOR_RGB2BGR)
                        cv2.imwrite(out_path, overlay_bgr)
                        # Attach saliency peak to finding
                        top_finding = result_json["findings"].get(top_label, {})
                        top_finding["peak_x"] = saliency["peak_x"]
                        top_finding["peak_y"] = saliency["peak_y"]
                        top_finding["salient_regions"] = saliency["salient_regions"]
                        result_json["findings"][top_label] = top_finding
                        log.info(f"GradCAM++ heatmap saved for label '{top_label}'")
                    except Exception as cam_err:
                        log.warning(f"GradCAM++ skipped: {cam_err}")

                # ── 3. Uncertainty estimate (MC dropout) ─────────────────
                _notify(study_id, "stage", {"stage": "uncertainty", "message": "Monte Carlo dropout variance and calibration..."})
                if img_tensor is not None:
                    try:
                        from backend.app.services.explain.cam import generate_spatial_uncertainty
                        n_passes = int(cfg.get("mc_dropout", {}).get("n_passes", 10))
                        target_layer = xrv_model.features[-1]
                        std_map, unc_overlay, downsampled_64 = generate_spatial_uncertainty(
                            xrv_model, img_tensor, top_idx, target_layer, n_passes, img_vis
                        )
                        # Save uncertainty image
                        unc_path = get_uncertainty_path()
                        unc_bgr = cv2.cvtColor((unc_overlay * 255).astype(np.uint8), cv2.COLOR_RGB2BGR)
                        cv2.imwrite(unc_path, unc_bgr)
                        uncertainty_result = {
                            "std_map_64x64": downsampled_64.tolist(),
                            "mean_std": float(std_map.mean()),
                            "max_std": float(std_map.max()),
                            "n_passes": n_passes,
                            "method": "mc_dropout_gradcam_plusplus",
                            "top_label": top_label,
                        }
                        log.info(f"MC uncertainty computed: mean_std={uncertainty_result['mean_std']:.4f}, image saved to {unc_path}")
                    except Exception as unc_err:
                        log.warning(f"Uncertainty estimation skipped: {unc_err}")
                        uncertainty_result = {
                            "error": str(unc_err),
                            "method": "mc_dropout_gradcam_plusplus",
                        }

                # ── 4. Clinical rules ────────────────────────────────────
                _notify(study_id, "stage", {"stage": "rules", "message": "Evaluates clinical risk history flags and protocols..."})
                t_cpu_start = time.perf_counter()
                try:
                    findings_list = [{"label": k, **v} for k, v in result_json["findings"].items() if isinstance(v, dict)]
                    rule_res = get_rule_engine().evaluate(findings_list, history_flags, age)
                    result_json["interactions"] = rule_res.get("interactions", [])
                    result_json["interaction_graph"] = rule_res.get("graph", {"nodes": [], "edges": []})
                    result_json["triage"] = rule_res.get("triage", {"level": "routine", "reasons": []})
                    log.info(f"Rule engine fired {len(result_json['interactions'])} rule(s). Triage: {result_json['triage']['level']}")
                except Exception as e:
                    import traceback
                    log.error(f"Rule engine error: {e}")
                    log.error(traceback.format_exc())
                t_cpu += (time.perf_counter() - t_cpu_start)

            # ═══════════════════════════════════════════════════════════
            elif study.body_part == BodyPart.bone:
                _notify(study_id, "stage", {"stage": "classification", "message": "Analyzing for fracture..."})
                try:
                    from backend.app.services.inference.hf_models import predict_fracture
                    frac_result = predict_fracture(study.image_path)
                    result_json["findings"]["fracture"] = {
                        "probability": frac_result["probability"],
                        "tier": frac_result["tier"],
                        "label": frac_result["label"],
                        "calibrated": False,
                        "source": "Hemgg/bone-fracture-detection-using-xray",
                    }
                    import os
                    frac_thresh = float(os.environ.get("FRACTURE_REVIEW_THRESHOLD", 0.4))
                    prob = frac_result["probability"]
                    result_json["needs_human_review"] = prob < frac_thresh or prob > 0.85
                    tier = frac_result["tier"]
                    result_json["triage"] = {
                        "level": tier,
                        "reasons": [
                            f"Fracture probability {prob:.1%} ({tier} confidence)",
                            "Human radiologist confirmation recommended before treatment.",
                        ]
                    }
                except Exception as e:
                    log.error(f"Fracture inference error: {e}")
                    result_json["findings"]["fracture"] = {"error": str(e)}

                _notify(study_id, "stage", {"stage": "heatmap", "message": "Synthesizing Grad-CAM saliency mapping and localization..."})
                _notify(study_id, "stage", {"stage": "uncertainty", "message": "Monte Carlo dropout variance and calibration..."})
                
                unc_stats = _generate_vit_heatmap(study.image_path, get_hm_path("fracture"), get_uncertainty_path())
                if unc_stats:
                    uncertainty_result = unc_stats
                else:
                    uncertainty_result = {
                        "method": "vit_not_implemented",
                        "note": "Spatial MC-dropout uncertainty failed or not supported for ViT-based fracture model.",
                    }

            # ═══════════════════════════════════════════════════════════
            elif study.body_part == BodyPart.knee:
                _notify(study_id, "stage", {"stage": "classification", "message": "Analyzing knee health..."})
                try:
                    from backend.app.services.inference.hf_models import predict_knee
                    knee_result = predict_knee(study.image_path)
                    result_json["findings"].update({
                        k: v for k, v in knee_result.items()
                        if k not in ("needs_human_review",)
                    })
                    result_json["experimental"] = True
                    result_json["needs_human_review"] = True
                    result_json["disclaimer"] = (
                        "Knee bone health scores are from an ImageNet-pretrained backbone "
                        "without knee-specific fine-tuning. Treat as decision support only. "
                        "Human review required."
                    )
                except Exception as e:
                    log.error(f"Knee inference error: {e}")
                    result_json["findings"]["knee"] = {"error": str(e)}

                _notify(study_id, "stage", {"stage": "heatmap", "message": "Synthesizing Grad-CAM saliency mapping and localization..."})
                _generate_heatmap("", study.image_path, 0, get_hm_path("osteopenia"))

                _notify(study_id, "stage", {"stage": "uncertainty", "message": "Monte Carlo dropout variance and calibration..."})
                uncertainty_result = {
                    "method": "not_computed",
                    "note": "Uncertainty estimation not available for knee model.",
                }

            # ═══════════════════════════════════════════════════════════
            # 5. LLM Summary using Groq
            _notify(study_id, "stage", {"stage": "summary", "message": "Generating LLM summary..."})
            try:
                import json as _json
                from groq import Groq
                import os
                groq_key = os.environ.get("GROQ_API_KEY")
                if groq_key:
                    client = Groq(api_key=groq_key)
                    # Pass only model outputs – no patient identifiers (R10)
                    llm_payload = {
                        "findings": {
                            k: {"probability": v.get("probability"), "tier": v.get("tier")}
                            for k, v in result_json.get("findings", {}).items()
                            if isinstance(v, dict) and "probability" in v
                        },
                        "triage": result_json.get("triage"),
                    }
                    prompt = (
                        "You are an AI radiologist assistant providing decision support (NOT a definitive diagnosis). "
                        "Write a concise, 3-sentence summary for this X-Ray based strictly on these AI-generated findings: "
                        f"{_json.dumps(llm_payload)}. "
                        "Do not invent findings. State that clinical confirmation is required. Keep it highly professional."
                    )
                    chat_completion = client.chat.completions.create(
                        messages=[{"role": "user", "content": prompt}],
                        model=os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile"),
                        max_tokens=200,
                    )
                    result_json["llm_summary"] = chat_completion.choices[0].message.content
            except Exception as e:
                log.error(f"LLM Summary error: {e}")
                
            # 6. Anatomy resolution
            _notify(study_id, "stage", {"stage": "anatomy", "message": "Resolving anatomy..."})
            try:
                from backend.app.services.anatomy import resolve_anatomy
                anatomy_res = resolve_anatomy(study.body_part, study.image_path, result_json)
                result_json["anatomy"] = anatomy_res
            except Exception as e:
                log.error(f"Anatomy resolution error: {e}")
                result_json["anatomy"] = {"error": str(e), "status": "failed"}

            if "disclaimer" not in result_json:
                result_json["disclaimer"] = "Decision support only. Not a diagnosis. Requires clinician review."

            from backend.app.db.models import Result
            res_obj = Result(
                study_id=study.id,
                findings_json=result_json.get("findings", {}),
                # Store both the interactions list and the graph so the frontend can use both
                interactions_json={
                    "interactions": result_json.get("interactions", []),
                    "graph": result_json.get("interaction_graph", {"nodes": [], "edges": []}),
                },
                review_reasons_json=result_json.get("triage", {"level": "routine", "reasons": []}),
                needs_human_review=result_json.get("needs_human_review", True),
                explanation_json={
                    "llm_summary": result_json.get("llm_summary"),
                    "disclaimer": result_json.get("disclaimer"),
                    "experimental": result_json.get("experimental", False),
                    "anatomy": result_json.get("anatomy"),
                },
                # uncertainty_json now stores actual MC dropout uncertainty data (not anatomy)
                uncertainty_json=uncertainty_result if uncertainty_result else None,
                model_versions_json=result_json.get("model_versions"),
            )
            db.add(res_obj)
            
            study.status = StudyStatus.done
            
            t_gpu = time.perf_counter() - t_start_gpu
            log.info(f"Profiling study {study_id}: Wait={t_wait:.2f}s, GPU={t_gpu:.2f}s, CPU={t_cpu:.2f}s")
            db.commit()
            _notify(study_id, "stage", {"stage": "done", "message": "Analysis complete."})
            
        except Exception as e:
            log.exception("Analysis failed")
            study.status = StudyStatus.failed
            study.result_json = {"error": str(e)}
            db.commit()
            _notify(study_id, "stage", {"stage": "failed", "message": str(e)})
        finally:
            db.close()
            # Clean up queues
            if study_id in _event_listeners:
                for q in _event_listeners[study_id]:
                    q.put_nowait({"event": "close"})
                del _event_listeners[study_id]
