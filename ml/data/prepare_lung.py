import os
from pathlib import Path

import numpy as np
import pandas as pd


def main():
    base_dir = Path(__file__).resolve().parent.parent.parent
    raw_dir = base_dir / "data" / "raw" / "lung_masks_tb" / "Lung Segmentation"
    processed_dir = base_dir / "data" / "processed"
    
    img_dir = raw_dir / "CXR_png"
    mask_dir = raw_dir / "masks"
    
    if not img_dir.exists() or not mask_dir.exists():
        print(f"Directory not found! {img_dir}")
        return
        
    records = []
    for img_name in os.listdir(img_dir):
        if not img_name.endswith(".png"): continue
        
        img_path = img_dir / img_name
        
        # Mask filename usually has _mask appended
        basename = img_name.replace(".png", "")
        mask_name = f"{basename}_mask.png"
        mask_path = mask_dir / mask_name
        
        if not mask_path.exists():
            continue
            
        source = "Montgomery" if "MCUCXR" in basename else "Shenzhen"
        
        records.append({
            "image_path": str(img_path).replace("\\", "/"),
            "mask_path": str(mask_path).replace("\\", "/"),
            "source": source
        })
        
    df = pd.DataFrame(records)
    
    # Split 70/15/15
    np.random.seed(42)
    df = df.sample(frac=1).reset_index(drop=True)
    n = len(df)
    train_end = int(0.7 * n)
    val_end = int(0.85 * n)
    
    df["split"] = "train"
    df.loc[train_end:val_end, "split"] = "val"
    df.loc[val_end:, "split"] = "test"
    
    df.to_csv(processed_dir / "lung_manifest.csv", index=False)
    print(f"Saved {len(df)} lung masks to lung_manifest.csv")

if __name__ == "__main__":
    main()
