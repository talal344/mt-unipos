"use client";

import React, { useState } from "react";
import { useSMS, StudentRecord } from "@/context/sms-context";
import {
  FileCheck,
  Printer,
  Sparkles,
  Search,
  Award,
  CheckCircle2,
  Download,
  School,
  QrCode
} from "lucide-react";

export default function SMSCertificatesPage() {
  const { students } = useSMS();
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || "");
  const [certType, setCertType] = useState<
    "Character Certificate" | "Bonafide Student Certificate" | "Hope Certificate" | "Sports Merit Certificate"
  >("Character Certificate");

  const [purpose, setPurpose] = useState("University / Higher Secondary Admission & Verification");

  const student = students.find((s) => s.id === selectedStudentId) || students[0];

  const handlePrintCertificate = () => {
    if (!student) return;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${certType} - ${student.admissionNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #ffffff; color: #0f172a; padding: 40px; }
    .frame { border: 6px double #0284c7; padding: 40px; border-radius: 16px; position: relative; background: #ffffff; }
    .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
    .school { font-family: 'Cinzel', serif; font-size: 26px; font-weight: 900; color: #0284c7; letter-spacing: 2px; }
    .school-sub { font-size: 10px; text-transform: uppercase; font-weight: 700; color: #64748b; margin-top: 4px; }
    .title { font-family: 'Cinzel', serif; font-size: 22px; font-weight: 900; color: #0f172a; margin: 20px 0 5px; text-decoration: underline; }
    .ref-row { display: flex; justify-content: space-between; font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #0284c7; margin-bottom: 30px; }
    .body-text { font-size: 15px; line-height: 2.2; color: #1e293b; text-align: justify; margin: 30px 0; }
    .val { font-weight: 900; color: #0f172a; text-decoration: underline; }
    .footer { display: flex; justify-content: space-between; margin-top: 80px; font-size: 12px; }
    .sig { border-top: 1.5px solid #000; width: 180px; text-align: center; padding-top: 6px; font-weight: bold; }
    .qr-badge { font-family: 'JetBrains Mono', monospace; font-size: 10px; background: #f8fafc; padding: 6px 12px; border: 1px dashed #cbd5e1; border-radius: 6px; }
    @media print { .no-print { display: none; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: right; margin-bottom: 20px;">
    <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 8px; cursor: pointer;">🖨️ Print Official Certificate</button>
  </div>

  <div class="frame">
    <div class="header">
      <div class="school">MT CORE MODEL SCHOOL &amp; COLLEGE</div>
      <div class="school-sub">Main Boulevard, Gulberg III, Lahore • Affiliated with BISE Lahore &amp; FBISE Islamabad</div>
      <div class="title">${certType.toUpperCase()}</div>
    </div>

    <div class="ref-row">
      <div>Ref No: MT/CERT/${new Date().getFullYear()}/${student.rollNo}</div>
      <div>GR / Admission ID: ${student.admissionNo}</div>
      <div>Date of Issue: ${new Date().toLocaleDateString()}</div>
    </div>

    <div class="body-text">
      This is to formally certify that Mr./Miss <span class="val">${student.firstName} ${student.lastName}</span>, Son/Daughter of Mr. <span class="val">${student.fatherName}</span>, bearing B-Form / CNIC <span class="val">${student.bFormOrCnic || '35202-8921821-1'}</span>, is a bona fide and regular student of this institution, currently studying in <span class="val">${student.className} (${student.sectionName})</span> under Roll Number <span class="val">${student.rollNo}</span>.
      <br/><br/>
      ${
        certType === "Character Certificate"
          ? `To the best of our knowledge and official institutional records, the student possesses an exemplary moral character, disciplined demeanor, and sincere commitment to scholastic pursuits. He/She has actively participated in co-curricular activities and has never been subjected to any disciplinary reprimand.`
          : certType === "Hope Certificate"
          ? `Based on his/her outstanding academic trajectory in terminal internal assessments (securing above 90% aggregate marks), the institution has full academic confidence and expects him/her to secure a Top First Division (Grade A+) in the forthcoming Board Examinations.`
          : certType === "Sports Merit Certificate"
          ? `The candidate has represented the school in inter-campus sports championships and has shown remarkable sportsman spirit, agility, and teamwork, bringing distinction to his/her respective House.`
          : `He/She is a genuine registered student in good standing. All institutional dues have been duly cleared.`
      }
      <br/><br/>
      This certificate is issued on the specific request of the guardian for the purpose of <span class="val">${purpose}</span>. We wish the candidate great success in all future educational endeavors.
    </div>

    <div class="footer">
      <div class="qr-badge">🔒 Digital Verified: ${student.admissionNo}</div>
      <div class="sig">Class Incharge Teacher</div>
      <div class="sig">Principal Signature &amp; Official Seal</div>
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
            <FileCheck className="text-sky-400" size={22} />
            <span>Official Student Certificates &amp; Document Generator</span>
          </h1>
          <p className="text-xs text-gray-400">
            Generate and print verified Character Certificates, Bonafide Student Certificates, Hope Certificates, and Sports Merits.
          </p>
        </div>

        <button
          onClick={handlePrintCertificate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-600/20 transition cursor-pointer"
        >
          <Printer size={14} />
          <span>Print Official Certificate</span>
        </button>
      </div>

      {/* Certificate Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl p-6 space-y-4">
          <h3 className="text-xs uppercase font-bold text-sky-400 tracking-wider flex items-center gap-1.5 border-b border-gray-800 pb-3">
            <Sparkles size={15} />
            <span>Certificate Parameters</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Select Certificate Type</label>
              <select
                value={certType}
                onChange={(e) => setCertType(e.target.value as any)}
                className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
              >
                <option value="Character Certificate">Character &amp; Conduct Certificate</option>
                <option value="Bonafide Student Certificate">Bonafide Student Certificate</option>
                <option value="Hope Certificate">Hope Certificate (University Admissions)</option>
                <option value="Sports Merit Certificate">Sports &amp; Co-Curricular Merit Certificate</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-sky-400 mb-1">Select Student</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} (Roll #{s.rollNo} • {s.className})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Purpose of Certificate</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
              />
            </div>

            <button
              onClick={handlePrintCertificate}
              className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-black uppercase rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-lg shadow-sky-600/20"
            >
              <Printer size={15} />
              <span>Generate &amp; Print Certificate</span>
            </button>
          </div>
        </div>

        {/* Live Preview Frame */}
        <div className="lg:col-span-2 bg-[#0b121e] border border-[#1e293b] rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-800 pb-3">
            <h3 className="font-black text-white text-xs uppercase tracking-wider">Live Document Preview</h3>
            <span className="text-[10px] text-sky-400 font-mono">A4 Portrait Format</span>
          </div>

          <div className="bg-white text-black p-8 rounded-2xl border-4 border-double border-sky-600 shadow-2xl space-y-4 text-xs font-sans">
            <div className="text-center border-b-2 border-gray-200 pb-3">
              <div className="text-base font-black text-sky-700 tracking-wider">MT CORE MODEL SCHOOL &amp; COLLEGE</div>
              <div className="text-[9px] uppercase font-bold text-gray-500">Main Boulevard, Gulberg III, Lahore</div>
              <div className="text-xs font-black uppercase mt-2 underline">{certType}</div>
            </div>

            {student && (
              <div className="text-[11px] leading-relaxed text-gray-800 space-y-2">
                <p>
                  This is to certify that <b>{student.firstName} {student.lastName}</b>, Son/Daughter of <b>{student.fatherName}</b>, is a bonafide student of <b>{student.className}</b> (Roll #{student.rollNo}, Admission ID: {student.admissionNo}).
                </p>
                <p>
                  He/She bears an exemplary moral character and disciplined conduct. Issued for <b>{purpose}</b>.
                </p>
              </div>
            )}

            <div className="pt-6 flex justify-between text-[10px] font-bold border-t border-gray-200">
              <div>Ref: MT/CERT/2026</div>
              <div className="border-t border-black pt-1 px-4">Principal Signature &amp; Seal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
