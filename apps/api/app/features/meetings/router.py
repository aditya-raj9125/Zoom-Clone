"""Meeting API router.

All routes are thin:
    request → validation (Pydantic) → service → response

No business logic lives here.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_default_user
from app.common.pagination import PaginatedResponse, PaginationParams
from app.core.database import get_db
from app.features.meetings.schemas import (
    CreateInstantMeetingRequest,
    MeetingListItem,
    MeetingResponse,
    ScheduleMeetingRequest,
)
from app.features.meetings.service import MeetingService
from app.features.users.models import User

router = APIRouter(prefix="/meetings", tags=["Meetings"])


@router.post(
    "",
    response_model=MeetingResponse,
    status_code=201,
    summary="Create instant meeting",
    description=(
        "Creates an instantly joinable meeting. "
        "A unique meeting ID, passcode, and invite token are generated automatically. "
        "The host participant is created and the meeting status is set to LIVE."
    ),
)
async def create_instant_meeting(
    request: CreateInstantMeetingRequest,
    db: AsyncSession = Depends(get_db),
    host: User = Depends(get_default_user),
) -> MeetingResponse:
    service = MeetingService(db)
    return await service.create_instant_meeting(request, host)


@router.post(
    "/schedule",
    response_model=MeetingResponse,
    status_code=201,
    summary="Schedule a meeting",
    description=(
        "Creates a scheduled meeting with a future start time and specified duration. "
        "All timestamps are stored in UTC. "
        "Rejects past start times and invalid duration values."
    ),
)
async def schedule_meeting(
    request: ScheduleMeetingRequest,
    db: AsyncSession = Depends(get_db),
    host: User = Depends(get_default_user),
) -> MeetingResponse:
    service = MeetingService(db)
    return await service.schedule_meeting(request, host)


@router.get(
    "/upcoming",
    response_model=list[MeetingListItem],
    summary="Get upcoming meetings",
    description=(
        "Returns future scheduled meetings for the current user, "
        "sorted ascending by scheduled start time. "
        "Ended and cancelled meetings are excluded."
    ),
)
async def list_upcoming_meetings(
    db: AsyncSession = Depends(get_db),
    host: User = Depends(get_default_user),
) -> list[MeetingListItem]:
    service = MeetingService(db)
    return await service.list_upcoming(host.id)


@router.get(
    "/recent",
    response_model=PaginatedResponse[MeetingListItem],
    summary="Get recent meetings",
    description="Returns recent meetings for the current user, sorted descending by creation time.",
)
async def list_recent_meetings(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    host: User = Depends(get_default_user),
) -> PaginatedResponse[MeetingListItem]:
    pagination = PaginationParams(page=page, page_size=page_size)
    service = MeetingService(db)
    items, total = await service.list_recent(host.id, pagination)
    return PaginatedResponse.build(items, total, pagination)


@router.get(
    "/{meeting_id}",
    response_model=MeetingResponse,
    summary="Get meeting details",
    description=(
        "Returns safe public details for a meeting identified by its 10-digit meeting ID. "
        "Internal database IDs are not exposed."
    ),
)
async def get_meeting(
    meeting_id: str,
    db: AsyncSession = Depends(get_db),
) -> MeetingResponse:
    service = MeetingService(db)
    return await service.get_meeting(meeting_id)


@router.post(
    "/{meeting_id}/start",
    response_model=MeetingResponse,
    summary="Start meeting",
    description=(
        "Transitions a SCHEDULED or WAITING meeting to LIVE. "
        "Only the host participant may start the meeting. "
        "Broadcasts meeting.started to all connected WebSocket clients."
    ),
)
async def start_meeting(
    meeting_id: str,
    actor_participant_id: str = Query(
        ..., description="Participant ID of the actor (must be host)"
    ),
    db: AsyncSession = Depends(get_db),
) -> MeetingResponse:
    service = MeetingService(db)
    return await service.start_meeting(meeting_id, actor_participant_id)


@router.post(
    "/{meeting_id}/end",
    response_model=MeetingResponse,
    summary="End meeting",
    description=(
        "Transitions a LIVE meeting to ENDED. "
        "Only the host may end the meeting. "
        "All active participants are marked as left. "
        "Broadcasts meeting.ended and closes all WebSocket connections."
    ),
)
async def end_meeting(
    meeting_id: str,
    actor_participant_id: str = Query(
        ..., description="Participant ID of the actor (must be host)"
    ),
    db: AsyncSession = Depends(get_db),
) -> MeetingResponse:
    service = MeetingService(db)
    return await service.end_meeting(meeting_id, actor_participant_id)
