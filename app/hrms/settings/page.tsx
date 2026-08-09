"use client";

import React, { useState } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import { useGlobalContext } from "@/context/global-context";
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
  Layers
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
    businessSettings,
    currentUser
  } = useGlobalContext();

  const [activeTab, setActiveTab] = useState<"departments" | "designations" | "shifts">("departments");

  // Modal States
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptForm, setDeptForm] = useState({ name: "", code: "", headOfDepartment: "", description: "" });

  const [showDesgModal, setShowDesgModal] = useState(false);
  const [editingDesgId, setEditingDesgId] = useState<string | null>(null);
  const [desgForm, setDesgForm] = useState({ title: "", department: "", grade: "E-1" });

  const [showShiftModal, setShowShiftModal] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [shiftForm, setShiftForm] = useState({
    name: "",
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    graceMinutes: 15,
    workDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Department Form Handlers
  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code) return;

    if (editingDeptId) {
      updateHRDepartment(editingDeptId, deptForm);
      triggerToast(`✅ Updated department '${deptForm.name}'!`);
    } else {
      addHRDepartment(deptForm);
      triggerToast(`✅ Added new department '${deptForm.name}'!`);
    }
    setShowDeptModal(false);
    setEditingDeptId(null);
    setDeptForm({ name: "", code: "", headOfDepartment: "", description: "" });
  };

  // Designation Form Handlers
  const handleSaveDesg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desgForm.title || !desgForm.department) return;

    if (editingDesgId) {
      updateHRDesignation(editingDesgId, desgForm);
      triggerToast(`✅ Updated designation '${desgForm.title}'!`);
    } else {
      addHRDesignation(desgForm);
      triggerToast(`✅ Added designation '${desgForm.title}'!`);
    }
    setShowDesgModal(false);
    setEditingDesgId(null);
    setDesgForm({ title: "", department: hrDepartments[0]?.name || "Human Resources", grade: "E-1" });
  };

  // Shift Form Handlers
  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftForm.name) return;

    if (editingShiftId) {
      updateHRShift(editingShiftId, shiftForm);
      triggerToast(`✅ Updated shift '${shiftForm.name}'!`);
    } else {
      addHRShift(shiftForm);
      triggerToast(`✅ Added shift '${shiftForm.name}'!`);
    }
    setShowShiftModal(false);
    setEditingShiftId(null);
    setShiftForm({
      name: "",
      startTime: "09:00 AM",
      endTime: "05:00 PM",
      graceMinutes: 15,
      workDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    });
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
              Company Departments, Designations &amp; Shifts
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Configure company organizational structure. Departments and designations defined here drive employee onboarding and hierarchy rules.
            </p>
          </div>
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
            <span>Departments ({hrDepartments.length})</span>
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
            <span>Designations Hierarchy ({hrDesignations.length})</span>
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
            <span>Shifts &amp; Work Timings ({hrShifts.length})</span>
          </button>
        </div>

        {/* 🏢 TAB 1: DEPARTMENTS */}
        {activeTab === "departments" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#0b0f17] p-4 rounded-2xl border border-gray-800/80">
              <div>
                <h3 className="text-sm font-black text-white">Company Departments List</h3>
                <p className="text-[11px] text-gray-400">All registered operational units in {currentUser?.businessName || "MT Software"}.</p>
              </div>
              <button
                onClick={() => {
                  setEditingDeptId(null);
                  setDeptForm({ name: "", code: "", headOfDepartment: "", description: "" });
                  setShowDeptModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-900/20"
              >
                <Plus size={14} /> Add New Department
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hrDepartments.map((dept) => (
                <div
                  key={dept.id}
                  className="bg-[#0b0f17] border border-gray-800/80 hover:border-emerald-500/40 p-5 rounded-2xl space-y-3 relative group transition shadow-xl"
                >
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
                            headOfDepartment: dept.headOfDepartment || "",
                            description: dept.description || ""
                          });
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

                  <div className="pt-3 border-t border-gray-800/60 flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">Head of Dept:</span>
                    <span className="text-emerald-400 font-bold">{dept.headOfDepartment || "Unassigned"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 👔 TAB 2: DESIGNATIONS */}
        {activeTab === "designations" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#0b0f17] p-4 rounded-2xl border border-gray-800/80">
              <div>
                <h3 className="text-sm font-black text-white">Designations &amp; Job Hierarchy</h3>
                <p className="text-[11px] text-gray-400 font-sans">Formal designations mapped to specific departments.</p>
              </div>
              <button
                onClick={() => {
                  setEditingDesgId(null);
                  setDesgForm({ title: "", department: hrDepartments[0]?.name || "Human Resources", grade: "E-1" });
                  setShowDesgModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-900/20"
              >
                <Plus size={14} /> Add Designation
              </button>
            </div>

            <div className="bg-[#0b0f17] border border-gray-800/80 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/50 border-b border-gray-800 text-gray-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-4">Designation Title</th>
                    <th className="p-4">Mapped Department</th>
                    <th className="p-4">Pay Grade</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {hrDesignations.map((desg) => (
                    <tr key={desg.id} className="hover:bg-white/[0.02]">
                      <td className="p-4 font-bold text-white flex items-center gap-2">
                        <Briefcase size={14} className="text-emerald-400" />
                        <span>{desg.title}</span>
                      </td>
                      <td className="p-4 text-gray-300">
                        <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-mono text-[11px]">
                          {desg.department}
                        </span>
                      </td>
                      <td className="p-4 text-emerald-400 font-mono font-bold">
                        {desg.grade || "Standard"}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingDesgId(desg.id);
                              setDesgForm({ title: desg.title, department: desg.department, grade: desg.grade || "E-1" });
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
                <p className="text-[11px] text-gray-400">Configure roster shift schedules and grace time allowances.</p>
              </div>
              <button
                onClick={() => {
                  setEditingShiftId(null);
                  setShiftForm({
                    name: "",
                    startTime: "09:00 AM",
                    endTime: "05:00 PM",
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
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <Clock size={15} className="text-emerald-400" />
                        <span>{shift.name}</span>
                      </h4>
                      <div className="text-xs text-emerald-400 font-mono font-bold mt-1">
                        {shift.startTime} — {shift.endTime} ({shift.graceMinutes}m Grace Time)
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingShiftId(shift.id);
                          setShiftForm({
                            name: shift.name,
                            startTime: shift.startTime,
                            endTime: shift.endTime,
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

        {/* MODAL 1: ADD/EDIT DEPARTMENT */}
        {showDeptModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0b0f17] border border-emerald-500/40 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <h3 className="text-sm font-black text-white">
                  {editingDeptId ? "Edit Department" : "Add New Department"}
                </h3>
                <button onClick={() => setShowDeptModal(false)} className="text-gray-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveDept} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Department Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Accounts & Finance"
                    value={deptForm.name}
                    onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Dept Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. FIN"
                      value={deptForm.code}
                      onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Head of Dept</label>
                    <input
                      type="text"
                      placeholder="e.g. Muhammad Bilal"
                      value={deptForm.headOfDepartment}
                      onChange={(e) => setDeptForm({ ...deptForm, headOfDepartment: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-emerald-500"
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

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase rounded-xl transition shadow-lg shadow-emerald-900/30"
                >
                  Save Department
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: ADD/EDIT DESIGNATION */}
        {showDesgModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0b0f17] border border-emerald-500/40 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <h3 className="text-sm font-black text-white">
                  {editingDesgId ? "Edit Designation" : "Add New Designation"}
                </h3>
                <button onClick={() => setShowDesgModal(false)} className="text-gray-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveDesg} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Designation Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Software Engineer"
                    value={desgForm.title}
                    onChange={(e) => setDesgForm({ ...desgForm, title: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Department</label>
                    <select
                      value={desgForm.department}
                      onChange={(e) => setDesgForm({ ...desgForm, department: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    >
                      {hrDepartments.map((d) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Grade Level</label>
                    <input
                      type="text"
                      placeholder="e.g. M-1, E-2"
                      value={desgForm.grade}
                      onChange={(e) => setDesgForm({ ...desgForm, grade: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
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
                    placeholder="e.g. Morning Shift"
                    value={shiftForm.name}
                    onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

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
