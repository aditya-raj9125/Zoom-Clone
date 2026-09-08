"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Video,
  Plus,
  Calendar as CalendarIcon,
  ChevronDown,
  Info,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Play,
  CalendarDays,
} from "lucide-react";
import { JoinMeetingModal } from "@/components/dashboard/JoinMeetingModal";
import { ScheduleMeetingView } from "@/components/dashboard/ScheduleMeetingView";
import { api } from "@/lib/api";
import { getCurrentUserFromToken, getStoredUser } from "@/lib/auth";
import type { MeetingListItem } from "@zoom-clone/contracts";

export default function DashboardPage() {
  const router = useRouter();

  // Mode: "home" | "schedule"
  const [viewMode, setViewMode] = useState<"home" | "schedule">("home");

  // Join meeting modal state
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  // Live time & date
  const [currentTime, setCurrentTime] = useState({
    time: "3:03 PM",
    date: "Monday, September 7",
    dayNumber: 19,
  });

  // Upcoming meetings from database
  const [upcomingMeetings, setUpcomingMeetings] = useState<MeetingListItem[]>([]);
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const dateStr = now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
      setCurrentTime({
        time: timeStr,
        date: dateStr,
        dayNumber: now.getDate(),
      });
    };

    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch upcoming meetings from FastAPI database
  const loadMeetings = () => {
    api.getUpcomingMeetings()
      .then((meetings) => {
        setUpcomingMeetings(meetings || []);
      })
      .catch(() => {
        // quiet fallback
      });
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  // Handle Instant Meeting creation (Mockup 1)
  const handleStartInstantMeeting = async () => {
    setIsCreatingMeeting(true);
    try {
      const user = getStoredUser() || getCurrentUserFromToken();
      const hostName = user?.display_name?.trim() || "Aditya Raj";
      const meeting = await api.createInstantMeeting(`${hostName}'s Zoom Meeting`);

      // Pre-cache host session so meeting room immediately connects as host without duplicate participant
      sessionStorage.setItem(
        `zoom_session_${meeting.meeting_id}`,
        JSON.stringify({
          participant_id: meeting.host_participant_id,
          meeting_id: meeting.meeting_id,
          display_name: hostName,
          role: "host",
          is_host: true,
        })
      );
      sessionStorage.setItem("zoom_join_name", hostName);

      router.push(`/meetings/${meeting.meeting_id}`);
    } catch (err: unknown) {
      alert(`Error starting instant meeting: ${err instanceof Error ? err.message : "Unknown error"}`);
      setIsCreatingMeeting(false);
    }
  };

  if (viewMode === "schedule") {
    return (
      <ScheduleMeetingView
        onBack={() => {
          setViewMode("home");
          loadMeetings();
        }}
        onScheduledSuccess={() => {
          loadMeetings();
        }}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-start pt-8 pb-10 px-4 select-none overflow-y-auto font-sans">
      {/* Clock Section (Mockup 1) */}
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
          {currentTime.time}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
          {currentTime.date}
        </p>
      </div>

      {/* 3 Primary Action Tiles (Mockup 1) */}
      <div className="mt-8 flex items-center justify-center gap-8 sm:gap-10">
        {/* 1. New meeting (Orange) */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleStartInstantMeeting}
            disabled={isCreatingMeeting}
            className="w-16 h-16 rounded-2xl bg-[#FE5C23] hover:bg-[#E54810] active:scale-95 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all cursor-pointer group"
            title="Start an Instant Meeting"
          >
            <Video className="w-7 h-7 group-hover:scale-105 transition-transform" />
          </button>
          <div className="flex items-center gap-0.5 mt-2 cursor-pointer hover:opacity-80">
            <span className="text-xs text-slate-700 font-medium">
              {isCreatingMeeting ? "Starting..." : "New meeting"}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </div>
        </div>

        {/* 2. Join (Blue) */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => setJoinModalOpen(true)}
            className="w-16 h-16 rounded-2xl bg-[#0B5CFF] hover:bg-[#004BDE] active:scale-95 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all cursor-pointer group"
            title="Join a Meeting"
          >
            <Plus className="w-7 h-7 group-hover:scale-105 transition-transform" />
          </button>
          <span className="text-xs text-slate-700 font-medium mt-2">
            Join
          </span>
        </div>

        {/* 3. Schedule (Blue with Calendar Day) */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => setViewMode("schedule")}
            className="w-16 h-16 rounded-2xl bg-[#0B5CFF] hover:bg-[#004BDE] active:scale-95 text-white flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
            title="Schedule a Meeting"
          >
            <div className="w-8 h-8 rounded-lg bg-white/20 flex flex-col items-center justify-center text-white border border-white/30">
              <span className="text-[9px] uppercase font-bold tracking-wider leading-none">SEP</span>
              <span className="text-xs font-black leading-none mt-0.5">{currentTime.dayNumber}</span>
            </div>
          </button>
          <span className="text-xs text-slate-700 font-medium mt-2">
            Schedule
          </span>
        </div>
      </div>

      {/* Calendar Connection Banner (Mockup 1) */}
      <div className="mt-8 max-w-xl w-full rounded-2xl border border-blue-200 bg-blue-50/50 p-3.5 flex items-start gap-3 text-xs text-slate-700 shadow-2xs">
        <div className="w-5 h-5 rounded-full bg-blue-100 text-[#0B5CFF] flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-3.5 h-3.5" />
        </div>
        <div className="leading-relaxed">
          You haven&apos;t connected your calendar yet.{" "}
          <button
            onClick={() => alert("Calendar Integration: Google Calendar & Microsoft Outlook")}
            className="text-[#0B5CFF] font-semibold hover:underline cursor-pointer"
          >
            Connect now
          </button>{" "}
          to manage all your meetings and events in one place.
        </div>
      </div>

      {/* Today's Agenda Card (Mockup 1) */}
      <div className="mt-4 max-w-xl w-full rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden flex flex-col">
        {/* Agenda Card Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100">
          <button className="flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-slate-950">
            <span>Today, Sep 7</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <button
            onClick={() => alert("Pop-out Calendar view")}
            className="p-1 rounded text-slate-400 hover:text-slate-700"
            title="Pop out"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filter / Subheader Controls */}
        <div className="px-4 py-2 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-xs">
          <button className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border border-slate-200 bg-white text-[11px] font-medium text-slate-700 hover:bg-slate-50 shadow-2xs">
            <CalendarDays className="w-3 h-3 text-slate-500" />
            <span>Today</span>
          </button>

          <div className="flex items-center gap-1 text-slate-400">
            <button className="p-1 rounded hover:bg-slate-200/60 hover:text-slate-700">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 rounded hover:bg-slate-200/60 hover:text-slate-700">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 rounded hover:bg-slate-200/60 hover:text-slate-700 ml-1">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Meeting list or Empty State */}
        <div className="p-6 flex flex-col items-center justify-center min-h-[160px]">
          {upcomingMeetings.length === 0 ? (
            /* Empty State: Beach umbrella illustration (Mockup 1) */
            <div className="flex flex-col items-center text-center">
              {/* SVG Umbrella Illustration matching mockup */}
              <svg className="w-20 h-20 text-blue-300 mb-2" viewBox="0 0 100 80" fill="none">
                <ellipse cx="50" cy="68" rx="28" ry="7" fill="#E2E8F0" />
                <path d="M50 15 L78 38 L22 38 Z" fill="#93C5FD" opacity="0.8" />
                <path d="M50 15 L64 38 L36 38 Z" fill="#60A5FA" />
                <path d="M50 38 L50 68" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M42 64 L58 60" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <p className="text-xs text-slate-500 font-normal">
                No meetings scheduled.
              </p>
            </div>
          ) : (
            /* Live upcoming meetings from database */
            <div className="w-full space-y-2.5">
              {upcomingMeetings.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{item.title}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Meeting ID: {item.meeting_id}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/meetings/${item.meeting_id}`)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0B5CFF] hover:bg-[#004BDE] text-white text-xs font-semibold shadow-2xs"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Start</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Open recordings > */}
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between text-xs text-slate-600 hover:text-[#0B5CFF] cursor-pointer transition-colors">
          <button
            onClick={() => alert("Cloud & Local Recordings")}
            className="flex items-center gap-1 font-medium"
          >
            <span>Open recordings</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Join Meeting Modal (Mockup 4) */}
      <JoinMeetingModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
      />
    </div>
  );
}
