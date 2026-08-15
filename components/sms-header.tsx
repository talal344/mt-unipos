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
  X
} from "lucide-react";

export default function SMSHeader() {
  const { activeRole, campuses, selectedCampus, students } = useSMS();
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
    <header className="h-16 bg-[#080d14]/80 backdrop-blur-md border-b border-[#1e293b] px-6 flex items-center justify-between z-30 sticky top-0 font-sans">
      {/* Left Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Quick search by Student Name, Admission ID, Roll #..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!showSearchModal) setShowSearchModal(true);
            }}
            onFocus={() => setShowSearchModal(true)}
            className="w-full bg-black/50 border border-[#1e293b] pl-9 pr-3 py-2 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 transition"
          />

          {/* Quick Search Dropdown */}
          {showSearchModal && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0e1624] border border-[#1e293b] rounded-2xl shadow-2xl p-3 z-50 animate-fade-in-up max-h-80 overflow-y-auto">
              <div className="flex justify-between items-center pb-2 mb-2 border-b border-gray-800 text-[10px] text-gray-400 font-bold uppercase">
                <span>Matching Students ({filteredStudents.length})</span>
                <button onClick={() => setShowSearchModal(false)} className="text-gray-400 hover:text-white">
                  <X size={12} />
                </button>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="text-center py-4 text-xs text-gray-500">No student record matches "{searchQuery}".</div>
              ) : (
                <div className="space-y-1.5">
                  {filteredStudents.map((st) => (
                    <Link
                      key={st.id}
                      href={`/sms/students?id=${st.id}`}
                      onClick={() => setShowSearchModal(false)}
                      className="flex items-center justify-between p-2 rounded-xl bg-black/40 hover:bg-sky-600/20 border border-gray-800/80 hover:border-sky-500/40 transition group"
                    >
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-sky-300">
                          {st.firstName} {st.lastName}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {st.className} • {st.sectionName} • Roll #{st.rollNo}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-500/20">
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
      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
        <School size={14} />
        <span>{activeCampusObj.name}</span>
      </div>

      {/* Right Quick Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Action: New Admission */}
        <Link
          href="/sms/students?action=new"
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition"
        >
          <PlusCircle size={14} />
          <span>New Admission</span>
        </Link>

        {/* Quick Action: Collect Fee */}
        <Link
          href="/sms/fees?action=collect"
          className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-xs font-bold transition"
        >
          <CreditCard size={14} />
          <span>Fee Counter</span>
        </Link>

        {/* Quick Action: Exam Paper Maker */}
        <Link
          href="/sms/paper-generator"
          className="hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold transition"
        >
          <FileText size={14} />
          <span>Paper Maker</span>
        </Link>

        {/* Notifications */}
        <div className="p-2 rounded-xl bg-black/40 border border-[#1e293b] text-gray-400 hover:text-white cursor-pointer transition relative">
          <Bell size={16} />
          <span className="w-2 h-2 rounded-full bg-sky-400 absolute top-1.5 right-1.5 animate-ping" />
          <span className="w-2 h-2 rounded-full bg-sky-500 absolute top-1.5 right-1.5" />
        </div>

        {/* User Identity Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#1e293b]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-400 flex items-center justify-center font-black text-black text-xs uppercase shadow-sm">
            {activeRole[0]}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-white leading-tight">{activeRole}</div>
            <div className="text-[9px] text-gray-500 font-semibold uppercase">Super Portal</div>
          </div>
        </div>
      </div>
    </header>
  );
}
