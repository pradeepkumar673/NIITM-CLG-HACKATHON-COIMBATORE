import os
from pathlib import Path

import numpy as np
import pandas as pd


def main():
    base_dir = Path(__file__).resolve().parent.parent.parent
    raw_dir = base_dir / "data" / "raw" / "knee_osteoporosis"
    processed_dir = base_dir / "data" / "processed"
    
    records = []
    classes = ["normal", "osteoporosis"]
    
    for cls in classes:
        cls_dir = raw_dir / cls / cls
        if not cls_dir.exists():
            continue
            
        for img_name in os.listdir(cls_dir):
            if not (img_name.endswith(".png") or img_name.endswith(".jpg") or img_name.endswith(".jpeg")): 
                continue
                
            img_path = cls_dir / img_name
            records.append({
                "image_path": str(img_path).replace("\\", "/"),
                "label": cls
            })
            
    df = pd.DataFrame(records)
    if len(df) == 0:
        print("No knee osteoporosis images found.")
        return
        
    # Random split by image (no patient ID)
    np.random.seed(42)
    df = df.sample(frac=1).reset_index(drop=True)
    n = len(df)
    train_end = int(0.7 * n)
    val_end = int(0.85 * n)
    
    df["split"] = "train"
    df.loc[train_end:val_end, "split"] = "val"
    df.loc[val_end:, "split"] = "test"
    
    df.to_csv(processed_dir / "knee_manifest.csv", index=False)
    
    print(f"Saved {len(df)} knee images to knee_manifest.csv")
    print("Class counts:")
    print(df["label"].value_counts())

if __name__ == "__main__":
    main()
