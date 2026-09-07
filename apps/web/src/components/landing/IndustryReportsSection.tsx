"use client";

import React from "react";
import Image from "next/image";
import { Award, ExternalLink } from "lucide-react";

export function IndustryReportsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Gartner Leader 7th Year in a Row */}
          <div className="flex flex-col justify-between rounded-3xl bg-gradient-to-b from-[#0B2B7A] to-[#00052D] p-8 text-white shadow-xl border border-blue-900/30 transition-all hover:shadow-2xl">
            <div>
              {/* Laurel Wreath Badge */}
              <div className="flex flex-col items-center justify-center text-center py-6">
                <div className="relative flex items-center justify-center">
                  <Award className="h-16 w-16 text-blue-300/80 stroke-[1.2]" />
                </div>
                <h4 className="text-xl font-bold text-slate-100 tracking-wider mt-2">
                  Gartner.
                </h4>
                <p className="text-xs uppercase font-extrabold tracking-widest text-blue-200 mt-1">
                  LEADER
                </p>
                <p className="text-[11px] font-semibold text-blue-300">
                  7th YEAR IN A ROW
                </p>
              </div>

              <h3 className="text-xl font-bold leading-snug mt-6 text-white">
                See why Zoom is a Leader in the 2026 Gartner® Magic Quadrant™ for UCaaS
              </h3>
            </div>

            <div className="pt-8">
              <a
                href="#report-ucaas"
                className="inline-flex items-center justify-center rounded-full bg-[#0B5CFF] hover:bg-[#004BDE] text-white px-6 py-2.5 text-xs font-semibold shadow-md transition-all hover:scale-105"
              >
                Read the report
              </a>
            </div>
          </div>

          {/* Card 2: Gartner CCaaS Voice of Customer */}
          <div className="flex flex-col justify-between rounded-3xl overflow-hidden shadow-xl border border-slate-200 relative group transition-all hover:shadow-2xl">
            {/* Background Image */}
            <div className="relative h-64 w-full">
              <Image
                src="/images/landing/call_center_agent.jpg"
                alt="Gartner Voice of the Customer for CCaaS"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#00052D] via-[#00052D]/40 to-transparent" />
            </div>

            <div className="flex-1 bg-[#00052D] p-8 pt-0 text-white flex flex-col justify-between">
              <h3 className="text-xl font-bold leading-snug text-white mt-2">
                Zoom recognized in the 2026 Gartner Voice of the Customer for CCaaS
              </h3>

              <div className="pt-8">
                <a
                  href="#report-ccaas"
                  className="inline-flex items-center justify-center rounded-full bg-[#0B5CFF] hover:bg-[#004BDE] text-white px-6 py-2.5 text-xs font-semibold shadow-md transition-all hover:scale-105"
                >
                  Explore the report
                </a>
              </div>
            </div>
          </div>

          {/* Card 3: Frost Radar Visionary Leaders */}
          <div className="flex flex-col justify-between rounded-3xl bg-white p-8 shadow-xl border-2 border-blue-400/40 transition-all hover:shadow-2xl">
            <div>
              <div className="text-center text-xs font-extrabold tracking-wider text-slate-500 mb-2">
                FROST RADAR™
              </div>

              {/* Circular Radar Diagram Mockup */}
              <div className="relative aspect-square max-w-[220px] mx-auto my-3 rounded-full border-2 border-blue-200 bg-blue-50/30 flex items-center justify-center p-3">
                {/* Quadrant Lines */}
                <div className="absolute inset-x-0 top-1/2 h-[1px] bg-blue-200" />
                <div className="absolute inset-y-0 left-1/2 w-[1px] bg-blue-200" />
                
                {/* Quadrant Labels */}
                <span className="absolute top-2 left-2 text-[9px] font-bold text-slate-400 uppercase">
                  Growth Champions
                </span>
                <span className="absolute top-2 right-2 text-[9px] font-bold text-blue-700 uppercase">
                  Visionary Leaders
                </span>
                <span className="absolute bottom-2 left-2 text-[9px] font-bold text-slate-400 uppercase">
                  Contenders
                </span>
                <span className="absolute bottom-2 right-2 text-[9px] font-bold text-slate-400 uppercase">
                  Innovators
                </span>

                {/* Zoom Position Dot in Visionary Leaders Quadrant */}
                <div className="absolute top-[32%] right-[32%] flex items-center gap-1">
                  <span className="h-3 w-3 rounded-full bg-[#0B5CFF] ring-4 ring-blue-400/40 animate-pulse" />
                  <span className="text-[11px] font-bold text-[#0B5CFF]">zoom</span>
                </div>
              </div>

              <p className="text-center text-xs text-slate-500 mt-3 font-medium">
                Zoom positioned in the Visionary Leaders quadrant for unified communications and AI-first workspace.
              </p>
            </div>

            <div className="pt-6">
              <a
                href="#report-frost"
                className="inline-flex items-center justify-center rounded-full bg-[#0B5CFF] hover:bg-[#004BDE] text-white px-6 py-2.5 text-xs font-semibold shadow-md transition-all hover:scale-105"
              >
                Read the report
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
