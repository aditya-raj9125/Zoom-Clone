"""Meeting, MeetingParticipant, and MeetingEvent ORM models.

Design decisions:
- Three distinct identifiers per meeting:
    id           — internal UUID stored as VARCHAR(36) string (SQLite compat)
    meeting_id   — public 10-digit numeric ID (Zoom-like)
    invite_token — opaque URL-safe token for invite links
- MeetingParticipant has its own participant_id (opaque, URL-safe) distinct
  from the database UUID, preventing IDOR attacks.
- Cascade behavior is deliberate: historical meeting records must survive
  even if a user is deleted (SET NULL on host_user_id FK).
- Indexes are documented inline with their justification.
"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    func,
)
from sqlalchemy import (
    Enum as SAEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.common.enums import MeetingEventType, MeetingStatus, MeetingType, ParticipantRole
from app.core.database import Base

if TYPE_CHECKING:
    from app.features.users.models import User


def _uuid4_str() -> str:
    """Return a new UUID4 as a lowercase string (SQLite-compatible)."""
    return str(uuid.uuid4())


class Meeting(Base):
    """A meeting session — either instant or scheduled."""

    __tablename__ = "meetings"

    # ---------------------------------------------------------------------------
    # Identifiers (three distinct ones for different purposes)
    # ---------------------------------------------------------------------------
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=_uuid4_str,
        comment="Internal UUID string — never exposed to API clients",
    )
    meeting_id: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        unique=True,
        comment="Public 10-digit Zoom-like numeric ID (e.g. 8991757429)",
    )
    invite_token: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        unique=True,
        comment="Opaque URL-safe token for shareable invite links",
    )

    # ---------------------------------------------------------------------------
    # Meeting metadata
    # ---------------------------------------------------------------------------
    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        comment="Meeting title displayed in UI",
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        comment="Optional meeting description",
    )

    # ---------------------------------------------------------------------------
    # Host reference — SET NULL on delete preserves historical records
    # ---------------------------------------------------------------------------
    host_user_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        comment="FK → users.id — nullable so record survives user deletion",
    )

    # ---------------------------------------------------------------------------
    # Security
    # ---------------------------------------------------------------------------
    passcode: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="Meeting passcode — NEVER logged",
    )

    # ---------------------------------------------------------------------------
    # State
    # ---------------------------------------------------------------------------
    status: Mapped[MeetingStatus] = mapped_column(
        SAEnum(
            MeetingStatus, name="meeting_status", values_callable=lambda x: [e.value for e in x]
        ),
        nullable=False,
        default=MeetingStatus.SCHEDULED,
        comment="Lifecycle state — transitions validated by MeetingStateMachine",
    )
    meeting_type: Mapped[MeetingType] = mapped_column(
        SAEnum(MeetingType, name="meeting_type", values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        comment="INSTANT or SCHEDULED",
    )

    # ---------------------------------------------------------------------------
    # Scheduling
    # ---------------------------------------------------------------------------
    scheduled_start_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Intended start time (UTC) — only set for SCHEDULED meetings",
    )
    scheduled_end_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Intended end time (UTC) — derived from duration",
    )

    # ---------------------------------------------------------------------------
    # Actual lifecycle timestamps
    # ---------------------------------------------------------------------------
    actual_started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="When the host actually started the meeting",
    )
    actual_ended_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="When the meeting was ended",
    )

    # ---------------------------------------------------------------------------
    # Audit timestamps
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
    host: Mapped["User | None"] = relationship(
        "User",
        back_populates="meetings",
        foreign_keys=[host_user_id],
        lazy="selectin",
    )
    participants: Mapped[list["MeetingParticipant"]] = relationship(
        "MeetingParticipant",
        back_populates="meeting",
        lazy="selectin",
    )
    events: Mapped[list["MeetingEvent"]] = relationship(
        "MeetingEvent",
        back_populates="meeting",
        lazy="select",
    )
    chat_messages: Mapped[list["ChatMessage"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "ChatMessage",
        back_populates="meeting",
        lazy="select",
    )
    reactions: Mapped[list["Reaction"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Reaction",
        back_populates="meeting",
        lazy="select",
    )

    # ---------------------------------------------------------------------------
    # Table-level indexes
    # ---------------------------------------------------------------------------
    __table_args__ = (
        Index("ix_meetings_meeting_id", "meeting_id"),
        Index("ix_meetings_invite_token", "invite_token"),
        Index("ix_meetings_host_user_id", "host_user_id"),
        Index("ix_meetings_status", "status"),
        Index("ix_meetings_scheduled_start_at", "scheduled_start_at"),
    )

    def __repr__(self) -> str:
        return f"<Meeting meeting_id={self.meeting_id!r} status={self.status.value!r}>"


class MeetingParticipant(Base):
    """A single participant session within a meeting."""

    __tablename__ = "meeting_participants"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=_uuid4_str,
        comment="Internal UUID string — not exposed to clients",
    )
    meeting_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False,
        comment="FK → meetings.id",
    )
    user_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        comment="FK → users.id — null for anonymous/guest participants",
    )

    # ---------------------------------------------------------------------------
    # Public participant identifier
    # ---------------------------------------------------------------------------
    participant_id: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        unique=True,
        comment="Opaque URL-safe participant ID exposed to clients and WebSocket",
    )

    # ---------------------------------------------------------------------------
    # Identity
    # ---------------------------------------------------------------------------
    display_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Name shown in the Participants panel",
    )
    role: Mapped[ParticipantRole] = mapped_column(
        SAEnum(
            ParticipantRole,
            name="participant_role",
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=ParticipantRole.PARTICIPANT,
    )
    is_host: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        comment="Denormalised flag for fast host checks without enum comparison",
    )

    # ---------------------------------------------------------------------------
    # Session lifecycle
    # ---------------------------------------------------------------------------
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    left_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Set when the participant leaves or is removed",
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        comment="True while the participant is in the meeting",
    )

    # ---------------------------------------------------------------------------
    # Media state (signaling only — actual media is WebRTC)
    # ---------------------------------------------------------------------------
    audio_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    video_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    screen_sharing: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    hand_raised: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # ---------------------------------------------------------------------------
    # Host control state
    # ---------------------------------------------------------------------------
    muted_by_host: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    removed_from_meeting: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # ---------------------------------------------------------------------------
    # Audit timestamps
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
    meeting: Mapped[Meeting] = relationship(
        "Meeting",
        back_populates="participants",
        lazy="selectin",
    )

    # ---------------------------------------------------------------------------
    # Indexes
    # ---------------------------------------------------------------------------
    __table_args__ = (
        Index("ix_meeting_participants_meeting_id", "meeting_id"),
        Index("ix_meeting_participants_participant_id", "participant_id"),
        Index("ix_meeting_participants_is_active", "is_active"),
    )

    def __repr__(self) -> str:
        return (
            f"<MeetingParticipant participant_id={self.participant_id!r} "
            f"display_name={self.display_name!r} is_active={self.is_active}>"
        )


class MeetingEvent(Base):
    """Immutable audit log of events that occurred during a meeting."""

    __tablename__ = "meeting_events"

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
    participant_id: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
        comment="Opaque participant session ID — null for system events",
    )
    event_type: Mapped[MeetingEventType] = mapped_column(
        SAEnum(
            MeetingEventType,
            name="meeting_event_type",
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
    )
    metadata_: Mapped[str | None] = mapped_column(
        "metadata",
        Text,
        nullable=True,
        comment="JSON-encoded event metadata for context (display_name, role, etc.)",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # ---------------------------------------------------------------------------
    # Relationships
    # ---------------------------------------------------------------------------
    meeting: Mapped[Meeting] = relationship(
        "Meeting",
        back_populates="events",
        lazy="select",
    )

    # ---------------------------------------------------------------------------
    # Indexes
    # ---------------------------------------------------------------------------
    __table_args__ = (
        Index("ix_meeting_events_meeting_id", "meeting_id"),
        Index("ix_meeting_events_created_at", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<MeetingEvent type={self.event_type.value!r} meeting_id={self.meeting_id}>"
