"""User service — business logic for the User domain."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import UserNotFoundError
from app.features.users.models import User
from app.features.users.repository import UserRepository
from app.features.users.schemas import UpdateUserRequest


class UserService:
    """Orchestrates business rules for the User domain."""

    def __init__(self, db: AsyncSession) -> None:
        self._repo = UserRepository(db)
        self._db = db

    async def get_default_user(self) -> User:
        """Return the seeded default application user.

        Raises:
            UserNotFoundError: If the seed data has not been run.
        """
        user = await self._repo.get_default_user()
        if user is None:
            raise UserNotFoundError(
                "Default user not found. Run the seed script: python scripts/seed_db.py"
            )
        return user

    async def update_user(self, user: User, update_data: UpdateUserRequest) -> User:
        """Update current user profile attributes."""
        if update_data.display_name is not None and update_data.display_name.strip():
            user.display_name = update_data.display_name.strip()
        if update_data.avatar_url is not None:
            user.avatar_url = update_data.avatar_url.strip() or None

        await self._db.commit()
        await self._db.refresh(user)
        return user
