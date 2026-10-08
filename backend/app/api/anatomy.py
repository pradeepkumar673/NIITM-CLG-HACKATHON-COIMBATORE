from fastapi import APIRouter
from backend.app.services.anatomy import load_anatomy_config

router = APIRouter(prefix="/anatomy", tags=["anatomy"])

@router.get("/skeleton-map")
def get_skeleton_map():
    """
    Returns the validated config (ids, labels per language, parent/child grouping, review_status)
    so the frontend never hardcodes a bone list.
    """
    cfg = load_anatomy_config()
    return {
        "meta": cfg.get("meta", {}),
        "regions": cfg.get("regions", [])
    }
