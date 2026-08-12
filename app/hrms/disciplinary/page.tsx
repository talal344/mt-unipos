"use client";

import React, { useState, useEffect, useMemo } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import { useGlobalContext } from "@/context/global-context";
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  ShieldAlert,
  FileWarning,
  CheckCircle,
  X,
  Clock,
  DollarSign,
  Edit2,
  Trash2,
  CheckCircle2
} from "lucide-react";

interface HRDisciplinaryRecord {
  id: string;
  recordNumber: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: "Verbal Warning" | "Written Warning" | "Show Cause" | "Suspension" | "Fine" | "Termination";
  date: string;
  reason: string;
  description: string;
  fineAmount?: number;
  suspensionDays?: number;
  issuedBy: string;
  status: "Active" | "Under Review" | "Resolved" | "Expunged";
  resolution?: string;
}

export default function HRDisciplinaryPage() {
  const { currentUser, hrEmployees, currencySymbol } = useGlobalContext();
  const [records, setRecords] = useState<HRDisciplinaryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HRDisciplinaryRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<HRDisciplinaryRecord | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    if (currentUser?.tenantId) {
      const key = `hr_disciplinary_${currentUser.tenantId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed: HRDisciplinaryRecord[] = JSON.parse(saved);
          const filtered = parsed.filter(r => r.id !== "DISC-1" && r.recordNumber !== "DISC-001");
          setRecords(filtered);
          if (filtered.length !== parsed.length) {
            localStorage.setItem(key, JSON.stringify(filtered));
          }
        } catch {
          setRecords([]);
        }
      } else {
        setRecords([]);
      }
    }
  }, [currentUser?.tenantId]);

  const saveRecords = (data: HRDisciplinaryRecord[]) => {
    setRecords(data);
    if (currentUser?.tenantId) {
      localStorage.setItem(`hr_disciplinary_${currentUser.tenantId}`, JSON.stringify(data));
    }
  };

  const handleDeleteRecord = (id: string, code: string) => {
    if (confirm(`Are you sure you want to delete disciplinary notice "${code}"?`)) {
      const updated = records.filter((r) => r.id !== id);
      saveRecords(updated);
      triggerToast(`🗑️ Disciplinary notice "${code}" deleted successfully!`);
    }
  };

  const handleUpdateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    const emp = hrEmployees.find((e) => e.id === editingRecord.employeeId);
    const updated = records.map((r) => {
      if (r.id === editingRecord.id) {
        return {
          ...r,
          employeeId: emp ? emp.id : r.employeeId,
          employeeName: emp ? emp.name : r.employeeName,
          department: emp ? emp.department : r.department,
          type: editingRecord.type,
          date: editingRecord.date,
          reason: editingRecord.reason,
          description: editingRecord.description,
          fineAmount: Number(editingRecord.fineAmount) || 0,
          suspensionDays: Number(editingRecord.suspensionDays) || 0,
          status: editingRecord.status,
          resolution: editingRecord.resolution
        };
      }
      return r;
    });
    saveRecords(updated);
    setEditingRecord(null);
    triggerToast("✅ Disciplinary record updated successfully!");
  };

  const [form, setForm] = useState({
    employeeId: "",
    type: "Written Warning" as HRDisciplinaryRecord["type"],
    date: new Date().toISOString().split("T")[0],
    reason: "",
    description: "",
    fineAmount: 0,
    suspensionDays: 0
  });

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = hrEmployees.find((e) => e.id === form.employeeId);
    if (!emp) return;

    const count = records.length + 1;
    const newRec: HRDisciplinaryRecord = {
      id: `DISC-${Date.now()}`,
      recordNumber: `DISC-${String(count).padStart(3, "0")}`,
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      type: form.type,
      date: form.date,
      reason: form.reason,
      description: form.description,
      fineAmount: Number(form.fineAmount) || 0,
      suspensionDays: Number(form.suspensionDays) || 0,
      issuedBy: currentUser?.name || "HR Department",
      status: "Active"
    };

    saveRecords([newRec, ...records]);
    setShowAddModal(false);
    setForm({
      employeeId: "",
      type: "Written Warning",
      date: new Date().toISOString().split("T")[0],
      reason: "",
      description: "",
      fineAmount: 0,
      suspensionDays: 0
    });
    triggerToast("✅ Conduct notice issued!");
  };

  const handleResolve = (id: string, resolutionText: string) => {
    const updated = records.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          status: "Resolved" as const,
          resolution: resolutionText
        };
      }
      return r;
    });
    saveRecords(updated);
    setSelectedRecord(null);
    triggerToast("✅ Disciplinary issue marked as resolved!");
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        q === "" ||
        r.employeeName.toLowerCase().includes(q) ||
        r.recordNumber.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q);
      const matchType = filterType === "All" || r.type === filterType;
      const matchStatus = filterStatus === "All" || r.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    });
  }, [records, searchQuery, filterType, filterStatus]);

  const activeWarnings = records.filter((r) => r.status === "Active").length;
  const showCauses = records.filter((r) => r.type === "Show Cause").length;
  const suspensions = records.filter((r) => r.type === "Suspension").length;

  return (
    <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans">
      <HRMSSidebar />
      <main className="flex-grow p-6 space-y-6 overflow-y-auto max-h-screen">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-5">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <AlertTriangle size={22} className="text-amber-400" />
              Employee Disciplinary & Conduct Governance
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Official records of warnings, show cause notices, fines, and disciplinary actions.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-amber-950/40"
          >
            <Plus size={15} /> Issue Disciplinary Action
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0b0f17] border border-gray-800 p-4 rounded-2xl">
            <div className="flex justify-between text-gray-400 text-xs font-bold uppercase">
              <span>Total Recorded Incidents</span>
              <FileWarning size={16} className="text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white mt-2">{records.length}</div>
            <div className="text-[11px] text-gray-400 mt-1">Company audit log</div>
          </div>

          <div className="bg-[#0b0f17] border border-amber-500/20 p-4 rounded-2xl">
            <div className="flex justify-between text-gray-400 text-xs font-bold uppercase">
              <span>Active Warnings</span>
              <AlertTriangle size={16} className="text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 mt-2">{activeWarnings}</div>
            <div className="text-[11px] text-amber-400/80 mt-1">Under active monitoring</div>
          </div>

          <div className="bg-[#0b0f17] border border-red-500/20 p-4 rounded-2xl">
            <div className="flex justify-between text-gray-400 text-xs font-bold uppercase">
              <span>Show Cause Notices</span>
              <ShieldAlert size={16} className="text-red-400" />
            </div>
            <div className="text-2xl font-black text-red-400 mt-2">{showCauses}</div>
            <div className="text-[11px] text-red-400/80 mt-1">Formal explanations pending</div>
          </div>

          <div className="bg-[#0b0f17] border border-gray-800 p-4 rounded-2xl">
            <div className="flex justify-between text-gray-400 text-xs font-bold uppercase">
              <span>Suspensions</span>
              <Clock size={16} className="text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-400 mt-2">{suspensions}</div>
            <div className="text-[11px] text-purple-400/80 mt-1">Pending inquiry</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-[#0b0f17] border border-gray-800 p-3 rounded-2xl">
          <div className="relative w-full md:w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by employee, notice code, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-gray-800 pl-9 pr-3 py-2 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-black border border-gray-800 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Types</option>
              <option value="Verbal Warning">Verbal Warning</option>
              <option value="Written Warning">Written Warning</option>
              <option value="Show Cause">Show Cause</option>
              <option value="Suspension">Suspension</option>
              <option value="Fine">Fine</option>
              <option value="Termination">Termination</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-black border border-gray-800 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Under Review">Under Review</option>
              <option value="Resolved">Resolved</option>
              <option value="Expunged">Expunged</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-gray-800 text-[10px] uppercase tracking-wider text-gray-500 font-mono bg-black/40">
                  <th className="p-3.5">Notice Code</th>
                  <th className="p-3.5">Employee</th>
                  <th className="p-3.5">Action Type</th>
                  <th className="p-3.5">Date Issued</th>
                  <th className="p-3.5">Reason & Description</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-gray-500 text-xs">
                      No disciplinary records found.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-amber-500/5 transition">
                      <td className="p-3.5 font-mono font-bold text-amber-400">{rec.recordNumber}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-white">{rec.employeeName}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{rec.department}</div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                            rec.type === "Termination" || rec.type === "Suspension"
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : rec.type === "Show Cause" || rec.type === "Fine"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-gray-800 text-gray-300 border-gray-700"
                          }`}
                        >
                          {rec.type}
                        </span>
                      </td>
                      <td className="p-3.5 text-gray-400 font-mono">{rec.date}</td>
                      <td className="p-3.5 max-w-xs">
                        <div className="font-bold text-white truncate">{rec.reason}</div>
                        <div className="text-[10px] text-gray-400 truncate">{rec.description}</div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                            rec.status === "Resolved"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {rec.status === "Active" && (
                            <button
                              onClick={() => setSelectedRecord(rec)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-2.5 py-1.2 rounded-lg transition cursor-pointer"
                            >
                              Resolve
                            </button>
                          )}
                          <button
                            onClick={() => setEditingRecord(rec)}
                            title="Edit Disciplinary Notice"
                            className="p-1.5 rounded-lg bg-gray-800 hover:bg-sky-500/20 text-gray-400 hover:text-sky-400 border border-gray-700 transition cursor-pointer"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(rec.id, rec.recordNumber)}
                            title="Delete Notice"
                            className="p-1.5 rounded-lg bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-gray-700 transition cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c1018] border border-sky-500/30 rounded-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-sky-500/5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit2 size={16} className="text-sky-400" />
                Edit Disciplinary Notice ({editingRecord.recordNumber})
              </h2>
              <button onClick={() => setEditingRecord(null)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleUpdateRecord} className="p-4 space-y-3.5">
              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Employee</label>
                <select
                  value={editingRecord.employeeId}
                  onChange={(e) => setEditingRecord({ ...editingRecord, employeeId: e.target.value })}
                  className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  {hrEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} &bull; {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Notice Type</label>
                  <select
                    value={editingRecord.type}
                    onChange={(e) => setEditingRecord({ ...editingRecord, type: e.target.value as any })}
                    className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="Verbal Warning">Verbal Warning</option>
                    <option value="Written Warning">Written Warning</option>
                    <option value="Show Cause">Show Cause Notice</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Fine">Salary Deduction Fine</option>
                    <option value="Termination">Termination Notice</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Status</label>
                  <select
                    value={editingRecord.status}
                    onChange={(e) => setEditingRecord({ ...editingRecord, status: e.target.value as any })}
                    className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Expunged">Expunged</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Date</label>
                <input
                  required
                  type="date"
                  value={editingRecord.date}
                  onChange={(e) => setEditingRecord({ ...editingRecord, date: e.target.value })}
                  className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Reason / Subject</label>
                <input
                  required
                  type="text"
                  value={editingRecord.reason}
                  onChange={(e) => setEditingRecord({ ...editingRecord, reason: e.target.value })}
                  className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Details &amp; Description</label>
                <textarea
                  rows={2}
                  required
                  value={editingRecord.description}
                  onChange={(e) => setEditingRecord({ ...editingRecord, description: e.target.value })}
                  className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs p-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs p-2.5 rounded-xl transition shadow-lg shadow-sky-950/50 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c1018] border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-400" />
                Issue Conduct Notice / Warning
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddRecord} className="p-4 space-y-3.5">
              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Employee</label>
                <select
                  required
                  value={form.employeeId}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-amber-500"
                >
                  <option value="">Select Employee...</option>
                  {hrEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} &bull; {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Notice Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                    className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-amber-500"
                  >
                    <option value="Verbal Warning">Verbal Warning</option>
                    <option value="Written Warning">Written Warning</option>
                    <option value="Show Cause">Show Cause Notice</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Fine">Salary Deduction Fine</option>
                    <option value="Termination">Termination Notice</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Date</label>
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Reason / Subject</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Insubordination, Chronic Late Arrival"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Details & Evidence</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed description of the violation..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              {form.type === "Fine" && (
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Fine Amount ({currencySymbol || "$"})</label>
                  <input
                    type="number"
                    value={form.fineAmount}
                    onChange={(e) => setForm({ ...form, fineAmount: Number(e.target.value) })}
                    className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs p-3 rounded-xl transition mt-2 shadow-lg shadow-amber-950/50"
              >
                Log Disciplinary Notice
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c1018] border border-gray-700 rounded-2xl w-full max-w-sm overflow-hidden p-5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-400" />
              Close & Resolve Disciplinary Record
            </h2>
            <p className="text-xs text-gray-400">
              Record explanation submitted by {selectedRecord.employeeName} for notice {selectedRecord.recordNumber}.
            </p>
            <button
              onClick={() => handleResolve(selectedRecord.id, "Employee submitted apology and agreed to compliance terms.")}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs p-2.5 rounded-xl transition"
            >
              Mark as Resolved & Complied
            </button>
            <button
              onClick={() => setSelectedRecord(null)}
              className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs p-2 rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
