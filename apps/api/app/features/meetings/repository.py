"""Meeting repository — database access only."""

import uuid
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import MeetingStatus
from app.common.pagination import PaginationParams
from app.features.meetings.models import Meeting, MeetingEvent, MeetingParticipant


class MeetingRepository:
    """Database access layer for the Meeting domain."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    # ---------------------------------------------------------------------------
    # Create
    # ---------------------------------------------------------------------------

    async def create(self, meeting: Meeting) -> Meeting:
        self._db.add(meeting)
        await self._db.flush()
        await self._db.refresh(meeting)
        return meeting

    # ---------------------------------------------------------------------------
    # Read
    # ---------------------------------------------------------------------------

    async def get_by_internal_id(self, meeting_uuid: uuid.UUID) -> Meeting | None:
        """Look up a meeting by its internal UUID (not the public meeting_id)."""
        result = await self._db.execute(select(Meeting).where(Meeting.id == str(meeting_uuid)))
        return result.scalar_one_or_none()

    async def get_by_meeting_id(self, meeting_id: str) -> Meeting | None:
        """Look up a meeting by its public 10-digit numeric ID."""
        result = await self._db.execute(select(Meeting).where(Meeting.meeting_id == meeting_id))
        return result.scalar_one_or_none()

    async def get_by_invite_token(self, token: str) -> Meeting | None:
        """Look up a meeting by its invite token (for invite-link join flow)."""
        result = await self._db.execute(select(Meeting).where(Meeting.invite_token == token))
        return result.scalar_one_or_none()

    async def meeting_id_exists(self, meeting_id: str) -> bool:
        """Check if a public meeting ID is already in use."""
        result = await self._db.execute(
            select(func.count()).select_from(Meeting).where(Meeting.meeting_id == meeting_id)
        )
        return (result.scalar() or 0) > 0

    async def invite_token_exists(self, token: str) -> bool:
        result = await self._db.execute(
            select(func.count()).select_from(Meeting).where(Meeting.invite_token == token)
        )
        return (result.scalar() or 0) > 0

    # ---------------------------------------------------------------------------
    # Upcoming meetings
    # ---------------------------------------------------------------------------

    async def list_upcoming(
        self,
        host_user_id: str,
        now: datetime,
    ) -> list[Meeting]:
        """Return future scheduled meetings for a given user, ascending by start time."""
        result = await self._db.execute(
            select(Meeting)
            .where(
                Meeting.host_user_id == host_user_id,
                Meeting.scheduled_start_at > now,
                Meeting.status.in_([MeetingStatus.SCHEDULED.value, MeetingStatus.WAITING.value]),
            )
            .order_by(Meeting.scheduled_start_at.asc())
        )
        return list(result.scalars().all())

    # ---------------------------------------------------------------------------
    # Recent meetings
    # ---------------------------------------------------------------------------

    async def list_recent(
        self,
        host_user_id: str,
        pagination: PaginationParams,
    ) -> tuple[list[Meeting], int]:
        """Return recently created/ended meetings for a given user (paginated)."""
        base_query = select(Meeting).where(
            Meeting.host_user_id == host_user_id,
        )
        count_result = await self._db.execute(
            select(func.count()).select_from(base_query.subquery())
        )
        total = count_result.scalar() or 0

        result = await self._db.execute(
            base_query.order_by(Meeting.created_at.desc())
            .offset(pagination.offset)
            .limit(pagination.limit)
        )
        return list(result.scalars().all()), total

    # ---------------------------------------------------------------------------
    # Update
    # ---------------------------------------------------------------------------

    async def save(self, meeting: Meeting) -> Meeting:
        """Persist changes to an already-tracked meeting instance."""
        await self._db.flush()
        await self._db.refresh(meeting)
        return meeting

    # ---------------------------------------------------------------------------
    # Active participant count (used for MeetingListItem.participant_count)
    # ---------------------------------------------------------------------------

    async def active_participant_count(self, meeting_internal_id: str) -> int:
        result = await self._db.execute(
            select(func.count())
            .select_from(MeetingParticipant)
            .where(
                MeetingParticipant.meeting_id == meeting_internal_id,
                MeetingParticipant.is_active == True,  # noqa: E712
            )
        )
        return result.scalar() or 0


class MeetingEventRepository:
    """Append-only repository for meeting audit events."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(self, event: MeetingEvent) -> MeetingEvent:
        self._db.add(event)
        await self._db.flush()
        return event

    async def list_by_meeting(self, meeting_internal_id: str) -> list[MeetingEvent]:
        result = await self._db.execute(
            select(MeetingEvent)
            .where(MeetingEvent.meeting_id == meeting_internal_id)
            .order_by(MeetingEvent.created_at.asc())
        )
        return list(result.scalars().all())
