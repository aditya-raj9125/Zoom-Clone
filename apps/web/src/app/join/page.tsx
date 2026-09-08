"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Video, Shield, Loader2, AlertCircle, ArrowLeft, Mic, MicOff, VideoOff } from "lucide-react";
import { api } from "@/lib/api";

function JoinMeetingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [meetingInput, setMeetingInput] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [rememberName, setRememberName] = useState(true);
  const [turnOffVideo, setTurnOffVideo] = useState(false);
  const [turnOffAudio, setTurnOffAudio] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Pre-fill meeting ID from search params (?id= or ?meeting_id=)
    const paramId = searchParams.get("id") || searchParams.get("meeting_id");
    if (paramId) {
      setMeetingInput(paramId);
    }

    // 2. Pre-fill display name from storage or auth
    const storedName =
      sessionStorage.getItem("zoom_join_name") ||
      (typeof localStorage !== "undefined" ? localStorage.getItem("zoom_join_name") : null);
    if (storedName) {
      setDisplayName(storedName);
    } else {
      api.getCurrentUser()
        .then((user) => {
          if (user?.display_name) {
            setDisplayName(user.display_name);
          }
        })
        .catch(() => {
          // Guest user - not logged in
        });
    }
  }, [searchParams]);

  // Extract pure meeting ID if a full URL was pasted
  const parseMeetingId = (input: string): string => {
    const trimmed = input.trim();
    if (trimmed.includes("/")) {
      const parts = trimmed.split("/");
      const lastPart = parts[parts.length - 1]?.split("?")[0] || "";
      return lastPart.replace(/[^a-zA-Z0-9_-]/g, "");
    }
    return trimmed.replace(/\s+/g, "").replace(/-/g, "");
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMeetingId = parseMeetingId(meetingInput);

    if (!cleanMeetingId) {
      setError("Please enter a valid Meeting ID or link.");
      return;
    }

    if (!displayName.trim()) {
      setError("Please enter your name.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await api.joinMeeting({
        meeting_id: cleanMeetingId,
        display_name: displayName.trim(),
        passcode: passcode.trim() || undefined,
      });

      // Cache session information for seamless connection in meeting room
      sessionStorage.setItem("zoom_join_name", displayName.trim());
      if (rememberName && typeof localStorage !== "undefined") {
        localStorage.setItem("zoom_join_name", displayName.trim());
      }
      sessionStorage.setItem(`zoom_session_${res.meeting_id}`, JSON.stringify(res));

      // Save audio/video preferences
      if (turnOffVideo) sessionStorage.setItem("zoom_pref_video_off", "true");
      if (turnOffAudio) sessionStorage.setItem("zoom_pref_audio_off", "true");

      // Navigate directly into meeting room
      router.push(`/meetings/${res.meeting_id}`);
    } catch (err: unknown) {
      console.error("Failed to join meeting:", err);
      const msg = err instanceof Error ? err.message : "Meeting not found or unable to join.";
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F3596] via-[#1546BE] to-[#1D5CE5] flex flex-col justify-between text-white selection:bg-blue-200 selection:text-blue-900">
      {/* Top Simple Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 group">
          <svg className="h-7 w-auto text-white" viewBox="0 0 120 30" fill="currentColor">
            <path d="M14.5 5.5H4.2l8.8 14.2H4.2v4.8h17.2v-3.7L12.5 6.6h9.2V5.5zM38.5 7.6c-5.2 0-9.4 3.9-9.4 8.7 0 4.8 4.2 8.7 9.4 8.7s9.4-3.9 9.4-8.7c0-4.8-4.2-8.7-9.4-8.7zm0 13.5c-2.8 0-5.1-2.1-5.1-4.8s2.3-4.8 5.1-4.8 5.1 2.1 5.1 4.8-2.3 4.8-5.1 4.8zm22.4-13.5c-5.2 0-9.4 3.9-9.4 8.7 0 4.8 4.2 8.7 9.4 8.7s9.4-3.9 9.4-8.7c0-4.8-4.2-8.7-9.4-8.7zm0 13.5c-2.8 0-5.1-2.1-5.1-4.8s2.3-4.8 5.1-4.8 5.1 2.1 5.1 4.8-2.3 4.8-5.1 4.8zm21.5-13.5c-2.6 0-4.8 1.1-6.1 2.8-.7-1.7-2.6-2.8-4.8-2.8-2 0-3.8 1-4.8 2.5V8.1h-4.3v16.4h4.3v-9.5c0-2.3 1.5-3.8 3.5-3.8s3.3 1.5 3.3 3.8v9.5h4.3v-9.5c0-2.3 1.5-3.8 3.5-3.8s3.3 1.5 3.3 3.8v9.5h4.3v-10c0-4.1-2.9-6.6-7.4-6.6z" />
          </svg>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-blue-100 hidden sm:inline">Want to host your own meeting?</span>
          <Link
            href="/signin"
            className="rounded-full bg-white/15 hover:bg-white/25 px-4 py-1.5 text-xs font-semibold border border-white/20 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Join Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl text-slate-900 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-[#0B5CFF] mb-4 shadow-inner">
              <Video className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Join a Meeting
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              No account required. Connect instantly as a guest with your Meeting ID.
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-xs sm:text-sm text-red-700 border border-red-200">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-4">
            {/* Meeting ID Input */}
            <div>
              <label htmlFor="meeting-id" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Meeting ID or Link
              </label>
              <input
                id="meeting-id"
                type="text"
                value={meetingInput}
                onChange={(e) => setMeetingInput(e.target.value)}
                placeholder="e.g. 123 456 7890 or invite link"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B5CFF] focus:outline-hidden focus:ring-3 focus:ring-blue-500/20 transition-all font-medium"
              />
            </div>

            {/* Display Name Input */}
            <div>
              <label htmlFor="display-name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Your Name
              </label>
              <input
                id="display-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter the name others will see"
                required
                maxLength={40}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B5CFF] focus:outline-hidden focus:ring-3 focus:ring-blue-500/20 transition-all font-medium"
              />
            </div>

            {/* Optional Passcode Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="passcode" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Meeting Passcode
                </label>
                <span className="text-[11px] text-slate-400 font-normal">Optional</span>
              </div>
              <input
                id="passcode"
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="6-character passcode (if required)"
                maxLength={20}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B5CFF] focus:outline-hidden focus:ring-3 focus:ring-blue-500/20 transition-all font-medium"
              />
            </div>

            {/* Audio & Video Toggles */}
            <div className="pt-2 space-y-2.5 text-xs text-slate-600">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberName}
                  onChange={(e) => setRememberName(e.target.checked)}
                  className="rounded border-slate-300 text-[#0B5CFF] focus:ring-blue-500 h-4 w-4"
                />
                <span>Remember my name for future meetings</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={turnOffAudio}
                  onChange={(e) => setTurnOffAudio(e.target.checked)}
                  className="rounded border-slate-300 text-[#0B5CFF] focus:ring-blue-500 h-4 w-4"
                />
                <span>Do not connect to audio</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={turnOffVideo}
                  onChange={(e) => setTurnOffVideo(e.target.checked)}
                  className="rounded border-slate-300 text-[#0B5CFF] focus:ring-blue-500 h-4 w-4"
                />
                <span>Turn off my video</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-[#0B5CFF] hover:bg-[#004BDC] text-white py-3.5 px-6 font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <span>Join</span>
                )}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-[11px] text-slate-400 leading-relaxed">
            By clicking &ldquo;Join&rdquo;, you agree to our{" "}
            <a href="#" className="underline hover:text-slate-600">Terms of Service</a> and{" "}
            <a href="#" className="underline hover:text-slate-600">Privacy Statement</a>.
          </p>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-4 text-center text-xs text-blue-200/80">
        <p>&copy; {new Date().getFullYear()} Zoom Video Communications, Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default function JoinMeetingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F3596] flex items-center justify-center text-white font-medium">Loading...</div>}>
      <JoinMeetingContent />
    </Suspense>
  );
}
