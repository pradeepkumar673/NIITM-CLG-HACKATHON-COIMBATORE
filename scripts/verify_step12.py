import sys
from pathlib import Path
import json
import yaml

ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT))

import torch
import pandas as pd
from PIL import Image
import torchvision.transforms as T

from backend.app.services.calibration.core import analyse_image
from backend.app.services.rules import RuleEngine
from ml.train.model import ChestDenseNet121

def load_calibration():
    with open(ROOT / "models/chest_densenet121/calibration.json", "r") as f:
        return json.load(f)

def load_model():
    model = ChestDenseNet121(num_labels=14, dropout_p=0.0)
    checkpoint = torch.load(ROOT / "models/chest_densenet121/best.pt", map_location="cpu")
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()
    return model

def get_test_images():
    manifest = pd.read_csv(ROOT / "data/processed/chest_manifest.csv")
    test_df = manifest[manifest["split"] == "test"]
    return [
        test_df.iloc[0]["image_path"],
        test_df.iloc[10]["image_path"],
        test_df.iloc[20]["image_path"]
    ]

def process_image(img_path):
    img = Image.open(img_path).convert("L")
    transform = T.Compose([
        T.Resize((224, 224)),
        T.ToTensor()
    ])
    return transform(img).unsqueeze(0)

def main():
    try:
        calib = load_calibration()
        model = load_model()
    except Exception as e:
        print(f"Skipping real evaluation because models are missing: {e}")
        return

    with open(ROOT / "config/uncertainty.yaml") as f:
        config = yaml.safe_load(f)
        
    labels = ["Atelectasis", "Cardiomegaly", "Effusion", "Infiltration", "Mass", "Nodule", "Pneumonia", "Pneumothorax", "Consolidation", "Edema", "Emphysema", "Fibrosis", "Pleural_Thickening", "Hernia"]
    
    images = get_test_images()
    engine = RuleEngine()
    
    histories = [
        {"diabetes": True},
        {},
        {"pregnancy": True, "hypertension": True}
    ]
    
    for i, (img_path, hist) in enumerate(zip(images, histories)):
        print(f"\n--- Image {i+1} ---")
        img_tensor = process_image(img_path)
        res = analyse_image(img_tensor, model, calib, labels, config["uncertainty"])
        
        analysis_list = []
        for label, data in res["findings"].items():
            analysis_list.append({"label": label, "probability": data["p"], "tier": data["tier"]})
            
        # Mocking some high tier labels if none found just to see rules fire
        if i == 0:
            analysis_list.append({"label": "TB-pattern", "probability": 0.9, "tier": "high"})
        elif i == 2:
            analysis_list.append({"label": "Cardiomegaly", "probability": 0.85, "tier": "high"})
            analysis_list.append({"label": "Effusion", "probability": 0.85, "tier": "high"})
            analysis_list.append({"label": "Edema", "probability": 0.85, "tier": "high"})
            
        rule_res = engine.evaluate(analysis_list, hist, age=50)
        
        print(f"History: {hist}")
        print(f"Triage: {json.dumps(rule_res['triage'], indent=2)}")
        print(f"Interactions:\n{json.dumps(rule_res['interactions'], indent=2)}")
        print(f"Graph JSON:\n{json.dumps(rule_res['graph'], indent=2)}")

if __name__ == '__main__':
    main()
