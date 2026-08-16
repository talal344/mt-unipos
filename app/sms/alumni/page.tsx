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
  Sparkles,
  Plus,
  Trash2,
  X
} from "lucide-react";

interface AlumniRecord {
  id: string;
  name: string;
  gradYear: string;
  university: string;
  profession: string;
  location: string;
  achievement: string;
}

export default function SMSAlumniPage() {
  const { theme } = useSMS();
  const isLight = theme === "light";
  const [search, setSearch] = useState("");

  // Clean empty state by default
  const [alumniList, setAlumniList] = useState<AlumniRecord[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    gradYear: "Class of 2024",
    university: "",
    profession: "",
    location: "Lahore, Pakistan",
    achievement: ""
  });

  const handleAddAlumni = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.university) return;
    const newAlumni: AlumniRecord = {
      id: `ALM-${Date.now()}`,
      ...form
    };
    setAlumniList([newAlumni, ...alumniList]);
    setShowModal(false);
    setForm({
      name: "",
      gradYear: "Class of 2024",
      university: "",
      profession: "",
      location: "Lahore, Pakistan",
      achievement: ""
    });
  };

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

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20 transition cursor-pointer"
        >
          <Plus size={14} />
          <span>Register Alumni Graduate</span>
        </button>
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
      {filteredAlumni.length === 0 ? (
        <div className={`p-12 rounded-2xl border text-center text-xs ${
          isLight ? "bg-white border-slate-200 text-slate-500" : "bg-[#0b121e] border-[#1e293b] text-gray-500"
        }`}>
          <GraduationCap size={32} className="mx-auto mb-2 opacity-40 text-amber-500" />
          <p className="font-bold">No Alumni Records Registered Yet</p>
          <p className="text-[11px] mt-1">Click "+ Register Alumni Graduate" to start building your alumni association network.</p>
        </div>
      ) : (
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
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-500"} flex items-center gap-1`}>
                    <MapPin size={11} /> {alm.location}
                  </span>
                  <button
                    onClick={() => setAlumniList(alumniList.filter((a) => a.id !== alm.id))}
                    className={`${isLight ? "text-slate-400 hover:text-red-600" : "text-gray-500 hover:text-red-400"} cursor-pointer`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <h3 className={`text-base font-black ${isLight ? "text-slate-900 group-hover:text-amber-700" : "text-white group-hover:text-amber-300"} transition`}>{alm.name}</h3>

              <div className={`${isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-gray-800"} border p-3 rounded-xl space-y-1 text-xs`}>
                <div><span className={isLight ? "text-slate-500" : "text-gray-500"}>University: </span><b className={isLight ? "text-slate-800" : "text-gray-200"}>{alm.university}</b></div>
                <div><span className={isLight ? "text-slate-500" : "text-gray-500"}>Career: </span><b className={isLight ? "text-emerald-700" : "text-emerald-400"}>{alm.profession}</b></div>
                {alm.achievement && (
                  <div className={`pt-1 text-[11px] ${isLight ? "text-amber-800 font-semibold" : "text-amber-300/90"} italic`}>★ {alm.achievement}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Register Alumni Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-amber-500/40 text-white"
          } border rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4`}>
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-sm">Register Alumni Graduate</h3>
              <button onClick={() => setShowModal(false)} className="cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddAlumni} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold mb-1">Graduate Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Hamza Bilal"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border p-2 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold mb-1">Graduation Batch</label>
                  <input
                    type="text"
                    placeholder="e.g. Class of 2022"
                    value={form.gradYear}
                    onChange={(e) => setForm({ ...form, gradYear: e.target.value })}
                    className="w-full border p-2 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold mb-1">Current City / Country</label>
                  <input
                    type="text"
                    placeholder="e.g. Lahore / London"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full border p-2 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold mb-1">University / Institute</label>
                <input
                  type="text"
                  placeholder="e.g. King Edward Medical University"
                  value={form.university}
                  onChange={(e) => setForm({ ...form, university: e.target.value })}
                  className="w-full border p-2 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold mb-1">Current Profession / Job</label>
                <input
                  type="text"
                  placeholder="e.g. Resident Physician / Software Engineer"
                  value={form.profession}
                  onChange={(e) => setForm({ ...form, profession: e.target.value })}
                  className="w-full border p-2 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold mb-1">Distinction / Achievement</label>
                <input
                  type="text"
                  placeholder="e.g. Gold Medalist in Final Professional 2024"
                  value={form.achievement}
                  onChange={(e) => setForm({ ...form, achievement: e.target.value })}
                  className="w-full border p-2 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl cursor-pointer"
              >
                Register Alumni
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
