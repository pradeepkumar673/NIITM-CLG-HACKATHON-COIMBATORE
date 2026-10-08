"""Structured JSON logging — never logs patient IDs or image bytes (R10)."""
from __future__ import annotations

import json
import logging
import sys
from contextvars import ContextVar
from datetime import UTC, datetime
from typing import Any

request_id_var: ContextVar[str] = ContextVar("request_id", default="")


class _JsonFormatter(logging.Formatter):
    NEVER_LOG_KEYS = frozenset(
        {"patient_id", "image_path", "image_bytes", "email", "password"}
    )

    def format(self, record: logging.LogRecord) -> str:  # type: ignore[override]
        payload: dict[str, Any] = {
            "ts": datetime.now(UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
            "request_id": request_id_var.get(""),
        }
        if record.exc_info:
            payload["exc"] = self.formatException(record.exc_info)
        # Strip any accidentally passed sensitive keys from extra
        for key, val in record.__dict__.items():
            if key in self.NEVER_LOG_KEYS:
                continue
            if key.startswith("_") or key in logging.LogRecord.__dict__:
                continue
        return json.dumps(payload, ensure_ascii=False)


def setup_logging(level: str = "info") -> None:
    root = logging.getLogger()
    root.setLevel(level.upper())
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(_JsonFormatter())
    root.handlers.clear()
    root.addHandler(handler)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
