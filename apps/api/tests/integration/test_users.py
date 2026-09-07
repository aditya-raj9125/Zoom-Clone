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
