"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, ChevronDown, ArrowLeft, ShieldCheck, Sparkles, UserCheck } from "lucide-react";

export default function SignUpPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [birthYear, setBirthYear] = useState("");
  const [yearError, setYearError] = useState("");

  // Form fields aligned with Database User Model (apps/api/app/features/users/models.py)
  const [formData, setFormData] = useState({
    displayName: "", // maps to display_name (String 100)
    email: "",       // maps to email (String 255)
    password: "",    // maps to user auth credential
    avatarUrl: "",   // maps to avatar_url (String 500)
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const currentYear = new Date().getFullYear();

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
    setBirthYear(val);
    setYearError("");
  };

  const handleContinueStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    const year = parseInt(birthYear, 10);
    if (!birthYear || birthYear.length !== 4 || year < 1910 || year > currentYear - 5) {
      setYearError("Please enter a valid 4-digit birth year.");
      return;
    }
    setStep(2);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName.trim()) {
      setFormError("Full Name is required.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (formData.password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    // Simulate creation and profile saving aligned with User schema
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(3);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-slate-200/80 px-6 sm:px-10 py-4.5 flex items-center justify-between">
        {/* Zoom Logo */}
        <Link href="/" className="flex items-center group">
          <svg
            className="h-7 w-auto text-[#0B5CFF] transition-transform group-hover:scale-105"
            viewBox="0 0 120 30"
            fill="currentColor"
            aria-label="Zoom Home"
          >
            <path d="M14.5 5.5H4.2l8.8 14.2H4.2v4.8h17.2v-3.7L12.5 6.6h9.2V5.5zM38.5 7.6c-5.2 0-9.4 3.9-9.4 8.7 0 4.8 4.2 8.7 9.4 8.7s9.4-3.9 9.4-8.7c0-4.8-4.2-8.7-9.4-8.7zm0 13.5c-2.8 0-5.1-2.1-5.1-4.8s2.3-4.8 5.1-4.8 5.1 2.1 5.1 4.8-2.3 4.8-5.1 4.8zm22.4-13.5c-5.2 0-9.4 3.9-9.4 8.7 0 4.8 4.2 8.7 9.4 8.7s9.4-3.9 9.4-8.7c0-4.8-4.2-8.7-9.4-8.7zm0 13.5c-2.8 0-5.1-2.1-5.1-4.8s2.3-4.8 5.1-4.8 5.1 2.1 5.1 4.8-2.3 4.8-5.1 4.8zm21.5-13.5c-2.6 0-4.8 1.1-6.1 2.8-.7-1.7-2.6-2.8-4.8-2.8-2 0-3.8 1-4.8 2.5V8.1h-4.3v16.4h4.3v-9.5c0-2.3 1.5-3.8 3.5-3.8s3.3 1.5 3.3 3.8v9.5h4.3v-9.5c0-2.3 1.5-3.8 3.5-3.8s3.3 1.5 3.3 3.8v9.5h4.3v-10c0-4.1-2.9-6.6-7.4-6.6z" />
          </svg>
        </Link>

        {/* Header Right Nav */}
        <div className="flex items-center gap-5 sm:gap-7 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="hidden sm:inline">Already have an account?</span>
            <Link
              href="/signin"
              className="text-[#0B5CFF] font-semibold hover:underline"
            >
              Sign In
            </Link>
          </div>

          <a
            href="#support"
            className="text-[#0B5CFF] font-medium hover:underline hidden sm:inline"
          >
            Support
          </a>

          <div className="flex items-center gap-1 text-[#0B5CFF] font-medium cursor-pointer hover:underline">
            <span>English</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">
          {/* Left Column: Coworker Illustration & Basic Account Card */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start max-w-md mx-auto lg:max-w-none w-full">
            {/* Illustration */}
            <div className="relative w-full aspect-[4/3] max-w-md rounded-2xl overflow-hidden mb-6 bg-slate-50 border border-slate-100 shadow-xs">
              <Image
                src="/assets/auth/signup_illustration.jpg"
                alt="Zoom video tiles illustration"
                fill
                priority
                className="object-cover"
              />
            </div>

            {/* Feature Checklist Card */}
            <div className="w-full bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-5">
                Create your free Basic account
              </h2>

              <ul className="space-y-3.5">
                {[
                  "Get up to 40 minutes and 100 participants per meeting",
                  "Share AI Docs",
                  "Get 3 editable whiteboards",
                  "Unlimited instant messaging",
                  "Create up to 5 two-minute video messages",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-sm text-slate-700 font-normal leading-snug">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Multi-Step Interactive Form */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center lg:pl-8">
            <div className="max-w-md w-full">
              {/* STEP 1: Birth Year Verification */}
              {step === 1 && (
                <div className="w-full text-center">
                  <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                    Get started with Zoom
                  </h1>
                  <p className="mt-4 text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                    To create your Zoom account, please enter your birth year. This data won&apos;t be stored.
                  </p>

                  <form onSubmit={handleContinueStep1} className="mt-8 space-y-4">
                    <div className="relative text-left">
                      <label
                        htmlFor="birthYear"
                        className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5"
                      >
                        Birth year
                      </label>
                      <input
                        id="birthYear"
                        type="text"
                        inputMode="numeric"
                        placeholder="YYYY"
                        value={birthYear}
                        onChange={handleYearChange}
                        autoFocus
                        className={`w-full h-13 px-4 rounded-xl border bg-white text-lg font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all ${
                          yearError
                            ? "border-red-500 ring-2 ring-red-100"
                            : "border-slate-300 focus:border-[#0B5CFF] focus:ring-4 focus:ring-blue-100"
                        }`}
                      />
                      {yearError && (
                        <p className="mt-1.5 text-xs text-red-600 font-medium">
                          {yearError}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={birthYear.length !== 4}
                      className={`w-full h-12 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center ${
                        birthYear.length === 4
                          ? "bg-[#0B5CFF] hover:bg-[#004BDE] text-white shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/60"
                      }`}
                    >
                      Continue
                    </button>
                  </form>
                </div>
              )}

              {/* STEP 2: Profile & Credentials Form (Database Schema Aligned) */}
              {step === 2 && (
                <div className="w-full">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#0B5CFF] font-medium mb-6 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Change birth year ({birthYear})
                  </button>

                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    Complete your profile
                  </h1>
                  <p className="mt-2 text-sm text-slate-600">
                    Your details will be registered directly in your Zoom workspace.
                  </p>

                  <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4">
                    {formError && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                        {formError}
                      </div>
                    )}

                    {/* display_name: String(100) */}
                    <div>
                      <label
                        htmlFor="displayName"
                        className="block text-xs font-semibold text-slate-700 mb-1.5"
                      >
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="displayName"
                        type="text"
                        required
                        maxLength={100}
                        placeholder="e.g. Aditya Raj"
                        value={formData.displayName}
                        onChange={(e) =>
                          setFormData({ ...formData, displayName: e.target.value })
                        }
                        className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#0B5CFF] focus:ring-4 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    {/* email: String(255) unique */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-semibold text-slate-700 mb-1.5"
                      >
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        maxLength={255}
                        placeholder="name@company.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#0B5CFF] focus:ring-4 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    {/* password credential */}
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-xs font-semibold text-slate-700 mb-1.5"
                      >
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="password"
                        type="password"
                        required
                        minLength={8}
                        placeholder="At least 8 characters"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#0B5CFF] focus:ring-4 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    {/* avatar_url: String(500) optional */}
                    <div>
                      <label
                        htmlFor="avatarUrl"
                        className="block text-xs font-semibold text-slate-700 mb-1.5"
                      >
                        Avatar URL <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        id="avatarUrl"
                        type="url"
                        maxLength={500}
                        placeholder="https://example.com/avatar.jpg"
                        value={formData.avatarUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, avatarUrl: e.target.value })
                        }
                        className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#0B5CFF] focus:ring-4 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 rounded-xl bg-[#0B5CFF] hover:bg-[#004BDE] text-white text-sm font-semibold shadow-md transition-all active:scale-[0.99] flex items-center justify-center cursor-pointer"
                      >
                        {isSubmitting ? "Creating your account..." : "Create Account"}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 text-center leading-normal pt-2">
                      By signing up, you agree to Zoom&apos;s{" "}
                      <a href="#" className="text-[#0B5CFF] hover:underline">Terms of Service</a> and{" "}
                      <a href="#" className="text-[#0B5CFF] hover:underline">Privacy Statement</a>.
                    </p>
                  </form>
                </div>
              )}

              {/* STEP 3: Success Confirmation */}
              {step === 3 && (
                <div className="w-full text-center py-6 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
                    <UserCheck className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Welcome to Zoom, {formData.displayName}!
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto">
                    Your Basic account has been created for <strong className="text-slate-800">{formData.email}</strong>.
                  </p>

                  <div className="mt-8 space-y-3">
                    <Link
                      href="/"
                      className="inline-flex w-full h-12 items-center justify-center rounded-xl bg-[#0B5CFF] hover:bg-[#004BDE] text-white text-sm font-semibold shadow-md transition-all active:scale-[0.99]"
                    >
                      Return to Home Page
                    </Link>
                    <Link
                      href="/signin"
                      className="inline-flex w-full h-12 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition-all"
                    >
                      Sign In to Zoom Workplace
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
