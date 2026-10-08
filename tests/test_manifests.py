from pathlib import Path

import pandas as pd


def test_manifests():
    base_dir = Path(__file__).resolve().parent.parent
    processed_dir = base_dir / "data" / "processed"
    
    manifests = [
        "chest_manifest.csv",
        "lung_manifest.csv",
        "tb_manifest.csv",
        "fracture_manifest.csv",
        "knee_manifest.csv",
        "gate_manifest.csv"
    ]
    
    for m in manifests:
        m_path = processed_dir / m
        if not m_path.exists():
            continue
            
        df = pd.read_csv(m_path)
        
        # Check non-empty splits
        for split in ["train", "val", "test"]:
            assert len(df[df["split"] == split]) > 0, f"{m}: {split} split is empty"
            
        # Check file exists (sample 10 to speed up)
        for _, row in df.head(10).iterrows():
            assert Path(row["image_path"]).exists(), f"{m}: file {row['image_path']} not found"
            
        # Check group overlap for patient_id if exists
        if "patient_id" in df.columns:
            train_p = set(df[df["split"] == "train"]["patient_id"])
            val_p = set(df[df["split"] == "val"]["patient_id"])
            test_p = set(df[df["split"] == "test"]["patient_id"])
            
            assert len(train_p.intersection(val_p)) == 0
            assert len(train_p.intersection(test_p)) == 0
            assert len(val_p.intersection(test_p)) == 0
