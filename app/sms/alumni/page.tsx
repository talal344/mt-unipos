"use client";

import React, { useState } from "react";
import { useSMS } from "@/context/sms-context";
import {
  GraduationCap,
  Award,
  Search,
  Building,
  MapPin,
  ExternalLink,
  Users,
  Calendar,
  Sparkles
} from "lucide-react";

export default function SMSAlumniPage() {
  const { theme } = useSMS();
  const isLight = theme === "light";
  const [search, setSearch] = useState("");

  const alumniList = [
    {
      id: "ALM-01",
      name: "Dr. Hamza Bilal",
      gradYear: "Class of 2018",
      university: "King Edward Medical University",
      profession: "Resident Physician / Neurologist",
      location: "Mayo Hospital, Lahore",
      achievement: "Gold Medalist in MBBS Final Professional 2024"
    },
    {
      id: "ALM-02",
      name: "Engr. Fatima Zahra",
      gradYear: "Class of 2020",
      university: "NUST Islamabad",
      profession: "AI Research Engineer",
      location: "Silicon Valley, USA / Remote",
      achievement: "Published IEEE Paper on Computer Vision"
    },
    {
      id: "ALM-03",
      name: "Ali Hassan Qureshi",
      gradYear: "Class of 2019",
      university: "LUMS (Lahore University of Management Sciences)",
      profession: "Investment Banker & Fintech Founder",
      location: "DHA Phase 6, Lahore",
      achievement: "Raised $2M Seed Funding for EdTech Startup"
    }
  ];

  const filteredAlumni = alumniList.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.university.toLowerCase().includes(search.toLowerCase()) ||
      a.profession.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${isLight ? "border-slate-200" : "border-gray-800"} pb-4`}>
        <div>
          <h1 className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-2`}>
            <GraduationCap className={isLight ? "text-amber-600" : "text-amber-400"} size={22} />
            <span>Alumni &amp; Old Students Association Network</span>
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Connect graduated batches, track university admissions, celebrate career achievements, and organize annual reunions.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? "text-slate-400" : "text-gray-500"}`} />
        <input
          type="text"
          placeholder="Search alumni name, university, or profession..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full ${
            isLight
              ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500 shadow-xs"
              : "bg-[#0b121e] border-[#1e293b] text-white placeholder-gray-500 focus:border-amber-500"
          } border pl-9 pr-3 py-2.5 rounded-xl text-xs focus:outline-none`}
        />
      </div>

      {/* Alumni Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredAlumni.map((alm) => (
          <div key={alm.id} className={`${
            isLight ? "bg-white border-slate-200 hover:border-amber-400 shadow-sm" : "bg-[#0b121e] border-[#1e293b] hover:border-amber-500/40 shadow-xl"
          } border rounded-2xl p-5 space-y-3 transition group`}>
            <div className="flex justify-between items-center text-xs">
              <span className={`font-mono font-bold ${
                isLight ? "bg-amber-50 text-amber-800 border-amber-300" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              } border px-2 py-0.5 rounded`}>
                {alm.gradYear}
              </span>
              <span className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-500"} flex items-center gap-1`}>
                <MapPin size={11} /> {alm.location}
              </span>
            </div>

            <h3 className={`text-base font-black ${isLight ? "text-slate-900 group-hover:text-amber-700" : "text-white group-hover:text-amber-300"} transition`}>{alm.name}</h3>

            <div className={`${isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-gray-800"} border p-3 rounded-xl space-y-1 text-xs`}>
              <div><span className={isLight ? "text-slate-500" : "text-gray-500"}>University: </span><b className={isLight ? "text-slate-800" : "text-gray-200"}>{alm.university}</b></div>
              <div><span className={isLight ? "text-slate-500" : "text-gray-500"}>Career: </span><b className={isLight ? "text-emerald-700" : "text-emerald-400"}>{alm.profession}</b></div>
              <div className={`pt-1 text-[11px] ${isLight ? "text-amber-800 font-semibold" : "text-amber-300/90"} italic`}>★ {alm.achievement}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
