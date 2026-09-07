/**
 * @zoom-clone/contracts
 * Strongly-typed API and Realtime contracts between apps/api and apps/web.
 * Derived directly from FastAPI/Pydantic v2 schemas in apps/api.
 */

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

export type MeetingStatus = "scheduled" | "waiting" | "live" | "ended" | "cancelled";

export type MeetingType = "instant" | "scheduled";

export type ParticipantRole = "host" | "co_host" | "participant";

export type ReactionType = "thumbs_up" | "clap" | "heart" | "laugh" | "surprised" | "celebrate";

export type WSEventType =
  | "meeting.started"
  | "meeting.ended"
  | "participant.joined"
  | "participant.left"
  | "participant.removed"
  | "participant.audio_changed"
  | "participant.video_changed"
  | "participant.muted"
  | "participant.unmuted"
  | "screen_share.started"
  | "screen_share.stopped"
  | "chat.message_created"
  | "reaction.created"
  | "host.mute_all"
  | "webrtc.offer"
  | "webrtc.answer"
  | "webrtc.ice_candidate"
  | "ping"
  | "pong"
  | "error";

// ---------------------------------------------------------------------------
// Common Envelopes
// ---------------------------------------------------------------------------

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// ---------------------------------------------------------------------------
// User Domain
// ---------------------------------------------------------------------------

export interface UserResponse {
  id: string;
  display_name: string;
  email: string | null;
  avatar_url: string | null;
  is_default_user: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Meeting Domain
// ---------------------------------------------------------------------------

export interface MeetingHostInfo {
  id: string;
  display_name: string;
}

export interface CreateInstantMeetingRequest {
  title?: string;
  description?: string;
}

export interface ScheduleMeetingRequest {
  title: string;
  description?: string;
  scheduled_start_at: string; // UTC ISO 8601
  duration_minutes: number;    // 1 - 1440
}

export interface MeetingResponse {
  id: string;
  meeting_id: string;
  title: string;
  description: string | null;
  status: MeetingStatus;
  meeting_type: MeetingType;
  invite_token: string;
  invite_link: string;
  passcode: string;
  host: MeetingHostInfo | null;
  scheduled_start_at: string | null;
  scheduled_end_at: string | null;
  actual_started_at: string | null;
  actual_ended_at: string | null;
  participant_count: number;
  created_at: string;
  updated_at: string;
}

export interface MeetingListItem {
  id: string;
  meeting_id: string;
  title: string;
  status: MeetingStatus;
  meeting_type: MeetingType;
  invite_link: string;
  scheduled_start_at: string | null;
  actual_started_at: string | null;
  actual_ended_at: string | null;
  participant_count: number;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Participant Domain
// ---------------------------------------------------------------------------

export interface MeetingJoinRequest {
  meeting_id: string;
  display_name: string;
  passcode?: string;
}

export interface JoinByInviteRequest {
  invite_token: string;
  display_name: string;
}

export interface JoinMeetingResponse {
  participant_id: string;
  meeting_id: string;
  display_name: string;
  role: ParticipantRole;
  is_host: boolean;
  websocket_url: string;
  meeting: MeetingResponse;
}

export interface ParticipantResponse {
  participant_id: string;
  meeting_id: string;
  display_name: string;
  role: ParticipantRole;
  is_host: boolean;
  audio_enabled: boolean;
  video_enabled: boolean;
  screen_sharing: boolean;
  hand_raised: boolean;
  muted_by_host: boolean;
  removed_from_meeting: boolean;
  is_active: boolean;
  joined_at: string;
  left_at: string | null;
}

export interface AudioStateRequest {
  enabled: boolean;
}

export interface VideoStateRequest {
  enabled: boolean;
}

export interface ScreenShareRequest {
  sharing: boolean;
}

// ---------------------------------------------------------------------------
// Chat Domain
// ---------------------------------------------------------------------------

export interface ChatMessageCreate {
  participant_id: string;
  message: string;
}

export interface ChatMessageResponse {
  id: string;
  meeting_id: string;
  participant_id: string;
  display_name: string;
  message: string;
  created_at: string;
  deleted_at: string | null;
}

// ---------------------------------------------------------------------------
// Reaction Domain
// ---------------------------------------------------------------------------

export interface ReactionCreate {
  participant_id: string;
  reaction_type: ReactionType;
}

export interface ReactionResponse {
  id: string;
  meeting_id: string;
  participant_id: string;
  display_name: string;
  reaction_type: ReactionType;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Realtime & WebRTC Signaling
// ---------------------------------------------------------------------------

export interface WSEvent<T = unknown> {
  event: WSEventType;
  meeting_id: string;
  data: T;
  timestamp: string;
}

export interface WebRTCOfferPayload {
  target_participant_id: string;
  sdp: string;
  type: "offer";
}

export interface WebRTCAnswerPayload {
  target_participant_id: string;
  sdp: string;
  type: "answer";
}

export interface WebRTCIceCandidatePayload {
  target_participant_id: string;
  candidate: Record<string, unknown>;
}
