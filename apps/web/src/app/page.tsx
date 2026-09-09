import React from "react";
import { AnnouncementBanner } from "@/components/landing/AnnouncementBanner";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProductCarousel } from "@/components/landing/ProductCarousel";
import { MyNotesSection } from "@/components/landing/MyNotesSection";
import { PlatformTabsSection } from "@/components/landing/PlatformTabsSection";
import { IndustryReportsSection } from "@/components/landing/IndustryReportsSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { CustomerStoriesSection } from "@/components/landing/CustomerStoriesSection";
import { WhatsNewSection } from "@/components/landing/WhatsNewSection";
import { PreFooterCta } from "@/components/landing/PreFooterCta";
import { Footer } from "@/components/landing/Footer";
import { FloatingWidgets } from "@/components/landing/FloatingWidgets";

export const metadata = {
  title: "Zoom Workplace — One platform. Endless ways to work together.",
  description:
    "Bridge the gap between talking and doing with Zoom's AI-first work platform. Video meetings, team chat, phone, webinars, and AI Companion.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Unified Top Hero & Carousel Gradient Canvas - Continuous with zero seams */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#08164A] via-[#0E2368] via-20% via-[#16388C] via-45% to-[#1F48AC]">
        {/* Ambient subtle glow effects */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-blue-500/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-[35%] left-1/4 w-[450px] h-[450px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Sticky Dynamic Navigation */}
        <Navbar />

        {/* Announcement Banner (Positioned directly below Navbar as in reference) */}
        <AnnouncementBanner />

        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Horizontal Product Carousel */}
        <ProductCarousel />
      </div>

      {/* Main Page Flow Remainder */}
      <main className="flex-1 flex flex-col">
        {/* 3. My Notes AI Note Taker Interactive Demo */}
        <MyNotesSection />

        {/* 4. Industry Recognition & Analyst Reports (Gartner, Frost Radar) */}
        <IndustryReportsSection />

        {/* 5. One Platform. Endless Ways to Work Together (Collaboration, Support, Marketing, Sales, Engagement) */}
        <PlatformTabsSection />

        {/* 6. Social Proof, Enterprise Logo Marquee & 3 Rating Columns */}
        <SocialProofSection />

        {/* 7. Customer Stories (Major League Baseball, Cricut, Capital One) */}
        <CustomerStoriesSection />

        {/* 8. What's New Bento Grid (My Notes, Emmy Award, Eric Yuan) */}
        <WhatsNewSection />

        {/* 9. Pre-Footer Call to Action */}
        <PreFooterCta />
      </main>

      {/* 10. Midnight Navy Deep Footer */}
      <Footer />

      {/* 11. Floating Cookie Settings & Live Assistant Chat Widgets */}
      <FloatingWidgets />
    </div>
  );
}
