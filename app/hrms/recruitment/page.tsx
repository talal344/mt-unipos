"use client";

import React, { useState } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import { useGlobalContext } from "@/context/global-context";
import {
  UserPlus,
  Plus,
  Briefcase,
  Users,
  CheckCircle2,
  X,
  Search,
  Building2,
  Calendar
} from "lucide-react";

export default function HRRecruitmentPage() {
  const {
    hrJobs,
    addHRJobOpening,
    updateHRJobOpening
  } = useGlobalContext();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    department: "Operations",
    vacancies: "1"
  });

  const handleOpenAdd = () => {
    setForm({ title: "", department: "Operations", vacancies: "1" });
    setShowModal(true);
  };

  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    addHRJobOpening({
      title: form.title.trim(),
      department: form.department,
      vacancies: parseInt(form.vacancies, 10) || 1,
      status: "Open"
    });

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
              <UserPlus size={20} className="text-sky-400" />
              Recruitment &amp; Applicant Tracking (ATS)
            </h1>
            <p className="text-xs text-gray-400">
              Manage corporate job vacancies, track applicants pipeline, and conduct interviews.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition"
          >
            <Plus size={14} /> Post Job Opening
          </button>
        </div>

        {/* Job Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hrJobs.length === 0 ? (
            <div className="col-span-full p-12 bg-[#0b0f17] border border-gray-800 rounded-2xl text-center text-gray-500 italic text-xs">
              No active job openings posted. Click "Post Job Opening" to create one.
            </div>
          ) : (
            hrJobs.map((job) => (
              <div
                key={job.id}
                className="bg-[#0b0f17] border border-gray-800 hover:border-sky-500/40 p-5 rounded-2xl space-y-3 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white text-base">{job.title}</h3>
                    <div className="text-[10px] text-sky-400 font-mono mt-0.5">{job.department}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${
                      job.status === "Open"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-gray-800 border-gray-700 text-gray-400"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-black/40 p-2.5 rounded-xl text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-gray-500 block">Vacancies</span>
                    <strong className="text-white">{job.vacancies} Position(s)</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 block">Applicants</span>
                    <strong className="text-sky-400">{job.applicantsCount} Applied</strong>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  {job.status === "Open" ? (
                    <button
                      onClick={() => updateHRJobOpening(job.id, { status: "Closed" })}
                      className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs rounded-xl transition"
                    >
                      Close Hiring
                    </button>
                  ) : (
                    <button
                      onClick={() => updateHRJobOpening(job.id, { status: "Open" })}
                      className="w-full py-2 bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white font-bold text-xs rounded-xl transition border border-sky-500/30"
                    >
                      Re-open Job
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal: Post Job */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-sans">
            <div className="bg-[#0b0f17] border border-sky-500/40 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
              <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-black/40">
                <div className="flex items-center gap-2">
                  <UserPlus size={18} className="text-sky-400" />
                  <h3 className="font-bold text-white text-base">Post New Job Opening</h3>
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveJob} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Job Title / Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Accountant"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Department</label>
                    <select
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
                    >
                      <option>Operations</option>
                      <option>Human Resources</option>
                      <option>Accounts &amp; Finance</option>
                      <option>Sales &amp; Retail</option>
                      <option>Inventory &amp; Warehouse</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Vacancies</label>
                    <input
                      type="number"
                      min={1}
                      value={form.vacancies}
                      onChange={(e) => setForm({ ...form, vacancies: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono"
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
                    className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white font-black uppercase tracking-wider rounded-xl transition shadow-lg"
                  >
                    Publish Listing
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
