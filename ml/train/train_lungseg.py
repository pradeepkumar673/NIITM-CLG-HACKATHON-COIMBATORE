import datetime
import hashlib
import json
import random
import subprocess
from pathlib import Path

import numpy as np
import pandas as pd
import segmentation_models_pytorch as smp
import torch
import torchvision.transforms.functional as TF
import yaml
from PIL import Image
from torch import nn
from torch.utils.data import DataLoader, Dataset

ROOT = Path(__file__).resolve().parent.parent.parent

class LungSegDataset(Dataset):
    def __init__(self, manifest_path: Path, split: str, image_size: int, augment: bool = False, aug_cfg=None):
        df = pd.read_csv(manifest_path)
        self.df = df[df["split"] == split].reset_index(drop=True)
        self.image_size = image_size
        self.augment = augment
        self.aug_cfg = aug_cfg or {}
        
    def __len__(self):
        return len(self.df)
        
    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        img_path = ROOT / row["image_path"] if not Path(row["image_path"]).is_absolute() else Path(row["image_path"])
        mask_path = ROOT / row["mask_path"] if not Path(row["mask_path"]).is_absolute() else Path(row["mask_path"])
        
        img = Image.open(img_path).convert('L').resize((self.image_size, self.image_size))
        mask = Image.open(mask_path).convert('L').resize((self.image_size, self.image_size))
        
        img_t = TF.to_tensor(img)  # 1xHxW
        mask_t = TF.to_tensor(mask) # 1xHxW
        
        if self.augment:
            # Rotate
            angle = random.uniform(-self.aug_cfg.get("rotate_deg", 10), self.aug_cfg.get("rotate_deg", 10))
            # Scale
            scale = random.uniform(1.0, self.aug_cfg.get("scale_factor", 1.1))
            
            # Apply same spatial aug to both
            img_t = TF.affine(img_t, angle=angle, translate=[0, 0], scale=scale, shear=0)
            mask_t = TF.affine(mask_t, angle=angle, translate=[0, 0], scale=scale, shear=0)
            
            # Intensity aug only to image
            contrast = 1.0 + random.uniform(-self.aug_cfg.get("intensity_jitter", 0.1), self.aug_cfg.get("intensity_jitter", 0.1))
            img_t = TF.adjust_contrast(img_t, contrast)
            
        mask_t = (mask_t > 0.5).float()
        return img_t, mask_t, row["source"]

class DiceBCELoss(nn.Module):
    def __init__(self):
        super().__init__()
        self.bce = nn.BCEWithLogitsLoss()
        
    def forward(self, logits, targets):
        bce_loss = self.bce(logits, targets)
        
        probs = torch.sigmoid(logits)
        smooth = 1e-6
        intersection = (probs * targets).sum(dim=(2,3))
        union = probs.sum(dim=(2,3)) + targets.sum(dim=(2,3))
        dice_score = (2. * intersection + smooth) / (union + smooth)
        dice_loss = 1.0 - dice_score.mean()
        
        return bce_loss + dice_loss
        
def compute_metrics(preds, targets):
    # binary tensors
    intersection = (preds * targets).sum().item()
    union = preds.sum().item() + targets.sum().item()
    iou_union = (preds | targets).sum().item()
    
    dice = (2. * intersection + 1e-6) / (union + 1e-6)
    iou = (intersection + 1e-6) / (iou_union + 1e-6)
    return dice, iou

def bootstrap_ci(metrics_list, n_boot=1000, alpha=0.05):
    scores = np.array(metrics_list)
    boot_means = []
    for _ in range(n_boot):
        sample = np.random.choice(scores, size=len(scores), replace=True)
        boot_means.append(sample.mean())
    boot_means.sort()
    lower = np.percentile(boot_means, alpha / 2 * 100)
    upper = np.percentile(boot_means, (1 - alpha / 2) * 100)
    return float(scores.mean()), float(lower), float(upper)

