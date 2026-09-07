"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  CheckCircle2,
  Clock,
  Share2,
  FileText,
  Video,
  Mic,
  Smile,
  MoreHorizontal,
} from "lucide-react";

export function MyNotesSection() {
  const [activeTab, setActiveTab] = useState<"meeting" | "notes">("meeting");
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <section id="my-notes" className="py-20 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-md">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                My Notes
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#020B27] tracking-tight">
              Your new AI note taker
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle Pill */}
            <div className="flex rounded-full bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("meeting")}
                className={`rounded-full px-4 py-2 transition-all ${
                  activeTab === "meeting"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Live Call & Transcript
              </button>
              <button
                onClick={() => setActiveTab("notes")}
                className={`rounded-full px-4 py-2 transition-all ${
                  activeTab === "notes"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                AI Generated Summary
              </button>
            </div>

            <a
              href="#signup"
              className="inline-flex items-center rounded-full bg-[#0B5CFF] hover:bg-[#004BDE] text-white px-6 py-2.5 text-sm font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
            >
              Explore My Notes
            </a>
          </div>
        </div>

        {/* Scenic Container with Mountain Backdrop */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 aspect-[16/10] sm:aspect-[16/9] min-h-[520px] flex items-center justify-center p-4 sm:p-8">
          {/* Background Mountain Photo */}
          <Image
            src="/images/landing/mountain_backdrop.jpg"
            alt="Scenic Mountain Range"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/15 backdrop-blur-[1px]" />

          {/* Interactive Mode 1: Live Meeting & Transcript Sidebar */}
          {activeTab === "meeting" && (
            <div className="relative z-10 w-full max-w-5xl rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden text-white flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">
              {/* Left: Video Grid */}
              <div className="flex-1 p-4 sm:p-5 flex flex-col">
                {/* Meeting Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold text-white">Q3 Marketing Kickoff</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-mono">
                      REC 00:11:21
                    </span>
                    <Share2 className="h-3.5 w-3.5 cursor-pointer" />
                  </div>
                </div>

                {/* 4 Participant Tiles */}
                <div className="grid grid-cols-2 gap-3 flex-1 my-3 min-h-[220px]">
                  <div className="relative rounded-xl overflow-hidden bg-zinc-800 border-2 border-emerald-500 shadow-md">
                    <Image
                      src="/images/landing/call_center_agent.jpg"
                      alt="Aisha Bowman"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[11px] font-medium backdrop-blur-xs flex items-center gap-1">
                      <Mic className="h-3 w-3 text-emerald-400" /> Aisha Bowman (Speaking)
                    </div>
                  </div>

                  <div className="relative rounded-xl overflow-hidden bg-zinc-800 border border-white/10">
                    <Image
                      src="/images/landing/webinar_speaker.jpg"
                      alt="Elena Vance"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[11px] font-medium backdrop-blur-xs">
                      Elena Vance
                    </div>
                  </div>

                  <div className="relative rounded-xl overflow-hidden bg-zinc-800 border border-white/10">
                    <Image
                      src="/images/landing/conference_room.jpg"
                      alt="Owen Hale"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[11px] font-medium backdrop-blur-xs">
                      Owen Hale (Room 4A)
                    </div>
                  </div>

                  <div className="relative rounded-xl overflow-hidden bg-zinc-800 border border-white/10">
                    <Image
                      src="/images/landing/baseball_experience.jpg"
                      alt="Mateo Russo"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[11px] font-medium backdrop-blur-xs">
                      Mateo Russo
                    </div>
                  </div>
                </div>

                {/* Meeting Bottom Bar */}
                <div className="flex items-center justify-center gap-4 pt-2 text-xs">
                  <span className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 cursor-pointer">
                    <Mic className="h-4 w-4 text-emerald-400" />
                  </span>
                  <span className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 cursor-pointer">
                    <Video className="h-4 w-4 text-white" />
                  </span>
                  <span className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 cursor-pointer">
                    <Smile className="h-4 w-4 text-yellow-400" />
                  </span>
                </div>
              </div>

              {/* Right: Floating "My Notes" Live Transcript Sidebar */}
              <div className="w-full md:w-80 bg-white text-slate-800 p-4 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-200">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded bg-purple-600 flex items-center justify-center text-white">
                        <Sparkles className="h-3 w-3" />
                      </div>
                      <span className="font-bold text-xs text-slate-900">
                        [My Note] Q3 Marketing Kickoff
                      </span>
                    </div>
                    <MoreHorizontal className="h-4 w-4 text-slate-400 cursor-pointer" />
                  </div>

                  {/* Transcript Messages */}
                  <div className="mt-3 space-y-3 text-xs overflow-y-auto max-h-[260px] pr-1">
                    <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-bold text-slate-700">Aisha Bowman</span>
                        <span>00:04:18</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        Just a reminder that we still need to follow up on the event theme options from last week.
                      </p>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-bold text-slate-700">Owen Hale</span>
                        <span>00:06:02</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        Yeah, especially the concepts tied to customer stories. Those feel the most promising so far.
                      </p>
                    </div>

                    <div className="rounded-lg bg-blue-50/70 p-2.5 border border-blue-100">
                      <div className="flex items-center justify-between text-[10px] text-blue-500 mb-1">
                        <span className="font-bold text-blue-900">Mateo Russo</span>
                        <span>00:08:41</span>
                      </div>
                      <p className="text-blue-950 leading-relaxed font-medium">
                        I can put together a quick comparison and share recommendations before the next sync.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span>Live AI Sync</span>
                  </div>
                  <button
                    onClick={() => setActiveTab("notes")}
                    className="rounded-full bg-[#0B5CFF] text-white px-3 py-1 text-[11px] font-semibold hover:bg-blue-600 transition-colors"
                  >
                    View Summary →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Mode 2: AI Generated Summary Document (image copy 3.png) */}
          {activeTab === "notes" && (
            <div className="relative z-10 w-full max-w-4xl rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-200 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
              {/* Note Header */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 mb-5 gap-3">
                <div>
                  <h3 className="text-2xl font-bold text-slate-950">
                    [My Note] Q3 Marketing Kickoff
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="rounded-md bg-slate-100 text-slate-600 px-2 py-0.5 text-xs font-medium">
                      Manual notes
                    </span>
                    <span className="rounded-md bg-blue-50 text-[#0B5CFF] px-2 py-0.5 text-xs font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Transcript Verified
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">Auto-saved</span>
                </div>
              </div>

              {/* Note Document Content */}
              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-1.5">
                    Discussion Highlights
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <strong className="text-slate-900">Focus Area:</strong> Revisiting event theme options introduced in a previous meeting.
                    </li>
                    <li>
                      <strong className="text-slate-900">Key Exploration:</strong> Which theme directions feel strongest for moving forward.
                    </li>
                    <li>
                      <strong className="text-slate-900">Emerging Interest:</strong> Customer stories and real-world use cases stood out.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-1.5">
                    Ideas Generated
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <strong className="text-slate-900">Customer Storytelling Theme:</strong> Emphasizes authenticity and engagement.
                    </li>
                    <li>
                      <strong className="text-slate-900">Real-World Use Cases:</strong> Highlights impact and practical relevance.
                    </li>
                    <li>
                      <strong className="text-slate-900">Hybrid Approach:</strong> Combines storytelling with tangible results for broader appeal.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-1.5">
                    Follow-Up Plans
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <strong className="text-slate-900">Next Discussion:</strong> Align on a preferred event theme.
                    </li>
                    <li>
                      <strong className="text-slate-900">Goal:</strong> Confirm direction to support Q3 objectives and ensure a strong foundation.
                    </li>
                    <li>
                      <strong className="text-slate-900">Outcome:</strong> A unified theme approach that aligns with overall marketing goals.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Note Bottom Toolbar */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 px-3.5 py-1.5 text-xs font-semibold transition-colors">
                    <Sparkles className="h-3.5 w-3.5" />
                    Regenerate
                  </button>
                  <div className="flex items-center gap-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 text-xs font-semibold cursor-pointer">
                    <span>Template: Short brainstorm</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("meeting")}
                  className="text-xs text-[#0B5CFF] font-semibold hover:underline"
                >
                  ← Back to live call
                </button>
              </div>
            </div>
          )}

          {/* Pause / Play indicator at bottom-right */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute bottom-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-colors"
            aria-label="Pause animation"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </section>
  );
}
