"use client";

import React, { useState } from "react";
import { useSMS } from "@/context/sms-context";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Sparkles,
  Target,
  Layers,
  GraduationCap
} from "lucide-react";

export default function SMSLessonPlannerPage() {
  const { theme, classes } = useSMS();
  const isLight = theme === "light";

  const [selectedClass, setSelectedClass] = useState("Class 9 (Science)");
  const [selectedSubject, setSelectedSubject] = useState("Physics");

  // Sample syllabus units data
  const syllabusUnits = [
    {
      unitNo: "Unit 1",
      title: "Physical Quantities and Measurement",
      chapters: 4,
      progressPct: 100,
      status: "Completed",
      teacher: "Sir Shahid Mehmood",
      completionDate: "2026-08-20"
    },
    {
      unitNo: "Unit 2",
      title: "Kinematics & Equations of Motion",
      chapters: 6,
      progressPct: 80,
      status: "In Progress",
      teacher: "Sir Shahid Mehmood",
      completionDate: "2026-09-05"
    },
    {
      unitNo: "Unit 3",
      title: "Dynamics & Newton's Laws of Motion",
      chapters: 5,
      progressPct: 35,
      status: "In Progress",
      teacher: "Sir Shahid Mehmood",
      completionDate: "2026-09-25"
    },
    {
      unitNo: "Unit 4",
      title: "Turning Effect of Forces & Equilibrium",
      chapters: 5,
      progressPct: 0,
      status: "Pending",
      teacher: "Sir Shahid Mehmood",
      completionDate: "2026-10-15"
    }
  ];

  const weeklyPlans = [
    {
      week: "Week 1 (Sep 01 - Sep 06)",
      topic: "Newton's 2nd Law of Motion & Momentum",
      objectives: "State Newton's second law. Prove F = ma mathematically and solve numerical problems 3.1 to 3.4.",
      activities: "Demonstrate acceleration using dynamic trolley and ticker tape apparatus.",
      homework: "Exercise numericals 3.1 to 3.5 in Class Notebooks."
    },
    {
      week: "Week 2 (Sep 08 - Sep 13)",
      topic: "Friction, Limiting Friction and Centripetal Force",
      objectives: "Differentiate between static and kinetic friction. Derive Fc = mv²/r.",
      activities: "Circular motion motorized apparatus practical in Science Lab 1.",
      homework: "Solve conceptual short questions on banking of roads."
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${isLight ? "border-slate-200" : "border-gray-800"} pb-4`}>
        <div>
          <h1 className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-2`}>
            <Target className={isLight ? "text-emerald-600" : "text-emerald-400"} size={22} />
            <span>Master Lesson Planner &amp; Syllabus Progress Tracker</span>
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Track unit-wise curriculum milestones, learning objectives, lab demonstrations, and board syllabus completion rates.
          </p>
        </div>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
        <div>
          <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Select Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className={`w-full ${
              isLight ? "bg-white border-slate-200 text-slate-900 shadow-xs" : "bg-[#0b121e] border-[#1e293b] text-white"
            } border p-2.5 rounded-xl font-bold text-xs focus:outline-none focus:border-emerald-500`}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.className}>
                {c.className} ({c.sectionName})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-emerald-700 font-bold" : "text-emerald-400"} mb-1`}>Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className={`w-full ${
              isLight ? "bg-white border-slate-200 text-slate-900 shadow-xs" : "bg-[#0b121e] border-[#1e293b] text-white"
            } border p-2.5 rounded-xl font-bold text-xs focus:outline-none focus:border-emerald-500`}
          >
            <option value="Physics">Physics</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
          </select>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Syllabus Units Progress */}
        <div className="space-y-3">
          <h3 className={`text-xs uppercase font-bold ${isLight ? "text-emerald-700 font-bold" : "text-emerald-400"} tracking-wider`}>Curriculum Units &amp; Milestones</h3>
          <div className="space-y-3">
            {syllabusUnits.map((u, i) => (
              <div key={i} className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border p-5 rounded-2xl space-y-3 shadow-xl`}>
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-bold ${isLight ? "text-sky-700" : "text-sky-400"} font-mono`}>{u.unitNo}</span>
                  <span
                    className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                      u.progressPct === 100
                        ? isLight
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : u.progressPct > 0
                        ? isLight
                          ? "bg-amber-50 text-amber-700 border border-amber-300"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        : isLight
                        ? "bg-slate-100 text-slate-600"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {u.status}
                  </span>
                </div>

                <h4 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>{u.title}</h4>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className={`flex justify-between text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"} font-mono`}>
                    <span>{u.chapters} Key Topics</span>
                    <span>{u.progressPct}%</span>
                  </div>
                  <div className={`w-full h-2 ${isLight ? "bg-slate-100 border border-slate-200" : "bg-black/60 border border-gray-800"} rounded-full overflow-hidden`}>
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                      style={{ width: `${u.progressPct}%` }}
                    />
                  </div>
                </div>

                <div className={`flex justify-between text-[10px] ${isLight ? "text-slate-500 border-slate-100" : "text-gray-500 border-gray-800"} pt-1 border-t`}>
                  <span>Instructor: <b className={isLight ? "text-slate-800" : "text-gray-300"}>{u.teacher}</b></span>
                  <span>{u.completionDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Lesson Plan Breakdowns */}
        <div className="space-y-3">
          <h3 className={`text-xs uppercase font-bold ${isLight ? "text-sky-700 font-bold" : "text-sky-400"} tracking-wider`}>Weekly Lesson Plans &amp; Lab Activities</h3>
          <div className="space-y-3">
            {weeklyPlans.map((w, idx) => (
              <div key={idx} className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-sky-500/20"} border p-5 rounded-2xl space-y-3 shadow-xl`}>
                <div className="flex justify-between items-center text-xs">
                  <span className={`${isLight ? "text-sky-700 font-bold" : "text-sky-300 font-bold"} font-mono`}>{w.week}</span>
                  <span className={`text-[9px] ${
                    isLight ? "bg-sky-50 text-sky-700 border border-sky-300" : "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                  } px-2 py-0.5 rounded font-bold`}>
                    Approved by Principal
                  </span>
                </div>

                <h4 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>{w.topic}</h4>

                <div className={`text-xs space-y-2 ${isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-gray-800"} border p-3 rounded-xl`}>
                  <div>
                    <span className={`text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} block`}>Learning Objectives</span>
                    <span className={isLight ? "text-slate-700" : "text-gray-300"}>{w.objectives}</span>
                  </div>
                  <div>
                    <span className={`text-[10px] uppercase font-bold ${isLight ? "text-emerald-700 font-bold" : "text-emerald-400"} block`}>Lab &amp; Practical Activity</span>
                    <span className={isLight ? "text-emerald-800 font-medium" : "text-emerald-300"}>{w.activities}</span>
                  </div>
                  <div>
                    <span className={`text-[10px] uppercase font-bold ${isLight ? "text-purple-700 font-bold" : "text-purple-400"} block`}>Homework Assignment</span>
                    <span className={isLight ? "text-purple-800 font-medium" : "text-purple-300"}>{w.homework}</span>
                  </div>
                </div>

                <div className={`flex justify-between items-center pt-1 border-t ${isLight ? "border-slate-100" : "border-gray-800"} text-[10px]`}>
                  <span className={`flex items-center gap-1 ${isLight ? "text-emerald-700 font-semibold" : "text-emerald-400"}`}>
                    <CheckCircle2 size={12} />
                    <span>Academic Audit Verified</span>
                  </span>
                  <span className={isLight ? "text-slate-500" : "text-gray-500"}>Science Lab Period #3</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
