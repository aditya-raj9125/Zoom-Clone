"""Health check router."""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

router = APIRouter(prefix="/health", tags=["Health"])


@router.get(
    "",
    summary="Health check",
    description="Returns the application and database health status.",
)
async def health_check(db: AsyncSession = Depends(get_db)) -> dict:
    """Verify the application is running and database is reachable."""
    db_ok = False
    try:
        await db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        pass

    return {
        "status": "ok" if db_ok else "degraded",
        "database": "connected" if db_ok else "unreachable",
    }
