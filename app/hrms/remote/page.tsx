"use client";

import React, { useState, useEffect, useMemo } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import { useGlobalContext } from "@/context/global-context";
import { 
  Laptop, MapPin, CheckCircle2, Clock, 
  Plus, X, Filter, BarChart2, Briefcase
} from "lucide-react";

interface RemoteLog {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  location: "Home" | "Co-working" | "Client Site" | "Travel";
  productivity: "High" | "Medium" | "Low" | null;
  tasksCompleted: string;
  notes?: string;
  status: "Active" | "Completed";
}

interface RemotePolicy {
  maxDaysPerWeek: number;
  allowedRoles: string[];
  requiresApproval: boolean;
}

export default function RemoteWorkTrackerPage() {
  const { hrEmployees } = useGlobalContext();
  
  const [logs, setLogs] = useState<RemoteLog[]>([]);
  const [policy, setPolicy] = useState<RemotePolicy>({
    maxDaysPerWeek: 3,
    allowedRoles: ["Developer", "Designer", "Manager"],
    requiresApproval: true
  });
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState<string | null>(null);

  const [addForm, setAddForm] = useState({
    employeeId: "",
    date: new Date().toISOString().split("T")[0],
    checkInTime: "09:00 AM",
    location: "Home" as any,
    tasksCompleted: ""
  });

  const [checkoutForm, setCheckoutForm] = useState({
    checkOutTime: "06:00 PM",
    productivity: "High" as any,
    notes: ""
  });

  const [filterDate, setFilterDate] = useState("");
  const [filterDept, setFilterDept] = useState("All");

  useEffect(() => {
    // Read from localStorage (simulate isolated storage per tenant if needed, hardcoded key here)
    const storedLogs = localStorage.getItem("hr_remote_logs_default");
    const storedPolicy = localStorage.getItem("hr_remote_policy_default");
    
    if (storedLogs) setLogs(JSON.parse(storedLogs));
    if (storedPolicy) setPolicy(JSON.parse(storedPolicy));
    
    setIsLoaded(true);
  }, []);

  const saveLogs = (newLogs: RemoteLog[]) => {
    setLogs(newLogs);
    localStorage.setItem("hr_remote_logs_default", JSON.stringify(newLogs));
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = hrEmployees.find(e => e.id === addForm.employeeId);
    if (!emp) return;

    const newLog: RemoteLog = {
      id: Date.now().toString(),
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      date: addForm.date,
      checkInTime: addForm.checkInTime,
      location: addForm.location,
      productivity: null,
      tasksCompleted: addForm.tasksCompleted,
      status: "Active"
    };

    saveLogs([...logs, newLog]);
    setShowAddModal(false);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCheckoutModal) return;

    const updatedLogs = logs.map(l => {
      if (l.id === showCheckoutModal) {
        return {
          ...l,
          checkOutTime: checkoutForm.checkOutTime,
          productivity: checkoutForm.productivity,
          notes: checkoutForm.notes,
          status: "Completed" as const
        };
      }
      return l;
    });

    saveLogs(updatedLogs);
    setShowCheckoutModal(null);
  };

  const filteredLogs = useMemo(() => {
    return logs
      .filter(l => (filterDate ? l.date === filterDate : true))
      .filter(l => (filterDept !== "All" ? l.department === filterDept : true))
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs, filterDate, filterDept]);

  const departments = ["All", ...Array.from(new Set(hrEmployees.map(e => e.department)))];

  const locationStats = useMemo(() => {
    const stats: Record<string, number> = { Home: 0, "Co-working": 0, "Client Site": 0, Travel: 0 };
    filteredLogs.forEach(l => stats[l.location]++);
    return stats;
  }, [filteredLogs]);

  if (!isLoaded) return null;

  return (
    <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans">
      <HRMSSidebar />
      
      <main className="flex-grow p-6 space-y-6 overflow-y-auto max-h-screen">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Laptop size={20} className="text-indigo-400" />
              Remote Work Tracker
            </h1>
            <p className="text-xs text-gray-400">
              Manage Work-From-Home (WFH), off-site client visits, and remote productivity.
            </p>
          </div>
          <button
            onClick={() => {
              if (hrEmployees.length > 0) setAddForm({ ...addForm, employeeId: hrEmployees[0].id });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition"
          >
            <Plus size={14} /> Log Remote Work
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 bg-[#0b0f17] border border-gray-800 p-4 rounded-2xl">
              <div className="flex items-center gap-2 bg-black border border-gray-800 p-2 rounded-xl flex-1">
                <Clock size={14} className="text-gray-500" />
                <input 
                  type="date" 
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                  className="bg-transparent text-xs text-white focus:outline-none w-full [color-scheme:dark]"
                />
                {filterDate && (
                  <button onClick={() => setFilterDate("")} className="text-gray-500 hover:text-white"><X size={14}/></button>
                )}
              </div>
              <div className="flex items-center gap-2 bg-black border border-gray-800 p-2 rounded-xl flex-1">
                <Filter size={14} className="text-gray-500" />
                <select 
                  value={filterDept}
                  onChange={e => setFilterDept(e.target.value)}
                  className="bg-transparent text-xs text-white focus:outline-none w-full"
                >
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider text-[10px] font-mono bg-black/40">
                      <th className="p-4">Employee</th>
                      <th className="p-4">Date / Time</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Tasks Plan</th>
                      <th className="p-4">Status / Perf.</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 font-mono text-xs">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500 italic font-sans">
                          No remote logs found for selected criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-800/30 transition">
                          <td className="p-4">
                            <div className="font-sans font-bold text-white">{log.employeeName}</div>
                            <div className="text-[10px] text-gray-500 font-sans">{log.department}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-gray-300">{log.date}</div>
                            <div className="text-[10px] text-indigo-400 font-bold">{log.checkInTime} - {log.checkOutTime || "..."}</div>
                          </td>
                          <td className="p-4">
                            <span className="flex items-center gap-1 text-slate-300 font-sans text-[11px] bg-slate-800 px-2 py-1 rounded w-max">
                              <MapPin size={10} className="text-slate-400"/>
                              {log.location}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="text-gray-400 text-[10px] truncate max-w-[150px] font-sans" title={log.tasksCompleted}>
                              {log.tasksCompleted}
                            </div>
                          </td>
                          <td className="p-4">
                            {log.status === "Active" ? (
                              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                Active WFH
                              </span>
                            ) : (
                              <div className="flex flex-col gap-1">
                                <span className="bg-green-500/10 text-green-400 border border-green-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase w-max">
                                  Completed
                                </span>
                                {log.productivity && (
                                  <span className={`text-[9px] font-bold ${
                                    log.productivity === 'High' ? 'text-green-400' :
                                    log.productivity === 'Medium' ? 'text-amber-400' : 'text-red-400'
                                  }`}>
                                    {log.productivity} Productivity
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            {log.status === "Active" && (
                              <button
                                onClick={() => setShowCheckoutModal(log.id)}
                                className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 font-bold text-[10px] px-2 py-1 rounded transition"
                              >
                                Mark Checkout
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl overflow-hidden shadow-xl p-5">
              <h3 className="font-bold text-white text-sm mb-4 border-b border-gray-800 pb-2 flex items-center gap-2">
                <BarChart2 size={16} className="text-indigo-400"/>
                Location Stats
              </h3>
              <div className="space-y-3">
                {Object.entries(locationStats).map(([loc, count]) => (
                  <div key={loc} className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">{loc}</span>
                    <span className="bg-gray-800 text-white font-bold px-2 py-1 rounded">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900/30 to-slate-900/40 border border-indigo-500/20 rounded-2xl overflow-hidden shadow-xl p-5">
              <h3 className="font-bold text-indigo-300 text-sm mb-4 flex items-center gap-2">
                <Briefcase size={16} />
                Remote Policy
              </h3>
              <div className="space-y-4 text-xs">
                <div>
                  <p className="text-gray-400 mb-1">Max WFH Days / Week</p>
                  <p className="text-2xl font-black text-white">{policy.maxDaysPerWeek}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Approval Required?</p>
                  <p className="font-bold text-indigo-400">{policy.requiresApproval ? "Yes, Manager Approval" : "No, Direct Log"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal: Add Log */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-sans">
            <div className="bg-[#0b0f17] border border-indigo-500/40 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
              <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-black/40">
                <div className="flex items-center gap-2">
                  <Laptop size={18} className="text-indigo-400" />
                  <h3 className="font-bold text-white text-base">Start Remote Work</h3>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
              </div>

              <form onSubmit={handleAddLog} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Employee *</label>
                  <select
                    required
                    value={addForm.employeeId}
                    onChange={(e) => setAddForm({ ...addForm, employeeId: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
                  >
                    {hrEmployees.map((e) => (
                      <option key={e.id} value={e.id}>{e.name} ({e.department})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Date</label>
                    <input
                      type="date"
                      value={addForm.date}
                      onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Check-In Time</label>
                    <input
                      type="text"
                      placeholder="09:00 AM"
                      value={addForm.checkInTime}
                      onChange={(e) => setAddForm({ ...addForm, checkInTime: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Location</label>
                  <select
                    value={addForm.location}
                    onChange={(e) => setAddForm({ ...addForm, location: e.target.value as any })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white"
                  >
                    <option value="Home">Home</option>
                    <option value="Co-working">Co-working Space</option>
                    <option value="Client Site">Client Site</option>
                    <option value="Travel">Travel / Transit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Planned Tasks *</label>
                  <textarea
                    required
                    rows={2}
                    value={addForm.tasksCompleted}
                    onChange={(e) => setAddForm({ ...addForm, tasksCompleted: e.target.value })}
                    placeholder="E.g., Complete UI for Dashboard, attend sync..."
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-gray-800 text-gray-300 font-bold rounded-xl">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase rounded-xl">Start WFH</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Checkout */}
        {showCheckoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-sans">
            <div className="bg-[#0b0f17] border border-green-500/40 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
              <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-black/40">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-green-400" />
                  <h3 className="font-bold text-white text-base">Complete Remote Work</h3>
                </div>
                <button onClick={() => setShowCheckoutModal(null)} className="text-gray-400 hover:text-white"><X size={18} /></button>
              </div>

              <form onSubmit={handleCheckout} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Check-Out Time</label>
                  <input
                    type="text"
                    value={checkoutForm.checkOutTime}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, checkOutTime: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Self-Rated Productivity</label>
                  <select
                    value={checkoutForm.productivity}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, productivity: e.target.value as any })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
                  >
                    <option value="High">High (Completed all tasks)</option>
                    <option value="Medium">Medium (Partial completion)</option>
                    <option value="Low">Low (Blocked or issues)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Closing Notes / Roadblocks (Optional)</label>
                  <textarea
                    rows={2}
                    value={checkoutForm.notes}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, notes: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowCheckoutModal(null)} className="flex-1 py-3 bg-gray-800 text-gray-300 font-bold rounded-xl">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-black uppercase rounded-xl">End WFH & Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
