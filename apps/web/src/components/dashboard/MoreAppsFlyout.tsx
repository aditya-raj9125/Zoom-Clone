"use client";

import React from "react";
import {
  Calendar,
  Sparkles,
  Layout,
  FileText,
  Table,
  Presentation,
  SquareCheck,
  Video,
  ListTodo,
  StickyNote,
  Users,
} from "lucide-react";

interface MoreAppsFlyoutProps {
  onClose: () => void;
}

export function MoreAppsFlyout({ onClose }: MoreAppsFlyoutProps) {
  const apps = [
    { name: "Scheduler", icon: Calendar, color: "text-blue-500" },
    { name: "Hub", icon: Sparkles, color: "text-purple-500", badge: "NEW" },
    { name: "Canvas", icon: Layout, color: "text-indigo-500" },
    { name: "Paper", icon: FileText, color: "text-amber-500" },
    { name: "Sheets", icon: Table, color: "text-emerald-500" },
    { name: "Slides", icon: Presentation, color: "text-orange-500" },
    { name: "Whiteboards", icon: SquareCheck, color: "text-blue-600" },
    { name: "Clips", icon: Video, color: "text-rose-500" },
    { name: "Tasks", icon: ListTodo, color: "text-teal-500" },
    { name: "Notes", icon: StickyNote, color: "text-yellow-500" },
    { name: "Contacts", icon: Users, color: "text-cyan-600" },
  ];

  return (
    <div
      className="absolute left-18 top-20 w-68 rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-black/10 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-800"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="grid grid-cols-3 gap-3">
        {apps.map((app) => {
          const Icon = app.icon;
          return (
            <button
              key={app.name}
              onClick={() => {
                alert(`${app.name} app selected`);
                onClose();
              }}
              className="relative flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
            >
              {app.badge && (
                <span className="absolute top-1 right-1 rounded-full bg-blue-100 text-[#0B5CFF] text-[9px] font-bold px-1 py-0.2">
                  {app.badge}
                </span>
              )}
              <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-white flex items-center justify-center border border-slate-100 shadow-xs mb-1.5 transition-transform group-hover:scale-105">
                <Icon className={`w-4 h-4 ${app.color}`} />
              </div>
              <span className="text-[11px] text-slate-700 font-medium text-center truncate w-full">
                {app.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="my-3 border-t border-slate-100" />

      <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
        <span>Drag to pin or remove from toolbar</span>
        <button
          onClick={() => alert("Toolbar reset to defaults")}
          className="text-[#0B5CFF] hover:underline font-medium cursor-pointer"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
