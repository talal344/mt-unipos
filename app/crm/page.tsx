"use client";

import React, { useState } from "react";
import { useGlobalContext } from "@/context/global-context";
import ClientSidebar from "@/components/client-sidebar";
import { MessageSquare, Users, Award, ShieldCheck, Mail, Send, DollarSign } from "lucide-react";

import ThermalSlipModal from "@/components/thermal-slip-modal";

export default function CrmPage() {
  const { customers, suppliers, recordDueRecovery, recordSupplierPayment, settleDuesWithWallet, currencySymbol } = useGlobalContext();
  const [successMsg, setSuccessMsg] = useState("");
  
  // Navigation tabs
  const [activeSubTab, setActiveSubTab] = useState<"customers" | "suppliers">("customers");

  // Marketing campaign states
  const [channel, setChannel] = useState<"SMS" | "Email">("SMS");
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignBody, setCampaignBody] = useState("");

  // Customer dues recovery states
  const [recoveryCustomer, setRecoveryCustomer] = useState<any>(null);
  const [recoveryAmount, setRecoveryAmount] = useState("");
  const [recoveryPaymentMethod, setRecoveryPaymentMethod] = useState("Cash");

  // Thermal Slip Modal state
  const [thermalSale, setThermalSale] = useState<any>(null);
  const [showThermalModal, setShowThermalModal] = useState(false);

  // Supplier payout states
  const [payoutSupplier, setPayoutSupplier] = useState<any>(null);
  const [payoutAmount, setPayoutAmount] = useState("");

  const handleLaunchCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignBody) return;

    setSuccessMsg(`Simulated campaign broadcast dispatched to ${customers.length} registered customer contacts over ${channel}!`);
    setCampaignSubject("");
    setCampaignBody("");
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryCustomer || !recoveryAmount) return;

    const amt = Number(recoveryAmount);
    const recSale = recordDueRecovery(recoveryCustomer.id, amt, recoveryPaymentMethod);
    if (recSale) {
      setThermalSale(recSale);
      setShowThermalModal(true);
    }

    setSuccessMsg(`Due Recovery logged! Settle amount of ${currencySymbol} ${recoveryAmount} credited via ${recoveryPaymentMethod}. Receipt saved in /Dues_Clear/`);
    setRecoveryCustomer(null);
    setRecoveryAmount("");
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutSupplier || !payoutAmount) return;

    recordSupplierPayment(payoutSupplier.id, Number(payoutAmount));
    setSuccessMsg(`Supplier debt payment logged! Paid ${currencySymbol} ${payoutAmount} to ${payoutSupplier.name}. Liabilities cleared.`);
    setPayoutSupplier(null);
    setPayoutAmount("");
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  return (
    <div className="flex min-h-screen bg-black text-gray-100 font-sans">
      <ClientSidebar />

      <main className="flex-grow p-6 sm:p-8 space-y-6 overflow-y-auto max-h-screen grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Columns: Customer & Supplier directories (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Header & Sub-tabs */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-brand-dark-border/60 pb-4 gap-4">
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">CRM &amp; Settlements Desk</h1>
              <p className="text-[10px] text-gray-500">Track client loyalty accounts, adjust accounts receivable, pay supplier debts, and sync financial sheets.</p>
            </div>

            {/* Sub Tabs Swapper */}
            <div className="bg-brand-dark-surface border border-brand-dark-border p-1 rounded-lg flex gap-1 text-[10px]">
              <button
                onClick={() => setActiveSubTab("customers")}
                className={`px-3 py-1.5 rounded font-bold uppercase transition ${
                  activeSubTab === "customers" ? "bg-brand-sky text-black font-black" : "text-gray-400 hover:text-white"
                }`}
              >
                Customer Accounts
              </button>
              <button
                onClick={() => setActiveSubTab("suppliers")}
                className={`px-3 py-1.5 rounded font-bold uppercase transition ${
                  activeSubTab === "suppliers" ? "bg-brand-sky text-black font-black" : "text-gray-400 hover:text-white"
                }`}
              >
                Supplier Accounts
              </button>
            </div>
          </div>

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500 p-3 rounded-lg text-xs flex items-center gap-2 text-emerald-400 font-bold animate-fade-in-up">
              <ShieldCheck size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Tab A: Customers Loyalty & Recoveries */}
          {activeSubTab === "customers" && (
            <div className="bg-brand-dark-surface/30 border border-brand-dark-border rounded-2xl overflow-hidden animate-fade-in-up">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-brand-dark-border text-gray-500 font-mono">
                      <th className="p-4 font-semibold">Customer ID</th>
                      <th className="p-4 font-semibold">Contact Info</th>
                      <th className="p-4 font-semibold text-right">Credit Dues</th>
                      <th className="p-4 font-semibold text-right">Store Wallet</th>
                      <th className="p-4 font-semibold text-right">Loyalty Points</th>
                      <th className="p-4 font-semibold text-center">Settlements</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-dark-border/40 font-mono text-[11px]">
                    {customers.map(c => (
                      <tr key={c.id} className="hover:bg-brand-dark-surface/60 transition">
                        <td className="p-4 text-brand-sky font-bold">{c.id}</td>
                        <td className="p-4">
                          <div className="text-white font-bold font-sans">{c.name}</div>
                          <div className="text-[9px] text-gray-500">{c.mobile} • {c.email}</div>
                        </td>
                        <td className="p-4 text-right">
                          <span className={`font-bold ${c.creditBalance > 0 ? "text-amber-400 font-bold" : "text-gray-400"}`}>
                            {currencySymbol} {c.creditBalance.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <span className={`font-bold ${(c.walletBalance || 0) > 0 ? "text-emerald-400 font-bold" : "text-gray-400"}`}>
                            {currencySymbol} {(c.walletBalance || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="bg-brand-sky/10 border border-brand-sky/20 text-brand-sky font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                            {c.loyaltyPoints} points
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {c.creditBalance > 0 && (c.walletBalance || 0) > 0 && (
                              <button
                                onClick={() => {
                                  const recSale = settleDuesWithWallet(c.id);
                                  if (recSale) {
                                    setThermalSale(recSale);
                                    setShowThermalModal(true);
                                    setSuccessMsg(`⚡ Settled dues using Store Wallet for ${c.name}! Receipt saved in /Dues_Clear/`);
                                    setTimeout(() => setSuccessMsg(""), 3500);
                                  }
                                }}
                                className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[9px] uppercase rounded transition"
                                title="Pay Dues via Wallet Balance"
                              >
                                ⚡ Pay via Wallet
                              </button>
                            )}
                            {c.creditBalance > 0 ? (
                              <button
                                onClick={() => setRecoveryCustomer(c)}
                                className="px-2.5 py-1 bg-red-500 hover:bg-red-400 text-white font-black text-[10px] rounded transition"
                              >
                                Settle Dues
                              </button>
                            ) : (
                              <span className="text-[10px] text-gray-500 italic font-sans">Clear</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab B: Suppliers Debts Settlement */}
          {activeSubTab === "suppliers" && (
            <div className="bg-brand-dark-surface/30 border border-brand-dark-border rounded-2xl overflow-hidden animate-fade-in-up">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-brand-dark-border text-gray-500 font-mono">
                      <th className="p-4 font-semibold">Supplier ID</th>
                      <th className="p-4 font-semibold">Distributor Info</th>
                      <th className="p-4 font-semibold text-right">Accounts Payable Due</th>
                      <th className="p-4 font-semibold text-center">Debt Payout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-dark-border/40 font-mono text-[11px]">
                    {suppliers.map(s => (
                      <tr key={s.id} className="hover:bg-brand-dark-surface/60 transition">
                        <td className="p-4 text-purple-400 font-bold">{s.id}</td>
                        <td className="p-4">
                          <div className="text-white font-bold font-sans">{s.name}</div>
                          <div className="text-[9px] text-gray-500 font-sans">{s.company} • {s.mobile}</div>
                        </td>
                        <td className="p-4 text-right">
                          <span className={`font-bold ${s.dueAmount > 0 ? "text-red-400 font-bold" : "text-gray-400"}`}>
                            {currencySymbol} {s.dueAmount.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {s.dueAmount > 0 ? (
                            <button
                              onClick={() => setPayoutSupplier(s)}
                              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-black text-[10px] rounded transition shadow"
                            >
                              Settle AP Debt
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-500 italic font-sans">Clear</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Bulk campaign sender (4 columns) */}
        <div className="lg:col-span-4 bg-brand-dark-surface/50 border border-brand-dark-border p-5 rounded-2xl h-fit">
          <h2 className="text-xs font-black text-white uppercase tracking-wider mb-4 border-b border-brand-dark-border/40 pb-2 flex items-center gap-1.5">
            <MessageSquare className="text-brand-sky" size={14} />
            Bulk Campaign Console
          </h2>

          <form onSubmit={handleLaunchCampaign} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Marketing Channel</label>
              <div className="grid grid-cols-2 gap-2">
                {["SMS", "Email"].map(ch => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setChannel(ch as any)}
                    className={`p-2 rounded border text-center font-bold transition ${
                      channel === ch
                        ? "bg-brand-sky text-black font-black"
                        : "bg-black/60 border-brand-dark-border/80 text-gray-500 hover:text-white"
                    }`}
                  >
                    {ch === "SMS" ? "Bulk SMS" : "Bulk Email"}
                  </button>
                ))}
              </div>
            </div>

            {channel === "Email" && (
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Campaign Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Fatah Weekend Sale - 25% Off"
                  value={campaignSubject}
                  onChange={(e) => setCampaignSubject(e.target.value)}
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Broadcast Message Body</label>
              <textarea
                required
                rows={4}
                placeholder={
                  channel === "SMS"
                    ? "SMS: Dear customer, visit DHA branch this weekend to avail 20% flat discount on grocery lines! Reply STOP to opt out."
                    : "Write email HTML or text body here..."
                }
                value={campaignBody}
                onChange={(e) => setCampaignBody(e.target.value)}
                className="w-full bg-black border border-brand-dark-border p-2 rounded text-white focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-sky hover:bg-brand-sky-light text-black font-black uppercase rounded flex items-center justify-center gap-1.5"
            >
              <Send size={12} />
              Launch Marketing Blast
            </button>
          </form>

        </div>

      </main>

      {/* Customer Dues Settlement Modal */}
      {recoveryCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-brand-dark-surface border border-brand-sky/30 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in-up font-sans">
            <div className="flex justify-between items-center border-b border-brand-dark-border pb-3 mb-4 text-xs">
              <h3 className="font-black text-white">Settle Customer Account</h3>
              <button onClick={() => setRecoveryCustomer(null)} className="text-gray-400 hover:text-white">Cancel</button>
            </div>

            <form onSubmit={handleRecoverySubmit} className="space-y-4 text-xs">
              <div>
                <h4 className="text-white font-bold">{recoveryCustomer.name}</h4>
                <p className="text-[9px] text-gray-500 font-mono">Accounts Receivable Balance: {currencySymbol} {recoveryCustomer.creditBalance.toLocaleString()}</p>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Payment Method</label>
                <select
                  value={recoveryPaymentMethod}
                  onChange={e => setRecoveryPaymentMethod(e.target.value)}
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white font-bold focus:outline-none focus:border-brand-sky mb-3"
                >
                  <option value="Cash">💵 Cash</option>
                  <option value="Card">💳 Credit / Debit Card</option>
                  <option value="Bank Transfer">🏦 Bank Transfer</option>
                  <option value="EasyPaisa / JazzCash">📱 EasyPaisa / JazzCash</option>
                </select>

                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Recovery Payment Received</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 2000"
                  value={recoveryAmount}
                  onChange={(e) => setRecoveryAmount(e.target.value)}
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white font-mono font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-sky hover:bg-brand-sky-light text-black font-black uppercase rounded"
              >
                Log Recovery payment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Supplier AP Payout Modal */}
      {payoutSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-brand-dark-surface border border-purple-500/30 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in-up font-sans">
            <div className="flex justify-between items-center border-b border-brand-dark-border pb-3 mb-4 text-xs">
              <h3 className="font-black text-white">Settle Accounts Payable</h3>
              <button onClick={() => setPayoutSupplier(null)} className="text-gray-400 hover:text-white">Cancel</button>
            </div>

            <form onSubmit={handlePayoutSubmit} className="space-y-4 text-xs">
              <div>
                <h4 className="text-white font-bold">{payoutSupplier.name}</h4>
                <p className="text-[9px] text-gray-500 font-mono">Accounts Payable Due: {currencySymbol} {payoutSupplier.dueAmount.toLocaleString()}</p>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Payment Amount Paid</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 10000"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white font-mono font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase rounded"
              >
                Disburse Debt Payout
              </button>
            </form>
          </div>
        </div>
      )}

      {showThermalModal && thermalSale && (
        <ThermalSlipModal
          sale={thermalSale}
          currencySymbol={currencySymbol}
          onClose={() => { setShowThermalModal(false); setThermalSale(null); }}
        />
      )}
    </div>
  );
}
