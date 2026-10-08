import os
from pathlib import Path

import numpy as np
import pandas as pd


def main():
    base_dir = Path(__file__).resolve().parent.parent.parent
    processed_dir = base_dir / "data" / "processed"
    raw_dir = base_dir / "data" / "raw"
    
    records = []
    
    # 1. X-ray class
    # Sample from chest, fracture, knee
    chest_path = processed_dir / "chest_manifest.csv"
    fracture_path = processed_dir / "fracture_manifest.csv"
    knee_path = processed_dir / "knee_manifest.csv"
    
    if chest_path.exists():
        chest_df = pd.read_csv(chest_path).sample(n=1000, random_state=42, replace=True).drop_duplicates()
        for _, row in chest_df.iterrows():
            records.append({"image_path": row["image_path"], "label": "xray", "split": row["split"]})
            
    if fracture_path.exists():
        frac_df = pd.read_csv(fracture_path).sample(n=500, random_state=42, replace=True).drop_duplicates()
        for _, row in frac_df.iterrows():
            records.append({"image_path": row["image_path"], "label": "xray", "split": row["split"]})
            
    if knee_path.exists():
        knee_df = pd.read_csv(knee_path).sample(n=500, random_state=42, replace=True).drop_duplicates()
        for _, row in knee_df.iterrows():
            records.append({"image_path": row["image_path"], "label": "xray", "split": row["split"]})
            
    # 2. MRI class
    mri_dir = raw_dir / "brain_mri"
    if mri_dir.exists():
        for split_dir in ["Training", "Testing"]:
            split = "train" if split_dir == "Training" else "test"
            d = mri_dir / split_dir
            if d.exists():
                for cls in os.listdir(d):
                    cls_dir = d / cls
                    if cls_dir.is_dir():
                        for img_name in os.listdir(cls_dir):
                            if img_name.endswith(".jpg") or img_name.endswith(".png"):
                                records.append({"image_path": str(cls_dir / img_name).replace("\\", "/"), "label": "mri", "split": split})
                                
    # 3. Natural class (Oxford Pets)
    try:
        from torchvision.datasets import OxfordIIITPet
        # Download
        OxfordIIITPet(root=str(raw_dir / "oxford_pets"), download=True)
        pet_img_dir = raw_dir / "oxford_pets" / "oxford-iiit-pet" / "images"
        if pet_img_dir.exists():
            pet_imgs = [img for img in os.listdir(pet_img_dir) if img.endswith(".jpg")]
            # Shuffle and split pets
            np.random.seed(42)
            np.random.shuffle(pet_imgs)
            n = len(pet_imgs)
            for i, img in enumerate(pet_imgs):
                split = "train" if i < 0.7 * n else ("val" if i < 0.85 * n else "test")
                records.append({"image_path": str(pet_img_dir / img).replace("\\", "/"), "label": "natural", "split": split})
    except Exception as e:
        print(f"Could not load Oxford Pets: {e}")
        
    df = pd.DataFrame(records)
    
    # Balance classes in train split by undersampling
    train_df = df[df["split"] == "train"]
    if not train_df.empty:
        min_class_count = train_df["label"].value_counts().min()
        balanced_train = train_df.groupby("label").sample(n=min_class_count, random_state=42)
        df = pd.concat([balanced_train, df[df["split"] != "train"]]).reset_index(drop=True)
        
    df.to_csv(processed_dir / "gate_manifest.csv", index=False)
    print(f"Saved {len(df)} images to gate_manifest.csv")
    print("Class counts:")
    print(df["label"].value_counts())

if __name__ == "__main__":
    main()
