"""User API router.

Endpoints:
    GET /api/v1/users/me  — Returns the default seeded user.
"""

from fastapi import APIRouter, Depends

from app.api.dependencies import get_default_user
from app.features.users.models import User
from app.features.users.schemas import UserResponse

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user",
    description=(
        "Returns the default application user. "
        "In the no-auth phase, this is always the seeded 'Aditya Raj' user. "
        "Authentication can be wired in later by replacing this dependency."
    ),
)
async def get_current_user(user: User = Depends(get_default_user)) -> UserResponse:
    """Return the current (default) user profile."""
    return UserResponse.model_validate(user)
