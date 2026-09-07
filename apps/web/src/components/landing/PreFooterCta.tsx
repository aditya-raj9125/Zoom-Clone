"use client";

import React from "react";
import Link from "next/link";

export function PreFooterCta() {
  return (
    <section className="py-24 bg-white text-center border-t border-slate-100">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl sm:text-6xl font-extrabold text-[#020B27] tracking-tight leading-tight">
          See what Zoom can do for your business
        </h2>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full bg-[#0B5CFF] hover:bg-[#004BDE] text-white px-8 py-3.5 text-base font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
          >
            Get started today
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full bg-[#EBF2FF] hover:bg-[#D6E6FF] text-[#0B5CFF] px-8 py-3.5 text-base font-semibold transition-all hover:scale-105 active:scale-95"
          >
            Find your plan
          </Link>
        </div>
      </div>
    </section>
  );
}
