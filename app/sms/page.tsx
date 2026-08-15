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
  Printer
} from "lucide-react";

export default function SMSDashboard() {
  const {
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
    timetable
  } = useSMS();

  const activeCampus = campuses.find((c) => c.id === selectedCampus) || campuses[0];

  // Global KPIs
  const totalStudents = students.filter((s) => s.status === "Active").length;
  const totalTeachers = teachers.filter((t) => t.status === "Active").length;
  const totalClassesCount = classes.length;
  
  // Financial KPIs
  const totalFeeExpected = useMemo(() => feeVouchers.reduce((acc, v) => acc + v.totalPayable, 0), [feeVouchers]);
  const totalFeeCollected = useMemo(() => feeVouchers.reduce((acc, v) => acc + (v.paidAmount || 0), 0), [feeVouchers]);
  const totalDefaulters = useMemo(() => feeVouchers.filter((v) => v.status === "Unpaid" || v.status === "Overdue").length, [feeVouchers]);

  // Primary demo student for Student/Parent portal perspective
  const demoStudent = students[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#0b1329] via-[#091e3a] to-[#042838] border border-sky-500/20 shadow-2xl">
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
              Complete academic governance, student lifecycle pipeline, board exam grading, question bank engine, and multi-tier fee management system.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              href="/sms/students?action=new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-sky-600/20 transition cursor-pointer"
            >
              <PlusCircle size={14} />
              <span>New Admission</span>
            </Link>
            <Link
              href="/sms/fees?action=collect"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/20 transition cursor-pointer"
            >
              <CreditCard size={14} />
              <span>Fee Counter</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Global Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-[#0b121e]/80 border border-[#1e293b] rounded-2xl p-5 hover:border-sky-500/30 transition group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Enrolled Students</span>
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 group-hover:scale-110 transition">
              <Users size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{totalStudents}</div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp size={12} />
            <span>100% Verified Admissions</span>
          </div>
        </div>

        {/* Total Faculty */}
        <div className="bg-[#0b121e]/80 border border-[#1e293b] rounded-2xl p-5 hover:border-indigo-500/30 transition group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Teaching Faculty</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition">
              <GraduationCap size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{totalTeachers}</div>
          <div className="text-[10px] text-gray-400 font-semibold mt-1">
            <span>Subject Specialists &amp; Masters</span>
          </div>
        </div>

        {/* Total Fee Collected */}
        <div className="bg-[#0b121e]/80 border border-[#1e293b] rounded-2xl p-5 hover:border-emerald-500/30 transition group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Fee Received</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            Rs {totalFeeCollected.toLocaleString()}
          </div>
          <div className="text-[10px] text-gray-400 font-semibold mt-1">
            <span>Total Expected: Rs {totalFeeExpected.toLocaleString()}</span>
          </div>
        </div>

        {/* Classes & Sections */}
        <div className="bg-[#0b121e]/80 border border-[#1e293b] rounded-2xl p-5 hover:border-purple-500/30 transition group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Active Sections</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition">
              <Building2 size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{totalClassesCount}</div>
          <div className="text-[10px] text-purple-400 font-semibold mt-1">
            <span>Class Teachers &amp; CR/GR Appointed</span>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* ROLE SPECIFIC VIEW ADAPTER                                                    */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}

      {/* 1. OWNER & PRINCIPAL PERSPECTIVE */}
      {(activeRole === "Owner" || activeRole === "Principal") && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div>
              <h2 className="text-base font-black text-white">Campus Wings &amp; Academic Overview</h2>
              <p className="text-xs text-gray-400">Hierarchical breakdown by Wings, Class Sections, and Incharge Masters.</p>
            </div>
            <Link
              href="/sms/classes"
              className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1"
            >
              <span>Manage Hierarchy</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeCampus.wings.map((w) => (
              <div key={w.id} className="bg-[#0b121e] border border-[#1e293b] rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-sky-400 font-mono">{w.id}</span>
                  <span className="text-[10px] bg-sky-500/10 text-sky-300 px-2 py-0.5 rounded-full font-bold">
                    {w.totalClasses} Classes
                  </span>
                </div>
                <h3 className="text-sm font-black text-white">{w.name}</h3>
                <div className="text-xs text-gray-400">
                  <span className="text-gray-500">Wing Head: </span>
                  <span className="text-gray-200 font-bold">{w.headName}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Enrolled Classes Table */}
          <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/30">
              <h3 className="font-black text-white text-xs uppercase tracking-wider">
                Class Sections Directory &amp; Student Leaders (CR &amp; GR)
              </h3>
              <span className="text-[10px] text-gray-400 font-mono">Strict Section Isolation</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 font-mono text-[11px] bg-black/20">
                    <th className="p-3.5 font-bold">Class &amp; Section</th>
                    <th className="p-3.5 font-bold">Campus Wing</th>
                    <th className="p-3.5 font-bold">Class Incharge Teacher</th>
                    <th className="p-3.5 font-bold text-sky-400">Boy CR</th>
                    <th className="p-3.5 font-bold text-pink-400">Girl GR</th>
                    <th className="p-3.5 font-bold text-center">Strength / Capacity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-mono text-[11px]">
                  {classes.map((cls) => (
                    <tr key={cls.id} className="hover:bg-white/[0.02] transition">
                      <td className="p-3.5 font-sans">
                        <div className="font-black text-white">{cls.className}</div>
                        <div className="text-[10px] text-gray-400">{cls.sectionName} • {cls.roomNumber}</div>
                      </td>
                      <td className="p-3.5 text-gray-400 font-sans">{cls.wing}</td>
                      <td className="p-3.5 text-emerald-400 font-sans font-bold">{cls.classTeacherName || "Unassigned"}</td>
                      <td className="p-3.5 text-sky-300 font-bold">{cls.crBoyName || "—"}</td>
                      <td className="p-3.5 text-pink-300 font-bold">{cls.grGirlName || "—"}</td>
                      <td className="p-3.5 text-center">
                        <span className="bg-sky-500/10 border border-sky-500/20 text-sky-400 px-2.5 py-1 rounded-lg font-bold">
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
          <div className="bg-[#0b121e] border border-emerald-500/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <CalendarCheck2 size={18} className="text-emerald-400" />
                <h3 className="font-black text-white text-sm">Faculty Period Schedule &amp; Quick Attendance</h3>
              </div>
              <Link
                href="/sms/attendance"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Mark Attendance
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans">
              {timetable.map((tt) => (
                <div key={tt.id} className="bg-black/40 border border-gray-800 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-emerald-400 font-bold font-mono">Period #{tt.periodNumber}</span>
                    <span className="text-gray-400 text-[10px]">{tt.timeSlot}</span>
                  </div>
                  <div className="text-sm font-black text-white">{tt.subject}</div>
                  <div className="text-xs text-gray-400">{tt.className} • {tt.sectionName}</div>
                  <div className="text-[10px] text-gray-500">{tt.room}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. STUDENT & PARENT PERSPECTIVE */}
      {(activeRole === "Student" || activeRole === "Parent") && demoStudent && (
        <div className="space-y-6">
          <div className="bg-[#0b121e] border border-purple-500/30 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-black text-white text-lg">
                  {demoStudent.firstName[0]}
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {demoStudent.firstName} {demoStudent.lastName}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {demoStudent.className} • {demoStudent.sectionName} • Roll #{demoStudent.rollNo}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-purple-500/10 border border-purple-500/30 text-purple-300 px-3 py-1.5 rounded-xl">
                  Admission: {demoStudent.admissionNo}
                </span>
                <span className="text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-xl">
                  {demoStudent.status}
                </span>
              </div>
            </div>

            {/* Student 3-Card Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
              <div className="bg-black/40 border border-gray-800 p-4 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Midterm Exam Performance</span>
                <div className="text-xl font-black text-emerald-400">98% (Grade A+)</div>
                <p className="text-[10px] text-gray-400">1st Position in Section A</p>
              </div>

              <div className="bg-black/40 border border-gray-800 p-4 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Attendance Register</span>
                <div className="text-xl font-black text-sky-400">96.5% Present</div>
                <p className="text-[10px] text-gray-400">22 Days Present / 1 Leave</p>
              </div>

              <div className="bg-black/40 border border-gray-800 p-4 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Monthly Fee Voucher</span>
                <div className="text-xl font-black text-emerald-400">Cleared &amp; Paid</div>
                <p className="text-[10px] text-gray-400">Challan #CHL-2026-0801</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. FINANCE PERSPECTIVE */}
      {activeRole === "Finance" && (
        <div className="space-y-6">
          <div className="bg-[#0b121e] border border-teal-500/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-teal-400" />
                <h3 className="font-black text-white text-sm">Fee Collection Counter &amp; Bank Reconciliation</h3>
              </div>
              <Link
                href="/sms/fees"
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs"
              >
                Open Fee Desk
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-black/40 border border-gray-800 p-4 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-gray-400">Total Month Collection</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">Rs {totalFeeCollected.toLocaleString()}</div>
              </div>
              <div className="bg-black/40 border border-gray-800 p-4 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-gray-400">Pending / Defaulters</div>
                <div className="text-2xl font-black text-red-400 mt-1">{totalDefaulters} Challans</div>
              </div>
              <div className="bg-black/40 border border-gray-800 p-4 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-gray-400">Discounts / Concessions</div>
                <div className="text-2xl font-black text-amber-400 mt-1">Rs 3,700</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Circulars & Notice Board */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-sky-400" />
            <h3 className="font-black text-white text-sm">Official School Circulars &amp; Notice Board</h3>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">Live Broadcast</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notices.map((n) => (
            <div
              key={n.id}
              className="bg-[#0b121e] border border-gray-800/80 hover:border-sky-500/40 p-5 rounded-2xl space-y-2 transition group"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-md uppercase">
                  {n.category}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">{n.date}</span>
              </div>
              <h4 className="font-black text-white text-sm group-hover:text-sky-300 transition">{n.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed">{n.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
