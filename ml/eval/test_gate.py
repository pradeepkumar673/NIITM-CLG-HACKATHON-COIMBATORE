"""Live verification script for GateDecision."""

import sys
from pathlib import Path
from PIL import Image, ImageFilter
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

from backend.app.services.gate.gatekeeper import evaluate_gate

def get_samples(manifest_path: Path, label: str, n: int = 5):
    if not manifest_path.exists():
        return []
    df = pd.read_csv(manifest_path)
    if "label" in df.columns:
        subset = df[df["label"] == label]
    else:
        # Chest manifest doesn't have a single "label" col, but all are X-rays
        subset = df
        
    paths = subset["image_path"].head(n).values
    return [(p if Path(p).is_absolute() else str(ROOT / p)) for p in paths]

def test_corrupt():
    print("\n--- Corrupt File Test ---")
    try:
        from backend.app.services.ingest.processor import process_upload
        process_upload("test-corrupt-123", b"Not a real image file!")
    except Exception as e:
        print(f"Correctly caught exception: {e}")

def main():
    print("Gathering real image paths...")
    xrays = get_samples(ROOT / "data/processed/chest_manifest.csv", "xray", 5)
    
    # We use the gate manifest to easily get MRI and natural images
    mris = get_samples(ROOT / "data/processed/gate_manifest.csv", "mri", 5)
    naturals = get_samples(ROOT / "data/processed/gate_manifest.csv", "natural", 5)
    
    all_images = []
    for p in xrays: all_images.append(("X-Ray", p))
    for p in mris: all_images.append(("MRI", p))
    for p in naturals: all_images.append(("Natural", p))
    
    print("\n--- Gate Test Results ---")
    print(f"{'Type':<10} | {'Action':<20} | {'Is X-Ray?':<10} | {'Flags / Reasons'}")
    print("-" * 80)
    
    for img_type, path in all_images:
        try:
            img = Image.open(path)
            res = evaluate_gate(img)
            flags = ", ".join(res["reasons"]) if res["reasons"] else "None"
            print(f"{img_type:<10} | {res['action']:<20} | {str(res['is_xray']):<10} | {flags}")
        except Exception as e:
            print(f"{img_type:<10} | ERROR: {e}")
            
    if xrays:
        print("\n--- Blurry X-Ray Test ---")
        img = Image.open(xrays[0])
        blurry_img = img.filter(ImageFilter.GaussianBlur(radius=5)) # Test-only transformation
        res = evaluate_gate(blurry_img)
        flags = ", ".join(res["reasons"]) if res["reasons"] else "None"
        print(f"{'Blur-XRay':<10} | {res['action']:<20} | {str(res['is_xray']):<10} | {flags}")
        
    test_corrupt()
    print("\nNote: ML classifier predictions (MRI/Natural) might fallback to heuristic if 'models/gate_classifier/best.pt' is missing.")

if __name__ == "__main__":
    main()
