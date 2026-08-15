"use client";

import React, { useState } from "react";
import { useSMS, SMSClassSection } from "@/context/sms-context";
import {
  Settings,
  Building2,
  Clock,
  Award,
  Layers,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  X,
  ShieldCheck,
  Save,
  BookOpen,
  DollarSign,
  Calendar,
  Sparkles
} from "lucide-react";

export default function SMSSettingsPage() {
  const {
    campuses,
    selectedCampus,
    setSelectedCampus,
    sessions,
    selectedSession,
    setSelectedSession,
    classes,
    addClassSection,
    updateClassSection,
    deleteClassSection,
    clearAllDemoData
  } = useSMS();

  const [activeTab, setActiveTab] = useState<"classes" | "timetable" | "grading" | "wings" | "general">("classes");
  const [toastMsg, setToastMsg] = useState("");
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);

  // Edit / Add Class Modal State
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [classForm, setClassForm] = useState({
    classId: "C10",
    className: "Class 10 (Science)",
    sectionName: "Section A (Einstein)",
    wing: "Senior Boys Wing",
    roomNumber: "Room 301 (Floor 3)",
    capacity: 35,
    classTeacherName: "Sir Kamran Rafique",
    crBoyName: "Daniyal Tariq",
    grGirlName: "Ayesha Noor"
  });

  // Bell Timings Config State
  const [bellTimings, setBellTimings] = useState([
    { id: "B-1", name: "Morning Assembly & Quran Recitation", start: "07:45 AM", end: "08:00 AM", type: "Assembly" },
    { id: "B-2", name: "Period 01", start: "08:00 AM", end: "08:45 AM", type: "Academic" },
    { id: "B-3", name: "Period 02", start: "08:45 AM", end: "09:30 AM", type: "Academic" },
    { id: "B-4", name: "Period 03", start: "09:30 AM", end: "10:15 AM", type: "Academic" },
    { id: "B-5", name: "Recess / Nutrition Break", start: "10:15 AM", end: "10:45 AM", type: "Break" },
    { id: "B-6", name: "Period 04", start: "10:45 AM", end: "11:30 AM", type: "Academic" },
    { id: "B-7", name: "Period 05", start: "11:30 AM", end: "12:15 PM", type: "Academic" },
    { id: "B-8", name: "Period 06 & Friday Dismissal", start: "12:15 PM", end: "01:00 PM", type: "Academic" }
  ]);

  // Grading Thresholds
  const [gradingScales, setGradingScales] = useState([
    { grade: "A+", minMarks: 90, maxMarks: 100, gpa: "4.0", remarks: "Outstanding / Distinction", color: "text-emerald-400" },
    { grade: "A", minMarks: 80, maxMarks: 89, gpa: "3.7", remarks: "Excellent Mastery", color: "text-sky-400" },
    { grade: "B", minMarks: 70, maxMarks: 79, gpa: "3.0", remarks: "Very Good", color: "text-indigo-400" },
    { grade: "C", minMarks: 60, maxMarks: 69, gpa: "2.0", remarks: "Satisfactory / Pass", color: "text-amber-400" },
    { grade: "D", minMarks: 50, maxMarks: 59, gpa: "1.0", remarks: "Borderline Pass", color: "text-orange-400" },
    { grade: "F", minMarks: 0, maxMarks: 49, gpa: "0.0", remarks: "Fail / Needs Remedial", color: "text-red-400" }
  ]);

  const handleOpenAddClass = () => {
    setEditingClassId(null);
    setClassForm({
      classId: `C${Math.floor(10 + Math.random() * 90)}`,
      className: "",
      sectionName: "",
      wing: "Senior Boys Wing",
      roomNumber: "Room 101",
      capacity: 35,
      classTeacherName: "",
      crBoyName: "",
      grGirlName: ""
    });
    setShowClassModal(true);
  };

  const handleOpenEditClass = (c: SMSClassSection) => {
    setEditingClassId(c.id);
    setClassForm({
      classId: c.classId,
      className: c.className,
      sectionName: c.sectionName,
      wing: c.wing,
      roomNumber: c.roomNumber,
      capacity: c.capacity,
      classTeacherName: c.classTeacherName || "",
      crBoyName: c.crBoyName || "",
      grGirlName: c.grGirlName || ""
    });
    setShowClassModal(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.className || !classForm.sectionName) return;

    if (editingClassId) {
      updateClassSection(editingClassId, classForm);
      setToastMsg(`✅ Class section updated successfully!`);
    } else {
      addClassSection(classForm);
      setToastMsg(`✅ New class section configured!`);
    }
    setShowClassModal(false);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleDeleteClass = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteClassSection(id);
      setToastMsg(`🗑️ Class section removed!`);
      setTimeout(() => setToastMsg(""), 3500);
    }
  };

  return (
    <div className="space-y-6 font-sans">
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
            <span>School ERP Configuration, Hierarchy &amp; Governance Suite</span>
          </h1>
          <p className="text-xs text-gray-400">
            Configure classes, sections, bell timings, grading scales, campus wings, and institutional master policies.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 bg-[#0b121e] border border-[#1e293b] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("classes")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "classes" ? "bg-sky-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Building2 size={13} />
            <span>Classes &amp; Sections</span>
          </button>
          <button
            onClick={() => setActiveTab("timetable")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "timetable" ? "bg-sky-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Clock size={13} />
            <span>Bell Timings Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab("grading")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "grading" ? "bg-sky-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Award size={13} />
            <span>Grading Scales</span>
          </button>
          <button
            onClick={() => setActiveTab("wings")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "wings" ? "bg-sky-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Layers size={13} />
            <span>Campus Wings</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: CLASSES & SECTIONS CONFIGURATION                                       */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "classes" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[#0b121e] border border-[#1e293b] p-4 rounded-2xl">
            <div>
              <h3 className="font-black text-white text-sm">Class Sections &amp; Leadership Roster</h3>
              <p className="text-xs text-gray-400">Configure class rooms, max capacity, class teachers, and elected student CR/GR.</p>
            </div>
            <button
              onClick={handleOpenAddClass}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-600/20 transition cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Class Section</span>
            </button>
          </div>

          <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 font-mono text-[10px] bg-black/40">
                    <th className="p-4 font-bold">Class Name</th>
                    <th className="p-4 font-bold">Section</th>
                    <th className="p-4 font-bold">Campus Wing</th>
                    <th className="p-4 font-bold">Room #</th>
                    <th className="p-4 font-bold">Class Teacher</th>
                    <th className="p-4 font-bold text-sky-400">Boy CR</th>
                    <th className="p-4 font-bold text-pink-400">Girl GR</th>
                    <th className="p-4 font-bold text-center">Capacity</th>
                    <th className="p-4 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50 font-mono text-[11px]">
                  {classes.map((cls) => (
                    <tr key={cls.id} className="hover:bg-white/[0.02] transition">
                      <td className="p-4 font-sans font-black text-white">{cls.className}</td>
                      <td className="p-4 text-sky-300 font-bold">{cls.sectionName}</td>
                      <td className="p-4 font-sans text-gray-400">{cls.wing}</td>
                      <td className="p-4 text-gray-300">{cls.roomNumber}</td>
                      <td className="p-4 font-sans font-bold text-emerald-400">{cls.classTeacherName || "—"}</td>
                      <td className="p-4 font-sans text-sky-300">{cls.crBoyName || "—"}</td>
                      <td className="p-4 font-sans text-pink-300">{cls.grGirlName || "—"}</td>
                      <td className="p-4 text-center font-bold text-white">{cls.capacity} Seats</td>
                      <td className="p-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleOpenEditClass(cls)}
                            className="p-1.5 bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white rounded-lg transition"
                            title="Edit Class Section"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteClass(cls.id, `${cls.className} ${cls.sectionName}`)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition"
                            title="Delete Class Section"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: BELL TIMINGS & MATRIX CONFIG                                           */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "timetable" && (
        <div className="space-y-4">
          <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl p-5 space-y-3">
            <h3 className="font-black text-white text-sm">Institutional Bell Timings &amp; Periods Schedule</h3>
            <p className="text-xs text-gray-400">Configure morning assembly, period durations, and recess breaks.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {bellTimings.map((b) => (
                <div key={b.id} className="bg-black/40 border border-gray-800 p-4 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black text-white">{b.name}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        b.type === "Break"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : b.type === "Assembly"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                          : "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                      }`}
                    >
                      {b.type}
                    </span>
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-400">
                    {b.start} — {b.end}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: GRADING SCALE THRESHOLDS                                               */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "grading" && (
        <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/40">
            <h3 className="font-black text-white text-xs uppercase tracking-wider">
              Official BISE / FBISE Standard Grading Scale
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono">Formula: Percentage = (Obt / Total) * 100</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 font-mono text-[10px] bg-black/20">
                  <th className="p-4 font-bold">Grade Symbol</th>
                  <th className="p-4 font-bold">Marks Percentage Range</th>
                  <th className="p-4 font-bold">GPA Points</th>
                  <th className="p-4 font-bold">Performance Remarks</th>
                  <th className="p-4 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50 font-mono text-xs">
                {gradingScales.map((g) => (
                  <tr key={g.grade} className="hover:bg-white/[0.02] transition">
                    <td className={`p-4 font-black text-base ${g.color}`}>{g.grade}</td>
                    <td className="p-4 font-bold text-white">{g.minMarks}% to {g.maxMarks}%</td>
                    <td className="p-4 text-sky-300 font-bold">{g.gpa}</td>
                    <td className="p-4 font-sans text-gray-300">{g.remarks}</td>
                    <td className="p-4 text-center font-sans">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                        Active Scale
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 4: CAMPUS WINGS & HEADS                                                   */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "wings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {campuses[0]?.wings.map((w) => (
            <div key={w.id} className="bg-[#0b121e] border border-[#1e293b] rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-sky-400 uppercase font-mono">{w.id}</span>
                <span className="text-[10px] bg-sky-500/10 text-sky-300 px-2 py-0.5 rounded font-bold">
                  {w.totalClasses} Classes
                </span>
              </div>
              <h3 className="text-base font-black text-white">{w.name}</h3>
              <div className="text-xs text-gray-400 pt-2 border-t border-gray-800">
                <span className="text-gray-500">Wing Incharge: </span>
                <b className="text-white block mt-0.5">{w.headName}</b>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 5: GENERAL & CLEAN SLATE DATA MANAGEMENT                                 */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "general" && (
        <div className="space-y-6 max-w-3xl">
          <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Building2 className="text-sky-400" size={20} />
              <span>Campus Brand &amp; Affiliation Metadata</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Institution Name</label>
                <input
                  type="text"
                  defaultValue="MT Core Army Public &amp; Model Higher Secondary System"
                  className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">BISE / FBISE Affiliation Code</label>
                <input
                  type="text"
                  defaultValue="BISE-LHR-99824"
                  className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Danger Zone / Clean Slate */}
          <div className="bg-gradient-to-r from-red-950/40 to-[#0b121e] border border-red-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
                ⚠️
              </div>
              <div>
                <h3 className="text-base font-black text-white">Clean Slate: Purge All Demo &amp; Sample Data</h3>
                <p className="text-xs text-gray-400">
                  Wipes all dummy students, sample marks, test fee vouchers, gate visits and OMR grades so you can start with a 100% clean production database.
                </p>
              </div>
            </div>

            {showPurgeConfirm ? (
              <div className="p-4 bg-red-950/70 border border-red-500/50 rounded-xl space-y-3">
                <p className="text-xs font-bold text-red-200">
                  Are you sure you want to delete all sample demo data? This action will reset students, marks, and fees to clean empty states.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      clearAllDemoData();
                      setShowPurgeConfirm(false);
                      setToastMsg("🧹 All demo dummy data has been successfully purged!");
                      setTimeout(() => setToastMsg(""), 4000);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-lg transition"
                  >
                    Yes, Purge All Demo Data
                  </button>
                  <button
                    onClick={() => setShowPurgeConfirm(false)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs rounded-xl transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowPurgeConfirm(true)}
                className="px-4 py-2.5 bg-red-500/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 rounded-xl text-xs font-black transition flex items-center gap-2"
              >
                <span>🧹 Purge All Demo Dummy Data</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* ADD / EDIT CLASS SECTION MODAL                                                */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0b121e] border border-sky-500/40 rounded-3xl w-full max-w-lg shadow-2xl p-6 my-8 animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-4">
              <h3 className="font-black text-white text-sm">
                {editingClassId ? "Edit Class Section & Leadership" : "Configure New Class Section"}
              </h3>
              <button onClick={() => setShowClassModal(false)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Class Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Class 10 (Science)"
                    value={classForm.className}
                    onChange={(e) => setClassForm({ ...classForm, className: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-sky-400 mb-1">Section Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Section A (Einstein)"
                    value={classForm.sectionName}
                    onChange={(e) => setClassForm({ ...classForm, sectionName: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Campus Wing</label>
                  <select
                    value={classForm.wing}
                    onChange={(e) => setClassForm({ ...classForm, wing: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
                  >
                    <option value="Montessori & Early Years">Montessori &amp; Early Years</option>
                    <option value="Junior Girls Wing">Junior Girls Wing</option>
                    <option value="Senior Boys Wing">Senior Boys Wing</option>
                    <option value="College & Higher Secondary">College &amp; Higher Secondary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Room Number</label>
                  <input
                    type="text"
                    placeholder="Room 204"
                    value={classForm.roomNumber}
                    onChange={(e) => setClassForm({ ...classForm, roomNumber: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Class Incharge Teacher</label>
                  <input
                    type="text"
                    placeholder="Sir Shahid Mehmood"
                    value={classForm.classTeacherName}
                    onChange={(e) => setClassForm({ ...classForm, classTeacherName: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Max Capacity (Seats)</label>
                  <input
                    type="number"
                    value={classForm.capacity}
                    onChange={(e) => setClassForm({ ...classForm, capacity: parseInt(e.target.value, 10) || 35 })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-sky-400 mb-1">Appointed Boy CR</label>
                  <input
                    type="text"
                    placeholder="Daniyal Tariq"
                    value={classForm.crBoyName}
                    onChange={(e) => setClassForm({ ...classForm, crBoyName: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-pink-400 mb-1">Appointed Girl GR</label>
                  <input
                    type="text"
                    placeholder="Ayesha Noor"
                    value={classForm.grGirlName}
                    onChange={(e) => setClassForm({ ...classForm, grGirlName: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black uppercase rounded-xl transition text-xs shadow-lg"
              >
                Save Class Section Hierarchy
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
