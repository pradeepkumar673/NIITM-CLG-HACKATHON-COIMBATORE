"""SQLAlchemy session / engine factory."""
from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker

from backend.app.core.config import get_settings
from backend.app.db.models import Base


def _make_engine(url: str | None = None):
    settings = get_settings()
    db_url = url or settings.database_url
    connect_args = {}
    if db_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
    engine = create_engine(db_url, connect_args=connect_args)
    # Enable WAL mode for SQLite to allow concurrent reads
    if db_url.startswith("sqlite"):
        @event.listens_for(engine, "connect")
        def set_wal(dbapi_conn, _):
            dbapi_conn.execute("PRAGMA journal_mode=WAL")
    return engine


_engine = None
_SessionLocal: sessionmaker | None = None


def init_db(url: str | None = None) -> None:
    """Create tables. Call once at startup."""
    global _engine, _SessionLocal
    _engine = _make_engine(url)
    _SessionLocal = sessionmaker(bind=_engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(bind=_engine)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency — yields a DB session."""
    if _SessionLocal is None:
        raise RuntimeError("Database not initialised. Call init_db() first.")
    db = _SessionLocal()
    try:
        yield db
    finally:
        db.close()
