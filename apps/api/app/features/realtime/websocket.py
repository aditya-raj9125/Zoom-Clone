"""WebSocket endpoint for real-time meeting communication.

Architecture:
    Browser ↔ WebSocket ↔ FastAPI (signaling + state events)
                               ↕
                         ConnectionManager
                         (in-memory registry)

Responsibilities of this endpoint:
1. Validate that the connecting participant belongs to the meeting.
2. Register the connection in ConnectionManager.
3. Receive inbound messages and dispatch them:
   - webrtc.offer / webrtc.answer / webrtc.ice_candidate → forward to target
   - ping → pong
4. Broadcast outbound events (emitted by service layer via ConnectionManager).
5. Handle disconnect gracefully.

WebRTC signaling architecture:
    Peer A  ──── offer ────→  FastAPI  ──── offer ────→  Peer B
    Peer A  ←─── answer ───  FastAPI  ←─── answer ──── Peer B
    Peer A  ── ice_candidate → FastAPI → ice_candidate → Peer B

FastAPI is the relay.  It does NOT process SDP or ICE — it only forwards.
"""

import json
import logging

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.core.database import AsyncSessionLocal
from app.features.meetings.repository import MeetingRepository
from app.features.participants.repository import ParticipantRepository
from app.features.realtime.events import (
    WSEvent,
    WSEventType,
    make_error,
    make_participant_joined,
)
from app.features.realtime.manager import connection_manager
from app.features.realtime.schemas import InboundMessage

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws", tags=["WebSocket"])


@router.websocket("/meetings/{meeting_id}")
async def meeting_websocket(
    websocket: WebSocket,
    meeting_id: str,
    participant_id: str = Query(..., description="Opaque participant ID from join response"),
) -> None:
    """WebSocket endpoint for a meeting room.

    Query params:
        participant_id: The opaque participant ID returned by the join endpoint.

    Protocol:
        After connecting, the server will broadcast participant.joined to others.
        The client should then initiate WebRTC negotiation by sending webrtc.offer
        to specific target participants.

    Inbound message format::

        {
            "type": "webrtc.offer",
            "target_participant_id": "<peer>",
            "payload": { "sdp": "..." }
        }

    Outbound event format::

        {
            "type": "participant.joined",
            "meeting_id": "...",
            "timestamp": "...",
            "payload": { ... }
        }
    """
    async with AsyncSessionLocal() as db:
        # ---------------------------------------------------------------------------
        # Validate participant membership
        # ---------------------------------------------------------------------------
        participant_repo = ParticipantRepository(db)
        meeting_repo = MeetingRepository(db)

        participant = await participant_repo.get_active_by_participant_id(participant_id)
        if participant is None:
            await websocket.close(code=4001, reason="Participant not found or not active")
            return

        meeting = await meeting_repo.get_by_meeting_id(meeting_id)
        if meeting is None:
            await websocket.close(code=4004, reason="Meeting not found")
            return

        if str(participant.meeting_id) != str(meeting.id):
            await websocket.close(code=4003, reason="Participant does not belong to this meeting")
            return

        # ---------------------------------------------------------------------------
        # Accept connection and register
        # ---------------------------------------------------------------------------
        await connection_manager.connect(websocket, meeting_id, participant_id)

        # Notify other participants that this one has connected
        await connection_manager.broadcast_to_meeting(
            meeting_id,
            make_participant_joined(
                meeting_id=meeting_id,
                participant_id=participant_id,
                display_name=participant.display_name,
                role=participant.role.value,
                is_host=participant.is_host,
                audio_enabled=participant.audio_enabled,
                video_enabled=participant.video_enabled,
            ),
        )

        # ---------------------------------------------------------------------------
        # Message loop
        # ---------------------------------------------------------------------------
        try:
            while True:
                raw = await websocket.receive_text()
                await _handle_inbound(raw, meeting_id, participant_id)
        except WebSocketDisconnect:
            logger.info(
                "WebSocket disconnected: meeting=%s participant=%s", meeting_id, participant_id
            )
        except Exception as exc:
            logger.exception(
                "WebSocket error: meeting=%s participant=%s error=%s",
                meeting_id,
                participant_id,
                exc,
            )
        finally:
            await connection_manager.disconnect(meeting_id, participant_id)


async def _handle_inbound(raw: str, meeting_id: str, participant_id: str) -> None:
    """Parse and dispatch an inbound WebSocket message."""
    try:
        data = json.loads(raw)
        msg = InboundMessage.model_validate(data)
    except Exception:
        await connection_manager.send_to_participant(
            meeting_id,
            participant_id,
            make_error(meeting_id, "INVALID_MESSAGE", "Could not parse message"),
        )
        return

    event_type = msg.type

    # ---------------------------------------------------------------------------
    # Ping → Pong
    # ---------------------------------------------------------------------------
    if event_type == WSEventType.PING.value:
        pong = WSEvent(type=WSEventType.PONG, meeting_id=meeting_id, payload={})
        await connection_manager.send_to_participant(meeting_id, participant_id, pong)
        return

    # ---------------------------------------------------------------------------
    # WebRTC signaling — forward to target participant
    # ---------------------------------------------------------------------------
    signaling_types = {
        WSEventType.WEBRTC_OFFER.value,
        WSEventType.WEBRTC_ANSWER.value,
        WSEventType.WEBRTC_ICE_CANDIDATE.value,
    }
    if event_type in signaling_types:
        target = msg.target_participant_id
        if not target:
            await connection_manager.send_to_participant(
                meeting_id,
                participant_id,
                make_error(
                    meeting_id, "MISSING_TARGET", "target_participant_id is required for signaling"
                ),
            )
            return

        # Build forwarded event with sender info injected into payload
        forwarded_payload = {**msg.payload, "from_participant_id": participant_id}
        forwarded = WSEvent(
            type=WSEventType(event_type),
            meeting_id=meeting_id,
            payload=forwarded_payload,
        )
        await connection_manager.send_to_participant(meeting_id, target, forwarded)
        return

    # Unknown message type — log and ignore (don't error, future clients may send new types)
    logger.debug(
        "Unhandled WebSocket message type '%s' from participant %s", event_type, participant_id
    )
