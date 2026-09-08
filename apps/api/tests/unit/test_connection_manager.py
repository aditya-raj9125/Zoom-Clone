"""Regression tests for signaling delivery and reconnect ownership."""

import pytest
from starlette.websockets import WebSocketState

from app.features.realtime import websocket as websocket_module
from app.features.realtime.events import WSEvent
from app.features.realtime.manager import ConnectionManager


class FakeWebSocket:
    def __init__(self) -> None:
        self.client_state = WebSocketState.CONNECTED
        self.messages: list[str] = []
        self.closed = False

    async def accept(self) -> None:
        self.client_state = WebSocketState.CONNECTED

    async def send_text(self, message: str) -> None:
        self.messages.append(message)

    async def close(self) -> None:
        self.closed = True
        self.client_state = WebSocketState.DISCONNECTED


@pytest.mark.asyncio
async def test_signaling_is_buffered_and_flushed_in_order() -> None:
    manager = ConnectionManager()
    first = WSEvent(type="webrtc.offer", meeting_id="meeting", payload={"n": 1})
    second = WSEvent(type="webrtc.ice_candidate", meeting_id="meeting", payload={"n": 2})

    await manager.send_to_participant("meeting", "peer", first)
    await manager.send_to_participant("meeting", "peer", second)

    socket = FakeWebSocket()
    await manager.connect(socket, "meeting", "peer")  # type: ignore[arg-type]

    assert list(socket.messages) == [first.to_json(), second.to_json()]


@pytest.mark.asyncio
async def test_stale_socket_cannot_disconnect_reconnected_session() -> None:
    manager = ConnectionManager()
    old_socket = FakeWebSocket()
    new_socket = FakeWebSocket()

    await manager.connect(old_socket, "meeting", "peer")  # type: ignore[arg-type]
    await manager.connect(new_socket, "meeting", "peer")  # type: ignore[arg-type]
    await manager.disconnect("meeting", "peer", old_socket)  # type: ignore[arg-type]

    assert manager.is_connected("meeting", "peer")
    assert not new_socket.closed


@pytest.mark.asyncio
async def test_offer_relay_preserves_target_and_injects_sender(monkeypatch: pytest.MonkeyPatch) -> None:
    """The signaling relay must never alter target routing or drop SDP payload."""

    class CapturingManager:
        def __init__(self) -> None:
            self.calls: list[tuple[str, str, WSEvent]] = []

        async def send_to_participant(
            self, meeting_id: str, participant_id: str, event: WSEvent
        ) -> None:
            self.calls.append((meeting_id, participant_id, event))

    manager = CapturingManager()
    monkeypatch.setattr(websocket_module, "connection_manager", manager)

    await websocket_module._handle_inbound(
        '{"type":"webrtc.offer","target_participant_id":"guest","payload":{"sdp":"offer-sdp","type":"offer"}}',
        "meeting",
        "host",
    )

    assert len(manager.calls) == 1
    meeting_id, target, event = manager.calls[0]
    assert meeting_id == "meeting"
    assert target == "guest"
    assert event.type == "webrtc.offer"
    assert event.payload == {
        "sdp": "offer-sdp",
        "type": "offer",
        "from_participant_id": "host",
    }
