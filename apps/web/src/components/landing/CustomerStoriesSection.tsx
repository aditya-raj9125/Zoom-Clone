"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

interface CustomerStory {
  id: string;
  brandName: string;
  imageSrc: string;
  title: string;
  quote: string;
  author: string;
  renderLogo: (collapsed: boolean) => React.ReactNode;
}

export function CustomerStoriesSection() {
  // Start with MLB (or first item) expanded by default
  const [activeId, setActiveId] = useState<string>("mlb");

  const stories: CustomerStory[] = [
    {
      id: "mlb",
      brandName: "Major League Baseball",
      imageSrc: "/assets/landing/customer-stories/baseball-club-bg-n.jpg",
      title: "Major League Baseball™ and Zoom expand the employee–fan experience",
      quote:
        "“Zoom has allowed us to continue a tradition of really being a technology-focused company and making sure that we are using cutting-edge technology not only to advance our business but also for our fans.”",
      author: "- Noah Garden, Chief Revenue Officer",
      renderLogo: (collapsed) => (
        <div className={`flex items-center transition-all ${collapsed ? "scale-90" : "scale-100"}`}>
          {/* MLB Classic Batter Silhouette Logo */}
          <div className="rounded-lg bg-white/20 backdrop-blur-md px-3 py-1.5 border border-white/25 flex items-center gap-1.5 shadow-sm">
            <svg viewBox="0 0 60 36" className="h-5 w-auto fill-white">
              <rect width="60" height="36" rx="8" fill="rgba(255,255,255,0.25)" />
              <circle cx="20" cy="14" r="3.5" fill="white" />
              <path d="M26 12l-7 4v12h4v-7l3-2 3 9h4V16l-4-4z" fill="white" />
            </svg>
            <span className="text-xs font-black tracking-widest text-white uppercase">MLB™</span>
          </div>
        </div>
      ),
    },
    {
      id: "shareco",
      brandName: "TheShareCo",
      imageSrc: "/assets/landing/customer-stories/share-bg.jpg",
      title: "Advancing mental wellness through TheShareCo’s journey with Zoom Video SDK",
      quote:
        "“Zoom Video SDKs full flexibility in layout customization allowed us to achieve a real-life experience within the limited real estate presented by a phone or smart device.”",
      author: "- Tan Han Sing, Founder and CEO, TheShareCo",
      renderLogo: (collapsed) => (
        <div className={`flex items-center transition-all ${collapsed ? "scale-90" : "scale-100"}`}>
          {/* TheShareCo Distinctive Spiral / Swirl Brand Icon */}
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 36 36" className="h-7 w-7 text-white" fill="none">
              <path
                d="M18 4C10.268 4 4 10.268 4 18c0 4.5 2.1 8.5 5.4 11.1L12 26a10 10 0 0 1-2-6c0-5.5 4.5-10 10-10s10 4.5 10 10a10 10 0 0 1-5 8.7V32a14 14 0 0 0 11-14c0-7.732-6.268-14-14-14z"
                fill="currentColor"
              />
              <path
                d="M18 10a8 8 0 0 0-8 8c0 2.2.9 4.2 2.3 5.7l2.8-2.8A4 4 0 0 1 14 18c0-2.2 1.8-4 4-4s4 1.8 4 4a4 4 0 0 1-1.2 2.8l2.8 2.8A8 8 0 0 0 26 18a8 8 0 0 0-8-8z"
                fill="currentColor"
              />
            </svg>
            {!collapsed && (
              <span className="text-base font-bold text-white tracking-tight">TheShareCo</span>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "cricut",
      brandName: "Cricut",
      imageSrc: "/assets/landing/customer-stories/cricut-bg.jpg",
      title: "Cricut slashed call abandonment rates by 90% with Zoom",
      quote:
        "“Before Zoom, we juggled 10-plus tabs to handle calls. Now, everything is integrated into one clean platform, from CRM connections to video transitions. It is a dream workflow.”",
      author: "- Taylor Nelson, Member Care QA Specialist",
      renderLogo: (collapsed) => (
        <div className={`flex items-center transition-all ${collapsed ? "scale-90" : "scale-100"}`}>
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
            cricut<span className="text-emerald-400">.</span>
          </span>
        </div>
      ),
    },
    {
      id: "capital-one",
      brandName: "Capital One",
      imageSrc: "/assets/landing/customer-stories/capital-one-bg.jpg",
      title: "A connected, collaborative workforce drives innovation at Capital One",
      quote:
        "“We are highly collaborative, we are people-centered, we are interested in moving ourselves and our goals to the next level. Zoom is, I believe, the ideal tool to suit the culture that we are and that we strive to be at Capital One.”",
      author: "- Nikita Steals, VP, Tech Talent Acquisition, Capital One",
      renderLogo: (collapsed) => (
        <div className={`flex items-center transition-all ${collapsed ? "scale-85" : "scale-100"}`}>
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-extrabold italic text-white tracking-wider flex items-center">
              Capital<span className="font-medium not-italic ml-1 text-slate-100">One</span>
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-[#0B5CFF] mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0B5CFF]" />
            Customer stories
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#020B27] tracking-tight">
            Businesses achieve more with Zoom
          </h2>
        </div>

        {/* Accordion Expanding Cards Showcase */}
        <div className="flex flex-col md:flex-row gap-4 h-auto md:h-[540px] lg:h-[580px] w-full items-stretch">
          {stories.map((story) => {
            const isExpanded = story.id === activeId;

            return (
              <div
                key={story.id}
                onMouseEnter={() => setActiveId(story.id)}
                onClick={() => setActiveId(story.id)}
                className={`relative rounded-3xl overflow-hidden shadow-xl cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-[flex,width] ${
                  isExpanded
                    ? "flex-[4.5] md:flex-[4.5] min-h-[460px] md:min-h-0"
                    : "flex-[1] md:flex-[1] min-h-[120px] md:min-h-0 opacity-90 hover:opacity-100"
                }`}
              >
                {/* Background Image */}
                <Image
                  src={story.imageSrc}
                  alt={story.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  priority={story.id === "mlb" || story.id === "shareco"}
                />

                {/* Ambient Dark Gradient Overlays */}
                <div
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    isExpanded
                      ? "bg-gradient-to-t from-black/90 via-black/45 to-black/35"
                      : "bg-black/55 backdrop-blur-[0.5px]"
                  }`}
                />

                {/* Collapsed State: Centered Brand Logo */}
                {!isExpanded && (
                  <div className="absolute inset-0 flex items-center justify-center p-4 z-10 transition-opacity duration-300">
                    <div className="rotate-0 md:-rotate-90 md:whitespace-nowrap transition-transform duration-500">
                      {story.renderLogo(true)}
                    </div>
                  </div>
                )}

                {/* Expanded State: Full Story Details */}
                {isExpanded && (
                  <div className="relative z-10 h-full w-full flex flex-col justify-between p-6 sm:p-10 text-white animate-in fade-in duration-500">
                    {/* Top: Brand Logo */}
                    <div>{story.renderLogo(false)}</div>

                    {/* Middle: Headline */}
                    <div className="my-auto py-4">
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight max-w-2xl drop-shadow-sm">
                        {story.title}
                      </h3>
                    </div>

                    {/* Bottom: Quote, Author, and Action Button */}
                    <div className="flex items-end justify-between gap-4 pt-2">
                      <div className="max-w-xl">
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                          {story.quote}
                        </p>
                        <p className="mt-3 text-xs sm:text-sm font-semibold text-white">
                          {story.author}
                        </p>
                      </div>

                      {/* Circular Jump CTA Button */}
                      <div className="shrink-0">
                        <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-[#0B5CFF] hover:bg-[#004BDC] text-white flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110 active:scale-95">
                          <ArrowUpRight className="h-5 w-5 stroke-[2.5]" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
