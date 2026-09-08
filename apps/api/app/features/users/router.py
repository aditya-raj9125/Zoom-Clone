"""User API router.

Endpoints:
    GET /api/v1/users/me  — Returns the default seeded user.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.features.users.models import User
from app.features.users.schemas import UpdateUserRequest, UserResponse
from app.features.users.service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user",
    description=(
        "Returns the currently authenticated user if token is present, "
        "or falls back to the default seeded user."
    ),
)
async def get_current_user_profile(user: User = Depends(get_current_user)) -> UserResponse:
    """Return the current user profile."""
    return UserResponse.model_validate(user)


@router.patch(
    "/me",
    response_model=UserResponse,
    summary="Update current user",
    description="Update the authenticated user's display name and profile attributes.",
)
async def update_current_user_profile(
    request: UpdateUserRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """Update display name or avatar for the current user."""
    service = UserService(db)
    updated = await service.update_user(user, request)
    return UserResponse.model_validate(updated)
