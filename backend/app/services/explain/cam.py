import torch
import numpy as np
import cv2
from pytorch_grad_cam import GradCAMPlusPlus
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
from pytorch_grad_cam.utils.image import show_cam_on_image

def generate_gradcam(model, img_tensor: torch.Tensor, target_class: int, target_layer, img_rgb: np.ndarray, colormap: int = cv2.COLORMAP_JET) -> tuple[np.ndarray, np.ndarray]:
    """
    Generates GradCAM++ heatmap.
    img_tensor: 1x3xHxW
    target_layer: e.g. model.features[-1]
    img_rgb: original image as float32 RGB in [0, 1]
    Returns: (raw_cam_normalized, overlay_image)
    """
    cam = GradCAMPlusPlus(model=model, target_layers=[target_layer])
    targets = [ClassifierOutputTarget(target_class)]
    
    grayscale_cam = cam(input_tensor=img_tensor, targets=targets)
    grayscale_cam = grayscale_cam[0, :]
    
    # Resize to original image shape if needed
    if grayscale_cam.shape != img_rgb.shape[:2]:
        grayscale_cam = cv2.resize(grayscale_cam, (img_rgb.shape[1], img_rgb.shape[0]))
        
    visualization = show_cam_on_image(img_rgb, grayscale_cam, use_rgb=True, colormap=colormap)
    return grayscale_cam, visualization

def generate_spatial_uncertainty(model, img_tensor: torch.Tensor, target_class: int, target_layer, n_passes: int, img_rgb: np.ndarray, colormap: int = cv2.COLORMAP_JET) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Generates a spatial uncertainty map by running GradCAM++ across multiple dropout passes.
    """
    model.enable_mc_dropout()
    cam = GradCAMPlusPlus(model=model, target_layers=[target_layer])
    targets = [ClassifierOutputTarget(target_class)]
    
    cams = []
    for _ in range(n_passes):
        grayscale_cam = cam(input_tensor=img_tensor, targets=targets)
        cams.append(grayscale_cam[0, :])
        
    cams = np.stack(cams, axis=0)
    std_map = np.std(cams, axis=0)
    
    # normalize std map
    if std_map.max() > 0:
        std_map = std_map / std_map.max()
        
    if std_map.shape != img_rgb.shape[:2]:
        std_map = cv2.resize(std_map, (img_rgb.shape[1], img_rgb.shape[0]))
        
    visualization = show_cam_on_image(img_rgb, std_map, use_rgb=True, colormap=colormap)
    
    # downsample to 64x64 for json
    downsampled = cv2.resize(std_map, (64, 64))
    
    return std_map, visualization, downsampled
