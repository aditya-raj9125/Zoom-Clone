"""FastAPI application factory.

Design decisions:
- Lifespan context manager handles startup/shutdown (modern FastAPI pattern).
- CORS configured from environment — never hardcoded allow_origins=["*"].
- Global exception handler converts AppError subclasses to consistent JSON.
- Request logging middleware adds request ID, method, path, status, duration.
"""

import logging
import time
import uuid
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.config import get_settings
from app.core.exceptions import AppError
from app.core.logging import configure_logging

logger = logging.getLogger(__name__)
settings = get_settings()


# ---------------------------------------------------------------------------
# Lifespan — startup and shutdown
# ---------------------------------------------------------------------------


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan handler.

    Startup:
    - Configure logging.
    - Ensure the data directory exists (SQLite database path).

    Shutdown:
    - Graceful cleanup (connection pool disposal).
    """
    configure_logging()
    logger.info("Starting %s in %s mode", settings.app_name, settings.environment)

    # Ensure the data directory exists
    from pathlib import Path

    db_url = settings.database_url
    if "sqlite" in db_url:
        db_path = db_url.split("///")[-1]
        if db_path and db_path != ":memory:":
            Path(db_path).parent.mkdir(parents=True, exist_ok=True)

    # Automatically ensure seed data exists on startup (idempotent)
    try:
        from app.core.database import AsyncSessionLocal
        from app.db.seed import seed_database

        async with AsyncSessionLocal() as db:
            await seed_database(db)
        logger.info("Database seed verified on startup.")
    except Exception as exc:
        logger.warning("Database seed skipped during startup: %s", exc)

    yield

    # Shutdown
    from app.core.database import engine

    await engine.dispose()
    logger.info("Application shutdown complete")


# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="Zoom Clone API",
        description=(
            "Production-quality backend for the Zoom Clone application. "
            "Supports instant meetings, scheduled meetings, real-time WebSocket events, "
            "WebRTC signaling, chat, reactions, and host controls.\n\n"
            "All timestamps are UTC. "
            "WebSocket endpoint: `ws://localhost:8000/api/v1/ws/meetings/{meeting_id}?participant_id={participant_id}`"
        ),
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # -----------------------------------------------------------------------
    # CORS
    # -----------------------------------------------------------------------
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # -----------------------------------------------------------------------
    # Request logging middleware
    # -----------------------------------------------------------------------
    @app.middleware("http")
    async def request_logging_middleware(request: Request, call_next: object) -> Response:
        request_id = str(uuid.uuid4())[:8]
        start_time = time.perf_counter()

        response: Response = await call_next(request)  # type: ignore[operator]

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        logger.info(
            "request_id=%s method=%s path=%s status=%s duration_ms=%s",
            request_id,
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )
        response.headers["X-Request-ID"] = request_id
        return response

    # -----------------------------------------------------------------------
    # Global exception handler — converts AppError to consistent JSON
    # -----------------------------------------------------------------------
    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status,
            content={"error": {"code": exc.code, "message": exc.message}},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled exception: %s", exc)
        return JSONResponse(
            status_code=500,
            content={
                "error": {"code": "INTERNAL_ERROR", "message": "An unexpected error occurred."}
            },
        )

    # -----------------------------------------------------------------------
    # Routers
    # -----------------------------------------------------------------------
    app.include_router(api_router)

    return app


# ---------------------------------------------------------------------------
# WSGI / ASGI entry point
# ---------------------------------------------------------------------------
app = create_app()
