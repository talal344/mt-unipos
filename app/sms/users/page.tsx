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
  Printer,
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
    Owner: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", label: "👑 Owner / Director" },
    Principal: { bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/30", label: "👔 Principal / Head" },
    Teacher: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", label: "👩‍🏫 Teacher / Faculty" },
    Student: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30", label: "🎒 Student" },
    Parent: { bg: "bg-pink-500/10", text: "text-pink-400", border: "border-pink-500/30", label: "👨‍👩‍👧 Parent / Guardian" },
    Finance: { bg: "bg-teal-500/10", text: "text-teal-400", border: "border-teal-500/30", label: "💳 Finance & Cashier" },
    HR: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/30", label: "👥 School HR Officer" }
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
    const text = `MT Core School ERP Credentials\nTenant Workspace: CAMP-01 (Gulberg Heights)\nUsername: ${u.username}\nEmail: ${u.email}\nPassword: ${u.password}\nRole: ${u.role}\nPortal URL: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
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

  // Toggle child student linkage for Parent user
  const toggleStudentLink = (stId: string) => {
    const current = [...form.linkedStudentIds];
    const exists = current.includes(stId);
    let updated: string[];

    if (exists) {
      updated = current.filter((id) => id !== stId);
    } else {
      updated = [...current, stId];
    }

    // Auto-derive primary name if not set
    let derivedName = form.fullName;
    if (!form.fullName && updated.length > 0) {
      const st = students.find((s) => s.id === updated[0]);
      if (st) {
        derivedName = `${st.fatherName} (P/O ${st.firstName})`;
      }
    }

    setForm({
      ...form,
      linkedStudentIds: updated,
      fullName: derivedName
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
        <div className="fixed bottom-6 right-6 z-50 bg-[#0b121e] border-2 border-emerald-500 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-up font-bold text-xs">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <Shield className="text-sky-400" size={24} />
            <span>SMS User Credential &amp; Role-Based Access Control (RBAC)</span>
          </h1>
          <p className="text-xs text-gray-400">
            Create tenant credentials for Students, Teachers, Parents (with Multi-Child linking), Accountants, HR &amp; Principals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleBatchStudentGen}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-500/10 hover:bg-purple-500 text-purple-300 hover:text-white border border-purple-500/30 rounded-xl text-xs font-bold transition shadow-sm"
            title="Auto-generate Student & Parent accounts from admitted students"
          >
            <Sparkles size={13} />
            <span>Auto Student/Parent Users</span>
          </button>

          <button
            onClick={handleBatchTeacherGen}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-xl text-xs font-bold transition shadow-sm"
            title="Auto-generate faculty accounts from teachers directory"
          >
            <Sparkles size={13} />
            <span>Auto Faculty Users</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black shadow-lg shadow-sky-600/30 transition"
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
                roleFilter === r ? "ring-2 ring-sky-400 " + cfg.bg : "bg-[#0b121e] border-gray-800"
              }`}
            >
              <div className="text-[10px] font-bold text-gray-400 uppercase">{r}</div>
              <div className="text-xl font-black text-white mt-1">{count}</div>
              <div className="text-[9px] text-gray-500 mt-0.5">{cfg.label.split(" ")[0]} Portals</div>
            </div>
          );
        })}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#0b121e] border border-[#1e293b] p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, username, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black border border-gray-800 pl-9 pr-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-black border border-gray-800 p-2 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-sky-500"
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
      <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/40">
          <h3 className="font-black text-white text-xs uppercase tracking-wider">
            Tenant Users &amp; Login Matrix ({filteredUsers.length} Users)
          </h3>
          <span className="text-[10px] text-gray-500 font-mono">
            Unique Usernames &bull; Multi-Child Linked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-mono text-[10px] bg-black/20">
                <th className="p-4 font-bold">User / Legal Name</th>
                <th className="p-4 font-bold">Assigned Role</th>
                <th className="p-4 font-bold">Tenant Login (Username / Email)</th>
                <th className="p-4 font-bold">Password &amp; Credentials</th>
                <th className="p-4 font-bold">Linked Student(s) / Profile</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50 text-xs">
              {filteredUsers.map((u) => {
                const cfg = roleColors[u.role] || roleColors.Teacher;
                const isRevealed = !!revealedPasswords[u.id];

                // Resolve linked children for parent
                const linkedChildren = (u.linkedStudentIds || (u.linkedEntityId ? [u.linkedEntityId] : []))
                  .map((stId) => students.find((s) => s.id === stId))
                  .filter(Boolean);

                return (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition">
                    {/* User info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-gray-800 to-gray-700 flex items-center justify-center font-black text-white text-sm shadow">
                          {u.fullName[0]}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{u.fullName}</div>
                          <div className="text-[10px] text-gray-500 font-mono">ID: {u.id}</div>
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
                      <div className="text-white font-bold flex items-center gap-1.5">
                        <span className="text-sky-400">@{u.username}</span>
                      </div>
                      <div className="text-[10px] text-gray-400">{u.email}</div>
                    </td>

                    {/* Password & Copy */}
                    <td className="p-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="bg-black/60 border border-gray-800 px-2.5 py-1 rounded text-emerald-400 font-bold text-xs">
                          {isRevealed ? u.password : "••••••••"}
                        </span>
                        <button
                          onClick={() => togglePassword(u.id)}
                          className="p-1 text-gray-400 hover:text-white transition"
                          title={isRevealed ? "Hide Password" : "Show Password"}
                        >
                          {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                        <button
                          onClick={() => copyCredentials(u)}
                          className="p-1 text-sky-400 hover:text-sky-300 transition"
                          title="Copy Full Login Credentials"
                        >
                          {copiedId === u.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </td>

                    {/* Linked Profile / Students */}
                    <td className="p-4">
                      {u.role === "Parent" && linkedChildren.length > 0 ? (
                        <div className="space-y-1">
                          {linkedChildren.map((st) => (
                            <div key={st!.id} className="inline-flex items-center gap-1 bg-pink-500/10 border border-pink-500/20 text-pink-300 px-2 py-0.5 rounded text-[10px] font-mono mr-1 mb-1">
                              <span>🎒 {st!.firstName} {st!.lastName}</span>
                              <span className="text-pink-400 font-bold">({st!.admissionNo})</span>
                            </div>
                          ))}
                        </div>
                      ) : u.linkedEntityName ? (
                        <span className="text-[10px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded font-mono">
                          🔗 {u.linkedEntityName}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-600">Direct Staff Account</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
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
                          className="px-2 py-1 bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-black rounded text-[10px] font-bold transition"
                          title="Test Login as this user"
                        >
                          Login View
                        </button>
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 hover:bg-gray-800 text-gray-400 hover:text-white rounded transition"
                          title="Edit User"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          className="p-1.5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded transition"
                          title="Delete User"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* CREATE / EDIT USER MODAL WITH PARENT MULTI-STUDENT LINKING                    */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0b121e] border border-sky-500/40 rounded-3xl w-full max-w-xl shadow-2xl p-6 my-8 animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-4">
              <h3 className="font-black text-white text-sm flex items-center gap-2">
                <Key className="text-sky-400" size={16} />
                <span>{editingUser ? "Edit User Credentials & Access" : "Create New User Account"}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Assigned Role *</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as SMSRole })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:border-sky-500"
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
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Account Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
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
                <div className="p-4 bg-black/60 border border-pink-500/30 rounded-2xl space-y-3 animate-fade-in-up">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] uppercase font-bold text-pink-400 flex items-center gap-1.5">
                      <Users size={14} />
                      <span>Link Student Children by Admission ID / Name *</span>
                    </label>
                    <span className="text-[10px] text-gray-400">
                      {form.linkedStudentIds.length} Children Linked
                    </span>
                  </div>

                  {/* Selected Children Badges */}
                  {form.linkedStudentIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-pink-500/10 border border-pink-500/20 rounded-xl">
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
                              className="hover:text-black transition"
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
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search student by Name, Admission ID (e.g. ADM-2026-0041) or Class..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full bg-[#0b121e] border border-gray-800 pl-9 pr-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-1 bg-[#0b121e] border border-gray-800 p-2 rounded-xl custom-scrollbar">
                      {searchableStudents.length === 0 ? (
                        <div className="text-[11px] text-gray-500 text-center py-2">No students found matching query</div>
                      ) : (
                        searchableStudents.map((st) => {
                          const isSelected = form.linkedStudentIds.includes(st.id);
                          return (
                            <div
                              key={st.id}
                              onClick={() => toggleStudentLink(st.id)}
                              className={`p-2 rounded-lg flex items-center justify-between cursor-pointer transition text-xs ${
                                isSelected
                                  ? "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                                  : "hover:bg-white/5 text-gray-300"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isSelected ? (
                                  <CheckSquare size={14} className="text-pink-400" />
                                ) : (
                                  <Square size={14} className="text-gray-500" />
                                )}
                                <div>
                                  <div className="font-bold text-white">
                                    {st.firstName} {st.lastName}
                                  </div>
                                  <div className="text-[10px] text-gray-400">
                                    Father: {st.fatherName} &bull; {st.className} ({st.sectionName})
                                  </div>
                                </div>
                              </div>
                              <span className="font-mono font-bold text-[10px] bg-black/60 px-2 py-0.5 rounded text-sky-400">
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
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Mahmood / Sir Shahid Mehmood"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:border-sky-500"
                />
              </div>

              {/* Username with Uniqueness Validation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Login Username *</label>
                    <span className="text-[9px] text-gray-500">Unique per Tenant</span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. parent.tariq"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className={`w-full bg-black border p-2.5 rounded-xl text-white font-mono transition ${
                      isDuplicateUsername
                        ? "border-red-500 text-red-300 focus:border-red-400"
                        : "border-gray-800 focus:border-sky-500"
                    }`}
                  />
                  {isDuplicateUsername && (
                    <div className="text-[10px] text-red-400 font-bold mt-1 flex items-center gap-1">
                      <AlertTriangle size={11} />
                      <span>Username already exists in this tenant!</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Login Password *</label>
                  <input
                    type="text"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-emerald-400 font-mono font-bold focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Corporate / Personal Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="user@mtcore.edu.pk"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="0300-1234567"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:border-sky-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isDuplicateUsername}
                className={`w-full py-3 text-white font-black uppercase rounded-xl transition text-xs shadow-lg ${
                  isDuplicateUsername
                    ? "bg-gray-700 cursor-not-allowed opacity-50"
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
