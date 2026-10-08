"""
backend/app/services/explain/cam.py
=====================================
GradCAM++ heatmap generation + saliency extraction.

``generate_gradcam`` now returns a 3-tuple:
  (raw_cam_normalised, overlay_image, HeatmapSaliency)

The HeatmapSaliency carries peak_x, peak_y and salient_regions; all
tuneable parameters come from config/explain.yaml (R3).

``generate_spatial_uncertainty`` signature is unchanged.
"""
from __future__ import annotations

from pathlib import Path
from typing import Optional

import cv2
import numpy as np
import torch
import yaml
from pytorch_grad_cam import GradCAMPlusPlus
from pytorch_grad_cam.utils.image import show_cam_on_image
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget

from backend.app.services.explain.regions import (
    HeatmapSaliency,
    SalientRegion,
    extract_saliency,
)

_ROOT = Path(__file__).resolve().parent.parent.parent.parent.parent
_explain_cfg: Optional[dict] = None


def _get_explain_cfg() -> dict:
    """Load and cache config/explain.yaml.  No hardcoded defaults (R3)."""
    global _explain_cfg
    if _explain_cfg is None:
        cfg_path = _ROOT / "config" / "explain.yaml"
        with open(cfg_path, "r", encoding="utf-8") as fh:
            _explain_cfg = yaml.safe_load(fh)
    return _explain_cfg


def generate_gradcam(
    model,
    img_tensor: torch.Tensor,
    target_class: int,
    target_layer,
    img_rgb: np.ndarray,
    colormap: int = cv2.COLORMAP_JET,
) -> tuple[np.ndarray, np.ndarray, HeatmapSaliency]:
    """
    Generates GradCAM++ heatmap plus heatmap-peak and salient-region data.

    Parameters
    ----------
    model:
        PyTorch model (must support GradCAMPlusPlus).
    img_tensor:
        1 × 3 × H × W input tensor.
    target_class:
        Integer class index.
    target_layer:
        E.g. ``model.features[-1]``.
    img_rgb:
        Original image as float32 RGB in [0, 1], shape (H_orig, W_orig, 3).
        Used for the coloured overlay AND as the reference dimensions for
        normalised coordinates.
    colormap:
        OpenCV colourmap constant.

    Returns
    -------
    raw_cam:   float32 (H × W), values in [0, 1] – normalised GradCAM map.
    overlay:   uint8 (H × W × 3) RGB overlay.
    saliency:  HeatmapSaliency – peak_x, peak_y, salient_regions.
    """
    cfg = _get_explain_cfg()

    cam_gen = GradCAMPlusPlus(model=model, target_layers=[target_layer])
    targets = [ClassifierOutputTarget(target_class)]

    grayscale_cam: np.ndarray = cam_gen(input_tensor=img_tensor, targets=targets)
    grayscale_cam = grayscale_cam[0, :]   # shape: (H_cam, W_cam)

    # Resize to match the original image if needed
    orig_h, orig_w = img_rgb.shape[:2]
    if grayscale_cam.shape != (orig_h, orig_w):
        grayscale_cam = cv2.resize(grayscale_cam, (orig_w, orig_h))

    visualization = show_cam_on_image(
        img_rgb, grayscale_cam, use_rgb=True, colormap=colormap
    )

    saliency = extract_saliency(
        grayscale_cam,
        orig_height=orig_h,
        orig_width=orig_w,
        salient_threshold=float(cfg["salient_threshold"]),
        salient_max_regions=int(cfg["salient_max_regions"]),
    )

    return grayscale_cam, visualization, saliency


def generate_spatial_uncertainty(
    model,
    img_tensor: torch.Tensor,
    target_class: int,
    target_layer,
    n_passes: int,
    img_rgb: np.ndarray,
    colormap: int = cv2.COLORMAP_JET,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Generates a spatial uncertainty map by running GradCAM++ across multiple
    dropout passes.

    Returns
    -------
    std_map:      float32 (H × W) normalised std of CAM activations.
    visualization: uint8 (H × W × 3) RGB overlay.
    downsampled:  float32 (64 × 64) std map for JSON transport.
    """
    model.enable_mc_dropout()
    cam_gen = GradCAMPlusPlus(model=model, target_layers=[target_layer])
    targets = [ClassifierOutputTarget(target_class)]

    cams: list[np.ndarray] = []
    for _ in range(n_passes):
        grayscale_cam = cam_gen(input_tensor=img_tensor, targets=targets)
        cams.append(grayscale_cam[0, :])

    stacked = np.stack(cams, axis=0)
    std_map = np.std(stacked, axis=0)

    # Normalise
    if std_map.max() > 0:
        std_map = std_map / std_map.max()

    orig_h, orig_w = img_rgb.shape[:2]
    if std_map.shape != (orig_h, orig_w):
        std_map = cv2.resize(std_map, (orig_w, orig_h))

    visualization = show_cam_on_image(
        img_rgb, std_map, use_rgb=True, colormap=colormap
    )

    # Downsample to 64×64 for JSON transport
    downsampled = cv2.resize(std_map, (64, 64))

    return std_map, visualization, downsampled
