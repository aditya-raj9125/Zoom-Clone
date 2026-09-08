"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

export function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="w-full bg-transparent px-4 pt-1 pb-3 transition-all duration-300">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4 rounded-2xl bg-[#0B1744]/70 px-6 py-2.5 text-white shadow-md backdrop-blur-md border border-white/15 text-xs sm:text-sm">
        <div className="flex flex-1 items-center justify-center gap-3 text-center sm:text-left flex-wrap">
          <span className="font-normal text-slate-100">
            AI note taking across platforms that&apos;s secure, personalized, and under your control.
          </span>
          <a
            href="#my-notes"
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-[#0B5CFF] via-[#9B229A] to-[#E9247E] px-4 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-95 hover:shadow-md active:scale-95"
          >
            Explore My Notes
          </a>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="rounded-lg p-1 text-slate-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
