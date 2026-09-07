"""Reactions API router."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.features.reactions.schemas import ReactionCreate, ReactionResponse
from app.features.reactions.service import ReactionService

router = APIRouter(prefix="/meetings", tags=["Reactions"])


@router.post(
    "/{meeting_id}/reactions",
    response_model=ReactionResponse,
    status_code=201,
    summary="Send reaction",
    description=(
        "Send an emoji reaction during a meeting. "
        "Persisted for analytics and broadcast via WebSocket as reaction.created."
    ),
)
async def send_reaction(
    meeting_id: str,
    request: ReactionCreate,
    db: AsyncSession = Depends(get_db),
) -> ReactionResponse:
    service = ReactionService(db)
    return await service.send_reaction(meeting_id, request)
