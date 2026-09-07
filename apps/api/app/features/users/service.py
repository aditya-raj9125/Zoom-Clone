"""User service — business logic for the User domain."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import UserNotFoundError
from app.features.users.models import User
from app.features.users.repository import UserRepository


class UserService:
    """Orchestrates business rules for the User domain.

    In the current phase, the only operation is retrieving the default user.
    Authentication will be added in a future phase.
    """

    def __init__(self, db: AsyncSession) -> None:
        self._repo = UserRepository(db)

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
