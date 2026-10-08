import pandas as pd
import matplotlib.pyplot as plt
from PIL import Image
from pathlib import Path
import os

def generate_grid(manifest_name, grid_name, label_col):
    base_dir = Path(__file__).resolve().parent.parent
    manifest_path = base_dir / "data" / "processed" / manifest_name
    out_path = base_dir / "docs" / grid_name
    
    if not manifest_path.exists():
        return
        
    df = pd.read_csv(manifest_path)
    # pick 8 real train images
    train_imgs = df[df["split"] == "train"].head(8)
    if train_imgs.empty:
        return
        
    fig, axes = plt.subplots(2, 4, figsize=(16, 8))
    for ax, (_, row) in zip(axes.flatten(), train_imgs.iterrows()):
        img_path = Path(row["image_path"])
        if img_path.exists():
            try:
                img = Image.open(img_path).convert("RGB")
                ax.imshow(img)
                title = str(row[label_col])
                ax.set_title(title, fontsize=10)
            except: pass
        ax.axis("off")
    
    plt.tight_layout()
    plt.savefig(out_path)
    print(f"Saved {grid_name}")

if __name__ == "__main__":
    generate_grid("fracture_manifest.csv", "fracture_grid.png", "label")
    generate_grid("knee_manifest.csv", "knee_grid.png", "label")
    generate_grid("gate_manifest.csv", "gate_grid.png", "label")
