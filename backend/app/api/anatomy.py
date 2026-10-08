from fastapi import APIRouter, Depends
from backend.app.services.anatomy import load_anatomy_config
from backend.app.api.auth import get_current_user

router = APIRouter(prefix="/anatomy", tags=["anatomy"])

@router.get("/skeleton-map")
def get_skeleton_map(lang: str = "en", current_user = Depends(get_current_user)):
    """
    Returns the validated config (ids, labels per language, parent/child grouping, review_status)
    so the frontend never hardcodes a bone list.
    """
    cfg = load_anatomy_config()
    from backend.app.services.i18n import translate
    
    regions = []
    for r in cfg.get("regions", []):
        r_copy = r.copy()
        r_copy["label"] = translate(f"anatomy.{r['id']}", lang)
        regions.append(r_copy)
        
    return {
        "meta": cfg.get("meta", {}),
        "regions": regions
    }
