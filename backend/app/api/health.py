"""GET /health and GET /models/status."""
from __future__ import annotations

import hashlib
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.app.core.config import (
    get_settings,
    load_models_config,
    load_registry,
)
from backend.app.core.deps import get_current_user
from backend.app.db.models import User
from backend.app.db.session import get_db

router = APIRouter(tags=["health"])

VERSION = "0.1.0"


class HealthResponse(BaseModel):
    status: str
    version: str
    db: str


class ModelStatus(BaseModel):
    name: str
    filename: str
    task: str
    status: str  # "available" | "missing" | "hash_mismatch"
    detail: str | None = None


class ModelsStatusResponse(BaseModel):
    models: list[ModelStatus]


@router.get("/health", response_model=HealthResponse)
def health(db: Session = Depends(get_db)) -> HealthResponse:
    try:
        db.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception as exc:
        db_status = f"error: {exc}"
    return HealthResponse(status="ok", version=VERSION, db=db_status)


@router.get("/models/status", response_model=ModelsStatusResponse)
def models_status(
    _user: User = Depends(get_current_user),
) -> ModelsStatusResponse:
    settings = get_settings()
    model_dir = settings.model_dir

    try:
        models_cfg = load_models_config()
    except Exception as exc:
        return ModelsStatusResponse(models=[
            ModelStatus(name="config_error", filename="", task="", status="missing", detail=str(exc))
        ])

    registry: dict[str, Any] = load_registry(model_dir)

    results: list[ModelStatus] = []
    for m in models_cfg["models"]:
        fname: str = m["filename"]
        weight_path = model_dir / fname

        if not weight_path.exists():
            results.append(ModelStatus(
                name=m["name"],
                filename=fname,
                task=m["task"],
                status="missing",
                detail="Weight file not found. Train or download the model first.",
            ))
            continue

        # Check sha256 against registry if entry exists
        reg_entry = registry.get(m["name"])
        if reg_entry:
            expected_sha = reg_entry.get("sha256", "")
            if expected_sha:
                sha = hashlib.sha256(weight_path.read_bytes()).hexdigest()
                if sha != expected_sha:
                    results.append(ModelStatus(
                        name=m["name"],
                        filename=fname,
                        task=m["task"],
                        status="hash_mismatch",
                        detail=f"File exists but sha256 mismatch. Expected {expected_sha[:12]}...",
                    ))
                    continue

        results.append(ModelStatus(
            name=m["name"],
            filename=fname,
            task=m["task"],
            status="available",
        ))

    return ModelsStatusResponse(models=results)
