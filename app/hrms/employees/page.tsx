"use client";

import React, { useState } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import { useGlobalContext, generateNextEmployeeCode } from "@/context/global-context";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Building2,
  Phone,
  Mail,
  CreditCard,
  Briefcase,
  Calendar,
  X,
  FileText,
  DollarSign
} from "lucide-react";

export default function HREmployeesPage() {
  const {
    hrEmployees,
    addHREmployee,
    updateHREmployee,
    deleteHREmployee,
    hrDepartments,
    hrDesignations,
    hrShifts,
    currencySymbol,
    currentUser,
    businessSettings
  } = useGlobalContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  const defaultDept = hrDepartments[0]?.name || "Human Resources";
  const defaultDesg = hrDesignations[0]?.title || "HR Officer";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    cnic: "",
    department: defaultDept,
    designation: defaultDesg,
    joiningDate: new Date().toISOString().split("T")[0],
    employmentType: "Full-time" as const,
    basicSalary: "50000",
    bankName: "Meezan Bank Ltd",
    accountNumber: "",
    jazzCashNo: "",
    status: "Active" as const
  });

  const departmentList = ["All", ...hrDepartments.map((d) => d.name)];

  const filteredEmployees = hrEmployees.filter((emp) => {
    const matchDept = departmentFilter === "All" || emp.department === departmentFilter;
    const q = searchQuery.toLowerCase();
    const matchQuery =
      !q ||
      emp.name.toLowerCase().includes(q) ||
      emp.employeeCode.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.phone.includes(q) ||
      (emp.cnic || "").includes(q);

    return matchDept && matchQuery;
  });

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      cnic: "",
      department: hrDepartments[0]?.name || "Human Resources",
      designation: hrDesignations[0]?.title || "HR Officer",
      joiningDate: new Date().toISOString().split("T")[0],
      employmentType: "Full-time",
      basicSalary: "50000",
      bankName: "Meezan Bank Ltd",
      accountNumber: "",
      jazzCashNo: "",
      status: "Active"
    });
    setShowModal(true);
  };

  const handleOpenEdit = (emp: any) => {
    setEditingEmployee(emp);
    setForm({
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      cnic: emp.cnic || "",
      department: emp.department,
      designation: emp.designation,
      joiningDate: emp.joiningDate || new Date().toISOString().split("T")[0],
      employmentType: emp.employmentType || "Full-time",
      basicSalary: String(emp.basicSalary || 50000),
      bankName: emp.bankName || "Meezan Bank Ltd",
      accountNumber: emp.accountNumber || "",
      jazzCashNo: emp.jazzCashNo || "",
      status: emp.status || "Active"
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) return;

    const bName = currentUser?.businessName || businessSettings?.businessName || "MT Software";
    const autoCode = generateNextEmployeeCode(bName, hrEmployees.length);

    const payload = {
      employeeCode: editingEmployee ? editingEmployee.employeeCode : autoCode,
      name: form.name,
      email: form.email,
      phone: form.phone,
      cnic: form.cnic,
      department: form.department,
      designation: form.designation,
      joiningDate: form.joiningDate,
      employmentType: form.employmentType,
      basicSalary: parseFloat(form.basicSalary) || 0,
      bankName: form.bankName,
      accountNumber: form.accountNumber,
      jazzCashNo: form.jazzCashNo,
      status: form.status
    };

    if (editingEmployee) {
      updateHREmployee(editingEmployee.id, payload);
    } else {
      addHREmployee(payload);
    }

    setShowModal(false);
  };

  return (
    <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans">
      <HRMSSidebar />

      <main className="flex-grow p-6 space-y-6 overflow-y-auto max-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Users size={20} className="text-emerald-400" />
              Employee Directory (EIS)
            </h1>
            <p className="text-xs text-gray-400">
              Manage complete staff profiles, CNIC verification, bank accounts, and employment status.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition"
          >
            <Plus size={14} /> Register New Employee
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, CNIC, employee code, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0b0f17] border border-gray-800 pl-10 pr-4 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 placeholder-gray-600"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {departmentList.map((d) => (
              <button
                key={d}
                onClick={() => setDepartmentFilter(d)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  departmentFilter === d
                    ? "bg-emerald-600 text-white"
                    : "bg-[#0b0f17] border border-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Employees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.length === 0 ? (
            <div className="col-span-full p-12 bg-[#0b0f17] border border-gray-800 rounded-2xl text-center text-gray-500 italic text-xs">
              No employee records found matching your filters.
            </div>
          ) : (
            filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="bg-[#0b0f17] border border-gray-800 hover:border-emerald-500/40 p-5 rounded-2xl space-y-3 transition relative group"
              >
                {/* Employee Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black text-sm uppercase">
                      {emp.name.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{emp.name}</h3>
                      <div className="text-[10px] text-emerald-400 font-mono font-bold">
                        {emp.employeeCode} • <span className="text-gray-400">{emp.designation}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${
                      emp.status === "Active"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    }`}
                  >
                    {emp.status}
                  </span>
                </div>

                {/* Info Fields */}
                <div className="space-y-1.5 text-xs text-gray-400 border-t border-gray-800/80 pt-3">
                  <div className="flex items-center gap-2">
                    <Briefcase size={12} className="text-gray-500 shrink-0" />
                    <span>Dept: <strong className="text-gray-200">{emp.department}</strong> ({emp.employmentType})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-gray-500 shrink-0" />
                    <span className="font-mono">{emp.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-gray-500 shrink-0" />
                    <span className="font-mono text-[11px] truncate">{emp.email}</span>
                  </div>
                  {emp.cnic && (
                    <div className="flex items-center gap-2">
                      <CreditCard size={12} className="text-gray-500 shrink-0" />
                      <span>CNIC: <strong className="text-gray-300 font-mono">{emp.cnic}</strong></span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <DollarSign size={12} className="text-emerald-400 shrink-0" />
                    <span>Basic Salary: <strong className="text-emerald-400 font-mono">{currencySymbol} {emp.basicSalary.toLocaleString()}</strong></span>
                  </div>
                </div>

                {/* Bank / Payout details */}
                <div className="p-2.5 bg-black/40 border border-gray-800/80 rounded-xl text-[10px] text-gray-400 font-mono">
                  <div>Bank: <strong className="text-gray-200">{emp.bankName || "N/A"}</strong></div>
                  <div>Account #: <strong className="text-gray-200">{emp.accountNumber || emp.jazzCashNo || "N/A"}</strong></div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1 justify-end">
                  <button
                    onClick={() => handleOpenEdit(emp)}
                    className="p-1.5 bg-gray-800 hover:bg-emerald-600 text-gray-300 hover:text-white rounded-lg transition"
                    title="Edit Profile"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => deleteHREmployee(emp.id)}
                    className="p-1.5 bg-red-900/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition"
                    title="Delete Record"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal: Add/Edit Employee */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-sans">
            <div className="bg-[#0b0f17] border border-emerald-500/40 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-fade-in-up">
              <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-black/40">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-emerald-400" />
                  <h3 className="font-bold text-white text-base">
                    {editingEmployee ? "Edit Employee Profile" : "Register New Employee"}
                  </h3>
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Waqas Ali"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Corporate Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. waqas@mtcore.xyz"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="03001234567"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">CNIC #</label>
                    <input
                      type="text"
                      placeholder="35202-1234567-1"
                      value={form.cnic}
                      onChange={(e) => setForm({ ...form, cnic: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Department</label>
                    <select
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    >
                      {hrDepartments.map((d) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Designation</label>
                    <select
                      value={form.designation}
                      onChange={(e) => setForm({ ...form, designation: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    >
                      {hrDesignations.map((desg) => (
                        <option key={desg.id} value={desg.title}>{desg.title} ({desg.grade})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Employment Type</label>
                    <select
                      value={form.employmentType}
                      onChange={(e) => setForm({ ...form, employmentType: e.target.value as any })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Daily Wager">Daily Wager</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Basic Salary ({currencySymbol})</label>
                    <input
                      type="number"
                      value={form.basicSalary}
                      onChange={(e) => setForm({ ...form, basicSalary: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-black/40 border border-gray-800 rounded-xl">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Meezan Bank Ltd"
                      value={form.bankName}
                      onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Account / IBAN Number</label>
                    <input
                      type="text"
                      placeholder="01020304050607"
                      value={form.accountNumber}
                      onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-wider rounded-xl transition shadow-lg shadow-emerald-900/30"
                  >
                    {editingEmployee ? "Save Changes" : "Create Employee"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
