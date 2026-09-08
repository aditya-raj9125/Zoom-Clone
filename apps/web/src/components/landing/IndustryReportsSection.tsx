"use client";

import React from "react";
import Image from "next/image";

export function IndustryReportsSection() {
  const reports = [
    {
      id: "leader",
      imageSrc: "/assets/landing/reports/leader.webp",
      alt: "See why Zoom is a Leader in the 2026 Gartner Magic Quadrant for UCaaS",
      btnText: "Read the report",
      href: "#report-ucaas",
    },
    {
      id: "voice-of-customer",
      imageSrc: "/assets/landing/reports/zoom-recognized-2026.webp",
      alt: "Zoom recognized in the 2026 Gartner Voice of the Customer for CCaaS",
      btnText: "Explore the report",
      href: "#report-ccaas",
    },
    {
      id: "frost-radar",
      imageSrc: "/assets/landing/reports/forrester-block-img.webp",
      alt: "Frost Radar Visionary Leaders",
      btnText: "Read the report",
      href: "#report-frost",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
          {reports.map((report) => (
            <div key={report.id} className="flex flex-col items-start group">
              {/* Graphic Card */}
              <div className="relative aspect-[724/784] w-full rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                <Image
                  src={report.imageSrc}
                  alt={report.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                  priority
                />
              </div>

              {/* Action Button */}
              <div className="mt-6">
                <a
                  href={report.href}
                  className="inline-flex items-center justify-center rounded-xl bg-[#0B5CFF] hover:bg-[#004BDC] text-white px-7 py-3 text-sm font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  {report.btnText}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
