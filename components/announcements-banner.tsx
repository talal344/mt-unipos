"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGlobalContext } from "@/context/global-context";
import {
  Megaphone,
  Pin,
  AlertCircle,
  ChevronRight,
  X,
  Sparkles,
  Calendar,
  Eye,
  Bell
} from "lucide-react";

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  targetAudience?: "All" | "Department" | "Executive";
  targetDepartment?: string;
  priority: "Normal" | "Important" | "Urgent";
  postedBy: string;
  postedAt: string;
  isPinned?: boolean;
  isActive?: boolean;
}

export default function AnnouncementsBanner() {
  const pathname = usePathname();
  const { currentUser } = useGlobalContext();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);

  // Strictly only show on Main Dashboard
  if (pathname !== "/hrms" && pathname !== "/dashboard") {
    return null;
  }

  useEffect(() => {
    if (typeof window === "undefined") return;

    const tenantId = currentUser?.tenantId || "default";
    const key = `hr_announcements_${tenantId}`;
    const saved = localStorage.getItem(key);

    if (saved) {
      try {
        const parsed: AnnouncementItem[] = JSON.parse(saved);
        const active = parsed.filter((a) => a.isActive !== false);
        if (active.length > 0) {
          setAnnouncements(active);
          return;
        }
      } catch (e) {}
    }

    // Default announcement fallback
    const fallback: AnnouncementItem[] = [
      {
        id: "ANN-DEFAULT-1",
        title: "🌟 Annual Performance Bonus & Salary Review Announcement",
        content:
          "We are pleased to announce that annual performance appraisals and market adjustment increments for Q3/Q4 have been finalized. Payslips will reflect revised compensation from the upcoming billing cycle.",
        priority: "Urgent",
        postedBy: "Executive Leadership",
        postedAt: new Date().toISOString().split("T")[0],
        isPinned: true,
        isActive: true
      },
      {
        id: "ANN-DEFAULT-2",
        title: "🏢 Office System Upgrade & Scheduled Maintenance Notice",
        content:
          "Cloud ERP and on-premise local servers will undergo routine security patching this weekend. No disruption expected for POS checkout registers.",
        priority: "Important",
        postedBy: "IT Operations",
        postedAt: new Date().toISOString().split("T")[0],
        isPinned: false,
        isActive: true
      }
    ];
    setAnnouncements(fallback);
  }, [currentUser?.tenantId]);

  // Auto rotate banner if multiple announcements
  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  if (dismissed || announcements.length === 0) return null;

  const current = announcements[currentIndex] || announcements[0];

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-[#0b1219] to-[#070b10] p-3.5 sm:p-4 shadow-xl shadow-emerald-950/20 backdrop-blur-md">
        {/* Subtle glowing animated background pulse */}
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          {/* Left badge & content */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0 relative">
              <Megaphone size={18} className="animate-bounce" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Company Announcement
                </span>
                {current.isPinned && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 flex items-center gap-1 border border-amber-500/30">
                    <Pin size={9} /> Pinned
                  </span>
                )}
                <span
                  className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    current.priority === "Urgent"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : current.priority === "Important"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {current.priority}
                </span>
                <span className="text-[10px] text-gray-500 font-mono hidden sm:inline">
                  {current.postedAt} &bull; by {current.postedBy}
                </span>
              </div>

              <div
                onClick={() => setSelectedAnnouncement(current)}
                className="text-xs sm:text-sm font-bold text-white hover:text-emerald-300 transition cursor-pointer truncate"
              >
                {current.title}
              </div>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {announcements.length > 1 && (
              <div className="flex items-center gap-1 text-[10px] font-mono text-gray-400 px-2 py-1 bg-black/40 rounded-lg border border-gray-800">
                <span>{currentIndex + 1}</span>
                <span>/</span>
                <span>{announcements.length}</span>
              </div>
            )}

            <button
              onClick={() => setSelectedAnnouncement(current)}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition shadow-md shadow-emerald-950/40"
            >
              <Eye size={13} /> View Notice
            </button>

            <Link
              href="/hrms/announcements"
              className="text-[11px] font-bold text-gray-400 hover:text-emerald-400 px-2 py-1.5 rounded-xl hover:bg-emerald-500/10 transition flex items-center gap-0.5"
            >
              All <ChevronRight size={13} />
            </Link>

            <button
              onClick={() => setDismissed(true)}
              className="text-gray-500 hover:text-gray-300 p-1.5 rounded-lg hover:bg-white/5 transition"
              title="Dismiss for this session"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Full Modal Popover */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#0c1219] border border-gray-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4">
            <div className="flex justify-between items-start p-5 border-b border-gray-800 bg-black/40">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                      selectedAnnouncement.priority === "Urgent"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : selectedAnnouncement.priority === "Important"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {selectedAnnouncement.priority} Priority
                  </span>
                  {selectedAnnouncement.isPinned && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 flex items-center gap-1 border border-amber-500/30">
                      <Pin size={9} /> Pinned Notice
                    </span>
                  )}
                </div>
                <h2 className="text-base font-bold text-white pt-1">{selectedAnnouncement.title}</h2>
              </div>

              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 text-xs text-gray-200 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto">
              {selectedAnnouncement.content}
            </div>

            <div className="flex items-center justify-between p-4 border-t border-gray-800/80 bg-black/40 text-[11px] text-gray-500 font-mono">
              <span>Published by: {selectedAnnouncement.postedBy}</span>
              <span className="flex items-center gap-1">
                <Calendar size={12} /> {selectedAnnouncement.postedAt}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
