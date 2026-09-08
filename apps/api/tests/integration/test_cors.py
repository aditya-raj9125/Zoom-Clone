"""CORS regression tests for production and Vercel preview origins."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_vercel_preview_origin_passes_preflight(client: AsyncClient) -> None:
    response = await client.options(
        "/api/v1/auth/login",
        headers={
            "Origin": "https://zoom-clone-web-git-main-aditya-raj9125s-projects.vercel.app",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == (
        "https://zoom-clone-web-git-main-aditya-raj9125s-projects.vercel.app"
    )
    assert response.headers["access-control-allow-credentials"] == "true"


@pytest.mark.asyncio
async def test_untrusted_origin_is_not_allowed(client: AsyncClient) -> None:
    response = await client.options(
        "/api/v1/auth/login",
        headers={
            "Origin": "https://untrusted-example.invalid",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert "access-control-allow-origin" not in response.headers
