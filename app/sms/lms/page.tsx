"use client";

import React, { useState } from "react";
import { useSMS } from "@/context/sms-context";
import {
  BookOpen,
  Plus,
  FileText,
  Download,
  Calendar,
  CheckCircle2,
  Bookmark,
  Share2,
  Clock
} from "lucide-react";

export default function SMSLMSPage() {
  const { classes } = useSMS();
  const [selectedClass, setSelectedClass] = useState("Class 9 (Science)");

  const learningMaterials = [
    {
      id: "MAT-01",
      title: "Chapter 02: Kinematics Comprehensive Lecture Notes & Numerical Solutions",
      subject: "Physics",
      author: "Sir Shahid Mehmood",
      type: "PDF Document (2.4 MB)",
      uploadedAt: "2026-08-12",
      downloads: 48
    },
    {
      id: "MAT-02",
      title: "Quadratic Equations Formula Sheet & 10-Year Past Paper Solutions",
      subject: "Mathematics",
      author: "Sir Nasir Abbas",
      type: "PDF Document (1.8 MB)",
      uploadedAt: "2026-08-10",
      downloads: 62
    },
    {
      id: "MAT-03",
      title: "English Essay Compilation on National Events & Idiomatic Phrases",
      subject: "English Grammar",
      author: "Mrs. Tahira Batool",
      type: "PDF Document (3.1 MB)",
      uploadedAt: "2026-08-08",
      downloads: 35
    }
  ];

  const dailyDiary = [
    {
      id: "DRY-01",
      date: "2026-08-15",
      subject: "Physics",
      homework: "Learn and write the derivation of 3rd Equation of Motion on neat assignment sheets. Solve numerical 2.4 and 2.5.",
      teacher: "Sir Shahid Mehmood",
      due: "2026-08-17"
    },
    {
      id: "DRY-02",
      date: "2026-08-15",
      subject: "Mathematics",
      homework: "Exercise 1.4: Solve Question No. 3 to 7 (Matrices multiplication and determinant).",
      teacher: "Sir Nasir Abbas",
      due: "2026-08-16"
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <BookOpen className="text-sky-400" size={22} />
            <span>Digital Learning Repository &amp; Daily Homework Diary</span>
          </h1>
          <p className="text-xs text-gray-400">
            Publish digital lecture handouts, chapter worksheets, 10-year past papers, and daily classroom diary assignments.
          </p>
        </div>

        <button
          onClick={() => alert("Upload Handout modal opened!")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-600/20 transition cursor-pointer"
        >
          <Plus size={14} />
          <span>Upload Learning Handout</span>
        </button>
      </div>

      {/* Class Selector */}
      <div className="w-full sm:w-80">
        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Target Class Handouts</label>
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

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Materials */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase font-bold text-sky-400 tracking-wider">Digital Notes &amp; Handouts</h3>
          <div className="space-y-3">
            {learningMaterials.map((mat) => (
              <div
                key={mat.id}
                className="bg-[#0b121e] border border-[#1e293b] hover:border-sky-500/40 p-5 rounded-2xl space-y-3 transition group"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded">
                    {mat.subject}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">{mat.uploadedAt}</span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition">{mat.title}</h4>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>By: <b className="text-gray-200">{mat.author}</b></span>
                  <button
                    onClick={() => alert(`Downloading handout: ${mat.title}`)}
                    className="flex items-center gap-1 text-sky-400 hover:text-white font-bold text-[11px]"
                  >
                    <Download size={12} />
                    <span>Download Handout</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Diary */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Daily Classroom Diary &amp; Homework</h3>
          <div className="space-y-3">
            {dailyDiary.map((dry) => (
              <div key={dry.id} className="bg-[#0b121e] border border-emerald-500/30 p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-400 font-bold font-mono">{dry.subject}</span>
                  <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-bold">
                    Due: {dry.due}
                  </span>
                </div>
                <p className="text-xs text-gray-200 leading-relaxed font-sans">{dry.homework}</p>
                <div className="text-[10px] text-gray-500 border-t border-gray-800 pt-2 flex justify-between">
                  <span>Assigned By: <b className="text-gray-300">{dry.teacher}</b></span>
                  <span>Date: {dry.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
