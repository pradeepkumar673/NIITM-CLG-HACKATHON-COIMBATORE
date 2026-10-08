"""
HuggingFace & pretrained model loaders for all inference tasks.

Each loader is a singleton that downloads weights on first call via
huggingface_hub or torchxrayvision and caches them in the HF cache dir.
No locally-trained weights are required.

Model inventory
---------------
Chest (14-finding multi-label):
  torchxrayvision DenseNet121 - "densenet121-res224-all"
  Trained on NIH ChestX-ray14 + CheXpert + MIMIC-CXR + PadChest (combined).
  Ref: Cohen et al., TorchXRayVision, MIDL 2022. arXiv:2111.00595

Lung segmentation (binary mask, left/right lung + heart):
  ianpan/chest-x-ray-basic - EfficientNetV2-S U-Net decoder.
  trust_remote_code=True required.

Bone fracture (binary: fractured / non_fractured):
  Hemgg/bone-fracture-detection-using-xray - ViT fine-tuned on FracAtlas.
  Loaded via transformers AutoModelForImageClassification.

Knee bone health (3-class: normal / osteopenia / osteoporosis):
  timm EfficientNet-B0 pretrained on ImageNet - best available backbone
  for transfer learning on knee X-rays (no dedicated HF model covers all
  3 classes with correct label mapping). Probabilities are soft scores.

TB detection (binary: Normal / Tuberculosis):
  Owos/tb-classifier - InceptionV3 fine-tuned on TB chest X-ray dataset.
  Loaded via transformers pipeline (image-classification).

Quality gate (X-ray vs MRI vs natural photo):
  torchvision MobileNetV3-Small with ImageNet weights - combined with
  physics-based quality metrics (blur, exposure, resolution).
"""
from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Any

import numpy as np
import torch
from PIL import Image

log = logging.getLogger(__name__)

# HF token (optional; only needed for private repos)
HF_TOKEN: str | None = os.environ.get("HF_API_TOKEN") or None


# =============================================================================
# 1. Chest - TorchXRayVision DenseNet121
# =============================================================================
_XRV_CHEST_MODEL: Any = None
_XRV_CHEST_PATHOLOGIES: list[str] | None = None


def get_chest_xrv_model() -> tuple[Any, list[str]]:
    """Return (xrv_model, pathology_list). Downloads on first call."""
    global _XRV_CHEST_MODEL, _XRV_CHEST_PATHOLOGIES
    if _XRV_CHEST_MODEL is not None:
        return _XRV_CHEST_MODEL, _XRV_CHEST_PATHOLOGIES  # type: ignore[return-value]

    try:
        import torchxrayvision as xrv  # type: ignore[import]
    except ImportError as exc:
        raise RuntimeError(
            "torchxrayvision not installed. Run: uv add torchxrayvision"
        ) from exc

    log.info("Loading TorchXRayVision DenseNet121 (densenet121-res224-all)...")

    # Pre-download weights manually if missing (XRV's built-in downloader
    # crashes on Windows due to Unicode block characters in the progress bar).
    weights_key = "densenet121-res224-all"
    url = xrv.models.model_urls[weights_key]["weights_url"]
    weights_filename = url.split("/")[-1]
    cache_dir = Path.home() / ".torchxrayvision" / "models_data"
    weights_path = cache_dir / weights_filename
    if not weights_path.exists():
        import urllib.request
        cache_dir.mkdir(parents=True, exist_ok=True)
        log.info("Downloading XRV weights from %s ...", url)
        urllib.request.urlretrieve(url, str(weights_path))
        log.info("XRV weights saved to %s", weights_path)

    model = xrv.models.DenseNet(weights=weights_key)
    model.eval()
    _XRV_CHEST_MODEL = model
    _XRV_CHEST_PATHOLOGIES = list(model.pathologies)
    log.info("Chest model ready - %d pathologies", len(_XRV_CHEST_PATHOLOGIES))
    return _XRV_CHEST_MODEL, _XRV_CHEST_PATHOLOGIES


def predict_chest(image_path: str) -> dict[str, dict]:
    """
    Run chest multi-label inference.

    Returns dict[label_name -> {probability, tier, calibrated}].
    All probabilities are in [0, 1].
    """
    import torchvision
    import torchxrayvision as xrv  # type: ignore[import]
    from skimage.io import imread  # type: ignore[import]

    model, pathologies = get_chest_xrv_model()

    img = imread(image_path)
    if img.ndim == 3:
        img = img.mean(2)

    img_norm = xrv.datasets.normalize(img, 255)
    img_norm = img_norm[None, ...]

    transform = torchvision.transforms.Compose([
        xrv.datasets.XRayCenterCrop(),
        xrv.datasets.XRayResizer(224),
    ])
    img_tensor = torch.from_numpy(transform(img_norm)).unsqueeze(0).float()

    with torch.no_grad():
        outputs = model(img_tensor)[0].cpu().numpy()

    results: dict[str, dict] = {}
    for i, label in enumerate(pathologies):
        prob = float(np.clip(outputs[i], 0.0, 1.0))
        tier = "high" if prob > 0.7 else ("medium" if prob > 0.3 else "low")
        key = label.replace(" ", "_")
        results[key] = {"probability": prob, "tier": tier, "calibrated": False}
    return results


