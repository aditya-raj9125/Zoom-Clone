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
      {/* Top Notification / Announcement Banner */}
      <AnnouncementBanner />

      {/* Sticky Dynamic Navigation */}
      <Navbar />

      {/* Main Page Flow */}
      <main className="flex-1 flex flex-col">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Horizontal Product Carousel (Phone, Webinars, Bonsai, Rooms, BrightHire, etc.) */}
        <ProductCarousel />

        {/* 3. My Notes AI Note Taker Interactive Demo */}
        <MyNotesSection />

        {/* 4. One Platform. Endless Ways to Work Together (Collaboration, Support, Marketing, etc.) */}
        <PlatformTabsSection />

        {/* 5. Industry Recognition & Analyst Reports (Gartner, Frost Radar) */}
        <IndustryReportsSection />

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
