# @zoom-clone/contracts

Shared TypeScript contract definitions, DTOs, and WebSocket event types for the Zoom Clone ecosystem.

## Overview
This package is the single source of truth for all data structures exchanged between the FastAPI backend (`apps/api`) and the Next.js frontend (`apps/web`).

## Contents
- **Enums**: `MeetingStatus`, `MeetingType`, `ParticipantRole`, `ReactionType`, `WSEventType`
- **Meeting DTOs**: `CreateInstantMeetingRequest`, `ScheduleMeetingRequest`, `MeetingResponse`, `MeetingListItem`
- **Participant DTOs**: `MeetingJoinRequest`, `JoinByInviteRequest`, `JoinMeetingResponse`, `ParticipantResponse`
- **Media Controls**: `AudioStateRequest`, `VideoStateRequest`, `ScreenShareRequest`
- **Chat & Reactions**: `ChatMessageCreate`, `ChatMessageResponse`, `ReactionCreate`, `ReactionResponse`
- **WebRTC Signaling**: `WebRTCOfferPayload`, `WebRTCAnswerPayload`, `WebRTCIceCandidatePayload`
- **Envelopes**: `ApiResponse<T>`, `PaginatedResponse<T>`, `ApiError`
