"use client";

import React, { useState, useMemo } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import HRMSTopHeader from "@/components/hrms-top-header";
import { useGlobalContext } from "@/context/global-context";
import {
  PiggyBank,
  Calculator,
  Search,
  Download,
  Printer,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Building2,
  Users,
  Calendar,
  Sparkles,
  Award
} from "lucide-react";

export default function GratuityAndPFPage() {
  const { hrEmployees, currencySymbol } = useGlobalContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"gratuity" | "pf">("gratuity");
  const [pfRate, setPfRate] = useState(8.33); // 8.33% employee + 8.33% employer

  const calculateServiceYears = (joiningDateStr?: string) => {
    if (!joiningDateStr) return 1;
    const joining = new Date(joiningDateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joining.getTime());
    const years = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return Math.max(0.5, Number(years.toFixed(1)));
  };

  const calculatedData = useMemo(() => {
    return hrEmployees.map((emp) => {
      const basic = emp.basicSalary || 2000;
      const years = calculateServiceYears(emp.joiningDate);
      
      // Statutory Gratuity Formula: 30 days basic pay per completed year of service
      const gratuityAccrued = Math.round(basic * years);

      // Provident Fund Accumulation (approx months * monthly contribution)
      const totalMonths = Math.round(years * 12);
      const monthlyEmpPF = Math.round(basic * (pfRate / 100));
      const monthlyEmployerPF = Math.round(basic * (pfRate / 100));
      const totalMonthlyPF = monthlyEmpPF + monthlyEmployerPF;
      const cumulativePF = totalMonthlyPF * totalMonths;

      return {
        ...emp,
        yearsOfService: years,
        totalMonths,
        basicSalaryCalc: basic,
        gratuityAccrued,
        monthlyEmpPF,
        monthlyEmployerPF,
        totalMonthlyPF,
        cumulativePF
      };
    });
  }, [hrEmployees, pfRate]);

  const filteredList = useMemo(() => {
    return calculatedData.filter((emp) => {
      const q = searchQuery.toLowerCase();
      return (
        q === "" ||
        emp.name.toLowerCase().includes(q) ||
        emp.employeeCode.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q)
      );
    });
  }, [calculatedData, searchQuery]);

  const totalGratuityLiability = calculatedData.reduce((acc, e) => acc + e.gratuityAccrued, 0);
  const totalPFFundPool = calculatedData.reduce((acc, e) => acc + e.cumulativePF, 0);
  const totalMonthlyPFOutflow = calculatedData.reduce((acc, e) => acc + e.totalMonthlyPF, 0);

  const handlePrintSettlement = (emp: typeof calculatedData[0]) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const sym = currencySymbol || "$";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>End of Service Settlement - ${emp.name}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #0f172a; }
          .header { border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: 800; color: #059669; }
          .meta { font-size: 12px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
          th { background: #f1f5f9; }
          .total { background: #ecfdf5; font-weight: bold; font-size: 14px; color: #065f46; }
          .footer { font-size: 10px; color: #64748b; margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 15px; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">MT-CORE END-OF-SERVICE BENEFIT CERTIFICATE</div>
          <div style="font-size: 12px; color: #64748b;">Statutory Gratuity &amp; Provident Fund Statement</div>
        </div>

        <div class="meta">
          <p><strong>Employee Name:</strong> ${emp.name} | <strong>Code:</strong> ${emp.employeeCode}</p>
          <p><strong>Designation:</strong> ${emp.designation} | <strong>Department:</strong> ${emp.department}</p>
          <p><strong>Joining Date:</strong> ${emp.joiningDate || "2024-01-01"} | <strong>Service Tenure:</strong> ${emp.yearsOfService} Years</p>
          <p><strong>Last Drawn Basic Salary:</strong> ${sym}${emp.basicSalaryCalc.toLocaleString()}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Benefit Component</th>
              <th>Calculation Formula</th>
              <th style="text-align: right;">Total Amount (${sym})</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Statutory End-of-Service Gratuity</td>
              <td>${sym}${emp.basicSalaryCalc.toLocaleString()} &times; ${emp.yearsOfService} Years</td>
              <td style="text-align: right;">${sym}${emp.gratuityAccrued.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Employee PF Contribution Accrued</td>
              <td>${pfRate}% &times; ${emp.totalMonths} Months</td>
              <td style="text-align: right;">${sym}${(emp.monthlyEmpPF * emp.totalMonths).toLocaleString()}</td>
            </tr>
            <tr>
              <td>Employer Matching PF Accrued</td>
              <td>${pfRate}% &times; ${emp.totalMonths} Months</td>
              <td style="text-align: right;">${sym}${(emp.monthlyEmployerPF * emp.totalMonths).toLocaleString()}</td>
            </tr>
            <tr class="total">
              <td colspan="2">Total Gross Terminal Benefits Payable</td>
              <td style="text-align: right;">${sym}${(emp.gratuityAccrued + emp.cumulativePF).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <div>Authorized by: Corporate Finance &amp; HR Compliance</div>
          <div>Strictly Confidential &bull; MT-Core Enterprise</div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex h-screen bg-[#05080d] text-gray-100 font-sans overflow-hidden">
      <HRMSSidebar />

      <main className="flex-grow overflow-y-auto h-full relative">
        <HRMSTopHeader
          title="🏦 End-of-Service Gratuity & Provident Fund Engine"
          subtitle="Calculate statutory retirement gratuity liabilities, monthly employer/employee PF contributions, and terminal payouts."
        />

        <div className="p-6 space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-4.5">
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Gratuity Liability</p>
              <p className="text-2xl font-black text-emerald-400">
                {currencySymbol || "$"}{totalGratuityLiability.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">Total Accrued Across Staff</p>
            </div>

            <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-4.5">
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Total PF Fund Pool</p>
              <p className="text-2xl font-black text-sky-400">
                {currencySymbol || "$"}{totalPFFundPool.toLocaleString()}
              </p>
              <p className="text-[10px] text-sky-500/80 mt-0.5">Cumulative Trust Balance</p>
            </div>

            <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-4.5">
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Monthly PF Inflow</p>
              <p className="text-2xl font-black text-amber-400">
                {currencySymbol || "$"}{totalMonthlyPFOutflow.toLocaleString()} / mo
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">Emp + Employer Match</p>
            </div>

            <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-4.5">
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">PF Contribution Rate</p>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  step="0.01"
                  value={pfRate}
                  onChange={(e) => setPfRate(Number(e.target.value) || 8.33)}
                  className="w-20 bg-black border border-gray-700 text-white font-black text-sm px-2 py-1 rounded-lg text-center"
                />
                <span className="text-xs text-gray-400">% each</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Adjustable Statutory Rate</p>
            </div>
          </div>

          {/* Tab Switcher & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0b0f17] border border-gray-800 p-3 rounded-2xl">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("gratuity")}
                className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer ${
                  activeTab === "gratuity"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-black/50 text-gray-400 border border-gray-800 hover:text-white"
                }`}
              >
                <Calculator size={14} /> Statutory Gratuity Valuation
              </button>
              <button
                onClick={() => setActiveTab("pf")}
                className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer ${
                  activeTab === "pf"
                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                    : "bg-black/50 text-gray-400 border border-gray-800 hover:text-white"
                }`}
              >
                <PiggyBank size={14} /> Provident Fund (PF) Trust Ledger
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search staff by name, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-gray-800 pl-9 pr-3 py-2 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Table View */}
          <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-black/40 text-[10px] text-gray-500 uppercase tracking-wider font-mono border-b border-gray-800">
                    <th className="p-3.5">Employee</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Service Tenure</th>
                    <th className="p-3.5">Basic Salary</th>
                    {activeTab === "gratuity" ? (
                      <>
                        <th className="p-3.5">Gratuity Formula</th>
                        <th className="p-3.5 font-bold text-emerald-400">Accrued Gratuity</th>
                      </>
                    ) : (
                      <>
                        <th className="p-3.5">Monthly (Emp + Co)</th>
                        <th className="p-3.5 font-bold text-sky-400">Total PF Balance</th>
                      </>
                    )}
                    <th className="p-3.5 text-right">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {filteredList.map((emp) => (
                    <tr key={emp.id} className="hover:bg-emerald-500/5 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{emp.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{emp.employeeCode}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="text-gray-300">{emp.department}</span>
                        <div className="text-[10px] text-gray-500 font-mono">{emp.designation}</div>
                      </td>
                      <td className="p-3.5 font-mono text-gray-300">
                        {emp.yearsOfService} Years ({emp.totalMonths} mos)
                      </td>
                      <td className="p-3.5 font-mono text-gray-300">
                        {currencySymbol || "$"}{emp.basicSalaryCalc.toLocaleString()}
                      </td>

                      {activeTab === "gratuity" ? (
                        <>
                          <td className="p-3.5 font-mono text-[11px] text-gray-400">
                            1 Mo Basic &times; {emp.yearsOfService} yrs
                          </td>
                          <td className="p-3.5 font-mono font-black text-emerald-400 text-sm">
                            {currencySymbol || "$"}{emp.gratuityAccrued.toLocaleString()}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-3.5 font-mono text-[11px] text-gray-300">
                            {currencySymbol || "$"}{emp.monthlyEmpPF} + {currencySymbol || "$"}{emp.monthlyEmployerPF} ({currencySymbol || "$"}{emp.totalMonthlyPF}/mo)
                          </td>
                          <td className="p-3.5 font-mono font-black text-sky-400 text-sm">
                            {currencySymbol || "$"}{emp.cumulativePF.toLocaleString()}
                          </td>
                        </>
                      )}

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handlePrintSettlement(emp)}
                          className="flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition ml-auto cursor-pointer"
                        >
                          <Printer size={12} /> Statement PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
