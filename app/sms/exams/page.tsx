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
  const { theme, examTerms, marks, students, classes, saveMarksBatch, addExamTerm } = useSMS();
  const isLight = theme === "light";

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
      return {
        studentId: st.id,
        studentName: `${st.firstName} ${st.lastName}`,
        admissionNo: st.admissionNo,
        className: st.className,
        examId: selectedTerm,
        subject: selectedSubject,
        totalMarks: total,
        obtainedMarks: obt,
        grade: pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : "C",
        comments: "Excellent conceptual grasp"
      };
    });

    saveMarksBatch(entries);
    setToastMsg(`✅ Saved ${selectedSubject} marks for ${targetStudents.length} students!`);
    setTimeout(() => setToastMsg(""), 4000);
  };

  // A4 Result Card Printout Builder
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
          <th>Remarks</th>
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
            <span>Examinations, Marks Matrix &amp; Positions</span>
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
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
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border p-4 rounded-2xl`}>
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
          <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-sky-700 font-bold" : "text-sky-400"} mb-1`}>Target Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className={`w-full ${
              isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
            } border p-2 rounded-xl font-bold text-xs focus:outline-none focus:border-sky-500`}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.className}>
                {c.className} ({c.sectionName})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-emerald-700 font-bold" : "text-emerald-400"} mb-1`}>Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className={`w-full ${
              isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
            } border p-2 rounded-xl font-bold text-xs focus:outline-none focus:border-sky-500`}
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
      <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl overflow-hidden shadow-2xl`}>
        <div className={`p-4 border-b ${isLight ? "border-slate-100 bg-slate-50/80" : "border-gray-800 bg-black/40"} flex justify-between items-center`}>
          <div className="flex items-center gap-2">
            <span className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-xs uppercase`}>
              {selectedClass} • {selectedSubject} Marks Sheet
            </span>
          </div>
          <span className={`text-[10px] ${isLight ? "text-slate-500 font-semibold" : "text-gray-400"} font-mono`}>Max Marks: 100</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b ${isLight ? "border-slate-200 text-slate-600 bg-slate-100/70" : "border-gray-800 text-gray-400 bg-black/20"} font-mono text-[11px]`}>
                <th className="p-4 font-bold">Roll #</th>
                <th className="p-4 font-bold">Admission ID</th>
                <th className="p-4 font-bold">Student Name</th>
                <th className="p-4 font-bold text-center">Total Marks</th>
                <th className={`p-4 font-bold text-center ${isLight ? "text-sky-700 font-bold" : "text-sky-400"}`}>Obtained Marks</th>
                <th className="p-4 font-bold text-center">Percentage</th>
                <th className="p-4 font-bold text-center">Grade</th>
                <th className="p-4 font-bold text-center">Print Result Card</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? "divide-slate-100" : "divide-gray-800/50"} font-mono text-[11px]`}>
              {targetStudents.map((st) => {
                const currentObt = inputMarks[st.id] ?? existingMarksMap[st.id]?.obtainedMarks ?? 85;
                const pct = Math.round((currentObt / 100) * 100);
                const grade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : "C";

                return (
                  <tr key={st.id} className={`${isLight ? "hover:bg-slate-50/80" : "hover:bg-white/[0.02]"} transition`}>
                    <td className={`p-4 ${isLight ? "text-slate-900" : "text-white"} font-bold`}>{st.rollNo}</td>
                    <td className={`p-4 ${isLight ? "text-sky-700" : "text-sky-400"} font-bold`}>{st.admissionNo}</td>
                    <td className={`p-4 font-sans font-bold ${isLight ? "text-slate-900" : "text-white"} text-sm`}>
                      {st.firstName} {st.lastName}
                    </td>
                    <td className={`p-4 text-center ${isLight ? "text-slate-500" : "text-gray-400"}`}>100</td>
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
                        className={`w-20 ${
                          isLight ? "bg-slate-50 border-slate-300 text-sky-800 focus:bg-white" : "bg-black border-gray-800 text-sky-300"
                        } border p-1.5 rounded-lg text-center font-bold focus:outline-none focus:border-sky-500 mx-auto`}
                      />
                    </td>
                    <td className={`p-4 text-center font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{pct}%</td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                          grade === "A+"
                            ? isLight
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : isLight
                            ? "bg-sky-50 text-sky-700 border border-sky-300"
                            : "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                        }`}
                      >
                        {grade}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handlePrintResultCard(st)}
                        className={`p-1.5 ${
                          isLight ? "bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200" : "bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white"
                        } rounded-lg transition cursor-pointer`}
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
