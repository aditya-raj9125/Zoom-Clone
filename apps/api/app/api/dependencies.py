"""Shared FastAPI dependencies injected into route handlers.

Centralises common dependencies so they are never duplicated across routers.
"""

from typing import Annotated

from fastapi import Depends, Request
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import InvalidTokenError, UserNotFoundError
from app.features.auth.jwt import decode_access_token
from app.features.users.models import User
from app.features.users.service import UserService


def _extract_token(request: Request) -> str | None:
    """Extract Bearer token from Authorization header or cookie."""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:].strip()
    return request.cookies.get("access_token")


async def get_current_user_optional(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User | None:
    """Resolve current user if a valid token is present, else None."""
    token = _extract_token(request)
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            return None
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()
    except (JWTError, Exception):
        return None


async def get_current_user(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Resolve authenticated user or raise 401 InvalidTokenError."""
    token = _extract_token(request)
    if not token:
        raise InvalidTokenError("Authentication token is missing. Please sign in.")
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise InvalidTokenError("Invalid token payload.")
    except JWTError:
        raise InvalidTokenError("Invalid or expired authentication token.")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise UserNotFoundError("User account not found.")
    return user


async def get_default_user(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Fallback helper returning the seeded default user."""
    service = UserService(db)
    return await service.get_default_user()
