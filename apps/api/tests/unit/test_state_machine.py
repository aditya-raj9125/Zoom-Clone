"""Unit tests for the meeting state machine."""

import pytest

from app.common.enums import MeetingStatus
from app.core.exceptions import InvalidMeetingStateError
from app.features.meetings.state_machine import MeetingStateMachine


class TestMeetingStateMachine:
    def test_scheduled_can_go_live(self):
        assert MeetingStateMachine.can_transition(MeetingStatus.SCHEDULED, MeetingStatus.LIVE)

    def test_scheduled_can_be_cancelled(self):
        assert MeetingStateMachine.can_transition(MeetingStatus.SCHEDULED, MeetingStatus.CANCELLED)

    def test_live_can_end(self):
        assert MeetingStateMachine.can_transition(MeetingStatus.LIVE, MeetingStatus.ENDED)

    def test_ended_cannot_go_live(self):
        assert not MeetingStateMachine.can_transition(MeetingStatus.ENDED, MeetingStatus.LIVE)

    def test_cancelled_cannot_go_live(self):
        assert not MeetingStateMachine.can_transition(MeetingStatus.CANCELLED, MeetingStatus.LIVE)

    def test_ended_is_terminal(self):
        assert MeetingStateMachine.is_terminal(MeetingStatus.ENDED)

    def test_cancelled_is_terminal(self):
        assert MeetingStateMachine.is_terminal(MeetingStatus.CANCELLED)

    def test_live_is_not_terminal(self):
        assert not MeetingStateMachine.is_terminal(MeetingStatus.LIVE)

    def test_transition_returns_target_status(self):
        result = MeetingStateMachine.transition(MeetingStatus.SCHEDULED, MeetingStatus.LIVE)
        assert result == MeetingStatus.LIVE

    def test_invalid_transition_raises(self):
        with pytest.raises(InvalidMeetingStateError):
            MeetingStateMachine.transition(MeetingStatus.ENDED, MeetingStatus.LIVE)

    def test_can_join_live(self):
        assert MeetingStateMachine.can_join(MeetingStatus.LIVE)

    def test_can_join_scheduled(self):
        assert MeetingStateMachine.can_join(MeetingStatus.SCHEDULED)

    def test_cannot_join_ended(self):
        assert not MeetingStateMachine.can_join(MeetingStatus.ENDED)

    def test_cannot_join_cancelled(self):
        assert not MeetingStateMachine.can_join(MeetingStatus.CANCELLED)
