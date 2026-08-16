"use client";

import React, { useState } from "react";
import { useSMS, SMSClassSection } from "@/context/sms-context";
import {
  Settings,
  Building2,
  Clock,
  Award,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  X,
  Sparkles,
  RefreshCw,
  School
} from "lucide-react";

export default function SMSSettingsPage() {
  const {
    theme,
    classes,
    campuses,
    selectedCampus,
    bellTimings,
    addBellTiming,
    updateBellTiming,
    deleteBellTiming,
    resetBellTimings,
    addClassSection,
    updateClassSection,
    deleteClassSection,
    addCampusWing,
    deleteCampusWing,
    clearAllDemoData
  } = useSMS();

  const isLight = theme === "light";

  const activeCampus = campuses.find((c) => c.id === selectedCampus) || campuses[0];

  const [activeTab, setActiveTab] = useState<"classes" | "timetable" | "grading" | "wings" | "general">("classes");
  const [toastMsg, setToastMsg] = useState("");
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);

  // Add / Edit Class Modal
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [classForm, setClassForm] = useState({
    classId: "C10",
    className: "",
    sectionName: "",
    wing: "Senior Boys Wing",
    roomNumber: "Room 101",
    capacity: 35,
    classTeacherName: "",
    crBoyName: "",
    grGirlName: ""
  });

  // Add Wing Modal
  const [showWingModal, setShowWingModal] = useState(false);
  const [wingForm, setWingForm] = useState({
    name: "",
    headName: "",
    totalClasses: 4
  });

  // Bell Timings State & Modal
  const [showBellModal, setShowBellModal] = useState(false);
  const [editingBellId, setEditingBellId] = useState<string | null>(null);
  const [bellForm, setBellForm] = useState<{
    name: string;
    start: string;
    end: string;
    type: "Assembly" | "Class" | "Break" | "Prayer" | "Dismissal";
  }>({
    name: "Period 1",
    start: "08:00 AM",
    end: "08:45 AM",
    type: "Class"
  });

  const handleOpenAddBell = () => {
    setEditingBellId(null);
    setBellForm({
      name: `Period ${bellTimings.filter((b) => b.type === "Class").length + 1}`,
      start: "08:00 AM",
      end: "08:45 AM",
      type: "Class"
    });
    setShowBellModal(true);
  };

  const handleOpenEditBell = (b: { id: string | number; name: string; start: string; end: string; type: any }) => {
    setEditingBellId(String(b.id));
    setBellForm({
      name: b.name,
      start: b.start,
      end: b.end,
      type: b.type
    });
    setShowBellModal(true);
  };

  const handleSaveBell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bellForm.name || !bellForm.start || !bellForm.end) return;

    if (editingBellId) {
      updateBellTiming(editingBellId, bellForm);
      setToastMsg(`✅ Period timing "${bellForm.name}" updated!`);
    } else {
      addBellTiming(bellForm);
      setToastMsg(`✅ New bell timing slot "${bellForm.name}" created!`);
    }
    setShowBellModal(false);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleDeleteBell = (id: string | number) => {
    if (confirm("Are you sure you want to remove this timing slot?")) {
      deleteBellTiming(String(id));
      setToastMsg("🗑️ Timing slot removed.");
      setTimeout(() => setToastMsg(""), 3500);
    }
  };

  const handleResetBellDefaults = () => {
    if (confirm("Reset bell timings matrix to standard institutional schedule?")) {
      resetBellTimings();
      setToastMsg("🔄 Bell timings reset to default schedule!");
      setTimeout(() => setToastMsg(""), 3500);
    }
  };

  // Grading Scales
  const gradingScales = [
    { grade: "A+", minMarks: 90, maxMarks: 100, gpa: 4.0, remarks: "Outstanding / Exceptional Merit", color: "text-emerald-400" },
    { grade: "A", minMarks: 80, maxMarks: 89, gpa: 3.7, remarks: "Excellent Scholastic Performance", color: "text-sky-400" },
    { grade: "B", minMarks: 70, maxMarks: 79, gpa: 3.0, remarks: "Very Good Understanding", color: "text-purple-400" },
    { grade: "C", minMarks: 60, maxMarks: 69, gpa: 2.0, remarks: "Satisfactory / Average", color: "text-amber-400" },
    { grade: "D", minMarks: 50, maxMarks: 59, gpa: 1.0, remarks: "Pass / Requires Academic Care", color: "text-orange-400" },
    { grade: "F", minMarks: 0, maxMarks: 49, gpa: 0.0, remarks: "Fail / Remedial Needed", color: "text-red-400" }
  ];

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

  const handleOpenEditClass = (cls: SMSClassSection) => {
    setEditingClassId(cls.id);
    setClassForm({
      classId: cls.classId,
      className: cls.className,
      sectionName: cls.sectionName,
      wing: cls.wing,
      roomNumber: cls.roomNumber,
      capacity: cls.capacity,
      classTeacherName: cls.classTeacherName || "",
      crBoyName: cls.crBoyName || "",
      grGirlName: cls.grGirlName || ""
    });
    setShowClassModal(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.className || !classForm.sectionName) return;

    if (editingClassId) {
      updateClassSection(editingClassId, classForm);
      setToastMsg(`✅ Class section "${classForm.className} ${classForm.sectionName}" updated!`);
    } else {
      addClassSection(classForm);
      setToastMsg(`✅ New class section "${classForm.className} ${classForm.sectionName}" created!`);
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
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${isLight ? "border-slate-200" : "border-gray-800"} pb-4`}>
        <div>
          <h1 className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-2`}>
            <Settings className={isLight ? "text-sky-600" : "text-sky-400"} size={22} />
            <span>School ERP Configuration, Hierarchy &amp; Governance Suite</span>
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Configure classes, sections, bell timings, grading scales, campus wings, and institutional master policies.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className={`flex flex-wrap gap-1 ${isLight ? "bg-slate-100 border-slate-200" : "bg-[#0b121e] border-[#1e293b]"} border p-1 rounded-xl`}>
          <button
            onClick={() => setActiveTab("classes")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "classes"
                ? "bg-sky-600 text-white shadow-sm"
                : isLight
                ? "text-slate-700 hover:text-slate-950"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Building2 size={13} />
            <span>Classes &amp; Sections</span>
          </button>
          <button
            onClick={() => setActiveTab("timetable")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "timetable"
                ? "bg-sky-600 text-white shadow-sm"
                : isLight
                ? "text-slate-700 hover:text-slate-950"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Clock size={13} />
            <span>Bell Timings Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab("grading")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "grading"
                ? "bg-sky-600 text-white shadow-sm"
                : isLight
                ? "text-slate-700 hover:text-slate-950"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Award size={13} />
            <span>Grading Scales</span>
          </button>
          <button
            onClick={() => setActiveTab("wings")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "wings"
                ? "bg-sky-600 text-white shadow-sm"
                : isLight
                ? "text-slate-700 hover:text-slate-950"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Layers size={13} />
            <span>Campus Wings</span>
          </button>
          <button
            onClick={() => setActiveTab("general")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "general"
                ? "bg-sky-600 text-white shadow-sm"
                : isLight
                ? "text-slate-700 hover:text-slate-950"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <School size={13} />
            <span>General &amp; Reset</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: CLASSES & SECTIONS CONFIGURATION                                       */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "classes" && (
        <div className="space-y-4">
          <div className={`flex justify-between items-center ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border p-4 rounded-2xl`}>
            <div>
              <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>Class Sections &amp; Leadership Roster</h3>
              <p className={`text-xs ${isLight ? "text-slate-600" : "text-gray-400"}`}>Configure class rooms, max capacity, class teachers, and elected student CR/GR.</p>
            </div>
            <button
              onClick={handleOpenAddClass}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-600/20 transition cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Class Section</span>
            </button>
          </div>

          <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl overflow-hidden shadow-2xl`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b ${isLight ? "border-slate-200 text-slate-600 bg-slate-100/70" : "border-gray-800 text-gray-400 bg-black/40"} font-mono text-[10px]`}>
                    <th className="p-4 font-bold">Class Name</th>
                    <th className="p-4 font-bold">Section</th>
                    <th className="p-4 font-bold">Campus Wing</th>
                    <th className="p-4 font-bold">Room #</th>
                    <th className="p-4 font-bold">Class Teacher</th>
                    <th className={`p-4 font-bold ${isLight ? "text-sky-700 font-bold" : "text-sky-400"}`}>Boy CR</th>
                    <th className={`p-4 font-bold ${isLight ? "text-pink-700 font-bold" : "text-pink-400"}`}>Girl GR</th>
                    <th className="p-4 font-bold text-center">Capacity</th>
                    <th className="p-4 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? "divide-slate-100" : "divide-gray-800/50"} font-mono text-[11px]`}>
                  {classes.map((cls) => (
                    <tr key={cls.id} className={`${isLight ? "hover:bg-slate-50/80" : "hover:bg-white/[0.02]"} transition`}>
                      <td className={`p-4 font-sans font-black ${isLight ? "text-slate-900" : "text-white"}`}>{cls.className}</td>
                      <td className={`p-4 ${isLight ? "text-sky-700 font-bold" : "text-sky-300 font-bold"}`}>{cls.sectionName}</td>
                      <td className={`p-4 font-sans ${isLight ? "text-slate-600" : "text-gray-400"}`}>{cls.wing}</td>
                      <td className={`p-4 ${isLight ? "text-slate-700" : "text-gray-300"}`}>{cls.roomNumber}</td>
                      <td className={`p-4 font-sans font-bold ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>{cls.classTeacherName || "—"}</td>
                      <td className={`p-4 font-sans ${isLight ? "text-sky-700" : "text-sky-300"}`}>{cls.crBoyName || "—"}</td>
                      <td className={`p-4 font-sans ${isLight ? "text-pink-700" : "text-pink-300"}`}>{cls.grGirlName || "—"}</td>
                      <td className={`p-4 text-center font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{cls.capacity} Seats</td>
                      <td className="p-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleOpenEditClass(cls)}
                            className={`p-1.5 ${
                              isLight ? "bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white border border-sky-200" : "bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white"
                            } rounded-lg transition cursor-pointer`}
                            title="Edit Class Section"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteClass(cls.id, `${cls.className} ${cls.sectionName}`)}
                            className={`p-1.5 ${
                              isLight ? "bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200" : "bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white"
                            } rounded-lg transition cursor-pointer`}
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
          <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl p-5 space-y-4`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-gray-800 pb-3">
              <div>
                <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>Institutional Bell Timings &amp; Periods Schedule</h3>
                <p className={`text-xs ${isLight ? "text-slate-600" : "text-gray-400"}`}>
                  Configure morning assembly, period durations, recess breaks, and dismissal timings. Changes sync live with Class Timetable.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetBellDefaults}
                  className={`px-3 py-1.5 rounded-xl border ${
                    isLight ? "border-slate-300 text-slate-700 hover:bg-slate-100" : "border-gray-700 text-gray-300 hover:bg-gray-800"
                  } font-bold text-xs transition cursor-pointer`}
                >
                  Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddBell}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Period Slot</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pt-1">
              {bellTimings.map((b) => (
                <div
                  key={b.id}
                  className={`${
                    isLight ? "bg-slate-50 border-slate-200 hover:border-slate-300 shadow-xs" : "bg-black/40 border-gray-800 hover:border-gray-700"
                  } border p-4 rounded-2xl space-y-2 relative group transition`}
                >
                  <div className="flex justify-between items-start text-xs">
                    <span className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>{b.name}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                        b.type === "Break"
                          ? isLight ? "bg-amber-50 text-amber-800 border border-amber-300" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : b.type === "Assembly"
                          ? isLight ? "bg-purple-50 text-purple-800 border border-purple-300" : "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                          : b.type === "Prayer"
                          ? isLight ? "bg-teal-50 text-teal-800 border border-teal-300" : "bg-teal-500/10 text-teal-400 border border-teal-500/30"
                          : isLight ? "bg-sky-50 text-sky-800 border border-sky-300" : "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                      }`}
                    >
                      {b.type}
                    </span>
                  </div>

                  <div className={`text-sm font-mono font-black ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>
                    {b.start} — {b.end}
                  </div>

                  <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-200/60 dark:border-gray-800/80">
                    <button
                      type="button"
                      onClick={() => handleOpenEditBell(b)}
                      className={`p-1.5 rounded-lg ${
                        isLight ? "hover:bg-slate-200 text-slate-600" : "hover:bg-gray-800 text-gray-300"
                      } transition cursor-pointer`}
                      title="Edit Period Timing"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBell(b.id)}
                      className={`p-1.5 rounded-lg ${
                        isLight ? "hover:bg-red-50 text-slate-400 hover:text-red-600" : "hover:bg-red-500/20 text-gray-500 hover:text-red-400"
                      } transition cursor-pointer`}
                      title="Delete Period Timing"
                    >
                      <Trash2 size={12} />
                    </button>
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
        <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl overflow-hidden shadow-2xl`}>
          <div className={`p-4 border-b ${isLight ? "border-slate-100 bg-slate-50/80" : "border-gray-800 bg-black/40"} flex justify-between items-center`}>
            <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-xs uppercase tracking-wider`}>
              Official BISE / FBISE Standard Grading Scale
            </h3>
            <span className={`text-[10px] ${isLight ? "text-emerald-700 font-bold" : "text-emerald-400"} font-mono`}>Formula: Percentage = (Obt / Total) * 100</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b ${isLight ? "border-slate-200 text-slate-600 bg-slate-100/70" : "border-gray-800 text-gray-400 bg-black/20"} font-mono text-[10px]`}>
                  <th className="p-4 font-bold">Grade Symbol</th>
                  <th className="p-4 font-bold">Marks Percentage Range</th>
                  <th className="p-4 font-bold">GPA Points</th>
                  <th className="p-4 font-bold">Performance Remarks</th>
                  <th className="p-4 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? "divide-slate-100" : "divide-gray-800/50"} font-mono text-xs`}>
                {gradingScales.map((g) => (
                  <tr key={g.grade} className={`${isLight ? "hover:bg-slate-50/80" : "hover:bg-white/[0.02]"} transition`}>
                    <td className={`p-4 font-black text-base ${isLight ? "text-slate-950" : g.color}`}>{g.grade}</td>
                    <td className={`p-4 font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{g.minMarks}% to {g.maxMarks}%</td>
                    <td className={`p-4 font-bold ${isLight ? "text-sky-700" : "text-sky-300"}`}>{g.gpa}</td>
                    <td className={`p-4 font-sans ${isLight ? "text-slate-700" : "text-gray-300"}`}>{g.remarks}</td>
                    <td className="p-4 text-center font-sans">
                      <span className={`${
                        isLight ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      } border px-2 py-0.5 rounded text-[10px] font-bold`}>
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
        <div className="space-y-4">
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"
          } border p-4 rounded-2xl`}>
            <div>
              <h3 className={`text-sm font-black ${isLight ? "text-slate-900" : "text-white"}`}>Campus Wings &amp; Sub-School Hierarchy</h3>
              <p className={`text-xs ${isLight ? "text-slate-600" : "text-gray-400"}`}>
                Manage academic wings, appointed Wing Incharge Heads, and class quotas for {activeCampus?.name}.
              </p>
            </div>
            <button
              onClick={() => {
                setWingForm({ name: "", headName: "", totalClasses: 4 });
                setShowWingModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg transition cursor-pointer"
            >
              <Plus size={14} />
              <span>Add New Campus Wing</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeCampus?.wings.map((w) => (
              <div key={w.id} className={`${
                isLight ? "bg-white border-slate-200 shadow-sm hover:border-sky-400" : "bg-[#0b121e] border-[#1e293b] hover:border-sky-500/40"
              } border rounded-2xl p-5 space-y-3 relative group shadow-lg transition`}>
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-bold ${isLight ? "text-sky-700" : "text-sky-400"} uppercase font-mono`}>{w.id}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] ${
                      isLight ? "bg-sky-50 text-sky-700 border border-sky-300" : "bg-sky-500/10 text-sky-300"
                    } px-2 py-0.5 rounded font-bold`}>
                      {w.totalClasses} Classes
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete Campus Wing "${w.name}"?`)) {
                          deleteCampusWing(activeCampus.id, w.id);
                          setToastMsg(`🗑️ Campus Wing "${w.name}" deleted successfully.`);
                          setTimeout(() => setToastMsg(""), 3500);
                        }
                      }}
                      className={`p-1.5 ${
                        isLight ? "bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200" : "bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white"
                      } rounded-lg transition cursor-pointer`}
                      title="Delete Campus Wing"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <h3 className={`text-base font-black ${isLight ? "text-slate-900" : "text-white"}`}>{w.name}</h3>
                <div className={`text-xs ${isLight ? "text-slate-600 border-slate-100" : "text-gray-400 border-gray-800"} pt-2 border-t`}>
                  <span className={isLight ? "text-slate-500" : "text-gray-500"}>Wing Incharge: </span>
                  <b className={`${isLight ? "text-slate-900" : "text-white"} block mt-0.5`}>{w.headName}</b>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 5: GENERAL & CLEAN SLATE DATA MANAGEMENT                                 */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "general" && (
        <div className="space-y-6 max-w-3xl">
          <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl p-6 space-y-4`}>
            <h3 className={`text-base font-black ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-2`}>
              <Building2 className={isLight ? "text-sky-600" : "text-sky-400"} size={20} />
              <span>Campus Brand &amp; Affiliation Metadata</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Institution Name</label>
                <input
                  type="text"
                  defaultValue="MT Core Army Public & Model Higher Secondary System"
                  className={`w-full ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                  } border p-2.5 rounded-xl font-bold`}
                />
              </div>
              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>BISE / FBISE Affiliation Code</label>
                <input
                  type="text"
                  defaultValue="BISE-LHR-99824"
                  className={`w-full ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                  } border p-2.5 rounded-xl font-mono`}
                />
              </div>
            </div>
          </div>

          {/* Danger Zone / Clean Slate */}
          <div className={`${
            isLight ? "bg-red-50/70 border-red-200 shadow-sm" : "bg-gradient-to-r from-red-950/40 to-[#0b121e] border-red-500/30"
          } border rounded-2xl p-6 space-y-4`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center font-bold">
                ⚠️
              </div>
              <div>
                <h3 className={`text-base font-black ${isLight ? "text-slate-950" : "text-white"}`}>Clean Slate: Purge All Demo &amp; Sample Data</h3>
                <p className={`text-xs ${isLight ? "text-slate-600" : "text-gray-400"}`}>
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
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-lg transition cursor-pointer"
                  >
                    Yes, Purge All Demo Data
                  </button>
                  <button
                    onClick={() => setShowPurgeConfirm(false)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowPurgeConfirm(true)}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-xs transition flex items-center gap-2 cursor-pointer shadow-md"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-sky-500/40 text-white"
          } border rounded-3xl w-full max-w-lg shadow-2xl p-6 my-8 animate-fade-in-up`}>
            <div className={`flex justify-between items-center border-b ${isLight ? "border-slate-100" : "border-gray-800"} pb-3 mb-4`}>
              <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>
                {editingClassId ? "Edit Class Section & Leadership" : "Configure New Class Section"}
              </h3>
              <button onClick={() => setShowClassModal(false)} className={`${isLight ? "text-slate-400 hover:text-slate-800" : "text-gray-400 hover:text-white"} cursor-pointer`}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Class Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Class 10 (Science)"
                    value={classForm.className}
                    onChange={(e) => setClassForm({ ...classForm, className: e.target.value })}
                    className={`w-full ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                    } border p-2.5 rounded-xl font-bold`}
                  />
                </div>
                <div>
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-sky-700 font-bold" : "text-sky-400"} mb-1`}>Section Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Section A (Einstein)"
                    value={classForm.sectionName}
                    onChange={(e) => setClassForm({ ...classForm, sectionName: e.target.value })}
                    className={`w-full ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                    } border p-2.5 rounded-xl font-bold`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Campus Wing</label>
                  <select
                    value={classForm.wing}
                    onChange={(e) => setClassForm({ ...classForm, wing: e.target.value })}
                    className={`w-full ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                    } border p-2.5 rounded-xl font-bold`}
                  >
                    <option value="Montessori & Early Years">Montessori &amp; Early Years</option>
                    <option value="Junior Girls Wing">Junior Girls Wing</option>
                    <option value="Senior Boys Wing">Senior Boys Wing</option>
                    <option value="College & Higher Secondary">College &amp; Higher Secondary</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Room Number</label>
                  <input
                    type="text"
                    placeholder="Room 204"
                    value={classForm.roomNumber}
                    onChange={(e) => setClassForm({ ...classForm, roomNumber: e.target.value })}
                    className={`w-full ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                    } border p-2.5 rounded-xl`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-emerald-700 font-bold" : "text-emerald-400"} mb-1`}>Class Incharge Teacher</label>
                  <input
                    type="text"
                    placeholder="Sir Shahid Mehmood"
                    value={classForm.classTeacherName}
                    onChange={(e) => setClassForm({ ...classForm, classTeacherName: e.target.value })}
                    className={`w-full ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                    } border p-2.5 rounded-xl font-bold`}
                  />
                </div>
                <div>
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Max Capacity (Seats)</label>
                  <input
                    type="number"
                    value={classForm.capacity}
                    onChange={(e) => setClassForm({ ...classForm, capacity: parseInt(e.target.value, 10) || 35 })}
                    className={`w-full ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                    } border p-2.5 rounded-xl font-bold`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-sky-700 font-bold" : "text-sky-400"} mb-1`}>Appointed Boy CR</label>
                  <input
                    type="text"
                    placeholder="Daniyal Tariq"
                    value={classForm.crBoyName}
                    onChange={(e) => setClassForm({ ...classForm, crBoyName: e.target.value })}
                    className={`w-full ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                    } border p-2.5 rounded-xl`}
                  />
                </div>
                <div>
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-pink-700 font-bold" : "text-pink-400"} mb-1`}>Appointed Girl GR</label>
                  <input
                    type="text"
                    placeholder="Ayesha Noor"
                    value={classForm.grGirlName}
                    onChange={(e) => setClassForm({ ...classForm, grGirlName: e.target.value })}
                    className={`w-full ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                    } border p-2.5 rounded-xl`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black uppercase rounded-xl transition text-xs shadow-lg cursor-pointer"
              >
                Save Class Section Hierarchy
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* ADD CAMPUS WING MODAL                                                         */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {showWingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-sky-500/40 text-white"
          } border rounded-3xl w-full max-w-md shadow-2xl p-6 animate-fade-in-up`}>
            <div className={`flex justify-between items-center border-b ${isLight ? "border-slate-100" : "border-gray-800"} pb-3 mb-4`}>
              <div className="flex items-center gap-2">
                <Layers size={18} className={isLight ? "text-sky-600" : "text-sky-400"} />
                <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>Add New Campus Wing</h3>
              </div>
              <button onClick={() => setShowWingModal(false)} className={`${isLight ? "text-slate-400 hover:text-slate-800" : "text-gray-400 hover:text-white"} cursor-pointer`}>
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!wingForm.name.trim()) return;
                addCampusWing(activeCampus.id, {
                  name: wingForm.name.trim(),
                  headName: wingForm.headName.trim() || "Wing Incharge Head",
                  totalClasses: wingForm.totalClasses || 4
                });
                setShowWingModal(false);
                setToastMsg(`✅ Campus Wing "${wingForm.name}" added successfully!`);
                setTimeout(() => setToastMsg(""), 3500);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Campus Wing Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Primary Boys Wing, Cambridge O-Levels"
                  value={wingForm.name}
                  onChange={(e) => setWingForm({ ...wingForm, name: e.target.value })}
                  className={`w-full ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                  } border p-2.5 rounded-xl font-bold`}
                />
              </div>

              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Appointed Wing Incharge / Head</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sir Kashif Mehmood, Mrs. Naila Shah"
                  value={wingForm.headName}
                  onChange={(e) => setWingForm({ ...wingForm, headName: e.target.value })}
                  className={`w-full ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                  } border p-2.5 rounded-xl font-bold`}
                />
              </div>

              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Assigned Classes Quota</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={wingForm.totalClasses}
                  onChange={(e) => setWingForm({ ...wingForm, totalClasses: parseInt(e.target.value, 10) || 4 })}
                  className={`w-full ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                  } border p-2.5 rounded-xl font-bold`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black uppercase rounded-xl transition text-xs shadow-lg cursor-pointer"
              >
                Create Campus Wing
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bell Timing Slot Add/Edit Modal */}
      {showBellModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-sky-500/40 text-white"
          } border rounded-3xl w-full max-w-md shadow-2xl p-6 animate-fade-in-up space-y-4`}>
            <div className={`flex justify-between items-center border-b ${isLight ? "border-slate-100" : "border-gray-800"} pb-3`}>
              <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm flex items-center gap-2`}>
                <Clock size={16} className="text-sky-600" />
                <span>{editingBellId ? "Edit Period Timing Slot" : "Add Institutional Period Slot"}</span>
              </h3>
              <button onClick={() => setShowBellModal(false)} className={`${isLight ? "text-slate-400 hover:text-slate-800" : "text-gray-400 hover:text-white"} cursor-pointer`}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveBell} className="space-y-4 text-xs">
              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>
                  Period Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Period 1, Morning Assembly, Recess Break"
                  value={bellForm.name}
                  onChange={(e) => setBellForm({ ...bellForm, name: e.target.value })}
                  className={`w-full ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                  } border p-2.5 rounded-xl font-bold focus:outline-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>
                    Start Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="08:00 AM"
                    value={bellForm.start}
                    onChange={(e) => setBellForm({ ...bellForm, start: e.target.value })}
                    className={`w-full ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                    } border p-2.5 rounded-xl font-bold font-mono focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>
                    End Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="08:45 AM"
                    value={bellForm.end}
                    onChange={(e) => setBellForm({ ...bellForm, end: e.target.value })}
                    className={`w-full ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                    } border p-2.5 rounded-xl font-bold font-mono focus:outline-none`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>
                  Slot Category / Type
                </label>
                <select
                  value={bellForm.type}
                  onChange={(e) => setBellForm({ ...bellForm, type: e.target.value as any })}
                  className={`w-full ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                  } border p-2.5 rounded-xl font-bold focus:outline-none`}
                >
                  <option value="Class">Class Academic Period</option>
                  <option value="Assembly">Morning Assembly</option>
                  <option value="Break">Recess / Lunch Break</option>
                  <option value="Prayer">Zuhr / Prayer Break</option>
                  <option value="Dismissal">Dismissal / Pack-Up</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black uppercase rounded-xl transition text-xs shadow-lg cursor-pointer"
              >
                Save Period Timing Slot
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