def main():
    if (ROOT / "models/chest_densenet121/DONE").exists():
        print("Waiting for GPU: models/chest_densenet121/DONE exists")
        return
        
    with open(ROOT / "config/train_lungseg.yaml", "r") as f:
        cfg = yaml.safe_load(f)
        
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # Model
    model = smp.Unet(
        encoder_name=cfg["model"]["encoder_name"],
        encoder_weights=cfg["model"]["encoder_weights"],
        in_channels=cfg["model"]["in_channels"],
        classes=cfg["model"]["classes"],
    )
    model = model.to(device)
    
    # Data
    manifest = ROOT / cfg["data"]["manifest"]
    img_size = cfg["data"]["image_size"]
    
    train_ds = LungSegDataset(manifest, "train", img_size, augment=True, aug_cfg=cfg["data"])
    val_ds = LungSegDataset(manifest, "val", img_size, augment=False)
    test_ds = LungSegDataset(manifest, "test", img_size, augment=False)
    
    nw = cfg["training"]["num_workers"]
    bs = cfg["training"]["batch_size"]
    
    train_loader = DataLoader(train_ds, batch_size=bs, shuffle=True, num_workers=nw)
    val_loader = DataLoader(val_ds, batch_size=bs, shuffle=False, num_workers=nw)
    test_loader = DataLoader(test_ds, batch_size=bs, shuffle=False, num_workers=nw)
    
    criterion = DiceBCELoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=cfg["training"]["lr"], weight_decay=cfg["training"]["weight_decay"])
    
    ckpt_dir = ROOT / cfg["checkpoint"]["dir"]
    ckpt_dir.mkdir(parents=True, exist_ok=True)
    
    best_val_dice = 0.0
    patience = cfg["training"]["patience"]
    patience_ctr = 0
    
    print("Starting training...")
    for epoch in range(cfg["training"]["epochs"]):
        model.train()
        train_loss = 0.0
        for imgs, masks, _ in train_loader:
            imgs, masks = imgs.to(device), masks.to(device)
            optimizer.zero_grad()
            logits = model(imgs)
            loss = criterion(logits, masks)
            loss.backward()
            optimizer.step()
            train_loss += loss.item()
            
        model.eval()
        val_loss = 0.0
        val_dices = []
        with torch.no_grad():
            for imgs, masks, _ in val_loader:
                imgs, masks = imgs.to(device), masks.to(device)
                logits = model(imgs)
                val_loss += criterion(logits, masks).item()
                preds = (torch.sigmoid(logits) > 0.5).int()
                masks_int = masks.int()
                for p, t in zip(preds, masks_int):
                    d, _ = compute_metrics(p, t)
                    val_dices.append(d)
                    
        mean_val_dice = np.mean(val_dices)
        print(f"Epoch {epoch}: Train Loss {train_loss/len(train_loader):.4f}, Val Loss {val_loss/len(val_loader):.4f}, Val Dice {mean_val_dice:.4f}")
        
        if mean_val_dice > best_val_dice:
            best_val_dice = mean_val_dice
            torch.save({"model_state_dict": model.state_dict()}, ckpt_dir / "best.pt")
            patience_ctr = 0
        else:
            patience_ctr += 1
            if patience_ctr >= patience:
                print("Early stopping triggered")
                break
                
    # Evaluate on TEST
    print("\nEvaluating on TEST set...")
    ckpt = torch.load(ckpt_dir / "best.pt", map_location=device, weights_only=False)
    model.load_state_dict(ckpt["model_state_dict"])
    model.eval()
    
    results_mont = {"dice": [], "iou": []}
    results_shen = {"dice": [], "iou": []}
    
    with torch.no_grad():
        for imgs, masks, dsets in test_loader:
            imgs, masks = imgs.to(device), masks.to(device)
            logits = model(imgs)
            preds = (torch.sigmoid(logits) > 0.5).int()
            masks_int = masks.int()
            
            for p, t, ds_name in zip(preds, masks_int, dsets):
                d, iou = compute_metrics(p, t)
                if "montgomery" in ds_name.lower():
                    results_mont["dice"].append(d)
                    results_mont["iou"].append(iou)
                else:
                    results_shen["dice"].append(d)
                    results_shen["iou"].append(iou)
                    
    md_content = "# Lung Segmentation Metrics\n\n"
    
    mean_dice = 0.0
    for name, res in [("Montgomery", results_mont), ("Shenzhen", results_shen)]:
        if len(res["dice"]) == 0:
            continue
        d_mean, d_l, d_u = bootstrap_ci(res["dice"])
        i_mean, i_l, i_u = bootstrap_ci(res["iou"])
        mean_dice += d_mean
        
        md_content += f"## {name}\n"
        md_content += f"- **Dice**: {d_mean:.4f} [95% CI: {d_l:.4f} - {d_u:.4f}]\n"
        md_content += f"- **IoU**: {i_mean:.4f} [95% CI: {i_l:.4f} - {i_u:.4f}]\n\n"
        
    mean_dice /= max(1, len([r for r in [results_mont, results_shen] if len(r["dice"]) > 0]))
        
    reports_dir = ROOT / "reports"
    reports_dir.mkdir(exist_ok=True)
    with open(reports_dir / "lungseg_metrics.md", "w") as f:
        f.write(md_content)
        
    # Registration
    sha256 = hashlib.sha256((ckpt_dir / "best.pt").read_bytes()).hexdigest()
    try:
        git_commit = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=str(ROOT)).decode("utf-8").strip()
    except Exception:
        git_commit = "unknown"
    config_hash = hashlib.sha256(open(ROOT / "config/train_lungseg.yaml", "rb").read()).hexdigest()
    
    reg_path = ROOT / "models/registry.json"
    registry = {}
    if reg_path.exists():
        registry = json.load(open(reg_path))
        
    registry["lungseg_unet"] = {
        "name": "lungseg_unet",
        "path": "models/lungseg_unet/best.pt",
        "sha256": sha256,
        "git_commit": git_commit,
        "config_hash": config_hash,
        "metrics_file": "reports/lungseg_metrics.md",
        "training_date": datetime.datetime.now().isoformat(),
        "mean_test_dice": float(mean_dice)
    }
    
    with open(reg_path, "w") as f:
        json.dump(registry, f, indent=2)
        
    print("Registration complete.")
    
if __name__ == "__main__":
    main()
