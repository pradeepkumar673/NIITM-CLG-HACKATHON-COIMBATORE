from pathlib import Path

import pandas as pd


def test_manifest_properties():
    base_dir = Path(__file__).resolve().parent.parent
    manifest_path = base_dir / "data" / "processed" / "chest_manifest.csv"
    
    assert manifest_path.exists(), "Manifest file does not exist."
    
    df = pd.read_csv(manifest_path)
    
    # Check splits exist and are non-zero
    for split in ["train", "val", "test"]:
        assert len(df[df["split"] == split]) > 0, f"{split} split is empty."
        
    # Check no patient overlap
    train_patients = set(df[df["split"] == "train"]["patient_id"])
    val_patients = set(df[df["split"] == "val"]["patient_id"])
    test_patients = set(df[df["split"] == "test"]["patient_id"])
    
    assert len(train_patients.intersection(val_patients)) == 0, "Overlap in train/val"
    assert len(train_patients.intersection(test_patients)) == 0, "Overlap in train/test"
    assert len(val_patients.intersection(test_patients)) == 0, "Overlap in val/test"
    
    # Check labels are binary
    import yaml
    config_path = base_dir / "config" / "chest_labels.yaml"
    with open(config_path, "r", encoding="utf-8") as f:
        labels = yaml.safe_load(f)["labels"]
        
    for label in labels:
        assert set(df[label].unique()).issubset({0, 1}), f"Label {label} is not binary."
        
    # Check image paths exist for test split
    test_df = df[df["split"] == "test"]
    for path_str in test_df["image_path"]:
        assert Path(path_str).exists(), f"Image does not exist: {path_str}"
