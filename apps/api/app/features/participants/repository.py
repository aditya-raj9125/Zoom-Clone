"""Participant repository — database access only."""

from datetime import datetime

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.features.meetings.models import MeetingParticipant


class ParticipantRepository:
    """Database access layer for MeetingParticipant."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(self, participant: MeetingParticipant) -> MeetingParticipant:
        self._db.add(participant)
        await self._db.flush()
        await self._db.refresh(participant)
        return participant

    async def get_by_participant_id(self, participant_id: str) -> MeetingParticipant | None:
        """Look up an active or historical participant session by opaque ID."""
        result = await self._db.execute(
            select(MeetingParticipant).where(MeetingParticipant.participant_id == participant_id)
        )
        return result.scalar_one_or_none()

    async def get_active_by_participant_id(self, participant_id: str) -> MeetingParticipant | None:
        result = await self._db.execute(
            select(MeetingParticipant).where(
                MeetingParticipant.participant_id == participant_id,
                MeetingParticipant.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def list_active_by_meeting(self, meeting_internal_id: str) -> list[MeetingParticipant]:
        """Return all currently active participants in a meeting."""
        result = await self._db.execute(
            select(MeetingParticipant)
            .where(
                MeetingParticipant.meeting_id == meeting_internal_id,
                MeetingParticipant.is_active == True,  # noqa: E712
            )
            .order_by(MeetingParticipant.joined_at.asc())
        )
        return list(result.scalars().all())

    async def get_active_host(self, meeting_internal_id: str) -> MeetingParticipant | None:
        """Return the active host participant for a meeting."""
        result = await self._db.execute(
            select(MeetingParticipant).where(
                MeetingParticipant.meeting_id == meeting_internal_id,
                MeetingParticipant.is_host == True,  # noqa: E712
                MeetingParticipant.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def has_active_session(self, meeting_internal_id: str, user_id: str) -> bool:
        """Check if a registered user already has an active session in the meeting."""
        result = await self._db.execute(
            select(func.count())
            .select_from(MeetingParticipant)
            .where(
                MeetingParticipant.meeting_id == meeting_internal_id,
                MeetingParticipant.user_id == user_id,
                MeetingParticipant.is_active == True,  # noqa: E712
            )
        )
        return (result.scalar() or 0) > 0

    async def save(self, participant: MeetingParticipant) -> MeetingParticipant:
        await self._db.flush()
        await self._db.refresh(participant)
        return participant

    async def deactivate_all(self, meeting_internal_id: str, left_at: datetime) -> None:
        """Mark all active participants as inactive — used when meeting ends."""
        await self._db.execute(
            update(MeetingParticipant)
            .where(
                MeetingParticipant.meeting_id == meeting_internal_id,
                MeetingParticipant.is_active == True,  # noqa: E712
            )
            .values(is_active=False, left_at=left_at)
        )

    async def mute_all_active(self, meeting_internal_id: str) -> list[MeetingParticipant]:
        """Mute all active non-host participants.  Returns affected participants."""
        # First fetch them so we can return and broadcast individual state changes.
        result = await self._db.execute(
            select(MeetingParticipant).where(
                MeetingParticipant.meeting_id == meeting_internal_id,
                MeetingParticipant.is_active == True,  # noqa: E712
                MeetingParticipant.is_host == False,  # noqa: E712
            )
        )
        participants = list(result.scalars().all())
        for p in participants:
            p.audio_enabled = False
            p.muted_by_host = True
        await self._db.flush()
        return participants
