"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Globe,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Menu,
  X,
  Grid,
  Video,
  Phone,
  MessageSquare,
  Users,
  Bot,
  Laptop,
} from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [meetOpen, setMeetOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const meetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside to close Meet dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (meetRef.current && !meetRef.current.contains(event.target as Node)) {
        setMeetOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-[#08164A]/95 backdrop-blur-md text-white shadow-md border-b border-white/10"
            : "bg-transparent text-white"
        }`}
      >
        <div className="mx-auto flex max-w-[1420px] items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          {/* Left: Brand & Nav Links */}
          <div className="flex items-center gap-7">
            <Link href="/" className="flex items-center gap-1 group shrink-0">
              <Image
                src="/assets/branding/logo-zoom-white@2x.png"
                alt="Zoom"
                width={105}
                height={24}
                priority
                className="h-6.5 w-auto object-contain transition-all"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {/* Products Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown("products")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center gap-1.5 py-2 hover:opacity-80 transition-opacity cursor-pointer">
                  <span>Products</span>
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </button>

                {activeDropdown === "products" && (
                  <div className="absolute top-full left-0 w-80 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-black/5 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="grid gap-2">
                      <a
                        href="#carousel"
                        className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-slate-50 transition-colors"
                      >
                        <div className="rounded-lg bg-blue-50 p-2 text-[#1668FE]">
                          <Video className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Zoom Workplace</p>
                          <p className="text-xs text-slate-500">Video meetings, team chat, calendar</p>
                        </div>
                      </a>
                      <a
                        href="#carousel"
                        className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-slate-50 transition-colors"
                      >
                        <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                          <Phone className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Zoom Phone</p>
                          <p className="text-xs text-slate-500">Enterprise cloud phone system</p>
                        </div>
                      </a>
                      <a
                        href="#carousel"
                        className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-slate-50 transition-colors"
                      >
                        <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Zoom Rooms</p>
                          <p className="text-xs text-slate-500">Conference room & workspace tech</p>
                        </div>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown("ai")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center gap-1.5 py-2 hover:opacity-80 transition-opacity cursor-pointer">
                  <svg className="h-3.5 w-3.5 text-[#38BDF8] fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                  </svg>
                  <span>AI</span>
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </button>

                {activeDropdown === "ai" && (
                  <div className="absolute top-full left-0 w-80 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-black/5 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="grid gap-2">
                      <a
                        href="#my-notes"
                        className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-purple-50 transition-colors"
                      >
                        <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                          <Bot className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Zoom AI Companion</p>
                          <p className="text-xs text-slate-500">Included at no additional cost</p>
                        </div>
                      </a>
                      <a
                        href="#my-notes"
                        className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-purple-50 transition-colors"
                      >
                        <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                          <Laptop className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">My Notes Note Taker</p>
                          <p className="text-xs text-slate-500">Cross-platform automated note taking</p>
                        </div>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Solutions Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown("solutions")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center gap-1.5 py-2 hover:opacity-80 transition-opacity cursor-pointer">
                  <span>Solutions</span>
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </button>
                {activeDropdown === "solutions" && (
                  <div className="absolute top-full left-0 w-72 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-black/5 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="grid gap-1">
                      <a href="#platform-tabs" className="rounded-lg px-3 py-2 text-sm hover:bg-slate-50 font-medium">Customer Support</a>
                      <a href="#platform-tabs" className="rounded-lg px-3 py-2 text-sm hover:bg-slate-50 font-medium">Marketing Teams</a>
                      <a href="#platform-tabs" className="rounded-lg px-3 py-2 text-sm hover:bg-slate-50 font-medium">Sales Pipeline</a>
                      <a href="#platform-tabs" className="rounded-lg px-3 py-2 text-sm hover:bg-slate-50 font-medium">Employee Engagement</a>
                    </div>
                  </div>
                )}
              </div>

              <a href="#pricing" className="py-2 hover:opacity-80 transition-opacity">
                Pricing
              </a>
            </nav>
          </div>

          {/* Right: Actions & Utilities */}
          <div className="hidden md:flex items-center gap-3.5 text-sm font-medium">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 hover:opacity-80 transition-opacity cursor-pointer"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>

            <button className="flex items-center gap-1 p-2 hover:opacity-80 transition-opacity cursor-pointer" aria-label="Language">
              <Globe className="h-4 w-4" />
            </button>

            {/* Meet Dropdown (Clean text link with chevron matching original site) */}
            <div
              className="relative"
              ref={meetRef}
              onMouseEnter={() => setMeetOpen(true)}
              onMouseLeave={() => setMeetOpen(false)}
            >
              <button
                onClick={() => setMeetOpen(!meetOpen)}
                className="flex items-center gap-1 py-2 hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap"
                aria-expanded={meetOpen}
              >
                <span>Meet</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 opacity-70 transition-transform duration-200 ${
                    meetOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {meetOpen && (
                <div className="absolute top-full right-0 sm:left-0 mt-1 w-52 rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/10 text-slate-800 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <Link
                    href="/join"
                    onClick={() => setMeetOpen(false)}
                    className="block px-3.5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-blue-50 hover:text-[#1668FE] rounded-xl transition-colors"
                  >
                    Join a meeting
                  </Link>
                  <Link
                    href="/signin"
                    onClick={() => setMeetOpen(false)}
                    className="block px-3.5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-blue-50 hover:text-[#1668FE] rounded-xl transition-colors"
                  >
                    Host a meeting
                  </Link>
                  <a
                    href="#download"
                    onClick={() => setMeetOpen(false)}
                    className="block px-3.5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-blue-50 hover:text-[#1668FE] rounded-xl transition-colors"
                  >
                    Download app
                  </a>
                </div>
              )}
            </div>

            {/* Sign In text link */}
            <Link
              href="/signin"
              className="py-2 hover:opacity-80 transition-opacity whitespace-nowrap"
            >
              Sign In
            </Link>

            {/* Support text link */}
            <a
              href="#support"
              className="py-2 hover:opacity-80 transition-opacity whitespace-nowrap"
            >
              Support
            </a>

            {/* Contact Sales Button (White rounded pill) */}
            <a
              href="#contact-sales"
              className="rounded-xl bg-white hover:bg-slate-100 text-[#00053D] px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold shadow-xs transition-all whitespace-nowrap"
            >
              Contact Sales
            </a>

            {/* Sign Up Free Button (Vibrant blue rounded pill, ~10% lighter) */}
            <Link
              href="/signup"
              className="rounded-xl bg-[#1668FE] hover:bg-[#0B5CFF] text-white px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold shadow-xs transition-all whitespace-nowrap hover:scale-102 active:scale-98"
            >
              Sign Up Free
            </Link>

            {/* 3x3 Apps Grid Icon (matching original) */}
            <button
              className="p-1.5 hover:opacity-80 transition-opacity cursor-pointer text-white"
              aria-label="Apps"
            >
              <svg className="h-4 w-4 fill-current opacity-90" viewBox="0 0 16 16">
                <circle cx="2.5" cy="2.5" r="1.5" />
                <circle cx="8" cy="2.5" r="1.5" />
                <circle cx="13.5" cy="2.5" r="1.5" />
                <circle cx="2.5" cy="8" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="13.5" cy="8" r="1.5" />
                <circle cx="2.5" cy="13.5" r="1.5" />
                <circle cx="8" cy="13.5" r="1.5" />
                <circle cx="13.5" cy="13.5" r="1.5" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2.5">
            <Link
              href="/join"
              className="rounded-xl bg-white/20 text-white px-3 py-1.5 text-xs font-semibold"
            >
              Join
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-[#0B5CFF] text-white px-3.5 py-1.5 text-xs font-semibold"
            >
              Sign Up
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white text-slate-800 px-6 py-6 border-b border-slate-200 shadow-xl">
            <div className="mb-4 pb-4 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Meeting Actions</p>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/join"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl bg-blue-50 text-[#0B5CFF] py-2.5 text-center font-bold text-sm hover:bg-blue-100 transition-colors"
                >
                  Join a meeting
                </Link>
                <Link
                  href="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl bg-slate-100 text-slate-800 py-2.5 text-center font-bold text-sm hover:bg-slate-200 transition-colors"
                >
                  Host a meeting
                </Link>
              </div>
            </div>

            <nav className="flex flex-col gap-3.5 text-base font-medium">
              <a href="#carousel" onClick={() => setMobileMenuOpen(false)} className="py-1.5 border-b border-slate-100">
                Products
              </a>
              <a href="#my-notes" onClick={() => setMobileMenuOpen(false)} className="py-1.5 border-b border-slate-100 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                AI Companion
              </a>
              <a href="#platform-tabs" onClick={() => setMobileMenuOpen(false)} className="py-1.5 border-b border-slate-100">
                Solutions
              </a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="py-1.5 border-b border-slate-100">
                Pricing
              </a>
              <div className="pt-2 flex flex-col gap-2.5">
                <Link
                  href="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl border border-slate-300 py-2.5 text-center font-semibold text-sm hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <a
                  href="#contact-sales"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl bg-slate-100 py-2.5 text-center font-semibold text-sm hover:bg-slate-200"
                >
                  Contact Sales
                </a>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl bg-[#0B5CFF] text-white py-2.5 text-center font-semibold text-sm shadow-xs"
                >
                  Sign Up Free
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/10 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3 flex-1">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products, solutions, features..."
                  className="w-full text-base outline-none placeholder:text-slate-400"
                  autoFocus
                />
              </div>
              <button
                onClick={() => setSearchOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="pt-4 text-xs text-slate-400 flex gap-2">
              <span>Popular searches:</span>
              <span className="text-[#0B5CFF] cursor-pointer hover:underline">AI Companion</span>
              <span>•</span>
              <span className="text-[#0B5CFF] cursor-pointer hover:underline">Zoom Rooms</span>
              <span>•</span>
              <span className="text-[#0B5CFF] cursor-pointer hover:underline">Phone Plans</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
