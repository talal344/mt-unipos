"use client";

import React, { useState } from "react";
import { useGlobalContext } from "@/context/global-context";
import ClientSidebar from "@/components/client-sidebar";
import { Landmark, ArrowUpRight, DollarSign, FileText, CheckCircle2 } from "lucide-react";

export default function AccountingPage() {
  const { accounts, journalEntries, addJournalEntry, currencySymbol } = useGlobalContext();
  const [successMsg, setSuccessMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"chart" | "journal" | "pl">("chart");

  // Journal Entry Form State
  const [desc, setDesc] = useState("");
  const [debAcc, setDebAcc] = useState("1001");
  const [debAmt, setDebAmt] = useState("");
  const [credAcc, setCredAcc] = useState("4001");
  const [credAmt, setCredAmt] = useState("");

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

  // Compute live profit and loss sheet values
  const revenueTotal = accounts.filter(a => a.type === "Revenue").reduce((acc, a) => acc + a.balance, 0);
  const expenseTotal = accounts.filter(a => a.type === "Expense").reduce((acc, a) => acc + a.balance, 0);
  const netEarnings = Math.max(0, revenueTotal - expenseTotal);

  return (
    <div className="flex min-h-screen bg-black text-gray-100 font-sans">
      <ClientSidebar />

      <main className="flex-grow p-6 sm:p-8 space-y-6 overflow-y-auto max-h-screen">
        
        {/* Top Header */}
        <div className="flex justify-between items-center border-b border-brand-dark-border/60 pb-4">
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">Double-Entry Financial Books</h1>
            <p className="text-[10px] text-gray-500">Live general ledgers, double-entry journal vouchers, and GAAP Profit &amp; Loss statements.</p>
          </div>
          
          {/* Tabs Swapper */}
          <div className="bg-brand-dark-surface border border-brand-dark-border p-1 rounded-lg flex gap-1">
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

        {/* Tab 1: Chart of Accounts */}
        {activeTab === "chart" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Accounts Table */}
            <div className="lg:col-span-2 bg-brand-dark-surface/30 border border-brand-dark-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-brand-dark-border text-gray-500 font-mono">
                      <th className="p-4 font-semibold">Account Code</th>
                      <th className="p-4 font-semibold">Ledger Name</th>
                      <th className="p-4 font-semibold">Type</th>
                      <th className="p-4 font-semibold text-right">Debit Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-dark-border/40 font-mono text-[11px]">
                    {accounts.map(acc => (
                      <tr key={acc.code} className="hover:bg-brand-dark-surface/60 transition">
                        <td className="p-4 text-brand-sky font-bold">{acc.code}</td>
                        <td className="p-4 text-white font-bold font-sans">{acc.name}</td>
                        <td className="p-4 uppercase text-gray-400">{acc.type}</td>
                        <td className="p-4 text-right text-white font-bold">{currencySymbol} {acc.balance.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Journal Voucher Form */}
            <div className="bg-brand-dark-surface/60 border border-brand-dark-border p-5 rounded-2xl h-fit">
              <h3 className="text-xs uppercase font-bold text-white tracking-wide border-b border-brand-dark-border pb-2 mb-4">Post Manual Journal Entry</h3>
              
              <form onSubmit={handleJournalSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Description / Memo</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paid office rent for June"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Debit Account</label>
                    <select
                      value={debAcc}
                      onChange={(e) => setDebAcc(e.target.value)}
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white"
                    >
                      {accounts.map(a => <option key={a.code} value={a.code}>{a.code} - {a.name}</option>)}
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
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Credit Account</label>
                    <select
                      value={credAcc}
                      onChange={(e) => setCredAcc(e.target.value)}
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white"
                    >
                      {accounts.map(a => <option key={a.code} value={a.code}>{a.code} - {a.name}</option>)}
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
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-sky hover:bg-brand-sky-light text-black font-black uppercase rounded"
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
                            <span className="text-emerald-400 font-bold">{currencySymbol} {d.amount}</span>
                          </div>
                        ))}
                      </td>
                      <td className="p-4">
                        {entry.credits.map((c, idx) => (
                          <div key={idx} className="flex justify-between w-32 border-b border-brand-dark-border/20 py-0.5">
                            <span className="text-gray-500">#{c.accountCode}:</span>
                            <span className="text-red-400 font-bold">{currencySymbol} {c.amount}</span>
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                  {journalEntries.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-gray-500 italic">No manual or POS ledger transactions registered yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Profit & Loss Statement */}
        {activeTab === "pl" && (
          <div className="max-w-xl mx-auto bg-brand-dark-surface/40 border border-brand-dark-border rounded-2xl p-6 sm:p-8 space-y-6">
            
            <div className="text-center border-b border-brand-dark-border pb-4 space-y-1">
              <h2 className="text-base font-black text-white">Profit &amp; Loss Statement</h2>
              <p className="text-[9px] text-gray-500">Live operational ledger balances. Compliant with GAAP audit rules.</p>
            </div>

            <div className="space-y-4 text-xs font-mono">
              {/* Revenues */}
              <div className="space-y-2">
                <div className="text-brand-sky font-bold border-b border-brand-dark-border/40 pb-1">REVENUE STREAMS</div>
                {accounts.filter(a => a.type === "Revenue").map(acc => (
                  <div key={acc.code} className="flex justify-between text-gray-300 pl-4">
                    <span>{acc.name} ({acc.code}):</span>
                    <span>{currencySymbol} {acc.balance.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between text-white font-bold border-t border-brand-dark-border/30 pt-1">
                  <span>Gross Operating Revenues:</span>
                  <span>{currencySymbol} {revenueTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Expenses */}
              <div className="space-y-2 pt-4">
                <div className="text-red-400 font-bold border-b border-brand-dark-border/40 pb-1">OPERATIONAL EXPENSES</div>
                {accounts.filter(a => a.type === "Expense").map(acc => (
                  <div key={acc.code} className="flex justify-between text-gray-300 pl-4">
                    <span>{acc.name} ({acc.code}):</span>
                    <span>-{currencySymbol} {acc.balance.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between text-white font-bold border-t border-brand-dark-border/30 pt-1">
                  <span>Total Deductible Expenses:</span>
                  <span>-{currencySymbol} {expenseTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Net earnings */}
              <div className="border-t-2 border-brand-sky pt-4 flex justify-between items-baseline">
                <span className="text-white font-black uppercase text-[11px]">Net Operating Income:</span>
                <span className="text-lg font-black text-brand-sky">{currencySymbol} {netEarnings.toLocaleString()}</span>
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
