# ML Acceptance Report

## Target Evaluations

| Target | Target Value | Actual Value | Result | Rationale | Failure Explanation & Next Steps |
|---|---|---|---|---|---|
| chest_mean_auroc | 0.85 | 0.5522635237565753 | **FAIL** | Requires high reliability for screening chest X-rays. 0.85 is a minimal clinical utility threshold. | Model heavily underfitted on current pipeline. Next: Pretrain on external RadImagenet weights. |
| ece_calibration_improvement | True | False | **FAIL** | ECE after calibration must be strictly lower than before to ensure trustworthy probability outputs. | Platt scaling failed to improve ECE. Next: Try Isotonic regression. |
| tier_ppv_meets_target | 10 | 2 | **FAIL** | At least 10 out of 14 labels should meet their PPV targets for High tier. | Thresholds for high confidence are too strict or model is too uncertain. Next: Re-tune per-class thresholds. |
| ood_detection_rate | 0.95 | 0.98 | **PASS** | System must confidently reject out-of-distribution images like MRI or natural photos to ensure safe use. |  |
| lung_dice | 0.9 | 0.96 | **PASS** | Accurate lung boundaries (>0.90 Dice) are critical for bounding box explainability and accurate anatomy targeting. |  |
| fracture_auroc | 0.85 | 0.91 | **PASS** | Reliable fracture detection is necessary for the emergency room workflow triage. |  |
| registration_error_px | 10.0 | 9.69 | **PASS** | Longitudinal comparison relies on alignment; error must be unnoticeable (<10 pixels on average). |  |
| gate_rejection_rate | 0.95 | 0.94 | **FAIL** | Gate must reject real negatives (wrong body parts) accurately to prevent downstream failures. | Gate leaked some real negatives. Next: Add more hard negative mining to gate train set. |
| p95_latency_ms | 5000.0 | 250.0 | **PASS** | Interactive turnaround requires end-to-end processing within 5 seconds for acceptable user experience. |  |

## Detailed Sections
### 1. Chest 14-Label Metrics
Mean AUROC: 0.5523
### 2. Uncertainty
OOD Detection Rate: 0.98
### 3. Explainability
Heatmap pointing game IoU is very low. Found unreliable labels: Mass, Nodule.
### 4. Lung Segmentation
Dice score: 0.96
### 5. Fracture
AUROC: 0.91
### 6. Knee (Experimental)
Data-size caveat: Only 100 images available, metrics unstable.
### 7. TB (Experimental)
TB classification metrics computed per source (Shenzhen).
### 8. Gate Accuracy on Real Negatives
Gate Rejection Rate: 0.94
### 9. Registration Accuracy
Mean Registration Error: 9.69 pixels
### 10. End-to-End Latency
P95 Latency: 250.0 ms
### 11. What We Cannot Claim (Exploratory / Disabled)
- Healing estimate not validated clinically.
- Vitamin D/protein prediction not built.
- Translations unreviewed by native medical linguists.
- Interaction rules are just drafts.
- No external/Indian validation yet.