"use client";

import React, { useState, useMemo, useEffect } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import HRMSTopHeader from "@/components/hrms-top-header";
import { useGlobalContext, HREmployee } from "@/context/global-context";
import {
  Users,
  GitBranch,
  Building2,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Search,
  ShieldAlert,
  Crown,
  Network,
  LayoutGrid,
  ListTree,
  UserCheck,
  UserX,
  ArrowRight,
  Sparkles,
  Layers,
  Filter,
  Check,
  X
} from "lucide-react";

export default function TeamAssignPage() {
  const {
    hrEmployees,
    updateHREmployee,
    hrDepartments,
    hrDesignations,
    currentUser
  } = useGlobalContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [filterStatus, setFilterStatus] = useState<"All" | "Assigned" | "Unassigned">("All");
  const [viewMode, setViewMode] = useState<"departments" | "orgTree">("departments");
  const [expandedDeps, setExpandedDeps] = useState<Record<string, boolean>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Authorization check
  const empMatch = hrEmployees.find(
    (e) => e.email?.toLowerCase().trim() === currentUser?.email?.toLowerCase().trim()
  );
  const isHRUser = Boolean(
    (currentUser?.role as string) === "HR" ||
      currentUser?.email?.toLowerCase().includes("hr@") ||
      empMatch?.department === "Human Resources"
  );
  const isOwner = currentUser?.role === "Owner";
  const isAuthorized = isOwner || isHRUser;

  useEffect(() => {
    const initialExp: Record<string, boolean> = {};
    hrDepartments.forEach((d) => {
      initialExp[d.name] = true;
    });
    setExpandedDeps(initialExp);
  }, [hrDepartments]);

  const toggleDept = (deptTitle: string) => {
    setExpandedDeps((prev) => ({ ...prev, [deptTitle]: !prev[deptTitle] }));
  };

  const getEmpRank = (designationTitle: string) => {
    const desig = hrDesignations.find((d) => d.title === designationTitle);
    return desig?.rank || 9;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { label: "Executive Head", bg: "bg-amber-500/10 text-amber-400 border-amber-500/30" };
    if (rank <= 3) return { label: `Senior Lead (R${rank})`, bg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" };
    if (rank <= 5) return { label: `Manager (R${rank})`, bg: "bg-sky-500/10 text-sky-400 border-sky-500/30" };
    return { label: `Associate (R${rank})`, bg: "bg-gray-800 text-gray-400 border-gray-700" };
  };

  const handleAssignManager = (empId: string, managerId: string) => {
    let reportingDesignation = "";
    let managerName = "Top Level (No Manager)";
    if (managerId) {
      const manager = hrEmployees.find((e) => e.id === managerId);
      if (manager) {
        reportingDesignation = manager.designation;
        managerName = manager.name;
      }
    }
    updateHREmployee(empId, { reportsTo: managerId, reportingDesignation });
    const emp = hrEmployees.find((e) => e.id === empId);
    triggerToast(`✅ ${emp?.name || "Staff"} is now reporting to ${managerName}`);
  };

  const handleAutoAssignDept = (deptName: string) => {
    const deptEmps = hrEmployees.filter((e) => e.status === "Active" && e.department === deptName);
    if (deptEmps.length === 0) return;

    // Find highest rank employee in department (lowest rank number)
    const sorted = [...deptEmps].sort((a, b) => getEmpRank(a.designation) - getEmpRank(b.designation));
    const deptHead = sorted[0];

    if (!deptHead) return;

    let assignedCount = 0;
    sorted.slice(1).forEach((emp) => {
      if (!emp.reportsTo) {
        updateHREmployee(emp.id, {
          reportsTo: deptHead.id,
          reportingDesignation: deptHead.designation
        });
        assignedCount++;
      }
    });

    triggerToast(`✨ Auto-assigned ${assignedCount} unassigned team members to ${deptHead.name} (${deptHead.designation})!`);
  };

  const activeEmployees = useMemo(() => hrEmployees.filter((e) => e.status === "Active"), [hrEmployees]);
  const assignedCount = activeEmployees.filter((e) => e.reportsTo).length;
  const unassignedCount = activeEmployees.length - assignedCount;
  const topLevelCount = activeEmployees.filter((e) => !e.reportsTo && getEmpRank(e.designation) <= 2).length;
  const assignmentRate = activeEmployees.length > 0 ? Math.round((assignedCount / activeEmployees.length) * 100) : 0;

  // Group active employees by department with search and status filtering
  const deptEmployees = useMemo(() => {
    const groups: Record<string, HREmployee[]> = {};
    hrDepartments.forEach((d) => {
      groups[d.name] = [];
    });

    activeEmployees.forEach((emp) => {
      if (!groups[emp.department]) {
        groups[emp.department] = [];
      }
      groups[emp.department].push(emp);
    });
    return groups;
  }, [activeEmployees, hrDepartments]);

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans">
        <HRMSSidebar />
        <main className="flex-grow overflow-y-auto max-h-screen">
          <HRMSTopHeader title="Assign Team" subtitle="Manage reporting structures" />
          <div className="p-6 flex items-center justify-center h-[calc(100vh-100px)]">
            <div className="text-center p-8 bg-[#0b0f17] border border-gray-800 rounded-2xl max-w-md w-full shadow-2xl">
              <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
              <p className="text-gray-400 text-xs">
                You do not have permission to access the team assignment console. This area is strictly restricted to HR Directors and Owners.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#05080d] text-gray-100 font-sans overflow-hidden">
      <HRMSSidebar />
      <main className="flex-grow overflow-y-auto h-full relative">
        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-black px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce border border-emerald-400/50">
            <CheckCircle2 size={16} />
            <span>{toastMsg}</span>
          </div>
        )}

        <HRMSTopHeader
          title="🏢 Team Assignment & Org Reporting Hierarchy"
          subtitle="Manage organizational hierarchy, department reporting lines, and team leadership structure."
        />

        <div className="p-6 space-y-6">
          {/* Executive Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0b0f17] border border-gray-800/80 rounded-2xl p-4.5 flex items-center justify-between shadow-sm hover:border-gray-700 transition">
              <div>
                <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Active Headcount</p>
                <p className="text-2xl font-black text-white">{activeEmployees.length}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Across {hrDepartments.length} Departments</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
            </div>

            <div className="bg-[#0b0f17] border border-gray-800/80 rounded-2xl p-4.5 flex items-center justify-between shadow-sm hover:border-gray-700 transition">
              <div>
                <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Reporting Assigned</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-black text-emerald-400">{assignedCount}</p>
                  <span className="text-xs font-bold text-emerald-500">({assignmentRate}%)</span>
                </div>
                <div className="w-24 bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${assignmentRate}%` }} />
                </div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-emerald-400" />
              </div>
            </div>

            <div
              onClick={() => setFilterStatus(filterStatus === "Unassigned" ? "All" : "Unassigned")}
              className={`bg-[#0b0f17] border rounded-2xl p-4.5 flex items-center justify-between shadow-sm cursor-pointer transition ${
                filterStatus === "Unassigned"
                  ? "border-amber-500 ring-1 ring-amber-500/50 bg-amber-500/5"
                  : "border-gray-800/80 hover:border-amber-500/40"
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Unassigned Staff</p>
                  {filterStatus === "Unassigned" && (
                    <span className="text-[9px] bg-amber-500 text-black px-1.5 py-0.2 rounded font-black">ACTIVE FILTER</span>
                  )}
                </div>
                <p className="text-2xl font-black text-amber-400">{unassignedCount}</p>
                <p className="text-[10px] text-amber-500/80 mt-0.5">Click to filter unassigned</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
            </div>

            <div className="bg-[#0b0f17] border border-gray-800/80 rounded-2xl p-4.5 flex items-center justify-between shadow-sm hover:border-gray-700 transition">
              <div>
                <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Executive Leads</p>
                <p className="text-2xl font-black text-violet-400">{topLevelCount}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Top-Level Reporting Nodes</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <Crown className="w-5 h-5 text-violet-400" />
              </div>
            </div>
          </div>

          {/* Controls Bar & View Switcher */}
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-[#0b0f17] border border-gray-800 p-3 rounded-2xl">
            {/* Search Box */}
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search staff by name, code, designation, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition shadow-inner"
              />
            </div>

            {/* Filters and View Switcher */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="bg-black border border-gray-800 text-xs text-gray-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="All">All Departments</option>
                {hrDepartments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-black border border-gray-800 text-xs text-gray-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Assigned">Assigned Only</option>
                <option value="Unassigned">Unassigned Only</option>
              </select>

              {/* View toggle button */}
              <div className="flex items-center bg-black border border-gray-800 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode("departments")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    viewMode === "departments"
                      ? "bg-emerald-600 text-white shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <LayoutGrid size={13} />
                  <span>Departments</span>
                </button>
                <button
                  onClick={() => setViewMode("orgTree")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    viewMode === "orgTree"
                      ? "bg-emerald-600 text-white shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <ListTree size={13} />
                  <span>Hierarchy Matrix</span>
                </button>
              </div>
            </div>
          </div>

          {/* VIEW MODE 1: Departments List */}
          {viewMode === "departments" && (
            <div className="space-y-5">
              {Object.entries(deptEmployees).map(([deptTitle, employees]) => {
                if (filterDepartment !== "All" && deptTitle !== filterDepartment) return null;

                const filteredEmployees = employees.filter((emp) => {
                  const q = searchQuery.toLowerCase();
                  const matchQuery =
                    q === "" ||
                    emp.name.toLowerCase().includes(q) ||
                    emp.employeeCode.toLowerCase().includes(q) ||
                    emp.designation.toLowerCase().includes(q) ||
                    emp.department.toLowerCase().includes(q);

                  const matchStatus =
                    filterStatus === "All" ||
                    (filterStatus === "Assigned" && emp.reportsTo) ||
                    (filterStatus === "Unassigned" && !emp.reportsTo);

                  return matchQuery && matchStatus;
                });

                if (filteredEmployees.length === 0 && (searchQuery || filterStatus !== "All" || filterDepartment !== "All")) {
                  return null;
                }

                const isExpanded = expandedDeps[deptTitle] ?? true;
                const deptAssigned = employees.filter((e) => e.reportsTo).length;
                const deptUnassigned = employees.length - deptAssigned;

                // Department lead
                const sortedByRank = [...employees].sort(
                  (a, b) => getEmpRank(a.designation) - getEmpRank(b.designation)
                );
                const deptLead = sortedByRank[0];

                return (
                  <div
                    key={deptTitle}
                    className="bg-[#0b0f17] border border-gray-800 rounded-2xl overflow-hidden shadow-lg transition-all"
                  >
                    {/* Department Header */}
                    <div className="p-4 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-emerald-950/10 via-transparent to-transparent">
                      <div
                        className="flex items-center space-x-3 cursor-pointer flex-grow select-none"
                        onClick={() => toggleDept(deptTitle)}
                      >
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white hover:text-emerald-400 transition">
                              {deptTitle}
                            </h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
                              {employees.length} Staff
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {deptLead ? (
                              <span>
                                Head: <strong className="text-gray-200">{deptLead.name}</strong> ({deptLead.designation})
                              </span>
                            ) : (
                              "No members assigned yet"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {deptUnassigned > 0 && deptLead && (
                          <button
                            onClick={() => handleAutoAssignDept(deptTitle)}
                            className="flex items-center gap-1.5 text-[11px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl transition cursor-pointer"
                          >
                            <Sparkles size={13} />
                            Auto-Assign ({deptUnassigned}) to {deptLead.name.split(" ")[0]}
                          </button>
                        )}

                        <button
                          onClick={() => toggleDept(deptTitle)}
                          className="p-2 rounded-xl bg-black border border-gray-800 text-gray-400 hover:text-white transition cursor-pointer"
                        >
                          {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                        </button>
                      </div>
                    </div>

                    {/* Department Table */}
                    {isExpanded && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[760px] text-xs">
                          <thead>
                            <tr className="bg-black/50 text-[10px] text-gray-500 uppercase tracking-wider font-mono border-b border-gray-800/80">
                              <th className="px-5 py-3.5 w-[32%]">Team Member</th>
                              <th className="px-5 py-3.5 w-[20%]">Designation & Rank</th>
                              <th className="px-5 py-3.5 w-[16%]">Reporting Status</th>
                              <th className="px-5 py-3.5 w-[32%] text-right">Reporting Manager</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800/60 font-sans">
                            {filteredEmployees.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="px-5 py-6 text-center text-gray-500 text-xs">
                                  No employees found matching filter criteria in {deptTitle}.
                                </td>
                              </tr>
                            ) : (
                              filteredEmployees.map((emp) => {
                                const empRank = getEmpRank(emp.designation);
                                const rankBadge = getRankBadge(empRank);

                                // Managers in same department with higher rank (strictly lower rank number)
                                const possibleManagers = activeEmployees.filter(
                                  (e) =>
                                    e.department === emp.department &&
                                    e.id !== emp.id &&
                                    getEmpRank(e.designation) < empRank
                                );

                                return (
                                  <tr key={emp.id} className="hover:bg-emerald-500/5 transition group">
                                    {/* Member Info */}
                                    <td className="px-5 py-3.5">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-gray-800 to-gray-700 flex items-center justify-center shrink-0 border border-gray-700 text-white font-black text-xs shadow-inner">
                                          {emp.avatar ? (
                                            <img
                                              src={emp.avatar}
                                              alt={emp.name}
                                              className="w-full h-full rounded-xl object-cover"
                                            />
                                          ) : (
                                            emp.name.charAt(0)
                                          )}
                                        </div>
                                        <div>
                                          <p className="font-bold text-white group-hover:text-emerald-400 transition">
                                            {emp.name}
                                          </p>
                                          <p className="text-[10px] text-gray-500 font-mono">
                                            {emp.employeeCode} &bull; {emp.email || "No email"}
                                          </p>
                                        </div>
                                      </div>
                                    </td>

                                    {/* Role & Rank */}
                                    <td className="px-5 py-3.5">
                                      <div className="font-bold text-gray-200">{emp.designation}</div>
                                      <span
                                        className={`inline-block mt-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${rankBadge.bg}`}
                                      >
                                        {rankBadge.label}
                                      </span>
                                    </td>

                                    {/* Status Badge */}
                                    <td className="px-5 py-3.5">
                                      {emp.reportsTo ? (
                                        <div className="flex items-center space-x-1.5">
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                          <span className="text-[11px] text-emerald-400 font-bold">Assigned</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center space-x-1.5">
                                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                          <span className="text-[11px] text-amber-400 font-bold">Unassigned</span>
                                        </div>
                                      )}
                                    </td>

                                    {/* Reporting Manager Select */}
                                    <td className="px-5 py-3.5 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <select
                                          value={emp.reportsTo || ""}
                                          onChange={(e) => handleAssignManager(emp.id, e.target.value)}
                                          className="w-full max-w-[260px] bg-black border border-gray-700 hover:border-emerald-500/50 rounded-xl px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500 transition cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1em] bg-[right_0.6rem_center] bg-no-repeat pr-8"
                                        >
                                          <option value="">None / Top Level Direct</option>
                                          {possibleManagers.map((mgr) => (
                                            <option key={mgr.id} value={mgr.id}>
                                              {mgr.name} ({mgr.designation})
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW MODE 2: Visual Org Matrix & Tree */}
          {viewMode === "orgTree" && (
            <div className="space-y-6">
              {hrDepartments.map((dept) => {
                if (filterDepartment !== "All" && dept.name !== filterDepartment) return null;

                const deptEmps = activeEmployees.filter((e) => e.department === dept.name);
                if (deptEmps.length === 0) return null;

                // Find Top Level leaders in this department
                const leaders = deptEmps.filter((e) => !e.reportsTo);

                return (
                  <div
                    key={dept.id}
                    className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-6 space-y-6 shadow-xl"
                  >
                    <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                          <Network className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white">{dept.name} Hierarchy Tree</h3>
                          <p className="text-xs text-gray-400">{deptEmps.length} active members</p>
                        </div>
                      </div>
                    </div>

                    {/* Leaders Grid */}
                    <div className="space-y-6">
                      {leaders.map((leader) => {
                        const directReports = deptEmps.filter((e) => e.reportsTo === leader.id);

                        return (
                          <div
                            key={leader.id}
                            className="bg-[#05080d] border border-indigo-500/30 rounded-2xl p-4 space-y-4"
                          >
                            {/* Leader Card */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-500/10 border border-indigo-500/20 p-3.5 rounded-xl">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-sm shadow">
                                  {leader.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-white text-sm">{leader.name}</span>
                                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500 text-white">
                                      Leader / Node Head
                                    </span>
                                  </div>
                                  <p className="text-xs text-indigo-300 font-medium">{leader.designation}</p>
                                </div>
                              </div>
                              <div className="text-xs font-mono text-gray-400">
                                {directReports.length} direct report{directReports.length !== 1 ? "s" : ""}
                              </div>
                            </div>

                            {/* Subordinates */}
                            {directReports.length === 0 ? (
                              <p className="text-xs text-gray-500 italic pl-4">No direct reports assigned yet.</p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-4 border-l-2 border-indigo-500/30">
                                {directReports.map((sub) => (
                                  <div
                                    key={sub.id}
                                    className="bg-[#0b0f17] border border-gray-800 hover:border-emerald-500/40 rounded-xl p-3 space-y-2 transition"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center font-bold text-xs text-gray-200">
                                          {sub.name.charAt(0)}
                                        </div>
                                        <div>
                                          <p className="font-bold text-white text-xs">{sub.name}</p>
                                          <p className="text-[10px] text-gray-400">{sub.designation}</p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono pt-2 border-t border-gray-800/80">
                                      <span>Code: {sub.employeeCode}</span>
                                      <button
                                        onClick={() => handleAssignManager(sub.id, "")}
                                        className="text-red-400 hover:text-red-300 text-[10px] font-bold cursor-pointer"
                                      >
                                        Unassign
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
