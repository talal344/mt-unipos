"use client";

import React, { useState } from "react";
import { useSMS, QuestionBankItem, GeneratedPaper } from "@/context/sms-context";
import {
  FileText,
  Plus,
  Printer,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Layers,
  Award,
  X,
  Copy,
  Download
} from "lucide-react";

export default function SMSPaperGeneratorPage() {
  const { questionBank, generatedPapers, addQuestionToBank, createGeneratedPaper } = useSMS();

  const [activeTab, setActiveTab] = useState<"builder" | "bank" | "history">("builder");
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);

  // Paper Config Form
  const [paperConfig, setPaperConfig] = useState({
    title: "Midterm Examination 2026",
    className: "Class 9 (Science)",
    subject: "Physics",
    timeAllowed: "2 Hours 30 Minutes",
    totalMarks: 75,
    mcqCount: 12,
    shortCount: 8,
    shortAttempt: 5,
    longCount: 3,
    longAttempt: 2
  });

  const [previewPaper, setPreviewPaper] = useState<GeneratedPaper | null>(null);

  // New Question Form
  const [qForm, setQForm] = useState({
    subject: "Physics",
    className: "Class 9 (Science)",
    chapter: "Kinematics & Dynamics",
    type: "MCQ" as "MCQ" | "Short" | "Long",
    difficulty: "Medium" as "Easy" | "Medium" | "Hard",
    questionText: "",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: "Option A",
    marks: 1
  });

  const handleGeneratePaper = () => {
    const paper: Omit<GeneratedPaper, "id" | "createdAt"> = {
      title: `${paperConfig.title} - ${paperConfig.subject}`,
      className: paperConfig.className,
      subject: paperConfig.subject,
      session: "2025-2026",
      timeAllowed: paperConfig.timeAllowed,
      totalMarks: paperConfig.totalMarks,
      instructions: [
        "Read all questions carefully before attempting.",
        "Section A (Objective MCQs) must be answered on the Bubble Sheet.",
        "Overwriting, cutting, or use of erasing fluid is strictly prohibited.",
        "Scientific non-programmable calculators are allowed."
      ],
      sections: [
        {
          sectionTitle: "SECTION — A (Objective Type / MCQs)",
          instructions: `Time Allowed: 20 Minutes • Total Marks: ${paperConfig.mcqCount} (1 Mark each)`,
          questions: [
            {
              qNo: "Q1.1",
              text: "The rate of change of displacement is known as:",
              marks: 1,
              options: ["Speed", "Velocity", "Acceleration", "Momentum"]
            },
            {
              qNo: "Q1.2",
              text: "Which of the following is a derived unit in SI system?",
              marks: 1,
              options: ["Kilogram", "Newton", "Second", "Meter"]
            },
            {
              qNo: "Q1.3",
              text: "The value of gravitational acceleration 'g' on the surface of earth is approximately:",
              marks: 1,
              options: ["9.8 m/s²", "10.8 m/s²", "8.8 m/s²", "1.6 m/s²"]
            },
            {
              qNo: "Q1.4",
              text: "A body is said to be in equilibrium if its acceleration is:",
              marks: 1,
              options: ["Zero", "Constant", "Maximum", "Variable"]
            }
          ]
        },
        {
          sectionTitle: "SECTION — B (Subjective / Short Questions)",
          instructions: `Attempt any ${paperConfig.shortAttempt} questions out of ${paperConfig.shortCount} questions. (Marks: ${paperConfig.shortAttempt * 4})`,
          questions: [
            { qNo: "Q2.1", text: "Differentiate between Distance and Displacement with suitable examples and SI units.", marks: 4 },
            { qNo: "Q2.2", text: "State Newton's First Law of Motion and why is it also called the Law of Inertia?", marks: 4 },
            { qNo: "Q2.3", text: "Define Momentum. How is force related to the rate of change of linear momentum?", marks: 4 },
            { qNo: "Q2.4", text: "State Pascal's Principle and explain one practical hydraulic application.", marks: 4 },
            { qNo: "Q2.5", text: "What is meant by Centripetal Force? Write its mathematical formula in terms of mass and velocity.", marks: 4 }
          ]
        },
        {
          sectionTitle: "SECTION — C (Long & Analytical Questions)",
          instructions: `Attempt any ${paperConfig.longAttempt} questions out of ${paperConfig.longCount}. Each question carries equal marks.`,
          questions: [
            {
              qNo: "Q3 (a)",
              text: "Derive the Third Equation of Motion (2aS = vf² - vi²) using the speed-time graph.",
              marks: 5
            },
            {
              qNo: "Q3 (b)",
              text: "A car starts from rest with an acceleration of 0.5 m/s². Find its speed after it has traveled 100 meters.",
              marks: 4
            },
            {
              qNo: "Q4 (a)",
              text: "State Newton's Law of Universal Gravitation and determine the mass of the earth using this law.",
              marks: 5
            }
          ]
        }
      ]
    };

    const saved = createGeneratedPaper(paper);
    setPreviewPaper(saved);
  };

  const handlePrintPaper = (paper: GeneratedPaper) => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${paper.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #ffffff; color: #000000; padding: 30px; font-size: 13px; line-height: 1.5; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 15px; }
    .school-title { font-family: 'Cinzel', serif; font-size: 20px; font-weight: 900; letter-spacing: 1px; }
    .meta-row { display: flex; justify-content: space-between; font-weight: 700; margin: 8px 0; font-size: 12px; }
    .instructions { background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 15px; font-size: 11px; margin-bottom: 20px; border-radius: 6px; }
    .section-head { background: #e2e8f0; font-weight: 900; padding: 6px 10px; margin: 15px 0 10px; font-size: 12px; border-left: 4px solid #000; }
    .q-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
    .q-text { flex: 1; padding-right: 15px; }
    .q-marks { font-weight: 800; white-space: nowrap; font-family: 'JetBrains Mono', monospace; font-size: 11px; }
    .options-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 6px 0 10px 20px; font-size: 12px; }
    @media print { .no-print { display: none; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: right; margin-bottom: 15px;">
    <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 8px; cursor: pointer;">🖨️ Print Exam Paper</button>
  </div>

  <div class="header">
    <div class="school-title">MT CORE MODEL SCHOOL &amp; COLLEGE</div>
    <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; margin-top: 2px;">Board Examination Division • Session ${paper.session}</div>
    <div style="font-size: 14px; font-weight: 900; margin-top: 6px;">${paper.title}</div>
  </div>

  <div class="meta-row">
    <div>Class: <b>${paper.className}</b></div>
    <div>Subject: <b>${paper.subject}</b></div>
    <div>Time Allowed: <b>${paper.timeAllowed}</b></div>
    <div>Max Marks: <b>${paper.totalMarks}</b></div>
  </div>

  <div class="instructions">
    <b>General Instructions:</b>
    <ul style="margin-left: 20px; margin-top: 4px;">
      ${paper.instructions.map(i => `<li>${i}</li>`).join('')}
    </ul>
  </div>

  ${paper.sections.map(sec => `
    <div class="section-head">${sec.sectionTitle}</div>
    <div style="font-size: 11px; font-style: italic; margin-bottom: 10px; color: #475569;">${sec.instructions}</div>
    ${sec.questions.map(q => `
      <div class="q-row">
        <div class="q-text">
          <b>${q.qNo}:</b> ${q.text}
          ${q.options ? `
            <div class="options-grid">
              ${q.options.map((opt, idx) => `<div>(${String.fromCharCode(65 + idx)}) ${opt}</div>`).join('')}
            </div>
          ` : ''}
        </div>
        <div class="q-marks">[${q.marks} Marks]</div>
      </div>
    `).join('')}
  `).join('')}
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <FileText className="text-purple-400" size={22} />
            <span>Automated Exam Paper Builder &amp; Question Bank</span>
          </h1>
          <p className="text-xs text-gray-400">
            Generate board-standard examination question papers (FBISE / BISE / Cambridge style) with 1-click formatting and printing.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-[#0b121e] border border-[#1e293b] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("builder")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "builder" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Paper Builder
          </button>
          <button
            onClick={() => setActiveTab("bank")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "bank" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Question Bank ({questionBank.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "history" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Generated Papers ({generatedPapers.length})
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: PAPER BUILDER                                                          */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "builder" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Builder Form */}
          <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-purple-400 font-black text-sm border-b border-gray-800 pb-3">
              <Sparkles size={16} />
              <span>Exam Paper Configuration</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Paper Heading / Title</label>
                <input
                  type="text"
                  value={paperConfig.title}
                  onChange={(e) => setPaperConfig({ ...paperConfig, title: e.target.value })}
                  className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Class</label>
                  <select
                    value={paperConfig.className}
                    onChange={(e) => setPaperConfig({ ...paperConfig, className: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-purple-500"
                  >
                    <option value="Class 9 (Science)">Class 9 (Science)</option>
                    <option value="Class 10 (Matric Science)">Class 10 (Matric Science)</option>
                    <option value="FSc Pre-Medical (Part 1)">FSc Pre-Medical (Part 1)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-purple-400 mb-1">Subject</label>
                  <select
                    value={paperConfig.subject}
                    onChange={(e) => setPaperConfig({ ...paperConfig, subject: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-purple-500"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Time Allowed</label>
                  <input
                    type="text"
                    value={paperConfig.timeAllowed}
                    onChange={(e) => setPaperConfig({ ...paperConfig, timeAllowed: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={paperConfig.totalMarks}
                    onChange={(e) => setPaperConfig({ ...paperConfig, totalMarks: parseInt(e.target.value, 10) || 75 })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                onClick={handleGeneratePaper}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black uppercase rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-lg shadow-purple-600/20 cursor-pointer"
              >
                <Sparkles size={16} />
                <span>Build &amp; Format Paper Now</span>
              </button>
            </div>
          </div>

          {/* Paper Live Preview */}
          <div className="lg:col-span-2 bg-[#0b121e] border border-[#1e293b] rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="font-black text-white text-sm">Official Board Exam Paper Preview</h3>
              {previewPaper && (
                <button
                  onClick={() => handlePrintPaper(previewPaper)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  <Printer size={14} />
                  <span>Print Paper</span>
                </button>
              )}
            </div>

            {!previewPaper ? (
              <div className="text-center py-16 text-xs text-gray-500">
                Click "Build &amp; Format Paper Now" to generate the printable exam paper.
              </div>
            ) : (
              <div className="bg-white text-black p-6 rounded-xl space-y-4 text-xs font-sans shadow-2xl">
                <div className="text-center border-b-2 border-black pb-3">
                  <div className="font-black text-base tracking-wider">MT CORE MODEL SCHOOL &amp; COLLEGE</div>
                  <div className="text-[10px] font-bold uppercase text-gray-600">Terminal Examination Division • Session 2025-2026</div>
                  <div className="text-xs font-black mt-1 uppercase">{previewPaper.title}</div>
                </div>

                <div className="flex justify-between font-bold text-[11px] border-b pb-2">
                  <div>Class: {previewPaper.className}</div>
                  <div>Subject: {previewPaper.subject}</div>
                  <div>Time: {previewPaper.timeAllowed}</div>
                  <div>Marks: {previewPaper.totalMarks}</div>
                </div>

                {previewPaper.sections.map((sec, i) => (
                  <div key={i} className="space-y-2">
                    <div className="bg-gray-200 font-bold p-1.5 text-[11px] border-l-4 border-black">{sec.sectionTitle}</div>
                    <div className="text-[10px] italic text-gray-600">{sec.instructions}</div>
                    {sec.questions.map((q, qIdx) => (
                      <div key={qIdx} className="flex justify-between py-1 text-xs border-b border-gray-100">
                        <div>
                          <b>{q.qNo}:</b> {q.text}
                          {q.options && (
                            <div className="grid grid-cols-4 gap-2 mt-1 text-[11px] text-gray-800 pl-3">
                              {q.options.map((opt, idx) => (
                                <span key={idx}>({String.fromCharCode(65 + idx)}) {opt}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="font-bold font-mono text-[10px]">[{q.marks}M]</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: QUESTION BANK                                                          */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "bank" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-white">Centralized Question Bank ({questionBank.length})</h3>
            <button
              onClick={() => setShowAddQuestionModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Question</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {questionBank.map((q) => (
              <div key={q.id} className="bg-[#0b121e] border border-[#1e293b] p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-bold">
                    {q.subject} • {q.type}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">[{q.marks} Marks]</span>
                </div>
                <div className="text-xs font-bold text-white">{q.questionText}</div>
                <div className="text-[10px] text-gray-400">Chapter: {q.chapter}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: GENERATED PAPERS ARCHIVE                                               */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "history" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {generatedPapers.length === 0 ? (
            <div className="col-span-3 text-center py-16 text-xs text-gray-500">
              No exam papers generated yet in this session.
            </div>
          ) : (
            generatedPapers.map((p) => (
              <div key={p.id} className="bg-[#0b121e] border border-[#1e293b] p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-bold text-purple-400">{p.id}</span>
                  <span className="text-[10px] text-gray-400">{p.timeAllowed}</span>
                </div>
                <h4 className="font-black text-white text-sm">{p.title}</h4>
                <div className="text-xs text-gray-400">{p.className} • Marks: {p.totalMarks}</div>
                <button
                  onClick={() => handlePrintPaper(p)}
                  className="w-full py-2 bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Printer size={14} />
                  <span>Print Official Paper</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
