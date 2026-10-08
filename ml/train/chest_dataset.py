"""Chest X-ray dataset reading from numpy cache (Step 3)."""
from __future__ import annotations

import numpy as np
import pandas as pd
import torch
from pathlib import Path
from torch.utils.data import Dataset
import torchvision.transforms.functional as TF
import random
import math


class ChestCacheDataset(Dataset):
    """Reads pre-cached 224x224 uint8 grayscale arrays from data/cache/."""

    LABELS = [
        "Atelectasis", "Cardiomegaly", "Effusion", "Infiltration",
        "Mass", "Nodule", "Pneumonia", "Pneumothorax", "Consolidation",
        "Edema", "Emphysema", "Fibrosis", "Pleural_Thickening", "Hernia",
    ]

    def __init__(
        self,
        manifest_path: Path,
        split: str,
        cache_dir: Path,
        augment: bool = False,
        augment_cfg: dict | None = None,
    ) -> None:
        self.split = split
        self.augment = augment
        self.aug_cfg = augment_cfg or {}

        df_full = pd.read_csv(manifest_path)
        df = df_full[df_full["split"] == split].reset_index(drop=True)
        self.df = df

        # Labels
        self.labels = df[self.LABELS].values.astype(np.float32)  # N x 14

        # Cache
        npy_path = Path(cache_dir) / f"chest_{split}.npy"
        idx_path = Path(cache_dir) / f"chest_{split}_index.csv"

        if npy_path.exists() and idx_path.exists():
            self._cache = np.load(npy_path, mmap_mode="r")
            idx_df = pd.read_csv(idx_path)
            # Map cache_idx -> position in cache array
            self._cache_map: dict[int, int] = dict(
                zip(idx_df["original_idx"], idx_df["cache_idx"])
            )
            self._use_cache = True
        else:
            self._use_cache = False

    def __len__(self) -> int:
        return len(self.df)

    def __getitem__(self, idx: int) -> tuple[torch.Tensor, torch.Tensor]:
        if self._use_cache and idx in self._cache_map:
            arr = self._cache[self._cache_map[idx]].copy()  # uint8 H x W
            img = torch.from_numpy(arr).float().div_(255.0).unsqueeze(0)  # 1xHxW
        else:
            from PIL import Image
            img_path = self.df.iloc[idx]["image_path"]
            pil = Image.open(img_path).convert("L").resize((224, 224))
            img = torch.from_numpy(np.array(pil)).float().div_(255.0).unsqueeze(0)

        if self.augment:
            img = self._augment(img)

        label = torch.from_numpy(self.labels[idx])
        return img, label

    def _augment(self, img: torch.Tensor) -> torch.Tensor:
        rotate_deg = self.aug_cfg.get("rotate_deg", 10)
        brightness = self.aug_cfg.get("brightness", 0.2)
        contrast = self.aug_cfg.get("contrast", 0.2)
        translation = self.aug_cfg.get("translation", 0.05)

        # Random rotation (no horizontal flip for chest — heart side matters)
        angle = random.uniform(-rotate_deg, rotate_deg)
        img = TF.rotate(img, angle)

        # Brightness / contrast jitter
        factor_b = 1.0 + random.uniform(-brightness, brightness)
        factor_c = 1.0 + random.uniform(-contrast, contrast)
        img = TF.adjust_brightness(img, factor_b)
        img = TF.adjust_contrast(img, factor_c)

        # Small translation (affine shift)
        max_px = int(translation * 224)
        dx = random.randint(-max_px, max_px)
        dy = random.randint(-max_px, max_px)
        img = TF.affine(img, angle=0, translate=[dx, dy], scale=1.0, shear=0)

        return img

    @classmethod
    def compute_pos_weights(cls, manifest_path: Path) -> torch.Tensor:
        """Compute per-label pos_weight from the training split prevalence."""
        df = pd.read_csv(manifest_path)
        train = df[df["split"] == "train"]
        pos = train[cls.LABELS].sum(axis=0).values.astype(np.float32)
        neg = len(train) - pos
        # pos_weight = neg / pos, clamped to [1, 100]
        pw = np.clip(neg / np.maximum(pos, 1), 1.0, 100.0)
        return torch.tensor(pw, dtype=torch.float32)