# =============================================================================
# 2. Lung Segmentation - ianpan/chest-x-ray-basic
# =============================================================================
_LUNGSEG_MODEL: Any = None


def get_lungseg_hf_model() -> Any:
    """Return ianpan/chest-x-ray-basic model (downloads on first call)."""
    global _LUNGSEG_MODEL
    if _LUNGSEG_MODEL is not None:
        return _LUNGSEG_MODEL

    try:
        from transformers import AutoModel  # type: ignore[import]
    except ImportError as exc:
        raise RuntimeError(
            "transformers not installed. Run: uv add transformers"
        ) from exc

    log.info("Loading ianpan/chest-x-ray-basic lung segmentation model...")
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = AutoModel.from_pretrained(
        "ianpan/chest-x-ray-basic",
        trust_remote_code=True,
        token=HF_TOKEN,
    )
    model = model.eval().to(device)
    _LUNGSEG_MODEL = model
    log.info("Lung segmentation model ready on %s", device)
    return _LUNGSEG_MODEL


def predict_lung_mask(img_bgr: np.ndarray) -> np.ndarray:
    """
    Segment lungs from a BGR OpenCV image.

    Returns a binary uint8 mask (H x W) where 1 = lung, 0 = background.
    """
    import cv2

    model = get_lungseg_hf_model()
    device = next(model.parameters()).device

    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    x = model.preprocess(gray)
    x_tensor = torch.from_numpy(x).unsqueeze(0).unsqueeze(0).float().to(device)

    with torch.inference_mode():
        out = model(x_tensor)

    # out["mask"] shape: (1, C, H, W); argmax: 0=bg, 1=right, 2=left, 3=heart
    seg = out["mask"].argmax(1).squeeze(0).cpu().numpy()
    lung_mask = ((seg == 1) | (seg == 2)).astype(np.uint8)

    orig_h, orig_w = img_bgr.shape[:2]
    if lung_mask.shape != (orig_h, orig_w):
        lung_mask = cv2.resize(
            lung_mask, (orig_w, orig_h), interpolation=cv2.INTER_NEAREST
        )
    return lung_mask


# =============================================================================
# 3. Fracture - Hemgg/bone-fracture-detection-using-xray (ViT)
# =============================================================================
_FRACTURE_PIPE: Any = None


def get_fracture_pipeline() -> Any:
    """Return HF image-classification pipeline for fracture detection."""
    global _FRACTURE_PIPE
    if _FRACTURE_PIPE is not None:
        return _FRACTURE_PIPE

    try:
        from transformers import pipeline  # type: ignore[import]
    except ImportError as exc:
        raise RuntimeError(
            "transformers not installed. Run: uv add transformers"
        ) from exc

    log.info("Loading Hemgg/bone-fracture-detection-using-xray...")
    device_id = 0 if torch.cuda.is_available() else -1
    _FRACTURE_PIPE = pipeline(
        "image-classification",
        model="Hemgg/bone-fracture-detection-using-xray",
        device=device_id,
        token=HF_TOKEN,
    )
    log.info("Fracture model ready")
    return _FRACTURE_PIPE


def predict_fracture(image_path: str) -> dict[str, Any]:
    """
    Run fracture inference.

    Returns {probability: float [0,1], tier: str, label: str, calibrated: bool}.
    label is 'fractured' or 'non_fractured'.
    """
    pipe = get_fracture_pipeline()
    results = pipe(image_path, top_k=2)

    prob_fractured = 0.0
    for item in results:
        lbl = item["label"].lower().replace(" ", "_").replace("-", "_")
        if "not" not in lbl and "non" not in lbl:
            prob_fractured = float(item["score"])
            break

    tier = "high" if prob_fractured > 0.7 else (
        "medium" if prob_fractured > 0.3 else "low"
    )
    return {
        "probability": prob_fractured,
        "tier": tier,
        "label": "fractured" if prob_fractured > 0.5 else "non_fractured",
        "calibrated": False,
    }


# =============================================================================
# 4. Knee Bone Health - timm EfficientNet-B0 (ImageNet pretrained)
# =============================================================================
_KNEE_MODEL: Any = None
_KNEE_TRANSFORM: Any = None
_KNEE_CLASSES = ["normal", "osteopenia", "osteoporosis"]


