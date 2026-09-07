"""JWT token creation and verification.

Uses HS256 algorithm with a secret key from settings.
Tokens carry: user_id, email, display_name, exp.
"""

from datetime import UTC, datetime, timedelta
from typing import Any

from jose import JWTError, jwt

from app.core.config import get_settings

_ALGORITHM = "HS256"


def create_access_token(
    user_id: str,
    email: str | None,
    display_name: str,
) -> str:
    """Create a signed JWT access token for the given user."""
    settings = get_settings()
    expire = datetime.now(tz=UTC) + timedelta(days=settings.jwt_expire_days)
    payload: dict[str, Any] = {
        "sub": user_id,
        "email": email,
        "display_name": display_name,
        "exp": expire,
        "iat": datetime.now(tz=UTC),
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=_ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT token.

    Returns the payload dict on success.
    Raises JWTError on invalid / expired tokens.
    """
    settings = get_settings()
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[_ALGORITHM])


__all__ = ["create_access_token", "decode_access_token", "JWTError"]
