"""Shared utility functions.

Keep each function focused and independently testable.
"""

from datetime import UTC, datetime


def utcnow() -> datetime:
    """Return the current UTC datetime (timezone-aware).

    Always use this instead of datetime.utcnow() which returns a naive datetime.
    All timestamps stored in the database are UTC.
    """
    return datetime.now(tz=UTC)


def format_invite_url(base_url: str, invite_token: str) -> str:
    """Build a shareable invite URL from a base URL and invite token.

    Args:
        base_url:     The application base URL (e.g. "https://zoom.example.com").
        invite_token: The meeting invite token.

    Returns:
        Full invite URL in the format: {base_url}/join/{invite_token}
    """
    return f"{base_url.rstrip('/')}/join/{invite_token}"
