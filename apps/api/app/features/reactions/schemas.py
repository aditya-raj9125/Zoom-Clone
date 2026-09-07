"""Reaction Pydantic schemas."""

from datetime import datetime

from pydantic import BaseModel, Field

from app.common.enums import ReactionType


class ReactionCreate(BaseModel):
    """Request body for POST /api/v1/meetings/{meeting_id}/reactions."""

    participant_id: str = Field(..., description="Opaque participant ID of the reactor")
    reaction_type: ReactionType = Field(..., description="Emoji reaction type")


class ReactionResponse(BaseModel):
    """A single reaction returned by the API or broadcast via WebSocket."""

    model_config = {"from_attributes": True}

    id: str
    meeting_id: str
    participant_id: str
    display_name: str
    reaction_type: ReactionType
    created_at: datetime
