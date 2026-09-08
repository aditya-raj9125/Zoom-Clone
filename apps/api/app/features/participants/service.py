"""Participant service — join, leave, host controls, and media state management."""

import json
import logging
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import MeetingEventType, ParticipantRole
from app.common.utils import utcnow
from app.core.config import get_settings
from app.core.exceptions import (
    CrossMeetingAccessError,
    MeetingNotFoundError,
    ParticipantAlreadyActiveError,
    ParticipantNotFoundError,
    UnauthorizedHostActionError,
)
from app.features.meetings.generator import generate_meeting_participant_id
from app.features.meetings.models import Meeting, MeetingEvent, MeetingParticipant
from app.features.meetings.repository import MeetingEventRepository, MeetingRepository
from app.features.meetings.service import MeetingService
from app.features.participants.repository import ParticipantRepository
from app.features.participants.schemas import JoinMeetingResponse, ParticipantResponse
from app.features.realtime.events import (
    make_audio_changed,
    make_host_mute_all,
    make_participant_joined,
    make_participant_left,
    make_participant_muted,
    make_participant_removed,
    make_screen_share_started,
    make_screen_share_stopped,
    make_video_changed,
)
from app.features.realtime.manager import connection_manager
from app.features.users.models import User

logger = logging.getLogger(__name__)


def _build_participant_response(
    participant: MeetingParticipant, meeting_public_id: str
) -> ParticipantResponse:
    return ParticipantResponse(
        participant_id=participant.participant_id,
        meeting_id=meeting_public_id,
        display_name=participant.display_name,
        role=participant.role,
        is_host=participant.is_host,
        audio_enabled=participant.audio_enabled,
        video_enabled=participant.video_enabled,
        screen_sharing=participant.screen_sharing,
        hand_raised=participant.hand_raised,
        muted_by_host=participant.muted_by_host,
        removed_from_meeting=participant.removed_from_meeting,
        is_active=participant.is_active,
        joined_at=participant.joined_at,
        left_at=participant.left_at,
    )


