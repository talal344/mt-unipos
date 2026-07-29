"use client";

import React, { useState } from "react";
import { useGlobalContext } from "@/context/global-context";
import ClientSidebar from "@/components/client-sidebar";
import { Users, Calendar, Award, FileText, CheckCircle2, ShieldCheck, Printer } from "lucide-react";

export default function PayrollPage() {
  const { employees, markAttendance, processSalary, currencySymbol } = useGlobalContext();
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
    <div className="flex min-h-screen bg-black text-gray-100 font-sans print:bg-white print:text-black">
      <ClientSidebar />

      <main className="flex-grow p-6 sm:p-8 space-y-6 overflow-y-auto max-h-screen print:hidden">
        
        {/* Top Header */}
        <div className="flex justify-between items-center border-b border-brand-dark-border/60 pb-4">
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">HR &amp; Payroll Command</h1>
            <p className="text-[10px] text-gray-500">Process staff rosters, log daily attendances, and compile monthly banking wage disbursements.</p>
          </div>
        </div>

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500 p-3 rounded-lg text-xs flex items-center gap-2 text-emerald-400 font-bold animate-fade-in-up">
            <ShieldCheck size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Employee Table */}
        <div className="bg-brand-dark-surface/30 border border-brand-dark-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brand-dark-border text-gray-500 font-mono">
                  <th className="p-4 font-semibold">Staff ID</th>
                  <th className="p-4 font-semibold">Name &amp; Role</th>
                  <th className="p-4 font-semibold">Base Salary</th>
                  <th className="p-4 font-semibold">Mark Attendance (Today)</th>
                  <th className="p-4 font-semibold text-center">Payroll Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark-border/40 font-mono text-[11px]">
                {employees.map(emp => {
                  const today = new Date().toISOString().split("T")[0];
                  const todayStatus = emp.attendance?.[today] || "Unmarked";
                  
                  return (
                    <tr key={emp.id} className="hover:bg-brand-dark-surface/60 transition">
                      <td className="p-4 text-brand-sky font-bold">{emp.id}</td>
                      <td className="p-4">
                        <div className="text-white font-bold font-sans">{emp.name}</div>
                        <div className="text-[9px] text-gray-500 font-sans">{emp.role} • {emp.email}</div>
                      </td>
                      <td className="p-4 text-white font-bold">{currencySymbol} {(emp.salary || 0).toLocaleString()}</td>
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
                                    ? "bg-brand-sky text-black font-black"
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
                            className="px-2.5 py-1 bg-brand-sky hover:bg-brand-sky-light text-black font-black text-[10px] rounded transition"
                          >
                            Disburse Salary
                          </button>
                          <button
                            onClick={() => setActivePayslip(emp)}
                            className="p-1.5 bg-brand-dark-border hover:bg-purple-600/30 text-gray-300 hover:text-white rounded transition"
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
          <div className="bg-brand-dark-surface border border-brand-sky/30 p-6 rounded-2xl w-full max-w-md shadow-2xl text-left space-y-4 print:bg-white print:text-black print:border-none">
            
            <div className="flex justify-between items-center border-b border-brand-dark-border pb-3 mb-2 print:hidden text-xs font-sans">
              <h3 className="font-black text-white">Wage Payslip Generator</h3>
              <button onClick={() => setActivePayslip(null)} className="text-gray-400 hover:text-white bg-brand-dark-border px-2 py-0.5 rounded">Close</button>
            </div>

            <div className="text-center font-sans space-y-1">
              <h2 className="text-sm font-black tracking-tight text-white print:text-black">AL-FATAH SUPERSTORE</h2>
              <p className="text-[9px] text-gray-500">Mian Talal POS ERP Payroll</p>
              <p className="text-[10px] text-brand-sky font-bold">Roster Month: June 2026</p>
            </div>

            <div className="border-t border-b border-brand-dark-border/40 print:border-black py-3 space-y-1.5">
              <div><span className="text-gray-500">Staff Name:</span> <span className="text-white print:text-black font-bold">{activePayslip.name}</span></div>
              <div><span className="text-gray-500">Roster Role:</span> <span className="text-white print:text-black">{activePayslip.role}</span></div>
              <div><span className="text-gray-500">Staff ID:</span> <span className="text-brand-sky">{activePayslip.id}</span></div>
              <div><span className="text-gray-500">Tax deductions:</span> <span className="text-red-400 font-bold">PKR 0.00</span></div>
            </div>

            <div className="flex justify-between text-white print:text-black font-bold text-xs border-b border-brand-dark-border/40 print:border-black pb-3">
              <span>Gross Net Pay:</span>
              <span className="text-brand-sky">{currencySymbol} {(activePayslip.salary || 0).toLocaleString()}</span>
            </div>

            <div className="text-center text-[9px] text-gray-500 leading-normal font-sans">
              Disbursed electronically. Direct bank logs cleared.
            </div>

            <button
              onClick={() => {
                window.print();
              }}
              className="w-full py-2 bg-brand-sky hover:bg-brand-sky-light text-black font-black uppercase rounded text-xs font-sans print:hidden"
            >
              Print Staff Payslip
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
