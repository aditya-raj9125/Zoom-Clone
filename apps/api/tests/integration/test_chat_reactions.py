"""Integration tests for chat and reactions endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestChat:
    async def _get_participant_id(self, client, live_meeting):
        r = await client.post(
            "/api/v1/meetings/join",
            json={
                "meeting_id": live_meeting.meeting_id,
                "display_name": "Chat User",
                "passcode": "test12",
            },
        )
        return r.json()["participant_id"]

    async def test_send_and_retrieve_message(self, client: AsyncClient, default_user, live_meeting):
        p_id = await self._get_participant_id(client, live_meeting)

        # Send
        response = await client.post(
            f"/api/v1/meetings/{live_meeting.meeting_id}/chat",
            json={"participant_id": p_id, "message": "Hello everyone!"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["message"] == "Hello everyone!"
        assert data["participant_id"] == p_id

        # Retrieve
        response = await client.get(f"/api/v1/meetings/{live_meeting.meeting_id}/chat")
        assert response.status_code == 200
        messages = response.json()
        assert len(messages) >= 1
        assert any(m["message"] == "Hello everyone!" for m in messages)

    async def test_send_empty_message_rejected(
        self, client: AsyncClient, default_user, live_meeting
    ):
        p_id = await self._get_participant_id(client, live_meeting)
        response = await client.post(
            f"/api/v1/meetings/{live_meeting.meeting_id}/chat",
            json={"participant_id": p_id, "message": ""},
        )
        assert response.status_code == 422

    async def test_chat_on_nonexistent_meeting(self, client: AsyncClient):
        response = await client.get("/api/v1/meetings/0000000000/chat")
        assert response.status_code == 404


@pytest.mark.asyncio
class TestReactions:
    async def _get_participant_id(self, client, live_meeting):
        r = await client.post(
            "/api/v1/meetings/join",
            json={
                "meeting_id": live_meeting.meeting_id,
                "display_name": "Reactor",
                "passcode": "test12",
            },
        )
        return r.json()["participant_id"]

    async def test_send_valid_reaction(self, client: AsyncClient, default_user, live_meeting):
        p_id = await self._get_participant_id(client, live_meeting)
        response = await client.post(
            f"/api/v1/meetings/{live_meeting.meeting_id}/reactions",
            json={"participant_id": p_id, "reaction_type": "thumbs_up"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["reaction_type"] == "thumbs_up"
        assert data["participant_id"] == p_id

    async def test_invalid_reaction_type(self, client: AsyncClient, default_user, live_meeting):
        p_id = await self._get_participant_id(client, live_meeting)
        response = await client.post(
            f"/api/v1/meetings/{live_meeting.meeting_id}/reactions",
            json={"participant_id": p_id, "reaction_type": "INVALID_REACTION"},
        )
        assert response.status_code == 422
