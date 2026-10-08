from pathlib import Path

import numpy as np
import pandas as pd


def main():
    base_dir = Path(__file__).resolve().parent.parent.parent
    raw_dir = base_dir / "data" / "raw" / "fracatlas" / "FracAtlas"
    processed_dir = base_dir / "data" / "processed"
    
    csv_path = raw_dir / "dataset.csv"
    if not csv_path.exists():
        print("dataset.csv not found!")
        return
        
    df_raw = pd.read_csv(csv_path)
    
    records = []
    img_dir = raw_dir / "images" / "Fractured"
    non_img_dir = raw_dir / "images" / "Non_fractured"
    
    for _, row in df_raw.iterrows():
        img_id = row["image_id"]
        is_fractured = row["fractured"] == 1
        
        if is_fractured:
            img_path = img_dir / img_id
            label = "fractured"
        else:
            img_path = non_img_dir / img_id
            label = "non_fractured"
            
        if not img_path.exists():
            continue
            
        body_part = "hand" if row["hand"] == 1 else ("leg" if row["leg"] == 1 else ("hip" if row["hip"] == 1 else "other"))
        
        records.append({
            "image_path": str(img_path).replace("\\", "/"),
            "label": label,
            "body_part": body_part,
            "bbox_path": "",
            "mask_path": ""
        })
        
    df = pd.DataFrame(records)
    
    # Random split by image (no patient ID in FracAtlas)
    np.random.seed(42)
    df = df.sample(frac=1).reset_index(drop=True)
    n = len(df)
    train_end = int(0.7 * n)
    val_end = int(0.85 * n)
    
    df["split"] = "train"
    df.loc[train_end:val_end, "split"] = "val"
    df.loc[val_end:, "split"] = "test"
    
    df.to_csv(processed_dir / "fracture_manifest.csv", index=False)
    print(f"Saved {len(df)} fracture images to fracture_manifest.csv")

if __name__ == "__main__":
    main()
