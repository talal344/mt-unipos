"use client";

import React, { useState } from "react";
import { useSMS } from "@/context/sms-context";
import {
  Clock,
  Plus,
  UserCheck,
  Building,
  Sparkles,
  CheckCircle2,
  Calendar,
  AlertCircle
} from "lucide-react";

export default function SMSTimetablePage() {
  const { classes, teachers, timetable } = useSMS();
  const [selectedClass, setSelectedClass] = useState("Class 9 (Science)");
  const [selectedDay, setSelectedDay] = useState<"Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday">("Monday");
  const [substituteModal, setSubstituteModal] = useState(false);

  const days: ("Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday")[] = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  const periods = [
    { num: 1, time: "08:00 AM - 08:45 AM", subject: "Physics", teacher: "Sir Shahid Mehmood", room: "Lab 1" },
    { num: 2, time: "08:45 AM - 09:30 AM", subject: "Mathematics", teacher: "Sir Nasir Abbas", room: "Room 301" },
    { num: 3, time: "09:30 AM - 10:15 AM", subject: "English Grammar", teacher: "Mrs. Tahira Batool", room: "Room 301" },
    { num: 4, time: "10:15 AM - 11:00 AM", subject: "Chemistry", teacher: "Dr. Farzana Naeem", room: "Chem Lab" },
    { num: 5, time: "11:00 AM - 11:30 AM", subject: "Recess / Break", teacher: "—", room: "Cafeteria / Ground" },
    { num: 6, time: "11:30 AM - 12:15 PM", subject: "Computer Science", teacher: "Sir Kamran Rafique", room: "IT Lab 2" },
    { num: 7, time: "12:15 PM - 01:00 PM", subject: "Biology", teacher: "Ms. Hina Tariq", room: "Bio Lab" },
    { num: 8, time: "01:00 PM - 01:45 PM", subject: "Islamic Studies & Ethics", teacher: "Qari Muhammad Bilal", room: "Room 301" }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <Clock className="text-sky-400" size={22} />
            <span>Class Timetable &amp; Smart Substitution Matrix</span>
          </h1>
          <p className="text-xs text-gray-400">
            Master weekly period matrix per section with automatic teacher substitution locator for absent faculty.
          </p>
        </div>

        <button
          onClick={() => setSubstituteModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 font-bold text-xs transition cursor-pointer"
        >
          <Sparkles size={14} />
          <span>Smart Substitution Finder</span>
        </button>
      </div>

      {/* Selectors */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-72">
          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Select Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full bg-[#0b121e] border border-[#1e293b] p-2.5 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-sky-500"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.className}>
                {c.className} ({c.sectionName})
              </option>
            ))}
          </select>
        </div>

        {/* Days Pill bar */}
        <div className="flex flex-1 items-end gap-1.5 overflow-x-auto pb-0.5">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedDay === d
                  ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
                  : "bg-[#0b121e] border border-[#1e293b] text-gray-400 hover:text-white"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Timetable Period Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {periods.map((p) => {
          const isBreak = p.num === 5;
          return (
            <div
              key={p.num}
              className={`p-5 rounded-2xl border transition ${
                isBreak
                  ? "bg-amber-500/5 border-amber-500/20"
                  : "bg-[#0b121e] border-[#1e293b] hover:border-sky-500/40"
              } space-y-2`}
            >
              <div className="flex justify-between items-center text-xs">
                <span className={`font-mono font-bold ${isBreak ? "text-amber-400" : "text-sky-400"}`}>
                  {isBreak ? "BREAK" : `Period #${p.num}`}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">{p.time}</span>
              </div>

              <div className="text-base font-black text-white">{p.subject}</div>

              {!isBreak && (
                <>
                  <div className="text-xs text-gray-300">
                    <span className="text-gray-500">Teacher: </span>
                    <span className="text-emerald-400 font-bold">{p.teacher}</span>
                  </div>
                  <div className="text-[10px] text-gray-500">{p.room}</div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Substitution Modal */}
      {substituteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#0b121e] border border-purple-500/40 rounded-3xl w-full max-w-md shadow-2xl p-6 animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-purple-400" />
                <h3 className="font-black text-white text-sm">Smart Faculty Substitution Assistant</h3>
              </div>
              <button onClick={() => setSubstituteModal(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-purple-500/10 border border-purple-500/30 p-3.5 rounded-xl text-purple-300">
                Found <b>2 available free teachers</b> with no scheduled lectures during Period #1 (08:00 AM - 08:45 AM):
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-black/40 border border-gray-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Mrs. Tahira Batool</div>
                    <div className="text-[10px] text-gray-400">English • Free in Staff Room</div>
                  </div>
                  <button
                    onClick={() => {
                      alert("Assigned Mrs. Tahira Batool as proxy substitution for Period #1!");
                      setSubstituteModal(false);
                    }}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-[10px]"
                  >
                    Assign Proxy
                  </button>
                </div>

                <div className="p-3 bg-black/40 border border-gray-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Sir Nasir Abbas</div>
                    <div className="text-[10px] text-gray-400">Mathematics • Free</div>
                  </div>
                  <button
                    onClick={() => {
                      alert("Assigned Sir Nasir Abbas as proxy substitution for Period #1!");
                      setSubstituteModal(false);
                    }}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-[10px]"
                  >
                    Assign Proxy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
