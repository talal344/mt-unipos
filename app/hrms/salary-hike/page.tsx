"use client";

import React, { useState, useEffect } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import { useGlobalContext } from "@/context/global-context";
import { TrendingUp, Plus, X, DollarSign, Calculator, Download } from "lucide-react";

interface SalaryHike {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  previousSalary: number;
  newSalary: number;
  hikeAmount: number;
  hikePercentage: number;
  effectiveDate: string;
  reason: "Annual Increment" | "Promotion" | "Performance Bonus" | "Market Correction" | "Other";
  approvedBy: string;
  createdAt: string;
}

export default function HRSalaryHikePage() {
  const { currentUser, hrEmployees } = useGlobalContext();
  const [hikes, setHikes] = useState<SalaryHike[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (currentUser?.tenantId) {
      const saved = localStorage.getItem(`hr_salary_hikes_${currentUser.tenantId}`);
      if (saved) setHikes(JSON.parse(saved));
    }
  }, [currentUser?.tenantId]);

  const saveHikes = (newHikes: SalaryHike[]) => {
    setHikes(newHikes);
    if (currentUser?.tenantId) localStorage.setItem(`hr_salary_hikes_${currentUser.tenantId}`, JSON.stringify(newHikes));
  };

  const [form, setForm] = useState({
    employeeId: "",
    newSalary: "",
    effectiveDate: new Date().toISOString().split("T")[0],
    reason: "Annual Increment" as SalaryHike["reason"]
  });

  const selectedEmp = hrEmployees.find(e => e.id === form.employeeId);
  const prevSalary = selectedEmp?.basicSalary || 0;
  const newSalNum = parseFloat(form.newSalary) || 0;
  const hikeAmt = newSalNum > prevSalary ? newSalNum - prevSalary : 0;
  const hikePct = prevSalary > 0 ? ((hikeAmt / prevSalary) * 100).toFixed(2) : "0.00";

  const handleAddHike = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp || newSalNum <= prevSalary) return;

    const newHike: SalaryHike = {
      id: "HIKE-" + Math.floor(Math.random() * 100000),
      employeeId: selectedEmp.id,
      employeeName: selectedEmp.name,
      department: selectedEmp.department,
      designation: selectedEmp.designation,
      previousSalary: prevSalary,
      newSalary: newSalNum,
      hikeAmount: hikeAmt,
      hikePercentage: parseFloat(hikePct),
      effectiveDate: form.effectiveDate,
      reason: form.reason,
      approvedBy: currentUser?.name || "System",
      createdAt: new Date().toISOString()
    };
    saveHikes([newHike, ...hikes]);
    setShowAddModal(false);
  };

  const totalHikes = hikes.length;
  const avgHike = totalHikes > 0 ? (hikes.reduce((acc, h) => acc + h.hikePercentage, 0) / totalHikes).toFixed(1) : 0;
  const payrollImpact = hikes.reduce((acc, h) => acc + h.hikeAmount, 0);

  return (
    <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans">
      <HRMSSidebar />
      <main className="flex-grow p-6 space-y-6 overflow-y-auto max-h-screen">
        <div className="flex justify-between items-center border-b border-gray-800 pb-5">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-400" /> Salary Hike Manager
            </h1>
            <p className="text-xs text-gray-400">Track and manage employee salary increments.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition">
              <Download size={14} /> Export
            </button>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition">
              <Plus size={14} /> Record Hike
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#0b0f17] border border-gray-800 p-4 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl"><TrendingUp size={20} /></div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Hikes (YTD)</p>
              <h3 className="text-2xl font-black">{totalHikes}</h3>
            </div>
          </div>
          <div className="bg-[#0b0f17] border border-gray-800 p-4 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl"><Calculator size={20} /></div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Avg Hike %</p>
              <h3 className="text-2xl font-black">{avgHike}%</h3>
            </div>
          </div>
          <div className="bg-[#0b0f17] border border-gray-800 p-4 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl"><DollarSign size={20} /></div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Monthly Payroll Impact</p>
              <h3 className="text-2xl font-black">${payrollImpact.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider text-[10px] font-mono bg-black/40">
                <th className="p-4">Employee</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Previous Sal</th>
                <th className="p-4">New Sal</th>
                <th className="p-4">Hike %</th>
                <th className="p-4">Effective Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-mono text-xs">
              {hikes.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500 italic">No salary hikes recorded yet.</td></tr>
              ) : hikes.map(hike => (
                <tr key={hike.id} className="hover:bg-gray-800/20 transition">
                  <td className="p-4">
                    <div className="font-bold text-white">{hike.employeeName}</div>
                    <div className="text-[10px] text-gray-500">{hike.department} &bull; {hike.designation}</div>
                  </td>
                  <td className="p-4"><span className="bg-gray-800 px-2 py-1 rounded-md text-[10px]">{hike.reason}</span></td>
                  <td className="p-4 text-gray-400">${hike.previousSalary.toLocaleString()}</td>
                  <td className="p-4 font-bold text-emerald-400">${hike.newSalary.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={\`font-bold \${hike.hikePercentage >= 10 ? 'text-emerald-400' : hike.hikePercentage >= 5 ? 'text-amber-400' : 'text-gray-400'}\`}>+{hike.hikePercentage}%</span>
                      <div className="w-12 h-1.5 bg-gray-900 rounded-full">
                        <div className={\`h-1.5 rounded-full \${hike.hikePercentage >= 10 ? 'bg-emerald-500' : hike.hikePercentage >= 5 ? 'bg-amber-500' : 'bg-gray-500'}\`} style={{ width: \`\${Math.min(hike.hikePercentage * 3, 100)}%\` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-400">{hike.effectiveDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0c1018] border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-sm font-bold text-white">Record Salary Hike</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white"><X size={16} /></button>
            </div>
            <form onSubmit={handleAddHike} className="p-4 space-y-4">
              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Employee</label>
                <select required value={form.employeeId} onChange={(e) => setForm({...form, employeeId: e.target.value})} className="w-full bg-black border border-gray-800 text-white text-xs p-2 rounded-xl">
                  <option value="">Select Employee</option>
                  {hrEmployees.map(e => <option key={e.id} value={e.id}>{e.name} (Current: ${e.basicSalary})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Current Salary</label>
                  <input type="text" readOnly value={\`\$\${prevSalary}\`} className="w-full bg-gray-900 border border-gray-800 text-gray-400 text-xs p-2 rounded-xl" />
                </div>
                <div>
                  <label className="block text-[10px] text-emerald-500 uppercase font-bold mb-1">New Salary</label>
                  <input required type="number" min={prevSalary + 1} value={form.newSalary} onChange={(e) => setForm({...form, newSalary: e.target.value})} className="w-full bg-black border border-emerald-900/50 text-white text-xs p-2 rounded-xl focus:border-emerald-500 focus:outline-none" />
                </div>
              </div>
              <div className="bg-emerald-900/10 border border-emerald-900/30 p-3 rounded-xl flex justify-between items-center">
                <span className="text-xs text-emerald-400">Calculated Hike:</span>
                <span className="font-bold text-emerald-400">+{hikePct}% (${hikeAmt})</span>
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Reason</label>
                <select value={form.reason} onChange={(e) => setForm({...form, reason: e.target.value as any})} className="w-full bg-black border border-gray-800 text-white text-xs p-2 rounded-xl">
                  <option>Annual Increment</option><option>Promotion</option><option>Performance Bonus</option><option>Market Correction</option><option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Effective Date</label>
                <input required type="date" value={form.effectiveDate} onChange={(e) => setForm({...form, effectiveDate: e.target.value})} className="w-full bg-black border border-gray-800 text-white text-xs p-2 rounded-xl" />
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs p-3 rounded-xl transition">Confirm Hike</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
