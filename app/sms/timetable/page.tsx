"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSMS, TimetablePeriod, SMSBellTiming } from "@/context/sms-context";
import {
  Clock,
  Plus,
  UserCheck,
  Building,
  Sparkles,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Trash2,
  Edit2,
  Settings,
  BookOpen,
  GraduationCap,
  X,
  Check,
  Coffee,
  Sun
} from "lucide-react";

export default function SMSTimetablePage() {
  const {
    theme,
    classes,
    classSubjects,
    teachers,
    bellTimings,
    timetable,
    addTimetablePeriod,
    updateTimetablePeriod,
    deleteTimetablePeriod
  } = useSMS();

  const isLight = theme === "light";

  // Class Selection
  const defaultClass = classes[0] ? `${classes[0].className} (${classes[0].sectionName})` : "One (A)";
  const [selectedClassKey, setSelectedClassKey] = useState<string>(defaultClass);
  const [selectedDay, setSelectedDay] = useState<"Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday">("Monday");
  const [toastMsg, setToastMsg] = useState("");

  // Modals
  const [substituteModal, setSubstituteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);

  // Parse selected class and section
  const { currentClassName, currentSectionName, currentRoom } = useMemo(() => {
    if (classes.length === 0) {
      return { currentClassName: "One", currentSectionName: "A", currentRoom: "Room 1" };
    }
    const matched = classes.find((c) => `${c.className} (${c.sectionName})` === selectedClassKey) || classes[0];
    return {
      currentClassName: matched.className,
      currentSectionName: matched.sectionName,
      currentRoom: matched.roomNumber || "Room 1"
    };
  }, [classes, selectedClassKey]);

  // Available subjects for this class
  const classSubList = useMemo(() => {
    const matched = classSubjects.filter(
      (s) => s.className.trim().toLowerCase() === currentClassName.trim().toLowerCase()
    );
    if (matched.length > 0) return matched;
    return [
      { id: "1", className: currentClassName, subjectName: "English", type: "Compulsory" as const, totalMarks: 100, passingMarks: 40 },
      { id: "2", className: currentClassName, subjectName: "Urdu", type: "Compulsory" as const, totalMarks: 100, passingMarks: 40 },
      { id: "3", className: currentClassName, subjectName: "Mathematics", type: "Compulsory" as const, totalMarks: 100, passingMarks: 40 },
      { id: "4", className: currentClassName, subjectName: "General Science", type: "Compulsory" as const, totalMarks: 100, passingMarks: 40 },
      { id: "5", className: currentClassName, subjectName: "Islamiat", type: "Compulsory" as const, totalMarks: 50, passingMarks: 20 }
    ];
  }, [classSubjects, currentClassName]);

  // Assignment Modal Form
  const [assignForm, setAssignForm] = useState<{
    periodNumber: number;
    timeSlot: string;
    periodName: string;
    subject: string;
    teacherId: string;
    teacherName: string;
    room: string;
  }>({
    periodNumber: 1,
    timeSlot: "08:00 AM - 08:45 AM",
    periodName: "Period 1",
    subject: "English",
    teacherId: "",
    teacherName: "",
    room: "Room 1"
  });

  const days: ("Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday")[] = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  // Open Quick Assign for a specific Bell Timing slot
  const handleOpenAssign = (b: SMSBellTiming, index: number, existing?: TimetablePeriod) => {
    if (existing) {
      setEditingPeriodId(existing.id);
      setAssignForm({
        periodNumber: existing.periodNumber,
        timeSlot: existing.timeSlot,
        periodName: b.name,
        subject: existing.subject,
        teacherId: existing.teacherId || "",
        teacherName: existing.teacherName,
        room: existing.room || currentRoom
      });
    } else {
      setEditingPeriodId(null);
      const defaultSub = classSubList[0]?.subjectName || "English";
      const defaultTeacher = teachers[0] ? teachers[0].fullName : "General Faculty";
      const defaultTeacherId = teachers[0] ? teachers[0].id : "";

      setAssignForm({
        periodNumber: index + 1,
        timeSlot: `${b.start} — ${b.end}`,
        periodName: b.name,
        subject: defaultSub,
        teacherId: defaultTeacherId,
        teacherName: defaultTeacher,
        room: currentRoom
      });
    }
    setShowAssignModal(true);
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const selTeacher = teachers.find((t) => t.id === assignForm.teacherId);
    const teacherName = selTeacher?.fullName || assignForm.teacherName || "Assigned Faculty";

    if (editingPeriodId) {
      updateTimetablePeriod(editingPeriodId, {
        subject: assignForm.subject,
        teacherId: assignForm.teacherId,
        teacherName,
        room: assignForm.room
      });
      setToastMsg(`✅ Period "${assignForm.periodName}" updated with ${assignForm.subject} (${teacherName})!`);
    } else {
      addTimetablePeriod({
        className: currentClassName,
        sectionName: currentSectionName,
        day: selectedDay,
        periodNumber: assignForm.periodNumber,
        timeSlot: assignForm.timeSlot,
        subject: assignForm.subject,
        teacherId: assignForm.teacherId,
        teacherName,
        room: assignForm.room
      });
      setToastMsg(`✅ Period "${assignForm.periodName}" assigned to ${teacherName} for ${assignForm.subject}!`);
    }

    setShowAssignModal(false);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleClearPeriod = (periodId: string, pName: string) => {
    if (confirm(`Are you sure you want to clear the teacher and subject assignment for ${pName}?`)) {
      deleteTimetablePeriod(periodId);
      setToastMsg(`🗑️ Period allocation removed.`);
      setTimeout(() => setToastMsg(""), 3000);
    }
  };

  // Find teachers who are FREE during a period slot for smart substitution
  const [substitutePeriodTime, setSubstitutePeriodTime] = useState(bellTimings[1] ? `${bellTimings[1].start} — ${bellTimings[1].end}` : "08:00 AM — 08:45 AM");
  const availableFreeTeachers = useMemo(() => {
    // Teachers who DO NOT have a period scheduled on selectedDay and substitutePeriodTime
    const busyTeacherNames = timetable
      .filter((tt) => tt.day === selectedDay && tt.timeSlot.replace(/\s/g, "") === substitutePeriodTime.replace(/\s/g, ""))
      .map((tt) => tt.teacherName.toLowerCase());

    return teachers.filter((t) => !busyTeacherNames.includes(t.fullName.toLowerCase()));
  }, [timetable, selectedDay, substitutePeriodTime, teachers]);

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
            <Clock className={isLight ? "text-sky-600" : "text-sky-400"} size={22} />
            <span>Class Timetable &amp; Master Period Matrix</span>
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Configure which teacher takes which class and subject during each institutional bell timing slot.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/sms/settings"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border ${
              isLight ? "bg-white border-slate-300 hover:bg-slate-50 text-slate-700" : "bg-[#0b121e] border-[#1e293b] hover:bg-white/5 text-gray-300"
            } font-bold text-xs transition cursor-pointer shadow-xs`}
          >
            <Settings size={14} />
            <span>Edit Bell Timings Matrix</span>
          </Link>

          <button
            onClick={() => setSubstituteModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Smart Substitution Finder</span>
          </button>
        </div>
      </div>

      {/* Selectors: Class + Days */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Dropdown */}
          <div className="w-64">
            <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-sky-700" : "text-sky-400"} mb-1`}>
              Select Class &amp; Section
            </label>
            <select
              value={selectedClassKey}
              onChange={(e) => setSelectedClassKey(e.target.value)}
              className={`w-full ${
                isLight ? "bg-white border-slate-200 text-slate-900 shadow-xs" : "bg-[#0b121e] border-[#1e293b] text-white"
              } border p-2.5 rounded-xl font-black text-xs focus:outline-none focus:border-sky-500`}
            >
              {classes.length === 0 ? (
                <option value="One (A)">One (A)</option>
              ) : (
                classes.map((c) => (
                  <option key={c.id} value={`${c.className} (${c.sectionName})`}>
                    {c.className} (Section {c.sectionName}) &bull; {c.roomNumber || "Room 1"}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="pt-4 text-xs font-bold text-gray-500">
            Room: <span className="font-mono text-sky-600">{currentRoom}</span> &bull; {classSubList.length} Subjects Configured
          </div>
        </div>

        {/* Day Pills */}
        <div className="flex flex-wrap gap-1.5">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedDay === d
                  ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
                  : isLight
                  ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  : "bg-[#0b121e] border border-[#1e293b] text-gray-400 hover:text-white"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Timetable Grid View (Laid out with Bell Timings Matrix) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs">
          <span className={`font-black uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-2`}>
            <Calendar size={15} className="text-sky-600" />
            <span>
              {selectedDay} Schedule Matrix &bull; {currentClassName} (Section {currentSectionName})
            </span>
          </span>
          <span className={`text-[11px] font-mono ${isLight ? "text-emerald-700 font-bold" : "text-emerald-400"}`}>
            {bellTimings.length} Institutional Periods Synchronized
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {bellTimings.map((b, idx) => {
            // Find if this class already has a period assigned for this slot/day
            const assigned = timetable.find(
              (tt) =>
                tt.className.trim().toLowerCase() === currentClassName.trim().toLowerCase() &&
                tt.sectionName.trim().toLowerCase() === currentSectionName.trim().toLowerCase() &&
                tt.day === selectedDay &&
                (tt.timeSlot.replace(/\s/g, "") === `${b.start}—${b.end}`.replace(/\s/g, "") ||
                 tt.timeSlot.replace(/\s/g, "") === `${b.start}-${b.end}`.replace(/\s/g, "") ||
                 tt.periodNumber === idx + 1)
            );

            // Assembly Slot
            if (b.type === "Assembly") {
              return (
                <div
                  key={b.id}
                  className={`p-4 rounded-2xl border ${
                    isLight ? "bg-purple-50/70 border-purple-200 text-purple-900" : "bg-purple-500/10 border-purple-500/20 text-purple-200"
                  } space-y-2 flex flex-col justify-between`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Sun size={16} className="text-purple-600" />
                      <span className="font-black text-sm">{b.name}</span>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-200/60 dark:bg-purple-500/30 text-purple-800 dark:text-purple-200">
                      Assembly
                    </span>
                  </div>
                  <div className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300">
                    {b.start} — {b.end}
                  </div>
                  <p className="text-[11px] opacity-75">National Anthem, Morning Recitation &amp; Principal Briefing.</p>
                </div>
              );
            }

            // Break / Recess Slot
            if (b.type === "Break" || b.type === "Prayer") {
              return (
                <div
                  key={b.id}
                  className={`p-4 rounded-2xl border ${
                    isLight ? "bg-amber-50/70 border-amber-200 text-amber-900" : "bg-amber-500/10 border-amber-500/20 text-amber-200"
                  } space-y-2 flex flex-col justify-between`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Coffee size={16} className="text-amber-600" />
                      <span className="font-black text-sm">{b.name}</span>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-200/60 dark:bg-amber-500/30 text-amber-800 dark:text-amber-200">
                      {b.type}
                    </span>
                  </div>
                  <div className="text-xs font-mono font-bold text-amber-700 dark:text-amber-300">
                    {b.start} — {b.end}
                  </div>
                  <p className="text-[11px] opacity-75">Student refreshments &amp; faculty recess break.</p>
                </div>
              );
            }

            // Standard Class Period
            return (
              <div
                key={b.id}
                className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                  assigned
                    ? isLight
                      ? "bg-white border-sky-300 shadow-sm"
                      : "bg-[#0b121e] border-sky-500/30 text-white"
                    : isLight
                    ? "bg-slate-50/80 border-dashed border-slate-300 hover:border-slate-400"
                    : "bg-[#0b121e]/60 border-dashed border-gray-800 hover:border-gray-700"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono font-bold text-sky-600">{b.name}</span>
                      <div className={`text-xs font-mono font-bold ${isLight ? "text-slate-700" : "text-gray-400"}`}>
                        {b.start} — {b.end}
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        assigned
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                          : isLight
                          ? "bg-slate-200/60 text-slate-500"
                          : "bg-gray-800 text-gray-500"
                      }`}
                    >
                      {assigned ? "Allocated" : "Unassigned"}
                    </span>
                  </div>

                  {assigned ? (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-gray-800/80 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-sm text-purple-600 flex items-center gap-1.5">
                          <BookOpen size={14} />
                          <span>{assigned.subject}</span>
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">{assigned.room || currentRoom}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                        <GraduationCap size={14} />
                        <span>{assigned.teacherName}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-gray-800">
                      <p className="text-[11px] text-gray-400 italic">No subject or teacher assigned for this period.</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 flex justify-end gap-2">
                  {assigned ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenAssign(b, idx, assigned)}
                        className={`px-3 py-1.5 rounded-lg ${
                          isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-700" : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                        } font-bold text-xs flex items-center gap-1 cursor-pointer`}
                      >
                        <Edit2 size={11} />
                        <span>Reassign</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleClearPeriod(assigned.id, b.name)}
                        className={`p-1.5 rounded-lg ${
                          isLight ? "hover:bg-red-50 text-slate-400 hover:text-red-600" : "hover:bg-red-500/20 text-gray-500 hover:text-red-400"
                        } transition cursor-pointer`}
                        title="Clear Period"
                      >
                        <Trash2 size={12} />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenAssign(b, idx)}
                      className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>Assign Subject &amp; Teacher</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* QUICK ASSIGN SUBJECT & TEACHER MODAL                                      */}
      {/* ========================================================================= */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-sky-500/40 text-white"
          } border rounded-3xl w-full max-w-md shadow-2xl p-6 animate-fade-in-up space-y-4`}>
            <div className={`flex justify-between items-center border-b ${isLight ? "border-slate-100" : "border-gray-800"} pb-3`}>
              <div>
                <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>
                  {editingPeriodId ? "Reassign Period Allocation" : "Assign Subject &amp; Teacher"}
                </h3>
                <p className="text-[10px] text-gray-500">
                  {assignForm.periodName} ({assignForm.timeSlot}) &bull; {currentClassName} ({currentSectionName})
                </p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-4 text-xs">
              {/* Subject Selection */}
              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-purple-700" : "text-purple-400"} mb-1`}>
                  Select Subject *
                </label>
                <select
                  required
                  value={assignForm.subject}
                  onChange={(e) => setAssignForm({ ...assignForm, subject: e.target.value })}
                  className={`w-full ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                  } border p-2.5 rounded-xl font-bold focus:outline-none`}
                >
                  {classSubList.map((sub) => (
                    <option key={sub.id} value={sub.subjectName}>
                      {sub.subjectName} ({sub.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Teacher Selection */}
              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-emerald-700" : "text-emerald-400"} mb-1`}>
                  Select Teaching Faculty Member *
                </label>
                <select
                  required
                  value={assignForm.teacherId}
                  onChange={(e) => {
                    const tId = e.target.value;
                    const match = teachers.find((t) => t.id === tId);
                    setAssignForm({
                      ...assignForm,
                      teacherId: tId,
                      teacherName: match ? match.fullName : ""
                    });
                  }}
                  className={`w-full ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                  } border p-2.5 rounded-xl font-bold focus:outline-none`}
                >
                  <option value="">-- Choose Instructor --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.employeeCode} &bull; {t.department})
                    </option>
                  ))}
                </select>
                {teachers.length === 0 && (
                  <p className="text-[10px] text-amber-600 mt-1">No teachers registered yet. Add in Faculty Matrix.</p>
                )}
              </div>

              {/* Room Number */}
              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>
                  Lecture Room
                </label>
                <input
                  type="text"
                  value={assignForm.room}
                  onChange={(e) => setAssignForm({ ...assignForm, room: e.target.value })}
                  className={`w-full ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                  } border p-2.5 rounded-xl font-bold font-mono focus:outline-none`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black uppercase rounded-xl transition text-xs shadow-lg cursor-pointer"
              >
                Save Period Allocation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SMART SUBSTITUTION FINDER MODAL                                           */}
      {/* ========================================================================= */}
      {substituteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-purple-500/40 text-white"
          } border rounded-3xl w-full max-w-lg shadow-2xl p-6 animate-fade-in-up space-y-4`}>
            <div className={`flex justify-between items-center border-b ${isLight ? "border-slate-100" : "border-gray-800"} pb-3`}>
              <div className="flex items-center gap-2 text-purple-600">
                <Sparkles size={18} />
                <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>
                  Smart Faculty Substitution Finder
                </h3>
              </div>
              <button onClick={() => setSubstituteModal(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Select a period time slot to instantly see all teaching faculty who are currently <b>FREE / without any active lecture</b> during that time on {selectedDay}.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-purple-600 mb-1">Select Time Slot</label>
                <select
                  value={substitutePeriodTime}
                  onChange={(e) => setSubstitutePeriodTime(e.target.value)}
                  className={`w-full ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-black border-gray-800 text-white"
                  } border p-2.5 rounded-xl font-bold font-mono focus:outline-none`}
                >
                  {bellTimings
                    .filter((b) => b.type === "Class")
                    .map((b) => (
                      <option key={b.id} value={`${b.start} — ${b.end}`}>
                        {b.name} ({b.start} — {b.end})
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">
                  Available Free Faculty ({availableFreeTeachers.length} Available)
                </span>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {availableFreeTeachers.length === 0 ? (
                    <div className="p-4 rounded-xl border border-gray-800 text-center text-gray-500 italic">
                      No free faculty members found for this slot. All registered teachers have lectures.
                    </div>
                  ) : (
                    availableFreeTeachers.map((t) => (
                      <div
                        key={t.id}
                        className={`p-3 rounded-xl border flex justify-between items-center ${
                          isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-gray-800"
                        }`}
                      >
                        <div>
                          <div className={`font-black ${isLight ? "text-slate-900" : "text-white"}`}>{t.fullName}</div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            {t.employeeCode} &bull; {t.department} ({t.designation})
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Free Slot
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
