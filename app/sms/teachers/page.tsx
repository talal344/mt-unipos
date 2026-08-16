"use client";

import React, { useState } from "react";
import { useSMS, TeacherRecord } from "@/context/sms-context";
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Clock,
  BookOpen,
  Building2,
  CheckCircle2,
  Search,
  Phone,
  Mail,
  X,
  Sparkles,
  Layers
} from "lucide-react";

export default function SMSTeachersPage() {
  const { theme, teachers, timetable, classes, addTeacher, updateTeacher, deleteTeacher } = useSMS();
  const isLight = theme === "light";

  const [search, setSearch] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(teachers[0]?.id || null);
  const [toastMsg, setToastMsg] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherRecord | null>(null);
  const [form, setForm] = useState<{
    fullName: string;
    gender: "Male" | "Female";
    qualification: string;
    designation: string;
    department: TeacherRecord["department"];
    assignedSubjects: string[];
    assignedClasses: string[];
    joiningDate: string;
    phone: string;
    email: string;
    salary: number;
    status: TeacherRecord["status"];
  }>({
    fullName: "",
    gender: "Male",
    qualification: "M.Sc. Physics (Punjab University)",
    designation: "Senior Subject Specialist",
    department: "Science",
    assignedSubjects: ["Physics", "Mathematics"],
    assignedClasses: ["Class 9 (Science)", "Class 10 (Science)"],
    joiningDate: new Date().toISOString().split("T")[0],
    phone: "0300-1234567",
    email: "teacher@mtcore.edu.pk",
    salary: 85000,
    status: "Active"
  });

  const filteredTeachers = teachers.filter(
    (t) =>
      t.fullName.toLowerCase().includes(search.toLowerCase()) ||
      t.department.toLowerCase().includes(search.toLowerCase()) ||
      t.employeeCode.toLowerCase().includes(search.toLowerCase())
  );

  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId) || teachers[0];

  // Get periods assigned to selected teacher
  const teacherPeriods = timetable.filter(
    (tt) => tt.teacherName.toLowerCase() === selectedTeacher?.fullName.toLowerCase()
  );

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setForm({
      fullName: "",
      gender: "Male",
      qualification: "M.Sc / M.Phil",
      designation: "Senior Teacher",
      department: "Science",
      assignedSubjects: ["Physics"],
      assignedClasses: ["Class 9 (Science)"],
      joiningDate: new Date().toISOString().split("T")[0],
      phone: "",
      email: "",
      salary: 75000,
      status: "Active"
    });
    setShowModal(true);
  };

  const handleOpenEdit = (t: TeacherRecord) => {
    setEditingTeacher(t);
    setForm({
      fullName: t.fullName,
      gender: t.gender || "Male",
      qualification: t.qualification,
      designation: t.designation,
      department: t.department,
      assignedSubjects: t.assignedSubjects || ["Physics"],
      assignedClasses: t.assignedClasses,
      joiningDate: t.joiningDate,
      phone: t.phone,
      email: t.email,
      salary: t.salary,
      status: t.status
    });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone) return;

    if (editingTeacher) {
      updateTeacher(editingTeacher.id, form);
      setToastMsg(`✅ Faculty profile for "${form.fullName}" updated!`);
    } else {
      const created = addTeacher(form);
      setSelectedTeacherId(created.id);
      setToastMsg(`✅ New faculty member "${form.fullName}" appointed!`);
    }
    setShowModal(false);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleDelete = (t: TeacherRecord) => {
    if (confirm(`Are you sure you want to remove ${t.fullName}?`)) {
      deleteTeacher(t.id);
      setToastMsg(`🗑️ Faculty profile deleted.`);
      setTimeout(() => setToastMsg(""), 3500);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white font-bold text-xs py-3 px-5 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${isLight ? "border-slate-200" : "border-gray-800"} pb-4`}>
        <div>
          <h1 className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-2`}>
            <GraduationCap className={isLight ? "text-emerald-600" : "text-emerald-400"} size={22} />
            <span>Faculty Directory, Timetable Allocation &amp; Workload Matrix</span>
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            View assigned classes, subject loads, and specific period timings for each faculty member.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition cursor-pointer"
        >
          <Plus size={14} />
          <span>Appoint Faculty Member</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? "text-slate-400" : "text-gray-500"}`} />
        <input
          type="text"
          placeholder="Search faculty name, department, employee code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full ${
            isLight
              ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 shadow-xs"
              : "bg-[#0b121e] border-[#1e293b] text-white placeholder-gray-500 focus:border-emerald-500"
          } border pl-9 pr-3 py-2.5 rounded-xl text-xs focus:outline-none`}
        />
      </div>

      {/* Main 2-Column Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Teachers List */}
        <div className="space-y-3">
          <h3 className={`text-xs uppercase font-bold ${isLight ? "text-emerald-700 font-bold" : "text-emerald-400"} tracking-wider`}>
            Faculty Members ({filteredTeachers.length})
          </h3>
          <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar pr-1">
            {filteredTeachers.map((t) => {
              const isSelected = t.id === (selectedTeacher?.id || selectedTeacherId);
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTeacherId(t.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer space-y-2 relative ${
                    isSelected
                      ? isLight
                        ? "bg-emerald-50/80 border-emerald-400 shadow-md ring-2 ring-emerald-400"
                        : "bg-[#0c241d] border-emerald-500 shadow-xl shadow-emerald-600/10 ring-1 ring-emerald-500"
                      : isLight
                      ? "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                      : "bg-[#0b121e] border-[#1e293b] hover:border-gray-700"
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-bold ${isLight ? "text-emerald-700" : "text-emerald-400"} font-mono text-[10px]`}>{t.employeeCode}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(t);
                        }}
                        className={`p-1 ${isLight ? "hover:bg-slate-200 text-slate-500 hover:text-slate-900" : "hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-300"} rounded cursor-pointer`}
                        title="Edit Teacher"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(t);
                        }}
                        className={`p-1 ${isLight ? "hover:bg-red-100 text-slate-500 hover:text-red-600" : "hover:bg-red-500/20 text-gray-400 hover:text-red-400"} rounded cursor-pointer`}
                        title="Delete Teacher"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>{t.fullName}</h4>
                    <div className={`text-xs ${isLight ? "text-slate-600" : "text-gray-400"}`}>
                      {t.designation} • <span className={`${isLight ? "text-emerald-700" : "text-emerald-300"} font-semibold`}>{t.department}</span>
                    </div>
                  </div>

                  <div className={`pt-2 border-t ${isLight ? "border-slate-100" : "border-gray-800"} flex justify-between items-center text-[10px]`}>
                    <span className={isLight ? "text-slate-500" : "text-gray-500"}>Phone: {t.phone}</span>
                    <span className={`${isLight ? "text-emerald-800 bg-emerald-50 border border-emerald-200" : "text-emerald-400 bg-emerald-500/10"} font-bold px-2 py-0.5 rounded`}>
                      {t.assignedClasses.length} Classes Assigned
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Teacher's Live Class & Period Matrix */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTeacher ? (
            <div className="space-y-6">
              {/* Teacher Header Card */}
              <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-emerald-500/30"} border rounded-2xl p-6 space-y-4`}>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-emerald-600/30">
                      {selectedTeacher.fullName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className={`text-lg font-black ${isLight ? "text-slate-900" : "text-white"}`}>{selectedTeacher.fullName}</h2>
                        <span className={`text-[10px] font-mono font-bold ${
                          isLight ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        } border px-2 py-0.5 rounded`}>
                          {selectedTeacher.employeeCode}
                        </span>
                      </div>
                      <p className={`text-xs ${isLight ? "text-slate-600" : "text-gray-400"}`}>
                        {selectedTeacher.designation} • {selectedTeacher.qualification}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(selectedTeacher)}
                      className={`px-3.5 py-1.5 ${
                        isLight ? "bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200" : "bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white"
                      } rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer`}
                    >
                      <Edit2 size={13} />
                      <span>Edit Profile</span>
                    </button>
                  </div>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs border-t ${isLight ? "border-slate-100" : "border-gray-800"}`}>
                  <div className={`${isLight ? "bg-slate-50 border border-slate-200" : "bg-black/40"} p-3 rounded-xl`}>
                    <span className={`text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} block`}>Department</span>
                    <b className={isLight ? "text-slate-900" : "text-white"}>{selectedTeacher.department}</b>
                  </div>
                  <div className={`${isLight ? "bg-slate-50 border border-slate-200" : "bg-black/40"} p-3 rounded-xl`}>
                    <span className={`text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} block`}>Assigned Subjects</span>
                    <b className={isLight ? "text-emerald-700" : "text-emerald-400"}>{(selectedTeacher.assignedSubjects || ["General"]).join(", ")}</b>
                  </div>
                  <div className={`${isLight ? "bg-slate-50 border border-slate-200" : "bg-black/40"} p-3 rounded-xl`}>
                    <span className={`text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} block`}>Contact Phone</span>
                    <b className={isLight ? "text-sky-700" : "text-sky-300"}>{selectedTeacher.phone}</b>
                  </div>
                </div>
              </div>

              {/* Assigned Period Schedule Table */}
              <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl overflow-hidden shadow-xl`}>
                <div className={`p-4 border-b ${isLight ? "border-slate-100 bg-slate-50/80" : "border-gray-800 bg-black/40"} flex justify-between items-center`}>
                  <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-xs uppercase tracking-wider flex items-center gap-2`}>
                    <Clock size={14} className={isLight ? "text-emerald-600" : "text-emerald-400"} />
                    <span>Daily Teaching Period Schedule ({teacherPeriods.length} Periods Scheduled)</span>
                  </h3>
                  <span className={`text-[10px] ${isLight ? "text-emerald-700 font-bold" : "text-emerald-400"} font-mono`}>Live Timetable Sync</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className={`border-b ${isLight ? "border-slate-200 text-slate-600 bg-slate-100/70" : "border-gray-800 text-gray-400 bg-black/20"} font-mono text-[10px]`}>
                        <th className="p-4 font-bold">Period #</th>
                        <th className="p-4 font-bold">Time Window</th>
                        <th className="p-4 font-bold">Assigned Class &amp; Section</th>
                        <th className="p-4 font-bold">Subject</th>
                        <th className="p-4 font-bold">Lecture Room</th>
                        <th className="p-4 font-bold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isLight ? "divide-slate-100" : "divide-gray-800/50"} font-mono text-[11px]`}>
                      {teacherPeriods.length === 0 ? (
                        <tr>
                          <td colSpan={6} className={`p-6 text-center ${isLight ? "text-slate-400" : "text-gray-500"} font-sans`}>
                            No periods assigned for this instructor. Timetable period can be mapped in Timetable &amp; Matrix.
                          </td>
                        </tr>
                      ) : (
                        teacherPeriods.map((p) => (
                          <tr key={p.id} className={`${isLight ? "hover:bg-slate-50/80" : "hover:bg-white/[0.02]"} transition`}>
                            <td className={`p-4 font-bold ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>Period #{p.periodNumber}</td>
                            <td className={`p-4 font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{p.timeSlot}</td>
                            <td className={`p-4 font-sans font-bold ${isLight ? "text-sky-700" : "text-sky-300"}`}>
                              {p.className} ({p.sectionName})
                            </td>
                            <td className={`p-4 font-sans font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{p.subject}</td>
                            <td className={`p-4 font-sans ${isLight ? "text-slate-600" : "text-gray-400"}`}>{p.room}</td>
                            <td className="p-4 text-center font-sans">
                              <span className={`${
                                isLight ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              } border px-2 py-0.5 rounded text-[9px] font-bold`}>
                                Active Lecture
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-12 text-center ${isLight ? "bg-white border-slate-200 text-slate-400" : "bg-[#0b121e] border-[#1e293b] text-gray-500"} border rounded-2xl shadow-sm`}>
              Select a faculty member from the left list to view assigned periods and schedule.
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Faculty Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-emerald-500/40 text-white"
          } border rounded-3xl w-full max-w-lg shadow-2xl p-6 my-8 animate-fade-in-up`}>
            <div className={`flex justify-between items-center border-b ${isLight ? "border-slate-100" : "border-gray-800"} pb-3 mb-4`}>
              <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>
                {editingTeacher ? "Edit Faculty Member Profile" : "Appoint New Faculty Member"}
              </h3>
              <button onClick={() => setShowModal(false)} className={`${isLight ? "text-slate-400 hover:text-slate-800" : "text-gray-400 hover:text-white"} cursor-pointer`}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sir Shahid Mehmood"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className={`w-full ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                  } border p-2.5 rounded-xl font-bold focus:outline-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Qualification *</label>
                  <input
                    type="text"
                    required
                    placeholder="M.Sc. Physics"
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                    className={`w-full ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                    } border p-2.5 rounded-xl font-bold focus:outline-none`}
                  />
                </div>
                <div>
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Department</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value as any })}
                    className={`w-full ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                    } border p-2.5 rounded-xl font-bold focus:outline-none`}
                  >
                    <option value="Science">Science (Physics/Chem/Bio)</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="English">English</option>
                    <option value="Urdu / Islamiyat">Urdu / Islamiyat</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Social Sciences">Social Sciences</option>
                    <option value="Primary Wing">Primary Wing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-emerald-700 font-bold" : "text-emerald-400"} mb-1`}>Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="0300-1234567"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={`w-full ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                    } border p-2.5 rounded-xl font-bold focus:outline-none`}
                  />
                </div>
                <div>
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Monthly Salary (PKR)</label>
                  <input
                    type="number"
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: parseInt(e.target.value, 10) || 75000 })}
                    className={`w-full ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                    } border p-2.5 rounded-xl font-bold focus:outline-none`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black uppercase rounded-xl transition text-xs shadow-lg cursor-pointer"
              >
                Save Faculty Member Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
