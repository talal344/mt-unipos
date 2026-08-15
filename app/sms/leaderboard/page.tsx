"use client";

import React, { useState } from "react";
import { useSMS } from "@/context/sms-context";
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Sparkles,
  Star,
  Search,
  Filter,
  GraduationCap
} from "lucide-react";

export default function SMSLeaderboardPage() {
  const { classes, students, examTerms, houses } = useSMS();

  const [selectedClass, setSelectedClass] = useState("Class 9 (Science)");
  const [selectedSection, setSelectedSection] = useState("Section A (Newton)");

  // Ranked student list
  const rankedStudents = [
    {
      rank: 1,
      name: "Ahmed Talal",
      rollNo: "01",
      admissionNo: "ADM-2026-0041",
      className: "Class 9 (Science)",
      sectionName: "Section A (Newton)",
      totalMarks: 492,
      maxMarks: 500,
      percentage: 98.4,
      grade: "A+",
      house: "Jinnah House",
      houseColor: "#16a34a",
      photoInitial: "A"
    },
    {
      rank: 2,
      name: "Zainab Fatima",
      rollNo: "04",
      admissionNo: "ADM-2026-0044",
      className: "Class 9 (Science)",
      sectionName: "Section A (Newton)",
      totalMarks: 479,
      maxMarks: 500,
      percentage: 95.8,
      grade: "A+",
      house: "Iqbal House",
      houseColor: "#0284c7",
      photoInitial: "Z"
    },
    {
      rank: 3,
      name: "Hamza Tariq",
      rollNo: "09",
      admissionNo: "ADM-2026-0049",
      className: "Class 9 (Science)",
      sectionName: "Section A (Newton)",
      totalMarks: 468,
      maxMarks: 500,
      percentage: 93.6,
      grade: "A+",
      house: "Sir Syed House",
      houseColor: "#9333ea",
      photoInitial: "H"
    },
    {
      rank: 4,
      name: "Bilal Mehmood",
      rollNo: "12",
      admissionNo: "ADM-2026-0052",
      className: "Class 9 (Science)",
      sectionName: "Section A (Newton)",
      totalMarks: 450,
      maxMarks: 500,
      percentage: 90.0,
      grade: "A+",
      house: "Liaquat House",
      houseColor: "#dc2626",
      photoInitial: "B"
    },
    {
      rank: 5,
      name: "Ayesha Malik",
      rollNo: "15",
      admissionNo: "ADM-2026-0055",
      className: "Class 9 (Science)",
      sectionName: "Section A (Newton)",
      totalMarks: 438,
      maxMarks: 500,
      percentage: 87.6,
      grade: "A",
      house: "Jinnah House",
      houseColor: "#16a34a",
      photoInitial: "A"
    }
  ];

  const firstPos = rankedStudents[0];
  const secondPos = rankedStudents[1];
  const thirdPos = rankedStudents[2];

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <Trophy className="text-amber-400" size={24} />
            <span>Academic Hall of Fame &amp; Class Positions Leaderboard</span>
          </h1>
          <p className="text-xs text-gray-400">
            Official terminal assessment position holders (1st, 2nd, 3rd Positions) with grades, marks, and House affiliations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-[#0b121e] border border-[#1e293b] p-2 rounded-xl text-white font-bold text-xs"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.className}>
                {c.className} ({c.sectionName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* GRAPHICAL PODIUM: TOP 3 POSITION HOLDERS                                      */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-[#0e1a2d] to-[#080d14] border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase">
            <Crown size={14} className="text-amber-400" />
            <span>Midterm 2026 • Top Scholastic Achievers</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">{selectedClass}</h2>
        </div>

        {/* 3-Column Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto items-end pt-6">
          {/* 2nd Place (Silver) */}
          {secondPos && (
            <div className="order-2 md:order-1 bg-[#0b1422] border-2 border-slate-400/40 rounded-3xl p-6 text-center space-y-3 shadow-xl transform hover:scale-105 transition duration-300">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 text-black font-black text-xl flex items-center justify-center mx-auto shadow-lg ring-4 ring-slate-400/30">
                2nd
              </div>
              <div>
                <h3 className="font-black text-white text-base">{secondPos.name}</h3>
                <div className="text-xs text-gray-400">Roll #{secondPos.rollNo} • {secondPos.admissionNo}</div>
              </div>
              <div className="p-3 bg-black/60 rounded-2xl border border-gray-800 space-y-1 text-xs">
                <div className="text-xl font-black text-slate-200">{secondPos.percentage}%</div>
                <div className="text-gray-400">{secondPos.totalMarks} / {secondPos.maxMarks} Marks</div>
                <div className="text-[10px] font-bold" style={{ color: secondPos.houseColor }}>
                  ★ {secondPos.house}
                </div>
              </div>
            </div>
          )}

          {/* 1st Place (Gold Champion) */}
          {firstPos && (
            <div className="order-1 md:order-2 bg-gradient-to-b from-[#1c1809] to-[#0b1422] border-2 border-amber-400 rounded-3xl p-8 text-center space-y-4 shadow-2xl transform hover:scale-110 transition duration-300 md:-translate-y-6 relative">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs px-4 py-1 rounded-full uppercase shadow-md flex items-center gap-1">
                <Crown size={13} />
                <span>Class Champion</span>
              </div>
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-black font-black text-2xl flex items-center justify-center mx-auto shadow-xl ring-4 ring-amber-400/50">
                🥇 1st
              </div>
              <div>
                <h3 className="font-black text-white text-lg">{firstPos.name}</h3>
                <div className="text-xs text-amber-300 font-mono">Roll #{firstPos.rollNo} • {firstPos.admissionNo}</div>
              </div>
              <div className="p-3.5 bg-black/80 rounded-2xl border border-amber-500/40 space-y-1 text-xs">
                <div className="text-2xl font-black text-amber-400">{firstPos.percentage}%</div>
                <div className="text-white font-bold">{firstPos.totalMarks} / {firstPos.maxMarks} Marks (Grade {firstPos.grade})</div>
                <div className="text-[11px] font-bold" style={{ color: firstPos.houseColor }}>
                  👑 {firstPos.house}
                </div>
              </div>
            </div>
          )}

          {/* 3rd Place (Bronze) */}
          {thirdPos && (
            <div className="order-3 bg-[#0b1422] border-2 border-amber-700/40 rounded-3xl p-6 text-center space-y-3 shadow-xl transform hover:scale-105 transition duration-300">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-700 to-amber-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-lg ring-4 ring-amber-700/30">
                3rd
              </div>
              <div>
                <h3 className="font-black text-white text-base">{thirdPos.name}</h3>
                <div className="text-xs text-gray-400">Roll #{thirdPos.rollNo} • {thirdPos.admissionNo}</div>
              </div>
              <div className="p-3 bg-black/60 rounded-2xl border border-gray-800 space-y-1 text-xs">
                <div className="text-xl font-black text-amber-500">{thirdPos.percentage}%</div>
                <div className="text-gray-400">{thirdPos.totalMarks} / {thirdPos.maxMarks} Marks</div>
                <div className="text-[10px] font-bold" style={{ color: thirdPos.houseColor }}>
                  ★ {thirdPos.house}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Merit Rankings Table */}
      <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/40">
          <h3 className="font-black text-white text-xs uppercase tracking-wider">
            Complete Merit List &amp; Performance Breakdown
          </h3>
          <span className="text-[10px] text-amber-400 font-mono">Terminal Examination 2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-mono text-[10px] bg-black/20">
                <th className="p-4 font-bold">Position</th>
                <th className="p-4 font-bold">Roll #</th>
                <th className="p-4 font-bold">Student Name</th>
                <th className="p-4 font-bold">Admission ID</th>
                <th className="p-4 font-bold">House Affiliation</th>
                <th className="p-4 font-bold text-center">Marks (500)</th>
                <th className="p-4 font-bold text-center">Percentage</th>
                <th className="p-4 font-bold text-center">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50 font-mono text-xs">
              {rankedStudents.map((s) => (
                <tr key={s.rank} className="hover:bg-white/[0.02] transition">
                  <td className="p-4 font-black">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                        s.rank === 1
                          ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                          : s.rank === 2
                          ? "bg-slate-300 text-black"
                          : s.rank === 3
                          ? "bg-amber-700 text-white"
                          : "bg-gray-800 text-gray-300"
                      }`}
                    >
                      #{s.rank}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300">{s.rollNo}</td>
                  <td className="p-4 font-sans font-bold text-white text-sm">{s.name}</td>
                  <td className="p-4 text-sky-400">{s.admissionNo}</td>
                  <td className="p-4 font-sans font-bold" style={{ color: s.houseColor }}>
                    {s.house}
                  </td>
                  <td className="p-4 text-center font-bold text-white">{s.totalMarks} / 500</td>
                  <td className="p-4 text-center font-black text-emerald-400">{s.percentage}%</td>
                  <td className="p-4 text-center">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded font-black text-[11px]">
                      {s.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
