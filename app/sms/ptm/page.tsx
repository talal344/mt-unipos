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
  const { ptmSlots, bookPTMSlot, teachers, students } = useSMS();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <CalendarRange className="text-sky-400" size={22} />
            <span>Parent-Teacher Meeting (PTM) Slot Scheduler</span>
          </h1>
          <p className="text-xs text-gray-400">
            Schedule 15-minute dedicated parent-teacher conference slots, record meeting minutes, and track academic consultation notes.
          </p>
        </div>
      </div>

      {/* Slots Table */}
      <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/40">
          <h3 className="font-black text-white text-xs uppercase tracking-wider">
            Available &amp; Booked PTM Conference Schedule
          </h3>
          <span className="text-[10px] text-sky-400 font-mono">Terminal PTM 2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-mono text-[10px] bg-black/20">
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
            <tbody className="divide-y divide-gray-800/50 font-mono text-[10px]">
              {ptmSlots.map((s) => (
                <tr key={s.id} className="hover:bg-white/[0.02] transition">
                  <td className="p-4 font-sans font-bold text-white text-sm">{s.teacherName}</td>
                  <td className="p-4 font-sans text-gray-300">{s.className}</td>
                  <td className="p-4 text-sky-300 font-bold">{s.date}</td>
                  <td className="p-4 text-white font-bold">{s.timeSlot}</td>
                  <td className="p-4 font-sans text-gray-300">{s.studentName || "—"}</td>
                  <td className="p-4 font-sans text-gray-400">{s.parentName || "—"}</td>
                  <td className="p-4 text-center font-sans">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold ${
                        s.status === "Booked"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
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
                        className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold text-[10px] transition cursor-pointer shadow"
                      >
                        Book Slot
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-500">Reserved</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#0b121e] border border-sky-500/40 rounded-3xl w-full max-w-md shadow-2xl p-6 animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-4">
              <h3 className="font-black text-white text-sm">Reserve PTM Conference Slot</h3>
              <button onClick={() => setBookingSlot(null)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-4 text-xs">
              <div className="bg-black/40 border border-gray-800 rounded-xl p-3 space-y-1">
                <div>Faculty: <b className="text-white">{bookingSlot.teacherName}</b></div>
                <div>Date &amp; Time: <b className="text-sky-400">{bookingSlot.date} ({bookingSlot.timeSlot})</b></div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-sky-400 mb-1">Select Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
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
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-black uppercase rounded-xl transition text-xs"
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
