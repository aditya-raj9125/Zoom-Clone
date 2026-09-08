"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Check, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { setStoredUser, setToken } from "@/lib/auth";

// Google Brand SVG Icon
function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "google_not_configured") {
      setErrorMessage("Google OAuth is not configured on the backend yet.");
    } else if (errorParam === "google_oauth_denied") {
      setErrorMessage("Google sign in request was declined.");
    } else if (errorParam) {
      setErrorMessage(`Authentication error: ${errorParam}`);
    }
  }, [searchParams]);

  const handleNextOrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!showPasswordField) {
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

    try {
      const res = await api.login(identifier.trim(), password);
      setToken(res.access_token);
      setStoredUser(res.user);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Navigate directly to backend Google OAuth login endpoint
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    window.location.href = `${backendUrl}/auth/google/login`;
  };

  const fillTestCredentials = () => {
    setIdentifier("testuser@example.com");
    setPassword("password123");
    setShowPasswordField(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-slate-200/80 px-6 sm:px-10 py-4.5 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center group">
          <Image
            src="/assets/branding/logo-zoom-blue@2x.png"
            alt="Zoom Home"
            width={110}
            height={25}
            priority
            className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>

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
          {/* Left Column: Zoom Promotional Banner */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-[#004BDE] border border-blue-400/20 group">
              <Image
                src="/assets/auth/zoomtopia.jpg"
                alt="Zoom Workplace banner"
                fill
                priority
                className="object-cover object-right group-hover:scale-105 transition-transform duration-700"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-[#0038B8]/95 via-[#004BDE]/80 to-transparent p-7 sm:p-9 flex flex-col justify-between text-white">
                <div className="max-w-xs space-y-4">
                  <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                    zoomtopia
                  </span>
                  <p className="text-sm sm:text-base text-blue-50/95 font-medium leading-snug">
                    AI-powered collaboration, HD video meetings, and enterprise security in one unified platform.
                  </p>
                </div>

                <div className="space-y-3 pt-4">
                  <p className="text-sm font-semibold text-white">Next-Gen Video Experience</p>
                  <span className="inline-flex items-center justify-center rounded-full bg-white text-[#0B5CFF] px-5 py-2 text-xs sm:text-sm font-bold shadow-md">
                    Live WebRTC Streaming
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sign In Form & Only Google OAuth */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center lg:pl-6">
            <div className="max-w-md w-full">
              {!isSuccess ? (
                <>
                  <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight text-center mb-7">
                    Sign in
                  </h1>

                  {/* Prominent Google OAuth Button (Only OAuth Option) */}
                  <div className="mb-6">
                    <button
                      type="button"
                      id="google-signin-btn"
                      onClick={handleGoogleSignIn}
                      className="w-full h-12 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-xs flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    >
                      <GoogleIcon />
                      <span>Continue with Google</span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="relative my-6 border-t border-slate-200">
                    <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-white px-3 text-xs text-slate-400 font-medium">
                      Or sign in with email
                    </span>
                  </div>

                  <form onSubmit={handleNextOrSubmit} className="space-y-4">
                    {errorMessage && (
                      <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Email Input */}
                    <div>
                      <label
                        htmlFor="identifier"
                        className="block text-xs font-semibold text-slate-700 mb-1.5"
                      >
                        Email Address
                      </label>
                      <input
                        id="identifier"
                        type="email"
                        required
                        value={identifier}
                        onChange={(e) => {
                          setIdentifier(e.target.value);
                          setErrorMessage("");
                        }}
                        placeholder="name@company.com"
                        className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#0B5CFF] focus:ring-4 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    {/* Password Input */}
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
                          className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#0B5CFF] focus:ring-4 focus:ring-blue-100 transition-all"
                        />
                      </div>
                    )}

                    {/* Submit Button */}
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

                  {/* Quick autofill helper for convenience */}
                  <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                    <p className="text-[11px] text-slate-500">
                      Sample Account:{" "}
                      <button
                        type="button"
                        onClick={fillTestCredentials}
                        className="text-[#0B5CFF] font-semibold hover:underline"
                      >
                        testuser@example.com
                      </button>
                    </p>
                  </div>

                  {/* Help · Terms · Privacy */}
                  <div className="flex items-center justify-center gap-4 mt-7 text-xs text-[#0B5CFF] font-medium">
                    <Link href="/signup" className="hover:underline">Create an account</Link>
                    <span>•</span>
                    <a href="#support" className="hover:underline">Help</a>
                    <span>•</span>
                    <a href="#privacy" className="hover:underline">Privacy</a>
                  </div>
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
                    Redirecting to your Zoom Workplace dashboard...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
