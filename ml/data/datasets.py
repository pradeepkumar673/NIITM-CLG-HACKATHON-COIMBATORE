from pathlib import Path

import numpy as np
import pandas as pd
import torch
from PIL import Image
from torch.utils.data import DataLoader, Dataset


class CachedDataset(Dataset):
    def __init__(self, manifest_path, split, cache_dir, transform=None):
        self.manifest_path = Path(manifest_path)
        self.split = split
        self.transform = transform
        
        df = pd.read_csv(self.manifest_path)
        self.df = df[df["split"] == split].reset_index(drop=True)
        
        name = self.manifest_path.stem.replace("_manifest", "")
        self.cache_path = Path(cache_dir) / f"{name}_{split}.npy"
        idx_path = Path(cache_dir) / f"{name}_{split}_index.csv"
        
        self.use_cache = self.cache_path.exists() and idx_path.exists()
        
        if self.use_cache:
            self.data = np.load(self.cache_path, mmap_mode="r")
            idx_df = pd.read_csv(idx_path)
            # Map original df index to cache index
            # Wait, self.df has a new index 0...N-1. The cache was built by filtering and keeping original index?
            # In build_cache, we mapped iterrows() index (which was from the sub-df). So the original_idx is the index in the split df!
            # Let's map it.
            self.idx_map = dict(zip(idx_df["original_idx"], idx_df["cache_idx"]))
        
        # Build labels based on the dataset
        if name == "chest":
            import yaml
            labels = yaml.safe_load(open(self.manifest_path.parent.parent.parent / "config" / "chest_labels.yaml"))["labels"]
            self.labels = self.df[labels].values.astype(np.float32)
        elif name == "lung":
            self.labels = np.zeros(len(self.df)) # Lung has masks, not simple labels
        elif name == "tb":
            self.labels = (self.df["label"] == "tb").values.astype(np.float32)
        elif name == "fracture":
            self.labels = (self.df["label"] == "fractured").values.astype(np.float32)
        elif name == "knee":
            self.labels = (self.df["label"] == "osteoporosis").values.astype(np.float32)
        elif name == "gate":
            mapping = {"xray": 0, "mri": 1, "natural": 2}
            self.labels = self.df["label"].map(mapping).values.astype(np.int64)
            
    def __len__(self):
        return len(self.df)
        
    def __getitem__(self, idx):
        if self.use_cache and idx in self.idx_map:
            arr = self.data[self.idx_map[idx]]
            img = torch.from_numpy(arr).float() / 255.0
            img = img.unsqueeze(0) # [1, 224, 224]
        else:
            # Fallback
            try:
                img_pil = Image.open(self.df.iloc[idx]["image_path"]).convert("L")
                img_pil = img_pil.resize((224, 224))
                arr = np.array(img_pil)
                img = torch.from_numpy(arr).float() / 255.0
                img = img.unsqueeze(0)
            except:
                img = torch.zeros(1, 224, 224)
                
        label = self.labels[idx]
        
        if self.transform:
            img = self.transform(img)
            
        return img, label

if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parent.parent.parent
    cache_dir = base_dir / "data" / "cache"
    manifest_path = base_dir / "data" / "processed" / "fracture_manifest.csv"
    
    if manifest_path.exists() and cache_dir.exists():
        ds = CachedDataset(manifest_path, "train", cache_dir)
        if len(ds) > 0:
            dl = DataLoader(ds, batch_size=4, shuffle=True)
            batch = next(iter(dl))
            
            import time
            start = time.time()
            if torch.cuda.is_available():
                x = batch[0].cuda()
                y = batch[1].cuda()
                elapsed = time.time() - start
                print(f"Loaded batch to GPU in {elapsed:.4f}s")
                print(f"Shape: {x.shape}, Dtype: {x.dtype}")
