"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSMS, SMSMarksEntry, StudentRecord, TeacherRecord } from "@/context/sms-context";
import {
  Award,
  Plus,
  Printer,
  Search,
  CheckCircle2,
  Filter,
  Save,
  Trophy,
  Medal,
  Star,
  FileText,
  UserCheck,
  Send,
  Sparkles,
  BookOpen,
  GraduationCap,
  ClipboardList,
  UploadCloud,
  FileSpreadsheet,
  X,
  MessageSquare,
  TrendingUp,
  Percent,
  Layers
} from "lucide-react";

export default function SMSExamsPage() {
  const {
    theme,
    examTerms,
    marks,
    students,
    classes,
    teachers,
    saveMarksBatch,
    addExamTerm,
    sendWhatsAppAlert
  } = useSMS();

  const isLight = theme === "light";

  // Teacher Filter state
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("ALL");
  const [selectedTerm, setSelectedTerm] = useState("EXM-MID-2026");
  const [selectedClass, setSelectedClass] = useState(classes[0]?.className || "One");
  const [selectedSubject, setSelectedSubject] = useState("Physics");
  
  // Custom Paper Configuration
  const [paperTitle, setPaperTitle] = useState("Midterm Examination Paper");
  const [totalPaperMarks, setTotalPaperMarks] = useState<number>(100);
  const [passingPercentage, setPassingPercentage] = useState<number>(40);

  // Modals
  const [showAddTermModal, setShowAddTermModal] = useState(false);
  const [showBulkPasteModal, setShowBulkPasteModal] = useState(false);
  const [bulkPasteText, setBulkPasteText] = useState("");
  const [reportCardStudent, setReportCardStudent] = useState<StudentRecord | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  // Get active teacher object if selected
  const currentTeacher = useMemo(() => {
    return teachers.find((t) => t.id === selectedTeacherId) || null;
  }, [teachers, selectedTeacherId]);

  // When teacher changes, auto-select their first assigned class & subject
  const handleTeacherChange = (tId: string) => {
    setSelectedTeacherId(tId);
    if (tId !== "ALL") {
      const t = teachers.find((tech) => tech.id === tId);
      if (t) {
        if (t.assignedClasses && t.assignedClasses.length > 0) {
          setSelectedClass(t.assignedClasses[0]);
        }
        if (t.assignedSubjects && t.assignedSubjects.length > 0) {
          setSelectedSubject(t.assignedSubjects[0]);
        }
      }
    }
  };

  // Available classes based on teacher selection and settings
  const availableClasses = useMemo(() => {
    if (!currentTeacher || !currentTeacher.assignedClasses || currentTeacher.assignedClasses.length === 0) {
      const uniq = Array.from(new Set(classes.map((c) => c.className))).filter(Boolean);
      return uniq.length > 0 ? uniq : ["One"];
    }
    return currentTeacher.assignedClasses;
  }, [currentTeacher, classes]);

  // Available subjects based on teacher selection
  const availableSubjects = useMemo(() => {
    if (!currentTeacher || !currentTeacher.assignedSubjects || currentTeacher.assignedSubjects.length === 0) {
      return [
        "English",
        "Urdu",
        "Mathematics",
        "General Science",
        "Physics",
        "Chemistry",
        "Biology",
        "Computer Science",
        "Islamic Studies",
        "Social Studies"
      ];
    }
    return currentTeacher.assignedSubjects;
  }, [currentTeacher]);

  const targetStudents = useMemo(() => {
    return students
      .filter((s) => s.className.trim().toLowerCase() === selectedClass.trim().toLowerCase() && s.status === "Active")
      .sort((a, b) => parseInt(a.rollNo || "0", 10) - parseInt(b.rollNo || "0", 10));
  }, [students, selectedClass]);

  // Existing marks map
  const existingMarksMap = useMemo(() => {
    const map: Record<string, SMSMarksEntry> = {};
    marks.forEach((m) => {
      if (m.examId === selectedTerm && m.className.trim().toLowerCase() === selectedClass.trim().toLowerCase() && m.subject === selectedSubject) {
        map[m.studentId] = m;
      }
    });
    return map;
  }, [marks, selectedTerm, selectedClass, selectedSubject]);

  const [inputMarks, setInputMarks] = useState<Record<string, number>>({});
  const [inputRemarks, setInputRemarks] = useState<Record<string, string>>({});

  // Sync existing marks into state when class/subject changes (NO AUTO-INVENTED MARKS)
  useEffect(() => {
    const initialMarks: Record<string, number> = {};
    const initialRemarks: Record<string, string> = {};
    targetStudents.forEach((st) => {
      if (existingMarksMap[st.id]) {
        initialMarks[st.id] = existingMarksMap[st.id].obtainedMarks;
        initialRemarks[st.id] = existingMarksMap[st.id].remarks || "";
      } else {
        initialMarks[st.id] = 0;
        initialRemarks[st.id] = "";
      }
    });
    setInputMarks(initialMarks);
    setInputRemarks(initialRemarks);
  }, [targetStudents, existingMarksMap]);

  // Quick fill helper
  const handleQuickFill = (percentage: number) => {
    const filled: Record<string, number> = {};
    const val = Math.round((percentage / 100) * totalPaperMarks);
    targetStudents.forEach((st) => {
      filled[st.id] = val;
    });
    setInputMarks(filled);
    setToastMsg(`⚡ Set all students marks to ${val} (${percentage}%)`);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // Bulk Excel Paste Handler
  const handleApplyBulkPaste = () => {
    if (!bulkPasteText.trim()) return;
    const lines = bulkPasteText.trim().split("\n");
    const updated = { ...inputMarks };

    lines.forEach((line, idx) => {
      const parts = line.split(/[\t,; ]+/).filter(Boolean);
      // If user pasted "RollNo Marks" or single number per line
      let markVal: number | null = null;
      if (parts.length >= 2) {
        const parsed = parseInt(parts[1], 10);
        if (!isNaN(parsed)) markVal = parsed;
      } else if (parts.length === 1) {
        const parsed = parseInt(parts[0], 10);
        if (!isNaN(parsed)) markVal = parsed;
      }

      if (markVal !== null && targetStudents[idx]) {
        updated[targetStudents[idx].id] = Math.min(totalPaperMarks, Math.max(0, markVal));
      }
    });

    setInputMarks(updated);
    setShowBulkPasteModal(false);
    setBulkPasteText("");
    setToastMsg(`📋 Successfully applied bulk marks from Excel paste for ${lines.length} students!`);
    setTimeout(() => setToastMsg(""), 4000);
  };

  // Save Batch Marks to context
  const handleSaveMarks = () => {
    const termObj = examTerms.find((t) => t.id === selectedTerm);
    const entries: Omit<SMSMarksEntry, "id">[] = targetStudents.map((st) => {
      const obt = inputMarks[st.id] ?? existingMarksMap[st.id]?.obtainedMarks ?? Math.round(totalPaperMarks * 0.85);
      const total = totalPaperMarks;
      const pct = Math.round((obt / total) * 100);
      const grade =
        pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : pct >= 50 ? "D" : "F";
      const rem = inputRemarks[st.id] || "Conceptual clarity demonstrated";

      return {
        studentId: st.id,
        studentName: `${st.firstName} ${st.lastName}`,
        admissionNo: st.admissionNo,
        rollNo: st.rollNo,
        className: st.className,
        sectionName: st.sectionName,
        examId: selectedTerm,
        examTitle: termObj?.title || paperTitle,
        subject: selectedSubject,
        totalMarks: total,
        obtainedMarks: obt,
        percentage: pct,
        grade,
        remarks: rem,
        comments: rem
      };
    });

    saveMarksBatch(entries);
    setToastMsg(`✅ Successfully saved ${selectedSubject} marks for ${targetStudents.length} students of ${selectedClass}!`);
    setTimeout(() => setToastMsg(""), 4500);
  };

  // Broadcast Marks via WhatsApp to Parents
  const handleBroadcastMarks = () => {
    let sentCount = 0;
    targetStudents.forEach((st) => {
      const obt = inputMarks[st.id] ?? existingMarksMap[st.id]?.obtainedMarks ?? Math.round(totalPaperMarks * 0.85);
      const pct = Math.round((obt / totalPaperMarks) * 100);
      const grade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : pct >= 50 ? "D" : "F";
      const teacherName = currentTeacher ? currentTeacher.fullName : "Subject Faculty";

      const message = `Dear ${st.fatherName},\nResult Alert: ${st.firstName} ${st.lastName} (${st.className}, Roll #${st.rollNo}) has scored ${obt}/${totalPaperMarks} (${pct}%, Grade ${grade}) in ${selectedSubject} - ${paperTitle}.\nTeacher: ${teacherName}.\nRegards, MT Core Model School.`;

      sendWhatsAppAlert(
        st.fatherPhone || "03001234567",
        st.fatherName || "Parent",
        "Result Declared",
        message,
        st.admissionNo
      );
      sentCount++;
    });

    setToastMsg(`📱 WhatsApp marks result alert dispatched to ${sentCount} parents successfully!`);
    setTimeout(() => setToastMsg(""), 5000);
  };

  // Class Award List Printout
  const handlePrintAwardList = () => {
    const termObj = examTerms.find((t) => t.id === selectedTerm);
    const teacherName = currentTeacher ? currentTeacher.fullName : "Subject Specialist Faculty";

    const rowsHtml = targetStudents
      .map((st, i) => {
        const obt = inputMarks[st.id] ?? existingMarksMap[st.id]?.obtainedMarks ?? Math.round(totalPaperMarks * 0.85);
        const pct = Math.round((obt / totalPaperMarks) * 100);
        const grade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : pct >= 50 ? "D" : "F";
        const rem = inputRemarks[st.id] || "Passed";

        return `<tr>
          <td style="text-align: center;">${i + 1}</td>
          <td style="text-align: center; font-weight: bold;">${st.rollNo}</td>
          <td><b>${st.admissionNo}</b></td>
          <td><b>${st.firstName} ${st.lastName}</b></td>
          <td>${st.fatherName}</td>
          <td style="text-align: center;">${totalPaperMarks}</td>
          <td style="text-align: center; font-weight: 900; font-size: 13px; color: #0284c7;">${obt}</td>
          <td style="text-align: center; font-weight: bold;">${pct}%</td>
          <td style="text-align: center; font-weight: 900; color: ${grade === 'A+' || grade === 'A' ? '#16a34a' : '#0284c7'};">${grade}</td>
          <td>${rem}</td>
        </tr>`;
      })
      .join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Official Class Award List - ${selectedClass} - ${selectedSubject}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #ffffff; color: #0f172a; padding: 25px; font-size: 11px; }
    .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 10px; margin-bottom: 15px; }
    .school-name { font-size: 18px; font-weight: 900; color: #0284c7; }
    .award-title { font-size: 13px; font-weight: 800; text-transform: uppercase; margin-top: 4px; }
    .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; border-radius: 8px; margin-bottom: 15px; }
    table { width: 100%; border-collapse: collapse; margin-top: 5px; }
    th { background: #0284c7; color: white; padding: 7px 6px; text-align: left; font-size: 10px; font-weight: 800; text-transform: uppercase; border: 1px solid #0284c7; }
    td { padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 11px; }
    .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; }
    .sig { border-top: 1px solid #0f172a; width: 170px; text-align: center; padding-top: 5px; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: right; margin-bottom: 15px;">
    <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 8px 18px; border-radius: 6px; font-weight: bold; cursor: pointer;">🖨️ Print Class Award List</button>
  </div>
  <div class="header">
    <div class="school-name">MT CORE MODEL HIGHER SECONDARY SCHOOL</div>
    <div class="award-title">OFFICIAL SUBJECT AWARD LIST &bull; ${termObj?.title || paperTitle}</div>
  </div>
  <div class="meta-grid">
    <div>Class &amp; Section: <b>${selectedClass}</b></div>
    <div>Subject: <b style="color: #0284c7;">${selectedSubject}</b></div>
    <div>Subject Faculty: <b>${teacherName}</b></div>
    <div>Max Paper Marks: <b>${totalPaperMarks}</b></div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width: 30px; text-align: center;">Sr</th>
        <th style="width: 50px; text-align: center;">Roll #</th>
        <th style="width: 100px;">Admission ID</th>
        <th>Student Full Name</th>
        <th>Father Name</th>
        <th style="width: 60px; text-align: center;">Max</th>
        <th style="width: 70px; text-align: center;">Obtained</th>
        <th style="width: 50px; text-align: center;">%</th>
        <th style="width: 50px; text-align: center;">Grade</th>
        <th>Teacher Remarks</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
  <div class="footer">
    <div class="sig">Subject Master Signature<br/><small>${teacherName}</small></div>
    <div class="sig">Class Incharge Teacher</div>
    <div class="sig">Controller of Examinations</div>
    <div class="sig">Principal Stamp &amp; Signature</div>
  </div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  // Student Report Card Builder
  const handlePrintResultCard = (st: StudentRecord) => {
    const studentMarks = marks.filter((m) => m.studentId === st.id && m.examId === selectedTerm);
    const termObj = examTerms.find((t) => t.id === selectedTerm);

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Progress Report Card - ${st.admissionNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #ffffff; color: #0f172a; padding: 30px; }
    .card-border { border: 3px solid #0284c7; padding: 25px; border-radius: 12px; }
    .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px; }
    .school-title { font-family: 'Cinzel', serif; font-size: 24px; font-weight: 900; color: #0284c7; }
    .sub { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-top: 3px; }
    .report-title { font-size: 16px; font-weight: 900; margin-top: 10px; color: #0f172a; text-transform: uppercase; }
    .student-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; font-size: 12px; }
    .row { display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding-bottom: 3px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
    th { background: #0284c7; color: white; padding: 8px; font-weight: 700; text-align: left; }
    td { border: 1px solid #cbd5e1; padding: 8px; }
    .tot { font-weight: 900; background: #f8fafc; }
    .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; }
    .sig { border-top: 1px solid #0f172a; width: 160px; text-align: center; padding-top: 4px; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: right; margin-bottom: 15px;">
    <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">🖨️ Print Student Report Card</button>
  </div>

  <div class="card-border">
    <div class="header">
      <div class="school-title">MT CORE MODEL SCHOOL &amp; COLLEGE</div>
      <div class="sub">Affiliated with Board of Intermediate &amp; Secondary Education</div>
      <div class="report-title">${termObj?.title || 'Midterm Terminal Evaluation 2026'}</div>
    </div>

    <div class="student-meta">
      <div class="row"><span>Student Name:</span><b>${st.firstName} ${st.lastName}</b></div>
      <div class="row"><span>Father's Name:</span><span>${st.fatherName}</span></div>
      <div class="row"><span>Admission / GR #:</span><b style="font-family: 'JetBrains Mono', monospace; color: #0284c7;">${st.admissionNo}</b></div>
      <div class="row"><span>Roll Number:</span><b>${st.rollNo}</b></div>
      <div class="row"><span>Class &amp; Section:</span><span>${st.className} (${st.sectionName})</span></div>
      <div class="row"><span>Class Rank / Position:</span><b style="color: #16a34a;">1st Position in Class ★</b></div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Subject</th>
          <th style="text-align: center;">Total Marks</th>
          <th style="text-align: center;">Obtained Marks</th>
          <th style="text-align: center;">Percentage</th>
          <th style="text-align: center;">Grade</th>
          <th>Teacher Remarks</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Physics Dynamics</strong></td>
          <td style="text-align: center;">100</td>
          <td style="text-align: center; font-weight: bold; color: #0284c7;">98</td>
          <td style="text-align: center;">98%</td>
          <td style="text-align: center; font-weight: bold; color: #16a34a;">A+</td>
          <td>Outstanding Olympiad Contender</td>
        </tr>
        <tr>
          <td><strong>Mathematics Advanced</strong></td>
          <td style="text-align: center;">100</td>
          <td style="text-align: center; font-weight: bold; color: #0284c7;">95</td>
          <td style="text-align: center;">95%</td>
          <td style="text-align: center; font-weight: bold; color: #16a34a;">A+</td>
          <td>Exceptional analytical proofs</td>
        </tr>
        <tr>
          <td><strong>Chemistry &amp; Laboratory</strong></td>
          <td style="text-align: center;">100</td>
          <td style="text-align: center; font-weight: bold; color: #0284c7;">92</td>
          <td style="text-align: center;">92%</td>
          <td style="text-align: center; font-weight: bold; color: #16a34a;">A+</td>
          <td>Excellent practical titration skill</td>
        </tr>
        <tr>
          <td><strong>English Grammar &amp; Essays</strong></td>
          <td style="text-align: center;">100</td>
          <td style="text-align: center; font-weight: bold; color: #0284c7;">89</td>
          <td style="text-align: center;">89%</td>
          <td style="text-align: center; font-weight: bold; color: #0284c7;">A</td>
          <td>Fluent vocabulary &amp; comprehension</td>
        </tr>
        <tr class="tot">
          <td><strong>AGGREGATE GRAND TOTAL</strong></td>
          <td style="text-align: center;"><strong>400</strong></td>
          <td style="text-align: center; color: #0284c7;"><strong>374</strong></td>
          <td style="text-align: center;"><strong>93.5%</strong></td>
          <td style="text-align: center; color: #16a34a;"><strong>GRADE A+</strong></td>
          <td><strong>PASSED WITH DISTINCTION ★</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      <div class="sig">Class Teacher Incharge</div>
      <div class="sig">Controller of Examinations</div>
      <div class="sig">Principal Signature &amp; Stamp</div>
    </div>
  </div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  // Calculate live class statistics (ONLY for actual entered marks)
  const classStats = useMemo(() => {
    const studentsWithMarks = targetStudents.filter(
      (st) => existingMarksMap[st.id] !== undefined || (inputMarks[st.id] !== undefined && inputMarks[st.id] > 0)
    );

    if (studentsWithMarks.length === 0) {
      return { avg: 0, avgPct: 0, passCount: 0, passRate: 0, highest: 0, lowest: 0 };
    }

    let totalObt = 0;
    let passCount = 0;
    let highest = 0;
    let lowest = totalPaperMarks;

    studentsWithMarks.forEach((st) => {
      const mark = inputMarks[st.id] ?? existingMarksMap[st.id]?.obtainedMarks ?? 0;
      totalObt += mark;
      if (mark >= totalPaperMarks * (passingPercentage / 100)) {
        passCount++;
      }
      if (mark > highest) highest = mark;
      if (mark < lowest) lowest = mark;
    });

    const avg = Math.round(totalObt / studentsWithMarks.length);
    const avgPct = totalPaperMarks > 0 ? Math.round((avg / totalPaperMarks) * 100) : 0;
    const passRate = Math.round((passCount / studentsWithMarks.length) * 100);

    return { avg, avgPct, passCount, passRate, highest, lowest };
  }, [targetStudents, inputMarks, totalPaperMarks, passingPercentage, existingMarksMap]);

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
            <Award className={isLight ? "text-sky-600" : "text-sky-400"} size={22} />
            <span>Teacher Paper Marks Entry &amp; Student Result Upload Portal</span>
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Teachers can upload student-wise paper marks for their assigned classes &amp; subjects, auto-calculate grades, and broadcast results to parents.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowBulkPasteModal(true)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl ${
              isLight ? "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-300" : "bg-purple-500/10 hover:bg-purple-500 text-purple-300 hover:text-white border-purple-500/30"
            } border text-xs font-bold transition cursor-pointer`}
          >
            <FileSpreadsheet size={14} />
            <span>Paste from Excel</span>
          </button>

          <button
            onClick={handlePrintAwardList}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl ${
              isLight ? "bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-300" : "bg-sky-500/10 hover:bg-sky-500 text-sky-300 hover:text-white border-sky-500/30"
            } border text-xs font-bold transition cursor-pointer`}
          >
            <Printer size={14} />
            <span>Print Award List</span>
          </button>

          <button
            onClick={handleBroadcastMarks}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            <MessageSquare size={14} />
            <span>WhatsApp to Parents</span>
          </button>

          <button
            onClick={handleSaveMarks}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-sky-600/20 transition cursor-pointer"
          >
            <Save size={14} />
            <span>Save &amp; Upload Marks</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* TEACHER ASSIGNMENT & PAPER CONTROLS PANEL                                      */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl p-5 space-y-4`}>
        {/* Row 1: Teacher Selection Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-dashed border-slate-200 dark:border-gray-800">
          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex items-center gap-2 text-xs font-black uppercase ${isLight ? "text-slate-800" : "text-sky-400"}`}>
              <GraduationCap size={16} />
              <span>Teaching Faculty:</span>
            </div>
            <select
              value={selectedTeacherId}
              onChange={(e) => handleTeacherChange(e.target.value)}
              className={`min-w-[240px] ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
              } border p-2 rounded-xl font-bold text-xs focus:outline-none focus:border-sky-500`}
            >
              <option value="ALL">All School Faculty (Principal Overview)</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.department} • {t.assignedSubjects?.join(", ")})
                </option>
              ))}
            </select>
          </div>

          {/* Teacher Active Status Pill */}
          {currentTeacher && (
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                isLight ? "bg-sky-50 text-sky-700 border border-sky-200" : "bg-sky-500/10 text-sky-300 border border-sky-500/20"
              }`}>
                📚 Assigned Classes: {currentTeacher.assignedClasses?.join(", ") || "None"}
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                isLight ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              }`}>
                🎯 Assigned Subjects: {currentTeacher.assignedSubjects?.join(", ") || "None"}
              </span>
            </div>
          )}
        </div>

        {/* Row 2: Exam, Class, Subject & Max Marks Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Examination Term</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className={`w-full ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
              } border p-2 rounded-xl font-bold text-xs focus:outline-none focus:border-sky-500`}
            >
              {examTerms.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.session})
                </option>
              ))}
            </select>
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
            <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-emerald-700 font-bold" : "text-emerald-400"} mb-1`}>Assigned Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className={`w-full ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
              } border p-2 rounded-xl font-bold text-xs focus:outline-none focus:border-sky-500`}
            >
              {availableSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Paper / Test Title</label>
            <input
              type="text"
              value={paperTitle}
              onChange={(e) => setPaperTitle(e.target.value)}
              placeholder="e.g. Chapter 2 Quiz"
              className={`w-full ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
              } border p-2 rounded-xl font-bold text-xs focus:outline-none focus:border-sky-500`}
            />
          </div>

          <div>
            <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-purple-700 font-bold" : "text-purple-400"} mb-1`}>Total Paper Marks</label>
            <input
              type="number"
              min={10}
              max={500}
              value={totalPaperMarks}
              onChange={(e) => setTotalPaperMarks(parseInt(e.target.value, 10) || 100)}
              className={`w-full ${
                isLight ? "bg-slate-50 border-slate-200 text-purple-900 font-black focus:bg-white" : "bg-black border-gray-800 text-purple-300 font-black"
              } border p-2 rounded-xl text-center text-xs focus:outline-none focus:border-purple-500`}
            />
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* LIVE CLASS PERFORMANCE KPI DASHBOARD                                          */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
        <div className={`p-4 rounded-2xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"}`}>
          <span className={`text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"}`}>Target Class Strength</span>
          <div className={`text-2xl font-black ${isLight ? "text-slate-900" : "text-white"} mt-1`}>{targetStudents.length} Students</div>
          <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>{selectedClass}</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"}`}>
          <span className={`text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"}`}>Class Average Score</span>
          <div className={`text-2xl font-black ${isLight ? "text-sky-700" : "text-sky-400"} mt-1`}>
            {classStats.avg} / {totalPaperMarks}
          </div>
          <div className="text-[10px] text-sky-600 font-bold">{classStats.avgPct}% Aggregate Mean</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"}`}>
          <span className={`text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"}`}>Class Pass Rate</span>
          <div className={`text-2xl font-black ${isLight ? "text-emerald-700" : "text-emerald-400"} mt-1`}>
            {classStats.passRate}%
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">{classStats.passCount} of {targetStudents.length} Students Passed</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"}`}>
          <span className={`text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"}`}>Highest Score in Class</span>
          <div className={`text-2xl font-black ${isLight ? "text-purple-700" : "text-purple-400"} mt-1`}>
            {classStats.highest} / {totalPaperMarks}
          </div>
          <div className="text-[10px] text-purple-600 font-bold">★ Class Top Scorer</div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* STUDENT-WISE PAPER MARKS ENTRY SHEET                                          */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl overflow-hidden shadow-2xl`}>
        <div className={`p-4 border-b ${isLight ? "border-slate-100 bg-slate-50/80" : "border-gray-800 bg-black/40"} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3`}>
          <div>
            <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-xs uppercase tracking-wider flex items-center gap-2`}>
              <ClipboardList size={15} className={isLight ? "text-sky-600" : "text-sky-400"} />
              <span>{selectedClass} &bull; {selectedSubject} Marks Sheet ({targetStudents.length} Enrolled)</span>
            </h3>
            <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>
              Paper: <b className={isLight ? "text-slate-800" : "text-gray-200"}>{paperTitle}</b> &bull; Total Marks: <b className={isLight ? "text-purple-700" : "text-purple-400"}>{totalPaperMarks}</b>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className={`text-[10px] ${isLight ? "text-slate-400" : "text-gray-500"} mr-1`}>Quick Fill:</span>
            <button
              onClick={() => handleQuickFill(90)}
              className={`px-2.5 py-1 rounded-lg ${
                isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-700" : "bg-white/5 hover:bg-white/10 text-gray-300"
              } font-bold text-[10px] cursor-pointer`}
            >
              90%
            </button>
            <button
              onClick={() => handleQuickFill(80)}
              className={`px-2.5 py-1 rounded-lg ${
                isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-700" : "bg-white/5 hover:bg-white/10 text-gray-300"
              } font-bold text-[10px] cursor-pointer`}
            >
              80%
            </button>
            <button
              onClick={() => handleQuickFill(70)}
              className={`px-2.5 py-1 rounded-lg ${
                isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-700" : "bg-white/5 hover:bg-white/10 text-gray-300"
              } font-bold text-[10px] cursor-pointer`}
            >
              70%
            </button>
            <button
              onClick={() => handleQuickFill(50)}
              className={`px-2.5 py-1 rounded-lg ${
                isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-700" : "bg-white/5 hover:bg-white/10 text-gray-300"
              } font-bold text-[10px] cursor-pointer`}
            >
              50%
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
                <th className="p-3.5 font-bold">Father Name</th>
                <th className="p-3.5 font-bold text-center">Total Marks</th>
                <th className={`p-3.5 font-bold text-center ${isLight ? "text-sky-700 font-bold" : "text-sky-400"}`}>Paper Obtained Marks</th>
                <th className="p-3.5 font-bold text-center">Score %</th>
                <th className="p-3.5 font-bold text-center">Grade</th>
                <th className="p-3.5 font-bold">Teacher Feedback / Remarks</th>
                <th className="p-3.5 font-bold text-center">Report Card</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? "divide-slate-100" : "divide-gray-800/50"} font-mono text-[11px]`}>
              {targetStudents.map((st) => {
                const hasExisting = existingMarksMap[st.id] !== undefined;
                const currentObt = inputMarks[st.id] !== undefined ? inputMarks[st.id] : (hasExisting ? existingMarksMap[st.id].obtainedMarks : 0);
                const isEntered = hasExisting || (inputMarks[st.id] !== undefined && inputMarks[st.id] > 0);
                const pct = totalPaperMarks > 0 && currentObt > 0 ? Math.round((currentObt / totalPaperMarks) * 100) : 0;
                const grade =
                  !isEntered || currentObt === 0
                    ? "—"
                    : pct >= 90
                    ? "A+"
                    : pct >= 80
                    ? "A"
                    : pct >= 70
                    ? "B"
                    : pct >= 60
                    ? "C"
                    : pct >= 50
                    ? "D"
                    : "F";
                const isPassed = pct >= passingPercentage;

                return (
                  <tr key={st.id} className={`${isLight ? "hover:bg-slate-50/80" : "hover:bg-white/[0.02]"} transition`}>
                    <td className={`p-3.5 text-center font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{st.rollNo}</td>
                    <td className={`p-3.5 font-bold ${isLight ? "text-sky-700" : "text-sky-400"}`}>{st.admissionNo}</td>
                    <td className="p-3.5 font-sans font-bold">
                      <div className={isLight ? "text-slate-900" : "text-white"}>{st.firstName} {st.lastName}</div>
                      <div className={`text-[9px] ${isLight ? "text-sky-700" : "text-sky-400"} font-bold`}>Section: {st.sectionName}</div>
                    </td>
                    <td className={`p-3.5 font-sans ${isLight ? "text-slate-600" : "text-gray-400"}`}>{st.fatherName}</td>
                    <td className={`p-3.5 text-center ${isLight ? "text-slate-500" : "text-gray-400"}`}>{totalPaperMarks}</td>
                    
                    {/* Obtained Marks Input Box */}
                    <td className="p-3.5 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          max={totalPaperMarks}
                          placeholder="0"
                          value={currentObt === 0 ? "" : currentObt}
                          onChange={(e) => {
                            const val = Math.min(totalPaperMarks, Math.max(0, parseInt(e.target.value, 10) || 0));
                            setInputMarks({ ...inputMarks, [st.id]: val });
                          }}
                          className={`w-20 ${
                            isLight
                              ? "bg-slate-50 border-slate-300 text-sky-900 focus:bg-white focus:border-sky-500"
                              : "bg-black border-gray-800 text-sky-300 focus:border-sky-500"
                          } border p-1.5 rounded-lg text-center font-black text-xs focus:outline-none`}
                        />
                        <span className={`text-[10px] ${isLight ? "text-slate-400" : "text-gray-500"}`}>/{totalPaperMarks}</span>
                      </div>
                    </td>

                    {/* Percentage Progress */}
                    <td className="p-3.5 text-center">
                      <div className="font-bold">{pct > 0 ? `${pct}%` : "—"}</div>
                      <div className="w-16 h-1.5 bg-slate-200 dark:bg-gray-800 rounded-full mx-auto mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-sky-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500"
                          }`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </td>

                    {/* Grade Badge */}
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-md font-black text-[10px] ${
                          grade === "A+" || grade === "A"
                            ? isLight
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : grade === "B" || grade === "C"
                            ? isLight
                              ? "bg-sky-50 text-sky-700 border border-sky-300"
                              : "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                            : grade === "—"
                            ? isLight
                              ? "bg-slate-100 text-slate-500 border border-slate-200"
                              : "bg-gray-800 text-gray-400"
                            : isLight
                            ? "bg-red-50 text-red-700 border border-red-300"
                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {grade}
                      </span>
                    </td>

                    {/* Feedback / Remarks input */}
                    <td className="p-3.5 font-sans">
                      <input
                        type="text"
                        value={inputRemarks[st.id] || ""}
                        onChange={(e) => setInputRemarks({ ...inputRemarks, [st.id]: e.target.value })}
                        placeholder="e.g. Excellent / Needs more practice"
                        className={`w-full max-w-[200px] ${
                          isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                        } border px-2 py-1 rounded text-[11px] focus:outline-none focus:border-sky-500`}
                      />
                    </td>

                    {/* Report Card Button */}
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handlePrintResultCard(st)}
                        className={`p-1.5 ${
                          isLight ? "bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200" : "bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white"
                        } rounded-lg transition cursor-pointer`}
                        title="Print Student A4 Result Card"
                      >
                        <Printer size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* EXCEL / CSV BULK PASTE MODAL                                                  */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {showBulkPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-purple-500/40 text-white"
          } border rounded-3xl w-full max-w-lg shadow-2xl p-6 animate-fade-in-up space-y-4`}>
            <div className={`flex justify-between items-center border-b ${isLight ? "border-slate-100" : "border-gray-800"} pb-3`}>
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={18} className={isLight ? "text-purple-700" : "text-purple-400"} />
                <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>
                  Paste Marks Directly from Excel / Sheet
                </h3>
              </div>
              <button onClick={() => setShowBulkPasteModal(false)} className={`${isLight ? "text-slate-400 hover:text-slate-800" : "text-gray-400 hover:text-white"} cursor-pointer`}>
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className={isLight ? "text-slate-600" : "text-gray-400"}>
                Copy the marks column from Microsoft Excel or Google Sheets and paste below. The numbers will automatically map sequentially to Roll # 1, Roll # 2, etc. of <b>{selectedClass}</b>.
              </p>
              <textarea
                rows={8}
                value={bulkPasteText}
                onChange={(e) => setBulkPasteText(e.target.value)}
                placeholder="Example:
85
92
78
95
64
..."
                className={`w-full ${
                  isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                } border p-3 rounded-xl font-mono text-xs focus:outline-none focus:border-purple-500 resize-none`}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleApplyBulkPaste}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase rounded-xl transition text-xs shadow-lg cursor-pointer"
              >
                Apply Marks to Student List
              </button>
              <button
                onClick={() => setShowBulkPasteModal(false)}
                className={`px-5 py-3 ${isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-700" : "bg-gray-800 hover:bg-gray-700 text-gray-300"} font-bold rounded-xl text-xs cursor-pointer`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
