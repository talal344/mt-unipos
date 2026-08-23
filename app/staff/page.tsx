"use client";

import React, { useState, useMemo } from "react";
import { useGlobalContext } from "@/context/global-context";
import ClientSidebar from "@/components/client-sidebar";
import {
  Users, Plus, Search, Edit2, Trash2, Eye, EyeOff,
  Shield, X, Check, AlertCircle, Phone, Mail, Lock,
  BadgeCheck, UserX, UserCheck, Calendar, DollarSign,
  Key, Briefcase, ChevronRight, Clock, Receipt
} from "lucide-react";

// ─── Role Config ──────────────────────────────────────────────────────────────
const ROLES = [
  { value: "Manager", label: "Manager", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", desc: "Full store access except admin" },
  { value: "Cashier", label: "Cashier", color: "text-brand-sky", bg: "bg-brand-sky/10 border-brand-sky/20", desc: "POS, customers, basic reports" },
  { value: "Accountant", label: "Accountant", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", desc: "Accounting, reports, payroll" },
  { value: "Warehouse Staff", label: "Warehouse & Inventory Manager", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", desc: "Products, purchases, suppliers, and full inventory" },
  { value: "HR", label: "HR Manager", color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20", desc: "Staff management, payroll, attendance" },
];

// Role → page access mapping (for display)
const ROLE_PERMISSIONS: Record<string, string[]> = {
  Manager: ["Dashboard", "POS", "Customers", "Products", "Inventory", "Purchases", "Expenses", "Payroll", "Reports", "AI Analytics"],
  Cashier: ["POS", "Customers", "Reports (Basic)"],
  Accountant: ["Dashboard", "Accounting", "Reports", "Expenses", "Payroll"],
  "Warehouse Staff": ["Products", "Inventory", "Suppliers", "Purchases", "Reports"],
  HR: ["Payroll", "Staff", "Reports (HR)"],
};

const EMPTY_FORM = {
  name: "", email: "", password: "", phone: "", salary: "",
  role: "Cashier" as const, joinDate: new Date().toISOString().split("T")[0], status: "Active" as "Active" | "Inactive"
};

export default function StaffPage() {
  const { employees, addEmployee, updateEmployee, deleteEmployee, currencySymbol, attendanceRecords, addAttendanceRecord, updateAttendanceRecord, payrollRecords, addPayrollRecord, theme } = useGlobalContext();
  const isLight = theme === "light";

  const [activeTab, setActiveTab] = useState<"Profiles" | "Attendance" | "Payroll">("Profiles");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Attendance states
  const [pinInput, setPinInput] = useState("");
  
  const handleClockInOut = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.password === pinInput); // Mocking PIN as password for now
    if (!emp) {
      triggerToast("Invalid PIN");
      return;
    }
    
    // Find today's record for this employee
    const todayStr = new Date().toISOString().split("T")[0];
    const existing = attendanceRecords.find(a => a.employeeId === emp.id && a.date === todayStr);

    if (existing && !existing.clockOut) {
      // Clock out
      updateAttendanceRecord(existing.id, { clockOut: new Date().toISOString(), status: "Present" });
      triggerToast(`${emp.name} clocked OUT successfully.`);
    } else if (!existing) {
      // Clock in
      addAttendanceRecord({
        employeeId: emp.id,
        date: todayStr,
        clockIn: new Date().toISOString(),
        status: "Present"
      });
      triggerToast(`${emp.name} clocked IN successfully.`);
    } else {
      triggerToast(`${emp.name} already completed their shift today.`);
    }
    setPinInput("");
  };

  const handleProcessPayroll = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;
    
    // Simplistic payroll calculation
    const month = new Date().toISOString().slice(0, 7); // YYYY-MM
    const existing = payrollRecords.find(p => p.employeeId === empId && p.month === month);
    if (existing) {
      triggerToast(`Payroll for ${month} already processed for ${emp.name}.`);
      return;
    }

    addPayrollRecord({
      employeeId: emp.id,
      month,
      baseSalary: emp.salary || 0,
      bonuses: 0,
      deductions: 0,
      netPay: emp.salary || 0,
      status: "Paid",
      paidAt: new Date().toISOString()
    });
    triggerToast(`Salary slip generated for ${emp.name}.`);
  };

  const filtered = useMemo(() => {
    return employees.filter(e => {
      const q = search.toLowerCase();
      return (
        (e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || (e.phone || "").includes(q)) &&
        (roleFilter === "All" || e.role === roleFilter)
      );
    });
  }, [employees, search, roleFilter]);

  const selectedEmployee = useMemo(() => employees.find(e => e.id === selectedId) || null, [employees, selectedId]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setShowModal(true);
  };

  const openEdit = (emp: typeof employees[0]) => {
    setEditingId(emp.id);
    setForm({
      name: emp.name, email: emp.email, password: emp.password || "",
      phone: emp.phone || "", salary: (emp.salary || 0).toString(),
      role: emp.role as any, joinDate: emp.joinDate || new Date().toISOString().split("T")[0],
      status: emp.status
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return;
    const payload = {
      name: form.name, email: form.email, password: form.password,
      phone: form.phone, salary: parseFloat(form.salary) || 0,
      role: form.role, joinDate: form.joinDate, status: form.status,
      permissions: ROLE_PERMISSIONS[form.role] || []
    };
    if (editingId) {
      updateEmployee(editingId, payload);
      triggerToast("Staff profile updated!");
    } else {
      addEmployee(payload);
      triggerToast("New staff member added!");
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteEmployee(id);
    if (selectedId === id) setSelectedId(null);
    setConfirmDeleteId(null);
    triggerToast("Staff member removed.");
  };

  const getRoleConfig = (role: string) => ROLES.find(r => r.value === role) || ROLES[1];

  // Stats
  const totalStaff = employees.length;
  const activeStaff = employees.filter(e => e.status === "Active").length;
  const totalSalaryBill = employees.reduce((a, e) => a + (e.salary || 0), 0);
  const byCashiers = employees.filter(e => e.role === "Cashier").length;

  return (
    <div className={`flex h-screen overflow-hidden font-sans ${isLight ? "bg-slate-100 text-slate-900" : "bg-black text-gray-100"}`}>
      <ClientSidebar />

      {toast && (
        <div className="fixed top-4 right-4 bg-emerald-500/95 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-2xl z-50 flex items-center gap-2 animate-bounce">
          <Check size={14} /> {toast}
        </div>
      )}

      <main className="flex-grow flex flex-col overflow-hidden h-screen">
        
        {/* Top Header & Tabs */}
        <div className={`p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 ${isLight ? "border-slate-200" : "border-brand-dark-border"}`}>
          <div>
            <h1 className={`text-xl font-black flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
              <Shield size={20} className="text-sky-500" /> Human Resources
            </h1>
            <p className={`text-[10px] mt-0.5 ${isLight ? "text-slate-500" : "text-gray-500"}`}>Staff profiles, attendance tracking, and payroll.</p>
          </div>
          <div className="flex gap-2">
            {["Profiles", "Attendance", "Payroll"].map(t => (
              <button key={t} onClick={() => setActiveTab(t as any)}
                className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition ${
                  activeTab === t
                    ? isLight ? "bg-sky-600 text-white shadow-xs font-black" : "bg-brand-sky text-black font-black"
                    : isLight ? "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shadow-xs" : "bg-brand-dark-surface border border-brand-dark-border text-gray-400 hover:text-white"
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-grow flex overflow-hidden">
        {activeTab === "Profiles" && (
          <>
        {/* LEFT: Staff List */}
        <section className={`flex flex-col border-r transition-all duration-300 ${isLight ? "border-slate-200" : "border-brand-dark-border"} ${selectedId ? "w-0 lg:w-[420px] overflow-hidden" : "flex-grow"}`}>
          <div className="flex-grow overflow-y-auto p-6 space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-lg font-black ${isLight ? "text-slate-900" : "text-white"}`}>Staff Roster</h2>
                <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-500"}`}>{totalStaff} team members</p>
              </div>
              <button onClick={openAdd} className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs px-4 py-2.5 rounded-lg shadow-lg transition">
                <Plus size={14} /> Add Staff
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Total Staff", val: totalStaff, color: "text-sky-500", icon: Users },
                { label: "Active", val: activeStaff, color: "text-emerald-500", icon: UserCheck },
                { label: "Cashiers", val: byCashiers, color: "text-purple-500", icon: Briefcase },
                { label: "Salary Bill", val: `${currencySymbol} ${totalSalaryBill.toLocaleString()}`, color: "text-amber-500", icon: DollarSign },
              ].map(s => (
                <div key={s.label} className={`border rounded-xl p-4 ${
                  isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/40 border-brand-dark-border text-gray-100"
                }`}>
                  <s.icon size={15} className={s.color} />
                  <div className={`text-lg font-black font-mono mt-1 ${s.color}`}>{s.val}</div>
                  <div className={`text-[9px] uppercase tracking-wide font-bold ${isLight ? "text-slate-500" : "text-gray-500"}`}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Search + Filter */}
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Search className={`absolute left-3 top-2.5 ${isLight ? "text-slate-400" : "text-gray-500"}`} size={14} />
                <input type="text" placeholder="Search by name, email, phone..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 rounded-lg text-xs font-bold border focus:outline-none ${
                    isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 shadow-xs" : "bg-brand-dark-surface border-brand-dark-border text-white focus:border-brand-sky"
                  }`} />
              </div>
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                className={`border rounded-lg text-[10px] font-bold px-3 py-2 focus:outline-none ${
                  isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500 shadow-xs" : "bg-brand-dark-surface border-brand-dark-border text-gray-300 focus:border-brand-sky"
                }`}>
                <option value="All">All Roles</option>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            {/* Staff List */}
            <div className="space-y-2">
              {filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-400 text-xs">
                  <Users size={36} className="mx-auto mb-3 opacity-30" />
                  <p>No staff found. Add your first team member.</p>
                </div>
              ) : filtered.map(emp => {
                const rc = getRoleConfig(emp.role);
                const isActive = selectedId === emp.id;
                return (
                  <div key={emp.id} onClick={() => setSelectedId(emp.id)}
                    className={`group flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      isActive 
                        ? isLight ? "bg-sky-50 border-sky-400 shadow-xs" : "bg-brand-sky/10 border-brand-sky/40" 
                        : isLight ? "bg-white border-slate-200 hover:border-sky-300 hover:bg-slate-50 shadow-xs text-slate-900" : "bg-brand-dark-surface/30 border-brand-dark-border hover:border-brand-sky/30 hover:bg-brand-dark-surface/60 text-gray-100"
                    }`}>
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                      isActive ? "bg-brand-sky text-black" : isLight ? "bg-slate-200 text-slate-700" : "bg-brand-dark-border text-gray-300"
                    }`}>
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm truncate ${isLight ? "text-slate-900" : "text-white"}`}>{emp.name}</span>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${rc.bg} ${rc.color}`}>{rc.label}</span>
                        {emp.status === "Inactive" && <span className="text-[8px] font-bold text-red-500 border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 rounded">Inactive</span>}
                      </div>
                      <div className={`text-[10px] mt-0.5 flex items-center gap-3 ${isLight ? "text-slate-500" : "text-gray-500"}`}>
                        <span className="flex items-center gap-1"><Mail size={9} /> {emp.email}</span>
                        {emp.phone && <span className="flex items-center gap-1"><Phone size={9} /> {emp.phone}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-xs font-black font-mono ${isLight ? "text-sky-600" : "text-brand-sky"}`}>{currencySymbol} {(emp.salary || 0).toLocaleString()}</div>
                      <div className={`text-[9px] ${isLight ? "text-slate-400" : "text-gray-600"}`}>/ month</div>
                    </div>
                    <ChevronRight size={14} className={`${isLight ? "text-slate-400 group-hover:text-sky-600" : "text-gray-600 group-hover:text-brand-sky"} transition shrink-0`} />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* RIGHT: Employee Detail Panel */}
        {selectedEmployee && (
          <section className={`flex-grow flex flex-col overflow-hidden ${isLight ? "bg-slate-50 border-l border-slate-200 text-slate-900" : "bg-black/60"}`}>
            <div className={`shrink-0 border-b p-5 flex items-start justify-between gap-4 ${isLight ? "border-slate-200" : "border-brand-dark-border"}`}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-sky text-black font-black text-xl flex items-center justify-center shadow-xs">
                  {selectedEmployee.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className={`font-black text-lg ${isLight ? "text-slate-900" : "text-white"}`}>{selectedEmployee.name}</h2>
                    {(() => { const rc = getRoleConfig(selectedEmployee.role); return <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${rc.bg} ${rc.color}`}>{rc.label}</span>; })()}
                  </div>
                  <div className={`flex items-center gap-3 text-[10px] mt-0.5 ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                    <span className="flex items-center gap-1"><Mail size={10} />{selectedEmployee.email}</span>
                    {selectedEmployee.phone && <span className="flex items-center gap-1"><Phone size={10} />{selectedEmployee.phone}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openEdit(selectedEmployee)} className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-[10px] font-bold transition ${isLight ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-xs" : "bg-brand-dark-border hover:bg-brand-sky/20 text-gray-300 hover:text-brand-sky"}`}>
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => setConfirmDeleteId(selectedEmployee.id)} className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-[10px] font-bold transition ${isLight ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" : "bg-brand-dark-border hover:bg-red-500/20 text-gray-300 hover:text-red-400"}`}>
                  <Trash2 size={12} /> Remove
                </button>
                <button onClick={() => setSelectedId(null)} className={`p-2 rounded-lg transition ${isLight ? "bg-white border border-slate-300 text-slate-500 hover:bg-slate-100" : "bg-brand-dark-border hover:bg-brand-dark-border/60 text-gray-400 hover:text-white"}`}>
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-5 space-y-5">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className={`border rounded-xl p-4 text-center ${isLight ? "bg-white border-slate-200 shadow-xs" : "bg-brand-dark-surface/40 border-brand-dark-border"}`}>
                  <DollarSign size={14} className="text-emerald-500 mx-auto mb-1" />
                  <div className="text-sm font-black text-emerald-500 font-mono">{currencySymbol} {(selectedEmployee.salary || 0).toLocaleString()}</div>
                  <div className={`text-[9px] ${isLight ? "text-slate-500" : "text-gray-500"}`}>Monthly Salary</div>
                </div>
                <div className={`border rounded-xl p-4 text-center ${isLight ? "bg-white border-slate-200 shadow-xs" : "bg-brand-dark-surface/40 border-brand-dark-border"}`}>
                  <Calendar size={14} className="text-brand-sky mx-auto mb-1" />
                  <div className="text-xs font-black text-brand-sky">{selectedEmployee.joinDate || "N/A"}</div>
                  <div className={`text-[9px] ${isLight ? "text-slate-500" : "text-gray-500"}`}>Join Date</div>
                </div>
                <div className={`border rounded-xl p-4 text-center ${isLight ? "bg-white border-slate-200 shadow-xs" : "bg-brand-dark-surface/40 border-brand-dark-border"}`}>
                  {selectedEmployee.status === "Active" ? <UserCheck size={14} className="text-emerald-500 mx-auto mb-1" /> : <UserX size={14} className="text-red-500 mx-auto mb-1" />}
                  <div className={`text-xs font-black ${selectedEmployee.status === "Active" ? "text-emerald-500" : "text-red-500"}`}>{selectedEmployee.status}</div>
                  <div className={`text-[9px] ${isLight ? "text-slate-500" : "text-gray-500"}`}>Status</div>
                </div>
              </div>

              {/* Credentials */}
              <div className={`border rounded-2xl p-5 space-y-3 ${isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/40 border-brand-dark-border"}`}>
                <h3 className={`text-xs font-black uppercase tracking-wider border-b pb-2 ${isLight ? "text-slate-900 border-slate-200" : "text-white border-brand-dark-border/50"}`}>Login Credentials</h3>
                <div className="flex items-center gap-3 text-xs">
                  <Mail size={13} className={isLight ? "text-slate-400" : "text-gray-500"} />
                  <div>
                    <span className={`text-[9px] uppercase block ${isLight ? "text-slate-500" : "text-gray-500"}`}>Email</span>
                    <span className={`font-mono font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{selectedEmployee.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <Key size={13} className={isLight ? "text-slate-400" : "text-gray-500"} />
                  <div>
                    <span className={`text-[9px] uppercase block ${isLight ? "text-slate-500" : "text-gray-500"}`}>Password</span>
                    <span className={`font-mono font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{'•'.repeat(Math.max(8, (selectedEmployee.password || "").length))}</span>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className={`border rounded-2xl p-5 ${isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/40 border-brand-dark-border"}`}>
                <h3 className={`text-xs font-black uppercase tracking-wider border-b pb-2 mb-3 ${isLight ? "text-slate-900 border-slate-200" : "text-white border-brand-dark-border/50"}`}>
                  Access Permissions — {getRoleConfig(selectedEmployee.role).label}
                </h3>
                <p className={`text-[9px] mb-3 ${isLight ? "text-slate-500" : "text-gray-500"}`}>{getRoleConfig(selectedEmployee.role).desc}</p>
                <div className="grid grid-cols-2 gap-2">
                  {(ROLE_PERMISSIONS[selectedEmployee.role] || []).map(perm => (
                    <div key={perm} className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold">
                      <BadgeCheck size={11} /> {perm}
                    </div>
                  ))}
                </div>
                {/* All roles permissions overview */}
                <div className={`mt-4 border-t pt-3 ${isLight ? "border-slate-200" : "border-brand-dark-border/50"}`}>
                  <p className={`text-[9px] uppercase tracking-wider font-bold mb-2 ${isLight ? "text-slate-500" : "text-gray-600"}`}>All Roles Overview</p>
                  <div className="space-y-2">
                    {ROLES.map(r => (
                      <div key={r.value} className={`flex items-center gap-2 px-2 py-1.5 rounded ${r.value === selectedEmployee.role ? `${r.bg} border` : "opacity-40"}`}>
                        <span className={`text-[9px] font-black w-28 ${r.color}`}>{r.label}</span>
                        <span className={`text-[8px] truncate ${isLight ? "text-slate-600" : "text-gray-400"}`}>{r.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        </>
        )}

        {activeTab === "Attendance" && (
          <div className="flex-grow p-6 overflow-y-auto">
            <div className={`max-w-2xl mx-auto border rounded-2xl p-8 shadow-2xl ${isLight ? "bg-white border-slate-200 text-slate-900" : "bg-brand-dark-surface/30 border-brand-dark-border text-white"}`}>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-sky-500/30">
                  <Clock size={32} className="text-sky-500" />
                </div>
                <h2 className={`text-2xl font-black ${isLight ? "text-slate-900" : "text-white"}`}>Staff Time Clock</h2>
                <p className={`text-xs mt-1 ${isLight ? "text-slate-500" : "text-gray-400"}`}>Enter your assigned PIN to clock in or out of your shift.</p>
              </div>

              <form onSubmit={handleClockInOut} className="space-y-4 max-w-sm mx-auto">
                <div>
                  <input 
                    type="password" 
                    required 
                    placeholder="Enter PIN" 
                    value={pinInput} 
                    onChange={e => setPinInput(e.target.value)}
                    className={`w-full ${isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"} border-2 text-center text-2xl tracking-widest font-mono py-4 rounded-xl transition focus:outline-none`} 
                  />
                </div>
                <button type="submit" className="w-full bg-brand-sky hover:bg-brand-sky-light text-black font-black uppercase tracking-wider py-4 rounded-xl transition">
                  Submit Punch
                </button>
              </form>

              <div className={`mt-12 pt-8 border-t ${isLight ? "border-slate-200" : "border-brand-dark-border"}`}>
                <h3 className={`text-xs font-black uppercase tracking-wider mb-4 ${isLight ? "text-slate-900" : "text-white"}`}>Today's Activity log</h3>
                <div className="space-y-2">
                  {attendanceRecords.filter(a => a.date === new Date().toISOString().split("T")[0]).map(record => {
                    const emp = employees.find(e => e.id === record.employeeId);
                    return (
                      <div key={record.id} className={`flex justify-between items-center p-3 border rounded-lg text-xs ${isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-black/40 border-brand-dark-border"}`}>
                        <div className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{emp?.name || "Unknown"}</div>
                        <div className="flex gap-4 font-mono text-[10px]">
                          <span className="text-emerald-500 font-bold">IN: {new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className={record.clockOut ? "text-amber-500 font-bold" : isLight ? "text-slate-400" : "text-gray-500"}>
                            OUT: {record.clockOut ? new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  {attendanceRecords.filter(a => a.date === new Date().toISOString().split("T")[0]).length === 0 && (
                    <div className={`text-center text-[10px] py-4 ${isLight ? "text-slate-400" : "text-gray-500"}`}>No punches recorded today.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Payroll" && (
          <div className="flex-grow p-6 overflow-y-auto">
            <div className={`border rounded-2xl overflow-hidden ${isLight ? "bg-white border-slate-200 shadow-xs" : "bg-brand-dark-surface/30 border-brand-dark-border"}`}>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b font-mono ${isLight ? "bg-slate-100 border-slate-200 text-slate-700" : "border-brand-dark-border text-gray-500 bg-black/60"}`}>
                    <th className="p-4 font-semibold">Staff Member</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold">Base Salary</th>
                    <th className="p-4 font-semibold">Status (Current Month)</th>
                    <th className="p-4 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y font-mono text-[11px] ${isLight ? "divide-slate-200" : "divide-brand-dark-border/40"}`}>
                  {employees.map(emp => {
                    const month = new Date().toISOString().slice(0, 7);
                    const paid = payrollRecords.find(p => p.employeeId === emp.id && p.month === month);
                    return (
                      <tr key={emp.id} className={`transition ${isLight ? "hover:bg-slate-50 text-slate-900" : "hover:bg-brand-dark-surface/60 text-gray-100"}`}>
                        <td className={`p-4 font-bold font-sans ${isLight ? "text-slate-900" : "text-white"}`}>{emp.name}</td>
                        <td className={`p-4 ${isLight ? "text-slate-600" : "text-gray-400"}`}>{emp.role}</td>
                        <td className={`p-4 font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{currencySymbol} {(emp.salary || 0).toLocaleString()}</td>
                        <td className="p-4">
                          {paid ? (
                            <span className="bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded-full text-[9px] font-bold">Paid on {paid.paidAt ? new Date(paid.paidAt).toLocaleDateString() : "N/A"}</span>
                          ) : (
                            <span className="bg-amber-500/20 text-amber-500 px-2 py-1 rounded-full text-[9px] font-bold">Pending</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {!paid && (
                            <button onClick={() => handleProcessPayroll(emp.id)}
                              className="px-3 py-1.5 bg-brand-sky text-black font-bold rounded text-[10px] flex items-center gap-1 mx-auto transition hover:bg-brand-sky-light">
                              <Receipt size={10} /> Generate Slip
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>
      </main>

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className={`${isLight ? "bg-white border-slate-200 shadow-2xl text-slate-900" : "bg-brand-dark-surface border-brand-sky/30 text-white"} border p-6 rounded-2xl w-full max-w-md shadow-2xl`}>
            <div className={`flex justify-between items-center border-b pb-3 mb-5 ${isLight ? "border-slate-200" : "border-brand-dark-border"}`}>
              <div>
                <h3 className={`font-black text-sm flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                  <Shield size={16} className="text-brand-sky" />
                  {editingId ? "Edit Staff Profile" : "Add New Staff Member"}
                </h3>
                <p className={`text-[9px] mt-0.5 ${isLight ? "text-slate-500" : "text-gray-500"}`}>Credentials will be used for system login</p>
              </div>
              <button onClick={() => setShowModal(false)}><X size={18} className={`${isLight ? "text-slate-400 hover:text-slate-900" : "text-gray-400 hover:text-white"}`} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[9px] uppercase font-bold mb-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Full Name *</label>
                  <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Ahmad Raza"
                    className={`w-full ${isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"} border p-2.5 rounded-lg focus:outline-none`} />
                </div>
                <div>
                  <label className={`block text-[9px] uppercase font-bold mb-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Phone</label>
                  <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="03xxxxxxxxx"
                    className={`w-full ${isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky font-mono"} border p-2.5 rounded-lg focus:outline-none`} />
                </div>
              </div>

              <div>
                <label className={`block text-[9px] uppercase font-bold mb-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Role / Position *</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map(r => (
                    <button key={r.value} type="button" onClick={() => setForm({ ...form, role: r.value as any })}
                      className={`p-2.5 rounded-lg border text-left transition ${
                        form.role === r.value 
                          ? `${r.bg} border-current` 
                          : isLight 
                          ? "bg-slate-50 border-slate-200 hover:border-sky-400" 
                          : "bg-black border-brand-dark-border hover:border-brand-sky/30"
                      }`}>
                      <div className={`text-[10px] font-black ${form.role === r.value ? r.color : isLight ? "text-slate-700" : "text-gray-300"}`}>{r.label}</div>
                      <div className={`text-[8px] mt-0.5 ${isLight ? "text-slate-500" : "text-gray-500"}`}>{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-[9px] uppercase font-bold mb-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Login Email *</label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-3 ${isLight ? "text-slate-400" : "text-gray-500"}`} size={13} />
                  <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="staff@yourstore.com"
                    className={`w-full ${isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"} border pl-9 pr-4 p-2.5 rounded-lg focus:outline-none`} />
                </div>
              </div>

              <div>
                <label className={`block text-[9px] uppercase font-bold mb-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Login Password *</label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-3 ${isLight ? "text-slate-400" : "text-gray-500"}`} size={13} />
                  <input required type={showPassword ? "text" : "password"} value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                    className={`w-full ${isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 font-mono" : "bg-black border-brand-dark-border text-white focus:border-brand-sky font-mono"} border pl-9 pr-10 p-2.5 rounded-lg focus:outline-none`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-3 top-3 ${isLight ? "text-slate-400 hover:text-slate-900" : "text-gray-500 hover:text-white"}`}>
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[9px] uppercase font-bold mb-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Monthly Salary ({currencySymbol})</label>
                  <input type="number" min="0" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })}
                    placeholder="e.g. 35000"
                    className={`w-full ${isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 font-mono" : "bg-black border-brand-dark-border text-white focus:border-brand-sky font-mono"} border p-2.5 rounded-lg focus:outline-none`} />
                </div>
                <div>
                  <label className={`block text-[9px] uppercase font-bold mb-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Join Date</label>
                  <input type="date" value={form.joinDate} onChange={e => setForm({ ...form, joinDate: e.target.value })}
                    className={`w-full ${isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"} border p-2.5 rounded-lg focus:outline-none`} />
                </div>
              </div>

              <div>
                <label className={`block text-[9px] uppercase font-bold mb-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Status</label>
                <div className="flex gap-2">
                  {["Active", "Inactive"].map(s => (
                    <button key={s} type="button" onClick={() => setForm({ ...form, status: s as any })}
                      className={`flex-1 py-2 rounded-lg border text-xs font-bold transition ${form.status === s
                        ? s === "Active" ? "bg-emerald-500/20 border-emerald-500 text-emerald-500 font-black" : "bg-red-500/20 border-red-500 text-red-500 font-black"
                        : isLight ? "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100" : "bg-black border-brand-dark-border text-gray-500"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className={`flex-1 py-2.5 font-bold rounded-lg transition ${isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-700" : "bg-brand-dark-border text-gray-300 hover:bg-brand-dark-border/70"}`}>Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-brand-sky hover:bg-brand-sky-light text-black font-black uppercase rounded-lg transition">
                  {editingId ? "Save Changes" : "Add Staff Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className={`${isLight ? "bg-white border-red-300 text-slate-900 shadow-2xl" : "bg-brand-dark-surface border-red-500/30 text-white"} border p-6 rounded-2xl max-w-sm w-full text-center space-y-4`}>
            <AlertCircle size={40} className="text-red-500 mx-auto" />
            <div>
              <h3 className={`font-black text-base ${isLight ? "text-slate-900" : "text-white"}`}>Remove Staff Member?</h3>
              <p className={`text-[10px] mt-1 ${isLight ? "text-slate-500" : "text-gray-400"}`}>This will permanently delete their profile and login credentials.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDeleteId(null)} className={`flex-1 py-2.5 font-bold rounded-lg text-xs ${isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-700" : "bg-brand-dark-border text-gray-300"}`}>Cancel</button>
              <button onClick={() => handleDelete(confirmDeleteId)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-black rounded-lg text-xs transition">Yes, Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
