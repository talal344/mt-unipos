"use client";

import React, { useState } from "react";
import { useSMS, OnlineAdmissionApplicant } from "@/context/sms-context";
import {
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  X,
  Award,
  ArrowRight,
  Printer,
  Sparkles,
  Phone,
  FileCheck2
} from "lucide-react";

export default function SMSAdmissionsOnlinePage() {
  const { theme, onlineApplicants, updateApplicantStatus, addStudent } = useSMS();
  const isLight = theme === "light";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [toastMsg, setToastMsg] = useState("");

  const filteredApplicants = onlineApplicants.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.applicantName.toLowerCase().includes(q) ||
      a.fatherName.toLowerCase().includes(q) ||
      a.applicationNo.toLowerCase().includes(q);

    const matchStatus = statusFilter === "All" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleGrantAdmission = (app: OnlineAdmissionApplicant) => {
    addStudent({
      rollNo: "Auto",
      firstName: app.applicantName.split(" ")[0] || app.applicantName,
      lastName: app.applicantName.split(" ").slice(1).join(" ") || "",
      gender: "Male",
      dob: "2011-01-01",
      bFormOrCnic: "35202-0000000-0",
      campusId: "CAMP-01",
      classId: "C9",
      className: app.appliedClass,
      sectionId: "CLS-9-A",
      sectionName: "Section A (Newton)",
      admissionDate: new Date().toISOString().split("T")[0],
      status: "Active",
      fatherName: app.fatherName,
      fatherPhone: app.fatherPhone,
      feeCategory: "Standard",
      customMonthlyFee: 18500
    });

    updateApplicantStatus(app.id, "Admission Granted");
    setToastMsg(`✅ Admission successfully granted for ${app.applicantName} (${app.applicationNo})! Enrolled into Class 9.`);
    setTimeout(() => setToastMsg(""), 4500);
  };

  const handlePrintMeritList = () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Official Merit List - MT Core Model School</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #ffffff; color: #0f172a; padding: 30px; }
    .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px; }
    .title { font-size: 22px; font-weight: 800; color: #0284c7; }
    .subtitle { font-size: 11px; text-transform: uppercase; color: #64748b; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
    th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px; font-weight: 700; text-align: left; }
    td { border: 1px solid #cbd5e1; padding: 8px; }
    .badge { background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px; }
    .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 11px; font-weight: 600; }
    .sig { border-top: 1px solid #000; width: 180px; text-align: center; padding-top: 5px; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: right; margin-bottom: 15px;">
    <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">🖨️ Print Official Notice</button>
  </div>
  <div class="header">
    <div class="title">MT CORE MODEL SCHOOL &amp; COLLEGE</div>
    <div class="subtitle">Session 2026-2027 • Official 1st Provisional Merit List</div>
    <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Published on: ${new Date().toLocaleDateString()} | Admission Office</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Rank</th>
        <th>App #</th>
        <th>Candidate Name</th>
        <th>Father Name</th>
        <th>Applied Class</th>
        <th>Test (100)</th>
        <th>Interview (100)</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${filteredApplicants
        .map(
          (a, i) => `
        <tr>
          <td><strong>#${i + 1}</strong></td>
          <td style="font-family: 'JetBrains Mono', monospace;">${a.applicationNo}</td>
          <td><strong>${a.applicantName}</strong></td>
          <td>${a.fatherName}</td>
          <td>${a.appliedClass}</td>
          <td>${a.testScore || 85}</td>
          <td>${a.interviewScore || 90}</td>
          <td><span class="badge">${a.status}</span></td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div style="margin-top: 25px; font-size: 11px; color: #475569; line-height: 1.5;">
    <strong>Important Instructions for Selected Candidates:</strong><br/>
    1. Selected candidates must deposit admission dues &amp; verify original B-Forms by Friday 04:00 PM.<br/>
    2. Failure to submit required documents within the deadline will result in forfeiture of the seat to the waiting list.
  </div>

  <div class="footer">
    <div class="sig">Admission Director</div>
    <div class="sig">Convener Merit Committee</div>
    <div class="sig">Principal &amp; Head of Institution</div>
  </div>
</body>
</html>`;

    const printWin = window.open("", "_blank");
    if (printWin) {
      printWin.document.write(html);
      printWin.document.close();
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
            <UserPlus className={isLight ? "text-sky-600" : "text-sky-400"} size={22} />
            <span>Online Admissions CRM &amp; Automated Merit List</span>
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Review online applicants, conduct entrance evaluations, publish merit lists, and convert selected candidates into enrolled students.
          </p>
        </div>

        <button
          onClick={handlePrintMeritList}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-600/20 transition cursor-pointer"
        >
          <Printer size={14} />
          <span>Publish &amp; Print Merit List</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? "text-slate-400" : "text-gray-500"}`} />
          <input
            type="text"
            placeholder="Search candidate name, father name, application #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full ${
              isLight
                ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-sky-500 shadow-xs"
                : "bg-[#0b121e] border-[#1e293b] text-white placeholder-gray-500 focus:border-sky-500"
            } border pl-9 pr-3 py-2.5 rounded-xl text-xs focus:outline-none`}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`${
            isLight
              ? "bg-white border-slate-200 text-slate-900 focus:border-sky-500 shadow-xs"
              : "bg-[#0b121e] border-[#1e293b] text-white focus:border-sky-500"
          } border px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none`}
        >
          <option value="All">All Pipeline Stages</option>
          <option value="Under Review">Under Review</option>
          <option value="Shortlisted">Shortlisted</option>
          <option value="Merit List 1">Merit List 1</option>
          <option value="Admission Granted">Admission Granted</option>
        </select>
      </div>

      {/* Applicants Table */}
      <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl overflow-hidden shadow-2xl`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b ${isLight ? "border-slate-200 text-slate-600 bg-slate-100/70" : "border-gray-800 text-gray-400 bg-black/40"} font-mono text-[11px]`}>
                <th className="p-4 font-bold">App #</th>
                <th className="p-4 font-bold">Candidate Name</th>
                <th className="p-4 font-bold">Applied Class</th>
                <th className="p-4 font-bold">Father Name</th>
                <th className="p-4 font-bold">Contact Phone</th>
                <th className="p-4 font-bold text-center">Test (100)</th>
                <th className="p-4 font-bold text-center">Interview (100)</th>
                <th className="p-4 font-bold text-center">Stage</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? "divide-slate-100" : "divide-gray-800/50"} font-mono text-[11px]`}>
              {filteredApplicants.map((app) => (
                <tr key={app.id} className={`${isLight ? "hover:bg-slate-50/80" : "hover:bg-white/[0.02]"} transition`}>
                  <td className={`p-4 font-bold ${isLight ? "text-sky-700" : "text-sky-400"}`}>{app.applicationNo}</td>
                  <td className={`p-4 font-sans font-bold ${isLight ? "text-slate-900" : "text-white"} text-sm`}>{app.applicantName}</td>
                  <td className={`p-4 font-sans ${isLight ? "text-slate-700" : "text-gray-300"}`}>{app.appliedClass}</td>
                  <td className={`p-4 font-sans ${isLight ? "text-slate-500" : "text-gray-400"}`}>{app.fatherName}</td>
                  <td className={`p-4 ${isLight ? "text-emerald-700 font-bold" : "text-emerald-400"}`}>{app.fatherPhone}</td>
                  <td className={`p-4 text-center font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{app.testScore || 85}</td>
                  <td className={`p-4 text-center font-bold ${isLight ? "text-sky-700" : "text-sky-300"}`}>{app.interviewScore || 90}</td>
                  <td className="p-4 text-center font-sans">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                        app.status === "Admission Granted"
                          ? isLight
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : app.status.includes("Merit")
                          ? isLight
                            ? "bg-sky-50 text-sky-700 border border-sky-300"
                            : "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                          : isLight
                          ? "bg-purple-50 text-purple-700 border border-purple-300"
                          : "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {app.status !== "Admission Granted" ? (
                      <button
                        onClick={() => handleGrantAdmission(app)}
                        className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-bold text-[10px] transition cursor-pointer shadow-md"
                      >
                        Grant Admission
                      </button>
                    ) : (
                      <span className={`text-[10px] ${isLight ? "text-emerald-700 font-bold" : "text-emerald-400 font-bold"}`}>✓ Enrolled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
