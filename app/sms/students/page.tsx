"use client";

import React, { useState, useMemo, useRef } from "react";
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
  GraduationCap,
  Camera,
  Upload,
  BookOpen,
  Sparkles,
  HeartPulse,
  Phone,
  Home,
  FileText,
  BadgeCheck,
  Shield
} from "lucide-react";

export default function SMSStudentsPage() {
  const {
    theme,
    students,
    classes,
    campuses,
    addStudent,
    updateStudent,
    deleteStudent,
    promoteStudentsBatch,
    issueSchoolLeavingCertificate
  } = useSMS();

  const isLight = theme === "light";
  const activeCampusName = campuses[0]?.name || "MODEL HIGHER SECONDARY SCHOOL & COLLEGE";

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [idCardStudent, setIdCardStudent] = useState<StudentRecord | null>(null);
  const [slcTargetStudent, setSlcTargetStudent] = useState<StudentRecord | null>(null);
  const [slcReason, setSlcReason] = useState("Transfer of Parent / Relocation to another city");

  // Unique list of classes configured in settings
  const configuredClasses = useMemo(() => {
    const unique = Array.from(new Set(classes.map((c) => c.className))).filter(Boolean);
    return unique.length > 0 ? unique : ["One"];
  }, [classes]);

  // Dynamic helper for sections per class
  const getSectionsForClass = (className: string): string[] => {
    const matched = classes
      .filter((c) => c.className.trim().toLowerCase() === (className || "").trim().toLowerCase())
      .map((c) => c.sectionName)
      .filter(Boolean);
    const unique = Array.from(new Set(matched));
    return unique.length > 0 ? unique : ["A"];
  };

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
        (s.rollNo && s.rollNo.includes(q)) ||
        (s.emergencyContact && s.emergencyContact.includes(q));

      const matchClass = classFilter === "All" || s.className === classFilter;
      const matchStatus = statusFilter === "All" || s.status === statusFilter;

      return matchSearch && matchClass && matchStatus;
    });
  }, [students, search, classFilter, statusFilter]);

  // Form state for New Student
  const initialClass = configuredClasses[0] || "Class 1";
  const initialSection = getSectionsForClass(initialClass)[0] || "Section A";

  const [form, setForm] = useState({
    rollNo: "",
    firstName: "",
    lastName: "",
    gender: "Male" as "Male" | "Female" | "Other",
    dob: "2012-05-15",
    bFormOrCnic: "",
    bloodGroup: "B+",
    campusId: "CAMP-01",
    className: initialClass,
    sectionName: initialSection,
    admissionDate: new Date().toISOString().split("T")[0],
    status: "Active" as const,
    avatar: "",
    fatherName: "",
    fatherCnic: "",
    fatherPhone: "",
    fatherOccupation: "",
    motherName: "",
    motherPhone: "",
    emergencyContact: "",
    residentialAddress: "",
    guardianEmail: "",
    feeCategory: "Standard" as const,
    customMonthlyFee: 15000,
    transportEnrolled: false,
    busRoute: "",
    medicalNotes: "",
    allergies: "",
    previousSchool: ""
  });

  // Photo upload ref
  const addPhotoInputRef = useRef<HTMLInputElement>(null);
  const editPhotoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        if (isEdit && editingStudent) {
          setEditingStudent({ ...editingStudent, avatar: reader.result });
        } else {
          setForm((prev) => ({ ...prev, avatar: reader.result as string }));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // When class changes in Add Form, automatically update section to first available
  const handleClassChangeInAdd = (newClassName: string) => {
    const availSections = getSectionsForClass(newClassName);
    setForm({
      ...form,
      className: newClassName,
      sectionName: availSections[0] || "Section A"
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.fatherName) return;

    addStudent({
      ...form,
      rollNo: form.rollNo || `${Math.floor(10 + Math.random() * 90)}`
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
      className: configuredClasses[0] || "Class 1",
      sectionName: getSectionsForClass(configuredClasses[0] || "Class 1")[0] || "Section A",
      admissionDate: new Date().toISOString().split("T")[0],
      status: "Active",
      avatar: "",
      fatherName: "",
      fatherCnic: "",
      fatherPhone: "",
      fatherOccupation: "",
      motherName: "",
      motherPhone: "",
      emergencyContact: "",
      residentialAddress: "",
      guardianEmail: "",
      feeCategory: "Standard",
      customMonthlyFee: 15000,
      transportEnrolled: false,
      busRoute: "",
      medicalNotes: "",
      allergies: "",
      previousSchool: ""
    });
  };

  // Open Edit Modal
  const handleOpenEdit = (student: StudentRecord) => {
    const availSections = getSectionsForClass(student.className);
    const resolvedSection = availSections.includes(student.sectionName)
      ? student.sectionName
      : availSections[0] || "A";

    setEditingStudent({
      ...student,
      sectionName: resolvedSection
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    updateStudent(editingStudent.id, editingStudent);
    setShowEditModal(false);
    setEditingStudent(null);
  };

  // Batch Promotion state
  const [promoForm, setPromoForm] = useState({
    sourceClass: configuredClasses[0] || "Class 1",
    sourceSection: getSectionsForClass(configuredClasses[0] || "Class 1")[0] || "Section A",
    targetClass: configuredClasses[1] || "Class 2",
    targetSection: getSectionsForClass(configuredClasses[1] || "Class 2")[0] || "Section A"
  });

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
    .school-name { font-family: 'Cinzel', serif; font-size: 24px; font-weight: 900; color: #0284c7; letter-spacing: 1.5px; }
    .school-sub { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 1.5px; margin-top: 4px; }
    .doc-title { font-family: 'Cinzel', serif; font-size: 18px; font-weight: 900; color: #0f172a; margin: 15px 0 5px; text-decoration: underline; }
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
      <div class="school-name">${activeCampusName}</div>
      <div class="school-sub">Official Academic Transcript &amp; School Leaving Certificate</div>
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

  // Print Professional PVC Student Card with Dynamic QR Code, Stickers & Badges
  const handlePrintIdCard = (student: StudentRecord) => {
    const qrData = encodeURIComponent(
      `STUDENT ID:${student.admissionNo}|NAME:${student.firstName} ${student.lastName}|CLASS:${student.className}|SECTION:${student.sectionName}|EMERGENCY:${student.emergencyContact || student.fatherPhone}|BLOOD:${student.bloodGroup || 'N/A'}`
    );
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${qrData}&color=0284c7&bgcolor=ffffff&margin=1`;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Student ID Card - ${student.admissionNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Cinzel:wght@800;900&family=JetBrains+Mono:wght@700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #f8fafc; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
    
    .card-wrapper {
      width: 360px;
      height: 570px;
      background: linear-gradient(180deg, #0b1329 0%, #0f172a 100%);
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      position: relative;
      overflow: hidden;
      border: 2px solid #38bdf8;
      color: #ffffff;
      display: flex;
      flex-direction: column;
    }

    /* Top Aesthetic Header */
    .card-header {
      background: linear-gradient(135deg, #0284c7 0%, #4f46e5 50%, #0369a1 100%);
      padding: 16px 14px 44px;
      text-align: center;
      position: relative;
      border-bottom: 3px solid #38bdf8;
    }
    .school-title {
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      text-shadow: 0 2px 4px rgba(0,0,0,0.4);
      line-height: 1.2;
    }
    .badge-sub {
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #bae6fd;
      margin-top: 3px;
    }

    /* Floating Hologram Badge */
    .hologram-sticker {
      position: absolute;
      top: 10px;
      right: 12px;
      background: linear-gradient(135deg, #fbbf24, #f59e0b, #ef4444);
      color: #ffffff;
      font-size: 7px;
      font-weight: 900;
      padding: 3px 6px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 8px rgba(245,158,11,0.5);
    }

    .sticker-study {
      position: absolute;
      top: 10px;
      left: 12px;
      font-size: 14px;
    }

    /* Avatar & Badge */
    .avatar-container {
      margin: -36px auto 8px;
      position: relative;
      width: 92px;
      height: 92px;
    }
    .avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 20px;
      object-fit: cover;
      border: 4px solid #ffffff;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      background: #1e293b;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 34px;
      font-weight: 900;
      color: #38bdf8;
    }
    .verified-star {
      position: absolute;
      bottom: -4px;
      right: -4px;
      background: #10b981;
      color: white;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    }

    /* Student Name & GR */
    .name-block {
      text-align: center;
      padding: 0 15px;
    }
    .student-name {
      font-size: 17px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: 0.2px;
    }
    .id-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.4);
      padding: 2px 10px;
      border-radius: 8px;
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      color: #38bdf8;
      font-weight: 800;
      margin-top: 3px;
    }

    /* Data Table / Fields */
    .data-grid {
      padding: 10px 18px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 11px;
    }
    .data-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.04);
      padding: 4.5px 10px;
      border-radius: 8px;
      border-left: 3px solid #38bdf8;
    }
    .lbl {
      color: #94a3b8;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 9px;
      letter-spacing: 0.5px;
    }
    .val {
      font-weight: 800;
      color: #f1f5f9;
      text-align: right;
    }
    .blood-badge {
      background: #ef4444;
      color: #ffffff;
      padding: 1px 6px;
      border-radius: 5px;
      font-weight: 900;
      font-size: 10px;
    }

    /* QR Code & Bottom Bar */
    .card-footer {
      background: #060b17;
      padding: 10px 18px 12px;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .qr-box {
      background: #ffffff;
      padding: 3px;
      border-radius: 8px;
      width: 58px;
      height: 58px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    }
    .qr-box img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .footer-notes {
      font-size: 8px;
      color: #64748b;
      line-height: 1.3;
      flex: 1;
    }
    .principal-sig {
      font-size: 8px;
      color: #38bdf8;
      font-weight: 800;
      text-align: right;
      text-transform: uppercase;
    }

    @media print {
      body { background: white; padding: 0; }
      .no-print { display: none; }
      .card-wrapper { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="position: absolute; top: 20px; right: 20px;">
    <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 10px 22px; font-weight: 800; font-size: 13px; border-radius: 10px; cursor: pointer; box-shadow: 0 4px 12px rgba(2,132,199,0.4);">🖨️ Print PVC ID Card</button>
  </div>

  <div class="card-wrapper">
    <div class="card-header">
      <span class="sticker-study">🎓</span>
      <div class="hologram-sticker">★ VERIFIED 2026</div>
      <div class="school-title">${activeCampusName}</div>
      <div class="badge-sub">OFFICIAL STUDENT IDENTITY CARD • SESSION 2026–2027</div>
    </div>

    <div class="avatar-container">
      ${
        student.avatar
          ? `<img src="${student.avatar}" class="avatar-img" alt="${student.firstName}" />`
          : `<div class="avatar-img">${student.firstName[0]}</div>`
      }
      <div class="verified-star">✓</div>
    </div>

    <div class="name-block">
      <div class="student-name">${student.firstName} ${student.lastName}</div>
      <div class="id-pill">
        <span>GR #${student.admissionNo}</span>
        <span>•</span>
        <span>ROLL #${student.rollNo}</span>
      </div>
    </div>

    <div class="data-grid">
      <div class="data-row">
        <span class="lbl">Class</span>
        <span class="val" style="color: #38bdf8;">${student.className}</span>
      </div>
      <div class="data-row">
        <span class="lbl">Section</span>
        <span class="val">${student.sectionName}</span>
      </div>
      <div class="data-row">
        <span class="lbl">Father's Name</span>
        <span class="val">${student.fatherName}</span>
      </div>
      <div class="data-row">
        <span class="lbl">Emergency Phone</span>
        <span class="val" style="font-family: 'JetBrains Mono', monospace;">${student.emergencyContact || student.fatherPhone}</span>
      </div>
      <div class="data-row">
        <span class="lbl">Blood Group</span>
        <span class="val"><span class="blood-badge">${student.bloodGroup || 'O+'}</span></span>
      </div>
      <div class="data-row">
        <span class="lbl">Date of Birth</span>
        <span class="val">${student.dob || '2012-05-15'}</span>
      </div>
    </div>

    <div class="card-footer">
      <div class="qr-box">
        <img src="${qrUrl}" alt="Student QR Code" />
      </div>
      <div class="footer-notes">
        <div>• Valid for Academic Year 2026–2027</div>
        <div>• Property of School. If found return to Security Desk.</div>
        <div class="principal-sig">Authorized Principal Seal ✓</div>
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
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${isLight ? "border-slate-200" : "border-gray-800"} pb-4`}>
        <div>
          <h1 className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-2`}>
            <Users className={isLight ? "text-sky-600" : "text-sky-400"} size={22} />
            <span>Student 360 &amp; Admissions Desk</span>
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Manage comprehensive student profiles, photos, blood groups, addresses, documents, PVC ID cards, and promotions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPromoteModal(true)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl ${
              isLight ? "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-300" : "bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border-purple-500/30"
            } border text-xs font-bold transition cursor-pointer`}
          >
            <ArrowUpRight size={14} />
            <span>Class Promotion Wizard</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-600/20 transition cursor-pointer"
          >
            <Plus size={14} />
            <span>New Admission</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? "text-slate-400" : "text-gray-500"}`} />
          <input
            type="text"
            placeholder="Search by student name, father name, admission ID, or roll #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full ${
              isLight
                ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-sky-500 shadow-xs"
                : "bg-[#0b121e] border-[#1e293b] text-white placeholder-gray-500 focus:border-sky-500"
            } border pl-9 pr-3 py-2.5 rounded-xl text-xs focus:outline-none`}
          />
        </div>

        <div className="flex gap-2">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className={`${
              isLight
                ? "bg-white border-slate-200 text-slate-900 focus:border-sky-500 shadow-xs"
                : "bg-[#0b121e] border-[#1e293b] text-white focus:border-sky-500"
            } border px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none`}
          >
            <option value="All">All Classes ({students.length})</option>
            {configuredClasses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`${
              isLight
                ? "bg-white border-slate-200 text-slate-900 focus:border-sky-500 shadow-xs"
                : "bg-[#0b121e] border-[#1e293b] text-white focus:border-sky-500"
            } border px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none`}
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
      <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl overflow-hidden shadow-2xl`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b ${isLight ? "border-slate-200 text-slate-600 bg-slate-100/70" : "border-gray-800 text-gray-400 bg-black/40"} font-mono text-[11px]`}>
                <th className="p-4 font-bold">Admission ID</th>
                <th className="p-4 font-bold">Roll #</th>
                <th className="p-4 font-bold">Student Name</th>
                <th className="p-4 font-bold">Father Name</th>
                <th className="p-4 font-bold">Class &amp; Section</th>
                <th className="p-4 font-bold">Emergency Phone</th>
                <th className="p-4 font-bold">Blood Group</th>
                <th className="p-4 font-bold">Fee Category</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? "divide-slate-100" : "divide-gray-800/50"} font-mono text-[11px]`}>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className={`p-10 text-center ${isLight ? "text-slate-400" : "text-gray-500"} italic font-sans`}>
                    <Users size={32} className="mx-auto mb-2 opacity-40 text-sky-500" />
                    <p className="font-bold">No Student Records Found</p>
                    <p className="text-[11px] mt-1">Click "+ New Admission" to enrol your first student.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr key={st.id} className={`${isLight ? "hover:bg-slate-50/80" : "hover:bg-white/[0.02]"} transition`}>
                    <td className={`p-4 font-bold ${isLight ? "text-sky-700" : "text-sky-400"}`}>{st.admissionNo}</td>
                    <td className={`p-4 font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{st.rollNo}</td>
                    <td className={`p-4 font-sans font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                      <div className="flex items-center gap-2.5">
                        {st.avatar ? (
                          <img src={st.avatar} alt={st.firstName} className="w-7 h-7 rounded-full object-cover border border-sky-400" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-600 flex items-center justify-center font-black text-xs">
                            {st.firstName[0]}
                          </div>
                        )}
                        <span>{st.firstName} {st.lastName}</span>
                      </div>
                    </td>
                    <td className={`p-4 font-sans ${isLight ? "text-slate-700" : "text-gray-300"}`}>{st.fatherName}</td>
                    <td className="p-4 font-sans">
                      <div className={`font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>{st.className}</div>
                      <div className={`text-[10px] ${isLight ? "text-sky-700 font-bold" : "text-sky-400"}`}>{st.sectionName}</div>
                    </td>
                    <td className={`p-4 ${isLight ? "text-slate-600" : "text-gray-400"}`}>{st.emergencyContact || st.fatherPhone}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                        {st.bloodGroup || "O+"}
                      </span>
                    </td>
                    <td className="p-4 font-sans">
                      <span className={`${
                        isLight ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-sky-500/10 text-sky-300 border-sky-500/20"
                      } border px-2 py-0.5 rounded-md text-[10px] font-bold`}>
                        {st.feeCategory}
                      </span>
                    </td>
                    <td className="p-4 font-sans">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                          st.status === "Active"
                            ? isLight
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : st.status === "Alumni"
                            ? isLight
                              ? "bg-purple-50 text-purple-700 border border-purple-300"
                              : "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                            : isLight
                            ? "bg-red-50 text-red-700 border border-red-300"
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
                          className={`p-1.5 ${
                            isLight ? "bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200" : "bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white"
                          } rounded-lg transition cursor-pointer`}
                          title="Print PVC Student Identity Card"
                        >
                          <QrCode size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className={`p-1.5 ${
                            isLight ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200" : "bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-white"
                          } rounded-lg transition cursor-pointer`}
                          title="Edit Student Data &amp; Documents"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setSelectedStudent(st)}
                          className={`p-1.5 ${
                            isLight ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white"
                          } rounded-lg transition cursor-pointer`}
                          title="View Student 360 Profile"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => setSlcTargetStudent(st)}
                          className={`p-1.5 ${
                            isLight ? "bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200" : "bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white"
                          } rounded-lg transition cursor-pointer`}
                          title="Issue School Leaving Certificate (SLC)"
                        >
                          <FileCheck2 size={13} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete student record for ${st.firstName} ${st.lastName}?`)) {
                              deleteStudent(st.id);
                            }
                          }}
                          className={`p-1.5 ${
                            isLight ? "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200" : "bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white"
                          } rounded-lg transition cursor-pointer`}
                          title="Delete Student Record"
                        >
                          <Trash2 size={13} />
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
      {/* NEW ADMISSION MODAL (COMPREHENSIVE)                                           */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-sky-500/40 text-white"
          } border rounded-3xl w-full max-w-3xl shadow-2xl p-6 my-8 animate-fade-in-up space-y-4`}>
            <div className={`flex justify-between items-center border-b ${isLight ? "border-slate-100" : "border-gray-800"} pb-3`}>
              <div className="flex items-center gap-2">
                <Plus size={16} className={isLight ? "text-sky-600" : "text-sky-400"} />
                <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>Formal Student Admission Enrolment</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className={`${isLight ? "text-slate-400 hover:text-slate-800" : "text-gray-400 hover:text-white"} cursor-pointer`}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              {/* Photo & Basic Name */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border border-dashed border-sky-500/40 bg-sky-500/5">
                <div className="relative">
                  {form.avatar ? (
                    <img src={form.avatar} alt="Preview" className="w-20 h-20 rounded-2xl object-cover border-2 border-sky-500 shadow-md" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-sky-100 text-sky-700 flex flex-col items-center justify-center font-bold text-xs border-2 border-dashed border-sky-300">
                      <Camera size={20} />
                      <span className="text-[9px] mt-1">Photo</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => addPhotoInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-1.5 bg-sky-600 text-white rounded-full shadow cursor-pointer hover:bg-sky-500"
                    title="Upload Student Photo"
                  >
                    <Upload size={12} />
                  </button>
                  <input
                    ref={addPhotoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e, false)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 w-full">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Muhammad"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      className="w-full border p-2 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Last Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ali"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="w-full border p-2 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Gender</label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value as any })}
                      className="w-full border p-2 rounded-xl font-bold"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Class & Section (DYNAMIC) */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-sky-700 mb-1">Enrolled Class *</label>
                  <select
                    value={form.className}
                    onChange={(e) => handleClassChangeInAdd(e.target.value)}
                    className="w-full border p-2 rounded-xl font-bold"
                  >
                    {configuredClasses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-sky-700 mb-1">Section (Assigned) *</label>
                  <select
                    value={form.sectionName}
                    onChange={(e) => setForm({ ...form, sectionName: e.target.value })}
                    className="w-full border p-2 rounded-xl font-bold"
                  >
                    {getSectionsForClass(form.className).map((sec) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Roll Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 01"
                    value={form.rollNo}
                    onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
                    className="w-full border p-2 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-red-600 mb-1">Blood Group</label>
                  <select
                    value={form.bloodGroup}
                    onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                    className="w-full border p-2 rounded-xl font-bold text-red-600"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              {/* Demographics & B-Form */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Date of Birth (DOB)</label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                    className="w-full border p-2 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">B-Form / CNIC No.</label>
                  <input
                    type="text"
                    placeholder="35202-xxxxxxx-x"
                    value={form.bFormOrCnic}
                    onChange={(e) => setForm({ ...form, bFormOrCnic: e.target.value })}
                    className="w-full border p-2 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Previous School Attended</label>
                  <input
                    type="text"
                    placeholder="e.g. Army Public School"
                    value={form.previousSchool}
                    onChange={(e) => setForm({ ...form, previousSchool: e.target.value })}
                    className="w-full border p-2 rounded-xl"
                  />
                </div>
              </div>

              {/* Father / Guardian Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Father / Guardian Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mian Talal Ahmad"
                    value={form.fatherName}
                    onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                    className="w-full border p-2 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Father CNIC</label>
                  <input
                    type="text"
                    placeholder="35202-xxxxxxx-x"
                    value={form.fatherCnic}
                    onChange={(e) => setForm({ ...form, fatherCnic: e.target.value })}
                    className="w-full border p-2 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-emerald-700 mb-1">Emergency Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="03396399895"
                    value={form.emergencyContact}
                    onChange={(e) => setForm({ ...form, emergencyContact: e.target.value, fatherPhone: e.target.value })}
                    className="w-full border p-2 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              {/* Address & Medical */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Complete Residential Address</label>
                  <input
                    type="text"
                    placeholder="House #, Street, Block, City"
                    value={form.residentialAddress}
                    onChange={(e) => setForm({ ...form, residentialAddress: e.target.value })}
                    className="w-full border p-2 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Medical Notes &amp; Allergies</label>
                  <input
                    type="text"
                    placeholder="e.g. Peanut allergy, Asthma, Relieved with inhaler"
                    value={form.medicalNotes}
                    onChange={(e) => setForm({ ...form, medicalNotes: e.target.value })}
                    className="w-full border p-2 rounded-xl"
                  />
                </div>
              </div>

              {/* Fee Structure */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Fee Concession Category</label>
                  <select
                    value={form.feeCategory}
                    onChange={(e) => setForm({ ...form, feeCategory: e.target.value as any })}
                    className="w-full border p-2 rounded-xl font-bold"
                  >
                    <option value="Standard">Standard Full Fee</option>
                    <option value="Sibling Concession (20%)">Sibling Concession (20% Off)</option>
                    <option value="Staff Child (50%)">Staff Child (50% Off)</option>
                    <option value="Need Based 100% Scholarship">Need-Based 100% Scholarship</option>
                    <option value="Merit Scholarship">Merit Scholarship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-emerald-700 mb-1">Custom Monthly Tuition (PKR)</label>
                  <input
                    type="number"
                    value={form.customMonthlyFee}
                    onChange={(e) => setForm({ ...form, customMonthlyFee: parseFloat(e.target.value) || 0 })}
                    className="w-full border p-2 rounded-xl font-bold text-emerald-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-lg shadow-sky-600/20 cursor-pointer"
              >
                <CheckCircle2 size={16} />
                <span>Confirm &amp; Enrol Student (Auto-Generate GR #)</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* EDIT STUDENT MODAL                                                            */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {showEditModal && editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-amber-500/40 text-white"
          } border rounded-3xl w-full max-w-3xl shadow-2xl p-6 my-8 animate-fade-in-up space-y-4`}>
            <div className={`flex justify-between items-center border-b ${isLight ? "border-slate-100" : "border-gray-800"} pb-3`}>
              <div className="flex items-center gap-2">
                <Edit2 size={16} className={isLight ? "text-amber-600" : "text-amber-400"} />
                <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>
                  Edit Student Profile &amp; Records: {editingStudent.admissionNo}
                </h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className={`${isLight ? "text-slate-400 hover:text-slate-800" : "text-gray-400 hover:text-white"} cursor-pointer`}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              {/* Photo & Names */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5">
                <div className="relative">
                  {editingStudent.avatar ? (
                    <img src={editingStudent.avatar} alt="Preview" className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500 shadow-md" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-amber-100 text-amber-700 flex flex-col items-center justify-center font-bold text-xs border-2 border-dashed border-amber-300">
                      <Camera size={20} />
                      <span className="text-[9px] mt-1">Photo</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => editPhotoInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-1.5 bg-amber-600 text-white rounded-full shadow cursor-pointer hover:bg-amber-500"
                    title="Change Student Photo"
                  >
                    <Upload size={12} />
                  </button>
                  <input
                    ref={editPhotoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e, true)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 w-full">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={editingStudent.firstName}
                      onChange={(e) => setEditingStudent({ ...editingStudent, firstName: e.target.value })}
                      className="w-full border p-2 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={editingStudent.lastName}
                      onChange={(e) => setEditingStudent({ ...editingStudent, lastName: e.target.value })}
                      className="w-full border p-2 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Status</label>
                    <select
                      value={editingStudent.status}
                      onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value as any })}
                      className="w-full border p-2 rounded-xl font-bold"
                    >
                      <option value="Active">Active</option>
                      <option value="Promoted">Promoted</option>
                      <option value="Alumni">Alumni</option>
                      <option value="Struck Off">Struck Off</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Class & Section (DYNAMIC) */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-sky-700 mb-1">Class *</label>
                  <select
                    value={editingStudent.className}
                    onChange={(e) => {
                      const newClass = e.target.value;
                      const secs = getSectionsForClass(newClass);
                      setEditingStudent({
                        ...editingStudent,
                        className: newClass,
                        sectionName: secs[0] || "Section A"
                      });
                    }}
                    className="w-full border p-2 rounded-xl font-bold"
                  >
                    {configuredClasses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-sky-700 mb-1">Section *</label>
                  <select
                    value={editingStudent.sectionName}
                    onChange={(e) => setEditingStudent({ ...editingStudent, sectionName: e.target.value })}
                    className="w-full border p-2 rounded-xl font-bold"
                  >
                    {getSectionsForClass(editingStudent.className).map((sec) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={editingStudent.rollNo}
                    onChange={(e) => setEditingStudent({ ...editingStudent, rollNo: e.target.value })}
                    className="w-full border p-2 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-red-600 mb-1">Blood Group</label>
                  <select
                    value={editingStudent.bloodGroup || "B+"}
                    onChange={(e) => setEditingStudent({ ...editingStudent, bloodGroup: e.target.value })}
                    className="w-full border p-2 rounded-xl font-bold text-red-600"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              {/* DOB & CNIC */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editingStudent.dob}
                    onChange={(e) => setEditingStudent({ ...editingStudent, dob: e.target.value })}
                    className="w-full border p-2 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">B-Form / CNIC</label>
                  <input
                    type="text"
                    value={editingStudent.bFormOrCnic}
                    onChange={(e) => setEditingStudent({ ...editingStudent, bFormOrCnic: e.target.value })}
                    className="w-full border p-2 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Emergency Phone</label>
                  <input
                    type="text"
                    value={editingStudent.emergencyContact || editingStudent.fatherPhone}
                    onChange={(e) => setEditingStudent({ ...editingStudent, emergencyContact: e.target.value, fatherPhone: e.target.value })}
                    className="w-full border p-2 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              {/* Father Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Father's Name</label>
                  <input
                    type="text"
                    value={editingStudent.fatherName}
                    onChange={(e) => setEditingStudent({ ...editingStudent, fatherName: e.target.value })}
                    className="w-full border p-2 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Father CNIC</label>
                  <input
                    type="text"
                    value={editingStudent.fatherCnic || ""}
                    onChange={(e) => setEditingStudent({ ...editingStudent, fatherCnic: e.target.value })}
                    className="w-full border p-2 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Address & Medical */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={editingStudent.residentialAddress || ""}
                    onChange={(e) => setEditingStudent({ ...editingStudent, residentialAddress: e.target.value })}
                    className="w-full border p-2 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Medical / Allergies</label>
                  <input
                    type="text"
                    value={editingStudent.medicalNotes || ""}
                    onChange={(e) => setEditingStudent({ ...editingStudent, medicalNotes: e.target.value })}
                    className="w-full border p-2 rounded-xl"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-black uppercase rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-lg shadow-amber-600/20 cursor-pointer"
              >
                <CheckCircle2 size={16} />
                <span>Save Student Changes</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* PROMOTION WIZARD MODAL                                                        */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {showPromoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-purple-500/40 text-white"
          } border rounded-3xl w-full max-w-md shadow-2xl p-6 animate-fade-in-up`}>
            <div className={`flex justify-between items-center border-b ${isLight ? "border-slate-100" : "border-gray-800"} pb-3 mb-4`}>
              <div className="flex items-center gap-2">
                <ArrowUpRight size={16} className={isLight ? "text-purple-600" : "text-purple-400"} />
                <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>Batch Class Promotion Wizard</h3>
              </div>
              <button onClick={() => setShowPromoteModal(false)} className={`${isLight ? "text-slate-400 hover:text-slate-800" : "text-gray-400 hover:text-white"} cursor-pointer`}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handlePromoteSubmit} className="space-y-4 text-xs">
              <div className={`${isLight ? "bg-purple-50 border-purple-200 text-purple-900" : "bg-purple-500/10 border-purple-500/30 text-purple-300"} border p-3 rounded-xl text-xs`}>
                Select the Source Class to promote all active students to their next target Class &amp; Section for the new session.
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-slate-500">Source Class</label>
                <select
                  value={promoForm.sourceClass}
                  onChange={(e) => setPromoForm({ ...promoForm, sourceClass: e.target.value })}
                  className="w-full border p-2.5 rounded-xl font-bold"
                >
                  {configuredClasses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-emerald-700">Promote To Target Class</label>
                <select
                  value={promoForm.targetClass}
                  onChange={(e) => setPromoForm({ ...promoForm, targetClass: e.target.value })}
                  className="w-full border p-2.5 rounded-xl font-bold"
                >
                  {configuredClasses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase rounded-xl transition flex items-center justify-center gap-2 text-xs cursor-pointer shadow-lg shadow-purple-600/20"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-purple-500/40 text-white"
          } border rounded-3xl w-full max-w-md shadow-2xl p-6 animate-fade-in-up`}>
            <div className={`flex justify-between items-center border-b ${isLight ? "border-slate-100" : "border-gray-800"} pb-3 mb-4`}>
              <div className="flex items-center gap-2">
                <FileCheck2 size={16} className={isLight ? "text-purple-600" : "text-purple-400"} />
                <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>Issue School Leaving Certificate</h3>
              </div>
              <button onClick={() => setSlcTargetStudent(null)} className={`${isLight ? "text-slate-400 hover:text-slate-800" : "text-gray-400 hover:text-white"} cursor-pointer`}>
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className={`${isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-black/40 border-gray-800 text-gray-300"} border rounded-xl p-3 space-y-1 font-mono`}>
                <div>Student: <span className={`${isLight ? "text-slate-900" : "text-white"} font-bold`}>{slcTargetStudent.firstName} {slcTargetStudent.lastName}</span></div>
                <div>GR ID: <span className={`${isLight ? "text-sky-700" : "text-sky-400"} font-bold`}>{slcTargetStudent.admissionNo}</span></div>
                <div>Class: <span className={isLight ? "text-purple-700 font-bold" : "text-purple-400"}>{slcTargetStudent.className}</span></div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Reason for Leaving *</label>
                <textarea
                  rows={3}
                  value={slcReason}
                  onChange={(e) => setSlcReason(e.target.value)}
                  className="w-full border p-2.5 rounded-xl text-xs resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    issueSchoolLeavingCertificate(slcTargetStudent.id, slcReason);
                    handlePrintSLC(slcTargetStudent);
                    setSlcTargetStudent(null);
                  }}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase rounded-xl transition flex items-center justify-center gap-2 text-xs cursor-pointer shadow-lg shadow-purple-600/20"
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
      {/* STUDENT 360 PROFILE VIEW MODAL                                                */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-sky-500/40 text-white"
          } border rounded-3xl w-full max-w-3xl shadow-2xl p-6 my-8 animate-fade-in-up space-y-5`}>
            {/* Header */}
            <div className={`flex justify-between items-start border-b ${isLight ? "border-slate-100" : "border-gray-800"} pb-4`}>
              <div className="flex items-center gap-4">
                {selectedStudent.avatar ? (
                  <img src={selectedStudent.avatar} alt="Profile" className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-500 shadow-lg" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-sky-600/30">
                    {selectedStudent.firstName[0]}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className={`text-xl font-black ${isLight ? "text-slate-900" : "text-white"}`}>
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </h2>
                    <span className={`text-[10px] font-bold ${
                      isLight ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    } border px-2.5 py-0.5 rounded-full`}>
                      {selectedStudent.status}
                    </span>
                  </div>
                  <div className={`text-xs ${isLight ? "text-slate-500" : "text-gray-400"} mt-0.5`}>
                    Admission ID: <b className={`${isLight ? "text-sky-700" : "text-sky-400"} font-mono`}>{selectedStudent.admissionNo}</b> • Roll #{selectedStudent.rollNo} • {selectedStudent.className} ({selectedStudent.sectionName})
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className={`${isLight ? "text-slate-400 hover:text-slate-800" : "text-gray-400 hover:text-white"} p-1 cursor-pointer`}>
                <X size={18} />
              </button>
            </div>

            {/* 3-Column Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className={`${isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-black/40 border-gray-800 text-gray-300"} border p-4 rounded-xl space-y-1.5`}>
                <span className={`text-[10px] uppercase font-bold ${isLight ? "text-sky-700" : "text-sky-400"} block`}>Guardian / Father Info</span>
                <div>Name: <b className={isLight ? "text-slate-900" : "text-white"}>{selectedStudent.fatherName}</b></div>
                <div>CNIC: <span className={`${isLight ? "text-slate-600" : "text-gray-300"} font-mono`}>{selectedStudent.fatherCnic || 'N/A'}</span></div>
                <div>Phone: <b className={isLight ? "text-emerald-700" : "text-emerald-400"}>{selectedStudent.emergencyContact || selectedStudent.fatherPhone}</b></div>
                <div>Address: <span className={isLight ? "text-slate-600" : "text-gray-400"}>{selectedStudent.residentialAddress || 'N/A'}</span></div>
              </div>

              <div className={`${isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-black/40 border-gray-800 text-gray-300"} border p-4 rounded-xl space-y-1.5`}>
                <span className={`text-[10px] uppercase font-bold ${isLight ? "text-emerald-700" : "text-emerald-400"} block`}>Academic &amp; Tuition</span>
                <div>Class: <b className={isLight ? "text-sky-700" : "text-sky-300"}>{selectedStudent.className}</b></div>
                <div>Section: <b className={isLight ? "text-sky-700" : "text-sky-300"}>{selectedStudent.sectionName}</b></div>
                <div>Monthly Fee: <b className={isLight ? "text-emerald-700" : "text-emerald-400"}>Rs {(selectedStudent.customMonthlyFee || 0).toLocaleString()}</b></div>
                <div>Fee Category: <span className={isLight ? "text-slate-600" : "text-gray-300"}>{selectedStudent.feeCategory}</span></div>
              </div>

              <div className={`${isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-black/40 border-gray-800 text-gray-300"} border p-4 rounded-xl space-y-1.5`}>
                <span className={`text-[10px] uppercase font-bold ${isLight ? "text-rose-700" : "text-rose-400"} block`}>Health &amp; Demographics</span>
                <div>Blood Group: <b className="text-red-600 font-black">{selectedStudent.bloodGroup || 'B+'}</b></div>
                <div>DOB: <span className={isLight ? "text-slate-600" : "text-gray-300"}>{selectedStudent.dob}</span></div>
                <div>Gender: <span className={isLight ? "text-slate-600" : "text-gray-300"}>{selectedStudent.gender}</span></div>
                <div>Medical Alert: <span className={isLight ? "text-slate-600" : "text-gray-400"}>{selectedStudent.medicalNotes || 'No known allergies'}</span></div>
              </div>
            </div>

            {/* Quick Action Footer */}
            <div className={`pt-2 border-t ${isLight ? "border-slate-100" : "border-gray-800"} flex flex-wrap justify-between items-center gap-3`}>
              <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-500"} font-mono`}>
                Enrolled On: {selectedStudent.admissionDate}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleOpenEdit(selectedStudent);
                    setSelectedStudent(null);
                  }}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Edit2 size={14} />
                  <span>Edit Data</span>
                </button>
                <button
                  onClick={() => handlePrintIdCard(selectedStudent)}
                  className={`px-3.5 py-2 ${
                    isLight ? "bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white border border-sky-200" : "bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white"
                  } rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer`}
                >
                  <QrCode size={14} />
                  <span>Print PVC Card</span>
                </button>
                <button
                  onClick={() => {
                    setSlcTargetStudent(selectedStudent);
                    setSelectedStudent(null);
                  }}
                  className={`px-3.5 py-2 ${
                    isLight ? "bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white border border-purple-200" : "bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white"
                  } rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer`}
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
