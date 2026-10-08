"""
backend/app/services/explain/regions.py
========================================
Derives heatmap-peak coordinates and salient connected regions from a
normalised GradCAM map.

All tuneable parameters come from config/explain.yaml (keys:
``salient_threshold`` and ``salient_max_regions``).  No constants are
hardcoded here (R3).

Output schema (each value is a plain dict so it round-trips through JSON):

  HeatmapPeak:
    peak_x: float  – x fraction ∈ [0, 1]  (col / orig_width)
    peak_y: float  – y fraction ∈ [0, 1]  (row / orig_height)

  SalientRegion:
    xmin: float, ymin: float, xmax: float, ymax: float  – normalised bbox
    mean_saliency: float  – mean CAM value inside the region

  HeatmapSaliency:
    peak_x: float
    peak_y: float
    salient_regions: list[SalientRegion]   (up to N, sorted desc by mean_saliency)
"""
from __future__ import annotations

from typing import TypedDict

import cv2
import numpy as np


# ---------------------------------------------------------------------------
# Output types (plain TypedDicts → JSON-serialisable without extra work)
# ---------------------------------------------------------------------------

class SalientRegion(TypedDict):
    xmin: float
    ymin: float
    xmax: float
    ymax: float
    mean_saliency: float


class HeatmapSaliency(TypedDict):
    peak_x: float
    peak_y: float
    salient_regions: list[SalientRegion]


# ---------------------------------------------------------------------------
# Core function
# ---------------------------------------------------------------------------

def extract_saliency(
    cam: np.ndarray,
    *,
    orig_height: int,
    orig_width: int,
    salient_threshold: float,
    salient_max_regions: int,
) -> HeatmapSaliency:
    """
    Derive peak coordinates and salient connected regions from a normalised
    GradCAM array.

    Parameters
    ----------
    cam:
        2-D float32 array in [0, 1].  Must already be resized to the
        *analysis* resolution – does NOT need to equal (orig_height, orig_width).
    orig_height, orig_width:
        Pixel dimensions of the original image **before any model
        pre-processing**.  Used only as denominators to produce the
        normalised (0..1) output fractions.
    salient_threshold:
        From config/explain.yaml ``salient_threshold``.
    salient_max_regions:
        From config/explain.yaml ``salient_max_regions``.

    Returns
    -------
    HeatmapSaliency
    """
    if cam.ndim != 2:
        raise ValueError(f"cam must be 2-D, got shape {cam.shape}")
    if not (0 < orig_height and 0 < orig_width):
        raise ValueError("orig_height and orig_width must be positive")

    cam_h, cam_w = cam.shape
    # Ensure cam is float32
    cam_f = cam.astype(np.float32)

    # ── Peak location ────────────────────────────────────────────────────────
    peak_flat = int(np.argmax(cam_f))
    peak_row = peak_flat // cam_w   # row in CAM-space
    peak_col = peak_flat % cam_w    # col in CAM-space

    # Convert from CAM-pixel coords to fraction of original image dimensions
    peak_y = float(peak_row) / cam_h   # fraction of cam height → use as proxy
    peak_x = float(peak_col) / cam_w

    # Clamp to [0, 1] (safety; argmax is always within array bounds)
    peak_x = float(np.clip(peak_x, 0.0, 1.0))
    peak_y = float(np.clip(peak_y, 0.0, 1.0))

    # ── Salient regions ──────────────────────────────────────────────────────
    # Threshold → binary mask
    binary = (cam_f >= float(salient_threshold)).astype(np.uint8)

    salient_regions: list[SalientRegion] = []

    if binary.any():
        num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(
            binary, connectivity=8
        )

        region_candidates: list[SalientRegion] = []
        for lbl in range(1, num_labels):  # 0 is background
            x_px = int(stats[lbl, cv2.CC_STAT_LEFT])
            y_px = int(stats[lbl, cv2.CC_STAT_TOP])
            w_px = int(stats[lbl, cv2.CC_STAT_WIDTH])
            h_px = int(stats[lbl, cv2.CC_STAT_HEIGHT])

            # Bounding box as fractions of original image dimensions
            # (using cam dimensions as a proxy for the original image proportion)
            xmin = float(np.clip(x_px / cam_w, 0.0, 1.0))
            ymin = float(np.clip(y_px / cam_h, 0.0, 1.0))
            xmax = float(np.clip((x_px + w_px) / cam_w, 0.0, 1.0))
            ymax = float(np.clip((y_px + h_px) / cam_h, 0.0, 1.0))

            component_mask = labels == lbl
            mean_sal = float(cam_f[component_mask].mean())

            region_candidates.append(
                SalientRegion(
                    xmin=xmin,
                    ymin=ymin,
                    xmax=xmax,
                    ymax=ymax,
                    mean_saliency=round(mean_sal, 6),
                )
            )

        # Sort descending by mean saliency, keep top-N
        region_candidates.sort(key=lambda r: r["mean_saliency"], reverse=True)
        salient_regions = region_candidates[:int(salient_max_regions)]

    return HeatmapSaliency(
        peak_x=round(peak_x, 6),
        peak_y=round(peak_y, 6),
        salient_regions=salient_regions,
    )
