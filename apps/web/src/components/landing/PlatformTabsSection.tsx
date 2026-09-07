"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, ArrowRight, MousePointer2 } from "lucide-react";

interface TabData {
  id: string;
  label: string;
  bullets: { title: string; desc: string }[];
  ctaText: string;
  pills: string[];
  imageSrc: string;
}

export function PlatformTabsSection() {
  const [activeTab, setActiveTab] = useState("support");

  const tabs: TabData[] = [
    {
      id: "collab",
      label: "Collaboration",
      ctaText: "Explore collaboration",
      imageSrc: "/images/landing/conference_room.jpg",
      bullets: [
        {
          title: "All-in-one workspace",
          desc: "Seamlessly transition between video meetings, team chat channels, and whiteboards.",
        },
        {
          title: "Continuous conversation",
          desc: "Keep project momentum going with persistent group discussions before, during, and after meetings.",
        },
        {
          title: "Intelligent summarization",
          desc: "Catch up on missed discussions with AI-generated threads and action item assignments.",
        },
        {
          title: "Cross-functional hubs",
          desc: "Centralize documentation, video recordings, and shared assets for entire departments.",
        },
      ],
      pills: [
        "✨ Smart meeting summary",
        "✨ Action item extraction",
        "✨ Chat channel sync",
        "✨ Collaborative whiteboard",
      ],
    },
    {
      id: "support",
      label: "Customer support",
      ctaText: "Explore customer support",
      imageSrc: "/images/landing/call_center_agent.jpg",
      bullets: [
        {
          title: "One platform, full context",
          desc: "Phone, chat, email, SMS, social, and video unified in a single view.",
        },
        {
          title: "Smarter automation",
          desc: "Virtual Agent handles multi-intent questions, so human agents can focus on high-value cases.",
        },
        {
          title: "Better self-service",
          desc: "Instant answers and proactive resolutions cut friction and drive customer loyalty.",
        },
        {
          title: "AI-powered support",
          desc: "Real-time suggestions, key action highlights, and task automation keep agents sharp.",
        },
        {
          title: "Get more from your data",
          desc: "CRM integration, real-time analytics, and conversation insights surface trends and improve CX.",
        },
      ],
      pills: [
        "✨ Automatic Q&A",
        "✨ Automatic call routing",
        "✨ Meet with an agent",
        "✨ Automatic appointment scheduling",
      ],
    },
    {
      id: "marketing",
      label: "Marketing",
      ctaText: "Explore marketing",
      imageSrc: "/images/landing/webinar_speaker.jpg",
      bullets: [
        {
          title: "Engage massive audiences",
          desc: "Host interactive webinars and hybrid events with up to 250,000 attendees.",
        },
        {
          title: "Brand customization",
          desc: "Deliver memorable on-brand event stages, virtual reception spaces, and breakout sessions.",
        },
        {
          title: "Actionable lead data",
          desc: "Connect audience engagement analytics directly with Marketo, HubSpot, and Salesforce.",
        },
      ],
      pills: [
        "✨ Event engagement metrics",
        "✨ Live Q&A moderation",
        "✨ Studio-grade broadcasts",
      ],
    },
    {
      id: "sales",
      label: "Sales",
      ctaText: "Explore sales",
      imageSrc: "/images/landing/conference_room.jpg",
      bullets: [
        {
          title: "Accelerate deal cycles",
          desc: "Turn customer calls into closed revenue with real-time conversational intelligence.",
        },
        {
          title: "Automated CRM logging",
          desc: "Sync call notes, sentiment signals, and next steps to Salesforce automatically.",
        },
        {
          title: "Rep coaching at scale",
          desc: "Identify objection handling techniques and playbook adherence with AI scorecards.",
        },
      ],
      pills: [
        "✨ Real-time deal signals",
        "✨ Sentiment analysis",
        "✨ Auto CRM syncing",
      ],
    },
    {
      id: "engagement",
      label: "Employee engagement",
      ctaText: "Explore employee engagement",
      imageSrc: "/images/landing/call_center_agent.jpg",
      bullets: [
        {
          title: "Foster culture anywhere",
          desc: "Keep distributed and hybrid teams connected with company-wide townhalls and video clips.",
        },
        {
          title: "Personalized workspace",
          desc: "Modern digital signage, flexible desk reservation, and interactive visitor kiosks.",
        },
        {
          title: "Employee wellness",
          desc: "AI insights highlight team burnout indicators and encourage healthy meeting schedules.",
        },
      ],
      pills: [
        "✨ Hybrid desk reservation",
        "✨ Company all-hands broadcast",
        "✨ Digital signage",
      ],
    },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[1];

  return (
    <section id="platform-tabs" className="py-20 bg-slate-50/50 border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#020B27] tracking-tight">
            One platform. Endless ways to work together.
          </h2>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-14">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-white text-[#0B5CFF] shadow-sm border-2 border-[#0B5CFF]"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Bullet Highlights */}
          <div className="lg:col-span-6 space-y-6">
            <ul className="space-y-4">
              {currentTab.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-[#0B5CFF] mt-2 shrink-0" />
                  <div className="text-sm sm:text-base leading-relaxed text-slate-700">
                    <strong className="text-slate-950 font-bold">{bullet.title}: </strong>
                    <span>{bullet.desc}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <a
                href="#contact-sales"
                className="inline-flex items-center gap-2 rounded-full bg-[#0B5CFF] hover:bg-[#004BDE] text-white px-7 py-3 text-sm font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
              >
                <span>{currentTab.ctaText}</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Right Column: Interactive UI Visual with Floating Feature Pills */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-zinc-900 border border-slate-200 aspect-[4/3] flex items-center justify-center">
              <Image
                src={currentTab.imageSrc}
                alt={currentTab.label}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />

              {/* Floating Feature Pills (matching image copy 10.png) */}
              <div className="absolute top-6 left-6 z-20">
                <span className="rounded-full bg-black/60 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white border border-white/20 shadow-lg flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-blue-300" />
                  {currentTab.pills[0]}
                </span>
              </div>

              {currentTab.pills[1] && (
                <div className="absolute bottom-10 left-8 z-20">
                  <span className="rounded-full bg-black/60 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white border border-white/20 shadow-lg flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-emerald-300" />
                    {currentTab.pills[1]}
                  </span>
                </div>
              )}

              {/* Center Glowing CTA Pill with Cursor */}
              {currentTab.pills[2] && (
                <div className="absolute top-1/2 right-12 -translate-y-1/2 z-20 flex items-center gap-2">
                  <div className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-2xl border border-white/30 flex items-center gap-2 animate-pulse">
                    <Sparkles className="h-4 w-4" />
                    {currentTab.pills[2]}
                  </div>
                  <MousePointer2 className="h-5 w-5 text-white fill-black drop-shadow-md animate-bounce" />
                </div>
              )}

              {currentTab.pills[3] && (
                <div className="absolute bottom-4 right-6 z-20">
                  <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white border border-white/15 shadow-lg flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-purple-300" />
                    {currentTab.pills[3]}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
