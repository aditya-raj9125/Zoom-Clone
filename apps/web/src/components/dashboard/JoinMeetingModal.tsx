"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { api } from "@/lib/api";

interface JoinMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinMeetingModal({ isOpen, onClose }: JoinMeetingModalProps) {
  const router = useRouter();
  const [meetingId, setMeetingId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [recentMeetingIds, setRecentMeetingIds] = useState<string[]>([]);
  const [showRecentDropdown, setShowRecentDropdown] = useState(false);
  const [noAudio, setNoAudio] = useState(false);
  const [noVideo, setNoVideo] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    // Pre-fill display name from stored session or API
    const storedName = sessionStorage.getItem("zoom_join_name");
    if (storedName) {
      setDisplayName(storedName);
    } else {
      api.getCurrentUser()
        .then((user) => {
          if (user?.display_name) setDisplayName(user.display_name);
        })
        .catch(() => {});
    }

    // Load recent meeting IDs from recent meetings API
    api.getRecentMeetings(1, 5)
      .then((res) => {
        const ids = (res.items || []).map((m) => m.meeting_id).filter(Boolean);
        setRecentMeetingIds(ids);
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = meetingId.replace(/\D/g, "");
    if (!cleanId || cleanId.length < 9) {
      setError("Please enter a valid 9 to 11-digit Meeting ID.");
      return;
    }
    if (!displayName.trim()) {
      setError("Please enter your name.");
      return;
    }

    // Save pre-join preferences
    sessionStorage.setItem("zoom_join_name", displayName.trim());
    sessionStorage.setItem("zoom_pref_no_audio", noAudio ? "true" : "false");
    sessionStorage.setItem("zoom_pref_no_video", noVideo ? "true" : "false");

    onClose();
    router.push(`/meetings/${cleanId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-7 shadow-2xl ring-1 ring-black/10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center tracking-tight mb-6">
          Join Meeting
        </h2>

        <form onSubmit={handleJoin} className="space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Meeting ID input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Meeting ID or Personal Link Name"
              value={meetingId}
              onChange={(e) => {
                setMeetingId(e.target.value);
                setError("");
              }}
              autoFocus
              className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#0B5CFF] focus:ring-2 focus:ring-blue-100 transition-all"
            />
            {recentMeetingIds.length > 0 && (
              <button
                type="button"
                onClick={() => setShowRecentDropdown(!showRecentDropdown)}
                className="absolute right-2.5 top-2.5 p-1 rounded-md text-slate-400 hover:text-slate-700"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            )}

            {showRecentDropdown && recentMeetingIds.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 rounded-xl bg-white p-1.5 shadow-xl border border-slate-200 z-10 text-xs text-slate-700">
                <p className="px-2 py-1 text-[10px] uppercase font-semibold text-slate-400">
                  Recent Meetings
                </p>
                {recentMeetingIds.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setMeetingId(id);
                      setShowRecentDropdown(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 font-mono text-xs text-slate-800"
                  >
                    {id}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Name input */}
          <div>
            <input
              type="text"
              placeholder="Enter your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#0B5CFF] focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Audio/Video Preferences */}
          <div className="space-y-2 pt-1 text-xs text-slate-600">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={noAudio}
                onChange={(e) => setNoAudio(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#0B5CFF] focus:ring-0 border-slate-300 cursor-pointer"
              />
              <span>Do not connect to audio</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={noVideo}
                onChange={(e) => setNoVideo(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#0B5CFF] focus:ring-0 border-slate-300 cursor-pointer"
              />
              <span>Turn off my video</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!meetingId.trim() || !displayName.trim()}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                meetingId.trim() && displayName.trim()
                  ? "bg-[#0B5CFF] hover:bg-[#004BDE] text-white shadow-xs cursor-pointer"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
              }`}
            >
              Join
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
