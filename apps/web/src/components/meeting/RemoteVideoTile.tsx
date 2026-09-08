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

  // Check if stream has an active, live video track
  const hasLiveVideoTrack = Boolean(
    stream &&
    stream.getVideoTracks().some((t) => t.readyState === "live" && t.enabled)
  );

  // Dedicated audio playback ensures remote audio is never blocked by video state
  useEffect(() => {
    if (audioRef.current) {
      if (stream) {
        audioRef.current.srcObject = stream;
        audioRef.current.play().catch((err) => {
          console.warn("[RemoteVideoTile] Audio autoplay blocked:", err);
        });
      } else {
        audioRef.current.srcObject = null;
      }
    }
  }, [stream]);

  // Video element binding (muted so browser autoplay policies never block it)
  useEffect(() => {
    if (videoRef.current) {
      if (stream && (hasLiveVideoTrack || participant.video_enabled)) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => {
          console.warn("[RemoteVideoTile] Video play error:", err);
        });
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream, hasLiveVideoTrack, participant.video_enabled]);

  // Compute initials
  const initials = participant.display_name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  const showVideo = Boolean(hasLiveVideoTrack && participant.video_enabled !== false);

  return (
    <div
      className={`relative rounded-2xl bg-[#181A1F] flex flex-col items-center justify-center overflow-hidden shadow-2xl select-none transition-all ${
        isSpeaking ? "ring-2 ring-[#10B981]" : "border border-white/10"
      } ${className}`}
    >
      {/* Hidden audio element ensuring remote audio plays even if video is off */}
      <audio ref={audioRef} autoPlay playsInline />

      {/* Video Element (muted so it only renders video and avoids browser autoplay blocks) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          showVideo ? "opacity-100 block" : "opacity-0 hidden"
        }`}
      />

      {/* Avatar Fallback (when video is turned off) */}
      {!showVideo && (
        <div className="flex flex-col items-center justify-center gap-3">
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
      )}

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
