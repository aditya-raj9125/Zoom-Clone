"""Chat message ORM model.

Chat is a first-class domain — it has its own table, repository, service and router.
It does NOT share a table with meeting_events (which is an audit log).
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def _uuid4_str() -> str:
    return str(uuid.uuid4())


class ChatMessage(Base):
    """A chat message sent during a meeting."""

    __tablename__ = "chat_messages"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=_uuid4_str,
    )
    meeting_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False,
    )
    # Stored as the opaque participant_id (not the DB UUID) to survive
    # participant model changes and remain stable in the chat history.
    participant_id: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        comment="Opaque participant session ID of the sender",
    )
    display_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Sender display name — denormalised for historical accuracy",
    )
    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="Chat message text — max 4000 characters enforced in service layer",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    # Soft delete — messages can be deleted by the sender/host but we keep
    # the row so other clients don't lose message ordering context.
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Set when message is soft-deleted",
    )

    # ---------------------------------------------------------------------------
    # Relationships
    # ---------------------------------------------------------------------------
    meeting: Mapped["Meeting"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Meeting",
        back_populates="chat_messages",
        lazy="select",
    )

    # ---------------------------------------------------------------------------
    # Indexes
    # ---------------------------------------------------------------------------
    __table_args__ = (
        # meeting_id: fetch all messages for a meeting
        Index("ix_chat_messages_meeting_id", "meeting_id"),
        # created_at: chronological ordering — very frequent sort operation
        Index("ix_chat_messages_created_at", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<ChatMessage id={self.id} participant_id={self.participant_id!r}>"
