"use client";

import React, { useState } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import { useGlobalContext } from "@/context/global-context";
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  X,
  FileText,
  Search,
  Filter
} from "lucide-react";

export default function HRLeavesPage() {
  const {
    hrEmployees,
    hrLeaves,
    submitHRLeave,
    updateHRLeaveStatus,
    currentUser
  } = useGlobalContext();

  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const [form, setForm] = useState({
    employeeId: "",
    leaveType: "Casual" as const,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    reason: ""
  });

  const filteredLeaves = hrLeaves.filter((l) => {
    return statusFilter === "All" || l.status === statusFilter;
  });

  const handleOpenSubmit = () => {
    if (hrEmployees.length > 0) {
      setForm({
        employeeId: hrEmployees[0].id,
        leaveType: "Casual",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        reason: ""
      });
    }
    setShowSubmitModal(true);
  };

  const handleSaveLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = hrEmployees.find((e) => e.id === form.employeeId);
    if (!emp || !form.reason.trim()) return;

    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    submitHRLeave({
      employeeId: emp.id,
      employeeName: emp.name,
      leaveType: form.leaveType,
      startDate: form.startDate,
      endDate: form.endDate,
      totalDays,
      reason: form.reason.trim()
    });

    setShowSubmitModal(false);
  };

  return (
    <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans">
      <HRMSSidebar />

      <main className="flex-grow p-6 space-y-6 overflow-y-auto max-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <CalendarDays size={20} className="text-amber-400" />
              Leave Applications &amp; Approval Engine
            </h1>
            <p className="text-xs text-gray-400">
              Manage Casual, Sick, Annual, and Unpaid leave requests with 1-click HR approvals.
            </p>
          </div>
          <button
            onClick={handleOpenSubmit}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition"
          >
            <Plus size={14} /> Submit Leave Request
          </button>
        </div>

        {/* Status Filter Bar */}
        <div className="flex gap-2 bg-[#0b0f17] border border-gray-800 p-2 rounded-2xl w-fit">
          {(["All", "Pending", "Approved", "Rejected"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                statusFilter === st
                  ? st === "Pending"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : st === "Approved"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : st === "Rejected"
                    ? "bg-red-500/20 text-red-400 border border-red-500/40"
                    : "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Leave Requests Table */}
        <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider text-[10px] font-mono bg-black/40">
                  <th className="p-4">Employee</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Total Days</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Applied On</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono text-xs">
                {filteredLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500 italic font-sans">
                      No leave applications found under "{statusFilter}".
                    </td>
                  </tr>
                ) : (
                  filteredLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-gray-800/30 transition">
                      <td className="p-4 font-sans font-bold text-white">
                        {leave.employeeName}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 rounded border border-amber-500/20 text-[10px] font-bold">
                          {leave.leaveType}
                        </span>
                      </td>
                      <td className="p-4 text-gray-300">
                        {leave.startDate} → {leave.endDate}
                      </td>
                      <td className="p-4 text-sky-400 font-bold">{leave.totalDays} Day(s)</td>
                      <td className="p-4 text-gray-400 italic max-w-xs truncate">
                        "{leave.reason}"
                      </td>
                      <td className="p-4 text-gray-500">{leave.appliedOn}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${
                            leave.status === "Approved"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : leave.status === "Pending"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                              : "bg-red-500/10 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {leave.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {leave.status === "Pending" ? (
                          <div className="flex gap-1.5 justify-center">
                            <button
                              onClick={() => updateHRLeaveStatus(leave.id, "Approved", currentUser?.name)}
                              className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                            >
                              <CheckCircle2 size={10} /> Approve
                            </button>
                            <button
                              onClick={() => updateHRLeaveStatus(leave.id, "Rejected", currentUser?.name)}
                              className="px-2.5 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                            >
                              <XCircle size={10} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-500 text-center block italic">
                            Reviewed by {leave.approvedBy || "Admin"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Submit Leave Request */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-sans">
            <div className="bg-[#0b0f17] border border-amber-500/40 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
              <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-black/40">
                <div className="flex items-center gap-2">
                  <CalendarDays size={18} className="text-amber-400" />
                  <h3 className="font-bold text-white text-base">Submit Leave Request</h3>
                </div>
                <button onClick={() => setShowSubmitModal(false)} className="text-gray-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveLeave} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Select Employee *</label>
                  <select
                    value={form.employeeId}
                    onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
                  >
                    {hrEmployees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.department} - {e.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Leave Type</label>
                  <select
                    value={form.leaveType}
                    onChange={(e) => setForm({ ...form, leaveType: e.target.value as any })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
                  >
                    <option value="Casual">Casual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Annual">Annual Leave</option>
                    <option value="Maternity">Maternity Leave</option>
                    <option value="Unpaid">Unpaid Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Reason / Explanation *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide details for the leave application..."
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-wider rounded-xl transition shadow-lg"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
