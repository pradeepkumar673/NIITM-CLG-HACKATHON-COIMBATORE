import cv2
import numpy as np
import torch
from transformers import pipeline, AutoImageProcessor
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget

def reshape_transform(tensor, height=14, width=14):
    result = tensor[:, 1:, :].reshape(tensor.size(0), height, width, tensor.size(2))
    result = result.transpose(2, 3).transpose(1, 2)
    return result

class ViTOutputWrapper(torch.nn.Module):
    def __init__(self, model):
        super().__init__()
        self.model = model
        # pytorch_grad_cam needs these
        self.vit = model.vit
    def forward(self, x):
        return self.model(x).logits

def main():
    pipe = pipeline("image-classification", model="Hemgg/bone-fracture-detection-using-xray", device=0 if torch.cuda.is_available() else -1)
    model = ViTOutputWrapper(pipe.model)
    processor = pipe.image_processor
    
    # Target the last layer before pooling
    target_layers = [model.vit.encoder.layer[-1].layernorm_before]
    
    cam = GradCAM(model=model, target_layers=target_layers, reshape_transform=reshape_transform)
    
    # Create dummy image
    img = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
    inputs = processor(images=img, return_tensors="pt")
    input_tensor = inputs["pixel_values"].to(pipe.model.device)
    
    # Target class 0 (fractured) or 1
    targets = [ClassifierOutputTarget(0)]
    
    grayscale_cam = cam(input_tensor=input_tensor, targets=targets)
    grayscale_cam = grayscale_cam[0, :]
    print("CAM shape:", grayscale_cam.shape)
    print("CAM max:", grayscale_cam.max())

if __name__ == "__main__":
    main()
