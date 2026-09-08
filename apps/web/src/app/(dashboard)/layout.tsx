"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Video,
  MessageSquare,
  MoreHorizontal,
  Settings,
  ChevronLeft,
  ChevronRight,
  History,
  Search,
  Check,
  Play,
  Copy,
  Clock,
  RefreshCw,
} from "lucide-react";
import { UserProfileDropdown } from "@/components/dashboard/UserProfileDropdown";
import { MoreAppsFlyout } from "@/components/dashboard/MoreAppsFlyout";
import { api } from "@/lib/api";
import { getCurrentUserFromToken, getStoredUser, isLoggedIn, setStoredUser } from "@/lib/auth";
import type { MeetingListItem } from "@zoom-clone/contracts";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState({
    displayName: "Zoom User",
    email: "",
    avatarUrl: null as string | null,
  });

  const [userStatus, setUserStatus] = useState("Available");
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreAppsOpen, setMoreAppsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "meetings" | "chat">("home");
  const [recentMeetings, setRecentMeetings] = useState<MeetingListItem[]>([]);
  const [recentMeetingsLoading, setRecentMeetingsLoading] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Auth Guard: Verify session
    if (!isLoggedIn()) {
      router.replace("/signin");
      return;
    }

    // 2. Immediate load from cache or JWT payload for instant UI render
    const cachedUser = getStoredUser() || getCurrentUserFromToken();
    if (cachedUser) {
      setCurrentUser({
        displayName: cachedUser.display_name,
        email: cachedUser.email || "",
        avatarUrl: cachedUser.avatar_url || null,
      });
    }

    // 3. Revalidate live profile with backend
    api.getCurrentUser()
      .then((user) => {
        setCurrentUser({
          displayName: user.display_name,
          email: user.email || "",
          avatarUrl: user.avatar_url,
        });
        setStoredUser(user);
      })
      .catch(() => {
        // If 401 error cleared the token, redirect to signin
        if (!isLoggedIn()) {
          router.replace("/signin");
        }
      });
  }, [router]);

  // Load recent meetings when tab is activated
  useEffect(() => {
    if (activeTab !== "meetings") return;
    setRecentMeetingsLoading(true);
    api.getRecentMeetings(1, 20)
      .then((res) => {
        setRecentMeetings(res.items || []);
      })
      .catch(() => {
        setRecentMeetings([]);
      })
      .finally(() => setRecentMeetingsLoading(false));
  }, [activeTab]);

  const handleCopyInviteLink = (inviteLink: string, meetingId: string) => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLinkId(meetingId);
    setTimeout(() => setCopiedLinkId((cur) => cur === meetingId ? null : cur), 2500);
  };

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden bg-[#F3F4F6] text-slate-800 select-none font-sans"
      onClick={() => {
        setProfileOpen(false);
        setMoreAppsOpen(false);
      }}
    >
      {/* Top Application Bar (Mockup 1) */}
      <header className="h-12 w-full bg-[#E5E7EB]/90 border-b border-slate-200/80 px-4 flex items-center justify-between shrink-0 z-40">
        {/* Left: Zoom Workplace logo & navigation arrows */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-1.5 group">
            <Image
              src="/assets/branding/logo-zoom-blue@2x.png"
              alt="Zoom"
              width={90}
              height={20}
              priority
              className="h-5 w-auto object-contain"
            />
            <span className="text-[13px] font-normal text-slate-700 tracking-tight">
              Workplace
            </span>
          </Link>

          {/* Nav arrows */}
          <div className="flex items-center gap-1 text-slate-500 pl-2">
            <button
              onClick={() => router.back()}
              className="p-1 rounded hover:bg-slate-200/80 transition-colors"
              title="Back"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.forward()}
              className="p-1 rounded hover:bg-slate-200/80 transition-colors"
              title="Forward"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => alert("History: Clean workspace session")}
              className="p-1 rounded hover:bg-slate-200/80 transition-colors"
              title="History"
            >
              <History className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Search Ctrl+K */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Ctrl+K"
              className="w-full h-7 pl-8 pr-4 rounded-lg bg-white/70 hover:bg-white focus:bg-white text-[11px] text-slate-800 placeholder:text-slate-400 border border-transparent focus:border-slate-300 outline-none transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Right: Upgrade button & User profile badge */}
        <div className="flex items-center gap-3 relative">
          <button
            onClick={() => alert("Upgrade to Zoom Workplace Pro")}
            className="h-7 px-3 rounded-lg bg-[#0B5CFF] hover:bg-[#004BDE] text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            Upgrade
          </button>

          {/* Profile circle with green indicator */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setProfileOpen(!profileOpen);
                setMoreAppsOpen(false);
              }}
              className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[11px] relative ring-2 ring-white hover:ring-blue-300 transition-all cursor-pointer overflow-hidden"
              title={currentUser.displayName}
            >
              <span>{currentUser.displayName.slice(0, 2).toUpperCase()}</span>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
            </button>

            {/* Popover */}
            {profileOpen && (
              <UserProfileDropdown
                displayName={currentUser.displayName}
                email={currentUser.email}
                status={userStatus}
                onStatusChange={setUserStatus}
                onClose={() => setProfileOpen(false)}
              />
            )}
          </div>
        </div>
      </header>

      {/* Main Body with Left Sidebar + Center View */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar (Mockup 1) */}
        <aside className="w-16 bg-[#E5E7EB]/80 border-r border-slate-200/80 flex flex-col items-center justify-between py-2 shrink-0 z-30">
          {/* Top navigation icons */}
          <div className="flex flex-col items-center gap-1 w-full px-1.5">
            {/* Home */}
            <Link
              href="/dashboard"
              onClick={() => setActiveTab("home")}
              className={`w-full py-1.5 flex flex-col items-center rounded-xl transition-all cursor-pointer ${
                activeTab === "home"
                  ? "bg-white text-[#0B5CFF] shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Home className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] font-medium">Home</span>
            </Link>

            {/* Meetings */}
            <button
              type="button"
              onClick={() => setActiveTab("meetings")}
              className={`w-full py-1.5 flex flex-col items-center rounded-xl transition-all cursor-pointer ${
                activeTab === "meetings"
                  ? "bg-white text-[#0B5CFF] shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Video className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] font-medium">Meetings</span>
            </button>

            {/* Chat */}
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`w-full py-1.5 flex flex-col items-center rounded-xl transition-all cursor-pointer ${
                activeTab === "chat"
                  ? "bg-white text-[#0B5CFF] shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <MessageSquare className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] font-medium">Chat</span>
            </button>

            {/* More */}
            <div className="relative w-full">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMoreAppsOpen(!moreAppsOpen);
                  setProfileOpen(false);
                }}
                className={`w-full py-1.5 flex flex-col items-center rounded-xl transition-all cursor-pointer ${
                  moreAppsOpen
                    ? "bg-white text-[#0B5CFF] shadow-xs border border-blue-400"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <MoreHorizontal className="w-4 h-4 mb-0.5" />
                <span className="text-[10px] font-medium">More</span>
              </button>

              {/* More Apps Flyout */}
              {moreAppsOpen && (
                <MoreAppsFlyout onClose={() => setMoreAppsOpen(false)} />
              )}
            </div>
          </div>

          {/* Bottom settings button (Mockup 1) */}
          <div className="w-full px-2 pt-2">
            <button
              onClick={() => alert("Zoom Workplace Settings: Audio, Video, Recording, General preferences")}
              className="w-10 h-10 mx-auto rounded-xl bg-white hover:bg-slate-50 border border-blue-400/80 shadow-xs flex items-center justify-center text-slate-700 hover:text-[#0B5CFF] transition-all cursor-pointer"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* Center Canvas Area */}
        <main className="flex-1 overflow-y-auto bg-[#F3F4F6] p-2 flex flex-col relative">
          <div className="flex-1 bg-white rounded-3xl border border-slate-200/70 shadow-xs overflow-y-auto">
            {/* Meetings Panel (overlaid when Meetings tab is active) */}
            {activeTab === "meetings" && (
              <div className="absolute inset-0 z-20 flex flex-col bg-white rounded-3xl overflow-hidden shadow-md animate-in slide-in-from-left-4 duration-200">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">Meetings</h2>
                  <button
                    onClick={() => {
                      setRecentMeetingsLoading(true);
                      api.getRecentMeetings(1, 20)
                        .then((res) => setRecentMeetings(res.items || []))
                        .catch(() => {})
                        .finally(() => setRecentMeetingsLoading(false));
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${recentMeetingsLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>

                {/* Filter tabs */}
                <div className="px-5 py-2.5 border-b border-slate-100 flex items-center gap-2 text-xs">
                  <button className="px-3 py-1 rounded-full bg-[#0B5CFF] text-white font-medium text-[11px]">All</button>
                  <button className="px-3 py-1 rounded-full text-slate-600 hover:bg-slate-100 font-medium text-[11px]">Upcoming</button>
                  <button className="px-3 py-1 rounded-full text-slate-600 hover:bg-slate-100 font-medium text-[11px]">Previous</button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {recentMeetingsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
                    </div>
                  ) : recentMeetings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                      <Clock className="w-10 h-10 text-slate-300 mb-3" />
                      <p className="text-sm font-medium text-slate-600">No meetings yet</p>
                      <p className="text-xs text-slate-400 mt-1">Start or schedule a meeting to see it here.</p>
                      <button
                        onClick={() => setActiveTab("home")}
                        className="mt-4 px-4 py-2 rounded-xl bg-[#0B5CFF] text-white text-xs font-semibold hover:bg-[#004BDE] transition-colors"
                      >
                        Go to Home
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {recentMeetings.map((m) => (
                        <div key={m.id} className="px-5 py-3.5 hover:bg-slate-50 transition-colors group">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0B5CFF] flex items-center justify-center shrink-0">
                                  <Video className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-slate-900 truncate">{m.title}</p>
                                  <p className="text-[11px] text-slate-500 font-mono">
                                    {m.meeting_id} &bull; {m.status === "live" ? (
                                      <span className="text-emerald-600 font-semibold">LIVE</span>
                                    ) : m.status === "ended" ? (
                                      <span className="text-slate-400">Ended</span>
                                    ) : (
                                      <span className="text-amber-600">Scheduled</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              {m.actual_started_at && (
                                <p className="text-[10px] text-slate-400 mt-1 pl-9">
                                  {new Date(m.actual_started_at).toLocaleDateString("en-US", {
                                    weekday: "short", month: "short", day: "numeric",
                                    hour: "numeric", minute: "2-digit",
                                  })}
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleCopyInviteLink(m.invite_link, m.meeting_id)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                                title="Copy invite link"
                              >
                                {copiedLinkId === m.meeting_id ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                              {(m.status === "live" || m.status === "scheduled" || m.status === "waiting") && (
                                <button
                                  onClick={() => router.push(`/meetings/${m.meeting_id}`)}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0B5CFF] hover:bg-[#004BDE] text-white text-[11px] font-semibold transition-colors shadow-xs"
                                >
                                  <Play className="w-2.5 h-2.5 fill-white" />
                                  <span>Start</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
