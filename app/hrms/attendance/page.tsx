"use client";

import React, { useState } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import { useGlobalContext } from "@/context/global-context";
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Search,
  Filter,
  UserCheck,
  UserX,
  X
} from "lucide-react";

export default function HRAttendancePage() {
  const {
    hrEmployees,
    hrAttendance,
    recordHRAttendance,
    updateHRAttendance
  } = useGlobalContext();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMarkModal, setShowMarkModal] = useState(false);

  const [form, setForm] = useState({
    employeeId: "",
    status: "Present" as const,
    checkIn: "09:00 AM",
    checkOut: "06:00 PM",
    overtimeHours: "0",
    lateMinutes: "0"
  });

  const dateAttendance = hrAttendance.filter((a) => a.date === selectedDate);

  const filteredAttendance = dateAttendance.filter((a) => {
    const q = searchQuery.toLowerCase();
    return !q || a.employeeName.toLowerCase().includes(q);
  });

  const handleOpenMarkModal = () => {
    if (hrEmployees.length > 0) {
      setForm({
        employeeId: hrEmployees[0].id,
        status: "Present",
        checkIn: "09:00 AM",
        checkOut: "06:00 PM",
        overtimeHours: "0",
        lateMinutes: "0"
      });
    }
    setShowMarkModal(true);
  };

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = hrEmployees.find((e) => e.id === form.employeeId);
    if (!emp) return;

    recordHRAttendance({
      employeeId: emp.id,
      employeeName: emp.name,
      date: selectedDate,
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      status: form.status,
      overtimeHours: parseFloat(form.overtimeHours) || 0,
      lateMinutes: parseInt(form.lateMinutes, 10) || 0
    });

    setShowMarkModal(false);
  };

  return (
    <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans">
      <HRMSSidebar />

      <main className="flex-grow p-6 space-y-6 overflow-y-auto max-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Clock size={20} className="text-teal-400" />
              Attendance &amp; Shift Register
            </h1>
            <p className="text-xs text-gray-400">
              Track daily staff check-ins, check-outs, late arrival fines, and overtime hours.
            </p>
          </div>
          <button
            onClick={handleOpenMarkModal}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition"
          >
            <Plus size={14} /> Mark Attendance Entry
          </button>
        </div>

        {/* Date Selector & Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0b0f17] border border-gray-800 p-4 rounded-2xl">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Calendar size={16} className="text-teal-400 shrink-0" />
            <span className="text-xs font-bold text-gray-300">Select Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-black border border-gray-800 text-white font-mono text-xs p-2 rounded-xl focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by staff name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-gray-800 pl-9 pr-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500 placeholder-gray-600"
            />
          </div>
        </div>

        {/* Attendance Register Table */}
        <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider text-[10px] font-mono bg-black/40">
                  <th className="p-4">Employee</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Check-In</th>
                  <th className="p-4">Check-Out</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Late Mins</th>
                  <th className="p-4">Overtime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono text-xs">
                {filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500 italic font-sans">
                      No attendance entries recorded for {selectedDate}. Click "Mark Attendance Entry" to add.
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-800/30 transition">
                      <td className="p-4 font-sans font-bold text-white">
                        {a.employeeName}
                      </td>
                      <td className="p-4 text-gray-400">{a.date}</td>
                      <td className="p-4 text-emerald-400 font-bold">{a.checkIn || "—"}</td>
                      <td className="p-4 text-sky-400 font-bold">{a.checkOut || "—"}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${
                            a.status === "Present"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : a.status === "Late"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                              : "bg-red-500/10 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="p-4 text-amber-400">
                        {a.lateMinutes > 0 ? `${a.lateMinutes} mins` : "0"}
                      </td>
                      <td className="p-4 text-purple-400">
                        {a.overtimeHours > 0 ? `${a.overtimeHours} hrs` : "0"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Mark Attendance */}
        {showMarkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-sans">
            <div className="bg-[#0b0f17] border border-teal-500/40 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
              <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-black/40">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-teal-400" />
                  <h3 className="font-bold text-white text-base">Record Staff Attendance Entry</h3>
                </div>
                <button onClick={() => setShowMarkModal(false)} className="text-gray-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveAttendance} className="p-6 space-y-4 text-xs">
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Attendance Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white"
                    >
                      <option value="Present">Present</option>
                      <option value="Late">Late</option>
                      <option value="Absent">Absent</option>
                      <option value="Half Day">Half Day</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Check-In Time</label>
                    <input
                      type="text"
                      placeholder="09:00 AM"
                      value={form.checkIn}
                      onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-sky-400 mb-1">Check-Out Time</label>
                    <input
                      type="text"
                      placeholder="06:00 PM"
                      value={form.checkOut}
                      onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-amber-400 mb-1">Late Minutes</label>
                    <input
                      type="number"
                      value={form.lateMinutes}
                      onChange={(e) => setForm({ ...form, lateMinutes: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-purple-400 mb-1">Overtime Hours</label>
                    <input
                      type="number"
                      step="0.5"
                      value={form.overtimeHours}
                      onChange={(e) => setForm({ ...form, overtimeHours: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMarkModal(false)}
                    className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-teal-600 hover:bg-teal-500 text-white font-black uppercase tracking-wider rounded-xl transition shadow-lg"
                  >
                    Save Attendance
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
