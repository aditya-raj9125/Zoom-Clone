"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductCard {
  id: string;
  name: string;
  imageSrc: string;
}

const SETS_COUNT = 5;
const BASE_SET = 2; // middle set index (0, 1, 2, 3, 4)

export function ProductCarousel() {
  const [currentIndex, setCurrentIndex] = useState(2); // Start with Bonsai
  const [virtualIndex, setVirtualIndex] = useState(BASE_SET * 10 + 2); // 22 in virtual list
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);

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

  // Flatten 5 sets of products for seamless infinite scrolling
  const virtualProducts = React.useMemo(() => {
    const list: Array<ProductCard & { virtualKey: string; originalIndex: number }> = [];
    for (let set = 0; set < SETS_COUNT; set++) {
      products.forEach((p, idx) => {
        list.push({
          ...p,
          virtualKey: `${set}-${p.id}`,
          originalIndex: idx,
        });
      });
    }
    return list;
  }, [products]);

  // Keep virtual index within healthy range without visible jump
  useEffect(() => {
    if (virtualIndex < 10 || virtualIndex >= 40) {
      const normalized = ((virtualIndex % products.length) + products.length) % products.length;
      const resetVirtual = BASE_SET * products.length + normalized;

      setIsAnimating(false);
      setVirtualIndex(resetVirtual);

      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [virtualIndex, products.length]);

  // Auto Horizontal Scrolling Effect
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setVirtualIndex((prev) => {
        const next = prev + 1;
        setCurrentIndex(next % products.length);
        return next;
      });
    }, 3800);

    return () => clearInterval(interval);
  }, [isPaused, products.length]);

  const handlePrev = () => {
    setVirtualIndex((prev) => {
      const next = prev - 1;
      setCurrentIndex(((next % products.length) + products.length) % products.length);
      return next;
    });
  };

  const handleNext = () => {
    setVirtualIndex((prev) => {
      const next = prev + 1;
      setCurrentIndex(next % products.length);
      return next;
    });
  };

  const handleDotClick = (targetIdx: number) => {
    let diff = (targetIdx - currentIndex) % products.length;
    if (diff > products.length / 2) diff -= products.length;
    if (diff < -products.length / 2) diff += products.length;

    setVirtualIndex((prev) => prev + diff);
    setCurrentIndex(targetIdx);
  };

  const handleCardClick = (vIdx: number, origIdx: number) => {
    setVirtualIndex(vIdx);
    setCurrentIndex(origIdx);
  };

  return (
    <section
      id="carousel"
      className="relative pt-2 pb-16 z-20 overflow-hidden bg-transparent select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Smooth natural blend between Blue & White centered at 50% middle of the cards */}
      <div className="absolute inset-x-0 top-[130px] sm:top-[150px] h-[120px] bg-gradient-to-b from-white/0 via-white/50 to-white z-0 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 top-[250px] sm:top-[270px] bg-white z-0 pointer-events-none" />

      {/* Full-width Carousel Viewport allowing cards to bleed in & out of screen borders */}
      <div className="relative z-10 w-full overflow-hidden py-4 [--card-step:250px] [--card-half:115px] sm:[--card-step:284px] sm:[--card-half:130px]">
        <div
          className={`flex gap-5 sm:gap-6 items-center will-change-transform ${
            isAnimating ? "transition-transform duration-700 ease-out" : "transition-none"
          }`}
          style={{
            transform: `translateX(calc(50% - (var(--card-step) * ${virtualIndex} + var(--card-half))))`,
          }}
        >
          {virtualProducts.map((item, vIdx) => {
            const isActive = vIdx === virtualIndex;
            return (
              <div
                key={item.virtualKey}
                onClick={() => handleCardClick(vIdx, item.originalIndex)}
                className={`relative h-[330px] sm:h-[370px] w-[230px] sm:w-[260px] shrink-0 rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 shadow-lg ${
                  isActive
                    ? "ring-4 ring-blue-400/70 scale-105 shadow-2xl z-10 opacity-100"
                    : "opacity-80 hover:opacity-100 scale-95"
                } bg-[#081E57]`}
              >
                <Image
                  src={item.imageSrc}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 230px, 260px"
                  className="object-cover object-top transition-transform duration-500 hover:scale-105"
                  priority={vIdx >= 20 && vIdx <= 25}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Extreme Left & Right Navigation Controls with Centered Indicators */}
      <div className="relative z-10 mt-8 w-full px-6 sm:px-12 lg:px-16 flex items-center justify-between">
        {/* Left Arrow Button on Extreme Left */}
        <button
          onClick={handlePrev}
          className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white shadow-md text-slate-800 hover:bg-slate-100 hover:scale-110 active:scale-95 transition-all border border-slate-200 cursor-pointer z-30"
          aria-label="Previous card"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Pagination Indicators (Centered) */}
        <div className="flex items-center gap-2">
          {products.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === currentIndex
                  ? "h-2.5 w-7 bg-[#00052D]"
                  : "h-2.5 w-2.5 bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Right Arrow Button on Extreme Right */}
        <button
          onClick={handleNext}
          className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white shadow-md text-slate-800 hover:bg-slate-100 hover:scale-110 active:scale-95 transition-all border border-slate-200 cursor-pointer z-30"
          aria-label="Next card"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
