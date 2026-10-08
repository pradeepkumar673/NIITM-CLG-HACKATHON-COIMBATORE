import sys
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT))

from backend.app.services.longitudinal.healing import HealingService

def main():
    service = HealingService()
    
    supported_site = "tibial_shaft"
    unsupported_site = "femur"
    history_flags = {"smoking": True, "diabetes": False}
    
    print("\n--- Live Verification Step 14 ---")
    
    res_supported = service.estimate_healing_time(supported_site, history_flags)
    print(f"\nSupported Site ({supported_site}) with flags {history_flags}:")
    print(json.dumps(res_supported, indent=2))
    
    res_unsupported = service.estimate_healing_time(unsupported_site, history_flags)
    print(f"\nUnsupported Site ({unsupported_site}):")
    print(json.dumps(res_unsupported, indent=2))
    
    # Delayed union check
    # 26 weeks elapsed, density change 0.02
    print("\nDelayed Healing Review Check (Tibial Shaft, 26 weeks elapsed, 0.02 density change):")
    review = service.review_delayed_healing(supported_site, 26, 0.02)
    print(json.dumps(review, indent=2))
    
    print("\nPriors Table with DOIs:")
    for key, prior in service.config.get("priors", {}).items():
        print(f"- {key}: {prior.get('doi')} | {prior.get('source', prior.get('definition'))}")

if __name__ == "__main__":
    main()
