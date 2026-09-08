"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative bg-transparent pt-4 pb-8 sm:pt-8 sm:pb-12 text-white text-center">
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-white max-w-3xl mx-auto leading-[1.15]">
          Find out what&apos;s possible when work connects
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-blue-100/90 max-w-xl mx-auto font-normal leading-relaxed">
          Bridge the gap between talking and doing with the AI-first work platform built for you.
        </p>

        {/* Call to Actions */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
          <a
            href="#carousel"
            className="inline-flex items-center justify-center rounded-xl bg-[#00053D] hover:bg-[#000325] text-white border border-white/20 px-7 py-3 text-sm font-semibold shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            Explore products
          </a>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-xl bg-white hover:bg-slate-100 text-[#00053D] px-7 py-3 text-sm font-semibold shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            Find your plan
          </Link>
        </div>
      </div>
    </section>
  );
}
