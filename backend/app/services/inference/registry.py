from collections import OrderedDict
from pathlib import Path

import torch
import yaml


class ModelNotAvailable(Exception):
    """Raised when model weights are missing or the model cannot be loaded."""

class UnifiedModelRegistry:
    def __init__(self, models_yaml_path: str, models_dir: str, max_resident: int = 2):
        self.models_yaml_path = Path(models_yaml_path)
        self.models_dir = Path(models_dir)
        self.max_resident = max_resident
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Parse models.yaml
        import yaml
        with open(self.models_yaml_path, "r", encoding="utf-8") as f:
            cfg = yaml.safe_load(f)
            self.model_configs = {m["name"]: m for m in cfg.get("models", [])}
            
        # OrderedDict used as LRU cache for resident models
        self.resident_models: OrderedDict[str, torch.nn.Module] = OrderedDict()
        
    def _instantiate_model(self, name: str, m_cfg: dict) -> torch.nn.Module:
        task = m_cfg.get("task")
        num_labels = len(m_cfg.get("labels", []))
        if isinstance(m_cfg.get("labels"), str):
            # It's a path, let's just hardcode 14 for chest
            num_labels = 14
            
        if task == "chest_classification":
            from ml.train.model import ChestDenseNet121
            return ChestDenseNet121(num_labels=14, dropout_p=0.3, pretrained=False)
        elif task == "quality_gate":
            from ml.train.model import GenericEfficientNetB0
            return GenericEfficientNetB0(num_labels=3, dropout_p=0.3, pretrained=False)
        elif task == "lung_segmentation":
            import segmentation_models_pytorch as smp
            return smp.Unet(encoder_name="resnet34", encoder_weights=None, in_channels=1, classes=1)
        elif task == "fracture_classification":
            from ml.train.model import GenericEfficientNetB0
            return GenericEfficientNetB0(num_labels=1, dropout_p=0.3, pretrained=False)
        elif task == "knee_classification":
            from ml.train.model import GenericEfficientNetB0
            return GenericEfficientNetB0(num_labels=3, dropout_p=0.5, pretrained=False)
        elif task == "tb_classification":
            from ml.train.model import GenericEfficientNetB0
            return GenericEfficientNetB0(num_labels=1, dropout_p=0.3, pretrained=False)
        else:
            raise ValueError(f"Unknown task {task} for model {name}")

    def get_model(self, name: str) -> torch.nn.Module:
        if name not in self.model_configs:
            raise ValueError(f"Model {name} not registered in models.yaml")
            
        # If already resident, move to end (most recently used)
        if name in self.resident_models:
            self.resident_models.move_to_end(name)
            return self.resident_models[name]
            
        # Not resident. Try to load it.
        m_cfg = self.model_configs[name]
        weight_path = self.models_dir / m_cfg["filename"]
        
        if not weight_path.exists():
            raise ModelNotAvailable(f"Weights for {name} missing at {weight_path}")
            
        # Evict LRU model if we are at capacity
        if len(self.resident_models) >= self.max_resident:
            evicted_name, evicted_model = self.resident_models.popitem(last=False)
            # free up memory
            evicted_model.to("cpu")
            del evicted_model
            torch.cuda.empty_cache()
            
        # Load the new model
        try:
            model = self._instantiate_model(name, m_cfg)
            ckpt = torch.load(weight_path, map_location=self.device)
            # Handle standard vs dictionary checkpoint
            if isinstance(ckpt, dict):
                if "model" in ckpt:
                    model.load_state_dict(ckpt["model"])
                elif "model_state_dict" in ckpt:
                    model.load_state_dict(ckpt["model_state_dict"])
                else:
                    model.load_state_dict(ckpt)
            else:
                model.load_state_dict(ckpt)
                
            model.to(self.device)
            model.eval()
            self.resident_models[name] = model
            return model
        except Exception as e:
            raise ModelNotAvailable(f"Failed to load model {name}: {e!s}")

    def get_status(self) -> dict:
        import hashlib
        status = {}
        for name, m_cfg in self.model_configs.items():
            weight_path = self.models_dir / m_cfg["filename"]
            if weight_path.exists():
                with open(weight_path, "rb") as f:
                    sha256 = hashlib.sha256(f.read()).hexdigest()
                status[name] = {
                    "status": "available",
                    "resident": name in self.resident_models,
                    "sha256": sha256
                }
            else:
                status[name] = {
                    "status": "missing",
                    "resident": False,
                    "sha256": None
                }
        return status
