import yaml
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent.parent.parent

def generate_rationale(
    finding: str,
    prob: float,
    int_lower: float,
    int_upper: float,
    tier: str,
    peak_zone: str,
    is_heatmap_reliable: bool,
    gate_warnings: list[str],
    is_ood: bool,
    needs_review: bool,
    lang: str = "en"
) -> str:
    lang_path = ROOT / f"config/i18n/{lang}/rationale.yaml"
    if not lang_path.exists():
        lang = "en"
        lang_path = ROOT / "config/i18n/en/rationale.yaml"
        
    with open(lang_path, "r", encoding="utf-8") as f:
        cfg = yaml.safe_load(f)
        
    if peak_zone == "outside lung fields" or not peak_zone:
        heatmap_text = cfg["heatmap_none"]
    else:
        if is_heatmap_reliable:
            heatmap_text = cfg["heatmap_valid"].format(zone=peak_zone)
        else:
            heatmap_text = cfg["heatmap_invalid"].format(zone=peak_zone)
            
    if gate_warnings:
        quality_text = cfg["quality_warning"].format(reasons=", ".join(gate_warnings))
    else:
        quality_text = cfg["quality_acceptable"]
        
    ood_text = cfg["ood_warning"] if is_ood else ""
    review_text = cfg["review_required"] if needs_review else cfg["review_not_required"]
    
    text = cfg["template"].format(
        finding=finding.replace("_", " "),
        prob=prob,
        int_lower=int_lower,
        int_upper=int_upper,
        tier=tier,
        heatmap_text=heatmap_text,
        quality_text=quality_text,
        ood_text=ood_text,
        review_text=review_text
    )
    
    if lang != "en" and lang_path.name == "en":
         text = cfg["fallback_flag"] + " " + text
         
    return text
