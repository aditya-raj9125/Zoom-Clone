"""Integration tests for participant endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestJoinByMeetingId:
    async def test_join_valid_meeting(self, client: AsyncClient, default_user, live_meeting):
        response = await client.post(
            "/api/v1/meetings/join",
            json={
                "meeting_id": live_meeting.meeting_id,
                "display_name": "Naresh Yadav",
                "passcode": "test12",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["display_name"] == "Naresh Yadav"
        assert data["role"] == "participant"
        assert data["is_host"] is False
        assert "participant_id" in data
        assert "websocket_url" in data
        assert "meeting" in data

    async def test_join_invalid_meeting_id(self, client: AsyncClient):
        response = await client.post(
            "/api/v1/meetings/join",
            json={"meeting_id": "0000000000", "display_name": "Test", "passcode": "test12"},
        )
        assert response.status_code == 404
        assert response.json()["error"]["code"] == "MEETING_NOT_FOUND"

    async def test_join_wrong_passcode(self, client: AsyncClient, default_user, live_meeting):
        response = await client.post(
            "/api/v1/meetings/join",
            json={
                "meeting_id": live_meeting.meeting_id,
                "display_name": "Test",
                "passcode": "WRONG1",
            },
        )
        assert response.status_code == 401
        assert response.json()["error"]["code"] == "INVALID_PASSCODE"

    async def test_join_ended_meeting_rejected(
        self, client: AsyncClient, default_user, live_meeting, db
    ):
        # End the meeting first
        from app.common.enums import MeetingStatus

        live_meeting.status = MeetingStatus.ENDED
        db.add(live_meeting)
        await db.commit()

        response = await client.post(
            "/api/v1/meetings/join",
            json={
                "meeting_id": live_meeting.meeting_id,
                "display_name": "Late",
                "passcode": "test12",
            },
        )
        assert response.status_code == 409
        assert response.json()["error"]["code"] == "MEETING_NOT_JOINABLE"

    async def test_join_invalid_display_name_empty(
        self, client: AsyncClient, default_user, live_meeting
    ):
        response = await client.post(
            "/api/v1/meetings/join",
            json={
                "meeting_id": live_meeting.meeting_id,
                "display_name": "  ",
                "passcode": "test12",
            },
        )
        assert response.status_code == 422


@pytest.mark.asyncio
class TestJoinByInvite:
    async def test_join_by_invite_token(self, client: AsyncClient, default_user, live_meeting):
        response = await client.post(
            "/api/v1/meetings/join-by-invite",
            json={
                "invite_token": live_meeting.invite_token,
                "display_name": "Invite User",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["display_name"] == "Invite User"

    async def test_invalid_invite_token(self, client: AsyncClient):
        response = await client.post(
            "/api/v1/meetings/join-by-invite",
            json={"invite_token": "completely-invalid-token-xyz", "display_name": "Test"},
        )
        assert response.status_code == 404
        assert response.json()["error"]["code"] == "INVALID_INVITE_TOKEN"


@pytest.mark.asyncio
class TestListParticipants:
    async def test_list_active_participants(self, client: AsyncClient, default_user, live_meeting):
        response = await client.get(f"/api/v1/meetings/{live_meeting.meeting_id}/participants")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        # Host should be in the list
        host = next((p for p in data if p["is_host"]), None)
        assert host is not None
        assert host["display_name"] == "Aditya Raj"


@pytest.mark.asyncio
class TestHostControls:
    async def _join_participant(self, client, live_meeting, name="Participant One"):
        r = await client.post(
            "/api/v1/meetings/join",
            json={
                "meeting_id": live_meeting.meeting_id,
                "display_name": name,
                "passcode": "test12",
            },
        )
        assert r.status_code == 200
        return r.json()["participant_id"]

    async def test_host_can_mute_participant(self, client: AsyncClient, default_user, live_meeting):
        p_id = await self._join_participant(client, live_meeting)
        host_id = live_meeting._test_host_participant_id

        response = await client.post(
            f"/api/v1/meetings/{live_meeting.meeting_id}/participants/{p_id}/mute",
            params={"actor_participant_id": host_id},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["audio_enabled"] is False
        assert data["muted_by_host"] is True

    async def test_participant_cannot_mute_another(
        self, client: AsyncClient, default_user, live_meeting
    ):
        p1_id = await self._join_participant(client, live_meeting, "P1")
        p2_id = await self._join_participant(client, live_meeting, "P2")

        response = await client.post(
            f"/api/v1/meetings/{live_meeting.meeting_id}/participants/{p2_id}/mute",
            params={"actor_participant_id": p1_id},  # p1 is not host
        )
        assert response.status_code == 403
        assert response.json()["error"]["code"] == "UNAUTHORIZED_HOST_ACTION"

    async def test_host_can_mute_all(self, client: AsyncClient, default_user, live_meeting):
        await self._join_participant(client, live_meeting, "P1")
        await self._join_participant(client, live_meeting, "P2")
        host_id = live_meeting._test_host_participant_id

        response = await client.post(
            f"/api/v1/meetings/{live_meeting.meeting_id}/mute-all",
            params={"actor_participant_id": host_id},
        )
        assert response.status_code == 200
        muted = response.json()
        assert all(p["audio_enabled"] is False for p in muted)
        assert all(p["muted_by_host"] is True for p in muted)

    async def test_host_can_remove_participant(
        self, client: AsyncClient, default_user, live_meeting
    ):
        p_id = await self._join_participant(client, live_meeting)
        host_id = live_meeting._test_host_participant_id

        response = await client.delete(
            f"/api/v1/meetings/{live_meeting.meeting_id}/participants/{p_id}",
            params={"actor_participant_id": host_id},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] is False
        assert data["removed_from_meeting"] is True

    async def test_cross_meeting_access_rejected(
        self, client: AsyncClient, default_user, live_meeting, scheduled_meeting
    ):
        # Try to act on scheduled_meeting using live_meeting host's participant ID
        host_id = live_meeting._test_host_participant_id
        response = await client.post(
            f"/api/v1/meetings/{scheduled_meeting.meeting_id}/mute-all",
            params={"actor_participant_id": host_id},
        )
        # host_id belongs to live_meeting, not scheduled_meeting
        assert response.status_code in (403, 404)


@pytest.mark.asyncio
class TestMeetingLifecycle:
    async def test_start_scheduled_meeting(
        self, client: AsyncClient, default_user, scheduled_meeting, db
    ):
        import uuid

        from app.common.enums import ParticipantRole
        from app.common.utils import utcnow
        from app.features.meetings.generator import generate_meeting_participant_id
        from app.features.meetings.models import MeetingParticipant

        # Add host participant to scheduled meeting
        host_pid = generate_meeting_participant_id()
        host = MeetingParticipant(
            id=str(uuid.uuid4()),
            meeting_id=scheduled_meeting.id,
            user_id=default_user.id,
            participant_id=host_pid,
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

        response = await client.post(
            f"/api/v1/meetings/{scheduled_meeting.meeting_id}/start",
            params={"actor_participant_id": host_pid},
        )
        assert response.status_code == 200
        assert response.json()["status"] == "live"

    async def test_end_live_meeting(self, client: AsyncClient, default_user, live_meeting):
        host_id = live_meeting._test_host_participant_id
        response = await client.post(
            f"/api/v1/meetings/{live_meeting.meeting_id}/end",
            params={"actor_participant_id": host_id},
        )
        assert response.status_code == 200
        assert response.json()["status"] == "ended"

    async def test_join_after_ended_rejected(self, client: AsyncClient, default_user, live_meeting):
        host_id = live_meeting._test_host_participant_id
        await client.post(
            f"/api/v1/meetings/{live_meeting.meeting_id}/end",
            params={"actor_participant_id": host_id},
        )
        response = await client.post(
            "/api/v1/meetings/join",
            json={
                "meeting_id": live_meeting.meeting_id,
                "display_name": "Late",
                "passcode": "test12",
            },
        )
        assert response.status_code == 409
        assert response.json()["error"]["code"] == "MEETING_NOT_JOINABLE"
