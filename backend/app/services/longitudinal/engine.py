import cv2
import numpy as np
import yaml
import matplotlib.pyplot as plt
from pathlib import Path
from typing import Dict, Tuple, Optional, List

ROOT = Path(__file__).resolve().parent.parent.parent.parent.parent

def load_config() -> dict:
    with open(ROOT / "config/registration.yaml", "r") as f:
        return yaml.safe_load(f)["registration"]

def preprocess_image(img: np.ndarray, config: dict, reference: Optional[np.ndarray] = None) -> np.ndarray:
    """Apply CLAHE and optionally histogram matching to a reference."""
    if len(img.shape) == 3:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
    clahe = cv2.createCLAHE(
        clipLimit=config["preprocessing"]["clahe_clip_limit"],
        tileGridSize=tuple(config["preprocessing"]["clahe_grid_size"])
    )
    img_clahe = clahe.apply(img)
    
    if reference is not None and config["preprocessing"]["histogram_matching"]:
        # Simple histogram matching (LUT)
        # Using exact histogram matching
        src_hist, bins = np.histogram(img_clahe.flatten(), 256, [0, 256])
        ref_hist, _ = np.histogram(reference.flatten(), 256, [0, 256])
        src_cdf = src_hist.cumsum()
        src_cdf = src_cdf / src_cdf.max()
        ref_cdf = ref_hist.cumsum()
        ref_cdf = ref_cdf / ref_cdf.max()
        
        lut = np.interp(src_cdf, ref_cdf, np.arange(256))
        img_matched = cv2.LUT(img_clahe, lut.astype(np.uint8))
        return img_matched
    return img_clahe

