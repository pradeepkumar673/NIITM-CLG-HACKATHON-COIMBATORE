# Decisions

Record of architectural and tooling decisions.

- **Step 10 Models Backbone**: Picked `efficientnet_b0` for Fracture, Knee Bone-Health, and TB models because it is lightweight, memory efficient, and balances speed with accuracy effectively for medical images, especially given our unified registry's GPU memory management requirements.
