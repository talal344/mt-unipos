"use client";

import React, { useMemo, useState } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import { useGlobalContext } from "@/context/global-context";
import {
  BarChart3,
  Users,
  TrendingUp,
  DollarSign,
  Briefcase,
  UserCheck,
  UserX,
  PieChart,
  Calendar,
  Building2
} from "lucide-react";

export default function EmployeeAnalyticsPage() {
  const { hrEmployees, hrLeaves, currencySymbol } = useGlobalContext();
  const [selectedDept, setSelectedDept] = useState("All");

  const totalEmployees = hrEmployees.length;
  const activeEmployees = hrEmployees.filter((e) => e.status === "Active").length;
  const onLeaveEmployees = hrEmployees.filter((e) => e.status === "On Leave").length;
  const terminatedEmployees = hrEmployees.filter((e) => e.status === "Terminated").length;

  const totalMonthlyPayroll = useMemo(() => {
    return hrEmployees
      .filter((e) => e.status === "Active")
      .reduce((sum, emp) => sum + (emp.basicSalary || 0), 0);
  }, [hrEmployees]);

  const avgSalary = activeEmployees > 0 ? Math.round(totalMonthlyPayroll / activeEmployees) : 0;
  const turnoverRate = totalEmployees > 0 ? ((terminatedEmployees / totalEmployees) * 100).toFixed(1) : "0.0";

  // Dept distribution
  const deptDistribution = useMemo(() => {
    const counts: Record<string, { total: number; active: number; payroll: number }> = {};
    hrEmployees.forEach((emp) => {
      const d = emp.department || "General";
      if (!counts[d]) counts[d] = { total: 0, active: 0, payroll: 0 };
      counts[d].total += 1;
      if (emp.status === "Active") {
        counts[d].active += 1;
        counts[d].payroll += emp.basicSalary || 0;
      }
    });
    return Object.entries(counts).map(([name, data]) => ({
      name,
      ...data,
      pct: totalEmployees > 0 ? Math.round((data.total / totalEmployees) * 100) : 0
    }));
  }, [hrEmployees, totalEmployees]);

  // Employment Type distribution
  const empTypes = useMemo(() => {
    const types: Record<string, number> = {};
    hrEmployees.forEach((e) => {
      const t = e.employmentType || "Full-time";
      types[t] = (types[t] || 0) + 1;
    });
    return Object.entries(types);
  }, [hrEmployees]);

  // Salary ranges
  const salaryRanges = useMemo(() => {
    const ranges = [
      { label: "< 50k", count: 0, color: "bg-emerald-500" },
      { label: "50k - 100k", count: 0, color: "bg-teal-500" },
      { label: "100k - 150k", count: 0, color: "bg-sky-500" },
      { label: "150k - 250k", count: 0, color: "bg-indigo-500" },
      { label: "250k+", count: 0, color: "bg-purple-500" }
    ];
    hrEmployees.forEach((e) => {
      const s = e.basicSalary || 0;
      if (s < 50000) ranges[0].count++;
      else if (s <= 100000) ranges[1].count++;
      else if (s <= 150000) ranges[2].count++;
      else if (s <= 250000) ranges[3].count++;
      else ranges[4].count++;
    });
    return ranges;
  }, [hrEmployees]);

  return (
    <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans">
      <HRMSSidebar />
      <main className="flex-grow p-6 space-y-6 overflow-y-auto max-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-5">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <BarChart3 size={22} className="text-emerald-400" />
              Employee Analytics & Workforce Intelligence
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Real-time headcount, compensation metrics, departmental ratios, and retention analytics.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#0b0f17] border border-gray-800 p-1.5 rounded-xl text-xs font-bold text-gray-400">
            <Calendar size={14} className="text-emerald-400" />
            <span>Updated: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0b0f17] border border-emerald-500/20 p-4 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase">
              <span>Total Workforce</span>
              <Users size={16} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white mt-2">{totalEmployees}</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
              <UserCheck size={12} /> {activeEmployees} Active ({totalEmployees > 0 ? Math.round((activeEmployees / totalEmployees) * 100) : 0}%)
            </div>
          </div>

          <div className="bg-[#0b0f17] border border-gray-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase">
              <span>Monthly Salary Budget</span>
              <DollarSign size={16} className="text-sky-400" />
            </div>
            <div className="text-2xl font-black text-white mt-2">
              {currencySymbol || "$"}{totalMonthlyPayroll.toLocaleString()}
            </div>
            <div className="text-[11px] text-gray-400 mt-1 font-semibold">
              Avg: {currencySymbol || "$"}{avgSalary.toLocaleString()} / employee
            </div>
          </div>

          <div className="bg-[#0b0f17] border border-gray-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase">
              <span>Turnover Rate</span>
              <TrendingUp size={16} className="text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white mt-2">{turnoverRate}%</div>
            <div className="text-[11px] text-amber-400 mt-1 font-semibold">
              {terminatedEmployees} departures recorded
            </div>
          </div>

          <div className="bg-[#0b0f17] border border-gray-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase">
              <span>Currently On Leave</span>
              <UserX size={16} className="text-rose-400" />
            </div>
            <div className="text-2xl font-black text-white mt-2">{onLeaveEmployees}</div>
            <div className="text-[11px] text-gray-400 mt-1 font-semibold">
              {hrLeaves.filter((l) => l.status === "Approved").length} total approved requests
            </div>
          </div>
        </div>

        {/* Charts & Distributions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Headcount Breakdown */}
          <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 size={16} className="text-emerald-400" />
                Department Headcount & Payroll Allocation
              </h2>
              <span className="text-[10px] text-gray-400 font-mono font-bold uppercase">{deptDistribution.length} Departments</span>
            </div>

            <div className="space-y-3.5">
              {deptDistribution.map((dept) => (
                <div key={dept.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-200">{dept.name}</span>
                    <span className="text-gray-400">
                      {dept.total} staff ({dept.pct}%) &bull; {currencySymbol || "$"}{dept.payroll.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-gray-800">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(dept.pct, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Salary Distribution */}
          <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChart size={16} className="text-sky-400" />
                Salary Distribution Tiering
              </h2>
              <span className="text-[10px] text-gray-400 font-mono font-bold uppercase">Base Monthly</span>
            </div>

            <div className="space-y-3.5">
              {salaryRanges.map((range) => {
                const pct = totalEmployees > 0 ? Math.round((range.count / totalEmployees) * 100) : 0;
                return (
                  <div key={range.label} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-300">{range.label}</span>
                      <span className="text-gray-400">
                        {range.count} employees ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-gray-800">
                      <div
                        className={`${range.color} h-2 rounded-full transition-all duration-700`}
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Employment Types Pill row */}
            <div className="pt-3 border-t border-gray-800">
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">Employment Type Mix</p>
              <div className="flex flex-wrap gap-2">
                {empTypes.map(([type, count]) => (
                  <span
                    key={type}
                    className="bg-black/50 border border-gray-800 text-xs px-3 py-1.5 rounded-xl font-bold text-gray-300 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {type}: <span className="text-emerald-400">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Staff Table */}
        <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-800 bg-black/30 flex justify-between items-center">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase size={16} className="text-teal-400" />
              Active Staff Directory Overview
            </h2>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-emerald-500/20">
              {activeEmployees} Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-gray-800 text-[10px] uppercase tracking-wider text-gray-500 font-mono bg-black/40">
                  <th className="p-3.5">Employee</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Designation</th>
                  <th className="p-3.5">Joined</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5 text-right">Basic Salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {hrEmployees.slice(0, 8).map((emp) => (
                  <tr key={emp.id} className="hover:bg-emerald-500/5 transition">
                    <td className="p-3.5 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-600/20 text-emerald-400 font-black text-[10px] flex items-center justify-center border border-emerald-500/30">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <div>{emp.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{emp.employeeCode}</div>
                      </div>
                    </td>
                    <td className="p-3.5 text-gray-300">{emp.department}</td>
                    <td className="p-3.5 text-gray-400">{emp.designation}</td>
                    <td className="p-3.5 text-gray-400 font-mono text-[11px]">{emp.joiningDate || "—"}</td>
                    <td className="p-3.5">
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {emp.employmentType || "Full-time"}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                      {currencySymbol || "$"}{(emp.basicSalary || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
