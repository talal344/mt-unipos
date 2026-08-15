"use client";

import React, { useState } from "react";
import { useSMS, SMSClassSection } from "@/context/sms-context";
import {
  Building2,
  Plus,
  Edit2,
  Users,
  School,
  CheckCircle2,
  X,
  UserCheck,
  Award,
  Layers
} from "lucide-react";

export default function SMSClassesPage() {
  const { campuses, selectedCampus, classes, teachers, addClassSection, updateClassSection } = useSMS();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClass, setEditingClass] = useState<SMSClassSection | null>(null);

  const activeCampus = campuses.find((c) => c.id === selectedCampus) || campuses[0];

  const [form, setForm] = useState({
    classId: "C9",
    className: "Class 9 (Science)",
    sectionName: "Section B (Galileo)",
    wing: "Senior Boys Wing",
    classTeacherName: "Sir Shahid Mehmood",
    crBoyName: "",
    grGirlName: "",
    roomNumber: "Hall 302",
    capacity: 40
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      updateClassSection(editingClass.id, form);
      setEditingClass(null);
    } else {
      addClassSection(form);
      setShowAddModal(false);
    }
  };

  const handleOpenEdit = (cls: SMSClassSection) => {
    setEditingClass(cls);
    setForm({
      classId: cls.classId,
      className: cls.className,
      sectionName: cls.sectionName,
      wing: cls.wing,
      classTeacherName: cls.classTeacherName || "",
      crBoyName: cls.crBoyName || "",
      grGirlName: cls.grGirlName || "",
      roomNumber: cls.roomNumber,
      capacity: cls.capacity
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <Building2 className="text-sky-400" size={22} />
            <span>Campus Wings &amp; Classes Hierarchy</span>
          </h1>
          <p className="text-xs text-gray-400">
            Configure campus wings, classes, strict section isolation, incharge teachers, and appointed student leaders (CR &amp; GR).
          </p>
        </div>

        <button
          onClick={() => {
            setEditingClass(null);
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-600/20 transition cursor-pointer"
        >
          <Plus size={14} />
          <span>Add New Section</span>
        </button>
      </div>

      {/* Campus Wings Grid */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Campus Wings Division</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeCampus.wings.map((w) => (
            <div key={w.id} className="bg-[#0b121e] border border-[#1e293b] rounded-2xl p-5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-sky-400 font-mono">{w.id}</span>
                <span className="text-[10px] bg-sky-500/10 text-sky-300 px-2 py-0.5 rounded-full font-bold">
                  {w.totalClasses} Sections
                </span>
              </div>
              <h4 className="text-sm font-black text-white">{w.name}</h4>
              <div className="text-xs text-gray-400">
                <span className="text-gray-500">Wing Incharge: </span>
                <span className="text-gray-200 font-bold">{w.headName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Class Sections Table */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Class Sections Registry &amp; Student Leaders</h3>
        <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 font-mono text-[11px] bg-black/40">
                  <th className="p-4 font-bold">Class Name</th>
                  <th className="p-4 font-bold">Section</th>
                  <th className="p-4 font-bold">Wing</th>
                  <th className="p-4 font-bold">Class Teacher Incharge</th>
                  <th className="p-4 font-bold text-sky-400">Boy CR</th>
                  <th className="p-4 font-bold text-pink-400">Girl GR</th>
                  <th className="p-4 font-bold">Room #</th>
                  <th className="p-4 font-bold text-center">Strength / Max</th>
                  <th className="p-4 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50 font-mono text-[11px]">
                {classes.map((cls) => (
                  <tr key={cls.id} className="hover:bg-white/[0.02] transition">
                    <td className="p-4 font-sans font-bold text-white text-sm">{cls.className}</td>
                    <td className="p-4 text-sky-300 font-bold">{cls.sectionName}</td>
                    <td className="p-4 text-gray-400 font-sans">{cls.wing}</td>
                    <td className="p-4 text-emerald-400 font-sans font-bold">{cls.classTeacherName || "Unassigned"}</td>
                    <td className="p-4 text-sky-300 font-bold font-sans">{cls.crBoyName || "—"}</td>
                    <td className="p-4 text-pink-300 font-bold font-sans">{cls.grGirlName || "—"}</td>
                    <td className="p-4 text-gray-300">{cls.roomNumber}</td>
                    <td className="p-4 text-center">
                      <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2.5 py-1 rounded-lg font-bold">
                        {cls.enrolledCount} / {cls.capacity}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleOpenEdit(cls)}
                        className="p-1.5 bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white rounded-lg transition"
                        title="Edit Section Details"
                      >
                        <Edit2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || editingClass) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#0b121e] border border-sky-500/40 rounded-3xl w-full max-w-lg shadow-2xl p-6 animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-sky-400" />
                <h3 className="font-black text-white text-sm">
                  {editingClass ? "Edit Class Section" : "Create New Class Section"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingClass(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Class Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Class 9 (Science)"
                    value={form.className}
                    onChange={(e) => setForm({ ...form, className: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Section Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Section A (Newton)"
                    value={form.sectionName}
                    onChange={(e) => setForm({ ...form, sectionName: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Wing</label>
                  <select
                    value={form.wing}
                    onChange={(e) => setForm({ ...form, wing: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-sky-500"
                  >
                    {activeCampus.wings.map((w) => (
                      <option key={w.id} value={w.name}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Class Incharge Teacher</label>
                  <select
                    value={form.classTeacherName}
                    onChange={(e) => setForm({ ...form, classTeacherName: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.fullName}>
                        {t.fullName} ({t.designation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-sky-400 mb-1">Boy Class Representative (CR)</label>
                  <input
                    type="text"
                    placeholder="e.g. Ahmed Talal"
                    value={form.crBoyName}
                    onChange={(e) => setForm({ ...form, crBoyName: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-pink-400 mb-1">Girl General Representative (GR)</label>
                  <input
                    type="text"
                    placeholder="e.g. Zoya Aslam"
                    value={form.grGirlName}
                    onChange={(e) => setForm({ ...form, grGirlName: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Room / Lab Number</label>
                  <input
                    type="text"
                    placeholder="e.g. Physics Hall 1"
                    value={form.roomNumber}
                    onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Max Student Capacity</label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value, 10) || 30 })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black uppercase rounded-xl transition flex items-center justify-center gap-2 text-xs"
              >
                <CheckCircle2 size={16} />
                <span>Save Class Section</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
