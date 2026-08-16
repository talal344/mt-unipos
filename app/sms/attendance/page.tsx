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
  X
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

  // Teacher Filter
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("ALL");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedClass, setSelectedClass] = useState(classes[0]?.className || "Class 9 (Science)");
  const [selectedSection, setSelectedSection] = useState("Section A (Newton)");
  const [sessionPeriod, setSessionPeriod] = useState("Morning Assembly & Register");
  const [toastMsg, setToastMsg] = useState("");

  const currentTeacher = useMemo(() => {
    return teachers.find((t) => t.id === selectedTeacherId) || null;
  }, [teachers, selectedTeacherId]);

  // When teacher is selected, auto-switch to their assigned class / incharge class
  const handleTeacherChange = (tId: string) => {
    setSelectedTeacherId(tId);
    if (tId !== "ALL") {
      const t = teachers.find((tech) => tech.id === tId);
      if (t) {
        if (t.assignedClasses && t.assignedClasses.length > 0) {
          setSelectedClass(t.assignedClasses[0]);
        }
      }
    }
  };

  const availableClasses = useMemo(() => {
    if (!currentTeacher || !currentTeacher.assignedClasses || currentTeacher.assignedClasses.length === 0) {
      return classes.map((c) => c.className);
    }
    return currentTeacher.assignedClasses;
  }, [currentTeacher, classes]);

  const targetStudents = useMemo(() => {
    return students
      .filter((s) => s.className === selectedClass && s.status === "Active")
      .sort((a, b) => parseInt(a.rollNo, 10) - parseInt(b.rollNo, 10));
  }, [students, selectedClass]);

  // Local state map for rapid UI toggling before committing
  const [attendanceMap, setAttendanceMap] = useState<Record<string, "Present" | "Absent" | "Late" | "Leave">>({});
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});

  // Initialize all to Present by default or read from existing records
  useEffect(() => {
    const initMap: Record<string, "Present" | "Absent" | "Late" | "Leave"> = {};
    const initRemarks: Record<string, string> = {};

    targetStudents.forEach((s) => {
      // check if already marked for selectedDate
      const existing = attendance.find((a) => a.studentId === s.id && a.date === selectedDate);
      if (existing) {
        initMap[s.id] = existing.status;
        initRemarks[s.id] = existing.remarks || "";
      } else {
        initMap[s.id] = "Present";
        initRemarks[s.id] = "";
      }
    });

    setAttendanceMap(initMap);
    setRemarksMap(initRemarks);
  }, [targetStudents, selectedDate, attendance]);

  // Quick State Setters
  const handleMarkAll = (status: "Present" | "Absent" | "Late" | "Leave") => {
    const updated: Record<string, "Present" | "Absent" | "Late" | "Leave"> = {};
    targetStudents.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceMap(updated);
    setToastMsg(`⚡ Marked all students as "${status}"!`);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleToggleStudent = (studentId: string, status: "Present" | "Absent" | "Late" | "Leave") => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Save Attendance to context
  const handleSaveAttendance = () => {
    const records: SMSAttendanceRecord[] = targetStudents.map((s) => ({
      id: `ATT-${s.id}-${selectedDate}`,
      type: "Student" as const,
      referenceId: s.id,
      name: `${s.firstName} ${s.lastName}`,
      studentId: s.id,
      studentName: `${s.firstName} ${s.lastName}`,
      admissionNo: s.admissionNo,
      className: s.className,
      sectionName: s.sectionName,
      date: selectedDate,
      status: attendanceMap[s.id] || "Present",
      remarks: remarksMap[s.id] || "",
      timeIn: attendanceMap[s.id] === "Late" ? "08:25 AM" : attendanceMap[s.id] === "Present" ? "07:50 AM" : undefined
    }));

    markAttendanceBatch(records);
    setToastMsg(`✅ Daily attendance for ${selectedClass} (${selectedDate}) saved successfully!`);
    setTimeout(() => setToastMsg(""), 4000);
  };

  // Broadcast Instant WhatsApp Alerts to Parents of Absent Students
  const handleBroadcastAbsenceAlerts = () => {
    let absentCount = 0;
    targetStudents.forEach((s) => {
      const st = attendanceMap[s.id] || "Present";
      if (st === "Absent") {
        absentCount++;
        const message = `Dear ${s.fatherName},\nAttendance Alert: Your child ${s.firstName} ${s.lastName} (${s.className}, Roll #${s.rollNo}) is marked ABSENT today (${selectedDate}) for ${sessionPeriod}.\nPlease contact school office for clarification.\nMT Core Model School.`;

        sendWhatsAppAlert(
          s.fatherPhone || "03001234567",
          s.fatherName || "Parent",
          "Absence Alert",
          message,
          s.admissionNo
        );
      }
    });

    if (absentCount > 0) {
      setToastMsg(`📲 Automated WhatsApp absence alerts sent to parents of ${absentCount} absent students!`);
    } else {
      setToastMsg(`🎉 100% attendance! No absent students to alert.`);
    }
    setTimeout(() => setToastMsg(""), 4500);
  };

  // Print Daily Attendance Sheet
  const handlePrintAttendanceSheet = () => {
    const teacherName = currentTeacher ? currentTeacher.fullName : "Class Incharge Teacher";

    const rows = targetStudents
      .map((s, idx) => {
        const st = attendanceMap[s.id] || "Present";
        const rem = remarksMap[s.id] || "—";
        const color = st === "Present" ? "#16a34a" : st === "Absent" ? "#dc2626" : st === "Late" ? "#d97706" : "#0284c7";

        return `<tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td style="text-align: center; font-weight: bold;">${s.rollNo}</td>
          <td><b>${s.admissionNo}</b></td>
          <td><b>${s.firstName} ${s.lastName}</b></td>
          <td>${s.fatherName}</td>
          <td>${s.fatherPhone || "0300-1234567"}</td>
          <td style="text-align: center; font-weight: 900; color: ${color};">${st.toUpperCase()}</td>
          <td>${rem}</td>
        </tr>`;
      })
      .join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Daily Attendance Register - ${selectedClass} - ${selectedDate}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #ffffff; color: #0f172a; padding: 25px; font-size: 11px; }
    .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 10px; margin-bottom: 15px; }
    .school { font-size: 18px; font-weight: 900; color: #0284c7; }
    .title { font-size: 13px; font-weight: 800; text-transform: uppercase; margin-top: 4px; }
    .meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; background: #f8fafc; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 15px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #0284c7; color: white; padding: 7px 6px; text-align: left; font-size: 10px; font-weight: 800; border: 1px solid #0284c7; }
    td { padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 11px; }
    .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; }
    .sig { border-top: 1px solid #0f172a; width: 170px; text-align: center; padding-top: 5px; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: right; margin-bottom: 15px;">
    <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 8px 18px; border-radius: 6px; font-weight: bold; cursor: pointer;">🖨️ Print Attendance Register</button>
  </div>
  <div class="header">
    <div class="school">MT CORE MODEL HIGHER SECONDARY SCHOOL</div>
    <div class="title">DAILY CLASS ATTENDANCE REGISTER</div>
  </div>
  <div class="meta">
    <div>Class: <b>${selectedClass}</b></div>
    <div>Date: <b>${selectedDate}</b></div>
    <div>Session: <b>${sessionPeriod}</b></div>
    <div>Incharge: <b>${teacherName}</b></div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width: 30px; text-align: center;">Sr</th>
        <th style="width: 50px; text-align: center;">Roll #</th>
        <th style="width: 100px;">Admission ID</th>
        <th>Student Name</th>
        <th>Father Name</th>
        <th>Father Phone</th>
        <th style="width: 80px; text-align: center;">Status</th>
        <th>Remarks</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
  <div class="footer">
    <div class="sig">Class Incharge Teacher<br/><small>${teacherName}</small></div>
    <div class="sig">Discipline Incharge</div>
    <div class="sig">Principal Signature &amp; Stamp</div>
  </div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  // Live Attendance Summary Stats
  const stats = useMemo(() => {
    let present = 0;
    let late = 0;
    let absent = 0;
    let leave = 0;

    targetStudents.forEach((s) => {
      const st = attendanceMap[s.id] || "Present";
      if (st === "Present") present++;
      else if (st === "Late") late++;
      else if (st === "Absent") absent++;
      else if (st === "Leave") leave++;
    });

    const total = targetStudents.length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    return { total, present, late, absent, leave, rate };
  }, [targetStudents, attendanceMap]);

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
            <CalendarCheck2 className={isLight ? "text-sky-600" : "text-sky-400"} size={22} />
            <span>Teacher Daily Class Attendance Upload &amp; Roll-Call Desk</span>
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Teachers can upload daily student attendance for assigned classes, track attendance rates, and trigger automatic WhatsApp absence alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrintAttendanceSheet}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl ${
              isLight ? "bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-300" : "bg-sky-500/10 hover:bg-sky-500 text-sky-300 hover:text-white border-sky-500/30"
            } border text-xs font-bold transition cursor-pointer`}
          >
            <Printer size={14} />
            <span>Print Register</span>
          </button>

          <button
            onClick={handleBroadcastAbsenceAlerts}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/20 transition cursor-pointer"
          >
            <MessageSquare size={14} />
            <span>WhatsApp Absent Parents</span>
          </button>

          <button
            onClick={handleSaveAttendance}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            <Save size={14} />
            <span>Save Daily Attendance</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* TEACHER ASSIGNMENT & ATTENDANCE CONTROLS                                       */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl p-5 space-y-4`}>
        {/* Row 1: Teacher Selection Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-dashed border-slate-200 dark:border-gray-800">
          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex items-center gap-2 text-xs font-black uppercase ${isLight ? "text-slate-800" : "text-sky-400"}`}>
              <GraduationCap size={16} />
              <span>Assigned Class Teacher:</span>
            </div>
            <select
              value={selectedTeacherId}
              onChange={(e) => handleTeacherChange(e.target.value)}
              className={`min-w-[240px] ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
              } border p-2 rounded-xl font-bold text-xs focus:outline-none focus:border-sky-500`}
            >
              <option value="ALL">All Classes (Admin/Principal Overview)</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} (Incharge: {t.inchargeClassSection || t.assignedClasses?.join(", ")})
                </option>
              ))}
            </select>
          </div>

          {currentTeacher && (
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                isLight ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              }`}>
                🏫 Incharge Section: {currentTeacher.inchargeClassSection || "Class 9 (Science) - Section A"}
              </span>
            </div>
          )}
        </div>

        {/* Row 2: Date, Class, Section & Session Period */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Attendance Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`w-full ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
              } border p-2 rounded-xl font-bold text-xs focus:outline-none focus:border-sky-500`}
            />
          </div>

          <div>
            <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-sky-700 font-bold" : "text-sky-400"} mb-1`}>Assigned Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className={`w-full ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
              } border p-2 rounded-xl font-bold text-xs focus:outline-none focus:border-sky-500`}
            >
              {availableClasses.map((cName) => (
                <option key={cName} value={cName}>
                  {cName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-emerald-700 font-bold" : "text-emerald-400"} mb-1`}>Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className={`w-full ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
              } border p-2 rounded-xl font-bold text-xs focus:outline-none focus:border-sky-500`}
            >
              <option value="Section A (Newton)">Section A (Newton)</option>
              <option value="Section B (Einstein)">Section B (Einstein)</option>
              <option value="Section C (Galileo)">Section C (Galileo)</option>
            </select>
          </div>

          <div>
            <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-purple-700 font-bold" : "text-purple-400"} mb-1`}>Session / Period</label>
            <select
              value={sessionPeriod}
              onChange={(e) => setSessionPeriod(e.target.value)}
              className={`w-full ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
              } border p-2 rounded-xl font-bold text-xs focus:outline-none focus:border-sky-500`}
            >
              <option value="Morning Assembly & Register">☀️ Morning Assembly &amp; Register</option>
              <option value="Period 1 (08:00 AM)">Period 1 (08:00 AM)</option>
              <option value="Period 2 (08:45 AM)">Period 2 (08:45 AM)</option>
              <option value="Period 3 (09:30 AM)">Period 3 (09:30 AM)</option>
              <option value="Period 4 (10:15 AM)">Period 4 (10:15 AM)</option>
              <option value="Post-Recess Attendance">Post-Recess (11:30 AM)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* ATTENDANCE KPI COUNTERS                                                        */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-sans">
        <div className={`p-4 rounded-2xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"}`}>
          <span className={`text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"}`}>Total Enrolled</span>
          <div className={`text-2xl font-black ${isLight ? "text-slate-900" : "text-white"} mt-1`}>{stats.total}</div>
          <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>{selectedClass}</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isLight ? "bg-white border-emerald-200 shadow-sm" : "bg-[#0b121e] border-emerald-500/30"}`}>
          <span className="text-[10px] uppercase font-bold text-emerald-600">Present (P)</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{stats.present} Students</div>
          <div className="text-[10px] text-emerald-500 font-bold">In Classroom</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isLight ? "bg-white border-amber-200 shadow-sm" : "bg-[#0b121e] border-amber-500/30"}`}>
          <span className="text-[10px] uppercase font-bold text-amber-600">Late Arrival (L)</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{stats.late} Students</div>
          <div className="text-[10px] text-amber-500 font-bold">Late Gate Entry</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isLight ? "bg-white border-red-200 shadow-sm" : "bg-[#0b121e] border-red-500/30"}`}>
          <span className="text-[10px] uppercase font-bold text-red-600">Absent (A)</span>
          <div className="text-2xl font-black text-red-600 mt-1">{stats.absent} Students</div>
          <div className="text-[10px] text-red-500 font-bold">Unexcused Absence</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isLight ? "bg-white border-sky-200 shadow-sm" : "bg-[#0b121e] border-sky-500/30"}`}>
          <span className="text-[10px] uppercase font-bold text-sky-600">Today Attendance</span>
          <div className="text-2xl font-black text-sky-600 mt-1">{stats.rate}%</div>
          <div className="text-[10px] text-sky-500 font-bold">Class Attendance Rate</div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* STUDENT ATTENDANCE ROSTER & 4-STATE TOGGLE SHEET                              */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl overflow-hidden shadow-2xl`}>
        <div className={`p-4 border-b ${isLight ? "border-slate-100 bg-slate-50/80" : "border-gray-800 bg-black/40"} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3`}>
          <div>
            <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-xs uppercase tracking-wider flex items-center gap-2`}>
              <CheckCheck size={15} className={isLight ? "text-emerald-600" : "text-emerald-400"} />
              <span>{selectedClass} &bull; {selectedSection} Daily Attendance Register ({targetStudents.length} Students)</span>
            </h3>
            <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>
              Date: <b className={isLight ? "text-slate-800" : "text-gray-200"}>{selectedDate}</b> &bull; Session: <b className={isLight ? "text-sky-700" : "text-sky-400"}>{sessionPeriod}</b>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className={`text-[10px] ${isLight ? "text-slate-400" : "text-gray-500"} mr-1`}>Batch Actions:</span>
            <button
              onClick={() => handleMarkAll("Present")}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] cursor-pointer shadow-xs"
            >
              ✓ All Present
            </button>
            <button
              onClick={() => handleMarkAll("Absent")}
              className={`px-3 py-1 ${
                isLight ? "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200" : "bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white"
              } font-bold rounded-lg text-[10px] cursor-pointer`}
            >
              ✗ All Absent
            </button>
            <button
              onClick={() => handleMarkAll("Late")}
              className={`px-3 py-1 ${
                isLight ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200" : "bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white"
              } font-bold rounded-lg text-[10px] cursor-pointer`}
            >
              ⏰ All Late
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className={`border-b ${isLight ? "border-slate-200 text-slate-600 bg-slate-100/70" : "border-gray-800 text-gray-400 bg-black/20"} font-mono text-[11px]`}>
                <th className="p-3.5 font-bold text-center">Roll #</th>
                <th className="p-3.5 font-bold">Admission ID</th>
                <th className="p-3.5 font-bold">Student Name</th>
                <th className="p-3.5 font-bold">Father Name &amp; Contact</th>
                <th className="p-3.5 font-bold text-center">Daily Status (1-Click Toggle)</th>
                <th className="p-3.5 font-bold text-center">Status Badge</th>
                <th className="p-3.5 font-bold">Teacher Attendance Remarks</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? "divide-slate-100" : "divide-gray-800/50"} font-mono text-[11px]`}>
              {targetStudents.map((st) => {
                const currentStatus = attendanceMap[st.id] || "Present";

                return (
                  <tr key={st.id} className={`${isLight ? "hover:bg-slate-50/80" : "hover:bg-white/[0.02]"} transition`}>
                    <td className={`p-3.5 text-center font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{st.rollNo}</td>
                    <td className={`p-3.5 font-bold ${isLight ? "text-sky-700" : "text-sky-400"}`}>{st.admissionNo}</td>
                    <td className="p-3.5 font-sans font-bold">
                      <div className={isLight ? "text-slate-900" : "text-white"}>{st.firstName} {st.lastName}</div>
                      <div className={`text-[9px] ${isLight ? "text-slate-400" : "text-gray-500"} font-normal`}>House: {st.houseName || "Jinnah House"}</div>
                    </td>
                    <td className="p-3.5 font-sans">
                      <div className={isLight ? "text-slate-700" : "text-gray-300"}>{st.fatherName}</div>
                      <div className={`text-[10px] ${isLight ? "text-slate-400 font-mono" : "text-gray-500 font-mono"}`}>{st.fatherPhone || "0300-1234567"}</div>
                    </td>

                    {/* 4-State Quick Action Buttons */}
                    <td className="p-3.5 text-center font-sans">
                      <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-black/40 p-1 rounded-xl border border-slate-200 dark:border-gray-800">
                        <button
                          type="button"
                          onClick={() => handleToggleStudent(st.id, "Present")}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition cursor-pointer ${
                            currentStatus === "Present"
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "text-slate-500 hover:text-emerald-600"
                          }`}
                        >
                          P
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStudent(st.id, "Late")}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition cursor-pointer ${
                            currentStatus === "Late"
                              ? "bg-amber-500 text-white shadow-sm"
                              : "text-slate-500 hover:text-amber-600"
                          }`}
                        >
                          L
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStudent(st.id, "Absent")}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition cursor-pointer ${
                            currentStatus === "Absent"
                              ? "bg-red-600 text-white shadow-sm"
                              : "text-slate-500 hover:text-red-600"
                          }`}
                        >
                          A
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStudent(st.id, "Leave")}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition cursor-pointer ${
                            currentStatus === "Leave"
                              ? "bg-sky-600 text-white shadow-sm"
                              : "text-slate-500 hover:text-sky-600"
                          }`}
                        >
                          LV
                        </button>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-3.5 text-center font-sans">
                      <span
                        className={`px-2.5 py-1 rounded-md font-black text-[10px] inline-block min-w-[70px] ${
                          currentStatus === "Present"
                            ? isLight
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : currentStatus === "Late"
                            ? isLight
                              ? "bg-amber-50 text-amber-700 border border-amber-300"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            : currentStatus === "Absent"
                            ? isLight
                              ? "bg-red-50 text-red-700 border border-red-300"
                              : "bg-red-600/10 text-red-400 border border-red-500/30"
                            : isLight
                            ? "bg-sky-50 text-sky-700 border border-sky-300"
                            : "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                        }`}
                      >
                        {currentStatus === "Present"
                          ? "✓ Present"
                          : currentStatus === "Late"
                          ? "⏰ Late"
                          : currentStatus === "Absent"
                          ? "✗ Absent"
                          : "📄 Leave"}
                      </span>
                    </td>

                    {/* Remarks Input */}
                    <td className="p-3.5 font-sans">
                      <input
                        type="text"
                        value={remarksMap[st.id] || ""}
                        onChange={(e) => setRemarksMap({ ...remarksMap, [st.id]: e.target.value })}
                        placeholder="e.g. Arrived 15m late / Medical leave"
                        className={`w-full max-w-[220px] ${
                          isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                        } border px-2 py-1 rounded text-[11px] focus:outline-none focus:border-sky-500`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
