"""Meeting service — all business logic for meeting creation, scheduling, and lifecycle.

Flow:
    Router → MeetingService → MeetingRepository / ParticipantRepository / MeetingEventRepository
                            → MeetingStateMachine (for state transitions)
                            → generator (for IDs / tokens)
                            → ConnectionManager (for broadcasts)
"""

import json
import logging
import uuid
from datetime import UTC, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import MeetingEventType, MeetingStatus, MeetingType, ParticipantRole
from app.common.pagination import PaginationParams
from app.common.utils import utcnow
from app.core.constants import DURATION_MAX_MINUTES, DURATION_MIN_MINUTES
from app.core.exceptions import (
    DuplicateMeetingError,
    InvalidDurationError,
    InvalidPasscodeError,
    InvalidScheduleTimeError,
    MeetingNotFoundError,
    MeetingNotJoinableError,
    UnauthorizedHostActionError,
)
from app.features.meetings.generator import (
    generate_meeting_invite_token,
    generate_meeting_participant_id,
    generate_meeting_passcode,
    generate_unique_meeting_id,
)
from app.features.meetings.models import Meeting, MeetingEvent, MeetingParticipant
from app.features.meetings.repository import MeetingEventRepository, MeetingRepository
from app.features.meetings.schemas import (
    CreateInstantMeetingRequest,
    MeetingListItem,
    MeetingResponse,
    ScheduleMeetingRequest,
)
from app.features.meetings.state_machine import MeetingStateMachine
from app.features.participants.repository import ParticipantRepository
from app.features.realtime.events import make_meeting_ended, make_meeting_started
from app.features.realtime.manager import connection_manager
from app.features.users.models import User

logger = logging.getLogger(__name__)


