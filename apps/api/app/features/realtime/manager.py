"""WebSocket connection manager.

Responsibilities:
- Track connected WebSocket clients per meeting.
- Broadcast events to all participants in a meeting.
- Send targeted events to a specific participant.
- Disconnect participants when removed or meeting ends.

Design decisions:
- Pure in-memory registry — no database I/O here.
- Thread safety: FastAPI with uvicorn uses a single async event loop so we do
  not need locks for the dict mutations (they are coroutine-safe).
- If horizontal scaling is needed in the future, replace the in-memory dict
  with a Redis pub/sub adapter behind the same interface.
"""

import contextlib
import logging
from collections import defaultdict

from fastapi import WebSocket
from starlette.websockets import WebSocketState

from app.features.realtime.events import WSEvent

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages all active WebSocket connections across all meetings.

    Structure::

        _connections: {
            meeting_id: {
                participant_id: WebSocket
            }
        }
    """

    def __init__(self) -> None:
        # meeting_id → {participant_id → WebSocket}
        self._connections: dict[str, dict[str, WebSocket]] = defaultdict(dict)
        # A REST join can complete just before the participant opens its
        # WebSocket. Keep signaling messages briefly so the first offer/ICE
        # candidates are delivered when that socket registers.
        self._pending_signaling: dict[tuple[str, str], list[WSEvent]] = defaultdict(list)

    # ---------------------------------------------------------------------------
    # Connection lifecycle
    # ---------------------------------------------------------------------------

    async def connect(
        self,
        websocket: WebSocket,
        meeting_id: str,
        participant_id: str,
    ) -> None:
        """Accept the WebSocket and register the connection."""
        await websocket.accept()
        self._connections[meeting_id][participant_id] = websocket

        pending = self._pending_signaling.pop((meeting_id, participant_id), [])
        for event in pending:
            try:
                await websocket.send_text(event.to_json())
            except Exception as exc:
                logger.warning(
                    "Failed to flush pending signaling to participant %s in meeting %s: %s",
                    participant_id,
                    meeting_id,
                    exc,
                )
                break

        logger.info(
            "WebSocket connected | meeting=%s participant=%s",
            meeting_id,
            participant_id,
        )

    async def disconnect(self, meeting_id: str, participant_id: str) -> None:
        """Remove the connection from the registry and close the socket gracefully."""
        ws = self._connections.get(meeting_id, {}).pop(participant_id, None)
        self._pending_signaling.pop((meeting_id, participant_id), None)
        if ws and ws.client_state == WebSocketState.CONNECTED:
            with contextlib.suppress(Exception):
                await ws.close()
        logger.info(
            "WebSocket disconnected | meeting=%s participant=%s",
            meeting_id,
            participant_id,
        )

    # ---------------------------------------------------------------------------
    # Broadcast
    # ---------------------------------------------------------------------------

    async def broadcast_to_meeting(self, meeting_id: str, event: WSEvent) -> None:
        """Send an event to all connected participants in a meeting."""
        message = event.to_json()
        dead_connections: list[str] = []

        for participant_id, ws in self._connections.get(meeting_id, {}).items():
            try:
                await ws.send_text(message)
            except Exception as exc:
                logger.warning(
                    "Failed to send to participant %s in meeting %s: %s",
                    participant_id,
                    meeting_id,
                    exc,
                )
                dead_connections.append(participant_id)

        for participant_id in dead_connections:
            self._connections[meeting_id].pop(participant_id, None)

    async def send_to_participant(
        self, meeting_id: str, participant_id: str, event: WSEvent
    ) -> None:
        """Send an event to a single participant (e.g. WebRTC signaling)."""
        ws = self._connections.get(meeting_id, {}).get(participant_id)
        if ws:
            try:
                await ws.send_text(event.to_json())
            except Exception as exc:
                logger.warning("Failed to send to participant %s: %s", participant_id, exc)
        elif event.type in {
            "webrtc.offer",
            "webrtc.answer",
            "webrtc.ice_candidate",
        }:
            # Preserve ordering: offer and following ICE candidates are
            # replayed in the same order when the target socket connects.
            pending = self._pending_signaling[(meeting_id, participant_id)]
            if len(pending) < 100:
                pending.append(event)

    # ---------------------------------------------------------------------------
    # Helpers
    # ---------------------------------------------------------------------------

    def is_connected(self, meeting_id: str, participant_id: str) -> bool:
        return participant_id in self._connections.get(meeting_id, {})

    def participant_count(self, meeting_id: str) -> int:
        return len(self._connections.get(meeting_id, {}))

    async def disconnect_meeting(self, meeting_id: str) -> None:
        """Close all connections in a meeting (called on meeting.ended)."""
        for participant_id in list(self._connections.get(meeting_id, {}).keys()):
            await self.disconnect(meeting_id, participant_id)
        self._connections.pop(meeting_id, None)
        for key in [key for key in self._pending_signaling if key[0] == meeting_id]:
            self._pending_signaling.pop(key, None)


# ---------------------------------------------------------------------------
# Singleton — shared across the entire application process
# ---------------------------------------------------------------------------
connection_manager = ConnectionManager()
