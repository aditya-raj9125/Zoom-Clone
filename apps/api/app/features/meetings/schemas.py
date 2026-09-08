"""Meeting Pydantic schemas (request DTOs and response DTOs)."""

from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.common.enums import MeetingStatus, MeetingType
from app.core.constants import (
    DESCRIPTION_MAX_LENGTH,
    DURATION_MAX_MINUTES,
    DURATION_MIN_MINUTES,
    TITLE_MAX_LENGTH,
)

# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------


class CreateInstantMeetingRequest(BaseModel):
    """Request body for POST /api/v1/meetings (instant meeting creation)."""

    title: str = Field(
        default="Zoom Meeting",
        max_length=TITLE_MAX_LENGTH,
        description="Meeting title",
    )
    description: str | None = Field(
        None,
        max_length=DESCRIPTION_MAX_LENGTH,
        description="Optional meeting description",
    )

    @field_validator("title")
    @classmethod
    def strip_title(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            return "Zoom Meeting"
        return stripped


class ScheduleMeetingRequest(BaseModel):
    """Request body for POST /api/v1/meetings/schedule."""

    title: str = Field(..., min_length=1, max_length=TITLE_MAX_LENGTH, description="Meeting title")
    description: str | None = Field(None, max_length=DESCRIPTION_MAX_LENGTH)
    scheduled_start_at: datetime = Field(..., description="Start time in UTC ISO-8601 format")
    duration_minutes: int = Field(
        ...,
        ge=DURATION_MIN_MINUTES,
        le=DURATION_MAX_MINUTES,
        description="Duration in minutes (1 - 1440)",
    )

    @field_validator("title")
    @classmethod
    def strip_title(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Title cannot be blank")
        return stripped

    @field_validator("scheduled_start_at")
    @classmethod
    def must_be_utc_aware(cls, v: datetime) -> datetime:
        """Ensure the datetime is timezone-aware (UTC expected)."""
        if v.tzinfo is None:
            raise ValueError(
                "scheduled_start_at must be timezone-aware (include UTC offset, e.g. 'Z' or '+00:00')"
            )
        return v


class MeetingJoinRequest(BaseModel):
    """Request body for POST /api/v1/meetings/join (join by meeting ID)."""

    meeting_id: str = Field(..., description="10-digit public meeting ID")
    display_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Name shown in the Participants panel",
    )
    passcode: str | None = Field(None, description="Meeting passcode if required")
    participant_id: str | None = Field(
        None,
        description="Existing opaque participant session ID used only when reconnecting",
    )

    @field_validator("display_name")
    @classmethod
    def strip_display_name(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Display name cannot be blank")
        return stripped

    @field_validator("meeting_id")
    @classmethod
    def validate_meeting_id_format(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped.isdigit():
            raise ValueError("meeting_id must be a numeric string")
        return stripped


class JoinByInviteRequest(BaseModel):
    """Request body for POST /api/v1/meetings/join-by-invite."""

    invite_token: str = Field(..., min_length=10, description="Opaque invite token from the link")
    display_name: str = Field(..., min_length=1, max_length=100)
    participant_id: str | None = Field(
        None,
        description="Existing opaque participant session ID used only when reconnecting",
    )

    @field_validator("display_name")
    @classmethod
    def strip_display_name(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Display name cannot be blank")
        return stripped


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------


class MeetingHostInfo(BaseModel):
    """Minimal host information embedded in meeting responses."""

    model_config = {"from_attributes": True}

    id: str
    display_name: str
    participant_id: str | None = None


class MeetingResponse(BaseModel):
    """Full meeting detail returned after creation or retrieval."""

    model_config = {"from_attributes": True}

    id: str = Field(..., description="Internal UUID — for debugging only")
    meeting_id: str = Field(..., description="Public 10-digit meeting ID")
    title: str
    description: str | None
    status: MeetingStatus
    meeting_type: MeetingType
    invite_token: str = Field(..., description="Token used to construct the invite link")
    invite_link: str = Field(..., description="Full shareable invite URL")
    passcode: str = Field(..., description="Meeting passcode")
    host: MeetingHostInfo | None
    host_participant_id: str | None = None
    scheduled_start_at: datetime | None
    scheduled_end_at: datetime | None
    actual_started_at: datetime | None
    actual_ended_at: datetime | None
    participant_count: int = Field(0, description="Number of currently active participants")
    created_at: datetime
    updated_at: datetime


class MeetingListItem(BaseModel):
    """Compact meeting representation for list views."""

    model_config = {"from_attributes": True}

    id: str
    meeting_id: str
    title: str
    status: MeetingStatus
    meeting_type: MeetingType
    invite_link: str
    scheduled_start_at: datetime | None
    actual_started_at: datetime | None
    actual_ended_at: datetime | None
    participant_count: int = 0
    created_at: datetime
