import sys
from pathlib import Path

import pytest
import torch

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from backend.app.services.inference.registry import UnifiedModelRegistry


@pytest.fixture(scope="module")
def registry():
    reg = UnifiedModelRegistry(
        models_yaml_path=ROOT / "config" / "models.yaml",
        models_dir=ROOT / "models",
        max_resident=3
    )
    return reg

def test_fracture_model_loads_and_infers(registry):
    model = registry.get_model("fracture_classifier")
    assert model is not None
    x = torch.rand(1, 1, 224, 224).to(registry.device)
    with torch.no_grad():
        out = model(x)
    assert out.shape == (1, 1)

def test_knee_model_loads_and_infers(registry):
    model = registry.get_model("knee_classifier")
    assert model is not None
    x = torch.rand(1, 1, 224, 224).to(registry.device)
    with torch.no_grad():
        out = model(x)
    assert out.shape == (1, 3)

def test_tb_model_loads_and_infers(registry):
    model = registry.get_model("tb_classifier")
    assert model is not None
    x = torch.rand(1, 1, 224, 224).to(registry.device)
    with torch.no_grad():
        out = model(x)
    assert out.shape == (1, 1)

def test_model_not_available_raises(registry):
    with pytest.raises(ValueError):
        registry.get_model("non_existent_model")
