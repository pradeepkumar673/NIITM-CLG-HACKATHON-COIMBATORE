"""Train the gate classifier (xray vs mri vs natural)."""

import os
import sys
from pathlib import Path
import yaml
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset
import torchvision.models as models
from torchvision import transforms
from PIL import Image, ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent.parent

def _load_config() -> dict:
    with open(ROOT / "config/train_gate.yaml", "r") as f:
        return yaml.safe_load(f)

class GateDataset(Dataset):
    def __init__(self, manifest_path: Path, split: str, transform=None):
        df = pd.read_csv(manifest_path)
        self.df = df[df["split"] == split].reset_index(drop=True)
        self.transform = transform
        
        # 0: xray, 1: mri, 2: natural
        self.label_map = {"xray": 0, "mri": 1, "natural": 2}

    def __len__(self):
        return len(self.df)
        
    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        img_path = row["image_path"]
        label_str = row["label"]
        
        full_path = Path(img_path)
        if not full_path.is_absolute():
            full_path = ROOT / img_path
            
        img = Image.open(full_path).convert("RGB")
        if self.transform:
            img = self.transform(img)
            
        return img, self.label_map[label_str]

def main():
    if not (ROOT / "models/chest_densenet121/DONE").exists():
        print("WAITING FOR CHEST TRAINING")
        print("The GPU is currently busy training the main chest model.")
        print("Please wait for Step 5 to finish and then resume this script.")
        return

    cfg = _load_config()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    transform_train = transforms.Compose([
        transforms.Resize((cfg["data"]["image_size"], cfg["data"]["image_size"])),
        transforms.RandomHorizontalFlip(),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    transform_val = transforms.Compose([
        transforms.Resize((cfg["data"]["image_size"], cfg["data"]["image_size"])),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    manifest = ROOT / cfg["data"]["manifest"]
    train_ds = GateDataset(manifest, "train", transform=transform_train)
    val_ds = GateDataset(manifest, "val", transform=transform_val)
    test_ds = GateDataset(manifest, "test", transform=transform_val)
    
    nw = cfg["training"].get("num_workers", 0)
    train_loader = DataLoader(train_ds, batch_size=cfg["training"]["batch_size"], shuffle=True, num_workers=nw)
    val_loader = DataLoader(val_ds, batch_size=cfg["training"]["batch_size"], shuffle=False, num_workers=nw)
    test_loader = DataLoader(test_ds, batch_size=cfg["training"]["batch_size"], shuffle=False, num_workers=nw)
    
    # Model
    model = models.mobilenet_v3_small(pretrained=cfg["model"]["pretrained"])
    # Modify last layer for 3 classes
    model.classifier[3] = nn.Linear(model.classifier[3].in_features, cfg["model"]["num_classes"])
    model = model.to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.AdamW(
        model.parameters(), 
        lr=cfg["training"]["lr"], 
        weight_decay=cfg["training"]["weight_decay"]
    )
    
    ckpt_dir = ROOT / cfg["checkpoint"]["dir"]
    ckpt_dir.mkdir(parents=True, exist_ok=True)
    
    best_acc = 0.0
    for epoch in range(cfg["training"]["epochs"]):
        model.train()
        train_loss = 0.0
        for imgs, labels in train_loader:
            imgs, labels = imgs.to(device), labels.to(device)
            optimizer.zero_grad()
            out = model(imgs)
            loss = criterion(out, labels)
            loss.backward()
            optimizer.step()
            train_loss += loss.item()
            
        # Eval
        model.eval()
        correct = 0
        total = 0
        with torch.no_grad():
            for imgs, labels in val_loader:
                imgs, labels = imgs.to(device), labels.to(device)
                out = model(imgs)
                preds = out.argmax(dim=1)
                correct += (preds == labels).sum().item()
                total += labels.size(0)
                
        val_acc = correct / max(total, 1)
        print(f"Epoch {epoch}: Train Loss = {train_loss/len(train_loader):.4f}, Val Acc = {val_acc:.4f}")
        
        if val_acc > best_acc:
            best_acc = val_acc
            torch.save({"model_state_dict": model.state_dict()}, ckpt_dir / "best.pt")
            
    print(f"Training finished. Best val acc: {best_acc:.4f}")
    
    # Evaluate on test
    print("Evaluating on test set...")
    ckpt = torch.load(ckpt_dir / "best.pt", weights_only=False)
    model.load_state_dict(ckpt["model_state_dict"])
    model.eval()
    
    all_preds, all_labels = [], []
    with torch.no_grad():
        for imgs, labels in test_loader:
            out = model(imgs.to(device))
            all_preds.extend(out.argmax(dim=1).cpu().tolist())
            all_labels.extend(labels.tolist())
            
    from sklearn.metrics import classification_report, confusion_matrix
    target_names = ["xray", "mri", "natural"]
    print(classification_report(all_labels, all_preds, target_names=target_names))
    print("Confusion Matrix:")
    print(confusion_matrix(all_labels, all_preds))

if __name__ == "__main__":
    main()
