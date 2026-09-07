"""Shared FastAPI dependencies injected into route handlers.

Centralises common dependencies so they are never duplicated across routers.
"""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.features.users.models import User
from app.features.users.service import UserService


async def get_default_user(
    db: AsyncSession = Depends(get_db),
) -> User:
    """FastAPI dependency that returns the seeded default user.

    Used by any endpoint that operates in the context of the default user
    (meeting creation, scheduling, etc.) in the no-auth phase.
    """
    service = UserService(db)
    return await service.get_default_user()
