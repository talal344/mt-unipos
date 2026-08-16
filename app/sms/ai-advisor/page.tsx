"use client";

import React, { useState } from "react";
import { useSMS } from "@/context/sms-context";
import {
  BrainCircuit,
  Sparkles,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Award,
  Zap
} from "lucide-react";

export default function SMSAIAdvisorPage() {
  const { theme, students } = useSMS();
  const isLight = theme === "light";

  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || "");

  const student = students.find((s) => s.id === selectedStudentId) || students[0];

  const aiInsights = [
    {
      type: "Strength",
      title: "Strong Analytical & Conceptual Foundation in Physics",
      desc: "Ahmed scored 98% in Kinematics and Mechanics. Recommend advancing to National Olympiad preparation questions.",
      badge: "High Potential",
      containerClass: isLight
        ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
        : "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
      typeColor: isLight ? "text-emerald-800" : "text-emerald-400"
    },
    {
      type: "Recommendation",
      title: "Calculus & Quadratic Equations Practice",
      desc: "Performance is stellar (99%), but pacing during 8-mark long proofs could be optimized by 4 minutes.",
      badge: "Pacing Tip",
      containerClass: isLight
        ? "bg-sky-50/70 border-sky-300 text-sky-950"
        : "border-sky-500/40 text-sky-400 bg-sky-500/10",
      typeColor: isLight ? "text-sky-800" : "text-sky-400"
    },
    {
      type: "Attendance Impact",
      title: "Zero Academic Risk Detected",
      desc: "Consistent 96.5% attendance directly correlates with Top 1st Position ranking across all science sections.",
      badge: "Safe / Star",
      containerClass: isLight
        ? "bg-purple-50/70 border-purple-300 text-purple-950"
        : "border-purple-500/40 text-purple-400 bg-purple-500/10",
      typeColor: isLight ? "text-purple-800" : "text-purple-400"
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${isLight ? "border-slate-200" : "border-gray-800"} pb-4`}>
        <div>
          <h1 className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-2`}>
            <BrainCircuit className={isLight ? "text-purple-600" : "text-purple-400"} size={22} />
            <span>AI Student Academic Advisor &amp; Risk Predictor</span>
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Machine learning neural evaluations predicting subject drop risks, study timetable recommendations, and personalized exam coaching.
          </p>
        </div>

        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${
          isLight ? "bg-purple-50 border-purple-300 text-purple-800" : "bg-purple-500/10 border-purple-500/30 text-purple-300"
        } border text-xs font-bold font-mono`}>
          <Zap size={13} className={isLight ? "text-amber-600" : "text-amber-400"} />
          AI Neural Advisor v4.2 Active
        </span>
      </div>

      {/* Selector */}
      <div className="max-w-xs">
        <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Select Student to Analyze</label>
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className={`w-full ${
            isLight ? "bg-white border-slate-200 text-slate-900 focus:border-purple-600" : "bg-[#0b121e] border-[#1e293b] text-white focus:border-purple-500"
          } border p-2.5 rounded-xl font-bold text-xs focus:outline-none`}
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.firstName} {s.lastName} ({s.className})
            </option>
          ))}
        </select>
      </div>

      {/* AI Intelligence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {aiInsights.map((insight, i) => (
          <div key={i} className={`p-5 rounded-2xl border ${insight.containerClass} space-y-2.5 shadow-xl`}>
            <div className="flex justify-between items-center text-xs">
              <span className={`font-bold uppercase tracking-wider text-[10px] ${insight.typeColor}`}>{insight.type}</span>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                isLight ? "bg-white text-slate-800 border-slate-300 shadow-xs" : "bg-black/40 text-gray-200 border-white/10"
              }`}>
                {insight.badge}
              </span>
            </div>
            <h4 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>{insight.title}</h4>
            <p className={`text-xs ${isLight ? "text-slate-700" : "text-gray-300"} leading-relaxed font-sans`}>{insight.desc}</p>
          </div>
        ))}
      </div>

      {/* Suggested 7-Day Study Regimen */}
      <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl p-6 space-y-4`}>
        <h3 className={`text-sm font-black ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-2 border-b ${isLight ? "border-slate-100" : "border-gray-800"} pb-3`}>
          <Sparkles size={16} className={isLight ? "text-purple-600" : "text-purple-400"} />
          <span>AI-Synthesized Personalized Home Study Schedule</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className={`${isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-gray-800"} border p-3.5 rounded-xl space-y-1`}>
            <span className={`${isLight ? "text-purple-700" : "text-purple-400"} font-bold font-mono`}>05:00 PM - 06:15 PM</span>
            <div className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Physics Dynamics Derivations</div>
            <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>High focus window</div>
          </div>
          <div className={`${isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-gray-800"} border p-3.5 rounded-xl space-y-1`}>
            <span className={`${isLight ? "text-sky-700" : "text-sky-400"} font-bold font-mono`}>06:30 PM - 07:30 PM</span>
            <div className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Mathematics Past Papers</div>
            <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>10-Year board question sets</div>
          </div>
          <div className={`${isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-gray-800"} border p-3.5 rounded-xl space-y-1`}>
            <span className={`${isLight ? "text-emerald-700" : "text-emerald-400"} font-bold font-mono`}>08:30 PM - 09:15 PM</span>
            <div className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>English Idioms &amp; Essays</div>
            <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>Vocabulary consolidation</div>
          </div>
          <div className={`${isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-gray-800"} border p-3.5 rounded-xl space-y-1`}>
            <span className={`${isLight ? "text-amber-700" : "text-amber-400"} font-bold font-mono`}>09:15 PM - 09:45 PM</span>
            <div className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Flashcard Recall &amp; Sleep Prep</div>
            <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>Active recall memory booster</div>
          </div>
        </div>
      </div>
    </div>
  );
}
