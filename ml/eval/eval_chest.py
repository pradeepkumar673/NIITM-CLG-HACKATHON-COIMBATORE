"""Evaluate chest DenseNet121 model."""

import json
import yaml
import hashlib
from pathlib import Path
import numpy as np
import pandas as pd
import torch
import matplotlib.pyplot as plt
from sklearn.metrics import roc_auc_score, average_precision_score, roc_curve
from torch.utils.data import DataLoader
import subprocess
from datetime import datetime

import sys
ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

from ml.train.chest_dataset import ChestCacheDataset
from ml.train.model import ChestDenseNet121

def _load_config():
    with open(ROOT / "config/train_chest.yaml", "r") as f:
        return yaml.safe_load(f)

def compute_bootstrap_ci(y_true, y_pred, n_resamples=1000, alpha=0.05):
    """Compute 95% CI for AUROC using bootstrap."""
    if y_true.sum() == 0 or y_true.sum() == len(y_true):
        return (0.0, 0.0)
    scores = []
    n = len(y_true)
    for _ in range(n_resamples):
        indices = np.random.randint(0, n, n)
        if y_true[indices].sum() == 0 or y_true[indices].sum() == len(indices):
            continue
        scores.append(roc_auc_score(y_true[indices], y_pred[indices]))
    if not scores:
        return (0.0, 0.0)
    scores.sort()
    lower = np.percentile(scores, alpha / 2 * 100)
    upper = np.percentile(scores, (1 - alpha / 2) * 100)
    return (float(lower), float(upper))

def evaluate_model():
    cfg = _load_config()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    ckpt_path = ROOT / cfg["checkpoint"]["dir"] / "best.pt"
    if not ckpt_path.exists():
        print(f"No checkpoint found at {ckpt_path}")
        return
        
    model = ChestDenseNet121(num_labels=cfg["model"]["num_labels"], dropout_p=cfg["model"]["dropout_p"])
    ckpt = torch.load(ckpt_path, map_location=device, weights_only=False)
    model.load_state_dict(ckpt["model_state_dict"])
    model.to(device)
    model.eval()
    
    # Manifest for labels
    labels_cfg = yaml.safe_load(open(ROOT / "config/chest_labels.yaml"))
    labels_list = labels_cfg["labels"]
    
    def get_preds(split):
        ds = ChestCacheDataset(ROOT / cfg["data"]["manifest"], split, ROOT / cfg["data"]["cache_dir"])
        loader = DataLoader(ds, batch_size=cfg["training"]["batch_size"], shuffle=False, num_workers=0)
        
        all_preds = []
        all_labels = []
        with torch.no_grad():
            for imgs, lbls in loader:
                if imgs.shape[1] == 1:
                    imgs = imgs.expand(-1, 3, -1, -1)
                imgs = imgs.to(device)
                logits = model(imgs)
                probs = torch.sigmoid(logits).cpu().numpy()
                all_preds.append(probs)
                all_labels.append(lbls.numpy())
                
        return np.concatenate(all_preds, axis=0), np.concatenate(all_labels, axis=0)
        
    print("Evaluating VAL...")
    val_preds, val_labels = get_preds("val")
    
    print("Evaluating TEST...")
    test_preds, test_labels = get_preds("test")
    
    # Compute metrics on TEST
    results = {}
    mean_auroc = 0.0
    valid_classes = 0
    
    plt.figure(figsize=(10, 8))
    
    for i, label_name in enumerate(labels_list):
        y_true = test_labels[:, i]
        y_pred = test_preds[:, i]
        
        prevalence = float(y_true.mean())
        if prevalence == 0 or prevalence == 1:
            results[label_name] = {"auroc": 0, "auroc_ci": [0,0], "auprc": 0, "prevalence": prevalence}
            continue
            
        auroc = float(roc_auc_score(y_true, y_pred))
        ci_lower, ci_upper = compute_bootstrap_ci(y_true, y_pred)
        auprc = float(average_precision_score(y_true, y_pred))
        
        results[label_name] = {
            "auroc": auroc,
            "auroc_ci": [ci_lower, ci_upper],
            "auprc": auprc,
            "prevalence": prevalence
        }
        
        mean_auroc += auroc
        valid_classes += 1
        
        # ROC curve plot
        fpr, tpr, _ = roc_curve(y_true, y_pred)
        plt.plot(fpr, tpr, label=f"{label_name} ({auroc:.2f})")
        
    mean_auroc /= valid_classes if valid_classes > 0 else 1
    
    plt.plot([0, 1], [0, 1], 'k--')
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title(f'Chest X-Ray ROC Curves (Mean AUROC: {mean_auroc:.3f})')
    plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
    plt.tight_layout()
    
    reports_dir = ROOT / "reports"
    reports_dir.mkdir(exist_ok=True)
    plt.savefig(reports_dir / "chest_roc.png")
    
    # Save JSON
    output_metrics = {
        "mean_test_auroc": mean_auroc,
        "per_label": results
    }
    with open(reports_dir / "chest_metrics.json", "w") as f:
        json.dump(output_metrics, f, indent=2)
        
    # Save MD
    md = f"# Chest DenseNet121 Evaluation\n\n**Mean Test AUROC:** {mean_auroc:.4f}\n\n"
    md += "| Label | Prevalence | AUROC | 95% CI | AUPRC |\n|---|---|---|---|---|\n"
    for label, metrics in results.items():
        md += f"| {label} | {metrics['prevalence']:.4f} | {metrics['auroc']:.4f} | [{metrics['auroc_ci'][0]:.4f}, {metrics['auroc_ci'][1]:.4f}] | {metrics['auprc']:.4f} |\n"
        
    with open(reports_dir / "chest_metrics.md", "w") as f:
        f.write(md)
        
    print(f"\nMean AUROC: {mean_auroc:.4f}")
    
    # Register weights
    print("\nRegistering weights...")
    sha256 = hashlib.sha256(ckpt_path.read_bytes()).hexdigest()
    
    try:
        git_commit = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=str(ROOT)).decode("utf-8").strip()
    except Exception:
        git_commit = "unknown"
        
    config_hash = hashlib.sha256(open(ROOT / "config/train_chest.yaml", "rb").read()).hexdigest()
    
    reg_path = ROOT / "models/registry.json"
    registry = {}
    if reg_path.exists():
        registry = json.load(open(reg_path))
        if isinstance(registry, list):
            # Convert legacy list to dict if needed
            registry = {item["name"]: item for item in registry}
        
    registry["chest_densenet121"] = {
        "name": "chest_densenet121",
        "path": "models/chest_densenet121/best.pt",
        "sha256": sha256,
        "git_commit": git_commit,
        "config_hash": config_hash,
        "metrics_file": "reports/chest_metrics.json",
        "training_date": datetime.now().isoformat(),
        "mean_test_auroc": mean_auroc
    }
    
    with open(reg_path, "w") as f:
        json.dump(registry, f, indent=2)
        
    print("Done. Saved reports and updated models/registry.json.")

if __name__ == "__main__":
    evaluate_model()
