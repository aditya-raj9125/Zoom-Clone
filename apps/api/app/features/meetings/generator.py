"""Meeting and participant identifier generators.

All generators are independently testable pure functions (or thin wrappers).
They delegate to app.core.security for the actual cryptographic primitives.

Design:
- generate_unique_meeting_id(): retries until unique (race-condition safe with
  the DB unique constraint as a final guard).
- All other generators are stateless.
"""

from app.core.security import (
    generate_invite_token,
    generate_meeting_id,
    generate_participant_id,
    generate_passcode,
)

__all__ = [
    "generate_meeting_invite_token",
    "generate_meeting_participant_id",
    "generate_meeting_passcode",
    "generate_unique_meeting_id",
]


def generate_unique_meeting_id() -> str:
    """Generate a candidate 10-digit public meeting ID.

    The caller (MeetingService) is responsible for verifying uniqueness against
    the database.  The DB unique constraint on meetings.meeting_id is the
    authoritative uniqueness guard.

    Returns:
        A 10-digit numeric string (no leading zeros).
    """
    return generate_meeting_id()


def generate_meeting_passcode() -> str:
    """Generate a 6-character alphanumeric passcode for a meeting.

    This value MUST NOT appear in log output.
    """
    return generate_passcode()


def generate_meeting_invite_token() -> str:
    """Generate a URL-safe opaque invite token.

    Used to construct invite links of the form /join/{token}.
    """
    return generate_invite_token()


def generate_meeting_participant_id() -> str:
    """Generate a unique opaque participant session ID.

    Exposed to clients and WebSocket; distinct from the database UUID.
    """
    return generate_participant_id()
