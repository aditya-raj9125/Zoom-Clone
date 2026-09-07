"""Auth router — register, login, logout, Google OAuth, me."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.core.exceptions import GoogleOAuthNotConfiguredError
from app.features.auth.google import exchange_google_code, get_google_auth_url
from app.features.auth.schemas import AuthResponse, LoginRequest, RegisterRequest
from app.features.auth.service import AuthService, _user_to_response
from app.features.users.models import User
from app.features.users.schemas import UserResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

# Cookie configuration
COOKIE_NAME = "access_token"
COOKIE_MAX_AGE = 7 * 24 * 3600  # 7 days


def _set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=COOKIE_MAX_AGE,
        httponly=True,
        samesite="lax",
        secure=False,  # Allow HTTP for local development
        path="/",
    )


def _clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
        httponly=True,
        samesite="lax",
    )


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(
    request: RegisterRequest,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AuthResponse:
    """Register a new user account with display_name, email, and password."""
    service = AuthService(db)
    result = await service.register(request)
    _set_auth_cookie(response, result.access_token)
    return result


@router.post(
    "/login",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    summary="Log in with email and password",
)
async def login(
    request: LoginRequest,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AuthResponse:
    """Authenticate with email + password. Returns JWT token and sets cookie."""
    service = AuthService(db)
    result = await service.login(request)
    _set_auth_cookie(response, result.access_token)
    return result


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Log out and clear session cookie",
)
async def logout(response: Response) -> dict[str, str]:
    """Log out the current user by clearing the access_token cookie."""
    _clear_auth_cookie(response)
    return {"message": "Logged out successfully"}


@router.get(
    "/google/login",
    summary="Start Google OAuth flow",
)
async def google_login() -> RedirectResponse:
    """Redirect the browser to Google OAuth 2.0 consent screen."""
    settings = get_settings()
    if not settings.google_client_id or not settings.google_client_secret:
        raise GoogleOAuthNotConfiguredError(
            "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and "
            "GOOGLE_CLIENT_SECRET in the server environment (.env)."
        )
    auth_url = get_google_auth_url()
    return RedirectResponse(url=auth_url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)


@router.get(
    "/google/callback",
    summary="Handle Google OAuth callback",
)
async def google_callback(
    code: Annotated[str | None, Query()] = None,
    error: Annotated[str | None, Query()] = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,  # type: ignore[assignment]
) -> RedirectResponse:
    """Exchange authorization code for user info and redirect to frontend with JWT."""
    settings = get_settings()
    frontend_url = settings.frontend_url.rstrip("/")

    if error:
        logger.warning("Google OAuth returned error: %s", error)
        return RedirectResponse(
            url=f"{frontend_url}/signin?error=google_oauth_denied",
            status_code=status.HTTP_307_TEMPORARY_REDIRECT,
        )

    if not code:
        return RedirectResponse(
            url=f"{frontend_url}/signin?error=missing_code",
            status_code=status.HTTP_307_TEMPORARY_REDIRECT,
        )

    try:
        user_info = await exchange_google_code(code)
        service = AuthService(db)
        auth_resp = await service.google_login_or_register(user_info)

        redirect_target = f"{frontend_url}/auth/callback?token={auth_resp.access_token}"
        response = RedirectResponse(
            url=redirect_target,
            status_code=status.HTTP_307_TEMPORARY_REDIRECT,
        )
        _set_auth_cookie(response, auth_resp.access_token)
        return response
    except Exception as exc:
        logger.exception("Error processing Google callback: %s", exc)
        return RedirectResponse(
            url=f"{frontend_url}/signin?error=google_auth_failed",
            status_code=status.HTTP_307_TEMPORARY_REDIRECT,
        )


from app.api.dependencies import get_current_user


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user",
)
async def get_me(
    user: Annotated[User, Depends(get_current_user)],
) -> UserResponse:
    """Return profile of the currently authenticated user."""
    return _user_to_response(user)
