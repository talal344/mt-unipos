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
  const { theme, teachers } = useSMS();
  const isLight = theme === "light";

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
    .table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 15px; }
    .table th, .table td { border-bottom: 1px solid #cbd5e1; padding: 6px 0; }
    .right { text-align: right; }
    .tot { font-weight: 900; font-size: 13px; color: #0284c7; border-top: 2px solid #0284c7; }
    .footer { display: flex; justify-content: space-between; margin-top: 40px; font-size: 10px; font-weight: bold; }
    .sig { border-top: 1px solid #0f172a; width: 140px; text-align: center; padding-top: 4px; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="no-print" style="position: absolute; top: 20px; right: 20px;">
    <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">🖨️ Print Payslip</button>
  </div>
  <div class="slip">
    <div class="header">
      <div class="school">MT CORE MODEL SCHOOL</div>
      <div class="slip-title">Official Faculty Salary Statement &bull; ${selectedMonth}</div>
    </div>
    <div class="meta">
      <div>Employee: <b>${t.fullName}</b></div>
      <div>Code: <b>${t.employeeCode}</b></div>
      <div>Designation: <b>${t.designation}</b></div>
      <div>Department: <b>${t.department}</b></div>
    </div>
    <table class="table">
      <tr><th>Earning Component</th><th class="right">Amount (PKR)</th></tr>
      <tr><td>Basic Salary (70%)</td><td class="right">Rs ${basic.toLocaleString()}</td></tr>
      <tr><td>House Rent Allowance (20%)</td><td class="right">Rs ${houseRent.toLocaleString()}</td></tr>
      <tr><td>Medical &amp; Utility Allowance (10%)</td><td class="right">Rs ${medical.toLocaleString()}</td></tr>
      <tr style="color: #dc2626;"><td>Income Tax Withholding (5%) (-)</td><td class="right">- Rs ${tax.toLocaleString()}</td></tr>
      <tr class="tot"><td>NET SALARY PAYABLE:</td><td class="right">Rs ${net.toLocaleString()}</td></tr>
    </table>
    <div class="footer">
      <div class="sig">Accountant Signature</div>
      <div class="sig">Faculty Signature</div>
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
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${isLight ? "border-slate-200" : "border-gray-800"} pb-4`}>
        <div>
          <h1 className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-2`}>
            <DollarSign className={isLight ? "text-teal-600" : "text-teal-400"} size={22} />
            <span>Faculty Payroll &amp; Monthly Salary Slips</span>
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Manage teaching faculty salary structures, allowances, tax deductions, bank direct deposits, and printable payslips.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl p-5 space-y-1`}>
          <span className={`text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"}`}>Total Monthly Faculty Payroll</span>
          <div className={`text-2xl font-black ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>Rs {totalPayroll.toLocaleString()}</div>
          <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-500"}`}>Across {teachers.length} Subject Masters</div>
        </div>

        <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl p-5 space-y-1`}>
          <span className={`text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"}`}>Active Payroll Month</span>
          <div className={`text-2xl font-black ${isLight ? "text-slate-900" : "text-white"}`}>{selectedMonth}</div>
          <div className={`text-[10px] ${isLight ? "text-emerald-700 font-bold" : "text-emerald-400 font-bold"}`}>✓ Direct Bank Deposit Ready</div>
        </div>

        <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl p-5 space-y-1`}>
          <span className={`text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"}`}>Tax Deductions Shunted</span>
          <div className={`text-2xl font-black ${isLight ? "text-sky-700" : "text-sky-400"}`}>Rs {(totalPayroll * 0.05).toLocaleString()}</div>
          <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-500"}`}>FBR Withholding Tax compliant</div>
        </div>
      </div>

      {/* Faculty Table */}
      <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl overflow-hidden shadow-2xl`}>
        <div className={`p-4 border-b ${isLight ? "border-slate-100 bg-slate-50/80" : "border-gray-800 bg-black/40"} flex justify-between items-center`}>
          <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-xs uppercase tracking-wider`}>
            Teaching Faculty Salary Register ({teachers.length})
          </h3>
          <span className={`text-[10px] ${isLight ? "text-teal-700 font-bold" : "text-teal-400"} font-mono`}>Disbursed via Meezan / HBL</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b ${isLight ? "border-slate-200 text-slate-600 bg-slate-100/70" : "border-gray-800 text-gray-400 bg-black/20"} font-mono text-[10px]`}>
                <th className="p-4 font-bold">Emp Code</th>
                <th className="p-4 font-bold">Faculty Name</th>
                <th className="p-4 font-bold">Designation</th>
                <th className="p-4 font-bold">Department</th>
                <th className="p-4 font-bold text-right">Gross Salary (PKR)</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? "divide-slate-100" : "divide-gray-800/50"} font-mono text-[10px]`}>
              {filteredTeachers.map((t) => (
                <tr key={t.id} className={`${isLight ? "hover:bg-slate-50/80" : "hover:bg-white/[0.02]"} transition`}>
                  <td className={`p-4 font-bold ${isLight ? "text-sky-700" : "text-sky-400"}`}>{t.employeeCode}</td>
                  <td className={`p-4 font-sans font-bold ${isLight ? "text-slate-900" : "text-white"} text-sm`}>{t.fullName}</td>
                  <td className={`p-4 font-sans ${isLight ? "text-slate-700" : "text-gray-300"}`}>{t.designation}</td>
                  <td className={`p-4 font-sans ${isLight ? "text-emerald-700 font-bold" : "text-emerald-400"}`}>{t.department}</td>
                  <td className={`p-4 text-right font-bold ${isLight ? "text-slate-900" : "text-white"} text-xs`}>
                    Rs {t.salary.toLocaleString()}
                  </td>
                  <td className="p-4 text-center font-sans">
                    <span className={`${
                      isLight ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    } border px-2 py-0.5 rounded font-bold text-[9px]`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handlePrintPayslip(t)}
                      className={`p-1.5 ${
                        isLight ? "bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200" : "bg-teal-500/10 hover:bg-teal-500 text-teal-300 hover:text-white"
                      } rounded-lg transition cursor-pointer`}
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
