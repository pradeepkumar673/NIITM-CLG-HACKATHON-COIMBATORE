import argparse
import time
import os
from pathlib import Path
import yaml
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from sklearn.metrics import roc_auc_score, f1_score
import numpy as np

ROOT = Path(__file__).resolve().parent.parent.parent
import sys
sys.path.insert(0, str(ROOT))

from ml.train.model import GenericEfficientNetB0
from ml.train.dataset_step10 import Step10CacheDataset

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

def load_config(task: str) -> dict:
    with open(ROOT / "config" / f"train_{task}.yaml") as f:
        return yaml.safe_load(f)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--task", type=str, required=True, choices=["fracture", "knee", "tb"])
    parser.add_argument("--resume", action="store_true")
    args = parser.parse_args()
    
    cfg = load_config(args.task)
    tcfg = TASKS[args.task]
    
    cache_dir = ROOT / "data/cache"
    train_ds = Step10CacheDataset(ROOT / tcfg["manifest"], "train", cache_dir, tcfg["prefix"], tcfg["label_map"], augment=True)
    val_ds = Step10CacheDataset(ROOT / tcfg["manifest"], "val", cache_dir, tcfg["prefix"], tcfg["label_map"], augment=False)
    
    # Class weights for unbalanced datasets
    if tcfg["is_binary"]:
        counts = train_ds.df["label"].map(tcfg["label_map"]).value_counts()
        pos_weight = counts.get(0, 1) / (counts.get(1, 1) + 1e-5)
        criterion = nn.BCEWithLogitsLoss(pos_weight=torch.tensor(pos_weight, dtype=torch.float))
        model = GenericEfficientNetB0(num_labels=1, dropout_p=cfg.get("dropout_p", 0.3))
    else:
        # 3-class for knee
        counts = train_ds.df["label"].map(tcfg["label_map"]).value_counts()
        w = [1.0] * tcfg["num_classes"]
        total = len(train_ds)
        for i in range(tcfg["num_classes"]):
            c = counts.get(i, 0)
            if c > 0:
                w[i] = total / (tcfg["num_classes"] * c)
            else:
                w[i] = 0.0
        criterion = nn.CrossEntropyLoss(weight=torch.tensor(w, dtype=torch.float))
        model = GenericEfficientNetB0(num_labels=tcfg["num_classes"], dropout_p=cfg.get("dropout_p", 0.3))
        
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    criterion.to(device)
    
    train_loader = DataLoader(train_ds, batch_size=cfg["batch_size"], shuffle=True, num_workers=cfg.get("num_workers", 0))
    val_loader = DataLoader(val_ds, batch_size=cfg["batch_size"], shuffle=False, num_workers=cfg.get("num_workers", 0))
    
    optimizer = torch.optim.AdamW(model.parameters(), lr=cfg["lr"], weight_decay=cfg["weight_decay"])
    scaler = torch.amp.GradScaler('cuda', enabled=cfg.get("mixed_precision", False))
    
    start_epoch = 0
    ckpt_dir = ROOT / "models" / f"{args.task}_efficientnet"
    ckpt_dir.mkdir(parents=True, exist_ok=True)
    last_pt = ckpt_dir / "last.pt"
    best_pt = ckpt_dir / "best.pt"
    
    if args.resume and last_pt.exists():
        ckpt = torch.load(last_pt, map_location=device)
        model.load_state_dict(ckpt["model"])
        optimizer.load_state_dict(ckpt["optimizer"])
        start_epoch = ckpt["epoch"] + 1
        print(f"Resumed {args.task} from epoch {start_epoch}")

    best_metric = -1.0
    patience = cfg.get("early_stopping_patience", 3)
    patience_cnt = 0
    
    for ep in range(start_epoch, cfg["epochs"]):
        model.train()
        t0 = time.time()
        for x, y in train_loader:
            x = x.to(device)
            y = y.to(device)
            optimizer.zero_grad()
            with torch.amp.autocast('cuda', enabled=cfg.get("mixed_precision", False)):
                logits = model(x)
                if tcfg["is_binary"]:
                    loss = criterion(logits.squeeze(-1), y.float())
                else:
                    loss = criterion(logits, y)
            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()
            
        t1 = time.time()
        
        # Validation
        model.eval()
        all_y = []
        all_p = []
        with torch.no_grad():
            for x, y in val_loader:
                x = x.to(device)
                logits = model(x.to(device))
                if tcfg["is_binary"]:
                    prob = torch.sigmoid(logits.squeeze(-1))
                    all_y.extend(y.tolist())
                    all_p.extend(prob.cpu().tolist())
                else:
                    prob = torch.softmax(logits, dim=1)
                    all_y.extend(y.tolist())
                    all_p.append(prob.cpu().numpy())
                    
        if tcfg["is_binary"]:
            try:
                metric = roc_auc_score(all_y, all_p)
            except ValueError:
                metric = 0.5
        else:
            all_p = np.concatenate(all_p, axis=0)
            preds = np.argmax(all_p, axis=1)
            metric = f1_score(all_y, preds, average='macro')
            
        print(f"[{args.task}] Epoch {ep}: Time={t1-t0:.1f}s, Val Metric={metric:.4f}")
        
        torch.save({"model": model.state_dict(), "optimizer": optimizer.state_dict(), "epoch": ep}, last_pt)
        if metric > best_metric:
            best_metric = metric
            torch.save(model.state_dict(), best_pt)
            patience_cnt = 0
        else:
            patience_cnt += 1
            if patience_cnt >= patience:
                print(f"Early stopping at epoch {ep}")
                break
                
    # Mark done
    (ckpt_dir / "DONE").touch()
    print(f"Finished {args.task}.")

if __name__ == "__main__":
    main()
