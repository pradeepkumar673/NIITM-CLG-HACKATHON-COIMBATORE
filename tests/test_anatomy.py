import pytest
import csv
from pathlib import Path
from backend.app.db.models import BodyPart
from backend.app.services.anatomy import resolve_anatomy, load_anatomy_config

ROOT = Path(__file__).resolve().parent.parent

def get_test_image(dataset: str, condition: callable):
    manifest_path = ROOT / "data/processed" / f"{dataset}_manifest.csv"
    if not manifest_path.exists():
        pytest.skip(f"Manifest not found: {manifest_path}")
        
    with open(manifest_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['split'] == 'test' and condition(row):
                img_path = Path(row['image_path'])
                if img_path.exists():
                    return str(img_path)
    pytest.skip(f"No suitable test image found for condition in {dataset}")

def test_skeleton_map_endpoint():
    from fastapi.testclient import TestClient
    from backend.app.main import app
    client = TestClient(app)
    response = client.get("/anatomy/skeleton-map")
    assert response.status_code == 200
    data = response.json()
    assert "meta" in data
    assert "regions" in data
    assert len(data["regions"]) > 5
    assert data["meta"]["review_status"] == "draft"

def test_fractured_hand_image():
    # Find a fractured hand image
    img_path = get_test_image("fracture", lambda r: r['label'] == 'fractured' and r['body_part'] == 'hand')
    
    # Mock finding
    result_json = {
        "findings": {
            "fracture": {
                "label": "fractured",
                "probability": 0.85,
                "tier": "high"
            }
        }
    }
    
    anatomy = resolve_anatomy(BodyPart.bone, img_path, result_json)
    assert anatomy["status"] == "determined"
    assert anatomy["region_id"] == "hand_wrist"
    assert len(anatomy["targets"]) == 1
    t = anatomy["targets"][0]
    assert t["id"] == "hand_wrist"
    assert t["type"] == "bone_region"
    assert t["severity_source"] == "fracture_probability"
    assert t["value"] == 0.85

def test_non_fractured_leg_image():
    img_path = get_test_image("fracture", lambda r: r['label'] == 'non_fractured' and r['body_part'] == 'leg')
    
    result_json = {
        "findings": {
            "fracture": {
                "label": "non_fractured",
                "probability": 0.15,
                "tier": "low"
            }
        }
    }
    
    anatomy = resolve_anatomy(BodyPart.bone, img_path, result_json)
    assert anatomy["status"] == "determined"
    assert anatomy["region_id"] == "leg_lower"
    # No red targets because it's non_fractured
    assert len(anatomy["targets"]) == 0

def test_chest_image_organ_zones():
    # Any chest test image
    img_path = get_test_image("chest", lambda r: True)
    
    # Mock chest finding
    result_json = {
        "findings": {
            "Pneumonia": {
                "probability": 0.92,
                "tier": "high"
            },
            "Cardiomegaly": {
                "probability": 0.88,
                "tier": "high"
            }
        }
    }
    
    anatomy = resolve_anatomy(BodyPart.chest, img_path, result_json)
    assert anatomy["status"] == "determined"
    assert len(anatomy["targets"]) >= 2
    
    # Check pneumonia mapping (mapped to lung_right_lower + bilateral lung_left_lower in our naive resolver logic)
    pneumonia_targets = [t for t in anatomy["targets"] if t["value"] == 0.92]
    assert len(pneumonia_targets) >= 1
    assert pneumonia_targets[0]["type"] == "organ_zone"
    assert "lung" in pneumonia_targets[0]["id"]
    
    # Check cardiomegaly
    cardio_targets = [t for t in anatomy["targets"] if t["value"] == 0.88]
    assert len(cardio_targets) == 1
    assert cardio_targets[0]["id"] == "heart_mediastinum"
