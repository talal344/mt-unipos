"use client";

import React, { useState } from "react";
import { useSMS, SMSClassSection, StudentRecord } from "@/context/sms-context";
import {
  Building2,
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  ArrowRightLeft,
  X,
  ShieldCheck,
  Search,
  Sparkles,
  GraduationCap
} from "lucide-react";

export default function SMSClassesPage() {
  const {
    classes,
    students,
    teachers,
    addClassSection,
    updateClassSection,
    deleteClassSection,
    reassignStudentSection
  } = useSMS();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || "");
  const [toastMsg, setToastMsg] = useState("");

  // Reassign Student Modal State
  const [reassignTargetStudent, setReassignTargetStudent] = useState<StudentRecord | null>(null);
  const [targetClassSectionId, setTargetClassSectionId] = useState(classes[1]?.id || classes[0]?.id || "");

  // Add / Edit Section Modal
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<SMSClassSection | null>(null);
  const [form, setForm] = useState({
    classId: "C10",
    className: "",
    sectionName: "",
    wing: "Senior Boys Wing",
    roomNumber: "Room 101",
    capacity: 35,
    classTeacherName: "",
    crBoyName: "",
    grGirlName: ""
  });

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const enrolledStudentsInCurrent = students.filter(
    (s) => s.className === currentClass?.className && s.sectionName === currentClass?.sectionName
  );

  const handleOpenAdd = () => {
    setEditingClass(null);
    setForm({
      classId: `C${Math.floor(10 + Math.random() * 90)}`,
      className: "",
      sectionName: "",
      wing: "Senior Boys Wing",
      roomNumber: "Room 101",
      capacity: 35,
      classTeacherName: "",
      crBoyName: "",
      grGirlName: ""
    });
    setShowClassModal(true);
  };

  const handleOpenEdit = (c: SMSClassSection) => {
    setEditingClass(c);
    setForm({
      classId: c.classId,
      className: c.className,
      sectionName: c.sectionName,
      wing: c.wing,
      roomNumber: c.roomNumber,
      capacity: c.capacity,
      classTeacherName: c.classTeacherName || "",
      crBoyName: c.crBoyName || "",
      grGirlName: c.grGirlName || ""
    });
    setShowClassModal(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.className || !form.sectionName) return;

    if (editingClass) {
      updateClassSection(editingClass.id, form);
      setToastMsg(`✅ Class section "${form.className} ${form.sectionName}" updated!`);
    } else {
      const created = addClassSection(form);
      setSelectedClassId(created.id);
      setToastMsg(`✅ New class section "${form.className} ${form.sectionName}" created!`);
    }
    setShowClassModal(false);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleDelete = (c: SMSClassSection) => {
    if (confirm(`Are you sure you want to delete ${c.className} ${c.sectionName}?`)) {
      deleteClassSection(c.id);
      setToastMsg(`🗑️ Section removed.`);
      setTimeout(() => setToastMsg(""), 3500);
    }
  };

  const handleReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignTargetStudent) return;

    const targetSec = classes.find((c) => c.id === targetClassSectionId);
    if (!targetSec) return;

    reassignStudentSection(
      reassignTargetStudent.id,
      targetSec.id,
      targetSec.className,
      targetSec.id,
      targetSec.sectionName
    );

    setToastMsg(
      `✅ ${reassignTargetStudent.firstName} shifted to ${targetSec.className} (${targetSec.sectionName})!`
    );
    setReassignTargetStudent(null);
    setTimeout(() => setToastMsg(""), 4000);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <Building2 className="text-sky-400" size={22} />
            <span>Class &amp; Section Student-Teacher Allocation Workbench</span>
          </h1>
          <p className="text-xs text-gray-400">
            Configure class sections, assign incharge faculty, elect student CR/GR, and re-assign students across sections.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-600/20 transition cursor-pointer"
        >
          <Plus size={14} />
          <span>Create New Section</span>
        </button>
      </div>

      {/* Class Section Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {classes.map((cls) => {
          const isSelected = cls.id === (currentClass?.id || selectedClassId);
          const studentCount = students.filter(
            (s) => s.className === cls.className && s.sectionName === cls.sectionName
          ).length;

          return (
            <div
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className={`p-5 rounded-2xl border transition cursor-pointer space-y-3 relative ${
                isSelected
                  ? "bg-[#0b1a2e] border-sky-500 shadow-xl shadow-sky-600/10 ring-1 ring-sky-500"
                  : "bg-[#0b121e] border-[#1e293b] hover:border-gray-700"
              }`}
            >
              <div className="flex justify-between items-center text-xs">
                <span className="text-[10px] uppercase font-bold text-sky-400 font-mono">{cls.wing}</span>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(cls);
                    }}
                    className="p-1 hover:bg-sky-500/20 text-gray-400 hover:text-sky-300 rounded"
                    title="Edit Section"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(cls);
                    }}
                    className="p-1 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded"
                    title="Delete Section"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-black text-white text-base">{cls.className}</h3>
                <div className="text-xs text-sky-300 font-bold">{cls.sectionName} • {cls.roomNumber}</div>
              </div>

              <div className="pt-2 border-t border-gray-800 flex justify-between items-end text-xs">
                <div>
                  <span className="text-[9px] text-gray-500 block">Class Incharge</span>
                  <span className="font-bold text-emerald-400 text-[11px]">{cls.classTeacherName || "Unassigned"}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-white text-sm">{studentCount} / {cls.capacity}</span>
                  <span className="text-[9px] text-gray-500 block">Students</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* SECTION DETAIL: ENROLLED STUDENTS & MANAGEMENT                                */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {currentClass && (
        <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl space-y-4">
          <div className="p-5 border-b border-gray-800 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-black/40">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-sm">
                  {currentClass.className} — {currentClass.sectionName}
                </h3>
                <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded font-bold">
                  {enrolledStudentsInCurrent.length} Students Enrolled
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Incharge: <b className="text-emerald-400">{currentClass.classTeacherName || 'Not Set'}</b> • Boy CR: <b className="text-sky-300">{currentClass.crBoyName || 'None'}</b> • Girl GR: <b className="text-pink-300">{currentClass.grGirlName || 'None'}</b>
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 font-mono text-[10px] bg-black/20">
                  <th className="p-4 font-bold">Roll #</th>
                  <th className="p-4 font-bold">Student Name</th>
                  <th className="p-4 font-bold">Admission ID</th>
                  <th className="p-4 font-bold">Father Name</th>
                  <th className="p-4 font-bold">Parent Contact</th>
                  <th className="p-4 font-bold">Fee Status</th>
                  <th className="p-4 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50 font-mono text-[11px]">
                {enrolledStudentsInCurrent.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-gray-500 font-sans">
                      No students currently allocated to this section. Use Student 360 to assign or shift candidates.
                    </td>
                  </tr>
                ) : (
                  enrolledStudentsInCurrent.map((st) => (
                    <tr key={st.id} className="hover:bg-white/[0.02] transition">
                      <td className="p-4 font-bold text-white font-mono">#{st.rollNo}</td>
                      <td className="p-4 font-sans font-bold text-white text-sm">
                        {st.firstName} {st.lastName}
                      </td>
                      <td className="p-4 font-bold text-sky-400">{st.admissionNo}</td>
                      <td className="p-4 font-sans text-gray-300">{st.fatherName}</td>
                      <td className="p-4 text-emerald-400">{st.fatherPhone}</td>
                      <td className="p-4 font-sans">
                        <span className="bg-sky-500/10 text-sky-300 border border-sky-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                          {st.feeCategory}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setReassignTargetStudent(st)}
                          className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg font-bold text-[10px] transition flex items-center gap-1.5 mx-auto cursor-pointer"
                        >
                          <ArrowRightLeft size={12} />
                          <span>Shift Section</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* SHIFT STUDENT SECTION MODAL                                                   */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {reassignTargetStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#0b121e] border border-indigo-500/40 rounded-3xl w-full max-w-md shadow-2xl p-6 animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-4">
              <h3 className="font-black text-white text-sm">Shift Student to Another Section</h3>
              <button onClick={() => setReassignTargetStudent(null)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleReassignSubmit} className="space-y-4 text-xs">
              <div className="bg-black/40 border border-gray-800 p-3 rounded-xl space-y-1">
                <div>Candidate: <b className="text-white">{reassignTargetStudent.firstName} {reassignTargetStudent.lastName}</b></div>
                <div>Current: <b className="text-sky-400">{reassignTargetStudent.className} ({reassignTargetStudent.sectionName})</b></div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-indigo-400 mb-1">
                  Select Target Destination Section
                </label>
                <select
                  value={targetClassSectionId}
                  onChange={(e) => setTargetClassSectionId(e.target.value)}
                  className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.className} — {c.sectionName} (Incharge: {c.classTeacherName || 'None'})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black uppercase rounded-xl transition text-xs"
              >
                Confirm Student Section Transfer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* ADD / EDIT CLASS SECTION MODAL                                                */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0b121e] border border-sky-500/40 rounded-3xl w-full max-w-lg shadow-2xl p-6 my-8 animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-4">
              <h3 className="font-black text-white text-sm">
                {editingClass ? "Edit Class Section & Leadership" : "Create New Class Section"}
              </h3>
              <button onClick={() => setShowClassModal(false)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Class Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Class 10 (Science)"
                    value={form.className}
                    onChange={(e) => setForm({ ...form, className: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-sky-400 mb-1">Section Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Section A (Einstein)"
                    value={form.sectionName}
                    onChange={(e) => setForm({ ...form, sectionName: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Campus Wing</label>
                  <select
                    value={form.wing}
                    onChange={(e) => setForm({ ...form, wing: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
                  >
                    <option value="Montessori & Early Years">Montessori &amp; Early Years</option>
                    <option value="Junior Girls Wing">Junior Girls Wing</option>
                    <option value="Senior Boys Wing">Senior Boys Wing</option>
                    <option value="College & Higher Secondary">College &amp; Higher Secondary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Room Number</label>
                  <input
                    type="text"
                    placeholder="Room 204"
                    value={form.roomNumber}
                    onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Class Incharge Teacher</label>
                  <input
                    type="text"
                    placeholder="Sir Shahid Mehmood"
                    value={form.classTeacherName}
                    onChange={(e) => setForm({ ...form, classTeacherName: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Capacity (Max Seats)</label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value, 10) || 35 })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-sky-400 mb-1">Appointed Boy CR</label>
                  <input
                    type="text"
                    placeholder="Daniyal Tariq"
                    value={form.crBoyName}
                    onChange={(e) => setForm({ ...form, crBoyName: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-pink-400 mb-1">Appointed Girl GR</label>
                  <input
                    type="text"
                    placeholder="Ayesha Noor"
                    value={form.grGirlName}
                    onChange={(e) => setForm({ ...form, grGirlName: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black uppercase rounded-xl transition text-xs shadow-lg"
              >
                Save Section Allocation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
