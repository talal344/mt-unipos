"use client";

import React, { useState } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import HRMSTopHeader from "@/components/hrms-top-header";
import { useGlobalContext, HRMSTicket } from "@/context/global-context";
import {
  Ticket,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Send,
  User,
  Building2,
  Cpu,
  DollarSign,
  ShieldCheck,
  Tag,
  X
} from "lucide-react";

export default function HRMSTicketsPage() {
  const {
    currentUser,
    hrEmployees,
    hrmsTickets,
    createHRMSTicket,
    updateHRMSTicketStatus,
    addHRMSTicketReply
  } = useGlobalContext();

  const empMatch = hrEmployees.find(
    (e) => e.email?.toLowerCase().trim() === currentUser?.email?.toLowerCase().trim()
  );

  const userDept = empMatch?.department || (currentUser?.email?.includes("it@") ? "IT & Software Operations" : "Operations");

  const [activeTab, setActiveTab] = useState<"department" | "my">("department");
  const [targetDeptFilter, setTargetDeptFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<HRMSTicket | null>(null);
  const [replyMsg, setReplyMsg] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    targetDepartment: "IT" as "IT" | "HR" | "Finance" | "Admin",
    category: "Software & Password Access",
    subject: "",
    description: "",
    priority: "Medium" as "Low" | "Medium" | "High" | "Critical"
  });

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.description) return;

    createHRMSTicket({
      creatorName: empMatch?.name || currentUser?.name || "Employee User",
      creatorEmail: currentUser?.email || "user@company.com",
      creatorDepartment: userDept,
      targetDepartment: form.targetDepartment,
      category: form.category,
      subject: form.subject,
      description: form.description,
      priority: form.priority,
      status: "Open"
    });

    setShowCreateModal(false);
    setForm({
      targetDepartment: "IT",
      category: "Software & Password Access",
      subject: "",
      description: "",
      priority: "Medium"
    });
    triggerToast("✅ Internal Support Ticket successfully generated!");
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMsg.trim() || !selectedTicket) return;

    addHRMSTicketReply(selectedTicket.id, replyMsg.trim());
    setReplyMsg("");

    // Refresh selected ticket in modal
    const updated = hrmsTickets.find((t) => t.id === selectedTicket.id);
    if (updated) setSelectedTicket(updated);
    triggerToast("💬 Message response sent!");
  };

  // Filtered Tickets
  const filteredTickets = hrmsTickets.filter((t) => {
    if (activeTab === "my") {
      if (t.creatorEmail.toLowerCase() !== currentUser?.email?.toLowerCase()) return false;
    }
    if (targetDeptFilter !== "All" && t.targetDepartment !== targetDeptFilter) return false;
    if (statusFilter !== "All" && t.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchSub = t.subject.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchNum = t.ticketNumber.toLowerCase().includes(q);
      const matchCreator = t.creatorName.toLowerCase().includes(q);
      if (!matchSub && !matchDesc && !matchNum && !matchCreator) return false;
    }
    return true;
  });

  return (
    <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans">
      <HRMSSidebar />

      <main className="flex-grow overflow-y-auto max-h-screen">
        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-black px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 size={16} />
            <span>{toastMsg}</span>
          </div>
        )}

        <HRMSTopHeader
          title="🎫 HRMS Internal Helpdesk & Ticket Management"
          subtitle="Cross-department service requests, IT issues, HR queries, and Finance support tracking."
        />

        <div className="p-6 space-y-6">
          {/* Top Control Bar & Create Ticket Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
            <div className="flex border-b border-gray-800 space-x-2">
              <button
                onClick={() => setActiveTab("department")}
                className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold transition border-b-2 ${
                  activeTab === "department"
                    ? "border-emerald-400 text-emerald-400 bg-emerald-500/10 rounded-t-xl"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                <Building2 size={15} /> Department Support Desk Queue ({hrmsTickets.length})
              </button>
              <button
                onClick={() => setActiveTab("my")}
                className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold transition border-b-2 ${
                  activeTab === "my"
                    ? "border-emerald-400 text-emerald-400 bg-emerald-500/10 rounded-t-xl"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                <User size={15} /> My Generated Tickets (
                {hrmsTickets.filter((t) => t.creatorEmail.toLowerCase() === currentUser?.email?.toLowerCase()).length})
              </button>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition"
            >
              <Plus size={16} /> Generate Service Ticket
            </button>
          </div>

          {/* Filters & Search Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0b0f17] border border-gray-800 p-4 rounded-2xl">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Search ticket #, subject, or employee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-gray-800 text-xs text-white pl-9 pr-3 py-2.5 rounded-xl outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <select
                value={targetDeptFilter}
                onChange={(e) => setTargetDeptFilter(e.target.value)}
                className="w-full bg-black border border-gray-800 text-xs text-white px-3 py-2.5 rounded-xl outline-none focus:border-emerald-500"
              >
                <option value="All">All Target Support Departments</option>
                <option value="IT">💻 IT Operations &amp; Systems</option>
                <option value="HR">👥 HR &amp; People Operations</option>
                <option value="Finance">💰 Finance &amp; Payroll Accounts</option>
                <option value="Admin">🏢 Admin &amp; Infrastructure</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-black border border-gray-800 text-xs text-white px-3 py-2.5 rounded-xl outline-none focus:border-emerald-500"
              >
                <option value="All">All Ticket Statuses</option>
                <option value="Open">🟢 Open / New</option>
                <option value="In Progress">🟡 In Progress</option>
                <option value="Resolved">🔵 Resolved</option>
                <option value="Closed">⚪ Closed</option>
              </select>
            </div>
          </div>

          {/* Tickets List */}
          {filteredTickets.length === 0 ? (
            <div className="p-12 bg-[#0b0f17] border border-gray-800 rounded-2xl text-center space-y-2">
              <Ticket size={40} className="text-gray-600 mx-auto" />
              <h3 className="text-sm font-black text-white">No Tickets Found</h3>
              <p className="text-xs text-gray-400">There are no service tickets matching your selected criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className="bg-[#0b0f17] border border-gray-800 hover:border-emerald-500/50 p-5 rounded-2xl space-y-3 cursor-pointer transition shadow-xl group"
                >
                  <div className="flex items-center justify-between border-b border-gray-800/80 pb-2.5">
                    <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      {t.ticketNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        t.status === "Open"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : t.status === "In Progress"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : t.status === "Resolved"
                          ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
                          : "bg-gray-700/50 text-gray-400 border-gray-600"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-white group-hover:text-emerald-400 transition truncate">
                      {t.subject}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{t.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-gray-800/80 font-mono">
                    <span className="flex items-center gap-1 text-sky-300 font-bold">
                      Target: {t.targetDepartment} Desk
                    </span>
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      Priority: {t.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono pt-1">
                    <span>By: <strong className="text-gray-300">{t.creatorName}</strong> ({t.creatorDepartment})</span>
                    <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Ticket Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#090d16] border border-emerald-500/30 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>

              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Ticket size={20} className="text-emerald-400" />
                  Generate Internal Service Ticket
                </h3>
                <p className="text-xs text-gray-400">
                  Submit a helpdesk ticket to IT, HR, Finance, or Admin department.
                </p>
              </div>

              <form onSubmit={handleCreateTicketSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Target Department</label>
                    <select
                      value={form.targetDepartment}
                      onChange={(e) => setForm({ ...form, targetDepartment: e.target.value as any })}
                      className="w-full bg-black border border-gray-800 text-xs text-white rounded-xl p-2.5 outline-none focus:border-emerald-500"
                    >
                      <option value="IT">💻 IT Operations &amp; Systems</option>
                      <option value="HR">👥 HR &amp; People Operations</option>
                      <option value="Finance">💰 Finance &amp; Payroll Accounts</option>
                      <option value="Admin">🏢 Admin &amp; Infrastructure</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Priority Level</label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                      className="w-full bg-black border border-gray-800 text-xs text-white rounded-xl p-2.5 outline-none focus:border-emerald-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">🔴 Critical / Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. Password Reset, Payslip Correction, Hardware"
                    className="w-full bg-black border border-gray-800 text-xs text-white rounded-xl p-2.5 outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Brief summary of request..."
                    className="w-full bg-black border border-gray-800 text-xs text-white rounded-xl p-2.5 outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Detailed Description</label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Explain the issue or service request in detail..."
                    className="w-full bg-black border border-gray-800 text-xs text-white rounded-xl p-2.5 outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-300 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg transition"
                  >
                    Submit Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View / Reply Ticket Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#090d16] border border-emerald-500/30 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl relative max-h-[90vh] flex flex-col">
              <button
                onClick={() => setSelectedTicket(null)}
                className="absolute right-4 top-4 text-gray-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>

              <div className="border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    {selectedTicket.ticketNumber}
                  </span>
                  <span className="text-xs font-mono font-bold text-sky-400">
                    Target: {selectedTicket.targetDepartment} Department
                  </span>
                </div>
                <h3 className="text-lg font-black text-white mt-1">{selectedTicket.subject}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Created by <strong className="text-gray-200">{selectedTicket.creatorName}</strong> ({selectedTicket.creatorDepartment}) on {new Date(selectedTicket.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Status Update Actions for Support Department Users */}
              <div className="p-3 bg-black/50 border border-gray-800 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-400 font-bold">Status:</span>
                  <span className="font-mono font-extrabold text-emerald-400">{selectedTicket.status}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      updateHRMSTicketStatus(selectedTicket.id, "In Progress");
                      setSelectedTicket({ ...selectedTicket, status: "In Progress" });
                      triggerToast("Updated status to In Progress!");
                    }}
                    className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold rounded-lg hover:bg-amber-500/30 transition"
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => {
                      updateHRMSTicketStatus(selectedTicket.id, "Resolved");
                      setSelectedTicket({ ...selectedTicket, status: "Resolved" });
                      triggerToast("Updated status to Resolved!");
                    }}
                    className="px-2.5 py-1 bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold rounded-lg hover:bg-sky-500/30 transition"
                  >
                    Resolve Ticket
                  </button>
                </div>
              </div>

              {/* Description Body */}
              <div className="p-4 bg-black/40 border border-gray-800 rounded-xl text-xs text-gray-300 space-y-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase block">Ticket Details:</span>
                <p className="whitespace-pre-wrap leading-relaxed">{selectedTicket.description}</p>
              </div>

              {/* Chat & Replies Timeline */}
              <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-black/30 border border-gray-800 rounded-xl max-h-60">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  💬 Response Activity Chat Thread:
                </span>
                {(!selectedTicket.replies || selectedTicket.replies.length === 0) ? (
                  <p className="text-xs text-gray-500 italic text-center py-4">No replies yet. Start conversation below.</p>
                ) : (
                  selectedTicket.replies.map((r) => (
                    <div key={r.id} className="p-3 bg-gray-900/80 border border-gray-800 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-emerald-400">{r.senderName} ({r.senderRole})</span>
                        <span className="font-mono text-gray-500">{new Date(r.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-gray-200">{r.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message or response..."
                  value={replyMsg}
                  onChange={(e) => setReplyMsg(e.target.value)}
                  className="flex-1 bg-black border border-gray-800 text-xs text-white px-3 py-2.5 rounded-xl outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1 transition shadow-lg"
                >
                  <Send size={14} /> Send
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