class MeetingService:
    """Orchestrates all meeting business rules.

    Depends on:
    - MeetingRepository
    - ParticipantRepository
    - MeetingEventRepository
    - MeetingStateMachine (static — no injection needed)
    - connection_manager (singleton)
    """

    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._meeting_repo = MeetingRepository(db)
        self._participant_repo = ParticipantRepository(db)
        self._event_repo = MeetingEventRepository(db)

    # ---------------------------------------------------------------------------
    # Internal helpers
    # ---------------------------------------------------------------------------

    async def _generate_unique_meeting_id(self) -> str:
        """Generate a meeting ID guaranteed not to exist in the database."""
        for _ in range(10):  # Retry up to 10 times (collision is astronomically unlikely)
            candidate = generate_unique_meeting_id()
            if not await self._meeting_repo.meeting_id_exists(candidate):
                return candidate
        raise DuplicateMeetingError("Could not generate a unique meeting ID after retries.")

    async def _generate_unique_invite_token(self) -> str:
        for _ in range(10):
            candidate = generate_meeting_invite_token()
            if not await self._meeting_repo.invite_token_exists(candidate):
                return candidate
        raise DuplicateMeetingError("Could not generate a unique invite token after retries.")

    def _build_invite_link(self, invite_token: str) -> str:
        from app.core.config import get_settings

        settings = get_settings()
        # For development: use the configured origins; take the first one.
        base = (
            settings.cors_origins_list[0] if settings.cors_origins_list else "http://localhost:3000"
        )
        return f"{base}/join/{invite_token}"

    def _build_meeting_response(
        self,
        meeting: Meeting,
        participant_count: int = 0,
        host_participant_id: str | None = None,
    ) -> MeetingResponse:
        resolved_host_pid = host_participant_id
        if resolved_host_pid is None and getattr(meeting, "participants", None):
            for p in meeting.participants:
                if getattr(p, "is_host", False) and getattr(p, "is_active", True):
                    resolved_host_pid = p.participant_id
                    break

        host_info = None
        if meeting.host:
            from app.features.meetings.schemas import MeetingHostInfo

            host_info = MeetingHostInfo(
                id=str(meeting.host.id),
                display_name=meeting.host.display_name,
                participant_id=resolved_host_pid,
            )
        return MeetingResponse(
            id=str(meeting.id),
            meeting_id=meeting.meeting_id,
            title=meeting.title,
            description=meeting.description,
            status=meeting.status,
            meeting_type=meeting.meeting_type,
            invite_token=meeting.invite_token,
            invite_link=self._build_invite_link(meeting.invite_token),
            passcode=meeting.passcode,
            host=host_info,
            host_participant_id=resolved_host_pid,
            scheduled_start_at=meeting.scheduled_start_at,
            scheduled_end_at=meeting.scheduled_end_at,
            actual_started_at=meeting.actual_started_at,
            actual_ended_at=meeting.actual_ended_at,
            participant_count=participant_count,
            created_at=meeting.created_at,
            updated_at=meeting.updated_at,
        )

    async def _record_event(
        self,
        meeting_internal_id: str,
        event_type: MeetingEventType,
        participant_id: str | None = None,
        metadata: dict | None = None,
    ) -> None:
        event = MeetingEvent(
            id=str(uuid.uuid4()),
            meeting_id=meeting_internal_id,
            participant_id=participant_id,
            event_type=event_type,
            metadata_=json.dumps(metadata) if metadata else None,
        )
        await self._event_repo.create(event)

    # ---------------------------------------------------------------------------
    # Create instant meeting
    # ---------------------------------------------------------------------------

    async def create_instant_meeting(
        self,
        request: CreateInstantMeetingRequest,
        host: User,
    ) -> MeetingResponse:
        """Create an instant meeting and return the full meeting response.

        Steps (atomic transaction):
        1. Generate unique meeting_id, passcode, invite_token.
        2. Create Meeting row.
        3. Create host MeetingParticipant row.
        4. Record MEETING_CREATED event.
        """
        meeting_id = await self._generate_unique_meeting_id()
        invite_token = await self._generate_unique_invite_token()
        passcode = generate_meeting_passcode()
        participant_id = generate_meeting_participant_id()
        now = utcnow()

        meeting = Meeting(
            id=str(uuid.uuid4()),
            meeting_id=meeting_id,
            title=request.title or f"{host.display_name}'s Zoom Meeting",
            description=request.description,
            host_user_id=host.id,
            passcode=passcode,
            invite_token=invite_token,
            status=MeetingStatus.LIVE,  # Instant meetings are immediately LIVE
            meeting_type=MeetingType.INSTANT,
            actual_started_at=now,
        )
        meeting = await self._meeting_repo.create(meeting)

        # Create host participant
        host_participant = MeetingParticipant(
            id=str(uuid.uuid4()),
            meeting_id=meeting.id,
            user_id=host.id,
            participant_id=participant_id,
            display_name=host.display_name,
            role=ParticipantRole.HOST,
            is_host=True,
            joined_at=now,
            is_active=True,
            audio_enabled=True,
            video_enabled=True,
        )
        await self._participant_repo.create(host_participant)

        # Audit event
        await self._record_event(
            str(meeting.id),
            MeetingEventType.MEETING_CREATED,
            participant_id=participant_id,
            metadata={"meeting_type": "instant", "host": host.display_name},
        )
        await self._record_event(
            str(meeting.id),
            MeetingEventType.MEETING_STARTED,
            participant_id=participant_id,
        )

        await self._db.commit()
        await self._db.refresh(meeting)

        logger.info("Instant meeting created: meeting_id=%s host=%s", meeting_id, host.display_name)
        return self._build_meeting_response(
            meeting, participant_count=1, host_participant_id=participant_id
        )

    # ---------------------------------------------------------------------------
    # Schedule meeting
    # ---------------------------------------------------------------------------

    async def schedule_meeting(
        self,
        request: ScheduleMeetingRequest,
        host: User,
    ) -> MeetingResponse:
        """Create a scheduled meeting.

        Validates:
        - Scheduled time is in the future.
        - Duration is within bounds.
        """
        now = utcnow()

        # Normalise to UTC
        start_at = request.scheduled_start_at.astimezone(UTC).replace(tzinfo=UTC)

        if start_at <= now:
            raise InvalidScheduleTimeError("Scheduled start time must be in the future.")

        if not (DURATION_MIN_MINUTES <= request.duration_minutes <= DURATION_MAX_MINUTES):
            raise InvalidDurationError()

        end_at = start_at + timedelta(minutes=request.duration_minutes)

        meeting_id = await self._generate_unique_meeting_id()
        invite_token = await self._generate_unique_invite_token()
        passcode = generate_meeting_passcode()

        meeting = Meeting(
            id=str(uuid.uuid4()),
            meeting_id=meeting_id,
            title=request.title,
            description=request.description,
            host_user_id=host.id,
            passcode=passcode,
            invite_token=invite_token,
            status=MeetingStatus.SCHEDULED,
            meeting_type=MeetingType.SCHEDULED,
            scheduled_start_at=start_at,
            scheduled_end_at=end_at,
        )
        meeting = await self._meeting_repo.create(meeting)

        await self._record_event(
            str(meeting.id),
            MeetingEventType.MEETING_CREATED,
            metadata={
                "meeting_type": "scheduled",
                "scheduled_start_at": start_at.isoformat(),
                "host": host.display_name,
            },
        )

        await self._db.commit()
        await self._db.refresh(meeting)

        logger.info(
            "Scheduled meeting created: meeting_id=%s start=%s", meeting_id, start_at.isoformat()
        )
        return self._build_meeting_response(meeting, participant_count=0)

    # ---------------------------------------------------------------------------
    # Get meeting
    # ---------------------------------------------------------------------------

    async def get_meeting(self, meeting_id: str) -> MeetingResponse:
        meeting = await self._meeting_repo.get_by_meeting_id(meeting_id)
        if meeting is None:
            raise MeetingNotFoundError()
        count = await self._meeting_repo.active_participant_count(str(meeting.id))
        return self._build_meeting_response(meeting, participant_count=count)

    # ---------------------------------------------------------------------------
    # Upcoming meetings
    # ---------------------------------------------------------------------------

    async def list_upcoming(self, host_user_id: str) -> list[MeetingListItem]:
        meetings = await self._meeting_repo.list_upcoming(host_user_id, utcnow())
        return [
            MeetingListItem(
                id=str(m.id),
                meeting_id=m.meeting_id,
                title=m.title,
                status=m.status,
                meeting_type=m.meeting_type,
                invite_link=self._build_invite_link(m.invite_token),
                scheduled_start_at=m.scheduled_start_at,
                actual_started_at=m.actual_started_at,
                actual_ended_at=m.actual_ended_at,
                participant_count=await self._meeting_repo.active_participant_count(str(m.id)),
                created_at=m.created_at,
            )
            for m in meetings
        ]

    # ---------------------------------------------------------------------------
    # Recent meetings
    # ---------------------------------------------------------------------------

    async def list_recent(
        self, host_user_id: str, pagination: PaginationParams
    ) -> tuple[list[MeetingListItem], int]:
        meetings, total = await self._meeting_repo.list_recent(host_user_id, pagination)
        items = [
            MeetingListItem(
                id=str(m.id),
                meeting_id=m.meeting_id,
                title=m.title,
                status=m.status,
                meeting_type=m.meeting_type,
                invite_link=self._build_invite_link(m.invite_token),
                scheduled_start_at=m.scheduled_start_at,
                actual_started_at=m.actual_started_at,
                actual_ended_at=m.actual_ended_at,
                participant_count=await self._meeting_repo.active_participant_count(str(m.id)),
                created_at=m.created_at,
            )
            for m in meetings
        ]
        return items, total

    # ---------------------------------------------------------------------------
    # Start meeting
    # ---------------------------------------------------------------------------

    async def start_meeting(self, meeting_id: str, actor_participant_id: str) -> MeetingResponse:
        """Transition a SCHEDULED/WAITING meeting to LIVE.

        Only the host may start the meeting.
        """
        meeting = await self._meeting_repo.get_by_meeting_id(meeting_id)
        if meeting is None:
            raise MeetingNotFoundError()

        # Authorise — actor must be the active host
        host = await self._participant_repo.get_active_host(str(meeting.id))
        if host is None or host.participant_id != actor_participant_id:
            raise UnauthorizedHostActionError("Only the meeting host may start the meeting.")

        # Validate transition
        MeetingStateMachine.transition(meeting.status, MeetingStatus.LIVE)

        now = utcnow()
        meeting.status = MeetingStatus.LIVE
        meeting.actual_started_at = now
        await self._meeting_repo.save(meeting)

        await self._record_event(
            str(meeting.id),
            MeetingEventType.MEETING_STARTED,
            participant_id=actor_participant_id,
        )
        await self._db.commit()

        # Broadcast
        await connection_manager.broadcast_to_meeting(
            meeting_id,
            make_meeting_started(meeting_id, actor_participant_id),
        )

        logger.info("Meeting started: meeting_id=%s", meeting_id)
        count = await self._meeting_repo.active_participant_count(str(meeting.id))
        return self._build_meeting_response(meeting, participant_count=count)

    # ---------------------------------------------------------------------------
    # End meeting
    # ---------------------------------------------------------------------------

    async def end_meeting(self, meeting_id: str, actor_participant_id: str) -> MeetingResponse:
        """Transition a LIVE meeting to ENDED.

        Only the host may end the meeting.
        All active participants are marked as left.
        """
        meeting = await self._meeting_repo.get_by_meeting_id(meeting_id)
        if meeting is None:
            raise MeetingNotFoundError()

        host = await self._participant_repo.get_active_host(str(meeting.id))
        if host is None or host.participant_id != actor_participant_id:
            raise UnauthorizedHostActionError("Only the meeting host may end the meeting.")

        MeetingStateMachine.transition(meeting.status, MeetingStatus.ENDED)

        now = utcnow()
        meeting.status = MeetingStatus.ENDED
        meeting.actual_ended_at = now
        await self._meeting_repo.save(meeting)

        # Mark all active participants as left
        await self._participant_repo.deactivate_all(str(meeting.id), now)

        await self._record_event(
            str(meeting.id),
            MeetingEventType.MEETING_ENDED,
            participant_id=actor_participant_id,
        )
        await self._db.commit()

        # Broadcast and close all WebSocket connections
        await connection_manager.broadcast_to_meeting(meeting_id, make_meeting_ended(meeting_id))
        await connection_manager.disconnect_meeting(meeting_id)

        logger.info("Meeting ended: meeting_id=%s", meeting_id)
        return self._build_meeting_response(meeting, participant_count=0)

    # ---------------------------------------------------------------------------
    # Join validation (called by ParticipantService to avoid duplicated logic)
    # ---------------------------------------------------------------------------

    async def resolve_and_validate_join(
        self,
        meeting: Meeting,
        passcode: str | None,
    ) -> None:
        """Validate that a meeting can be joined.

        Raises:
            MeetingNotJoinableError: Meeting is not in a joinable state.
            InvalidPasscodeError:   Passcode is wrong.
        """
        if not MeetingStateMachine.can_join(meeting.status):
            raise MeetingNotJoinableError(
                f"Meeting cannot be joined in status '{meeting.status.value}'."
            )
        # Passcode check (always required in this implementation)
        if passcode is None or passcode.strip() != meeting.passcode:
            raise InvalidPasscodeError()
