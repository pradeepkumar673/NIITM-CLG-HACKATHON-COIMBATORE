# Decisions

Record of architectural and tooling decisions.

- **Step 10 Models Backbone**: Picked `efficientnet_b0` for Fracture, Knee Bone-Health, and TB models because it is lightweight, memory efficient, and balances speed with accuracy effectively for medical images, especially given our unified registry's GPU memory management requirements.

### Longitudinal Registration (Step 13)
- **Optical Flow (Non-rigid refinement):** Decided against using dense optical flow (e.g., cv2.DISOpticalFlow) for 2D X-ray registration. While it can technically reduce pixel-wise error, in medical X-rays (which are 2D projections of 3D structures), non-rigid warping often creates 'fake healing' by artificially aligning tissues or fractures that have genuinely changed or moved in 3D space. Affine registration (ORB + ECC) preserves the rigid geometry necessary for accurate comparison and measurement.
