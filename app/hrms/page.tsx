"use client";

import React, { useState } from "react";
import Link from "next/link";
import HRMSSidebar from "@/components/hrms-sidebar";
import HRMSTopHeader from "@/components/hrms-top-header";
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
  Award,
  Sparkles,
  Building2,
  Cpu,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  GitBranch,
  KeyRound,
  FileText
} from "lucide-react";

export default function HRMSDashboardPage() {
  const {
    currentUser,
    hrEmployees,
    hrAttendance,
    hrLeaves,
    hrPayrolls,
    hrJobs,
    hrCandidates,
    currencySymbol,
    provisionITCredentials,
    assignITTaskToSubordinate
  } = useGlobalContext();

  const empMatch = hrEmployees.find(
    (e) => e.email?.toLowerCase().trim() === currentUser?.email?.toLowerCase().trim()
  );

  const isITUser = Boolean(
    (currentUser?.role as string) === "IT" ||
    currentUser?.email?.toLowerCase().includes("it@") ||
    empMatch?.department === "IT & Software Operations"
  );

  const isITHOD = Boolean(
    isITUser &&
    (empMatch?.designation?.toLowerCase().includes("head") ||
     empMatch?.designation?.toLowerCase().includes("director") ||
     empMatch?.designation?.toLowerCase().includes("manager") ||
     currentUser?.role === "Owner")
  );

  // Subordinate selection state for HOD delegation
  const [selectedSubordinates, setSelectedSubordinates] = useState<{ [candId: string]: string }>({});
  const [provisionInputs, setProvisionInputs] = useState<{ [candId: string]: { email: string; pass: string } }>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // IT Department Employees (Subordinates)
  const itDepartmentStaff = hrEmployees.filter(
    (e) => e.department === "IT & Software Operations" || e.email.includes("it@")
  );

  // Pending IT Onboarding Tasks
  const pendingITTasks = hrCandidates.filter(
    (c) => c.stage === "Hired" && c.onboardingStage === "Pending IT Provisioning"
  );

  // Filtered IT Tasks for Subordinate vs HOD
  const visibleITTasks = isITHOD
    ? pendingITTasks
    : pendingITTasks.filter(
        (c) =>
          c.assignedToITUserId === empMatch?.id ||
          c.assignedToITUserId === currentUser?.email ||
          !c.assignedToITUserId
      );

  const handleDelegateTask = (candId: string) => {
    const subEmpId = selectedSubordinates[candId];
    if (!subEmpId) return;
    const subEmp = hrEmployees.find((e) => e.id === subEmpId || e.email === subEmpId);
    const subName = subEmp ? subEmp.name : subEmpId;
    assignITTaskToSubordinate(candId, subEmpId, subName);
    triggerToast(`✅ Task delegated to ${subName}!`);
  };

  const handleITProvisionSubmit = (candId: string, candName: string) => {
    const inputs = provisionInputs[candId] || {};
    const workEmail = inputs.email || `${candName.toLowerCase().replace(/\s+/g, ".")}@corporate.com`;
    const tempPassword = inputs.pass || "talal344";

    provisionITCredentials(candId, workEmail, tempPassword);
    triggerToast(`✅ IT Provisioning completed for ${candName}! Credentials sent to Finance Queue.`);
  };

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

      <main className="flex-grow overflow-y-auto max-h-screen">
        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-black px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 size={16} />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Prominent Logged-In User Profile, Designation, Department & Tenure Header */}
        <HRMSTopHeader
          title={isITUser ? "🖥️ IT Department Operations Desk" : "HR Executive Dashboard"}
          subtitle={
            isITUser
              ? "IT Provisioning Queue, Department Hierarchy Delegation & Credentials Desk"
              : "Real-time employee management, attendance tracking, leaves, and automated payroll operations."
          }
        />

        <div className="p-6 space-y-6">
          {/* ─────────────────────────────────────────────────────────────────────────────
              IT DEPARTMENT DEDICATED PORTAL VIEW
             ───────────────────────────────────────────────────────────────────────────── */}
          {isITUser ? (
            <div className="space-y-6">
              {/* IT KPI Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0b0f17] border border-sky-500/30 p-5 rounded-2xl relative overflow-hidden shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">IT Provisioning Requests</p>
                      <h3 className="text-2xl font-black text-sky-400 mt-1">{pendingITTasks.length} <span className="text-xs text-gray-400 font-normal">Pending</span></h3>
                    </div>
                    <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-400">
                      <Cpu size={22} />
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] text-gray-400 font-mono">Incoming from HR Recruitment</p>
                </div>

                <div className="bg-[#0b0f17] border border-emerald-500/30 p-5 rounded-2xl relative overflow-hidden shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tasks Assigned To Me</p>
                      <h3 className="text-2xl font-black text-emerald-400 mt-1">{visibleITTasks.length}</h3>
                    </div>
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                      <UserCheck size={22} />
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] text-gray-400 font-mono">Active Delegation Work items</p>
                </div>

                <div className="bg-[#0b0f17] border border-purple-500/30 p-5 rounded-2xl relative overflow-hidden shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">IT Department Staff</p>
                      <h3 className="text-2xl font-black text-purple-300 mt-1">{itDepartmentStaff.length || 1} <span className="text-xs text-gray-400 font-normal">Members</span></h3>
                    </div>
                    <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
                      <Users size={22} />
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] text-gray-400 font-mono">Hierarchy Subordinates available</p>
                </div>

                <div className="bg-[#0b0f17] border border-teal-500/30 p-5 rounded-2xl relative overflow-hidden shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Completed IT Profiles</p>
                      <h3 className="text-2xl font-black text-teal-400 mt-1">
                        {hrCandidates.filter(c => c.onboardingStage === "Pending Finance Confirmation" || c.onboardingStage === "Fully Active Employee").length}
                      </h3>
                    </div>
                    <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400">
                      <ShieldCheck size={22} />
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] text-gray-400 font-mono">Forwarded to Finance Directory</p>
                </div>
              </div>

              {/* IT Provisioning Tasks Desk with HOD Delegation Hierarchy & Timeline */}
              <div className="bg-[#0b0f17] border border-sky-500/30 p-6 rounded-2xl space-y-5 shadow-2xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[10px] font-extrabold uppercase tracking-widest mb-1">
                      <Cpu size={12} /> {isITHOD ? "IT HOD Task Delegation & Hierarchy Desk" : "IT Specialist Task Execution Queue"}
                    </div>
                    <h2 className="text-lg font-black text-white">
                      {isITHOD ? "Incoming HR Onboarding Requests & Subordinate Assignment" : "My Assigned IT Provisioning Requests"}
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-3 py-1.5 rounded-xl border border-sky-500/30">
                    {visibleITTasks.length} Task(s) Pending Action
                  </span>
                </div>

                {visibleITTasks.length === 0 ? (
                  <div className="p-8 bg-black/40 border border-gray-800 rounded-2xl text-center space-y-2">
                    <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
                    <h3 className="text-sm font-black text-white">No Pending IT Tasks</h3>
                    <p className="text-xs text-gray-400">All candidate onboarding IT requests have been provisioned or delegated.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visibleITTasks.map((cand) => (
                      <div key={cand.id} className="p-5 bg-black/60 border border-gray-800 hover:border-sky-500/40 rounded-2xl space-y-4 transition">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800/80 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-black text-white">{cand.name}</span>
                              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold uppercase border border-sky-500/30">
                                {cand.appliedPosition}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1 flex flex-wrap items-center gap-3">
                              <span>Dept: <strong className="text-gray-200">{cand.department}</strong> {cand.subDepartment && `(${cand.subDepartment})`}</span>
                              <span>CNIC: <strong className="text-gray-200">{cand.cnic || "35201-0000000-0"}</strong></span>
                              <span>Proposed Salary: <strong className="text-emerald-400">{currencySymbol} {cand.proposedSalary?.toLocaleString()}</strong></span>
                            </div>
                          </div>

                          {cand.assignedToITUserName && (
                            <div className="px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1.5">
                              <UserCheck size={14} /> Assigned To: {cand.assignedToITUserName}
                            </div>
                          )}
                        </div>

                        {/* HOD Task Delegation Hierarchy Controls */}
                        {isITHOD && (
                          <div className="p-3 bg-gray-900/60 border border-gray-800 rounded-xl space-y-2">
                            <label className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                              <GitBranch size={13} /> IT HOD Task Assignment (Delegate to Subordinate):
                            </label>
                            <div className="flex items-center gap-2">
                              <select
                                value={selectedSubordinates[cand.id] || ""}
                                onChange={(e) => setSelectedSubordinates({ ...selectedSubordinates, [cand.id]: e.target.value })}
                                className="flex-1 bg-black border border-gray-700 text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-sky-400"
                              >
                                <option value="">Select IT Subordinate Specialist...</option>
                                {itDepartmentStaff.map((emp) => (
                                  <option key={emp.id} value={emp.id}>
                                    {emp.name} ({emp.designation})
                                  </option>
                                ))}
                                <option value="IT Specialist 1">IT Engineer - Subordinate 1</option>
                                <option value="IT Specialist 2">IT Support Lead - Subordinate 2</option>
                              </select>
                              <button
                                onClick={() => handleDelegateTask(cand.id)}
                                className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1 shrink-0"
                              >
                                Assign Task
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Provision Credentials Form */}
                        <div className="p-4 bg-gray-950/80 border border-sky-500/20 rounded-xl space-y-3">
                          <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                            <KeyRound size={14} className="text-emerald-400" /> Provision Corporate Credentials &amp; System ID:
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Corporate Work Email</label>
                              <input
                                type="email"
                                defaultValue={cand.workEmail || `${cand.name.toLowerCase().replace(/\s+/g, ".")}@corporate.com`}
                                onChange={(e) =>
                                  setProvisionInputs({
                                    ...provisionInputs,
                                    [cand.id]: { ...(provisionInputs[cand.id] || {}), email: e.target.value, pass: provisionInputs[cand.id]?.pass || "talal344" }
                                  })
                                }
                                className="w-full bg-black border border-gray-800 focus:border-emerald-500 text-xs text-white rounded-xl p-2.5 outline-none font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Temporary System Password</label>
                              <input
                                type="text"
                                defaultValue={cand.tempPassword || "talal344"}
                                onChange={(e) =>
                                  setProvisionInputs({
                                    ...provisionInputs,
                                    [cand.id]: { ...(provisionInputs[cand.id] || {}), pass: e.target.value, email: provisionInputs[cand.id]?.email || `${cand.name.toLowerCase().replace(/\s+/g, ".")}@corporate.com` }
                                  })
                                }
                                className="w-full bg-black border border-gray-800 focus:border-emerald-500 text-xs text-white rounded-xl p-2.5 outline-none font-mono"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => handleITProvisionSubmit(cand.id, cand.name)}
                              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2"
                            >
                              <ShieldCheck size={16} /> Complete Credentials &amp; Forward to Finance &rarr;
                            </button>
                          </div>
                        </div>

                        {/* Audit Timeline Tracker (Visible to HOD & Subordinate) */}
                        {cand.itTaskTimeline && cand.itTaskTimeline.length > 0 && (
                          <div className="pt-2 border-t border-gray-800/80">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                              📋 HOD Live Task Audit Timeline Tracker:
                            </span>
                            <div className="space-y-1.5 pl-2 border-l-2 border-sky-500/40">
                              {cand.itTaskTimeline.map((item, idx) => (
                                <div key={idx} className="text-[11px] flex items-center justify-between text-gray-300">
                                  <span>• {item.action} (by <strong className="text-sky-300">{item.actor}</strong>)</span>
                                  <span className="text-[9px] font-mono text-gray-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Action Navigation Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                  href="/hrms/employees"
                  className="p-5 bg-[#0b0f17] hover:bg-emerald-500/10 border border-gray-800 hover:border-emerald-500/40 rounded-2xl transition group flex items-center gap-4"
                >
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:scale-110 transition">
                    <Users size={24} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Employees Directory</h4>
                    <p className="text-xs text-gray-400 mt-0.5">View corporate staff profiles</p>
                  </div>
                </Link>

                <Link
                  href="/hrms/attendance"
                  className="p-5 bg-[#0b0f17] hover:bg-teal-500/10 border border-gray-800 hover:border-teal-500/40 rounded-2xl transition group flex items-center gap-4"
                >
                  <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl group-hover:scale-110 transition">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">My Attendance</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Check-in / Check-out ledger</p>
                  </div>
                </Link>

                <Link
                  href="/hrms/leaves"
                  className="p-5 bg-[#0b0f17] hover:bg-amber-500/10 border border-gray-800 hover:border-amber-500/40 rounded-2xl transition group flex items-center gap-4"
                >
                  <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl group-hover:scale-110 transition">
                    <CalendarDays size={24} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">My Leave Applications</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Apply &amp; view my leave status</p>
                  </div>
                </Link>
              </div>
            </div>
          ) : (
            /* ─────────────────────────────────────────────────────────────────────────────
                HR EXECUTIVE / OWNER ERP PORTAL VIEW
               ───────────────────────────────────────────────────────────────────────────── */
            <div className="space-y-6">
              {/* HR Top Bar Header */}
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
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
