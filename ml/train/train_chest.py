"""Chest DenseNet121 training pipeline.

Usage:
    python ml/train/train_chest.py                       # full training
    python ml/train/train_chest.py --resume               # resume from last.pt
    python ml/train/train_chest.py --overfit-test          # 200 steps on 64 images
    python ml/train/train_chest.py --smoke-test            # 1 epoch on 10% data

All hyperparams come from config/train_chest.yaml (R3).
"""
from __future__ import annotations

import argparse
import math
import sys
import time
from pathlib import Path

import numpy as np
import torch
import yaml
from sklearn.metrics import roc_auc_score
from torch import nn
from torch.utils.data import DataLoader, Subset

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

from ml.train.chest_dataset import ChestCacheDataset
from ml.train.model import ChestDenseNet121

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _load_config() -> dict:
    cfg_path = ROOT / "config" / "train_chest.yaml"
    with cfg_path.open(encoding="utf-8") as f:
        return yaml.safe_load(f)


def _setup_logger(log_file: Path):
    """Simple print-to-file + stdout logger."""
    import logging

    log_file.parent.mkdir(parents=True, exist_ok=True)
    logger = logging.getLogger("chest_train")
    logger.setLevel(logging.INFO)
    logger.handlers.clear()

    fmt = logging.Formatter("%(asctime)s | %(message)s", datefmt="%Y-%m-%d %H:%M:%S")
    fh = logging.FileHandler(log_file, mode="a", encoding="utf-8")
    fh.setFormatter(fmt)
    logger.addHandler(fh)

    sh = logging.StreamHandler(sys.stdout)
    sh.setFormatter(fmt)
    logger.addHandler(sh)
    return logger


def _make_loaders(
    cfg: dict,
    *,
    subset_frac: float = 1.0,
    tiny_n: int | None = None,
) -> tuple[DataLoader, DataLoader]:
    data_cfg = cfg["data"]
    train_cfg = cfg["training"]
    manifest = ROOT / data_cfg["manifest"]
    cache_dir = ROOT / data_cfg["cache_dir"]

    aug_cfg = {
        "rotate_deg": data_cfg.get("rotate_deg", 10),
        "brightness": data_cfg.get("brightness", 0.2),
        "contrast": data_cfg.get("contrast", 0.2),
        "translation": data_cfg.get("translation", 0.05),
    }

    train_ds = ChestCacheDataset(manifest, "train", cache_dir, augment=True, augment_cfg=aug_cfg)
    val_ds = ChestCacheDataset(manifest, "val", cache_dir, augment=False)

    if tiny_n is not None:
        indices = list(range(min(tiny_n, len(train_ds))))
        train_ds = Subset(train_ds, indices)
        val_ds = Subset(val_ds, list(range(min(tiny_n, len(val_ds)))))
    elif subset_frac < 1.0:
        n_train = max(1, int(len(train_ds) * subset_frac))
        n_val = max(1, int(len(val_ds) * subset_frac))
        train_ds = Subset(train_ds, list(range(n_train)))
        val_ds = Subset(val_ds, list(range(n_val)))

    bs = train_cfg["batch_size"]
    nw = train_cfg["num_workers"]
    # On Windows, small Subset wraps can cause multiprocessing pickle errors
    if tiny_n is not None or subset_frac < 1.0:
        nw = 0
    pw = nw > 0 and train_cfg.get("persistent_workers", True)

    common = dict(pin_memory=train_cfg.get("pin_memory", True) and nw > 0, num_workers=nw, persistent_workers=pw)
    train_loader = DataLoader(train_ds, batch_size=bs, shuffle=True, drop_last=True, **common)
    val_loader = DataLoader(val_ds, batch_size=bs, shuffle=False, **common)
    return train_loader, val_loader


def _compute_val_auroc(
    model: nn.Module, val_loader: DataLoader, device: torch.device, amp_dtype: torch.dtype
) -> float:
    model.eval()
    all_preds: list[np.ndarray] = []
    all_labels: list[np.ndarray] = []

    with torch.no_grad():
        for imgs, labels in val_loader:
            imgs = imgs.to(device, non_blocking=True)
            if imgs.shape[1] == 1:
                imgs = imgs.expand(-1, 3, -1, -1)
            with torch.autocast("cuda", dtype=amp_dtype):
                logits = model(imgs)
            probs = torch.sigmoid(logits).float().cpu().numpy()
            all_preds.append(probs)
            all_labels.append(labels.numpy())

    preds = np.concatenate(all_preds, axis=0)
    labels = np.concatenate(all_labels, axis=0)

    # Per-label AUROC, skip labels with only one class in val
    aurocs = []
    for i in range(labels.shape[1]):
        if labels[:, i].sum() == 0 or labels[:, i].sum() == len(labels):
            continue
        aurocs.append(roc_auc_score(labels[:, i], preds[:, i]))
    return float(np.mean(aurocs)) if aurocs else 0.0


