"use client";

import React, { useState } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import { useGlobalContext } from "@/context/global-context";
import {
  DollarSign,
  Plus,
  Printer,
  CheckCircle2,
  Calendar,
  Users,
  FileText,
  X,
  Building2,
  Sparkles,
  Download
} from "lucide-react";

export default function HRPayrollPage() {
  const {
    hrEmployees,
    hrPayrolls,
    hrLoans,
    processHRPayroll,
    currencySymbol,
    businessSettings
  } = useGlobalContext();

  const [selectedMonth, setSelectedMonth] = useState("2026-08");
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);

  const [customItems, setCustomItems] = useState<
    Array<{
      employeeId: string;
      basicSalary: number;
      allowances: number;
      deductions: number;
      loanEMI: number;
      loanCode?: string;
    }>
  >([]);

  const handleOpenProcess = () => {
    setCustomItems(
      hrEmployees.map((e) => {
        // Auto-detect active loan EMI for this month
        const activeLoan = hrLoans.find((l) => l.employeeId === e.id && l.status === "Active");
        const pendingRep = activeLoan?.repayments.find((r) => r.month === selectedMonth && r.status === "Pending");
        const loanEMI = pendingRep ? pendingRep.amount : 0;

        return {
          employeeId: e.id,
          basicSalary: e.basicSalary,
          allowances: 3000,
          deductions: 1000 + loanEMI,
          loanEMI,
          loanCode: activeLoan?.loanCode
        };
      })
    );
    setShowProcessModal(true);
  };

  const handleConfirmPayroll = () => {
    const payrollItems = customItems.map((item) => {
      const emp = hrEmployees.find((e) => e.id === item.employeeId);
      const gross = item.basicSalary + item.allowances;
      const net = gross - item.deductions;
      return {
        employeeId: item.employeeId,
        employeeName: emp?.name || "Staff Member",
        department: emp?.department || "General",
        basicSalary: item.basicSalary,
        allowances: item.allowances,
        deductions: item.deductions,
        netSalary: net,
        status: "Paid" as const
      };
    });

    processHRPayroll(selectedMonth, payrollItems);
    setShowProcessModal(false);
  };

  const currentBatch = hrPayrolls.find((p) => p.month === selectedMonth) || hrPayrolls[0];

  const handlePrintPayslip = (item: any) => {
    setSelectedPayslip(item);
  };

  return (
    <div className="flex h-screen bg-[#05080d] text-gray-100 font-sans overflow-hidden">
      <HRMSSidebar />

      <main className="flex-grow p-6 space-y-6 overflow-y-auto h-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <DollarSign size={20} className="text-purple-400" />
              Automated Payroll &amp; Compensation Engine
            </h1>
            <p className="text-xs text-gray-400">
              Calculate month-end staff salaries, allowances, tax deductions, and print digital pay slips.
            </p>
          </div>
          <button
            onClick={handleOpenProcess}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition"
          >
            <Plus size={14} /> Run Month-End Payroll Batch
          </button>
        </div>

        {/* Month Selector & Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#0b0f17] border border-gray-800 p-4 rounded-2xl flex items-center gap-3">
            <Calendar size={18} className="text-purple-400 shrink-0" />
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-500">Payroll Month</div>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-black border border-gray-800 text-white font-mono text-xs p-1.5 rounded-lg focus:outline-none focus:border-purple-500 mt-1"
              />
            </div>
          </div>

          <div className="bg-[#0b0f17] border border-purple-500/20 p-4 rounded-2xl">
            <div className="text-[10px] uppercase font-bold text-gray-400">Total Staff Paid</div>
            <div className="text-xl font-black text-white mt-1">
              {currentBatch ? currentBatch.totalEmployees : 0} Staff
            </div>
          </div>

          <div className="bg-[#0b0f17] border border-purple-500/20 p-4 rounded-2xl">
            <div className="text-[10px] uppercase font-bold text-gray-400">Gross Budget</div>
            <div className="text-xl font-black text-purple-400 mt-1 font-mono">
              {currencySymbol} {currentBatch ? currentBatch.totalGross.toLocaleString() : 0}
            </div>
          </div>

          <div className="bg-[#0b0f17] border border-purple-500/20 p-4 rounded-2xl">
            <div className="text-[10px] uppercase font-bold text-gray-400">Net Salary Payout</div>
            <div className="text-xl font-black text-emerald-400 mt-1 font-mono">
              {currencySymbol} {currentBatch ? currentBatch.totalNet.toLocaleString() : 0}
            </div>
          </div>
        </div>

        {/* Salary Ledger Table */}
        <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/40">
            <h3 className="font-bold text-white text-xs flex items-center gap-2">
              <FileText size={14} className="text-purple-400" />
              Payslip Ledger for {currentBatch ? currentBatch.month : selectedMonth}
            </h3>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              Status: {currentBatch ? currentBatch.status : "Draft"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider text-[10px] font-mono bg-black/20">
                  <th className="p-4">Employee</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Basic Pay</th>
                  <th className="p-4">Allowances</th>
                  <th className="p-4">Deductions</th>
                  <th className="p-4">Net Payout</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono text-xs">
                {!currentBatch || !currentBatch.items || currentBatch.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500 italic font-sans">
                      No payroll records processed for {selectedMonth}. Click "Run Month-End Payroll Batch" above.
                    </td>
                  </tr>
                ) : (
                  currentBatch.items.map((item) => (
                    <tr key={item.employeeId} className="hover:bg-gray-800/30 transition">
                      <td className="p-4 font-sans font-bold text-white">
                        {item.employeeName}
                      </td>
                      <td className="p-4 text-gray-400">{item.department}</td>
                      <td className="p-4 text-gray-300">{currencySymbol} {item.basicSalary.toLocaleString()}</td>
                      <td className="p-4 text-emerald-400">+{currencySymbol} {item.allowances.toLocaleString()}</td>
                      <td className="p-4 text-red-400">-{currencySymbol} {item.deductions.toLocaleString()}</td>
                      <td className="p-4 text-purple-300 font-bold font-mono">
                        {currencySymbol} {item.netSalary.toLocaleString()}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handlePrintPayslip(item)}
                          className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 rounded-lg text-[10px] font-bold transition flex items-center gap-1.5 mx-auto"
                        >
                          <Printer size={12} /> View Payslip
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Process Payroll Batch */}
        {showProcessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-sans">
            <div className="bg-[#0b0f17] border border-purple-500/40 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-fade-in-up">
              <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-black/40">
                <div className="flex items-center gap-2">
                  <DollarSign size={18} className="text-purple-400" />
                  <h3 className="font-bold text-white text-base">Process Payroll Batch ({selectedMonth})</h3>
                </div>
                <button onClick={() => setShowProcessModal(false)} className="text-gray-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
                <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded-xl text-purple-300 text-xs font-bold flex items-center gap-2">
                  <Sparkles size={16} className="shrink-0 text-purple-400" />
                  <span>Review basic salary, enter allowances/bonuses and fine deductions for each staff member.</span>
                </div>

                <div className="space-y-3">
                  {customItems.map((item, idx) => {
                    const emp = hrEmployees.find((e) => e.id === item.employeeId);
                    return (
                      <div key={item.employeeId} className="p-3 bg-black/40 border border-gray-800 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                        <div>
                          <div className="font-bold text-white">{emp?.name}</div>
                          <div className="text-[10px] text-gray-500">{emp?.department}</div>
                        </div>

                        <div>
                          <div className="text-[9px] uppercase font-bold text-gray-500">Basic Pay</div>
                          <div className="text-xs font-bold text-gray-200">{currencySymbol} {item.basicSalary.toLocaleString()}</div>
                        </div>

                        <div>
                          <div className="text-[9px] uppercase font-bold text-emerald-400">Allowances (+)</div>
                          <input
                            type="number"
                            value={item.allowances}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              const updated = [...customItems];
                              updated[idx].allowances = val;
                              setCustomItems(updated);
                            }}
                            className="w-full bg-black border border-gray-800 p-1.5 rounded-lg text-white font-mono"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[9px] uppercase font-bold text-red-400">Deductions (-)</span>
                            {item.loanEMI > 0 && (
                              <span className="text-[8.5px] text-amber-400 font-bold bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/20">
                                Incl. Loan EMI: {currencySymbol} {item.loanEMI.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <input
                            type="number"
                            value={item.deductions}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              const updated = [...customItems];
                              updated[idx].deductions = val;
                              setCustomItems(updated);
                            }}
                            className="w-full bg-black border border-gray-800 p-1.5 rounded-lg text-white font-mono"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 border-t border-gray-800 bg-black/40 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowProcessModal(false)}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayroll}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-wider rounded-xl transition shadow-lg shadow-purple-900/30 cursor-pointer"
                >
                  Confirm &amp; Issue Payroll Batch
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Printable Payslip */}
        {selectedPayslip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-sans">
            <div className="bg-[#0b0f17] border border-emerald-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
              <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/40">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-emerald-400" />
                  <h3 className="font-bold text-white text-sm">Official Employee Pay Slip</h3>
                </div>
                <button onClick={() => setSelectedPayslip(null)} className="text-gray-400 hover:text-white cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-4 bg-[#0d121c] text-xs font-mono" id="printable-payslip">
                {/* Payslip Header */}
                <div className="text-center border-b border-gray-800 pb-4 space-y-1">
                  <img src="/logo.png" className="h-11 w-auto max-w-[160px] object-contain mx-auto mb-1" alt="MT UniPOS" />
                  <h2 className="font-black text-white text-lg tracking-wide uppercase">
                    {businessSettings.businessName || "MT Enterprise ERP"}
                  </h2>
                  <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest">
                    Salary Payout Slip — {currentBatch ? currentBatch.month : selectedMonth}
                  </p>
                  <p className="text-[10px] text-gray-500">Issued On: {new Date().toLocaleDateString()}</p>
                </div>

                {/* Employee Details */}
                <div className="grid grid-cols-2 gap-2 bg-black/40 p-3 rounded-xl text-xs border border-gray-800">
                  <div>
                    <span className="text-gray-500 block text-[9px]">Employee Name</span>
                    <strong className="text-white">{selectedPayslip.employeeName}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px]">Department</span>
                    <strong className="text-emerald-400">{selectedPayslip.department}</strong>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="space-y-2 border-b border-gray-800 pb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Basic Monthly Pay:</span>
                    <span className="text-white font-bold">{currencySymbol} {selectedPayslip.basicSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-400">Allowances &amp; Bonuses:</span>
                    <span className="text-emerald-400 font-bold">+{currencySymbol} {selectedPayslip.allowances.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-400">Tax, Fines &amp; Deductions:</span>
                    <span className="text-red-400 font-bold">-{currencySymbol} {selectedPayslip.deductions.toLocaleString()}</span>
                  </div>
                  {/* Active loan indicator on payslip */}
                  {(() => {
                    const empLoan = hrLoans.find((l) => l.employeeId === selectedPayslip.employeeId && (l.status === "Active" || l.status === "Completed"));
                    const rep = empLoan?.repayments.find((r) => r.month === (currentBatch ? currentBatch.month : selectedMonth));
                    if (empLoan && rep && (rep.status === "Deducted" || rep.status === "Pending")) {
                      return (
                        <div className="flex justify-between bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg text-[10px] text-amber-300">
                          <span>Loan / Advance Recovery ({empLoan.loanCode || "Loan"}):</span>
                          <span className="font-bold font-mono">-{currencySymbol} {rep.amount.toLocaleString()} (Bal: {currencySymbol} {empLoan.remainingBalance.toLocaleString()})</span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* Net Total */}
                <div className="flex justify-between items-center text-sm font-black p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <span className="text-emerald-300">NET SALARY PAID:</span>
                  <span className="text-emerald-400 text-base">{currencySymbol} {selectedPayslip.netSalary.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-4 border-t border-gray-800 bg-black/40 flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Printer size={14} /> Print Payslip
                </button>
                <button
                  onClick={() => setSelectedPayslip(null)}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
