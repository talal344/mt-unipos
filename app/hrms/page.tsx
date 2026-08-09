"use client";

import React from "react";
import Link from "next/link";
import HRMSSidebar from "@/components/hrms-sidebar";
import { useGlobalContext } from "@/context/global-context";
import {
  Users,
  Clock,
  CalendarDays,
  DollarSign,
  UserPlus,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowUpRight,
  Award,
  Sparkles,
  Building2,
  FileText,
  Cpu
} from "lucide-react";

export default function HRMSDashboardPage() {
  const {
    hrEmployees,
    hrAttendance,
    hrLeaves,
    hrPayrolls,
    hrJobs,
    hrCandidates,
    currencySymbol,
    businessSettings
  } = useGlobalContext();

  const totalHeadcount = hrEmployees.length;
  const activeStaff = hrEmployees.filter((e) => e.status === "Active").length;

  const todayStr = new Date().toISOString().split("T")[0];
  const todayAttendance = hrAttendance.filter((a) => a.date === todayStr);
  const presentCount = todayAttendance.filter((a) => a.status === "Present" || a.status === "Late").length;
  const attendanceRate = totalHeadcount > 0 ? Math.round((presentCount / totalHeadcount) * 100) : 100;

  const pendingLeaves = hrLeaves.filter((l) => l.status === "Pending");
  const latestPayroll = hrPayrolls[0];

  return (
    <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans">
      <HRMSSidebar />

      <main className="flex-grow p-6 space-y-6 overflow-y-auto max-h-screen">
        {/* Top Bar Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={10} /> Enterprise HR Module
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              HR Executive Dashboard
            </h1>
            <p className="text-xs text-gray-400">
              Real-time employee management, attendance tracking, leaves, and automated payroll operations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/hrms/employees"
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-900/30 transition"
            >
              <Plus size={14} /> Add Employee
            </Link>
            <Link
              href="/hrms/payroll"
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs px-4 py-2.5 rounded-xl border border-gray-700 transition"
            >
              <DollarSign size={14} className="text-emerald-400" /> Run Payroll
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Staff */}
          <div className="bg-[#0b0f17] border border-emerald-500/20 p-5 rounded-2xl relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Headcount</p>
                <h3 className="text-2xl font-black text-white mt-1">{totalHeadcount} <span className="text-xs font-normal text-emerald-400">Staff</span></h3>
              </div>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                <Users size={22} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-400 font-mono">
              <span className="text-emerald-400 font-bold">{activeStaff} Active</span> • <span>{totalHeadcount - activeStaff} Inactive/Leave</span>
            </div>
          </div>

          {/* Today's Attendance */}
          <div className="bg-[#0b0f17] border border-emerald-500/20 p-5 rounded-2xl relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Today's Attendance</p>
                <h3 className="text-2xl font-black text-emerald-400 mt-1">{attendanceRate}%</h3>
              </div>
              <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400">
                <Clock size={22} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-400 font-mono">
              <span className="text-emerald-400 font-bold">{presentCount} Present</span> • <span className="text-amber-400 font-bold">{todayAttendance.filter(a => a.status === "Late").length} Late</span>
            </div>
          </div>

          {/* Pending Leaves */}
          <div className="bg-[#0b0f17] border border-emerald-500/20 p-5 rounded-2xl relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Leave Requests</p>
                <h3 className="text-2xl font-black text-amber-400 mt-1">{pendingLeaves.length}</h3>
              </div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
                <CalendarDays size={22} />
              </div>
            </div>
            <div className="mt-3 text-[10px] text-gray-400 font-mono">
              {pendingLeaves.length > 0 ? (
                <span className="text-amber-400 font-bold">Action Required by HR</span>
              ) : (
                <span className="text-emerald-400">All leave requests cleared</span>
              )}
            </div>
          </div>

          {/* Last Payroll Budget */}
          <div className="bg-[#0b0f17] border border-emerald-500/20 p-5 rounded-2xl relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Monthly Payroll</p>
                <h3 className="text-2xl font-black text-white mt-1">
                  {currencySymbol} {latestPayroll ? latestPayroll.totalNet.toLocaleString() : "0"}
                </h3>
              </div>
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
                <DollarSign size={22} />
              </div>
            </div>
            <div className="mt-3 text-[10px] text-gray-400 font-mono">
              Month: <span className="text-purple-300 font-bold">{latestPayroll ? latestPayroll.month : "Current Month"}</span>
            </div>
          </div>
        </div>

        {/* Owner Recruitment & Onboarding Pipeline Live Tracker Desk */}
        <div className="bg-[#0b0f17] border border-sky-500/30 p-5 rounded-2xl space-y-3 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
              <UserPlus size={16} />
              <h3 className="text-sm font-black text-white">Owner Corporate Onboarding Pipeline Overview</h3>
            </div>
            <Link
              href="/hrms/recruitment"
              className="text-[11px] text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 bg-sky-500/10 px-3 py-1 rounded-lg border border-sky-500/30 transition"
            >
              Open Full ATS Portal &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 bg-black/40 border border-gray-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase block">1. Candidate ATS Pipeline</span>
                <span className="text-lg font-black text-white">{hrCandidates.filter(c => c.onboardingStage !== "Fully Active Employee").length} Active Applicants</span>
              </div>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <Users size={16} />
              </div>
            </div>

            <div className="p-3.5 bg-black/40 border border-gray-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase block">2. IT Credentials Queue</span>
                <span className="text-lg font-black text-sky-400">
                  {hrCandidates.filter(c => c.stage === "Hired" && c.onboardingStage === "Pending IT Provisioning").length} Awaiting IT ID
                </span>
              </div>
              <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
                <Cpu size={16} />
              </div>
            </div>

            <div className="p-3.5 bg-black/40 border border-gray-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase block">3. Finance Release Queue</span>
                <span className="text-lg font-black text-emerald-400">
                  {hrCandidates.filter(c => c.onboardingStage === "Pending Finance Confirmation").length} Awaiting Finance
                </span>
              </div>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <DollarSign size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Quick Management Box */}
          <div className="md:col-span-2 bg-[#0b0f17] border border-gray-800 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Building2 size={16} className="text-emerald-400" />
                HR Operations &amp; Quick Workflows
              </h3>
              <span className="text-[10px] text-gray-500 font-mono">Select Module</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Link
                href="/hrms/employees"
                className="p-4 bg-black/40 hover:bg-emerald-500/10 border border-gray-800 hover:border-emerald-500/40 rounded-xl transition group"
              >
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg w-fit group-hover:scale-110 transition">
                  <Users size={18} />
                </div>
                <h4 className="font-bold text-xs text-white mt-2">Employee Directory</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">Manage profiles &amp; bank accounts</p>
              </Link>

              <Link
                href="/hrms/attendance"
                className="p-4 bg-black/40 hover:bg-teal-500/10 border border-gray-800 hover:border-teal-500/40 rounded-xl transition group"
              >
                <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-lg w-fit group-hover:scale-110 transition">
                  <Clock size={18} />
                </div>
                <h4 className="font-bold text-xs text-white mt-2">Attendance Ledger</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">Daily check-in &amp; overtime logs</p>
              </Link>

              <Link
                href="/hrms/leaves"
                className="p-4 bg-black/40 hover:bg-amber-500/10 border border-gray-800 hover:border-amber-500/40 rounded-xl transition group"
              >
                <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg w-fit group-hover:scale-110 transition">
                  <CalendarDays size={18} />
                </div>
                <h4 className="font-bold text-xs text-white mt-2">Leave Approvals</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">Review staff leave requests</p>
              </Link>

              <Link
                href="/hrms/payroll"
                className="p-4 bg-black/40 hover:bg-purple-500/10 border border-gray-800 hover:border-purple-500/40 rounded-xl transition group"
              >
                <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg w-fit group-hover:scale-110 transition">
                  <DollarSign size={18} />
                </div>
                <h4 className="font-bold text-xs text-white mt-2">Payroll Engine</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">Generate salary payslips</p>
              </Link>

              <Link
                href="/hrms/recruitment"
                className="p-4 bg-black/40 hover:bg-sky-500/10 border border-gray-800 hover:border-sky-500/40 rounded-xl transition group"
              >
                <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-lg w-fit group-hover:scale-110 transition">
                  <UserPlus size={18} />
                </div>
                <h4 className="font-bold text-xs text-white mt-2">Recruitment ATS</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">Manage job openings &amp; applicants</p>
              </Link>

              <Link
                href="/hrms/performance"
                className="p-4 bg-black/40 hover:bg-pink-500/10 border border-gray-800 hover:border-pink-500/40 rounded-xl transition group"
              >
                <div className="p-2.5 bg-pink-500/10 text-pink-400 rounded-lg w-fit group-hover:scale-110 transition">
                  <TrendingUp size={18} />
                </div>
                <h4 className="font-bold text-xs text-white mt-2">Appraisals &amp; KPIs</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">Staff performance ratings</p>
              </Link>
            </div>
          </div>

          {/* Pending Action Alerts Sidebar */}
          <div className="bg-[#0b0f17] border border-gray-800 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-400" />
                Pending HR Actions
              </h3>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {pendingLeaves.length} Action(s)
              </span>
            </div>

            <div className="space-y-3">
              {pendingLeaves.length === 0 ? (
                <div className="p-4 bg-black/30 border border-gray-800/80 rounded-xl text-center">
                  <CheckCircle2 size={24} className="text-emerald-400 mx-auto mb-1" />
                  <p className="text-xs font-bold text-gray-300">All clear!</p>
                  <p className="text-[10px] text-gray-500">No pending leave requests needing approval.</p>
                </div>
              ) : (
                pendingLeaves.map((l) => (
                  <div key={l.id} className="p-3 bg-black/40 border border-amber-500/30 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-white">{l.employeeName}</div>
                        <div className="text-[10px] text-amber-400 font-mono">{l.leaveType} Leave ({l.totalDays} Days)</div>
                      </div>
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[9px] font-bold rounded">
                        Pending
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 italic">"{l.reason}"</p>
                    <Link
                      href="/hrms/leaves"
                      className="block text-center text-[10px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 py-1.5 rounded transition"
                    >
                      Review &amp; Approve →
                    </Link>
                  </div>
                ))
              )}
            </div>

            {/* Active Recruitment Status */}
            <div className="pt-2 border-t border-gray-800">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray-400 font-bold">Active Job Listings</span>
                <span className="text-emerald-400 font-mono font-bold">{hrJobs.filter(j => j.status === "Open").length} Open</span>
              </div>
              {hrJobs.slice(0, 2).map((j) => (
                <div key={j.id} className="p-2.5 bg-black/30 border border-gray-800 rounded-lg flex justify-between items-center text-xs mb-1.5">
                  <div>
                    <div className="font-bold text-gray-200">{j.title}</div>
                    <div className="text-[9px] text-gray-500">{j.department} • {j.vacancies} Vacancies</div>
                  </div>
                  <span className="text-[10px] text-sky-400 font-mono font-bold">{j.applicantsCount} Applicants</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
