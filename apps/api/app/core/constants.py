"""Application-wide constants.

Use named constants instead of magic strings wherever the same value
appears in more than one location.
"""

# ---------------------------------------------------------------------------
# Meeting ID constraints
# ---------------------------------------------------------------------------
MEETING_ID_LENGTH: int = 10
"""Length of the public numeric meeting identifier."""

# ---------------------------------------------------------------------------
# Passcode constraints
# ---------------------------------------------------------------------------
PASSCODE_LENGTH: int = 6
"""Length of the auto-generated meeting passcode."""

# ---------------------------------------------------------------------------
# Duration constraints (minutes)
# ---------------------------------------------------------------------------
DURATION_MIN_MINUTES: int = 1
DURATION_MAX_MINUTES: int = 1440  # 24 hours

# ---------------------------------------------------------------------------
# Display name constraints
# ---------------------------------------------------------------------------
DISPLAY_NAME_MIN_LENGTH: int = 1
DISPLAY_NAME_MAX_LENGTH: int = 100

# ---------------------------------------------------------------------------
# Title / description constraints
# ---------------------------------------------------------------------------
TITLE_MAX_LENGTH: int = 200
DESCRIPTION_MAX_LENGTH: int = 2000

# ---------------------------------------------------------------------------
# Chat message constraints
# ---------------------------------------------------------------------------
CHAT_MESSAGE_MAX_LENGTH: int = 4000

# ---------------------------------------------------------------------------
# Pagination
# ---------------------------------------------------------------------------
PAGINATION_DEFAULT_PAGE: int = 1
PAGINATION_DEFAULT_PAGE_SIZE: int = 20
PAGINATION_MAX_PAGE_SIZE: int = 100

# ---------------------------------------------------------------------------
# Default user
# ---------------------------------------------------------------------------
DEFAULT_USER_DISPLAY_NAME: str = "Aditya Raj"
DEFAULT_USER_EMAIL: str = "aditya.raj@zoomclone.local"
