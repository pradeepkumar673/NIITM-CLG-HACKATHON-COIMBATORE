import os
from pathlib import Path

import numpy as np
import pandas as pd


def main():
    base_dir = Path(__file__).resolve().parent.parent.parent
    raw_dir = base_dir / "data" / "raw" / "lung_masks_tb" / "Lung Segmentation"
    processed_dir = base_dir / "data" / "processed"
    
    img_dir = raw_dir / "CXR_png"
    
    if not img_dir.exists():
        print(f"Directory not found! {img_dir}")
        return
        
    records = []
    for img_name in os.listdir(img_dir):
        if not img_name.endswith(".png"): continue
        
        img_path = img_dir / img_name
        basename = img_name.replace(".png", "")
        source = "Montgomery" if "MCUCXR" in basename else "Shenzhen"
        
        # Label is encoded in the filename as _0 (normal) or _1 (TB)
        # CHNCXR_0001_0.png -> normal
        # MCUCXR_0001_0.png -> normal
        parts = basename.split('_')
        label_str = parts[-1]
        
        label = "tb" if label_str == "1" else "normal"
        
        records.append({
            "image_path": str(img_path).replace("\\", "/"),
            "label": label,
            "source": source
        })
        
    df = pd.DataFrame(records)
    
    # Split within each source
    df["split"] = ""
    np.random.seed(42)
    
    for source in df["source"].unique():
        idx = df[df["source"] == source].index
        shuffled = np.random.permutation(idx)
        n = len(shuffled)
        
        train_end = int(0.7 * n)
        val_end = int(0.85 * n)
        
        df.loc[shuffled[:train_end], "split"] = "train"
        df.loc[shuffled[train_end:val_end], "split"] = "val"
        df.loc[shuffled[val_end:], "split"] = "test"
        
    df.to_csv(processed_dir / "tb_manifest.csv", index=False)
    print(f"Saved {len(df)} TB images to tb_manifest.csv")

if __name__ == "__main__":
    main()
