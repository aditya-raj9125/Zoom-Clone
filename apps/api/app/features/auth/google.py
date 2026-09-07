"""Google OAuth 2.0 helpers.

Flow:
    1. Frontend redirects user to GET /auth/google/login
    2. Backend redirects to Google consent screen (get_google_auth_url)
    3. Google redirects back to /auth/google/callback?code=...&state=...
    4. Backend calls exchange_google_code → gets access_token → fetches user profile
    5. Backend upserts user, creates JWT, sets cookie, redirects to frontend /dashboard
"""

from dataclasses import dataclass

import httpx

from app.core.config import get_settings

_GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
_GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
_GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

_SCOPES = "openid email profile"


@dataclass
class GoogleUserInfo:
    google_id: str  # 'sub' claim
    email: str
    display_name: str
    picture: str | None


def get_google_auth_url(state: str = "") -> str:
    """Return the Google OAuth consent screen URL."""
    settings = get_settings()
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": _SCOPES,
        "access_type": "offline",
        "prompt": "select_account",
        "state": state,
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return f"{_GOOGLE_AUTH_URL}?{query}"


async def exchange_google_code(code: str) -> GoogleUserInfo:
    """Exchange the authorisation code for user profile data.

    Raises:
        ValueError: If token exchange or profile fetch fails.
    """
    settings = get_settings()

    async with httpx.AsyncClient() as client:
        # Exchange code → access_token
        token_resp = await client.post(
            _GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": settings.google_redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        if token_resp.status_code != 200:
            raise ValueError(f"Google token exchange failed: {token_resp.text}")

        access_token = token_resp.json().get("access_token")
        if not access_token:
            raise ValueError("No access_token in Google response")

        # Fetch user profile
        profile_resp = await client.get(
            _GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if profile_resp.status_code != 200:
            raise ValueError(f"Google profile fetch failed: {profile_resp.text}")

        data = profile_resp.json()
        return GoogleUserInfo(
            google_id=data["sub"],
            email=data["email"],
            display_name=data.get("name", data["email"].split("@")[0]),
            picture=data.get("picture"),
        )


__all__ = ["GoogleUserInfo", "exchange_google_code", "get_google_auth_url"]
