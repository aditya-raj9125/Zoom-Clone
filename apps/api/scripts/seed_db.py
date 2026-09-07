"""Seed script entry point.

Usage (from backend/ directory):
    python scripts/seed_db.py

This script:
1. Runs the Alembic migration to HEAD (ensures schema is up to date).
2. Calls the seed_database function.
"""

import asyncio
import logging
import subprocess
import sys
from pathlib import Path

# Ensure the backend/ directory is on the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import AsyncSessionLocal, engine
from app.core.logging import configure_logging
from app.db.seed import seed_database

configure_logging()
logger = logging.getLogger(__name__)


async def main() -> None:
    # Run alembic upgrade head first
    logger.info("Running alembic upgrade head...")
    result = subprocess.run(
        ["alembic", "upgrade", "head"],
        capture_output=True,
        text=True,
        cwd=str(Path(__file__).parent.parent),
    )
    if result.returncode != 0:
        logger.error("Alembic migration failed:\n%s", result.stderr)
        sys.exit(1)
    logger.info("Migration complete")

    async with AsyncSessionLocal() as db:
        await seed_database(db)

    await engine.dispose()
    logger.info("Seed complete")


if __name__ == "__main__":
    asyncio.run(main())
