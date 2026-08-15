"use client";

import React, { useState } from "react";
import { useSMS, OMRGradingResult } from "@/context/sms-context";
import {
  ScanLine,
  Sparkles,
  Printer,
  CheckCircle2,
  XCircle,
  FileCheck2,
  Award,
  UploadCloud,
  Camera,
  Play,
  RotateCcw
} from "lucide-react";

export default function SMSOMRGraderPage() {
  const { students, omrResults, gradeOMRSheet } = useSMS();

  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || "");
  const [selectedSubject, setSelectedSubject] = useState("Physics");
  
  // Default Answer Key (20 MCQs)
  const [answerKey, setAnswerKey] = useState<Record<number, string>>({
    1: "B", 2: "B", 3: "A", 4: "A", 5: "C", 6: "D", 7: "A", 8: "B", 9: "C", 10: "A",
    11: "D", 12: "B", 13: "C", 14: "A", 15: "B", 16: "D", 17: "C", 18: "B", 19: "A", 20: "C"
  });

  // Student Marked Sheet
  const [studentSheet, setStudentSheet] = useState<Record<number, string>>({
    1: "B", 2: "B", 3: "A", 4: "A", 5: "C", 6: "D", 7: "A", 8: "B", 9: "C", 10: "A",
    11: "D", 12: "B", 13: "C", 14: "A", 15: "B", 16: "D", 17: "C", 18: "B", 19: "A", 20: "C"
  });

  const [latestResult, setLatestResult] = useState<OMRGradingResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleRunOMRScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const res = gradeOMRSheet(selectedStudentId, selectedSubject, studentSheet, answerKey);
      setLatestResult(res);
      setIsScanning(false);
    }, 1200);
  };

  const handlePrintBlankOMR = () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Official OMR Bubble Sheet</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #ffffff; color: #000000; padding: 25px; }
    .sheet-box { border: 2px solid #000; padding: 20px; border-radius: 8px; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
    .title { font-size: 16px; font-weight: 900; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 15px; }
    .row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-size: 11px; }
    .bubbles { display: flex; gap: 8px; }
    .bubble { width: 18px; height: 18px; border: 1.5px solid #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: right; margin-bottom: 10px;">
    <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 8px 16px; font-weight: bold; border-radius: 6px; cursor: pointer;">🖨️ Print OMR Sheet</button>
  </div>
  <div class="sheet-box">
    <div class="header">
      <div class="title">MT CORE MODEL SCHOOL • OFFICIAL OMR ANSWER SHEET</div>
      <div style="font-size: 10px; font-weight: bold;">Fill bubbles completely using Blue or Black Ballpoint only. Do not fold or staple.</div>
    </div>

    <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 15px; border-bottom: 1px dashed #000; padding-bottom: 8px;">
      <div>Candidate Name: _____________________</div>
      <div>Roll #: _________</div>
      <div>Subject: _________________</div>
    </div>

    <div class="grid">
      <div>
        ${Array.from({ length: 10 }, (_, i) => i + 1).map(q => `
          <div class="row">
            <b>Q${q.toString().padStart(2, '0')}</b>
            <div class="bubbles">
              <div class="bubble">A</div>
              <div class="bubble">B</div>
              <div class="bubble">C</div>
              <div class="bubble">D</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div>
        ${Array.from({ length: 10 }, (_, i) => i + 11).map(q => `
          <div class="row">
            <b>Q${q.toString().padStart(2, '0')}</b>
            <div class="bubbles">
              <div class="bubble">A</div>
              <div class="bubble">B</div>
              <div class="bubble">C</div>
              <div class="bubble">D</div>
            </div>
          </div>
        `).join('')}
      </div>
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <ScanLine className="text-emerald-400" size={22} />
            <span>AI Optical Mark Recognition (OMR) Bubble Sheet Auto-Grader</span>
          </h1>
          <p className="text-xs text-gray-400">
            Scan and automatically evaluate multiple-choice bubble answer sheets in 1-second with instant grade calculation and marks matrix sync.
          </p>
        </div>

        <button
          onClick={handlePrintBlankOMR}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/30 text-xs font-bold transition cursor-pointer"
        >
          <Printer size={14} />
          <span>Print Blank OMR Sheet</span>
        </button>
      </div>

      {/* Main OMR Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: OMR Key & Scan Simulator */}
        <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
              <Sparkles size={16} />
              <span>Exam &amp; Candidate Configuration</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Target Candidate</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.firstName} {st.lastName} (Roll #{st.rollNo} • {st.className})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-sky-400 mb-1">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
              >
                <option value="Physics">Physics (20 MCQs)</option>
                <option value="Mathematics">Mathematics (20 MCQs)</option>
                <option value="Chemistry">Chemistry (20 MCQs)</option>
                <option value="Biology">Biology (20 MCQs)</option>
              </select>
            </div>

            {/* OMR Camera Simulator Box */}
            <div className="p-5 bg-black/60 border border-emerald-500/30 rounded-2xl text-center space-y-3 relative overflow-hidden">
              {isScanning && (
                <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[1px] flex items-center justify-center">
                  <div className="text-emerald-400 font-black text-xs animate-pulse flex items-center gap-2">
                    <ScanLine size={18} className="animate-spin" />
                    <span>Analyzing 20 OMR Bubble Grids...</span>
                  </div>
                </div>
              )}
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                <Camera size={24} />
              </div>
              <div className="text-xs font-bold text-white">Live Scanner / Upload Feed</div>
              <div className="text-[10px] text-gray-400">Optical alignment markers verified [100% DPI]</div>
            </div>

            <button
              onClick={handleRunOMRScan}
              disabled={isScanning}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black uppercase rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              <Play size={14} />
              <span>Execute 1-Click OMR Auto-Grade</span>
            </button>
          </div>
        </div>

        {/* Right: Interactive Bubble Sheet Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Latest Result Card */}
          {latestResult && (
            <div className="bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-[#0b121e] border border-emerald-500/40 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in-up">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">OMR Evaluation Report</span>
                <h3 className="text-lg font-black text-white">{latestResult.studentName} ({latestResult.className})</h3>
                <div className="text-xs text-gray-300 mt-1">
                  Subject: <b className="text-white">{latestResult.subject}</b> • Score: <b className="text-emerald-400">{latestResult.score} / {latestResult.totalQuestions} ({latestResult.percentage}%)</b>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl text-center">
                  <div className="text-emerald-400 font-black text-sm">{latestResult.correctAnswers}</div>
                  <div className="text-[9px] text-gray-400">Correct</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 p-2.5 rounded-xl text-center">
                  <div className="text-red-400 font-black text-sm">{latestResult.wrongAnswers}</div>
                  <div className="text-[9px] text-gray-400">Wrong</div>
                </div>
              </div>
            </div>
          )}

          {/* 20 Questions Bubble Visual Matrix */}
          <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="font-black text-white text-xs uppercase tracking-wider">
                Candidate Bubble Sheet &amp; Answer Key Verification
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono">20 Question Sheet</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs">
              {Array.from({ length: 20 }, (_, i) => i + 1).map((qNum) => {
                const correct = answerKey[qNum];
                const marked = studentSheet[qNum];
                const isMatch = marked === correct;

                return (
                  <div
                    key={qNum}
                    className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-gray-800/80 hover:border-emerald-500/30 transition"
                  >
                    <span className="font-mono font-bold text-gray-300 w-8">
                      Q{qNum.toString().padStart(2, "0")}
                    </span>

                    <div className="flex gap-2">
                      {["A", "B", "C", "D"].map((opt) => {
                        const isStudentMarked = marked === opt;
                        const isCorrectOpt = correct === opt;

                        return (
                          <button
                            key={opt}
                            onClick={() => setStudentSheet({ ...studentSheet, [qNum]: opt })}
                            className={`w-6 h-6 rounded-full font-bold text-[10px] flex items-center justify-center transition ${
                              isStudentMarked
                                ? isCorrectOpt
                                  ? "bg-emerald-600 text-white font-black scale-105 ring-2 ring-emerald-400"
                                  : "bg-red-600 text-white font-black scale-105 ring-2 ring-red-400"
                                : "bg-black/60 border border-gray-800 text-gray-500 hover:text-white"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    <span className="text-[10px] font-mono font-bold text-gray-400">
                      Key: <b className="text-emerald-400">{correct}</b>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
