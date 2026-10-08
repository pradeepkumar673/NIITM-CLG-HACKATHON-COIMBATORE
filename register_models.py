import json
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent

models = [
    ("fracture_efficientnet/best.pt", "fracture_classifier", "fracture"),
    ("knee_efficientnet/best.pt", "knee_classifier", "knee"),
    ("tb_efficientnet/best.pt", "tb_classifier", "tb")
]

reg_path = ROOT / "models" / "registry.json"
if reg_path.exists():
    with open(reg_path, "r") as f:
        registry = json.load(f)
else:
    registry = {}

for fname, name, tname in models:
    wpath = ROOT / "models" / fname
    if not wpath.exists():
        continue
    
    sha256 = hashlib.sha256(wpath.read_bytes()).hexdigest()
    
    mpath = ROOT / "reports" / tname / "metrics.json"
    metrics = {}
    if mpath.exists():
        with open(mpath, "r") as f:
            metrics = json.load(f).get("metrics", {})
            
    registry[name] = {
        "sha256": sha256,
        "metrics": metrics
    }

with open(reg_path, "w") as f:
    json.dump(registry, f, indent=2)

print("Updated registry.")
