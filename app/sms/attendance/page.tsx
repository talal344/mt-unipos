"use client";

import React, { useState, useMemo } from "react";
import { useSMS, SMSAttendanceRecord } from "@/context/sms-context";
import {
  CalendarCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Send,
  Save,
  Users,
  Search,
  Filter,
  Check
} from "lucide-react";

export default function SMSAttendancePage() {
  const { classes, students, markAttendanceBatch, attendance } = useSMS();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedClass, setSelectedClass] = useState("Class 9 (Science)");
  const [selectedSection, setSelectedSection] = useState("Section A (Newton)");
  const [attendanceMap, setAttendanceMap] = useState<Record<string, "Present" | "Absent" | "Late" | "Leave">>({});
  const [toastMsg, setToastMsg] = useState("");

  const targetStudents = useMemo(() => {
    return students.filter((s) => s.className === selectedClass && s.status === "Active");
  }, [students, selectedClass]);

  const handleMarkAllPresent = () => {
    const next: Record<string, "Present" | "Absent" | "Late" | "Leave"> = {};
    targetStudents.forEach((st) => {
      next[st.id] = "Present";
    });
    setAttendanceMap(next);
  };

  const handleSaveAttendance = () => {
    const records: Omit<SMSAttendanceRecord, "id">[] = targetStudents.map((st) => ({
      date: selectedDate,
      type: "Student",
      referenceId: st.id,
      name: `${st.firstName} ${st.lastName}`,
      className: st.className,
      sectionName: st.sectionName,
      status: attendanceMap[st.id] || "Present"
    }));

    markAttendanceBatch(records);
    setToastMsg(`✅ Attendance for ${selectedClass} (${selectedSection}) saved successfully!`);
    setTimeout(() => setToastMsg(""), 4000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white font-bold text-xs py-3 px-5 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <CalendarCheck2 className="text-sky-400" size={22} />
            <span>Daily Attendance Register &amp; Live SMS Dispatch</span>
          </h1>
          <p className="text-xs text-gray-400">
            Record section-wise student morning attendance, calculate monthly percentages, and dispatch instant absence notifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllPresent}
            className="px-3.5 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold transition cursor-pointer"
          >
            Mark All Present
          </button>
          <button
            onClick={handleSaveAttendance}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            <Save size={14} />
            <span>Save Attendance Register</span>
          </button>
        </div>
      </div>

      {/* Selector Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0b121e] border border-[#1e293b] p-4 rounded-2xl">
        <div>
          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Attendance Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-black border border-gray-800 p-2 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-sky-400 mb-1">Target Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full bg-black border border-gray-800 p-2 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-sky-500"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.className}>
                {c.className} ({c.sectionName})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Class Section</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full bg-black border border-gray-800 p-2 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-sky-500"
          >
            <option value="Section A (Newton)">Section A (Newton)</option>
            <option value="Section B (Einstein)">Section B (Einstein)</option>
          </select>
        </div>
      </div>

      {/* Attendance Sheet */}
      <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/40">
          <div className="flex items-center gap-2">
            <span className="font-black text-white text-xs uppercase">
              {selectedClass} • {selectedSection}
            </span>
            <span className="text-[10px] bg-sky-500/10 text-sky-400 font-bold px-2 py-0.5 rounded-full">
              {targetStudents.length} Students Listed
            </span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">Date: {selectedDate}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-mono text-[11px] bg-black/20">
                <th className="p-4 font-bold">Roll #</th>
                <th className="p-4 font-bold">Admission ID</th>
                <th className="p-4 font-bold">Student Name</th>
                <th className="p-4 font-bold">Father Phone</th>
                <th className="p-4 font-bold text-center">Present</th>
                <th className="p-4 font-bold text-center">Absent</th>
                <th className="p-4 font-bold text-center">Late</th>
                <th className="p-4 font-bold text-center">Leave</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50 font-mono text-[11px]">
              {targetStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500 italic font-sans">
                    No active students enrolled in this class.
                  </td>
                </tr>
              ) : (
                targetStudents.map((st) => {
                  const currentStatus = attendanceMap[st.id] || "Present";
                  return (
                    <tr key={st.id} className="hover:bg-white/[0.02] transition">
                      <td className="p-4 text-white font-bold">{st.rollNo}</td>
                      <td className="p-4 text-sky-400 font-bold">{st.admissionNo}</td>
                      <td className="p-4 font-sans font-bold text-white text-sm">
                        {st.firstName} {st.lastName}
                      </td>
                      <td className="p-4 text-gray-400">{st.emergencyContact}</td>
                      
                      {/* Present */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setAttendanceMap({ ...attendanceMap, [st.id]: "Present" })}
                          className={`w-8 h-8 rounded-xl font-bold transition flex items-center justify-center mx-auto ${
                            currentStatus === "Present"
                              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105"
                              : "bg-black/40 border border-gray-800 text-gray-400 hover:text-emerald-400"
                          }`}
                        >
                          P
                        </button>
                      </td>

                      {/* Absent */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setAttendanceMap({ ...attendanceMap, [st.id]: "Absent" })}
                          className={`w-8 h-8 rounded-xl font-bold transition flex items-center justify-center mx-auto ${
                            currentStatus === "Absent"
                              ? "bg-red-600 text-white shadow-md shadow-red-600/30 scale-105"
                              : "bg-black/40 border border-gray-800 text-gray-400 hover:text-red-400"
                          }`}
                        >
                          A
                        </button>
                      </td>

                      {/* Late */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setAttendanceMap({ ...attendanceMap, [st.id]: "Late" })}
                          className={`w-8 h-8 rounded-xl font-bold transition flex items-center justify-center mx-auto ${
                            currentStatus === "Late"
                              ? "bg-amber-600 text-white shadow-md shadow-amber-600/30 scale-105"
                              : "bg-black/40 border border-gray-800 text-gray-400 hover:text-amber-400"
                          }`}
                        >
                          L
                        </button>
                      </td>

                      {/* Leave */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setAttendanceMap({ ...attendanceMap, [st.id]: "Leave" })}
                          className={`w-8 h-8 rounded-xl font-bold transition flex items-center justify-center mx-auto ${
                            currentStatus === "Leave"
                              ? "bg-sky-600 text-white shadow-md shadow-sky-600/30 scale-105"
                              : "bg-black/40 border border-gray-800 text-gray-400 hover:text-sky-400"
                          }`}
                        >
                          LV
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
