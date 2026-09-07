"use client";

import React, { useState } from "react";
import { MessageSquare, Cookie, X, Send, Bot, Sparkles, Check } from "lucide-react";

export function FloatingWidgets() {
  const [cookieModalOpen, setCookieModalOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: "bot" | "user"; text: string }[]>([
    { role: "bot", text: "Hello! I'm your Zoom Virtual Assistant. How can I help you today?" },
  ]);
  const [inputText, setInputText] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setChatMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInputText("");

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: `Thanks for asking about "${userMsg}"! Zoom Workplace combines video meetings, AI Companion, and team chat. Would you like to start a free trial or speak to our enterprise sales team?`,
        },
      ]);
    }, 600);
  };

  return (
    <>
      {/* Bottom-Left Cookie Consent Button */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setCookieModalOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#48B02C] text-white shadow-xl hover:scale-110 active:scale-95 transition-all border-2 border-white cursor-pointer"
          aria-label="Cookie Preferences"
        >
          {/* Custom Cookie Icon */}
          <Cookie className="h-6 w-6" />
        </button>
      </div>

      {/* Bottom-Right Live Chat Widget Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0B5CFF] text-white shadow-2xl hover:bg-blue-600 hover:scale-110 active:scale-95 transition-all border-2 border-white cursor-pointer"
          aria-label="Open Zoom Virtual Assistant"
        >
          {chatOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6 fill-white" />}
        </button>
      </div>

      {/* Cookie Preferences Modal */}
      {cookieModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Cookie className="h-5 w-5 text-[#48B02C]" />
                <h3 className="font-bold text-slate-900 text-lg">Privacy & Cookie Settings</h3>
              </div>
              <button
                onClick={() => setCookieModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-600 leading-relaxed">
              We use cookies to deliver our services, analyze site traffic, and personalize content. You can manage your preferences or accept all cookies.
            </p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <div>
                  <p className="font-semibold text-xs text-slate-800">Strictly Necessary Cookies</p>
                  <p className="text-[11px] text-slate-500">Essential for site functionality</p>
                </div>
                <span className="text-xs font-bold text-slate-400">Always Active</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <div>
                  <p className="font-semibold text-xs text-slate-800">Analytics & Performance</p>
                  <p className="text-[11px] text-slate-500">Helps us understand how visitors interact</p>
                </div>
                <span className="flex h-5 w-5 items-center justify-center rounded bg-[#0B5CFF] text-white">
                  <Check className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setCookieModalOpen(false)}
                className="rounded-full bg-slate-100 px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Reject Non-Essential
              </button>
              <button
                onClick={() => setCookieModalOpen(false)}
                className="rounded-full bg-[#0B5CFF] px-6 py-2 text-xs font-semibold text-white hover:bg-blue-600 shadow-sm"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Window */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-full max-w-sm rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Chat Header */}
          <div className="bg-[#0B5CFF] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center text-white">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-sm leading-none">Zoom Assistant</p>
                <p className="text-[10px] text-blue-100 mt-0.5 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="p-1 rounded-full hover:bg-white/10 text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="p-4 space-y-3 h-72 overflow-y-auto bg-slate-50 text-xs">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-2xl px-3.5 py-2 max-w-[85%] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#0B5CFF] text-white rounded-br-xs"
                      : "bg-white text-slate-800 shadow-xs border border-slate-100 rounded-bl-xs"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 text-xs outline-none px-3 py-2 rounded-full bg-slate-100 focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="h-8 w-8 rounded-full bg-[#0B5CFF] text-white flex items-center justify-center hover:bg-blue-600 transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