def get_knee_model() -> tuple[Any, Any]:
    """Return (timm_model, transform) for knee classification."""
    global _KNEE_MODEL, _KNEE_TRANSFORM
    if _KNEE_MODEL is not None:
        return _KNEE_MODEL, _KNEE_TRANSFORM

    import timm  # type: ignore[import]

    log.info("Loading timm EfficientNet-B0 for knee bone health (ImageNet)...")
    model = timm.create_model(
        "efficientnet_b0", pretrained=True, num_classes=3
    )
    model.eval()

    cfg = timm.data.resolve_data_config({}, model=model)
    transform = timm.data.create_transform(**cfg)

    _KNEE_MODEL = model
    _KNEE_TRANSFORM = transform
    log.info("Knee model ready")
    return _KNEE_MODEL, _KNEE_TRANSFORM


def predict_knee(image_path: str) -> dict[str, Any]:
    """
    Run knee bone health inference.

    Returns dict mapping class to {probability, tier}.
    Sets needs_human_review=True (ImageNet pretrained, no knee-specific weights).
    """
    model, transform = get_knee_model()
    img = Image.open(image_path).convert("RGB")
    tensor = transform(img).unsqueeze(0)

    with torch.no_grad():
        logits = model(tensor)
        probs = torch.softmax(logits, dim=1)[0].cpu().numpy()

    findings: dict[str, Any] = {}
    for i, cls in enumerate(_KNEE_CLASSES):
        prob = float(probs[i])
        tier = "high" if prob > 0.7 else ("medium" if prob > 0.3 else "low")
        findings[cls] = {"probability": prob, "tier": tier, "calibrated": False}

    findings["needs_human_review"] = True  # type: ignore[assignment]
    findings["experimental"] = True  # type: ignore[assignment]
    return findings


# =============================================================================
# 5. TB Detection - Owos/tb-classifier (InceptionV3)
# =============================================================================
_TB_PIPE: Any = None


def get_tb_pipeline() -> Any:
    """Return HF image-classification pipeline for TB detection."""
    global _TB_PIPE
    if _TB_PIPE is not None:
        return _TB_PIPE

    try:
        from transformers import pipeline  # type: ignore[import]
    except ImportError as exc:
        raise RuntimeError(
            "transformers not installed. Run: uv add transformers"
        ) from exc

    log.info("Loading Owos/tb-classifier (InceptionV3)...")
    device_id = 0 if torch.cuda.is_available() else -1
    _TB_PIPE = pipeline(
        "image-classification",
        model="Owos/tb-classifier",
        device=device_id,
        token=HF_TOKEN,
    )
    log.info("TB model ready")
    return _TB_PIPE


def predict_tb(image_path: str) -> dict[str, Any]:
    """
    Run TB inference.

    Returns {probability: float, tier: str, label: str, calibrated: bool}.
    label is 'tb' or 'normal'.
    """
    pipe = get_tb_pipeline()
    results = pipe(image_path, top_k=2)

    prob_tb = 0.0
    for item in results:
        lbl = item["label"].lower()
        if "pos" in lbl or "tb" in lbl or "tuberc" in lbl:
            prob_tb = float(item["score"])
            break

    tier = "high" if prob_tb > 0.7 else ("medium" if prob_tb > 0.3 else "low")
    return {
        "probability": prob_tb,
        "tier": tier,
        "label": "tb" if prob_tb > 0.5 else "normal",
        "calibrated": False,
    }


# =============================================================================
# 6. Quality Gate - MobileNetV3-Small (ImageNet pretrained)
# =============================================================================
_GATE_MODEL_PRETRAINED: Any = None
_GATE_TRANSFORM_PRETRAINED: Any = None


def get_gate_pretrained_model() -> tuple[Any, Any]:
    """Return (mobilenet_v3_small, transform) with ImageNet weights."""
    global _GATE_MODEL_PRETRAINED, _GATE_TRANSFORM_PRETRAINED
    if _GATE_MODEL_PRETRAINED is not None:
        return _GATE_MODEL_PRETRAINED, _GATE_TRANSFORM_PRETRAINED

    from torchvision import models, transforms

    log.info("Loading MobileNetV3-Small (ImageNet) as quality gate model...")
    weights = models.MobileNet_V3_Small_Weights.IMAGENET1K_V1
    model = models.mobilenet_v3_small(weights=weights)
    model.eval()

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])

    _GATE_MODEL_PRETRAINED = model
    _GATE_TRANSFORM_PRETRAINED = transform
    log.info("Gate pretrained model ready")
    return _GATE_MODEL_PRETRAINED, _GATE_TRANSFORM_PRETRAINED
