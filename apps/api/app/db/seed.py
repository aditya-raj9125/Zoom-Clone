"""Database seed logic.

Creates deterministic seed data:
- Default user (Aditya Raj)
- Sample instant meeting (LIVE)
- Sample scheduled meeting (future)
- Sample ended meeting (history)
- Sample participants
- Sample chat messages
- Sample reactions

Idempotent: running multiple times produces the same result.
"""

import json
import logging
import uuid
from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import (
    MeetingEventType,
    MeetingStatus,
    MeetingType,
    ParticipantRole,
    ReactionType,
)
from app.common.utils import utcnow
from app.core.constants import DEFAULT_USER_DISPLAY_NAME, DEFAULT_USER_EMAIL
from app.features.chat.models import ChatMessage
from app.features.meetings.generator import (
    generate_meeting_invite_token,
    generate_meeting_participant_id,
    generate_meeting_passcode,
    generate_unique_meeting_id,
)
from app.features.meetings.models import Meeting, MeetingEvent, MeetingParticipant
from app.features.reactions.models import Reaction
from app.features.users.models import User

logger = logging.getLogger(__name__)


async def seed_database(db: AsyncSession) -> None:
    """Seed the database with initial data. Idempotent."""
    logger.info("Starting database seed...")

    # -----------------------------------------------------------------------
    # 1. Default user
    # -----------------------------------------------------------------------
    result = await db.execute(select(User).where(User.is_default_user == True))  # noqa: E712
    default_user = result.scalar_one_or_none()

    if default_user is None:
        default_user = User(
            id=str(uuid.uuid4()),
            display_name=DEFAULT_USER_DISPLAY_NAME,
            email=DEFAULT_USER_EMAIL,
            is_default_user=True,
        )
        db.add(default_user)
        await db.flush()
        logger.info("Created default user: %s", DEFAULT_USER_DISPLAY_NAME)
    else:
        logger.info("Default user already exists — skipping")

    now = utcnow()

    # -----------------------------------------------------------------------
    # 2. Sample ended meeting (recent history)
    # -----------------------------------------------------------------------
    result = await db.execute(select(Meeting).where(Meeting.status == MeetingStatus.ENDED.value))
    if result.scalar_one_or_none() is None:
        ended_id = str(uuid.uuid4())
        ended_meeting = Meeting(
            id=ended_id,
            meeting_id=generate_unique_meeting_id(),
            title="Team Standup — Yesterday",
            description="Daily engineering standup meeting",
            host_user_id=default_user.id,
            passcode=generate_meeting_passcode(),
            invite_token=generate_meeting_invite_token(),
            status=MeetingStatus.ENDED,
            meeting_type=MeetingType.SCHEDULED,
            scheduled_start_at=now - timedelta(hours=25),
            scheduled_end_at=now - timedelta(hours=24, minutes=15),
            actual_started_at=now - timedelta(hours=25),
            actual_ended_at=now - timedelta(hours=24, minutes=13),
        )
        db.add(ended_meeting)
        await db.flush()

        # Host participant (ended)
        host_participant_id = generate_meeting_participant_id()
        host_participant = MeetingParticipant(
            id=str(uuid.uuid4()),
            meeting_id=ended_id,
            user_id=default_user.id,
            participant_id=host_participant_id,
            display_name=DEFAULT_USER_DISPLAY_NAME,
            role=ParticipantRole.HOST,
            is_host=True,
            joined_at=ended_meeting.actual_started_at,
            left_at=ended_meeting.actual_ended_at,
            is_active=False,
            audio_enabled=True,
            video_enabled=True,
        )
        db.add(host_participant)

        # Sample participant (ended)
        p2_id = generate_meeting_participant_id()
        p2 = MeetingParticipant(
            id=str(uuid.uuid4()),
            meeting_id=ended_id,
            participant_id=p2_id,
            display_name="Naresh Yadav",
            role=ParticipantRole.PARTICIPANT,
            is_host=False,
            joined_at=ended_meeting.actual_started_at,
            left_at=ended_meeting.actual_ended_at,
            is_active=False,
            audio_enabled=False,
            video_enabled=True,
        )
        db.add(p2)
        await db.flush()

        # Chat messages for ended meeting
        chat_msgs = [
            ChatMessage(
                id=str(uuid.uuid4()),
                meeting_id=ended_id,
                participant_id=host_participant_id,
                display_name=DEFAULT_USER_DISPLAY_NAME,
                message="Good morning everyone! Let's start the standup.",
            ),
            ChatMessage(
                id=str(uuid.uuid4()),
                meeting_id=ended_id,
                participant_id=p2_id,
                display_name="Naresh Yadav",
                message="Morning! Working on the auth module today.",
            ),
            ChatMessage(
                id=str(uuid.uuid4()),
                meeting_id=ended_id,
                participant_id=host_participant_id,
                display_name=DEFAULT_USER_DISPLAY_NAME,
                message="Great! Let me know if you need any DB schema review.",
            ),
        ]
        for msg in chat_msgs:
            db.add(msg)

        # Reactions
        db.add(
            Reaction(
                id=str(uuid.uuid4()),
                meeting_id=ended_id,
                participant_id=p2_id,
                display_name="Naresh Yadav",
                reaction_type=ReactionType.THUMBS_UP,
            )
        )

        # Events
        for ev_type, pid in [
            (MeetingEventType.MEETING_CREATED, host_participant_id),
            (MeetingEventType.MEETING_STARTED, host_participant_id),
            (MeetingEventType.PARTICIPANT_JOINED, p2_id),
            (MeetingEventType.MEETING_ENDED, host_participant_id),
        ]:
            db.add(
                MeetingEvent(
                    id=str(uuid.uuid4()),
                    meeting_id=ended_id,
                    participant_id=pid,
                    event_type=ev_type,
                    metadata_=None,
                )
            )

        await db.flush()
        logger.info("Created sample ended meeting: %s", ended_meeting.meeting_id)

    # -----------------------------------------------------------------------
    # 3. Sample upcoming scheduled meeting
    # -----------------------------------------------------------------------
    result = await db.execute(
        select(Meeting).where(Meeting.status == MeetingStatus.SCHEDULED.value)
    )
    if result.scalar_one_or_none() is None:
        upcoming_id = str(uuid.uuid4())
        upcoming_meeting = Meeting(
            id=upcoming_id,
            meeting_id=generate_unique_meeting_id(),
            title="Product Review — Next Week",
            description="Quarterly product review with stakeholders",
            host_user_id=default_user.id,
            passcode=generate_meeting_passcode(),
            invite_token=generate_meeting_invite_token(),
            status=MeetingStatus.SCHEDULED,
            meeting_type=MeetingType.SCHEDULED,
            scheduled_start_at=now + timedelta(days=7),
            scheduled_end_at=now + timedelta(days=7, hours=1),
        )
        db.add(upcoming_meeting)
        await db.flush()

        db.add(
            MeetingEvent(
                id=str(uuid.uuid4()),
                meeting_id=upcoming_id,
                event_type=MeetingEventType.MEETING_CREATED,
                metadata_=json.dumps({"meeting_type": "scheduled"}),
            )
        )
        await db.flush()
        logger.info("Created sample upcoming meeting: %s", upcoming_meeting.meeting_id)

    # -----------------------------------------------------------------------
    # 4. Sample live instant meeting
    # -----------------------------------------------------------------------
    result = await db.execute(select(Meeting).where(Meeting.status == MeetingStatus.LIVE.value))
    if result.scalar_one_or_none() is None:
        live_id = str(uuid.uuid4())
        live_meeting = Meeting(
            id=live_id,
            meeting_id=generate_unique_meeting_id(),
            title=f"{DEFAULT_USER_DISPLAY_NAME}'s Zoom Meeting",
            description=None,
            host_user_id=default_user.id,
            passcode=generate_meeting_passcode(),
            invite_token=generate_meeting_invite_token(),
            status=MeetingStatus.LIVE,
            meeting_type=MeetingType.INSTANT,
            actual_started_at=now - timedelta(minutes=5),
        )
        db.add(live_meeting)
        await db.flush()

        live_host_id = generate_meeting_participant_id()
        live_host = MeetingParticipant(
            id=str(uuid.uuid4()),
            meeting_id=live_id,
            user_id=default_user.id,
            participant_id=live_host_id,
            display_name=DEFAULT_USER_DISPLAY_NAME,
            role=ParticipantRole.HOST,
            is_host=True,
            joined_at=live_meeting.actual_started_at,
            is_active=True,
            audio_enabled=True,
            video_enabled=True,
        )
        db.add(live_host)

        live_p2_id = generate_meeting_participant_id()
        live_p2 = MeetingParticipant(
            id=str(uuid.uuid4()),
            meeting_id=live_id,
            participant_id=live_p2_id,
            display_name="Priya Sharma",
            role=ParticipantRole.PARTICIPANT,
            is_host=False,
            joined_at=now - timedelta(minutes=3),
            is_active=True,
            audio_enabled=False,
            video_enabled=True,
            muted_by_host=True,
        )
        db.add(live_p2)
        await db.flush()

        # Chat in live meeting
        db.add(
            ChatMessage(
                id=str(uuid.uuid4()),
                meeting_id=live_id,
                participant_id=live_host_id,
                display_name=DEFAULT_USER_DISPLAY_NAME,
                message="Welcome everyone! Let's get started.",
            )
        )
        db.add(
            ChatMessage(
                id=str(uuid.uuid4()),
                meeting_id=live_id,
                participant_id=live_p2_id,
                display_name="Priya Sharma",
                message="Thanks! Can everyone hear me?",
            )
        )

        # Reaction
        db.add(
            Reaction(
                id=str(uuid.uuid4()),
                meeting_id=live_id,
                participant_id=live_host_id,
                display_name=DEFAULT_USER_DISPLAY_NAME,
                reaction_type=ReactionType.CLAP,
            )
        )

        await db.flush()
        logger.info("Created sample live meeting: %s", live_meeting.meeting_id)

    await db.commit()
    logger.info("Database seed complete")
