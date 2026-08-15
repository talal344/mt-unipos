"use client";

import React, { useState, useMemo } from "react";
import { useSMS, SMSFeeVoucher } from "@/context/sms-context";
import {
  CreditCard,
  Printer,
  Plus,
  Search,
  Filter,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Building,
  Check,
  X
} from "lucide-react";

export default function SMSFeesPage() {
  const { classes, feeVouchers, generateMonthlyChallans, collectFeeChallan } = useSMS();

  const [activeTab, setActiveTab] = useState<"challans" | "counter" | "defaulters">("challans");
  const [selectedClass, setSelectedClass] = useState("Class 9 (Science)");
  const [selectedMonth, setSelectedMonth] = useState("September 2026");
  const [dueDate, setDueDate] = useState("2026-09-10");
  const [search, setSearch] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // Counter Modal State
  const [collectTarget, setCollectTarget] = useState<SMSFeeVoucher | null>(null);
  const [collectForm, setCollectForm] = useState({
    amount: "",
    paymentMethod: "Cash Counter Desk",
    bankBranch: "Main Fee Desk"
  });

  const filteredVouchers = useMemo(() => {
    return feeVouchers.filter((v) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        v.challanNo.toLowerCase().includes(q) ||
        v.studentName.toLowerCase().includes(q) ||
        v.admissionNo.toLowerCase().includes(q) ||
        v.fatherName.toLowerCase().includes(q);

      return matchSearch;
    });
  }, [feeVouchers, search]);

  const defaulters = useMemo(() => {
    return feeVouchers.filter((v) => v.status === "Unpaid" || v.status === "Overdue");
  }, [feeVouchers]);

  const handleGenerateBatch = () => {
    const count = generateMonthlyChallans(selectedClass, selectedMonth, dueDate);
    setToastMsg(`✅ Generated ${count} Bank Fee Challans for ${selectedClass} (${selectedMonth})!`);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectTarget) return;

    const amt = parseFloat(collectForm.amount) || collectTarget.totalPayable;
    collectFeeChallan(collectTarget.challanNo, amt, collectForm.paymentMethod, collectForm.bankBranch);
    setToastMsg(`✅ Received fee Rs ${amt.toLocaleString()} for Challan #${collectTarget.challanNo}!`);
    setCollectTarget(null);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handlePrint3CopyChallan = (v: SMSFeeVoucher) => {
    const buildCopy = (copyType: string) => `
      <div class="challan-copy">
        <div class="header">
          <div class="school-name">MT CORE MODEL SCHOOL</div>
          <div class="school-sub">Main Campus, Gulberg III, Lahore</div>
          <div class="copy-badge">${copyType}</div>
        </div>

        <div class="bank-box">
          <b>Authorized Bank:</b> Meezan Bank / HBL<br/>
          <b>Account Title:</b> MT Core Model School (Pvt) Ltd<br/>
          <b>Account No:</b> 0201-0105892182 (Branch Code 0201)
        </div>

        <div class="meta-rows">
          <div class="row"><span>Challan #:</span><b style="color: #0284c7;">${v.challanNo}</b></div>
          <div class="row"><span>Issue Date:</span><span>${v.issueDate}</span></div>
          <div class="row"><span>Due Date:</span><b style="color: red;">${v.dueDate}</b></div>
          <div class="row"><span>Student Name:</span><b>${v.studentName}</b></div>
          <div class="row"><span>Father Name:</span><span>${v.fatherName}</span></div>
          <div class="row"><span>Admission ID:</span><span>${v.admissionNo}</span></div>
          <div class="row"><span>Class & Section:</span><span>${v.className} (${v.sectionName})</span></div>
          <div class="row"><span>Fee Billing Month:</span><b>${v.month}</b></div>
        </div>

        <table class="fee-table">
          <tr><td>Tuition Fee</td><td class="right">Rs ${v.tuitionFee.toLocaleString()}</td></tr>
          ${v.transportFee ? `<tr><td>Transport Bus Fee</td><td class="right">Rs ${v.transportFee.toLocaleString()}</td></tr>` : ''}
          ${v.examFee ? `<tr><td>Examination Fee</td><td class="right">Rs ${v.examFee.toLocaleString()}</td></tr>` : ''}
          ${v.discountConcession ? `<tr style="color: #16a34a;"><td>Sibling / Concession (-)</td><td class="right">- Rs ${v.discountConcession.toLocaleString()}</td></tr>` : ''}
          <tr class="total-row"><td>TOTAL PAYABLE (Within Due Date):</td><td class="right">Rs ${v.totalPayable.toLocaleString()}</td></tr>
          <tr style="color: red; font-size: 10px;"><td>After Due Date (+500 Late Fine):</td><td class="right">Rs ${(v.totalPayable + 500).toLocaleString()}</td></tr>
        </table>

        <div class="barcode-box">||| | ||||| || |||||| | ${v.challanNo}</div>

        <div class="sig-area">
          <div>Cashier Stamp &amp; Sign</div>
          <div>Authorized Bank Officer</div>
        </div>
      </div>
    `;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>3-Copy Bank Challan - ${v.challanNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: landscape; margin: 8mm; }
    body { font-family: 'Inter', sans-serif; background: #ffffff; color: #0f172a; padding: 10px; }
    .challan-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
    .challan-copy { border: 1.5px dashed #0284c7; padding: 12px; border-radius: 8px; font-size: 11px; }
    .header { text-align: center; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 6px; }
    .school-name { font-size: 13px; font-weight: 900; color: #0284c7; }
    .school-sub { font-size: 8px; text-transform: uppercase; color: #64748b; }
    .copy-badge { display: inline-block; background: #0f172a; color: #fff; font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 4px; margin-top: 4px; text-transform: uppercase; }
    .bank-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px; border-radius: 6px; font-size: 9px; margin-bottom: 6px; line-height: 1.3; }
    .meta-rows { margin-bottom: 6px; }
    .row { display: flex; justify-content: space-between; font-size: 10px; padding: 1.5px 0; }
    .fee-table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 8px; }
    .fee-table td { padding: 3px 0; border-bottom: 1px dotted #e2e8f0; }
    .right { text-align: right; font-weight: 700; }
    .total-row { font-weight: 900; font-size: 11px; color: #0284c7; border-top: 1px solid #000; }
    .barcode-box { background: #0f172a; color: #4ade80; text-align: center; padding: 4px; font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 1px; border-radius: 4px; }
    .sig-area { display: flex; justify-content: space-between; margin-top: 25px; font-size: 8px; font-weight: bold; }
    @media print { .no-print { display: none; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: right; margin-bottom: 10px;">
    <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 8px 16px; font-weight: bold; border-radius: 6px; cursor: pointer;">🖨️ Print 3-Copy Bank Challan</button>
  </div>
  <div class="challan-container">
    ${buildCopy("BANK COPY")}
    ${buildCopy("SCHOOL ACCOUNTS COPY")}
    ${buildCopy("STUDENT / PARENT COPY")}
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
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white font-bold text-xs py-3 px-5 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <CreditCard className="text-emerald-400" size={22} />
            <span>School Finance &amp; 3-Copy Bank Challan Desk</span>
          </h1>
          <p className="text-xs text-gray-400">
            Generate class-wide fee vouchers, apply sibling concessions, collect counter receipts, and print official 3-copy bank challans.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-[#0b121e] border border-[#1e293b] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("challans")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "challans" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            All Challans ({feeVouchers.length})
          </button>
          <button
            onClick={() => setActiveTab("defaulters")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "defaulters" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Fee Defaulters ({defaulters.length})
          </button>
        </div>
      </div>

      {/* Batch Generator Control */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#0b121e] border border-[#1e293b] p-4 rounded-2xl">
        <div>
          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Billing Month</label>
          <input
            type="text"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full bg-black border border-gray-800 p-2 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-sky-400 mb-1">Target Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full bg-black border border-gray-800 p-2 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-emerald-500"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.className}>
                {c.className}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-black border border-gray-800 p-2 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleGenerateBatch}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black uppercase rounded-xl transition text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            <Plus size={14} />
            <span>Generate Class Challans</span>
          </button>
        </div>
      </div>

      {/* Fee Challans Table */}
      <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/40">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search challan #, student name, admission ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black border border-gray-800 pl-9 pr-3 py-1.5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-mono text-[11px] bg-black/20">
                <th className="p-4 font-bold">Challan #</th>
                <th className="p-4 font-bold">Admission ID</th>
                <th className="p-4 font-bold">Student Name</th>
                <th className="p-4 font-bold">Class</th>
                <th className="p-4 font-bold">Billing Month</th>
                <th className="p-4 font-bold">Due Date</th>
                <th className="p-4 font-bold text-right">Payable (PKR)</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50 font-mono text-[11px]">
              {(activeTab === "challans" ? filteredVouchers : defaulters).map((v) => (
                <tr key={v.id} className="hover:bg-white/[0.02] transition">
                  <td className="p-4 font-bold text-emerald-400">{v.challanNo}</td>
                  <td className="p-4 text-sky-400 font-bold">{v.admissionNo}</td>
                  <td className="p-4 font-sans font-bold text-white text-sm">{v.studentName}</td>
                  <td className="p-4 font-sans text-gray-300">{v.className}</td>
                  <td className="p-4 text-gray-400 font-sans">{v.month}</td>
                  <td className="p-4 text-red-400">{v.dueDate}</td>
                  <td className="p-4 text-right font-black text-white text-sm">
                    Rs {v.totalPayable.toLocaleString()}
                  </td>
                  <td className="p-4 text-center font-sans">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                        v.status === "Paid"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-red-500/10 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex gap-1.5 justify-center">
                      <button
                        onClick={() => handlePrint3CopyChallan(v)}
                        className="p-1.5 bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white rounded-lg transition"
                        title="Print 3-Copy Bank Challan"
                      >
                        <Printer size={13} />
                      </button>
                      {v.status !== "Paid" && (
                        <button
                          onClick={() => {
                            setCollectTarget(v);
                            setCollectForm({ ...collectForm, amount: v.totalPayable.toString() });
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] transition"
                        >
                          Collect
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* COLLECT FEE MODAL                                                             */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {collectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#0b121e] border border-emerald-500/40 rounded-3xl w-full max-w-md shadow-2xl p-6 animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-emerald-400" />
                <h3 className="font-black text-white text-sm">Fee Collection Cashier Desk</h3>
              </div>
              <button onClick={() => setCollectTarget(null)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCollectSubmit} className="space-y-4 text-xs">
              <div className="bg-black/40 border border-gray-800 rounded-xl p-3 space-y-1 font-mono">
                <div>Challan: <span className="text-emerald-400 font-bold">{collectTarget.challanNo}</span></div>
                <div>Student: <span className="text-white font-bold">{collectTarget.studentName}</span></div>
                <div>Class: <span className="text-gray-300">{collectTarget.className}</span></div>
                <div>Net Due: <span className="text-white font-black text-sm">Rs {collectTarget.totalPayable.toLocaleString()}</span></div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Amount Received (PKR) *</label>
                <input
                  type="number"
                  required
                  value={collectForm.amount}
                  onChange={(e) => setCollectForm({ ...collectForm, amount: e.target.value })}
                  className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-emerald-400 font-black text-base focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Payment Method</label>
                <select
                  value={collectForm.paymentMethod}
                  onChange={(e) => setCollectForm({ ...collectForm, paymentMethod: e.target.value })}
                  className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500"
                >
                  <option value="Cash Counter Desk">Cash Counter Desk</option>
                  <option value="Bank Transfer (Meezan Bank)">Bank Transfer (Meezan Bank)</option>
                  <option value="Bank Transfer (HBL)">Bank Transfer (HBL)</option>
                  <option value="EasyPaisa / JazzCash">EasyPaisa / JazzCash</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase rounded-xl transition flex items-center justify-center gap-2 text-xs cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                <CheckCircle2 size={16} />
                <span>Confirm Payment &amp; Issue Cleared Receipt</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
