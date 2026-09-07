"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Download, ChevronDown, Check } from "lucide-react";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.6a1.5 1.5 0 1 0 1.5 1.5 1.5 1.5 0 0 0-1.5-1.5z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

export function Footer() {
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedCurrency, setSelectedCurrency] = useState("US Dollar $");

  return (
    <footer className="bg-[#00052D] text-slate-300 pt-16 pb-12 text-sm border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          {/* Left Column (Col span 4): Brand, Download Center, Selectors, Contact */}
          <div className="lg:col-span-4 space-y-6">
            {/* Zoom Logo */}
            <a href="#" className="inline-block">
              <svg className="h-8 w-auto text-white" viewBox="0 0 120 30" fill="currentColor">
                <path d="M14.5 5.5H4.2l8.8 14.2H4.2v4.8h17.2v-3.7L12.5 6.6h9.2V5.5zM38.5 7.6c-5.2 0-9.4 3.9-9.4 8.7 0 4.8 4.2 8.7 9.4 8.7s9.4-3.9 9.4-8.7c0-4.8-4.2-8.7-9.4-8.7zm0 13.5c-2.8 0-5.1-2.1-5.1-4.8s2.3-4.8 5.1-4.8 5.1 2.1 5.1 4.8-2.3 4.8-5.1 4.8zm22.4-13.5c-5.2 0-9.4 3.9-9.4 8.7 0 4.8 4.2 8.7 9.4 8.7s9.4-3.9 9.4-8.7c0-4.8-4.2-8.7-9.4-8.7zm0 13.5c-2.8 0-5.1-2.1-5.1-4.8s2.3-4.8 5.1-4.8 5.1 2.1 5.1 4.8-2.3 4.8-5.1 4.8zm21.5-13.5c-2.6 0-4.8 1.1-6.1 2.8-.7-1.7-2.6-2.8-4.8-2.8-2 0-3.8 1-4.8 2.5V8.1h-4.3v16.4h4.3v-9.5c0-2.3 1.5-3.8 3.5-3.8s3.3 1.5 3.3 3.8v9.5h4.3v-9.5c0-2.3 1.5-3.8 3.5-3.8s3.3 1.5 3.3 3.8v9.5h4.3v-10c0-4.1-2.9-6.6-7.4-6.6z" />
              </svg>
            </a>

            {/* Download Center Card */}
            <a
              href="#download"
              className="flex items-center gap-3.5 rounded-2xl bg-white/10 hover:bg-white/15 p-3.5 border border-white/15 transition-all text-white max-w-xs group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B5CFF] text-white shadow-md group-hover:scale-105 transition-transform">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Download Center</p>
                <p className="text-xs text-slate-300">Get the most out of Zoom</p>
              </div>
            </a>

            {/* Language & Currency Dropdowns */}
            <div className="space-y-3 max-w-xs">
              <div className="relative">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full appearance-none rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                >
                  <option value="English" className="bg-[#00052D]">English</option>
                  <option value="Español" className="bg-[#00052D]">Español</option>
                  <option value="Français" className="bg-[#00052D]">Français</option>
                  <option value="Deutsch" className="bg-[#00052D]">Deutsch</option>
                  <option value="日本語" className="bg-[#00052D]">日本語</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 pointer-events-none text-slate-300" />
              </div>

              <div className="relative">
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full appearance-none rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                >
                  <option value="US Dollar $" className="bg-[#00052D]">US Dollar $</option>
                  <option value="Euro €" className="bg-[#00052D]">Euro €</option>
                  <option value="British Pound £" className="bg-[#00052D]">British Pound £</option>
                  <option value="Japanese Yen ¥" className="bg-[#00052D]">Japanese Yen ¥</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 pointer-events-none text-slate-300" />
              </div>
            </div>

            {/* Contact & Social Links */}
            <div className="pt-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                Get in touch
              </span>
              <a
                href="tel:+18887999666"
                className="text-lg font-extrabold text-white hover:text-blue-400 transition-colors mt-1 block"
              >
                +1.888.799.9666
              </a>

              <div className="mt-4 flex items-center gap-4 text-slate-400">
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="LinkedIn">
                  <LinkedInIcon className="h-5 w-5" />
                </a>
                <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="X Twitter">
                  <TwitterIcon className="h-5 w-5" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="YouTube">
                  <YouTubeIcon className="h-5 w-5" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="Facebook">
                  <FacebookIcon className="h-5 w-5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="Instagram">
                  <InstagramIcon className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Columns (Col span 8): 4 Extensive Link Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* Column 1: About */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm tracking-wide">About</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Zoom Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Customers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Our Team</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Partners</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Investors</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sustainability & ESG</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Zoom Cares</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Media Kit</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Developer Platform</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI Research</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Zoom Ventures</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Zoom Merchandise Store</a></li>
              </ul>
            </div>

            {/* Column 2: Download */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm tracking-wide">Download</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Zoom Workplace App</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Zoom Rooms App</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Zoom Rooms Controller</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Browser Extension</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Outlook Plug-in</a></li>
                <li><a href="#" className="hover:text-white transition-colors">iPhone/iPad App</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Android App</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Zoom Virtual Backgrounds</a></li>
              </ul>
            </div>

            {/* Column 3: Sales */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm tracking-wide">Sales</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Contact Sales</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Plans & Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Request a Demo</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Webinars and Events</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Zoom Experience Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Zoom for Startups</a></li>
              </ul>
            </div>

            {/* Column 4: Support */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm tracking-wide">Support</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Test Zoom</a></li>
                <li><Link href="/signin" className="hover:text-white transition-colors">Account</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Support Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Learning Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Zoom Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Technical Content Library</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Feedback</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Accessibility</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How To Videos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Developer Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors leading-tight">Privacy, Security, Legal Policies</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sub-footer Legal Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>©2026 Zoom Video Communications, Inc. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Trust Center</a>
            <a href="#" className="hover:text-white transition-colors">Acceptable Use Guidelines</a>
            <a href="#" className="hover:text-white transition-colors">Legal & Compliance</a>
            <a href="#" className="hover:text-white transition-colors flex items-center gap-1">
              <span className="rounded bg-blue-500 text-white p-0.5"><Check className="h-2.5 w-2.5" /></span>
              Your Privacy Choices
            </a>
            <a href="#" className="hover:text-white transition-colors">Cookies Settings</a>
            <a href="#" className="hover:text-white transition-colors">Site Map</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
