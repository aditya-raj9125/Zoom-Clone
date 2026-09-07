"use client";

import React from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export function WhatsNewSection() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-[#0B5CFF] mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0B5CFF]" />
            What&apos;s new
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#020B27] tracking-tight">
            Making news, making impact
          </h2>
        </div>

        {/* 4-Card Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: Meet My Notes (Col span 4) */}
          <div className="md:col-span-4 rounded-3xl bg-[#0B5CFF] text-white p-7 flex flex-col justify-between shadow-xl relative overflow-hidden group cursor-pointer">
            <div>
              <h3 className="text-2xl font-bold leading-snug">
                Meet My Notes: Your new AI note taker
              </h3>
              <p className="mt-3 text-sm text-blue-100/90 leading-relaxed">
                Capture insights from your conversations on Zoom, in person, and across third-party platforms.
              </p>
            </div>

            {/* Note Preview Visual */}
            <div className="relative mt-6 rounded-2xl bg-white/15 backdrop-blur-md p-4 border border-white/20 text-xs">
              <div className="font-bold text-white mb-1">[My Notes] Q3 Campaign Planning</div>
              <p className="text-blue-100 text-[11px] leading-relaxed">
                The audience definition is a bit too broad, but there&apos;s clear momentum around focusing on digital channels. Focus: Clarify campaign goal.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <div className="h-11 w-11 rounded-full bg-white text-[#0B5CFF] flex items-center justify-center shadow-md transition-transform group-hover:scale-110">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Card 2: Emmy Award (Col span 4) */}
          <div className="md:col-span-4 rounded-3xl bg-[#004BDE] text-white p-7 flex flex-col justify-between shadow-xl relative overflow-hidden group cursor-pointer">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold leading-snug">
                Zoom wins Emmy for Engineering, Science & Technology
              </h3>
              <p className="mt-3 text-sm text-blue-100/90 leading-relaxed">
                From remote work to broadcast technology, Zoom is changing how the world connects. ©ATAS/NATAS
              </p>
            </div>

            {/* Emmy Statue Graphic */}
            <div className="relative h-48 w-full my-4 flex items-center justify-center">
              <Image
                src="/images/landing/emmy_award.jpg"
                alt="Emmy Award Statuette"
                fill
                className="object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="relative z-10 flex justify-end">
              <div className="h-11 w-11 rounded-full bg-[#0B5CFF] text-white flex items-center justify-center shadow-md border border-white/20 transition-transform group-hover:scale-110">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Column 3: 2 Horizontal Cards (Col span 4) */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {/* Card 3: Eric Yuan on AI */}
            <div className="flex-1 rounded-3xl bg-[#0B2B7A] text-white p-7 flex flex-col justify-between shadow-xl group cursor-pointer">
              <div>
                <h3 className="text-xl font-bold leading-snug">
                  Eric Yuan on accessible AI: Include AI tools for business
                </h3>
                <p className="mt-3 text-sm text-blue-100/80 leading-relaxed">
                  Zoom CEO, Eric Yuan, discusses how Zoom is making AI available at no extra cost.
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <div className="h-10 w-10 rounded-full bg-white text-[#0B2B7A] flex items-center justify-center shadow-md transition-transform group-hover:scale-110">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Card 4: Leader for UCaaS */}
            <div className="flex-1 rounded-3xl bg-[#0B5CFF] text-white p-7 flex flex-col justify-between shadow-xl group cursor-pointer">
              <div>
                <h3 className="text-xl font-bold leading-snug">
                  Recognized as a Leader for UCaaS for the seventh consecutive year
                </h3>
                <p className="mt-3 text-sm text-blue-100/80 leading-relaxed">
                  See why Zoom is a Leader in the 2026 Gartner® Magic Quadrant™ for UCaaS.
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <div className="h-10 w-10 rounded-full bg-white text-[#0B5CFF] flex items-center justify-center shadow-md transition-transform group-hover:scale-110">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
