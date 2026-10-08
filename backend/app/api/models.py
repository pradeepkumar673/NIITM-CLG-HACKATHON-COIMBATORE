from fastapi import APIRouter
from backend.app.services.inference.registry import UnifiedModelRegistry
from backend.app.core.config import get_settings

router = APIRouter(prefix="/models", tags=["models"])

# Singleton for registry
_registry = None

def get_registry() -> UnifiedModelRegistry:
    global _registry
    if _registry is None:
        settings = get_settings()
        _registry = UnifiedModelRegistry(
            models_yaml_path="config/models.yaml",
            models_dir="models",
            max_resident=3
        )
    return _registry

@router.get("/status")
def get_models_status():
    """Return the status of all registered models."""
    reg = get_registry()
    return {"models": reg.get_status()}
