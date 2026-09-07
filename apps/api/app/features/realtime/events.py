"""WebSocket event types and typed payload schemas.

All events exchanged via WebSocket conform to a predictable envelope:

    {
        "type": "<event_type>",
        "meeting_id": "<public meeting ID>",
        "timestamp": "<ISO-8601 UTC>",
        "payload": { ... }
    }

Inbound events (client → server):
    webrtc.offer, webrtc.answer, webrtc.ice_candidate, ping

Outbound events (server → client):
    meeting.started, meeting.ended,
    participant.joined, participant.left, participant.removed,
    participant.audio_changed, participant.video_changed,
    participant.muted, participant.unmuted,
    screen_share.started, screen_share.stopped,
    chat.message_created, reaction.created, host.mute_all
"""

from datetime import UTC, datetime
from enum import StrEnum
from typing import Any

from pydantic import BaseModel, Field


class WSEventType(StrEnum):
    # Meeting lifecycle
    MEETING_STARTED = "meeting.started"
    MEETING_ENDED = "meeting.ended"

    # Participant presence
    PARTICIPANT_JOINED = "participant.joined"
    PARTICIPANT_LEFT = "participant.left"
    PARTICIPANT_REMOVED = "participant.removed"

    # Media state
    PARTICIPANT_AUDIO_CHANGED = "participant.audio_changed"
    PARTICIPANT_VIDEO_CHANGED = "participant.video_changed"
    PARTICIPANT_MUTED = "participant.muted"
    PARTICIPANT_UNMUTED = "participant.unmuted"

    # Screen sharing
    SCREEN_SHARE_STARTED = "screen_share.started"
    SCREEN_SHARE_STOPPED = "screen_share.stopped"

    # Chat
    CHAT_MESSAGE_CREATED = "chat.message_created"

    # Reactions
    REACTION_CREATED = "reaction.created"

    # Host commands
    HOST_MUTE_ALL = "host.mute_all"

    # WebRTC signaling (client → server and forwarded server → target client)
    WEBRTC_OFFER = "webrtc.offer"
    WEBRTC_ANSWER = "webrtc.answer"
    WEBRTC_ICE_CANDIDATE = "webrtc.ice_candidate"

    # Connectivity
    PING = "ping"
    PONG = "pong"
    ERROR = "error"


class WSEvent(BaseModel):
    """Typed WebSocket event envelope."""

    type: WSEventType
    meeting_id: str
    timestamp: str = Field(default_factory=lambda: datetime.now(tz=UTC).isoformat())
    payload: dict[str, Any] = Field(default_factory=dict)

    def to_json(self) -> str:
        return self.model_dump_json()


# ---------------------------------------------------------------------------
# Event factory helpers — one function per event type
# ---------------------------------------------------------------------------


def make_meeting_started(meeting_id: str, host_participant_id: str) -> WSEvent:
    return WSEvent(
        type=WSEventType.MEETING_STARTED,
        meeting_id=meeting_id,
        payload={"host_participant_id": host_participant_id},
    )


def make_meeting_ended(meeting_id: str) -> WSEvent:
    return WSEvent(
        type=WSEventType.MEETING_ENDED,
        meeting_id=meeting_id,
        payload={},
    )


def make_participant_joined(
    meeting_id: str,
    participant_id: str,
    display_name: str,
    role: str,
    is_host: bool,
    audio_enabled: bool,
    video_enabled: bool,
) -> WSEvent:
    return WSEvent(
        type=WSEventType.PARTICIPANT_JOINED,
        meeting_id=meeting_id,
        payload={
            "participant_id": participant_id,
            "display_name": display_name,
            "role": role,
            "is_host": is_host,
            "audio_enabled": audio_enabled,
            "video_enabled": video_enabled,
        },
    )


def make_participant_left(meeting_id: str, participant_id: str, display_name: str) -> WSEvent:
    return WSEvent(
        type=WSEventType.PARTICIPANT_LEFT,
        meeting_id=meeting_id,
        payload={"participant_id": participant_id, "display_name": display_name},
    )


def make_participant_removed(meeting_id: str, participant_id: str, display_name: str) -> WSEvent:
    return WSEvent(
        type=WSEventType.PARTICIPANT_REMOVED,
        meeting_id=meeting_id,
        payload={"participant_id": participant_id, "display_name": display_name},
    )


def make_audio_changed(meeting_id: str, participant_id: str, enabled: bool) -> WSEvent:
    return WSEvent(
        type=WSEventType.PARTICIPANT_AUDIO_CHANGED,
        meeting_id=meeting_id,
        payload={"participant_id": participant_id, "audio_enabled": enabled},
    )


def make_video_changed(meeting_id: str, participant_id: str, enabled: bool) -> WSEvent:
    return WSEvent(
        type=WSEventType.PARTICIPANT_VIDEO_CHANGED,
        meeting_id=meeting_id,
        payload={"participant_id": participant_id, "video_enabled": enabled},
    )


def make_participant_muted(meeting_id: str, participant_id: str, by_host: bool = True) -> WSEvent:
    return WSEvent(
        type=WSEventType.PARTICIPANT_MUTED,
        meeting_id=meeting_id,
        payload={"participant_id": participant_id, "by_host": by_host},
    )


def make_participant_unmuted(meeting_id: str, participant_id: str) -> WSEvent:
    return WSEvent(
        type=WSEventType.PARTICIPANT_UNMUTED,
        meeting_id=meeting_id,
        payload={"participant_id": participant_id},
    )


def make_screen_share_started(meeting_id: str, participant_id: str) -> WSEvent:
    return WSEvent(
        type=WSEventType.SCREEN_SHARE_STARTED,
        meeting_id=meeting_id,
        payload={"participant_id": participant_id},
    )


def make_screen_share_stopped(meeting_id: str, participant_id: str) -> WSEvent:
    return WSEvent(
        type=WSEventType.SCREEN_SHARE_STOPPED,
        meeting_id=meeting_id,
        payload={"participant_id": participant_id},
    )


def make_chat_message(
    meeting_id: str,
    message_id: str,
    participant_id: str,
    display_name: str,
    message: str,
    created_at: str,
) -> WSEvent:
    return WSEvent(
        type=WSEventType.CHAT_MESSAGE_CREATED,
        meeting_id=meeting_id,
        payload={
            "id": message_id,
            "participant_id": participant_id,
            "display_name": display_name,
            "message": message,
            "created_at": created_at,
        },
    )


def make_reaction(
    meeting_id: str,
    reaction_id: str,
    participant_id: str,
    display_name: str,
    reaction_type: str,
    created_at: str,
) -> WSEvent:
    return WSEvent(
        type=WSEventType.REACTION_CREATED,
        meeting_id=meeting_id,
        payload={
            "id": reaction_id,
            "participant_id": participant_id,
            "display_name": display_name,
            "reaction_type": reaction_type,
            "created_at": created_at,
        },
    )


def make_host_mute_all(meeting_id: str) -> WSEvent:
    return WSEvent(
        type=WSEventType.HOST_MUTE_ALL,
        meeting_id=meeting_id,
        payload={},
    )


def make_error(meeting_id: str, code: str, message: str) -> WSEvent:
    return WSEvent(
        type=WSEventType.ERROR,
        meeting_id=meeting_id,
        payload={"code": code, "message": message},
    )
