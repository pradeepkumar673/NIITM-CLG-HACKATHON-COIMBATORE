"""FastAPI application factory with middleware."""
from __future__ import annotations

import uuid
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.core.config import get_settings
from backend.app.core.logging import get_logger, request_id_var, setup_logging
from backend.app.db.session import init_db

log = get_logger(__name__)


@asynccontextmanager
async def _lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    setup_logging(settings.log_level)
    init_db()
    log.info("startup", extra={"version": "0.1.0"})
    yield
    log.info("shutdown")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="XRAY-ASSISTANT API",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=_lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Request-ID middleware
    @app.middleware("http")
    async def _request_id_middleware(request: Request, call_next):
        rid = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        token = request_id_var.set(rid)
        response = await call_next(request)
        response.headers["X-Request-ID"] = rid
        request_id_var.reset(token)
        return response

    # Standard error handler
    @app.exception_handler(Exception)
    async def _unhandled(request: Request, exc: Exception):
        log.exception("unhandled_error", exc_info=exc)
        return JSONResponse(
            status_code=500,
            content={"error": {"code": "internal_error", "message": "An unexpected error occurred"}},
        )

    # Routers
    from backend.app.api.auth import router as auth_router
    from backend.app.api.health import router as health_router
    from backend.app.api.studies import router as studies_router
    from backend.app.api.anatomy import router as anatomy_router
    from backend.app.api.dashboard import router as dashboard_router

    app.include_router(auth_router)
    app.include_router(health_router)
    app.include_router(studies_router)
    app.include_router(anatomy_router)
    app.include_router(dashboard_router)

    # Initialize pipeline
    from backend.app.services.pipeline import init_pipeline
    init_pipeline()

    return app


app = create_app()
