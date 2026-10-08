"""
Train a region classifier on FracAtlas body_part labels using MobileNetV3 features.
"""
import os
import csv
import json
import torch
import numpy as np
from pathlib import Path
from PIL import Image, ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True
from sklearn.metrics import accuracy_score
from torch.utils.data import Dataset, DataLoader
import torch.nn as nn
import torch.optim as optim
import yaml
from scipy.stats import norm
import sys

# Add project root to python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app.services.inference.hf_models import get_gate_pretrained_model
from backend.app.services.calibration.core import fit_temperatures

class FracAtlasDataset(Dataset):
    def __init__(self, manifest_path, split, transform):
        self.transform = transform
        self.samples = []
        self.classes = ['hand', 'leg', 'hip', 'other']
        self.class_to_idx = {c: i for i, c in enumerate(self.classes)}
        
        with open(manifest_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row['split'] == split:
                    if Path(row['image_path']).exists():
                        self.samples.append({
                            'image_path': row['image_path'],
                            'label': self.class_to_idx[row['body_part']]
                        })

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        sample = self.samples[idx]
        img = Image.open(sample['image_path']).convert('RGB')
        tensor = self.transform(img)
        return tensor, sample['label']


def main():
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    # 1. Load feature extractor
    mobilenet, transform = get_gate_pretrained_model()
    mobilenet = mobilenet.to(device)
    mobilenet.eval()
    
    # The classifier in mobilenet_v3_small is a Sequential. The features output is 576-d
    # model.classifier[0] is Linear(576, 1024)
    feature_extractor = mobilenet.features
    pool = nn.AdaptiveAvgPool2d(1)
    
    def extract_features(loader):
        features = []
        labels = []
        with torch.no_grad():
            for x, y in loader:
                x = x.to(device)
                f = feature_extractor(x)
                f = pool(f).flatten(1)
                features.append(f.cpu())
                labels.append(y)
        return torch.cat(features), torch.cat(labels)

    # 2. Load data
    manifest_path = 'data/processed/fracture_manifest.csv'
    train_ds = FracAtlasDataset(manifest_path, 'train', transform)
    val_ds = FracAtlasDataset(manifest_path, 'val', transform)
    test_ds = FracAtlasDataset(manifest_path, 'test', transform)
    
    print(f"Train: {len(train_ds)}, Val: {len(val_ds)}, Test: {len(test_ds)}")
    
    train_loader = DataLoader(train_ds, batch_size=32, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=32, shuffle=False, num_workers=0)
    test_loader = DataLoader(test_ds, batch_size=32, shuffle=False, num_workers=0)
    
    print("Extracting features...")
    X_train, y_train = extract_features(train_loader)
    X_val, y_val = extract_features(val_loader)
    X_test, y_test = extract_features(test_loader)
    
    # 3. Train linear layer
    print("Training linear classifier...")
    in_features = X_train.shape[1] # 576
    num_classes = len(train_ds.classes)
    
    clf = nn.Linear(in_features, num_classes)
    optimizer = optim.Adam(clf.parameters(), lr=0.01)
    criterion = nn.CrossEntropyLoss()
    
    X_train_gpu = X_train.to(device)
    y_train_gpu = y_train.to(device)
    clf = clf.to(device)
    
    for epoch in range(50):
        optimizer.zero_grad()
        out = clf(X_train_gpu)
        loss = criterion(out, y_train_gpu)
        loss.backward()
        optimizer.step()
        
    clf.eval()
    
    # 4. Calibration using Step 7 machinery (fit_temperatures)
    # Note: fit_temperatures expects multi-label BCE shape, but we can do it for 1-hot or just fit a single temperature
    # Actually, cross_entropy is better for multiclass, let's use standard Platt scaling or just evaluate as is 
    # since we just need a calibrated probability. 
    # Let's fit one global temperature using NLL on validation set.
    with torch.no_grad():
        val_logits = clf(X_val.to(device))
        test_logits = clf(X_test.to(device))
    
    temp = nn.Parameter(torch.ones(1).to(device))
    opt_t = optim.LBFGS([temp], lr=0.01, max_iter=50)
    def eval_t():
        opt_t.zero_grad()
        loss = nn.CrossEntropyLoss()(val_logits / temp, y_val.to(device))
        loss.backward()
        return loss
    opt_t.step(eval_t)
    
    final_temp = temp.item()
    print(f"Fitted temperature: {final_temp:.4f}")
    
    # 5. Evaluate on Test
    with torch.no_grad():
        scaled_logits = test_logits / final_temp
        probs = torch.softmax(scaled_logits, dim=1)
        preds = torch.argmax(probs, dim=1)
        
    y_test_np = y_test.numpy()
    preds_np = preds.cpu().numpy()
    acc = accuracy_score(y_test_np, preds_np)
    
    # Bootstrap CI for accuracy
    n_bootstraps = 1000
    boot_accs = []
    for _ in range(n_bootstraps):
        indices = np.random.choice(len(y_test_np), len(y_test_np), replace=True)
        boot_accs.append(accuracy_score(y_test_np[indices], preds_np[indices]))
    
    ci_lower = np.percentile(boot_accs, 2.5)
    ci_upper = np.percentile(boot_accs, 97.5)
    
    print(f"Test Accuracy: {acc:.4f} (95% CI: {ci_lower:.4f} - {ci_upper:.4f})")
    
    # Save report
    report_path = Path('reports/region_accuracy.md')
    report_path.parent.mkdir(parents=True, exist_ok=True)
    with open(report_path, 'w') as f:
        f.write("# Region Classification Accuracy (Body Part)\n\n")
        f.write("Model: MobileNetV3-Small (ImageNet features) + Linear Probe\n")
        f.write("Dataset: FracAtlas TEST split (coarse body_part labels)\n\n")
        f.write(f"- **Overall Accuracy:** {acc:.1%} (95% CI: {ci_lower:.1%} - {ci_upper:.1%})\n\n")
        f.write("## Per-Region Accuracy (Recall)\n")
        
        for i, cls in enumerate(train_ds.classes):
            idx = (y_test_np == i)
            if idx.sum() > 0:
                cls_acc = accuracy_score(y_test_np[idx], preds_np[idx])
                f.write(f"- **{cls}**: {cls_acc:.1%} (n={idx.sum()})\n")
    
    # Save model and calibration
    model_dir = Path('models/region')
    model_dir.mkdir(parents=True, exist_ok=True)
    torch.save(clf.state_dict(), model_dir / 'classifier.pt')
    
    calib_data = {
        'temperature': final_temp,
        'classes': train_ds.classes,
        'test_accuracy': acc,
        'ci_95': [ci_lower, ci_upper]
    }
    with open(model_dir / 'calibration.json', 'w') as f:
        json.dump(calib_data, f, indent=2)
        
    print("Done! Artifacts saved.")

if __name__ == '__main__':
    main()
