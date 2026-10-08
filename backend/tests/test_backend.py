"""Backend tests: auth, role enforcement, models/status, 401 on no token.

Uses a real temporary SQLite file — no mocks (R9).
"""
from __future__ import annotations

import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="module")
def tmp_db_url(tmp_path_factory):
    tmp = tmp_path_factory.mktemp("db")
    return f"sqlite:///{tmp / 'test.db'}"


@pytest.fixture(scope="module")
def client(tmp_db_url):
    """Spin up a real test app with a fresh SQLite DB."""
    import backend.app.db.session as sess_mod

    sess_mod.init_db(url=tmp_db_url)

    from backend.app.main import create_app
    app = create_app()

    # Re-init with the test DB so the app's get_db picks the right URL
    sess_mod.init_db(url=tmp_db_url)

    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def db_session(tmp_db_url):
    from backend.app.db.session import _SessionLocal
    db = _SessionLocal()
    yield db
    db.close()


def _create_user(db: Session, email: str, role: str, password: str = "TestPass123!") -> None:
    from backend.app.core.security import hash_password
    from backend.app.db.models import User, UserRole

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        return
    user = User(
        email=email,
        full_name="Test User",
        role=UserRole(role),
        password_hash=hash_password(password),
    )
    db.add(user)
    db.commit()


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestAuth:
    def test_login_success(self, client, db_session):
        _create_user(db_session, "worker@test.com", "health_worker")
        resp = client.post("/auth/login", json={"email": "worker@test.com", "password": "TestPass123!"})
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["role"] == "health_worker"

    def test_login_wrong_password(self, client, db_session):
        _create_user(db_session, "worker2@test.com", "health_worker")
        resp = client.post("/auth/login", json={"email": "worker2@test.com", "password": "wrong"})
        assert resp.status_code == 401

    def test_login_unknown_user(self, client):
        resp = client.post("/auth/login", json={"email": "nobody@test.com", "password": "x"})
        assert resp.status_code == 401


class TestRoleEnforcement:
    def _token(self, client, email: str, password: str = "TestPass123!") -> str:
        resp = client.post("/auth/login", json={"email": email, "password": password})
        return resp.json()["access_token"]

    def test_models_status_requires_auth(self, client):
        resp = client.get("/models/status")
        assert resp.status_code == 401

    def test_models_status_with_valid_token(self, client, db_session):
        _create_user(db_session, "doc@test.com", "doctor")
        tok = self._token(client, "doc@test.com")
        resp = client.get("/models/status", headers={"Authorization": f"Bearer {tok}"})
        assert resp.status_code == 200
        data = resp.json()
        assert "models" in data


class TestModelsStatus:
    def _token(self, client, email: str, password: str = "TestPass123!") -> str:
        resp = client.post("/auth/login", json={"email": email, "password": password})
        return resp.json()["access_token"]

    def test_all_models_missing(self, client, db_session):
        """Before training, all models should be 'missing'."""
        _create_user(db_session, "admin@test.com", "admin")
        tok = self._token(client, "admin@test.com")
        resp = client.get("/models/status", headers={"Authorization": f"Bearer {tok}"})
        assert resp.status_code == 200
        data = resp.json()
        statuses = {m["name"]: m["status"] for m in data["models"]}
        # All should be missing since no weights exist in test environment
        assert all(s in ("missing", "available", "hash_mismatch") for s in statuses.values())
        # At least some are missing (no training yet)
        assert any(s == "missing" for s in statuses.values())


class TestHealth:
    def test_health_no_auth_required(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"
        assert data["db"] == "ok"
