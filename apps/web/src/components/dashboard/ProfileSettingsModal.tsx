"use client";

import React, { useState } from "react";
import { X, User, Mail, Shield, Check, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { setStoredUser, type AuthUser } from "@/lib/auth";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    displayName: string;
    email: string;
    avatarUrl?: string | null;
  };
  onProfileUpdated: (updated: { displayName: string; email: string; avatarUrl?: string | null }) => void;
}

export function ProfileSettingsModal({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
}: ProfileSettingsModalProps) {
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen) return null;

  const initials = (displayName || currentUser.displayName || "AD")
    .trim()
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AD";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) {
      setErrorMessage("Display name cannot be empty.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await api.updateCurrentUser({ display_name: trimmed });
      const updatedUser: AuthUser = {
        id: res.id,
        display_name: res.display_name,
        email: res.email,
        avatar_url: res.avatar_url,
      };
      setStoredUser(updatedUser);
      sessionStorage.setItem("zoom_join_name", res.display_name);

      onProfileUpdated({
        displayName: res.display_name,
        email: res.email || currentUser.email,
        avatarUrl: res.avatar_url,
      });

      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B5CFF]/10 text-[#0B5CFF] flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Profile Settings</h2>
              <p className="text-[11px] text-slate-500">Manage your dynamic Zoom profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Avatar Preview */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-14 h-14 rounded-full bg-[#0B5CFF] text-white font-bold text-lg flex items-center justify-center shadow-md ring-4 ring-blue-50">
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{displayName || "Your Name"}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[10px] font-medium">
                  <Shield className="w-2.5 h-2.5" /> Licensed Host
                </span>
                <span className="text-[11px] text-slate-400">• Active</span>
              </div>
            </div>
          </div>

          {/* Error / Success Feedback */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label htmlFor="profileDisplayName" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Display Name (shown in meetings)
              </label>
              <input
                id="profileDisplayName"
                type="text"
                required
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setErrorMessage("");
                }}
                placeholder="e.g. Aditya Raj"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#0B5CFF] focus:ring-4 focus:ring-blue-100 transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                This name is dynamically displayed across your calls, instant meetings, and participant tiles.
              </p>
            </div>

            <div>
              <label htmlFor="profileEmail" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="profileEmail"
                  type="email"
                  disabled
                  value={currentUser.email || "aditya.raj@zoomclone.local"}
                  className="w-full h-11 pl-9 pr-3.5 rounded-xl border border-slate-200 bg-slate-100/70 text-sm text-slate-500 cursor-not-allowed outline-none font-mono text-xs"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !displayName.trim()}
              className="px-5 py-2 rounded-xl bg-[#0B5CFF] hover:bg-[#004BDE] disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
