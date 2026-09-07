"""Chat message Pydantic schemas."""

from datetime import datetime

from pydantic import BaseModel, Field

from app.core.constants import CHAT_MESSAGE_MAX_LENGTH


class ChatMessageCreate(BaseModel):
    """Request body for POST /api/v1/meetings/{meeting_id}/chat."""

    participant_id: str = Field(..., description="Sender's opaque participant ID")
    message: str = Field(
        ...,
        min_length=1,
        max_length=CHAT_MESSAGE_MAX_LENGTH,
        description="Message text (max 4000 characters)",
    )


class ChatMessageResponse(BaseModel):
    """A single chat message returned by the API."""

    model_config = {"from_attributes": True}

    id: str
    meeting_id: str = Field(..., description="Public meeting ID (not the UUID)")
    participant_id: str
    display_name: str
    message: str
    created_at: datetime
    deleted_at: datetime | None = None
