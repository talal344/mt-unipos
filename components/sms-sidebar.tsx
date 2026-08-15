"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSMS, SMSRole } from "@/context/sms-context";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck2,
  Award,
  FileText,
  CreditCard,
  Clock,
  BookOpen,
  Bus,
  Library,
  Settings,
  ChevronDown,
  ShieldCheck,
  ArrowLeft,
  MessageSquare,
  ShieldAlert,
  ScanLine,
  UserPlus,
  Trophy,
  CalendarRange,
  BedDouble,
  Stethoscope,
  Sparkles
} from "lucide-react";

export default function SMSSidebar() {
  const pathname = usePathname();
  const {
    activeRole,
    setActiveRole,
    campuses,
    selectedCampus,
    setSelectedCampus,
    sessions,
    selectedSession,
    setSelectedSession
  } = useSMS();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roleColors: Record<SMSRole, { bg: string; text: string; border: string; label: string }> = {
    Owner: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", label: "👑 Owner / Director" },
    Principal: { bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/30", label: "👔 Principal / Head" },
    Teacher: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", label: "👩‍🏫 Faculty / Teacher" },
    Student: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30", label: "🎒 Student Portal" },
    Parent: { bg: "bg-pink-500/10", text: "text-pink-400", border: "border-pink-500/30", label: "👨‍👩‍👧 Parent Portal" },
    HR: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/30", label: "👥 School HR" },
    Finance: { bg: "bg-teal-500/10", text: "text-teal-400", border: "border-teal-500/30", label: "💳 Accounts & Fees" }
  };

  const navGroups = [
    {
      groupTitle: "Main Command Hub",
      items: [
        { href: "/sms", label: "Dashboard", icon: LayoutDashboard },
        { href: "/sms/whatsapp", label: "WhatsApp Gateway", icon: MessageSquare, badge: "Auto" }
      ]
    },
    {
      groupTitle: "Students & Admissions",
      items: [
        { href: "/sms/students", label: "Student 360 & Directory", icon: Users, badge: "Core" },
        { href: "/sms/admissions-online", label: "Online Admissions & Merit", icon: UserPlus, badge: "CRM" }
      ]
    },
    {
      groupTitle: "Academics & Operations",
      items: [
        { href: "/sms/classes", label: "Campus & Classes", icon: Building2 },
        { href: "/sms/attendance", label: "Morning Attendance", icon: CalendarCheck2 },
        { href: "/sms/gate", label: "Gate RFID & Visitor Pass", icon: ShieldAlert, badge: "Pass" },
        { href: "/sms/timetable", label: "Timetable & Matrix", icon: Clock },
        { href: "/sms/lms", label: "Digital LMS & Diary", icon: BookOpen }
      ]
    },
    {
      groupTitle: "Exams & Evaluation",
      items: [
        { href: "/sms/exams", label: "Exams & A4 Report Cards", icon: Award },
        { href: "/sms/omr-grader", label: "OMR Bubble Sheet Grader", icon: ScanLine, badge: "AI OMR" },
        { href: "/sms/paper-generator", label: "Board Exam Paper Builder", icon: FileText, badge: "Builder" }
      ]
    },
    {
      groupTitle: "Finance & Accounts",
      items: [
        { href: "/sms/fees", label: "3-Copy Challan & Cashier", icon: CreditCard }
      ]
    },
    {
      groupTitle: "Campus Life & Facilities",
      items: [
        { href: "/sms/house-system", label: "House Points & Merits", icon: Trophy },
        { href: "/sms/ptm", label: "PTM Slot Scheduler", icon: CalendarRange },
        { href: "/sms/hostel", label: "Hostel & Mess Dining", icon: BedDouble },
        { href: "/sms/clinic", label: "School Clinic & Health", icon: Stethoscope },
        { href: "/sms/transport", label: "Transport Fleet", icon: Bus },
        { href: "/sms/library", label: "Library Catalog", icon: Library },
        { href: "/sms/settings", label: "SMS Configuration", icon: Settings }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#080d14] border-r border-[#1e293b] flex flex-col justify-between shrink-0 min-h-screen font-sans">
      {/* Top Section */}
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="p-4 border-b border-[#1e293b] flex items-center justify-between">
          <Link href="/sms" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-sky-600/20 group-hover:scale-105 transition duration-300">
              <GraduationCap size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black tracking-tight text-white text-base">MT CORE</span>
                <span className="text-[10px] bg-sky-500/20 border border-sky-500/40 text-sky-400 font-black px-1.5 py-0.2 rounded uppercase">
                  SMS
                </span>
              </div>
              <span className="text-[10px] text-gray-400 block font-medium">Enterprise School ERP</span>
            </div>
          </Link>
        </div>

        {/* Multi-Role Switcher */}
        <div className="p-3 border-b border-[#1e293b] bg-black/30">
          <div className="text-[9px] uppercase font-bold text-gray-400 mb-1.5 flex items-center justify-between">
            <span>Active Perspective</span>
            <span className="text-[9px] text-sky-400 font-mono">RBAC</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs font-bold transition ${roleColors[activeRole].bg} ${roleColors[activeRole].border} ${roleColors[activeRole].text}`}
            >
              <span>{roleColors[activeRole].label}</span>
              <ChevronDown size={14} className={`transition transform ${roleDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {roleDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0e1624] border border-[#1e293b] rounded-xl shadow-2xl z-50 p-1 space-y-0.5 animate-fade-in-up">
                {(["Owner", "Principal", "Teacher", "Student", "Parent", "HR", "Finance"] as SMSRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setActiveRole(r);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-between ${
                      activeRole === r ? "bg-sky-600 text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>{roleColors[r].label}</span>
                    {activeRole === r && <ShieldCheck size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Campus & Session Quick Selector */}
        <div className="p-3 border-b border-[#1e293b] space-y-2 text-xs">
          <div>
            <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase mb-1">
              <span>Campus Branch</span>
            </div>
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="w-full bg-black/60 border border-[#1e293b] p-1.5 rounded-lg text-[11px] text-white font-semibold focus:outline-none focus:border-sky-500"
            >
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase mb-1">
              <span>Academic Session</span>
            </div>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full bg-black/60 border border-[#1e293b] p-1.5 rounded-lg text-[11px] text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.isCurrent ? "★ Active" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="p-2 space-y-4 overflow-y-auto max-h-[calc(100vh-340px)] custom-scrollbar">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 text-[9px] font-black uppercase tracking-wider text-gray-500">
                {group.groupTitle}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/sms" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-bold shadow-md shadow-sky-600/20"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={15} className={isActive ? "text-white" : "text-gray-400"} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[8px] font-black px-1.5 py-0.2 rounded uppercase ${
                          isActive
                            ? "bg-white/20 text-white"
                            : item.badge.includes("OMR") || item.badge === "Auto"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Return Navigation */}
      <div className="p-3 border-t border-[#1e293b] bg-black/40 space-y-2">
        <Link
          href="/"
          className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold transition group border border-white/5"
        >
          <div className="flex items-center gap-2">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition" />
            <span>Main Platform</span>
          </div>
          <span className="text-[9px] text-gray-500 uppercase">POS &amp; HRMS</span>
        </Link>
      </div>
    </aside>
  );
}
