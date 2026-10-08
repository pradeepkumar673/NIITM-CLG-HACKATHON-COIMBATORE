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
            result_json = {"findings": {}, "interactions": [], "triage": {"level": "routine", "reasons": []}}
            
            # Helper for heatmap path
            def get_hm_path(label_name: str):
                base_dir = Path(study.image_path).parent / f"study_{study.id}_heatmaps"
                base_dir.mkdir(parents=True, exist_ok=True)
                return str(base_dir / f"heatmap_{label_name}.png")
            
            if study.body_part == BodyPart.chest:
                # 1. Chest multi-label (torchxrayvision DenseNet121, densenet121-res224-all)
                _notify(study_id, "stage", {"stage": "classification", "message": "Analyzing chest abnormalities..."})
                try:
                    import cv2
                    import numpy as np
                    from backend.app.services.inference.hf_models import (
                        predict_chest,
                        get_chest_xrv_model,
                    )

                    res = predict_chest(study.image_path)
                    result_json["findings"] = res

                    # GradCAM on top finding
                    xrv_model, pathologies = get_chest_xrv_model()
                    import torchxrayvision as xrv
                    import torchvision
                    import torch
                    from skimage.io import imread

                    raw_img = imread(study.image_path)
                    if raw_img.ndim == 3:
                        raw_img = raw_img.mean(2)
                    img_norm = xrv.datasets.normalize(raw_img, 255)[None, ...]
                    transform = torchvision.transforms.Compose([
                        xrv.datasets.XRayCenterCrop(),
                        xrv.datasets.XRayResizer(224),
                    ])
                    img_tensor = torch.from_numpy(transform(img_norm)).unsqueeze(0).float()

                    top_idx = int(np.argmax([res[k]["probability"] for k in res]))
                    top_label = list(res.keys())[top_idx]

                    try:
                        from backend.app.services.explain.cam import generate_gradcam
                        target_layer = xrv_model.features[-1]
                        img_bgr = cv2.imread(study.image_path, cv2.IMREAD_COLOR)
                        img_vis = cv2.resize(img_bgr, (224, 224)).astype(np.float32) / 255.0
                        raw_cam, overlay, saliency = generate_gradcam(
                            xrv_model, img_tensor, top_idx, target_layer, img_vis
                        )
                        out_path = get_hm_path(top_label)
                        overlay_bgr = cv2.cvtColor((overlay * 255).astype(np.uint8), cv2.COLOR_RGB2BGR)
                        cv2.imwrite(out_path, overlay_bgr)
                        # ── Step 9A: add peak + salient regions to the finding ──────────
                        top_finding = result_json["findings"].get(top_label, {})
                        top_finding["peak_x"] = saliency["peak_x"]
                        top_finding["peak_y"] = saliency["peak_y"]
                        top_finding["salient_regions"] = saliency["salient_regions"]
                        result_json["findings"][top_label] = top_finding

                    except Exception as cam_err:
                        log.warning(f"GradCAM skipped: {cam_err}")

                except Exception as e:
                    log.error(f"Chest inference error: {e}")
                    
                # 4. Rules
                _notify(study_id, "stage", {"stage": "rules", "message": "Applying comorbidity rules..."})
                t_cpu_start = time.perf_counter()
                try:
                    findings_list = [{"label": k, **v} for k, v in result_json["findings"].items() if isinstance(v, dict)]
                    rule_res = get_rule_engine().evaluate(findings_list, history_flags, age)
                    result_json["interactions"] = rule_res.get("interactions", [])
                    result_json["triage"] = rule_res.get("triage", {"level": "routine", "reasons": []})
                except Exception as e:
                    import traceback
                    log.error(f"Rule engine error: {e}")
                    log.error(traceback.format_exc())
                t_cpu += (time.perf_counter() - t_cpu_start)
                    
            elif study.body_part == BodyPart.bone:
                # Fracture: Hemgg/bone-fracture-detection-using-xray (ViT fine-tuned)
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
                    result_json["needs_human_review"] = frac_result["probability"] < 0.4
                except Exception as e:
                    log.error(f"Fracture inference error: {e}")
                    result_json["findings"]["fracture"] = {"error": str(e)}
                _generate_heatmap("ViT", study.image_path, 0, get_hm_path("fracture"))

            elif study.body_part == BodyPart.knee:
                # Knee: timm EfficientNet-B0 ImageNet pretrained (no knee-specific HF model)
                _notify(study_id, "stage", {"stage": "classification", "message": "Analyzing knee health..."})
                try:
                    from backend.app.services.inference.hf_models import predict_knee
                    knee_result = predict_knee(study.image_path)
                    result_json["findings"].update({
                        k: v for k, v in knee_result.items()
                        if k not in ("needs_human_review", "experimental")
                    })
                    result_json["needs_human_review"] = True
                    result_json["disclaimer"] = (
                        "Knee bone health scores are from an ImageNet-pretrained backbone "
                        "without knee-specific fine-tuning. Treat as decision support only. "
                        "Human review required."
                    )
                except Exception as e:
                    log.error(f"Knee inference error: {e}")
                    result_json["findings"]["knee"] = {"error": str(e)}
                _generate_heatmap("", study.image_path, 0, get_hm_path("osteopenia"))
                
            # 5. LLM Summary using Groq
            _notify(study_id, "stage", {"stage": "summary", "message": "Generating LLM summary..."})
            try:
                import json
                from groq import Groq
                import os
                groq_key = os.environ.get("GROQ_API_KEY")
                if groq_key:
                    client = Groq(api_key=groq_key)
                    prompt = f"You are an AI radiologist assistant. Write a concise, 3-sentence summary report for this X-Ray based strictly on these findings and triage flags: {json.dumps(result_json)}. Do not invent findings. Keep it highly professional."
                    chat_completion = client.chat.completions.create(
                        messages=[{"role": "user", "content": prompt}],
                        model=os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile"),
                        max_tokens=200,
                    )
                    result_json["llm_summary"] = chat_completion.choices[0].message.content
            except Exception as e:
                log.error(f"LLM Summary error: {e}")
                
            # 6. Anatomy resolution (Step 10A)
            _notify(study_id, "stage", {"stage": "anatomy", "message": "Resolving anatomy..."})
            try:
                from backend.app.services.anatomy import resolve_anatomy
                anatomy_res = resolve_anatomy(study.body_part, study.image_path, result_json)
                result_json["anatomy"] = anatomy_res
            except Exception as e:
                log.error(f"Anatomy resolution error: {e}")
                result_json["anatomy"] = {"error": str(e), "status": "failed"}

            result_json["disclaimer"] = "Exploratory estimate; not validated on outcome data."
            from backend.app.db.models import Result
            res_obj = Result(
                study_id=study.id,
                findings_json=result_json.get("findings", {}),
                interactions_json=result_json.get("interactions", []),
                review_reasons_json=result_json.get("triage", {})
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
