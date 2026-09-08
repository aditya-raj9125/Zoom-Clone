"use client";

import React from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export function WhatsNewSection() {
  return (
    <section className="py-12 sm:py-16 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-[#0B5CFF] mb-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0B5CFF]" />
            What&apos;s new
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#020B27] tracking-tight">
            Making news, making impact
          </h2>
        </div>

        {/* 4-Card Bento Grid - Compact Proportions */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 items-stretch">
          {/* Card 1: Meet My Notes (Col span 4) */}
          <div className="md:col-span-4 h-auto md:h-[420px] rounded-3xl bg-[#0B5CFF] text-white p-6 pb-0 flex flex-col justify-between shadow-xl relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all">
            <div>
              <h3 className="text-lg sm:text-xl font-bold leading-snug text-white">
                Meet My Notes:
                <br />
                Your new AI note taker
              </h3>
              <p className="mt-2 text-xs sm:text-[13px] text-white/90 leading-relaxed">
                Capture insights from your conversations on Zoom, in person, and across third-party platforms.
              </p>
            </div>

            {/* Note Visual Illustration Sitting Flush at Bottom */}
            <div className="relative h-48 sm:h-52 w-full mt-auto">
              <Image
                src="/assets/landing/whats-new/whats-new-my-notes.webp"
                alt="Meet My Notes AI note taker"
                fill
                className="object-contain object-bottom transition-transform duration-500 group-hover:scale-105"
                priority
              />
              <div className="absolute bottom-4 right-4 z-10">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-md transition-transform group-hover:scale-110 active:scale-95">
                  <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Emmy Award (Col span 4) */}
          <div className="md:col-span-4 h-auto md:h-[420px] rounded-3xl bg-[#0B5CFF] text-white p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all">
            <div>
              <h3 className="text-lg sm:text-xl font-bold leading-snug text-white">
                Zoom wins Emmy for Engineering, Science & Technology
              </h3>
              <p className="mt-2 text-xs sm:text-[13px] text-white/90 leading-relaxed">
                From remote work to broadcast technology, Zoom is changing how the world connects.{" "}
                <span className="text-[10px] opacity-80 uppercase tracking-widest font-mono">©ATAS/NATAS</span>
              </p>
            </div>

            {/* Emmy Statue Graphic */}
            <div className="relative h-44 sm:h-48 w-full my-auto flex items-center justify-center">
              <Image
                src="/assets/landing/whats-new/Award-image.svg"
                alt="Emmy Award Statuette"
                fill
                className="object-contain transition-transform duration-500 group-hover:scale-105"
                priority
              />
            </div>

            <div className="flex justify-end">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-[#004BDC] text-white border border-white/20 flex items-center justify-center shadow-md transition-transform group-hover:scale-110 active:scale-95">
                <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Column 3: 2 Compact Stacked Cards (Col span 4) */}
          <div className="md:col-span-4 flex flex-col justify-between gap-4 md:h-[420px]">
            {/* Card 3: Eric Yuan on AI */}
            <div className="flex-1 rounded-3xl bg-[#0B5CFF] text-white p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all">
              <div>
                <h3 className="text-base sm:text-lg font-bold leading-snug text-white">
                  Eric Yuan on accessible AI: Include AI tools for business
                </h3>
                <p className="mt-2 text-xs sm:text-[13px] text-white/90 leading-relaxed">
                  Zoom CEO, Eric Yuan, discusses how Zoom is making AI available at no extra cost.
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-md transition-transform group-hover:scale-110 active:scale-95">
                  <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                </div>
              </div>
            </div>

            {/* Card 4: Leader for UCaaS */}
            <div className="flex-1 rounded-3xl bg-[#0B5CFF] text-white p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all">
              <div>
                <h3 className="text-base sm:text-lg font-bold leading-snug text-white">
                  Recognized as a Leader for UCaaS for the seventh consecutive year
                </h3>
                <p className="mt-2 text-xs sm:text-[13px] text-white/90 leading-relaxed">
                  See why Zoom is a Leader in the 2026 Gartner® Magic Quadrant™ for UCaaS.
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-md transition-transform group-hover:scale-110 active:scale-95">
                  <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
