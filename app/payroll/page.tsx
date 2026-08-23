"use client";

import React, { useState } from "react";
import { useGlobalContext } from "@/context/global-context";
import ClientSidebar from "@/components/client-sidebar";
import { Users, Calendar, Award, FileText, CheckCircle2, ShieldCheck, Printer } from "lucide-react";

export default function PayrollPage() {
  const { employees, markAttendance, processSalary, currencySymbol, theme } = useGlobalContext();
  const isLight = theme === "light";
  const [successMsg, setSuccessMsg] = useState("");
  const [activePayslip, setActivePayslip] = useState<any>(null); // For payslip modal

  const handleAttendanceChange = (empId: string, status: "Present" | "Absent" | "Late" | "Leave") => {
    const today = new Date().toISOString().split("T")[0];
    markAttendance(empId, today, status);
    setSuccessMsg(`Attendance marked as ${status} for ${employees.find(e => e.id === empId)?.name}`);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const handleDisburseWage = (emp: any) => {
    processSalary(emp.id, emp.salary || 0);
    setSuccessMsg(`Monthly payroll salary of ${currencySymbol} ${(emp.salary || 0).toLocaleString()} disbursed to ${emp.name}'s bank!`);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans print:bg-white print:text-black ${isLight ? "bg-slate-100 text-slate-900" : "bg-black text-gray-100"}`}>
      <ClientSidebar />

      <main className="flex-grow p-6 sm:p-8 space-y-6 overflow-y-auto h-screen print:hidden">
        
        {/* Top Header */}
        <div className={`flex justify-between items-center border-b pb-4 ${isLight ? "border-slate-200" : "border-brand-dark-border/60"}`}>
          <div>
            <h1 className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>HR &amp; Payroll Command</h1>
            <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-500"}`}>Process staff rosters, log daily attendances, and compile monthly banking wage disbursements.</p>
          </div>
        </div>

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500 p-3 rounded-lg text-xs flex items-center gap-2 text-emerald-600 font-bold animate-fade-in-up">
            <ShieldCheck size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Employee Table */}
        <div className={`border rounded-2xl overflow-hidden ${
          isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/30 border-brand-dark-border text-gray-100"
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b font-mono ${
                  isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "border-brand-dark-border text-gray-500 bg-black/60"
                }`}>
                  <th className="p-4 font-semibold">Staff ID</th>
                  <th className="p-4 font-semibold">Name &amp; Role</th>
                  <th className="p-4 font-semibold">Base Salary</th>
                  <th className="p-4 font-semibold">Mark Attendance (Today)</th>
                  <th className="p-4 font-semibold text-center">Payroll Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-mono text-[11px] ${isLight ? "divide-slate-200" : "divide-brand-dark-border/40"}`}>
                {employees.map(emp => {
                  const today = new Date().toISOString().split("T")[0];
                  const todayStatus = emp.attendance?.[today] || "Unmarked";
                  
                  return (
                    <tr key={emp.id} className={`transition ${isLight ? "hover:bg-slate-50 text-slate-900" : "hover:bg-brand-dark-surface/60 text-gray-100"}`}>
                      <td className="p-4 text-sky-600 font-bold">{emp.id}</td>
                      <td className="p-4">
                        <div className={`font-bold font-sans ${isLight ? "text-slate-900" : "text-white"}`}>{emp.name}</div>
                        <div className={`text-[9px] font-sans ${isLight ? "text-slate-500" : "text-gray-500"}`}>{emp.role} • {emp.email}</div>
                      </td>
                      <td className={`p-4 font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{currencySymbol} {(emp.salary || 0).toLocaleString()}</td>
                      <td className="p-4">
                        <div className="flex gap-1.5">
                          {["Present", "Absent", "Late", "Leave"].map(status => {
                            const active = todayStatus === status;
                            return (
                              <button
                                key={status}
                                onClick={() => handleAttendanceChange(emp.id, status as any)}
                                className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition ${
                                  active
                                    ? "bg-sky-600 text-white font-black shadow-xs"
                                    : isLight
                                    ? "bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200"
                                    : "bg-black/60 border border-brand-dark-border/80 text-gray-500 hover:text-white"
                                }`}
                              >
                                {status.substring(0, 3)}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleDisburseWage(emp)}
                            className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white font-black text-[10px] rounded transition shadow-xs"
                          >
                            Disburse Salary
                          </button>
                          <button
                            onClick={() => setActivePayslip(emp)}
                            className={`p-1.5 border rounded transition ${
                              isLight ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-purple-100 hover:text-purple-600" : "bg-brand-dark-border hover:bg-purple-600/30 text-gray-300 hover:text-white"
                            }`}
                            title="Generate Payslip"
                          >
                            <FileText size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Printable Payslip Modal view */}
      {activePayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-mono text-[11px] leading-relaxed">
          <div className={`border p-6 rounded-2xl w-full max-w-md shadow-2xl text-left space-y-4 print:bg-white print:text-black print:border-none ${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-brand-dark-surface border-brand-sky/30 text-gray-100"
          }`}>
            
            <div className={`flex justify-between items-center border-b pb-3 mb-2 print:hidden text-xs font-sans ${isLight ? "border-slate-200" : "border-brand-dark-border"}`}>
              <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"}`}>Wage Payslip Generator</h3>
              <button onClick={() => setActivePayslip(null)} className={`px-2 py-0.5 rounded border ${isLight ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200" : "bg-brand-dark-border text-gray-400 hover:text-white"}`}>Close</button>
            </div>

            <div className="text-center font-sans space-y-1">
              <img src="/logo.png" className="h-10 w-auto max-w-[150px] object-contain mx-auto mb-1" alt="MT Core" />
              <h2 className={`text-sm font-black tracking-tight print:text-black ${isLight ? "text-slate-900" : "text-white"}`}>AL-FATAH SUPERSTORE</h2>
              <p className={`text-[9px] ${isLight ? "text-slate-500" : "text-gray-500"}`}>Mian Talal POS ERP Payroll</p>
              <p className="text-[10px] text-sky-600 font-bold">Roster Month: June 2026</p>
            </div>

            <div className={`border-t border-b py-3 space-y-1.5 print:border-black ${isLight ? "border-slate-200" : "border-brand-dark-border/40"}`}>
              <div><span className={isLight ? "text-slate-500" : "text-gray-500"}>Staff Name:</span> <span className={`font-bold print:text-black ${isLight ? "text-slate-900" : "text-white"}`}>{activePayslip.name}</span></div>
              <div><span className={isLight ? "text-slate-500" : "text-gray-500"}>Roster Role:</span> <span className={`print:text-black ${isLight ? "text-slate-900" : "text-white"}`}>{activePayslip.role}</span></div>
              <div><span className={isLight ? "text-slate-500" : "text-gray-500"}>Staff ID:</span> <span className="text-sky-600 font-bold">{activePayslip.id}</span></div>
              <div><span className={isLight ? "text-slate-500" : "text-gray-500"}>Tax deductions:</span> <span className="text-red-500 font-bold">PKR 0.00</span></div>
            </div>

            <div className={`flex justify-between font-bold text-xs border-b pb-3 print:border-black print:text-black ${isLight ? "text-slate-900 border-slate-200" : "text-white border-brand-dark-border/40"}`}>
              <span>Gross Net Pay:</span>
              <span className="text-sky-600">{currencySymbol} {(activePayslip.salary || 0).toLocaleString()}</span>
            </div>

            <div className={`text-center text-[9px] leading-normal font-sans ${isLight ? "text-slate-500" : "text-gray-500"}`}>
              Disbursed electronically. Direct bank logs cleared.
            </div>

            <button
              onClick={() => {
                window.print();
              }}
              className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-black uppercase rounded text-xs font-sans print:hidden shadow-lg transition"
            >
              Print Staff Payslip
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
