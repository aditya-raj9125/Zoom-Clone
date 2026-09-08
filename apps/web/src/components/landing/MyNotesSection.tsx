"use client";

import React, { useRef, useState } from "react";
import { Sparkles, Play, Pause } from "lucide-react";

export function MyNotesSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <section id="my-notes" className="py-20 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-md">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                My Notes
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#020B27] tracking-tight">
              Your new AI note taker
            </h2>
          </div>

          {/* Action CTA */}
          <a
            href="#signup"
            className="inline-flex items-center rounded-xl bg-[#0B5CFF] hover:bg-[#004BDE] text-white px-6 py-2.5 text-sm font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
          >
            Explore My Notes
          </a>
        </div>

        {/* Video Showcase Container */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-slate-950 aspect-[16/9] w-full">
          <video
            ref={videoRef}
            src="/assets/landing/my-notes/my-notes.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Video Play / Pause Floating Toggle */}
          <button
            onClick={togglePlay}
            className="absolute bottom-5 right-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>
        </div>
      </div>
    </section>
  );
}
