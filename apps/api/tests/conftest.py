"""Pytest fixtures shared across all test modules.

Design:
- Each test gets a fresh in-memory SQLite database (isolated, fast, order-independent).
- The application is created with test-specific settings.
- TestClient wraps the app for HTTP tests.
- A seeded default user fixture is provided.
"""

import uuid
from collections.abc import AsyncGenerator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.common.enums import MeetingStatus, MeetingType, ParticipantRole
from app.common.utils import utcnow
from app.core.database import Base, get_db
from app.features.meetings.generator import (
    generate_meeting_invite_token,
    generate_meeting_participant_id,
    generate_unique_meeting_id,
)
from app.features.meetings.models import Meeting, MeetingParticipant
from app.features.users.models import User
from app.main import create_app

# ---------------------------------------------------------------------------
# In-memory test database
# ---------------------------------------------------------------------------

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture(scope="function")
async def test_engine():
    engine = create_async_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Provide a clean database session for each test."""
    session_factory = async_sessionmaker(
        bind=test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
    )
    async with session_factory() as session:
        yield session


@pytest_asyncio.fixture(scope="function")
async def client(test_engine) -> AsyncGenerator[AsyncClient, None]:
    """Async HTTP test client with overridden database dependency."""
    session_factory = async_sessionmaker(
        bind=test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
    )

    async def override_get_db():
        async with session_factory() as session:
            try:
                yield session
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    app = create_app()
    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


# ---------------------------------------------------------------------------
# Common data fixtures
# ---------------------------------------------------------------------------


@pytest_asyncio.fixture
async def default_user(db: AsyncSession) -> User:
    user = User(
        id=str(uuid.uuid4()),
        display_name="Aditya Raj",
        email="aditya.raj@test.local",
        is_default_user=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@pytest_asyncio.fixture
async def live_meeting(db: AsyncSession, default_user: User) -> Meeting:
    """A LIVE instant meeting with one active host participant."""
    meeting = Meeting(
        id=str(uuid.uuid4()),
        meeting_id=generate_unique_meeting_id(),
        title="Test Meeting",
        host_user_id=default_user.id,
        passcode="test12",
        invite_token=generate_meeting_invite_token(),
        status=MeetingStatus.LIVE,
        meeting_type=MeetingType.INSTANT,
        actual_started_at=utcnow(),
    )
    db.add(meeting)
    await db.flush()

    participant_id = generate_meeting_participant_id()
    host = MeetingParticipant(
        id=str(uuid.uuid4()),
        meeting_id=meeting.id,
        user_id=default_user.id,
        participant_id=participant_id,
        display_name="Aditya Raj",
        role=ParticipantRole.HOST,
        is_host=True,
        joined_at=utcnow(),
        is_active=True,
        audio_enabled=True,
        video_enabled=True,
    )
    db.add(host)
    await db.commit()
    await db.refresh(meeting)

    # Attach host participant for convenience
    meeting._test_host_participant_id = participant_id  # type: ignore[attr-defined]
    return meeting


@pytest_asyncio.fixture
async def scheduled_meeting(db: AsyncSession, default_user: User) -> Meeting:
    from datetime import timedelta

    meeting = Meeting(
        id=str(uuid.uuid4()),
        meeting_id=generate_unique_meeting_id(),
        title="Scheduled Test",
        host_user_id=default_user.id,
        passcode="sched1",
        invite_token=generate_meeting_invite_token(),
        status=MeetingStatus.SCHEDULED,
        meeting_type=MeetingType.SCHEDULED,
        scheduled_start_at=utcnow() + timedelta(days=1),
        scheduled_end_at=utcnow() + timedelta(days=1, hours=1),
    )
    db.add(meeting)
    await db.commit()
    await db.refresh(meeting)
    return meeting
