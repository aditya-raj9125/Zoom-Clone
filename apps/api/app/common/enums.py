"""Application-wide enumerations.

All enums live here to prevent circular imports between feature modules
and to provide a single source of truth for domain vocabulary.
"""

from enum import StrEnum


class MeetingType(StrEnum):
    """Categorises how a meeting was created."""

    INSTANT = "instant"
    SCHEDULED = "scheduled"
    # RECURRING = "recurring"  # Reserved for future implementation


class MeetingStatus(StrEnum):
    """Represents the lifecycle state of a meeting.

    Valid transitions are enforced by MeetingStateMachine in
    features/meetings/state_machine.py.

    SCHEDULED: Meeting is created and scheduled but not yet started.
    WAITING:   Meeting is active but waiting for the host to start.
    LIVE:      Meeting is in progress.
    ENDED:     Meeting has concluded; no new participants may join.
    CANCELLED: Meeting was cancelled before it started.
    """

    SCHEDULED = "scheduled"
    WAITING = "waiting"
    LIVE = "live"
    ENDED = "ended"
    CANCELLED = "cancelled"


class ParticipantRole(StrEnum):
    """Defines authority level within a meeting."""

    HOST = "host"
    CO_HOST = "co_host"
    PARTICIPANT = "participant"


class ReactionType(StrEnum):
    """Emoji reactions a participant can send during a meeting."""

    THUMBS_UP = "thumbs_up"
    CLAP = "clap"
    HEART = "heart"
    LAUGH = "laugh"
    SURPRISED = "surprised"
    CELEBRATE = "celebrate"


class MeetingEventType(StrEnum):
    """Audit event types persisted in meeting_events table."""

    MEETING_CREATED = "meeting_created"
    MEETING_STARTED = "meeting_started"
    MEETING_ENDED = "meeting_ended"
    MEETING_CANCELLED = "meeting_cancelled"
    PARTICIPANT_JOINED = "participant_joined"
    PARTICIPANT_LEFT = "participant_left"
    PARTICIPANT_REMOVED = "participant_removed"
    PARTICIPANT_MUTED = "participant_muted"
    PARTICIPANT_UNMUTED = "participant_unmuted"
    VIDEO_ENABLED = "video_enabled"
    VIDEO_DISABLED = "video_disabled"
    SCREEN_SHARE_STARTED = "screen_share_started"
    SCREEN_SHARE_STOPPED = "screen_share_stopped"
    REACTION_SENT = "reaction_sent"
    CHAT_MESSAGE_SENT = "chat_message_sent"
    HOST_CHANGED = "host_changed"
    MUTE_ALL = "mute_all"
