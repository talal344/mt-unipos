"use client";

import React, { useState } from "react";
import { useSMS, PTMSlot } from "@/context/sms-context";
import {
  CalendarRange,
  Plus,
  CheckCircle2,
  Clock,
  UserCheck,
  Search,
  Users,
  Calendar,
  X
} from "lucide-react";

export default function SMSPTMPage() {
  const { theme, ptmSlots, bookPTMSlot, teachers, students } = useSMS();
  const isLight = theme === "light";

  const [bookingSlot, setBookingSlot] = useState<PTMSlot | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || "");

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingSlot) return;
    const st = students.find((s) => s.id === selectedStudentId);
    if (!st) return;

    bookPTMSlot(bookingSlot.id, st.id, `${st.firstName} ${st.lastName}`, st.fatherName);
    setBookingSlot(null);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${isLight ? "border-slate-200" : "border-gray-800"} pb-4`}>
        <div>
          <h1 className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-2`}>
            <CalendarRange className={isLight ? "text-sky-600" : "text-sky-400"} size={22} />
            <span>Parent-Teacher Meeting (PTM) Slot Scheduler</span>
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Schedule 15-minute dedicated parent-teacher conference slots, record meeting minutes, and track academic consultation notes.
          </p>
        </div>
      </div>

      {/* Slots Table */}
      <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl overflow-hidden shadow-2xl`}>
        <div className={`p-4 border-b ${isLight ? "border-slate-100 bg-slate-50/80" : "border-gray-800 bg-black/40"} flex justify-between items-center`}>
          <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-xs uppercase tracking-wider`}>
            Available &amp; Booked PTM Conference Schedule
          </h3>
          <span className={`text-[10px] ${isLight ? "text-sky-700 font-bold" : "text-sky-400"} font-mono`}>Terminal PTM 2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b ${isLight ? "border-slate-200 text-slate-600 bg-slate-100/70" : "border-gray-800 text-gray-400 bg-black/20"} font-mono text-[10px]`}>
                <th className="p-4 font-bold">Faculty Teacher</th>
                <th className="p-4 font-bold">Class Section</th>
                <th className="p-4 font-bold">Conference Date</th>
                <th className="p-4 font-bold">Time Window</th>
                <th className="p-4 font-bold">Booked Candidate</th>
                <th className="p-4 font-bold">Parent / Guardian</th>
                <th className="p-4 font-bold text-center">Slot Status</th>
                <th className="p-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? "divide-slate-100" : "divide-gray-800/50"} font-mono text-[10px]`}>
              {ptmSlots.map((s) => (
                <tr key={s.id} className={`${isLight ? "hover:bg-slate-50/80" : "hover:bg-white/[0.02]"} transition`}>
                  <td className={`p-4 font-sans font-bold ${isLight ? "text-slate-900" : "text-white"} text-sm`}>{s.teacherName}</td>
                  <td className={`p-4 font-sans ${isLight ? "text-slate-700" : "text-gray-300"}`}>{s.className}</td>
                  <td className={`p-4 ${isLight ? "text-sky-700" : "text-sky-300"} font-bold`}>{s.date}</td>
                  <td className={`p-4 ${isLight ? "text-slate-900" : "text-white"} font-bold`}>{s.timeSlot}</td>
                  <td className={`p-4 font-sans ${isLight ? "text-slate-700" : "text-gray-300"}`}>{s.studentName || "—"}</td>
                  <td className={`p-4 font-sans ${isLight ? "text-slate-600" : "text-gray-400"}`}>{s.parentName || "—"}</td>
                  <td className="p-4 text-center font-sans">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold ${
                        s.status === "Booked"
                          ? isLight
                            ? "bg-amber-50 text-amber-800 border border-amber-300"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : isLight
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {s.status === "Available" ? (
                      <button
                        onClick={() => setBookingSlot(s)}
                        className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold text-[10px] transition cursor-pointer shadow-xs"
                      >
                        Book Slot
                      </button>
                    ) : (
                      <span className={`text-[10px] ${isLight ? "text-slate-500 font-bold" : "text-gray-500"}`}>Reserved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Modal */}
      {bookingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-sky-500/40 text-white"
          } border rounded-3xl w-full max-w-md shadow-2xl p-6 animate-fade-in-up`}>
            <div className={`flex justify-between items-center border-b ${isLight ? "border-slate-100" : "border-gray-800"} pb-3 mb-4`}>
              <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>Reserve PTM Conference Slot</h3>
              <button onClick={() => setBookingSlot(null)} className={`${isLight ? "text-slate-400 hover:text-slate-800" : "text-gray-400 hover:text-white"} cursor-pointer`}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-4 text-xs">
              <div className={`${isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-black/40 border-gray-800 text-gray-300"} border rounded-xl p-3 space-y-1`}>
                <div>Faculty: <b className={isLight ? "text-slate-900" : "text-white"}>{bookingSlot.teacherName}</b></div>
                <div>Date &amp; Time: <b className={isLight ? "text-sky-700" : "text-sky-400"}>{bookingSlot.date} ({bookingSlot.timeSlot})</b></div>
              </div>

              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-sky-700 font-bold" : "text-sky-400"} mb-1`}>Select Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className={`w-full ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                  } border p-2.5 rounded-xl font-bold`}
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.firstName} {st.lastName} (Parent: {st.fatherName})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-black uppercase rounded-xl transition text-xs cursor-pointer shadow-lg shadow-sky-600/20"
              >
                Confirm PTM Reservation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
