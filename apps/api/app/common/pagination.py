"""Pagination helpers shared across feature modules."""

from typing import Generic, TypeVar

from pydantic import BaseModel, Field, field_validator

from app.core.constants import (
    PAGINATION_DEFAULT_PAGE,
    PAGINATION_DEFAULT_PAGE_SIZE,
    PAGINATION_MAX_PAGE_SIZE,
)

T = TypeVar("T")


class PaginationParams(BaseModel):
    """Query-parameter model for paginated list endpoints."""

    page: int = Field(default=PAGINATION_DEFAULT_PAGE, ge=1, description="Page number (1-indexed)")
    page_size: int = Field(
        default=PAGINATION_DEFAULT_PAGE_SIZE,
        ge=1,
        le=PAGINATION_MAX_PAGE_SIZE,
        description="Number of results per page",
    )

    @field_validator("page_size")
    @classmethod
    def cap_page_size(cls, v: int) -> int:
        return min(v, PAGINATION_MAX_PAGE_SIZE)

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size

    @property
    def limit(self) -> int:
        return self.page_size


class PaginatedResponse(BaseModel, Generic[T]):
    """Wrapper for paginated list responses."""

    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int

    @classmethod
    def build(
        cls,
        items: list[T],
        total: int,
        pagination: PaginationParams,
    ) -> "PaginatedResponse[T]":
        total_pages = max(1, -(-total // pagination.page_size))  # ceiling division
        return cls(
            items=items,
            total=total,
            page=pagination.page,
            page_size=pagination.page_size,
            total_pages=total_pages,
        )