class ParticipantService:
    """Business logic for participant lifecycle and media state."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._meeting_repo = MeetingRepository(db)
        self._participant_repo = ParticipantRepository(db)
        self._event_repo = MeetingEventRepository(db)
        self._meeting_service = MeetingService(db)

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
        self._db.add(event)
        await self._db.flush()

    def _get_ws_url(self, meeting_id: str, participant_id: str) -> str:
        settings = get_settings()
        host = settings.host if settings.host != "0.0.0.0" else "127.0.0.1"
        return f"ws://{host}:{settings.port}/api/v1/ws/meetings/{meeting_id}?participant_id={participant_id}"

    # ---------------------------------------------------------------------------
    # Join by meeting ID
    # ---------------------------------------------------------------------------

    async def join_by_meeting_id(
        self,
        meeting_id: str,
        display_name: str,
        passcode: str | None,
        user: User | None = None,
    ) -> JoinMeetingResponse:
        meeting = await self._meeting_repo.get_by_meeting_id(meeting_id)
        if meeting is None:
            raise MeetingNotFoundError()
        return await self._do_join(meeting, display_name, passcode, user)

    # ---------------------------------------------------------------------------
    # Join by invite token
    # ---------------------------------------------------------------------------

    async def join_by_invite_token(
        self,
        invite_token: str,
        display_name: str,
        user: User | None = None,
    ) -> JoinMeetingResponse:
        from app.core.exceptions import InvalidInviteTokenError

        meeting = await self._meeting_repo.get_by_invite_token(invite_token)
        if meeting is None:
            raise InvalidInviteTokenError()
        # Invite links don't require a passcode (the token IS the credential)
        return await self._do_join(
            meeting, display_name, passcode=None, user=user, skip_passcode=True
        )

    # ---------------------------------------------------------------------------
    # Core join logic (shared by both join flows — DRY)
    # ---------------------------------------------------------------------------

    async def _do_join(
        self,
        meeting: Meeting,
        display_name: str,
        passcode: str | None,
        user: User | None,
        skip_passcode: bool = False,
    ) -> JoinMeetingResponse:
        from app.core.exceptions import MeetingNotJoinableError
        from app.features.meetings.state_machine import MeetingStateMachine

        if not MeetingStateMachine.can_join(meeting.status):
            raise MeetingNotJoinableError(
                f"Meeting cannot be joined in status '{meeting.status.value}'."
            )

        # Check if this is the host connecting or rejoining their pre-created session
        existing_host = await self._participant_repo.get_active_host(str(meeting.id))
        if existing_host:
            is_same_user = (
                user is not None
                and existing_host.user_id
                and str(existing_host.user_id) == str(user.id)
            )
            is_same_name = (
                display_name.strip().lower() == existing_host.display_name.strip().lower()
            )
            if is_same_user or is_same_name:
                meeting_response = self._meeting_service._build_meeting_response(
                    meeting, host_participant_id=existing_host.participant_id
                )
                return JoinMeetingResponse(
                    participant_id=existing_host.participant_id,
                    meeting_id=meeting.meeting_id,
                    display_name=existing_host.display_name,
                    role=ParticipantRole.HOST,
                    is_host=True,
                    audio_enabled=existing_host.audio_enabled,
                    video_enabled=existing_host.video_enabled,
                    meeting=meeting_response,
                    websocket_url=self._get_ws_url(
                        meeting.meeting_id, existing_host.participant_id
                    ),
                )

        if not skip_passcode:
            from app.core.exceptions import InvalidPasscodeError

            if passcode is None or passcode.strip() != meeting.passcode:
                raise InvalidPasscodeError()

        # Deactivate any previous stale active participant with the same display_name or user_id
        active_list = await self._participant_repo.list_active_by_meeting(str(meeting.id))
        for ep in active_list:
            if ep.is_host:
                continue
            is_same_user = user is not None and ep.user_id and str(ep.user_id) == str(user.id)
            is_same_name = ep.display_name.strip().lower() == display_name.strip().lower()
            if is_same_user or is_same_name:
                ep.is_active = False
                ep.left_at = utcnow()
                await self._participant_repo.save(ep)
                await connection_manager.disconnect(meeting.meeting_id, ep.participant_id)
                await connection_manager.broadcast_to_meeting(
                    meeting.meeting_id,
                    make_participant_left(meeting.meeting_id, ep.participant_id, ep.display_name),
                )

        now = utcnow()
        participant_id = generate_meeting_participant_id()

        participant = MeetingParticipant(
            id=str(uuid.uuid4()),
            meeting_id=meeting.id,
            user_id=user.id if user else None,
            participant_id=participant_id,
            display_name=display_name.strip(),
            role=ParticipantRole.PARTICIPANT,
            is_host=False,
            joined_at=now,
            is_active=True,
            audio_enabled=True,
            video_enabled=True,
        )
        participant = await self._participant_repo.create(participant)

        await self._record_event(
            str(meeting.id),
            MeetingEventType.PARTICIPANT_JOINED,
            participant_id=participant_id,
            metadata={"display_name": display_name},
        )
        await self._db.commit()

        # Broadcast to other participants
        await connection_manager.broadcast_to_meeting(
            meeting.meeting_id,
            make_participant_joined(
                meeting_id=meeting.meeting_id,
                participant_id=participant_id,
                display_name=display_name,
                role=participant.role.value,
                is_host=False,
                audio_enabled=True,
                video_enabled=True,
            ),
        )

        meeting_response = self._meeting_service._build_meeting_response(meeting)

        logger.info(
            "Participant joined: meeting_id=%s participant_id=%s display_name=%r",
            meeting.meeting_id,
            participant_id,
            display_name,
        )

        return JoinMeetingResponse(
            participant_id=participant_id,
            meeting_id=meeting.meeting_id,
            display_name=display_name,
            role=ParticipantRole.PARTICIPANT,
            is_host=False,
            audio_enabled=True,
            video_enabled=True,
            meeting=meeting_response,
            websocket_url=self._get_ws_url(meeting.meeting_id, participant_id),
        )

    # ---------------------------------------------------------------------------
    # Leave
    # ---------------------------------------------------------------------------

    async def leave_meeting(
        self,
        meeting_id: str,
        participant_id: str,
        actor_participant_id: str,
    ) -> ParticipantResponse:
        """Mark a participant as left.

        A participant can only leave themselves (actor == target).
        The host can also force-leave a participant (handled by remove instead).
        """
        # Validate meeting
        meeting = await self._meeting_repo.get_by_meeting_id(meeting_id)
        if meeting is None:
            raise MeetingNotFoundError()

        # Validate participant belongs to THIS meeting (cross-meeting access prevention)
        participant = await self._participant_repo.get_active_by_participant_id(participant_id)
        if participant is None:
            raise ParticipantNotFoundError()
        if str(participant.meeting_id) != str(meeting.id):
            raise CrossMeetingAccessError()
        if actor_participant_id != participant_id:
            # Only the participant can call their own leave
            raise UnauthorizedHostActionError("You can only leave on your own behalf.")

        now = utcnow()
        participant.is_active = False
        participant.left_at = now
        await self._participant_repo.save(participant)

        await self._record_event(
            str(meeting.id),
            MeetingEventType.PARTICIPANT_LEFT,
            participant_id=participant_id,
            metadata={"display_name": participant.display_name},
        )
        await self._db.commit()

        await connection_manager.broadcast_to_meeting(
            meeting_id,
            make_participant_left(meeting_id, participant_id, participant.display_name),
        )
        await connection_manager.disconnect(meeting_id, participant_id)

        logger.info("Participant left: meeting_id=%s participant_id=%s", meeting_id, participant_id)
        return _build_participant_response(participant, meeting_id)

    # ---------------------------------------------------------------------------
    # List active participants
    # ---------------------------------------------------------------------------

    async def list_participants(self, meeting_id: str) -> list[ParticipantResponse]:
        meeting = await self._meeting_repo.get_by_meeting_id(meeting_id)
        if meeting is None:
            raise MeetingNotFoundError()
        participants = await self._participant_repo.list_active_by_meeting(str(meeting.id))
        return [_build_participant_response(p, meeting_id) for p in participants]

    # ---------------------------------------------------------------------------
    # Host controls
    # ---------------------------------------------------------------------------

    async def _require_host(
        self, meeting_internal_id: str, actor_participant_id: str
    ) -> MeetingParticipant:
        host = await self._participant_repo.get_active_host(meeting_internal_id)
        if host is None or host.participant_id != actor_participant_id:
            raise UnauthorizedHostActionError()
        return host

    async def _require_participant_in_meeting(
        self, meeting_internal_id: str, participant_id: str
    ) -> MeetingParticipant:
        participant = await self._participant_repo.get_active_by_participant_id(participant_id)
        if participant is None:
            raise ParticipantNotFoundError()
        if str(participant.meeting_id) != meeting_internal_id:
            raise CrossMeetingAccessError()
        return participant

    async def mute_participant(
        self, meeting_id: str, participant_id: str, actor_participant_id: str
    ) -> ParticipantResponse:
        meeting = await self._meeting_repo.get_by_meeting_id(meeting_id)
        if meeting is None:
            raise MeetingNotFoundError()

        await self._require_host(str(meeting.id), actor_participant_id)
        participant = await self._require_participant_in_meeting(str(meeting.id), participant_id)

        participant.audio_enabled = False
        participant.muted_by_host = True
        await self._participant_repo.save(participant)

        await self._record_event(
            str(meeting.id),
            MeetingEventType.PARTICIPANT_MUTED,
            participant_id=participant_id,
        )
        await self._db.commit()

        await connection_manager.broadcast_to_meeting(
            meeting_id,
            make_participant_muted(meeting_id, participant_id, by_host=True),
        )

        return _build_participant_response(participant, meeting_id)

    async def mute_all(
        self, meeting_id: str, actor_participant_id: str
    ) -> list[ParticipantResponse]:
        meeting = await self._meeting_repo.get_by_meeting_id(meeting_id)
        if meeting is None:
            raise MeetingNotFoundError()

        await self._require_host(str(meeting.id), actor_participant_id)
        participants = await self._participant_repo.mute_all_active(str(meeting.id))

        await self._record_event(
            str(meeting.id),
            MeetingEventType.MUTE_ALL,
            participant_id=actor_participant_id,
        )
        await self._db.commit()

        await connection_manager.broadcast_to_meeting(meeting_id, make_host_mute_all(meeting_id))
        return [_build_participant_response(p, meeting_id) for p in participants]

    async def remove_participant(
        self, meeting_id: str, participant_id: str, actor_participant_id: str
    ) -> ParticipantResponse:
        meeting = await self._meeting_repo.get_by_meeting_id(meeting_id)
        if meeting is None:
            raise MeetingNotFoundError()

        await self._require_host(str(meeting.id), actor_participant_id)
        participant = await self._require_participant_in_meeting(str(meeting.id), participant_id)

        now = utcnow()
        participant.is_active = False
        participant.left_at = now
        participant.removed_from_meeting = True
        await self._participant_repo.save(participant)

        await self._record_event(
            str(meeting.id),
            MeetingEventType.PARTICIPANT_REMOVED,
            participant_id=participant_id,
            metadata={"display_name": participant.display_name},
        )
        await self._db.commit()

        await connection_manager.broadcast_to_meeting(
            meeting_id,
            make_participant_removed(meeting_id, participant_id, participant.display_name),
        )
        await connection_manager.disconnect(meeting_id, participant_id)

        return _build_participant_response(participant, meeting_id)

    # ---------------------------------------------------------------------------
    # Media state
    # ---------------------------------------------------------------------------

    async def _update_media_state(
        self,
        meeting_id: str,
        participant_id: str,
        actor_participant_id: str,
        field: str,
        value: bool,
        event_type: MeetingEventType,
    ) -> MeetingParticipant:
        """Shared helper for audio/video/screen-share state updates."""
        meeting = await self._meeting_repo.get_by_meeting_id(meeting_id)
        if meeting is None:
            raise MeetingNotFoundError()

        # A participant can only control their own media state
        if actor_participant_id != participant_id:
            raise UnauthorizedHostActionError("You can only control your own media state.")

        participant = await self._require_participant_in_meeting(str(meeting.id), participant_id)
        setattr(participant, field, value)
        await self._participant_repo.save(participant)
        await self._record_event(str(meeting.id), event_type, participant_id=participant_id)
        await self._db.commit()
        return participant

    async def update_audio(
        self, meeting_id: str, participant_id: str, enabled: bool, actor_participant_id: str
    ) -> ParticipantResponse:
        event_type = (
            MeetingEventType.PARTICIPANT_UNMUTED if enabled else MeetingEventType.PARTICIPANT_MUTED
        )
        participant = await self._update_media_state(
            meeting_id, participant_id, actor_participant_id, "audio_enabled", enabled, event_type
        )
        if enabled:
            participant.muted_by_host = False
        await self._db.commit()

        await connection_manager.broadcast_to_meeting(
            meeting_id,
            make_audio_changed(meeting_id, participant_id, enabled),
        )
        return _build_participant_response(participant, meeting_id)

    async def update_video(
        self, meeting_id: str, participant_id: str, enabled: bool, actor_participant_id: str
    ) -> ParticipantResponse:
        event_type = MeetingEventType.VIDEO_ENABLED if enabled else MeetingEventType.VIDEO_DISABLED
        participant = await self._update_media_state(
            meeting_id, participant_id, actor_participant_id, "video_enabled", enabled, event_type
        )
        await connection_manager.broadcast_to_meeting(
            meeting_id,
            make_video_changed(meeting_id, participant_id, enabled),
        )
        return _build_participant_response(participant, meeting_id)

    async def update_screen_share(
        self, meeting_id: str, participant_id: str, sharing: bool, actor_participant_id: str
    ) -> ParticipantResponse:
        meeting = await self._meeting_repo.get_by_meeting_id(meeting_id)
        if meeting is None:
            raise MeetingNotFoundError()

        if actor_participant_id != participant_id:
            raise UnauthorizedHostActionError("You can only control your own screen share.")

        participant = await self._require_participant_in_meeting(str(meeting.id), participant_id)

        # Enforce: only one active sharer at a time (product rule)
        if sharing:
            active_participants = await self._participant_repo.list_active_by_meeting(
                str(meeting.id)
            )
            for p in active_participants:
                if p.participant_id != participant_id and p.screen_sharing:
                    p.screen_sharing = False
                    await self._participant_repo.save(p)
                    await connection_manager.broadcast_to_meeting(
                        meeting_id,
                        make_screen_share_stopped(meeting_id, p.participant_id),
                    )

        participant.screen_sharing = sharing
        await self._participant_repo.save(participant)
        event_type = (
            MeetingEventType.SCREEN_SHARE_STARTED
            if sharing
            else MeetingEventType.SCREEN_SHARE_STOPPED
        )
        await self._record_event(str(meeting.id), event_type, participant_id=participant_id)
        await self._db.commit()

        event = make_screen_share_started if sharing else make_screen_share_stopped
        await connection_manager.broadcast_to_meeting(meeting_id, event(meeting_id, participant_id))
        return _build_participant_response(participant, meeting_id)
