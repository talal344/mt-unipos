"use client";

import React, { useState } from "react";
import { useSMS, ClinicVisit } from "@/context/sms-context";
import {
  Stethoscope,
  Plus,
  CheckCircle2,
  AlertCircle,
  Search,
  Users,
  Activity,
  HeartPulse,
  Phone,
  X
} from "lucide-react";

export default function SMSClinicPage() {
  const { theme, students, clinicVisits, logClinicVisit } = useSMS();
  const isLight = theme === "light";

  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || "");

  const [form, setForm] = useState({
    complaint: "",
    treatment: "",
    attendedBy: "Staff Nurse Shazia (R.N.)",
    parentNotified: false
  });

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === selectedStudentId);
    if (!st) return;

    logClinicVisit({
      studentId: st.id,
      studentName: `${st.firstName} ${st.lastName}`,
      className: st.className,
      complaint: form.complaint,
      treatment: form.treatment,
      attendedBy: form.attendedBy,
      parentNotified: form.parentNotified
    });

    setShowLogModal(false);
    setForm({
      complaint: "",
      treatment: "",
      attendedBy: "Staff Nurse Shazia (R.N.)",
      parentNotified: false
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${isLight ? "border-slate-200" : "border-gray-800"} pb-4`}>
        <div>
          <h1 className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-2`}>
            <Stethoscope className={isLight ? "text-rose-600" : "text-rose-400"} size={22} />
            <span>School Medical Infirmary &amp; Student Health Registry</span>
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Maintain student medical profiles, emergency blood donor registries, allergy alerts, and daily clinic first-aid logs.
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition cursor-pointer"
        >
          <Plus size={14} />
          <span>Record Clinic Visit</span>
        </button>
      </div>

      {/* Student Medical Directory & Emergency Blood Groups */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl p-5 space-y-2`}>
          <div className="flex justify-between items-center text-xs">
            <span className={`text-[10px] uppercase font-bold ${isLight ? "text-rose-700 font-bold" : "text-rose-400"}`}>Infirmary Incharge</span>
            <HeartPulse size={16} className={isLight ? "text-rose-600" : "text-rose-400"} />
          </div>
          <div className={`text-sm font-black ${isLight ? "text-slate-900" : "text-white"}`}>Staff Nurse Shazia (R.N.)</div>
          <div className={`text-xs ${isLight ? "text-slate-600" : "text-gray-400"}`}>Emergency Ext: <b>#109 (Clinic Desk)</b></div>
        </div>

        <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl p-5 space-y-2`}>
          <div className="flex justify-between items-center text-xs">
            <span className={`text-[10px] uppercase font-bold ${isLight ? "text-emerald-700 font-bold" : "text-emerald-400"}`}>First Aid Supplies</span>
            <Activity size={16} className={isLight ? "text-emerald-600" : "text-emerald-400"} />
          </div>
          <div className={`text-sm font-black ${isLight ? "text-emerald-700 font-bold" : "text-emerald-400"}`}>100% Stocked &amp; Inspected</div>
          <div className={`text-xs ${isLight ? "text-slate-600" : "text-gray-400"}`}>Oxygen Cylinder, Nebulizer, Glucometer Active</div>
        </div>

        <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl p-5 space-y-2`}>
          <div className="flex justify-between items-center text-xs">
            <span className={`text-[10px] uppercase font-bold ${isLight ? "text-sky-700 font-bold" : "text-sky-400"}`}>Emergency Hospital Link</span>
            <Phone size={16} className={isLight ? "text-sky-600" : "text-sky-400"} />
          </div>
          <div className={`text-sm font-black ${isLight ? "text-slate-900" : "text-white"}`}>Doctors Hospital / Services Hospital</div>
          <div className={`text-xs ${isLight ? "text-slate-600" : "text-gray-400"}`}>Ambulance Hotline: <b>1122</b></div>
        </div>
      </div>

      {/* Clinic Treatment Log Table */}
      <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl overflow-hidden shadow-2xl`}>
        <div className={`p-4 border-b ${isLight ? "border-slate-100 bg-slate-50/80" : "border-gray-800 bg-black/40"} flex justify-between items-center`}>
          <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-xs uppercase tracking-wider`}>
            Daily Infirmary First-Aid Logs ({clinicVisits.length})
          </h3>
          <span className={`text-[10px] ${isLight ? "text-rose-700 font-bold" : "text-rose-400"} font-mono`}>Infirmary Log 2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b ${isLight ? "border-slate-200 text-slate-600 bg-slate-100/70" : "border-gray-800 text-gray-400 bg-black/20"} font-mono text-[10px]`}>
                <th className="p-4 font-bold">Student Name</th>
                <th className="p-4 font-bold">Class</th>
                <th className="p-4 font-bold">Date &amp; Time</th>
                <th className="p-4 font-bold">Chief Complaint</th>
                <th className="p-4 font-bold">Treatment / Medication</th>
                <th className="p-4 font-bold">Attended By</th>
                <th className="p-4 font-bold text-center">Parent Notified</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? "divide-slate-100" : "divide-gray-800/50"} font-mono text-[10px]`}>
              {clinicVisits.map((v) => (
                <tr key={v.id} className={`${isLight ? "hover:bg-slate-50/80" : "hover:bg-white/[0.02]"} transition`}>
                  <td className={`p-4 font-sans font-bold ${isLight ? "text-slate-900" : "text-white"} text-sm`}>{v.studentName}</td>
                  <td className={`p-4 font-sans ${isLight ? "text-slate-700" : "text-gray-300"}`}>{v.className}</td>
                  <td className={`p-4 ${isLight ? "text-sky-700 font-bold" : "text-sky-300"}`}>{v.date} {v.time}</td>
                  <td className={`p-4 font-sans ${isLight ? "text-rose-700 font-medium" : "text-rose-300"}`}>{v.complaint}</td>
                  <td className={`p-4 font-sans ${isLight ? "text-slate-800" : "text-gray-200"}`}>{v.treatment}</td>
                  <td className={`p-4 font-sans ${isLight ? "text-slate-600" : "text-gray-400"}`}>{v.attendedBy}</td>
                  <td className="p-4 text-center font-sans">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        v.parentNotified
                          ? isLight
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : isLight
                          ? "bg-slate-100 text-slate-600"
                          : "bg-gray-800 text-gray-400"
                      }`}
                    >
                      {v.parentNotified ? "Yes (Called)" : "No (Minor)"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-rose-500/40 text-white"
          } border rounded-3xl w-full max-w-md shadow-2xl p-6 animate-fade-in-up`}>
            <div className={`flex justify-between items-center border-b ${isLight ? "border-slate-100" : "border-gray-800"} pb-3 mb-4`}>
              <div className="flex items-center gap-2">
                <Stethoscope size={16} className={isLight ? "text-rose-600" : "text-rose-400"} />
                <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>Log Student Medical Visit</h3>
              </div>
              <button onClick={() => setShowLogModal(false)} className={`${isLight ? "text-slate-400 hover:text-slate-800" : "text-gray-400 hover:text-white"} cursor-pointer`}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="space-y-4 text-xs">
              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Select Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className={`w-full ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                  } border p-2.5 rounded-xl font-bold`}
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.firstName} {st.lastName} ({st.className} • Blood: {st.bloodGroup || 'B+'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-rose-700 font-bold" : "text-rose-400"} mb-1`}>Chief Medical Complaint *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mild sports injury, headache, nausea"
                  value={form.complaint}
                  onChange={(e) => setForm({ ...form, complaint: e.target.value })}
                  className={`w-full ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                  } border p-2.5 rounded-xl font-bold`}
                />
              </div>

              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Treatment / Medicine Given *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Ice pack application, Paracetamol 250mg, 15 min rest"
                  value={form.treatment}
                  onChange={(e) => setForm({ ...form, treatment: e.target.value })}
                  className={`w-full ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                  } border p-2.5 rounded-xl resize-none`}
                />
              </div>

              <label className={`flex items-center gap-2 text-xs ${isLight ? "text-slate-700" : "text-gray-300"} cursor-pointer`}>
                <input
                  type="checkbox"
                  checked={form.parentNotified}
                  onChange={(e) => setForm({ ...form, parentNotified: e.target.checked })}
                  className="rounded border-gray-400 text-rose-500"
                />
                <span>Parent has been notified via phone</span>
              </label>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black uppercase rounded-xl transition text-xs shadow-lg cursor-pointer"
              >
                Save Clinic Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
