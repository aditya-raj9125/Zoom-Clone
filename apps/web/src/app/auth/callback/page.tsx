"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { parseJwt, setStoredUser, setToken } from "@/lib/auth";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusText, setStatusText] = useState("Completing sign in with Google...");
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      setErrorText("Google sign-in was not completed or was cancelled.");
      setTimeout(() => {
        router.replace(`/signin?error=${encodeURIComponent(error)}`);
      }, 2000);
      return;
    }

    if (token) {
      try {
        setToken(token);
        const payload = parseJwt(token);
        if (payload) {
          setStoredUser({
            id: payload.sub,
            display_name: payload.display_name,
            email: payload.email,
          });
        }
        setStatusText("Signed in successfully! Redirecting to your dashboard...");
        // Fetch full profile and redirect
        api.getMe()
          .then((user) => {
            setStoredUser(user);
          })
          .catch(() => {
            // Token is still valid in localStorage
          })
          .finally(() => {
            router.replace("/dashboard");
          });
      } catch (err) {
        console.error("Failed to process auth token:", err);
        setErrorText("Failed to process login token.");
        setTimeout(() => router.replace("/signin"), 2000);
      }
    } else {
      setErrorText("No authorization token received.");
      setTimeout(() => router.replace("/signin"), 2000);
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 border border-slate-100 flex flex-col items-center">
        {!errorText ? (
          <>
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <h2 className="text-lg font-bold text-slate-800">Signing in...</h2>
            <p className="text-sm text-slate-500 mt-2">{statusText}</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl font-bold mb-4">
              !
            </div>
            <h2 className="text-lg font-bold text-slate-800">Authentication Issue</h2>
            <p className="text-sm text-red-600 mt-2">{errorText}</p>
            <p className="text-xs text-slate-400 mt-4">Returning to sign-in page...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
