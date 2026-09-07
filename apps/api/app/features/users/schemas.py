"""User Pydantic schemas (DTOs)."""

from datetime import datetime

from pydantic import BaseModel, Field


class UserResponse(BaseModel):
    """Public user representation returned by the API."""

    model_config = {"from_attributes": True}

    id: str
    display_name: str = Field(..., description="Name shown in meeting UI")
    email: str | None = Field(None, description="Email address if set")
    avatar_url: str | None = Field(None, description="Profile picture URL")
    is_default_user: bool
    created_at: datetime
