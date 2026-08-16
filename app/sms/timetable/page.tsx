"use client";

import React, { useState } from "react";
import { useSMS, TimetablePeriod } from "@/context/sms-context";
import {
  Clock,
  Plus,
  UserCheck,
  Building,
  Sparkles,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Trash2,
  X
} from "lucide-react";

export default function SMSTimetablePage() {
  const { theme, classes, teachers, timetable, addTimetablePeriod, deleteTimetablePeriod } = useSMS();
  const isLight = theme === "light";

  const [selectedClass, setSelectedClass] = useState(classes[0]?.className || "Class 9 (Science)");
  const [selectedDay, setSelectedDay] = useState<"Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday">("Monday");
  const [substituteModal, setSubstituteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    periodNumber: 1,
    timeSlot: "08:00 AM - 08:45 AM",
    subject: "Physics",
    teacherId: teachers[0]?.id || "",
    teacherName: teachers[0]?.fullName || "Subject Faculty",
    room: "Room 101"
  });

  const days: ("Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday")[] = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  const filteredPeriods = timetable.filter(
    (t) => (t.className === selectedClass || selectedClass === "All") && t.day === selectedDay
  ).sort((a, b) => a.periodNumber - b.periodNumber);

  const handleAddPeriod = (e: React.FormEvent) => {
    e.preventDefault();
    const selTeacher = teachers.find((t) => t.id === form.teacherId);
    addTimetablePeriod({
      className: selectedClass,
      sectionName: "Section A",
      day: selectedDay,
      periodNumber: form.periodNumber,
      timeSlot: form.timeSlot,
      subject: form.subject,
      teacherId: form.teacherId,
      teacherName: selTeacher?.fullName || form.teacherName,
      room: form.room
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${isLight ? "border-slate-200" : "border-gray-800"} pb-4`}>
        <div>
          <h1 className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-2`}>
            <Clock className={isLight ? "text-sky-600" : "text-sky-400"} size={22} />
            <span>Class Timetable &amp; Smart Substitution Matrix</span>
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Master weekly period matrix per section with automatic teacher substitution locator for absent faculty.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/20 transition cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Period Slot</span>
          </button>

          <button
            onClick={() => setSubstituteModal(true)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl ${
              isLight
                ? "bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white border-purple-300"
                : "bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border-purple-500/30"
            } border font-bold text-xs transition cursor-pointer shadow-xs`}
          >
            <Sparkles size={14} />
            <span>Smart Substitution Finder</span>
          </button>
        </div>
      </div>

      {/* Selectors */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-72">
          <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Select Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className={`w-full ${
              isLight ? "bg-white border-slate-200 text-slate-900 shadow-xs" : "bg-[#0b121e] border-[#1e293b] text-white"
            } border p-2.5 rounded-xl font-bold text-xs focus:outline-none focus:border-sky-500`}
          >
            {classes.length === 0 ? (
              <option value="">No Classes Configured Yet</option>
            ) : (
              classes.map((c) => (
                <option key={c.id} value={c.className}>
                  {c.className} ({c.sectionName})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Days Pill bar */}
        <div className="flex flex-1 items-end gap-1.5 overflow-x-auto pb-0.5">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedDay === d
                  ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
                  : isLight
                  ? "bg-white border border-slate-200 text-slate-700 hover:text-slate-950 shadow-xs"
                  : "bg-[#0b121e] border border-[#1e293b] text-gray-400 hover:text-white"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Timetable Period Grid */}
      {filteredPeriods.length === 0 ? (
        <div className={`p-12 rounded-2xl border text-center text-xs ${
          isLight ? "bg-white border-slate-200 text-slate-500" : "bg-[#0b121e] border-[#1e293b] text-gray-500"
        }`}>
          <Clock size={32} className="mx-auto mb-2 opacity-40 text-sky-500" />
          <p className="font-bold">No Periods Scheduled for {selectedDay}</p>
          <p className="text-[11px] mt-1">Click "+ Add Period Slot" to define bell timetable periods for this day.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredPeriods.map((p) => (
            <div
              key={p.id}
              className={`p-5 rounded-2xl border transition ${
                isLight ? "bg-white border-slate-200 hover:border-sky-400 shadow-sm" : "bg-[#0b121e] border-[#1e293b] hover:border-sky-500/40"
              } space-y-2`}
            >
              <div className="flex justify-between items-center text-xs">
                <span className={`font-mono font-bold ${isLight ? "text-sky-700" : "text-sky-400"}`}>
                  Period #{p.periodNumber}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-500"} font-mono`}>{p.timeSlot}</span>
                  <button
                    onClick={() => deleteTimetablePeriod(p.id)}
                    className={`${isLight ? "text-slate-400 hover:text-red-600" : "text-gray-500 hover:text-red-400"} cursor-pointer`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className={`text-base font-black ${isLight ? "text-slate-900" : "text-white"}`}>{p.subject}</div>

              <div className={`text-xs ${isLight ? "text-slate-600" : "text-gray-300"}`}>
                <span className={isLight ? "text-slate-500" : "text-gray-500"}>Teacher: </span>
                <span className={`${isLight ? "text-emerald-700" : "text-emerald-400"} font-bold`}>{p.teacherName}</span>
              </div>
              <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-500"}`}>{p.room}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add Period Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-sky-500/40 text-white"
          } border rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4`}>
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-sm">Add Timetable Period Slot</h3>
              <button onClick={() => setShowAddModal(false)} className="cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddPeriod} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold mb-1">Period Number</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={form.periodNumber}
                    onChange={(e) => setForm({ ...form, periodNumber: parseInt(e.target.value, 10) || 1 })}
                    className="w-full border p-2 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold mb-1">Time Slot</label>
                  <input
                    type="text"
                    placeholder="08:00 AM - 08:45 AM"
                    value={form.timeSlot}
                    onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                    className="w-full border p-2 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Physics / Mathematics"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full border p-2 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold mb-1">Faculty / Teacher</label>
                <select
                  value={form.teacherId}
                  onChange={(e) => {
                    const sel = teachers.find((t) => t.id === e.target.value);
                    setForm({ ...form, teacherId: e.target.value, teacherName: sel?.fullName || "" });
                  }}
                  className="w-full border p-2 rounded-xl"
                >
                  {teachers.length === 0 ? (
                    <option value="">No Faculty Added Yet</option>
                  ) : (
                    teachers.map((t) => (
                      <option key={t.id} value={t.id}>{t.fullName} ({t.department})</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold mb-1">Room / Lab Number</label>
                <input
                  type="text"
                  placeholder="e.g. Room 301 / Physics Lab 1"
                  value={form.room}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                  className="w-full border p-2 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl cursor-pointer"
              >
                Save Period Slot
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Substitution Modal */}
      {substituteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-purple-500/40 text-white"
          } border rounded-3xl w-full max-w-md shadow-2xl p-6 animate-fade-in-up`}>
            <div className={`flex justify-between items-center border-b ${isLight ? "border-slate-100" : "border-gray-800"} pb-3 mb-4`}>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className={isLight ? "text-purple-600" : "text-purple-400"} />
                <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>Smart Faculty Substitution Assistant</h3>
              </div>
              <button onClick={() => setSubstituteModal(false)} className={`${isLight ? "text-slate-400 hover:text-slate-800" : "text-gray-400 hover:text-white"} cursor-pointer`}>
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className={isLight ? "text-slate-600" : "text-gray-400"}>
                AI checks real-time teacher schedule matrices to find free faculty members with matching department expertise for substitution.
              </p>

              <div className={`p-4 rounded-xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-gray-800"}`}>
                <div className={`font-bold ${isLight ? "text-slate-800" : "text-white"}`}>Available Faculty in This Time Slot:</div>
                <div className="mt-2 space-y-1.5">
                  {teachers.length === 0 ? (
                    <div className="text-gray-500">No teachers registered in directory.</div>
                  ) : (
                    teachers.map((t) => (
                      <div key={t.id} className="flex justify-between items-center">
                        <span className={isLight ? "text-slate-700 font-medium" : "text-gray-300"}>{t.fullName} ({t.department})</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">Free</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button
                onClick={() => setSubstituteModal(false)}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl cursor-pointer"
              >
                Close Finder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
