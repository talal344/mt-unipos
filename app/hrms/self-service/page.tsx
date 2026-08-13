"use client";

import React, { useState, useMemo, useEffect } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import { useGlobalContext } from "@/context/global-context";
import {
  User,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Download,
  Plus,
  X,
  Briefcase,
  CalendarDays,
  Award,
  HandCoins,
  Package,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Eye
} from "lucide-react";

interface HRAsset {
  id: string;
  assetCode: string;
  name: string;
  category: string;
  brand?: string;
  serialNumber?: string;
  condition: string;
  assignedDate?: string;
  acceptedByEmp?: boolean;
}

interface HRLoan {
  id: string;
  loanCode: string;
  employeeId: string;
  amount: number;
  remainingAmount: number;
  monthlyDeduction: number;
  status: string;
  purpose: string;
  startDate: string;
  repayments?: {
    month: string;
    amount: number;
    paidAt: string;
  }[];
}

export default function SelfServicePortalPage() {
  const {
    hrEmployees,
    hrAttendance,
    hrLeaves,
    hrPayrolls,
    hrAppraisals,
    submitHRLeave,
    currencySymbol,
    currentUser: authUser
  } = useGlobalContext();

  // Match active logged in employee or fallback to first employee
  const currentEmp = useMemo(() => {
    return (
      hrEmployees.find(
        (e) => e.email?.toLowerCase().trim() === authUser?.email?.toLowerCase().trim()
      ) ||
      hrEmployees[0] ||
      null
    );
  }, [hrEmployees, authUser]);

  const [activeTab, setActiveTab] = useState<"overview" | "payslips" | "loans" | "assets">("overview");
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<any | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [myAssets, setMyAssets] = useState<HRAsset[]>([]);
  const [myLoans, setMyLoans] = useState<HRLoan[]>([]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    if (authUser?.tenantId && currentEmp) {
      // Load assets
      const assetKey = `hr_assets_${authUser.tenantId}`;
      const savedAssets = localStorage.getItem(assetKey);
      if (savedAssets) {
        const parsed: any[] = JSON.parse(savedAssets);
        setMyAssets(parsed.filter((a) => a.assignedTo === currentEmp.id));
      }

      // Load loans
      const loanKey = `hr_loans_${authUser.tenantId}`;
      const savedLoans = localStorage.getItem(loanKey);
      if (savedLoans) {
        const parsed: HRLoan[] = JSON.parse(savedLoans);
        setMyLoans(parsed.filter((l) => l.employeeId === currentEmp.id));
      }
    }
  }, [authUser?.tenantId, currentEmp]);

  const handleAcceptAsset = (assetId: string, assetName: string) => {
    if (!authUser?.tenantId) return;
    const assetKey = `hr_assets_${authUser.tenantId}`;
    const savedAssets = localStorage.getItem(assetKey);
    if (savedAssets) {
      const parsed: any[] = JSON.parse(savedAssets);
      const updated = parsed.map((a) => {
        if (a.id === assetId) {
          return { ...a, acceptedByEmp: true, acceptedAt: new Date().toISOString().split("T")[0] };
        }
        return a;
      });
      localStorage.setItem(assetKey, JSON.stringify(updated));
      setMyAssets(updated.filter((a) => a.assignedTo === currentEmp?.id));
      triggerToast(`✅ Digital acceptance recorded for "${assetName}"!`);
    }
  };

  const [leaveForm, setLeaveForm] = useState({
    leaveType: "Casual" as const,
    startDate: "",
    endDate: "",
    reason: ""
  });

  const myAttendance = useMemo(() => {
    if (!currentEmp) return [];
    return hrAttendance
      .filter((a) => a.employeeId === currentEmp.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 15);
  }, [hrAttendance, currentEmp]);

  const myLeaves = useMemo(() => {
    if (!currentEmp) return [];
    return hrLeaves.filter((l) => l.employeeId === currentEmp.id);
  }, [hrLeaves, currentEmp]);

  const myPayslips = useMemo(() => {
    if (!currentEmp) return [];
    const slips: any[] = [];
    hrPayrolls.forEach((batch) => {
      const item = batch.items.find((i) => i.employeeId === currentEmp.id);
      if (item) {
        slips.push({ month: batch.month, ...item, status: batch.status });
      }
    });
    return slips.sort((a, b) => b.month.localeCompare(a.month));
  }, [hrPayrolls, currentEmp]);

  const leaveStats = useMemo(() => {
    const stats = {
      Casual: { total: 12, used: 0 },
      Sick: { total: 10, used: 0 },
      Annual: { total: 15, used: 0 }
    };

    myLeaves.forEach((l) => {
      if (l.status === "Approved" && (l.leaveType === "Casual" || l.leaveType === "Sick" || l.leaveType === "Annual")) {
        stats[l.leaveType].used += l.totalDays;
      }
    });

    return stats;
  }, [myLeaves]);

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmp) return;

    const start = new Date(leaveForm.startDate);
    const end = new Date(leaveForm.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    submitHRLeave({
      employeeId: currentEmp.id,
      employeeName: currentEmp.name,
      leaveType: leaveForm.leaveType,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      totalDays,
      reason: leaveForm.reason
    });

    setShowLeaveModal(false);
    setLeaveForm({ leaveType: "Casual", startDate: "", endDate: "", reason: "" });
    triggerToast("✅ Leave request submitted to your reporting manager!");
  };

  const handlePrintPayslip = (slip: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const sym = currencySymbol || "$";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Official Payslip - ${slip.month} - ${currentEmp?.name}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #0f172a; }
          .header { border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 20px; font-weight: 800; color: #0284c7; }
          .meta-table { width: 100%; margin-bottom: 25px; font-size: 12px; border-collapse: collapse; }
          .meta-table td { padding: 6px 0; }
          .breakdown { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px; }
          .breakdown th { background: #f1f5f9; padding: 10px; text-align: left; border: 1px solid #cbd5e1; }
          .breakdown td { padding: 10px; border: 1px solid #cbd5e1; }
          .total-row { font-weight: bold; background: #f8fafc; }
          .net-pay { background: #e0f2fe; padding: 15px; border-radius: 8px; font-size: 16px; font-weight: bold; color: #0369a1; text-align: right; margin-bottom: 30px; }
          .footer { font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">MT-CORE CORPORATE PAYSLIP</div>
            <div style="font-size: 12px; color: #64748b;">The core technology behind your business. &bull; Month: <strong>${slip.month}</strong></div>
          </div>
          <div style="text-align: right; font-size: 11px; font-family: monospace;">
            <div>Status: <span style="color: #16a34a; font-weight: bold;">DISBURSED</span></div>
            <div>Date: ${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <table class="meta-table">
          <tr>
            <td><strong>Employee Name:</strong> ${currentEmp?.name}</td>
            <td><strong>Employee Code:</strong> ${currentEmp?.employeeCode}</td>
          </tr>
          <tr>
            <td><strong>Designation:</strong> ${currentEmp?.designation}</td>
            <td><strong>Department:</strong> ${currentEmp?.department}</td>
          </tr>
          <tr>
            <td><strong>Joining Date:</strong> ${currentEmp?.joiningDate}</td>
            <td><strong>Employment:</strong> ${currentEmp?.employmentType}</td>
          </tr>
        </table>

        <table class="breakdown">
          <thead>
            <tr>
              <th>Earnings &amp; Additions</th>
              <th style="text-align: right;">Amount (${sym})</th>
              <th>Deductions &amp; Recoveries</th>
              <th style="text-align: right;">Amount (${sym})</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Basic Salary</td>
              <td style="text-align: right;">${sym}${slip.basicSalary?.toLocaleString()}</td>
              <td>Income Tax / Statutory</td>
              <td style="text-align: right;">${sym}${slip.tax?.toLocaleString() || "0"}</td>
            </tr>
            <tr>
              <td>Allowances &amp; Medical</td>
              <td style="text-align: right;">${sym}${slip.allowances?.toLocaleString() || "0"}</td>
              <td>Advance / Loan EMI Recovery</td>
              <td style="text-align: right;">${sym}${slip.loanDeduction?.toLocaleString() || "0"}</td>
            </tr>
            <tr>
              <td>Overtime / Bonus</td>
              <td style="text-align: right;">${sym}${slip.overtimePay?.toLocaleString() || "0"}</td>
              <td>Absenteeism / Unpaid Leave</td>
              <td style="text-align: right;">${sym}${slip.unpaidDeductions?.toLocaleString() || "0"}</td>
            </tr>
            <tr class="total-row">
              <td>Total Gross Earnings</td>
              <td style="text-align: right;">${sym}${((slip.basicSalary || 0) + (slip.allowances || 0) + (slip.overtimePay || 0)).toLocaleString()}</td>
              <td>Total Deductions</td>
              <td style="text-align: right;">${sym}${slip.deductions?.toLocaleString() || "0"}</td>
            </tr>
          </tbody>
        </table>

        <div class="net-pay">
          Net Take-Home Salary: ${sym}${slip.netSalary?.toLocaleString()}
        </div>

        <div class="footer">
          <div>This is a computer-generated digital payslip and requires no physical signature.</div>
          <div>MT-Core Human Resources &bull; Confidential</div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!currentEmp) {
    return (
      <div className="flex h-screen bg-[#05080d] text-gray-100 font-sans">
        <HRMSSidebar />
        <main className="flex-grow p-6 flex items-center justify-center">
          <p className="text-gray-500">No active employee found to show self-service data.</p>
        </main>
      </div>
    );
  }

  const hourStr = new Date().getHours();
  const greeting = hourStr < 12 ? "Morning" : hourStr < 18 ? "Afternoon" : "Evening";

  return (
    <div className="flex h-screen bg-[#05080d] text-gray-100 font-sans overflow-hidden">
      <HRMSSidebar />

      <main className="flex-grow p-6 space-y-6 overflow-y-auto h-full relative">
        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-6 right-6 z-50 bg-sky-500 text-black px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce border border-sky-400/50">
            <CheckCircle2 size={16} />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              Good {greeting}, {currentEmp.name.split(" ")[0]}! 👋
            </h1>
            <p className="text-xs text-sky-400 font-bold">
              Employee Self-Service (ESS) &amp; Personal Portal
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLeaveModal(true)}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-sky-950/40 cursor-pointer"
            >
              <Plus size={14} /> Request Time Off
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-[#0b0f17] border border-gray-800 p-2 rounded-2xl overflow-x-auto">
          {[
            { id: "overview", label: "My Overview", icon: User },
            { id: "payslips", label: `My Payslips (${myPayslips.length})`, icon: DollarSign },
            { id: "loans", label: `My Loans & Advances (${myLoans.length})`, icon: HandCoins },
            { id: "assets", label: `Assigned Assets (${myAssets.length})`, icon: Package }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer shrink-0 ${
                  activeTab === tab.id
                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                    : "bg-black/50 text-gray-400 border border-gray-800 hover:text-white"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile & Leave Balances */}
            <div className="space-y-6">
              <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-xl font-black text-white shadow-lg">
                    {currentEmp.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-white">{currentEmp.name}</h2>
                    <p className="text-xs text-sky-400 font-bold">{currentEmp.designation}</p>
                    <p className="text-[10px] text-gray-500">{currentEmp.department}</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs font-mono text-gray-400 border-t border-gray-800/80 pt-4">
                  <div className="flex justify-between">
                    <span>Emp Code:</span> <span className="text-white font-bold">{currentEmp.employeeCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span> <span className="text-white">{currentEmp.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Joined:</span> <span className="text-white">{currentEmp.joiningDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span> <span className="text-white">{currentEmp.employmentType}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-5 shadow-xl">
                <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                  <Briefcase size={16} className="text-sky-400" />
                  Leave Balances (2025)
                </h3>
                <div className="space-y-3.5">
                  {Object.entries(leaveStats).map(([type, stats]) => {
                    const remaining = stats.total - stats.used;
                    const percent = (stats.used / stats.total) * 100;
                    return (
                      <div key={type}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-300 font-bold">{type} Leave</span>
                          <span className="text-gray-400 font-mono">
                            {remaining} remaining ({stats.used}/{stats.total} used)
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-sky-500 h-full rounded-full transition-all" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Attendance History */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-5 shadow-xl">
                <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                  <Clock size={16} className="text-emerald-400" />
                  Recent Attendance Logs
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead>
                      <tr className="border-b border-gray-800 text-[10px] text-gray-500 uppercase font-mono">
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Clock In</th>
                        <th className="pb-2">Clock Out</th>
                        <th className="pb-2">Total Hours</th>
                        <th className="pb-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {myAttendance.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-gray-500 text-xs">
                            No attendance records logged yet this month.
                          </td>
                        </tr>
                      ) : (
                        myAttendance.map((att, idx) => (
                          <tr key={idx} className="hover:bg-sky-500/5">
                            <td className="py-2.5 font-mono text-gray-300">{att.date}</td>
                            <td className="py-2.5 text-gray-400 font-mono">{att.checkIn || "—"}</td>
                            <td className="py-2.5 text-gray-400 font-mono">{att.checkOut || "—"}</td>
                            <td className="py-2.5 text-gray-300 font-mono">
                              {att.overtimeHours ? `${8 + att.overtimeHours} hrs` : "8 hrs"}
                            </td>
                            <td className="py-2.5 text-right">
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                  att.status === "Present"
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : att.status === "Late"
                                    ? "bg-amber-500/10 text-amber-400"
                                    : "bg-red-500/10 text-red-400"
                                }`}
                              >
                                {att.status}
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
          </div>
        )}

        {/* TAB 2: Payslips */}
        {activeTab === "payslips" && (
          <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-400" />
                Monthly Payslip Repository &amp; Tax Deduction Slips
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myPayslips.length === 0 ? (
                <div className="col-span-full p-8 text-center text-gray-500 text-xs">
                  No monthly payroll batches generated for your profile yet.
                </div>
              ) : (
                myPayslips.map((slip, idx) => (
                  <div
                    key={idx}
                    className="bg-[#05080d] border border-gray-800 hover:border-sky-500/40 rounded-xl p-4 space-y-3 transition group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
                          {slip.month}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1">Official Payslip</h4>
                      </div>
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                        Paid
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs font-mono border-t border-gray-800/80 pt-2 text-gray-400">
                      <div className="flex justify-between">
                        <span>Gross Basic:</span> <span>{currencySymbol || "$"}{slip.basicSalary?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Allowances:</span> <span className="text-emerald-400">+{currencySymbol || "$"}{slip.allowances?.toLocaleString() || "0"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Deductions:</span> <span className="text-red-400">-{currencySymbol || "$"}{slip.deductions?.toLocaleString() || "0"}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-gray-800 text-white font-bold">
                        <span>Net Take-Home:</span> <span className="text-emerald-400">{currencySymbol || "$"}{slip.netSalary?.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => handlePrintPayslip(slip)}
                        className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 py-2 rounded-lg transition cursor-pointer shadow"
                      >
                        <Printer size={13} /> Print / Save Payslip PDF
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Loans & Advances */}
        {activeTab === "loans" && (
          <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
              <HandCoins size={16} className="text-amber-400" />
              My Active Loans &amp; Salary Advance Repayment Ledger
            </h2>

            {myLoans.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs">
                You do not have any active loans or salary advance deductions.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className="bg-[#05080d] border border-amber-500/20 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-amber-400">{loan.loanCode}</span>
                        <h4 className="text-sm font-bold text-white">{loan.purpose}</h4>
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                          loan.status === "Active"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-emerald-500/10 text-emerald-400"
                        }`}
                      >
                        {loan.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs font-mono text-gray-400 border-t border-gray-800 pt-2">
                      <div className="flex justify-between">
                        <span>Original Amount:</span> <span>{currencySymbol || "$"}{loan.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Outstanding Balance:</span> <span className="text-amber-400 font-bold">{currencySymbol || "$"}{loan.remainingAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly EMI Deduction:</span> <span>{currencySymbol || "$"}{loan.monthlyDeduction.toLocaleString()} / mo</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Start Date:</span> <span>{loan.startDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Assigned Assets */}
        {activeTab === "assets" && (
          <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
              <Package size={16} className="text-indigo-400" />
              Company Assets in My Custody &amp; Digital Acceptance
            </h2>

            {myAssets.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs">
                No company hardware or assets currently assigned to your custody.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="bg-[#05080d] border border-gray-800 hover:border-indigo-500/40 rounded-xl p-4 space-y-3 transition"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                        {asset.assetCode}
                      </span>
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                        {asset.condition}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">{asset.name}</h4>
                      <p className="text-[11px] text-gray-400 font-mono">
                        {asset.brand} &bull; S/N: {asset.serialNumber || "—"}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between">
                      {asset.acceptedByEmp ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                          <CheckCircle2 size={13} /> Digitally Accepted
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAcceptAsset(asset.id, asset.name)}
                          className="flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg transition cursor-pointer shadow"
                        >
                          <CheckCircle2 size={13} /> Accept Handover
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Leave Application Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c1018] border border-sky-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-sky-500/5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CalendarDays size={16} className="text-sky-400" />
                Submit Time-Off Application
              </h2>
              <button onClick={() => setShowLeaveModal(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleApplyLeave} className="p-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Leave Type</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value as any })}
                  className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-sky-500"
                >
                  <option value="Casual">Casual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Annual">Annual Vacation</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Start Date</label>
                  <input
                    required
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">End Date</label>
                  <input
                    required
                    type="date"
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Reason / Notes</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Reason for absence..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-sky-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-sky-950/50 cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
