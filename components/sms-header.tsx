"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSMS } from "@/context/sms-context";
import {
  Search,
  PlusCircle,
  CreditCard,
  CalendarCheck2,
  FileText,
  Bell,
  Sparkles,
  School,
  Building,
  CheckCircle2,
  X,
  Sun,
  Moon
} from "lucide-react";

export default function SMSHeader() {
  const { activeRole, campuses, selectedCampus, students, theme, toggleTheme } = useSMS();
  const isLight = theme === "light";
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);

  const activeCampusObj = campuses.find((c) => c.id === selectedCampus) || campuses[0];

  const filteredStudents = searchQuery.trim()
    ? students.filter(
        (s) =>
          s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.rollNo.includes(searchQuery) ||
          s.className.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className={`h-16 transition-colors duration-200 ${
      isLight ? "bg-white/95 border-b border-slate-200 text-slate-900 shadow-sm" : "bg-[#080d14]/80 border-b border-[#1e293b] text-white"
    } backdrop-blur-md px-6 flex items-center justify-between z-30 sticky top-0 font-sans`}>
      
      {/* Left Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? "text-slate-400" : "text-gray-500"}`} />
          <input
            type="text"
            placeholder="Quick search by Student Name, Admission ID, Roll #..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!showSearchModal) setShowSearchModal(true);
            }}
            onFocus={() => setShowSearchModal(true)}
            className={`w-full ${
              isLight
                ? "bg-slate-100/90 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-sky-500"
                : "bg-black/50 border border-[#1e293b] text-white placeholder-gray-500 focus:border-sky-500"
            } pl-9 pr-3 py-2 rounded-xl text-xs transition`}
          />

          {/* Quick Search Dropdown */}
          {showSearchModal && searchQuery.trim() && (
            <div className={`absolute top-full left-0 right-0 mt-2 ${
              isLight ? "bg-white border border-slate-200 shadow-2xl text-slate-900" : "bg-[#0e1624] border border-[#1e293b] text-white shadow-2xl"
            } rounded-2xl p-3 z-50 animate-fade-in-up max-h-80 overflow-y-auto`}>
              <div className={`flex justify-between items-center pb-2 mb-2 border-b ${
                isLight ? "border-slate-100 text-slate-500" : "border-gray-800 text-gray-400"
              } text-[10px] font-bold uppercase`}>
                <span>Matching Students ({filteredStudents.length})</span>
                <button onClick={() => setShowSearchModal(false)} className={isLight ? "text-slate-400 hover:text-slate-900" : "text-gray-400 hover:text-white"}>
                  <X size={12} />
                </button>
              </div>

              {filteredStudents.length === 0 ? (
                <div className={`text-center py-4 text-xs ${isLight ? "text-slate-400" : "text-gray-500"}`}>
                  No student record matches "{searchQuery}".
                </div>
              ) : (
                <div className="space-y-1.5">
                  {filteredStudents.map((st) => (
                    <Link
                      key={st.id}
                      href={`/sms/students?id=${st.id}`}
                      onClick={() => setShowSearchModal(false)}
                      className={`flex items-center justify-between p-2 rounded-xl ${
                        isLight ? "bg-slate-50 hover:bg-sky-50 border border-slate-100 hover:border-sky-300" : "bg-black/40 hover:bg-sky-600/20 border border-gray-800/80 hover:border-sky-500/40"
                      } transition group`}
                    >
                      <div>
                        <div className={`text-xs font-bold ${isLight ? "text-slate-900 group-hover:text-sky-700" : "text-white group-hover:text-sky-300"}`}>
                          {st.firstName} {st.lastName}
                        </div>
                        <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                          {st.className} &bull; {st.sectionName} &bull; Roll #{st.rollNo}
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono font-bold ${
                        isLight ? "text-sky-700 bg-sky-100 border border-sky-200" : "text-sky-400 bg-sky-500/10 border border-sky-500/20"
                      } px-2 py-0.5 rounded-lg`}>
                        {st.admissionNo}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center Campus Badge */}
      <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl ${
        isLight ? "bg-sky-50 border border-sky-200 text-sky-700 font-bold" : "bg-sky-500/10 border border-sky-500/20 text-sky-400 font-semibold"
      } text-xs`}>
        <School size={14} />
        <span>{activeCampusObj.name}</span>
      </div>

      {/* Right Quick Actions & Theme Switcher */}
      <div className="flex items-center gap-3">
        
        {/* ☀️ / 🌙 THEME TOGGLE SWITCH */}
        <button
          type="button"
          onClick={toggleTheme}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
            isLight
              ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300"
              : "bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30"
          }`}
          title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {isLight ? (
            <>
              <Moon size={14} className="text-indigo-600 fill-indigo-600" />
              <span className="hidden sm:inline font-bold">Dark Mode</span>
            </>
          ) : (
            <>
              <Sun size={14} className="text-amber-400 fill-amber-400" />
              <span className="hidden sm:inline font-bold">Light Mode</span>
            </>
          )}
        </button>

        {/* Quick Action: New Admission */}
        <Link
          href="/sms/students?action=new"
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:opacity-90 text-white font-bold text-xs shadow-md transition"
        >
          <PlusCircle size={14} />
          <span>New Admission</span>
        </Link>

        {/* Quick Action: Collect Fee */}
        <Link
          href="/sms/fees?action=collect"
          className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl ${
            isLight ? "bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-300" : "bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30"
          } text-xs font-bold transition`}
        >
          <CreditCard size={14} />
          <span>Fee Counter</span>
        </Link>

        {/* Quick Action: Exam Paper Maker */}
        <Link
          href="/sms/paper-generator"
          className={`hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-xl ${
            isLight ? "bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white border border-purple-300" : "bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30"
          } text-xs font-bold transition`}
        >
          <FileText size={14} />
          <span>Paper Maker</span>
        </Link>

        {/* Notifications */}
        <div className={`p-2 rounded-xl ${
          isLight ? "bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900" : "bg-black/40 border border-[#1e293b] text-gray-400 hover:text-white"
        } cursor-pointer transition relative`}>
          <Bell size={16} />
          <span className="w-2 h-2 rounded-full bg-sky-500 absolute top-1.5 right-1.5 animate-ping" />
          <span className="w-2 h-2 rounded-full bg-sky-600 absolute top-1.5 right-1.5" />
        </div>

        {/* User Identity Pill */}
        <div className={`flex items-center gap-2 pl-2 border-l ${isLight ? "border-slate-200" : "border-[#1e293b]"}`}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-black text-white text-xs uppercase shadow-sm">
            {activeRole[0]}
          </div>
          <div className="hidden sm:block text-left">
            <div className={`text-xs font-black leading-tight ${isLight ? "text-slate-900" : "text-white"}`}>{activeRole}</div>
            <div className={`text-[9px] ${isLight ? "text-slate-500" : "text-gray-400"} font-bold uppercase`}>Super Portal</div>
          </div>
        </div>
      </div>
    </header>
  );
}
