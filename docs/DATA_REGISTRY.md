# Data Registry

| Dataset | Source URL | License | Local Path | Size | Used For |
|---|---|---|---|---|---|
| NIH ChestX-ray14 | https://nihcc.app.box.com/v/ChestXray-NIHCC | NIH Clinical Center open data | data/raw/nih_chestxray14 | ~15 GB | Chest X-ray 14-class classification |
| Lung Masks & TB (Shenzhen/Montgomery) | Kaggle / NLM | Public Domain | data/raw/lung_masks_tb | 10 GB | Lung segmentation and TB classification. Classes: TB (1), Normal (0). No patient IDs. |
| FracAtlas | Kaggle | CC0 | data/raw/fracatlas | 338 MB | Bone fracture classification. Classes: fractured, non-fractured. Anatomical Info: Coarse `body_part` label ("hand", "leg", "hip", "other"). No bounding boxes or masks are actually populated in our split. No patient IDs. |
| Knee Osteoporosis | Kaggle | CC0 | data/raw/knee_osteoporosis | 293 MB | Knee bone health. Classes: normal, osteoporosis. Anatomical Info: All images are of the knee joint. No patient IDs. |
| Brain MRI | Kaggle | CC0 | data/raw/brain_mri | 164 MB | MRI classification. Classes: glioma, meningioma, notumor, pituitary. No patient IDs. |

