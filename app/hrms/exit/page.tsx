"use client";

import React, { useState, useEffect } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import { useGlobalContext } from "@/context/global-context";
import { LogOut, Plus, X, CheckSquare, FileText, ChevronRight } from "lucide-react";

interface ExitRecord {
  id: string;
  exitCode: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  lastWorkingDate: string;
  resignationDate: string;
  reason: "Resignation" | "Termination" | "Contract End" | "Retirement" | "Absconding";
  exitInterviewDone: boolean;
  clearanceChecklist: {
    itEquipmentReturned: boolean;
    idCardReturned: boolean;
    accessRevoked: boolean;
    noCostCertificate: boolean;
  };
  status: "Initiated" | "Clearance Pending" | "Interview Pending" | "Completed";
  createdAt: string;
}

export default function HRExitPage() {
  const { currentUser, hrEmployees } = useGlobalContext();
  const [exits, setExits] = useState<ExitRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExit, setSelectedExit] = useState<ExitRecord | null>(null);

  useEffect(() => {
    if (currentUser?.tenantId) {
      const saved = localStorage.getItem(`hr_exits_${currentUser.tenantId}`);
      if (saved) setExits(JSON.parse(saved));
    }
  }, [currentUser?.tenantId]);

  const saveExits = (newExits: ExitRecord[]) => {
    setExits(newExits);
    if (currentUser?.tenantId) localStorage.setItem(`hr_exits_${currentUser.tenantId}`, JSON.stringify(newExits));
  };

  const [form, setForm] = useState({
    employeeId: "",
    resignationDate: new Date().toISOString().split("T")[0],
    lastWorkingDate: "",
    reason: "Resignation" as ExitRecord["reason"]
  });

  const handleAddExit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = hrEmployees.find((e) => e.id === form.employeeId);
    if (!emp) return;

    const newExit: ExitRecord = {
      id: "EXIT-" + Math.floor(Math.random() * 100000),
      exitCode: "EX-" + Math.floor(Math.random() * 10000),
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      designation: emp.designation,
      resignationDate: form.resignationDate,
      lastWorkingDate: form.lastWorkingDate,
      reason: form.reason,
      exitInterviewDone: false,
      clearanceChecklist: {
        itEquipmentReturned: false,
        idCardReturned: false,
        accessRevoked: false,
        noCostCertificate: false
      },
      status: "Initiated",
      createdAt: new Date().toISOString()
    };
    saveExits([newExit, ...exits]);
    setShowAddModal(false);
  };

  const toggleChecklist = (id: string, key: keyof ExitRecord["clearanceChecklist"]) => {
    const updated = exits.map(e => {
      if (e.id === id) {
        const checks = { ...e.clearanceChecklist, [key]: !e.clearanceChecklist[key] };
        const allChecked = Object.values(checks).every(Boolean);
        let status = e.status;
        
        if (allChecked && e.exitInterviewDone) status = "Completed";
        else if (allChecked && !e.exitInterviewDone) status = "Interview Pending";
        else status = "Clearance Pending";

        return { ...e, clearanceChecklist: checks, status };
      }
      return e;
    });
    saveExits(updated);
    if (selectedExit) setSelectedExit(updated.find(e => e.id === selectedExit.id) || null);
  };

  const markInterviewDone = (id: string) => {
    const updated = exits.map(e => {
      if (e.id === id) {
        const allChecked = Object.values(e.clearanceChecklist).every(Boolean);
        return { ...e, exitInterviewDone: true, status: allChecked ? "Completed" : "Clearance Pending" };
      }
      return e;
    });
    saveExits(updated);
    if (selectedExit) setSelectedExit(updated.find(e => e.id === selectedExit.id) || null);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Completed": return "bg-emerald-500/20 text-emerald-400";
      case "Interview Pending": return "bg-amber-500/20 text-amber-400";
      case "Clearance Pending": return "bg-sky-500/20 text-sky-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans">
      <HRMSSidebar />
      <main className="flex-grow p-6 space-y-6 overflow-y-auto max-h-screen">
        <div className="flex justify-between items-center border-b border-gray-800 pb-5">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <LogOut size={20} className="text-orange-400" /> Exit &amp; Clearance Manager
            </h1>
            <p className="text-xs text-gray-400">Manage employee offboarding, clearance, and exit interviews.</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition">
            <Plus size={14} /> Initiate Exit
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#0b0f17] border border-gray-800 p-4 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl"><LogOut size={20} /></div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Active Exits</p>
              <h3 className="text-2xl font-black">{exits.filter(e => e.status !== "Completed").length}</h3>
            </div>
          </div>
          <div className="bg-[#0b0f17] border border-gray-800 p-4 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl"><CheckSquare size={20} /></div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Completed (YTD)</p>
              <h3 className="text-2xl font-black">{exits.filter(e => e.status === "Completed").length}</h3>
            </div>
          </div>
        </div>

        <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider text-[10px] font-mono bg-black/40">
                <th className="p-4">Employee</th>
                <th className="p-4">Reason</th>
                <th className="p-4">LWD</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-mono text-xs">
              {exits.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500 italic">No exit records found.</td></tr>
              ) : exits.map(exit => (
                <tr key={exit.id} className="hover:bg-gray-800/20 transition">
                  <td className="p-4">
                    <div className="font-bold text-white">{exit.employeeName}</div>
                    <div className="text-[10px] text-gray-500">{exit.department}</div>
                  </td>
                  <td className="p-4">{exit.reason}</td>
                  <td className="p-4 text-gray-400">{exit.lastWorkingDate}</td>
                  <td className="p-4">
                    <span className={\`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider \${getStatusColor(exit.status)}\`}>
                      {exit.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => setSelectedExit(exit)} className="text-orange-400 hover:text-orange-300 font-bold">Manage Clearance</button>
                  </td>
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
              <h2 className="text-sm font-bold text-white">Initiate Offboarding</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white"><X size={16} /></button>
            </div>
            <form onSubmit={handleAddExit} className="p-4 space-y-4">
              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Employee</label>
                <select required value={form.employeeId} onChange={(e) => setForm({...form, employeeId: e.target.value})} className="w-full bg-black border border-gray-800 text-white text-xs p-2 rounded-xl">
                  <option value="">Select Employee</option>
                  {hrEmployees.map(e => <option key={e.id} value={e.id}>{e.name} - {e.department}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Reason</label>
                <select value={form.reason} onChange={(e) => setForm({...form, reason: e.target.value as any})} className="w-full bg-black border border-gray-800 text-white text-xs p-2 rounded-xl">
                  <option>Resignation</option><option>Termination</option><option>Contract End</option><option>Retirement</option><option>Absconding</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Notice Date</label>
                  <input required type="date" value={form.resignationDate} onChange={(e) => setForm({...form, resignationDate: e.target.value})} className="w-full bg-black border border-gray-800 text-white text-xs p-2 rounded-xl" />
                </div>
                <div>
                  <label className="block text-[10px] text-orange-500 uppercase font-bold mb-1">Last Working Date</label>
                  <input required type="date" value={form.lastWorkingDate} onChange={(e) => setForm({...form, lastWorkingDate: e.target.value})} className="w-full bg-black border border-orange-900/50 text-white text-xs p-2 rounded-xl focus:border-orange-500" />
                </div>
              </div>
              <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs p-3 rounded-xl transition">Initiate Exit Process</button>
            </form>
          </div>
        </div>
      )}

      {selectedExit && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col justify-end sm:justify-center sm:items-end z-50">
          <div className="bg-[#0c1018] border-l border-t sm:border border-gray-700 w-full sm:w-[400px] h-[80vh] sm:h-screen sm:rounded-l-2xl flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <div>
                <h2 className="text-sm font-bold text-white">Clearance: {selectedExit.employeeName}</h2>
                <p className="text-[10px] text-gray-500 uppercase">{selectedExit.status}</p>
              </div>
              <button onClick={() => setSelectedExit(null)} className="text-gray-400 hover:text-white"><X size={16} /></button>
            </div>
            <div className="flex-grow p-4 space-y-6 overflow-y-auto">
              <div>
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">Clearance Checklist</h3>
                <div className="space-y-2">
                  {Object.entries(selectedExit.clearanceChecklist).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-3 bg-black border border-gray-800 p-3 rounded-xl">
                      <input type="checkbox" checked={val} onChange={() => toggleChecklist(selectedExit.id, key as keyof ExitRecord["clearanceChecklist"])} className="w-4 h-4 accent-orange-500" />
                      <span className="text-xs text-gray-300">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">Exit Interview</h3>
                <div className="bg-black border border-gray-800 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={16} className={selectedExit.exitInterviewDone ? "text-emerald-400" : "text-gray-500"} />
                    <span className="text-xs font-bold text-white">Interview Form</span>
                  </div>
                  {!selectedExit.exitInterviewDone ? (
                    <button onClick={() => markInterviewDone(selectedExit.id)} className="text-[10px] bg-orange-600 text-white px-3 py-1 rounded-md font-bold">Mark Done</button>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1"><CheckSquare size={12}/> Completed</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
