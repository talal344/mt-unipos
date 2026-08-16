"use client";

import React, { useState } from "react";
import { useSMS, SMSAttendanceRecord } from "@/context/sms-context";
import {
  CalendarCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Sparkles,
  Users,
  Search,
  Filter,
  Save,
  Check
} from "lucide-react";

export default function SMSAttendancePage() {
  const { theme, classes, students, markAttendanceBatch, attendance } = useSMS();
  const isLight = theme === "light";

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedClass, setSelectedClass] = useState(classes[0]?.className || "Class 9 (Science)");
  const [selectedSection, setSelectedSection] = useState("Section A (Newton)");
  const [toastMsg, setToastMsg] = useState("");

  const targetStudents = students.filter(
    (s) => s.className === selectedClass && s.status === "Active"
  );

  // Local state map for rapid UI toggling before committing
  const [attendanceMap, setAttendanceMap] = useState<Record<string, "Present" | "Absent" | "Late" | "Leave">>({});

  const handleMarkAllPresent = () => {
    const updated: Record<string, "Present"> = {};
    targetStudents.forEach((s) => {
      updated[s.id] = "Present";
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = () => {
    const records: SMSAttendanceRecord[] = targetStudents.map((s) => ({
      id: `ATT-${s.id}-${selectedDate}`,
      studentId: s.id,
      studentName: `${s.firstName} ${s.lastName}`,
      admissionNo: s.admissionNo,
      className: s.className,
      sectionName: s.sectionName,
      date: selectedDate,
      status: attendanceMap[s.id] || "Present"
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
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${isLight ? "border-slate-200" : "border-gray-800"} pb-4`}>
        <div>
          <h1 className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-2`}>
            <CalendarCheck2 className={isLight ? "text-sky-600" : "text-sky-400"} size={22} />
            <span>Daily Attendance Register &amp; Live SMS Dispatch</span>
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Record section-wise student morning attendance, calculate monthly percentages, and dispatch instant absence notifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllPresent}
            className={`px-3.5 py-2 rounded-xl ${
              isLight ? "bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-300" : "bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border-sky-500/30"
            } border text-xs font-bold transition cursor-pointer`}
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
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border p-4 rounded-2xl`}>
        <div>
          <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Attendance Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={`w-full ${
              isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
            } border p-2 rounded-xl font-bold text-xs focus:outline-none focus:border-sky-500`}
          />
        </div>

        <div>
          <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-sky-700 font-bold" : "text-sky-400"} mb-1`}>Target Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className={`w-full ${
              isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
            } border p-2 rounded-xl font-bold text-xs focus:outline-none focus:border-sky-500`}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.className}>
                {c.className} ({c.sectionName})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Class Section</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className={`w-full ${
              isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
            } border p-2 rounded-xl font-bold text-xs focus:outline-none focus:border-sky-500`}
          >
            <option value="Section A (Newton)">Section A (Newton)</option>
            <option value="Section B (Einstein)">Section B (Einstein)</option>
          </select>
        </div>
      </div>

      {/* Attendance Sheet */}
      <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl overflow-hidden shadow-2xl`}>
        <div className={`p-4 border-b ${isLight ? "border-slate-100 bg-slate-50/80" : "border-gray-800 bg-black/40"} flex justify-between items-center`}>
          <div className="flex items-center gap-2">
            <span className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-xs uppercase`}>
              {selectedClass} • {selectedSection}
            </span>
            <span className={`text-[10px] ${isLight ? "bg-sky-50 text-sky-700 border border-sky-200" : "bg-sky-500/10 text-sky-400"} font-bold px-2 py-0.5 rounded-full`}>
              {targetStudents.length} Students Listed
            </span>
          </div>
          <span className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"} font-mono`}>Date: {selectedDate}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b ${isLight ? "border-slate-200 text-slate-600 bg-slate-100/70" : "border-gray-800 text-gray-400 bg-black/20"} font-mono text-[11px]`}>
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
            <tbody className={`divide-y ${isLight ? "divide-slate-100" : "divide-gray-800/50"} font-mono text-[11px]`}>
              {targetStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className={`p-8 text-center ${isLight ? "text-slate-400" : "text-gray-500"} italic font-sans`}>
                    No active students enrolled in this class.
                  </td>
                </tr>
              ) : (
                targetStudents.map((st) => {
                  const currentStatus = attendanceMap[st.id] || "Present";
                  return (
                    <tr key={st.id} className={`${isLight ? "hover:bg-slate-50/80" : "hover:bg-white/[0.02]"} transition`}>
                      <td className={`p-4 font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{st.rollNo}</td>
                      <td className={`p-4 font-bold ${isLight ? "text-sky-700" : "text-sky-400"}`}>{st.admissionNo}</td>
                      <td className={`p-4 font-sans font-bold ${isLight ? "text-slate-900" : "text-white"} text-sm`}>
                        {st.firstName} {st.lastName}
                      </td>
                      <td className={`p-4 ${isLight ? "text-slate-500 font-medium" : "text-gray-400"}`}>{st.emergencyContact}</td>
                      
                      {/* Present */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setAttendanceMap({ ...attendanceMap, [st.id]: "Present" })}
                          className={`w-8 h-8 rounded-xl font-bold transition flex items-center justify-center mx-auto cursor-pointer ${
                            currentStatus === "Present"
                              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105"
                              : isLight
                              ? "bg-slate-100 border border-slate-200 text-slate-500 hover:text-emerald-700 hover:border-emerald-300"
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
                          className={`w-8 h-8 rounded-xl font-bold transition flex items-center justify-center mx-auto cursor-pointer ${
                            currentStatus === "Absent"
                              ? "bg-red-600 text-white shadow-md shadow-red-600/30 scale-105"
                              : isLight
                              ? "bg-slate-100 border border-slate-200 text-slate-500 hover:text-red-700 hover:border-red-300"
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
                          className={`w-8 h-8 rounded-xl font-bold transition flex items-center justify-center mx-auto cursor-pointer ${
                            currentStatus === "Late"
                              ? "bg-amber-600 text-white shadow-md shadow-amber-600/30 scale-105"
                              : isLight
                              ? "bg-slate-100 border border-slate-200 text-slate-500 hover:text-amber-700 hover:border-amber-300"
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
                          className={`w-8 h-8 rounded-xl font-bold transition flex items-center justify-center mx-auto cursor-pointer ${
                            currentStatus === "Leave"
                              ? "bg-sky-600 text-white shadow-md shadow-sky-600/30 scale-105"
                              : isLight
                              ? "bg-slate-100 border border-slate-200 text-slate-500 hover:text-sky-700 hover:border-sky-300"
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
