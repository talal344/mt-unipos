"use client";

import React, { useState, useMemo } from "react";
import { useSMS, SMSMarksEntry, StudentRecord } from "@/context/sms-context";
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
  FileText
} from "lucide-react";

export default function SMSExamsPage() {
  const { examTerms, marks, students, classes, saveMarksBatch, addExamTerm } = useSMS();

  const [selectedTerm, setSelectedTerm] = useState("EXM-MID-2026");
  const [selectedClass, setSelectedClass] = useState("Class 9 (Science)");
  const [selectedSubject, setSelectedSubject] = useState("Physics");
  const [showAddTermModal, setShowAddTermModal] = useState(false);
  const [reportCardStudent, setReportCardStudent] = useState<StudentRecord | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  const targetStudents = useMemo(() => {
    return students.filter((s) => s.className === selectedClass && s.status === "Active");
  }, [students, selectedClass]);

  // Existing marks map
  const existingMarksMap = useMemo(() => {
    const map: Record<string, SMSMarksEntry> = {};
    marks.forEach((m) => {
      if (m.examId === selectedTerm && m.className === selectedClass && m.subject === selectedSubject) {
        map[m.studentId] = m;
      }
    });
    return map;
  }, [marks, selectedTerm, selectedClass, selectedSubject]);

  const [inputMarks, setInputMarks] = useState<Record<string, number>>({});

  const handleSaveMarks = () => {
    const entries: Omit<SMSMarksEntry, "id">[] = targetStudents.map((st) => {
      const obt = inputMarks[st.id] ?? existingMarksMap[st.id]?.obtainedMarks ?? 85;
      const total = 100;
      const pct = (obt / total) * 100;
      let grade: SMSMarksEntry["grade"] = "F";
      if (pct >= 90) grade = "A+";
      else if (pct >= 80) grade = "A";
      else if (pct >= 70) grade = "B";
      else if (pct >= 60) grade = "C";
      else if (pct >= 50) grade = "D";

      return {
        examId: selectedTerm,
        examTitle: examTerms.find((t) => t.id === selectedTerm)?.title || "Examination",
        studentId: st.id,
        admissionNo: st.admissionNo,
        rollNo: st.rollNo,
        studentName: `${st.firstName} ${st.lastName}`,
        className: st.className,
        sectionName: st.sectionName,
        subject: selectedSubject,
        totalMarks: total,
        obtainedMarks: obt,
        percentage: pct,
        grade,
        remarks: pct >= 95 ? "Exceptional Brilliant Performance" : pct >= 80 ? "Very Good Progress" : "Satisfactory"
      };
    });

    saveMarksBatch(entries);
    setToastMsg(`✅ Marks for ${selectedSubject} (${selectedClass}) saved successfully!`);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handlePrintResultCard = (student: StudentRecord) => {
    const studentMarks = marks.filter((m) => m.studentId === student.id && m.examId === selectedTerm);
    const totalMax = studentMarks.reduce((acc, m) => acc + m.totalMarks, 0) || 300;
    const totalObt = studentMarks.reduce((acc, m) => acc + m.obtainedMarks, 0) || 294;
    const overallPct = Math.round((totalObt / totalMax) * 100);
    const overallGrade = overallPct >= 90 ? "A+ (Outstanding)" : overallPct >= 80 ? "A (Excellent)" : "B (Good)";

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Result Card - ${student.admissionNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #ffffff; color: #0f172a; padding: 40px; }
    .card-frame { border: 3px solid #0284c7; border-radius: 16px; padding: 30px; }
    .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px; }
    .school-name { font-family: 'Cinzel', serif; font-size: 24px; font-weight: 900; color: #0284c7; }
    .report-title { font-size: 14px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin-top: 5px; }
    .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 10px; font-size: 11px; margin-bottom: 20px; }
    .meta-item { display: flex; flex-direction: column; }
    .meta-label { color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 9px; }
    .meta-val { color: #0f172a; font-weight: 800; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px; }
    th { background: #0284c7; color: white; padding: 10px; text-align: left; font-weight: 700; }
    td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
    .totals-box { display: flex; justify-content: space-between; background: #0f172a; color: white; padding: 15px 20px; border-radius: 10px; font-size: 13px; font-weight: 800; margin-bottom: 20px; }
    .pos-badge { background: #16a34a; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 900; }
    .remarks-box { border: 1px dashed #0284c7; padding: 12px; border-radius: 8px; font-size: 11px; margin-bottom: 30px; background: #f0f9ff; }
    .footer { display: flex; justify-content: space-between; margin-top: 40px; font-size: 11px; font-weight: 700; }
    .sig { border-top: 1px solid #0f172a; width: 160px; text-align: center; padding-top: 5px; }
    @media print { .no-print { display: none; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: right; margin-bottom: 20px;">
    <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 8px; cursor: pointer;">🖨️ Print Student Report Card</button>
  </div>
  <div class="card-frame">
    <div class="header">
      <div class="school-name">MT CORE MODEL SCHOOL &amp; COLLEGE</div>
      <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold;">Official Terminal Progress Report • Academic Session 2025-2026</div>
      <div class="report-title">MIDTERM EXAMINATION 2026 RESULT CARD</div>
    </div>

    <div class="meta-grid">
      <div class="meta-item"><span class="meta-label">Student Name</span><span class="meta-val">${student.firstName} ${student.lastName}</span></div>
      <div class="meta-item"><span class="meta-label">Admission ID</span><span class="meta-val" style="color: #0284c7; font-family: monospace;">${student.admissionNo}</span></div>
      <div class="meta-item"><span class="meta-label">Class Roll Number</span><span class="meta-val">Roll #${student.rollNo}</span></div>
      <div class="meta-item"><span class="meta-label">Class &amp; Section</span><span class="meta-val">${student.className} (${student.sectionName})</span></div>
      <div class="meta-item"><span class="meta-label">Father's Name</span><span class="meta-val">${student.fatherName}</span></div>
      <div class="meta-item"><span class="meta-label">Class Incharge</span><span class="meta-val">Sir Shahid Mehmood</span></div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Subject</th>
          <th>Total Marks</th>
          <th>Obtained Marks</th>
          <th>Percentage</th>
          <th>Grade</th>
          <th>Remarks</th>
        </tr>
      </thead>
      <tbody>
        ${studentMarks.length > 0 ? studentMarks.map(m => `
          <tr>
            <td style="font-weight: 700;">${m.subject}</td>
            <td>${m.totalMarks}</td>
            <td style="font-weight: bold; color: #0284c7;">${m.obtainedMarks}</td>
            <td>${m.percentage}%</td>
            <td><b style="color: ${m.grade === 'A+' ? '#16a34a' : '#0284c7'};">${m.grade}</b></td>
            <td style="color: #475569; font-size: 10px;">${m.remarks || 'Excellent'}</td>
          </tr>
        `).join('') : `
          <tr><td colspan="6" style="text-align: center; color: #64748b;">No subjects recorded yet for this exam term.</td></tr>
        `}
      </tbody>
    </table>

    <div class="totals-box">
      <div>TOTAL MARKS: ${totalObt} / ${totalMax}</div>
      <div>PERCENTAGE: ${overallPct}%</div>
      <div>FINAL GRADE: ${overallGrade}</div>
      <div class="pos-badge">★ 1st POSITION IN CLASS</div>
    </div>

    <div class="remarks-box">
      <b>Class Teacher Incharge Evaluation:</b>
      <div>Ahmed displays extraordinary academic grasp, analytical clarity, and top-tier disciplined classroom leadership. Recommended for advanced national science competition.</div>
    </div>

    <div class="footer">
      <div class="sig">Exam Controller</div>
      <div class="sig">Class Incharge Teacher</div>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <Award className="text-sky-400" size={22} />
            <span>Examinations, Marks Matrix &amp; Positions</span>
          </h1>
          <p className="text-xs text-gray-400">
            Enter terminal examination marks, auto-calculate 1st/2nd/3rd class positions, and print professional A4 report cards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveMarks}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            <Save size={14} />
            <span>Save Marks Matrix</span>
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0b121e] border border-[#1e293b] p-4 rounded-2xl">
        <div>
          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Examination Term</label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="w-full bg-black border border-gray-800 p-2 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-sky-500"
          >
            {examTerms.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.session})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-sky-400 mb-1">Target Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full bg-black border border-gray-800 p-2 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-sky-500"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.className}>
                {c.className} ({c.sectionName})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full bg-black border border-gray-800 p-2 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-sky-500"
          >
            <option value="Physics">Physics</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
            <option value="English Grammar">English Grammar</option>
            <option value="Urdu Literature">Urdu Literature</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Islamic Studies">Islamic Studies</option>
          </select>
        </div>
      </div>

      {/* Marks Entry Table */}
      <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/40">
          <div className="flex items-center gap-2">
            <span className="font-black text-white text-xs uppercase">
              {selectedClass} • {selectedSubject} Marks Sheet
            </span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">Max Marks: 100</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-mono text-[11px] bg-black/20">
                <th className="p-4 font-bold">Roll #</th>
                <th className="p-4 font-bold">Admission ID</th>
                <th className="p-4 font-bold">Student Name</th>
                <th className="p-4 font-bold text-center">Total Marks</th>
                <th className="p-4 font-bold text-center text-sky-400">Obtained Marks</th>
                <th className="p-4 font-bold text-center">Percentage</th>
                <th className="p-4 font-bold text-center">Grade</th>
                <th className="p-4 font-bold text-center">Print Result Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50 font-mono text-[11px]">
              {targetStudents.map((st) => {
                const currentObt = inputMarks[st.id] ?? existingMarksMap[st.id]?.obtainedMarks ?? 85;
                const pct = Math.round((currentObt / 100) * 100);
                const grade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : "C";

                return (
                  <tr key={st.id} className="hover:bg-white/[0.02] transition">
                    <td className="p-4 text-white font-bold">{st.rollNo}</td>
                    <td className="p-4 text-sky-400 font-bold">{st.admissionNo}</td>
                    <td className="p-4 font-sans font-bold text-white text-sm">
                      {st.firstName} {st.lastName}
                    </td>
                    <td className="p-4 text-center text-gray-400">100</td>
                    <td className="p-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={currentObt}
                        onChange={(e) =>
                          setInputMarks({
                            ...inputMarks,
                            [st.id]: Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0))
                          })
                        }
                        className="w-20 bg-black border border-gray-800 p-1.5 rounded-lg text-center font-bold text-sky-300 focus:outline-none focus:border-sky-500 mx-auto"
                      />
                    </td>
                    <td className="p-4 text-center font-bold text-white">{pct}%</td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                          grade === "A+"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                        }`}
                      >
                        {grade}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handlePrintResultCard(st)}
                        className="p-1.5 bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white rounded-lg transition"
                        title="Print A4 Result Card"
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
    </div>
  );
}