# ---------------------------------------------------------------------------
# Training loop
# ---------------------------------------------------------------------------

def train(cfg: dict, *, resume: bool = False, overfit_test: bool = False, smoke_test: bool = False) -> None:
    train_cfg = cfg["training"]
    ckpt_cfg = cfg["checkpoint"]
    log_cfg = cfg["logging"]
    model_cfg = cfg["model"]

    log = _setup_logger(ROOT / log_cfg["log_file"])
    log.info("=" * 60)
    log.info(f"Chest training — overfit={overfit_test}, smoke={smoke_test}, resume={resume}")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    amp_dtype_str = train_cfg.get("amp_dtype", "bfloat16")
    amp_dtype = torch.bfloat16 if amp_dtype_str == "bfloat16" else torch.float16
    use_scaler = amp_dtype == torch.float16  # GradScaler only needed for fp16

    # Data
    if overfit_test:
        train_loader, val_loader = _make_loaders(cfg, tiny_n=64)
    elif smoke_test:
        train_loader, val_loader = _make_loaders(cfg, subset_frac=0.1)
    else:
        train_loader, val_loader = _make_loaders(cfg)

    log.info(f"Train batches: {len(train_loader)}, Val batches: {len(val_loader)}")
    log.info(f"Device: {device}, AMP: {amp_dtype_str}, Scaler: {use_scaler}")

    # Model
    model = ChestDenseNet121(
        num_labels=model_cfg["num_labels"],
        dropout_p=model_cfg["dropout_p"],
        pretrained=model_cfg["pretrained"],
    )
    if train_cfg.get("channels_last", False):
        model = model.to(memory_format=torch.channels_last)
    model = model.to(device)

    # Loss with pos_weight
    manifest_path = ROOT / cfg["data"]["manifest"]
    pos_weight = ChestCacheDataset.compute_pos_weights(manifest_path).to(device)
    log.info(f"pos_weight: {pos_weight.cpu().tolist()}")
    criterion = nn.BCEWithLogitsLoss(pos_weight=pos_weight)

    # Optimizer
    optimizer = torch.optim.AdamW(
        model.parameters(),
        lr=train_cfg["lr"],
        weight_decay=train_cfg["weight_decay"],
    )

    # Scheduler — cosine with warmup
    epochs = 100 if overfit_test else (1 if smoke_test else train_cfg["epochs"])
    warmup_epochs = 0 if overfit_test else train_cfg.get("warmup_epochs", 1)
    total_steps = len(train_loader) * epochs
    warmup_steps = len(train_loader) * warmup_epochs

    def lr_lambda(step: int) -> float:
        if step < warmup_steps:
            return max(step / max(warmup_steps, 1), 0.01)
        progress = (step - warmup_steps) / max(total_steps - warmup_steps, 1)
        return 0.5 * (1.0 + math.cos(math.pi * progress))

    scheduler = torch.optim.lr_scheduler.LambdaLR(optimizer, lr_lambda)
    scaler = torch.amp.GradScaler("cuda", enabled=use_scaler)

    # Checkpoint resume
    ckpt_dir = ROOT / ckpt_cfg["dir"]
    ckpt_dir.mkdir(parents=True, exist_ok=True)
    start_epoch = 0
    best_auroc = 0.0

    if resume:
        last_ckpt = ckpt_dir / "last.pt"
        if last_ckpt.exists():
            ckpt = torch.load(last_ckpt, map_location=device, weights_only=False)
            model.load_state_dict(ckpt["model_state_dict"])
            optimizer.load_state_dict(ckpt["optimizer_state_dict"])
            scheduler.load_state_dict(ckpt["scheduler_state_dict"])
            start_epoch = ckpt["epoch"] + 1
            best_auroc = ckpt.get("best_auroc", 0.0)
            log.info(f"Resumed from epoch {start_epoch}, best_auroc={best_auroc:.4f}")
        else:
            log.info("No last.pt found, starting fresh.")

    # Training
    grad_accum = train_cfg.get("grad_accum_steps", 1)
    log_interval = log_cfg.get("log_interval_steps", 50)
    patience = train_cfg.get("early_stopping_patience", 5)
    clip_norm = train_cfg.get("clip_grad_norm", 1.0)
    patience_counter = 0

    for epoch in range(start_epoch, start_epoch + epochs):
        model.train()
        epoch_loss = 0.0
        step_count = 0
        t0 = time.time()

        optimizer.zero_grad(set_to_none=True)
        for batch_idx, (imgs, labels) in enumerate(train_loader):
            global_step = epoch * len(train_loader) + batch_idx
            imgs = imgs.to(device, non_blocking=True)
            labels = labels.to(device, non_blocking=True)

            if imgs.shape[1] == 1:
                imgs = imgs.expand(-1, 3, -1, -1)
            if train_cfg.get("channels_last", False):
                imgs = imgs.to(memory_format=torch.channels_last)

            with torch.autocast("cuda", dtype=amp_dtype):
                logits = model(imgs)
                loss = criterion(logits, labels) / grad_accum

            scaler.scale(loss).backward()

            if (batch_idx + 1) % grad_accum == 0:
                scaler.unscale_(optimizer)
                nn.utils.clip_grad_norm_(model.parameters(), clip_norm)
                scaler.step(optimizer)
                scaler.update()
                optimizer.zero_grad(set_to_none=True)
                scheduler.step()

            epoch_loss += loss.item() * grad_accum
            step_count += 1

            if overfit_test and (batch_idx + 1) % 10 == 0:
                log.info(f"  overfit step {batch_idx+1}: loss={loss.item() * grad_accum:.6f}")
            elif (batch_idx + 1) % log_interval == 0:
                avg = epoch_loss / step_count
                lr_now = optimizer.param_groups[0]["lr"]
                log.info(f"  epoch {epoch} step {batch_idx+1}/{len(train_loader)}: "
                         f"loss={avg:.4f} lr={lr_now:.2e}")

            # For overfit test, stop after 200 steps
            if overfit_test and batch_idx >= 199:
                break

        epoch_time = time.time() - t0
        avg_loss = epoch_loss / max(step_count, 1)

        # VRAM reporting
        if torch.cuda.is_available():
            peak_mb = torch.cuda.max_memory_allocated() // (1024 * 1024)
        else:
            peak_mb = 0

        # Validation
        val_auroc = _compute_val_auroc(model, val_loader, device, amp_dtype)
        log.info(
            f"Epoch {epoch}: loss={avg_loss:.4f}, val_auroc={val_auroc:.4f}, "
            f"time={epoch_time:.1f}s, peak_vram={peak_mb}MB"
        )

        # Checkpointing
        ckpt_state = {
            "epoch": epoch,
            "model_state_dict": model.state_dict(),
            "optimizer_state_dict": optimizer.state_dict(),
            "scheduler_state_dict": scheduler.state_dict(),
            "best_auroc": max(best_auroc, val_auroc),
            "val_auroc": val_auroc,
            "train_loss": avg_loss,
        }

        # Save last (rolling)
        torch.save(ckpt_state, ckpt_dir / "last.pt")

        # Save best
        if val_auroc > best_auroc:
            best_auroc = val_auroc
            torch.save(ckpt_state, ckpt_dir / "best.pt")
            log.info(f"  New best val_auroc={best_auroc:.4f} saved.")
            patience_counter = 0
        else:
            patience_counter += 1
            log.info(f"  No improvement ({patience_counter}/{patience})")

        if not overfit_test and not smoke_test and patience_counter >= patience:
            log.info(f"Early stopping at epoch {epoch}")
            break

        if smoke_test:
            break  # only 1 "epoch" for these modes

    log.info("Training complete.")
    if not overfit_test and not smoke_test:
        # Write DONE marker
        (ckpt_dir / "DONE").write_text("")
        log.info(f"Best val AUROC: {best_auroc:.4f}")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description="Train chest DenseNet121")
    parser.add_argument("--resume", action="store_true", help="Resume from last.pt")
    parser.add_argument("--overfit-test", action="store_true", help="Overfit on 64 images")
    parser.add_argument("--smoke-test", action="store_true", help="1 epoch on 10%% data")
    args = parser.parse_args()

    cfg = _load_config()
    train(cfg, resume=args.resume, overfit_test=args.overfit_test, smoke_test=args.smoke_test)


if __name__ == "__main__":
    main()
