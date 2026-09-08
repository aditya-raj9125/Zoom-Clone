"""Integration tests for user endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestUsersMe:
    async def test_get_me_returns_default_user(self, client: AsyncClient, default_user):
        response = await client.get("/api/v1/users/me")
        assert response.status_code == 200
        data = response.json()
        assert data["display_name"] == "Aditya Raj"
        assert data["is_default_user"] is True
        assert "id" in data

    async def test_get_me_no_default_user_returns_404(self, client: AsyncClient):
        # No default_user fixture — DB is empty
        response = await client.get("/api/v1/users/me")
        assert response.status_code == 404
        error = response.json()["error"]
        assert error["code"] == "USER_NOT_FOUND"

    async def test_update_me_display_name(self, client: AsyncClient, default_user):
        response = await client.patch(
            "/api/v1/users/me",
            json={"display_name": "Aditya Dynamic Name"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["display_name"] == "Aditya Dynamic Name"

        # Verify get reflects change
        get_res = await client.get("/api/v1/users/me")
        assert get_res.status_code == 200
        assert get_res.json()["display_name"] == "Aditya Dynamic Name"
