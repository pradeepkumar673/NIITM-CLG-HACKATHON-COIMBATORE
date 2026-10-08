"""Quality gate and image routing service."""

import json
from pathlib import Path
from typing import Dict, Any, Tuple
import yaml
import numpy as np
import cv2
from PIL import Image
import torch
import torchvision.models as models
from torchvision import transforms

ROOT = Path(__file__).resolve().parent.parent.parent.parent.parent

def _load_quality_thresholds() -> dict:
    cfg_path = ROOT / "config" / "quality_thresholds.yaml"
    if cfg_path.exists():
        with open(cfg_path, "r") as f:
            return yaml.safe_load(f)["thresholds"]
    return {
        "blur": [10.0, 10000.0],
        "exposure": [10.0, 240.0],
        "resolution": [10000.0, 1e8]
    }

def _load_gate_config() -> dict:
    cfg_path = ROOT / "config" / "ingest.yaml"
    if cfg_path.exists():
        with open(cfg_path, "r") as f:
            return yaml.safe_load(f).get("gate", {"confidence_threshold_xray": 0.5})
    return {"confidence_threshold_xray": 0.5}

# Global loaded model cache
_GATE_MODEL = None
_GATE_TRANSFORMS = None

def _get_gate_model():
    global _GATE_MODEL, _GATE_TRANSFORMS
    if _GATE_MODEL is not None:
        return _GATE_MODEL, _GATE_TRANSFORMS

    model_path = ROOT / "models/gate_classifier/best.pt"
    if not model_path.exists():
        return None, None

    model = models.mobilenet_v3_small(pretrained=False)
    model.classifier[3] = torch.nn.Linear(model.classifier[3].in_features, 3)
    
    ckpt = torch.load(model_path, map_location="cpu", weights_only=False)
    model.load_state_dict(ckpt["model_state_dict"])
    model.eval()

    t = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    _GATE_MODEL = model
    _GATE_TRANSFORMS = t
    return _GATE_MODEL, _GATE_TRANSFORMS


def compute_metrics(img: Image.Image) -> Dict[str, float]:
    arr = np.array(img.convert('L'))
    
    # Blur (variance of laplacian)
    blur = cv2.Laplacian(arr, cv2.CV_64F).var()
    # Exposure (mean intensity)
    exposure = arr.mean()
    # Resolution (pixels)
    res = arr.shape[0] * arr.shape[1]
    
    # Moire (basic periodic high freq detection via FFT)
    f = np.fft.fft2(arr)
    fshift = np.fft.fftshift(f)
    mag_spectrum = 20 * np.log(np.abs(fshift) + 1e-8)
    h, w = mag_spectrum.shape
    # Check energy in outer regions (high freq) compared to center
    center_energy = mag_spectrum[h//2-10:h//2+10, w//2-10:w//2+10].mean()
    outer_energy = mag_spectrum.mean()
    moire_score = float(outer_energy / (center_energy + 1e-8))
    
    return {
        "blur": float(blur),
        "exposure": float(exposure),
        "resolution": float(res),
        "moire": moire_score
    }


def evaluate_gate(img: Image.Image) -> Dict[str, Any]:
    """Evaluate image against quality checks and classifier."""
    thresholds = _load_quality_thresholds()
    gate_cfg = _load_gate_config()
    
    metrics = compute_metrics(img)
    flags = []
    
    if metrics["blur"] < thresholds["blur"][0]:
        flags.append("blurry")
    if metrics["exposure"] < thresholds["exposure"][0]:
        flags.append("underexposed")
    if metrics["exposure"] > thresholds["exposure"][1]:
        flags.append("overexposed")
    if metrics["resolution"] < thresholds["resolution"][0]:
        flags.append("low_resolution")
    if metrics["moire"] > 0.8: # Empirical simple threshold
        flags.append("moire_pattern_detected")
        
    action = "accept"
    if flags:
        action = "accept_with_warning"
        
    # Classifier check
    model, transform = _get_gate_model()
    is_xray = True
    body_part_guess = "unknown"
    reasons = flags.copy()
    
    if model and transform:
        rgb_img = img.convert("RGB")
        tensor = transform(rgb_img).unsqueeze(0)
        with torch.no_grad():
            logits = model(tensor)
            probs = torch.softmax(logits, dim=1)[0].numpy()
            
        # Classes: 0: xray, 1: mri, 2: natural
        xray_prob = probs[0]
        if xray_prob < gate_cfg.get("confidence_threshold_xray", 0.5):
            is_xray = False
            action = "reject"
            pred_class = np.argmax(probs)
            class_name = "mri" if pred_class == 1 else "natural_photo"
            reasons.append(f"Not an X-ray (detected as {class_name} with prob {probs[pred_class]:.2f})")
        else:
            # We don't have a body part classifier yet, so default to unknown
            # unless we add it later
            body_part_guess = "chest" # Just a placeholder assumption if it passes
    
    return {
        "is_xray": is_xray,
        "body_part_guess": body_part_guess,
        "quality": {
            "blur": metrics["blur"],
            "exposure": metrics["exposure"],
            "resolution": metrics["resolution"],
            "moire": metrics["moire"],
            "flags": flags
        },
        "action": action,
        "reasons": reasons
    }
