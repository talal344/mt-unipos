"use client";

import React, { useState } from "react";
import { useSMS } from "@/context/sms-context";
import {
  Target,
  Plus,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Calendar
} from "lucide-react";

export default function SMSLessonPlannerPage() {
  const { classes } = useSMS();
  const [selectedClass, setSelectedClass] = useState("Class 9 (Science)");
  const [selectedSubject, setSelectedSubject] = useState("Physics");

  const syllabusUnits = [
    {
      unitNo: "Unit 01",
      title: "Physical Quantities and Measurement",
      chapters: 4,
      status: "100% Completed",
      progressPct: 100,
      teacher: "Sir Shahid Mehmood",
      completionDate: "2026-05-30"
    },
    {
      unitNo: "Unit 02",
      title: "Kinematics & Speed-Time Graphs",
      chapters: 5,
      status: "100% Completed",
      progressPct: 100,
      teacher: "Sir Shahid Mehmood",
      completionDate: "2026-06-25"
    },
    {
      unitNo: "Unit 03",
      title: "Dynamics & Newton's Laws of Motion",
      chapters: 6,
      status: "80% In Progress",
      progressPct: 80,
      teacher: "Sir Shahid Mehmood",
      completionDate: "Target: 2026-08-30"
    },
    {
      unitNo: "Unit 04",
      title: "Turning Effect of Forces & Equilibrium",
      chapters: 5,
      status: "Upcoming",
      progressPct: 0,
      teacher: "Sir Shahid Mehmood",
      completionDate: "Target: 2026-09-20"
    }
  ];

  const weeklyPlans = [
    {
      week: "Week 3 (August 2026)",
      topic: "Newton's Third Law & Conservation of Momentum",
      objectives: "Enable students to mathematically derive momentum conservation and solve board numerical questions 3.1 to 3.5.",
      activities: "Interactive Air-Track laboratory demonstration and peer-solving on whiteboards.",
      homework: "Assignment sheet #03 on elastic and inelastic collisions."
    },
    {
      week: "Week 4 (August 2026)",
      topic: "Friction, Limiting Friction and Centripetal Force",
      objectives: "Differentiate between static and kinetic friction. Derive Fc = mv²/r.",
      activities: "Circular motion motorized apparatus practical in Science Lab 1.",
      homework: "Solve conceptual short questions on banking of roads."
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <Target className="text-emerald-400" size={22} />
            <span>Master Lesson Planner &amp; Syllabus Progress Tracker</span>
          </h1>
          <p className="text-xs text-gray-400">
            Track unit-wise curriculum milestones, learning objectives, lab demonstrations, and board syllabus completion rates.
          </p>
        </div>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
        <div>
          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Select Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full bg-[#0b121e] border border-[#1e293b] p-2.5 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-emerald-500"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.className}>
                {c.className} ({c.sectionName})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full bg-[#0b121e] border border-[#1e293b] p-2.5 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-emerald-500"
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
          <h3 className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Curriculum Units &amp; Milestones</h3>
          <div className="space-y-3">
            {syllabusUnits.map((u, i) => (
              <div key={i} className="bg-[#0b121e] border border-[#1e293b] p-5 rounded-2xl space-y-3 shadow-xl">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-sky-400 font-mono">{u.unitNo}</span>
                  <span
                    className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                      u.progressPct === 100
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : u.progressPct > 0
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {u.status}
                  </span>
                </div>

                <h4 className="font-black text-white text-sm">{u.title}</h4>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                    <span>{u.chapters} Key Topics</span>
                    <span>{u.progressPct}%</span>
                  </div>
                  <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-gray-800">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                      style={{ width: `${u.progressPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-800">
                  <span>Instructor: <b className="text-gray-300">{u.teacher}</b></span>
                  <span>{u.completionDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Lesson Plan Breakdowns */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase font-bold text-sky-400 tracking-wider">Weekly Lesson Plans &amp; Lab Activities</h3>
          <div className="space-y-3">
            {weeklyPlans.map((w, idx) => (
              <div key={idx} className="bg-[#0b121e] border border-sky-500/20 p-5 rounded-2xl space-y-3 shadow-xl">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-sky-300 font-bold font-mono">{w.week}</span>
                  <span className="text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded font-bold">
                    Approved by Principal
                  </span>
                </div>

                <h4 className="font-black text-white text-sm">{w.topic}</h4>

                <div className="text-xs space-y-2 bg-black/40 border border-gray-800 p-3 rounded-xl">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Learning Objectives</span>
                    <span className="text-gray-300">{w.objectives}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">Lab &amp; Practical Activity</span>
                    <span className="text-emerald-300">{w.activities}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-purple-400 block">Homework Assignment</span>
                    <span className="text-purple-300">{w.homework}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
