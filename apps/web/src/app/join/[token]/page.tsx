"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, AlertCircle, Video, User } from "lucide-react";
import { api } from "@/lib/api";

export default function JoinByInvitePage() {
  const params = useParams();
  const router = useRouter();
  const inviteToken = (params.token as string) || "";

  const [displayName, setDisplayName] = useState("");
  const [hasPromptedName, setHasPromptedName] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!inviteToken) {
      setError("Invalid or missing invite link.");
      return;
    }

    // An invite always starts a new participant session. Never auto-join from
    // the host's authenticated profile or stored host name.
    setHasPromptedName(true);
  }, [inviteToken]);

  const joinWithDisplayName = async (name: string) => {
    if (!name.trim()) return;
    setIsLoading(true);
    setError("");

    try {
      const res = await api.joinByInvite({
        invite_token: inviteToken,
        display_name: name.trim(),
      });

      sessionStorage.setItem("zoom_join_name", name.trim());
      sessionStorage.setItem(`zoom_session_${res.meeting_id}`, JSON.stringify(res));
      router.replace(`/meetings/${res.meeting_id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to join meeting by invite.");
      setIsLoading(false);
      setHasPromptedName(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim()) {
      joinWithDisplayName(displayName);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-4 font-sans select-none">
      <div className="w-full max-w-sm rounded-2xl bg-white p-7 text-center shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Zoom Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/assets/branding/logo-zoom-blue@2x.png"
            alt="Zoom"
            width={110}
            height={25}
            priority
            className="h-6 w-auto object-contain"
          />
        </div>

        {isLoading ? (
          <div className="space-y-3 py-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#0B5CFF] mx-auto" />
            <h2 className="text-sm font-semibold text-slate-800">Connecting to meeting...</h2>
            <p className="text-xs text-slate-500">Preparing your Zoom Workplace session</p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Unable to join meeting</h2>
              <p className="text-xs text-slate-500 mt-1">{error}</p>
            </div>
            <Link
              href="/dashboard"
              className="inline-block w-full py-2 rounded-xl bg-[#0B5CFF] hover:bg-[#004BDE] text-white text-xs font-semibold shadow-xs"
            >
              Return to Dashboard
            </Link>
          </div>
        ) : hasPromptedName ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="text-center mb-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B5CFF] flex items-center justify-center mx-auto mb-2 shadow-xs">
                <Video className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Join Zoom Meeting</h2>
              <p className="text-xs text-slate-500 mt-0.5">Please enter your name to appear in the meeting</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Your Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Smith"
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B5CFF] focus:border-transparent transition-all"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={!displayName.trim()}
              className="w-full h-10 rounded-xl bg-[#0B5CFF] hover:bg-[#004BDE] active:scale-[0.99] disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              Join Meeting
            </button>
          </form>
        ) : (
          <div className="space-y-3 py-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#0B5CFF] mx-auto" />
            <h2 className="text-sm font-semibold text-slate-800">Verifying invite link...</h2>
          </div>
        )}
      </div>
    </div>
  );
}
