"use client";

import React, { useState } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import { useGlobalContext } from "@/context/global-context";
import {
  TrendingUp,
  Plus,
  Star,
  Award,
  CheckCircle2,
  X,
  Building2,
  Calendar
} from "lucide-react";

export default function HRPerformancePage() {
  const {
    hrEmployees,
    hrAppraisals,
    addHRAppraisal
  } = useGlobalContext();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    employeeId: "",
    reviewPeriod: "Q3 2026",
    rating: 5,
    comments: ""
  });

  const handleOpenAdd = () => {
    if (hrEmployees.length > 0) {
      setForm({
        employeeId: hrEmployees[0].id,
        reviewPeriod: "Q3 2026",
        rating: 5,
        comments: ""
      });
    }
    setShowModal(true);
  };

  const handleSaveAppraisal = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = hrEmployees.find((e) => e.id === form.employeeId);
    if (!emp || !form.comments.trim()) return;

    addHRAppraisal({
      employeeId: emp.id,
      employeeName: emp.name,
      reviewPeriod: form.reviewPeriod,
      rating: form.rating,
      comments: form.comments.trim(),
      status: "Completed"
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
              <TrendingUp size={20} className="text-pink-400" />
              Performance Reviews &amp; Appraisals (KPIs)
            </h1>
            <p className="text-xs text-gray-400">
              Evaluate staff quarterly performance, record Manager feedback ratings, and manage salary increments.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition"
          >
            <Plus size={14} /> Submit Performance Review
          </button>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hrAppraisals.length === 0 ? (
            <div className="col-span-full p-12 bg-[#0b0f17] border border-gray-800 rounded-2xl text-center text-gray-500 italic text-xs">
              No performance reviews submitted yet. Click "Submit Performance Review" to add.
            </div>
          ) : (
            hrAppraisals.map((rev) => (
              <div
                key={rev.id}
                className="bg-[#0b0f17] border border-gray-800 hover:border-pink-500/40 p-5 rounded-2xl space-y-3 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white text-base">{rev.employeeName}</h3>
                    <div className="text-[10px] text-pink-400 font-mono mt-0.5">{rev.reviewPeriod}</div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg text-amber-400 text-xs font-black">
                    <Star size={12} className="fill-amber-400" />
                    <span>{rev.rating} / 5</span>
                  </div>
                </div>

                <div className="p-3 bg-black/40 border border-gray-800 rounded-xl text-xs text-gray-300 italic">
                  "{rev.comments}"
                </div>

                <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono pt-1">
                  <span>Date: {rev.date}</span>
                  <span className="text-emerald-400 font-bold">Status: {rev.status}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal: Add Review */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-sans">
            <div className="bg-[#0b0f17] border border-pink-500/40 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
              <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-black/40">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-pink-400" />
                  <h3 className="font-bold text-white text-base">Submit Staff Appraisal</h3>
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveAppraisal} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Select Employee *</label>
                  <select
                    value={form.employeeId}
                    onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
                  >
                    {hrEmployees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.department} - {e.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Review Period</label>
                    <input
                      type="text"
                      placeholder="e.g. Q3 2026"
                      value={form.reviewPeriod}
                      onChange={(e) => setForm({ ...form, reviewPeriod: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-amber-400 mb-1">Performance Rating (1-5)</label>
                    <select
                      value={form.rating}
                      onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value, 10) })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
                    >
                      <option value={5}>5 ★★★★★ (Exceptional)</option>
                      <option value={4}>4 ★★★★☆ (Exceeds Expectations)</option>
                      <option value={3}>3 ★★★☆☆ (Meets Expectations)</option>
                      <option value={2}>2 ★★☆☆☆ (Needs Improvement)</option>
                      <option value={1}>1 ★☆☆☆☆ (Unsatisfactory)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Manager Appraisal Feedback *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Enter performance feedback comments..."
                    value={form.comments}
                    onChange={(e) => setForm({ ...form, comments: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white resize-none"
                  />
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
                    className="flex-1 py-3 bg-pink-600 hover:bg-pink-500 text-white font-black uppercase tracking-wider rounded-xl transition shadow-lg"
                  >
                    Save Appraisal
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
