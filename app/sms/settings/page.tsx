"use client";

import React, { useState } from "react";
import { useSMS } from "@/context/sms-context";
import {
  Settings,
  Building,
  Award,
  CreditCard,
  Save,
  CheckCircle2,
  Calendar,
  ShieldCheck
} from "lucide-react";

export default function SMSSettingsPage() {
  const { campuses, selectedCampus, sessions, selectedSession } = useSMS();
  const [toastMsg, setToastMsg] = useState("");

  const [schoolInfo, setSchoolInfo] = useState({
    name: "MT CORE MODEL SCHOOL & COLLEGE",
    tagline: "Inspiring Academic Excellence & Moral Leadership",
    board: "BISE Lahore & FBISE Islamabad Affiliated",
    registrationNo: "REG-EDU-2026-9921",
    phone: "042-35789011 / 0339-6399895",
    email: "admissions@mtcoreschool.edu.pk",
    address: "Gulberg III Main Boulevard, Lahore, Pakistan"
  });

  const handleSave = () => {
    setToastMsg("✅ SMS Configuration updated successfully!");
    setTimeout(() => setToastMsg(""), 4000);
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white font-bold text-xs py-3 px-5 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <Settings className="text-sky-400" size={22} />
            <span>School ERP Configuration &amp; Governance</span>
          </h1>
          <p className="text-xs text-gray-400">
            Configure school identity, academic affiliation board, grading scales, and general institutional parameters.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition cursor-pointer"
        >
          <Save size={14} />
          <span>Save Settings</span>
        </button>
      </div>

      {/* School Information */}
      <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-black text-white flex items-center gap-2 border-b border-gray-800 pb-3">
          <Building size={16} className="text-sky-400" />
          <span>Institutional Profile &amp; Print Header</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Official School Name</label>
            <input
              type="text"
              value={schoolInfo.name}
              onChange={(e) => setSchoolInfo({ ...schoolInfo, name: e.target.value })}
              className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Affiliation Board</label>
            <input
              type="text"
              value={schoolInfo.board}
              onChange={(e) => setSchoolInfo({ ...schoolInfo, board: e.target.value })}
              className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Official Registration #</label>
            <input
              type="text"
              value={schoolInfo.registrationNo}
              onChange={(e) => setSchoolInfo({ ...schoolInfo, registrationNo: e.target.value })}
              className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Official Helpline Phone</label>
            <input
              type="text"
              value={schoolInfo.phone}
              onChange={(e) => setSchoolInfo({ ...schoolInfo, phone: e.target.value })}
              className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white"
            />
          </div>
        </div>
      </div>

      {/* Board Grading Scale */}
      <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-black text-white flex items-center gap-2 border-b border-gray-800 pb-3">
          <Award size={16} className="text-amber-400" />
          <span>BISE / FBISE Standard Grading Scale</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
          <div className="bg-black/40 border border-gray-800 p-3 rounded-xl">
            <div className="text-base font-black text-emerald-400">A+ Grade</div>
            <div className="text-[10px] text-gray-400 mt-1">90% — 100%</div>
          </div>
          <div className="bg-black/40 border border-gray-800 p-3 rounded-xl">
            <div className="text-base font-black text-sky-400">A Grade</div>
            <div className="text-[10px] text-gray-400 mt-1">80% — 89%</div>
          </div>
          <div className="bg-black/40 border border-gray-800 p-3 rounded-xl">
            <div className="text-base font-black text-purple-400">B Grade</div>
            <div className="text-[10px] text-gray-400 mt-1">70% — 79%</div>
          </div>
          <div className="bg-black/40 border border-gray-800 p-3 rounded-xl">
            <div className="text-base font-black text-amber-400">C Grade</div>
            <div className="text-[10px] text-gray-400 mt-1">60% — 69%</div>
          </div>
          <div className="bg-black/40 border border-gray-800 p-3 rounded-xl">
            <div className="text-base font-black text-red-400">D / Fail</div>
            <div className="text-[10px] text-gray-400 mt-1">Below 50%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
