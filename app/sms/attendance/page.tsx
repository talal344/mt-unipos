"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSMS, SMSAttendanceRecord, StudentRecord, TeacherRecord } from "@/context/sms-context";
import {
  CalendarCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Sparkles,
  Users,
  Search,
  Filter,
  Save,
  Check,
  GraduationCap,
  MessageSquare,
  Printer,
  Calendar,
  AlertTriangle,
  RotateCcw,
  CheckCheck,
  UserX,
  X,
  UserCheck,
  ShieldCheck,
  Building2
} from "lucide-react";

export default function SMSAttendancePage() {
  const {
    theme,
    classes,
    students,
    teachers,
    markAttendanceBatch,
    attendance,
    sendWhatsAppAlert
  } = useSMS();

  const isLight = theme === "light";

  // Tab: 'students' | 'staff'
  const [activeTab, setActiveTab] = useState<"students" | "staff">("students");

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedClass, setSelectedClass] = useState(classes[0]?.className || "One");
  const [selectedSection, setSelectedSection] = useState(classes[0]?.sectionName || "A");
  const [search, setSearch] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // Unique list of classes
  const uniqueClassNames = useMemo(() => {
    const list = Array.from(new Set(classes.map((c) => c.className))).filter(Boolean);
    return list.length > 0 ? list : ["One"];
  }, [classes]);

  // Sections for selected class
  const availableSections = useMemo(() => {
    const matched = classes
      .filter((c) => c.className.trim().toLowerCase() === selectedClass.trim().toLowerCase())
      .map((c) => c.sectionName);
    const unique = Array.from(new Set(matched));
    return unique.length > 0 ? unique : ["A"];
  }, [classes, selectedClass]);

  // When class changes, keep section in sync
  useEffect(() => {
    if (availableSections.length > 0 && !availableSections.includes(selectedSection)) {
      setSelectedSection(availableSections[0]);
    }
  }, [availableSections, selectedSection]);

  // Filtered Students for selected class & section
  const targetStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchClass = s.className.trim().toLowerCase() === selectedClass.trim().toLowerCase();
        const matchSection = !selectedSection || s.sectionName.trim().toLowerCase() === selectedSection.trim().toLowerCase();
        const matchActive = s.status === "Active";
        const matchSearch =
          !search ||
          s.firstName.toLowerCase().includes(search.toLowerCase()) ||
          s.lastName.toLowerCase().includes(search.toLowerCase()) ||
          s.rollNo?.includes(search) ||
          s.admissionNo?.toLowerCase().includes(search.toLowerCase());
        return matchClass && matchSection && matchActive && matchSearch;
      })
      .sort((a, b) => parseInt(a.rollNo || "0", 10) - parseInt(b.rollNo || "0", 10));
  }, [students, selectedClass, selectedSection, search]);

  // Student Attendance Local State
  const [studentAttendanceMap, setStudentAttendanceMap] = useState<Record<string, "Present" | "Absent" | "Late" | "Leave">>({});
  const [studentRemarksMap, setStudentRemarksMap] = useState<Record<string, string>>({});

  // Staff Attendance Local State
  const [staffAttendanceMap, setStaffAttendanceMap] = useState<Record<string, "Present" | "Absent" | "Late" | "Leave" | "Half Day">>({});
  const [staffRemarksMap, setStaffRemarksMap] = useState<Record<string, string>>({});
  const [staffSearch, setStaffSearch] = useState("");

  // Sync Student Attendance from database
  useEffect(() => {
    const initMap: Record<string, "Present" | "Absent" | "Late" | "Leave"> = {};
    const initRemarks: Record<string, string> = {};

    targetStudents.forEach((s) => {
      const existing = attendance.find((a) => a.studentId === s.id && a.date === selectedDate);
      if (existing) {
        initMap[s.id] = existing.status;
        initRemarks[s.id] = existing.remarks || "";
      } else {
        initMap[s.id] = "Present";
        initRemarks[s.id] = "";
      }
    });

    setStudentAttendanceMap(initMap);
    setStudentRemarksMap(initRemarks);
  }, [targetStudents, selectedDate, attendance]);

  // Sync Staff Attendance
  useEffect(() => {
    const initMap: Record<string, "Present" | "Absent" | "Late" | "Leave" | "Half Day"> = {};
    const initRemarks: Record<string, string> = {};

    try {
      const stored = localStorage.getItem(`mt_sms_staff_attendance_${selectedDate}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        teachers.forEach((t) => {
          if (parsed[t.id]) {
            initMap[t.id] = parsed[t.id].status || "Present";
            initRemarks[t.id] = parsed[t.id].remarks || "";
          } else {
            initMap[t.id] = "Present";
            initRemarks[t.id] = "";
          }
        });
      } else {
        teachers.forEach((t) => {
          initMap[t.id] = "Present";
          initRemarks[t.id] = "";
        });
      }
    } catch {
      teachers.forEach((t) => {
        initMap[t.id] = "Present";
        initRemarks[t.id] = "";
      });
    }

    setStaffAttendanceMap(initMap);
    setStaffRemarksMap(initRemarks);
  }, [teachers, selectedDate]);

  // Student Attendance Handlers
  const handleMarkAllStudents = (status: "Present" | "Absent" | "Late" | "Leave") => {
    const updated: Record<string, "Present" | "Absent" | "Late" | "Leave"> = {};
    targetStudents.forEach((s) => {
      updated[s.id] = status;
    });
    setStudentAttendanceMap(updated);
    setToastMsg(`⚡ Marked all ${targetStudents.length} students as "${status}"!`);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleSaveStudentAttendance = () => {
    const records: Omit<SMSAttendanceRecord, "id">[] = targetStudents.map((st) => ({
      studentId: st.id,
      studentName: `${st.firstName} ${st.lastName}`,
      admissionNo: st.admissionNo,
      rollNo: st.rollNo,
      className: st.className,
      sectionName: st.sectionName,
      date: selectedDate,
      status: studentAttendanceMap[st.id] || "Present",
      remarks: studentRemarksMap[st.id] || "",
      punchTime: "07:45 AM"
    }));

    markAttendanceBatch(records);
    setToastMsg(`✅ Saved daily attendance for ${targetStudents.length} students of ${selectedClass} (${selectedSection})!`);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleBroadcastAbsentAlerts = () => {
    const absentees = targetStudents.filter((st) => studentAttendanceMap[st.id] === "Absent");
    if (absentees.length === 0) {
      setToastMsg("ℹ️ No students are marked absent in this class today!");
      setTimeout(() => setToastMsg(""), 3500);
      return;
    }

    absentees.forEach((st) => {
      const msg = `Dear ${st.fatherName},\nAttendance Alert: Your ward ${st.firstName} ${st.lastName} (Class ${st.className}, Roll #${st.rollNo}) is ABSENT today (${selectedDate}) from school.\nPlease contact administration if this was unexcused.\nRegards, Principal Office.`;
      sendWhatsAppAlert(st.fatherPhone || "03001234567", st.fatherName || "Parent", "Absence Alert", msg, st.admissionNo);
    });

    setToastMsg(`📱 Dispatched absent WhatsApp alerts to ${absentees.length} parents!`);
    setTimeout(() => setToastMsg(""), 4500);
  };

  // Staff Attendance Handlers
  const handleMarkAllStaff = (status: "Present" | "Absent" | "Late" | "Leave") => {
    const updated: Record<string, "Present" | "Absent" | "Late" | "Leave" | "Half Day"> = {};
    teachers.forEach((t) => {
      updated[t.id] = status;
    });
    setStaffAttendanceMap(updated);
    setToastMsg(`⚡ Marked all faculty & staff as "${status}"!`);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleSaveStaffAttendance = () => {
    const payload: Record<string, { status: string; remarks: string; date: string }> = {};
    teachers.forEach((t) => {
      payload[t.id] = {
        status: staffAttendanceMap[t.id] || "Present",
        remarks: staffRemarksMap[t.id] || "",
        date: selectedDate
      };
    });

    try {
      localStorage.setItem(`mt_sms_staff_attendance_${selectedDate}`, JSON.stringify(payload));
    } catch {}

    setToastMsg(`✅ Headmaster Portal: Saved attendance for ${teachers.length} faculty members!`);
    setTimeout(() => setToastMsg(""), 4000);
  };

  // Summary Stats
  const studentStats = useMemo(() => {
    let p = 0, a = 0, l = 0, lv = 0;
    targetStudents.forEach((s) => {
      const st = studentAttendanceMap[s.id] || "Present";
      if (st === "Present") p++;
      else if (st === "Absent") a++;
      else if (st === "Late") l++;
      else if (st === "Leave") lv++;
    });
    const pct = targetStudents.length > 0 ? Math.round((p / targetStudents.length) * 100) : 100;
    return { p, a, l, lv, pct };
  }, [targetStudents, studentAttendanceMap]);

  const staffStats = useMemo(() => {
    let p = 0, a = 0, l = 0, lv = 0;
    teachers.forEach((t) => {
      const st = staffAttendanceMap[t.id] || "Present";
      if (st === "Present") p++;
      else if (st === "Absent") a++;
      else if (st === "Late" || st === "Half Day") l++;
      else if (st === "Leave") lv++;
    });
    const pct = teachers.length > 0 ? Math.round((p / teachers.length) * 100) : 100;
    return { p, a, l, lv, pct };
  }, [teachers, staffAttendanceMap]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter(
      (t) =>
        !staffSearch ||
        t.fullName.toLowerCase().includes(staffSearch.toLowerCase()) ||
        t.department.toLowerCase().includes(staffSearch.toLowerCase()) ||
        t.employeeCode.toLowerCase().includes(staffSearch.toLowerCase())
    );
  }, [teachers, staffSearch]);

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
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
            <CalendarCheck2 className={isLight ? "text-emerald-600" : "text-emerald-400"} size={24} />
            <span>School Daily Attendance &amp; Register Portal</span>
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Class teachers upload student attendance; Headmaster / Principal marks faculty &amp; staff daily attendance.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-emerald-600" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={`border px-3 py-2 rounded-xl text-xs font-bold ${
              isLight ? "bg-white border-slate-300 text-slate-900 shadow-xs" : "bg-black border-gray-800 text-white"
            } focus:outline-none`}
          />
        </div>
      </div>

      {/* Portal Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-gray-800 pb-2">
        <button
          onClick={() => setActiveTab("students")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === "students"
              ? "bg-sky-600 text-white shadow-md"
              : isLight
              ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
              : "bg-gray-800 hover:bg-gray-700 text-gray-300"
          }`}
        >
          <GraduationCap size={15} />
          <span>🎓 Students Class Attendance (Teacher Mode)</span>
        </button>

        <button
          onClick={() => setActiveTab("staff")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === "staff"
              ? "bg-emerald-600 text-white shadow-md"
              : isLight
              ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
              : "bg-gray-800 hover:bg-gray-700 text-gray-300"
          }`}
        >
          <Building2 size={15} />
          <span>👨‍🏫 Teachers &amp; Staff Attendance (Headmaster Mode)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STUDENTS CLASS ATTENDANCE (TEACHER PORTAL)                         */}
      {/* ========================================================================= */}
      {activeTab === "students" && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl p-4 space-y-4`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Class Selector */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-sky-700 mb-1">Class</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className={`border p-2 rounded-xl font-bold text-xs ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-black border-gray-800 text-white"
                    }`}
                  >
                    {uniqueClassNames.map((cName) => (
                      <option key={cName} value={cName}>
                        {cName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Section Selector */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-sky-700 mb-1">Section</label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className={`border p-2 rounded-xl font-bold text-xs ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-black border-gray-800 text-white"
                    }`}
                  >
                    {availableSections.map((sec) => (
                      <option key={sec} value={sec}>
                        Section {sec}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Search Student</label>
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Name / Roll #"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className={`border pl-8 pr-3 py-1.5 rounded-xl text-xs ${
                        isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-black border-gray-800 text-white"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleMarkAllStudents("Present")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    isLight ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                  } transition cursor-pointer`}
                >
                  ✓ All Present
                </button>

                <button
                  onClick={() => handleMarkAllStudents("Absent")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    isLight ? "bg-red-50 hover:bg-red-100 text-red-800 border border-red-300" : "bg-red-500/10 text-red-300 border border-red-500/30"
                  } transition cursor-pointer`}
                >
                  ✗ All Absent
                </button>

                <button
                  onClick={handleBroadcastAbsentAlerts}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <MessageSquare size={13} />
                  <span>WhatsApp Absentees</span>
                </button>

                <button
                  onClick={handleSaveStudentAttendance}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-sky-600/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Save size={14} />
                  <span>Save Attendance</span>
                </button>
              </div>
            </div>

            {/* Quick KPI Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100 dark:border-gray-800/80 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-gray-800">
                <span className="text-[10px] text-gray-500 font-bold block">Total Enrolled</span>
                <span className="text-base font-black">{targetStudents.length} Students</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                <span className="text-[10px] font-bold block">Present Today</span>
                <span className="text-base font-black">{studentStats.p}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300">
                <span className="text-[10px] font-bold block">Absent Today</span>
                <span className="text-base font-black">{studentStats.a}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300">
                <span className="text-[10px] font-bold block">Late / Leave</span>
                <span className="text-base font-black">{studentStats.l + studentStats.lv}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-sky-700 dark:text-sky-300">
                <span className="text-[10px] font-bold block">Attendance Rate</span>
                <span className="text-base font-black">{studentStats.pct}%</span>
              </div>
            </div>
          </div>

          {/* Students Attendance Table */}
          <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl overflow-hidden shadow-sm`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b ${isLight ? "border-slate-200 text-slate-600 bg-slate-100/70" : "border-gray-800 text-gray-400 bg-black/40"} font-mono text-[10px]`}>
                    <th className="p-3.5 text-center">Roll #</th>
                    <th className="p-3.5">Admission ID</th>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Father Name &amp; Phone</th>
                    <th className="p-3.5 text-center">Attendance Status</th>
                    <th className="p-3.5">Remarks / Reason</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? "divide-slate-100" : "divide-gray-800/50"} text-xs`}>
                  {targetStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={`p-10 text-center ${isLight ? "text-slate-400" : "text-gray-500"} italic`}>
                        No active students found in {selectedClass} ({selectedSection}).
                      </td>
                    </tr>
                  ) : (
                    targetStudents.map((st) => {
                      const currentStatus = studentAttendanceMap[st.id] || "Present";
                      return (
                        <tr key={st.id} className={isLight ? "hover:bg-slate-50/80" : "hover:bg-white/[0.02]"}>
                          <td className="p-3.5 text-center font-mono font-bold">{st.rollNo}</td>
                          <td className="p-3.5 font-mono font-bold text-sky-600">{st.admissionNo}</td>
                          <td className="p-3.5 font-bold">
                            <div className={isLight ? "text-slate-900" : "text-white"}>{st.firstName} {st.lastName}</div>
                            <div className="text-[10px] text-gray-400 font-normal">{st.className} ({st.sectionName})</div>
                          </td>
                          <td className="p-3.5 text-gray-500">
                            <div>{st.fatherName}</div>
                            <div className="text-[10px] font-mono">{st.fatherPhone || st.emergencyContact || "—"}</div>
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="inline-flex rounded-xl border border-slate-200 dark:border-gray-800 overflow-hidden p-0.5 bg-slate-50 dark:bg-black/40">
                              {(["Present", "Absent", "Late", "Leave"] as const).map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setStudentAttendanceMap((prev) => ({ ...prev, [st.id]: opt }))}
                                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                                    currentStatus === opt
                                      ? opt === "Present"
                                        ? "bg-emerald-600 text-white shadow-xs"
                                        : opt === "Absent"
                                        ? "bg-red-600 text-white shadow-xs"
                                        : opt === "Late"
                                        ? "bg-amber-600 text-white shadow-xs"
                                        : "bg-sky-600 text-white shadow-xs"
                                      : isLight
                                      ? "text-slate-600 hover:bg-slate-200/60"
                                      : "text-gray-400 hover:bg-white/5"
                                  }`}
                                >
                                  {opt === "Present" ? "P" : opt === "Absent" ? "A" : opt === "Late" ? "L" : "Lv"}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <input
                              type="text"
                              placeholder="Optional remarks..."
                              value={studentRemarksMap[st.id] || ""}
                              onChange={(e) => setStudentRemarksMap({ ...studentRemarksMap, [st.id]: e.target.value })}
                              className={`w-full border px-2.5 py-1 rounded-lg text-xs ${
                                isLight ? "bg-white border-slate-200 text-slate-900" : "bg-black border-gray-800 text-white"
                              }`}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FACULTY & STAFF ATTENDANCE (HEADMASTER / PRINCIPAL PORTAL)         */}
      {/* ========================================================================= */}
      {activeTab === "staff" && (
        <div className="space-y-5">
          {/* Headmaster Controls Bar */}
          <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl p-4 space-y-4`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-black text-sm">Principal / Headmaster Faculty Attendance Portal</h3>
                  <p className="text-[11px] text-gray-500">Record daily reporting, arrival time &amp; leave status of teaching faculty.</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleMarkAllStaff("Present")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    isLight ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                  } transition cursor-pointer`}
                >
                  ✓ All Faculty Present
                </button>

                <button
                  onClick={handleSaveStaffAttendance}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Save size={14} />
                  <span>Save Faculty Attendance</span>
                </button>
              </div>
            </div>

            {/* Faculty Attendance Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-gray-800/80 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-gray-800">
                <span className="text-[10px] text-gray-500 font-bold block">Total Teaching Faculty</span>
                <span className="text-base font-black">{teachers.length} Members</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                <span className="text-[10px] font-bold block">Present On Duty</span>
                <span className="text-base font-black">{staffStats.p}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300">
                <span className="text-[10px] font-bold block">Absent / Leave</span>
                <span className="text-base font-black">{staffStats.a + staffStats.lv}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-sky-700 dark:text-sky-300">
                <span className="text-[10px] font-bold block">Faculty Attendance Rate</span>
                <span className="text-base font-black">{staffStats.pct}%</span>
              </div>
            </div>
          </div>

          {/* Faculty Table */}
          <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl overflow-hidden shadow-sm`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b ${isLight ? "border-slate-200 text-slate-600 bg-slate-100/70" : "border-gray-800 text-gray-400 bg-black/40"} font-mono text-[10px]`}>
                    <th className="p-3.5">Emp Code</th>
                    <th className="p-3.5">Faculty Name</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Assigned Classes</th>
                    <th className="p-3.5 text-center">Duty Attendance Status</th>
                    <th className="p-3.5">Principal Remarks / Arrival Note</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? "divide-slate-100" : "divide-gray-800/50"} text-xs`}>
                  {filteredTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={`p-10 text-center ${isLight ? "text-slate-400" : "text-gray-500"} italic`}>
                        No teachers found in faculty directory. Add teachers in Teachers Matrix.
                      </td>
                    </tr>
                  ) : (
                    filteredTeachers.map((t) => {
                      const currentStatus = staffAttendanceMap[t.id] || "Present";
                      return (
                        <tr key={t.id} className={isLight ? "hover:bg-slate-50/80" : "hover:bg-white/[0.02]"}>
                          <td className="p-3.5 font-mono font-bold text-emerald-600">{t.employeeCode}</td>
                          <td className="p-3.5 font-bold">
                            <div className={isLight ? "text-slate-900" : "text-white"}>{t.fullName}</div>
                            <div className="text-[10px] text-gray-400 font-normal">{t.qualification}</div>
                          </td>
                          <td className="p-3.5 font-bold">{t.department}</td>
                          <td className="p-3.5 text-gray-500 font-mono">
                            {t.assignedClasses?.length > 0 ? t.assignedClasses.join(", ") : "None"}
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="inline-flex rounded-xl border border-slate-200 dark:border-gray-800 overflow-hidden p-0.5 bg-slate-50 dark:bg-black/40">
                              {(["Present", "Absent", "Late", "Leave", "Half Day"] as const).map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setStaffAttendanceMap((prev) => ({ ...prev, [t.id]: opt }))}
                                  className={`px-2 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                                    currentStatus === opt
                                      ? opt === "Present"
                                        ? "bg-emerald-600 text-white shadow-xs"
                                        : opt === "Absent"
                                        ? "bg-red-600 text-white shadow-xs"
                                        : opt === "Late"
                                        ? "bg-amber-600 text-white shadow-xs"
                                        : opt === "Half Day"
                                        ? "bg-purple-600 text-white shadow-xs"
                                        : "bg-sky-600 text-white shadow-xs"
                                      : isLight
                                      ? "text-slate-600 hover:bg-slate-200/60"
                                      : "text-gray-400 hover:bg-white/5"
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <input
                              type="text"
                              placeholder="e.g. Approved leave / Arrived 08:15 AM"
                              value={staffRemarksMap[t.id] || ""}
                              onChange={(e) => setStaffRemarksMap({ ...staffRemarksMap, [t.id]: e.target.value })}
                              className={`w-full border px-2.5 py-1 rounded-lg text-xs ${
                                isLight ? "bg-white border-slate-200 text-slate-900" : "bg-black border-gray-800 text-white"
                              }`}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
