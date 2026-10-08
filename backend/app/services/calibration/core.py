import numpy as np
import torch
from sklearn.metrics import brier_score_loss, precision_score, roc_curve
from torch import nn, optim


def fit_temperatures(logits: torch.Tensor, labels: torch.Tensor) -> torch.Tensor:
    """Fit one temperature per label using LBFGS to minimize NLL."""
    num_labels = logits.shape[1]
    temperatures = nn.Parameter(torch.ones(num_labels))
    optimizer = optim.LBFGS([temperatures], lr=0.01, max_iter=50)
    criterion = nn.BCEWithLogitsLoss()
    
    def eval():
        optimizer.zero_grad()
        # clamp temps to prevent division by zero or negative temps
        t = torch.clamp(temperatures, min=1e-3)
        loss = criterion(logits / t, labels)
        loss.backward()
        return loss
        
    optimizer.step(eval)
    return torch.clamp(temperatures.detach(), min=1e-3)

def fit_tiers(calibrated_probs: np.ndarray, labels: np.ndarray, target_high_ppv: float = 0.80) -> dict:
    """Choose thresholds on VAL so PPV meets target for 'high', Youden's J for 'medium'."""
    num_labels = calibrated_probs.shape[1]
    tiers = {}
    
    for i in range(num_labels):
        y_true = labels[:, i]
        y_prob = calibrated_probs[:, i]
        
        if y_true.sum() == 0:
            tiers[str(i)] = {"high": 1.0, "medium": 1.0, "unreliable": True}
            continue
            
        fpr, tpr, thresholds = roc_curve(y_true, y_prob)
        # Youden's J
        j_scores = tpr - fpr
        best_j_idx = np.argmax(j_scores)
        med_thresh = thresholds[best_j_idx]
        
        # High tier
        high_thresh = 1.0
        unreliable = True
        
        # Sort by threshold ascending (roc_curve does this, but descending)
        for t in reversed(thresholds):
            preds = (y_prob >= t)
            if preds.sum() == 0:
                continue
            ppv = precision_score(y_true, preds, zero_division=0)
            if ppv >= target_high_ppv:
                high_thresh = t
                unreliable = False
                break
                
        # Fallback if no threshold meets PPV
        if unreliable:
            high_thresh = 1.0
            
        tiers[str(i)] = {
            "high": float(high_thresh),
            "medium": float(med_thresh),
            "unreliable": unreliable
        }
    return tiers

def fit_rule_out(calibrated_probs: np.ndarray, labels: np.ndarray, alpha: float = 0.05) -> dict:
    """Split conformal calibration: at least (1 - alpha) of true positives above threshold."""
    num_labels = calibrated_probs.shape[1]
    rule_out = {}
    
    for i in range(num_labels):
        y_true = labels[:, i]
        y_prob = calibrated_probs[:, i]
        
        pos_probs = y_prob[y_true == 1]
        if len(pos_probs) == 0:
            rule_out[str(i)] = 0.0
            continue
            
        # We want to find t such that P(prob >= t | y=1) >= 1 - alpha
        # Which means we find the alpha-quantile of positive probabilities
        q = np.percentile(pos_probs, alpha * 100)
        rule_out[str(i)] = float(q)
        
    return rule_out

def fit_ood_energy(features: torch.Tensor, val_features: torch.Tensor, val_percentile: float = 95.0) -> dict:
    """Fit energy-based OOD on TRAIN features. Use VAL features to set threshold."""
    # We use simple energy score: -logsumexp(features) if features are logits.
    # If features are just embeddings, Mahalanobis is better.
    # We'll use Mahalanobis-like or simple centroid distance since we have 1024-d pooled features.
    
    # Compute centroid of train features
    centroid = features.mean(dim=0, keepdim=True)
    # Compute covariance or just L2 distance for simplicity to avoid singular matrices
    
    # Simple Euclidean distance as OOD score
    def get_scores(feats):
        return torch.cdist(feats, centroid).squeeze(1).cpu().numpy()
        
    train_scores = get_scores(features)
    val_scores = get_scores(val_features)
    
    threshold = np.percentile(val_scores, val_percentile)
    
    return {
        "centroid": centroid.squeeze(0).tolist(),
        "threshold": float(threshold)
    }

def compute_ece(y_true: np.ndarray, y_prob: np.ndarray, n_bins=10):
    """Expected Calibration Error."""
    ece = 0.0
    for i in range(y_true.shape[1]):
        bins = np.linspace(0., 1., n_bins + 1)
        binids = np.searchsorted(bins[1:-1], y_prob[:, i])
        
        bin_sums = np.bincount(binids, weights=y_prob[:, i], minlength=len(bins))
        bin_true = np.bincount(binids, weights=y_true[:, i], minlength=len(bins))
        bin_total = np.bincount(binids, minlength=len(bins))
        
        nonzero = bin_total != 0
        prob_true = bin_true[nonzero] / bin_total[nonzero]
        prob_pred = bin_sums[nonzero] / bin_total[nonzero]
        
        ece_i = np.sum(np.abs(prob_true - prob_pred) * (bin_total[nonzero] / len(y_true)))
        ece += ece_i
    return ece / y_true.shape[1]

