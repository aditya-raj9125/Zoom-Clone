/**
 * API client for Zoom Clone Next.js frontend connecting to FastAPI backend.
 * All participant-scoped endpoints require actor_participant_id as a query param.
 */

import type {
  UserResponse,
  MeetingResponse,
  MeetingListItem,
  ScheduleMeetingRequest,
  MeetingJoinRequest,
  JoinByInviteRequest,
  JoinMeetingResponse,
  ParticipantResponse,
  ChatMessageResponse,
  ReactionResponse,
  ReactionType,
  PaginatedResponse,
} from "@zoom-clone/contracts";

import { getToken, removeToken } from "./auth";

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

function getApiBase(): string {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:8000/api/v1`;
  }
  return "http://localhost:8000/api/v1";
}

function getWsBase(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
  if (typeof window !== "undefined") {
    const wsProto = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${wsProto}//${window.location.hostname}:8000/api/v1/ws`;
  }
  return "ws://localhost:8000/api/v1/ws";
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${getApiBase()}${path}`;
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Clear expired or invalid token
      removeToken();
    }

    let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        errorMsg = typeof errJson.detail === "string" ? errJson.detail : JSON.stringify(errJson.detail);
      } else if (errJson.error?.message) {
        errorMsg = errJson.error.message;
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Authentication endpoints
  async register(displayName: string, email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ display_name: displayName, email, password }),
    });
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async logout(): Promise<void> {
    try {
      await request<{ message: string }>("/auth/logout", { method: "POST" });
    } finally {
      removeToken();
    }
  },

  async getMe(): Promise<UserResponse> {
    return request<UserResponse>("/auth/me");
  },

  // User endpoints
  async getCurrentUser(): Promise<UserResponse> {
    return request<UserResponse>("/auth/me");
  },

  // Meeting lifecycle & scheduling
  async createInstantMeeting(title?: string, description?: string): Promise<MeetingResponse> {
    return request<MeetingResponse>("/meetings", {
      method: "POST",
      body: JSON.stringify({ title, description }),
    });
  },

  async scheduleMeeting(payload: ScheduleMeetingRequest): Promise<MeetingResponse> {
    return request<MeetingResponse>("/meetings/schedule", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getUpcomingMeetings(): Promise<MeetingListItem[]> {
    return request<MeetingListItem[]>("/meetings/upcoming");
  },

  async getRecentMeetings(page = 1, pageSize = 10): Promise<PaginatedResponse<MeetingListItem>> {
    return request<PaginatedResponse<MeetingListItem>>(`/meetings/recent?page=${page}&page_size=${pageSize}`);
  },

  async getMeetingDetails(meetingId: string): Promise<MeetingResponse> {
    return request<MeetingResponse>(`/meetings/${meetingId}`);
  },

  async startMeeting(meetingId: string, actorParticipantId: string): Promise<MeetingResponse> {
    return request<MeetingResponse>(
      `/meetings/${meetingId}/start?actor_participant_id=${encodeURIComponent(actorParticipantId)}`,
      { method: "POST" }
    );
  },

  async endMeeting(meetingId: string, actorParticipantId: string): Promise<MeetingResponse> {
    return request<MeetingResponse>(
      `/meetings/${meetingId}/end?actor_participant_id=${encodeURIComponent(actorParticipantId)}`,
      { method: "POST" }
    );
  },

  // Participant management
  async joinMeeting(payload: MeetingJoinRequest): Promise<JoinMeetingResponse> {
    return request<JoinMeetingResponse>("/meetings/join", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async joinByInvite(payload: JoinByInviteRequest): Promise<JoinMeetingResponse> {
    return request<JoinMeetingResponse>("/meetings/join-by-invite", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getParticipants(meetingId: string): Promise<ParticipantResponse[]> {
    return request<ParticipantResponse[]>(`/meetings/${meetingId}/participants`);
  },

  // actor_participant_id must match participant_id (self-leave only)
  async leaveMeeting(meetingId: string, participantId: string): Promise<ParticipantResponse> {
    return request<ParticipantResponse>(
      `/meetings/${meetingId}/participants/${participantId}/leave?actor_participant_id=${encodeURIComponent(participantId)}`,
      { method: "POST" }
    );
  },

  // actor_participant_id must equal participantId (own media only)
  async toggleAudio(meetingId: string, participantId: string, enabled: boolean): Promise<ParticipantResponse> {
    return request<ParticipantResponse>(
      `/meetings/${meetingId}/participants/${participantId}/audio?actor_participant_id=${encodeURIComponent(participantId)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ enabled }),
      }
    );
  },

  async toggleVideo(meetingId: string, participantId: string, enabled: boolean): Promise<ParticipantResponse> {
    return request<ParticipantResponse>(
      `/meetings/${meetingId}/participants/${participantId}/video?actor_participant_id=${encodeURIComponent(participantId)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ enabled }),
      }
    );
  },

  async toggleScreenShare(meetingId: string, participantId: string, sharing: boolean): Promise<ParticipantResponse> {
    return request<ParticipantResponse>(
      `/meetings/${meetingId}/participants/${participantId}/screen-share?actor_participant_id=${encodeURIComponent(participantId)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ sharing }),
      }
    );
  },

  // Host-only: actor must be the host participant ID
  async muteParticipant(meetingId: string, participantId: string, hostParticipantId: string): Promise<ParticipantResponse> {
    return request<ParticipantResponse>(
      `/meetings/${meetingId}/participants/${participantId}/mute?actor_participant_id=${encodeURIComponent(hostParticipantId)}`,
      { method: "POST" }
    );
  },

  async muteAll(meetingId: string, hostParticipantId: string): Promise<{ muted_count: number }> {
    return request<{ muted_count: number }>(
      `/meetings/${meetingId}/mute-all?actor_participant_id=${encodeURIComponent(hostParticipantId)}`,
      { method: "POST" }
    );
  },

  async removeParticipant(meetingId: string, participantId: string, hostParticipantId: string): Promise<ParticipantResponse> {
    return request<ParticipantResponse>(
      `/meetings/${meetingId}/participants/${participantId}?actor_participant_id=${encodeURIComponent(hostParticipantId)}`,
      { method: "DELETE" }
    );
  },

  // In-meeting chat
  async getChatHistory(meetingId: string): Promise<ChatMessageResponse[]> {
    return request<ChatMessageResponse[]>(`/meetings/${meetingId}/chat`);
  },

  async sendChatMessage(meetingId: string, participantId: string, message: string): Promise<ChatMessageResponse> {
    return request<ChatMessageResponse>(`/meetings/${meetingId}/chat`, {
      method: "POST",
      body: JSON.stringify({ participant_id: participantId, message }),
    });
  },

  // In-meeting reactions
  async sendReaction(meetingId: string, participantId: string, reactionType: ReactionType): Promise<ReactionResponse> {
    return request<ReactionResponse>(`/meetings/${meetingId}/reactions`, {
      method: "POST",
      body: JSON.stringify({ participant_id: participantId, reaction_type: reactionType }),
    });
  },

  // WebSocket endpoint generator
  getWebSocketUrl(meetingId: string, participantId: string): string {
    return `${getWsBase()}/meetings/${meetingId}?participant_id=${encodeURIComponent(participantId)}`;
  },
};
