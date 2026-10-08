import os
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import yaml
from PIL import Image


def load_config(config_path):
    with open(config_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def main():
    base_dir = Path(__file__).resolve().parent.parent.parent
    raw_dir = base_dir / "data" / "raw" / "nih_chestxray14"
    processed_dir = base_dir / "data" / "processed"
    docs_dir = base_dir / "docs"
    
    processed_dir.mkdir(parents=True, exist_ok=True)
    
    config = load_config(base_dir / "config" / "chest_labels.yaml")
    labels_list = config["labels"]
    
    # Load labels
    csv_path = raw_dir / "Data_Entry_2017_v2020.csv"
    if not csv_path.exists():
        csv_path = raw_dir / "Data_Entry_2017.csv"
        
    df = pd.read_csv(csv_path)
    
    # Parse labels
    for label in labels_list:
        df[label] = df["Finding Labels"].apply(lambda x: 1 if label in x else 0)
        
    # Check if files exist
    images_dir = raw_dir / "images"
    
    # Filter by existing files
    print("Checking which images exist on disk...")
    # To speed up, we list all existing images first
    existing_images = set(os.listdir(images_dir)) if images_dir.exists() else set()
    
    df["image_exists"] = df["Image Index"].apply(lambda x: x in existing_images)
    df = df[df["image_exists"]].copy()
    
    # Parse split lists
    with open(raw_dir / "train_val_list.txt", "r") as f:
        train_val_files = set([line.strip() for line in f])
        
    with open(raw_dir / "test_list.txt", "r") as f:
        test_files = set([line.strip() for line in f])
        
    # Determine split per row
    df["base_split"] = df["Image Index"].apply(
        lambda x: "test" if x in test_files else ("train_val" if x in train_val_files else "unknown")
    )
    df = df[df["base_split"] != "unknown"].copy()
    
    # Train/Val split by patient (12% validation)
    train_val_df = df[df["base_split"] == "train_val"]
    unique_patients = train_val_df["Patient ID"].unique()
    
    np.random.seed(42)
    val_patients = np.random.choice(unique_patients, size=int(len(unique_patients)*0.12), replace=False)
    val_patients_set = set(val_patients)
    
    df["split"] = df.apply(
        lambda row: "test" if row["base_split"] == "test" 
        else ("val" if row["Patient ID"] in val_patients_set else "train"),
        axis=1
    )
    
    # Assert zero overlap
    train_patients = set(df[df["split"] == "train"]["Patient ID"])
    val_patients_set = set(df[df["split"] == "val"]["Patient ID"])
    test_patients = set(df[df["split"] == "test"]["Patient ID"])
    
    assert len(train_patients.intersection(val_patients_set)) == 0, "Patient overlap between train and val!"
    assert len(train_patients.intersection(test_patients)) == 0, "Patient overlap between train and test!"
    assert len(val_patients_set.intersection(test_patients)) == 0, "Patient overlap between val and test!"
    print("Assertion passed: Zero patient overlap across train/val/test splits.")
    
    # Standardize columns
    df = df.rename(columns={
        "Image Index": "image_name",
        "Patient ID": "patient_id",
        "Patient Age": "age",
        "Patient Sex": "sex",
        "View Position": "view_position"
    })
    
    # Add full path
    df["image_path"] = df["image_name"].apply(lambda x: str(images_dir / x).replace("\\", "/"))
    
    # Select columns for manifest
    manifest_cols = ["image_path", "patient_id", "age", "sex", "view_position", "split"] + labels_list
    manifest_df = df[manifest_cols]
    manifest_df.to_csv(processed_dir / "chest_manifest.csv", index=False)
    print(f"Saved manifest to {processed_dir / 'chest_manifest.csv'}")
    
    # Report generation
    bbox_df = pd.read_csv(raw_dir / "BBox_List_2017.csv")
    valid_bboxes = bbox_df[bbox_df["Image Index"].isin(df["image_name"])]
    bbox_images_count = len(valid_bboxes["Image Index"].unique())
    
    with open(docs_dir / "chest_dataset_report.md", "w") as f:
        f.write("# Chest Dataset Report\n\n")
        f.write("## Counts per split\n")
        f.write("| Split | Images | Patients |\n")
        f.write("|---|---|---|\n")
        for split in ["train", "val", "test"]:
            sub = df[df["split"] == split]
            f.write(f"| {split} | {len(sub)} | {sub['patient_id'].nunique()} |\n")
            
        f.write(f"\n**Images with real bounding boxes**: {bbox_images_count}\n\n")
        
        f.write("## View Position Distribution\n")
        f.write("| View | Count |\n")
        f.write("|---|---|\n")
        f.writelines(f"| {vp} | {count} |\n" for vp, count in df["view_position"].value_counts().items())
            
        f.write("\n## Label Prevalence\n")
        f.write("| Label | Train % | Val % | Test % |\n")
        f.write("|---|---|---|---|\n")
        for label in labels_list:
            train_prev = df[df["split"] == "train"][label].mean() * 100
            val_prev = df[df["split"] == "val"][label].mean() * 100
            test_prev = df[df["split"] == "test"][label].mean() * 100
            f.write(f"| {label} | {train_prev:.1f}% | {val_prev:.1f}% | {test_prev:.1f}% |\n")
            
    print(f"Generated report at {docs_dir / 'chest_dataset_report.md'}")
    
    # Print the requested summary to stdout
    print("\n--- Split Counts ---")
    for split in ["train", "val", "test"]:
        sub = df[df["split"] == split]
        print(f"{split.capitalize()}: {len(sub)} images, {sub['patient_id'].nunique()} patients")
        
    print("\n--- Label Prevalence (%) ---")
    print(f"{'Label':<20} | {'Train':<7} | {'Val':<7} | {'Test':<7}")
    for label in labels_list:
        train_prev = df[df["split"] == "train"][label].mean() * 100
        val_prev = df[df["split"] == "val"][label].mean() * 100
        test_prev = df[df["split"] == "test"][label].mean() * 100
        print(f"{label:<20} | {train_prev:<7.1f} | {val_prev:<7.1f} | {test_prev:<7.1f}")
        
    # Generate 8 real training images grid
    train_imgs = df[df["split"] == "train"].head(8)
    if not train_imgs.empty:
        fig, axes = plt.subplots(2, 4, figsize=(16, 8))
        for ax, (_, row) in zip(axes.flatten(), train_imgs.iterrows()):
            img_path = Path(row["image_path"])
            if img_path.exists():
                img = Image.open(img_path).convert("RGB")
                ax.imshow(img)
                active_labels = [l for l in labels_list if row[l] == 1]
                title = "\\n".join(active_labels) if active_labels else "No Finding"
                ax.set_title(title, fontsize=8)
            ax.axis("off")
        
        plt.tight_layout()
        plt.savefig(docs_dir / "chest_sample_grid.png")
        print(f"Saved sample grid to {docs_dir / 'chest_sample_grid.png'}")

if __name__ == "__main__":
    main()
