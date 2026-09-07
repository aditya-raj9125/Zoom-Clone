"""Chat API router."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.features.chat.schemas import ChatMessageCreate, ChatMessageResponse
from app.features.chat.service import ChatService

router = APIRouter(prefix="/meetings", tags=["Chat"])


@router.get(
    "/{meeting_id}/chat",
    response_model=list[ChatMessageResponse],
    summary="Get chat messages",
    description="Returns all non-deleted chat messages for a meeting, in chronological order.",
)
async def get_chat_messages(
    meeting_id: str,
    db: AsyncSession = Depends(get_db),
) -> list[ChatMessageResponse]:
    service = ChatService(db)
    return await service.list_messages(meeting_id)


@router.post(
    "/{meeting_id}/chat",
    response_model=ChatMessageResponse,
    status_code=201,
    summary="Send chat message",
    description=(
        "Send a chat message in a meeting. "
        "The participant must be active in the meeting. "
        "Broadcasts chat.message_created to all participants via WebSocket."
    ),
)
async def send_chat_message(
    meeting_id: str,
    request: ChatMessageCreate,
    db: AsyncSession = Depends(get_db),
) -> ChatMessageResponse:
    service = ChatService(db)
    return await service.send_message(meeting_id, request)
