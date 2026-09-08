"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

export function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="w-full bg-[#0F3596] px-4 pt-3 pb-2 transition-all duration-300">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4 rounded-full bg-white/10 px-5 py-2 text-white shadow-inner backdrop-blur-md border border-white/15 text-xs sm:text-sm">
        <div className="flex flex-1 items-center justify-center gap-3 text-center sm:text-left flex-wrap">
          <span className="font-normal text-slate-100">
            AI note taking across platforms that&apos;s secure, personalized, and under your control.
          </span>
          <a
            href="#my-notes"
            className="inline-flex items-center rounded-full bg-gradient-to-r from-[#D82C84] to-[#9B2282] px-3.5 py-1 text-xs font-semibold text-white transition-all hover:shadow-md hover:scale-105 active:scale-95"
          >
            Explore My Notes
          </a>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="rounded-full p-1 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
