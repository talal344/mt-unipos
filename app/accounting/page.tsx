"use client";

import React, { useState, useMemo } from "react";
import { useGlobalContext } from "@/context/global-context";
import ClientSidebar from "@/components/client-sidebar";
import { Landmark, ArrowUpRight, DollarSign, FileText, CheckCircle2, Zap, TrendingUp, TrendingDown } from "lucide-react";

export default function AccountingPage() {
  const {
    accounts,
    journalEntries,
    addJournalEntry,
    currencySymbol,
    sales,
    expenses,
    customers,
    suppliers,
    products,
    theme
  } = useGlobalContext();
  const isLight = theme === "light";

  const [successMsg, setSuccessMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"chart" | "journal" | "pl">("chart");

  // Journal Entry Form State
  const [desc, setDesc] = useState("");
  const [debAcc, setDebAcc] = useState("1001");
  const [debAmt, setDebAmt] = useState("");
  const [credAcc, setCredAcc] = useState("4001");
  const [credAmt, setCredAmt] = useState("");

  const sym = currencySymbol || "PKR";
  const formatAmt = (val: number) => {
    if (sym === "PKR") {
      return `PKR ${Math.round(val).toLocaleString()}`;
    }
    return `${sym} ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // ── AUTO-CALCULATE REAL-TIME GENERAL LEDGER BALANCES ─────────────────────
  const totalCashSalesInflow = sales
    .filter(s => (s.status as string) !== "Returned" && (s.paymentMethod === "Cash" || s.splitPayments?.["Cash"]))
    .reduce((a, s) => a + (s.splitPayments ? (s.splitPayments["Cash"] || 0) : s.total), 0);

  const totalBankSalesInflow = sales
    .filter(s => (s.status as string) !== "Returned" && (s.paymentMethod === "Card" || s.paymentMethod === "Bank Transfer" || s.paymentMethod === "EasyPaisa" || s.paymentMethod === "JazzCash"))
    .reduce((a, s) => a + s.total, 0);

  const totalExpensesAmt = expenses.reduce((a, e) => a + e.amount, 0);
  const totalCustomerDues = customers.reduce((a, c) => a + c.creditBalance, 0);
  const totalSupplierDebts = suppliers.reduce((a, s) => a + s.dueAmount, 0);
  const totalStockValuation = products.reduce((a, p) => a + (p.stock * (p.costPrice || (p.salePrice * 0.7))), 0);
  const totalSalesRevenue = sales.filter(s => (s.status as string) !== "Returned").reduce((a, s) => a + s.total, 0);

  // Auto-Calculate COGS from items sold
  const totalCogsAmt = sales.filter(s => (s.status as string) !== "Returned").reduce((acc, s) => {
    const saleCost = (s.items || []).reduce((itemAcc, item) => {
      const prod = products.find(p => p.id === item.productId || p.name.toLowerCase() === item.productName.toLowerCase());
      const cost = prod?.costPrice || (item.price * 0.65);
      return itemAcc + (cost * item.qty);
    }, 0);
    return acc + saleCost;
  }, 0);

  // Default accounts blueprint
  const defaultBaseAccounts = [
    { code: "1001", name: "Main Cash Box / Till", type: "Asset" },
    { code: "1002", name: "Bank Current Account", type: "Asset" },
    { code: "1003", name: "Product Stock Valuation", type: "Asset" },
    { code: "1004", name: "Accounts Receivable (Customer Dues)", type: "Asset" },
    { code: "2001", name: "Accounts Payable (Supplier Debt)", type: "Liability" },
    { code: "2002", name: "Sales Tax Payable", type: "Liability" },
    { code: "2003", name: "Customer Wallet Payable", type: "Liability" },
    { code: "3001", name: "Owner Capital & Retained Earnings", type: "Equity" },
    { code: "4001", name: "POS & Retail Sales Revenue", type: "Revenue" },
    { code: "5001", name: "Cost of Goods Sold (COGS)", type: "Expense" },
    { code: "5002", name: "Operating & Utility Expenses", type: "Expense" }
  ];

  // Merge live auto-calculated values + manual journal vouchers
  const liveAccounts = useMemo(() => {
    const baseList = accounts.length > 0 ? accounts : defaultBaseAccounts.map(a => ({ ...a, balance: 0 }));

    return baseList.map(acc => {
      let liveBal = acc.balance;

      // Auto-post real-time system metrics
      if (acc.code === "1001") liveBal = Math.max(0, totalCashSalesInflow - totalExpensesAmt);
      else if (acc.code === "1002") liveBal = totalBankSalesInflow;
      else if (acc.code === "1003") liveBal = totalStockValuation;
      else if (acc.code === "1004") liveBal = totalCustomerDues;
      else if (acc.code === "2001") liveBal = totalSupplierDebts;
      else if (acc.code === "4001") liveBal = totalSalesRevenue;
      else if (acc.code === "5001") liveBal = totalCogsAmt;
      else if (acc.code === "5002") liveBal = totalExpensesAmt;
      else if (acc.code === "3001") liveBal = Math.max(0, totalSalesRevenue - totalCogsAmt - totalExpensesAmt);

      // Add manual journal vouchers
      const jvDebits = journalEntries.reduce((sum, jv) => {
        const d = jv.debits.find(deb => deb.accountCode === acc.code);
        return sum + (d ? d.amount : 0);
      }, 0);

      const jvCredits = journalEntries.reduce((sum, jv) => {
        const c = jv.credits.find(cred => cred.accountCode === acc.code);
        return sum + (c ? c.amount : 0);
      }, 0);

      if (acc.type === "Asset" || acc.type === "Expense") {
        liveBal = Math.max(0, liveBal + jvDebits - jvCredits);
      } else {
        liveBal = Math.max(0, liveBal + jvCredits - jvDebits);
      }

      return { ...acc, balance: liveBal };
    });
  }, [accounts, sales, expenses, customers, suppliers, products, journalEntries]);

  // Combine Manual Journal Vouchers + Real-Time POS System Sales & Expense Vouchers
  const allJournalEntries = useMemo(() => {
    const list: typeof journalEntries = [...journalEntries];

    // Auto-generate Double-Entry Vouchers for all POS Sales
    sales.forEach(sale => {
      if ((sale.status as string) === "Returned") return;

      const isCash = sale.paymentMethod === "Cash" || sale.splitPayments?.["Cash"];
      const isBank = sale.paymentMethod === "Card" || sale.paymentMethod === "Bank Transfer" || sale.paymentMethod === "EasyPaisa" || sale.paymentMethod === "JazzCash";
      const debCode = isCash ? "1001" : isBank ? "1002" : "1004";

      list.push({
        id: `JV-POS-${sale.receiptNumber || sale.id}`,
        date: sale.date || new Date().toISOString(),
        description: `Auto POS Sale Voucher #${sale.receiptNumber || sale.id} (${sale.customerName || "Walk-in Customer"})`,
        debits: [{ accountCode: debCode, amount: sale.total }],
        credits: [{ accountCode: "4001", amount: sale.total }]
      });
    });

    // Auto-generate Double-Entry Vouchers for all Expenses & Owner Drawings
    expenses.forEach(exp => {
      const isCash = exp.paymentMethod === "Cash";
      const credCode = isCash ? "1001" : "1002";
      const isOwnerDrawing = exp.category.includes("Owner") || exp.category.includes("Drawing");
      const debCode = isOwnerDrawing ? "3002" : "5002";

      list.push({
        id: `JV-EXP-${exp.id.slice(-6)}`,
        date: exp.date || new Date().toISOString(),
        description: `Auto Expense Voucher: ${exp.category} (${exp.description || exp.category})`,
        debits: [{ accountCode: debCode, amount: exp.amount }],
        credits: [{ accountCode: credCode, amount: exp.amount }]
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [journalEntries, sales, expenses]);

  // Live P&L Calculations
  const grossProfit = Math.max(0, totalSalesRevenue - totalCogsAmt);
  const netOperatingProfit = totalSalesRevenue - totalCogsAmt - totalExpensesAmt;

  const handleJournalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !debAmt || !credAmt) return;
    if (Number(debAmt) !== Number(credAmt)) {
      alert("Accounting rule: Total Debits must exactly equal Total Credits!");
      return;
    }

    addJournalEntry(
      desc,
      [{ accountCode: debAcc, amount: Number(debAmt) }],
      [{ accountCode: credAcc, amount: Number(credAmt) }]
    );

    setSuccessMsg("Journal Voucher successfully debited and posted to General Ledger!");
    setDesc("");
    setDebAmt("");
    setCredAmt("");
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans ${isLight ? "bg-slate-100 text-slate-900" : "bg-black text-gray-100"}`}>
      <ClientSidebar />

      <main className="flex-grow p-6 sm:p-8 space-y-6 overflow-y-auto h-screen">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-brand-dark-border/60 pb-4 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white">Double-Entry Financial Books</h1>
              <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                <Zap size={10} className="animate-pulse" /> 100% Auto-Calculated
              </span>
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Live general ledgers, automated GAAP Profit &amp; Loss statements, and optional double-entry journal vouchers.
            </p>
          </div>
          
          {/* Navigation Tabs */}
          <div className={`flex p-1 rounded-xl border self-start md:self-auto ${
            isLight ? "bg-slate-200 border-slate-300" : "bg-brand-dark-surface border-brand-dark-border"
          }`}>
            <button
              onClick={() => setActiveTab("chart")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition ${
                activeTab === "chart"
                  ? isLight ? "bg-sky-600 text-white shadow-xs" : "bg-brand-sky text-black shadow-lg"
                  : isLight ? "text-slate-600 hover:text-slate-900" : "text-gray-400 hover:text-white"
              }`}
            >
              CHART OF ACCOUNTS
            </button>
            <button
              onClick={() => setActiveTab("journal")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition ${
                activeTab === "journal"
                  ? isLight ? "bg-sky-600 text-white shadow-xs" : "bg-brand-sky text-black shadow-lg"
                  : isLight ? "text-slate-600 hover:text-slate-900" : "text-gray-400 hover:text-white"
              }`}
            >
              JOURNAL VOUCHERS ({allJournalEntries.length})
            </button>
            <button
              onClick={() => setActiveTab("pl")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition ${
                activeTab === "pl"
                  ? isLight ? "bg-sky-600 text-white shadow-xs" : "bg-brand-sky text-black shadow-lg"
                  : isLight ? "text-slate-600 hover:text-slate-900" : "text-gray-400 hover:text-white"
              }`}
            >
              PROFIT &amp; LOSS SHEET
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className={`border rounded-xl p-4 flex items-center gap-3 ${
          isLight ? "bg-sky-50 border-sky-200 text-slate-900" : "bg-gradient-to-r from-brand-sky/10 via-purple-500/10 to-emerald-500/10 border-brand-sky/20"
        }`}>
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-600 shrink-0">
            <Zap size={16} />
          </div>
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>Automatic Real-Time Accounting Enabled</h4>
            <p className={`text-[10px] ${isLight ? "text-slate-600" : "text-gray-400"}`}>
              Aap ko manual entries karne ki zaroorat nahi hai. POS sales, Expenses, Customers dues, aur Stock valuation auto-post ho kar P&amp;L calculate karti hain.
            </p>
          </div>
        </div>

        {/* Tab 1: Chart of Accounts & Manual Journal Entry Form */}
        {activeTab === "chart" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Accounts Table */}
            <div className={`lg:col-span-8 border rounded-2xl p-5 space-y-4 ${
              isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/30 border-brand-dark-border text-gray-100"
            }`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider font-mono ${isLight ? "text-slate-500" : "text-gray-400"}`}>General Ledger Chart of Accounts</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b font-mono ${isLight ? "border-slate-200 text-slate-500 bg-slate-50" : "border-brand-dark-border text-gray-500"}`}>
                      <th className="p-2 font-semibold">Code</th>
                      <th className="p-2 font-semibold">Account Title</th>
                      <th className="p-2 font-semibold">Classification</th>
                      <th className="p-2 font-semibold text-right">Live General Ledger Balance</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y font-mono text-[11px] ${isLight ? "divide-slate-200" : "divide-brand-dark-border/40"}`}>
                    {liveAccounts.map(acc => (
                      <tr key={acc.code} className={`transition ${isLight ? "hover:bg-slate-50 text-slate-900" : "hover:bg-brand-dark-surface/60 text-gray-100"}`}>
                        <td className="py-3 text-sky-600 font-bold">#{acc.code}</td>
                        <td className={`py-3 font-bold font-sans ${isLight ? "text-slate-900" : "text-white"}`}>{acc.name}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            acc.type === "Asset" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                            acc.type === "Liability" ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                            acc.type === "Equity" ? "bg-purple-500/10 text-purple-600 border border-purple-500/20" :
                            acc.type === "Revenue" ? "bg-sky-500/10 text-sky-600 border border-sky-500/20" :
                            "bg-red-500/10 text-red-600 border border-red-500/20"
                          }`}>
                            {acc.type}
                          </span>
                        </td>
                        <td className={`py-3 text-right font-black text-xs ${isLight ? "text-slate-900" : "text-white"}`}>
                          {formatAmt(acc.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Manual Journal Entry Form */}
            <div className={`lg:col-span-4 border rounded-2xl p-5 space-y-4 ${
              isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/40 border-brand-dark-border text-gray-100"
            }`}>
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>Post Manual Journal Entry</h3>
                <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-500"}`}>Add custom debit &amp; credit adjustments to General Ledger.</p>
              </div>

              {successMsg && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-lg text-emerald-600 text-[10px] font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> {successMsg}
                </div>
              )}

              <form onSubmit={handleJournalSubmit} className="space-y-3 text-xs">
                <div>
                  <label className={`block text-[10px] uppercase font-mono mb-1 ${isLight ? "text-slate-600 font-bold" : "text-gray-400"}`}>Description / Narration</label>
                  <input
                    type="text"
                    required
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder="e.g. Owner capital injection or adjustment"
                    className={`w-full p-2.5 rounded text-xs font-bold border focus:outline-none ${
                      isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 shadow-xs" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-emerald-600 font-bold uppercase font-mono mb-1">Debit Account (Dr)</label>
                    <select
                      value={debAcc}
                      onChange={e => setDebAcc(e.target.value)}
                      className={`w-full p-2 rounded text-[11px] font-bold border focus:outline-none ${
                        isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500 shadow-xs" : "bg-black border-brand-dark-border text-white"
                      }`}
                    >
                      {liveAccounts.map(a => <option key={a.code} value={a.code}>#{a.code} {a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-red-500 font-bold uppercase font-mono mb-1">Credit Account (Cr)</label>
                    <select
                      value={credAcc}
                      onChange={e => setCredAcc(e.target.value)}
                      className={`w-full p-2 rounded text-[11px] font-bold border focus:outline-none ${
                        isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500 shadow-xs" : "bg-black border-brand-dark-border text-white"
                      }`}
                    >
                      {liveAccounts.map(a => <option key={a.code} value={a.code}>#{a.code} {a.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-[10px] uppercase font-mono mb-1 ${isLight ? "text-slate-600 font-bold" : "text-gray-400"}`}>Amount ({currencySymbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={debAmt}
                    onChange={e => { setDebAmt(e.target.value); setCredAmt(e.target.value); }}
                    placeholder="Enter journal voucher amount"
                    className={`w-full p-2.5 rounded text-xs font-mono font-bold border focus:outline-none ${
                      isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 shadow-xs" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition"
                >
                  Post Double-Entry Journal
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: Journal Entries logs */}
        {activeTab === "journal" && (
          <div className={`border rounded-2xl overflow-hidden space-y-3 p-4 ${
            isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/30 border-brand-dark-border text-gray-100"
          }`}>
            <div className="flex justify-between items-center px-2">
              <h3 className={`text-xs font-bold uppercase tracking-wider font-mono ${isLight ? "text-slate-900" : "text-white"}`}>
                Double-Entry Audit Journal Vouchers ({allJournalEntries.length} Records)
              </h3>
              <span className="text-[10px] text-emerald-600 font-mono bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded font-bold">
                ✓ Auto-Posted from Sales, Expenses &amp; Vouchers
              </span>
            </div>

            <div className={`overflow-x-auto rounded-xl border ${isLight ? "border-slate-200" : "border-brand-dark-border"}`}>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b font-mono ${isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "border-brand-dark-border bg-black/60 text-gray-400"}`}>
                    <th className="p-3 font-semibold">JV ID</th>
                    <th className="p-3 font-semibold">Date &amp; Time</th>
                    <th className="p-3 font-semibold">Description / Memo</th>
                    <th className="p-3 font-semibold">Debits (Dr)</th>
                    <th className="p-3 font-semibold">Credits (Cr)</th>
                  </tr>
                </thead>
                <tbody className={`divide-y font-mono text-[11px] leading-relaxed ${isLight ? "divide-slate-200" : "divide-brand-dark-border/40"}`}>
                  {allJournalEntries.map(entry => (
                    <tr key={entry.id} className={`transition ${isLight ? "hover:bg-slate-50 text-slate-900" : "hover:bg-brand-dark-surface/60 text-gray-100"}`}>
                      <td className="p-3 text-purple-600 font-bold">{entry.id}</td>
                      <td className={`p-3 whitespace-nowrap ${isLight ? "text-slate-500" : "text-gray-400"}`}>{new Date(entry.date).toLocaleString()}</td>
                      <td className={`p-3 font-bold font-sans ${isLight ? "text-slate-900" : "text-white"}`}>{entry.description}</td>
                      <td className="p-3">
                        {entry.debits.map((d, idx) => (
                          <div key={idx} className={`flex justify-between w-36 border-b py-0.5 ${isLight ? "border-slate-200" : "border-brand-dark-border/20"}`}>
                            <span className={isLight ? "text-slate-500" : "text-gray-500"}>#{d.accountCode}:</span>
                            <span className="text-emerald-600 font-bold">{formatAmt(d.amount)}</span>
                          </div>
                        ))}
                      </td>
                      <td className="p-3">
                        {entry.credits.map((c, idx) => (
                          <div key={idx} className={`flex justify-between w-36 border-b py-0.5 ${isLight ? "border-slate-200" : "border-brand-dark-border/20"}`}>
                            <span className={isLight ? "text-slate-500" : "text-gray-500"}>#{c.accountCode}:</span>
                            <span className="text-red-500 font-bold">{formatAmt(c.amount)}</span>
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                  {allJournalEntries.length === 0 && (
                    <tr>
                      <td colSpan={5} className={`text-center py-10 italic font-sans ${isLight ? "text-slate-400" : "text-gray-500"}`}>
                        No journal vouchers recorded yet. POS sales and expense transactions will automatically appear here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Automated Profit & Loss Statement */}
        {activeTab === "pl" && (
          <div className={`max-w-2xl mx-auto border rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl ${
            isLight ? "bg-white border-slate-200 text-slate-900 shadow-slate-200" : "bg-brand-dark-surface/40 border-brand-dark-border text-gray-100"
          }`}>
            
            <div className={`text-center border-b pb-4 space-y-1 ${isLight ? "border-slate-200" : "border-brand-dark-border"}`}>
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[9px] font-mono font-bold px-2.5 py-1 rounded-full mb-1">
                <Zap size={10} className="animate-pulse" /> Live Auto-Calculated GAAP Financial Statement
              </div>
              <h2 className={`text-lg font-black uppercase tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>Statement of Profit &amp; Loss</h2>
              <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>Calculated automatically from real POS Sales, Stock Costing, and Expense Vouchers.</p>
            </div>

            <div className="space-y-5 text-xs font-mono">
              {/* Revenues */}
              <div className="space-y-2">
                <div className={`font-bold border-b pb-1 flex justify-between uppercase ${isLight ? "text-sky-600 border-slate-200" : "text-brand-sky border-brand-dark-border/40"}`}>
                  <span>1. Gross Revenue Streams</span>
                  <span>Amount</span>
                </div>
                <div className={`flex justify-between pl-3 ${isLight ? "text-slate-700" : "text-gray-300"}`}>
                  <span>Gross POS &amp; Order Sales Income:</span>
                  <span className="text-emerald-600 font-bold">{formatAmt(totalSalesRevenue)}</span>
                </div>
                <div className={`flex justify-between font-bold border-t pt-1 ${isLight ? "text-slate-900 border-slate-200" : "text-white border-brand-dark-border/30"}`}>
                  <span>Total Gross Revenue:</span>
                  <span className="text-sky-600 font-black">{formatAmt(totalSalesRevenue)}</span>
                </div>
              </div>

              {/* COGS */}
              <div className="space-y-2">
                <div className={`font-bold border-b pb-1 flex justify-between uppercase ${isLight ? "text-amber-600 border-slate-200" : "text-amber-400 border-brand-dark-border/40"}`}>
                  <span>2. Cost of Sales (COGS)</span>
                  <span>Amount</span>
                </div>
                <div className={`flex justify-between pl-3 ${isLight ? "text-slate-700" : "text-gray-300"}`}>
                  <span>Cost of Goods Sold (Inventory Cost):</span>
                  <span className="text-amber-600 font-bold">-{formatAmt(totalCogsAmt)}</span>
                </div>
                <div className={`flex justify-between font-bold border-t pt-1 ${isLight ? "text-slate-900 border-slate-200" : "text-white border-brand-dark-border/30"}`}>
                  <span>Gross Profit (Revenue - COGS):</span>
                  <span className="text-emerald-600 font-black">{formatAmt(grossProfit)}</span>
                </div>
              </div>

              {/* Expenses */}
              <div className="space-y-2 pt-2">
                <div className={`font-bold border-b pb-1 flex justify-between uppercase ${isLight ? "text-red-600 border-slate-200" : "text-red-400 border-brand-dark-border/40"}`}>
                  <span>3. Operating &amp; Utility Expenses</span>
                  <span>Amount</span>
                </div>
                {expenses.length > 0 ? (
                  expenses.map(e => (
                    <div key={e.id} className={`flex justify-between pl-3 ${isLight ? "text-slate-700" : "text-gray-300"}`}>
                      <span>{e.category} ({e.description || "Expense"}):</span>
                      <span className="text-red-500 font-bold">-{formatAmt(e.amount)}</span>
                    </div>
                  ))
                ) : (
                  <div className={`flex justify-between pl-3 italic ${isLight ? "text-slate-400" : "text-gray-500"}`}>
                    <span>No expense vouchers recorded yet:</span>
                    <span>-{formatAmt(0)}</span>
                  </div>
                )}
                <div className={`flex justify-between font-bold border-t pt-1 ${isLight ? "text-slate-900 border-slate-200" : "text-white border-brand-dark-border/30"}`}>
                  <span>Total Operating Expenses:</span>
                  <span className="text-red-500 font-black">-{formatAmt(totalExpensesAmt)}</span>
                </div>
              </div>

              {/* Net Earnings */}
              <div className={`border-t-2 border-sky-500 pt-4 flex justify-between items-center p-4 rounded-xl ${
                isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-brand-dark-border"
              }`}>
                <div>
                  <span className={`font-black uppercase text-xs block ${isLight ? "text-slate-900" : "text-white"}`}>Net Operating Profit / Loss:</span>
                  <span className={`text-[9px] ${isLight ? "text-slate-500" : "text-gray-500"}`}>Calculated after COGS and all expense deductions</span>
                </div>
                <span className={`text-xl font-black font-mono ${netOperatingProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {formatAmt(netOperatingProfit)}
                </span>
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
