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
  const { onlineApplicants, updateApplicantStatus, addStudent } = useSMS();
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
      fatherCnic: app.fatherCnic,
      fatherPhone: app.fatherPhone,
      emergencyContact: app.fatherPhone,
      residentialAddress: "Lahore",
      feeCategory: "Standard",
      previousSchool: app.previousSchool
    });

    updateApplicantStatus(app.id, "Admission Granted");
    setToastMsg(`✅ Formal Admission Granted to ${app.applicantName}! Auto-generated GR ID & Enrolled in Class.`);
    setTimeout(() => setToastMsg(""), 4500);
  };

  const handlePrintMeritList = () => {
    const meritList = onlineApplicants
      .filter((a) => a.status.includes("Merit") || a.status === "Shortlisted" || a.status === "Admission Granted")
      .sort((a, b) => ((b.testScore || 0) + (b.interviewScore || 0)) - ((a.testScore || 0) + (a.interviewScore || 0)));

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Official Merit List - Session 2025-2026</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Inter:wght@400;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #ffffff; color: #0f172a; padding: 30px; }
    .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px; }
    .school { font-family: 'Cinzel', serif; font-size: 22px; font-weight: 900; color: #0284c7; }
    .title { font-size: 14px; font-weight: 800; text-transform: uppercase; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 15px; }
    th { background: #0284c7; color: white; padding: 8px; text-align: left; font-weight: 700; }
    td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
    .footer { display: flex; justify-content: space-between; margin-top: 40px; font-size: 11px; font-weight: bold; }
    .sig { border-top: 1px solid #000; width: 160px; text-align: center; padding-top: 4px; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: right; margin-bottom: 15px;">
    <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 8px 16px; font-weight: bold; border-radius: 6px; cursor: pointer;">🖨️ Print Official Merit List</button>
  </div>
  <div class="header">
    <div class="school">MT CORE MODEL SCHOOL &amp; COLLEGE</div>
    <div style="font-size: 10px; color: #64748b; font-weight: bold;">Admissions &amp; Entrance Evaluation Directorate</div>
    <div class="title">FIRST OFFICIAL MERIT LIST — CLASS 9 (SCIENCE) 2026</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Merit Rank</th>
        <th>App #</th>
        <th>Candidate Name</th>
        <th>Father Name</th>
        <th>Entry Test (100)</th>
        <th>Interview (100)</th>
        <th>Aggregate %</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${meritList.map((m, idx) => `
        <tr>
          <td><b>#${idx + 1}</b></td>
          <td style="font-family: monospace; color: #0284c7;">${m.applicationNo}</td>
          <td><b>${m.applicantName}</b></td>
          <td>${m.fatherName}</td>
          <td>${m.testScore || 80}/100</td>
          <td>${m.interviewScore || 85}/100</td>
          <td><b>${Math.round(((m.testScore || 80) + (m.interviewScore || 85)) / 2)}%</b></td>
          <td style="color: #16a34a; font-weight: bold;">${m.status}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div style="font-size: 10px; color: #475569; margin-top: 20px; line-height: 1.5;">
    <b>Notice to Selected Candidates:</b> Dues must be submitted at the Main Accounts Office before 25th August along with original B-Form, SLC, and 4 passport-size photographs.
  </div>

  <div class="footer">
    <div class="sig">Admissions Officer</div>
    <div class="sig">Principal Signature &amp; Seal</div>
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
      {/* Toast */}
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
            <UserPlus className="text-sky-400" size={22} />
            <span>Online Admissions CRM &amp; Automated Merit List</span>
          </h1>
          <p className="text-xs text-gray-400">
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
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search candidate name, father name, application #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0b121e] border border-[#1e293b] pl-9 pr-3 py-2.5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#0b121e] border border-[#1e293b] px-3 py-2 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-sky-500"
        >
          <option value="All">All Pipeline Stages</option>
          <option value="Under Review">Under Review</option>
          <option value="Shortlisted">Shortlisted</option>
          <option value="Merit List 1">Merit List 1</option>
          <option value="Admission Granted">Admission Granted</option>
        </select>
      </div>

      {/* Applicants Table */}
      <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-mono text-[11px] bg-black/40">
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
            <tbody className="divide-y divide-gray-800/50 font-mono text-[11px]">
              {filteredApplicants.map((app) => (
                <tr key={app.id} className="hover:bg-white/[0.02] transition">
                  <td className="p-4 font-bold text-sky-400">{app.applicationNo}</td>
                  <td className="p-4 font-sans font-bold text-white text-sm">{app.applicantName}</td>
                  <td className="p-4 font-sans text-gray-300">{app.appliedClass}</td>
                  <td className="p-4 font-sans text-gray-400">{app.fatherName}</td>
                  <td className="p-4 text-emerald-400">{app.fatherPhone}</td>
                  <td className="p-4 text-center font-bold text-white">{app.testScore || 85}</td>
                  <td className="p-4 text-center font-bold text-sky-300">{app.interviewScore || 90}</td>
                  <td className="p-4 text-center font-sans">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                        app.status === "Admission Granted"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : app.status.includes("Merit")
                          ? "bg-sky-500/10 text-sky-400 border border-sky-500/30"
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
                      <span className="text-[10px] text-emerald-400 font-bold">✓ Enrolled</span>
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
