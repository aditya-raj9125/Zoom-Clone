"use client";

import React from "react";
import Link from "next/link";
import {
  Settings,
  User,
  Info,
  HelpCircle,
  Globe,
  LogOut,
  Download,
  Check,
} from "lucide-react";
import { api } from "@/lib/api";

interface UserProfileDropdownProps {
  displayName: string;
  email: string;
  status: string;
  onStatusChange: (status: string) => void;
  onClose: () => void;
}

export function UserProfileDropdown({
  displayName,
  email,
  status,
  onStatusChange,
  onClose,
}: UserProfileDropdownProps) {
  const statuses = [
    { label: "Available", color: "bg-emerald-500", icon: "🟢" },
    { label: "Busy", color: "bg-red-500", icon: "🔴" },
    { label: "Do Not Disturb", color: "bg-red-600", icon: "⛔" },
    { label: "Away", color: "bg-amber-500", icon: "🕒" },
    { label: "Out of Office", color: "bg-slate-400", icon: "📅" },
  ];

  return (
    <div
      className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white p-3 shadow-2xl ring-1 ring-black/10 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-800 text-xs font-normal"
      onClick={(e) => e.stopPropagation()}
    >
      {/* User Info */}
      <div className="px-2 py-1.5">
        <p className="font-bold text-sm text-slate-900 truncate">{displayName}</p>
        <p className="text-[11px] text-slate-500 truncate">{email}</p>
      </div>

      <div className="my-2 border-t border-slate-100" />

      {/* Settings */}
      <button
        onClick={() => {
          alert("Settings panel opened");
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
      >
        <Settings className="w-3.5 h-3.5 text-slate-500" />
        <span>Settings</span>
      </button>

      <div className="my-1.5 border-t border-slate-100" />

      {/* Presence Status */}
      <div className="space-y-0.5">
        {statuses.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              onStatusChange(item.label);
              onClose();
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-2 h-2 rounded-full ${item.color}`} />
              <span>{item.label}</span>
            </div>
            {status === item.label && <Check className="w-3 h-3 text-[#0B5CFF]" />}
          </button>
        ))}
      </div>

      <div className="my-2 border-t border-slate-100" />

      {/* Menu Links */}
      <div className="space-y-0.5">
        <button
          onClick={onClose}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
        >
          <User className="w-3.5 h-3.5 text-slate-500" />
          <span>My Profile</span>
        </button>
        <button
          onClick={onClose}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
        >
          <Info className="w-3.5 h-3.5 text-slate-500" />
          <span>About</span>
        </button>
        <button
          onClick={onClose}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>Help</span>
        </button>
        <div className="flex items-center justify-between px-2.5 py-1.5 text-slate-700">
          <div className="flex items-center gap-2.5">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>Language</span>
          </div>
          <span className="text-[11px] text-slate-400">English</span>
        </div>

        <button
          type="button"
          onClick={async () => {
            onClose();
            try {
              await api.logout();
            } catch {
              // ignore
            }
            window.location.href = "/signin";
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors cursor-pointer text-left"
        >
          <LogOut className="w-3.5 h-3.5 text-red-500" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="my-2 border-t border-slate-100" />

      {/* Download app link */}
      <a
        href="#download"
        onClick={onClose}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#0B5CFF] hover:bg-blue-50 font-medium transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Download the Zoom app</span>
      </a>
    </div>
  );
}
