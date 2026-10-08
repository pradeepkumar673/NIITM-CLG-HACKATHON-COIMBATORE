"""Step 7: Calibration, Uncertainty, and Evaluation."""
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import torch
import yaml
from PIL import Image, ImageFilter
from sklearn.metrics import precision_score, roc_auc_score
from torch.utils.data import DataLoader

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

from backend.app.services.calibration.core import (
    analyse_image,
    compute_brier,
    compute_ece,
    fit_ood_energy,
    fit_rule_out,
    fit_temperatures,
    fit_tiers,
)
from ml.train.chest_dataset import ChestCacheDataset
from ml.train.model import ChestDenseNet121


def load_yaml(path):
    with open(path, "r") as f:
        return yaml.safe_load(f)

def get_logits_and_features(model, dataloader, device):
    all_logits = []
    all_labels = []
    all_features = []
    model.eval()
    with torch.no_grad():
        for imgs, labels in dataloader:
            if imgs.shape[1] == 1:
                imgs = imgs.expand(-1, 3, -1, -1)
            imgs = imgs.to(device)
            feats = model.expose_features(imgs)
            logits = model.classifier(feats)
            
            all_logits.append(logits.cpu())
            all_labels.append(labels)
            all_features.append(feats.cpu())
            
    return torch.cat(all_logits, dim=0), torch.cat(all_labels, dim=0), torch.cat(all_features, dim=0)

