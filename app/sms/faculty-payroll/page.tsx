"use client";

import React, { useState } from "react";
import { useSMS, TeacherRecord } from "@/context/sms-context";
import {
  DollarSign,
  Printer,
  CheckCircle2,
  Users,
  Search,
  Building,
  CreditCard,
  Download,
  Award
} from "lucide-react";

export default function SMSFacultyPayrollPage() {
  const { teachers } = useSMS();
  const [selectedMonth, setSelectedMonth] = useState("August 2026");
  const [search, setSearch] = useState("");

  const filteredTeachers = teachers.filter((t) =>
    t.fullName.toLowerCase().includes(search.toLowerCase()) ||
    t.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
    t.department.toLowerCase().includes(search.toLowerCase())
  );

  const totalPayroll = teachers.reduce((acc, t) => acc + t.salary, 0);

  const handlePrintPayslip = (t: TeacherRecord) => {
    const basic = Math.round(t.salary * 0.7);
    const houseRent = Math.round(t.salary * 0.2);
    const medical = Math.round(t.salary * 0.1);
    const tax = Math.round(t.salary * 0.05);
    const net = t.salary - tax;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Faculty Payslip - ${t.employeeCode}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #ffffff; color: #0f172a; padding: 30px; display: flex; justify-content: center; }
    .slip { width: 500px; border: 2px solid #0284c7; padding: 25px; border-radius: 12px; }
    .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 10px; margin-bottom: 15px; }
    .school { font-size: 16px; font-weight: 900; color: #0284c7; }
    .slip-title { font-size: 13px; font-weight: 800; text-transform: uppercase; margin-top: 4px; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; margin-bottom: 15px; background: #f8fafc; padding: 10px; border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 15px; }
    th { background: #0284c7; color: white; padding: 6px 8px; text-align: left; font-weight: bold; }
    td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; }
    .total-box { background: #0f172a; color: white; padding: 10px 15px; border-radius: 8px; display: flex; justify-content: space-between; font-weight: 900; font-size: 12px; }
    .sig { display: flex; justify-content: space-between; margin-top: 40px; font-size: 10px; font-weight: bold; }
    .sig-line { border-top: 1px solid #000; width: 140px; text-align: center; padding-top: 4px; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="no-print" style="position: absolute; top: 10px; right: 10px;">
    <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 8px 16px; font-weight: bold; border-radius: 6px; cursor: pointer;">🖨️ Print Payslip</button>
  </div>
  <div class="slip">
    <div class="header">
      <div class="school">MT CORE MODEL SCHOOL &amp; COLLEGE</div>
      <div class="slip-title">FACULTY MONTHLY SALARY PAYSLIP</div>
      <div style="font-size: 10px; color: #64748b; font-weight: bold;">Billing Month: ${selectedMonth}</div>
    </div>

    <div class="meta">
      <div>Employee Code: <b>${t.employeeCode}</b></div>
      <div>Faculty Name: <b>${t.fullName}</b></div>
      <div>Designation: <b>${t.designation}</b></div>
      <div>Department: <b>${t.department}</b></div>
    </div>

    <table>
      <thead>
        <tr><th>Earnings &amp; Allowances</th><th style="text-align: right;">Amount (PKR)</th></tr>
      </thead>
      <tbody>
        <tr><td>Basic Salary</td><td style="text-align: right;">Rs ${basic.toLocaleString()}</td></tr>
        <tr><td>House Rent Allowance (20%)</td><td style="text-align: right;">Rs ${houseRent.toLocaleString()}</td></tr>
        <tr><td>Medical &amp; Travel Allowance</td><td style="text-align: right;">Rs ${medical.toLocaleString()}</td></tr>
        <tr style="color: #dc2626;"><td>Income Tax Deduction (FBR)</td><td style="text-align: right;">- Rs ${tax.toLocaleString()}</td></tr>
      </tbody>
    </table>

    <div class="total-box">
      <div>NET SALARY TRANSFERRED:</div>
      <div style="color: #38bdf8;">Rs ${net.toLocaleString()}</div>
    </div>

    <div class="sig">
      <div class="sig-line">Prepared by: Accounts</div>
      <div class="sig-line">Principal Signature</div>
    </div>
  </div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <DollarSign className="text-teal-400" size={22} />
            <span>Faculty Payroll &amp; Monthly Salary Slips</span>
          </h1>
          <p className="text-xs text-gray-400">
            Manage teaching faculty salary structures, allowances, tax deductions, bank direct deposits, and printable payslips.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl p-5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400">Total Monthly Faculty Payroll</span>
          <div className="text-2xl font-black text-emerald-400">Rs {totalPayroll.toLocaleString()}</div>
          <div className="text-[10px] text-gray-500">Across {teachers.length} Subject Masters</div>
        </div>

        <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl p-5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400">Active Payroll Month</span>
          <div className="text-2xl font-black text-white">{selectedMonth}</div>
          <div className="text-[10px] text-emerald-400 font-bold">✓ Direct Bank Deposit Ready</div>
        </div>

        <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl p-5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400">Tax Deductions Shunted</span>
          <div className="text-2xl font-black text-sky-400">Rs {(totalPayroll * 0.05).toLocaleString()}</div>
          <div className="text-[10px] text-gray-500">FBR Withholding Tax compliant</div>
        </div>
      </div>

      {/* Faculty Table */}
      <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/40">
          <h3 className="font-black text-white text-xs uppercase tracking-wider">
            Teaching Faculty Salary Register ({teachers.length})
          </h3>
          <span className="text-[10px] text-teal-400 font-mono">Disbursed via Meezan / HBL</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-mono text-[10px] bg-black/20">
                <th className="p-4 font-bold">Emp Code</th>
                <th className="p-4 font-bold">Faculty Name</th>
                <th className="p-4 font-bold">Designation</th>
                <th className="p-4 font-bold">Department</th>
                <th className="p-4 font-bold text-right">Gross Salary (PKR)</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50 font-mono text-[10px]">
              {filteredTeachers.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.02] transition">
                  <td className="p-4 font-bold text-sky-400">{t.employeeCode}</td>
                  <td className="p-4 font-sans font-bold text-white text-sm">{t.fullName}</td>
                  <td className="p-4 font-sans text-gray-300">{t.designation}</td>
                  <td className="p-4 font-sans text-emerald-400">{t.department}</td>
                  <td className="p-4 text-right font-bold text-white text-xs">
                    Rs {t.salary.toLocaleString()}
                  </td>
                  <td className="p-4 text-center font-sans">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold text-[9px]">
                      {t.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handlePrintPayslip(t)}
                      className="p-1.5 bg-teal-500/10 hover:bg-teal-500 text-teal-300 hover:text-white rounded-lg transition"
                      title="Print Monthly Payslip"
                    >
                      <Printer size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
