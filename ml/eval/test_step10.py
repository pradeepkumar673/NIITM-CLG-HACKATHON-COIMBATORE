import json
import sys
from pathlib import Path

import numpy as np
import torch
from scipy.optimize import minimize
from sklearn.metrics import (
    average_precision_score,
    confusion_matrix,
    f1_score,
    recall_score,
    roc_auc_score,
)

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

from ml.train.dataset_step10 import Step10CacheDataset
from ml.train.model import GenericEfficientNetB0

TASKS = {
    "fracture": {
        "manifest": "data/processed/fracture_manifest.csv",
        "prefix": "fracture",
        "label_map": {"non_fractured": 0, "fractured": 1},
        "num_classes": 2,
        "is_binary": True
    },
    "knee": {
        "manifest": "data/processed/knee_manifest.csv",
        "prefix": "knee",
        "label_map": {"normal": 0, "osteopenia": 1, "osteoporosis": 2},
        "num_classes": 3,
        "is_binary": False
    },
    "tb": {
        "manifest": "data/processed/tb_manifest.csv",
        "prefix": "tb",
        "label_map": {"normal": 0, "tb": 1},
        "num_classes": 2,
        "is_binary": True
    }
}

def temperature_scaling_binary(logits, targets):
    def loss_fn(t):
        p = torch.sigmoid(logits / t[0])
        p = torch.clamp(p, 1e-7, 1 - 1e-7)
        # binary cross entropy
        loss = - (targets * torch.log(p) + (1 - targets) * torch.log(1 - p)).mean()
        return loss.item()
    res = minimize(loss_fn, [1.0], bounds=[(0.1, 10.0)])
    return res.x[0]

def temperature_scaling_multi(logits, targets):
    def loss_fn(t):
        p = torch.softmax(logits / t[0], dim=1)
        p = torch.clamp(p, 1e-7, 1.0)
        loss = - torch.log(p[torch.arange(len(targets)), targets]).mean()
        return loss.item()
    res = minimize(loss_fn, [1.0], bounds=[(0.1, 10.0)])
    return res.x[0]

def bootstrap_metric(y_true, y_pred, metric_fn, n_boot=1000, **kwargs):
    rng = np.random.RandomState(42)
    scores = []
    n = len(y_true)
    for _ in range(n_boot):
        idx = rng.randint(0, n, n)
        try:
            scores.append(metric_fn(y_true[idx], y_pred[idx], **kwargs))
        except:
            pass
    if not scores:
        return 0.0, 0.0, 0.0
    return np.mean(scores), np.percentile(scores, 2.5), np.percentile(scores, 97.5)

