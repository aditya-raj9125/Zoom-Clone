"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0F3596] via-[#1546BE] to-[#1D5CE5] pt-16 pb-12 sm:pt-24 sm:pb-20 text-white text-center">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[550px] bg-blue-400/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-purple-400/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          Find out what&apos;s possible when work connects
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-blue-100/90 max-w-2xl mx-auto font-normal leading-relaxed">
          Bridge the gap between talking and doing with the AI-first work platform built for you.
        </p>

        {/* Call to Actions */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#carousel"
            className="inline-flex items-center justify-center rounded-full bg-[#0A2266] hover:bg-[#081B52] text-white border border-white/25 px-8 py-3.5 text-sm sm:text-base font-semibold shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            Explore products
          </a>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-900 px-8 py-3.5 text-sm sm:text-base font-semibold shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            Find your plan
          </Link>
        </div>
      </div>
    </section>
  );
}
