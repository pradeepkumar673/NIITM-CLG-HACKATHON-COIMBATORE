import cv2
import numpy as np
import torch
from transformers import pipeline, AutoImageProcessor
from pytorch_grad_cam import GradCAM, GradCAMPlusPlus, EigenCAM, EigenGradCAM, ScoreCAM, AblationCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget

def reshape_transform(tensor, height=14, width=14):
    result = tensor[:, 1:, :].reshape(tensor.size(0), height, width, tensor.size(2))
    return result.transpose(2, 3).transpose(1, 2)

class ViTOutputWrapper(torch.nn.Module):
    def __init__(self, m):
        super().__init__()
        self.m = m
        self.vit = m.vit
    def forward(self, x):
        return self.m(x).logits

def main():
    pipe = pipeline("image-classification", model="Hemgg/bone-fracture-detection-using-xray", device=0 if torch.cuda.is_available() else -1)
    model = pipe.model
    processor = pipe.image_processor
    wrapped_model = ViTOutputWrapper(model)
    
    target_layers = [wrapped_model.vit.encoder.layer[-1].layernorm_before]
    
    img_bgr = cv2.imread('data/storage/images.jpg')
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    inputs = processor(images=img_rgb, return_tensors="pt")
    input_tensor = inputs["pixel_values"].to(model.device)
    targets = [ClassifierOutputTarget(0)]
    
    methods = {
        "gradcam": GradCAM,
        "gradcam++": GradCAMPlusPlus,
        "eigencam": EigenCAM,
        "eigengradcam": EigenGradCAM
    }
    
    orig_h, orig_w = img_bgr.shape[:2]
    
    for name, method in methods.items():
        try:
            cam = method(model=wrapped_model, target_layers=target_layers, reshape_transform=reshape_transform)
            grayscale_cam = cam(input_tensor=input_tensor, targets=targets)[0, :]
            grayscale_cam = cv2.resize(grayscale_cam, (orig_w, orig_h))
            heatmap = cv2.applyColorMap(np.uint8(255 * grayscale_cam), cv2.COLORMAP_JET)
            cv2.imwrite(f'test_hm_{name}.png', heatmap)
            print(f"Saved {name}")
        except Exception as e:
            print(f"Failed {name}: {e}")

if __name__ == "__main__":
    main()
