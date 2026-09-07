"""Reactions service."""

import logging
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import MeetingNotFoundError, ParticipantNotFoundError
from app.features.meetings.repository import MeetingRepository
from app.features.participants.repository import ParticipantRepository
from app.features.reactions.models import Reaction
from app.features.reactions.schemas import ReactionCreate, ReactionResponse
from app.features.realtime.events import make_reaction
from app.features.realtime.manager import connection_manager

logger = logging.getLogger(__name__)


class ReactionService:
    """Business logic for emoji reactions."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._meeting_repo = MeetingRepository(db)
        self._participant_repo = ParticipantRepository(db)

    async def send_reaction(self, meeting_id: str, request: ReactionCreate) -> ReactionResponse:
        meeting = await self._meeting_repo.get_by_meeting_id(meeting_id)
        if meeting is None:
            raise MeetingNotFoundError()

        participant = await self._participant_repo.get_active_by_participant_id(
            request.participant_id
        )
        if participant is None:
            raise ParticipantNotFoundError()

        reaction = Reaction(
            id=str(uuid.uuid4()),
            meeting_id=meeting.id,
            participant_id=request.participant_id,
            display_name=participant.display_name,
            reaction_type=request.reaction_type,
        )
        self._db.add(reaction)
        await self._db.flush()
        await self._db.commit()
        await self._db.refresh(reaction)

        # Broadcast
        await connection_manager.broadcast_to_meeting(
            meeting_id,
            make_reaction(
                meeting_id=meeting_id,
                reaction_id=str(reaction.id),
                participant_id=reaction.participant_id,
                display_name=reaction.display_name,
                reaction_type=reaction.reaction_type.value,
                created_at=reaction.created_at.isoformat(),
            ),
        )

        return ReactionResponse(
            id=str(reaction.id),
            meeting_id=meeting_id,
            participant_id=reaction.participant_id,
            display_name=reaction.display_name,
            reaction_type=reaction.reaction_type,
            created_at=reaction.created_at,
        )
