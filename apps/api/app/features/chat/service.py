"""Chat service — business logic for chat messages."""

import logging
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import MeetingNotFoundError, ParticipantNotFoundError
from app.features.chat.models import ChatMessage
from app.features.chat.repository import ChatRepository
from app.features.chat.schemas import ChatMessageCreate, ChatMessageResponse
from app.features.meetings.repository import MeetingRepository
from app.features.participants.repository import ParticipantRepository
from app.features.realtime.events import make_chat_message
from app.features.realtime.manager import connection_manager

logger = logging.getLogger(__name__)


class ChatService:
    """Business logic for chat messages."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._meeting_repo = MeetingRepository(db)
        self._participant_repo = ParticipantRepository(db)
        self._chat_repo = ChatRepository(db)

    def _to_response(self, msg: ChatMessage, meeting_public_id: str) -> ChatMessageResponse:
        return ChatMessageResponse(
            id=str(msg.id),
            meeting_id=meeting_public_id,
            participant_id=msg.participant_id,
            display_name=msg.display_name,
            message=msg.message,
            created_at=msg.created_at,
            deleted_at=msg.deleted_at,
        )

    async def send_message(
        self, meeting_id: str, request: ChatMessageCreate
    ) -> ChatMessageResponse:
        meeting = await self._meeting_repo.get_by_meeting_id(meeting_id)
        if meeting is None:
            raise MeetingNotFoundError()

        participant = await self._participant_repo.get_active_by_participant_id(
            request.participant_id
        )
        if participant is None:
            raise ParticipantNotFoundError("Participant not found or not active.")

        msg = ChatMessage(
            id=str(uuid.uuid4()),
            meeting_id=meeting.id,
            participant_id=request.participant_id,
            display_name=participant.display_name,
            message=request.message,
        )
        msg = await self._chat_repo.create(msg)
        await self._db.commit()
        await self._db.refresh(msg)

        # Broadcast via WebSocket
        await connection_manager.broadcast_to_meeting(
            meeting_id,
            make_chat_message(
                meeting_id=meeting_id,
                message_id=str(msg.id),
                participant_id=msg.participant_id,
                display_name=msg.display_name,
                message=msg.message,
                created_at=msg.created_at.isoformat(),
            ),
        )

        logger.info(
            "Chat message sent: meeting_id=%s participant_id=%s", meeting_id, request.participant_id
        )
        return self._to_response(msg, meeting_id)

    async def list_messages(self, meeting_id: str) -> list[ChatMessageResponse]:
        meeting = await self._meeting_repo.get_by_meeting_id(meeting_id)
        if meeting is None:
            raise MeetingNotFoundError()
        messages = await self._chat_repo.list_by_meeting(str(meeting.id))
        return [self._to_response(m, meeting_id) for m in messages]
