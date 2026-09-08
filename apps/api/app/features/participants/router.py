"""Participant API router.

Routes:
    POST   /api/v1/meetings/join                                — Join by meeting ID
    POST   /api/v1/meetings/join-by-invite                      — Join by invite token
    GET    /api/v1/meetings/{meeting_id}/participants            — List active participants
    POST   /api/v1/meetings/{meeting_id}/participants/{pid}/leave
    PATCH  /api/v1/meetings/{meeting_id}/participants/{pid}/audio
    PATCH  /api/v1/meetings/{meeting_id}/participants/{pid}/video
    PATCH  /api/v1/meetings/{meeting_id}/participants/{pid}/screen-share
    POST   /api/v1/meetings/{meeting_id}/participants/{pid}/mute
    POST   /api/v1/meetings/{meeting_id}/mute-all
    DELETE /api/v1/meetings/{meeting_id}/participants/{pid}     — Remove participant
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user_optional
from app.core.database import get_db
from app.features.meetings.schemas import JoinByInviteRequest, MeetingJoinRequest
from app.features.participants.schemas import (
    AudioStateRequest,
    JoinMeetingResponse,
    ParticipantResponse,
    ScreenShareRequest,
    VideoStateRequest,
)
from app.features.participants.service import ParticipantService
from app.features.users.models import User

router = APIRouter(tags=["Participants"])

# ---------------------------------------------------------------------------
# Join endpoints (no meeting_id prefix — they live at /meetings level)
# ---------------------------------------------------------------------------


@router.post(
    "/meetings/join",
    response_model=JoinMeetingResponse,
    status_code=200,
    summary="Join meeting by ID",
    description=(
        "Join a meeting using the public 10-digit meeting ID. "
        "Validates meeting existence, joinability, and passcode. "
        "Returns participant session information and WebSocket URL."
    ),
)
async def join_by_meeting_id(
    request: MeetingJoinRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
) -> JoinMeetingResponse:
    service = ParticipantService(db)
    return await service.join_by_meeting_id(
        meeting_id=request.meeting_id,
        display_name=request.display_name,
        passcode=request.passcode,
        user=current_user,
    )


@router.post(
    "/meetings/join-by-invite",
    response_model=JoinMeetingResponse,
    status_code=200,
    summary="Join meeting by invite link",
    description=(
        "Join a meeting using the invite token from a shareable invite link. "
        "The invite token is the credential — no passcode required. "
        "Uses the same join validation flow as join-by-ID."
    ),
)
async def join_by_invite(
    request: JoinByInviteRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
) -> JoinMeetingResponse:
    service = ParticipantService(db)
    return await service.join_by_invite_token(
        invite_token=request.invite_token,
        display_name=request.display_name,
        user=current_user,
    )


# ---------------------------------------------------------------------------
# Meeting-scoped participant endpoints
# ---------------------------------------------------------------------------


@router.get(
    "/meetings/{meeting_id}/participants",
    response_model=list[ParticipantResponse],
    summary="List active participants",
    description=(
        "Returns all currently active participants in the meeting. "
        "Includes full media state for the Participants panel UI: "
        "audio/video state, screen sharing, hand raised, and host-muted status."
    ),
)
async def list_participants(
    meeting_id: str,
    db: AsyncSession = Depends(get_db),
) -> list[ParticipantResponse]:
    service = ParticipantService(db)
    return await service.list_participants(meeting_id)


@router.post(
    "/meetings/{meeting_id}/participants/{participant_id}/leave",
    response_model=ParticipantResponse,
    summary="Leave meeting",
    description=(
        "Mark the participant as having left the meeting. "
        "A participant can only leave on their own behalf. "
        "Broadcasts participant.left to other participants."
    ),
)
async def leave_meeting(
    meeting_id: str,
    participant_id: str,
    actor_participant_id: str = Query(..., description="Must equal participant_id"),
    db: AsyncSession = Depends(get_db),
) -> ParticipantResponse:
    service = ParticipantService(db)
    return await service.leave_meeting(meeting_id, participant_id, actor_participant_id)


@router.patch(
    "/meetings/{meeting_id}/participants/{participant_id}/audio",
    response_model=ParticipantResponse,
    summary="Update audio state",
    description=(
        "Enable or disable the participant's microphone state. "
        "This updates the state record only — actual audio is transmitted via WebRTC. "
        "Broadcasts participant.audio_changed to all participants."
    ),
)
async def update_audio(
    meeting_id: str,
    participant_id: str,
    request: AudioStateRequest,
    actor_participant_id: str = Query(..., description="Must equal participant_id"),
    db: AsyncSession = Depends(get_db),
) -> ParticipantResponse:
    service = ParticipantService(db)
    return await service.update_audio(
        meeting_id, participant_id, request.enabled, actor_participant_id
    )


@router.patch(
    "/meetings/{meeting_id}/participants/{participant_id}/video",
    response_model=ParticipantResponse,
    summary="Update video state",
    description=(
        "Enable or disable the participant's camera state. "
        "State only — actual video is transmitted via WebRTC. "
        "Broadcasts participant.video_changed."
    ),
)
async def update_video(
    meeting_id: str,
    participant_id: str,
    request: VideoStateRequest,
    actor_participant_id: str = Query(..., description="Must equal participant_id"),
    db: AsyncSession = Depends(get_db),
) -> ParticipantResponse:
    service = ParticipantService(db)
    return await service.update_video(
        meeting_id, participant_id, request.enabled, actor_participant_id
    )


@router.patch(
    "/meetings/{meeting_id}/participants/{participant_id}/screen-share",
    response_model=ParticipantResponse,
    summary="Update screen share state",
    description=(
        "Start or stop screen sharing. "
        "Only one participant may share their screen at a time (enforced by the backend). "
        "Broadcasts screen_share.started or screen_share.stopped."
    ),
)
async def update_screen_share(
    meeting_id: str,
    participant_id: str,
    request: ScreenShareRequest,
    actor_participant_id: str = Query(..., description="Must equal participant_id"),
    db: AsyncSession = Depends(get_db),
) -> ParticipantResponse:
    service = ParticipantService(db)
    return await service.update_screen_share(
        meeting_id, participant_id, request.sharing, actor_participant_id
    )


@router.post(
    "/meetings/{meeting_id}/participants/{participant_id}/mute",
    response_model=ParticipantResponse,
    summary="Host mute participant",
    description=(
        "Mute a specific participant. Only the host or co-host may perform this. "
        "Sets audio_enabled=False and muted_by_host=True. "
        "Broadcasts participant.muted."
    ),
)
async def mute_participant(
    meeting_id: str,
    participant_id: str,
    actor_participant_id: str = Query(..., description="Must be the host's participant ID"),
    db: AsyncSession = Depends(get_db),
) -> ParticipantResponse:
    service = ParticipantService(db)
    return await service.mute_participant(meeting_id, participant_id, actor_participant_id)


@router.post(
    "/meetings/{meeting_id}/mute-all",
    response_model=list[ParticipantResponse],
    summary="Host mute all participants",
    description=(
        "Mute all non-host active participants. Only the host may perform this. "
        "Broadcasts host.mute_all to all participants."
    ),
)
async def mute_all(
    meeting_id: str,
    actor_participant_id: str = Query(..., description="Must be the host's participant ID"),
    db: AsyncSession = Depends(get_db),
) -> list[ParticipantResponse]:
    service = ParticipantService(db)
    return await service.mute_all(meeting_id, actor_participant_id)


@router.delete(
    "/meetings/{meeting_id}/participants/{participant_id}",
    response_model=ParticipantResponse,
    summary="Remove participant",
    description=(
        "Remove a participant from the meeting. Only the host may perform this. "
        "Sets removed_from_meeting=True and closes their WebSocket connection. "
        "Broadcasts participant.removed."
    ),
)
async def remove_participant(
    meeting_id: str,
    participant_id: str,
    actor_participant_id: str = Query(..., description="Must be the host's participant ID"),
    db: AsyncSession = Depends(get_db),
) -> ParticipantResponse:
    service = ParticipantService(db)
    return await service.remove_participant(meeting_id, participant_id, actor_participant_id)
