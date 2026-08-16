"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSMS, SMSRole, SMSUserAccount } from "@/context/sms-context";
import {
  Users,
  UserPlus,
  Key,
  Shield,
  Search,
  Filter,
  Eye,
  EyeOff,
  Copy,
  Check,
  Edit2,
  Trash2,
  Sparkles,
  Lock,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  DollarSign,
  UserCheck,
  AlertCircle,
  X,
  Plus,
  CheckSquare,
  Square,
  AlertTriangle
} from "lucide-react";

export default function SMSUsersManagementPage() {
  const {
    theme,
    users,
    students,
    teachers,
    addUserAccount,
    updateUserAccount,
    deleteUserAccount,
    generateStudentCredentialsBatch,
    generateTeacherCredentialsBatch,
    activeRole,
    setActiveRole
  } = useSMS();

  const isLight = theme === "light";

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [toastMsg, setToastMsg] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SMSUserAccount | null>(null);
  const [form, setForm] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    role: "Parent" as SMSRole,
    linkedEntityId: "",
    linkedEntityName: "",
    linkedStudentIds: [] as string[],
    phone: "",
    status: "Active" as "Active" | "Suspended" | "Pending"
  });

  // Student Search in Modal for Parent Linking
  const [studentSearch, setStudentSearch] = useState("");

  const roleColors: Record<SMSRole, { bg: string; text: string; border: string; label: string }> = {
    Owner: {
      bg: isLight ? "bg-amber-50" : "bg-amber-500/10",
      text: isLight ? "text-amber-800" : "text-amber-400",
      border: isLight ? "border-amber-300" : "border-amber-500/30",
      label: "👑 Owner / Director"
    },
    Principal: {
      bg: isLight ? "bg-sky-50" : "bg-sky-500/10",
      text: isLight ? "text-sky-800" : "text-sky-400",
      border: isLight ? "border-sky-300" : "border-sky-500/30",
      label: "👔 Principal / Head"
    },
    Teacher: {
      bg: isLight ? "bg-emerald-50" : "bg-emerald-500/10",
      text: isLight ? "text-emerald-800" : "text-emerald-400",
      border: isLight ? "border-emerald-300" : "border-emerald-500/30",
      label: "👩‍🏫 Teacher / Faculty"
    },
    Student: {
      bg: isLight ? "bg-purple-50" : "bg-purple-500/10",
      text: isLight ? "text-purple-800" : "text-purple-400",
      border: isLight ? "border-purple-300" : "border-purple-500/30",
      label: "🎒 Student"
    },
    Parent: {
      bg: isLight ? "bg-pink-50" : "bg-pink-500/10",
      text: isLight ? "text-pink-800" : "text-pink-400",
      border: isLight ? "border-pink-300" : "border-pink-500/30",
      label: "👨‍👩‍👧 Parent / Guardian"
    },
    Finance: {
      bg: isLight ? "bg-teal-50" : "bg-teal-500/10",
      text: isLight ? "text-teal-800" : "text-teal-400",
      border: isLight ? "border-teal-300" : "border-teal-500/30",
      label: "💳 Finance & Cashier"
    },
    HR: {
      bg: isLight ? "bg-indigo-50" : "bg-indigo-500/10",
      text: isLight ? "text-indigo-800" : "text-indigo-400",
      border: isLight ? "border-indigo-300" : "border-indigo-500/30",
      label: "👥 School HR Officer"
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.linkedEntityName && u.linkedEntityName.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const togglePassword = (id: string) => {
    setRevealedPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyCredentials = (u: SMSUserAccount) => {
    const text = `MT Core School ERP Credentials\nTenant Workspace: CAMP-01 (Gulberg Heights)\nUsername: ${u.username}\nEmail: ${u.email}\nPassword: ${u.password}\nRole: ${u.role}\nPortal URL: ${typeof window !== "undefined" ? window.location.origin : ""}/sms`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedId(u.id);
    setToastMsg(`✅ Credentials for ${u.fullName} copied to clipboard!`);
    setTimeout(() => {
      setCopiedId(null);
      setToastMsg("");
    }, 3000);
  };

  // Username Uniqueness Check
  const trimmedUsername = form.username.trim().toLowerCase();
  const isDuplicateUsername = users.some(
    (u) => u.username.toLowerCase() === trimmedUsername && u.id !== editingUser?.id
  );

  const handleOpenAdd = () => {
    setEditingUser(null);
    setStudentSearch("");
    setForm({
      username: "",
      fullName: "",
      email: "",
      password: `Pass@${Math.floor(1000 + Math.random() * 9000)}`,
      role: "Parent",
      linkedEntityId: "",
      linkedEntityName: "",
      linkedStudentIds: [],
      phone: "",
      status: "Active"
    });
    setShowModal(true);
  };

  const handleOpenEdit = (u: SMSUserAccount) => {
    setEditingUser(u);
    setStudentSearch("");
    setForm({
      username: u.username,
      fullName: u.fullName,
      email: u.email,
      password: u.password,
      role: u.role,
      linkedEntityId: u.linkedEntityId || "",
      linkedEntityName: u.linkedEntityName || "",
      linkedStudentIds: u.linkedStudentIds || (u.linkedEntityId ? [u.linkedEntityId] : []),
      phone: u.phone || "",
      status: u.status
    });
    setShowModal(true);
  };

  const toggleStudentLink = (studentId: string) => {
    setForm((prev) => {
      const exists = prev.linkedStudentIds.includes(studentId);
      const updated = exists
        ? prev.linkedStudentIds.filter((id) => id !== studentId)
        : [...prev.linkedStudentIds, studentId];
      return { ...prev, linkedStudentIds: updated };
    });
  };

  const handleRoleChangeInModal = (newRole: SMSRole) => {
    setForm((prev) => {
      let linkedName = "";
      let linkedId = "";
      if (newRole === "Teacher") {
        const firstTeacher = teachers[0];
        if (firstTeacher) {
          linkedId = firstTeacher.id;
          linkedName = `${firstTeacher.fullName} (${firstTeacher.department})`;
        }
      } else if (newRole === "Student") {
        const firstStudent = students[0];
        if (firstStudent) {
          linkedId = firstStudent.id;
          linkedName = `${firstStudent.firstName} ${firstStudent.lastName} (${firstStudent.admissionNo})`;
        }
      }
      return {
        ...prev,
        role: newRole,
        linkedEntityId: linkedId,
        linkedEntityName: linkedName,
        linkedStudentIds: newRole === "Parent" ? prev.linkedStudentIds : []
      };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.fullName || !form.email) return;

    if (isDuplicateUsername) {
      alert(`Error: Username "${form.username}" already exists in this tenant. Please enter a unique username.`);
      return;
    }

    // Mandatory student check for Parent role
    if (form.role === "Parent" && form.linkedStudentIds.length === 0) {
      alert("Validation Error: Parent user must be linked to at least one student child by Admission ID.");
      return;
    }

    // Compute linked summary
    let linkedName = form.linkedEntityName;
    if (form.role === "Parent" && form.linkedStudentIds.length > 0) {
      const names = form.linkedStudentIds
        .map((id) => {
          const st = students.find((s) => s.id === id);
          return st ? `${st.firstName} (${st.admissionNo})` : id;
        })
        .join(", ");
      linkedName = names;
    }

    const payload = {
      ...form,
      linkedEntityName: linkedName,
      linkedEntityId: form.linkedStudentIds[0] || form.linkedEntityId
    };

    if (editingUser) {
      updateUserAccount(editingUser.id, payload);
      setToastMsg(`✅ User credentials for ${form.fullName} updated!`);
    } else {
      addUserAccount(payload);
      setToastMsg(`✅ New user account created for ${form.fullName}!`);
    }
    setShowModal(false);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleDelete = (u: SMSUserAccount) => {
    if (confirm(`Are you sure you want to delete login access for ${u.fullName} (${u.role})?`)) {
      deleteUserAccount(u.id);
      setToastMsg(`🗑️ Login credentials for ${u.fullName} deleted.`);
      setTimeout(() => setToastMsg(""), 3500);
    }
  };

  const handleBatchStudentGen = () => {
    const count = generateStudentCredentialsBatch();
    setToastMsg(`⚡ Generated ${count} student & parent login credentials from registered admissions!`);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleBatchTeacherGen = () => {
    const count = generateTeacherCredentialsBatch();
    setToastMsg(`⚡ Generated ${count} faculty login accounts from teacher records!`);
    setTimeout(() => setToastMsg(""), 4000);
  };

  // Filter students for linking modal
  const searchableStudents = students.filter(
    (st) =>
      st.firstName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      st.lastName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      st.admissionNo.toLowerCase().includes(studentSearch.toLowerCase()) ||
      st.fatherName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      st.className.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      {/* Toast */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 ${isLight ? "bg-slate-900 text-white" : "bg-[#0b121e] text-white"} border-2 border-emerald-500 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-up font-bold text-xs`}>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${isLight ? "border-slate-200" : "border-gray-800"} pb-5`}>
        <div>
          <h1 className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-2`}>
            <Shield className={isLight ? "text-sky-600" : "text-sky-400"} size={24} />
            <span>SMS User Credential &amp; Role-Based Access Control (RBAC)</span>
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Create tenant credentials for Students, Teachers, Parents (with Multi-Child linking), Accountants, HR &amp; Principals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleBatchStudentGen}
            className={`flex items-center gap-1.5 px-3 py-2 ${
              isLight ? "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-300" : "bg-purple-500/10 hover:bg-purple-500 text-purple-300 hover:text-white border-purple-500/30"
            } border rounded-xl text-xs font-bold transition shadow-sm cursor-pointer`}
            title="Auto-generate Student & Parent accounts from admitted students"
          >
            <Sparkles size={13} />
            <span>Auto Student/Parent Users</span>
          </button>

          <button
            onClick={handleBatchTeacherGen}
            className={`flex items-center gap-1.5 px-3 py-2 ${
              isLight ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300" : "bg-emerald-500/10 hover:bg-emerald-500 text-emerald-300 hover:text-white border-emerald-500/30"
            } border rounded-xl text-xs font-bold transition shadow-sm cursor-pointer`}
            title="Auto-generate faculty accounts from teachers directory"
          >
            <Sparkles size={13} />
            <span>Auto Faculty Users</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black shadow-lg shadow-sky-600/30 transition cursor-pointer"
          >
            <UserPlus size={14} />
            <span>Create Custom User</span>
          </button>
        </div>
      </div>

      {/* Role Counts Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {(["Owner", "Principal", "Teacher", "Student", "Parent", "Finance", "HR"] as SMSRole[]).map((r) => {
          const count = users.filter((u) => u.role === r).length;
          const cfg = roleColors[r];
          return (
            <div
              key={r}
              onClick={() => setRoleFilter(roleFilter === r ? "All" : r)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition transform hover:scale-105 ${
                roleFilter === r
                  ? `ring-2 ring-sky-500 ${cfg.bg} ${cfg.border}`
                  : isLight
                  ? "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                  : "bg-[#0b121e] border-gray-800"
              }`}
            >
              <div className={`text-[10px] font-bold ${isLight ? "text-slate-500" : "text-gray-400"} uppercase`}>{r}</div>
              <div className={`text-xl font-black ${isLight ? "text-slate-900" : "text-white"} mt-1`}>{count}</div>
              <div className={`text-[9px] ${isLight ? "text-slate-500" : "text-gray-500"} mt-0.5`}>{cfg.label.split(" ")[0]} Portals</div>
            </div>
          );
        })}
      </div>

      {/* Search & Filter Toolbar */}
      <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 ${
        isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"
      } border p-4 rounded-2xl`}>
        <div className="relative w-full sm:w-80">
          <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? "text-slate-400" : "text-gray-500"}`} />
          <input
            type="text"
            placeholder="Search by name, username, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full ${
              isLight
                ? "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-sky-500"
                : "bg-black border-gray-800 text-white placeholder-gray-500 focus:border-sky-500"
            } border pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none`}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className={isLight ? "text-slate-400" : "text-gray-400"} />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={`${
              isLight
                ? "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-sky-500"
                : "bg-black border-gray-800 text-white focus:border-sky-500"
            } border p-2 rounded-xl text-xs font-bold focus:outline-none`}
          >
            <option value="All">All Roles ({users.length})</option>
            <option value="Owner">👑 Owner / Director</option>
            <option value="Principal">👔 Principal / Head</option>
            <option value="Teacher">👩‍🏫 Teacher / Faculty</option>
            <option value="Student">🎒 Student</option>
            <option value="Parent">👨‍👩‍👧 Parent (Linked Children)</option>
            <option value="Finance">💳 Finance &amp; Accountant</option>
            <option value="HR">👥 School HR</option>
          </select>
        </div>
      </div>

      {/* Users Credential Roster Table */}
      <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl overflow-hidden shadow-2xl`}>
        <div className={`p-4 border-b ${isLight ? "border-slate-100 bg-slate-50/80" : "border-gray-800 bg-black/40"} flex justify-between items-center`}>
          <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-xs uppercase tracking-wider`}>
            Tenant Users &amp; Login Matrix ({filteredUsers.length} Users)
          </h3>
          <span className={`text-[10px] ${isLight ? "text-slate-500 font-semibold" : "text-gray-500"} font-mono`}>
            Unique Usernames &bull; Multi-Child Linked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b ${isLight ? "border-slate-200 text-slate-600 bg-slate-100/70" : "border-gray-800 text-gray-400 bg-black/20"} font-mono text-[10px]`}>
                <th className="p-4 font-bold">User / Legal Name</th>
                <th className="p-4 font-bold">Assigned Role</th>
                <th className="p-4 font-bold">Tenant Login (Username / Email)</th>
                <th className="p-4 font-bold">Password &amp; Credentials</th>
                <th className="p-4 font-bold">Linked Student(s) / Profile</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? "divide-slate-100" : "divide-gray-800/50"} text-xs`}>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`p-12 text-center text-xs ${isLight ? "text-slate-400" : "text-gray-500"}`}>
                    <Shield size={32} className="mx-auto mb-2 opacity-40 text-sky-500" />
                    <p className="font-bold">No User Accounts Created Yet</p>
                    <p className="text-[11px] mt-1">Click "Create Custom User" or "Auto Faculty Users" to provision login credentials.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const cfg = roleColors[u.role] || roleColors.Teacher;
                  const isRevealed = !!revealedPasswords[u.id];

                  // Resolve linked children for parent
                  const linkedChildren = (u.linkedStudentIds || (u.linkedEntityId ? [u.linkedEntityId] : []))
                    .map((stId) => students.find((s) => s.id === stId))
                    .filter(Boolean);

                  return (
                    <tr key={u.id} className={`${isLight ? "hover:bg-slate-50/80" : "hover:bg-white/[0.02]"} transition`}>
                      {/* User info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl ${
                            isLight
                              ? "bg-slate-100 text-slate-800 border border-slate-300"
                              : "bg-gradient-to-tr from-gray-800 to-gray-700 text-white"
                          } flex items-center justify-center font-black text-sm shadow`}>
                            {u.fullName[0]}
                          </div>
                          <div>
                            <div className={`font-bold ${isLight ? "text-slate-900" : "text-white"} text-sm`}>{u.fullName}</div>
                            <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-500"} font-mono`}>ID: {u.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          {cfg.label}
                        </span>
                      </td>

                      {/* Username / Email */}
                      <td className="p-4 font-mono">
                        <div className={`${isLight ? "text-slate-900" : "text-white"} font-bold flex items-center gap-1.5`}>
                          <span className={isLight ? "text-sky-700 font-bold" : "text-sky-400 font-bold"}>@{u.username}</span>
                        </div>
                        <div className={`text-[10px] ${isLight ? "text-slate-500 font-medium" : "text-gray-400"}`}>{u.email}</div>
                      </td>

                      {/* Password & Copy */}
                      <td className="p-4 font-mono">
                        <div className="flex items-center gap-2">
                          <span className={`${
                            isLight
                              ? "bg-slate-100 border border-slate-300 text-emerald-800"
                              : "bg-black/60 border border-gray-800 text-emerald-400"
                          } px-2.5 py-1 rounded font-bold text-xs`}>
                            {isRevealed ? u.password : "••••••••"}
                          </span>
                          <button
                            onClick={() => togglePassword(u.id)}
                            className={`p-1 ${isLight ? "text-slate-400 hover:text-slate-800" : "text-gray-400 hover:text-white"} transition cursor-pointer`}
                            title={isRevealed ? "Hide Password" : "Show Password"}
                          >
                            {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                          <button
                            onClick={() => copyCredentials(u)}
                            className={`p-1 ${isLight ? "text-sky-600 hover:text-sky-800" : "text-sky-400 hover:text-sky-300"} transition cursor-pointer`}
                            title="Copy Full Login Credentials"
                          >
                            {copiedId === u.id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </td>

                      {/* Linked Profile / Students */}
                      <td className="p-4">
                        {u.role === "Parent" && linkedChildren.length > 0 ? (
                          <div className="space-y-1">
                            {linkedChildren.map((st) => (
                              <div key={st!.id} className={`inline-flex items-center gap-1 ${
                                isLight ? "bg-pink-50 border-pink-200 text-pink-800" : "bg-pink-500/10 border-pink-500/20 text-pink-300"
                              } border px-2 py-0.5 rounded text-[10px] font-mono mr-1 mb-1`}>
                                <span>🎒 {st!.firstName} {st!.lastName}</span>
                                <span className={`${isLight ? "text-pink-600" : "text-pink-400"} font-bold`}>({st!.admissionNo})</span>
                              </div>
                            ))}
                          </div>
                        ) : u.linkedEntityName ? (
                          <span className={`text-[10px] ${
                            isLight ? "bg-slate-100 text-slate-700 border border-slate-200" : "bg-gray-800 text-gray-300"
                          } px-2 py-0.5 rounded font-mono`}>
                            🔗 {u.linkedEntityName}
                          </span>
                        ) : (
                          <span className={`text-[10px] ${isLight ? "text-slate-400" : "text-gray-600"}`}>Direct Staff Account</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.status === "Active"
                              ? isLight
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : isLight
                              ? "bg-red-50 text-red-700 border border-red-300"
                              : "bg-red-500/10 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setActiveRole(u.role);
                              setToastMsg(`🔄 Switched active view to ${u.role} portal!`);
                              setTimeout(() => setToastMsg(""), 3000);
                            }}
                            className={`px-2 py-1 ${
                              isLight
                                ? "bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white border border-sky-200"
                                : "bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-black"
                            } rounded text-[10px] font-bold transition cursor-pointer`}
                            title="Test Login as this user"
                          >
                            Login View
                          </button>
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className={`p-1.5 ${
                              isLight ? "hover:bg-slate-100 text-slate-500 hover:text-slate-900" : "hover:bg-gray-800 text-gray-400 hover:text-white"
                            } rounded transition cursor-pointer`}
                            title="Edit User"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            className={`p-1.5 ${
                              isLight ? "hover:bg-red-50 text-slate-400 hover:text-red-600" : "hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                            } rounded transition cursor-pointer`}
                            title="Delete User"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* CREATE / EDIT USER MODAL WITH PARENT MULTI-STUDENT LINKING                    */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-sky-500/40 text-white"
          } border rounded-3xl w-full max-w-xl shadow-2xl p-6 my-8 animate-fade-in-up`}>
            <div className={`flex justify-between items-center border-b ${isLight ? "border-slate-100" : "border-gray-800"} pb-3 mb-4`}>
              <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm flex items-center gap-2`}>
                <Key className={isLight ? "text-sky-600" : "text-sky-400"} size={16} />
                <span>{editingUser ? "Edit User Credentials & Access" : "Create New User Account"}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className={`${isLight ? "text-slate-400 hover:text-slate-800" : "text-gray-400 hover:text-white"} cursor-pointer`}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Assigned Role *</label>
                  <select
                    value={form.role}
                    onChange={(e) => handleRoleChangeInModal(e.target.value as SMSRole)}
                    className={`w-full ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                    } border p-2.5 rounded-xl font-bold focus:border-sky-500 focus:outline-none`}
                  >
                    <option value="Parent">👨‍👩‍👧 Parent / Guardian</option>
                    <option value="Student">🎒 Student</option>
                    <option value="Teacher">👩‍🏫 Teacher / Faculty</option>
                    <option value="Finance">💳 Finance &amp; Accountant</option>
                    <option value="HR">👥 School HR</option>
                    <option value="Principal">👔 Principal / Head</option>
                    <option value="Owner">👑 Owner / Director</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Account Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className={`w-full ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                    } border p-2.5 rounded-xl font-bold focus:outline-none`}
                  >
                    <option value="Active">Active (Can Login)</option>
                    <option value="Suspended">Suspended (Blocked)</option>
                  </select>
                </div>
              </div>

              {/* ───────────────────────────────────────────────────────────── */}
              {/* PARENT SPECIFIC: MULTI-CHILD LINKING VIA ADMISSION ID        */}
              {/* ───────────────────────────────────────────────────────────── */}
              {form.role === "Parent" && (
                <div className={`p-4 ${isLight ? "bg-pink-50/60 border-pink-200" : "bg-black/60 border-pink-500/30"} border rounded-2xl space-y-3 animate-fade-in-up`}>
                  <div className="flex justify-between items-center">
                    <label className={`text-[11px] uppercase font-bold ${isLight ? "text-pink-800" : "text-pink-400"} flex items-center gap-1.5`}>
                      <Users size={14} />
                      <span>Link Student Children by Admission ID / Name *</span>
                    </label>
                    <span className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                      {form.linkedStudentIds.length} Children Linked
                    </span>
                  </div>

                  {/* Selected Children Badges */}
                  {form.linkedStudentIds.length > 0 && (
                    <div className={`flex flex-wrap gap-1.5 p-2 ${isLight ? "bg-white border-pink-200" : "bg-pink-500/10 border-pink-500/20"} border rounded-xl`}>
                      {form.linkedStudentIds.map((stId) => {
                        const st = students.find((s) => s.id === stId);
                        return (
                          <span
                            key={stId}
                            className="inline-flex items-center gap-1.5 bg-pink-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow"
                          >
                            <span>{st ? `${st.firstName} ${st.lastName}` : stId}</span>
                            <span className="font-mono text-[10px] opacity-80">({st?.admissionNo})</span>
                            <button
                              type="button"
                              onClick={() => toggleStudentLink(stId)}
                              className="hover:text-black transition cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Searchable Student Dropdown Picker */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? "text-slate-400" : "text-gray-500"}`} />
                      <input
                        type="text"
                        placeholder="Search student by Name, Admission ID (e.g. ADM-2026-0041) or Class..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className={`w-full ${
                          isLight ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400" : "bg-[#0b121e] border-gray-800 text-white"
                        } border pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:border-pink-500`}
                      />
                    </div>

                    <div className={`max-h-40 overflow-y-auto space-y-1 ${
                      isLight ? "bg-white border-slate-200" : "bg-[#0b121e] border-gray-800"
                    } border p-2 rounded-xl custom-scrollbar`}>
                      {searchableStudents.length === 0 ? (
                        <div className={`text-[11px] ${isLight ? "text-slate-400" : "text-gray-500"} text-center py-2`}>No students found matching query</div>
                      ) : (
                        searchableStudents.map((st) => {
                          const isSelected = form.linkedStudentIds.includes(st.id);
                          return (
                            <div
                              key={st.id}
                              onClick={() => toggleStudentLink(st.id)}
                              className={`p-2 rounded-lg flex items-center justify-between cursor-pointer transition text-xs ${
                                isSelected
                                  ? isLight
                                    ? "bg-pink-100/70 text-pink-900 border border-pink-300"
                                    : "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                                  : isLight
                                  ? "hover:bg-slate-50 text-slate-700"
                                  : "hover:bg-white/5 text-gray-300"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isSelected ? (
                                  <CheckSquare size={14} className={isLight ? "text-pink-600" : "text-pink-400"} />
                                ) : (
                                  <Square size={14} className={isLight ? "text-slate-400" : "text-gray-500"} />
                                )}
                                <div>
                                  <div className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                                    {st.firstName} {st.lastName}
                                  </div>
                                  <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                                    Father: {st.fatherName} &bull; {st.className} ({st.sectionName})
                                  </div>
                                </div>
                              </div>
                              <span className={`font-mono font-bold text-[10px] ${
                                isLight ? "bg-sky-50 text-sky-700 border border-sky-200" : "bg-black/60 text-sky-400"
                              } px-2 py-0.5 rounded`}>
                                {st.admissionNo}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Mahmood / Sir Shahid Mehmood"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className={`w-full ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                  } border p-2.5 rounded-xl font-bold focus:border-sky-500 focus:outline-none`}
                />
              </div>

              {/* Username with Uniqueness Validation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className={`text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"}`}>Login Username *</label>
                    <span className={`text-[9px] ${isLight ? "text-slate-400" : "text-gray-500"}`}>Unique per Tenant</span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. parent.tariq"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className={`w-full ${
                      isLight ? "bg-slate-50 text-slate-900 focus:bg-white" : "bg-black text-white"
                    } border p-2.5 rounded-xl font-mono transition focus:outline-none ${
                      isDuplicateUsername
                        ? "border-red-500 text-red-500 focus:border-red-400"
                        : isLight
                        ? "border-slate-200 focus:border-sky-500"
                        : "border-gray-800 focus:border-sky-500"
                    }`}
                  />
                  {isDuplicateUsername && (
                    <div className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1">
                      <AlertTriangle size={11} />
                      <span>Username already exists in this tenant!</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Login Password *</label>
                  <input
                    type="text"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={`w-full ${
                      isLight ? "bg-slate-50 border-slate-200 text-emerald-700 focus:bg-white" : "bg-black border-gray-800 text-emerald-400"
                    } border p-2.5 rounded-xl font-mono font-bold focus:border-sky-500 focus:outline-none`}
                  />
                </div>
              </div>

              {/* Corporate / Personal Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="user@mtcore.edu.pk"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`w-full ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                    } border p-2.5 rounded-xl focus:border-sky-500 focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Phone Number</label>
                  <input
                    type="text"
                    placeholder="0300-1234567"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={`w-full ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                    } border p-2.5 rounded-xl focus:border-sky-500 focus:outline-none`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isDuplicateUsername}
                className={`w-full py-3 text-white font-black uppercase rounded-xl transition text-xs shadow-lg cursor-pointer ${
                  isDuplicateUsername
                    ? "bg-gray-400 cursor-not-allowed opacity-50"
                    : "bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500"
                }`}
              >
                Save User Credentials
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
