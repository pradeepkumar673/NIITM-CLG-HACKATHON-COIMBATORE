import numpy as np
import pandas as pd
import torch
from pathlib import Path
from torch.utils.data import Dataset
import torchvision.transforms.functional as TF
import random

class Step10CacheDataset(Dataset):
    """Generic dataset reader for Step 10 numpy caches."""
    def __init__(self, manifest_path: Path, split: str, cache_dir: Path, prefix: str, label_map: dict[str, int], augment: bool = False) -> None:
        self.split = split
        self.augment = augment
        self.label_map = label_map
        
        df_full = pd.read_csv(manifest_path)
        self.df = df_full[df_full["split"] == split].reset_index(drop=True)
        
        # map labels to integers
        labels = self.df["label"].map(self.label_map).fillna(0).values.astype(np.int64)
        self.labels = labels
        
        npy_path = Path(cache_dir) / f"{prefix}_{split}.npy"
        idx_path = Path(cache_dir) / f"{prefix}_{split}_index.csv"
        
        if npy_path.exists() and idx_path.exists():
            self._cache = np.load(npy_path, mmap_mode="r")
            idx_df = pd.read_csv(idx_path)
            self._cache_map = dict(zip(idx_df["original_idx"], idx_df["cache_idx"]))
        else:
            self._cache = None
            self._cache_map = {}

    def __len__(self) -> int:
        return len(self.df)
    
    def __getitem__(self, idx: int) -> tuple[torch.Tensor, torch.Tensor]:
        row = self.df.iloc[idx]
        img_path = row["image_path"]
        
        if self._cache is not None and idx in self._cache_map:
            c_idx = self._cache_map[idx]
            arr = self._cache[c_idx].copy()
            img = torch.from_numpy(arr).float() / 255.0
            if img.ndim == 2:
                img = img.unsqueeze(0)
        else:
            # fallback
            from PIL import Image
            import torchvision.transforms as T
            try:
                img_pil = Image.open(img_path).convert("L")
                img = T.ToTensor()(img_pil)
                img = T.Resize((224, 224))(img)
            except Exception:
                img = torch.zeros((1, 224, 224))

        if self.augment:
            if random.random() > 0.5:
                img = TF.hflip(img)
            angle = random.uniform(-10, 10)
            img = TF.rotate(img, angle)
            
        label = torch.tensor(self.labels[idx], dtype=torch.long)
        return img, label
