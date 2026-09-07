"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  Info,
  Shield,
  Sparkles,
  Lock,
  Check,
} from "lucide-react";
import { api } from "@/lib/api";

interface ScheduleMeetingViewProps {
  onBack: () => void;
  onScheduledSuccess?: (meeting: { meeting_id: string; title: string; passcode: string; invite_link: string }) => void;
}

export function ScheduleMeetingView({ onBack, onScheduledSuccess }: ScheduleMeetingViewProps) {
  const [topic, setTopic] = useState("My Meeting");
  const [description, setDescription] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [date, setDate] = useState("2026-09-07");
  const [time, setTime] = useState("03:00");
  const [amPm, setAmPm] = useState("PM");
  const [durationHours, setDurationHours] = useState("0");
  const [durationMinutes, setDurationMinutes] = useState("40");
  const [timeZone, setTimeZone] = useState("(GMT-7:00) Pacific Time (US and Canada)");
  const [isRecurring, setIsRecurring] = useState(false);
  const [invitees, setInvitees] = useState("");
  const [meetingIdType, setMeetingIdType] = useState<"auto" | "pmi">("auto");
  const [passcode, setPasscode] = useState("jG3T9C");
  const [passcodeEnabled, setPasscodeEnabled] = useState(true);
  const [waitingRoom, setWaitingRoom] = useState(false);
  const [encryption, setEncryption] = useState<"enhanced" | "e2ee">("enhanced");
  const [zoomAi, setZoomAi] = useState(false);
  const [myNotes, setMyNotes] = useState(true);
  const [myNotesAudience, setMyNotesAudience] = useState<"all" | "org">("all");
  const [meetingChat, setMeetingChat] = useState(true);
  const [hostVideo, setHostVideo] = useState(true);
  const [participantVideo, setParticipantVideo] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successInfo, setSuccessInfo] = useState<{
    meeting_id: string;
    title: string;
    passcode: string;
    invite_link: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError("Meeting topic is required.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Calculate ISO 8601 UTC start time
      const [hStr, mStr] = time.split(":");
      let hours = parseInt(hStr, 10);
      if (amPm === "PM" && hours < 12) hours += 12;
      if (amPm === "AM" && hours === 12) hours = 0;

      const scheduledDate = new Date(date);
      scheduledDate.setHours(hours, parseInt(mStr || "0", 10), 0, 0);

      const totalDuration = parseInt(durationHours, 10) * 60 + parseInt(durationMinutes, 10);

      const res = await api.scheduleMeeting({
        title: topic,
        description: description || undefined,
        scheduled_start_at: scheduledDate.toISOString(),
        duration_minutes: Math.max(15, totalDuration || 40),
      });

      const meetingData = {
        meeting_id: res.meeting_id,
        title: res.title,
        passcode: res.passcode,
        invite_link: res.invite_link,
      };

      setSuccessInfo(meetingData);
      onScheduledSuccess?.(meetingData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to schedule meeting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successInfo) {
    return (
      <div className="w-full max-w-2xl mx-auto py-8 px-6 text-slate-800 animate-in fade-in duration-200">
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
          <h2 className="text-xl font-bold text-emerald-950">Meeting Scheduled Successfully!</h2>
          <p className="text-xs text-emerald-700 mt-1">
            Your meeting &ldquo;{successInfo.title}&rdquo; is ready and saved in the database.
          </p>

          <div className="mt-5 p-4 rounded-xl bg-white border border-emerald-100 text-left text-xs space-y-2">
            <div>
              <span className="font-semibold text-slate-600">Meeting ID:</span>{" "}
              <span className="font-mono font-bold text-slate-900">{successInfo.meeting_id}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-600">Passcode:</span>{" "}
              <span className="font-mono font-bold text-slate-900">{successInfo.passcode}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-600">Invite Link:</span>{" "}
              <span className="text-[#0B5CFF] underline break-all">{successInfo.invite_link}</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={onBack}
              className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
            >
              Back to Meetings
            </button>
            <a
              href={`/meetings/${successInfo.meeting_id}`}
              className="px-5 py-2 rounded-xl bg-[#0B5CFF] hover:bg-[#004BDE] text-xs font-semibold text-white shadow-xs transition-all"
            >
              Start Meeting Now
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-6 px-4 sm:px-8 text-slate-800 text-xs font-normal">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-[#0B5CFF] hover:underline font-medium mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Meetings
      </button>

      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-6">
        Schedule Meeting
      </h1>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Topic */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
          <label className="text-slate-700 font-medium sm:text-right pr-4">
            <span className="text-red-500">*</span> Topic
          </label>
          <div className="sm:col-span-3">
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full h-10 px-3.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:border-[#0B5CFF] focus:ring-2 focus:ring-blue-100"
            />
            {!showDescription ? (
              <button
                type="button"
                onClick={() => setShowDescription(true)}
                className="text-[11px] text-[#0B5CFF] hover:underline font-medium mt-1 inline-block"
              >
                + Add Description
              </button>
            ) : (
              <textarea
                placeholder="Meeting agenda and notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full mt-2 p-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:border-[#0B5CFF]"
              />
            )}
          </div>
        </div>

        {/* When */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
          <label className="text-slate-700 font-medium sm:text-right pr-4">
            When
          </label>
          <div className="sm:col-span-3 flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 outline-none focus:border-[#0B5CFF]"
            />
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-20 h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 outline-none focus:border-[#0B5CFF]"
            />
            <select
              value={amPm}
              onChange={(e) => setAmPm(e.target.value)}
              className="h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 outline-none focus:border-[#0B5CFF]"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>

        {/* Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
          <label className="text-slate-700 font-medium sm:text-right pr-4">
            Duration
          </label>
          <div className="sm:col-span-3 flex items-center gap-2">
            <select
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              className="h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 outline-none"
            >
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
            <span className="text-slate-500">hr</span>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 outline-none"
            >
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="40">40</option>
              <option value="45">45</option>
            </select>
            <span className="text-slate-500">min</span>
          </div>
        </div>

        {/* Basic Plan Warning Banner (Mockup 4) */}
        <div className="sm:ml-[25%] p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-[11px] text-amber-900 leading-relaxed">
            You can schedule meetings for up to 40 minutes each with your current Basic plan. Need more time?{" "}
            <a href="#upgrade" className="text-[#0B5CFF] underline font-medium">Upgrade to Zoom Workplace Pro</a>
          </div>
        </div>

        {/* Time Zone */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
          <label className="text-slate-700 font-medium sm:text-right pr-4">
            Time Zone
          </label>
          <div className="sm:col-span-3">
            <select
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 outline-none"
            >
              <option value="(GMT-7:00) Pacific Time (US and Canada)">(GMT-7:00) Pacific Time (US and Canada)</option>
              <option value="(GMT+0:00) UTC">(GMT+0:00) UTC</option>
              <option value="(GMT+5:30) India Standard Time (IST)">(GMT+5:30) India Standard Time (IST)</option>
              <option value="(GMT-4:00) Eastern Time (US and Canada)">(GMT-4:00) Eastern Time (US and Canada)</option>
            </select>

            <label className="flex items-center gap-2 mt-2.5 cursor-pointer select-none text-slate-600">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#0B5CFF] border-slate-300"
              />
              <span>Recurring meeting</span>
            </label>
          </div>
        </div>

        {/* Invitees */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-start">
          <label className="text-slate-700 font-medium sm:text-right pr-4 pt-2">
            Invitees
          </label>
          <div className="sm:col-span-3 space-y-2">
            <input
              type="text"
              placeholder="Enter user names or email addresses"
              value={invitees}
              onChange={(e) => setInvitees(e.target.value)}
              className="w-full h-10 px-3.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 outline-none"
            />
            <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/60 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-900 leading-relaxed">
                Participants won&apos;t receive this meeting invite until your calendar is connected.{" "}
                <a href="#connect" className="text-[#0B5CFF] underline font-medium">Connect calendar</a>
              </div>
            </div>
          </div>
        </div>

        {/* Meeting ID (Mockup 5) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
          <label className="text-slate-700 font-medium sm:text-right pr-4">
            Meeting ID
          </label>
          <div className="sm:col-span-3 flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="meetingId"
                checked={meetingIdType === "auto"}
                onChange={() => setMeetingIdType("auto")}
                className="w-3.5 h-3.5 text-[#0B5CFF]"
              />
              <span>Generate Automatically</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="meetingId"
                checked={meetingIdType === "pmi"}
                onChange={() => setMeetingIdType("pmi")}
                className="w-3.5 h-3.5 text-[#0B5CFF]"
              />
              <span>Personal Meeting ID 471 739 7012</span>
            </label>
          </div>
        </div>

        {/* Security (Mockup 5) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-start">
          <label className="text-slate-700 font-medium sm:text-right pr-4 pt-1">
            Security
          </label>
          <div className="sm:col-span-3 space-y-3">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={passcodeEnabled}
                  onChange={(e) => setPasscodeEnabled(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-[#0B5CFF]"
                />
                <span className="font-medium text-slate-800">Passcode</span>
              </label>
              <input
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                disabled={!passcodeEnabled}
                className="w-28 h-8 px-2.5 rounded-lg border border-slate-300 font-mono text-xs text-slate-800 outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 pl-5.5">
              Only users who have the invite link or passcode can join the meeting
            </p>

            <div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={waitingRoom}
                  onChange={(e) => setWaitingRoom(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-[#0B5CFF]"
                />
                <span className="font-medium text-slate-800">Waiting Room</span>
              </label>
              <p className="text-[11px] text-slate-500 pl-5.5 mt-0.5">
                Only users admitted by the host can join the meeting
              </p>
            </div>
          </div>
        </div>

        {/* Encryption (Mockup 6) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
          <label className="text-slate-700 font-medium sm:text-right pr-4">
            Encryption
          </label>
          <div className="sm:col-span-3 flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="encryption"
                checked={encryption === "enhanced"}
                onChange={() => setEncryption("enhanced")}
                className="w-3.5 h-3.5 text-[#0B5CFF]"
              />
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Enhanced encryption
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="encryption"
                checked={encryption === "e2ee"}
                onChange={() => setEncryption("e2ee")}
                className="w-3.5 h-3.5 text-[#0B5CFF]"
              />
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-600" />
                End-to-end encryption
              </span>
            </label>
          </div>
        </div>

        {/* Zoom AI & My Notes (Mockup 6) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-start">
          <label className="text-slate-700 font-medium sm:text-right pr-4 pt-1">
            My Notes
          </label>
          <div className="sm:col-span-3 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={myNotes}
                onChange={(e) => setMyNotes(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#0B5CFF]"
              />
              <span>Allow participants to transcribe meeting with My Notes</span>
            </label>
            {myNotes && (
              <div className="pl-5.5 space-y-1 text-[11px] text-slate-600">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="myNotesAudience"
                    checked={myNotesAudience === "all"}
                    onChange={() => setMyNotesAudience("all")}
                    className="w-3 h-3 text-[#0B5CFF]"
                  />
                  <span>All participants</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="myNotesAudience"
                    checked={myNotesAudience === "org"}
                    onChange={() => setMyNotesAudience("org")}
                    className="w-3 h-3 text-[#0B5CFF]"
                  />
                  <span>Only participants in your organization</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Video (Mockup 6) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
          <label className="text-slate-700 font-medium sm:text-right pr-4">
            Video
          </label>
          <div className="sm:col-span-3 space-y-2">
            <div className="flex items-center gap-6">
              <span className="w-20 text-slate-600">Host</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="hostVideo"
                  checked={hostVideo}
                  onChange={() => setHostVideo(true)}
                  className="w-3 h-3 text-[#0B5CFF]"
                />
                <span>on</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="hostVideo"
                  checked={!hostVideo}
                  onChange={() => setHostVideo(false)}
                  className="w-3 h-3 text-[#0B5CFF]"
                />
                <span>off</span>
              </label>
            </div>
            <div className="flex items-center gap-6">
              <span className="w-20 text-slate-600">Participant</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="partVideo"
                  checked={participantVideo}
                  onChange={() => setParticipantVideo(true)}
                  className="w-3 h-3 text-[#0B5CFF]"
                />
                <span>on</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="partVideo"
                  checked={!participantVideo}
                  onChange={() => setParticipantVideo(false)}
                  className="w-3 h-3 text-[#0B5CFF]"
                />
                <span>off</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="sm:ml-[25%] pt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#0B5CFF] hover:bg-[#004BDE] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            {isSubmitting ? "Saving meeting..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
