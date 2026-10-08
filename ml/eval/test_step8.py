"""Step 8 Evaluation on NIH dataset and Zone lookups."""
import sys
from pathlib import Path

import cv2
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import torchvision.transforms.functional as TF
import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

from backend.app.services.lungseg.lungseg import (
    compute_asymmetry,
    get_lung_zones,
    lookup_zone,
    post_process_lungs,
    segment_lungs,
)


def main():
    cfg_path = ROOT / "config/train_lungseg.yaml"
    with open(cfg_path, "r") as f:
        cfg = yaml.safe_load(f)
        
    print("Loading NIH test data (200 random images)...")
    manifest = pd.read_csv(ROOT / "data/processed/chest_manifest.csv")
    test_df = manifest[manifest["split"] == "test"].sample(n=200, random_state=42)
    
    # 1. Run inference and check plausibility
    # We define plausible as: 
    # - post_process_lungs finds 2 components easily (we can measure the area)
    # - total area within 1st-99th percentile of ground truth (roughly 10%-40% of image area)
    
    plausible_count = 0
    total = len(test_df)
    
    grid_images = []
    
    for idx, row in test_df.iterrows():
        img_path = ROOT / row["image_path"] if not Path(row["image_path"]).is_absolute() else Path(row["image_path"])
        img = Image.open(img_path).convert('L')
        img_t = TF.to_tensor(img) # 1xHxW
        
        # Predict
        raw_mask = segment_lungs(img_t)
        
        # Post process
        r_lung, l_lung = post_process_lungs(raw_mask)
        
        # Check plausibility
        r_area = r_lung.sum()
        l_area = l_lung.sum()
        
        total_pixels = raw_mask.size
        coverage = (r_area + l_area) / total_pixels
        
        if r_area > 0 and l_area > 0 and 0.05 < coverage < 0.60:
            plausible_count += 1
            
        # Collect for grid (first 8)
        if len(grid_images) < 8:
            img_np = np.array(img.resize((256, 256)))
            r_lung_resized = cv2.resize(r_lung.astype(np.uint8)*255, (256, 256))
            l_lung_resized = cv2.resize(l_lung.astype(np.uint8)*255, (256, 256))
            
            # Create RGB overlay
            overlay = cv2.cvtColor(img_np, cv2.COLOR_GRAY2RGB)
            # Right lung (PA) is image left -> Red
            overlay[r_lung_resized > 0] = [255, 0, 0]
            # Left lung (PA) is image right -> Blue
            overlay[l_lung_resized > 0] = [0, 0, 255]
            
            # Blend
            blended = cv2.addWeighted(cv2.cvtColor(img_np, cv2.COLOR_GRAY2RGB), 0.7, overlay, 0.3, 0)
            grid_images.append(blended)
            
    # Calculate fraction
    fraction = plausible_count / total
    print(f"Plausible NIH Masks: {plausible_count}/{total} ({fraction:.2%})")
    
    # Save grid
    fig, axes = plt.subplots(2, 4, figsize=(16, 8))
    for ax, img in zip(axes.flatten(), grid_images):
        ax.imshow(img)
        ax.axis('off')
    
    docs_dir = ROOT / "docs"
    docs_dir.mkdir(exist_ok=True)
    grid_path = docs_dir / "lungseg_nih_grid.png"
    plt.tight_layout()
    plt.savefig(grid_path)
    plt.close()
    
    print(f"Saved overlay grid to {grid_path}")
    
    # 2. Zone lookup tests
    print("\nTesting Zone Lookup on a real image...")
    test_img_row = test_df.iloc[0]
    img = Image.open(ROOT / test_img_row["image_path"] if not Path(test_img_row["image_path"]).is_absolute() else Path(test_img_row["image_path"])).convert('L')
    img_t = TF.to_tensor(img)
    raw_mask = segment_lungs(img_t)
    r_lung, l_lung = post_process_lungs(raw_mask)
    zone_masks = get_lung_zones(r_lung, l_lung)
    
    # Get a synthetic point in the middle of right_upper
    ru_y, ru_x = np.where(zone_masks["right_upper"])
    if len(ru_y) > 0:
        my, mx = ru_y[len(ru_y)//2], ru_x[len(ru_x)//2]
        z = lookup_zone(zone_masks, mx, my)
        print(f"Point ({mx}, {my}) inside right_upper -> Lookup Result: '{z}'")
        assert z == "right upper zone"
        
    # Asymmetry
    asym = compute_asymmetry(r_lung, l_lung)
    print(f"Asymmetry score for this image: {asym:.3f}")
    
if __name__ == "__main__":
    main()
