"""Step 9: Explainability Evaluation and Verification."""
import json
import sys
from pathlib import Path

import cv2
import numpy as np
import pandas as pd
import torch
import torchvision.transforms.functional as TF
import yaml
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

from backend.app.services.calibration.core import analyse_image
from backend.app.services.explain.cam import (
    generate_gradcam,
    generate_spatial_uncertainty,
)
from backend.app.services.explain.rationale import generate_rationale
from backend.app.services.lungseg.lungseg import (
    get_lung_zones,
    lookup_zone,
    post_process_lungs,
    segment_lungs,
)
from ml.train.model import ChestDenseNet121


def get_peak_zone(heatmap: np.ndarray, zone_masks: dict) -> str:
    y_max, x_max = np.unravel_index(heatmap.argmax(), heatmap.shape)
    return lookup_zone(zone_masks, x_max, y_max)

def deletion_test(model, img_tensor, heatmap, k_vals, temps, target_idx, seed=42):
    np.random.seed(seed)
    h, w = heatmap.shape
    total_pixels = h * w
    
    # baseline prob
    with torch.no_grad():
        logits = model(img_tensor)
        base_prob = float(torch.sigmoid(logits[0, target_idx] / temps[target_idx]))
        
    flat_heat = heatmap.flatten()
    sorted_idx = np.argsort(flat_heat)[::-1]
    
    drops_salient = []
    drops_random = []
    
    for k in k_vals:
        n_mask = int(k * total_pixels)
        
        # salient
        salient_mask_idx = sorted_idx[:n_mask].copy()
        salient_img = img_tensor.clone()
        # image is 1x3xHxW. flatten spatial dims
        salient_img = salient_img.reshape(1, 3, -1)
        salient_img[:, :, salient_mask_idx] = 0.0
        salient_img = salient_img.reshape(1, 3, h, w)
        
        with torch.no_grad():
            s_logits = model(salient_img)
            s_prob = float(torch.sigmoid(s_logits[0, target_idx] / temps[target_idx]))
        drops_salient.append(base_prob - s_prob)
        
        # random
        rand_mask_idx = np.random.choice(total_pixels, n_mask, replace=False)
        rand_img = img_tensor.clone()
        rand_img = rand_img.reshape(1, 3, -1)
        rand_img[:, :, rand_mask_idx] = 0.0
        rand_img = rand_img.reshape(1, 3, h, w)
        
        with torch.no_grad():
            r_logits = model(rand_img)
            r_prob = float(torch.sigmoid(r_logits[0, target_idx] / temps[target_idx]))
        drops_random.append(base_prob - r_prob)
        
    return drops_salient, drops_random

