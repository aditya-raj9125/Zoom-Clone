"""Realtime WebSocket schemas (inbound message parsing)."""

from typing import Any

from pydantic import BaseModel


class InboundMessage(BaseModel):
    """Structure of any message sent from the client to the WebSocket server."""

    type: str
    payload: dict[str, Any] = {}
    # For WebRTC signaling: the target participant to forward to
    target_participant_id: str | None = None
