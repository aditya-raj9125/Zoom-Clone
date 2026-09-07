"""Meeting lifecycle state machine.

Centralises ALL meeting state transition rules.

No route handler or service should compare MeetingStatus values directly —
all transition decisions go through this module.

Valid transitions:
  SCHEDULED → LIVE       (host starts the meeting)
  SCHEDULED → CANCELLED  (host cancels before starting)
  WAITING   → LIVE       (host starts from waiting room)
  WAITING   → CANCELLED
  LIVE      → ENDED      (host ends the meeting)
  ENDED     → (no transitions — terminal state)
  CANCELLED → (no transitions — terminal state)
"""

from app.common.enums import MeetingStatus
from app.core.exceptions import InvalidMeetingStateError

# ---------------------------------------------------------------------------
# Transition table
# ---------------------------------------------------------------------------
# Keys: current state.  Values: set of reachable next states.
_VALID_TRANSITIONS: dict[MeetingStatus, set[MeetingStatus]] = {
    MeetingStatus.SCHEDULED: {MeetingStatus.LIVE, MeetingStatus.CANCELLED},
    MeetingStatus.WAITING: {MeetingStatus.LIVE, MeetingStatus.CANCELLED},
    MeetingStatus.LIVE: {MeetingStatus.ENDED},
    MeetingStatus.ENDED: set(),  # terminal
    MeetingStatus.CANCELLED: set(),  # terminal
}

# States from which participants can join
_JOINABLE_STATES: set[MeetingStatus] = {
    MeetingStatus.SCHEDULED,
    MeetingStatus.WAITING,
    MeetingStatus.LIVE,
}


class MeetingStateMachine:
    """Encapsulates meeting lifecycle transition rules.

    Usage::

        MeetingStateMachine.transition(current_status, MeetingStatus.LIVE)
        # Raises InvalidMeetingStateError if the transition is not valid.

        MeetingStateMachine.can_join(meeting.status)
        # Returns bool — whether participants can currently join.
    """

    @staticmethod
    def can_transition(current: MeetingStatus, target: MeetingStatus) -> bool:
        """Return True if the transition from current → target is valid."""
        return target in _VALID_TRANSITIONS.get(current, set())

    @staticmethod
    def transition(current: MeetingStatus, target: MeetingStatus) -> MeetingStatus:
        """Validate and perform the state transition.

        Args:
            current: The meeting's current status.
            target:  The desired next status.

        Returns:
            The target status (caller should persist this).

        Raises:
            InvalidMeetingStateError: If the transition is not allowed.
        """
        if not MeetingStateMachine.can_transition(current, target):
            raise InvalidMeetingStateError(
                f"Cannot transition meeting from '{current.value}' to '{target.value}'."
            )
        return target

    @staticmethod
    def can_join(status: MeetingStatus) -> bool:
        """Return True if a participant can join a meeting in this status."""
        return status in _JOINABLE_STATES

    @staticmethod
    def is_terminal(status: MeetingStatus) -> bool:
        """Return True if the status is a terminal state (no further transitions)."""
        return not _VALID_TRANSITIONS.get(status, set())
