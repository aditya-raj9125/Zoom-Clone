"""Centralised application exception hierarchy.

All domain exceptions derive from `AppError`.  A single FastAPI exception
handler converts them to consistent JSON error responses.

Error codes are SCREAMING_SNAKE_CASE strings — never expose raw Python
exception class names or stack traces to API clients.
"""

from http import HTTPStatus


class AppError(Exception):
    """Base class for all application-level errors.

    Attributes:
        code:    Machine-readable error code (e.g. "MEETING_NOT_FOUND").
        message: Human-readable description safe to return to API clients.
        status:  HTTP status code to return.
    """

    code: str = "INTERNAL_ERROR"
    message: str = "An unexpected error occurred."
    status: int = HTTPStatus.INTERNAL_SERVER_ERROR

    def __init__(self, message: str | None = None) -> None:
        super().__init__(message or self.message)
        if message:
            self.message = message


# ---------------------------------------------------------------------------
# Meeting errors
# ---------------------------------------------------------------------------


class MeetingNotFoundError(AppError):
    code = "MEETING_NOT_FOUND"
    message = "Meeting does not exist."
    status = HTTPStatus.NOT_FOUND


class MeetingNotJoinableError(AppError):
    code = "MEETING_NOT_JOINABLE"
    message = "This meeting cannot be joined at this time."
    status = HTTPStatus.CONFLICT


class InvalidPasscodeError(AppError):
    code = "INVALID_PASSCODE"
    message = "The provided passcode is incorrect."
    status = HTTPStatus.UNAUTHORIZED


class InvalidMeetingStateError(AppError):
    code = "INVALID_MEETING_STATE"
    message = "The requested action is not valid in the current meeting state."
    status = HTTPStatus.CONFLICT


class DuplicateMeetingError(AppError):
    code = "DUPLICATE_MEETING"
    message = "A meeting with this identifier already exists."
    status = HTTPStatus.CONFLICT


class MeetingAlreadyEndedError(AppError):
    code = "MEETING_ALREADY_ENDED"
    message = "This meeting has already ended."
    status = HTTPStatus.GONE


# ---------------------------------------------------------------------------
# Participant errors
# ---------------------------------------------------------------------------


class ParticipantNotFoundError(AppError):
    code = "PARTICIPANT_NOT_FOUND"
    message = "Participant does not exist in this meeting."
    status = HTTPStatus.NOT_FOUND


class ParticipantAlreadyActiveError(AppError):
    code = "PARTICIPANT_ALREADY_ACTIVE"
    message = "This user already has an active session in this meeting."
    status = HTTPStatus.CONFLICT


class ParticipantRemovedError(AppError):
    code = "PARTICIPANT_REMOVED"
    message = "You have been removed from this meeting."
    status = HTTPStatus.FORBIDDEN


# ---------------------------------------------------------------------------
# Authorization errors
# ---------------------------------------------------------------------------


class UnauthorizedHostActionError(AppError):
    code = "UNAUTHORIZED_HOST_ACTION"
    message = "Only the host or co-host may perform this action."
    status = HTTPStatus.FORBIDDEN


class CrossMeetingAccessError(AppError):
    code = "CROSS_MEETING_ACCESS_DENIED"
    message = "Access to resources from another meeting is not permitted."
    status = HTTPStatus.FORBIDDEN


# ---------------------------------------------------------------------------
# Invite / token errors
# ---------------------------------------------------------------------------


class InvalidInviteTokenError(AppError):
    code = "INVALID_INVITE_TOKEN"
    message = "The invite link is invalid or has expired."
    status = HTTPStatus.NOT_FOUND


# ---------------------------------------------------------------------------
# User errors
# ---------------------------------------------------------------------------


class UserNotFoundError(AppError):
    code = "USER_NOT_FOUND"
    message = "User does not exist."
    status = HTTPStatus.NOT_FOUND


# ---------------------------------------------------------------------------
# Validation errors
# ---------------------------------------------------------------------------


class InvalidScheduleTimeError(AppError):
    code = "INVALID_SCHEDULE_TIME"
    message = "Scheduled start time must be in the future."
    status = HTTPStatus.UNPROCESSABLE_ENTITY


class InvalidDurationError(AppError):
    code = "INVALID_DURATION"
    message = "Duration must be between 1 and 1440 minutes."
    status = HTTPStatus.UNPROCESSABLE_ENTITY
