"""Participant Pydantic schemas."""

from datetime import datetime

from pydantic import BaseModel, Field

from app.common.enums import ParticipantRole
from app.features.meetings.schemas import MeetingResponse


class JoinMeetingResponse(BaseModel):
    """Response from joining a meeting — includes participant session and meeting info."""

    participant_id: str = Field(
        ..., description="Opaque participant session ID — use for all WebSocket and API calls"
    )
    meeting_id: str = Field(..., description="Public 10-digit meeting ID")
    display_name: str
    role: ParticipantRole
    is_host: bool
    audio_enabled: bool
    video_enabled: bool
    meeting: MeetingResponse
    websocket_url: str = Field(..., description="WebSocket URL to connect to the meeting room")


class ParticipantResponse(BaseModel):
    """A participant's current state within a meeting."""

    model_config = {"from_attributes": True}

    participant_id: str
    meeting_id: str
    display_name: str
    role: ParticipantRole
    is_host: bool
    audio_enabled: bool
    video_enabled: bool
    screen_sharing: bool
    hand_raised: bool
    muted_by_host: bool
    removed_from_meeting: bool = False
    is_active: bool
    joined_at: datetime
    left_at: datetime | None


class AudioStateRequest(BaseModel):
    enabled: bool = Field(..., description="True to enable, False to disable microphone")


class VideoStateRequest(BaseModel):
    enabled: bool = Field(..., description="True to enable, False to disable camera")


class ScreenShareRequest(BaseModel):
    sharing: bool = Field(..., description="True to start sharing, False to stop")
