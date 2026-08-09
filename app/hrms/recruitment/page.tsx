"use client";

import React, { useState } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import { useGlobalContext, generateNextEmployeeCode } from "@/context/global-context";
import {
  UserPlus,
  Plus,
  Briefcase,
  Users,
  CheckCircle2,
  X,
  Search,
  Building2,
  Calendar,
  Cpu,
  DollarSign,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Key,
  Mail,
  Phone,
  CreditCard,
  Trash2,
  Edit2,
  Crown,
  Lock
} from "lucide-react";

export default function HRRecruitmentPage() {
  const {
    hrJobs,
    addHRJobOpening,
    updateHRJobOpening,
    hrCandidates,
    addHRCandidate,
    updateHRCandidate,
    deleteHRCandidate,
    provisionITCredentials,
    confirmFinanceAndActivateEmployee,
    provisionExecutiveDirectly,
    hrDepartments,
    hrDesignations,
    hrEmployees,
    currencySymbol,
    currentUser,
    businessSettings
  } = useGlobalContext();

  const [activeTab, setActiveTab] = useState<"candidates" | "it_queue" | "finance_queue" | "jobs">("candidates");

  // Candidate Modal
  const [showCandModal, setShowCandModal] = useState(false);
  const [editingCandId, setEditingCandId] = useState<string | null>(null);
  const [candForm, setCandForm] = useState({
    name: "",
    email: "",
    phone: "",
    cnic: "",
    appliedPosition: hrDesignations[0]?.title || "Software Engineer",
    department: hrDepartments[0]?.name || "Operation Department",
    subDepartment: hrDepartments[0]?.subDepartments?.[0] || "",
    proposedSalary: 75000,
    bankName: "Meezan Bank Ltd",
    accountNumber: "",
    stage: "Interview" as const
  });

  // Owner Direct Executive Provisioning Modal
  const [showExecModal, setShowExecModal] = useState(false);
  const [execForm, setExecForm] = useState({
    name: "",
    email: "",
    phone: "",
    cnic: "",
    department: hrDepartments[0]?.name || "Human Resources",
    subDepartment: "",
    designation: "HR Manager",
    basicSalary: 120000,
    bankName: "Meezan Bank Ltd",
    accountNumber: "",
    tempPassword: "Mts@Exec2026!"
  });

  // IT Provisioning Modal
  const [showITModal, setShowITModal] = useState(false);
  const [selectedCandForIT, setSelectedCandForIT] = useState<any>(null);
  const [itForm, setItForm] = useState({
    workEmail: "",
    tempPassword: ""
  });

  // Job Modal
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: "",
    department: hrDepartments[0]?.name || "Operations",
    vacancies: "1"
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const bName = currentUser?.businessName || businessSettings?.businessName || "MT Software";

  // Filter queues
  const itPendingQueue = hrCandidates.filter((c) => c.stage === "Hired" && c.onboardingStage === "Pending IT Provisioning");
  const financePendingQueue = hrCandidates.filter((c) => c.onboardingStage === "Pending Finance Confirmation");
  const activeCandidates = hrCandidates.filter((c) => c.onboardingStage !== "Fully Active Employee");

  // Save Candidate
  const handleSaveCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candForm.name || !candForm.email || !candForm.phone) return;

    if (editingCandId) {
      updateHRCandidate(editingCandId, candForm);
      triggerToast(`✅ Candidate '${candForm.name}' record updated!`);
    } else {
      addHRCandidate(candForm);
      triggerToast(`✅ Candidate '${candForm.name}' registered into ATS Pipeline!`);
    }
    setShowCandModal(false);
    setEditingCandId(null);
  };

  // Direct Owner Executive Provisioning Handler
  const handleSaveExecutiveDirectly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!execForm.name || !execForm.email || !execForm.phone || !execForm.tempPassword) return;

    const createdEmp = provisionExecutiveDirectly({
      name: execForm.name,
      email: execForm.email,
      phone: execForm.phone,
      cnic: execForm.cnic,
      department: execForm.department,
      subDepartment: execForm.subDepartment,
      designation: execForm.designation,
      basicSalary: execForm.basicSalary,
      bankName: execForm.bankName,
      accountNumber: execForm.accountNumber,
      tempPassword: execForm.tempPassword
    });

    triggerToast(`👑 Executive User '${createdEmp.name}' (${createdEmp.designation}) directly provisioned and activated into Employee Directory (${createdEmp.employeeCode})!`);
    setShowExecModal(false);
    setExecForm({
      name: "",
      email: "",
      phone: "",
      cnic: "",
      department: hrDepartments[0]?.name || "Human Resources",
      subDepartment: "",
      designation: "HR Manager",
      basicSalary: 120000,
      bankName: "Meezan Bank Ltd",
      accountNumber: "",
      tempPassword: "Mts@Exec2026!"
    });
  };

  // IT Provisioning Submit
  const handleOpenITModal = (candidate: any) => {
    setSelectedCandForIT(candidate);
    const cleanName = candidate.name.toLowerCase().replace(/\s+/g, ".");
    const companyDomain = bName.toLowerCase().replace(/[^a-z0-9]/g, "") || "mtsoftware";
    setItForm({
      workEmail: `${cleanName}@${companyDomain}.com`,
      tempPassword: `${candidate.name.split(" ")[0]}@2026!`
    });
    setShowITModal(true);
  };

  const handleConfirmITProvisioning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandForIT || !itForm.workEmail || !itForm.tempPassword) return;

    provisionITCredentials(selectedCandForIT.id, itForm.workEmail, itForm.tempPassword);
    const generatedCode = generateNextEmployeeCode(bName, hrEmployees.length);
    triggerToast(`⚡ IT Provisioned! Auto Employee ID '${generatedCode}' & Work Credentials assigned. Routed to Finance Confirmation.`);
    setShowITModal(false);
    setSelectedCandForIT(null);
  };

  // Finance Confirmation Submit
  const handleConfirmFinanceActivation = (candidate: any) => {
    confirmFinanceAndActivateEmployee(candidate.id);
    triggerToast(`🎉 Finance Confirmed! Employee '${candidate.name}' (${candidate.generatedEmployeeCode || 'Active'}) is now FULLY ACTIVATED in Employee Directory!`);
  };

  // Job Opening Submit
  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.title.trim()) return;

    addHRJobOpening({
      title: jobForm.title.trim(),
      department: jobForm.department,
      vacancies: parseInt(jobForm.vacancies, 10) || 1,
      status: "Open"
    });

    triggerToast(`📢 Published job opening '${jobForm.title}'!`);
    setShowJobModal(false);
  };

  return (
    <div className="flex min-h-screen bg-[#030712] text-gray-100 font-sans">
      <HRMSSidebar />

      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-black px-4 py-3 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce max-w-md">
            <Sparkles size={16} className="shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1">
              <UserPlus size={12} /> Enterprise Onboarding Lifecycle &amp; ATS
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Recruitment, IT Provisioning &amp; Finance Activation
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Strict 3-step hierarchy: Candidate Hired &rarr; IT Auto Employee ID &amp; Credentials &rarr; Finance Salary Confirmation &rarr; Active Directory.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowExecModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition"
            >
              <Crown size={15} />
              <span>Owner Direct Executive Provisioning</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs with Badges */}
        <div className="flex border-b border-gray-800/80 space-x-2">
          <button
            onClick={() => setActiveTab("candidates")}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-bold transition border-b-2 ${
              activeTab === "candidates"
                ? "border-emerald-400 text-emerald-400 bg-emerald-500/10"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <Users size={15} />
            <span>1. Candidate ATS Pipeline ({activeCandidates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("it_queue")}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-bold transition border-b-2 relative ${
              activeTab === "it_queue"
                ? "border-sky-400 text-sky-400 bg-sky-500/10"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <Cpu size={15} />
            <span>2. IT Credentials Queue</span>
            {itPendingQueue.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-sky-500 text-black font-black text-[9px]">
                {itPendingQueue.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("finance_queue")}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-bold transition border-b-2 relative ${
              activeTab === "finance_queue"
                ? "border-emerald-400 text-emerald-400 bg-emerald-500/10"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <DollarSign size={15} />
            <span>3. Finance Activation Queue</span>
            {financePendingQueue.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-400 text-black font-black text-[9px]">
                {financePendingQueue.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("jobs")}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-bold transition border-b-2 ${
              activeTab === "jobs"
                ? "border-emerald-400 text-emerald-400 bg-emerald-500/10"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <Briefcase size={15} />
            <span>Job Openings ({hrJobs.length})</span>
          </button>
        </div>

        {/* 👥 TAB 1: CANDIDATE PIPELINE */}
        {activeTab === "candidates" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#0b0f17] p-4 rounded-2xl border border-gray-800/80">
              <div>
                <h3 className="text-sm font-black text-white">Candidates &amp; Interview Pipeline</h3>
                <p className="text-[11px] text-gray-400">Move candidates through Applied &rarr; Interview &rarr; Hired stages.</p>
              </div>
              <button
                onClick={() => {
                  setEditingCandId(null);
                  setCandForm({
                    name: "",
                    email: "",
                    phone: "",
                    cnic: "",
                    appliedPosition: hrDesignations[0]?.title || "Software Engineer",
                    department: hrDepartments[0]?.name || "Operation Department",
                    subDepartment: hrDepartments[0]?.subDepartments?.[0] || "",
                    proposedSalary: 75000,
                    bankName: "Meezan Bank Ltd",
                    accountNumber: "",
                    stage: "Interview"
                  });
                  setShowCandModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-900/20"
              >
                <Plus size={14} /> Add Candidate Record
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCandidates.map((c) => (
                <div
                  key={c.id}
                  className="bg-[#0b0f17] border border-gray-800/80 hover:border-emerald-500/40 p-5 rounded-2xl space-y-4 relative group transition shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-black text-white">{c.name}</h4>
                        <div className="text-[11px] text-emerald-400 font-bold mt-0.5">{c.appliedPosition}</div>
                        <div className="text-[10px] text-gray-400">
                          {c.department} {c.subDepartment ? `(${c.subDepartment})` : ""}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                          c.stage === "Hired"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : c.stage === "Interview"
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                            : "bg-sky-500/20 text-sky-300 border-sky-500/40"
                        }`}
                      >
                        {c.stage}
                      </span>
                    </div>

                    <div className="bg-black/50 p-3 rounded-xl border border-gray-800/60 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between text-gray-300">
                        <span className="text-gray-500">Contact:</span>
                        <span>{c.phone}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-300">
                        <span className="text-gray-500">Email:</span>
                        <span className="font-mono text-[10px]">{c.email}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-300">
                        <span className="text-gray-500">Proposed Salary:</span>
                        <span className="text-emerald-400 font-bold font-mono">{currencySymbol} {c.proposedSalary.toLocaleString()}</span>
                      </div>
                    </div>

                    {c.stage === "Hired" && c.onboardingStage && (
                      <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[10px] font-bold flex items-center justify-between">
                        <span>Lifecycle Status:</span>
                        <span className="uppercase tracking-wider">{c.onboardingStage}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-800/60 flex items-center justify-between gap-2">
                    <div className="flex gap-1">
                      {["Applied", "Interview", "Offered", "Hired"].map((st) => (
                        <button
                          key={st}
                          onClick={() => updateHRCandidate(c.id, { stage: st as any })}
                          className={`px-2 py-1 rounded text-[9px] font-bold transition ${
                            c.stage === st
                              ? "bg-emerald-600 text-white"
                              : "bg-gray-800 text-gray-400 hover:text-white"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => deleteHRCandidate(c.id)}
                      className="p-1.5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 💻 TAB 2: IT PROVISIONING QUEUE */}
        {activeTab === "it_queue" && (
          <div className="space-y-4">
            <div className="bg-[#0b0f17] p-5 rounded-2xl border border-sky-500/30 space-y-1">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                <Cpu size={16} /> IT Department Automated Onboarding Portal
              </div>
              <h3 className="text-sm font-black text-white">Candidates Awaiting Auto Employee ID &amp; Credentials</h3>
              <p className="text-[11px] text-gray-400">
                When a candidate is hired, they land here. IT provisions their Auto Employee ID (e.g., <b className="text-sky-300 font-mono">MTS-0001</b>) and work credentials before forwarding to Finance.
              </p>
            </div>

            {itPendingQueue.length === 0 ? (
              <div className="p-12 bg-[#0b0f17] border border-gray-800 rounded-2xl text-center text-gray-500 italic text-xs">
                No hired candidates waiting for IT credential provisioning.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {itPendingQueue.map((c) => (
                  <div key={c.id} className="bg-[#0b0f17] border border-sky-500/40 p-5 rounded-2xl space-y-4 shadow-xl">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-black text-white">{c.name}</h4>
                        <div className="text-xs text-sky-400 font-bold mt-0.5">{c.appliedPosition}</div>
                        <div className="text-[10px] text-gray-400">{c.department}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[9px] font-black uppercase">
                        Hired Candidate
                      </span>
                    </div>

                    <div className="bg-black/50 p-3 rounded-xl border border-gray-800 text-xs space-y-1 font-mono">
                      <div>CNIC: <span className="text-gray-300">{c.cnic || "35201-0000000-0"}</span></div>
                      <div>Personal Email: <span className="text-gray-300">{c.email}</span></div>
                      <div>Phone: <span className="text-gray-300">{c.phone}</span></div>
                    </div>

                    <button
                      onClick={() => handleOpenITModal(c)}
                      className="w-full py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-sky-900/30 flex items-center justify-center gap-2"
                    >
                      <Key size={14} />
                      <span>Provision Employee ID &amp; Work Credentials</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 💰 TAB 3: FINANCE CONFIRMATION QUEUE */}
        {activeTab === "finance_queue" && (
          <div className="space-y-4">
            <div className="bg-[#0b0f17] p-5 rounded-2xl border border-emerald-500/30 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <DollarSign size={16} /> Accounts &amp; Finance Salary Confirmation Portal
              </div>
              <h3 className="text-sm font-black text-white">Candidates Awaiting Salary Package &amp; Active Directory Release</h3>
              <p className="text-[11px] text-gray-400">
                IT credentials &amp; Auto Employee IDs have been generated. Finance confirms bank details &amp; salary to instantly activate the employee into the Employee Directory (EIS).
              </p>
            </div>

            {financePendingQueue.length === 0 ? (
              <div className="p-12 bg-[#0b0f17] border border-gray-800 rounded-2xl text-center text-gray-500 italic text-xs">
                No provisioned candidates waiting for Finance confirmation.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {financePendingQueue.map((c) => (
                  <div key={c.id} className="bg-[#0b0f17] border border-emerald-500/40 p-5 rounded-2xl space-y-4 shadow-xl">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white">{c.name}</h4>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-black">
                            {c.generatedEmployeeCode || 'MTS-0001'}
                          </span>
                        </div>
                        <div className="text-xs text-emerald-400 font-bold mt-0.5">{c.appliedPosition}</div>
                        <div className="text-[10px] text-gray-400">{c.department}</div>
                      </div>
                    </div>

                    <div className="bg-black/50 p-3 rounded-xl border border-gray-800 text-xs space-y-1.5 font-mono">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Work Email:</span>
                        <span className="text-sky-400 font-bold">{c.workEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">CNIC Number:</span>
                        <span className="text-gray-300">{c.cnic || '35201-0000000-0'}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-800 pt-1.5">
                        <span className="text-gray-500">Basic Monthly Salary:</span>
                        <span className="text-emerald-400 font-black text-sm">{currencySymbol} {c.proposedSalary.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-500">Bank Account:</span>
                        <span className="text-gray-300">{c.bankName} ({c.accountNumber || '0102030405'})</span>
                      </div>
                      <div className="text-[10px] text-gray-500 italic pt-1 border-t border-gray-800/40">
                        🔒 Login credentials strictly protected &amp; managed by IT Dept.
                      </div>
                    </div>

                    <button
                      onClick={() => handleConfirmFinanceActivation(c)}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={15} />
                      <span>Confirm Salary Package &amp; Activate Employee</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 📢 TAB 4: JOB OPENINGS */}
        {activeTab === "jobs" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#0b0f17] p-4 rounded-2xl border border-gray-800/80">
              <div>
                <h3 className="text-sm font-black text-white">Active Job Openings</h3>
                <p className="text-[11px] text-gray-400">Post vacancies for corporate recruitment.</p>
              </div>
              <button
                onClick={() => setShowJobModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-900/20"
              >
                <Plus size={14} /> Post Job Opening
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hrJobs.map((job) => (
                <div key={job.id} className="bg-[#0b0f17] border border-gray-800 hover:border-emerald-500/40 p-5 rounded-2xl space-y-3 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white text-base">{job.title}</h3>
                      <div className="text-[10px] text-emerald-400 font-mono mt-0.5">{job.department}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${
                        job.status === "Open"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-gray-800 border-gray-700 text-gray-400"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-black/40 p-2.5 rounded-xl text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-gray-500 block">Vacancies</span>
                      <strong className="text-white">{job.vacancies} Position(s)</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 block">Applicants</span>
                      <strong className="text-emerald-400">{job.applicantsCount} Applied</strong>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    {job.status === "Open" ? (
                      <button
                        onClick={() => updateHRJobOpening(job.id, { status: "Closed" })}
                        className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs rounded-xl transition"
                      >
                        Close Hiring
                      </button>
                    ) : (
                      <button
                        onClick={() => updateHRJobOpening(job.id, { status: "Open" })}
                        className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold text-xs rounded-xl transition border border-emerald-500/30"
                      >
                        Re-open Job
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL 1: ADD CANDIDATE */}
        {showCandModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0b0f17] border border-emerald-500/40 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <h3 className="text-sm font-black text-white">Add Candidate Record</h3>
                <button onClick={() => setShowCandModal(false)} className="text-gray-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveCandidate} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sara Khan"
                    value={candForm.name}
                    onChange={(e) => setCandForm({ ...candForm, name: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="sara@gmail.com"
                      value={candForm.email}
                      onChange={(e) => setCandForm({ ...candForm, email: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Phone</label>
                    <input
                      type="text"
                      required
                      placeholder="03001234567"
                      value={candForm.phone}
                      onChange={(e) => setCandForm({ ...candForm, phone: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Department</label>
                    <select
                      value={candForm.department}
                      onChange={(e) => {
                        const targetDept = hrDepartments.find((d) => d.name === e.target.value);
                        setCandForm({
                          ...candForm,
                          department: e.target.value,
                          subDepartment: targetDept?.subDepartments?.[0] || ""
                        });
                      }}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    >
                      {hrDepartments.map((d) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Sub-Department / Operational Unit</label>
                    <select
                      value={candForm.subDepartment || ""}
                      onChange={(e) => setCandForm({ ...candForm, subDepartment: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">-- Main Department --</option>
                      {(hrDepartments.find((d) => d.name === candForm.department)?.subDepartments || []).map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1">Applied Position / Designation</label>
                  <select
                    value={candForm.appliedPosition}
                    onChange={(e) => setCandForm({ ...candForm, appliedPosition: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    {hrDesignations.map((d) => (
                      <option key={d.id} value={d.title}>{d.title} ({d.grade})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">CNIC Number</label>
                    <input
                      type="text"
                      placeholder="35201-1234567-1"
                      value={candForm.cnic}
                      onChange={(e) => setCandForm({ ...candForm, cnic: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-emerald-400 font-bold mb-1">Basic Monthly Salary ({currencySymbol})</label>
                    <input
                      type="number"
                      value={candForm.proposedSalary}
                      onChange={(e) => setCandForm({ ...candForm, proposedSalary: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Bank Name</label>
                    <select
                      value={candForm.bankName}
                      onChange={(e) => setCandForm({ ...candForm, bankName: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Meezan Bank Ltd">Meezan Bank Ltd</option>
                      <option value="Habib Bank Limited (HBL)">Habib Bank Limited (HBL)</option>
                      <option value="MCB Bank">MCB Bank</option>
                      <option value="Bank Alfalah">Bank Alfalah</option>
                      <option value="Faysal Bank">Faysal Bank</option>
                      <option value="United Bank Limited (UBL)">United Bank Limited (UBL)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Bank Account Number / IBAN</label>
                    <input
                      type="text"
                      placeholder="01020304050607"
                      value={candForm.accountNumber}
                      onChange={(e) => setCandForm({ ...candForm, accountNumber: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase rounded-xl transition shadow-lg shadow-emerald-900/30"
                >
                  Save Candidate
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: OWNER DIRECT EXECUTIVE PROVISIONING MODAL */}
        {showExecModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0b0f17] border border-amber-500/50 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2 text-amber-400 font-black text-base">
                  <Crown size={20} />
                  <span>Owner Direct Executive Provisioning</span>
                </div>
                <button onClick={() => setShowExecModal(false)} className="text-gray-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-amber-300 text-xs space-y-1">
                <div>👑 <b>Bootstrap Executive User Desk:</b> Business Owner can directly provision Directors, HR Managers, Finance Managers &amp; IT Administrators with immediate system credentials &amp; active status.</div>
              </div>

              <form onSubmit={handleSaveExecutiveDirectly} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Executive Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mian Talal / Muhammad Bilal"
                    value={execForm.name}
                    onChange={(e) => setExecForm({ ...execForm, name: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Executive Designation *</label>
                    <select
                      value={execForm.designation}
                      onChange={(e) => setExecForm({ ...execForm, designation: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                    >
                      <option value="Director">Director (Rank #1)</option>
                      <option value="Assistant Director">Assistant Director (Rank #2)</option>
                      <option value="HR Manager">HR Manager (Rank #3)</option>
                      <option value="Finance Manager">Finance Manager (Rank #3)</option>
                      <option value="IT Administrator">IT Administrator (Rank #3)</option>
                      <option value="Store Operations Manager">Store Operations Manager (Rank #3)</option>
                      <option value="Supervisor">Supervisor (Rank #5)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Department *</label>
                    <select
                      value={execForm.department}
                      onChange={(e) => setExecForm({ ...execForm, department: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    >
                      {hrDepartments.map((d) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Work / Personal Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="exec@company.com"
                      value={execForm.email}
                      onChange={(e) => setExecForm({ ...execForm, email: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="03001234567"
                      value={execForm.phone}
                      onChange={(e) => setExecForm({ ...execForm, phone: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-amber-400 font-bold mb-1">Login Password *</label>
                    <input
                      type="text"
                      required
                      value={execForm.tempPassword}
                      onChange={(e) => setExecForm({ ...execForm, tempPassword: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-emerald-400 font-bold mb-1">Basic Monthly Salary ({currencySymbol})</label>
                    <input
                      type="number"
                      value={execForm.basicSalary}
                      onChange={(e) => setExecForm({ ...execForm, basicSalary: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-emerald-400 font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-900/40 flex items-center justify-center gap-2 mt-2"
                >
                  <Crown size={16} />
                  <span>Directly Provision &amp; Activate Executive User</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: IT PROVISIONING MODAL */}
        {showITModal && selectedCandForIT && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0b0f17] border border-sky-500/40 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2 text-sky-400 font-black text-sm">
                  <Cpu size={16} />
                  <span>IT Provisioning &amp; Auto Employee ID</span>
                </div>
                <button onClick={() => setShowITModal(false)} className="text-gray-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <div className="bg-sky-500/10 border border-sky-500/30 p-3 rounded-xl text-xs space-y-1">
                <div className="text-gray-300 font-bold">Candidate: <span className="text-white">{selectedCandForIT.name}</span></div>
                <div className="text-gray-400 text-[11px]">Dept: {selectedCandForIT.department} &bull; Position: {selectedCandForIT.appliedPosition}</div>
                <div className="text-sky-300 font-mono font-black pt-1">
                  Generated Employee ID: {generateNextEmployeeCode(bName, hrEmployees.length)}
                </div>
              </div>

              <form onSubmit={handleConfirmITProvisioning} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Company Work Email *</label>
                  <input
                    type="email"
                    required
                    value={itForm.workEmail}
                    onChange={(e) => setItForm({ ...itForm, workEmail: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-sky-400 font-mono font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1">Temporary Login Password *</label>
                  <input
                    type="text"
                    required
                    value={itForm.tempPassword}
                    onChange={(e) => setItForm({ ...itForm, tempPassword: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs uppercase rounded-xl transition shadow-lg shadow-sky-900/30"
                >
                  Generate Employee ID &amp; Route to Finance
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: POST JOB */}
        {showJobModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0b0f17] border border-emerald-500/40 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <h3 className="text-sm font-black text-white">Post New Job Opening</h3>
                <button onClick={() => setShowJobModal(false)} className="text-gray-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveJob} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Job Title / Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Software Engineer"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Department</label>
                    <select
                      value={jobForm.department}
                      onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    >
                      {hrDepartments.map((d) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Vacancies</label>
                    <input
                      type="number"
                      min={1}
                      value={jobForm.vacancies}
                      onChange={(e) => setJobForm({ ...jobForm, vacancies: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase rounded-xl transition shadow-lg shadow-emerald-900/30"
                >
                  Publish Listing
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
