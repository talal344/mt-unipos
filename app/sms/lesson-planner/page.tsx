"use client";

import React, { useState } from "react";
import { useSMS } from "@/context/sms-context";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Sparkles,
  Target,
  Layers,
  GraduationCap,
  X,
  Trash2
} from "lucide-react";

interface SyllabusUnit {
  id: string;
  unitNo: string;
  title: string;
  chapters: number;
  progressPct: number;
  status: "Completed" | "In Progress" | "Pending";
  teacher: string;
  completionDate: string;
}

interface WeeklyLessonPlan {
  id: string;
  week: string;
  topic: string;
  objectives: string;
  activities: string;
  homework: string;
}

export default function SMSLessonPlannerPage() {
  const { theme, classes, teachers } = useSMS();
  const isLight = theme === "light";

  const [selectedClass, setSelectedClass] = useState(classes[0]?.className || "Class 9 (Science)");
  const [selectedSubject, setSelectedSubject] = useState("Physics");

  // Dynamic state (Clean / Empty by default)
  const [syllabusUnits, setSyllabusUnits] = useState<SyllabusUnit[]>([]);
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyLessonPlan[]>([]);

  // Modals
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);

  const [unitForm, setUnitForm] = useState({
    unitNo: "Unit 1",
    title: "",
    chapters: 4,
    progressPct: 0,
    status: "In Progress" as SyllabusUnit["status"],
    teacher: teachers[0]?.fullName || "Subject Faculty",
    completionDate: new Date().toISOString().split("T")[0]
  });

  const [planForm, setPlanForm] = useState({
    week: "Week 1",
    topic: "",
    objectives: "",
    activities: "",
    homework: ""
  });

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitForm.title) return;
    const newUnit: SyllabusUnit = {
      id: `UNT-${Date.now()}`,
      ...unitForm
    };
    setSyllabusUnits([...syllabusUnits, newUnit]);
    setShowUnitModal(false);
    setUnitForm({
      unitNo: `Unit ${syllabusUnits.length + 2}`,
      title: "",
      chapters: 4,
      progressPct: 0,
      status: "In Progress",
      teacher: teachers[0]?.fullName || "Subject Faculty",
      completionDate: new Date().toISOString().split("T")[0]
    });
  };

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.topic) return;
    const newPlan: WeeklyLessonPlan = {
      id: `PLN-${Date.now()}`,
      ...planForm
    };
    setWeeklyPlans([...weeklyPlans, newPlan]);
    setShowPlanModal(false);
    setPlanForm({
      week: `Week ${weeklyPlans.length + 2}`,
      topic: "",
      objectives: "",
      activities: "",
      homework: ""
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${isLight ? "border-slate-200" : "border-gray-800"} pb-4`}>
        <div>
          <h1 className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-2`}>
            <Target className={isLight ? "text-emerald-600" : "text-emerald-400"} size={22} />
            <span>Master Lesson Planner &amp; Syllabus Progress Tracker</span>
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Track unit-wise curriculum milestones, learning objectives, lab demonstrations, and board syllabus completion rates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowUnitModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Syllabus Unit</span>
          </button>

          <button
            onClick={() => setShowPlanModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/20 transition cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Weekly Plan</span>
          </button>
        </div>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
        <div>
          <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Select Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className={`w-full ${
              isLight ? "bg-white border-slate-200 text-slate-900 shadow-xs" : "bg-[#0b121e] border-[#1e293b] text-white"
            } border p-2.5 rounded-xl font-bold text-xs focus:outline-none focus:border-emerald-500`}
          >
            {classes.length === 0 ? (
              <option value="">No Classes Enrolled Yet</option>
            ) : (
              classes.map((c) => (
                <option key={c.id} value={c.className}>
                  {c.className} ({c.sectionName})
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-emerald-700 font-bold" : "text-emerald-400"} mb-1`}>Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className={`w-full ${
              isLight ? "bg-white border-slate-200 text-slate-900 shadow-xs" : "bg-[#0b121e] border-[#1e293b] text-white"
            } border p-2.5 rounded-xl font-bold text-xs focus:outline-none focus:border-emerald-500`}
          >
            <option value="Physics">Physics</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
            <option value="English">English</option>
            <option value="Computer Science">Computer Science</option>
          </select>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Syllabus Units Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className={`text-xs uppercase font-bold ${isLight ? "text-emerald-700 font-bold" : "text-emerald-400"} tracking-wider`}>
              Curriculum Units &amp; Milestones ({syllabusUnits.length})
            </h3>
          </div>

          {syllabusUnits.length === 0 ? (
            <div className={`p-8 rounded-2xl border text-center text-xs ${
              isLight ? "bg-white border-slate-200 text-slate-500" : "bg-[#0b121e] border-[#1e293b] text-gray-500"
            }`}>
              <Target size={28} className="mx-auto mb-2 opacity-40 text-emerald-500" />
              <p className="font-bold">No Syllabus Units Added</p>
              <p className="text-[11px] mt-1">Click "+ Add Syllabus Unit" to plan the curriculum milestones for this class.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {syllabusUnits.map((u, i) => (
                <div key={u.id || i} className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border p-5 rounded-2xl space-y-3 shadow-xl`}>
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-bold ${isLight ? "text-sky-700" : "text-sky-400"} font-mono`}>{u.unitNo}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                          u.progressPct === 100
                            ? isLight
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : u.progressPct > 0
                            ? isLight
                              ? "bg-amber-50 text-amber-700 border border-amber-300"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            : isLight
                            ? "bg-slate-100 text-slate-600"
                            : "bg-gray-800 text-gray-400"
                        }`}
                      >
                        {u.status}
                      </span>
                      <button
                        onClick={() => setSyllabusUnits(syllabusUnits.filter((item) => item.id !== u.id))}
                        className={`${isLight ? "text-slate-400 hover:text-red-600" : "text-gray-500 hover:text-red-400"} cursor-pointer`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <h4 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>{u.title}</h4>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className={`flex justify-between text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"} font-mono`}>
                      <span>{u.chapters} Key Topics</span>
                      <span>{u.progressPct}%</span>
                    </div>
                    <div className={`w-full h-2 ${isLight ? "bg-slate-100 border border-slate-200" : "bg-black/60 border border-gray-800"} rounded-full overflow-hidden`}>
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                        style={{ width: `${u.progressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className={`flex justify-between text-[10px] ${isLight ? "text-slate-500 border-slate-100" : "text-gray-500 border-gray-800"} pt-1 border-t`}>
                    <span>Instructor: <b className={isLight ? "text-slate-800" : "text-gray-300"}>{u.teacher}</b></span>
                    <span>{u.completionDate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weekly Lesson Plans */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className={`text-xs uppercase font-bold ${isLight ? "text-sky-700 font-bold" : "text-sky-400"} tracking-wider`}>
              Weekly Lesson Plans &amp; Lab Activities ({weeklyPlans.length})
            </h3>
          </div>

          {weeklyPlans.length === 0 ? (
            <div className={`p-8 rounded-2xl border text-center text-xs ${
              isLight ? "bg-white border-slate-200 text-slate-500" : "bg-[#0b121e] border-[#1e293b] text-gray-500"
            }`}>
              <BookOpen size={28} className="mx-auto mb-2 opacity-40 text-sky-500" />
              <p className="font-bold">No Weekly Lesson Plans Added</p>
              <p className="text-[11px] mt-1">Click "+ Add Weekly Plan" to document learning objectives &amp; lab activities.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {weeklyPlans.map((w, i) => (
                <div key={w.id || i} className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border p-5 rounded-2xl space-y-3 shadow-xl`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-black ${isLight ? "text-sky-700" : "text-sky-400"}`}>{w.week}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold ${isLight ? "bg-sky-50 text-sky-700 border-sky-300" : "bg-sky-500/10 text-sky-400 border-sky-500/30"} border px-2 py-0.5 rounded`}>
                        Approved Plan
                      </span>
                      <button
                        onClick={() => setWeeklyPlans(weeklyPlans.filter((item) => item.id !== w.id))}
                        className={`${isLight ? "text-slate-400 hover:text-red-600" : "text-gray-500 hover:text-red-400"} cursor-pointer`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <h4 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>{w.topic}</h4>

                  <div className={`space-y-2 text-xs border-t ${isLight ? "border-slate-100" : "border-gray-800/80"} pt-2`}>
                    <div>
                      <span className={`text-[9px] uppercase font-bold ${isLight ? "text-slate-400" : "text-gray-500"} block`}>Learning Objectives</span>
                      <p className={isLight ? "text-slate-700" : "text-gray-300"}>{w.objectives}</p>
                    </div>

                    {w.activities && (
                      <div>
                        <span className={`text-[9px] uppercase font-bold ${isLight ? "text-emerald-600" : "text-emerald-400"} block`}>Lab &amp; Practical Activity</span>
                        <p className={isLight ? "text-slate-700" : "text-gray-300"}>{w.activities}</p>
                      </div>
                    )}

                    {w.homework && (
                      <div>
                        <span className={`text-[9px] uppercase font-bold ${isLight ? "text-purple-600" : "text-purple-400"} block`}>Homework Assignment</span>
                        <p className={isLight ? "text-slate-700" : "text-gray-300"}>{w.homework}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Unit Modal */}
      {showUnitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-emerald-500/40 text-white"
          } border rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4`}>
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-sm">Add Curriculum Syllabus Unit</h3>
              <button onClick={() => setShowUnitModal(false)} className="cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddUnit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold mb-1">Unit Number</label>
                <input
                  type="text"
                  value={unitForm.unitNo}
                  onChange={(e) => setUnitForm({ ...unitForm, unitNo: e.target.value })}
                  className="w-full border p-2 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold mb-1">Unit Title</label>
                <input
                  type="text"
                  placeholder="e.g. Kinematics & Equations of Motion"
                  value={unitForm.title}
                  onChange={(e) => setUnitForm({ ...unitForm, title: e.target.value })}
                  className="w-full border p-2 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold mb-1">Key Topics</label>
                  <input
                    type="number"
                    min={1}
                    value={unitForm.chapters}
                    onChange={(e) => setUnitForm({ ...unitForm, chapters: parseInt(e.target.value, 10) || 1 })}
                    className="w-full border p-2 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold mb-1">Completion Target</label>
                  <input
                    type="date"
                    value={unitForm.completionDate}
                    onChange={(e) => setUnitForm({ ...unitForm, completionDate: e.target.value })}
                    className="w-full border p-2 rounded-xl"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer"
              >
                Save Syllabus Unit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-sky-500/40 text-white"
          } border rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4`}>
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-sm">Add Weekly Lesson Plan</h3>
              <button onClick={() => setShowPlanModal(false)} className="cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddPlan} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold mb-1">Week Title</label>
                <input
                  type="text"
                  placeholder="e.g. Week 1 (Sep 01 - Sep 06)"
                  value={planForm.week}
                  onChange={(e) => setPlanForm({ ...planForm, week: e.target.value })}
                  className="w-full border p-2 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold mb-1">Topic / Lesson Name</label>
                <input
                  type="text"
                  placeholder="e.g. Newton's 2nd Law of Motion"
                  value={planForm.topic}
                  onChange={(e) => setPlanForm({ ...planForm, topic: e.target.value })}
                  className="w-full border p-2 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold mb-1">Learning Objectives</label>
                <textarea
                  rows={2}
                  placeholder="State learning objectives..."
                  value={planForm.objectives}
                  onChange={(e) => setPlanForm({ ...planForm, objectives: e.target.value })}
                  className="w-full border p-2 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold mb-1">Homework</label>
                <input
                  type="text"
                  placeholder="e.g. Solve exercise questions 1-5"
                  value={planForm.homework}
                  onChange={(e) => setPlanForm({ ...planForm, homework: e.target.value })}
                  className="w-full border p-2 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl cursor-pointer"
              >
                Save Lesson Plan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
