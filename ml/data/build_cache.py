import multiprocessing as mp
import time
from pathlib import Path

import numpy as np
import pandas as pd
from PIL import Image


def process_row(args):
    idx, img_path_str, name, image_size = args
    path = Path(img_path_str)
    if not path.exists():
        return None
    try:
        img = Image.open(path).convert("L")
        if name == "chest":
            w, h = img.size
            scale = image_size / max(w, h)
            new_w = int(w * scale)
            new_h = int(h * scale)
            img = img.resize((new_w, new_h), Image.Resampling.BILINEAR)
            new_img = Image.new("L", (image_size, image_size), 0)
            new_img.paste(img, ((image_size - new_w) // 2, (image_size - new_h) // 2))
            arr = np.array(new_img)
        else:
            img = img.resize((image_size, image_size), Image.Resampling.BILINEAR)
            arr = np.array(img)
        return (idx, arr)
    except Exception:
        return None

def process_manifest(manifest_path, cache_dir, image_size=224):
    if not manifest_path.exists(): return
    df = pd.read_csv(manifest_path)
    if len(df) == 0: return
    cache_dir.mkdir(parents=True, exist_ok=True)
    name = manifest_path.stem.replace("_manifest", "")
    
    # Process train, val, test separately to make memmaps
    for split in ["train", "val", "test"]:
        sub = df[df["split"] == split].copy()
        if len(sub) == 0: continue
        
        args = [(i, row["image_path"], name, image_size) for i, row in sub.iterrows()]
        
        with mp.Pool(mp.cpu_count()) as pool:
            results = pool.map(process_row, args)
            
        valid_results = [r for r in results if r is not None]
        if not valid_results: continue
        
        memmap_path = cache_dir / f"{name}_{split}.npy"
        arrs = [r[1] for r in valid_results]
        final_arr = np.stack(arrs)
        
        np.save(memmap_path, final_arr)
        
        # Save index mapping
        indices = [r[0] for r in valid_results]
        idx_df = pd.DataFrame({"original_idx": indices, "cache_idx": range(len(indices))})
        idx_df.to_csv(cache_dir / f"{name}_{split}_index.csv", index=False)
        print(f"Cached {len(valid_results)} images for {name} {split} into {memmap_path.name}")

def speed_test(manifest_path, cache_dir):
    if not manifest_path.exists(): return
    df = pd.read_csv(manifest_path)
    train_sub = df[df["split"] == "train"]
    if len(train_sub) < 500: return
    
    sample = train_sub.sample(500, random_state=42)
    name = manifest_path.stem.replace("_manifest", "")
    
    # Time PNG reads
    start = time.time()
    for _, row in sample.iterrows():
        try:
            img = Image.open(row["image_path"]).convert("L")
            img = img.resize((224, 224))
            arr = np.array(img)
        except: pass
    png_time = time.time() - start
    
    # Time Cache reads
    cache_path = cache_dir / f"{name}_train.npy"
    if not cache_path.exists(): return
    cache_data = np.load(cache_path, mmap_mode="r")
    idx_df = pd.read_csv(cache_dir / f"{name}_train_index.csv")
    idx_map = dict(zip(idx_df["original_idx"], idx_df["cache_idx"]))
    
    start = time.time()
    for idx in sample.index:
        if idx in idx_map:
            arr = cache_data[idx_map[idx]]
    cache_time = time.time() - start
    
    print(f"\nSpeed test ({name}, 500 images):")
    print(f"PNG + Resize: {png_time:.3f}s")
    print(f"Cache (mmap): {cache_time:.3f}s")
    print(f"Speedup: {png_time / max(cache_time, 0.0001):.1f}x")

def main():
    base_dir = Path(__file__).resolve().parent.parent.parent
    processed_dir = base_dir / "data" / "processed"
    cache_dir = base_dir / "data" / "cache"
    
    manifests = [
        "lung_manifest.csv",
        "tb_manifest.csv",
        "fracture_manifest.csv",
        "knee_manifest.csv",
        "gate_manifest.csv"
        # Skip chest full cache for now if memory is tight, or just cache it (it will take ~14k * 224 * 224 = ~700MB)
    ]
    
    for m in manifests:
        process_manifest(processed_dir / m, cache_dir)
        
    for m in manifests:
        speed_test(processed_dir / m, cache_dir)

if __name__ == "__main__":
    # Ensure torch is installed for the verification step in instructions
    main()
