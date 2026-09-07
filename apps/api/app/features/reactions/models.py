"""Reaction ORM model.

Reactions are transient in nature (emoji bursts) but we persist them for:
- Analytics / post-meeting summaries.
- Replaying a meeting "timeline" in a future feature.

Reactions are NOT soft-deleted.
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.common.enums import ReactionType
from app.core.database import Base


def _uuid4_str() -> str:
    return str(uuid.uuid4())


class Reaction(Base):
    """An emoji reaction sent by a participant during a meeting."""

    __tablename__ = "reactions"

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
    participant_id: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        comment="Opaque participant session ID of the reactor",
    )
    display_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Denormalised sender name for display in reaction toast",
    )
    reaction_type: Mapped[ReactionType] = mapped_column(
        SAEnum(
            ReactionType,
            name="reaction_type",
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # ---------------------------------------------------------------------------
    # Relationships
    # ---------------------------------------------------------------------------
    meeting: Mapped["Meeting"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Meeting",
        back_populates="reactions",
        lazy="select",
    )

    def __repr__(self) -> str:
        return (
            f"<Reaction type={self.reaction_type.value!r} participant_id={self.participant_id!r}>"
        )