def main():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    cfg = load_yaml(ROOT / "config/train_chest.yaml")
    unc_cfg = load_yaml(ROOT / "config/uncertainty.yaml")
    labels_list = load_yaml(ROOT / "config/chest_labels.yaml")["labels"]
    
    # Load model
    ckpt_path = ROOT / cfg["checkpoint"]["dir"] / "best.pt"
    if not ckpt_path.exists():
        print("Missing chest model checkpoint.")
        return
        
    model = ChestDenseNet121(num_labels=cfg["model"]["num_labels"], dropout_p=cfg["model"]["dropout_p"])
    ckpt = torch.load(ckpt_path, map_location=device, weights_only=False)
    model.load_state_dict(ckpt["model_state_dict"])
    model.to(device)
    
    # Load dataloaders
    manifest_path = ROOT / cfg["data"]["manifest"]
    cache_dir = ROOT / cfg["data"]["cache_dir"]
    
    # We use a small subset of train for OOD fitting to save time, and full val
    print("Loading data...")
    train_ds = ChestCacheDataset(manifest_path, "train", cache_dir)
    # subset train for speed in OOD (say 2000 images)
    train_ds.df = train_ds.df.head(2000)
    train_ds.labels = train_ds.labels[:2000]
    
    val_ds = ChestCacheDataset(manifest_path, "val", cache_dir)
    test_ds = ChestCacheDataset(manifest_path, "test", cache_dir)
    
    nw = cfg["training"]["num_workers"]
    bs = cfg["training"]["batch_size"]
    
    train_loader = DataLoader(train_ds, batch_size=bs, shuffle=False, num_workers=nw)
    val_loader = DataLoader(val_ds, batch_size=bs, shuffle=False, num_workers=nw)
    test_loader = DataLoader(test_ds, batch_size=bs, shuffle=False, num_workers=nw)
    
    print("Extracting features and logits...")
    train_logits, train_labels, train_feats = get_logits_and_features(model, train_loader, device)
    val_logits, val_labels, val_feats = get_logits_and_features(model, val_loader, device)
    test_logits, test_labels, test_feats = get_logits_and_features(model, test_loader, device)
    
    print("1. TEMPERATURE SCALING")
    temps = fit_temperatures(val_logits, val_labels)
    
    uncalibrated_probs_test = torch.sigmoid(test_logits).numpy()
    calibrated_probs_test = torch.sigmoid(test_logits / temps).numpy()
    
    test_labels_np = test_labels.numpy()
    
    ece_before = compute_ece(test_labels_np, uncalibrated_probs_test)
    ece_after = compute_ece(test_labels_np, calibrated_probs_test)
    
    brier_before = compute_brier(test_labels_np, uncalibrated_probs_test)
    brier_after = compute_brier(test_labels_np, calibrated_probs_test)
    
    print(f"Mean ECE before: {ece_before:.4f} -> after: {ece_after:.4f}")
    print(f"Mean Brier before: {brier_before:.4f} -> after: {brier_after:.4f}")
    
    print("3. CONFIDENCE TIERS & 4. RULE-OUT")
    calibrated_probs_val = torch.sigmoid(val_logits / temps).numpy()
    val_labels_np = val_labels.numpy()
    
    tiers = fit_tiers(calibrated_probs_val, val_labels_np, unc_cfg["uncertainty"]["tiers"]["target_high_ppv"])
    rule_out = fit_rule_out(calibrated_probs_val, val_labels_np, unc_cfg["uncertainty"]["rule_out"]["alpha"])
    
    print("5. OUT-OF-DISTRIBUTION")
    ood_data = fit_ood_energy(train_feats, val_feats, unc_cfg["uncertainty"]["ood"]["val_percentile_threshold"])
    
    # Save calibration.json
    import hashlib
    sha256 = hashlib.sha256(ckpt_path.read_bytes()).hexdigest()
    
    calibration_data = {
        "checkpoint_sha256": sha256,
        "temperatures": temps.tolist(),
        "tiers": tiers,
        "rule_out": rule_out,
        "ood": ood_data
    }
    
    calib_file = ROOT / "models/chest_densenet121/calibration.json"
    with open(calib_file, "w") as f:
        json.dump(calibration_data, f, indent=2)
        
    print(f"Saved calibration data to {calib_file}")
    
    # Evaluate Tiers on TEST
    tier_md = "# Confidence Tiers Evaluation (TEST)\n\n| Label | High PPV | Medium PPV | Unreliable |\n|---|---|---|---|\n"
    for i, label in enumerate(labels_list):
        t_data = tiers[str(i)]
        y_true = test_labels_np[:, i]
        y_prob = calibrated_probs_test[:, i]
        
        preds_high = y_prob >= t_data["high"]
        ppv_high = precision_score(y_true, preds_high, zero_division=0) if preds_high.sum() > 0 else 0.0
        
        preds_med = y_prob >= t_data["medium"]
        ppv_med = precision_score(y_true, preds_med, zero_division=0) if preds_med.sum() > 0 else 0.0
        
        tier_md += f"| {label} | {ppv_high:.4f} | {ppv_med:.4f} | {t_data['unreliable']} |\n"
        
    with open(ROOT / "reports/tier_ppv.md", "w") as f:
        f.write(tier_md)
        
    # Evaluate OOD on gate negatives
    print("Evaluating OOD on gate negatives...")
    gate_df = pd.read_csv(ROOT / "data/processed/gate_manifest.csv")
    gate_neg = gate_df[gate_df["label"] != "xray"]
    gate_neg_paths = [ROOT / p if not Path(p).is_absolute() else Path(p) for p in gate_neg["image_path"].values[:100]] # use 100 for speed
    
    ood_centroid = torch.tensor(ood_data["centroid"])
    
    in_dist_scores = []
    for feats in test_feats:
        score = float(torch.cdist(feats.unsqueeze(0), ood_centroid.unsqueeze(0)).squeeze())
        in_dist_scores.append(score)
        
    out_dist_scores = []
    model.eval()
    with torch.no_grad():
        from torchvision import transforms
        t = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor()
        ])
        for p in gate_neg_paths:
            try:
                img = Image.open(p).convert('L')
                img_t = t(img).unsqueeze(0).to(device)
                if img_t.shape[1] == 1:
                    img_t = img_t.expand(-1, 3, -1, -1)
                feats = model.expose_features(img_t)
                score = float(torch.cdist(feats, ood_centroid.unsqueeze(0).to(device)).squeeze())
                out_dist_scores.append(score)
            except Exception:
                pass
                
    y_true_ood = [0] * len(in_dist_scores) + [1] * len(out_dist_scores)
    y_scores_ood = in_dist_scores + out_dist_scores
    
    ood_auroc = roc_auc_score(y_true_ood, y_scores_ood)
    print(f"OOD AUROC: {ood_auroc:.4f}")
    
    with open(ROOT / "reports/ood.md", "w") as f:
        f.write(f"# OOD Evaluation\n\n**OOD AUROC on Gate Negatives:** {ood_auroc:.4f}\n")
        
    print("\n2. LIVE VERIFICATION (MC-DROPOUT + TTA)")
    # Select 3 images from test
    # 1 positive (Cardiomegaly)
    pos_idx = np.where(test_labels_np[:, 1] == 1)[0][0]
    # 1 negative (no findings)
    neg_idx = np.where(test_labels_np.sum(axis=1) == 0)[0][0]
    
    pos_img_path = test_ds.df.iloc[pos_idx]["image_path"]
    neg_img_path = test_ds.df.iloc[neg_idx]["image_path"]
    
    def run_inference(path, degrade=False):
        img = Image.open(path if Path(path).is_absolute() else ROOT / path).convert('L')
        if degrade:
            img = img.filter(ImageFilter.GaussianBlur(radius=5))
            print("\n--- DEGRADED IMAGE (Test-Only Transformation) ---")
        else:
            print(f"\n--- CLEAN IMAGE: {Path(path).name} ---")
            
        t = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor()
        ])
        img_t = t(img).unsqueeze(0).to(device)
        
        res = analyse_image(img_t, model, calibration_data, labels_list, unc_cfg["uncertainty"])
        print(f"Latency: {res['latency_sec']:.3f}s")
        print(f"OOD Score: {res['ood_score']:.2f} (is_ood: {res['is_ood']})")
        print(f"Needs Review: {res['needs_review']} (Reasons: {res['review_reasons']})")
        
        # print top 2 findings by probability
        sorted_f = sorted(res["findings"].items(), key=lambda x: x[1]['p'], reverse=True)
        for k, v in sorted_f[:2]:
            print(f"  {k}: p={v['p']:.3f}, std={v['std']:.3f}, tier={v['tier']}, rule_out={v['rule_out_status']}")
            
        return res
        
    res_pos = run_inference(pos_img_path)
    res_neg = run_inference(neg_img_path)
    res_deg = run_inference(pos_img_path, degrade=True)
    
    print("\nSPREAD COMPARISON (Cardiomegaly STD)")
    std_clean = res_pos["findings"]["Cardiomegaly"]["std"]
    std_deg = res_deg["findings"]["Cardiomegaly"]["std"]
    print(f"Clean STD: {std_clean:.4f}, Degraded STD: {std_deg:.4f}")
    if std_deg > std_clean:
        print("Success: Spread is larger on degraded image!")
    else:
        print("Note: Spread did not increase. Dropout might be too low or transform not impactful enough.")

if __name__ == "__main__":
    main()
