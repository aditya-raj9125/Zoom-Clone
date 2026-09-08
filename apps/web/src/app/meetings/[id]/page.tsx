"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Users,
  MessageSquare,
  Smile,
  Share2,
  Shield,
  Sparkles,
  MoreHorizontal,
  X,
  PhoneOff,
  Copy,
  Check,
  LayoutGrid,
  ChevronUp,
  Send,
  UserCheck,
  UserPlus,
  Radio,
  Loader2,
  User as UserIcon,
} from "lucide-react";
import { api } from "@/lib/api";
import { WebRTCManager } from "@/lib/webrtc";
import { RemoteVideoTile } from "@/components/meeting/RemoteVideoTile";
import type {
  MeetingResponse,
  ParticipantResponse,
  ChatMessageResponse,
  ReactionType,
} from "@zoom-clone/contracts";

export default function MeetingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = (params.id as string) || "";

  // Name prompt modal state (if user enters without name)
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [inputDisplayName, setInputDisplayName] = useState("");

  // Pre-join Permission Modal State (Mockup 1)
  const [joined, setJoined] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [isJoining, setIsJoining] = useState(true);

  // Audio / Video states
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);

  // Meeting & Participant metadata
  const [meetingData, setMeetingData] = useState<MeetingResponse | null>(null);
  const [myParticipantId, setMyParticipantId] = useState<string>("");
  const [myDisplayName, setMyDisplayName] = useState<string>("");
  const [isHost, setIsHost] = useState(false);

  // Dynamic Active Participants List
  const [participants, setParticipants] = useState<ParticipantResponse[]>([]);

  // View mode: "speaker" (Mockup 4) or "gallery" (Mockup 6)
  const [viewMode, setViewMode] = useState<"speaker" | "gallery">("speaker");

  // Sidebars & Popovers
  const [showInfoPopover, setShowInfoPopover] = useState(false);
  const [showParticipantsPanel, setShowParticipantsPanel] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  // Chat messages
  const [chatMessages, setChatMessages] = useState<ChatMessageResponse[]>([]);
  const [newChatText, setNewChatText] = useState("");

  // Floating active reaction emojis
  const [activeReactions, setActiveReactions] = useState<{ id: string; emoji: string; x: number }[]>([]);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Keep remote streams in React state so a newly attached track is rendered
  // immediately instead of reading mutable WebRTC state during render.
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const reactionSequenceRef = useRef(0);

  // Video element refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const webrtcRef = useRef<WebRTCManager | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Callback ref to immediately bind local stream whenever <video> mounts
  const bindLocalVideo = (node: HTMLVideoElement | null) => {
    (localVideoRef as React.MutableRefObject<HTMLVideoElement | null>).current = node;
    if (node && webrtcRef.current) {
      const stream = webrtcRef.current.getLocalStream();
      if (stream) {
        node.srcObject = stream;
        node.play().catch(() => {});
      }
    }
  };

  // Re-attach local stream whenever videoEnabled or joined changes.
  useEffect(() => {
    if (localVideoRef.current && webrtcRef.current) {
      const stream = webrtcRef.current.getLocalStream();
      if (stream && videoEnabled) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(() => {});
      } else if (!videoEnabled) {
        localVideoRef.current.srcObject = null;
      }
    }
  }, [videoEnabled, joined]);

  // Helper toast trigger
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 4000);
  };

  // 1. Initial Setup: Resolve User & Meeting Metadata
  useEffect(() => {
    if (!meetingId) return;

    let isMounted = true;

    async function initializeSession() {
      try {
        // Fetch meeting details
        const meeting = await api.getMeetingDetails(meetingId);
        if (!isMounted) return;
        setMeetingData(meeting);

        // Check if there's a cached session from join-by-invite
        const cachedSessionRaw = sessionStorage.getItem(`zoom_session_${meetingId}`);
        let candidateName = "";

        if (cachedSessionRaw) {
          try {
            const parsed = JSON.parse(cachedSessionRaw);
            if (parsed.display_name) {
              candidateName = parsed.display_name;
            }
          } catch {
            // ignore
          }
        }

        if (!candidateName) {
          const stored = sessionStorage.getItem("zoom_join_name");
          if (stored) {
            candidateName = stored;
          }
        }

        if (!candidateName) {
          try {
            const currentUser = await api.getCurrentUser();
            if (currentUser?.display_name) {
              candidateName = currentUser.display_name;
            }
          } catch {
            // not logged in
          }
        }

        if (!candidateName) {
          setIsJoining(false);
          setShowNamePrompt(true);
          return;
        }

        setMyDisplayName(candidateName);
        setIsJoining(false);
        setShowPermissionPrompt(true);
      } catch (err: unknown) {
        console.error("Failed to load meeting details:", err);
        setIsJoining(false);
        showToast("Error connecting to meeting: " + (err instanceof Error ? err.message : "Not found"));
      }
    }

    initializeSession();

    return () => {
      isMounted = false;
    };
  }, [meetingId]);

  // 2. Connect to Meeting Room after Name & Media Selection
  const startRoomConnection = async (selectedAudio: boolean, selectedVideo: boolean, nameToUse?: string) => {
    const finalName = (nameToUse || myDisplayName).trim() || "Guest";
    setMyDisplayName(finalName);
    sessionStorage.setItem("zoom_join_name", finalName);

    try {
      // 1. Ensure meeting details and passcode are loaded
      let currentMeeting = meetingData;
      if (!currentMeeting || !currentMeeting.passcode) {
        try {
          currentMeeting = await api.getMeetingDetails(meetingId);
          setMeetingData(currentMeeting);
        } catch {
          // fallback
        }
      }

      // Call Join Endpoint to get participant_id and WebSocket URL
      const joinRes = await api.joinMeeting({
        meeting_id: meetingId,
        display_name: finalName,
        passcode: currentMeeting?.passcode,
      });

      setMyParticipantId(joinRes.participant_id);
      setIsHost(joinRes.is_host);

      if (joinRes.is_host) {
        showToast("You are host now.");
      }

      // 2. Fetch existing participants and filter out stale duplicate sessions of self
      const activeList = await api.getParticipants(meetingId);
      const cleanedList = activeList.filter(
        (p) =>
          p.participant_id === joinRes.participant_id ||
          p.display_name.trim().toLowerCase() !== finalName.toLowerCase()
      );
      setParticipants(cleanedList);

      // 3. Fetch chat history
      try {
        const history = await api.getChatHistory(meetingId);
        setChatMessages(history);
      } catch {
        // chat history optional
      }

      // 4. Initialize WebRTC Manager
      const rtc = new WebRTCManager(
        (event, data) => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: event, ...(data as object) }));
          }
        },
        (participantId, track, stream) => {
          console.log("Remote track from:", participantId, track.kind);
          setRemoteStreams((prev) => ({ ...prev, [participantId]: stream }));
        },
        (participantId) => {
          console.log("Participant left call:", participantId);
          setRemoteStreams((prev) => {
            const next = { ...prev };
            delete next[participantId];
            return next;
          });
        }
      );
      webrtcRef.current = rtc;

      // Acquire local media
      const localStream = await rtc.acquireLocalStream(selectedAudio, selectedVideo);
      if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream;
      }
      setAudioEnabled(selectedAudio);
      setVideoEnabled(selectedVideo);

      // The join endpoint defaults media state to enabled. Publish the actual
      // pre-join choices so connected peers render the same state immediately.
      await Promise.all([
        api.toggleAudio(meetingId, joinRes.participant_id, selectedAudio),
        api.toggleVideo(meetingId, joinRes.participant_id, selectedVideo),
      ]).catch((err) => {
        console.warn("Failed to publish initial media state:", err);
      });

      // 5. Connect WebSocket
      const wsUrl = api.getWebSocketUrl(meetingId, joinRes.participant_id);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connection established to", wsUrl);

        // Exactly one side initiates each pair. This prevents simultaneous
        // offers when both peers connect at nearly the same time.
        cleanedList.forEach((p) => {
          if (
            p.participant_id !== joinRes.participant_id &&
            joinRes.participant_id.localeCompare(p.participant_id) < 0 &&
            !rtc.hasPeer(p.participant_id)
          ) {
            console.log("Initiating WebRTC call to existing peer:", p.participant_id);
            rtc.callParticipant(p.participant_id).catch((err) => {
              console.warn("Call to existing participant failed:", err);
            });
          }
        });
      };

      ws.onmessage = async (e) => {
        try {
          const data = JSON.parse(e.data);
          const type = data.type;
          const payload = data.payload || {};

          if (type === "participant.joined") {
            const newPid = payload.participant_id;
            const newName = payload.display_name;

            // Don't add duplicate or self
            if (newPid !== joinRes.participant_id) {
              setParticipants((prev) => {
                // Filter out any stale duplicate with the same ID or name
                const filtered = prev.filter(
                  (p) =>
                    p.participant_id !== newPid &&
                    p.display_name.trim().toLowerCase() !== newName.trim().toLowerCase()
                );
                return [
                  ...filtered,
                  {
                    participant_id: newPid,
                    meeting_id: meetingId,
                    display_name: newName,
                    role: payload.role || "participant",
                    is_host: Boolean(payload.is_host),
                    audio_enabled: Boolean(payload.audio_enabled),
                    video_enabled: Boolean(payload.video_enabled),
                    screen_sharing: false,
                    hand_raised: false,
                    muted_by_host: false,
                    removed_from_meeting: false,
                    is_active: true,
                    joined_at: new Date().toISOString(),
                    left_at: null,
                  },
                ];
              });

              showToast(`${newName} joined the meeting`);

              // The server emits participant.joined after the new peer's
              // WebSocket is registered. Use a deterministic initiator.
              if (joinRes.participant_id.localeCompare(newPid) < 0) {
                rtc.callParticipant(newPid).catch((err) => {
                  console.warn("Error calling new participant:", err);
                });
              }
            }
          } else if (
            type === "webrtc.offer" ||
            type === "webrtc.answer" ||
            type === "webrtc.ice_candidate"
          ) {
            await rtc.handleSignalingEvent(type, payload);
          } else if (type === "participant.left" || type === "participant.removed") {
            const leftPid = payload.participant_id;
            setParticipants((prev) => prev.filter((p) => p.participant_id !== leftPid));
            rtc.removeParticipant(leftPid);
            showToast(`${payload.display_name || "A participant"} left the meeting`);
          } else if (type === "participant.audio_changed") {
            setParticipants((prev) =>
              prev.map((p) =>
                p.participant_id === payload.participant_id
                  ? { ...p, audio_enabled: payload.audio_enabled }
                  : p
              )
            );
          } else if (type === "participant.video_changed") {
            setParticipants((prev) =>
              prev.map((p) =>
                p.participant_id === payload.participant_id
                  ? { ...p, video_enabled: payload.video_enabled }
                  : p
              )
            );
          } else if (type === "chat.message_created") {
            setChatMessages((prev) => [...prev, payload]);
            setTimeout(() => {
              chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          } else if (type === "reaction.created") {
            const emojiMap: Record<string, string> = {
              thumbs_up: "👍",
              clap: "👏",
              heart: "❤️",
              laugh: "😂",
              surprised: "😮",
              celebrate: "🎉",
            };
            const emoji = emojiMap[payload.reaction_type] || "👍";
            const id = Math.random().toString();
            setActiveReactions((prev) => [
              ...prev,
              { id, emoji, x: 20 + Math.random() * 60 },
            ]);
            setTimeout(() => {
              setActiveReactions((prev) => prev.filter((r) => r.id !== id));
            }, 2500);
          }
        } catch (parseErr) {
          console.error("Error processing websocket message:", parseErr);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
      };

      setJoined(true);
      setShowPermissionPrompt(false);
      setShowNamePrompt(false);
    } catch (err: unknown) {
      console.error("Join room failure:", err);
      alert("Failed to join meeting: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  // Toggle Audio
  const handleToggleAudio = async () => {
    const next = !audioEnabled;
    if (next) {
      if (webrtcRef.current) {
        const stream = webrtcRef.current.getLocalStream();
        const hasLiveAudio = stream?.getAudioTracks().some((t) => t.readyState === "live");
        if (!hasLiveAudio) {
          await webrtcRef.current.acquireLocalStream(true, videoEnabled);
        } else {
          webrtcRef.current.setAudioEnabled(true);
        }
      }
      setAudioEnabled(true);
      if (myParticipantId) {
        api.toggleAudio(meetingId, myParticipantId, true).catch(() => {});
      }
    } else {
      webrtcRef.current?.setAudioEnabled(false);
      setAudioEnabled(false);
      if (myParticipantId) {
        api.toggleAudio(meetingId, myParticipantId, false).catch(() => {});
      }
    }
  };

  // Toggle Video
  const handleToggleVideo = async () => {
    const next = !videoEnabled;
    if (next) {
      if (webrtcRef.current) {
        const stream = webrtcRef.current.getLocalStream();
        const hasLiveVideo = stream?.getVideoTracks().some((t) => t.readyState === "live");
        if (!hasLiveVideo) {
          await webrtcRef.current.acquireLocalStream(audioEnabled, true);
        } else {
          webrtcRef.current.setVideoEnabled(true);
        }
      }
      setVideoEnabled(true);
      if (myParticipantId) {
        api.toggleVideo(meetingId, myParticipantId, true).catch(() => {});
      }
    } else {
      webrtcRef.current?.setVideoEnabled(false);
      setVideoEnabled(false);
      if (myParticipantId) {
        api.toggleVideo(meetingId, myParticipantId, false).catch(() => {});
      }
    }
  };

  // Toggle Screen Share
  const handleToggleScreenShare = async () => {
    if (!screenSharing) {
      const screenStream = await webrtcRef.current?.startScreenShare();
      if (screenStream) {
        setScreenSharing(true);
        if (myParticipantId) {
          api.toggleScreenShare(meetingId, myParticipantId, true).catch(() => {});
        }
      }
    } else {
      webrtcRef.current?.stopScreenShare();
      setScreenSharing(false);
      if (myParticipantId) {
        api.toggleScreenShare(meetingId, myParticipantId, false).catch(() => {});
      }
    }
  };

  // Send Reaction
  const handleSendReaction = async (emoji: string, rxnType: ReactionType) => {
    const sequence = ++reactionSequenceRef.current;
    const id = `reaction-${sequence}`;
    setActiveReactions((prev) => [
      ...prev,
      { id, emoji, x: 20 + ((sequence * 37) % 60) },
    ]);
    setTimeout(() => {
      setActiveReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2500);

    setShowReactionPicker(false);

    if (myParticipantId) {
      try {
        await api.sendReaction(meetingId, myParticipantId, rxnType);
      } catch (err) {
        console.warn("Failed to send reaction:", err);
      }
    }
  };

  // Send Chat Message
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim() || !myParticipantId) return;

    const messageToSend = newChatText.trim();
    setNewChatText("");

    try {
      await api.sendChatMessage(meetingId, myParticipantId, messageToSend);
    } catch (err) {
      console.error("Failed to send chat message:", err);
    }
  };

  // Copy Shareable Invite Link
  const handleCopyInviteLink = () => {
    const link = meetingData?.invite_link || `${window.location.origin}/meetings/${meetingId}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    showToast("Meeting invite link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Leave / End Meeting
  const handleEndMeeting = async () => {
    if (myParticipantId) {
      try {
        if (isHost) {
          // Host ends the meeting for everyone
          await api.endMeeting(meetingId, myParticipantId);
        } else {
          // Participant leaves only themselves
          await api.leaveMeeting(meetingId, myParticipantId);
        }
      } catch {
        // quiet — still navigate away
      }
    }
    webrtcRef.current?.destroy();
    wsRef.current?.close();
    router.push("/dashboard");
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      webrtcRef.current?.destroy();
      wsRef.current?.close();
    };
  }, []);

  // Deduplicate participants for sidebar & counters
  const uniqueParticipants = useMemo(() => {
    const map = new Map<string, ParticipantResponse>();
    const myNameNorm = myDisplayName.trim().toLowerCase();

    for (const p of participants) {
      if (
        p.participant_id !== myParticipantId &&
        myNameNorm &&
        p.display_name.trim().toLowerCase() === myNameNorm
      ) {
        // Stale ghost session of myself before page refresh
        continue;
      }
      if (p.participant_id !== myParticipantId && isHost && p.is_host) {
        // Stale host session of current host
        continue;
      }
      if (p.participant_id !== myParticipantId && p.display_name.trim().toLowerCase() === "demo user") {
        // Stale ghost demo user session
        continue;
      }
      map.set(p.participant_id, p);
    }
    return Array.from(map.values());
  }, [participants, myParticipantId, myDisplayName, isHost]);

  // Filter out self and duplicate stale sessions for remote participants
  const remoteParticipants = useMemo(() => {
    const seen = new Set<string>();
    const result: ParticipantResponse[] = [];
    const myNameNorm = myDisplayName.trim().toLowerCase();

    for (const p of participants) {
      if (p.participant_id === myParticipantId) continue;
      if (myNameNorm && p.display_name.trim().toLowerCase() === myNameNorm) {
        continue;
      }
      if (isHost && p.is_host) {
        continue;
      }
      if (p.display_name.trim().toLowerCase() === "demo user") {
        continue;
      }
      if (!seen.has(p.participant_id)) {
        seen.add(p.participant_id);
        result.push(p);
      }
    }
    return result;
  }, [participants, myParticipantId, myDisplayName, isHost]);

  // Active remote speaker for speaker view
  const activeRemoteSpeaker = remoteParticipants[0] || null;

  return (
    <div className="relative h-screen w-screen bg-[#0E0F12] text-white flex flex-col overflow-hidden font-sans select-none">
      {/* 1. TOP HEADER BAR */}
      <header className="h-10 px-4 bg-[#0E0F12] flex items-center justify-between z-30 shrink-0 border-b border-white/5">
        {/* Top-left: Meeting Title with (i) Info Icon */}
        <div className="relative flex items-center">
          <button
            onClick={() => setShowInfoPopover(!showInfoPopover)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/10 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <div className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-serif">
              i
            </div>
            <span>{meetingData?.title || "Zoom Meeting"}</span>
          </button>

          {/* Meeting Info Popover (Mockup 4) */}
          {showInfoPopover && (
            <div
              className="absolute left-0 top-full mt-2 w-84 rounded-xl bg-[#24272C] text-slate-200 p-4 shadow-2xl ring-1 ring-white/10 z-50 animate-in fade-in zoom-in-95 text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-sm text-white mb-3">
                {meetingData?.title || "Zoom Meeting"}
              </h3>

              <div className="space-y-2.5 text-[11px]">
                {/* Invite link with copy button */}
                <div>
                  <div className="text-slate-400 mb-1">Invite Link</div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/10">
                    <span className="truncate text-[#38BDF8] pr-2 font-mono text-[10px]">
                      {meetingData?.invite_link || `${typeof window !== "undefined" ? window.location.origin : ""}/meetings/${meetingId}`}
                    </span>
                    <button
                      onClick={handleCopyInviteLink}
                      className="p-1 rounded hover:bg-white/10 text-slate-300 transition-colors"
                      title="Copy Link"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between py-0.5 border-b border-white/5">
                  <span className="text-slate-400">Meeting ID</span>
                  <span className="font-mono text-white font-semibold tracking-wider">
                    {meetingData?.meeting_id || meetingId}
                  </span>
                </div>

                <div className="flex justify-between py-0.5 border-b border-white/5">
                  <span className="text-slate-400">Host</span>
                  <span className="text-white">
                    {meetingData?.host?.display_name || myDisplayName || "Host"}
                  </span>
                </div>

                <div className="flex justify-between py-0.5 border-b border-white/5">
                  <span className="text-slate-400">Passcode</span>
                  <span className="font-mono text-white font-semibold">{meetingData?.passcode || "—"}</span>
                </div>

                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Participants Online</span>
                  <span className="font-mono text-emerald-400 font-semibold">{uniqueParticipants.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center Toast Banner */}
        {toastMessage && (
          <div className="absolute left-1/2 -translate-x-1/2 top-2 px-4 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-[11px] text-slate-100 border border-white/15 shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 z-50">
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Top-right: Green Encryption Shield, View Switcher & Avatar */}
        <div className="flex items-center gap-2">
          {/* Encryption shield */}
          <div className="p-1 text-emerald-400" title="End-to-End Encrypted Session">
            <Shield className="w-4 h-4 fill-emerald-500/20" />
          </div>

          {/* View Toggle (Speaker vs Gallery) */}
          <button
            onClick={() => setViewMode(viewMode === "speaker" ? "gallery" : "speaker")}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-white/10 text-xs text-slate-200 transition-colors cursor-pointer border border-white/10"
            title={viewMode === "speaker" ? "Switch to Gallery View" : "Switch to Speaker View"}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium hidden sm:inline">
              {viewMode === "speaker" ? "Gallery" : "Speaker"}
            </span>
          </button>

          {/* Zoom Avatar Badge */}
          <div className="w-6 h-6 rounded-full bg-[#0B5CFF] text-white text-[10px] font-bold flex items-center justify-center border border-white/20">
            {myDisplayName ? myDisplayName.slice(0, 2).toUpperCase() : "ZM"}
          </div>
        </div>
      </header>

      {/* 2. MAIN MEETING VIEWPORT AREA */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Main Video Tile Canvas */}
        <div className="relative flex-1 flex items-center justify-center p-3 overflow-hidden">
          {/* A. NAME PROMPT MODAL (if unauthenticated guest joins directly) */}
          {showNamePrompt && (
            <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-sm rounded-2xl bg-[#1E2024] p-6 text-center shadow-2xl border border-white/15 animate-in fade-in zoom-in-95">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-[#38BDF8] flex items-center justify-center mx-auto mb-3">
                  <UserIcon className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold text-white">Enter your name</h2>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Please provide your name to join {meetingData?.title || "the meeting"}
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (inputDisplayName.trim()) {
                      setShowNamePrompt(false);
                      setShowPermissionPrompt(true);
                    }
                  }}
                  className="space-y-3"
                >
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Your Name (e.g. Jane Doe)"
                    value={inputDisplayName}
                    onChange={(e) => setInputDisplayName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-black/50 border border-white/15 text-white placeholder:text-slate-500 text-xs outline-none focus:border-[#0B5CFF]"
                  />
                  <button
                    type="submit"
                    disabled={!inputDisplayName.trim()}
                    className="w-full h-10 rounded-xl bg-[#0B5CFF] hover:bg-[#004BDE] disabled:opacity-50 text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    Continue
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* B. PERMISSION PROMPT MODAL (Mockup 1) */}
          {showPermissionPrompt && (
            <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="w-full max-w-md rounded-2xl bg-[#1E2024] p-7 text-center shadow-2xl border border-white/10 animate-in fade-in zoom-in-95">
                <div className="w-36 h-28 mx-auto mb-4 relative rounded-xl bg-blue-500/10 border border-blue-400/20 flex flex-col items-center justify-center p-2">
                  <div className="w-16 h-10 rounded bg-[#0B5CFF] flex items-center justify-center text-white shadow-md mb-2">
                    <Video className="w-5 h-5" />
                  </div>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                    <div className="w-3 h-3 rounded-full bg-blue-400/80" />
                    <div className="w-3 h-3 rounded-full bg-purple-400/80" />
                  </div>
                </div>

                <h2 className="text-base font-bold text-white tracking-tight">
                  Do you want people to see you in the meeting?
                </h2>
                <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                  You can still turn off your microphone and camera anytime in the meeting
                </p>

                <div className="mt-6 space-y-2.5">
                  <button
                    onClick={() => startRoomConnection(true, true, inputDisplayName || myDisplayName)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0B5CFF] hover:bg-[#004BDE] text-white text-xs font-semibold shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Use microphone and camera</span>
                  </button>
                  <button
                    onClick={() => startRoomConnection(false, false, inputDisplayName || myDisplayName)}
                    className="w-full py-2 px-4 rounded-xl hover:bg-white/5 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Continue without microphone and camera
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* C. DYNAMIC MEETING VIEWS */}
          {joined && (
            <>
              {/* C1: WHEN ALONE IN MEETING (participants <= 1) */}
              {remoteParticipants.length === 0 ? (
                <div className="relative w-full h-full max-w-4xl flex flex-col items-center justify-center">
                  {/* Local video or avatar large card */}
                  <div className="relative w-full aspect-[16/9] max-h-[560px] rounded-2xl bg-[#181A1F] border border-white/10 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
                    {videoEnabled ? (
                      <video
                        ref={bindLocalVideo}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-24 h-24 rounded-full bg-slate-700 text-white flex items-center justify-center text-3xl font-bold border-2 border-white/20 shadow-inner">
                          {myDisplayName ? myDisplayName.slice(0, 2).toUpperCase() : "ME"}
                        </div>
                        <span className="text-xl font-semibold text-slate-200">
                          {myDisplayName} {isHost && "(Host, You)"}
                        </span>
                      </div>
                    )}

                    {/* Local bottom-left name badge */}
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-black/60 backdrop-blur-sm text-[11px] font-medium text-white flex items-center gap-1.5 border border-white/10">
                      {audioEnabled ? (
                        <Mic className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <MicOff className="w-3 h-3 text-red-500" />
                      )}
                      <span>{myDisplayName || "You"} (You)</span>
                    </div>

                    {/* Waiting for others invite banner overlay */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-11/12 max-w-md p-4 rounded-2xl bg-black/80 backdrop-blur-md border border-white/15 text-center shadow-2xl animate-in fade-in slide-in-from-top-4">
                      <div className="flex items-center justify-center gap-2 text-emerald-400 mb-1">
                        <Radio className="w-4 h-4 animate-pulse" />
                        <span className="text-xs font-semibold uppercase tracking-wider">
                          Meeting is Live
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white mb-1">
                        Waiting for others to join...
                      </h3>
                      <p className="text-[11px] text-slate-400 mb-3">
                        Invite participants to this meeting by sharing the link below:
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopyInviteLink}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#0B5CFF] hover:bg-[#004BDE] active:scale-98 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          {copiedLink ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-300" />
                              <span>Invite Link Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy Invite Link</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-around text-[10px] text-slate-400">
                        <span>Meeting ID: <strong className="text-slate-200">{meetingData?.meeting_id || meetingId}</strong></span>
                        <span>Passcode: <strong className="text-slate-200">{meetingData?.passcode || "—"}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : viewMode === "speaker" ? (
                /* C2: SPEAKER VIEW (2+ participants) */
                <div className="relative w-full h-full max-w-5xl flex flex-col items-center justify-center">
                  {/* Remote Active Speaker Stage */}
                  {activeRemoteSpeaker && (
                    <RemoteVideoTile
                      participant={activeRemoteSpeaker}
                      stream={remoteStreams[activeRemoteSpeaker.participant_id] || null}
                      isSpeaking={true}
                      isMainStage={true}
                      className="w-full h-full max-h-[600px] aspect-[16/9]"
                    />
                  )}

                  {/* Local Floating Picture-in-Picture (PiP) */}
                  <div className="absolute top-4 right-4 w-44 h-28 rounded-xl bg-[#24272C] border border-white/20 overflow-hidden shadow-2xl z-20 flex flex-col items-center justify-center">
                    {videoEnabled ? (
                      <video
                        ref={bindLocalVideo}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-700 text-white flex items-center justify-center text-sm font-bold shadow-inner">
                        {myDisplayName ? myDisplayName.slice(0, 2).toUpperCase() : "ME"}
                      </div>
                    )}

                    <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/70 text-[10px] text-white flex items-center gap-1 border border-white/5">
                      {audioEnabled ? (
                        <Mic className="w-2.5 h-2.5 text-emerald-400" />
                      ) : (
                        <MicOff className="w-2.5 h-2.5 text-red-500" />
                      )}
                      <span className="truncate max-w-[80px]">{myDisplayName || "You"} (You)</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* C3: GALLERY VIEW (2+ participants) */
                <div className="w-full h-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 gap-4 items-center justify-center">
                  {/* Local Participant Tile */}
                  <div className="relative w-full aspect-[16/10] rounded-2xl bg-[#181A1F] border border-white/15 flex flex-col items-center justify-center shadow-2xl overflow-hidden">
                    {videoEnabled ? (
                      <video
                        ref={bindLocalVideo}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-slate-700 text-white flex items-center justify-center text-xl font-bold">
                        {myDisplayName ? myDisplayName.slice(0, 2).toUpperCase() : "ME"}
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-black/60 text-[11px] font-medium text-white flex items-center gap-1.5 border border-white/10">
                      {audioEnabled ? (
                        <Mic className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <MicOff className="w-3 h-3 text-red-500" />
                      )}
                      <span>{myDisplayName || "You"} (You)</span>
                    </div>
                  </div>

                  {/* Remote Participant Tiles */}
                  {remoteParticipants.map((p) => (
                    <RemoteVideoTile
                      key={p.participant_id}
                      participant={p}
                      stream={remoteStreams[p.participant_id] || null}
                      isSpeaking={p.participant_id === activeRemoteSpeaker?.participant_id}
                      className="w-full aspect-[16/10]"
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Floating Emoji Reactions Stream */}
          {activeReactions.map((r) => (
            <div
              key={r.id}
              style={{ left: `${r.x}%` }}
              className="absolute bottom-16 text-4xl animate-in fade-in slide-in-from-bottom-6 duration-1000 pointer-events-none z-40"
            >
              {r.emoji}
            </div>
          ))}
        </div>

        {/* 3. RIGHT PARTICIPANTS SIDEBAR PANEL */}
        {showParticipantsPanel && (
          <aside className="w-80 bg-[#1E2024] border-l border-white/10 flex flex-col shrink-0 z-30 animate-in slide-in-from-right duration-200 text-xs">
            <div className="h-11 px-4 border-b border-white/10 flex items-center justify-between font-bold text-slate-200">
              <span>Participants ({uniqueParticipants.length})</span>
              <button
                onClick={() => setShowParticipantsPanel(false)}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Participants list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {uniqueParticipants.map((p) => {
                const isMe = p.participant_id === myParticipantId;
                const micActive = isMe ? audioEnabled : p.audio_enabled;
                const camActive = isMe ? videoEnabled : p.video_enabled;

                return (
                  <div
                    key={p.participant_id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                        {p.display_name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="truncate text-slate-200 font-medium">
                        {p.display_name} {isMe && "(Me)"} {p.is_host && "(Host)"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-slate-400">
                      {micActive ? (
                        <Mic className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <MicOff className="w-3.5 h-3.5 text-red-500" />
                      )}

                      {camActive ? (
                        <Video className="w-3.5 h-3.5 text-slate-300" />
                      ) : (
                        <VideoOff className="w-3.5 h-3.5 text-red-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-white/10 flex items-center gap-2">
              <button
                onClick={handleCopyInviteLink}
                className="flex-1 py-1.5 rounded-lg bg-[#0B5CFF] hover:bg-[#004BDE] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite</span>
              </button>
              {isHost && (
                <button
                  onClick={async () => {
                    try {
                      await api.muteAll(meetingId, myParticipantId);
                      showToast("All participants muted by host");
                    } catch {
                      // quiet
                    }
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                >
                  Mute All
                </button>
              )}
            </div>
          </aside>
        )}

        {/* 4. IN-MEETING CHAT PANEL */}
        {showChatPanel && (
          <aside className="w-80 bg-[#1E2024] border-l border-white/10 flex flex-col shrink-0 z-30 animate-in slide-in-from-right duration-200 text-xs">
            <div className="h-11 px-4 border-b border-white/10 flex items-center justify-between font-bold text-slate-200">
              <span>Meeting Chat</span>
              <button
                onClick={() => setShowChatPanel(false)}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No messages yet. Send a message to everyone!
                </div>
              ) : (
                chatMessages.map((m) => {
                  const isMine = m.participant_id === myParticipantId;
                  return (
                    <div key={m.id} className={`space-y-1 ${isMine ? "text-right" : "text-left"}`}>
                      <div className="flex items-baseline justify-between text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-300">
                          {m.display_name} {isMine && "(You)"}
                        </span>
                        <span>
                          {new Date(m.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div
                        className={`inline-block p-2.5 rounded-xl text-left leading-snug max-w-[90%] break-words ${
                          isMine ? "bg-[#0B5CFF] text-white" : "bg-white/10 text-slate-100"
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type message here..."
                value={newChatText}
                onChange={(e) => setNewChatText(e.target.value)}
                className="flex-1 h-8 px-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-500 outline-none focus:border-[#0B5CFF] text-xs"
              />
              <button
                type="submit"
                disabled={!newChatText.trim()}
                className="p-2 rounded-lg bg-[#0B5CFF] hover:bg-[#004BDE] disabled:opacity-40 text-white transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </aside>
        )}
      </div>

      {/* 5. BOTTOM MEETING CONTROL BAR */}
      <footer className="h-16 px-4 bg-[#0E0F12] border-t border-white/10 flex items-center justify-between shrink-0 z-40">
        {/* Left: Audio & Video controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio toggle button */}
          <div className="flex items-center">
            <button
              onClick={handleToggleAudio}
              className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer ${
                !audioEnabled ? "text-red-500" : "text-white"
              }`}
            >
              {!audioEnabled ? (
                <MicOff className="w-5 h-5 mb-0.5 text-red-500" />
              ) : (
                <Mic className="w-5 h-5 mb-0.5 text-emerald-400" />
              )}
              <span className="text-[10px] font-medium leading-none">
                {!audioEnabled ? "Audio" : "Mute"}
              </span>
            </button>
            <button
              onClick={() => showToast("Microphone: Default System Audio")}
              className="p-1 text-slate-400 hover:text-white"
            >
              <ChevronUp className="w-3 h-3" />
            </button>
          </div>

          {/* Video toggle button */}
          <div className="flex items-center">
            <button
              onClick={handleToggleVideo}
              className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer ${
                !videoEnabled ? "text-red-500" : "text-white"
              }`}
            >
              {!videoEnabled ? (
                <VideoOff className="w-5 h-5 mb-0.5 text-red-500" />
              ) : (
                <Video className="w-5 h-5 mb-0.5 text-emerald-400" />
              )}
              <span className="text-[10px] font-medium leading-none">
                {!videoEnabled ? "Start Video" : "Stop Video"}
              </span>
            </button>
            <button
              onClick={() => showToast("Camera: Default System Webcam")}
              className="p-1 text-slate-400 hover:text-white"
            >
              <ChevronUp className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Center: In-meeting interactive tools */}
        <div className="flex items-center gap-1 sm:gap-3">
          {/* Participants button */}
          <button
            onClick={() => {
              setShowParticipantsPanel(!showParticipantsPanel);
              setShowChatPanel(false);
            }}
            className={`flex flex-col items-center justify-center px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer ${
              showParticipantsPanel ? "bg-white/15 text-[#38BDF8]" : "text-slate-200"
            }`}
          >
            <div className="relative">
              <Users className="w-5 h-5 mb-0.5" />
              <span className="absolute -top-1 -right-2 text-[9px] font-bold bg-[#0B5CFF] text-white px-1 rounded-full">
                {uniqueParticipants.length}
              </span>
            </div>
            <span className="text-[10px] font-medium leading-none">Participants</span>
          </button>

          {/* Chat button */}
          <button
            onClick={() => {
              setShowChatPanel(!showChatPanel);
              setShowParticipantsPanel(false);
            }}
            className={`flex flex-col items-center justify-center px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer ${
              showChatPanel ? "bg-white/15 text-[#38BDF8]" : "text-slate-200"
            }`}
          >
            <MessageSquare className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium leading-none">Chat</span>
          </button>

          {/* Reactions button */}
          <div className="relative">
            <button
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              className="flex flex-col items-center justify-center px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-slate-200 transition-colors cursor-pointer"
            >
              <Smile className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium leading-none">React</span>
            </button>

            {/* Reaction picker popover */}
            {showReactionPicker && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 rounded-2xl bg-[#1E2024] border border-white/15 shadow-2xl flex items-center gap-2 z-50 animate-in fade-in zoom-in-95">
                {[
                  { emoji: "👍", type: "thumbs_up" as ReactionType },
                  { emoji: "👏", type: "clap" as ReactionType },
                  { emoji: "❤️", type: "heart" as ReactionType },
                  { emoji: "😂", type: "laugh" as ReactionType },
                  { emoji: "😮", type: "surprised" as ReactionType },
                  { emoji: "🎉", type: "celebrate" as ReactionType },
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => handleSendReaction(item.emoji, item.type)}
                    className="p-1.5 text-2xl hover:scale-125 transition-transform cursor-pointer"
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Share Screen */}
          <button
            onClick={handleToggleScreenShare}
            className={`flex flex-col items-center justify-center px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer ${
              screenSharing ? "text-amber-400" : "text-[#10B981]"
            }`}
          >
            <Share2 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium leading-none text-slate-200">
              {screenSharing ? "Stop Share" : "Share"}
            </span>
          </button>

          {/* Invite Button directly in bottom bar */}
          <button
            onClick={handleCopyInviteLink}
            className="flex flex-col items-center justify-center px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-slate-200 transition-colors cursor-pointer"
          >
            <UserPlus className="w-5 h-5 mb-0.5 text-[#38BDF8]" />
            <span className="text-[10px] font-medium leading-none">Invite</span>
          </button>

          {/* Host Tools */}
          {isHost && (
            <button
              onClick={() => showToast("Host controls: Security lock & Waiting room enabled")}
              className="hidden sm:flex flex-col items-center justify-center px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-slate-200 transition-colors cursor-pointer"
            >
              <Shield className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium leading-none">Host tools</span>
            </button>
          )}

          {/* Zoom AI Companion */}
          <button
            onClick={() => showToast("Zoom AI Companion: Meeting summary is active")}
            className="hidden sm:flex flex-col items-center justify-center px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-purple-400 transition-colors cursor-pointer"
          >
            <Sparkles className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium leading-none text-slate-200">Zoom AI</span>
          </button>
        </div>

        {/* Right: End / Leave Meeting Button (Red) */}
        <div>
          <button
            onClick={handleEndMeeting}
            className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-semibold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>{isHost ? "End" : "Leave"}</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
