"use client";

import React, { useState, useEffect, useMemo } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import { useGlobalContext } from "@/context/global-context";
import {
  Megaphone,
  Plus,
  Pin,
  AlertCircle,
  Calendar,
  Building2,
  Users,
  Search,
  Filter,
  X,
  Clock,
  Sparkles,
  CheckCircle2
} from "lucide-react";

interface HRAnnouncement {
  id: string;
  title: string;
  content: string;
  targetAudience: "All" | "Department" | "Executive";
  targetDepartment?: string;
  priority: "Normal" | "Important" | "Urgent";
  postedBy: string;
  postedAt: string;
  isPinned: boolean;
  isActive: boolean;
}

export default function HRAnnouncementsPage() {
  const { currentUser, hrDepartments } = useGlobalContext();
  const [announcements, setAnnouncements] = useState<HRAnnouncement[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (currentUser?.tenantId) {
      const key = `hr_announcements_${currentUser.tenantId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed: HRAnnouncement[] = JSON.parse(saved);
          const filtered = parsed.filter(a => a.id !== "ANN-1" && a.id !== "ANN-2" && a.id !== "ANN-3" && !a.id.startsWith("ANN-DEFAULT"));
          setAnnouncements(filtered);
          if (filtered.length !== parsed.length) {
            localStorage.setItem(key, JSON.stringify(filtered));
          }
        } catch {
          setAnnouncements([]);
        }
      } else {
        setAnnouncements([]);
      }
    }
  }, [currentUser?.tenantId]);

  const saveAnnouncements = (data: HRAnnouncement[]) => {
    setAnnouncements(data);
    if (currentUser?.tenantId) {
      localStorage.setItem(`hr_announcements_${currentUser.tenantId}`, JSON.stringify(data));
    }
  };

  const [form, setForm] = useState({
    title: "",
    content: "",
    targetAudience: "All" as HRAnnouncement["targetAudience"],
    targetDepartment: "",
    priority: "Normal" as HRAnnouncement["priority"],
    isPinned: false
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newAnn: HRAnnouncement = {
      id: `ANN-${Date.now()}`,
      title: form.title,
      content: form.content,
      targetAudience: form.targetAudience,
      targetDepartment: form.targetDepartment || undefined,
      priority: form.priority,
      postedBy: currentUser?.name || "HR Admin",
      postedAt: new Date().toISOString().split("T")[0],
      isPinned: form.isPinned,
      isActive: true
    };

    saveAnnouncements([newAnn, ...announcements]);
    setShowAddModal(false);
    setForm({
      title: "",
      content: "",
      targetAudience: "All",
      targetDepartment: "",
      priority: "Normal",
      isPinned: false
    });
  };

  const togglePin = (id: string) => {
    const updated = announcements.map((a) => (a.id === id ? { ...a, isPinned: !a.isPinned } : a));
    saveAnnouncements(updated);
  };

  const toggleArchive = (id: string) => {
    const updated = announcements.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a));
    saveAnnouncements(updated);
  };

  const filteredAnnouncements = useMemo(() => {
    return announcements
      .filter((a) => {
        const q = searchQuery.toLowerCase();
        const matchQ = q === "" || a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q);
        const matchPri = filterPriority === "All" || a.priority === filterPriority;
        return matchQ && matchPri && a.isActive;
      })
      .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  }, [announcements, searchQuery, filterPriority]);

  return (
    <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans">
      <HRMSSidebar />
      <main className="flex-grow p-6 space-y-6 overflow-y-auto max-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-5">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Megaphone size={22} className="text-emerald-400" />
              Company Bulletin & Internal Announcements
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Broadcast critical policy updates, events, and notices to company employees.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-950/40"
          >
            <Plus size={15} /> Publish Announcement
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-[#0b0f17] border border-gray-800 p-3 rounded-2xl">
          <div className="relative w-full md:w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-gray-800 pl-9 pr-3 py-2 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-2">
            {["All", "Urgent", "Important", "Normal"].map((pri) => (
              <button
                key={pri}
                onClick={() => setFilterPriority(pri)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                  filterPriority === pri
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-black/50 text-gray-400 border border-gray-800 hover:text-white"
                }`}
              >
                {pri}
              </button>
            ))}
          </div>
        </div>

        {/* Announcements Stream */}
        <div className="space-y-4">
          {filteredAnnouncements.length === 0 ? (
            <div className="p-12 text-center text-gray-500 bg-[#0b0f17] border border-gray-800 rounded-2xl">
              No active announcements found.
            </div>
          ) : (
            filteredAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className={`bg-[#0b0f17] border rounded-2xl p-5 space-y-3 transition relative overflow-hidden ${
                  ann.isPinned
                    ? "border-emerald-500/40 bg-gradient-to-r from-emerald-950/20 via-[#0b0f17] to-[#0b0f17]"
                    : ann.priority === "Urgent"
                    ? "border-red-500/30"
                    : "border-gray-800 hover:border-gray-700"
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {ann.isPinned && (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                          <Pin size={10} /> Pinned
                        </span>
                      )}
                      <span
                        className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                          ann.priority === "Urgent"
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : ann.priority === "Important"
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                            : "bg-gray-800 text-gray-300 border-gray-700"
                        }`}
                      >
                        {ann.priority} Priority
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                        <Users size={12} /> {ann.targetAudience === "All" ? "Company-wide" : ann.targetDepartment || ann.targetAudience}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-white leading-snug pt-1">{ann.title}</h2>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => togglePin(ann.id)}
                      className={`p-2 rounded-xl transition ${
                        ann.isPinned
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-black/50 text-gray-500 hover:text-white border border-gray-800"
                      }`}
                      title={ann.isPinned ? "Unpin notice" : "Pin to top"}
                    >
                      <Pin size={14} />
                    </button>
                    <button
                      onClick={() => toggleArchive(ann.id)}
                      className="p-2 rounded-xl bg-black/50 text-gray-500 hover:text-red-400 border border-gray-800 transition"
                      title="Archive notice"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{ann.content}</p>

                {/* Footer info */}
                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-3 border-t border-gray-800/80 font-mono">
                  <span>Issued by: {ann.postedBy}</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {ann.postedAt}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c1018] border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Megaphone size={16} className="text-emerald-400" />
                Compose Company Announcement
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-4 space-y-3.5">
              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Headline / Subject</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Office Relocation & Working Hours Notice"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                    className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="Urgent">Urgent Broadcast</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Target Audience</label>
                  <select
                    value={form.targetAudience}
                    onChange={(e) => setForm({ ...form, targetAudience: e.target.value as any })}
                    className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                  >
                    <option value="All">All Employees</option>
                    <option value="Department">Specific Department</option>
                    <option value="Executive">Executive Only</option>
                  </select>
                </div>
              </div>

              {form.targetAudience === "Department" && (
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Select Department</label>
                  <select
                    value={form.targetDepartment}
                    onChange={(e) => setForm({ ...form, targetDepartment: e.target.value })}
                    className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select Department...</option>
                    {hrDepartments.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Message Body</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Full announcement details..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinNotice"
                  checked={form.isPinned}
                  onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                  className="rounded bg-black border-gray-800 text-emerald-500"
                />
                <label htmlFor="pinNotice" className="text-xs text-gray-300 font-bold cursor-pointer">
                  Pin announcement to top of feed
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs p-3 rounded-xl transition mt-2 shadow-lg shadow-emerald-950/50"
              >
                Broadcast Notice
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
