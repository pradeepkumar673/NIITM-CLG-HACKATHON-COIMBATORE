"""
Lung segmentation service.

Uses ianpan/chest-x-ray-basic (EfficientNetV2-S + U-Net decoder) hosted on
Hugging Face. Downloads on first call via the transformers library.

Ref: https://huggingface.co/ianpan/chest-x-ray-basic
"""
from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np
import torch

ROOT = Path(__file__).resolve().parent.parent.parent.parent.parent


def segment_lungs(img_tensor: torch.Tensor) -> np.ndarray:
    """
    Segment lungs from a 1xHxW or 3xHxW float tensor (values in [0, 1]).

    Delegates to ianpan/chest-x-ray-basic via hf_models.predict_lung_mask.
    Returns a binary bool mask (H x W).
    """
    from backend.app.services.inference.hf_models import predict_lung_mask

    # Convert tensor -> uint8 BGR for predict_lung_mask
    if img_tensor.shape[0] == 1:
        # Single channel: replicate to 3-channel
        rgb = img_tensor.expand(3, -1, -1)
    else:
        rgb = img_tensor[:3]

    # tensor is C×H×W in [0,1]; convert to HxWxC uint8
    arr = (rgb.permute(1, 2, 0).cpu().numpy() * 255).clip(0, 255).astype(np.uint8)
    bgr = cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)

    try:
        mask_uint8 = predict_lung_mask(bgr)  # H×W uint8 {0,1}
        return mask_uint8.astype(bool)
    except Exception:
        # Graceful fallback: treat entire image as lung field
        h, w = bgr.shape[:2]
        return np.ones((h, w), dtype=bool)

def post_process_lungs(mask: np.ndarray, convention: str = "PA") -> tuple[np.ndarray, np.ndarray]:
    """
    Keep two largest connected components, fill holes, split into two lungs.
    Convention PA: patient's right lung is on the image's LEFT (smaller x coordinate).
    Returns (right_lung_mask, left_lung_mask).
    """
    mask_uint8 = (mask > 0).astype(np.uint8) * 255
    
    # Fill holes
    contours, _ = cv2.findContours(mask_uint8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cv2.drawContours(mask_uint8, contours, -1, 255, -1)
    
    # Connected components
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(mask_uint8, connectivity=8)
    
    # stats: [x, y, w, h, area]
    if num_labels <= 1:
        # No lungs found
        return np.zeros_like(mask), np.zeros_like(mask)
        
    # Get largest components (excluding background label 0)
    areas = stats[1:, cv2.CC_STAT_AREA]
    sorted_idx = np.argsort(areas)[::-1]
    
    if len(sorted_idx) >= 2:
        # Two largest components
        c1_idx = sorted_idx[0] + 1
        c2_idx = sorted_idx[1] + 1
        
        c1_mask = (labels == c1_idx)
        c2_mask = (labels == c2_idx)
        
        c1_x = centroids[c1_idx][0]
        c2_x = centroids[c2_idx][0]
        
    else:
        # Only one component found, split by midline of its bounding box
        c1_idx = sorted_idx[0] + 1
        c1_mask = (labels == c1_idx)
        
        x, y, w, h, _ = stats[c1_idx]
        mid_x = x + w // 2
        
        c2_mask = c1_mask.copy()
        c1_mask[:, mid_x:] = False
        c2_mask[:, :mid_x] = False
        
        c1_x = x + w // 4
        c2_x = x + 3 * w // 4

    # Determine left/right based on convention
    # In PA (standard), the patient's Right is on the image Left (smaller X)
    # Image Left = Right Lung
    # Image Right = Left Lung
    
    if c1_x < c2_x:
        img_left_mask = c1_mask
        img_right_mask = c2_mask
    else:
        img_left_mask = c2_mask
        img_right_mask = c1_mask
        
    if convention == "PA":
        right_lung = img_left_mask
        left_lung = img_right_mask
    else: # AP
        right_lung = img_right_mask
        left_lung = img_left_mask
        
    return right_lung, left_lung

def get_lung_zones(right_lung: np.ndarray, left_lung: np.ndarray) -> dict:
    """
    Divides each lung into upper, mid, and lower thirds based on vertical extent.
    Returns a dict with masks for each zone.
    """
    zone_masks = {}
    
    for lung_name, lung_mask in [("right", right_lung), ("left", left_lung)]:
        rows = np.any(lung_mask, axis=1)
        if not np.any(rows):
            continue
            
        ymin, ymax = np.where(rows)[0][[0, -1]]
        h = ymax - ymin
        third = h // 3
        
        y1 = ymin + third
        y2 = ymin + 2 * third
        
        upper = lung_mask.copy()
        upper[y1:, :] = False
        
        mid = lung_mask.copy()
        mid[:y1, :] = False
        mid[y2:, :] = False
        
        lower = lung_mask.copy()
        lower[:y2, :] = False
        
        zone_masks[f"{lung_name}_upper"] = upper
        zone_masks[f"{lung_name}_mid"] = mid
        zone_masks[f"{lung_name}_lower"] = lower
        
    return zone_masks

def lookup_zone(zone_masks: dict, x: int, y: int) -> str:
    """Returns the zone name for a given point, or 'outside lung fields'."""
    for zone_name, mask in zone_masks.items():
        if mask.shape[0] > y and mask.shape[1] > x and mask[y, x]:
            return zone_name.replace("_", " ") + " zone"
    return "outside lung fields"

def compute_asymmetry(right_lung: np.ndarray, left_lung: np.ndarray) -> float:
    """Returns ratio of smaller lung area to larger lung area (1.0 = perfect symmetry)."""
    r_area = right_lung.sum()
    l_area = left_lung.sum()
    
    if r_area == 0 and l_area == 0:
        return 1.0
    if r_area == 0 or l_area == 0:
        return 0.0
        
    return min(r_area, l_area) / max(r_area, l_area)

