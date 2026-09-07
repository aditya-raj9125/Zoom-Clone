"""Reset database script — drops and recreates schema, then re-seeds.

Usage (from backend/ directory):
    python scripts/reset_db.py

WARNING: This deletes all data. Use only in development.
"""

import asyncio
import logging
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import AsyncSessionLocal, Base, engine
from app.core.logging import configure_logging
from app.db.seed import seed_database

configure_logging()
logger = logging.getLogger(__name__)


async def reset() -> None:
    logger.warning("Resetting database — all data will be deleted")

    # Drop all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    logger.info("All tables dropped")

    # Recreate via alembic
    result = subprocess.run(
        ["alembic", "upgrade", "head"],
        capture_output=True,
        text=True,
        cwd=str(Path(__file__).parent.parent),
    )
    if result.returncode != 0:
        logger.error("Migration failed:\n%s", result.stderr)
        sys.exit(1)
    logger.info("Schema recreated")

    # Seed
    async with AsyncSessionLocal() as db:
        await seed_database(db)

    await engine.dispose()
    logger.info("Database reset complete")


if __name__ == "__main__":
    asyncio.run(reset())
