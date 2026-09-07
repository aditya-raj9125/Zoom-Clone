"""Auth Pydantic schemas — request/response models."""

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.features.users.schemas import UserResponse


class RegisterRequest(BaseModel):
    display_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("display_name")
    @classmethod
    def strip_name(cls, v: str) -> str:
        return v.strip()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    """Returned on successful register or login."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse
