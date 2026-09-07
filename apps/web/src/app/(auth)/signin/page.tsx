"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, KeyRound, Check, ArrowLeft, Lock } from "lucide-react";

// Social Brand SVG Icons
function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.37 7.34 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="w-5 h-5 fill-current text-slate-900" viewBox="0 0 24 24">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.62-.75 1.04-1.8 0.92-2.84-.9.04-2 .6-2.65 1.35-.58.67-1.09 1.74-.95 2.77 1 .08 2.06-.53 2.68-1.28z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
      <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

export default function SignInPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNextOrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage("Please enter your email, Zoom Mail or phone number.");
      return;
    }

    if (!showPasswordField) {
      // Transition to password step
      setShowPasswordField(true);
      setErrorMessage("");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 800);
  };

  const handleQuickLoginDefaultUser = () => {
    setIdentifier("adityahars09@gmail.com");
    setPassword("password123");
    setShowPasswordField(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
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
            <span className="hidden sm:inline">New to Zoom?</span>
            <Link
              href="/signup"
              className="text-[#0B5CFF] font-semibold hover:underline"
            >
              Sign Up Free
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

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center w-full">
          {/* Left Column: Zoomtopia 2026 Promotional Banner */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-[#004BDE] border border-blue-400/20 group">
              {/* Background Glass Ribbon Graphic */}
              <Image
                src="/assets/auth/zoomtopia.jpg"
                alt="Zoomtopia glass ribbon banner"
                fill
                priority
                className="object-cover object-right group-hover:scale-105 transition-transform duration-700"
              />

              {/* Gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0038B8]/95 via-[#004BDE]/80 to-transparent p-7 sm:p-9 flex flex-col justify-between text-white">
                {/* Logo & Headline */}
                <div className="max-w-xs space-y-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                      zoomtopia
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-blue-50/95 font-medium leading-snug">
                    New products. Big ideas. Fresh inspiration. Be part of what&apos;s next at Zoomtopia 2026.
                  </p>
                </div>

                {/* Date & Register Button */}
                <div className="space-y-3 pt-4">
                  <p className="text-sm font-semibold text-white">
                    October 22
                  </p>
                  <a
                    href="#register"
                    className="inline-flex items-center justify-center rounded-full bg-white text-[#0B5CFF] hover:bg-blue-50 px-5 py-2 text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-105"
                  >
                    Register now
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sign In Form & Social Logins */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center lg:pl-6">
            <div className="max-w-md w-full">
              {!isSuccess ? (
                <>
                  <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight text-center mb-7">
                    Sign in
                  </h1>

                  <form onSubmit={handleNextOrSubmit} className="space-y-4">
                    {errorMessage && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                        {errorMessage}
                      </div>
                    )}

                    {/* Email / Identifier Input */}
                    <div>
                      <div className="relative">
                        <input
                          id="identifier"
                          type="text"
                          required
                          value={identifier}
                          onChange={(e) => {
                            setIdentifier(e.target.value);
                            setErrorMessage("");
                          }}
                          placeholder="Enter email, Zoom Mail or phone number"
                          className="w-full h-13 px-4 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-[#0B5CFF] focus:ring-4 focus:ring-blue-100 transition-all"
                        />
                      </div>
                    </div>

                    {/* Conditional Password Input */}
                    {showPasswordField && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="flex items-center justify-between mb-1.5">
                          <label
                            htmlFor="password"
                            className="block text-xs font-semibold text-slate-700"
                          >
                            Password
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowPasswordField(false)}
                            className="text-xs text-[#0B5CFF] hover:underline"
                          >
                            Change account
                          </button>
                        </div>
                        <input
                          id="password"
                          type="password"
                          required
                          autoFocus
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setErrorMessage("");
                          }}
                          placeholder="Enter your password"
                          className="w-full h-13 px-4 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-[#0B5CFF] focus:ring-4 focus:ring-blue-100 transition-all"
                        />
                      </div>
                    )}

                    {/* Primary Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 rounded-xl bg-[#0B5CFF] hover:bg-[#004BDE] text-white text-sm font-semibold shadow-md transition-all active:scale-[0.99] flex items-center justify-center cursor-pointer mt-3"
                    >
                      {isLoading
                        ? "Signing in..."
                        : showPasswordField
                        ? "Sign In"
                        : "Next"}
                    </button>
                  </form>

                  {/* Seeded Default User Quick Helper (Aditya Raj) */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                    <p className="text-[11px] text-slate-500">
                      Default Seeded Account:{" "}
                      <button
                        type="button"
                        onClick={handleQuickLoginDefaultUser}
                        className="text-[#0B5CFF] font-semibold hover:underline"
                      >
                        Aditya Raj (adityahars09@gmail.com)
                      </button>
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="relative my-7 border-t border-slate-200">
                    <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-white px-3 text-xs text-slate-500 font-medium">
                      Or sign in with
                    </span>
                  </div>

                  {/* 5 Social Login Providers matching Screenshot 2 */}
                  <div className="flex items-center justify-center gap-4 sm:gap-5">
                    {/* SSO */}
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        type="button"
                        aria-label="Sign in with SSO"
                        className="w-12 h-12 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 shadow-xs flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                      >
                        <KeyRound className="w-5 h-5 text-slate-800" />
                      </button>
                      <span className="text-[11px] font-medium text-slate-600">SSO</span>
                    </div>

                    {/* Apple */}
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        type="button"
                        aria-label="Sign in with Apple"
                        className="w-12 h-12 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 shadow-xs flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                      >
                        <AppleIcon />
                      </button>
                      <span className="text-[11px] font-medium text-slate-600">Apple</span>
                    </div>

                    {/* Google */}
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        type="button"
                        aria-label="Sign in with Google"
                        className="w-12 h-12 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 shadow-xs flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                      >
                        <GoogleIcon />
                      </button>
                      <span className="text-[11px] font-medium text-slate-600">Google</span>
                    </div>

                    {/* Facebook */}
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        type="button"
                        aria-label="Sign in with Facebook"
                        className="w-12 h-12 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 shadow-xs flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                      >
                        <FacebookIcon />
                      </button>
                      <span className="text-[11px] font-medium text-slate-600">Facebook</span>
                    </div>

                    {/* Microsoft */}
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        type="button"
                        aria-label="Sign in with Microsoft"
                        className="w-12 h-12 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 shadow-xs flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                      >
                        <MicrosoftIcon />
                      </button>
                      <span className="text-[11px] font-medium text-slate-600">Microsoft</span>
                    </div>
                  </div>

                  {/* Forgot Email */}
                  <div className="text-center mt-7">
                    <a
                      href="#forgot-email"
                      className="text-xs sm:text-sm text-[#0B5CFF] font-medium hover:underline"
                    >
                      Forgot email?
                    </a>
                  </div>

                  {/* Help · Terms · Privacy */}
                  <div className="flex items-center justify-center gap-4 mt-6 text-xs text-[#0B5CFF] font-medium">
                    <a href="#help" className="hover:underline">Help</a>
                    <span>•</span>
                    <a href="#terms" className="hover:underline">Terms</a>
                    <span>•</span>
                    <a href="#privacy" className="hover:underline">Privacy</a>
                  </div>

                  {/* reCAPTCHA Disclaimer */}
                  <p className="mt-5 text-[11px] text-slate-500 text-center leading-relaxed max-w-sm mx-auto">
                    Zoom is protected by reCAPTCHA and the Google{" "}
                    <a href="#" className="text-[#0B5CFF] hover:underline">Privacy Policy</a> and{" "}
                    <a href="#" className="text-[#0B5CFF] hover:underline">Terms of Service</a> apply.
                  </p>
                </>
              ) : (
                /* Success State */
                <div className="w-full text-center py-6 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 text-[#0B5CFF] flex items-center justify-center mx-auto mb-5 shadow-sm">
                    <Check className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Signed in successfully!
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Welcome back to Zoom Workplace (<strong className="text-slate-800">{identifier}</strong>).
                  </p>

                  <div className="mt-8 space-y-3">
                    <Link
                      href="/"
                      className="inline-flex w-full h-12 items-center justify-center rounded-xl bg-[#0B5CFF] hover:bg-[#004BDE] text-white text-sm font-semibold shadow-md transition-all active:scale-[0.99]"
                    >
                      Continue to Home Page
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSuccess(false);
                        setShowPasswordField(false);
                        setPassword("");
                      }}
                      className="inline-flex w-full h-12 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition-all"
                    >
                      Sign in with another account
                    </button>
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
