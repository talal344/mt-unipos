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
  } = useGlobalContext();

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
    <div className="flex min-h-screen bg-black text-gray-100 font-sans">
      <ClientSidebar />

      <main className="flex-grow p-6 sm:p-8 space-y-6 overflow-y-auto max-h-screen">
        
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
          
          {/* Tabs Swapper */}
          <div className="bg-brand-dark-surface border border-brand-dark-border p-1 rounded-lg flex gap-1 self-start md:self-auto">
            {[
              { id: "chart", name: "Chart of Accounts" },
              { id: "journal", name: "Journal Vouchers" },
              { id: "pl", name: "Profit & Loss Sheet" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition ${
                  activeTab === tab.id
                    ? "bg-brand-sky text-black font-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500 p-3 rounded-lg text-xs flex items-center gap-2 text-emerald-400 font-bold animate-fade-in-up">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Banner */}
        <div className="bg-gradient-to-r from-brand-sky/10 via-purple-500/10 to-transparent border border-brand-sky/20 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-sky/20 border border-brand-sky/40 rounded-xl flex items-center justify-center text-brand-sky">
              <Zap size={18} />
            </div>
            <div>
              <div className="text-xs font-black text-white">Automatic Real-Time Accounting Enabled</div>
              <div className="text-[10px] text-gray-400">
                Aap ko manual entries karne ki zaroorat nahi hai. POS sales, Expenses, Customers dues, aur Stock valuation auto-post ho kar P&amp;L calculate karti hain.
              </div>
            </div>
          </div>
        </div>

        {/* Tab 1: Chart of Accounts */}
        {activeTab === "chart" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Accounts Table */}
            <div className="lg:col-span-2 bg-brand-dark-surface/30 border border-brand-dark-border rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-brand-dark-border bg-black/40 flex justify-between items-center">
                <span className="text-xs font-black text-white uppercase tracking-wider">General Ledger Accounts</span>
                <span className="text-[9px] text-emerald-400 font-mono">Live Real-Time Balances</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-brand-dark-border text-gray-500 font-mono">
                      <th className="p-4 font-semibold">Account Code</th>
                      <th className="p-4 font-semibold">Ledger Name</th>
                      <th className="p-4 font-semibold">Type</th>
                      <th className="p-4 font-semibold text-right">Current Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-dark-border/40 font-mono text-[11px]">
                    {liveAccounts.map(acc => (
                      <tr key={acc.code} className="hover:bg-brand-dark-surface/60 transition">
                        <td className="p-4 text-brand-sky font-bold">{acc.code}</td>
                        <td className="p-4 text-white font-bold font-sans">{acc.name}</td>
                        <td className="p-4 uppercase">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            acc.type === "Asset" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                            acc.type === "Revenue" ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" :
                            acc.type === "Expense" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                            "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          }`}>
                            {acc.type}
                          </span>
                        </td>
                        <td className="p-4 text-right text-white font-bold">{formatAmt(acc.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Optional Manual Journal Voucher Form */}
            <div className="bg-brand-dark-surface/60 border border-brand-dark-border p-5 rounded-2xl h-fit space-y-4">
              <div>
                <h3 className="text-xs uppercase font-bold text-white tracking-wide">Manual Journal Entry (Optional)</h3>
                <p className="text-[9px] text-gray-500 mt-0.5">Use this only for manual audit adjustments or owner capital injections.</p>
              </div>
              
              <form onSubmit={handleJournalSubmit} className="space-y-3.5 text-xs font-sans">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Description / Memo</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Owner capital injection or manual adjustment"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white outline-none focus:border-brand-sky"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Debit Account</label>
                    <select
                      value={debAcc}
                      onChange={(e) => setDebAcc(e.target.value)}
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white outline-none focus:border-brand-sky"
                    >
                      {liveAccounts.map(a => <option key={a.code} value={a.code}>{a.code} - {a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Debit Amount</label>
                    <input
                      type="number"
                      required
                      placeholder="Amount"
                      value={debAmt}
                      onChange={(e) => { setDebAmt(e.target.value); setCredAmt(e.target.value); }}
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white font-mono outline-none focus:border-brand-sky"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Credit Account</label>
                    <select
                      value={credAcc}
                      onChange={(e) => setCredAcc(e.target.value)}
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white outline-none focus:border-brand-sky"
                    >
                      {liveAccounts.map(a => <option key={a.code} value={a.code}>{a.code} - {a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Credit Amount</label>
                    <input
                      type="number"
                      required
                      placeholder="Amount"
                      value={credAmt}
                      onChange={(e) => setCredAmt(e.target.value)}
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white font-mono outline-none focus:border-brand-sky"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-sky hover:bg-brand-sky-light text-black font-black uppercase tracking-wider rounded transition text-xs"
                >
                  Post Journal Voucher
                </button>
              </form>
            </div>

          </div>
        )}

        {/* Tab 2: Journal Entries logs */}
        {activeTab === "journal" && (
          <div className="bg-brand-dark-surface/30 border border-brand-dark-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-brand-dark-border text-gray-500 font-mono">
                    <th className="p-4 font-semibold">JV ID</th>
                    <th className="p-4 font-semibold">Date &amp; Time</th>
                    <th className="p-4 font-semibold">Description / Memo</th>
                    <th className="p-4 font-semibold">Debits (Dr)</th>
                    <th className="p-4 font-semibold">Credits (Cr)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-dark-border/40 font-mono text-[11px] leading-relaxed">
                  {journalEntries.map(entry => (
                    <tr key={entry.id} className="hover:bg-brand-dark-surface/60 transition">
                      <td className="p-4 text-purple-400 font-bold">{entry.id}</td>
                      <td className="p-4 text-gray-400">{new Date(entry.date).toLocaleString()}</td>
                      <td className="p-4 text-white font-bold font-sans">{entry.description}</td>
                      <td className="p-4">
                        {entry.debits.map((d, idx) => (
                          <div key={idx} className="flex justify-between w-32 border-b border-brand-dark-border/20 py-0.5">
                            <span className="text-gray-500">#{d.accountCode}:</span>
                            <span className="text-emerald-400 font-bold">{formatAmt(d.amount)}</span>
                          </div>
                        ))}
                      </td>
                      <td className="p-4">
                        {entry.credits.map((c, idx) => (
                          <div key={idx} className="flex justify-between w-32 border-b border-brand-dark-border/20 py-0.5">
                            <span className="text-gray-500">#{c.accountCode}:</span>
                            <span className="text-red-400 font-bold">{formatAmt(c.amount)}</span>
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                  {journalEntries.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-gray-500 italic font-sans">
                        No manual journal vouchers posted yet. System transactions are auto-calculated live.
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
          <div className="max-w-2xl mx-auto bg-brand-dark-surface/40 border border-brand-dark-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            
            <div className="text-center border-b border-brand-dark-border pb-4 space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold px-2.5 py-1 rounded-full mb-1">
                <Zap size={10} className="animate-pulse" /> Live Auto-Calculated GAAP Financial Statement
              </div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">Statement of Profit &amp; Loss</h2>
              <p className="text-[10px] text-gray-400">Calculated automatically from real POS Sales, Stock Costing, and Expense Vouchers.</p>
            </div>

            <div className="space-y-5 text-xs font-mono">
              {/* Revenues */}
              <div className="space-y-2">
                <div className="text-brand-sky font-bold border-b border-brand-dark-border/40 pb-1 flex justify-between uppercase">
                  <span>1. Gross Revenue Streams</span>
                  <span>Amount</span>
                </div>
                <div className="flex justify-between text-gray-300 pl-3">
                  <span>Gross POS &amp; Order Sales Income:</span>
                  <span className="text-emerald-400 font-bold">{formatAmt(totalSalesRevenue)}</span>
                </div>
                <div className="flex justify-between text-white font-bold border-t border-brand-dark-border/30 pt-1">
                  <span>Total Gross Revenue:</span>
                  <span className="text-brand-sky font-black">{formatAmt(totalSalesRevenue)}</span>
                </div>
              </div>

              {/* COGS */}
              <div className="space-y-2">
                <div className="text-amber-400 font-bold border-b border-brand-dark-border/40 pb-1 flex justify-between uppercase">
                  <span>2. Cost of Sales (COGS)</span>
                  <span>Amount</span>
                </div>
                <div className="flex justify-between text-gray-300 pl-3">
                  <span>Cost of Goods Sold (Inventory Cost):</span>
                  <span className="text-amber-400 font-bold">-{formatAmt(totalCogsAmt)}</span>
                </div>
                <div className="flex justify-between text-white font-bold border-t border-brand-dark-border/30 pt-1">
                  <span>Gross Profit (Revenue - COGS):</span>
                  <span className="text-emerald-400 font-black">{formatAmt(grossProfit)}</span>
                </div>
              </div>

              {/* Expenses */}
              <div className="space-y-2 pt-2">
                <div className="text-red-400 font-bold border-b border-brand-dark-border/40 pb-1 flex justify-between uppercase">
                  <span>3. Operating &amp; Utility Expenses</span>
                  <span>Amount</span>
                </div>
                {expenses.length > 0 ? (
                  expenses.map(e => (
                    <div key={e.id} className="flex justify-between text-gray-300 pl-3">
                      <span>{e.category} ({e.description || "Expense"}):</span>
                      <span className="text-red-400">-{formatAmt(e.amount)}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between text-gray-500 pl-3 italic">
                    <span>No expense vouchers recorded yet:</span>
                    <span>-{formatAmt(0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold border-t border-brand-dark-border/30 pt-1">
                  <span>Total Operating Expenses:</span>
                  <span className="text-red-400 font-black">-{formatAmt(totalExpensesAmt)}</span>
                </div>
              </div>

              {/* Net Earnings */}
              <div className="border-t-2 border-brand-sky pt-4 flex justify-between items-center bg-black/40 p-4 rounded-xl">
                <div>
                  <span className="text-white font-black uppercase text-xs block">Net Operating Profit / Loss:</span>
                  <span className="text-[9px] text-gray-500">Calculated after COGS and all expense deductions</span>
                </div>
                <span className={`text-xl font-black font-mono ${netOperatingProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
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
