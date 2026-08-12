"use client";

import React, { useState, useEffect, useMemo } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import HRMSTopHeader from "@/components/hrms-top-header";
import { useGlobalContext } from "@/context/global-context";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  X,
  FileText,
  Upload,
  Check,
  Ban,
  WalletCards
} from "lucide-react";

interface ExpenseClaim {
  id: string;
  claimCode: string;
  employeeId: string;
  employeeName: string;
  department: string;
  category: "Fuel & Travel" | "Client Entertainment" | "Office Supplies" | "Food & Meals" | "Emergency Maintenance" | "Other";
  amount: number;
  date: string;
  description: string;
  receiptFileName?: string;
  status: "Pending Approval" | "Approved" | "Disbursed" | "Rejected";
  approvedBy?: string;
  disbursedDate?: string;
  notes?: string;
}

export default function ExpenseClaimsPage() {
  const { currentUser, hrEmployees, currencySymbol } = useGlobalContext();
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<ExpenseClaim | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    if (currentUser?.tenantId) {
      const key = `hr_expense_claims_${currentUser.tenantId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed: ExpenseClaim[] = JSON.parse(saved);
          const filtered = parsed.filter(c => c.id !== "CLM-1" && c.id !== "CLM-2" && c.claimCode !== "EXP-1001" && c.claimCode !== "EXP-1002");
          setClaims(filtered);
          if (filtered.length !== parsed.length) {
            localStorage.setItem(key, JSON.stringify(filtered));
          }
        } catch {
          setClaims([]);
        }
      } else {
        setClaims([]);
      }
    }
  }, [currentUser?.tenantId]);

  const saveClaims = (data: ExpenseClaim[]) => {
    setClaims(data);
    if (currentUser?.tenantId) {
      localStorage.setItem(`hr_expense_claims_${currentUser.tenantId}`, JSON.stringify(data));
    }
  };

  const [form, setForm] = useState({
    employeeId: "",
    category: "Fuel & Travel" as ExpenseClaim["category"],
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    description: "",
    receiptFileName: ""
  });

  const handleCreateClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = hrEmployees.find((e) => e.id === form.employeeId);
    if (!emp) return;

    const count = claims.length + 1;
    const newClaim: ExpenseClaim = {
      id: `CLM-${Date.now()}`,
      claimCode: `EXP-${1000 + count}`,
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      category: form.category,
      amount: Number(form.amount) || 0,
      date: form.date,
      description: form.description,
      receiptFileName: form.receiptFileName || "Receipt_Voucher.pdf",
      status: "Pending Approval"
    };

    saveClaims([newClaim, ...claims]);
    setShowAddModal(false);
    setForm({
      employeeId: "",
      category: "Fuel & Travel",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      description: "",
      receiptFileName: ""
    });
    triggerToast("✅ Expense claim filed for approval!");
  };

  const handleUpdateStatus = (id: string, newStatus: ExpenseClaim["status"]) => {
    const updated = claims.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          status: newStatus,
          approvedBy: currentUser?.name || "Finance Admin",
          disbursedDate: newStatus === "Disbursed" ? new Date().toISOString().split("T")[0] : c.disbursedDate
        };
      }
      return c;
    });
    saveClaims(updated);
    triggerToast(`✨ Claim updated to ${newStatus}!`);
  };

  const filteredClaims = useMemo(() => {
    return claims.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        q === "" ||
        c.employeeName.toLowerCase().includes(q) ||
        c.claimCode.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || c.status === statusFilter;
      const matchCategory = categoryFilter === "All" || c.category === categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [claims, searchQuery, statusFilter, categoryFilter]);

  const totalClaimed = claims.reduce((acc, c) => acc + c.amount, 0);
  const totalPending = claims.filter((c) => c.status === "Pending Approval").reduce((acc, c) => acc + c.amount, 0);
  const totalDisbursed = claims.filter((c) => c.status === "Disbursed").reduce((acc, c) => acc + c.amount, 0);

  return (
    <div className="flex h-screen bg-[#05080d] text-gray-100 font-sans overflow-hidden">
      <HRMSSidebar />

      <main className="flex-grow overflow-y-auto h-full relative">
        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-black px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce border border-emerald-400/50">
            <CheckCircle2 size={16} />
            <span>{toastMsg}</span>
          </div>
        )}

        <HRMSTopHeader
          title="🧾 Employee Expense Claims & Petty Cash Hub"
          subtitle="Submit out-of-pocket receipts, manager approval workflows, petty cash disbursements, and payroll reimbursements."
        />

        <div className="p-6 space-y-6">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-4.5">
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Total Claims Filed</p>
              <p className="text-2xl font-black text-white">{claims.length} Claims</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Value: {currencySymbol || "$"}{totalClaimed.toLocaleString()}</p>
            </div>

            <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-4.5">
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Pending Approval</p>
              <p className="text-2xl font-black text-amber-400">
                {currencySymbol || "$"}{totalPending.toLocaleString()}
              </p>
              <p className="text-[10px] text-amber-500/80 mt-0.5">
                {claims.filter((c) => c.status === "Pending Approval").length} Awaiting Manager Review
              </p>
            </div>

            <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-4.5">
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Disbursed / Paid</p>
              <p className="text-2xl font-black text-emerald-400">
                {currencySymbol || "$"}{totalDisbursed.toLocaleString()}
              </p>
              <p className="text-[10px] text-emerald-500/80 mt-0.5">Reimbursed to Staff</p>
            </div>

            <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-4.5 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Submit New Claim</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-1 flex items-center gap-1.5 text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 px-3.5 py-2 rounded-xl transition shadow cursor-pointer"
                >
                  <Plus size={14} /> File Claim
                </button>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0b0f17] border border-gray-800 p-3 rounded-2xl">
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search by code, staff name, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-gray-800 pl-9 pr-3 py-2 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-black border border-gray-800 text-xs text-gray-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Approved">Approved</option>
                <option value="Disbursed">Disbursed</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-black border border-gray-800 text-xs text-gray-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Fuel & Travel">Fuel &amp; Travel</option>
                <option value="Client Entertainment">Client Entertainment</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Food & Meals">Food &amp; Meals</option>
                <option value="Emergency Maintenance">Emergency Maintenance</option>
              </select>
            </div>
          </div>

          {/* Claims Table */}
          <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-black/40 text-[10px] text-gray-500 uppercase tracking-wider font-mono border-b border-gray-800">
                    <th className="p-3.5">Claim ID</th>
                    <th className="p-3.5">Employee</th>
                    <th className="p-3.5">Category &amp; Reason</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {filteredClaims.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500 text-xs">
                        No expense claims found matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredClaims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-emerald-500/5 transition">
                        <td className="p-3.5 font-mono font-bold text-emerald-400">{claim.claimCode}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-white">{claim.employeeName}</div>
                          <div className="text-[10px] text-gray-500 font-mono">{claim.department}</div>
                        </td>
                        <td className="p-3.5 max-w-xs">
                          <div className="font-bold text-gray-200">{claim.category}</div>
                          <div className="text-[11px] text-gray-400 truncate">{claim.description}</div>
                        </td>
                        <td className="p-3.5 font-mono text-gray-400">{claim.date}</td>
                        <td className="p-3.5 font-mono font-black text-white text-sm">
                          {currencySymbol || "$"}{claim.amount.toLocaleString()}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                              claim.status === "Disbursed"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : claim.status === "Approved"
                                ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                                : claim.status === "Pending Approval"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                            }`}
                          >
                            {claim.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {claim.status === "Pending Approval" && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(claim.id, "Approved")}
                                  className="flex items-center gap-1 text-[10px] font-bold text-white bg-sky-600 hover:bg-sky-500 px-2.5 py-1.2 rounded-lg transition cursor-pointer"
                                >
                                  <Check size={12} /> Approve
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(claim.id, "Rejected")}
                                  className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 hover:bg-red-600 hover:text-white px-2 py-1.2 rounded-lg transition cursor-pointer"
                                >
                                  <Ban size={12} /> Reject
                                </button>
                              </>
                            )}

                            {claim.status === "Approved" && (
                              <button
                                onClick={() => handleUpdateStatus(claim.id, "Disbursed")}
                                className="flex items-center gap-1 text-[10px] font-bold text-black bg-emerald-400 hover:bg-emerald-300 px-2.5 py-1.2 rounded-lg transition cursor-pointer"
                              >
                                <WalletCards size={12} /> Disburse Cash
                              </button>
                            )}

                            {claim.status === "Disbursed" && (
                              <span className="text-[11px] text-gray-500 italic">Settled</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* File Claim Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c1018] border border-emerald-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-emerald-500/5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt size={16} className="text-emerald-400" />
                File Expense &amp; Petty Cash Reimbursement
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateClaim} className="p-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Employee</label>
                <select
                  required
                  value={form.employeeId}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-emerald-500 cursor-pointer"
                >
                  <option value="">Select Employee...</option>
                  {hrEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} &bull; {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Fuel & Travel">Fuel &amp; Travel</option>
                    <option value="Client Entertainment">Client Entertainment</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Food & Meals">Food &amp; Meals</option>
                    <option value="Emergency Maintenance">Emergency Maintenance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Amount ({currencySymbol || "$"})</label>
                  <input
                    required
                    type="number"
                    value={form.amount || ""}
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                    className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Expense Date</label>
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Reason &amp; Description</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Details of expense, purpose, and vendor..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Receipt Attachment File</label>
                <input
                  type="text"
                  placeholder="e.g. Shell_Fuel_Receipt_10Feb.pdf"
                  value={form.receiptFileName}
                  onChange={(e) => setForm({ ...form, receiptFileName: e.target.value })}
                  className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-emerald-950/50 cursor-pointer"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
