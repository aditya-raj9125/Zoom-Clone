"""Auth service — registration, login, Google OAuth user upsert."""

import logging
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    DuplicateEmailError,
    InvalidCredentialsError,
    UserNotFoundError,
)
from app.features.auth.google import GoogleUserInfo
from app.features.auth.jwt import create_access_token
from app.features.auth.password import hash_password, verify_password
from app.features.auth.schemas import AuthResponse, LoginRequest, RegisterRequest
from app.features.users.models import User
from app.features.users.schemas import UserResponse

logger = logging.getLogger(__name__)


def _user_to_response(user: User) -> UserResponse:
    return UserResponse(
        id=str(user.id),
        display_name=user.display_name,
        email=user.email,
        avatar_url=user.avatar_url,
        is_default_user=user.is_default_user,
        created_at=user.created_at,
    )


def _build_auth_response(user: User) -> AuthResponse:
    token = create_access_token(
        user_id=str(user.id),
        email=user.email,
        display_name=user.display_name,
    )
    return AuthResponse(
        access_token=token,
        user=_user_to_response(user),
    )


class AuthService:
    """Business logic for authentication flows."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def register(self, request: RegisterRequest) -> AuthResponse:
        """Create a new user account with email + password.

        Raises:
            DuplicateEmailError: Email already registered.
        """
        # Check email uniqueness
        result = await self._db.execute(select(User).where(User.email == request.email.lower()))
        if result.scalar_one_or_none() is not None:
            raise DuplicateEmailError("An account with this email already exists.")

        user = User(
            id=str(uuid.uuid4()),
            display_name=request.display_name,
            email=request.email.lower(),
            password_hash=hash_password(request.password),
            oauth_provider=None,
            oauth_id=None,
            is_default_user=False,
        )
        self._db.add(user)
        await self._db.commit()
        await self._db.refresh(user)

        logger.info("New user registered: %s", user.email)
        return _build_auth_response(user)

    async def login(self, request: LoginRequest) -> AuthResponse:
        """Authenticate with email + password.

        Raises:
            InvalidCredentialsError: Wrong email or password.
        """
        result = await self._db.execute(select(User).where(User.email == request.email.lower()))
        user = result.scalar_one_or_none()

        if user is None or not user.password_hash:
            raise InvalidCredentialsError("Invalid email or password.")

        if not verify_password(request.password, user.password_hash):
            raise InvalidCredentialsError("Invalid email or password.")

        logger.info("User logged in: %s", user.email)
        return _build_auth_response(user)

    async def google_login_or_register(self, info: GoogleUserInfo) -> AuthResponse:
        """Find or create a user from Google OAuth user info.

        On first sign-in, creates a new User row.
        On subsequent sign-ins, returns existing user (updating avatar if changed).
        """
        # Try to find existing user by google_id
        result = await self._db.execute(select(User).where(User.oauth_id == info.google_id))
        user = result.scalar_one_or_none()

        if user is None:
            # Try by email (user may have registered with password first)
            result = await self._db.execute(select(User).where(User.email == info.email.lower()))
            user = result.scalar_one_or_none()

        if user is None:
            # First time Google sign-in — create user
            user = User(
                id=str(uuid.uuid4()),
                display_name=info.display_name,
                email=info.email.lower(),
                password_hash=None,
                oauth_provider="google",
                oauth_id=info.google_id,
                avatar_url=info.picture,
                is_default_user=False,
            )
            self._db.add(user)
            logger.info("New user via Google OAuth: %s", info.email)
        else:
            # Update oauth linkage and avatar if needed
            if user.oauth_id is None:
                user.oauth_provider = "google"
                user.oauth_id = info.google_id
            if info.picture and user.avatar_url != info.picture:
                user.avatar_url = info.picture

        await self._db.commit()
        await self._db.refresh(user)
        return _build_auth_response(user)

    async def get_user_by_id(self, user_id: str) -> User:
        """Fetch a user by their UUID.

        Raises:
            UserNotFoundError: If not found.
        """
        result = await self._db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user is None:
            raise UserNotFoundError("User not found.")
        return user
