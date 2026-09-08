"use client";

import React, { useEffect, useRef } from "react";
import { Mic, MicOff, VideoOff } from "lucide-react";
import type { ParticipantResponse } from "@zoom-clone/contracts";

interface RemoteVideoTileProps {
  participant: ParticipantResponse;
  stream: MediaStream | null;
  isSpeaking?: boolean;
  className?: string;
  isMainStage?: boolean;
}

export function RemoteVideoTile({
  participant,
  stream,
  isSpeaking = false,
  className = "",
  isMainStage = false,
}: RemoteVideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [trackTick, setTrackTick] = React.useState(0);

  // Re-check live status on track events (unmute, addtrack, etc.)
  useEffect(() => {
    if (!stream) return;
    const trigger = () => setTrackTick((prev) => prev + 1);
    stream.addEventListener("addtrack", trigger);
    stream.addEventListener("removetrack", trigger);
    stream.getVideoTracks().forEach((t) => {
      t.addEventListener("unmute", trigger);
      t.addEventListener("mute", trigger);
    });
    return () => {
      stream.removeEventListener("addtrack", trigger);
      stream.removeEventListener("removetrack", trigger);
      stream.getVideoTracks().forEach((t) => {
        t.removeEventListener("unmute", trigger);
        t.removeEventListener("mute", trigger);
      });
    };
  }, [stream]);

  // Check if stream has an active video track
  const videoTrack = stream?.getVideoTracks()[0];
  const hasLiveVideoTrack = Boolean(
    videoTrack && videoTrack.readyState === "live" && videoTrack.enabled
  );

  // Dedicated audio playback ensures remote audio is never blocked by video state
  useEffect(() => {
    if (audioRef.current) {
      if (stream && stream.getAudioTracks().length > 0) {
        audioRef.current.srcObject = stream;
        audioRef.current.play().catch((err) => {
          console.warn("[RemoteVideoTile] Audio autoplay blocked:", err);
        });
      } else {
        audioRef.current.srcObject = null;
      }
    }
  }, [stream, trackTick]);

  // Callback ref ensures srcObject is attached immediately on DOM mount
  const bindVideo = (node: HTMLVideoElement | null) => {
    (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = node;
    if (node) {
      if (stream && stream.getVideoTracks().length > 0) {
        if (node.srcObject !== stream) {
          node.srcObject = stream;
        }
        node.play().catch((err) => {
          console.warn("[RemoteVideoTile] Video play error:", err);
        });
      } else {
        node.srcObject = null;
      }
    }
  };

  // Video element binding effect
  useEffect(() => {
    if (videoRef.current) {
      if (stream && stream.getVideoTracks().length > 0) {
        if (videoRef.current.srcObject !== stream) {
          videoRef.current.srcObject = stream;
        }
        videoRef.current.play().catch((err) => {
          console.warn("[RemoteVideoTile] Video play error:", err);
        });
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream, hasLiveVideoTrack, participant.video_enabled, trackTick]);

  // Compute initials
  const initials = participant.display_name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  const showVideo = Boolean(
    hasLiveVideoTrack &&
    participant.video_enabled !== false &&
    stream &&
    stream.getVideoTracks().length > 0
  );

  return (
    <div
      className={`relative rounded-2xl bg-[#181A1F] flex flex-col items-center justify-center overflow-hidden shadow-2xl select-none transition-all ${
        isSpeaking ? "ring-2 ring-[#10B981]" : "border border-white/10"
      } ${className}`}
    >
      {/* Hidden audio element ensuring remote audio plays even if video is off */}
      <audio ref={audioRef} autoPlay playsInline />

      {/* Video Element - kept active in DOM with opacity transition to avoid browser decode pause */}
      <video
        ref={bindVideo}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          showVideo ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
        }`}
      />

      {/* Avatar Fallback (when video is turned off or not yet streaming) */}
      <div
        className={`relative flex flex-col items-center justify-center gap-3 z-0 transition-opacity duration-200 ${
          showVideo ? "opacity-0" : "opacity-100"
        }`}
      >
        <div
          className={`rounded-full bg-[#24272C] border border-white/15 text-white font-bold flex items-center justify-center shadow-inner ${
            isMainStage ? "w-28 h-28 text-3xl" : "w-16 h-16 text-xl"
          }`}
        >
          {initials}
        </div>
        {isMainStage && (
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            {participant.display_name}
          </h2>
        )}
      </div>

      {/* Bottom Name & Media Badges */}
      <div className="absolute bottom-2.5 left-2.5 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-[11px] font-medium text-white flex items-center gap-1.5 shadow-md z-10 border border-white/5">
        {participant.audio_enabled ? (
          <Mic className="w-3 h-3 text-emerald-400 shrink-0" />
        ) : (
          <MicOff className="w-3 h-3 text-red-500 shrink-0" />
        )}
        <span className="truncate max-w-[140px]">{participant.display_name}</span>
        {participant.is_host && (
          <span className="text-[9px] text-slate-400 font-normal">(Host)</span>
        )}
      </div>

      {/* Video off top-right indicator */}
      {!participant.video_enabled && (
        <div
          className="absolute top-2.5 right-2.5 p-1 rounded-md bg-black/50 text-slate-400 z-10"
          title="Camera is off"
        >
          <VideoOff className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
}
