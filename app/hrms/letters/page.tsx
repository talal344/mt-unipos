"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import HRMSTopHeader from "@/components/hrms-top-header";
import { useGlobalContext } from "@/context/global-context";
import {
  FileText,
  PenTool,
  CheckCircle2,
  Printer,
  Download,
  Copy,
  RotateCcw,
  Trash2,
  History,
  Sparkles,
  Building2,
  ShieldCheck,
  Eye,
  RefreshCw,
  Award,
  Briefcase,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  Search,
  Filter,
  Check,
  X,
  QrCode,
  Calendar,
  DollarSign,
  User,
  Users,
  Layers,
  ArrowRight,
  ChevronDown
} from "lucide-react";

export type LetterTemplateType =
  | "experience"
  | "employment"
  | "salary"
  | "offer"
  | "increment"
  | "warning"
  | "custom";

export interface GeneratedLetterRecord {
  id: string;
  refNumber: string;
  templateType: LetterTemplateType;
  title: string;
  employeeId?: string;
  employeeName: string;
  employeeCode?: string;
  designation: string;
  department: string;
  issueDate: string;
  signatoryName: string;
  signatoryDesignation: string;
  signatureImage?: string;
  hasSeal: boolean;
  content: string;
  createdAt: string;
}

export default function HRLetterGeneratorPage() {
  const { currentUser, hrEmployees, currencySymbol } = useGlobalContext();

  const businessName =
    currentUser?.businessName && currentUser.businessName !== "Unknown" && currentUser.businessName !== "My Business"
      ? currentUser.businessName
      : "MT Software & Retail Solutions";

  // Tab State
  const [activeTab, setActiveTab] = useState<"studio" | "archive">("studio");

  // Selected Template
  const [templateType, setTemplateType] = useState<LetterTemplateType>("experience");

  // Selected Employee for Autofill
  const [selectedEmpId, setSelectedEmpId] = useState<string>("");

  // Letter Fields
  const [refNumber, setRefNumber] = useState<string>(() => `HR/DOC/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`);
  const [issueDate, setIssueDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [effectiveDate, setEffectiveDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [relievingDate, setRelievingDate] = useState<string>(() => new Date().toISOString().split("T")[0]);

  // Employee details
  const [empName, setEmpName] = useState<string>("Muhammad Talal");
  const [empCode, setEmpCode] = useState<string>("EMP-001");
  const [empDesignation, setEmpDesignation] = useState<string>("Senior Full-Stack Engineer");
  const [empDepartment, setEmpDepartment] = useState<string>("IT & Software Operations");
  const [empJoiningDate, setEmpJoiningDate] = useState<string>("2023-01-15");
  const [empSalary, setEmpSalary] = useState<number>(185000);
  const [empCnic, setEmpCnic] = useState<string>("35201-1234567-1");
  const [empEmail, setEmpEmail] = useState<string>("talal@company.com");
  const [empPhone, setEmpPhone] = useState<string>("+92 300 1234567");

  // Template-specific extras
  const [revisedSalary, setRevisedSalary] = useState<number>(225000);
  const [newDesignation, setNewDesignation] = useState<string>("Lead Solutions Architect");
  const [probationMonths, setProbationMonths] = useState<number>(3);
  const [noticePeriodDays, setNoticePeriodDays] = useState<number>(30);
  const [warningReason, setWarningReason] = useState<string>("Unexcused absenteeism and project deadline breach");
  const [correctivePeriodDays, setCorrectivePeriodDays] = useState<number>(14);
  const [conductRating, setConductRating] = useState<string>("Exemplary & Diligent");

  // Custom Letter State
  const [customSubject, setCustomSubject] = useState<string>("TO WHOM IT MAY CONCERN");
  const [customBody, setCustomBody] = useState<string>(
    "This letter is issued upon the formal request of {{employee_name}} (Employee ID: {{employee_code}}), who is actively serving as {{designation}} in our {{department}} department.\n\nDuring their tenure since {{joining_date}}, they have demonstrated exceptional dedication, high ethical standards, and profound technical proficiency.\n\nWe extend our highest recommendation and wish them continued success in all their future endeavors."
  );

  // Signatory & Authentication Controls
  const [signatoryName, setSignatoryName] = useState<string>(currentUser?.name || "Dr. H. Mian (Managing Director)");
  const [signatoryDesignation, setSignatoryDesignation] = useState<string>("Head of Human Resources & Operations");
  const [companyAddress, setCompanyAddress] = useState<string>("Corporate Headquarters, Commercial Sector 4, Tech Park, Lahore");
  const [companyContact, setCompanyContact] = useState<string>("hr@mtsoftware.com | +92 (42) 3588-9000");

  const [includeLetterhead, setIncludeLetterhead] = useState<boolean>(true);
  const [includeSeal, setIncludeSeal] = useState<boolean>(true);
  const [includeQr, setIncludeQr] = useState<boolean>(true);
  const [includeSignatory, setIncludeSignatory] = useState<boolean>(true);
  const [includeEmployeeSign, setIncludeEmployeeSign] = useState<boolean>(false);

  // E-Signature Pad State
  const [signatureImage, setSignatureImage] = useState<string>("");
  const [showSigModal, setShowSigModal] = useState<boolean>(false);
  const [sigMode, setSigMode] = useState<"draw" | "type">("draw");
  const [typedSigText, setTypedSigText] = useState<string>(currentUser?.name || "Talal Ahmad");

  // Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Archive / Saved Letters State
  const [savedLetters, setSavedLetters] = useState<GeneratedLetterRecord[]>([]);
  const [archiveSearch, setArchiveSearch] = useState<string>("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const printAreaRef = useRef<HTMLDivElement | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Load Saved Letters from localStorage
  useEffect(() => {
    if (currentUser?.tenantId) {
      const key = `hr_generated_letters_${currentUser.tenantId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          setSavedLetters(JSON.parse(saved));
        } catch {
          setSavedLetters([]);
        }
      }
    }
  }, [currentUser]);

  // Initial autofill from first employee if available
  useEffect(() => {
    if (hrEmployees.length > 0 && !selectedEmpId) {
      const first = hrEmployees[0];
      handleSelectEmployee(first.id);
    }
  }, [hrEmployees]);

  const handleSelectEmployee = (empId: string) => {
    setSelectedEmpId(empId);
    const emp = hrEmployees.find((e) => e.id === empId);
    if (emp) {
      setEmpName(emp.name || "");
      setEmpCode(emp.employeeCode || "EMP-001");
      setEmpDesignation(emp.designation || "");
      setEmpDepartment(emp.department || "");
      setEmpJoiningDate(emp.joiningDate || "2023-01-15");
      setEmpSalary(emp.basicSalary || 120000);
      setEmpCnic(emp.cnic || "35201-0000000-0");
      setEmpEmail(emp.email || "");
      setEmpPhone(emp.phone || "");
      triggerToast(`👤 Loaded data for ${emp.name}`);
    }
  };

  // Canvas signature handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#104c91"; // Official deep blue pen ink color
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    if (sigMode === "draw") {
      const canvas = canvasRef.current;
      if (canvas) {
        const dataUrl = canvas.toDataURL("image/png");
        setSignatureImage(dataUrl);
      }
    } else {
      // Convert typed text to canvas png for uniform embedding
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = 400;
      tempCanvas.height = 120;
      const ctx = tempCanvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#104c91";
        ctx.font = "italic bold 38px 'Brush Script MT', 'Dancing Script', 'Segoe Script', cursive, serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(typedSigText, 200, 60);
        setSignatureImage(tempCanvas.toDataURL("image/png"));
      }
    }
    setShowSigModal(false);
    triggerToast("🖋️ Digital signature applied!");
  };

  const generateNewRef = () => {
    const newRef = `HR/DOC/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;
    setRefNumber(newRef);
  };

  // Helper formatting
  const formatDateFormal = (dStr: string) => {
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch {
      return dStr;
    }
  };

  const currencyFmt = (val: number) => {
    return `${currencySymbol} ${val.toLocaleString()}`;
  };

  // Template titles
  const templateTitles: Record<LetterTemplateType, string> = {
    experience: "Experience & Service Certificate",
    employment: "Certificate of Employment & Verification",
    salary: "Salary & Compensation Certificate",
    offer: "Formal Offer & Appointment Letter",
    increment: "Promotion & Salary Increment Letter",
    warning: "Formal Disciplinary & Warning Notice",
    custom: "Official Corporate Letter"
  };

  // Save generated letter to vault
  const handleSaveToVault = () => {
    const newLetter: GeneratedLetterRecord = {
      id: `LET-${Date.now()}`,
      refNumber,
      templateType,
      title: templateTitles[templateType],
      employeeId: selectedEmpId,
      employeeName: empName,
      employeeCode: empCode,
      designation: empDesignation,
      department: empDepartment,
      issueDate,
      signatoryName,
      signatoryDesignation,
      signatureImage,
      hasSeal: includeSeal,
      content: customBody,
      createdAt: new Date().toISOString()
    };

    const updated = [newLetter, ...savedLetters];
    setSavedLetters(updated);
    if (currentUser?.tenantId) {
      localStorage.setItem(`hr_generated_letters_${currentUser.tenantId}`, JSON.stringify(updated));
    }
    triggerToast("💾 Letter archived successfully into Document Vault!");
  };

  const handleDeleteSaved = (id: string) => {
    const updated = savedLetters.filter((l) => l.id !== id);
    setSavedLetters(updated);
    if (currentUser?.tenantId) {
      localStorage.setItem(`hr_generated_letters_${currentUser.tenantId}`, JSON.stringify(updated));
    }
    triggerToast("🗑️ Document removed from archive.");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const textContent = `
${businessName.toUpperCase()}
${companyAddress}
Contact: ${companyContact}

REF: ${refNumber}
DATE: ${formatDateFormal(issueDate)}

${templateTitles[templateType].toUpperCase()}
Subject: Concerning ${empName} (${empCode})

Dear Recipient,
This is an official communication issued regarding ${empName}, serving as ${empDesignation} in the ${empDepartment} department.

Authorized Signatory: ${signatoryName} (${signatoryDesignation})
`;
    navigator.clipboard.writeText(textContent);
    triggerToast("📋 Formatted letter text copied to clipboard!");
  };

  // Filtered archive records
  const filteredArchive = useMemo(() => {
    if (!archiveSearch.trim()) return savedLetters;
    const q = archiveSearch.toLowerCase();
    return savedLetters.filter(
      (l) =>
        l.refNumber.toLowerCase().includes(q) ||
        l.employeeName.toLowerCase().includes(q) ||
        l.title.toLowerCase().includes(q) ||
        l.designation.toLowerCase().includes(q) ||
        l.department.toLowerCase().includes(q)
    );
  }, [savedLetters, archiveSearch]);

  return (
    <div className="flex h-screen bg-[#05080d] text-gray-100 font-sans overflow-hidden">
      <HRMSSidebar />

      <main className="flex-grow overflow-y-auto h-full">
        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-black px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce border border-emerald-400/50">
            <CheckCircle2 size={16} />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Top Header */}
        <HRMSTopHeader
          title="Dynamic HR Letter Generator & E-Signature Suite"
          subtitle="Generate official company certificates, offer letters, salary proofs, and legal HR documents with dynamic autofill, digital signatures, and official seals."
        />

        <div className="p-6 space-y-6">
          {/* Top Quick Stats & Studio / Archive Mode Switcher */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-gradient-to-r from-gray-900 via-gray-900/90 to-gray-950 border border-emerald-500/20 p-4 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                <FileText size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-white tracking-wide">HR Document & Certificate Studio</h2>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-emerald-500/30">
                    Official Engine
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Ready-to-print corporate templates with cryptographic stamps, QR authenticity tracking & e-signatures.
                </p>
              </div>
            </div>

            {/* Tab Selector */}
            <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-xl border border-gray-800 self-start md:self-auto">
              <button
                onClick={() => setActiveTab("studio")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition cursor-pointer ${
                  activeTab === "studio"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/40"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Sparkles size={14} />
                <span>Letter Studio</span>
              </button>
              <button
                onClick={() => setActiveTab("archive")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition cursor-pointer ${
                  activeTab === "archive"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/40"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <History size={14} />
                <span>Issued Letters Archive</span>
                {savedLetters.length > 0 && (
                  <span className="bg-emerald-400/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                    {savedLetters.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {activeTab === "studio" ? (
            <div className="space-y-6">
              {/* Template Category Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-2.5">
                {[
                  { type: "experience" as LetterTemplateType, label: "Experience Letter", icon: Award, desc: "Service & tenure proof" },
                  { type: "employment" as LetterTemplateType, label: "Employment Cert.", icon: Briefcase, desc: "Visa & bank verification" },
                  { type: "salary" as LetterTemplateType, label: "Salary Certificate", icon: DollarSign, desc: "Income & payslip summary" },
                  { type: "offer" as LetterTemplateType, label: "Offer Letter", icon: FileCheck, desc: "Appointment & terms" },
                  { type: "increment" as LetterTemplateType, label: "Increment / Promo", icon: TrendingUp, desc: "Appraisal & title revision" },
                  { type: "warning" as LetterTemplateType, label: "Warning Notice", icon: AlertTriangle, desc: "Disciplinary action" },
                  { type: "custom" as LetterTemplateType, label: "Custom Letter", icon: Layers, desc: "Draft custom template" }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = templateType === item.type;
                  return (
                    <button
                      key={item.type}
                      onClick={() => setTemplateType(item.type)}
                      className={`flex flex-col items-start p-3 rounded-xl border text-left transition relative overflow-hidden group min-w-0 cursor-pointer ${
                        isSelected
                          ? "bg-gradient-to-b from-emerald-500/20 to-teal-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-950/50"
                          : "bg-gray-900/60 border-gray-800/80 text-gray-400 hover:border-gray-700 hover:text-gray-200"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-400 rounded-bl-lg shadow-sm" />
                      )}
                      <div className="flex items-center gap-2 mb-1.5 w-full">
                        <div
                          className={`p-1.5 rounded-lg shrink-0 ${
                            isSelected ? "bg-emerald-500 text-black font-bold" : "bg-gray-800 text-gray-400 group-hover:text-emerald-400"
                          }`}
                        >
                          <Icon size={14} />
                        </div>
                        <span className="font-bold text-xs text-white leading-tight truncate">{item.label}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 group-hover:text-gray-400 leading-tight truncate w-full block">{item.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Main Two-Column Layout: Controls on Left, Live Printable A4 Preview on Right */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* ── LEFT PANEL: CONFIGURATION & VARIABLE CONTROLS ── */}
                <div className="xl:col-span-5 space-y-4">
                  {/* Employee Autofill Selection */}
                  <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center gap-2">
                        <Users size={14} className="text-emerald-400" />
                        <span>Autofill From Employee Record</span>
                      </label>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {hrEmployees.length} Staff in DB
                      </span>
                    </div>

                    <div className="relative">
                      <select
                        value={selectedEmpId}
                        onChange={(e) => handleSelectEmployee(e.target.value)}
                        className="w-full bg-black/80 border border-gray-700/80 rounded-xl px-3 py-2.5 pr-8 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium cursor-pointer appearance-none"
                      >
                        <option value="">Select an employee to autofill...</option>
                        {hrEmployees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} — {emp.designation} ({emp.department}) [{emp.employeeCode}]
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-3 pointer-events-none text-gray-400">
                        <ChevronDown size={14} />
                      </div>
                    </div>
                  </div>

                  {/* Document Meta Configuration */}
                  <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                      <h3 className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center gap-2">
                        <FileText size={14} className="text-emerald-400" />
                        <span>Document Credentials</span>
                      </h3>
                      <button
                        onClick={generateNewRef}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <RefreshCw size={10} />
                        <span>Regenerate Ref</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1">Reference Number</label>
                        <input
                          type="text"
                          value={refNumber}
                          onChange={(e) => setRefNumber(e.target.value)}
                          className="w-full bg-black/50 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1">Date of Issue</label>
                        <input
                          type="date"
                          value={issueDate}
                          onChange={(e) => setIssueDate(e.target.value)}
                          className="w-full bg-black/50 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Employee Details Editor */}
                  <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 space-y-3 shadow-lg">
                    <h3 className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-2">
                      <User size={14} className="text-emerald-400" />
                      <span>Employee Particulars</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={empName}
                          onChange={(e) => setEmpName(e.target.value)}
                          className="w-full bg-black/50 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1">Employee Code</label>
                        <input
                          type="text"
                          value={empCode}
                          onChange={(e) => setEmpCode(e.target.value)}
                          className="w-full bg-black/50 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-emerald-500 focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1">Current Designation</label>
                        <input
                          type="text"
                          value={empDesignation}
                          onChange={(e) => setEmpDesignation(e.target.value)}
                          className="w-full bg-black/50 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1">Department</label>
                        <input
                          type="text"
                          value={empDepartment}
                          onChange={(e) => setEmpDepartment(e.target.value)}
                          className="w-full bg-black/50 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1">Joining Date</label>
                        <input
                          type="date"
                          value={empJoiningDate}
                          onChange={(e) => setEmpJoiningDate(e.target.value)}
                          className="w-full bg-black/50 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1">Basic / Gross Monthly Salary</label>
                        <div className="flex items-center rounded-lg border border-gray-700 bg-black/50 overflow-hidden focus-within:border-emerald-500">
                          <span className="px-2.5 py-1.5 bg-gray-800/80 text-gray-400 font-bold text-xs border-r border-gray-700 select-none shrink-0 font-mono">
                            {currencySymbol}
                          </span>
                          <input
                            type="number"
                            value={empSalary}
                            onChange={(e) => setEmpSalary(Number(e.target.value))}
                            className="w-full bg-transparent px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1">CNIC / ID Number</label>
                        <input
                          type="text"
                          value={empCnic}
                          onChange={(e) => setEmpCnic(e.target.value)}
                          className="w-full bg-black/50 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-emerald-500 focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1">Work Email</label>
                        <input
                          type="email"
                          value={empEmail}
                          onChange={(e) => setEmpEmail(e.target.value)}
                          className="w-full bg-black/50 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Template-Specific Variable Controls */}
                  {templateType === "experience" && (
                    <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 space-y-3 shadow-lg">
                      <h3 className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-2">
                        <Award size={14} className="text-amber-400" />
                        <span>Experience Certificate Variables</span>
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">Relieving / End Date</label>
                          <input
                            type="date"
                            value={relievingDate}
                            onChange={(e) => setRelievingDate(e.target.value)}
                            className="w-full bg-black/50 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">Conduct & Performance Appraisal</label>
                          <input
                            type="text"
                            value={conductRating}
                            onChange={(e) => setConductRating(e.target.value)}
                            className="w-full bg-black/50 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {templateType === "increment" && (
                    <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 space-y-3 shadow-lg">
                      <h3 className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-2">
                        <TrendingUp size={14} className="text-emerald-400" />
                        <span>Promotion & Increment Variables</span>
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">Promoted Designation</label>
                          <input
                            type="text"
                            value={newDesignation}
                            onChange={(e) => setNewDesignation(e.target.value)}
                            className="w-full bg-black/50 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">Revised Monthly Salary</label>
                          <div className="flex items-center rounded-lg border border-gray-700 bg-black/50 overflow-hidden focus-within:border-emerald-500">
                            <span className="px-2.5 py-1.5 bg-gray-800/80 text-gray-400 font-bold text-xs border-r border-gray-700 select-none shrink-0 font-mono">
                              {currencySymbol}
                            </span>
                            <input
                              type="number"
                              value={revisedSalary}
                              onChange={(e) => setRevisedSalary(Number(e.target.value))}
                              className="w-full bg-transparent px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">Effective Date</label>
                          <input
                            type="date"
                            value={effectiveDate}
                            onChange={(e) => setEffectiveDate(e.target.value)}
                            className="w-full bg-black/50 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {templateType === "offer" && (
                    <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 space-y-3 shadow-lg">
                      <h3 className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-2">
                        <FileCheck size={14} className="text-blue-400" />
                        <span>Job Offer & Probation Terms</span>
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">Probation Period (Months)</label>
                          <input
                            type="number"
                            value={probationMonths}
                            onChange={(e) => setProbationMonths(Number(e.target.value))}
                            className="w-full bg-black/50 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">Notice Period (Days)</label>
                          <input
                            type="number"
                            value={noticePeriodDays}
                            onChange={(e) => setNoticePeriodDays(Number(e.target.value))}
                            className="w-full bg-black/50 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {templateType === "warning" && (
                    <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 space-y-3 shadow-lg">
                      <h3 className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-2">
                        <AlertTriangle size={14} className="text-rose-400" />
                        <span>Disciplinary Notice Particulars</span>
                      </h3>
                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">Infraction / Breach Reason</label>
                          <textarea
                            rows={2}
                            value={warningReason}
                            onChange={(e) => setWarningReason(e.target.value)}
                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">Corrective Action Window (Days)</label>
                          <input
                            type="number"
                            value={correctivePeriodDays}
                            onChange={(e) => setCorrectivePeriodDays(Number(e.target.value))}
                            className="w-full bg-black/50 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {templateType === "custom" && (
                    <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 space-y-3 shadow-lg">
                      <h3 className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-2">
                        <Layers size={14} className="text-purple-400" />
                        <span>Custom Template & Tag Inserter</span>
                      </h3>
                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">Subject Header</label>
                          <input
                            type="text"
                            value={customSubject}
                            onChange={(e) => setCustomSubject(e.target.value)}
                            className="w-full bg-black/50 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-emerald-500 focus:outline-none uppercase font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">Letter Body Content</label>
                          <textarea
                            rows={6}
                            value={customBody}
                            onChange={(e) => setCustomBody(e.target.value)}
                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-2.5 text-white text-xs focus:border-emerald-500 focus:outline-none leading-relaxed"
                          />
                        </div>

                        {/* Quick Tag Insertion Chips */}
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 block mb-1.5">Click tags to append to letter body:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              "{{employee_name}}",
                              "{{employee_code}}",
                              "{{designation}}",
                              "{{department}}",
                              "{{joining_date}}",
                              "{{basic_salary}}",
                              "{{cnic}}"
                            ].map((tag) => (
                              <button
                                key={tag}
                                onClick={() => setCustomBody((prev) => prev + " " + tag)}
                                className="bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 text-[10px] px-2 py-0.5 rounded font-mono transition"
                              >
                                + {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Signatory, Seal & Verification Elements */}
                  <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 space-y-3 shadow-lg">
                    <h3 className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-2">
                      <ShieldCheck size={14} className="text-emerald-400" />
                      <span>Authorized Signatory & Authentication</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1">Signatory Name</label>
                        <input
                          type="text"
                          value={signatoryName}
                          onChange={(e) => setSignatoryName(e.target.value)}
                          className="w-full bg-black/50 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1">Signatory Designation</label>
                        <input
                          type="text"
                          value={signatoryDesignation}
                          onChange={(e) => setSignatoryDesignation(e.target.value)}
                          className="w-full bg-black/50 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Signature Management Action */}
                    <div className="p-3 bg-black/40 border border-gray-800 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                          <PenTool size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Digital E-Signature</div>
                          <div className="text-[10px] text-gray-400">
                            {signatureImage ? "✅ Signature attached" : "⚠️ No signature applied"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {signatureImage && (
                          <button
                            onClick={() => setSignatureImage("")}
                            className="p-1.5 text-gray-500 hover:text-rose-400 transition"
                            title="Clear signature"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => setShowSigModal(true)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-black px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <PenTool size={12} />
                          <span>{signatureImage ? "Change" : "Draw / Sign"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Authentication Toggles */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <label className="flex items-center gap-2 bg-black/30 p-2 rounded-lg border border-gray-800/80 cursor-pointer hover:border-gray-700">
                        <input
                          type="checkbox"
                          checked={includeLetterhead}
                          onChange={(e) => setIncludeLetterhead(e.target.checked)}
                          className="rounded text-emerald-500 focus:ring-0"
                        />
                        <span className="text-[11px] font-medium text-gray-300">Company Letterhead</span>
                      </label>

                      <label className="flex items-center gap-2 bg-black/30 p-2 rounded-lg border border-gray-800/80 cursor-pointer hover:border-gray-700">
                        <input
                          type="checkbox"
                          checked={includeSeal}
                          onChange={(e) => setIncludeSeal(e.target.checked)}
                          className="rounded text-emerald-500 focus:ring-0"
                        />
                        <span className="text-[11px] font-medium text-gray-300">Official Circular Seal</span>
                      </label>

                      <label className="flex items-center gap-2 bg-black/30 p-2 rounded-lg border border-gray-800/80 cursor-pointer hover:border-gray-700">
                        <input
                          type="checkbox"
                          checked={includeQr}
                          onChange={(e) => setIncludeQr(e.target.checked)}
                          className="rounded text-emerald-500 focus:ring-0"
                        />
                        <span className="text-[11px] font-medium text-gray-300">Security Verification QR</span>
                      </label>

                      <label className="flex items-center gap-2 bg-black/30 p-2 rounded-lg border border-gray-800/80 cursor-pointer hover:border-gray-700">
                        <input
                          type="checkbox"
                          checked={includeEmployeeSign}
                          onChange={(e) => setIncludeEmployeeSign(e.target.checked)}
                          className="rounded text-emerald-500 focus:ring-0"
                        />
                        <span className="text-[11px] font-medium text-gray-300">Employee Counter-Sign</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* ── RIGHT PANEL: LIVE HIGH-FIDELITY A4 LETTER PREVIEW ── */}
                <div className="xl:col-span-7 space-y-4">
                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-900/90 border border-emerald-500/20 p-3.5 rounded-2xl shadow-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-white">Live A4 Paper Preview</span>
                      <span className="text-[10px] text-gray-400 font-mono">({templateTitles[templateType]})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyText}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-gray-700 cursor-pointer"
                        title="Copy text to clipboard"
                      >
                        <Copy size={13} />
                        <span className="hidden sm:inline">Copy Text</span>
                      </button>

                      <button
                        onClick={handleSaveToVault}
                        className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        title="Save to Document Vault"
                      >
                        <FileCheck size={13} />
                        <span>Save to Vault</span>
                      </button>

                      <button
                        onClick={handlePrint}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black px-4 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-lg shadow-emerald-900/30 cursor-pointer"
                      >
                        <Printer size={14} />
                        <span>Print / Save PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* ─────────────────────────────────────────────────────────────
                      A4 DOCUMENT CONTAINER (PRINTABLE AREA)
                      Designed to render clean white paper in preview and print
                  ───────────────────────────────────────────────────────────── */}
                  <div className="bg-gray-950 p-4 sm:p-6 rounded-2xl border border-gray-800 flex justify-center shadow-2xl overflow-x-auto">
                    <div
                      id="printable-letter-document"
                      ref={printAreaRef}
                      className="bg-white text-gray-900 w-[210mm] min-h-[297mm] p-10 sm:p-12 shadow-2xl rounded-sm flex flex-col justify-between relative font-sans text-xs leading-relaxed"
                      style={{ color: "#1a202c" }}
                    >
                      {/* Decorative Top Color Bar */}
                      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700" />

                      {/* Document Body */}
                      <div className="space-y-6">
                        {/* Letterhead Header */}
                        {includeLetterhead && (
                          <div className="border-b-2 border-emerald-800/20 pb-5">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-black text-sm flex items-center justify-center shadow-md">
                                    MT
                                  </div>
                                  <div>
                                    <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none uppercase">
                                      {businessName}
                                    </h1>
                                    <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-widest mt-0.5">
                                      Human Resources & Corporate Governance
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right text-[10px] text-gray-600 space-y-0.5">
                                <p className="font-semibold">{companyAddress}</p>
                                <p>{companyContact}</p>
                                <p className="font-mono text-emerald-800 font-bold">www.mtsoftware.com</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Reference Bar & Date */}
                        <div className="flex items-center justify-between text-[11px] font-semibold text-gray-700 border-b border-gray-200 pb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-500 uppercase tracking-wider">Ref No:</span>
                            <span className="font-mono text-emerald-900 font-bold bg-gray-100 px-2 py-0.5 rounded border border-gray-300">
                              {refNumber}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 uppercase tracking-wider mr-1">Date:</span>
                            <span className="font-bold text-gray-900">{formatDateFormal(issueDate)}</span>
                          </div>
                        </div>

                        {/* Document Title / Subject */}
                        <div className="text-center pt-2 pb-1">
                          <h2 className="text-base font-black text-gray-900 uppercase tracking-wide underline decoration-emerald-600 decoration-2 underline-offset-4">
                            {templateTitles[templateType]}
                          </h2>
                          <p className="text-[11px] text-gray-600 font-bold mt-1">
                            TO WHOM IT MAY CONCERN
                          </p>
                        </div>

                        {/* Dynamic Letter Body Content Based on Template */}
                        <div className="space-y-4 text-justify text-gray-800 text-[11.5px] leading-relaxed">
                          {/* 1. EXPERIENCE LETTER */}
                          {templateType === "experience" && (
                            <>
                              <p>
                                This is to certify that <strong>Mr./Ms. {empName}</strong> (Employee ID: <strong>{empCode}</strong>, CNIC/ID: <strong>{empCnic}</strong>) was employed with <strong>{businessName}</strong> as a <strong>{empDesignation}</strong> in the <strong>{empDepartment}</strong> department from <strong>{formatDateFormal(empJoiningDate)}</strong> to <strong>{formatDateFormal(relievingDate)}</strong>.
                              </p>
                              <p>
                                During their tenure of service, {empName} carried out their responsibilities with sincere commitment, technical excellence, and high professional standards. They proved to be a valuable asset to our organization and exhibited strong collaboration skills across team projects.
                              </p>
                              <p>
                                Their overall conduct, character, and work ethics were appraised as <strong>{conductRating}</strong> throughout their employment tenure. They have completed all necessary company clearances and handovers in full compliance with corporate exit policies.
                              </p>
                              <p>
                                We thank them for their valuable contributions to {businessName} and wish them the very best in all their future career pursuits and personal endeavors.
                              </p>
                            </>
                          )}

                          {/* 2. EMPLOYMENT VERIFICATION LETTER */}
                          {templateType === "employment" && (
                            <>
                              <p>
                                This certificate is issued upon the formal request of our employee, <strong>Mr./Ms. {empName}</strong>, to confirm their official employment status with <strong>{businessName}</strong>.
                              </p>
                              <p>
                                We hereby confirm that <strong>{empName}</strong> (Employee Code: <strong>{empCode}</strong>, CNIC/ID: <strong>{empCnic}</strong>) has been actively employed on a full-time, permanent basis with our organization since <strong>{formatDateFormal(empJoiningDate)}</strong>.
                              </p>
                              <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 my-2 text-[11px] space-y-1 text-gray-800">
                                <div className="grid grid-cols-2 gap-2">
                                  <div><strong>Designation:</strong> {empDesignation}</div>
                                  <div><strong>Department:</strong> {empDepartment}</div>
                                  <div><strong>Employment Status:</strong> Active & Permanent</div>
                                  <div><strong>Official Work Email:</strong> {empEmail}</div>
                                </div>
                              </div>
                              <p>
                                This confirmation letter is issued solely for official verification purposes (such as Embassy Visa processing, Banking facilities, or Official Credentialing) without any financial liability on part of the issuing company.
                              </p>
                            </>
                          )}

                          {/* 3. SALARY CERTIFICATE */}
                          {templateType === "salary" && (
                            <>
                              <p>
                                This is to officially certify that <strong>Mr./Ms. {empName}</strong> (Employee ID: <strong>{empCode}</strong>, CNIC: <strong>{empCnic}</strong>) is a permanent employee of <strong>{businessName}</strong>, currently serving in the capacity of <strong>{empDesignation}</strong> in the <strong>{empDepartment}</strong> department since <strong>{formatDateFormal(empJoiningDate)}</strong>.
                              </p>
                              <p>
                                As per our company payroll records, their current monthly compensation structure is itemized as follows:
                              </p>
                              <div className="border border-gray-300 rounded-lg overflow-hidden my-3">
                                <table className="w-full text-left text-[11px]">
                                  <thead className="bg-gray-100 border-b border-gray-300 font-bold text-gray-900">
                                    <tr>
                                      <th className="p-2 border-r border-gray-300">Earnings Component</th>
                                      <th className="p-2 text-right">Amount ({currencySymbol})</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    <tr>
                                      <td className="p-2 border-r border-gray-300 font-medium">Basic Salary</td>
                                      <td className="p-2 text-right font-mono">{currencyFmt(Math.round(empSalary * 0.65))}</td>
                                    </tr>
                                    <tr>
                                      <td className="p-2 border-r border-gray-300 font-medium">House Rent Allowance (HRA)</td>
                                      <td className="p-2 text-right font-mono">{currencyFmt(Math.round(empSalary * 0.20))}</td>
                                    </tr>
                                    <tr>
                                      <td className="p-2 border-r border-gray-300 font-medium">Medical & Utility Allowance</td>
                                      <td className="p-2 text-right font-mono">{currencyFmt(Math.round(empSalary * 0.10))}</td>
                                    </tr>
                                    <tr>
                                      <td className="p-2 border-r border-gray-300 font-medium">Special / Performance Allowance</td>
                                      <td className="p-2 text-right font-mono">{currencyFmt(Math.round(empSalary * 0.05))}</td>
                                    </tr>
                                    <tr className="bg-emerald-50/70 font-black text-gray-900 border-t-2 border-gray-300">
                                      <td className="p-2 border-r border-gray-300 uppercase">Gross Monthly Remuneration</td>
                                      <td className="p-2 text-right font-mono text-emerald-900 text-xs">{currencyFmt(empSalary)}</td>
                                    </tr>
                                    <tr className="bg-gray-100 font-bold text-gray-900">
                                      <td className="p-2 border-r border-gray-300 uppercase">Annualized Package (Gross)</td>
                                      <td className="p-2 text-right font-mono">{currencyFmt(empSalary * 12)}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                              <p>
                                All statutory tax withholdings are deducted at source in compliance with revenue regulations. This letter is issued strictly for legal and financial verification.
                              </p>
                            </>
                          )}

                          {/* 4. OFFER LETTER */}
                          {templateType === "offer" && (
                            <>
                              <p>
                                Dear <strong>{empName}</strong>,
                              </p>
                              <p>
                                On behalf of <strong>{businessName}</strong>, we are pleased to offer you the position of <strong>{empDesignation}</strong> in our <strong>{empDepartment}</strong> division. We were thoroughly impressed by your credentials, domain expertise, and performance throughout our evaluation rounds.
                              </p>
                              <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 my-2 text-[11px] space-y-1">
                                <div className="grid grid-cols-2 gap-2">
                                  <div><strong>Proposed Start Date:</strong> {formatDateFormal(empJoiningDate)}</div>
                                  <div><strong>Gross Monthly Salary:</strong> {currencyFmt(empSalary)}</div>
                                  <div><strong>Probation Period:</strong> {probationMonths} Months</div>
                                  <div><strong>Notice Period:</strong> {noticePeriodDays} Days post-confirmation</div>
                                </div>
                              </div>
                              <p>
                                You will report directly to the Head of {empDepartment}. Your formal employment will be subject to the standard terms and policies outlined in the Company Handbook and Non-Disclosure Agreement (NDA).
                              </p>
                              <p>
                                Please sign and return the duplicate copy of this letter as confirmation of your acceptance. We look forward to welcoming you into our organization.
                              </p>
                            </>
                          )}

                          {/* 5. INCREMENT & PROMOTION LETTER */}
                          {templateType === "increment" && (
                            <>
                              <p>
                                Dear <strong>{empName}</strong> (Employee ID: <strong>{empCode}</strong>),
                              </p>
                              <p>
                                In recognition of your exceptional performance, continuous dedication, and leadership within the <strong>{empDepartment}</strong> department, the Executive Committee is delighted to announce your promotion to <strong>{newDesignation}</strong>, effective from <strong>{formatDateFormal(effectiveDate)}</strong>.
                              </p>
                              <div className="border border-gray-300 rounded-lg p-3 my-2 bg-emerald-50/50 text-[11px] space-y-1.5">
                                <div className="grid grid-cols-2 gap-2">
                                  <div><strong>Previous Designation:</strong> {empDesignation}</div>
                                  <div><strong>Promoted Designation:</strong> <span className="text-emerald-900 font-bold">{newDesignation}</span></div>
                                  <div><strong>Previous Monthly Salary:</strong> {currencyFmt(empSalary)}</div>
                                  <div><strong>Revised Monthly Salary:</strong> <span className="text-emerald-900 font-bold">{currencyFmt(revisedSalary)}</span></div>
                                </div>
                                <div className="text-[10px] text-emerald-800 font-bold pt-1 border-t border-emerald-200">
                                  Net Increment Amount: +{currencyFmt(Math.max(0, revisedSalary - empSalary))} / month
                                </div>
                              </div>
                              <p>
                                We trust that you will continue to exhibit the same high caliber of passion and inspire your colleagues in this expanded capacity. Congratulations on your well-deserved achievement!
                              </p>
                            </>
                          )}

                          {/* 6. WARNING NOTICE */}
                          {templateType === "warning" && (
                            <>
                              <p>
                                Dear <strong>{empName}</strong> (Employee ID: <strong>{empCode}</strong>, Designation: <strong>{empDesignation}</strong>),
                              </p>
                              <p>
                                This communication serves as a formal <strong>Disciplinary & Corrective Warning Notice</strong> regarding observed non-compliance with company policies and operational performance standards.
                              </p>
                              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 my-2 text-[11px] text-rose-950">
                                <strong>Infraction Details:</strong> {warningReason}
                              </div>
                              <p>
                                You are hereby placed on a formal corrective review window of <strong>{correctivePeriodDays} days</strong> effective immediately. During this timeframe, you are required to demonstrate full compliance with workplace attendance and delivery metrics.
                              </p>
                              <p>
                                Please be advised that continued failure to meet acceptable conduct or deliverables may result in escalated disciplinary action up to and including termination of employment.
                              </p>
                            </>
                          )}

                          {/* 7. CUSTOM LETTER */}
                          {templateType === "custom" && (
                            <div className="space-y-3 whitespace-pre-line text-justify">
                              {customBody
                                .replace(/\{\{employee_name\}\}/g, empName)
                                .replace(/\{\{employee_code\}\}/g, empCode)
                                .replace(/\{\{designation\}\}/g, empDesignation)
                                .replace(/\{\{department\}\}/g, empDepartment)
                                .replace(/\{\{joining_date\}\}/g, formatDateFormal(empJoiningDate))
                                .replace(/\{\{basic_salary\}\}/g, currencyFmt(empSalary))
                                .replace(/\{\{cnic\}\}/g, empCnic)
                                .replace(/\{\{company_name\}\}/g, businessName)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ─────────────────────────────────────────────────────────────
                          SIGNATURE BLOCK, OFFICIAL SEAL & QR AUTHENTICITY
                      ───────────────────────────────────────────────────────────── */}
                      <div className="pt-8 border-t border-gray-200 mt-6 space-y-4">
                        <div className="flex items-end justify-between">
                          {/* Authorized Signatory Block */}
                          {includeSignatory && (
                            <div className="space-y-1">
                              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                For and on behalf of {businessName}:
                              </p>

                              {/* Signature Display */}
                              <div className="h-16 flex items-end py-1">
                                {signatureImage ? (
                                  <img
                                    src={signatureImage}
                                    alt="Authorized Signature"
                                    className="max-h-14 object-contain"
                                  />
                                ) : (
                                  <div className="border-b-2 border-dashed border-gray-400 w-48 h-10 flex items-center justify-center text-[10px] text-gray-400 font-mono">
                                    [ Authorized Signature ]
                                  </div>
                                )}
                              </div>

                              <div>
                                <h4 className="text-xs font-black text-gray-900 leading-tight">
                                  {signatoryName}
                                </h4>
                                <p className="text-[10px] text-gray-600 font-semibold">
                                  {signatoryDesignation}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Center Official Circular Stamp / Seal */}
                          {includeSeal && (
                            <div className="flex flex-col items-center justify-center">
                              <div className="w-24 h-24 rounded-full border-2 border-dashed border-emerald-800/80 p-1 flex items-center justify-center text-emerald-800 text-center font-bold relative rotate-[-6deg]">
                                <div className="w-full h-full rounded-full border border-emerald-800/80 flex flex-col items-center justify-center p-1 bg-emerald-50/20">
                                  <span className="text-[7px] font-black uppercase tracking-tighter">
                                    {businessName.slice(0, 18)}
                                  </span>
                                  <div className="my-0.5">
                                    <ShieldCheck size={16} className="text-emerald-800" />
                                  </div>
                                  <span className="text-[6.5px] font-black tracking-widest uppercase text-emerald-900">
                                    HR VERIFIED
                                  </span>
                                  <span className="text-[5.5px] font-mono text-emerald-700">
                                    {refNumber}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Right Security QR Code */}
                          {includeQr && (
                            <div className="flex flex-col items-end text-right space-y-1">
                              <div className="p-1.5 bg-gray-50 border border-gray-300 rounded-lg shadow-sm">
                                <div className="w-16 h-16 bg-emerald-950 text-white rounded p-1 flex flex-col items-center justify-center text-center">
                                  <QrCode size={40} className="text-emerald-300" />
                                </div>
                              </div>
                              <p className="text-[8px] font-mono text-gray-500 font-bold">
                                SECURE VERIFICATION ID
                              </p>
                              <p className="text-[8px] font-mono text-emerald-900 font-bold">
                                {refNumber}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Optional Employee Acceptance Counter-Signature */}
                        {includeEmployeeSign && (
                          <div className="pt-4 border-t border-dashed border-gray-300 flex items-center justify-between text-[10px] text-gray-600">
                            <div>
                              <p className="font-bold text-gray-800">Employee Acceptance Acknowledgement:</p>
                              <p>I have read, understood, and accept the terms described herein.</p>
                            </div>
                            <div className="border-b border-gray-400 w-44 pt-6 text-center text-[9px] text-gray-500">
                              {empName} (Date)
                            </div>
                          </div>
                        )}

                        {/* Legal Disclaimer Footer */}
                        <div className="pt-3 border-t border-gray-200 text-center text-[8.5px] text-gray-500 flex items-center justify-between">
                          <span>Confidential & Proprietary — Generated via MT Core HRMS</span>
                          <span>Document Hash: {refNumber.replace(/[^0-9]/g, "")}-{Date.now().toString().slice(-6)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ─────────────────────────────────────────────────────────────
                ARCHIVE / ISSUED LETTERS VAULT TABLE
            ───────────────────────────────────────────────────────────── */
            <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <History size={18} className="text-emerald-400" />
                    <span>Issued Letters & Verification Vault</span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    Comprehensive ledger of all official letters issued with reference timestamps.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search by ref #, employee, or letter type..."
                    value={archiveSearch}
                    onChange={(e) => setArchiveSearch(e.target.value)}
                    className="w-full bg-black/60 border border-gray-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {filteredArchive.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mx-auto text-gray-500">
                    <FileText size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-gray-300">No Generated Letters Found</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Generate your first letter from the Studio tab and click &apos;Save to Vault&apos; to archive it here.
                  </p>
                  <button
                    onClick={() => setActiveTab("studio")}
                    className="bg-emerald-600 hover:bg-emerald-500 text-black px-4 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 mt-2 cursor-pointer"
                  >
                    <Sparkles size={14} />
                    <span>Open Letter Studio</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-black/40 text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-800">
                      <tr>
                        <th className="p-3">Ref Number</th>
                        <th className="p-3">Document Title</th>
                        <th className="p-3">Employee Name</th>
                        <th className="p-3">Designation & Dept</th>
                        <th className="p-3">Issue Date</th>
                        <th className="p-3">Signatory</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60 font-medium">
                      {filteredArchive.map((letter) => (
                        <tr key={letter.id} className="hover:bg-gray-800/40 transition">
                          <td className="p-3 font-mono font-bold text-emerald-400">{letter.refNumber}</td>
                          <td className="p-3 text-white font-bold">{letter.title}</td>
                          <td className="p-3 text-gray-200">
                            <div className="font-bold">{letter.employeeName}</div>
                            {letter.employeeCode && (
                              <div className="text-[10px] text-gray-500 font-mono">{letter.employeeCode}</div>
                            )}
                          </td>
                          <td className="p-3 text-gray-400">
                            <div>{letter.designation}</div>
                            <div className="text-[10px] text-gray-500">{letter.department}</div>
                          </td>
                          <td className="p-3 text-gray-300">{letter.issueDate}</td>
                          <td className="p-3 text-gray-400">
                            <div className="text-gray-300 font-medium">{letter.signatoryName}</div>
                            <div className="text-[10px] text-emerald-400">
                              {letter.signatureImage ? "Signed" : "Unsigned"}
                            </div>
                          </td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => {
                                setTemplateType(letter.templateType);
                                setRefNumber(letter.refNumber);
                                setEmpName(letter.employeeName);
                                setEmpCode(letter.employeeCode || "EMP-001");
                                setEmpDesignation(letter.designation);
                                setEmpDepartment(letter.department);
                                setIssueDate(letter.issueDate);
                                setSignatoryName(letter.signatoryName);
                                setSignatoryDesignation(letter.signatoryDesignation);
                                if (letter.signatureImage) setSignatureImage(letter.signatureImage);
                                setActiveTab("studio");
                                triggerToast("📂 Letter loaded into studio!");
                              }}
                              className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-[11px] font-bold transition border border-emerald-500/30 cursor-pointer"
                              title="Re-open in Studio"
                            >
                              Open in Studio
                            </button>
                            <button
                              onClick={() => handleDeleteSaved(letter.id)}
                              className="p-1 text-gray-500 hover:text-rose-400 transition cursor-pointer"
                              title="Delete from archive"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            DIGITAL SIGNATURE MODAL
        ───────────────────────────────────────────────────────────── */}
        {showSigModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-emerald-500/30 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <PenTool size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Apply Digital E-Signature</h3>
                    <p className="text-[11px] text-gray-400">Draw with cursor/stylus or generate cursive signature</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSigModal(false)}
                  className="text-gray-500 hover:text-white transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-gray-800">
                <button
                  onClick={() => setSigMode("draw")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    sigMode === "draw"
                      ? "bg-emerald-600 text-black shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Draw Signature
                </button>
                <button
                  onClick={() => setSigMode("type")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    sigMode === "type"
                      ? "bg-emerald-600 text-black shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Type Script Calligraphy
                </button>
              </div>

              {sigMode === "draw" ? (
                <div className="space-y-2">
                  <div className="border-2 border-dashed border-gray-700 bg-white rounded-xl overflow-hidden relative shadow-inner">
                    <canvas
                      ref={canvasRef}
                      width={460}
                      height={160}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-40 cursor-crosshair touch-none"
                    />
                    <div className="absolute bottom-2 left-3 text-[10px] text-gray-400 pointer-events-none select-none font-mono">
                      Draw signature above ✍️
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] text-gray-500">Official Blue ink automatically applied.</span>
                    <button
                      onClick={clearCanvas}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      <span>Clear Canvas</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">Type Full Name</label>
                    <input
                      type="text"
                      value={typedSigText}
                      onChange={(e) => setTypedSigText(e.target.value)}
                      className="w-full bg-black/60 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Preview Box */}
                  <div className="bg-white rounded-xl p-6 text-center shadow-inner border border-gray-300">
                    <span
                      style={{
                        fontFamily: "'Brush Script MT', 'Dancing Script', 'Segoe Script', cursive, serif",
                        color: "#104c91",
                        fontSize: "2rem",
                        fontStyle: "italic",
                        fontWeight: "bold"
                      }}
                    >
                      {typedSigText || "Your Signature"}
                    </span>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-800">
                <button
                  onClick={() => setShowSigModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSignature}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-lg shadow-emerald-950 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} />
                  <span>Apply Signature</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─────────────────────────────────────────────────────────────
          PRINT STYLES FOR CLEAN A4 OUTPUT
      ───────────────────────────────────────────────────────────── */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-letter-document,
          #printable-letter-document * {
            visibility: visible;
          }
          #printable-letter-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            min-height: 100% !important;
            margin: 0 !important;
            padding: 20mm !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            background: white !important;
            color: #000 !important;
          }
          aside,
          header,
          nav,
          button,
          .announcement-banner {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
