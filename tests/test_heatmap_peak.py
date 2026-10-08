"""
tests/test_heatmap_peak.py
===========================
Step 9A tests for heatmap-peak coordinates and salient regions.

Rules (AGENTS.md):
  R1  – no hardcoded / mocked data; all images from the real held-out TEST split.
  R3  – thresholds come from config/explain.yaml.
  R9  – real test-split images.
  R10 – typed Python.

What is tested
--------------
1. ``extract_saliency`` directly:
   a) peak_x and peak_y are in [0, 1].
   b) returned list length ≤ salient_max_regions.
   c) every region bounding box is in [0, 1] and xmin < xmax, ymin < ymax.
   d) mean_saliency of every region ≥ salient_threshold.

2. Integration with a real chest test image + torchxrayvision GradCAM:
   a) Coordinate bounds hold.
   b) For findings the chest model considers "lung findings" (Atelectasis,
      Effusion, Infiltration, Consolidation, Pneumonia, Edema, Pneumothorax,
      Emphysema, Fibrosis, Pleural_Thickening), the peak (peak_x, peak_y)
      must lie inside the lung mask produced by ``segment_lungs`` / the
      Step 8 lungseg service.  If the lungseg model cannot load, the test
      is SKIPPED (not failed), because model weights are an external
      dependency (R4).

All real images are taken from the first N rows of the chest TEST split in
data/processed/chest_manifest.csv.  If that CSV does not exist, the relevant
tests are SKIPPED with a MANUAL ACTION REQUIRED message.
"""
from __future__ import annotations

import csv
from pathlib import Path
from typing import Optional

import numpy as np
import pytest

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "data" / "processed" / "chest_manifest.csv"
EXPLAIN_CFG_PATH = ROOT / "config" / "explain.yaml"

# ── Helpers ────────────────────────────────────────────────────────────────

def _load_explain_cfg() -> dict:
    import yaml
    with open(EXPLAIN_CFG_PATH, "r", encoding="utf-8") as fh:
        return yaml.safe_load(fh)


