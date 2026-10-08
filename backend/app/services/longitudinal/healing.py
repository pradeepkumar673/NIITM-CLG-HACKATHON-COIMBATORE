import yaml
from pathlib import Path
from typing import Dict

ROOT = Path(__file__).resolve().parent.parent.parent.parent.parent

class HealingService:
    def __init__(self):
        with open(ROOT / "config/healing_priors.yaml", "r") as f:
            self.config = yaml.safe_load(f)
            
    def estimate_healing_time(self, site_key: str, history_flags: Dict[str, bool]) -> dict:
        """
        Output a RANGE (low-high weeks), list of priors used, and the exploratory flag/warning.
        """
        priors = self.config.get("priors", {})
        if site_key not in priors:
            return {
                "error": "no prior available",
                "site": site_key,
                "supported_sites": list(priors.keys())
            }
            
        prior = priors[site_key]
        base_low, base_high = prior["baseline_range_weeks"]
        
        multiplier = 1.0
        used_priors = [prior]
        
        modifiers = self.config.get("modifiers", {})
        for flag, is_present in history_flags.items():
            if is_present and flag in modifiers:
                mod = modifiers[flag]
                if mod["type"] == "multiplier":
                    multiplier *= mod["value"]
                used_priors.append(mod)
                
        adj_low = round(base_low * multiplier, 1)
        adj_high = round(base_high * multiplier, 1)
        
        return {
            "exploratory": True, # Hard-coded by design
            "warning": self.config["exploratory_warning"],
            "estimate_range_weeks": [adj_low, adj_high],
            "priors_used": used_priors
        }
        
    def review_delayed_healing(self, site_key: str, elapsed_weeks: float, density_change: float) -> dict:
        """
        Returns needs_human_review=true if time > threshold AND density < config value.
        """
        priors = self.config.get("priors", {})
        if site_key not in priors:
            return {"needs_human_review": False}
            
        threshold_weeks = priors[site_key]["delayed_union_threshold_weeks"]
        min_density_change = self.config["delayed_healing"]["density_change_threshold"]
        
        if elapsed_weeks > threshold_weeks and density_change < min_density_change:
            return {
                "needs_human_review": True,
                "reason": f"pattern consistent with delayed healing; clinician review recommended (elapsed {elapsed_weeks}w > {threshold_weeks}w threshold, density change {density_change:.2f} < {min_density_change} [draft design choice])"
            }
            
        return {"needs_human_review": False}
