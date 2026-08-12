"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import HRMSSidebar from "@/components/hrms-sidebar";
import HRMSTopHeader from "@/components/hrms-top-header";
import { useGlobalContext, calculateDesignationRankAndGrade, isEligibleForDepartmentHead } from "@/context/global-context";
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Building2,
  Phone,
  Mail,
  CreditCard,
  Briefcase,
  X,
  DollarSign,
  ShieldCheck,
  ShieldOff,
  Calendar,
  ChevronDown,
  ChevronUp,
  Crown,
  Check,
  Camera,
  UploadCloud
} from "lucide-react";

export default function HREmployeesPage() {
  const {
    hrEmployees,
    addHREmployee,
    updateHREmployee,
    deleteHREmployee,
    hrDepartments,
    hrDesignations,
    currencySymbol,
    currentUser,
    businessSettings,
    assignDepartmentHead
  } = useGlobalContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [sortField, setSortField] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // ─── ROLE DETECTION ────────────────────────────────────────────────────
  const empMatch = hrEmployees.find(
    (e) => e.email?.toLowerCase().trim() === currentUser?.email?.toLowerCase().trim()
  );

  const isOwner = currentUser?.role === "Owner";

  const isHRUser = Boolean(
    (currentUser?.role as string) === "HR" ||
    currentUser?.email?.toLowerCase().includes("hr@") ||
    empMatch?.department === "Human Resources"
  );

  const isITUser = Boolean(
    (currentUser?.role as string) === "IT" ||
    currentUser?.email?.toLowerCase().includes("it@") ||
    empMatch?.department === "IT & Software Operations"
  );

  // Check if current user is senior (Assistant Manager rank 4 or above)
  const myDesignationRank = empMatch
    ? (hrDesignations.find((d) => d.title.toLowerCase() === empMatch.designation.toLowerCase())?.rank
      ?? calculateDesignationRankAndGrade(empMatch.designation).rank)
    : 99;

  const isSenior = myDesignationRank <= 4; // Director, Asst Director, Manager, Asst Manager

  // ─── PERMISSION FLAGS ──────────────────────────────────────────────────
  // Full cards: ONLY Owner + HR Department (HR Manager, Asst HR Manager, HR Director)
  const canViewFullCards = isOwner || isHRUser;
  const canEditDelete = isOwner || isHRUser;
  const canActivateEmployee = isOwner || isHRUser;
  const canActivateCredentials = isOwner || isITUser;

  // ─── FORM STATE ────────────────────────────────────────────────────────
  const defaultDept = hrDepartments[0]?.name || "Human Resources";
  const defaultDesg = hrDesignations[0]?.title || "HR Officer";

  const [form, setForm] = useState({
    employeeCode: "",
    name: "",
    email: "",
    personalEmail: "",
    tempPassword: "",
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
    status: "Active" as const,
    headedDepartments: [] as string[],
    avatar: ""
  });

  // ─── FILTERING & SORTING ──────────────────────────────────────────────
  const departmentList = ["All", ...hrDepartments.map((d) => d.name)];

  const filteredEmployees = useMemo(() => {
    let result = hrEmployees.filter((emp) => {
      const matchDept = departmentFilter === "All" || emp.department === departmentFilter;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        emp.name.toLowerCase().includes(q) ||
        emp.employeeCode.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        (emp.personalEmail || "").toLowerCase().includes(q) ||
        emp.phone.includes(q) ||
        (emp.cnic || "").includes(q);

      return matchDept && matchQuery;
    });

    // Sort for table view
    result.sort((a, b) => {
      let valA = "", valB = "";
      if (sortField === "name") { valA = a.name; valB = b.name; }
      else if (sortField === "department") { valA = a.department; valB = b.department; }
      else if (sortField === "designation") { valA = a.designation; valB = b.designation; }
      else if (sortField === "joiningDate") { valA = a.joiningDate; valB = b.joiningDate; }
      else if (sortField === "employeeCode") { valA = a.employeeCode; valB = b.employeeCode; }
      else { valA = a.email; valB = b.email; }

      const cmp = valA.localeCompare(valB);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [hrEmployees, departmentFilter, searchQuery, sortField, sortDir]);

  // ─── HANDLERS ──────────────────────────────────────────────────────────
  const handleOpenEdit = (emp: any) => {
    setEditingEmployee(emp);
    setForm({
      employeeCode: emp.employeeCode || "",
      name: emp.name,
      email: emp.email,
      personalEmail: emp.personalEmail || "",
      tempPassword: emp.tempPassword || "",
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
      status: emp.status || "Active",
      headedDepartments: emp.headedDepartments || [],
      avatar: emp.avatar || ""
    });
    setShowModal(true);
  };

  const handleFormAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 350;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

        setForm((prev) => ({ ...prev, avatar: dataUrl }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDirectCardAvatarUpload = (empId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 350;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

        updateHREmployee(empId, { avatar: dataUrl });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) return;

    const isEligible = isEligibleForDepartmentHead(form.designation);
    const validHeadedDepts = isEligible ? form.headedDepartments : [];

    const payload = {
      employeeCode: form.employeeCode.trim() || editingEmployee?.employeeCode || "",
      name: form.name,
      email: form.email,
      personalEmail: form.personalEmail,
      tempPassword: form.tempPassword,
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
      status: form.status,
      headedDepartments: validHeadedDepts,
      avatar: form.avatar || undefined
    };

    if (editingEmployee) {
      updateHREmployee(editingEmployee.id, payload);
      assignDepartmentHead(editingEmployee.id, validHeadedDepts);
    } else {
      addHREmployee(payload);
    }

    setShowModal(false);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? <ChevronUp size={10} /> : <ChevronDown size={10} />;
  };

  // ─── STATS ─────────────────────────────────────────────────────────────
  const activeCount = hrEmployees.filter((e) => e.status === "Active").length;
  const totalCount = hrEmployees.length;

  return (
    <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans">
      <HRMSSidebar />

      <main className="flex-grow overflow-y-auto max-h-screen">
        <HRMSTopHeader title="Employee Directory (EIS)" subtitle="Manage complete staff profiles, CNIC verification, bank accounts, and employment status." />
        <div className="p-6 space-y-6">

          {/* ── Top Action Bar ──────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-[#0b0f17] border border-gray-800 rounded-xl">
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Total Staff</span>
                <span className="text-lg font-black text-white">{totalCount}</span>
              </div>
              <div className="px-4 py-2 bg-[#0b0f17] border border-emerald-500/20 rounded-xl">
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Active</span>
                <span className="text-lg font-black text-emerald-400">{activeCount}</span>
              </div>
              <div className="px-4 py-2 bg-[#0b0f17] border border-amber-500/20 rounded-xl">
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Inactive</span>
                <span className="text-lg font-black text-amber-400">{totalCount - activeCount}</span>
              </div>
            </div>
            {canEditDelete && (
              <Link
                href="/hrms/recruitment"
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition"
              >
                <UserPlus size={15} />
                <span>Recruit &amp; Onboard New Staff</span>
              </Link>
            )}
          </div>

          {/* ── Filters ─────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, employee code, email, phone..."
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

          {/* ── CONTENT: FULL CARDS (Owner/HR/Senior) or TABLE (Others) ── */}
          {canViewFullCards ? (
            /* ═══════════ FULL CARD VIEW ═══════════ */
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
                        <div className="relative group">
                          {emp.avatar ? (
                            <img
                              src={emp.avatar}
                              alt={emp.name}
                              className="w-11 h-11 rounded-xl object-cover border border-emerald-500/40 shadow-sm"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black text-sm uppercase">
                              {emp.name.slice(0, 2)}
                            </div>
                          )}
                          {canEditDelete && (
                            <label
                              className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer backdrop-blur-[1px]"
                              title="Quick upload profile photo"
                            >
                              <Camera size={13} className="text-white" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleDirectCardAvatarUpload(emp.id, e)}
                                className="hidden"
                              />
                            </label>
                          )}
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
                            : emp.status === "On Leave"
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                              : "bg-red-500/10 border-red-500/30 text-red-400"
                        }`}
                      >
                        {emp.status}
                      </span>
                    </div>

                    {/* Info Fields */}
                    <div className="space-y-1.5 text-xs text-gray-400 border-t border-gray-800/80 pt-3">
                      <div className="flex items-center gap-2">
                        <Briefcase size={12} className="text-gray-500 shrink-0" />
                        <span>Dept: <strong className="text-gray-200">{emp.department}</strong> {emp.subDepartment && <span className="text-emerald-400 font-mono">(&rarr; {emp.subDepartment})</span>} ({emp.employmentType})</span>
                      </div>
                      {emp.headedDepartments && emp.headedDepartments.length > 0 && (
                        <div className="py-1 flex flex-wrap gap-1 items-center">
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                            <Crown size={10} />
                            <span>Head of:</span>
                          </span>
                          {emp.headedDepartments.map((hd: string) => (
                            <span key={hd} className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[9px] font-bold">
                              {hd}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-gray-500 shrink-0" />
                        <span>Joined: <strong className="text-gray-200">{emp.joiningDate}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-gray-500 shrink-0" />
                        <span className="font-mono">{emp.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="text-sky-400 shrink-0" />
                        <span>Work Email: <strong className="font-mono text-[11px] text-sky-300">{emp.email}</strong></span>
                      </div>
                      {emp.personalEmail && (
                        <div className="flex items-center gap-2">
                          <Mail size={12} className="text-gray-500 shrink-0" />
                          <span>Personal: <strong className="font-mono text-[11px] text-gray-300">{emp.personalEmail}</strong></span>
                        </div>
                      )}
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

                    {/* Actions — permission gated */}
                    <div className="flex gap-2 pt-1 items-center justify-between">
                      <div className="flex gap-1.5">
                        {/* Employee Activate/Deactivate — HR/Owner only */}
                        {canActivateEmployee && (
                          <button
                            onClick={() => {
                              const nextStatus = emp.status === "Active" ? "Terminated" : "Active";
                              updateHREmployee(emp.id, { status: nextStatus });
                            }}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition flex items-center gap-1 ${
                              emp.status === "Active"
                                ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                            }`}
                          >
                            {emp.status === "Active" ? <><ShieldOff size={10} /> Deactivate</> : <><ShieldCheck size={10} /> Activate</>}
                          </button>
                        )}

                        {/* Credentials Activate/Deactivate — IT/Owner only (NOT HR) */}
                        {canActivateCredentials && !canActivateEmployee && (
                          <button
                            onClick={() => {
                              const nextStatus = emp.status === "Active" ? "Terminated" : "Active";
                              updateHREmployee(emp.id, { status: nextStatus });
                            }}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition flex items-center gap-1 ${
                              emp.status === "Active"
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                                : "bg-sky-500/10 border-sky-500/30 text-sky-400 hover:bg-sky-500/20"
                            }`}
                          >
                            {emp.status === "Active" ? <><ShieldOff size={10} /> Disable Login</> : <><ShieldCheck size={10} /> Enable Login</>}
                          </button>
                        )}
                      </div>

                      {/* Edit / Delete — HR/Owner only */}
                      {canEditDelete && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenEdit(emp)}
                            className="p-1.5 bg-gray-800 hover:bg-emerald-600 text-gray-300 hover:text-white rounded-lg transition"
                            title="Edit Employee Profile"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to permanently delete ${emp.name}'s record?`)) {
                                deleteHREmployee(emp.id);
                              }
                            }}
                            className="p-1.5 bg-red-900/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition"
                            title="Delete Record"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* ═══════════ SIMPLE TABLE VIEW (Regular Employees) ═══════════ */
            <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-800 bg-black/40">
                      {[
                        { key: "employeeCode", label: "Employee ID" },
                        { key: "name", label: "Name" },
                        { key: "department", label: "Department" },
                        { key: "designation", label: "Designation" },
                        { key: "joiningDate", label: "Date of Joining" },
                        { key: "email", label: "Company Email" }
                      ].map((col) => (
                        <th
                          key={col.key}
                          onClick={() => handleSort(col.key)}
                          className="px-4 py-3 text-left text-[10px] uppercase font-bold text-gray-400 cursor-pointer hover:text-emerald-400 transition select-none"
                        >
                          <span className="flex items-center gap-1">
                            {col.label}
                            <SortIcon field={col.key} />
                          </span>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-left text-[10px] uppercase font-bold text-gray-400">Status</th>
                      {/* IT users get a credentials toggle column */}
                      {canActivateCredentials && (
                        <th className="px-4 py-3 text-left text-[10px] uppercase font-bold text-gray-400">Credentials</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={canActivateCredentials ? 8 : 7} className="p-12 text-center text-gray-500 italic">
                          No employee records found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((emp, idx) => (
                        <tr
                          key={emp.id}
                          className={`border-b border-gray-800/50 transition hover:bg-emerald-500/5 ${
                            emp.email?.toLowerCase() === currentUser?.email?.toLowerCase() ? "bg-emerald-500/10 border-l-2 border-l-emerald-500" : ""
                          }`}
                        >
                          <td className="px-4 py-3 font-mono font-bold text-emerald-400">{emp.employeeCode}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {emp.avatar ? (
                                <img
                                  src={emp.avatar}
                                  alt={emp.name}
                                  className="w-7 h-7 rounded-lg object-cover border border-emerald-500/30 shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-[10px] uppercase shrink-0">
                                  {emp.name.slice(0, 2)}
                                </div>
                              )}
                              <span className="font-bold text-white">{emp.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-300">{emp.department}</td>
                          <td className="px-4 py-3 text-gray-300">{emp.designation}</td>
                          <td className="px-4 py-3 text-gray-400 font-mono">{emp.joiningDate}</td>
                          <td className="px-4 py-3">
                            <span className="text-sky-300 font-mono text-[11px]">{emp.email}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${
                                emp.status === "Active"
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                  : emp.status === "On Leave"
                                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                    : "bg-red-500/10 border-red-500/30 text-red-400"
                              }`}
                            >
                              {emp.status}
                            </span>
                          </td>
                          {canActivateCredentials && (
                            <td className="px-4 py-3">
                              <button
                                onClick={() => {
                                  const nextStatus = emp.status === "Active" ? "Terminated" : "Active";
                                  updateHREmployee(emp.id, { status: nextStatus });
                                }}
                                className={`px-2 py-1 text-[9px] font-bold rounded-lg border transition flex items-center gap-1 ${
                                  emp.status === "Active"
                                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                                    : "bg-sky-500/10 border-sky-500/30 text-sky-400 hover:bg-sky-500/20"
                                }`}
                              >
                                {emp.status === "Active" ? <><ShieldOff size={9} /> Disable</> : <><ShieldCheck size={9} /> Enable</>}
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Modal: Edit Employee (HR/Owner only) ────────────────────── */}
          {showModal && canEditDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-sans">
              <div className="bg-[#0b0f17] border border-emerald-500/40 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto">
                <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-black/40 sticky top-0 z-10">
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
                  {/* Profile Picture Upload Section */}
                  <div className="p-3.5 bg-black/60 border border-gray-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="relative group">
                        {form.avatar ? (
                          <img
                            src={form.avatar}
                            alt="Preview"
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border-2 border-dashed border-emerald-500/30 text-emerald-400 flex flex-col items-center justify-center">
                            <Camera size={18} />
                            <span className="text-[8px] font-bold uppercase mt-0.5">No Photo</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xs">Employee Profile Photo</h4>
                        <p className="text-[10px] text-gray-400">Synced across Org Chart, My Team &amp; Directory.</p>
                        <span className="inline-block mt-0.5 text-[8px] font-mono text-emerald-400 font-bold uppercase bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                          HR &amp; Owner Managed
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md">
                        <UploadCloud size={13} />
                        <span>{form.avatar ? "Change Photo" : "Upload Photo"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFormAvatarUpload}
                          className="hidden"
                        />
                      </label>
                      {form.avatar && (
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, avatar: "" }))}
                          className="px-3 py-2 bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 font-bold text-xs rounded-xl transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Name & Email */}
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
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Company Work Email *</label>
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

                  {/* Phone & CNIC */}
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

                  {/* Personal Email & Employee Code */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Personal Email</label>
                      <input
                        type="email"
                        placeholder="personal@gmail.com"
                        value={form.personalEmail}
                        onChange={(e) => setForm({ ...form, personalEmail: e.target.value })}
                        className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-gray-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Employee Code</label>
                      <input
                        type="text"
                        placeholder="Auto-generated"
                        value={form.employeeCode}
                        onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
                        className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Department & Designation */}
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
                        onChange={(e) => {
                          const newDesg = e.target.value;
                          const eligible = isEligibleForDepartmentHead(newDesg);
                          setForm({ 
                            ...form, 
                            designation: newDesg,
                            headedDepartments: eligible ? form.headedDepartments : []
                          });
                        }}
                        className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                      >
                        {hrDesignations.map((desg) => (
                          <option key={desg.id} value={desg.title}>{desg.title} ({desg.grade})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* ─── EXECUTIVE LEADERSHIP: MULTI-DEPARTMENT HEAD ASSIGNMENT ─── */}
                  {isEligibleForDepartmentHead(form.designation) ? (
                    <div className="p-3.5 bg-gradient-to-r from-amber-950/20 via-purple-950/20 to-emerald-950/20 border border-amber-500/30 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Crown size={14} className="text-amber-400" />
                          <span className="text-xs font-black text-white">Executive Head of Department(s) Assignment</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          Director / Manager Rank
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-300 leading-relaxed">
                        This leader qualifies to head <b>one or multiple departments simultaneously</b>. Check all departments this person will lead:
                      </p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                        {hrDepartments.map((dept) => {
                          const isChecked = form.headedDepartments.includes(dept.name);
                          return (
                            <button
                              key={dept.id}
                              type="button"
                              onClick={() => {
                                setForm((prev) => {
                                  const exists = prev.headedDepartments.includes(dept.name);
                                  const updated = exists
                                    ? prev.headedDepartments.filter((d) => d !== dept.name)
                                    : [...prev.headedDepartments, dept.name];
                                  return { ...prev, headedDepartments: updated };
                                });
                              }}
                              className={`flex items-center justify-between p-2 rounded-lg text-[10px] font-bold border transition text-left ${
                                isChecked
                                  ? "bg-amber-500/20 border-amber-500 text-amber-200 shadow-md shadow-amber-500/10"
                                  : "bg-black/60 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white"
                              }`}
                            >
                              <span className="truncate pr-1">{dept.name}</span>
                              <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${
                                isChecked ? "bg-amber-500 border-amber-400 text-black" : "border-gray-700 bg-black/40"
                              }`}>
                                {isChecked && <Check size={10} className="stroke-[3]" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {form.headedDepartments.length > 1 && (
                        <div className="mt-2 text-[10px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                          <span>👑 <b>Multi-Department Head:</b> Leading {form.headedDepartments.length} Departments simultaneously.</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-2.5 bg-black/30 border border-gray-800/80 rounded-xl text-[10px] text-gray-500 flex items-center gap-2">
                      <span className="font-mono text-gray-400">ℹ️</span>
                      <span>Department Head assignment is reserved strictly for <b>Director</b> and <b>Manager</b> level leadership.</span>
                    </div>
                  )}

                  {/* Employment Type, Salary, Status */}
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

                  {/* Bank Info */}
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

                  {/* Actions */}
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
        </div>
      </main>
    </div>
  );
}