def register_images(ref_img: np.ndarray, float_img: np.ndarray, config: dict) -> Tuple[np.ndarray, float]:
    """
    Registers float_img to ref_img.
    Returns:
        H: 3x3 affine transformation matrix (Float -> Ref)
        ncc: Normalized Cross Correlation between ref and aligned float
    """
    ref_gray = preprocess_image(ref_img, config)
    float_gray = preprocess_image(float_img, config, reference=ref_gray)
    
    # 1. Coarse Alignment (ORB)
    orb = cv2.ORB_create(nfeatures=config["coarse"]["nfeatures"])
    kp1, des1 = orb.detectAndCompute(float_gray, None)
    kp2, des2 = orb.detectAndCompute(ref_gray, None)
    
    H_coarse = np.eye(3, dtype=np.float32)
    if des1 is not None and des2 is not None and len(des1) > 10 and len(des2) > 10:
        bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
        matches = bf.match(des1, des2)
        matches = sorted(matches, key=lambda x: x.distance)
        
        # Take top matches
        good_matches = matches[:50] if len(matches) > 50 else matches
        
        if len(good_matches) >= 4:
            src_pts = np.float32([kp1[m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
            dst_pts = np.float32([kp2[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)
            
            M, inliers = cv2.estimateAffinePartial2D(src_pts, dst_pts, method=cv2.RANSAC, 
                                                     ransacReprojThreshold=config["coarse"]["ransac_threshold"])
            if M is not None:
                H_coarse[:2, :] = M
                
    # 2. Refine with ECC
    criteria = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 
                config["ecc"]["iterations"], 
                config["ecc"]["termination_eps"])
    
    warp_matrix = H_coarse[:2, :]
    try:
        # Warning: findTransformECC modifies warp_matrix in-place
        _, warp_matrix = cv2.findTransformECC(
            float_gray, ref_gray, warp_matrix, 
            cv2.MOTION_AFFINE, criteria, None, 5
        )
    except cv2.error:
        # ECC failed to converge, fallback to coarse
        pass
        
    H_final = np.eye(3, dtype=np.float32)
    H_final[:2, :] = warp_matrix
    
    # Apply transform
    h, w = ref_gray.shape
    aligned_float = cv2.warpAffine(float_img if len(float_img.shape) == 2 else cv2.cvtColor(float_img, cv2.COLOR_BGR2GRAY), 
                                   warp_matrix, (w, h), flags=cv2.INTER_LINEAR)
                                   
    # Calculate NCC on the valid overlap region
    valid_mask = cv2.warpAffine(np.ones_like(float_gray), warp_matrix, (w, h), flags=cv2.INTER_NEAREST) > 0
    ref_valid = ref_gray[valid_mask]
    align_valid = aligned_float[valid_mask]
    
    if len(ref_valid) == 0:
        ncc = 0.0
    else:
        # Match shapes/types for corrcoef
        ref_norm = (ref_valid - np.mean(ref_valid)) / (np.std(ref_valid) + 1e-8)
        align_norm = (align_valid - np.mean(align_valid)) / (np.std(align_valid) + 1e-8)
        ncc = np.mean(ref_norm * align_norm)
        
    return H_final, ncc

class LongitudinalEngine:
    def __init__(self):
        self.config = load_config()
        self.storage_dir = ROOT / "data/processed/longitudinal"
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        
    def check_mismatch(self, ncc: float) -> bool:
        return ncc < self.config["mismatch"]["ncc_threshold"]
        
    def generate_difference_map(self, ref_img: np.ndarray, aligned_img: np.ndarray, H: np.ndarray) -> Tuple[np.ndarray, List[List[float]], dict]:
        h, w = ref_img.shape[:2]
        
        if len(ref_img.shape) == 3: ref_img = cv2.cvtColor(ref_img, cv2.COLOR_BGR2GRAY)
        if len(aligned_img.shape) == 3: aligned_img = cv2.cvtColor(aligned_img, cv2.COLOR_BGR2GRAY)
            
        mask = cv2.warpAffine(np.ones_like(aligned_img), H[:2, :], (w, h), flags=cv2.INTER_NEAREST) > 0
        
        diff = np.zeros((h, w), dtype=np.float32)
        diff[mask] = ref_img[mask].astype(np.float32) - aligned_img[mask].astype(np.float32)
        
        # Normalize diff for visualization (-255 to 255)
        # Positive = new density (ref > aligned)
        # Negative = lost density (ref < aligned)
        
        # 64x64 hover map
        grid_size = self.config["difference_map"]["hover_grid_size"]
        hover_map = cv2.resize(diff, (grid_size, grid_size), interpolation=cv2.INTER_AREA)
        hover_json = hover_map.tolist()
        
        # Threshold stats
        change_thresh = self.config["difference_map"]["change_threshold"] * 255
        changed_pixels = np.sum(np.abs(diff[mask]) > change_thresh)
        total_overlap = np.sum(mask)
        fraction_changed = changed_pixels / max(total_overlap, 1)
        
        stats = {
            "fraction_changed": float(fraction_changed),
            "total_overlap_pixels": int(total_overlap)
        }
        
        return diff, hover_json, stats
        
    def render_diff_png(self, diff: np.ndarray, out_path: str):
        # Create a diverging colormap representation
        # Scale -255..255 to 0..1 for colormap
        norm_diff = (diff + 255.0) / 510.0
        cm = plt.get_cmap('coolwarm')
        colored = cm(norm_diff)[:, :, :3] * 255
        
        # Mask out zero areas (where diff == 0, norm == 0.5) to background (black)
        black_mask = (diff == 0)
        colored[black_mask] = [0, 0, 0]
        
        # Convert RGB to BGR for OpenCV
        colored_bgr = cv2.cvtColor(colored.astype(np.uint8), cv2.COLOR_RGB2BGR)
        cv2.imwrite(out_path, colored_bgr)
        
    def measure_distance(self, p1: Tuple[int, int], p2: Tuple[int, int], mm_per_pixel: Optional[float]) -> dict:
        dist_px = np.sqrt((p2[0] - p1[0])**2 + (p2[1] - p1[1])**2)
        if mm_per_pixel is None:
            return {"value": float(dist_px), "unit": "pixels", "calibrated": False}
        return {"value": float(dist_px * mm_per_pixel), "unit": "mm", "calibrated": True}
        
    def measure_relative_density(self, img: np.ndarray, target_roi_pts: List[Tuple[int, int]], ref_roi_pts: List[Tuple[int, int]]) -> float:
        """Calculate density proxy: mean(target) / mean(ref)"""
        h, w = img.shape[:2]
        
        def get_mean(pts):
            mask = np.zeros((h, w), dtype=np.uint8)
            cv2.fillPoly(mask, [np.array(pts, dtype=np.int32)], 1)
            return cv2.mean(img, mask=mask)[0]
            
        target_mean = get_mean(target_roi_pts)
        ref_mean = get_mean(ref_roi_pts)
        
        return target_mean / max(ref_mean, 1e-5)

    def process_pair(self, ref_path: str, float_path: str, pair_id: str):
        ref_img = cv2.imread(ref_path, cv2.IMREAD_GRAYSCALE)
        float_img = cv2.imread(float_path, cv2.IMREAD_GRAYSCALE)
        
        H, ncc = register_images(ref_img, float_img, self.config)
        
        if self.check_mismatch(ncc):
            return {"error": "Images may not show the same anatomy (mismatch detected).", "ncc": ncc}
            
        h, w = ref_img.shape
        aligned_float = cv2.warpAffine(float_img, H[:2, :], (w, h), flags=cv2.INTER_LINEAR)
        
        diff, hover_json, stats = self.generate_difference_map(ref_img, aligned_float, H)
        
        diff_png = str(self.storage_dir / f"{pair_id}_diff.png")
        aligned_png = str(self.storage_dir / f"{pair_id}_aligned.png")
        
        self.render_diff_png(diff, diff_png)
        cv2.imwrite(aligned_png, aligned_float)
        
        comparison = {
            "pair_id": pair_id,
            "ncc": float(ncc),
            "transform_affine": H.tolist(),
            "stats": stats,
            "diff_png": diff_png,
            "aligned_png": aligned_png,
            "hover_grid": hover_json
        }
        
        # Persist
        with open(self.storage_dir / f"{pair_id}_data.json", "w") as f:
            import json
            json.dump(comparison, f)
            
        return comparison
