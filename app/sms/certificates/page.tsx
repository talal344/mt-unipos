"use client";

import React, { useState, useEffect } from "react";
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
  QrCode,
  ShieldCheck,
  Stamp,
  Edit3,
  RefreshCw,
  Building2,
  GraduationCap
} from "lucide-react";

export default function SMSCertificatesPage() {
  const { students, campuses, selectedCampus } = useSMS();
  const activeCampus = campuses.find((c) => c.id === selectedCampus) || campuses[0];

  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || "");
  const [certType, setCertType] = useState<
    "Character Certificate" | "Bonafide Student Certificate" | "School Leaving Certificate" | "Hope Certificate" | "Merit Award Certificate" | "Sports Merit Certificate"
  >("Character Certificate");

  const student = students.find((s) => s.id === selectedStudentId) || students[0];

  // ─── FULLY EDITABLE CERTIFICATE FIELDS ────────────────────────────────────
  const [schoolName, setSchoolName] = useState("MT CORE MODEL SCHOOL & HIGHER SECONDARY COLLEGE");
  const [schoolAddress, setSchoolAddress] = useState("Main Boulevard, Block H, Gulberg III, Lahore, Pakistan");
  const [schoolAffiliation, setSchoolAffiliation] = useState("Affiliated with BISE Lahore & Federal Directorate | Registration Code: FDE-88219/LHR");
  const [schoolContact, setSchoolContact] = useState("UAN: +92 42 111-682-673 | Email: registrar@mtcore.edu.pk | Web: www.mtcore.edu.pk");

  const [certTitle, setCertTitle] = useState("CHARACTER & CONDUCT CERTIFICATE");
  const [refNumber, setRefNumber] = useState("MT/CERT/2026/0041");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [studentName, setStudentName] = useState(student ? `${student.firstName} ${student.lastName}` : "Ahmed Talal");
  const [fatherName, setFatherName] = useState(student ? student.fatherName : "Mian Talal Ahmad");
  const [admissionNo, setAdmissionNo] = useState(student ? student.admissionNo : "ADM-2026-0041");
  const [rollNo, setRollNo] = useState(student ? student.rollNo : "01");
  const [bFormNo, setBFormNo] = useState(student ? student.bFormOrCnic || "35202-8921821-1" : "35202-8921821-1");
  const [dob, setDob] = useState(student ? student.dob || "2010-08-14" : "2010-08-14");
  const [className, setClassName] = useState(student ? student.className : "Class 9 (Science)");
  const [sectionName, setSectionName] = useState(student ? student.sectionName : "Section A (Newton)");
  const [academicSession, setAcademicSession] = useState("2025–2026");
  const [conductRating, setConductRating] = useState("Exemplary (Grade A+)");
  const [purpose, setPurpose] = useState("University / Higher Secondary Admission & Official Verification");
  const [customBodyText, setCustomBodyText] = useState("");
  const [showStamp, setShowStamp] = useState(true);

  // Auto-sync form when student or cert type changes
  useEffect(() => {
    if (student) {
      setStudentName(`${student.firstName} ${student.lastName}`);
      setFatherName(student.fatherName);
      setAdmissionNo(student.admissionNo);
      setRollNo(student.rollNo);
      setBFormNo(student.bFormOrCnic || "35202-8921821-1");
      setDob(student.dob || "2010-08-14");
      setClassName(student.className);
      setSectionName(student.sectionName);
      setRefNumber(`MT/CERT/2026/${student.rollNo.padStart(4, "0")}`);
    }
  }, [student]);

  useEffect(() => {
    switch (certType) {
      case "Character Certificate":
        setCertTitle("CHARACTER & CONDUCT CERTIFICATE");
        setCustomBodyText(
          `This is to formally certify that the student possesses an exemplary moral character, disciplined demeanor, and sincere commitment to scholastic pursuits. During his/her tenure at this institution, he/she has actively participated in co-curricular activities and has never been subjected to any disciplinary reprimand.`
        );
        break;
      case "Bonafide Student Certificate":
        setCertTitle("BONAFIDE STUDENT CERTIFICATE");
        setCustomBodyText(
          `This is to officially certify that the student is a genuine, regular, and bona fide enrolled student of this institution in good academic standing. All institutional dues, laboratory charges, and examination prerequisites have been duly verified.`
        );
        break;
      case "School Leaving Certificate":
        setCertTitle("SCHOOL LEAVING & MIGRATION CERTIFICATE (SLC)");
        setCustomBodyText(
          `This is to certify that the student has attended this institution with regular attendance. He/She has cleared all school dues, library books, and laboratory equipment up to date. The student is being granted this School Leaving Certificate upon the formal request of the guardian for institution migration.`
        );
        break;
      case "Hope Certificate":
        setCertTitle("HOPE CERTIFICATE (ANTICIPATED BOARD EXAMINATION)");
        setCustomBodyText(
          `Based on his/her outstanding academic trajectory in terminal internal assessments (securing above 90% aggregate marks), the institution has full academic confidence and expects him/her to secure a Top First Division (Grade A+) in the forthcoming Board Annual Examinations.`
        );
        break;
      case "Merit Award Certificate":
        setCertTitle("CERTIFICATE OF ACADEMIC DISTINCTION & MERIT");
        setCustomBodyText(
          `In recognition of outstanding scholastic accomplishment, academic perseverance, and securing 1st Position in the Academic Hall of Fame. This certificate of distinction is conferred in testimony of exceptional academic excellence.`
        );
        break;
      case "Sports Merit Certificate":
        setCertTitle("CERTIFICATE OF SPORTS & ATHLETIC EXCELLENCE");
        setCustomBodyText(
          `The candidate has represented the school in inter-campus sports championships and athletic galas, demonstrating remarkable sportsmanship, agility, and team leadership, bringing honor and victory to his/her respective House.`
        );
        break;
    }
  }, [certType]);

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="space-y-8 font-sans w-full max-w-none pb-16">
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* 1. PRINT-ONLY FULL A4 CERTIFICATE TEMPLATE                                    */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          aside, header, nav, .no-print {
            display: none !important;
          }
          .print-a4-sheet {
            display: block !important;
            width: 100% !important;
            min-height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}} />

      {/* Page Title & Actions Toolbar */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <FileCheck className="text-sky-400" size={24} />
            <span>Official A4 Student Certificates &amp; Attestation Studio</span>
          </h1>
          <p className="text-xs text-gray-400">
            Generate, customize, and print verified A4 Certificates with Official Golden E-Stamp, Security Watermark, and QR Code.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowStamp(!showStamp)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
              showStamp ? "bg-amber-500/10 text-amber-300 border-amber-500/30" : "bg-gray-800 text-gray-400 border-gray-700"
            }`}
          >
            <Stamp size={14} />
            <span>{showStamp ? "E-Stamp: Enabled" : "E-Stamp: Disabled"}</span>
          </button>

          <button
            onClick={handlePrintCertificate}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-cyan-500 hover:opacity-90 text-white font-black text-xs shadow-lg shadow-sky-600/30 transition cursor-pointer"
          >
            <Printer size={15} />
            <span>Print Official A4 Certificate</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* ───────────────────────────────────────────────────────────────────────────── */}
        {/* 2. LEFT SIDEBAR: FULL CUSTOMIZATION & PARAMETERS (NO PRINT)                   */}
        {/* ───────────────────────────────────────────────────────────────────────────── */}
        <div className="no-print xl:col-span-4 bg-[#0b121e] border border-[#1e293b] rounded-3xl p-6 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-xs uppercase font-black text-sky-400 tracking-wider flex items-center gap-1.5">
              <Edit3 size={15} />
              <span>Certificate Parameters &amp; Editor</span>
            </h3>
            <span className="text-[10px] text-gray-500 font-mono">Live Sync</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Certificate Template Type */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Select Certificate Type</label>
              <select
                value={certType}
                onChange={(e) => setCertType(e.target.value as any)}
                className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:border-sky-500"
              >
                <option value="Character Certificate">📜 Character &amp; Conduct Certificate</option>
                <option value="Bonafide Student Certificate">🏛️ Bonafide Student Certificate</option>
                <option value="School Leaving Certificate">🎓 School Leaving &amp; Migration Certificate</option>
                <option value="Hope Certificate">🌟 Hope Certificate (Board Exam Anticipation)</option>
                <option value="Merit Award Certificate">🏆 Academic Distinction &amp; Merit Award</option>
                <option value="Sports Merit Certificate">⚽ Sports Gala &amp; Athletic Excellence</option>
              </select>
            </div>

            {/* Select Student Quick Fill */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-sky-400 mb-1">Quick Select Admitted Student</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:border-sky-500"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} (Roll #{s.rollNo} &bull; {s.className} &bull; ID: {s.admissionNo})
                  </option>
                ))}
              </select>
            </div>

            {/* Editable Student Details */}
            <div className="p-3 bg-black/40 border border-gray-800 rounded-2xl space-y-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Student Credentials (Editable)</span>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-gray-500 font-bold block mb-0.5">Student Legal Name</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full bg-[#080d14] border border-gray-800 p-2 rounded-lg text-white font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 font-bold block mb-0.5">Father's Name</label>
                  <input
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="w-full bg-[#080d14] border border-gray-800 p-2 rounded-lg text-white font-bold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-gray-500 font-bold block mb-0.5">Admission / GR #</label>
                  <input
                    type="text"
                    value={admissionNo}
                    onChange={(e) => setAdmissionNo(e.target.value)}
                    className="w-full bg-[#080d14] border border-gray-800 p-2 rounded-lg text-sky-400 font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 font-bold block mb-0.5">Roll Number</label>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    className="w-full bg-[#080d14] border border-gray-800 p-2 rounded-lg text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-gray-500 font-bold block mb-0.5">Class &amp; Section</label>
                  <input
                    type="text"
                    value={`${className} (${sectionName})`}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full bg-[#080d14] border border-gray-800 p-2 rounded-lg text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 font-bold block mb-0.5">B-Form / CNIC #</label>
                  <input
                    type="text"
                    value={bFormNo}
                    onChange={(e) => setBFormNo(e.target.value)}
                    className="w-full bg-[#080d14] border border-gray-800 p-2 rounded-lg text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-gray-500 font-bold block mb-0.5">Conduct Rating</label>
                  <input
                    type="text"
                    value={conductRating}
                    onChange={(e) => setConductRating(e.target.value)}
                    className="w-full bg-[#080d14] border border-gray-800 p-2 rounded-lg text-emerald-400 font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 font-bold block mb-0.5">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-[#080d14] border border-gray-800 p-2 rounded-lg text-white text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Purpose & Remarks */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Purpose / Issued For</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white text-xs focus:border-sky-500"
              />
            </div>

            {/* Custom Certificate Body Paragraph */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Custom Certificate Body Text</label>
              <textarea
                rows={4}
                value={customBodyText}
                onChange={(e) => setCustomBodyText(e.target.value)}
                className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white text-xs leading-relaxed focus:border-sky-500"
              />
            </div>

            {/* Institutional Header Info (Editable) */}
            <div className="p-3 bg-black/40 border border-gray-800 rounded-2xl space-y-2">
              <span className="text-[10px] font-bold text-sky-400 uppercase block">School Header Info</span>
              <div>
                <label className="text-[9px] text-gray-500 block mb-0.5">School Name</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full bg-[#080d14] border border-gray-800 p-1.5 rounded text-white text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-500 block mb-0.5">Campus Address &amp; Tel</label>
                <input
                  type="text"
                  value={schoolAddress}
                  onChange={(e) => setSchoolAddress(e.target.value)}
                  className="w-full bg-[#080d14] border border-gray-800 p-1.5 rounded text-gray-300 text-xs"
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-500 block mb-0.5">Affiliation &amp; Reg Code</label>
                <input
                  type="text"
                  value={schoolAffiliation}
                  onChange={(e) => setSchoolAffiliation(e.target.value)}
                  className="w-full bg-[#080d14] border border-gray-800 p-1.5 rounded text-gray-300 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────────────────────── */}
        {/* 3. RIGHT PANEL: LIVE TRUE A4 PRINT PREVIEW                                    */}
        {/* ───────────────────────────────────────────────────────────────────────────── */}
        <div className="xl:col-span-8 flex justify-center">
          <div className="w-full max-w-[850px] bg-white text-slate-900 rounded-3xl p-8 sm:p-12 shadow-2xl border-4 border-double border-sky-800/80 relative overflow-hidden print-a4-sheet font-serif select-none">
            
            {/* Watermark Crest */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
              <GraduationCap size={450} className="text-slate-900" />
            </div>

            {/* Inner Ornate Border Frame */}
            <div className="border-2 border-dashed border-sky-700/60 p-6 sm:p-8 rounded-2xl relative z-10 space-y-6">
              
              {/* ── SCHOOL HEADER WITH LOGO & COMPLETE INFO ── */}
              <div className="text-center border-b-2 border-sky-800/40 pb-5 space-y-1.5">
                <div className="flex justify-center mb-2">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-800 via-indigo-900 to-sky-600 flex items-center justify-center text-white shadow-md">
                    <GraduationCap size={36} />
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-wider text-sky-950 uppercase font-sans">
                  {schoolName}
                </h2>
                <p className="text-[11px] font-sans font-bold text-slate-700 uppercase tracking-widest">
                  {schoolAddress}
                </p>
                <p className="text-[10px] font-sans font-medium text-slate-600">
                  {schoolAffiliation}
                </p>
                <p className="text-[9px] font-mono text-slate-500">
                  {schoolContact}
                </p>
              </div>

              {/* ── CERTIFICATE TITLE BADGE ── */}
              <div className="text-center py-2">
                <div className="inline-block bg-sky-950 text-white px-8 py-2 rounded-xl text-sm sm:text-base font-black tracking-widest uppercase font-sans shadow-md">
                  {certTitle}
                </div>
              </div>

              {/* ── REFERENCE & ISSUE DATE ROW ── */}
              <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-700 border-y border-slate-200 py-2">
                <div>
                  <span className="text-slate-500">Ref No: </span>
                  <span className="text-sky-900">{refNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500">GR / Admission ID: </span>
                  <span className="text-sky-900">{admissionNo}</span>
                </div>
                <div>
                  <span className="text-slate-500">Date of Issue: </span>
                  <span>{issueDate}</span>
                </div>
              </div>

              {/* ── CERTIFICATE FORMAL BODY ── */}
              <div className="text-sm sm:text-base leading-[2.2] text-slate-800 text-justify space-y-4 pt-2">
                <p>
                  This is to formally certify that Mr. / Miss{" "}
                  <strong className="text-sky-950 underline decoration-sky-700 underline-offset-4 font-sans font-black text-base">
                    {studentName}
                  </strong>
                  , Son / Daughter of Mr.{" "}
                  <strong className="text-sky-950 underline decoration-sky-700 underline-offset-4 font-sans font-bold">
                    {fatherName}
                  </strong>
                  , holding National B-Form / CNIC{" "}
                  <strong className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {bFormNo}
                  </strong>
                  , born on{" "}
                  <strong className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {dob}
                  </strong>
                  , is a regular and bona fide student of this institution in{" "}
                  <strong className="text-sky-950 font-sans font-bold">
                    {className} ({sectionName})
                  </strong>{" "}
                  under Roll Number{" "}
                  <strong className="font-mono text-sky-900">
                    #{rollNo}
                  </strong>{" "}
                  for Academic Session{" "}
                  <strong className="font-mono font-bold">
                    {academicSession}
                  </strong>
                  .
                </p>

                <p className="font-serif italic text-slate-800">
                  {customBodyText}
                </p>

                <p>
                  His / Her institutional conduct and moral behavior have been officially recorded as{" "}
                  <strong className="text-emerald-800 font-sans font-black">
                    {conductRating}
                  </strong>
                  . This certificate is issued upon the formal request of the legal guardian for the purpose of{" "}
                  <strong className="text-sky-950 underline decoration-slate-400 font-sans font-bold">
                    {purpose}
                  </strong>
                  . We wish him/her immense success and prosperity in all scholastic and professional pursuits.
                </p>
              </div>

              {/* ── OFFICIAL FOOTER: STAMP, QR VERIFICATION & SIGNATURES ── */}
              <div className="pt-10 flex justify-between items-end gap-6 relative">
                
                {/* QR Code Verification Stamp */}
                <div className="space-y-1 text-center shrink-0">
                  <div className="w-20 h-20 border-2 border-slate-300 rounded-xl p-1.5 flex flex-col items-center justify-center bg-slate-50 shadow-inner">
                    <QrCode size={48} className="text-slate-800" />
                  </div>
                  <div className="text-[8px] font-mono font-bold text-slate-500">
                    MT-SEC-AUTH:{admissionNo}
                  </div>
                </div>

                {/* Golden Official E-Stamp (Seal) */}
                {showStamp && (
                  <div className="relative shrink-0 flex items-center justify-center">
                    <div className="w-28 h-28 rounded-full border-4 border-double border-amber-600 bg-amber-50/70 p-2 flex flex-col items-center justify-center text-center shadow-inner relative transform rotate-[-6deg]">
                      <div className="absolute inset-1 rounded-full border border-dashed border-amber-600 pointer-events-none" />
                      <span className="text-[7px] uppercase font-black font-sans text-amber-900 tracking-wider">MT CORE MODEL SCHOOL</span>
                      <Award size={20} className="text-amber-700 my-0.5" />
                      <span className="text-[8px] uppercase font-black text-amber-950 font-sans">OFFICIAL SEAL</span>
                      <span className="text-[6px] font-mono text-amber-800">ATTESTED &bull; {issueDate}</span>
                    </div>
                  </div>
                )}

                {/* Signatures */}
                <div className="flex gap-8 text-center shrink-0">
                  <div className="space-y-1">
                    <div className="w-36 border-t-2 border-slate-800 pt-1 text-xs font-black font-sans text-slate-900">
                      Class Incharge
                    </div>
                    <div className="text-[9px] font-sans text-slate-500">Section Academic Master</div>
                  </div>

                  <div className="space-y-1">
                    <div className="w-44 border-t-2 border-slate-800 pt-1 text-xs font-black font-sans text-slate-900">
                      Principal / Headmaster
                    </div>
                    <div className="text-[9px] font-sans text-slate-500">Controller of Examinations</div>
                  </div>
                </div>
              </div>

              {/* Micro Disclaimer */}
              <div className="border-t border-slate-200 pt-2 flex justify-between text-[8px] font-mono text-slate-400">
                <span>Verified by MT Core Academic Document Governance Suite</span>
                <span>System Authenticated &bull; No physical tampering permitted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
