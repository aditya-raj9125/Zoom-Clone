"""User SQLAlchemy ORM model.

Design decisions:
- UUID primary key prevents enumeration. Stored as VARCHAR(36) string for SQLite compat.
- email is nullable (assignment has no login requirement) but must be unique
  when present to support future authentication.
- is_default_user flag identifies the seeded application user without
  requiring a separate lookup table.
- Designed so authentication can be added later without schema rewrite.
"""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def _uuid4_str() -> str:
    """Return a new UUID4 as a lowercase string (SQLite-compatible)."""
    return str(uuid.uuid4())


class User(Base):
    """Application user.

    In the current phase there is no login flow.  A single default user
    ("Aditya Raj") is seeded and acts as the host for all meetings created
    through the application UI.

    The schema is intentionally forward-compatible with authentication:
    add password_hash / oauth_provider fields in a future migration.
    """

    __tablename__ = "users"

    # ---------------------------------------------------------------------------
    # Primary key — UUID to prevent sequential enumeration (stored as string)
    # ---------------------------------------------------------------------------
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=_uuid4_str,
    )

    # ---------------------------------------------------------------------------
    # Display identity
    # ---------------------------------------------------------------------------
    display_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Human-readable name shown in the meeting UI",
    )
    email: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        unique=True,
        index=True,
        comment="Optional email — unique when present for future auth",
    )
    avatar_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
        comment="URL of the user's profile picture",
    )

    # ---------------------------------------------------------------------------
    # Authentication credentials
    # ---------------------------------------------------------------------------
    password_hash: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        comment="Bcrypt password hash for email+password login",
    )
    oauth_provider: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        comment="OAuth provider name e.g. 'google'",
    )
    oauth_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        index=True,
        comment="Unique identifier from OAuth provider (sub claim)",
    )

    # ---------------------------------------------------------------------------
    # Application flags
    # ---------------------------------------------------------------------------
    is_default_user: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        comment="True for the seeded default application user",
    )

    # ---------------------------------------------------------------------------
    # Timestamps — always UTC
    # ---------------------------------------------------------------------------
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # ---------------------------------------------------------------------------
    # Relationships
    # ---------------------------------------------------------------------------
    meetings: Mapped[list["Meeting"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Meeting",
        back_populates="host",
        foreign_keys="[Meeting.host_user_id]",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} display_name={self.display_name!r}>"
