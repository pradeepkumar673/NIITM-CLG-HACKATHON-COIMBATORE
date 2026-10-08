"""Core settings loaded from .env and config/*.yaml.

All values must come from environment or validated YAML — no hardcoded
constants (R3). Missing required values raise a clear error at startup.
"""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

import yaml
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# ---------------------------------------------------------------------------
# Top-level settings (from .env)
# ---------------------------------------------------------------------------

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Server
    api_port: int = 8000
    web_port: int = 5173

    # Database
    database_url: str

    # Auth
    jwt_secret: str
    jwt_expire_minutes: int = 1440
    jwt_algorithm: str = "HS256"

    # Storage / model dirs
    model_dir: Path = Path("./models")
    data_dir: Path = Path("./data")
    storage_dir: Path = Path("./storage")

    # Runtime
    device: str = "cpu"
    log_level: str = "info"

    # CORS
    cors_origins: str = ""

    @field_validator("jwt_secret")
    @classmethod
    def jwt_secret_not_empty(cls, v: str) -> str:
        if not v or len(v) < 16:
            raise ValueError("JWT_SECRET must be at least 16 characters.")
        return v

    @field_validator("database_url")
    @classmethod
    def db_url_not_empty(cls, v: str) -> str:
        if not v:
            raise ValueError("DATABASE_URL must be set in .env.")
        return v

    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return the singleton Settings instance. Fails fast if .env is missing."""
    return Settings()  # type: ignore[call-arg]


# ---------------------------------------------------------------------------
# YAML config loaders (validated by pydantic models)
# ---------------------------------------------------------------------------

def _load_yaml(path: Path) -> dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(
            f"Required config file missing: {path}. "
            "Please create it before starting the server."
        )
    with path.open(encoding="utf-8") as fh:
        data = yaml.safe_load(fh)
    if data is None:
        raise ValueError(f"Config file is empty: {path}")
    return data  # type: ignore[return-value]


def load_models_config(config_dir: Path = Path("config")) -> dict[str, Any]:
    """Load and validate config/models.yaml."""
    data = _load_yaml(config_dir / "models.yaml")
    models = data.get("models")
    if not isinstance(models, list) or len(models) == 0:
        raise ValueError("config/models.yaml must contain a non-empty 'models' list.")
    for m in models:
        for required_key in ("name", "filename", "task"):
            if required_key not in m:
                raise ValueError(
                    f"Model entry {m} is missing required key '{required_key}'."
                )
    return data


def load_thresholds_config(config_dir: Path = Path("config")) -> dict[str, Any]:
    """Load and validate config/thresholds.yaml."""
    data = _load_yaml(config_dir / "thresholds.yaml")
    if "thresholds" not in data:
        raise ValueError("config/thresholds.yaml must contain a 'thresholds' key.")
    return data


def load_chest_labels(config_dir: Path = Path("config")) -> list[str]:
    """Load chest label list from config/chest_labels.yaml."""
    data = _load_yaml(config_dir / "chest_labels.yaml")
    labels = data.get("labels")
    if not isinstance(labels, list) or len(labels) == 0:
        raise ValueError("config/chest_labels.yaml must contain a non-empty 'labels' list.")
    return labels  # type: ignore[return-value]


def load_registry(model_dir: Path = Path("models")) -> dict[str, Any]:
    """Load models/registry.json."""
    reg_path = model_dir / "registry.json"
    if not reg_path.exists():
        return {}
    with reg_path.open(encoding="utf-8") as fh:
        return json.load(fh)
