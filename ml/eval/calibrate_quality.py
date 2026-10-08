"""Compute handcrafted quality thresholds based on the real dataset."""

import json
from pathlib import Path
import numpy as np
import yaml
import cv2
from PIL import Image
from tqdm import tqdm
import sys

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

def compute_blur(img_gray: np.ndarray) -> float:
    """Variance of Laplacian"""
    return cv2.Laplacian(img_gray, cv2.CV_64F).var()

def compute_exposure(img_gray: np.ndarray) -> float:
    """Mean intensity (0-255). A better one is clipping % but mean works well."""
    return img_gray.mean()

def compute_resolution(img_gray: np.ndarray) -> float:
    """Total pixel count."""
    return img_gray.shape[0] * img_gray.shape[1]

def process_manifest(manifest_path: Path) -> dict:
    import pandas as pd
    if not manifest_path.exists():
        return {}
    
    df = pd.read_csv(manifest_path)
    # We use training images for calibration
    train_df = df[df["split"] == "train"]
    
    metrics = {"blur": [], "exposure": [], "resolution": []}
    
    print(f"Calibrating on {manifest_path.name}...")
    for img_path in tqdm(train_df["image_path"].values):
        full_path = Path(img_path)
        if not full_path.is_absolute():
            full_path = ROOT / img_path
        if not full_path.exists():
            continue
        try:
            img = Image.open(full_path).convert('L')
            arr = np.array(img)
            metrics["blur"].append(compute_blur(arr))
            metrics["exposure"].append(compute_exposure(arr))
            metrics["resolution"].append(compute_resolution(arr))
        except Exception:
            continue
            
    return metrics

def main():
    # 1. Compute on real chest X-rays
    chest_metrics = process_manifest(ROOT / "data/processed/chest_manifest.csv")
    
    if not chest_metrics.get("blur"):
        print("No chest data found for calibration. Wait for step 3/5.")
        return
        
    # 2. Compute percentiles (e.g. 1st and 99th) to establish "normal" ranges
    thresholds = {
        "blur": [
            float(np.percentile(chest_metrics["blur"], 1)),
            float(np.percentile(chest_metrics["blur"], 100))
        ],
        "exposure": [
            float(np.percentile(chest_metrics["exposure"], 1)),
            float(np.percentile(chest_metrics["exposure"], 99))
        ],
        "resolution": [
            float(np.percentile(chest_metrics["resolution"], 1)),
            float(np.percentile(chest_metrics["resolution"], 100))
        ]
    }
    
    # Write to config/quality_thresholds.yaml
    out_yaml = ROOT / "config/quality_thresholds.yaml"
    out_data = {
        "source": f"calibrated on chest dataset, n={len(chest_metrics['blur'])}",
        "thresholds": thresholds
    }
    
    with open(out_yaml, "w") as f:
        yaml.dump(out_data, f, default_flow_style=False)
        
    print(f"Saved thresholds to {out_yaml}:")
    print(json.dumps(thresholds, indent=2))

if __name__ == "__main__":
    main()
