"""Central API router — aggregates all feature routers under /api/v1."""

from fastapi import APIRouter

from app.features.auth.router import router as auth_router
from app.features.chat.router import router as chat_router
from app.features.health.router import router as health_router
from app.features.meetings.router import router as meetings_router
from app.features.participants.router import router as participants_router
from app.features.reactions.router import router as reactions_router
from app.features.realtime.websocket import router as ws_router
from app.features.users.router import router as users_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(meetings_router)
api_router.include_router(participants_router)
api_router.include_router(chat_router)
api_router.include_router(reactions_router)
api_router.include_router(ws_router)
