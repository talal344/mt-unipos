"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  Layers,
  Award,
  CalendarCheck2
} from "lucide-react";

export default function SMSTeachersPage() {
  const { theme, teachers, timetable, classes, addTeacher, updateTeacher, deleteTeacher } = useSMS();
  const isLight = theme === "light";

  const [search, setSearch] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(teachers[0]?.id || null);
  const [toastMsg, setToastMsg] = useState("");

  // Unique list of classes configured in settings
  const uniqueClassNames = Array.from(new Set(classes.map((c) => c.className))).filter(Boolean);

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
    qualification: "M.Sc / M.Phil",
    designation: "Senior Teacher",
    department: "Science",
    assignedSubjects: [],
    assignedClasses: [],
    joiningDate: new Date().toISOString().split("T")[0],
    phone: "",
    email: "",
    salary: 75000,
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
      assignedSubjects: [],
      assignedClasses: [],
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
      assignedSubjects: t.assignedSubjects || [],
      assignedClasses: t.assignedClasses || [],
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

  const toggleClassAssignment = (cName: string) => {
    const exists = form.assignedClasses.includes(cName);
    if (exists) {
      setForm({ ...form, assignedClasses: form.assignedClasses.filter((c) => c !== cName) });
    } else {
      setForm({ ...form, assignedClasses: [...form.assignedClasses, cName] });
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

      {/* Search Toolbar */}
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

      {/* Grid: Teachers List (Left) + Detail View (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Teacher Cards */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className={`font-bold ${isLight ? "text-emerald-700 font-bold" : "text-emerald-400"} uppercase tracking-wider`}>
              Faculty Members ({filteredTeachers.length})
            </span>
          </div>

          {filteredTeachers.length === 0 ? (
            <div className={`p-8 text-center ${isLight ? "bg-white border-slate-200 text-slate-400" : "bg-[#0b121e] border-[#1e293b] text-gray-500"} border rounded-2xl`}>
              No teachers registered in directory. Click "+ Appoint Faculty Member" to add one.
            </div>
          ) : (
            filteredTeachers.map((t) => {
              const isSelected = selectedTeacher?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTeacherId(t.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? isLight
                        ? "bg-emerald-50/70 border-emerald-500 shadow-md ring-1 ring-emerald-500"
                        : "bg-emerald-500/10 border-emerald-500 text-white"
                      : isLight
                      ? "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                      : "bg-[#0b121e] border-[#1e293b] hover:border-emerald-500/30"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className={`text-[10px] font-mono font-bold ${isLight ? "text-emerald-700 font-bold" : "text-emerald-400"}`}>{t.employeeCode}</span>
                      <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>{t.fullName}</h3>
                      <p className={`text-xs ${isLight ? "text-slate-500 font-medium" : "text-gray-400"}`}>
                        {t.designation} &bull; <b className={isLight ? "text-emerald-700" : "text-emerald-400"}>{t.department}</b>
                      </p>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(t);
                        }}
                        className={`p-1.5 ${isLight ? "hover:bg-slate-100 text-slate-500" : "hover:bg-gray-800 text-gray-400"} rounded-lg transition cursor-pointer`}
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(t);
                        }}
                        className={`p-1.5 ${isLight ? "hover:bg-red-50 text-slate-400 hover:text-red-600" : "hover:bg-red-500/20 text-gray-400 hover:text-red-400"} rounded-lg transition cursor-pointer`}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <div className={`mt-3 pt-2 border-t ${isLight ? "border-slate-100" : "border-gray-800/80"} flex justify-between items-center text-[10px] ${isLight ? "text-slate-500" : "text-gray-500"}`}>
                    <span className="flex items-center gap-1 font-mono">
                      Phone: {t.phone}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-bold ${isLight ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-emerald-500/10 text-emerald-400"}`}>
                      {t.assignedClasses?.length || 0} Classes Assigned
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Teacher Details & Period Timetable */}
        <div className="lg:col-span-2 space-y-4">
          {selectedTeacher ? (
            <div className="space-y-4">
              {/* Profile Card */}
              <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl p-6 space-y-4`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-emerald-600/30">
                      {selectedTeacher.fullName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className={`text-lg font-black ${isLight ? "text-slate-900" : "text-white"}`}>{selectedTeacher.fullName}</h2>
                        <span className={`text-[10px] font-mono font-bold ${isLight ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"} border px-2 py-0.5 rounded`}>
                          {selectedTeacher.employeeCode}
                        </span>
                      </div>
                      <p className={`text-xs ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                        {selectedTeacher.designation} &bull; {selectedTeacher.qualification}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(selectedTeacher)}
                    className={`px-3.5 py-1.5 rounded-xl ${isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200" : "bg-gray-800 hover:bg-gray-700 text-white"} font-bold text-xs flex items-center gap-1.5 transition cursor-pointer`}
                  >
                    <Edit2 size={12} />
                    <span>Edit Profile</span>
                  </button>
                </div>

                {/* Assigned Workloads */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                  <div className={`${isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-black/40 border-gray-800 text-gray-300"} border p-3 rounded-xl space-y-1`}>
                    <span className={`text-[9px] uppercase font-bold ${isLight ? "text-slate-400" : "text-gray-500"} block`}>Department</span>
                    <span className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{selectedTeacher.department}</span>
                  </div>

                  <div className={`${isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-black/40 border-gray-800 text-gray-300"} border p-3 rounded-xl space-y-1`}>
                    <span className={`text-[9px] uppercase font-bold ${isLight ? "text-emerald-700" : "text-emerald-400"} block`}>Assigned Subjects</span>
                    <span className={`font-bold ${isLight ? "text-emerald-700 font-black" : "text-emerald-400"}`}>
                      {selectedTeacher.assignedSubjects?.length > 0 ? selectedTeacher.assignedSubjects.join(", ") : "None Assigned"}
                    </span>
                  </div>

                  <div className={`${isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-black/40 border-gray-800 text-gray-300"} border p-3 rounded-xl space-y-1`}>
                    <span className={`text-[9px] uppercase font-bold ${isLight ? "text-sky-700" : "text-sky-400"} block`}>Assigned Classes</span>
                    <span className={`font-bold ${isLight ? "text-sky-700 font-black" : "text-sky-400"}`}>
                      {selectedTeacher.assignedClasses?.length > 0 ? selectedTeacher.assignedClasses.join(", ") : "None Assigned"}
                    </span>
                  </div>
                </div>

                {/* Direct Action Hub for Teacher */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <Link
                    href={`/sms/exams`}
                    className="p-3.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition"
                  >
                    <Award size={15} />
                    <span>Upload Student Paper Marks</span>
                  </Link>

                  <Link
                    href={`/sms/attendance`}
                    className="p-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition"
                  >
                    <CalendarCheck2 size={15} />
                    <span>Upload Daily Class Attendance</span>
                  </Link>
                </div>
              </div>

              {/* Teaching Timetable Matrix */}
              <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl p-5 space-y-3`}>
                <div className="flex justify-between items-center">
                  <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-xs uppercase flex items-center gap-2`}>
                    <Clock className={isLight ? "text-emerald-700 font-bold" : "text-emerald-400"} size={16} />
                    <span>Daily Teaching Period Schedule ({teacherPeriods.length} Periods Scheduled)</span>
                  </h3>
                  <span className={`text-[10px] font-mono ${isLight ? "text-slate-500" : "text-gray-500"}`}>Live Timetable Sync</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead>
                      <tr className={`border-b ${isLight ? "border-slate-200 text-slate-600 bg-slate-100/70" : "border-gray-800 text-gray-400 bg-black/40"} font-mono text-[10px]`}>
                        <th className="p-3">Period #</th>
                        <th className="p-3">Time Window</th>
                        <th className="p-3">Assigned Class &amp; Section</th>
                        <th className="p-3">Subject</th>
                        <th className="p-3">Lecture Room</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isLight ? "divide-slate-100" : "divide-gray-800/50"} text-xs`}>
                      {teacherPeriods.length === 0 ? (
                        <tr>
                          <td colSpan={6} className={`p-6 text-center ${isLight ? "text-slate-400" : "text-gray-500"} italic`}>
                            No periods assigned for this instructor. Timetable period can be mapped in Timetable &amp; Matrix.
                          </td>
                        </tr>
                      ) : (
                        teacherPeriods.map((p) => (
                          <tr key={p.id} className={isLight ? "hover:bg-slate-50" : "hover:bg-white/[0.02]"}>
                            <td className="p-3 font-mono font-bold text-sky-400">Period {p.periodNumber}</td>
                            <td className="p-3 font-mono">{p.timeSlot}</td>
                            <td className="p-3 font-bold">{p.className} ({p.sectionName})</td>
                            <td className="p-3 text-emerald-400 font-bold">{p.subject}</td>
                            <td className="p-3 font-mono text-gray-400">{p.room}</td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                Allocated
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
                  placeholder="e.g. Sir Ahmad Ali"
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
                    placeholder="M.Sc / M.Phil"
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

              {/* Assign Classes Checkboxes */}
              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-sky-700" : "text-sky-400"} mb-1.5`}>
                  Assign Teaching Classes (Select configured classes)
                </label>
                {uniqueClassNames.length === 0 ? (
                  <p className="text-[11px] text-gray-500">No classes configured yet. Add classes in Settings / Classes.</p>
                ) : (
                  <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-black/30">
                    {uniqueClassNames.map((cName) => {
                      const isChecked = form.assignedClasses.includes(cName);
                      return (
                        <button
                          type="button"
                          key={cName}
                          onClick={() => toggleClassAssignment(cName)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                            isChecked
                              ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                              : isLight
                              ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                              : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
                          }`}
                        >
                          {isChecked ? `✓ ${cName}` : `+ ${cName}`}
                        </button>
                      );
                    })}
                  </div>
                )}
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
