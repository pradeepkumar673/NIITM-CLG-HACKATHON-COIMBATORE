import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.db.session import get_db
from sqlalchemy.orm import Session
from backend.app.db.models import User, UserRole
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

@pytest.fixture(scope="module")
def client():
    return TestClient(app)

@pytest.fixture(scope="module")
def db_session():
    from backend.app.db.session import init_db
    init_db()
    return next(get_db())

@pytest.fixture(scope="module")
def admin_token(client: TestClient, db_session: Session):
    # Ensure an admin user exists
    admin_user = db_session.query(User).filter(User.email == "admin@example.com").first()
    if not admin_user:
        from backend.app.core.security import hash_password
        admin_user = User(
            email="admin@example.com",
            password_hash=hash_password("admin123"),
            full_name="Admin User",
            role=UserRole.admin
        )
        db_session.add(admin_user)
        db_session.commit()
        
    response = client.post("/auth/login", json={"email": "admin@example.com", "password": "admin123"})
    assert response.status_code == 200
    return response.json()["access_token"]

@pytest.fixture(scope="module")
def health_worker_token(client: TestClient, db_session: Session):
    hw = db_session.query(User).filter(User.email == "hw@example.com").first()
    if not hw:
        from backend.app.core.security import hash_password
        hw = User(
            email="hw@example.com",
            password_hash=hash_password("hw123"),
            full_name="Health Worker",
            role=UserRole.health_worker
        )
        db_session.add(hw)
        db_session.commit()
        
    response = client.post("/auth/login", json={"email": "hw@example.com", "password": "hw123"})
    assert response.status_code == 200
    return response.json()["access_token"]

def test_dashboard_endpoints_empty(client: TestClient, health_worker_token: str):
    headers = {"Authorization": f"Bearer {health_worker_token}"}
    
    resp = client.get("/dashboard/studies/counts", headers=headers)
    assert resp.status_code == 200
    assert "total" in resp.json()
    
    resp = client.get("/dashboard/studies/triage", headers=headers)
    assert resp.status_code == 200
    assert "high" in resp.json()
    
    resp = client.get("/dashboard/studies/queue", headers=headers)
    assert resp.status_code == 200
    
    resp = client.get("/dashboard/studies/findings", headers=headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

    resp = client.get("/dashboard/audit/activity", headers=headers)
    assert resp.status_code == 200
    
    resp = client.get("/dashboard/users/clinics", headers=headers)
    assert resp.status_code == 200
    assert len(resp.json()) >= 2
    
    resp = client.get("/dashboard/models/status", headers=headers)
    assert resp.status_code == 200
    assert len(resp.json()) >= 2
    
    resp = client.get("/dashboard/studies/latency", headers=headers)
    assert resp.status_code == 200

def test_upload_and_check_counts(client: TestClient, health_worker_token: str):
    headers = {"Authorization": f"Bearer {health_worker_token}"}
    
    # Get initial counts
    resp1 = client.get("/dashboard/studies/counts", headers=headers)
    initial_total = resp1.json()["total"]
    
    # Upload a study
    import csv
    manifest_path = ROOT / "data/processed/fracture_manifest.csv"
    img_path = None
    if manifest_path.exists():
        with open(manifest_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if Path(row['image_path']).exists():
                    img_path = Path(row['image_path'])
                    break
                    
    if not img_path:
        pytest.skip("No valid image found to upload")
        
    with open(img_path, "rb") as f:
        res = client.post("/studies/", headers=headers, files={"file": ("test.png", f, "image/png")})
        assert res.status_code == 200
        
    # Wait a bit for processing
    time.sleep(10)
    
    # Check counts increased
    resp2 = client.get("/dashboard/studies/counts", headers=headers)
    new_total = resp2.json()["total"]
    assert new_total > initial_total
    
    # Audit should have the upload
    resp3 = client.get("/dashboard/audit/activity", headers=headers)
    assert len(resp3.json()) > 0
    
    # Queue should be updated
    resp4 = client.get("/dashboard/studies/queue", headers=headers)
    assert "awaiting_sign_off" in resp4.json()