def eval_task(task_name):
    tcfg = TASKS[task_name]
    cache_dir = ROOT / "data/cache"
    
    val_ds = Step10CacheDataset(ROOT / tcfg["manifest"], "val", cache_dir, tcfg["prefix"], tcfg["label_map"], augment=False)
    test_ds = Step10CacheDataset(ROOT / tcfg["manifest"], "test", cache_dir, tcfg["prefix"], tcfg["label_map"], augment=False)
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    num_labels = 1 if tcfg["is_binary"] else tcfg["num_classes"]
    dropout_p = 0.5 if task_name == "knee" else 0.3
    model = GenericEfficientNetB0(num_labels=num_labels, dropout_p=dropout_p, pretrained=False)
    
    ckpt_path = ROOT / "models" / f"{task_name}_efficientnet" / "best.pt"
    if not ckpt_path.exists():
        print(f"Skipping {task_name}, weights not found.")
        return
    model.load_state_dict(torch.load(ckpt_path, map_location=device))
    model.to(device)
    model.eval()

    def get_preds(ds):
        loader = torch.utils.data.DataLoader(ds, batch_size=32, shuffle=False)
        all_y = []
        all_logits = []
        with torch.no_grad():
            for x, y in loader:
                logits = model(x.to(device))
                all_y.extend(y.tolist())
                all_logits.append(logits.cpu())
        return torch.tensor(all_y), torch.cat(all_logits, dim=0)

    val_y, val_logits = get_preds(val_ds)
    test_y, test_logits = get_preds(test_ds)

    if tcfg["is_binary"]:
        temp = temperature_scaling_binary(val_logits.squeeze(-1), val_y.float())
        print(f"{task_name} Temp: {temp:.3f}")
        
        # apply temp
        val_p = torch.sigmoid(val_logits.squeeze(-1) / temp).numpy()
        test_p = torch.sigmoid(test_logits.squeeze(-1) / temp).numpy()
        val_y = val_y.numpy()
        test_y = test_y.numpy()
        
        # choose threshold on val to maximize f1
        thresholds = np.linspace(0, 1, 100)
        f1s = [f1_score(val_y, val_p > t) for t in thresholds]
        best_t = thresholds[np.argmax(f1s)]
        
        # Test metrics
        auc, auc_l, auc_u = bootstrap_metric(test_y, test_p, roc_auc_score)
        ap, ap_l, ap_u = bootstrap_metric(test_y, test_p, average_precision_score)
        
        preds = test_p > best_t
        tn, fp, fn, tp = confusion_matrix(test_y, preds).ravel()
        sens = tp / (tp + fn + 1e-9)
        spec = tn / (tn + fp + 1e-9)
        
        report = {
            "temperature": float(temp),
            "threshold": float(best_t),
            "metrics": {
                "AUROC": {"mean": auc, "ci_lower": auc_l, "ci_upper": auc_u},
                "AUPRC": {"mean": ap, "ci_lower": ap_l, "ci_upper": ap_u},
                "Sensitivity": sens,
                "Specificity": spec
            }
        }
    else:
        temp = temperature_scaling_multi(val_logits, val_y)
        print(f"{task_name} Temp: {temp:.3f}")
        
        test_p = torch.softmax(test_logits / temp, dim=1).numpy()
        test_y = test_y.numpy()
        preds = np.argmax(test_p, axis=1)
        
        mac_f1, f1_l, f1_u = bootstrap_metric(test_y, preds, f1_score, average="macro")
        
        recalls = recall_score(test_y, preds, average=None, labels=range(tcfg["num_classes"]))
        cm = confusion_matrix(test_y, preds, labels=range(tcfg["num_classes"]))
        
        # Save CM image for Knee
        if task_name == "knee":
            import matplotlib.pyplot as plt
            plt.figure(figsize=(6, 5))
            plt.matshow(cm, cmap="Blues")
            for (i, j), z in np.ndenumerate(cm):
                plt.text(j, i, f'{z:d}', ha='center', va='center')
            plt.title("Knee Bone Health Confusion Matrix")
            plt.colorbar()
            plt.xlabel("Predicted")
            plt.ylabel("Actual")
            plt.xticks(ticks=range(len(tcfg["label_map"])), labels=list(tcfg["label_map"].keys()))
            plt.yticks(ticks=range(len(tcfg["label_map"])), labels=list(tcfg["label_map"].keys()))
            out_img_dir = ROOT / "reports" / task_name
            out_img_dir.mkdir(parents=True, exist_ok=True)
            plt.savefig(out_img_dir / "confusion_matrix.png")
            plt.close()
            
        report = {
            "temperature": float(temp),
            "metrics": {
                "Macro_F1": {"mean": mac_f1, "ci_lower": f1_l, "ci_upper": f1_u},
                "PerClassRecall": recalls.tolist(),
                "ConfusionMatrix": cm.tolist()
            }
        }

    out_dir = ROOT / "reports" / task_name
    out_dir.mkdir(parents=True, exist_ok=True)
    with open(out_dir / "calibration.json", "w") as f:
        json.dump({"temperature": float(temp), "threshold": report.get("threshold", 0.5)}, f, indent=2)
    with open(out_dir / "metrics.json", "w") as f:
        json.dump(report, f, indent=2)
    
    # MD report
    with open(out_dir / "metrics.md", "w") as f:
        f.write(f"# {task_name.capitalize()} Metrics\n\n")
        f.write("```json\n" + json.dumps(report, indent=2) + "\n```\n")

if __name__ == "__main__":
    for t in ["fracture", "knee", "tb"]:
        eval_task(t)
