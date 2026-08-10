"use client";

import React, { useMemo } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import { useGlobalContext } from "@/context/global-context";
import { BrainCircuit, AlertOctagon, TrendingUp, ShieldAlert, Activity, User } from "lucide-react";

export default function AIAttritionRiskPage() {
  const { hrEmployees, hrAttendance, hrLeaves, hrAppraisals } = useGlobalContext();

  const employeeRisks = useMemo(() => {
    // Calculate department average salaries
    const deptSalaries: Record<string, { total: number; count: number }> = {};
    hrEmployees.forEach((emp) => {
      if (!deptSalaries[emp.department]) deptSalaries[emp.department] = { total: 0, count: 0 };
      deptSalaries[emp.department].total += emp.basicSalary;
      deptSalaries[emp.department].count += 1;
    });
    
    const deptAverages: Record<string, number> = {};
    Object.keys(deptSalaries).forEach((dept) => {
      deptAverages[dept] = deptSalaries[dept].total / deptSalaries[dept].count;
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return hrEmployees.map((emp) => {
      let score = 0;
      const factors: string[] = [];

      // 1. Absences in last 30 days
      const absences = hrAttendance.filter(
        (a) => a.employeeId === emp.id && a.status === "Absent" && new Date(a.date) >= thirtyDaysAgo
      ).length;
      const absenceScore = Math.min(absences * 8, 40);
      score += absenceScore;
      if (absenceScore > 0) factors.push(`${absences} recent absences (+${absenceScore})`);

      // 2. Pending/Rejected leaves
      const badLeaves = hrLeaves.filter(
        (l) => l.employeeId === emp.id && (l.status === "Pending" || l.status === "Rejected")
      ).length;
      const leaveScore = Math.min(badLeaves * 5, 20);
      score += leaveScore;
      if (leaveScore > 0) factors.push(`${badLeaves} pending/rejected leaves (+${leaveScore})`);

      // 3. Tenure < 6 months
      const joinDate = new Date(emp.joiningDate);
      if (joinDate >= sixMonthsAgo) {
        score += 15;
        factors.push(`New joiner risk (+15)`);
      }

      // 4. No appraisal in 12 months
      const hasRecentAppraisal = hrAppraisals.some(
        (a) => a.employeeId === emp.id && new Date(a.date) >= twelveMonthsAgo
      );
      if (!hasRecentAppraisal) {
        score += 10;
        factors.push(`No recent appraisal (+10)`);
      }

      // 5. Salary below dept average
      const avg = deptAverages[emp.department] || 0;
      if (emp.basicSalary < avg) {
        score += 10;
        factors.push(`Salary below dept average (+10)`);
      }

      // 6. On Leave status
      if (emp.status === "On Leave") {
        score += 5;
        factors.push(`Currently on leave (+5)`);
      }

      let riskLevel = "Low";
      if (score > 80) riskLevel = "Critical";
      else if (score > 60) riskLevel = "High";
      else if (score > 30) riskLevel = "Medium";

      return {
        ...emp,
        score,
        riskLevel,
        factors,
      };
    }).sort((a, b) => b.score - a.score);
  }, [hrEmployees, hrAttendance, hrLeaves, hrAppraisals]);

  const criticalCount = employeeRisks.filter((e) => e.riskLevel === "Critical").length;
  const highCount = employeeRisks.filter((e) => e.riskLevel === "High").length;
  const avgRisk = employeeRisks.length > 0 
    ? Math.round(employeeRisks.reduce((acc, curr) => acc + curr.score, 0) / employeeRisks.length) 
    : 0;

  // Dept Heatmap
  const deptRiskMap = useMemo(() => {
    const map: Record<string, { totalScore: number; count: number; avg: number }> = {};
    employeeRisks.forEach((e) => {
      if (!map[e.department]) map[e.department] = { totalScore: 0, count: 0, avg: 0 };
      map[e.department].totalScore += e.score;
      map[e.department].count += 1;
    });
    Object.keys(map).forEach((dept) => {
      map[dept].avg = Math.round(map[dept].totalScore / map[dept].count);
    });
    return map;
  }, [employeeRisks]);

  return (
    <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans">
      <HRMSSidebar />
      
      <main className="flex-grow p-6 space-y-6 overflow-y-auto max-h-screen">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <BrainCircuit size={20} className="text-purple-400" />
              AI Attrition Risk Predictor
            </h1>
            <p className="text-xs text-gray-400 flex items-center gap-2">
              Identify employees at high flight risk using predictive analytics.
              <span className="bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                Powered by MT Core AI Risk Engine (Beta)
              </span>
            </p>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-violet-900/30 to-purple-900/10 border border-purple-500/30 p-4 rounded-2xl flex items-center gap-4">
            <div className="bg-red-500/20 p-3 rounded-xl">
              <AlertOctagon size={24} className="text-red-400" />
            </div>
            <div>
              <p className="text-xs text-purple-300 font-bold uppercase tracking-wider">Critical Risk</p>
              <h2 className="text-2xl font-black text-white">{criticalCount} <span className="text-sm font-normal text-gray-400">employees</span></h2>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-violet-900/30 to-purple-900/10 border border-purple-500/30 p-4 rounded-2xl flex items-center gap-4">
            <div className="bg-orange-500/20 p-3 rounded-xl">
              <ShieldAlert size={24} className="text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-purple-300 font-bold uppercase tracking-wider">High Risk</p>
              <h2 className="text-2xl font-black text-white">{highCount} <span className="text-sm font-normal text-gray-400">employees</span></h2>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-violet-900/30 to-purple-900/10 border border-purple-500/30 p-4 rounded-2xl flex items-center gap-4">
            <div className="bg-purple-500/20 p-3 rounded-xl">
              <Activity size={24} className="text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-purple-300 font-bold uppercase tracking-wider">Company Avg Risk</p>
              <h2 className="text-2xl font-black text-white">{avgRisk}<span className="text-sm font-normal text-gray-400">/100</span></h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Risk Table */}
          <div className="lg:col-span-2 bg-[#0b0f17] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-gray-800 bg-black/40 flex justify-between items-center">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <TrendingUp size={16} className="text-purple-400" />
                Employee Risk Analysis
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider text-[10px] font-mono bg-black/20">
                    <th className="p-4">Employee</th>
                    <th className="p-4">Risk Score</th>
                    <th className="p-4">Risk Level</th>
                    <th className="p-4">Key Risk Factors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-mono text-xs">
                  {employeeRisks.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-800/30 transition">
                      <td className="p-4">
                        <div className="font-sans font-bold text-white">{emp.name}</div>
                        <div className="text-[10px] text-gray-500 font-sans">{emp.designation}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white w-6">{emp.score}</span>
                          <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                emp.riskLevel === 'Critical' ? 'bg-red-500' :
                                emp.riskLevel === 'High' ? 'bg-orange-500' :
                                emp.riskLevel === 'Medium' ? 'bg-amber-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${emp.score}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          emp.riskLevel === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' :
                          emp.riskLevel === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                          emp.riskLevel === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-green-500/20 text-green-400 border border-green-500/30'
                        }`}>
                          {emp.riskLevel}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          {emp.factors.slice(0, 2).map((f, i) => (
                            <span key={i} className="text-[10px] text-gray-400 truncate max-w-[200px]">
                              • {f}
                            </span>
                          ))}
                          {emp.factors.length > 2 && (
                            <span className="text-[9px] text-purple-400 cursor-pointer hover:underline">
                              +{emp.factors.length - 2} more...
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {employeeRisks.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500 italic font-sans">
                        No employees found to analyze.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Department Heatmap & Top At-Risk */}
          <div className="space-y-6">
            <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl overflow-hidden shadow-xl p-5">
              <h3 className="font-bold text-white text-sm mb-4 border-b border-gray-800 pb-2">Top 5 At-Risk</h3>
              <div className="space-y-3">
                {employeeRisks.slice(0, 5).map(emp => (
                  <div key={emp.id} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">
                        <User size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{emp.name}</p>
                        <p className="text-[10px] text-gray-500">{emp.department}</p>
                      </div>
                    </div>
                    <div className={`text-xs font-black ${
                      emp.riskLevel === 'Critical' ? 'text-red-400' :
                      emp.riskLevel === 'High' ? 'text-orange-400' :
                      emp.riskLevel === 'Medium' ? 'text-amber-400' :
                      'text-green-400'
                    }`}>
                      {emp.score} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl overflow-hidden shadow-xl p-5">
              <h3 className="font-bold text-white text-sm mb-4 border-b border-gray-800 pb-2">Department Heatmap</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(deptRiskMap).map(([dept, data]) => {
                  let colorClass = "bg-green-500/10 border-green-500/20 text-green-400";
                  if (data.avg > 60) colorClass = "bg-red-500/10 border-red-500/20 text-red-400";
                  else if (data.avg > 40) colorClass = "bg-orange-500/10 border-orange-500/20 text-orange-400";
                  else if (data.avg > 25) colorClass = "bg-amber-500/10 border-amber-500/20 text-amber-400";

                  return (
                    <div key={dept} className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1 ${colorClass}`}>
                      <span className="text-2xl font-black">{data.avg}</span>
                      <span className="text-[10px] uppercase font-bold text-gray-400 text-center truncate w-full">{dept}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
