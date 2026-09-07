"""Integration tests for meeting endpoints."""

from datetime import UTC, datetime, timedelta

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestCreateInstantMeeting:
    async def test_creates_meeting_successfully(self, client: AsyncClient, default_user):
        response = await client.post(
            "/api/v1/meetings",
            json={"title": "Test Instant Meeting"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Instant Meeting"
        assert data["status"] == "live"
        assert data["meeting_type"] == "instant"
        assert data["meeting_id"].isdigit()
        assert len(data["meeting_id"]) == 10
        assert "invite_token" in data
        assert "passcode" in data
        assert len(data["passcode"]) == 6
        assert data["invite_link"].endswith(data["invite_token"])

    async def test_meeting_id_is_unique(self, client: AsyncClient, default_user):
        r1 = await client.post("/api/v1/meetings", json={"title": "M1"})
        r2 = await client.post("/api/v1/meetings", json={"title": "M2"})
        assert r1.status_code == 201
        assert r2.status_code == 201
        assert r1.json()["meeting_id"] != r2.json()["meeting_id"]

    async def test_invite_token_is_unique(self, client: AsyncClient, default_user):
        r1 = await client.post("/api/v1/meetings", json={"title": "M1"})
        r2 = await client.post("/api/v1/meetings", json={"title": "M2"})
        assert r1.json()["invite_token"] != r2.json()["invite_token"]

    async def test_requires_default_user(self, client: AsyncClient):
        # No default_user fixture — DB empty
        response = await client.post("/api/v1/meetings", json={"title": "Test"})
        assert response.status_code == 404  # UserNotFoundError


@pytest.mark.asyncio
class TestScheduleMeeting:
    async def test_schedule_valid_meeting(self, client: AsyncClient, default_user):
        future = (datetime.now(UTC) + timedelta(days=1)).isoformat()
        response = await client.post(
            "/api/v1/meetings/schedule",
            json={
                "title": "Next Week Meeting",
                "scheduled_start_at": future,
                "duration_minutes": 60,
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "scheduled"
        assert data["meeting_type"] == "scheduled"
        assert data["scheduled_start_at"] is not None
        assert data["scheduled_end_at"] is not None

    async def test_rejects_past_time(self, client: AsyncClient, default_user):
        past = (datetime.now(UTC) - timedelta(hours=1)).isoformat()
        response = await client.post(
            "/api/v1/meetings/schedule",
            json={
                "title": "Past Meeting",
                "scheduled_start_at": past,
                "duration_minutes": 60,
            },
        )
        assert response.status_code == 422
        assert response.json()["error"]["code"] == "INVALID_SCHEDULE_TIME"

    async def test_rejects_invalid_duration_zero(self, client: AsyncClient, default_user):
        future = (datetime.now(UTC) + timedelta(days=1)).isoformat()
        response = await client.post(
            "/api/v1/meetings/schedule",
            json={"title": "Bad Duration", "scheduled_start_at": future, "duration_minutes": 0},
        )
        assert response.status_code == 422  # Pydantic validation

    async def test_rejects_duration_over_max(self, client: AsyncClient, default_user):
        future = (datetime.now(UTC) + timedelta(days=1)).isoformat()
        response = await client.post(
            "/api/v1/meetings/schedule",
            json={"title": "Too Long", "scheduled_start_at": future, "duration_minutes": 9999},
        )
        assert response.status_code == 422

    async def test_rejects_naive_datetime(self, client: AsyncClient, default_user):
        # No timezone info
        response = await client.post(
            "/api/v1/meetings/schedule",
            json={
                "title": "Naive",
                "scheduled_start_at": "2030-01-01T10:00:00",
                "duration_minutes": 60,
            },
        )
        assert response.status_code == 422


@pytest.mark.asyncio
class TestGetMeeting:
    async def test_get_existing_meeting(self, client: AsyncClient, default_user, live_meeting):
        response = await client.get(f"/api/v1/meetings/{live_meeting.meeting_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["meeting_id"] == live_meeting.meeting_id

    async def test_get_nonexistent_meeting_returns_404(self, client: AsyncClient):
        response = await client.get("/api/v1/meetings/0000000000")
        assert response.status_code == 404
        assert response.json()["error"]["code"] == "MEETING_NOT_FOUND"


@pytest.mark.asyncio
class TestUpcomingMeetings:
    async def test_returns_scheduled_meetings(
        self, client: AsyncClient, default_user, scheduled_meeting
    ):
        response = await client.get("/api/v1/meetings/upcoming")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["meeting_id"] == scheduled_meeting.meeting_id

    async def test_excludes_live_meetings(self, client: AsyncClient, default_user, live_meeting):
        response = await client.get("/api/v1/meetings/upcoming")
        assert response.status_code == 200
        data = response.json()
        meeting_ids = [m["meeting_id"] for m in data]
        assert live_meeting.meeting_id not in meeting_ids


@pytest.mark.asyncio
class TestRecentMeetings:
    async def test_returns_paginated_response(
        self, client: AsyncClient, default_user, live_meeting
    ):
        response = await client.get("/api/v1/meetings/recent?page=1&page_size=10")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "total_pages" in data

    async def test_pagination_params_are_validated(self, client: AsyncClient, default_user):
        response = await client.get("/api/v1/meetings/recent?page=0")
        assert response.status_code == 422