def main():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # Load configs
    train_cfg = yaml.safe_load(open(ROOT / "config/train_chest.yaml"))
    explain_cfg = yaml.safe_load(open(ROOT / "config/explain.yaml"))
    unc_cfg = yaml.safe_load(open(ROOT / "config/uncertainty.yaml"))
    labels_list = yaml.safe_load(open(ROOT / "config/chest_labels.yaml"))["labels"]
    forbidden = yaml.safe_load(open(ROOT / "config/forbidden_phrases.yaml"))["phrases"]
    
    calib_path = ROOT / "models/chest_densenet121/calibration.json"
    with open(calib_path, "r") as f:
        calibration_data = json.load(f)
        
    temps = torch.tensor(calibration_data["temperatures"], device=device)
        
    # Load model
    model = ChestDenseNet121(num_labels=train_cfg["model"]["num_labels"], dropout_p=train_cfg["model"]["dropout_p"])
    ckpt_path = ROOT / train_cfg["checkpoint"]["dir"] / "best.pt"
    ckpt = torch.load(ckpt_path, map_location=device, weights_only=False)
    model.load_state_dict(ckpt["model_state_dict"])
    model.to(device)
    model.eval()
    
    # Target layer for DenseNet
    target_layer = model.features[-1]
    
    # Load manifest and bboxes
    manifest = pd.read_csv(ROOT / "data/processed/chest_manifest.csv")
    test_df = manifest[manifest["split"] == "test"].copy()
    test_df["image_id"] = test_df["image_path"].apply(lambda x: Path(x).name)
    bbox_df = pd.read_csv(ROOT / "data/raw/nih_chestxray14/BBox_List_2017.csv")
    
    # Normalize bbox names
    bbox_df.rename(columns={"Image Index": "image_id", "Finding Label": "label"}, inplace=True)
    
    # Validation against real boxes
    print("Running BBox Validation...")
    results = {l: {"hits": 0, "total": 0, "ious": []} for l in labels_list}
    
    iou_thresh = explain_cfg["iou_threshold"]
    
    for _, row in bbox_df.iterrows():
        img_id = row["image_id"]
        label = row["label"]
        if label not in labels_list:
            continue
            
        m_row = test_df[test_df["image_id"] == img_id]
        if m_row.empty:
            continue
            
        img_path = ROOT / m_row.iloc[0]["image_path"]
        if not img_path.exists():
            continue
            
        img = Image.open(img_path).convert('RGB').resize((224, 224))
        img_np = np.array(img).astype(np.float32) / 255.0
        
        # get original dimensions from bbox to scale box to 224x224
        # bbox format: x, y, w, h
        ox, oy, ow, oh = row["Bbox [x"], row["y"], row["w"], row["h]"]
        
        # NIH images are typically 1024x1024
        scale_x = 224 / 1024.0
        scale_y = 224 / 1024.0
        
        bx, by, bw, bh = int(ox * scale_x), int(oy * scale_y), int(ow * scale_x), int(oh * scale_y)
        
        # Box mask
        box_mask = np.zeros((224, 224), dtype=bool)
        box_mask[by:by+bh, bx:bx+bw] = True
        
        img_gray = Image.open(img_path).convert('L').resize((224, 224))
        img_t = TF.to_tensor(img_gray).unsqueeze(0).to(device)
        if img_t.shape[1] == 1:
            img_t = img_t.expand(-1, 3, -1, -1)
            
        label_idx = labels_list.index(label)
        
        heatmap, _ = generate_gradcam(model, img_t, label_idx, target_layer, img_np)
        
        # Pointing game hit
        hy, hx = np.unravel_index(heatmap.argmax(), heatmap.shape)
        hit = box_mask[hy, hx]
        
        # IoU
        heat_bin = heatmap > iou_thresh
        intersection = (heat_bin & box_mask).sum()
        union = (heat_bin | box_mask).sum()
        iou = intersection / union if union > 0 else 0
        
        results[label]["total"] += 1
        if hit:
            results[label]["hits"] += 1
        results[label]["ious"].append(iou)
        
    md = "# Grad-CAM++ Validation against NIH Bounding Boxes\n\n"
    md += "| Label | Count | Hit Rate | Mean IoU |\n|---|---|---|---|\n"
    
    unreliable_labels = []
    for l in labels_list:
        if results[l]["total"] > 0:
            hr = results[l]["hits"] / results[l]["total"]
            miou = np.mean(results[l]["ious"])
            md += f"| {l} | {results[l]['total']} | {hr:.2%} | {miou:.3f} |\n"
            
            if hr < 0.5: # arbitrary weak localization threshold
                unreliable_labels.append(l)
                
    with open(ROOT / "reports/explain_validation.md", "w") as f:
        f.write(md)
        
    # Update config/uncertainty.yaml
    if unreliable_labels:
        unc_cfg["heatmap_unreliable"] = unreliable_labels
        with open(ROOT / "config/uncertainty.yaml", "w") as f:
            yaml.dump(unc_cfg, f, default_flow_style=False)
            
    print("Faithfulness (Deletion Test)...")
    # Take 20 positive test images
    pos_samples = test_df[test_df[labels_list].sum(axis=1) > 0].sample(20, random_state=42)
    k_vals = explain_cfg["deletion_k_values"]
    del_s = {k: [] for k in k_vals}
    del_r = {k: [] for k in k_vals}
    
    for _, row in pos_samples.iterrows():
        img_path = ROOT / row["image_path"]
        img_gray = Image.open(img_path).convert('L').resize((224, 224))
        img_t = TF.to_tensor(img_gray).unsqueeze(0).to(device)
        img_t = img_t.expand(-1, 3, -1, -1)
        
        # Find first positive label
        labels = [l for l in labels_list if row[l] == 1]
        if not labels: continue
        target_idx = labels_list.index(labels[0])
        
        heatmap, _ = generate_gradcam(model, img_t, target_idx, target_layer, np.zeros((224, 224, 3)))
        
        ds, dr = deletion_test(model, img_t, heatmap, k_vals, temps, target_idx)
        for i, k in enumerate(k_vals):
            del_s[k].append(ds[i])
            del_r[k].append(dr[i])
            
    print("\nDeletion Test Results (Mean Prob Drop):")
    for k in k_vals:
        print(f"k={k:.2f}: Salient Drop: {np.mean(del_s[k]):.4f}, Random Drop: {np.mean(del_r[k]):.4f}")
        
    print("\nSpatial Uncertainty and Rationales on 3 images...")
    # Find one image with a bounding box
    bbox_img = bbox_df.iloc[0]["image_id"]
    row_bbox_df = test_df[test_df["image_id"] == bbox_img]
    if row_bbox_df.empty:
        # Fallback if first bbox image isn't in test set
        test_bboxes = bbox_df[bbox_df["image_id"].isin(test_df["image_id"])]
        row_bbox = test_df[test_df["image_id"] == test_bboxes.iloc[0]["image_id"]].iloc[0]
    else:
        row_bbox = row_bbox_df.iloc[0]
        
    row_pos = test_df[test_df[labels_list].sum(axis=1) > 1].iloc[0] # Multiple findings
    row_neg = test_df[test_df[labels_list].sum(axis=1) == 0].iloc[0] # No findings
    
    storage_dir = ROOT / "data/storage"
    storage_dir.mkdir(exist_ok=True, parents=True)
    
    for name, r in [("BBoxImage", row_bbox), ("MultipleFindings", row_pos), ("DegradedNegative", row_neg)]:
        img_path = ROOT / r["image_path"] if not Path(r["image_path"]).is_absolute() else Path(r["image_path"])
        img_gray = Image.open(img_path).convert('L').resize((224, 224))
        
        if name == "DegradedNegative":
            img_gray = img_gray.filter(ImageFilter.GaussianBlur(radius=5))
            
        img_rgb = np.array(img_gray.convert('RGB')).astype(np.float32) / 255.0
        img_t_gray = TF.to_tensor(img_gray).unsqueeze(0).to(device)
        img_t3 = img_t_gray.expand(-1, 3, -1, -1)
        
        res = analyse_image(img_t3, model, calibration_data, labels_list, unc_cfg["uncertainty"])
        
        # Lung zone mask
        raw_mask = segment_lungs(TF.to_tensor(img_gray))
        rl, ll = post_process_lungs(raw_mask)
        zone_masks = get_lung_zones(rl, ll)
        
        # Top finding
        top_l = sorted(res["findings"].items(), key=lambda x: x[1]['p'], reverse=True)[0]
        top_name, top_data = top_l
        target_idx = labels_list.index(top_name)
        
        heatmap, overlay = generate_gradcam(model, img_t3, target_idx, target_layer, img_rgb)
        peak_zone = get_peak_zone(heatmap, zone_masks)
        
        std_map, unc_overlay, downsampled = generate_spatial_uncertainty(model, img_t3, target_idx, target_layer, 5, img_rgb)
        
        # Rationale
        rationale = generate_rationale(
            finding=top_name,
            prob=top_data['p'],
            int_lower=top_data['interval'][0],
            int_upper=top_data['interval'][1],
            tier=top_data['tier'],
            peak_zone=peak_zone,
            is_heatmap_reliable=top_name not in unreliable_labels,
            gate_warnings=res["review_reasons"] if res["is_ood"] else [],
            is_ood=res["is_ood"],
            needs_review=res["needs_review"]
        )
        
        # Check forbidden
        for f in forbidden:
            if f.lower() in rationale.lower():
                print(f"FORBIDDEN PHRASE FOUND: {f} in rationale")
                assert False
                
        # Check numeric format
        assert f"{top_data['p']:.2f}" in rationale
        
        print(f"\n[{name}] Top Finding: {top_name}")
        print(f"Rationale: {rationale}")
        print(f"Uncertainty map mean std: {std_map.mean():.4f}")
        
        # Save
        cv2.imwrite(str(storage_dir / f"{name}_original.png"), (img_rgb[:, :, ::-1]*255).astype(np.uint8))
        cv2.imwrite(str(storage_dir / f"{name}_heatmap.png"), overlay[:, :, ::-1])
        cv2.imwrite(str(storage_dir / f"{name}_uncertainty.png"), unc_overlay[:, :, ::-1])
        
if __name__ == "__main__":
    main()