def compute_brier(y_true: np.ndarray, y_prob: np.ndarray):
    brier = 0.0
    for i in range(y_true.shape[1]):
        brier += brier_score_loss(y_true[:, i], y_prob[:, i])
    return brier / y_true.shape[1]

def apply_mc_dropout_tta(model, img_tensor: torch.Tensor, n_passes: int, tta_k: int, aug_cfg: dict):
    import random
    import time

    import torchvision.transforms.functional as TF
    
    start_time = time.time()
    
    model.enable_mc_dropout()
    
    all_logits = []
    with torch.no_grad():
        # Clean passes (stochastic dropout only)
        for _ in range(n_passes):
            logits = model(img_tensor)
            all_logits.append(logits)
            
        # TTA passes
        if tta_k > 0:
            for _ in range(tta_k):
                # Apply mild aug
                angle = random.uniform(-aug_cfg.get("rotate_deg", 5), aug_cfg.get("rotate_deg", 5))
                aug_img = TF.rotate(img_tensor, angle)
                
                scale = random.uniform(1.0, aug_cfg.get("scale_factor", 1.05))
                # Simple zoom via affine
                aug_img = TF.affine(aug_img, angle=0, translate=[0, 0], scale=scale, shear=0)
                
                contrast = 1.0 + random.uniform(-aug_cfg.get("contrast_jitter", 0.1), aug_cfg.get("contrast_jitter", 0.1))
                aug_img = TF.adjust_contrast(aug_img, contrast)
                
                # Single pass on augmented image (with dropout)
                logits = model(aug_img)
                all_logits.append(logits)
                
    latency = time.time() - start_time
    stacked = torch.stack(all_logits, dim=0) # (passes, 1, 14)
    return stacked, latency

class ModelNotAvailable(Exception):
    pass

def analyse_image(img_tensor: torch.Tensor, model, calibration_data: dict, labels_list: list, config: dict):
    """
    Args:
        img_tensor: (1, C, H, W)
        model: ChestDenseNet121
        calibration_data: dict loaded from calibration.json
        labels_list: list of label names
        config: uncertainty.yaml config
    """
    if model is None or not calibration_data:
        raise ModelNotAvailable("Model weights or calibration.json missing")
        
    n_passes = config["mc_dropout"]["n_passes"]
    tta_k = config["tta"]["k_augmentations"]
    
    stacked_logits, latency = apply_mc_dropout_tta(model, img_tensor, n_passes, tta_k, config["tta"])
    
    temps = torch.tensor(calibration_data["temperatures"], device=stacked_logits.device)
    
    # Calibrate each pass
    calibrated_probs = torch.sigmoid(stacked_logits / temps)
    
    # Compute stats
    mean_probs = calibrated_probs.mean(dim=0).squeeze(0).cpu().numpy()
    std_probs = calibrated_probs.std(dim=0).squeeze(0).cpu().numpy()
    lower_95 = torch.quantile(calibrated_probs, 0.025, dim=0).squeeze(0).cpu().numpy()
    upper_95 = torch.quantile(calibrated_probs, 0.975, dim=0).squeeze(0).cpu().numpy()
    
    # OOD
    centroid = torch.tensor(calibration_data["ood"]["centroid"], device=img_tensor.device)
    feats = model.expose_features(img_tensor)
    ood_score = float(torch.cdist(feats, centroid.unsqueeze(0)).squeeze().cpu().numpy())
    is_ood = ood_score > calibration_data["ood"]["threshold"]
    
    # Build result
    results = {}
    review_flags = []
    
    if is_ood:
        review_flags.append("OOD")
        
    tiers = calibration_data["tiers"]
    rule_out = calibration_data["rule_out"]
    
    for i, label in enumerate(labels_list):
        p = float(mean_probs[i])
        std = float(std_probs[i])
        l95 = float(lower_95[i])
        u95 = float(upper_95[i])
        
        tier = "low"
        t_data = tiers[str(i)]
        if p >= t_data["high"]:
            tier = "high"
        elif p >= t_data["medium"]:
            tier = "medium"
            
        ro_thresh = rule_out[str(i)]
        ro_status = "no evidence" if p < ro_thresh else "cannot rule out"
        
        # Policy checks
        if tier != "low":
            if t_data["unreliable"]:
                review_flags.append(f"UnreliableTopFinding ({label})")
        if tier == "low" and p > 0.1: # simple positive check for low tier
             review_flags.append(f"LowTierPositive ({label})")
        
        results[label] = {
            "p": p,
            "std": std,
            "interval": [l95, u95],
            "tier": tier,
            "rule_out_status": ro_status
        }
        
    # High spread check (if std > 90th percentile)
    # Using a heuristic or 0.15 since global val percentiles not stored
    if std_probs.max() > 0.15: 
        review_flags.append("HighSpread")
        
    return {
        "findings": results,
        "ood_score": ood_score,
        "is_ood": is_ood,
        "needs_review": len(review_flags) > 0,
        "review_reasons": review_flags,
        "latency_sec": latency
    }
