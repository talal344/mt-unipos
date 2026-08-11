"use client";

import React, { useState, useMemo } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import HRMSTopHeader from "@/components/hrms-top-header";
import { useGlobalContext, HRLoan, HRLoanRepayment } from "@/context/global-context";
import {
  HandCoins,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  DollarSign,
  Calendar,
  AlertCircle,
  Check,
  X,
  Printer,
  ChevronRight,
  TrendingUp,
  FileText,
  User,
  Users,
  ShieldCheck,
  Building2,
  CreditCard,
  History,
  Trash2,
  Sparkles,
  ArrowRight,
  Receipt
} from "lucide-react";

export default function HRLoansPage() {
  const {
    currentUser,
    hrEmployees,
    hrLoans,
    applyHRLoan,
    updateHRLoanStatus,
    recordLoanManualRepayment,
    deleteHRLoan,
    currencySymbol
  } = useGlobalContext();

  const [activeTab, setActiveTab] = useState<"all" | "active" | "pending" | "advances" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Apply Loan Modal State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [loanType, setLoanType] = useState<HRLoan["type"]>("Personal Loan");
  const [principalAmount, setPrincipalAmount] = useState<number>(50000);
  const [tenureMonths, setTenureMonths] = useState<number>(5);
  const [startMonth, setStartMonth] = useState<string>(() => new Date().toISOString().slice(0, 7));
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Ledger / Details Drawer State
  const [viewingLoan, setViewingLoan] = useState<HRLoan | null>(null);
  const [showManualPayModal, setShowManualPayModal] = useState(false);
  const [manualPayAmount, setManualPayAmount] = useState<number>(0);
  const [manualPayNotes, setManualPayNotes] = useState<string>("Cash settlement at Finance counter");

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const selectedEmp = hrEmployees.find((e) => e.id === selectedEmpId);

  // Dynamic monthly installment calculation
  const calculatedMonthlyInstallment = useMemo(() => {
    const t = Math.max(1, tenureMonths);
    const p = Math.max(0, principalAmount);
    return Math.round(p / t);
  }, [principalAmount, tenureMonths]);

  // Handle Loan Application Submit
  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) {
      triggerToast("⚠️ Please select an employee");
      return;
    }
    if (principalAmount <= 0) {
      triggerToast("⚠️ Please enter a valid loan amount");
      return;
    }

    const isAdvance = loanType === "Salary Advance";
    const actualTenure = isAdvance ? 1 : tenureMonths;
    const monthlyInstallment = Math.round(principalAmount / actualTenure);

    const isAutoApproved = currentUser?.role === "Owner" || (currentUser?.role as string) === "HR";

    applyHRLoan({
      employeeId: selectedEmp.id,
      employeeName: selectedEmp.name,
      employeeCode: selectedEmp.employeeCode || "EMP-001",
      department: selectedEmp.department,
      designation: selectedEmp.designation,
      type: loanType,
      principalAmount,
      tenureMonths: actualTenure,
      monthlyInstallment,
      disbursedAmount: principalAmount,
      reason: reason || "Emergency personal / household support",
      disbursementDate: new Date().toISOString().split("T")[0],
      startDeductionMonth: startMonth,
      status: isAutoApproved ? "Active" : "Pending Approval",
      approvedBy: isAutoApproved ? currentUser?.name || "Executive HR" : undefined,
      approvedAt: isAutoApproved ? new Date().toISOString().split("T")[0] : undefined,
      notes: notes || undefined
    });

    setShowApplyModal(false);
    setSelectedEmpId("");
    setPrincipalAmount(50000);
    setTenureMonths(5);
    setReason("");
    setNotes("");
    triggerToast(
      isAutoApproved
        ? `✅ Loan for ${selectedEmp.name} sanctioned & active!`
        : `📋 Loan application submitted for approval.`
    );
  };

  const handleManualRepaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingLoan || manualPayAmount <= 0) return;

    recordLoanManualRepayment(viewingLoan.id, manualPayAmount, manualPayNotes);
    setShowManualPayModal(false);
    setManualPayAmount(0);
    triggerToast(`💵 Payment of ${currencySymbol} ${manualPayAmount.toLocaleString()} recorded!`);

    // Refresh viewing loan from updated list
    const updated = hrLoans.find((l) => l.id === viewingLoan.id);
    if (updated) setViewingLoan(updated);
  };

  // Filtered Loans
  const filteredLoans = useMemo(() => {
    return hrLoans.filter((loan) => {
      let matchTab = true;
      if (activeTab === "active") matchTab = loan.status === "Active";
      else if (activeTab === "pending") matchTab = loan.status === "Pending Approval";
      else if (activeTab === "advances") matchTab = loan.type === "Salary Advance";
      else if (activeTab === "completed") matchTab = loan.status === "Completed";

      const q = searchQuery.toLowerCase();
      const matchSearch =
        q === "" ||
        loan.employeeName.toLowerCase().includes(q) ||
        loan.loanCode.toLowerCase().includes(q) ||
        loan.department.toLowerCase().includes(q) ||
        loan.type.toLowerCase().includes(q);

      return matchTab && matchSearch;
    });
  }, [hrLoans, activeTab, searchQuery]);

  // Overall Statistics
  const totalDisbursed = hrLoans.reduce((sum, l) => sum + (l.status !== "Rejected" ? l.principalAmount : 0), 0);
  const totalRecovered = hrLoans.reduce((sum, l) => sum + l.totalRepaid, 0);
  const totalOutstanding = hrLoans.reduce((sum, l) => sum + (l.status === "Active" ? l.remainingBalance : 0), 0);
  const activeLoansCount = hrLoans.filter((l) => l.status === "Active").length;
  const pendingApprovalsCount = hrLoans.filter((l) => l.status === "Pending Approval").length;

  return (
    <div className="flex h-screen bg-[#05080d] text-gray-100 font-sans overflow-hidden">
      <HRMSSidebar />

      <main className="flex-grow overflow-y-auto h-full">
        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-black px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce border border-emerald-400/50">
            <CheckCircle2 size={16} />
            <span>{toastMsg}</span>
          </div>
        )}

        <HRMSTopHeader
          title="Loans & Salary Advance Management"
          subtitle="Sanction employee loans, manage EMI installment schedules, and auto-recover balances seamlessly via monthly payroll runs."
        />

        <div className="p-6 space-y-6">
          {/* Top Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0b0f17] border border-emerald-500/20 p-4 rounded-2xl shadow-xl flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-gray-400">Total Active Loans</div>
                <div className="text-2xl font-black text-white mt-1">{activeLoansCount} Loans</div>
                <div className="text-[10px] text-emerald-400 font-medium mt-0.5">
                  {pendingApprovalsCount > 0 ? `⚠️ ${pendingApprovalsCount} awaiting approval` : "All approvals up to date"}
                </div>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <HandCoins size={22} />
              </div>
            </div>

            <div className="bg-[#0b0f17] border border-blue-500/20 p-4 rounded-2xl shadow-xl flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-gray-400">Total Disbursed Capital</div>
                <div className="text-2xl font-black text-blue-400 mt-1 font-mono">
                  {currencySymbol} {totalDisbursed.toLocaleString()}
                </div>
                <div className="text-[10px] text-gray-400 font-medium mt-0.5">Company-wide loan portfolio</div>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                <DollarSign size={22} />
              </div>
            </div>

            <div className="bg-[#0b0f17] border border-purple-500/20 p-4 rounded-2xl shadow-xl flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-gray-400">Total Recovered via Payroll</div>
                <div className="text-2xl font-black text-purple-400 mt-1 font-mono">
                  {currencySymbol} {totalRecovered.toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-400 font-medium mt-0.5">
                  {totalDisbursed > 0 ? `${Math.round((totalRecovered / totalDisbursed) * 100)}% recovery rate` : "0%"}
                </div>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
                <TrendingUp size={22} />
              </div>
            </div>

            <div className="bg-[#0b0f17] border border-amber-500/20 p-4 rounded-2xl shadow-xl flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-gray-400">Outstanding Balance</div>
                <div className="text-2xl font-black text-amber-400 mt-1 font-mono">
                  {currencySymbol} {totalOutstanding.toLocaleString()}
                </div>
                <div className="text-[10px] text-amber-300/80 font-medium mt-0.5">Scheduled for auto-recovery</div>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                <Clock size={22} />
              </div>
            </div>
          </div>

          {/* Action Bar & Filter Tabs */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-gray-900/90 border border-gray-800 p-4 rounded-2xl shadow-xl">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {[
                { id: "all", label: "All Records", count: hrLoans.length },
                { id: "active", label: "Active Loans", count: activeLoansCount },
                { id: "pending", label: "Pending Approval", count: pendingApprovalsCount },
                { id: "advances", label: "Salary Advances", count: hrLoans.filter((l) => l.type === "Salary Advance").length },
                { id: "completed", label: "Completed", count: hrLoans.filter((l) => l.status === "Completed").length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/40"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[10px] bg-black/40 px-1.5 py-0.2 rounded-full font-mono">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Actions: Search & Apply Button */}
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-60">
                <Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search loan, code, staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/60 border border-gray-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={() => setShowApplyModal(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xs px-4 py-2 rounded-xl transition shadow-lg shadow-emerald-950/40 flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Plus size={14} />
                <span>Apply / Sanction Loan</span>
              </button>
            </div>
          </div>

          {/* Loans Ledger Table */}
          <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/40">
              <h3 className="font-bold text-white text-xs flex items-center gap-2">
                <HandCoins size={15} className="text-emerald-400" />
                <span>Loan Portfolios &amp; Repayment Ledgers ({filteredLoans.length})</span>
              </h3>
              <span className="text-[10px] text-gray-400">
                Auto-deductions are integrated with <span className="text-emerald-400 font-bold">/hrms/payroll</span>
              </span>
            </div>

            {filteredLoans.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mx-auto text-gray-500">
                  <HandCoins size={24} />
                </div>
                <h4 className="text-sm font-bold text-gray-300">No Loan Records Found</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Click &apos;Apply / Sanction Loan&apos; to issue an emergency advance or multi-month company loan.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead className="bg-black/60 text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-800">
                    <tr>
                      <th className="p-3.5">Loan Code</th>
                      <th className="p-3.5">Employee</th>
                      <th className="p-3.5">Type & Reason</th>
                      <th className="p-3.5 text-right">Principal</th>
                      <th className="p-3.5 text-right">Monthly EMI</th>
                      <th className="p-3.5">Repayment Progress</th>
                      <th className="p-3.5 text-right">Remaining</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 font-medium">
                    {filteredLoans.map((loan) => {
                      const percentPaid = loan.principalAmount > 0 ? Math.round((loan.totalRepaid / loan.principalAmount) * 100) : 0;
                      const deductedCount = loan.repayments.filter((r) => r.status === "Deducted").length;

                      return (
                        <tr key={loan.id} className="hover:bg-gray-800/30 transition">
                          {/* Loan Code */}
                          <td className="p-3.5 font-mono font-bold text-emerald-400">
                            {loan.loanCode}
                          </td>

                          {/* Employee */}
                          <td className="p-3.5 text-white">
                            <div className="font-bold">{loan.employeeName}</div>
                            <div className="text-[10px] text-gray-500 font-mono">
                              {loan.employeeCode} • {loan.department}
                            </div>
                          </td>

                          {/* Type & Reason */}
                          <td className="p-3.5">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-0.5 ${
                                loan.type === "Salary Advance"
                                  ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              }`}
                            >
                              {loan.type}
                            </span>
                            <div className="text-[10px] text-gray-400 truncate max-w-xs">{loan.reason}</div>
                          </td>

                          {/* Principal */}
                          <td className="p-3.5 text-right font-mono font-bold text-gray-200">
                            {currencySymbol} {loan.principalAmount.toLocaleString()}
                            <div className="text-[10px] text-gray-500">{loan.tenureMonths} Mo. tenure</div>
                          </td>

                          {/* Monthly EMI */}
                          <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                            {currencySymbol} {loan.monthlyInstallment.toLocaleString()}
                            <div className="text-[10px] text-gray-500">per month</div>
                          </td>

                          {/* Repayment Progress */}
                          <td className="p-3.5 min-w-[140px]">
                            <div className="flex items-center justify-between text-[10px] mb-1">
                              <span className="text-gray-400">
                                {deductedCount} / {loan.tenureMonths} Paid
                              </span>
                              <span className="font-mono font-bold text-emerald-400">{percentPaid}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                                style={{ width: `${percentPaid}%` }}
                              />
                            </div>
                          </td>

                          {/* Remaining */}
                          <td className="p-3.5 text-right font-mono font-bold text-amber-400">
                            {currencySymbol} {loan.remainingBalance.toLocaleString()}
                          </td>

                          {/* Status */}
                          <td className="p-3.5 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                loan.status === "Active"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : loan.status === "Pending Approval"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                  : loan.status === "Completed"
                                  ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                              }`}
                            >
                              {loan.status === "Active" && <CheckCircle2 size={11} />}
                              {loan.status === "Pending Approval" && <Clock size={11} />}
                              {loan.status === "Completed" && <ShieldCheck size={11} />}
                              <span>{loan.status}</span>
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-right space-x-1.5">
                            {loan.status === "Pending Approval" ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    updateHRLoanStatus(loan.id, "Active");
                                    triggerToast(`✅ Loan ${loan.loanCode} approved and activated!`);
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-black rounded-lg text-[11px] font-black transition cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    updateHRLoanStatus(loan.id, "Rejected");
                                    triggerToast(`❌ Loan ${loan.loanCode} rejected.`);
                                  }}
                                  className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg text-[11px] font-bold transition cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setViewingLoan(loan)}
                                className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Receipt size={12} className="text-emerald-400" />
                                <span>Ledger</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            APPLY LOAN / ADVANCE MODAL
        ───────────────────────────────────────────────────────────── */}
        {showApplyModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-emerald-500/30 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                    <HandCoins size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Apply / Sanction Employee Loan</h3>
                    <p className="text-xs text-gray-400">Configure loan principal, repayment tenure, and auto-payroll recovery</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="text-gray-500 hover:text-white transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
                {/* Employee Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">
                    Select Employee <span className="text-rose-400">*</span>
                  </label>
                  <select
                    required
                    value={selectedEmpId}
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                    className="w-full bg-black/60 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="">Select an employee...</option>
                    {hrEmployees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} — {emp.designation} ({emp.department}) [Salary: {currencySymbol} {emp.basicSalary.toLocaleString()}]
                      </option>
                    ))}
                  </select>
                </div>

                {selectedEmp && (
                  <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3 grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-gray-500 block">Department</span>
                      <span className="font-bold text-gray-300">{selectedEmp.department}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Basic Salary</span>
                      <span className="font-bold font-mono text-emerald-400">
                        {currencySymbol} {selectedEmp.basicSalary.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Max Recommended</span>
                      <span className="font-bold font-mono text-gray-300">
                        {currencySymbol} {(selectedEmp.basicSalary * 3).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Loan Type & Start Deduction Month */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">Loan / Advance Type</label>
                    <select
                      value={loanType}
                      onChange={(e) => setLoanType(e.target.value as any)}
                      className="w-full bg-black/60 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none cursor-pointer"
                    >
                      <option value="Salary Advance">Emergency Salary Advance (1-Month)</option>
                      <option value="Personal Loan">Personal Company Loan</option>
                      <option value="Emergency Aid">Emergency Aid / Medical Support</option>
                      <option value="Equipment / Laptop Loan">Equipment / Laptop Loan</option>
                      <option value="Education / Certification">Education & Certification Loan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">Deduction Start Month</label>
                    <input
                      type="month"
                      required
                      value={startMonth}
                      onChange={(e) => setStartMonth(e.target.value)}
                      className="w-full bg-black/60 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Principal Amount & Tenure */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">
                      Principal Loan Amount ({currencySymbol})
                    </label>
                    <input
                      type="number"
                      required
                      min={1000}
                      value={principalAmount}
                      onChange={(e) => setPrincipalAmount(Number(e.target.value))}
                      className="w-full bg-black/60 border border-gray-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">
                      Repayment Tenure (Months)
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={24}
                      disabled={loanType === "Salary Advance"}
                      value={loanType === "Salary Advance" ? 1 : tenureMonths}
                      onChange={(e) => setTenureMonths(Number(e.target.value))}
                      className="w-full bg-black/60 border border-gray-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Live EMI Calculation Box */}
                <div className="bg-black/50 border border-purple-500/30 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-bold text-[11px] flex items-center gap-1.5">
                      <Sparkles size={14} className="text-purple-400" />
                      <span>Calculated Monthly Recovery (EMI):</span>
                    </span>
                    <span className="font-mono text-sm font-black text-emerald-400">
                      {currencySymbol}{" "}
                      {loanType === "Salary Advance"
                        ? principalAmount.toLocaleString()
                        : calculatedMonthlyInstallment.toLocaleString()}{" "}
                      / month
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500">
                    This installment will be automatically added to the employee&apos;s payroll deductions starting from{" "}
                    <strong className="text-gray-300">{startMonth}</strong>.
                  </p>
                </div>

                {/* Reason & Notes */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">Purpose / Reason</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Medical emergency, house construction, vehicle maintenance..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-black/60 border border-gray-700 rounded-xl p-2.5 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-lg shadow-emerald-950 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check size={14} />
                    <span>Submit & Sanction Loan</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            LOAN REPAYMENT SCHEDULE & LEDGER DRAWER
        ───────────────────────────────────────────────────────────── */}
        {viewingLoan && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-emerald-500/30 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                    <Receipt size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white">Loan Repayment Ledger</h3>
                      <span className="font-mono text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        {viewingLoan.loanCode}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {viewingLoan.employeeName} ({viewingLoan.designation})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingLoan(null)}
                  className="text-gray-500 hover:text-white transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Top Overview Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-black/50 border border-gray-800 p-3 rounded-xl">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Sanctioned Amount</span>
                  <span className="text-sm font-black font-mono text-white mt-0.5 block">
                    {currencySymbol} {viewingLoan.principalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="bg-black/50 border border-emerald-500/20 p-3 rounded-xl">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold block">Total Repaid</span>
                  <span className="text-sm font-black font-mono text-emerald-400 mt-0.5 block">
                    {currencySymbol} {viewingLoan.totalRepaid.toLocaleString()}
                  </span>
                </div>
                <div className="bg-black/50 border border-amber-500/20 p-3 rounded-xl">
                  <span className="text-[10px] text-amber-400 uppercase font-bold block">Outstanding Balance</span>
                  <span className="text-sm font-black font-mono text-amber-400 mt-0.5 block">
                    {currencySymbol} {viewingLoan.remainingBalance.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Installment Breakdown Table */}
              <div className="border border-gray-800 rounded-xl overflow-hidden">
                <div className="bg-black/60 p-2.5 border-b border-gray-800 flex justify-between items-center text-xs font-bold text-gray-300">
                  <span>Monthly Installment Schedule</span>
                  <span className="text-[10px] text-gray-400">
                    Tenure: {viewingLoan.tenureMonths} Months • EMI: {currencySymbol}{" "}
                    {viewingLoan.monthlyInstallment.toLocaleString()}
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-black/40 text-gray-400 text-[10px] uppercase font-bold border-b border-gray-800">
                      <tr>
                        <th className="p-2.5">Inst. #</th>
                        <th className="p-2.5">Scheduled Month</th>
                        <th className="p-2.5 text-right">Amount</th>
                        <th className="p-2.5 text-center">Status</th>
                        <th className="p-2.5 text-right">Recovery Ref</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50 font-medium">
                      {viewingLoan.repayments.map((rep) => (
                        <tr key={rep.installmentNo} className="hover:bg-gray-800/30 transition">
                          <td className="p-2.5 font-mono text-gray-400">#{rep.installmentNo}</td>
                          <td className="p-2.5 text-white font-mono">{rep.month}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-gray-200">
                            {currencySymbol} {rep.amount.toLocaleString()}
                          </td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                rep.status === "Deducted"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              }`}
                            >
                              {rep.status === "Deducted" ? <Check size={10} /> : <Clock size={10} />}
                              <span>{rep.status}</span>
                            </span>
                          </td>
                          <td className="p-2.5 text-right text-[10px] font-mono text-gray-400">
                            {rep.payrollBatchId || "Pending Payroll Run"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-xs">
                <div className="text-[10px] text-gray-500">
                  Disbursed on: <strong className="text-gray-300">{viewingLoan.disbursementDate}</strong>
                </div>

                <div className="flex items-center gap-2">
                  {viewingLoan.remainingBalance > 0 && (
                    <button
                      onClick={() => {
                        setManualPayAmount(viewingLoan.remainingBalance);
                        setShowManualPayModal(true);
                      }}
                      className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl font-bold transition cursor-pointer"
                    >
                      Record Manual Settlement
                    </button>
                  )}
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={13} />
                    <span>Print Statement</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            MANUAL EARLY SETTLEMENT MODAL
        ───────────────────────────────────────────────────────────── */}
        {showManualPayModal && viewingLoan && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-amber-500/30 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <CreditCard size={16} className="text-amber-400" />
                  <span>Record Early Cash Settlement</span>
                </h3>
                <button onClick={() => setShowManualPayModal(false)} className="text-gray-500 hover:text-white cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleManualRepaymentSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">Repayment Amount ({currencySymbol})</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={viewingLoan.remainingBalance}
                    value={manualPayAmount}
                    onChange={(e) => setManualPayAmount(Number(e.target.value))}
                    className="w-full bg-black/60 border border-gray-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">
                    Outstanding balance: {currencySymbol} {viewingLoan.remainingBalance.toLocaleString()}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">Settlement Remarks</label>
                  <input
                    type="text"
                    value={manualPayNotes}
                    onChange={(e) => setManualPayNotes(e.target.value)}
                    className="w-full bg-black/60 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setShowManualPayModal(false)}
                    className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-lg transition cursor-pointer"
                  >
                    Confirm Settlement
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
