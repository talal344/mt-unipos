"use client";

import React, { useState } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import {
  useGlobalContext,
  calculateDesignationRankAndGrade,
  getHeadOfDepartment,
  isEligibleForDepartmentHead
} from "@/context/global-context";
import {
  Settings,
  Building2,
  Briefcase,
  Clock,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Save,
  X,
  Layers,
  Award,
  GitBranch,
  Crown
} from "lucide-react";

export default function HRMSPageSettings() {
  const {
    hrDepartments,
    addHRDepartment,
    updateHRDepartment,
    deleteHRDepartment,
    hrDesignations,
    addHRDesignation,
    updateHRDesignation,
    deleteHRDesignation,
    hrShifts,
    addHRShift,
    updateHRShift,
    deleteHRShift,
    hrEmployees,
    businessSettings,
    currentUser,
    clearAllHRMSData
  } = useGlobalContext();

  const [activeTab, setActiveTab] = useState<"departments" | "designations" | "shifts">("departments");

  // Modal States
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptForm, setDeptForm] = useState({
    name: "",
    code: "",
    description: "",
    headEmployeeId: "",
    headOfDepartment: "",
    subDepartments: [] as string[]
  });
  const [newSubDeptInput, setNewSubDeptInput] = useState("");

  const [showDesgModal, setShowDesgModal] = useState(false);
  const [editingDesgId, setEditingDesgId] = useState<string | null>(null);
  const [desgForm, setDesgForm] = useState({ title: "", rank: 3, grade: "M-1" });

  const [showShiftModal, setShowShiftModal] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [shiftForm, setShiftForm] = useState({
    name: "",
    type: "Fixed" as "Fixed" | "Flexible",
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    requiredHours: 8,
    graceMinutes: 15,
    workDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Sub department helpers
  const handleAddSubDept = () => {
    const trimmed = newSubDeptInput.trim();
    if (!trimmed) return;
    if (deptForm.subDepartments.includes(trimmed)) return;
    setDeptForm((prev) => ({
      ...prev,
      subDepartments: [...prev.subDepartments, trimmed]
    }));
    setNewSubDeptInput("");
  };

  const handleRemoveSubDept = (subName: string) => {
    setDeptForm((prev) => ({
      ...prev,
      subDepartments: prev.subDepartments.filter((s) => s !== subName)
    }));
  };

  // Department Form Handlers
  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code) return;

    const chosenEmp = hrEmployees.find((e) => e.id === deptForm.headEmployeeId);
    const hodString = chosenEmp ? `${chosenEmp.name} (${chosenEmp.designation})` : "";

    const payload = {
      ...deptForm,
      headEmployeeId: deptForm.headEmployeeId || undefined,
      headOfDepartment: hodString || undefined
    };

    if (editingDeptId) {
      updateHRDepartment(editingDeptId, payload);
      triggerToast(`✅ Updated department '${deptForm.name}'!`);
    } else {
      addHRDepartment(payload);
      triggerToast(`✅ Added new department '${deptForm.name}' with ${deptForm.subDepartments.length} sub-units!`);
    }
    setShowDeptModal(false);
    setEditingDeptId(null);
    setDeptForm({ name: "", code: "", description: "", headEmployeeId: "", headOfDepartment: "", subDepartments: [] });
    setNewSubDeptInput("");
  };

  // Auto-calculate grade when title changes
  const handleDesgTitleChange = (val: string) => {
    const calculated = calculateDesignationRankAndGrade(val);
    setDesgForm({
      title: val,
      rank: calculated.rank,
      grade: calculated.grade
    });
  };

  // Designation Form Handlers
  const handleSaveDesg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desgForm.title) return;

    if (editingDesgId) {
      updateHRDesignation(editingDesgId, desgForm);
      triggerToast(`✅ Updated designation '${desgForm.title}'!`);
    } else {
      addHRDesignation(desgForm);
      triggerToast(`✅ Added global designation '${desgForm.title}' (${desgForm.grade})!`);
    }
    setShowDesgModal(false);
    setEditingDesgId(null);
    setDesgForm({ title: "", rank: 3, grade: "M-1" });
  };

  // Shift Form Handlers
  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftForm.name) return;

    const payload = {
      name: shiftForm.name,
      type: shiftForm.type,
      startTime: shiftForm.type === "Flexible" ? "Flexible Check-In" : shiftForm.startTime,
      endTime: shiftForm.type === "Flexible" ? `${shiftForm.requiredHours} Hours Shift Duration` : shiftForm.endTime,
      requiredHours: shiftForm.requiredHours,
      graceMinutes: shiftForm.graceMinutes,
      workDays: shiftForm.workDays
    };

    if (editingShiftId) {
      updateHRShift(editingShiftId, payload);
      triggerToast(`✅ Updated shift '${shiftForm.name}'!`);
    } else {
      addHRShift(payload);
      triggerToast(`✅ Added shift '${shiftForm.name}'!`);
    }
    setShowShiftModal(false);
    setEditingShiftId(null);
  };

  const toggleWorkDay = (day: string) => {
    setShiftForm((prev) => {
      const exists = prev.workDays.includes(day);
      const updated = exists ? prev.workDays.filter((d) => d !== day) : [...prev.workDays, day];
      return { ...prev, workDays: updated };
    });
  };

  return (
    <div className="flex min-h-screen bg-[#030712] text-gray-100 font-sans">
      <HRMSSidebar />

      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-black px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 size={16} />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1">
              <Settings size={12} /> HRMS Master Configuration Desk
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Departments, Sub-Units, Designations &amp; Shifts
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Configure corporate departments and sub-operational units (e.g. Medical Billing AR, Credentials, Production, Spinning).
            </p>
          </div>

          <button
            onClick={() => {
              if (confirm("Are you sure you want to permanently clear all HRMS demo employees, attendance, leaves, payrolls, candidates, and job listings?")) {
                clearAllHRMSData();
                triggerToast("🧹 All HRMS demo records successfully purged!");
              }
            }}
            className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg"
          >
            <Trash2 size={15} /> Clear All Demo HRMS Records
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-800/80 space-x-2">
          <button
            onClick={() => setActiveTab("departments")}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-bold transition border-b-2 ${
              activeTab === "departments"
                ? "border-emerald-400 text-emerald-400 bg-emerald-500/10"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <Building2 size={15} />
            <span>Departments &amp; Sub-Units ({hrDepartments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("designations")}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-bold transition border-b-2 ${
              activeTab === "designations"
                ? "border-emerald-400 text-emerald-400 bg-emerald-500/10"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <Briefcase size={15} />
            <span>Global Designations &amp; Rank Hierarchy ({hrDesignations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("shifts")}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-bold transition border-b-2 ${
              activeTab === "shifts"
                ? "border-emerald-400 text-emerald-400 bg-emerald-500/10"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <Clock size={15} />
            <span>Shifts &amp; Timings ({hrShifts.length})</span>
          </button>
        </div>

        {/* 🏢 TAB 1: DEPARTMENTS & SUB-UNITS */}
        {activeTab === "departments" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#0b0f17] p-4 rounded-2xl border border-gray-800/80">
              <div>
                <h3 className="text-sm font-black text-white">Company Departments &amp; Sub-Operational Units</h3>
                <p className="text-[11px] text-gray-400">Configure parent departments along with specialized operational sub-units (e.g. Medical Billing, AR, Spinning, Credentials).</p>
              </div>
              <button
                onClick={() => {
                  setEditingDeptId(null);
                  setDeptForm({ name: "", code: "", description: "", subDepartments: [] });
                  setNewSubDeptInput("");
                  setShowDeptModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-900/20"
              >
                <Plus size={14} /> Add New Department
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hrDepartments.map((dept) => {
                const autoHod = getHeadOfDepartment(dept.name, hrEmployees, hrDesignations);
                return (
                  <div
                    key={dept.id}
                    className="bg-[#0b0f17] border border-gray-800/80 hover:border-emerald-500/40 p-5 rounded-2xl space-y-3 relative group transition shadow-xl flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black text-sm font-mono">
                            {dept.code}
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-white">{dept.name}</h4>
                            <span className="text-[10px] text-gray-400 font-mono">ID: {dept.id}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                          <button
                            onClick={() => {
                              setEditingDeptId(dept.id);
                              setDeptForm({
                                name: dept.name,
                                code: dept.code,
                                description: dept.description || "",
                                headEmployeeId: dept.headEmployeeId || "",
                                headOfDepartment: dept.headOfDepartment || "",
                                subDepartments: dept.subDepartments || []
                              });
                              setNewSubDeptInput("");
                              setShowDeptModal(true);
                            }}
                            className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white"
                            title="Edit Department"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => deleteHRDepartment(dept.id)}
                            className="p-1.5 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400"
                            title="Delete Department"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {dept.description && (
                        <p className="text-xs text-gray-400 line-clamp-2">{dept.description}</p>
                      )}

                      {/* Sub-Departments / Operational Units */}
                      {dept.subDepartments && dept.subDepartments.length > 0 && (
                        <div className="pt-2 border-t border-gray-800/60 space-y-1.5">
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
                            <GitBranch size={11} className="text-emerald-400" />
                            <span>Sub-Units ({dept.subDepartments.length}):</span>
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {dept.subDepartments.map((sub, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-semibold"
                              >
                                {sub}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-800/60 flex items-center justify-between text-[11px]">
                      <span className="text-gray-500">Head of Dept (Auto):</span>
                      <span className="text-emerald-400 font-bold">{autoHod}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 👔 TAB 2: DESIGNATIONS */}
        {activeTab === "designations" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#0b0f17] p-4 rounded-2xl border border-gray-800/80">
              <div>
                <h3 className="text-sm font-black text-white">Global Designations &amp; Hierarchy Ranks</h3>
                <p className="text-[11px] text-gray-400">Designations apply globally across all company departments with auto rank evaluation (Rank 1 = Highest Director/Executive).</p>
              </div>
              <button
                onClick={() => {
                  setEditingDesgId(null);
                  setDesgForm({ title: "", rank: 3, grade: "M-1" });
                  setShowDesgModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-900/20"
              >
                <Plus size={14} /> Add New Designation
              </button>
            </div>

            <div className="bg-[#0b0f17] border border-gray-800/80 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/50 border-b border-gray-800 text-gray-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-4">Hierarchy Rank</th>
                    <th className="p-4">Designation Title</th>
                    <th className="p-4">Pay Grade Level</th>
                    <th className="p-4">Scope</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-sans">
                  {hrDesignations.map((desg) => (
                    <tr key={desg.id} className="hover:bg-white/[0.02]">
                      <td className="p-4 font-mono font-bold">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px]">
                          Rank #{desg.rank}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-white flex items-center gap-2">
                        <Briefcase size={14} className="text-emerald-400" />
                        <span>{desg.title}</span>
                      </td>
                      <td className="p-4 text-emerald-400 font-mono font-bold">
                        {desg.grade}
                      </td>
                      <td className="p-4 text-gray-400 text-[11px]">
                        Global (Applicable to All Depts)
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingDesgId(desg.id);
                              setDesgForm({ title: desg.title, rank: desg.rank, grade: desg.grade });
                              setShowDesgModal(true);
                            }}
                            className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => deleteHRDesignation(desg.id)}
                            className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ⏰ TAB 3: SHIFTS */}
        {activeTab === "shifts" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#0b0f17] p-4 rounded-2xl border border-gray-800/80">
              <div>
                <h3 className="text-sm font-black text-white">Shifts &amp; Work Timings</h3>
                <p className="text-[11px] text-gray-400">Configure General Fixed Shifts (e.g. 09:00 AM - 05:00 PM) or Flexible Shift timings.</p>
              </div>
              <button
                onClick={() => {
                  setEditingShiftId(null);
                  setShiftForm({
                    name: "",
                    type: "Fixed",
                    startTime: "09:00 AM",
                    endTime: "05:00 PM",
                    requiredHours: 8,
                    graceMinutes: 15,
                    workDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
                  });
                  setShowShiftModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-900/20"
              >
                <Plus size={14} /> Add Shift Schedule
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hrShifts.map((shift) => (
                <div
                  key={shift.id}
                  className="bg-[#0b0f17] border border-gray-800/80 hover:border-emerald-500/40 p-5 rounded-2xl space-y-4 relative group transition shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-white flex items-center gap-2">
                          <Clock size={15} className="text-emerald-400" />
                          <span>{shift.name}</span>
                        </h4>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                          shift.type === "Flexible"
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                            : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                        }`}>
                          {shift.type || "Fixed"}
                        </span>
                      </div>
                      <div className="text-xs text-emerald-400 font-mono font-bold mt-1">
                        {shift.type === "Flexible"
                          ? `Flexible Check-in (${shift.requiredHours || 8} Hours Shift Duration Required)`
                          : `${shift.startTime} — ${shift.endTime} (${shift.graceMinutes}m Grace Allowance)`}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingShiftId(shift.id);
                          setShiftForm({
                            name: shift.name,
                            type: shift.type || "Fixed",
                            startTime: shift.startTime,
                            endTime: shift.endTime,
                            requiredHours: shift.requiredHours || 8,
                            graceMinutes: shift.graceMinutes,
                            workDays: shift.workDays
                          });
                          setShowShiftModal(true);
                        }}
                        className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => deleteHRShift(shift.id)}
                        className="p-1.5 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-800/60 space-y-2">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Working Days:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                        <span
                          key={d}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                            shift.workDays.includes(d)
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : "bg-gray-800/50 text-gray-600 border border-gray-800"
                          }`}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL 1: ADD/EDIT DEPARTMENT & SUB-UNITS */}
        {showDeptModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0b0f17] border border-emerald-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <h3 className="text-sm font-black text-white">
                  {editingDeptId ? "Edit Department & Sub-Units" : "Add Department & Sub-Units"}
                </h3>
                <button onClick={() => setShowDeptModal(false)} className="text-gray-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveDept} className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-gray-400 font-bold mb-1">Department Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Operation Department"
                      value={deptForm.name}
                      onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Dept Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. OPD"
                      value={deptForm.code}
                      onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Department scope and responsibilities..."
                    value={deptForm.description}
                    onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* ─── HEAD OF DEPARTMENT SELECTION (DIRECTOR / MANAGER ONLY) ─── */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-gray-400 font-bold">Head of Department (Director / Manager Rank)</label>
                    <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                      <Crown size={11} /> Multi-Dept Supported
                    </span>
                  </div>
                  <select
                    value={deptForm.headEmployeeId}
                    onChange={(e) => setDeptForm({ ...deptForm, headEmployeeId: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs font-bold"
                  >
                    <option value="">-- Direct Company Owner Oversight / Auto-Rank Head --</option>
                    {hrEmployees
                      .filter((emp) => isEligibleForDepartmentHead(emp.designation) && emp.status === "Active")
                      .map((emp) => {
                        const otherDepts = (emp.headedDepartments || []).filter((d) => d !== deptForm.name);
                        const otherDeptsLabel = otherDepts.length > 0 ? ` (👑 Also Heads: ${otherDepts.join(", ")})` : "";
                        return (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} — {emp.designation} ({emp.department}){otherDeptsLabel}
                          </option>
                        );
                      })}
                  </select>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Only staff with <b>Director</b> or <b>Manager</b> level rankings are eligible to head departments. A single leader can head multiple departments.
                  </p>
                </div>

                {/* Sub-Departments / Operational Units Manager */}
                <div className="space-y-2 pt-2 border-t border-gray-800/80">
                  <label className="block text-emerald-400 font-bold">
                    Sub-Departments &amp; Operational Units (e.g. AR, Medical Billing, Spinning, Production)
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Medical Billing or Spinning Unit"
                      value={newSubDeptInput}
                      onChange={(e) => setNewSubDeptInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSubDept();
                        }
                      }}
                      className="flex-1 bg-black border border-gray-800 p-2.5 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubDept}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shrink-0"
                    >
                      + Add Unit
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {deptForm.subDepartments.length === 0 ? (
                      <span className="text-[11px] text-gray-500 italic">No sub-departments added yet. Add specialized units above.</span>
                    ) : (
                      deptForm.subDepartments.map((sub, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold"
                        >
                          <span>{sub}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubDept(sub)}
                            className="hover:text-red-400 text-gray-400"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase rounded-xl transition shadow-lg shadow-emerald-900/30 mt-2"
                >
                  Save Department &amp; Sub-Units
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: ADD/EDIT GLOBAL DESIGNATION */}
        {showDesgModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0b0f17] border border-emerald-500/40 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <h3 className="text-sm font-black text-white">
                  {editingDesgId ? "Edit Global Designation" : "Add New Designation"}
                </h3>
                <button onClick={() => setShowDesgModal(false)} className="text-gray-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveDesg} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Designation Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Director, Manager, Supervisor, Team Lead, Employee..."
                    value={desgForm.title}
                    onChange={(e) => handleDesgTitleChange(e.target.value)}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Auto Rank Level</label>
                    <select
                      value={desgForm.rank}
                      onChange={(e) => setDesgForm({ ...desgForm, rank: parseInt(e.target.value) || 3 })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                    >
                      <option value={1}>Rank #1 (Director)</option>
                      <option value={2}>Rank #2 (Assistant Director)</option>
                      <option value={3}>Rank #3 (Manager)</option>
                      <option value={4}>Rank #4 (Assistant Manager)</option>
                      <option value={5}>Rank #5 (Supervisor)</option>
                      <option value={6}>Rank #6 (Assistant Supervisor)</option>
                      <option value={7}>Rank #7 (Team Lead)</option>
                      <option value={8}>Rank #8 (Senior Officer)</option>
                      <option value={9}>Rank #9 (Employee)</option>
                      <option value={10}>Rank #10 (Intern)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Pay Grade Level</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. M-1"
                      value={desgForm.grade}
                      onChange={(e) => setDesgForm({ ...desgForm, grade: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase rounded-xl transition shadow-lg shadow-emerald-900/30"
                >
                  Save Designation
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: ADD/EDIT SHIFT */}
        {showShiftModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0b0f17] border border-emerald-500/40 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <h3 className="text-sm font-black text-white">
                  {editingShiftId ? "Edit Shift Schedule" : "Add New Shift Schedule"}
                </h3>
                <button onClick={() => setShowShiftModal(false)} className="text-gray-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveShift} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Shift Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Morning General Shift or Flexible Shift"
                    value={shiftForm.name}
                    onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Shift Type</label>
                    <select
                      value={shiftForm.type}
                      onChange={(e) => setShiftForm({ ...shiftForm, type: e.target.value as "Fixed" | "Flexible" })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Fixed">Fixed Clock Shift (General)</option>
                      <option value="Flexible">Flexible Shift (Duration Based)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Required Hours</label>
                    <input
                      type="number"
                      value={shiftForm.requiredHours}
                      onChange={(e) => setShiftForm({ ...shiftForm, requiredHours: parseInt(e.target.value) || 8 })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {shiftForm.type === "Fixed" ? (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-gray-400 font-bold mb-1">Start Time</label>
                      <input
                        type="text"
                        placeholder="09:00 AM"
                        value={shiftForm.startTime}
                        onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                        className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500 text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 font-bold mb-1">End Time</label>
                      <input
                        type="text"
                        placeholder="05:00 PM"
                        value={shiftForm.endTime}
                        onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                        className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500 text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 font-bold mb-1">Grace Mins</label>
                      <input
                        type="number"
                        value={shiftForm.graceMinutes}
                        onChange={(e) => setShiftForm({ ...shiftForm, graceMinutes: parseInt(e.target.value) || 0 })}
                        className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500 text-center"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-300 text-[11px] space-y-1">
                    <div>⏰ <b>Flexible Check-In Mode:</b> Employee check-in can happen at any time.</div>
                    <div>⏱️ Employee must complete <b>{shiftForm.requiredHours} Hours</b> shift duration starting from check-in.</div>
                  </div>
                )}

                <div>
                  <label className="block text-gray-400 font-bold mb-1">Working Days</label>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleWorkDay(d)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          shiftForm.workDays.includes(d)
                            ? "bg-emerald-600 text-white"
                            : "bg-gray-800 text-gray-400"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase rounded-xl transition shadow-lg shadow-emerald-900/30"
                >
                  Save Shift Schedule
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
