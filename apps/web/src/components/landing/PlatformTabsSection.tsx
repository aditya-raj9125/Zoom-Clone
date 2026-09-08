"use client";

import React, { useState } from "react";
import Image from "next/image";

interface TabData {
  id: string;
  label: string;
  imageSrc: string;
  bullets: { title: string; desc: string }[];
}

export function PlatformTabsSection() {
  const [activeTab, setActiveTab] = useState("collab");

  const tabs: TabData[] = [
    {
      id: "collab",
      label: "Collaboration",
      imageSrc: "/assets/landing/platform-tabs/collaboration.webp",
      bullets: [
        {
          title: "Support hybrid and remote work",
          desc: "Keep global teams engaged with reliable video, chat, documents, and more.",
        },
        {
          title: "Seamless communication",
          desc: "Save time and cut costs with Meetings, Phone, Chat, and more, in one UCaaS platform.",
        },
        {
          title: "Keep workflows moving",
          desc: "From brainstorms to documents, Zoom helps teams cut friction and avoid stalls.",
        },
        {
          title: "Do more with AI",
          desc: "Built-in AI summarizes meetings and automates next steps, while ZoomMate goes further and generates quality assets like decks and docs.",
        },
      ],
    },
    {
      id: "support",
      label: "Customer support",
      imageSrc: "/assets/landing/platform-tabs/customer-support.jpg",
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
          desc: "Instant answers and proactive resolutions cut friction and drive loyalty.",
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
    },
    {
      id: "marketing",
      label: "Marketing",
      imageSrc: "/assets/landing/platform-tabs/marketing.jpg",
      bullets: [
        {
          title: "Keep audiences engaged",
          desc: "Capture leads with branded webinars and events that build pipeline.",
        },
        {
          title: "Deliver stand-out experiences",
          desc: "Host polished, interactive events that reflect your brand.",
        },
        {
          title: "Broader reach and richer insights",
          desc: "Extend every event with virtual and hybrid options.",
        },
        {
          title: "Put busywork on auto-pilot with AI",
          desc: "Automate content, personalize outreach, and analyze performance faster.",
        },
      ],
    },
    {
      id: "sales",
      label: "Sales",
      imageSrc: "/assets/landing/platform-tabs/sales.webp",
      bullets: [
        {
          title: "Make selling easier",
          desc: "Eliminate admin work so reps can focus on building relationships.",
        },
        {
          title: "Boost productivity and win rates",
          desc: "Auto-summarized meetings, suggested follow-ups, and deal insights keep cycles short.",
        },
        {
          title: "Give RevOps deeper visibility",
          desc: "See pipeline insights and competitor trends for confident forecasting.",
        },
        {
          title: "Close with confidence",
          desc: "Agentic AI flags risks, coaches reps, and automates next steps.",
        },
      ],
    },
    {
      id: "engagement",
      label: "Employee engagement",
      imageSrc: "/assets/landing/platform-tabs/employee-engagement.jpg",
      bullets: [
        {
          title: "Foster community in hybrid teams",
          desc: "Get company-wide updates, recognition, and social feeds that connect remote employees.",
        },
        {
          title: "Create immersive experiences",
          desc: "Host interactive all-hands, learning sessions, and celebrations teams love.",
        },
        {
          title: "Communicate on your schedule",
          desc: "Share video updates asynchronously — no extra meetings.",
        },
        {
          title: "Reinforce culture and recognition",
          desc: "Celebrate wins, milestones, and initiatives with rich media and live events.",
        },
        {
          title: "Measure engagement to improve",
          desc: "Track participation with analytics from Events, Clips, and Workvivo.",
        },
      ],
    },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <section id="platform-tabs" className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#020B27] tracking-tight leading-tight">
            One platform.
            <br />
            Endless ways to work together.
          </h2>
        </div>

        {/* Tab Buttons with Rounded Rectangle Borders */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-14">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-2xl px-5 sm:px-6 py-2.5 text-sm sm:text-base font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-white text-slate-900 border-2 border-[#0B5CFF] shadow-xs"
                    : "text-slate-600 hover:text-slate-900 border-2 border-transparent hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Bullets and CTA */}
          <div className="lg:col-span-6 space-y-8">
            <ul className="space-y-4">
              {currentTab.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-slate-900 font-extrabold text-base leading-relaxed">•</span>
                  <div className="text-sm sm:text-base leading-relaxed text-slate-700">
                    <strong className="text-slate-950 font-bold">{bullet.title}: </strong>
                    <span>{bullet.desc}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div>
              <a
                href="#products"
                className="inline-flex items-center justify-center rounded-xl bg-[#0B5CFF] hover:bg-[#004BDC] text-white px-7 py-3 text-sm font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
              >
                Explore products
              </a>
            </div>
          </div>

          {/* Right Column: Visual Image showcase */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 aspect-[16/10] sm:aspect-[4/3] w-full bg-slate-100">
              <Image
                src={currentTab.imageSrc}
                alt={currentTab.label}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
