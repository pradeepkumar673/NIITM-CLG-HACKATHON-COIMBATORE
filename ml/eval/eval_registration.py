import sys
from pathlib import Path
import json
import numpy as np
import pandas as pd
import cv2
import matplotlib.pyplot as plt
from typing import Tuple

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(ROOT))

from backend.app.services.longitudinal.engine import LongitudinalEngine

def apply_known_transform(img: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """Applies a known test-only affine transform (rot, trans, scale, shear)"""
    h, w = img.shape[:2]
    cx, cy = w // 2, h // 2
    
    # Random but fixed transform (seed)
    np.random.seed(42)
    angle = np.random.uniform(-10, 10)
    tx = np.random.uniform(-15, 15)
    ty = np.random.uniform(-15, 15)
    scale = np.random.uniform(0.95, 1.05)
    
    # OpenCV getRotationMatrix2D
    M = cv2.getRotationMatrix2D((cx, cy), angle, scale)
    M[0, 2] += tx
    M[1, 2] += ty
    
    # Add a small shear
    shear = np.random.uniform(-0.05, 0.05)
    M[0, 1] += shear
    
    # Brightness change (additive and multiplicative)
    float_img = cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_LINEAR)
    float_img = np.clip(float_img * 1.1 + 10, 0, 255).astype(np.uint8)
    
    # M is mapping from original (ref) to float: 
    # pts_float = M * pts_ref
    # We want to find H mapping from float back to ref
    # H = M^-1
    H_true = np.eye(3)
    M_full = np.eye(3)
    M_full[:2, :] = M
    H_true = np.linalg.inv(M_full)
    
    return float_img, H_true

def compute_tre(H_pred: np.ndarray, H_true: np.ndarray, w: int, h: int) -> float:
    """Compute Target Registration Error (TRE) on a grid of points."""
    # 10x10 grid
    x = np.linspace(0, w - 1, 10)
    y = np.linspace(0, h - 1, 10)
    xv, yv = np.meshgrid(x, y)
    pts = np.vstack([xv.flatten(), yv.flatten(), np.ones(100)]) # 3x100
    
    # Map with true H
    pts_true = H_true @ pts
    # Map with pred H
    pts_pred = H_pred @ pts
    
    distances = np.linalg.norm(pts_true[:2] - pts_pred[:2], axis=0)
    return distances

def main():
    engine = LongitudinalEngine()
    
    # Evaluate across 3 datasets: chest, knee, fracture
    datasets = ["chest", "knee", "fracture"]
    results = []
    mismatch_results = []
    
    demo_saved = False
    
    for ds in datasets:
        manifest = pd.read_csv(ROOT / f"data/processed/{ds}_manifest.csv")
        test_df = manifest[manifest["split"] == "test"].head(20) # test on 20 images each
        
        ds_tres = []
        failures = 0
        
        for i in range(len(test_df)):
            ref_path = test_df.iloc[i]["image_path"]
            if not Path(ref_path).exists(): continue
            
            ref_img = cv2.imread(ref_path, cv2.IMREAD_GRAYSCALE)
            if ref_img is None: continue
            
            # 1. Test Registration
            float_img, H_true = apply_known_transform(ref_img)
            
            # Predict
            from backend.app.services.longitudinal.engine import register_images
            H_pred, ncc = register_images(ref_img, float_img, engine.config)
            
            # TRE
            h, w = ref_img.shape
            tre = compute_tre(H_pred, H_true, w, h)
            mean_tre = np.mean(tre)
            
            ds_tres.extend(tre)
            if mean_tre > 5.0: # threshold 5 pixels
                failures += 1
                
            # 2. Test Mismatch
            # compare with next image
            next_idx = (i + 1) % len(test_df)
            wrong_path = test_df.iloc[next_idx]["image_path"]
            if Path(wrong_path).exists():
                wrong_img = cv2.imread(wrong_path, cv2.IMREAD_GRAYSCALE)
                if wrong_img is not None:
                    _, wrong_ncc = register_images(ref_img, wrong_img, engine.config)
                    mismatch_results.append(wrong_ncc)
            
            # Save demo on first valid
            if not demo_saved:
                aligned_img = cv2.warpAffine(float_img, H_pred[:2, :], (w, h), flags=cv2.INTER_LINEAR)
                diff, _, _ = engine.generate_difference_map(ref_img, aligned_img, H_pred)
                
                fig, axes = plt.subplots(1, 3, figsize=(15, 5))
                axes[0].imshow(ref_img, cmap='gray')
                axes[0].set_title("Reference Image")
                axes[1].imshow(float_img, cmap='gray')
                axes[1].set_title("Test-Only Transformed Image")
                
                norm_diff = (diff + 255.0) / 510.0
                axes[2].imshow(norm_diff, cmap='coolwarm')
                axes[2].set_title("Difference Map")
                
                plt.suptitle("Longitudinal Registration (Test-Only Transformation of a Real Image)")
                plt.savefig(ROOT / "docs/longitudinal_demo.png")
                demo_saved = True
                
        if len(ds_tres) > 0:
            results.append({
                "Dataset": ds,
                "Mean TRE (px)": np.mean(ds_tres),
                "Median TRE (px)": np.median(ds_tres),
                "95th Pctl TRE (px)": np.percentile(ds_tres, 95),
                "Failure Rate (>5px)": failures / len(test_df)
            })

    # Save metrics
    df = pd.DataFrame(results)
    
    with open(ROOT / "reports/registration_metrics.md", "w") as f:
        f.write("# Registration Metrics\n\n")
        f.write(df.to_markdown(index=False, floatfmt=".2f"))
        f.write("\n\n## Mismatch Detection\n")
        f.write(f"Average NCC for wrong-patient pairs: {np.mean(mismatch_results):.2f}\n")
        f.write(f"Threshold in config: {engine.config['mismatch']['ncc_threshold']}\n")

if __name__ == "__main__":
    main()
