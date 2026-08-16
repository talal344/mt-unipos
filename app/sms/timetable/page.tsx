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
  const { theme, classes, teachers, timetable } = useSMS();
  const isLight = theme === "light";

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {periods.map((p) => {
          const isBreak = p.num === 5;
          return (
            <div
              key={p.num}
              className={`p-5 rounded-2xl border transition ${
                isBreak
                  ? isLight
                    ? "bg-amber-50/80 border-amber-200 text-amber-900 shadow-xs"
                    : "bg-amber-500/5 border-amber-500/20"
                  : isLight
                  ? "bg-white border-slate-200 hover:border-sky-400 shadow-sm"
                  : "bg-[#0b121e] border-[#1e293b] hover:border-sky-500/40"
              } space-y-2`}
            >
              <div className="flex justify-between items-center text-xs">
                <span className={`font-mono font-bold ${
                  isBreak
                    ? isLight ? "text-amber-800" : "text-amber-400"
                    : isLight ? "text-sky-700" : "text-sky-400"
                }`}>
                  {isBreak ? "BREAK" : `Period #${p.num}`}
                </span>
                <span className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-500"} font-mono`}>{p.time}</span>
              </div>

              <div className={`text-base font-black ${isLight ? "text-slate-900" : "text-white"}`}>{p.subject}</div>

              {!isBreak && (
                <>
                  <div className={`text-xs ${isLight ? "text-slate-600" : "text-gray-300"}`}>
                    <span className={isLight ? "text-slate-500" : "text-gray-500"}>Teacher: </span>
                    <span className={`${isLight ? "text-emerald-700" : "text-emerald-400"} font-bold`}>{p.teacher}</span>
                  </div>
                  <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-500"}`}>{p.room}</div>
                </>
              )}
            </div>
          );
        })}
      </div>

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
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className={`${isLight ? "bg-purple-50 border-purple-200 text-purple-900" : "bg-purple-500/10 border-purple-500/30 text-purple-300"} border p-3.5 rounded-xl`}>
                Found <b>2 available free teachers</b> with no scheduled lectures during Period #1 (08:00 AM - 08:45 AM):
              </div>

              <div className="space-y-2">
                <div className={`p-3 ${isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-gray-800"} border rounded-xl flex items-center justify-between`}>
                  <div>
                    <div className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Mrs. Tahira Batool</div>
                    <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>English • Free in Staff Room</div>
                  </div>
                  <button
                    onClick={() => {
                      alert("Assigned Mrs. Tahira Batool as proxy substitution for Period #1!");
                      setSubstituteModal(false);
                    }}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-[10px] cursor-pointer"
                  >
                    Assign Proxy
                  </button>
                </div>

                <div className={`p-3 ${isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-gray-800"} border rounded-xl flex items-center justify-between`}>
                  <div>
                    <div className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Sir Nasir Abbas</div>
                    <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>Mathematics • Free</div>
                  </div>
                  <button
                    onClick={() => {
                      alert("Assigned Sir Nasir Abbas as proxy substitution for Period #1!");
                      setSubstituteModal(false);
                    }}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-[10px] cursor-pointer"
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
