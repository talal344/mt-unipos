"use client";

import React, { useState, useMemo } from "react";
import { useSMS, StudentRecord } from "@/context/sms-context";
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Printer,
  Award,
  ArrowUpRight,
  CheckCircle2,
  X,
  FileCheck2,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  GraduationCap
} from "lucide-react";

export default function SMSStudentsPage() {
  const {
    students,
    classes,
    addStudent,
    updateStudent,
    deleteStudent,
    promoteStudentsBatch,
    issueSchoolLeavingCertificate
  } = useSMS();

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [printIdCardStudent, setPrintIdCardStudent] = useState<StudentRecord | null>(null);
  const [slcTargetStudent, setSlcTargetStudent] = useState<StudentRecord | null>(null);
  const [slcReason, setSlcReason] = useState("Transfer of Parent / Relocation to another city");

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        s.admissionNo.toLowerCase().includes(q) ||
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.fatherName.toLowerCase().includes(q) ||
        s.rollNo.includes(q);

      const matchClass = classFilter === "All" || s.className === classFilter;
      const matchStatus = statusFilter === "All" || s.status === statusFilter;

      return matchSearch && matchClass && matchStatus;
    });
  }, [students, search, classFilter, statusFilter]);

  // Form state for New Student
  const [form, setForm] = useState({
    rollNo: "",
    firstName: "",
    lastName: "",
    gender: "Male" as "Male" | "Female",
    dob: "2012-05-15",
    bFormOrCnic: "",
    bloodGroup: "B+",
    campusId: "CAMP-01",
    className: "Class 9 (Science)",
    sectionName: "Section A (Newton)",
    admissionDate: new Date().toISOString().split("T")[0],
    status: "Active" as const,
    fatherName: "",
    fatherCnic: "",
    fatherPhone: "",
    fatherOccupation: "",
    emergencyContact: "",
    residentialAddress: "",
    guardianEmail: "",
    feeCategory: "Standard" as const,
    customMonthlyFee: 18500,
    transportEnrolled: false,
    busRoute: "",
    medicalNotes: ""
  });

  // Batch Promotion state
  const [promoForm, setPromoForm] = useState({
    sourceClass: "Class 9 (Science)",
    sourceSection: "Section A (Newton)",
    targetClass: "Class 10 (Matric Science)",
    targetSection: "Section A (Einstein)"
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.fatherName) return;

    addStudent({
      ...form,
      classId: "C9",
      sectionId: "CLS-9-A",
      rollNo: form.rollNo || String(students.length + 1)
    });

    setShowAddModal(false);
    setForm({
      rollNo: "",
      firstName: "",
      lastName: "",
      gender: "Male",
      dob: "2012-05-15",
      bFormOrCnic: "",
      bloodGroup: "B+",
      campusId: "CAMP-01",
      className: "Class 9 (Science)",
      sectionName: "Section A (Newton)",
      admissionDate: new Date().toISOString().split("T")[0],
      status: "Active",
      fatherName: "",
      fatherCnic: "",
      fatherPhone: "",
      fatherOccupation: "",
      emergencyContact: "",
      residentialAddress: "",
      guardianEmail: "",
      feeCategory: "Standard",
      customMonthlyFee: 18500,
      transportEnrolled: false,
      busRoute: "",
      medicalNotes: ""
    });
  };

  const handlePromoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    promoteStudentsBatch(
      promoForm.sourceClass,
      promoForm.sourceSection,
      promoForm.targetClass,
      promoForm.targetSection
    );
    setShowPromoteModal(false);
  };

  const handlePrintSLC = (student: StudentRecord) => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>School Leaving Certificate - ${student.admissionNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #ffffff; color: #0f172a; padding: 40px; }
    .border-frame { border: 4px double #0284c7; padding: 30px; border-radius: 12px; position: relative; }
    .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 25px; }
    .school-name { font-family: 'Cinzel', serif; font-size: 26px; font-weight: 900; color: #0284c7; letter-spacing: 2px; }
    .school-sub { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 1.5px; }
    .doc-title { font-family: 'Cinzel', serif; font-size: 20px; font-weight: 900; color: #0f172a; margin: 15px 0 5px; text-decoration: underline; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0; font-size: 13px; }
    .row { display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px; }
    .label { color: #64748b; font-weight: 600; }
    .val { color: #0f172a; font-weight: 700; }
    .clearance-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 20px 0; font-size: 11px; }
    .clearance-grid { display: grid; grid-template-columns: repeat(4, 1fr); text-align: center; gap: 10px; margin-top: 10px; font-weight: bold; color: #16a34a; }
    .footer { display: flex; justify-content: space-between; margin-top: 60px; font-size: 12px; }
    .sig-line { border-top: 1px solid #0f172a; width: 180px; text-align: center; padding-top: 5px; font-weight: bold; }
    @media print { .no-print { display: none; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: right; margin-bottom: 20px;">
    <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 8px; cursor: pointer;">🖨️ Print Certificate</button>
  </div>
  <div class="border-frame">
    <div class="header">
      <div class="school-name">MT CORE MODEL SCHOOL &amp; COLLEGE</div>
      <div class="school-sub">Main Campus, Gulberg III, Lahore • Affiliated with BISE Lahore</div>
      <div class="doc-title">SCHOOL LEAVING / CHARACTER CERTIFICATE</div>
      <div style="font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #0284c7; margin-top: 4px;">GR / Admission ID: ${student.admissionNo}</div>
    </div>

    <div class="grid">
      <div class="row"><span class="label">Student Full Name:</span><span class="val">${student.firstName} ${student.lastName}</span></div>
      <div class="row"><span class="label">Father's Name:</span><span class="val">${student.fatherName}</span></div>
      <div class="row"><span class="label">Date of Birth:</span><span class="val">${student.dob}</span></div>
      <div class="row"><span class="label">B-Form / CNIC:</span><span class="val">${student.bFormOrCnic || 'N/A'}</span></div>
      <div class="row"><span class="label">Date of Admission:</span><span class="val">${student.admissionDate}</span></div>
      <div class="row"><span class="label">Class at Leaving:</span><span class="val">${student.className} (${student.sectionName})</span></div>
      <div class="row"><span class="label">Academic Conduct:</span><span class="val">Exemplary &amp; Diligent</span></div>
      <div class="row"><span class="label">Date of Leaving:</span><span class="val">${new Date().toISOString().split("T")[0]}</span></div>
    </div>

    <div style="font-size: 12px; line-height: 1.6; color: #334155; margin: 15px 0;">
      This is to certify that the student has been regular and punctual in attendance during the academic tenure. All school dues, library books, laboratory apparatus, and sports inventories have been fully cleared.
    </div>

    <div class="clearance-box">
      <div style="text-transform: uppercase; font-weight: 800; color: #0284c7; font-size: 10px;">Inter-Department Clearance Stamped:</div>
      <div class="clearance-grid">
        <div>✓ Accounts: CLEARED</div>
        <div>✓ Library: CLEARED</div>
        <div>✓ Physics/Chem Lab: CLEARED</div>
        <div>✓ Sports Master: CLEARED</div>
      </div>
    </div>

    <div class="footer">
      <div class="sig-line">Prepared By: Admin Desk</div>
      <div class="sig-line">Class Teacher Incharge</div>
      <div class="sig-line">Principal Signature &amp; Seal</div>
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

  const handlePrintIdCard = (student: StudentRecord) => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Student ID Card - ${student.admissionNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #f1f5f9; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
    .card { width: 340px; height: 500px; background: #ffffff; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); overflow: hidden; position: relative; border: 2px solid #e2e8f0; }
    .top-banner { background: linear-gradient(135deg, #0284c7, #4f46e5); padding: 20px 15px 40px; text-align: center; color: white; }
    .school-title { font-size: 16px; font-weight: 900; letter-spacing: 0.5px; }
    .school-sub { font-size: 8px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; }
    .avatar-wrapper { width: 100px; height: 100px; border-radius: 20px; background: #0f172a; border: 4px solid #ffffff; box-shadow: 0 8px 20px rgba(0,0,0,0.15); margin: -50px auto 10px; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 900; color: white; }
    .name { text-align: center; font-size: 18px; font-weight: 900; color: #0f172a; }
    .gr-no { text-align: center; font-size: 11px; font-weight: 700; color: #0284c7; font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
    .details { padding: 15px 25px; font-size: 11px; }
    .row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
    .label { color: #64748b; font-weight: 600; }
    .val { color: #0f172a; font-weight: 700; }
    .barcode { background: #0f172a; color: #4ade80; text-align: center; padding: 10px; font-family: 'JetBrains Mono', monospace; font-size: 11px; margin: 10px 20px 0; border-radius: 8px; letter-spacing: 2px; }
    .footer { text-align: center; font-size: 8px; color: #94a3b8; margin-top: 8px; font-weight: bold; }
    @media print { body { background: white; padding: 0; } .card { box-shadow: none; border: 1px solid #ccc; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="no-print" style="position: absolute; top: 20px; right: 20px;">
    <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 8px; cursor: pointer;">🖨️ Print PVC ID Card</button>
  </div>
  <div class="card">
    <div class="top-banner">
      <div class="school-title">MT CORE MODEL SCHOOL</div>
      <div class="school-sub">Official Student Identity Card • Session 2025-2026</div>
    </div>
    <div class="avatar-wrapper">
      ${student.firstName[0]}
    </div>
    <div class="name">${student.firstName} ${student.lastName}</div>
    <div class="gr-no">ID: ${student.admissionNo} • Roll #${student.rollNo}</div>

    <div class="details">
      <div class="row"><span class="label">Class &amp; Section:</span><span class="val">${student.className} (${student.sectionName})</span></div>
      <div class="row"><span class="label">Father's Name:</span><span class="val">${student.fatherName}</span></div>
      <div class="row"><span class="label">Emergency Contact:</span><span class="val">${student.emergencyContact}</span></div>
      <div class="row"><span class="label">Blood Group:</span><span class="val" style="color: #dc2626;">${student.bloodGroup || 'O+'}</span></div>
      <div class="row"><span class="label">Transport Bus:</span><span class="val">${student.transportEnrolled ? 'Bus Route Enrolled' : 'Private Pick/Drop'}</span></div>
    </div>

    <div class="barcode">|||| | ||||| || |||||| | ${student.admissionNo}</div>
    <div class="footer">If found, please return to School Security Desk: 042-35789011</div>
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
            <Users className="text-sky-400" size={22} />
            <span>Student 360 &amp; Admissions Desk</span>
          </h1>
          <p className="text-xs text-gray-400">
            Manage comprehensive student lifecycle, roll numbers, PVC identity card printing, and class promotion wizard.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPromoteModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold transition"
          >
            <ArrowUpRight size={14} />
            <span>Class Promotion Wizard</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-600/20 transition"
          >
            <Plus size={14} />
            <span>New Admission</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by student name, father name, admission ID, or roll #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0b121e] border border-[#1e293b] pl-9 pr-3 py-2.5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="bg-[#0b121e] border border-[#1e293b] px-3 py-2 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-sky-500"
          >
            <option value="All">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.className}>
                {c.className}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0b121e] border border-[#1e293b] px-3 py-2 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-sky-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Promoted">Promoted</option>
            <option value="Alumni">Alumni / SLC</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-mono text-[11px] bg-black/40">
                <th className="p-4 font-bold">Admission ID</th>
                <th className="p-4 font-bold">Roll #</th>
                <th className="p-4 font-bold">Student Name</th>
                <th className="p-4 font-bold">Father Name</th>
                <th className="p-4 font-bold">Class &amp; Section</th>
                <th className="p-4 font-bold">Emergency Phone</th>
                <th className="p-4 font-bold">Fee Category</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50 font-mono text-[11px]">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500 italic font-sans">
                    No student records match your query.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-white/[0.02] transition">
                    <td className="p-4 font-bold text-sky-400">{st.admissionNo}</td>
                    <td className="p-4 text-white font-bold">{st.rollNo}</td>
                    <td className="p-4 font-sans font-bold text-white">
                      {st.firstName} {st.lastName}
                    </td>
                    <td className="p-4 font-sans text-gray-300">{st.fatherName}</td>
                    <td className="p-4 font-sans">
                      <div className="text-white font-semibold">{st.className}</div>
                      <div className="text-[10px] text-gray-500">{st.sectionName}</div>
                    </td>
                    <td className="p-4 text-gray-400">{st.emergencyContact}</td>
                    <td className="p-4 font-sans">
                      <span className="bg-sky-500/10 text-sky-300 border border-sky-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold">
                        {st.feeCategory}
                      </span>
                    </td>
                    <td className="p-4 font-sans">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                          st.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : st.status === "Alumni"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {st.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1.5 justify-center">
                        <button
                          onClick={() => handlePrintIdCard(st)}
                          className="p-1.5 bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white rounded-lg transition"
                          title="Print PVC Student Identity Card"
                        >
                          <QrCode size={12} />
                        </button>
                        <button
                          onClick={() => setSlcTargetStudent(st)}
                          className="p-1.5 bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white rounded-lg transition"
                          title="Issue School Leaving Certificate (SLC)"
                        >
                          <FileCheck2 size={12} />
                        </button>
                        <button
                          onClick={() => setSelectedStudent(st)}
                          className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-lg transition"
                          title="View Student 360 Profile"
                        >
                          <Eye size={12} />
                        </button>
                        <button
                          onClick={() => deleteStudent(st.id)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition"
                          title="Delete Student Record"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* NEW ADMISSION MODAL                                                           */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0b121e] border border-sky-500/40 rounded-3xl w-full max-w-2xl shadow-2xl p-6 my-8 animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Plus size={16} className="text-sky-400" />
                <h3 className="font-black text-white text-sm">Formal Student Admission Enrolment</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              {/* Personal Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ahmed"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Last Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Talal"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value as any })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-sky-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              {/* Class & Section Assignment */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-sky-400 mb-1">Enrolled Class *</label>
                  <select
                    value={form.className}
                    onChange={(e) => setForm({ ...form, className: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-sky-500"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.className}>
                        {c.className}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-sky-400 mb-1">Section</label>
                  <select
                    value={form.sectionName}
                    onChange={(e) => setForm({ ...form, sectionName: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-sky-500"
                  >
                    <option value="Section A (Newton)">Section A (Newton)</option>
                    <option value="Section B (Einstein)">Section B (Einstein)</option>
                    <option value="Section A (Rose)">Section A (Rose)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Roll Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 05"
                    value={form.rollNo}
                    onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Father / Guardian Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Father Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mian Talal Ahmad"
                    value={form.fatherName}
                    onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Father CNIC</label>
                  <input
                    type="text"
                    placeholder="35202-xxxxxxx-x"
                    value={form.fatherCnic}
                    onChange={(e) => setForm({ ...form, fatherCnic: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Emergency Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="03396399895"
                    value={form.emergencyContact}
                    onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Fee & Concession Structure */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Fee Concession Category</label>
                  <select
                    value={form.feeCategory}
                    onChange={(e) => setForm({ ...form, feeCategory: e.target.value as any })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-sky-500"
                  >
                    <option value="Standard">Standard Full Fee</option>
                    <option value="Sibling Concession (20%)">Sibling Concession (20% Off)</option>
                    <option value="Staff Child (50%)">Staff Child (50% Off)</option>
                    <option value="Need Based 100% Scholarship">Need-Based 100% Scholarship</option>
                    <option value="Merit Scholarship">Merit Scholarship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Custom Monthly Tuition (PKR)</label>
                  <input
                    type="number"
                    value={form.customMonthlyFee}
                    onChange={(e) => setForm({ ...form, customMonthlyFee: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-emerald-400 font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-lg shadow-sky-600/20"
              >
                <CheckCircle2 size={16} />
                <span>Confirm &amp; Enrol Student (Auto-Generate GR #)</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* PROMOTION WIZARD MODAL                                                        */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {showPromoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#0b121e] border border-purple-500/40 rounded-3xl w-full max-w-md shadow-2xl p-6 animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ArrowUpRight size={16} className="text-purple-400" />
                <h3 className="font-black text-white text-sm">Batch Class Promotion Wizard</h3>
              </div>
              <button onClick={() => setShowPromoteModal(false)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handlePromoteSubmit} className="space-y-4 text-xs">
              <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded-xl text-purple-300 text-xs">
                Select the Source Class to promote all active students to their next target Class &amp; Section for the new session.
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-gray-400">Source Class</label>
                <select
                  value={promoForm.sourceClass}
                  onChange={(e) => setPromoForm({ ...promoForm, sourceClass: e.target.value })}
                  className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.className}>
                      {c.className} ({c.sectionName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-emerald-400">Promote To Target Class</label>
                <select
                  value={promoForm.targetClass}
                  onChange={(e) => setPromoForm({ ...promoForm, targetClass: e.target.value })}
                  className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
                >
                  <option value="Class 10 (Matric Science)">Class 10 (Matric Science)</option>
                  <option value="FSc Pre-Medical (Part 1)">FSc Pre-Medical (Part 1)</option>
                  <option value="Class 2">Class 2</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase rounded-xl transition flex items-center justify-center gap-2 text-xs"
              >
                <CheckCircle2 size={16} />
                <span>Execute Batch Promotion</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* SLC ISSUANCE MODAL                                                            */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {slcTargetStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#0b121e] border border-purple-500/40 rounded-3xl w-full max-w-md shadow-2xl p-6 animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FileCheck2 size={16} className="text-purple-400" />
                <h3 className="font-black text-white text-sm">Issue School Leaving Certificate</h3>
              </div>
              <button onClick={() => setSlcTargetStudent(null)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-black/40 border border-gray-800 rounded-xl p-3 space-y-1 font-mono">
                <div>Student: <span className="text-white font-bold">{slcTargetStudent.firstName} {slcTargetStudent.lastName}</span></div>
                <div>GR ID: <span className="text-sky-400 font-bold">{slcTargetStudent.admissionNo}</span></div>
                <div>Class: <span className="text-purple-400">{slcTargetStudent.className}</span></div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Reason for Leaving *</label>
                <textarea
                  rows={3}
                  value={slcReason}
                  onChange={(e) => setSlcReason(e.target.value)}
                  className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white text-xs resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    issueSchoolLeavingCertificate(slcTargetStudent.id, slcReason);
                    handlePrintSLC(slcTargetStudent);
                    setSlcTargetStudent(null);
                  }}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase rounded-xl transition flex items-center justify-center gap-2 text-xs"
                >
                  <Printer size={14} />
                  <span>Clear Dues &amp; Print Official SLC</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* STUDENT 360 COMPREHENSIVE PROFILE MODAL                                       */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0b121e] border border-sky-500/40 rounded-3xl w-full max-w-3xl shadow-2xl p-6 my-8 animate-fade-in-up space-y-5">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-gray-800 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-sky-600/30">
                  {selectedStudent.firstName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </h2>
                    <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      {selectedStudent.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Admission ID: <b className="text-sky-400 font-mono">{selectedStudent.admissionNo}</b> • Roll #{selectedStudent.rollNo} • {selectedStudent.className} ({selectedStudent.sectionName})
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="text-gray-400 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            {/* 3-Column Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-black/40 border border-gray-800 p-4 rounded-xl space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-sky-400 block">Guardian / Father Info</span>
                <div>Name: <b className="text-white">{selectedStudent.fatherName}</b></div>
                <div>CNIC: <span className="text-gray-300 font-mono">{selectedStudent.fatherCnic || 'N/A'}</span></div>
                <div>Phone: <b className="text-emerald-400">{selectedStudent.fatherPhone}</b></div>
                <div>Address: <span className="text-gray-400">{selectedStudent.residentialAddress}</span></div>
              </div>

              <div className="bg-black/40 border border-gray-800 p-4 rounded-xl space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Financial &amp; Transport</span>
                <div>Category: <b className="text-sky-300">{selectedStudent.feeCategory}</b></div>
                <div>Monthly Fee: <b className="text-emerald-400">Rs {(selectedStudent.customMonthlyFee || 18500).toLocaleString()}</b></div>
                <div>Transport: <span className="text-gray-300">{selectedStudent.transportEnrolled ? 'Enrolled (Bus)' : 'Private Pickup'}</span></div>
                <div>House: <b className="text-purple-300">{selectedStudent.houseName || 'Jinnah House'}</b></div>
              </div>

              <div className="bg-black/40 border border-gray-800 p-4 rounded-xl space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-rose-400 block">Health &amp; Demographics</span>
                <div>Blood Group: <b className="text-red-400">{selectedStudent.bloodGroup || 'B+'}</b></div>
                <div>DOB: <span className="text-gray-300">{selectedStudent.dob}</span></div>
                <div>Gender: <span className="text-gray-300">{selectedStudent.gender}</span></div>
                <div>Medical Alert: <span className="text-gray-400">{selectedStudent.medicalNotes || 'No known allergies'}</span></div>
              </div>
            </div>

            {/* Quick Action Footer */}
            <div className="pt-2 border-t border-gray-800 flex flex-wrap justify-between items-center gap-3">
              <div className="text-[10px] text-gray-500 font-mono">
                Enrolled On: {selectedStudent.admissionDate}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePrintIdCard(selectedStudent)}
                  className="px-3.5 py-2 bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5"
                >
                  <QrCode size={14} />
                  <span>Print PVC Card</span>
                </button>
                <button
                  onClick={() => {
                    setSlcTargetStudent(selectedStudent);
                    setSelectedStudent(null);
                  }}
                  className="px-3.5 py-2 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5"
                >
                  <FileCheck2 size={14} />
                  <span>Issue SLC</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
