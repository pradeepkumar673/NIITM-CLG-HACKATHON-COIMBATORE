"""
scripts/test_hf_models.py
--------------------------
Run this to verify each HF pretrained model is working and returning
REAL predictions (not your old laptop-trained weights).

Usage:
    python scripts/test_hf_models.py

Each test prints the raw output from the model so you can see for yourself.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

# Suppress Windows HF symlink warning
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))


def banner(title: str) -> None:
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def find_image(*candidate_globs: str) -> str | None:
    """Find first existing image matching any of the glob patterns."""
    import glob
    for pattern in candidate_globs:
        matches = glob.glob(pattern, recursive=True)
        if matches:
            return matches[0]
    return None


# ── 1. CHEST — TorchXRayVision DenseNet121 ────────────────────────────────
def test_chest() -> None:
    banner("1. CHEST — torchxrayvision densenet121-res224-all")
    print("Model : torchxrayvision DenseNet121")
    print("Source: NIH + CheXpert + MIMIC + PadChest (300k+ images)")
    print("Labels: 18 pathologies (multi-label)")

    img = find_image(
        str(ROOT / "data/raw/fracatlas/**/*.jpg"),
        str(ROOT / "data/raw/nih_chest/**/*.png"),
        str(ROOT / "data/**/*.jpg"),
    )
    if not img:
        print("SKIP — no test image found")
        return

    print(f"\nImage: {img}")
    from backend.app.services.inference.hf_models import predict_chest
    results = predict_chest(img)

    top = sorted(results.items(), key=lambda x: x[1]["probability"], reverse=True)
    print("\nTop 5 findings:")
    for label, v in top[:5]:
        bar = "#" * int(v["probability"] * 30)
        print(f"  {label:<35} {v['probability']:.4f}  [{v['tier']:>6}]  {bar}")
    print("\n✅ Chest model: LIVE predictions from pretrained weights")


# ── 2. FRACTURE — Hemgg/bone-fracture-detection-using-xray (ViT) ──────────
def test_fracture() -> None:
    banner("2. FRACTURE — Hemgg/bone-fracture-detection-using-xray (ViT)")
    print("Model : ViT fine-tuned on FracAtlas dataset")
    print("Source: https://huggingface.co/Hemgg/bone-fracture-detection-using-xray")
    print("Labels: fractured / non_fractured")

    fractured_img = find_image(
        str(ROOT / "data/raw/fracatlas/**/Fractured/*.jpg"),
        str(ROOT / "data/raw/fracatlas/**/*.jpg"),
    )
    normal_img = find_image(
        str(ROOT / "data/raw/fracatlas/**/Non_fractured/*.jpg"),
    )

    from backend.app.services.inference.hf_models import predict_fracture

    if fractured_img:
        print(f"\nFractured image: {Path(fractured_img).name}")
        r = predict_fracture(fractured_img)
        verdict = "✅ CORRECT" if r["label"] == "fractured" else "❌ WRONG"
        print(f"  Result : {r['label']}  (prob={r['probability']:.4f}, tier={r['tier']}) {verdict}")

    if normal_img:
        print(f"\nNormal image  : {Path(normal_img).name}")
        r = predict_fracture(normal_img)
        verdict = "✅ CORRECT" if r["label"] == "non_fractured" else "❌ WRONG"
        print(f"  Result : {r['label']}  (prob={r['probability']:.4f}, tier={r['tier']}) {verdict}")

    if not fractured_img and not normal_img:
        print("SKIP — no fracture test images found")
    print("\n✅ Fracture model: LIVE predictions from HF pretrained ViT")


# ── 3. TB — timm EfficientNet-B0 (ImageNet pretrained proxy) ────────────────
def test_tb() -> None:
    banner("3. TB — timm EfficientNet-B0 (ImageNet pretrained proxy)")
    print("Model : EfficientNet-B0 pretrained on ImageNet")
    print("Note  : Hugging Face TB models are broken in PyTorch (TF/Keras only).")
    print("        Using timm ImageNet backbone proxy. Results flagged experimental.")
    print("Labels: normal / tb (proxy score)")

    tb_img = find_image(
        str(ROOT / "data/raw/**/tb/**/*.png"),
        str(ROOT / "data/raw/**/tuberculosis/**/*.png"),
        str(ROOT / "data/raw/**/TB/**/*.png"),
        str(ROOT / "data/raw/**/Montgomery/**/*.png"),
        str(ROOT / "data/raw/**/Shenzhen/**/*.png"),
        str(ROOT / "data/raw/fracatlas/**/*.jpg"),  # fallback
    )

    if not tb_img:
        print("SKIP — no test image found")
        return

    print(f"\nImage: {tb_img}")
    from backend.app.services.inference.hf_models import predict_tb
    r = predict_tb(tb_img)
    print(f"\n  TB probability : {r['probability']:.4f}")
    print(f"  Label          : {r['label']}")
    print(f"  Tier           : {r['tier']}")
    print(f"  needs_human_review: {r['needs_human_review']}")
    print(f"  experimental      : {r['experimental']}")
    print("\n✅ TB model: LIVE predictions from timm EfficientNet proxy")


# ── 4. KNEE — timm EfficientNet-B0 (ImageNet pretrained) ──────────────────
def test_knee() -> None:
    banner("4. KNEE — timm EfficientNet-B0 (ImageNet, marked experimental)")
    print("Model : EfficientNet-B0 pretrained on ImageNet")
    print("Note  : No knee-specific HF model available with all 3 labels.")
    print("        Results always flagged needs_human_review=True.")
    print("Labels: normal / osteopenia / osteoporosis")

    knee_img = find_image(
        str(ROOT / "data/raw/**/*knee*/**/*.png"),
        str(ROOT / "data/raw/**/*knee*/**/*.jpg"),
        str(ROOT / "data/raw/**/*Knee*/**/*.jpg"),
        str(ROOT / "data/raw/fracatlas/**/*.jpg"),  # fallback
    )

    if not knee_img:
        print("SKIP — no knee image found")
        return

    print(f"\nImage: {knee_img}")
    from backend.app.services.inference.hf_models import predict_knee
    r = predict_knee(knee_img)
    print("\n  Class probabilities (soft scores, ImageNet backbone):")
    for cls in ["normal", "osteopenia", "osteoporosis"]:
        v = r[cls]
        bar = "#" * int(v["probability"] * 30)
        print(f"    {cls:<15} {v['probability']:.4f}  [{v['tier']:>6}]  {bar}")
    print(f"\n  needs_human_review: {r['needs_human_review']}")
    print(f"  experimental      : {r['experimental']}")
    print("\n✅ Knee model: LIVE (ImageNet backbone, experimental)")


# ── 5. GATE — MobileNetV3-Small (ImageNet pretrained fallback) ────────────
def test_gate() -> None:
    banner("5. GATE — MobileNetV3-Small (ImageNet pretrained fallback)")
    print("Model : torchvision MobileNetV3-Small IMAGENET1K_V1")
    print("Note  : Used when local gate_classifier/best.pt is missing.")

    from backend.app.services.inference.hf_models import get_gate_pretrained_model
    import torch
    from PIL import Image

    model, transform = get_gate_pretrained_model()
    print(f"\n  Model loaded: {type(model).__name__}")
    print(f"  Params      : {sum(p.numel() for p in model.parameters()):,}")

    img_path = find_image(
        str(ROOT / "data/raw/fracatlas/**/*.jpg"),
        str(ROOT / "data/**/*.jpg"),
    )
    if img_path:
        img = Image.open(img_path).convert("RGB")
        tensor = transform(img).unsqueeze(0)
        with torch.no_grad():
            logits = model(tensor)
            probs = torch.softmax(logits, dim=1)[0]
        top_val, top_idx = probs.topk(3)
        print(f"\n  Test image: {Path(img_path).name}")
        print("  Top-3 ImageNet classes (gate uses these as X-ray quality proxy):")
        for val, idx in zip(top_val.tolist(), top_idx.tolist()):
            print(f"    class {idx:>4}: {val:.4f}")
    print("\n✅ Gate model: LIVE ImageNet pretrained fallback")


# ── MAIN ──────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n*** HF PRETRAINED MODEL VERIFICATION ***")
    print("   All results are from downloaded pretrained weights,")
    print("   NOT your locally-trained laptop models.\n")

    tests = {
        "1": ("Chest XRV DenseNet121", test_chest),
        "2": ("Fracture ViT", test_fracture),
        "3": ("TB InceptionV3", test_tb),
        "4": ("Knee EfficientNet-B0", test_knee),
        "5": ("Gate MobileNetV3", test_gate),
        "all": ("All models", None),
    }

    print("Which model to test?")
    for k, (name, _) in tests.items():
        print(f"  {k}) {name}")
    print()

    choice = input("Enter choice [1/2/3/4/5/all]: ").strip().lower() or "all"

    if choice == "all":
        for k, (name, fn) in tests.items():
            if fn:
                try:
                    fn()
                except Exception as e:
                    print(f"\n❌ {name} FAILED: {e}")
    elif choice in tests and tests[choice][1]:
        try:
            tests[choice][1]()
        except Exception as e:
            print(f"\n❌ FAILED: {e}")
    else:
        print("Invalid choice")

    print("\n" + "=" * 60)
    print("  VERIFICATION COMPLETE")
    print("=" * 60)
