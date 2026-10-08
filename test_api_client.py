import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.deps import get_current_user
from backend.app.db.models import User

# Override dependency to bypass auth
class DummyUser:
    pass

def override_get_current_user():
    return DummyUser()

app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)
response = client.get("/models/status")

print(f"Status Code: {response.status_code}")
import json
print(json.dumps(response.json(), indent=2))
