"use client";

import React, { useState } from "react";
import { Star, Pause, Play } from "lucide-react";

export function SocialProofSection() {
  const [isPaused, setIsPaused] = useState(false);

  const logos = [
    { name: "Walmart", symbol: "Walmart ✻" },
    { name: "Werner", symbol: "WERNER ENTERPRISES" },
    { name: "Moffitt", symbol: "MOFFITT CANCER CENTER" },
    { name: "ExxonMobil", symbol: "ExxonMobil" },
    { name: "Capital One", symbol: "Capital One" },
    { name: "Formula 1", symbol: "FORMULA 1®" },
  ];

  return (
    <section className="py-16 bg-white border-t border-slate-100 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <h3 className="text-center text-xl sm:text-2xl font-bold text-[#020B27] mb-10">
          Trusted by millions. Built for you.
        </h3>

        {/* Continuous Logo Marquee Container */}
        <div className="relative flex items-center justify-between border-y border-slate-100 py-6 overflow-hidden">
          <div
            className={`flex items-center gap-16 whitespace-nowrap animate-marquee ${
              isPaused ? "animate-marquee-paused" : ""
            }`}
          >
            {[...logos, ...logos, ...logos].map((logo, idx) => (
              <span
                key={idx}
                className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-700 hover:text-slate-950 transition-colors uppercase cursor-default"
              >
                {logo.symbol}
              </span>
            ))}
          </div>

          {/* Pause / Play Toggle for Marquee */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="absolute right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            aria-label="Pause marquee"
          >
            {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* 3 Rating Statistics Columns with Dividers */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Rating 1: Gartner Peer Insights */}
          <div className="pt-6 md:pt-0 md:px-6 flex flex-col items-center">
            <span className="text-4xl font-extrabold text-[#020B27]">4.5/5</span>
            <div className="flex items-center gap-1 my-2 text-slate-900">
              {[...Array(4)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-slate-900 text-slate-900" />
              ))}
              <Star className="h-4 w-4 fill-slate-400 text-slate-400" />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              out of 7.9k+ reviews
            </span>
            <span className="mt-3 text-sm font-bold text-slate-700 tracking-wide">
              Gartner Peer Insights™
            </span>
          </div>

          {/* Rating 2: G2 */}
          <div className="pt-6 md:pt-0 md:px-6 flex flex-col items-center">
            <span className="text-4xl font-extrabold text-[#020B27]">4.6/5</span>
            <div className="flex items-center gap-1 my-2 text-slate-900">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-slate-900 text-slate-900" />
              ))}
            </div>
            <span className="text-xs text-slate-500 font-medium">
              out of 54.9k+ reviews
            </span>
            <span className="mt-3 text-base font-extrabold text-[#FF492C] flex items-center gap-1">
              <span className="rounded bg-[#FF492C] text-white px-1 py-0.2 text-xs font-black">G2</span>
            </span>
          </div>

          {/* Rating 3: TrustRadius */}
          <div className="pt-6 md:pt-0 md:px-6 flex flex-col items-center">
            <span className="text-4xl font-extrabold text-[#020B27]">8.5/10</span>
            <div className="flex items-center gap-1 my-2 text-slate-900">
              {[...Array(4)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-slate-900 text-slate-900" />
              ))}
              <Star className="h-4 w-4 fill-slate-400 text-slate-400" />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              out of 5.8k+ reviews
            </span>
            <span className="mt-3 text-sm font-bold text-slate-700 tracking-wide flex items-center gap-1">
              <span className="text-[#0B5CFF] font-black">TR</span> TrustRadius
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
