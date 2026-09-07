"use client";

import React from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export function CustomerStoriesSection() {
  return (
    <section className="py-20 bg-slate-50 border-t border-slate-100 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-[#0B5CFF] mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0B5CFF]" />
            Customer stories
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#020B27] tracking-tight">
            Businesses achieve more with Zoom
          </h2>
        </div>

        {/* Stories Horizontal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Main Card: MLB (Col span 7) */}
          <div className="md:col-span-7 rounded-3xl overflow-hidden shadow-xl relative min-h-[400px] flex flex-col justify-between p-8 text-white group cursor-pointer">
            <Image
              src="/images/landing/baseball_experience.jpg"
              alt="Major League Baseball"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />

            {/* MLB Logo & Tag */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="rounded-xl bg-white/20 backdrop-blur-md px-3 py-1.5 text-xs font-black tracking-widest text-white border border-white/20">
                ⚾ MLB™
              </div>
              <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-slate-900 transition-colors">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Major League Baseball™ and Zoom expand the employee–fan experience
              </h3>
              <p className="mt-2 text-sm text-slate-200 line-clamp-2">
                Empowering umpires with replay video review and bringing real-time broadcast connectivity to millions of fans.
              </p>
            </div>
          </div>

          {/* Secondary Card: Global Talent (Col span 5) */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <div className="flex-1 rounded-3xl overflow-hidden shadow-lg relative min-h-[190px] flex flex-col justify-end p-6 text-white group cursor-pointer">
              <Image
                src="/images/landing/webinar_speaker.jpg"
                alt="Global Talent"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#00052D]/90 via-[#00052D]/40 to-transparent" />
              <div className="relative z-10">
                <span className="text-xs uppercase tracking-wider text-blue-300 font-bold">
                  Global Talent Story
                </span>
                <h4 className="text-lg font-bold text-white leading-snug mt-1">
                  How Cricut scaled global operations and hybrid creative collaboration
                </h4>
              </div>
            </div>

            <div className="flex-1 rounded-3xl overflow-hidden shadow-lg relative min-h-[190px] flex flex-col justify-end p-6 text-white group cursor-pointer">
              <Image
                src="/images/landing/conference_room.jpg"
                alt="Enterprise Financial Communications"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B2B7A]/90 via-[#0B2B7A]/40 to-transparent" />
              <div className="relative z-10">
                <span className="text-xs uppercase tracking-wider text-blue-200 font-bold">
                  Financial Services
                </span>
                <h4 className="text-lg font-bold text-white leading-snug mt-1">
                  Capital One accelerates cloud contact center innovation with Zoom
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
