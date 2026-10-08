# Decisions

Record of architectural and tooling decisions.

- **Step 10 Models — HF Pretrained (2026-10-08)**: Migrated all locally-trained backbone weights to well-validated pretrained models from HuggingFace and torchxrayvision. Decision rationale:
  - **Chest (DenseNet121)**: `torchxrayvision/densenet121-res224-all` trained on NIH + CheXpert + MIMIC + PadChest combined (>300k images). Vastly more training data and clinical validation vs. local training on <3k images.
  - **Lung Segmentation**: `ianpan/chest-x-ray-basic` (EfficientNetV2-S + U-Net decoder) provides left/right lung + heart masks. Replaces locally-trained U-Net that had Dice ~0.96 but was only trained on ~800 Montgomery+Shenzhen images.
  - **Fracture**: `Hemgg/bone-fracture-detection-using-xray` (ViT fine-tuned on FracAtlas). The original local model had AUROC ~0.90 on the same FracAtlas split — using the HF ViT eliminates the need for local GPU training.
  - **TB**: `Owos/tb-classifier` (InceptionV3 fine-tuned, 98.57% accuracy, precision 92.59%). Local EfficientNet-B0 had AUROC ~0.81; this model is substantially better and clinically validated for screening.
  - **Knee**: No dedicated HF model exists covering Normal/Osteopenia/Osteoporosis with correct labels. Using `timm efficientnet_b0` ImageNet pretrained as a proxy backbone; results are explicitly flagged `needs_human_review=True` and `experimental=True`. This is the only model without domain-specific pretrained weights.
  - **Gate**: Local fine-tuned `gate_classifier/best.pt` retained as primary; `torchvision MobileNetV3-Small (IMAGENET1K_V1)` used as fallback when weights are missing. Physics-based checks (blur, exposure, resolution) remain the primary quality gate regardless.
  - **Packages added**: `torchxrayvision>=1.5.5` (already installed), `transformers>=5.19.0` (added via `uv add`). Both are now in `pyproject.toml`.

### Longitudinal Registration (Step 13)
- **Optical Flow (Non-rigid refinement):** Decided against using dense optical flow (e.g., cv2.DISOpticalFlow) for 2D X-ray registration. While it can technically reduce pixel-wise error, in medical X-rays (which are 2D projections of 3D structures), non-rigid warping often creates 'fake healing' by artificially aligning tissues or fractures that have genuinely changed or moved in 3D space. Affine registration (ORB + ECC) preserves the rigid geometry necessary for accurate comparison and measurement.
