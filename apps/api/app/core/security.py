"""Cryptographic security utilities.

Rules:
- Use secrets module for all token/ID generation (cryptographically secure PRNG).
- Never use random.randint() for anything security-sensitive.
- Passcodes must NEVER appear in log output.
"""

import secrets
import string

# ---------------------------------------------------------------------------
# Meeting ID generation
# ---------------------------------------------------------------------------
# Zoom uses a 10 or 11-digit numeric ID.  We generate a 10-digit integer
# formatted as a string, avoiding leading zeros by generating the first
# digit separately.
_MEETING_ID_LENGTH = 10


def generate_meeting_id() -> str:
    """Generate a cryptographically secure Zoom-like 10-digit numeric meeting ID.

    The result is NOT sequential and NOT derived from the database primary key,
    preventing enumeration attacks.
    """
    first_digit = secrets.choice(string.digits[1:])  # 1-9, no leading zero
    remaining = "".join(secrets.choice(string.digits) for _ in range(_MEETING_ID_LENGTH - 1))
    return first_digit + remaining


# ---------------------------------------------------------------------------
# Passcode generation
# ---------------------------------------------------------------------------
_PASSCODE_ALPHABET = string.ascii_letters + string.digits
_PASSCODE_LENGTH = 6


def generate_passcode() -> str:
    """Generate a 6-character alphanumeric meeting passcode.

    Returns a human-friendly passcode suitable for display in meeting info.
    MUST NOT be logged.
    """
    return "".join(secrets.choice(_PASSCODE_ALPHABET) for _ in range(_PASSCODE_LENGTH))


# ---------------------------------------------------------------------------
# Invite token generation
# ---------------------------------------------------------------------------
# URL-safe base64 token, no padding characters.
_INVITE_TOKEN_BYTES = 32  # 256 bits of entropy


def generate_invite_token() -> str:
    """Generate a cryptographically secure URL-safe invite token.

    The invite link format is /join/{token}, therefore the token must be:
    - URL-safe (no +/= characters)
    - Opaque (no relationship to the meeting ID or host)
    - High-entropy (collision-resistant)
    """
    return secrets.token_urlsafe(_INVITE_TOKEN_BYTES)


# ---------------------------------------------------------------------------
# Participant ID generation
# ---------------------------------------------------------------------------
# Short, URL-safe identifier unique within a meeting session.
_PARTICIPANT_ID_BYTES = 16  # 128 bits — more than sufficient


def generate_participant_id() -> str:
    """Generate a unique participant session identifier.

    Distinct from the database UUID — this is the ID exposed to clients and
    used for WebSocket routing and host-control operations.
    """
    return secrets.token_urlsafe(_PARTICIPANT_ID_BYTES)
