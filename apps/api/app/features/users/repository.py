"""User repository — database access only, no business logic."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.features.users.models import User


class UserRepository:
    """Database access layer for the User domain.

    Methods only perform database I/O.  Business decisions belong in UserService.
    """

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        result = await self._db.execute(select(User).where(User.id == str(user_id)))
        return result.scalar_one_or_none()

    async def get_default_user(self) -> User | None:
        """Return the seeded default application user."""
        result = await self._db.execute(
            select(User).where(User.is_default_user == True)  # noqa: E712
        )
        return result.scalar_one_or_none()

    async def create(self, user: User) -> User:
        self._db.add(user)
        await self._db.flush()
        await self._db.refresh(user)
        return user