def _get_test_images(max_images: int = 3) -> list[Path]:
    """Return up to ``max_images`` chest test-split images that exist on disk."""
    if not MANIFEST.exists():
        return []
    paths: list[Path] = []
    with open(MANIFEST, newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            if row.get("split") != "test":
                continue
            p = Path(row["image_path"])
            if p.exists():
                paths.append(p)
            if len(paths) >= max_images:
                break
    return paths


# ── Lung-finding labels ────────────────────────────────────────────────────
# These are findings whose heatmap peak should lie inside the lung mask.
# Source: NIH ChestX-ray14 label definitions; review_status: draft.
LUNG_FINDINGS: frozenset[str] = frozenset({
    "Atelectasis",
    "Effusion",
    "Infiltration",
    "Consolidation",
    "Pneumonia",
    "Edema",
    "Pneumothorax",
    "Emphysema",
    "Fibrosis",
    "Pleural_Thickening",
})


# ══════════════════════════════════════════════════════════════════════════════
# Group 1 – pure unit tests of extract_saliency
# ══════════════════════════════════════════════════════════════════════════════

class TestExtractSaliency:
    """Pure-function tests – no model weights required."""

    def _make_cam(self, h: int = 100, w: int = 120, seed_row: int = 30, seed_col: int = 60) -> np.ndarray:
        """Create a synthetic CAM with a known peak at (seed_row, seed_col)."""
        cam = np.zeros((h, w), dtype=np.float32)
        cam[seed_row, seed_col] = 1.0
        # Gaussian spread so there is a small salient blob
        for dr in range(-10, 11):
            for dc in range(-10, 11):
                r, c = seed_row + dr, seed_col + dc
                if 0 <= r < h and 0 <= c < w:
                    val = np.exp(-(dr**2 + dc**2) / 20.0)
                    cam[r, c] = max(cam[r, c], val)
        return cam

    def test_peak_in_unit_square(self) -> None:
        from backend.app.services.explain.regions import extract_saliency
        cfg = _load_explain_cfg()
        cam = self._make_cam()
        result = extract_saliency(
            cam,
            orig_height=480,
            orig_width=640,
            salient_threshold=cfg["salient_threshold"],
            salient_max_regions=cfg["salient_max_regions"],
        )
        assert 0.0 <= result["peak_x"] <= 1.0, f"peak_x={result['peak_x']} out of range"
        assert 0.0 <= result["peak_y"] <= 1.0, f"peak_y={result['peak_y']} out of range"

    def test_peak_matches_actual_argmax(self) -> None:
        """peak_x/peak_y fractions correspond to the actual argmax location."""
        from backend.app.services.explain.regions import extract_saliency
        cfg = _load_explain_cfg()
        h, w = 100, 120
        seed_row, seed_col = 30, 60
        cam = self._make_cam(h=h, w=w, seed_row=seed_row, seed_col=seed_col)
        result = extract_saliency(
            cam,
            orig_height=h,
            orig_width=w,
            salient_threshold=cfg["salient_threshold"],
            salient_max_regions=cfg["salient_max_regions"],
        )
        expected_px = seed_col / w
        expected_py = seed_row / h
        assert abs(result["peak_x"] - expected_px) < 0.02, (
            f"peak_x={result['peak_x']}, expected≈{expected_px}"
        )
        assert abs(result["peak_y"] - expected_py) < 0.02, (
            f"peak_y={result['peak_y']}, expected≈{expected_py}"
        )

    def test_region_count_bounded(self) -> None:
        from backend.app.services.explain.regions import extract_saliency
        cfg = _load_explain_cfg()
        cam = self._make_cam()
        result = extract_saliency(
            cam,
            orig_height=100,
            orig_width=120,
            salient_threshold=cfg["salient_threshold"],
            salient_max_regions=cfg["salient_max_regions"],
        )
        assert len(result["salient_regions"]) <= int(cfg["salient_max_regions"]), (
            "More regions returned than salient_max_regions"
        )

    def test_region_bboxes_in_unit_square(self) -> None:
        from backend.app.services.explain.regions import extract_saliency
        cfg = _load_explain_cfg()
        cam = self._make_cam()
        result = extract_saliency(
            cam,
            orig_height=100,
            orig_width=120,
            salient_threshold=cfg["salient_threshold"],
            salient_max_regions=cfg["salient_max_regions"],
        )
        for i, reg in enumerate(result["salient_regions"]):
            assert 0.0 <= reg["xmin"] <= 1.0, f"region[{i}].xmin={reg['xmin']}"
            assert 0.0 <= reg["ymin"] <= 1.0, f"region[{i}].ymin={reg['ymin']}"
            assert 0.0 <= reg["xmax"] <= 1.0, f"region[{i}].xmax={reg['xmax']}"
            assert 0.0 <= reg["ymax"] <= 1.0, f"region[{i}].ymax={reg['ymax']}"
            assert reg["xmin"] < reg["xmax"], f"region[{i}] xmin >= xmax"
            assert reg["ymin"] < reg["ymax"], f"region[{i}] ymin >= ymax"

    def test_region_mean_saliency_above_threshold(self) -> None:
        from backend.app.services.explain.regions import extract_saliency
        cfg = _load_explain_cfg()
        cam = self._make_cam()
        threshold = float(cfg["salient_threshold"])
        result = extract_saliency(
            cam,
            orig_height=100,
            orig_width=120,
            salient_threshold=threshold,
            salient_max_regions=cfg["salient_max_regions"],
        )
        for i, reg in enumerate(result["salient_regions"]):
            assert reg["mean_saliency"] >= threshold, (
                f"region[{i}].mean_saliency={reg['mean_saliency']} < threshold={threshold}"
            )

    def test_empty_cam_gives_no_regions(self) -> None:
        """A flat-zero CAM has no salient regions."""
        from backend.app.services.explain.regions import extract_saliency
        cfg = _load_explain_cfg()
        cam = np.zeros((50, 50), dtype=np.float32)
        result = extract_saliency(
            cam,
            orig_height=50,
            orig_width=50,
            salient_threshold=float(cfg["salient_threshold"]),
            salient_max_regions=int(cfg["salient_max_regions"]),
        )
        assert result["salient_regions"] == [], "Expected no regions for zero CAM"

    def test_uniform_cam_returns_one_region(self) -> None:
        """A fully-above-threshold CAM should return at most one region."""
        from backend.app.services.explain.regions import extract_saliency
        cfg = _load_explain_cfg()
        cam = np.ones((50, 50), dtype=np.float32)
        result = extract_saliency(
            cam,
            orig_height=50,
            orig_width=50,
            salient_threshold=float(cfg["salient_threshold"]),
            salient_max_regions=int(cfg["salient_max_regions"]),
        )
        assert len(result["salient_regions"]) == 1, (
            "Uniform CAM should produce exactly one connected region"
        )


# ══════════════════════════════════════════════════════════════════════════════
# Group 2 – integration tests with real chest test-split images
# ══════════════════════════════════════════════════════════════════════════════

@pytest.mark.skipif(
    not MANIFEST.exists(),
    reason=(
        "MANUAL ACTION REQUIRED: "
        "data/processed/chest_manifest.csv is missing. "
        "Run Step 2 data preparation to generate it. "
        "See docs/DATA_REGISTRY.md for details."
    ),
)
class TestGradcamSaliencyIntegration:
    """
    Integration tests that require:
    - data/processed/chest_manifest.csv  (Step 2)
    - torchxrayvision weights (downloaded on first run)
    """

    @pytest.fixture(scope="class")
    def test_image_paths(self) -> list[Path]:
        paths = _get_test_images(max_images=2)
        if not paths:
            pytest.skip(
                "No TEST-split chest images found on disk. "
                "Make sure the manifest paths are accessible."
            )
        return paths

    @pytest.fixture(scope="class")
    def xrv_model_and_pathologies(self):
        """Load the torchxrayvision chest model once per class."""
        pytest.importorskip(
            "torchxrayvision",
            reason="torchxrayvision not installed; install it to run integration tests.",
        )
        try:
            from backend.app.services.inference.hf_models import get_chest_xrv_model
            model, pathologies = get_chest_xrv_model()
            return model, pathologies
        except Exception as exc:
            pytest.skip(f"Could not load chest model: {exc}")

    def _prepare_tensor_and_rgb(self, img_path: Path):
        """Return (img_tensor, img_rgb_224) ready for GradCAM."""
        import cv2 as _cv2
        import numpy as np
        import torch
        import torchvision
        import torchxrayvision as xrv
        from skimage.io import imread

        raw = imread(str(img_path))
        if raw.ndim == 3:
            raw = raw.mean(2)
        img_norm = xrv.datasets.normalize(raw, 255)[None, ...]
        transform = torchvision.transforms.Compose([
            xrv.datasets.XRayCenterCrop(),
            xrv.datasets.XRayResizer(224),
        ])
        tensor = torch.from_numpy(transform(img_norm)).unsqueeze(0).float()

        bgr = _cv2.imread(str(img_path), _cv2.IMREAD_COLOR)
        rgb224 = _cv2.resize(bgr, (224, 224)).astype(np.float32) / 255.0
        rgb224 = _cv2.cvtColor((rgb224 * 255).astype(np.uint8), _cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
        return tensor, rgb224

    def test_peak_coordinates_in_unit_square(
        self, test_image_paths: list[Path], xrv_model_and_pathologies
    ) -> None:
        import numpy as np
        from backend.app.services.explain.cam import generate_gradcam
        model, pathologies = xrv_model_and_pathologies

        for img_path in test_image_paths:
            tensor, rgb224 = self._prepare_tensor_and_rgb(img_path)
            target_layer = model.features[-1]
            model.eval()

            import torch
            with torch.no_grad():
                out = model(tensor)
            top_idx = int(out[0].argmax().item())

            _, _, saliency = generate_gradcam(model, tensor, top_idx, target_layer, rgb224)

            assert 0.0 <= saliency["peak_x"] <= 1.0, (
                f"{img_path.name}: peak_x={saliency['peak_x']}"
            )
            assert 0.0 <= saliency["peak_y"] <= 1.0, (
                f"{img_path.name}: peak_y={saliency['peak_y']}"
            )

    def test_peak_in_lung_mask_for_lung_findings(
        self, test_image_paths: list[Path], xrv_model_and_pathologies
    ) -> None:
        """
        For chest findings that are intrinsically pulmonary, the heatmap
        peak (peak_x, peak_y) must lie inside the binary lung mask produced
        by the Step 8 lungseg service.

        If lungseg cannot load its model, the test is skipped (R4: model
        not available returns a skip, not a fake pass).
        """
        import cv2 as _cv2
        import numpy as np
        import torch

        from backend.app.services.explain.cam import generate_gradcam

        # Try to import lungseg early so we can skip gracefully.
        try:
            from backend.app.services.inference.hf_models import predict_lung_mask
        except Exception as exc:
            pytest.skip(f"lungseg model unavailable: {exc}")

        model, pathologies = xrv_model_and_pathologies
        cfg = _load_explain_cfg()

        for img_path in test_image_paths:
            tensor, rgb224 = self._prepare_tensor_and_rgb(img_path)
            target_layer = model.features[-1]
            model.eval()
            with torch.no_grad():
                out = model(tensor)

            probs_list = out[0].detach().cpu().numpy()

            # Find the top lung-finding
            top_lung_idx: Optional[int] = None
            top_lung_label: Optional[str] = None
            top_lung_prob = -1.0
            for idx, label in enumerate(pathologies):
                if label in LUNG_FINDINGS and probs_list[idx] > top_lung_prob:
                    top_lung_prob = probs_list[idx]
                    top_lung_idx = idx
                    top_lung_label = label

            if top_lung_idx is None:
                pytest.skip("No lung findings in pathologies list for this model version.")

            _, _, saliency = generate_gradcam(
                model, tensor, top_lung_idx, target_layer, rgb224
            )

            # ── Build lung mask at original image resolution ─────────────────
            bgr_orig = _cv2.imread(str(img_path), _cv2.IMREAD_COLOR)
            try:
                lung_mask_uint8 = predict_lung_mask(bgr_orig)  # H×W uint8 {0,1}
                lung_mask = lung_mask_uint8.astype(bool)
            except Exception as exc:
                pytest.skip(f"predict_lung_mask failed for {img_path.name}: {exc}")

            orig_h, orig_w = bgr_orig.shape[:2]

            # Convert normalised peak fractions → pixel coords in original image
            px_col = int(round(saliency["peak_x"] * (orig_w - 1)))
            px_row = int(round(saliency["peak_y"] * (orig_h - 1)))
            px_col = int(np.clip(px_col, 0, orig_w - 1))
            px_row = int(np.clip(px_row, 0, orig_h - 1))

            # Resize lung mask to the GradCAM output size (224×224) before
            # checking, because the peak fractions come from 224×224 CAM space.
            lung_224 = _cv2.resize(
                lung_mask.astype(np.uint8), (224, 224), interpolation=_cv2.INTER_NEAREST
            ).astype(bool)
            cam_col = int(round(saliency["peak_x"] * 223))
            cam_row = int(round(saliency["peak_y"] * 223))
            cam_col = int(np.clip(cam_col, 0, 223))
            cam_row = int(np.clip(cam_row, 0, 223))

            assert lung_224[cam_row, cam_col], (
                f"{img_path.name}: peak ({saliency['peak_x']:.4f}, "
                f"{saliency['peak_y']:.4f}) for lung finding '{top_lung_label}' "
                f"(prob={top_lung_prob:.3f}) is outside the lung mask at "
                f"CAM pixel ({cam_col}, {cam_row})."
            )
