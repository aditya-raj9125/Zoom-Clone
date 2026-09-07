"""Standard API response envelope helpers.

Every endpoint uses one of these shapes.  Consistency allows the frontend
to write a single response interceptor.

Success:    {"data": {...}, "message": "..."}
Error:      {"error": {"code": "...", "message": "..."}}
"""

from typing import Any, Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ErrorDetail(BaseModel):
    """Machine-readable error payload."""

    code: str
    message: str


class ErrorResponse(BaseModel):
    """Standard error envelope returned for all application errors."""

    error: ErrorDetail


class ApiResponse(BaseModel, Generic[T]):
    """Standard success envelope.

    Most endpoints return the data object directly as `data`, with an
    optional human-readable message.
    """

    data: T
    message: str | None = None


def success_response(data: Any, message: str | None = None) -> dict[str, Any]:
    """Build a standard success response dict (used in routers)."""
    response: dict[str, Any] = {"data": data}
    if message:
        response["message"] = message
    return response


def error_response(code: str, message: str) -> dict[str, Any]:
    """Build a standard error response dict (used in exception handlers)."""
    return {"error": {"code": code, "message": message}}
