"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useSMS, SMSRole } from "@/context/sms-context";
import {
  Users,
  GraduationCap,
  Award,
  CreditCard,
  CalendarCheck2,
  Building2,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Bus,
  Library,
  FileText,
  DollarSign,
  UserCheck,
  Percent,
  PlusCircle,
  Bell,
  ArrowRight,
  ShieldCheck,
  Printer,
  MessageSquare,
  ScanLine,
  Trash2,
  Trophy,
  ShieldAlert,
  CalendarRange,
  BedDouble,
  Stethoscope,
  Sparkles,
  Zap
} from "lucide-react";

export default function SMSDashboard() {
  const {
    theme,
    activeRole,
    campuses,
    selectedCampus,
    students,
    teachers,
    classes,
    feeVouchers,
    examTerms,
    marks,
    notices,
    timetable,
    whatsappLogs,
    gateVisitors,
    gatePunchLogs,
    houses,
    deleteCampusWing
  } = useSMS();

  const isLight = theme === "light";
  const activeCampus = campuses.find((c) => c.id === selectedCampus) || campuses[0];

  // Global KPIs
  const totalStudents = students.filter((s) => s.status === "Active").length;
  const totalTeachers = teachers.filter((t) => t.status === "Active").length;
  const totalClassesCount = classes.length;
  
  // Financial KPIs
  const totalFeeExpected = useMemo(() => feeVouchers.reduce((acc, v) => acc + v.totalPayable, 0), [feeVouchers]);
  const totalFeeCollected = useMemo(() => feeVouchers.reduce((acc, v) => acc + (v.paidAmount || 0), 0), [feeVouchers]);
  const totalDefaulters = useMemo(() => feeVouchers.filter((v) => v.status === "Unpaid" || v.status === "Overdue").length, [feeVouchers]);
  const collectionRate = totalFeeExpected > 0 ? Math.round((totalFeeCollected / totalFeeExpected) * 100) : 0;

  // Primary demo student for Student/Parent portal perspective
  const demoStudent = students[0];

  return (
    <div className="space-y-8 w-full max-w-none pb-16 font-sans">
      {/* Top Executive Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#071326] via-[#0b1d3a] to-[#042838] border border-sky-500/30 shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-black uppercase tracking-wider">
              <ShieldCheck size={14} className="text-sky-400" />
              <span>{activeRole} Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {activeCampus.name}
            </h1>
            <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
              Unified School ERP Suite: Multi-Campus Governance, AI OMR Sheet Auto-Grading, Smart Turnstile RFID Gate, 3-Copy Bank Challan Billing &amp; Automated WhatsApp Broadcasts.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              href="/sms/users"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <Users size={14} />
              <span>User Credentials &amp; RBAC</span>
            </Link>
            <Link
              href="/sms/whatsapp"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition cursor-pointer"
            >
              <MessageSquare size={14} />
              <span>WhatsApp Alerts</span>
            </Link>
            <Link
              href="/sms/omr-grader"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg shadow-purple-600/30 transition cursor-pointer"
            >
              <ScanLine size={14} />
              <span>AI OMR Grader</span>
            </Link>
            <Link
              href="/sms/fees?action=collect"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:opacity-90 text-white font-black text-xs shadow-lg shadow-sky-600/30 transition cursor-pointer"
            >
              <CreditCard size={14} />
              <span>Fee Counter</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Faculty Teaching & Quick Upload Desk */}
      <div className={`p-5 rounded-3xl border transition shadow-lg ${
        isLight
          ? "bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 border-sky-200 text-slate-900"
          : "bg-gradient-to-r from-sky-950/40 via-indigo-950/40 to-purple-950/40 border-sky-500/30 text-white"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase text-sky-600 tracking-wider">
              <Sparkles size={15} />
              <span>Teacher Teaching &amp; Upload Center</span>
            </div>
            <h2 className={`text-base font-black ${isLight ? "text-slate-900" : "text-white"}`}>
              Assigned Class Paper Marks &amp; Daily Attendance Upload
            </h2>
            <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-300"}`}>
              Subject masters and class incharge teachers can upload student-wise exam marks, log morning class attendance, and notify parents.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/sms/exams"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-sky-600/20 transition cursor-pointer"
            >
              <Award size={15} />
              <span>Upload Paper Marks</span>
            </Link>

            <Link
              href="/sms/attendance"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/20 transition cursor-pointer"
            >
              <CalendarCheck2 size={15} />
              <span>Upload Class Attendance</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Global 4-Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className={`p-5 rounded-2xl border transition group shadow-sm hover:shadow-md ${
          isLight ? "bg-white border-slate-200 hover:border-sky-300" : "bg-[#0b121e]/90 border-[#1e293b] hover:border-sky-500/40"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-gray-400"}`}>Enrolled Students</span>
            <div className={`p-2.5 rounded-xl ${isLight ? "bg-sky-50 text-sky-700" : "bg-sky-500/10 text-sky-400"} group-hover:scale-110 transition`}>
              <Users size={18} />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black ${isLight ? "text-slate-950" : "text-white"}`}>{totalStudents}</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <TrendingUp size={12} />
            <span>100% Verified GR Registry</span>
          </div>
        </div>

        {/* Total Faculty */}
        <div className={`p-5 rounded-2xl border transition group shadow-sm hover:shadow-md ${
          isLight ? "bg-white border-slate-200 hover:border-indigo-300" : "bg-[#0b121e]/90 border-[#1e293b] hover:border-indigo-500/40"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-gray-400"}`}>Teaching Faculty</span>
            <div className={`p-2.5 rounded-xl ${isLight ? "bg-indigo-50 text-indigo-700" : "bg-indigo-500/10 text-indigo-400"} group-hover:scale-110 transition`}>
              <GraduationCap size={18} />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black ${isLight ? "text-slate-950" : "text-white"}`}>{totalTeachers}</div>
          <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"} font-semibold mt-1`}>
            <span>Subject Masters Appointed</span>
          </div>
        </div>

        {/* Total Fee Collected */}
        <div className={`p-5 rounded-2xl border transition group shadow-sm hover:shadow-md ${
          isLight ? "bg-white border-slate-200 hover:border-emerald-300" : "bg-[#0b121e]/90 border-[#1e293b] hover:border-emerald-500/40"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-gray-400"}`}>Fee Collection</span>
            <div className={`p-2.5 rounded-xl ${isLight ? "bg-emerald-50 text-emerald-700" : "bg-emerald-500/10 text-emerald-400"} group-hover:scale-110 transition`}>
              <CreditCard size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            Rs {totalFeeCollected.toLocaleString()}
          </div>
          <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"} font-semibold mt-1`}>
            <span>{collectionRate}% Collected &bull; Rs {totalFeeExpected.toLocaleString()} Expected</span>
          </div>
        </div>

        {/* Classes & Sections */}
        <div className={`p-5 rounded-2xl border transition group shadow-sm hover:shadow-md ${
          isLight ? "bg-white border-slate-200 hover:border-purple-300" : "bg-[#0b121e]/90 border-[#1e293b] hover:border-purple-500/40"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-gray-400"}`}>Active Sections</span>
            <div className={`p-2.5 rounded-xl ${isLight ? "bg-purple-50 text-purple-700" : "bg-purple-500/10 text-purple-400"} group-hover:scale-110 transition`}>
              <Building2 size={18} />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black ${isLight ? "text-slate-950" : "text-white"}`}>{totalClassesCount}</div>
          <div className="text-[10px] text-purple-600 font-bold mt-1">
            <span>Class Teachers &amp; CR/GR Appointed</span>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* ENTERPRISE REAL-TIME WIDGETS ROW                                              */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Widget 1: Gate Security Live Feed */}
        <div className={`p-5 rounded-2xl border space-y-3 shadow-sm ${
          isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-[#1e293b] text-white"
        }`}>
          <div className={`flex justify-between items-center border-b pb-3 ${isLight ? "border-slate-100" : "border-gray-800"}`}>
            <div className="flex items-center gap-2 text-sky-600 font-black text-xs uppercase">
              <ShieldAlert size={15} />
              <span>Smart Gate Turnstile Feed</span>
            </div>
            <Link href="/sms/gate" className="text-[10px] text-sky-600 hover:underline font-bold">
              View All &rarr;
            </Link>
          </div>

          <div className="space-y-2">
            {gatePunchLogs.slice(0, 3).map((p) => (
              <div key={p.id} className={`p-3 rounded-xl flex justify-between items-center text-xs border ${
                isLight ? "bg-slate-50/80 border-slate-200/80" : "bg-black/40 border-gray-800"
              }`}>
                <div>
                  <div className={`font-black ${isLight ? "text-slate-900" : "text-white"}`}>{p.studentName}</div>
                  <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>{p.className} &bull; ID: {p.admissionNo}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-emerald-600 font-bold">{p.timestamp}</div>
                  <div className={`text-[9px] ${isLight ? "text-slate-400" : "text-gray-500"}`}>{p.punchType.split(" ")[0]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 2: WhatsApp Broadcast Status */}
        <div className={`p-5 rounded-2xl border space-y-3 shadow-sm ${
          isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-[#1e293b] text-white"
        }`}>
          <div className={`flex justify-between items-center border-b pb-3 ${isLight ? "border-slate-100" : "border-gray-800"}`}>
            <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase">
              <MessageSquare size={15} />
              <span>WhatsApp Parent Gateway</span>
            </div>
            <Link href="/sms/whatsapp" className="text-[10px] text-emerald-600 hover:underline font-bold">
              Compose &rarr;
            </Link>
          </div>

          <div className="space-y-2">
            {whatsappLogs.slice(0, 3).map((log) => (
              <div key={log.id} className={`p-3 rounded-xl space-y-1 text-xs border ${
                isLight ? "bg-slate-50/80 border-slate-200/80" : "bg-black/40 border-gray-800"
              }`}>
                <div className="flex justify-between items-center">
                  <span className={`font-black ${isLight ? "text-slate-900" : "text-white"}`}>{log.recipientName}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                    isLight ? "bg-emerald-100 text-emerald-800" : "bg-emerald-500/10 text-emerald-300"
                  }`}>
                    &check;&check; {log.status}
                  </span>
                </div>
                <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"} truncate`}>{log.message}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 3: Inter-House Championship Standings */}
        <div className={`p-5 rounded-2xl border space-y-3 shadow-sm ${
          isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-[#1e293b] text-white"
        }`}>
          <div className={`flex justify-between items-center border-b pb-3 ${isLight ? "border-slate-100" : "border-gray-800"}`}>
            <div className="flex items-center gap-2 text-amber-600 font-black text-xs uppercase">
              <Trophy size={15} />
              <span>House Championship Standings</span>
            </div>
            <Link href="/sms/house-system" className="text-[10px] text-amber-600 hover:underline font-bold">
              Leaderboard &rarr;
            </Link>
          </div>

          <div className="space-y-2">
            {[...houses].sort((a, b) => b.totalPoints - a.totalPoints).map((h, i) => (
              <div key={h.id} className={`p-2.5 rounded-xl flex justify-between items-center text-xs border ${
                isLight ? "bg-slate-50/80 border-slate-200/80" : "bg-black/40 border-gray-800"
              }`}>
                <div className="flex items-center gap-2">
                  <span className="font-black text-xs w-4" style={{ color: h.color }}>#{i + 1}</span>
                  <span className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{h.name}</span>
                </div>
                <span className={`font-black font-mono ${isLight ? "text-slate-950" : "text-white"}`}>{h.totalPoints} PTS</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* ROLE SPECIFIC VIEW ADAPTER                                                    */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}

      {/* 1. OWNER & PRINCIPAL PERSPECTIVE */}
      {(activeRole === "Owner" || activeRole === "Principal") && (
        <div className="space-y-6">
          <div className={`flex items-center justify-between border-b pb-3 ${isLight ? "border-slate-200" : "border-gray-800"}`}>
            <div>
              <h2 className={`text-base font-black ${isLight ? "text-slate-950" : "text-white"}`}>Campus Wings &amp; Academic Hierarchy</h2>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-gray-400"}`}>Hierarchical breakdown by Wings, Class Sections, and Incharge Masters.</p>
            </div>
            <Link
              href="/sms/classes"
              className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1"
            >
              <span>Manage Hierarchy</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeCampus.wings.map((w) => (
              <div key={w.id} className={`p-5 rounded-2xl border space-y-3 relative group transition shadow-sm hover:shadow-md ${
                isLight ? "bg-white border-slate-200 hover:border-sky-300" : "bg-[#0b121e] border-[#1e293b] hover:border-sky-500/40"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-sky-600 font-mono">{w.id}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isLight ? "bg-sky-50 text-sky-700 border border-sky-200" : "bg-sky-500/10 text-sky-300"
                    }`}>
                      {w.totalClasses} Classes
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to remove Campus Wing "${w.name}"?`)) {
                          deleteCampusWing(activeCampus.id, w.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                      title="Remove Campus Wing"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <h3 className={`text-sm font-black ${isLight ? "text-slate-900" : "text-white"}`}>{w.name}</h3>
                <div className={`text-xs ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                  <span>Wing Head: </span>
                  <span className={`font-bold ${isLight ? "text-slate-900" : "text-gray-200"}`}>{w.headName}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Enrolled Classes Table */}
          <div className={`rounded-2xl border overflow-hidden shadow-sm ${
            isLight ? "bg-white border-slate-200" : "bg-[#0b121e] border-[#1e293b]"
          }`}>
            <div className={`p-4 border-b flex justify-between items-center ${
              isLight ? "bg-slate-50/80 border-slate-200" : "bg-black/30 border-gray-800"
            }`}>
              <h3 className={`font-black text-xs uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>
                Class Sections Directory &amp; Appointed Student Leaders (CR &amp; GR)
              </h3>
              <span className={`text-[10px] font-mono ${isLight ? "text-slate-500" : "text-gray-400"}`}>Strict Section Isolation</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className={`border-b text-[11px] font-mono font-bold ${
                    isLight ? "border-slate-200 bg-slate-50 text-slate-600" : "border-gray-800 bg-black/20 text-gray-400"
                  }`}>
                    <th className="p-3.5">Class &amp; Section</th>
                    <th className="p-3.5">Campus Wing</th>
                    <th className="p-3.5">Class Incharge Teacher</th>
                    <th className="p-3.5 text-sky-600">Boy CR</th>
                    <th className="p-3.5 text-pink-600">Girl GR</th>
                    <th className="p-3.5 text-center">Strength / Capacity</th>
                  </tr>
                </thead>
                <tbody className={`divide-y font-mono text-[11px] ${
                  isLight ? "divide-slate-100" : "divide-gray-800/60"
                }`}>
                  {classes.map((cls) => (
                    <tr key={cls.id} className={`${isLight ? "hover:bg-sky-50/50" : "hover:bg-white/[0.02]"} transition`}>
                      <td className="p-3.5 font-sans">
                        <div className={`font-black ${isLight ? "text-slate-900" : "text-white"}`}>{cls.className}</div>
                        <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>{cls.sectionName} &bull; {cls.roomNumber}</div>
                      </td>
                      <td className={`p-3.5 font-sans ${isLight ? "text-slate-600" : "text-gray-400"}`}>{cls.wing}</td>
                      <td className="p-3.5 text-emerald-600 font-sans font-bold">{cls.classTeacherName || "Unassigned"}</td>
                      <td className="p-3.5 text-sky-700 font-bold">{cls.crBoyName || "—"}</td>
                      <td className="p-3.5 text-pink-700 font-bold">{cls.grGirlName || "—"}</td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-lg font-bold border ${
                          isLight ? "bg-sky-50 border-sky-200 text-sky-700" : "bg-sky-500/10 border-sky-500/20 text-sky-400"
                        }`}>
                          {cls.enrolledCount} / {cls.capacity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. TEACHER PERSPECTIVE */}
      {activeRole === "Teacher" && (
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
            isLight ? "bg-white border-emerald-200" : "bg-[#0b121e] border-emerald-500/30"
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isLight ? "border-slate-100" : "border-gray-800"}`}>
              <div className="flex items-center gap-2">
                <CalendarCheck2 size={18} className="text-emerald-600" />
                <h3 className={`font-black text-sm ${isLight ? "text-slate-900" : "text-white"}`}>Faculty Period Schedule &amp; Quick Attendance</h3>
              </div>
              <Link
                href="/sms/attendance"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow"
              >
                Mark Attendance
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans">
              {timetable.map((tt) => (
                <div key={tt.id} className={`p-4 rounded-xl border space-y-2 ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-gray-800"
                }`}>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-emerald-600 font-bold font-mono">Period #{tt.periodNumber}</span>
                    <span className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>{tt.timeSlot}</span>
                  </div>
                  <div className={`text-sm font-black ${isLight ? "text-slate-900" : "text-white"}`}>{tt.subject}</div>
                  <div className={`text-xs ${isLight ? "text-slate-600" : "text-gray-400"}`}>{tt.className} &bull; {tt.sectionName}</div>
                  <div className={`text-[10px] ${isLight ? "text-slate-400" : "text-gray-500"}`}>{tt.room}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. STUDENT & PARENT PERSPECTIVE (WITH MULTI-CHILD SWITCHER) */}
      {(activeRole === "Student" || activeRole === "Parent") && (
        <div className="space-y-6">
          {/* Sibling / Children Switcher for Parent */}
          {activeRole === "Parent" && students.length > 1 && (
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm ${
              isLight ? "bg-pink-50/70 border-pink-200" : "bg-[#0b121e] border-pink-500/30"
            }`}>
              <div className="flex items-center gap-2 text-xs font-bold text-pink-700">
                <Users size={16} />
                <span>Select Linked Child Profile:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {students.slice(0, 3).map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      const activeElem = document.getElementById(`child-card-${st.id}`);
                      if (activeElem) activeElem.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                      isLight ? "bg-white hover:bg-pink-600 text-pink-700 hover:text-white border-pink-300 shadow-sm" : "bg-pink-500/10 hover:bg-pink-500 text-pink-300 hover:text-white border-pink-500/30"
                    }`}
                  >
                    <span>🎒 {st.firstName} {st.lastName}</span>
                    <span className="text-[10px] font-mono opacity-80">({st.admissionNo})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {students.slice(0, activeRole === "Parent" ? 2 : 1).map((currentStudent) => {
            const studentFee = feeVouchers.find((f) => f.studentId === currentStudent.id);
            return (
              <div
                key={currentStudent.id}
                id={`child-card-${currentStudent.id}`}
                className={`p-6 rounded-2xl border space-y-5 shadow-sm ${
                  isLight ? "bg-white border-purple-200" : "bg-[#0b121e] border-purple-500/30"
                }`}
              >
                <div className={`flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b pb-4 ${
                  isLight ? "border-slate-100" : "border-gray-800"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-black text-white text-lg shadow">
                      {currentStudent.firstName[0]}
                    </div>
                    <div>
                      <h3 className={`text-base font-black ${isLight ? "text-slate-900" : "text-white"}`}>
                        {currentStudent.firstName} {currentStudent.lastName}
                      </h3>
                      <p className={`text-xs ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                        {currentStudent.className} &bull; {currentStudent.sectionName} &bull; Roll #{currentStudent.rollNo} &bull; House: {currentStudent.houseName || "Jinnah House"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border ${
                      isLight ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-purple-500/10 border-purple-500/30 text-purple-300"
                    }`}>
                      Admission: {currentStudent.admissionNo}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                      isLight ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    }`}>
                      {currentStudent.status}
                    </span>
                  </div>
                </div>

                {/* Student 3-Card Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
                  <div className={`p-4 rounded-xl border space-y-1.5 ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-gray-800"
                  }`}>
                    <span className={`text-[10px] font-bold uppercase ${isLight ? "text-slate-500" : "text-gray-400"}`}>Exam Distinction</span>
                    <div className="text-xl font-black text-emerald-600">
                      {currentStudent.admissionNo === "ADM-2026-0041" ? "98% (Grade A+)" : "92% (Grade A+)"}
                    </div>
                    <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                      {currentStudent.admissionNo === "ADM-2026-0041" ? "1st Position in Section" : "2nd Position in Section"}
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl border space-y-1.5 ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-gray-800"
                  }`}>
                    <span className={`text-[10px] font-bold uppercase ${isLight ? "text-slate-500" : "text-gray-400"}`}>Attendance Register</span>
                    <div className="text-xl font-black text-sky-600">96.5% Present</div>
                    <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>22 Days Present &bull; 0 Unexcused</p>
                  </div>

                  <div className={`p-4 rounded-xl border space-y-1.5 ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-gray-800"
                  }`}>
                    <span className={`text-[10px] font-bold uppercase ${isLight ? "text-slate-500" : "text-gray-400"}`}>Monthly Fee Voucher</span>
                    <div className={`text-xl font-black ${studentFee?.status === "Paid" ? "text-emerald-600" : "text-amber-600"}`}>
                      {studentFee ? `${studentFee.status} (Rs ${studentFee.totalPayable.toLocaleString()})` : "Cleared & Paid"}
                    </div>
                    <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>Challan #{studentFee?.challanNo || "CHL-2026-0801"}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. FINANCE PERSPECTIVE */}
      {activeRole === "Finance" && (
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
            isLight ? "bg-white border-teal-200" : "bg-[#0b121e] border-teal-500/30"
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isLight ? "border-slate-100" : "border-gray-800"}`}>
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-teal-600" />
                <h3 className={`font-black text-sm ${isLight ? "text-slate-900" : "text-white"}`}>Fee Collection Counter &amp; Bank Reconciliation</h3>
              </div>
              <Link
                href="/sms/fees"
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow"
              >
                Open Fee Desk
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-gray-800"}`}>
                <div className={`text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"}`}>Total Month Collection</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">Rs {totalFeeCollected.toLocaleString()}</div>
              </div>
              <div className={`p-4 rounded-xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-gray-800"}`}>
                <div className={`text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"}`}>Pending / Defaulters</div>
                <div className="text-2xl font-black text-red-600 mt-1">{totalDefaulters} Challans</div>
              </div>
              <div className={`p-4 rounded-xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-gray-800"}`}>
                <div className={`text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"}`}>Discounts / Concessions</div>
                <div className="text-2xl font-black text-amber-600 mt-1">Rs 3,700</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Circulars & Notice Board */}
      <div className="space-y-4">
        <div className={`flex justify-between items-center border-b pb-3 ${isLight ? "border-slate-200" : "border-gray-800"}`}>
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-sky-600" />
            <h3 className={`font-black text-sm ${isLight ? "text-slate-900" : "text-white"}`}>Official School Circulars &amp; Notice Board</h3>
          </div>
          <span className={`text-[10px] font-mono ${isLight ? "text-slate-400" : "text-gray-400"}`}>Live Broadcast</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notices.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border space-y-2 transition group shadow-sm hover:shadow-md ${
                isLight ? "bg-white border-slate-200 hover:border-sky-300" : "bg-[#0b121e] border-gray-800/80 hover:border-sky-500/40"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                  isLight ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                }`}>
                  {n.category}
                </span>
                <span className={`text-[10px] font-mono ${isLight ? "text-slate-400" : "text-gray-500"}`}>{n.date}</span>
              </div>
              <h4 className={`font-black text-sm transition ${isLight ? "text-slate-900 group-hover:text-sky-700" : "text-white group-hover:text-sky-300"}`}>{n.title}</h4>
              <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-gray-400"}`}>{n.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
