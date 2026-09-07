"""Unit tests for ID/token generator functions."""

import re

from app.core.security import (
    generate_invite_token,
    generate_meeting_id,
    generate_participant_id,
    generate_passcode,
)


class TestMeetingIdGenerator:
    def test_is_10_digits(self):
        mid = generate_meeting_id()
        assert len(mid) == 10
        assert mid.isdigit()

    def test_no_leading_zero(self):
        for _ in range(100):
            mid = generate_meeting_id()
            assert mid[0] != "0", f"Leading zero found in {mid}"

    def test_generates_different_values(self):
        ids = {generate_meeting_id() for _ in range(50)}
        assert len(ids) > 1, "Generator produced identical IDs"


class TestPasscodeGenerator:
    def test_length_6(self):
        pc = generate_passcode()
        assert len(pc) == 6

    def test_alphanumeric(self):
        pc = generate_passcode()
        assert re.match(r"^[A-Za-z0-9]{6}$", pc), f"Non-alphanumeric passcode: {pc}"

    def test_generates_different_values(self):
        codes = {generate_passcode() for _ in range(50)}
        assert len(codes) > 1


class TestInviteTokenGenerator:
    def test_is_url_safe(self):
        token = generate_invite_token()
        # URL-safe base64 uses only A-Z, a-z, 0-9, -, _
        assert re.match(r"^[A-Za-z0-9_\-]+$", token), f"Non-URL-safe characters: {token}"

    def test_is_sufficiently_long(self):
        # 32 bytes → 43 base64url characters
        token = generate_invite_token()
        assert len(token) >= 40, f"Token too short: {len(token)} chars"

    def test_generates_different_values(self):
        tokens = {generate_invite_token() for _ in range(50)}
        assert len(tokens) > 1


class TestParticipantIdGenerator:
    def test_is_url_safe(self):
        pid = generate_participant_id()
        assert re.match(r"^[A-Za-z0-9_\-]+$", pid)

    def test_is_sufficiently_long(self):
        pid = generate_participant_id()
        assert len(pid) >= 20

    def test_generates_different_values(self):
        pids = {generate_participant_id() for _ in range(50)}
        assert len(pids) > 1
