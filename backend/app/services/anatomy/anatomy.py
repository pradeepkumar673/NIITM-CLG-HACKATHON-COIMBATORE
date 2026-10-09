import yaml
from pathlib import Path
import torch
import torch.nn as nn
from typing import Dict, Any, Optional

from backend.app.db.models import BodyPart
from backend.app.services.inference.hf_models import get_gate_pretrained_model
import torchvision.transforms.functional as TF
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent.parent.parent.parent

_anatomy_config = None
_region_classifier = None
_region_calib = None

def load_anatomy_config():
    global _anatomy_config
    if _anatomy_config is None:
        with open(ROOT / "config" / "anatomy.yaml", "r", encoding="utf-8") as f:
            _anatomy_config = yaml.safe_load(f)
    return _anatomy_config

def get_region_classifier():
    global _region_classifier, _region_calib
    if _region_classifier is None:
        model_dir = ROOT / "models" / "region"
        if not (model_dir / "classifier.pt").exists():
            return None, None
            
        clf = nn.Linear(576, 4)
        clf.load_state_dict(torch.load(model_dir / "classifier.pt", map_location='cpu'))
        clf.eval()
        _region_classifier = clf
        
        with open(model_dir / "calibration.json", "r", encoding="utf-8") as f:
            import json
            _region_calib = json.load(f)
            
    return _region_classifier, _region_calib

def predict_fracatlas_region(image_path: str):
    clf, calib = get_region_classifier()
    if clf is None:
        return "other", 0.0
        
    mobilenet, transform = get_gate_pretrained_model()
    device = next(mobilenet.parameters()).device
    clf = clf.to(device)
    
    img = Image.open(image_path).convert("RGB")
    tensor = transform(img).unsqueeze(0).to(device)
    
    with torch.no_grad():
        feat = mobilenet.features(tensor)
        pool = nn.AdaptiveAvgPool2d(1)
        feat = pool(feat).flatten(1)
        logits = clf(feat)
        
        scaled_logits = logits / calib['temperature']
        probs = torch.softmax(scaled_logits, dim=1)[0]
        pred_idx = torch.argmax(probs).item()
        
    pred_class = calib['classes'][pred_idx]
    pred_prob = probs[pred_idx].item()
    
    return pred_class, pred_prob

def resolve_anatomy(body_part: BodyPart, image_path: str, result_json: dict) -> dict:
    cfg = load_anatomy_config()
    min_acc = cfg.get("min_region_accuracy", 0.60)
    rev_status = cfg.get("meta", {}).get("review_status", "draft")
    
    anatomy_res = {
        "region_id": None,
        "region_probability": 1.0,
        "targets": [],
        "status": "not_applicable",
        "source_config_review_status": rev_status
    }
    
    if body_part == BodyPart.bone:
        # FracAtlas
        pred_class, pred_prob = predict_fracatlas_region(image_path)
        mapping = cfg.get("fracatlas_body_part_to_region", {}).get(pred_class, {})
        reg_id = mapping.get("region_id")
        
        # Check accuracy threshold
        clf, calib = get_region_classifier()
        if calib and calib.get("test_accuracy", 1.0) < min_acc:
            reg_id = None
            
        anatomy_res["region_id"] = reg_id
        anatomy_res["region_probability"] = pred_prob
        
        if reg_id:
            anatomy_res["status"] = "determined"
            # Add target if fracture is predicted
            frac_finding = result_json.get("findings", {}).get("fracture")
            if frac_finding and frac_finding.get("label") == "fractured":
                anatomy_res["targets"].append({
                    "id": reg_id,
                    "type": "bone_region",
                    "severity_source": "fracture_probability",
                    "value": frac_finding["probability"],
                    "tier": frac_finding["tier"]
                })
        else:
            anatomy_res["status"] = "region_uncertain"
            
    elif body_part == BodyPart.knee:
        # Knee
        pred_class = "normal"
        for k, v in result_json.get("findings", {}).items():
            if isinstance(v, dict) and k in ["osteoporosis", "osteopenia"]:
                if v.get("tier") in ["high", "medium"]:
                    pred_class = "osteoporosis"
                    break
                    
        mapping = cfg.get("knee_to_region", {}).get(pred_class, {})
        reg_id = mapping.get("region_id")
        anatomy_res["region_id"] = reg_id
        
        if reg_id:
            anatomy_res["status"] = "determined"
            # Map targets
            for k, v in result_json.get("findings", {}).items():
                if isinstance(v, dict) and k in ["osteoporosis", "osteopenia"] and v.get("probability", 0) > 0.1:
                    anatomy_res["targets"].append({
                        "id": reg_id,
                        "type": "bone_region",
                        "severity_source": "finding_probability",
                        "value": v["probability"],
                        "tier": v["tier"]
                    })
        else:
            anatomy_res["status"] = "region_uncertain"
            
    elif body_part == BodyPart.chest:
        anatomy_res["status"] = "determined"
        
        for label, finding in result_json.get("findings", {}).items():
            if not isinstance(finding, dict) or "probability" not in finding:
                continue
                
            mapping = cfg.get("chest_finding_to_target", {}).get(label)
            if not mapping:
                continue
                
            anatomy_res["targets"].append({
                "id": mapping["region_id"],
                "type": mapping["type"],
                "severity_source": "finding_probability",
                "value": finding["probability"],
                "tier": finding["tier"]
            })
            
            if mapping.get("bilateral"):
                # If bilateral, we might want to highlight both sides. 
                # For simplicity, if the config maps to 'lung_right_lower', we can add 'lung_left_lower'
                left_id = mapping["region_id"].replace("right", "left")
                if left_id != mapping["region_id"]:
                    anatomy_res["targets"].append({
                        "id": left_id,
                        "type": mapping["type"],
                        "severity_source": "finding_probability",
                        "value": finding["probability"],
                        "tier": finding["tier"]
                    })
                    
    import os
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if gemini_key:
        try:
            import requests
            import json
            gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_key}"
            gemini_prompt = (
                f"You are an anatomy mapping assistant. Based on the body part '{body_part}' and findings '{json.dumps(result_json.get('findings', {}))}', "
                f"select the ONE most appropriate muscle/anatomy group from this exact list: "
                f"[biceps, forearms, chest, triceps, abdominals, quadriceps, shoulders, calves, traps, lats, hamstrings, glutes]. "
                f"For a chest x-ray, pick 'chest'. For a knee x-ray, pick 'quadriceps'. For a wrist/hand/arm, pick 'forearms'. "
                f"Respond ONLY with the exact single lowercase word from the list."
            )
            resp = requests.post(
                gemini_url,
                headers={"Content-Type": "application/json"},
                json={"contents": [{"parts": [{"text": gemini_prompt}]}]}
            )
            if resp.status_code == 200:
                text_val = resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip().lower()
                valid_muscles = ["biceps", "forearms", "chest", "triceps", "abdominals", "quadriceps", "shoulders", "calves", "traps", "lats", "hamstrings", "glutes"]
                import re
                text_val = re.sub(r'[^a-z]', '', text_val)
                if text_val in valid_muscles:
                    anatomy_res["muscle_group"] = text_val
        except Exception:
            pass
            
    return anatomy_res
