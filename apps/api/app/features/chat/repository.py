"""Chat repository — database access only."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.features.chat.models import ChatMessage


class ChatRepository:
    """Database access layer for ChatMessage."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(self, message: ChatMessage) -> ChatMessage:
        self._db.add(message)
        await self._db.flush()
        await self._db.refresh(message)
        return message

    async def list_by_meeting(
        self,
        meeting_internal_id: str,
        include_deleted: bool = False,
    ) -> list[ChatMessage]:
        """Return all (non-deleted) chat messages for a meeting, chronologically."""
        q = select(ChatMessage).where(ChatMessage.meeting_id == meeting_internal_id)
        if not include_deleted:
            q = q.where(ChatMessage.deleted_at.is_(None))
        q = q.order_by(ChatMessage.created_at.asc())
        result = await self._db.execute(q)
        return list(result.scalars().all())

    async def get_by_id(self, message_id: uuid.UUID) -> ChatMessage | None:
        result = await self._db.execute(
            select(ChatMessage).where(ChatMessage.id == str(message_id))
        )
        return result.scalar_one_or_none()
