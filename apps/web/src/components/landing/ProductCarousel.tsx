"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductCard {
  id: string;
  name: string;
  imageSrc: string;
}

export function ProductCarousel() {
  const [currentIndex, setCurrentIndex] = useState(2); // Start with Bonsai centered
  const [isPaused, setIsPaused] = useState(false);

  const products: ProductCard[] = [
    {
      id: "phone",
      name: "Zoom Phone",
      imageSrc: "/assets/landing/carousel/phone.jpg",
    },
    {
      id: "webinars",
      name: "Zoom Webinars",
      imageSrc: "/assets/landing/carousel/webinars.jpg",
    },
    {
      id: "bonsai",
      name: "Bonsai Workflows",
      imageSrc: "/assets/landing/carousel/bonsai.webp",
    },
    {
      id: "rooms",
      name: "Zoom Rooms",
      imageSrc: "/assets/landing/carousel/rooms.jpg",
    },
    {
      id: "brighthire",
      name: "BrightHire Interview Assistant",
      imageSrc: "/assets/landing/carousel/brighthire.webp",
    },
    {
      id: "virtual-agent",
      name: "Zoom Virtual Agent",
      imageSrc: "/assets/landing/carousel/virtual-agent.jpg",
    },
    {
      id: "contact-center",
      name: "Zoom Contact Center",
      imageSrc: "/assets/landing/carousel/contact-center.jpg",
    },
    {
      id: "workvivo",
      name: "Workvivo Digital Workplace",
      imageSrc: "/assets/landing/carousel/workvivo.webp",
    },
    {
      id: "ai-suite",
      name: "AI Productivity Suite",
      imageSrc: "/assets/landing/carousel/ai-suite.webp",
    },
    {
      id: "zoom-mate",
      name: "ZoomMate Meeting Templates",
      imageSrc: "/assets/landing/carousel/zoom-mate.webp",
    },
  ];

  // Auto Horizontal Scrolling Effect
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [isPaused, products.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : products.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  return (
    <section
      id="carousel"
      className="relative -mt-10 sm:-mt-16 pb-16 z-20 overflow-hidden bg-gradient-to-b from-[#1E40AF] via-[#6366F1]/10 to-transparent"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Carousel Viewport */}
        <div className="relative overflow-visible py-6">
          <div
            className="flex gap-5 sm:gap-6 transition-transform duration-700 ease-out will-change-transform"
            style={{
              // Centers active card: card width is ~280px on mobile, ~310px on desktop, gap is 24px
              transform: `translateX(calc(50% - ${currentIndex * 334 + 155}px))`,
            }}
          >
            {products.map((item, idx) => {
              const isActive = idx === currentIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative h-[390px] sm:h-[440px] w-[270px] sm:w-[310px] shrink-0 rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 shadow-xl ${
                    isActive
                      ? "ring-4 ring-blue-400/60 scale-105 shadow-2xl z-10"
                      : "opacity-85 hover:opacity-100 hover:scale-100 scale-95"
                  } bg-[#00052D]`}
                >
                  <Image
                    src={item.imageSrc}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 270px, 310px"
                    className="object-cover object-top transition-transform duration-500 hover:scale-105"
                    priority={idx < 4}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Navigation Controls & Indicators */}
        <div className="mt-8 flex items-center justify-between max-w-md mx-auto px-4">
          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md text-slate-800 hover:bg-slate-100 hover:scale-110 active:scale-95 transition-all border border-slate-200 cursor-pointer"
            aria-label="Previous card"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Pagination Indicators */}
          <div className="flex items-center gap-2">
            {products.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? "h-2.5 w-7 bg-[#00052D]"
                    : "h-2.5 w-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={handleNext}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md text-slate-800 hover:bg-slate-100 hover:scale-110 active:scale-95 transition-all border border-slate-200 cursor-pointer"
            aria-label="Next card"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
