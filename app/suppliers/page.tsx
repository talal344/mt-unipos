"use client";

import React, { useState, useMemo } from "react";
import { useGlobalContext } from "@/context/global-context";
import ClientSidebar from "@/components/client-sidebar";
import {
  Truck, Plus, Search, Edit2, Trash2, CreditCard, X, Check,
  AlertCircle, Phone, Mail, MapPin, DollarSign, Calendar,
  ArrowLeft, ShoppingBag, Eye, ShieldCheck, FileText, ChevronRight
} from "lucide-react";

// Helpers
function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-PK", {
      day: "2-digit", month: "short", year: "numeric"
    });
  } catch { return dateStr; }
}

const EMPTY_FORM = {
  name: "",
  company: "",
  mobile: "",
  email: "",
};

export default function SuppliersPage() {
  const {
    suppliers, addSupplier, updateSupplier, deleteSupplier,
    recordSupplierPayment, purchaseOrders, currencySymbol, theme
  } = useGlobalContext();
  const isLight = theme === "light";

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return suppliers.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.company.toLowerCase().includes(q) ||
      s.mobile.includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  }, [suppliers, search]);

  const selectedSupplier = useMemo(() =>
    suppliers.find(s => s.id === selectedId) || null, [suppliers, selectedId]);

  // Aggregate stats
  const totalSuppliers = suppliers.length;
  const totalDueAmount = suppliers.reduce((a, s) => a + s.dueAmount, 0);
  const totalPOs = purchaseOrders.length;
  const pendingPOs = purchaseOrders.filter(po => po.status === "Pending").length;

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setShowFormModal(true);
  };

  const openEdit = (s: typeof suppliers[0]) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      company: s.company,
      mobile: s.mobile,
      email: s.email,
    });
    setShowFormModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.company.trim() || !form.mobile.trim()) {
      return;
    }

    if (editingId) {
      updateSupplier(editingId, {
        name: form.name,
        company: form.company,
        mobile: form.mobile,
        email: form.email,
      });
      triggerToast("Supplier updated successfully!");
    } else {
      addSupplier({
        name: form.name,
        company: form.company,
        mobile: form.mobile,
        email: form.email,
      });
      triggerToast("New supplier registered!");
    }
    setShowFormModal(false);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setPaymentError("Please enter a valid amount");
      return;
    }
    if (selectedSupplier && amount > selectedSupplier.dueAmount) {
      setPaymentError("Payment amount cannot exceed total outstanding balance");
      return;
    }

    recordSupplierPayment(selectedId, amount);
    triggerToast(`Logged payment of ${currencySymbol} ${amount.toLocaleString()} to supplier.`);
    setShowPaymentModal(false);
    setPaymentAmount("");
    setPaymentError("");
  };

  const handleDelete = (id: string) => {
    deleteSupplier(id);
    if (selectedId === id) setSelectedId(null);
    setConfirmDeleteId(null);
    triggerToast("Supplier removed from database.");
  };

  return (
    <div className={`flex min-h-screen font-sans ${isLight ? "bg-slate-100 text-slate-900" : "bg-black text-gray-100"}`}>
      <ClientSidebar />

      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-4 right-4 bg-emerald-500/95 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-2xl z-50 flex items-center gap-2 animate-bounce">
          <Check size={14} /> {toast}
        </div>
      )}

      <main className="flex-grow flex overflow-hidden max-h-screen">
        
        {/* LEFT COLUMN: Suppliers list */}
        <section className={`flex flex-col border-r border-brand-dark-border transition-all duration-300 ${selectedId ? "w-0 lg:w-[420px] overflow-hidden" : "flex-grow"}`}>
          <div className="flex-grow overflow-y-auto p-6 space-y-5">
            
            {/* Title / Action */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-xl font-black flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                  <Truck size={20} className="text-sky-500" />
                  Supplier Directory
                </h1>
                <p className={`text-[10px] mt-0.5 ${isLight ? "text-slate-500" : "text-gray-500"}`}>
                  {totalSuppliers} authorized wholesale distributors &amp; suppliers
                </p>
              </div>
              <button
                onClick={openAdd}
                className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs px-4 py-2.5 rounded-lg shadow-lg transition"
              >
                <Plus size={14} /> Register Supplier
              </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { icon: Truck, label: "Suppliers", val: totalSuppliers, color: "text-sky-500" },
                { icon: DollarSign, label: "Accounts Payable", val: `${currencySymbol} ${Math.round(totalDueAmount).toLocaleString()}`, color: "text-red-500" },
                { icon: ShoppingBag, label: "Total POs Filed", val: totalPOs, color: "text-purple-500" },
                { icon: FileText, label: "Pending POs", val: pendingPOs, color: "text-amber-500" },
              ].map(stat => (
                <div key={stat.label} className={`border rounded-xl p-4 ${
                  isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/40 border-brand-dark-border text-gray-100"
                }`}>
                  <stat.icon size={16} className={stat.color} />
                  <div className={`text-lg font-black font-mono mt-1 ${stat.color}`}>{stat.val}</div>
                  <div className={`text-[9px] uppercase tracking-wide font-bold ${isLight ? "text-slate-500" : "text-gray-500"}`}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className={`absolute left-3 top-2.5 ${isLight ? "text-slate-400" : "text-gray-500"}`} size={14} />
              <input
                type="text"
                placeholder="Search by supplier name, company or mobile..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-lg text-xs font-bold border focus:outline-none ${
                  isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 shadow-xs" : "bg-brand-dark-surface border-brand-dark-border text-white focus:border-brand-sky"
                }`}
              />
            </div>

            {/* Supplier list */}
            <div className="space-y-2">
              {filtered.length === 0 ? (
                <div className={`text-center py-20 ${isLight ? "text-slate-400" : "text-gray-600"}`}>
                  <Truck size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="text-xs font-bold">No suppliers found. Click &apos;Register Supplier&apos; to add one.</p>
                </div>
              ) : filtered.map(s => {
                const isActive = selectedId === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className={`group flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      isActive
                        ? isLight
                          ? "bg-sky-50 border-sky-400 shadow-xs"
                          : "bg-brand-sky/10 border-brand-sky/40"
                        : isLight
                        ? "bg-white border-slate-200 hover:border-sky-300 hover:bg-slate-50 shadow-xs text-slate-900"
                        : "bg-brand-dark-surface/30 border-brand-dark-border hover:border-brand-sky/30 hover:bg-brand-dark-surface/60 text-gray-100"
                    }`}
                  >
                    {/* Avatar icon container */}
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                      isActive 
                        ? "bg-sky-600 text-white" 
                        : isLight
                        ? "bg-slate-100 border border-slate-300 text-slate-700"
                        : "bg-brand-dark-border text-gray-300"
                    }`}>
                      {s.company.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm truncate ${isLight ? "text-slate-900" : "text-white"}`}>{s.name}</span>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${
                          isLight ? "border-slate-300 bg-slate-100 text-slate-700" : "border-brand-dark-border bg-brand-dark-surface/80 text-gray-400"
                        }`}>
                          {s.company}
                        </span>
                      </div>
                      <div className={`text-[10px] mt-0.5 flex items-center gap-3 ${isLight ? "text-slate-500" : "text-gray-500"}`}>
                        <span className="flex items-center gap-1"><Phone size={9} /> {s.mobile}</span>
                        {s.purchaseHistory && s.purchaseHistory.length > 0 && (
                          <span className="flex items-center gap-1"><ShoppingBag size={9} /> {s.purchaseHistory.length} orders</span>
                        )}
                      </div>
                    </div>

                    {/* Payable Balance */}
                    <div className="text-right shrink-0 space-y-1">
                      <div className={`text-[9px] uppercase tracking-wide font-bold ${isLight ? "text-slate-500" : "text-gray-500"}`}>Balance Due</div>
                      <div className={`font-black font-mono text-xs ${s.dueAmount > 0 ? "text-red-500" : isLight ? "text-slate-400" : "text-gray-400"}`}>
                        {currencySymbol} {s.dueAmount.toLocaleString()}
                      </div>
                    </div>

                    <ChevronRight size={14} className={`${isLight ? "text-slate-400 group-hover:text-sky-600" : "text-gray-600 group-hover:text-brand-sky"} transition shrink-0`} />
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* RIGHT COLUMN: Supplier detailed view */}
        {selectedSupplier && (
          <section className="flex-grow flex flex-col overflow-hidden bg-black/60">
            
            {/* Header section inside panel */}
            <div className="shrink-0 border-b border-brand-dark-border p-5 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedId(null)}
                  className="lg:hidden p-2 rounded-lg bg-brand-dark-border text-gray-400 hover:text-white"
                >
                  <ArrowLeft size={14} />
                </button>

                <div className="w-14 h-14 rounded-2xl bg-brand-sky text-black font-black text-xl flex items-center justify-center shrink-0">
                  {selectedSupplier.company.charAt(0).toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-black text-white text-lg">{selectedSupplier.name}</h2>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border border-brand-dark-border bg-brand-dark-surface/80 text-gray-300">
                      {selectedSupplier.company}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-gray-400 mt-1">
                    <span className="flex items-center gap-1"><Phone size={10} /> {selectedSupplier.mobile}</span>
                    <span className="flex items-center gap-1"><Mail size={10} /> {selectedSupplier.email}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {selectedSupplier.dueAmount > 0 && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[10px] uppercase px-3 py-2 rounded-lg transition"
                  >
                    <CreditCard size={11} /> Pay Supplier
                  </button>
                )}
                <button
                  onClick={() => openEdit(selectedSupplier)}
                  className="flex items-center gap-1 px-3 py-2 bg-brand-dark-border hover:bg-brand-sky/20 text-gray-300 hover:text-brand-sky rounded-lg text-[10px] font-bold transition"
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button
                  onClick={() => setConfirmDeleteId(selectedSupplier.id)}
                  className="flex items-center gap-1 px-3 py-2 bg-brand-dark-border hover:bg-red-500/20 text-gray-300 hover:text-red-400 rounded-lg text-[10px] font-bold transition"
                >
                  <Trash2 size={12} /> Delete
                </button>
                <button
                  onClick={() => setSelectedId(null)}
                  className="p-2 bg-brand-dark-border hover:bg-brand-dark-border/60 text-gray-400 hover:text-white rounded-lg transition hidden lg:block"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Quick summary line */}
            <div className="shrink-0 px-5 py-3 bg-brand-dark-surface/30 border-b border-brand-dark-border">
              <div className="flex items-center justify-around gap-6">
                {[
                  { label: "Accounts Payable Due", val: `${currencySymbol} ${selectedSupplier.dueAmount.toLocaleString()}`, icon: DollarSign, color: selectedSupplier.dueAmount > 0 ? "text-red-400" : "text-gray-500" },
                  { label: "Purchase Orders Filed", val: `${selectedSupplier.purchaseHistory?.length || 0} bills`, icon: ShoppingBag, color: "text-brand-sky" },
                  { label: "Distributor Contact", val: selectedSupplier.mobile, icon: Phone, color: "text-purple-400" },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center gap-2">
                    <stat.icon size={14} className={stat.color} />
                    <div>
                      <div className={`text-sm font-black font-mono ${stat.color}`}>{stat.val}</div>
                      <div className="text-[9px] text-gray-600 uppercase tracking-wide">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scrollable details tab */}
            <div className="flex-grow overflow-y-auto p-5 space-y-5">
              
              {/* Profile Card */}
              <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-2xl p-5 space-y-3">
                <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-brand-dark-border/50 pb-2 mb-3">Distributor Profile</h3>
                {[
                  { label: "Representative Name", val: selectedSupplier.name, icon: Truck },
                  { label: "Wholesale Company", val: selectedSupplier.company, icon: ShoppingBag },
                  { label: "Registered Mobile", val: selectedSupplier.mobile, icon: Phone },
                  { label: "Official Email Address", val: selectedSupplier.email, icon: Mail },
                ].map(row => (
                  <div key={row.label} className="flex items-start gap-3 text-xs">
                    <row.icon size={13} className="text-gray-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-gray-500 text-[9px] uppercase tracking-wide block">{row.label}</span>
                      <span className="text-white font-semibold">{row.val}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Purchase history table */}
              <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-2xl p-5">
                <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-brand-dark-border/50 pb-2 mb-3 flex items-center justify-between">
                  <span>Goods Supply Ledger</span>
                  <span className="text-[10px] text-brand-sky font-bold">({selectedSupplier.purchaseHistory?.length || 0} GRN receipts)</span>
                </h3>

                {!selectedSupplier.purchaseHistory || selectedSupplier.purchaseHistory.length === 0 ? (
                  <div className="text-center py-10 text-gray-600 text-xs">
                    No purchases logged for this supplier yet.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {selectedSupplier.purchaseHistory.map((h, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-brand-dark-border/30 last:border-0 font-mono">
                        <div>
                          <div className="font-bold text-white text-[11px]">{h.orderId}</div>
                          <div className="text-gray-500 text-[9px] font-sans">{formatDate(h.date)}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] bg-brand-dark-border px-2 py-0.5 rounded text-gray-400 font-sans">Received</span>
                          <span className="font-black text-brand-sky">
                            {currencySymbol} {h.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </section>
        )}

      </main>

      {/* MODAL: Register/Edit Supplier */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-brand-dark-surface border border-brand-sky/30 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-brand-dark-border pb-3 mb-5">
              <div>
                <h3 className="font-black text-white text-sm flex items-center gap-2">
                  <Truck size={16} className="text-brand-sky" />
                  {editingId ? "Edit Supplier Info" : "Register New Supplier"}
                </h3>
                <p className="text-[9px] text-gray-500 mt-0.5">
                  Distributor contact details for filing purchase orders
                </p>
              </div>
              <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Representative Name *</label>
                <input
                  type="text" required
                  placeholder="e.g. Saleem Akhtar"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded-lg text-white focus:outline-none focus:border-brand-sky"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Company / Distributor Name *</label>
                <input
                  type="text" required
                  placeholder="e.g. Nestle Pakistan Ltd."
                  value={form.company}
                  onChange={e => setForm({ ...form, company: e.target.value })}
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded-lg text-white focus:outline-none focus:border-brand-sky"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Mobile Contact *</label>
                  <input
                    type="text" required
                    placeholder="03xxxxxxxxx"
                    value={form.mobile}
                    onChange={e => setForm({ ...form, mobile: e.target.value })}
                    className="w-full bg-black border border-brand-dark-border p-2.5 rounded-lg text-white focus:outline-none focus:border-brand-sky font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="supplier@distributor.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-black border border-brand-dark-border p-2.5 rounded-lg text-white focus:outline-none focus:border-brand-sky"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 py-2.5 bg-brand-dark-border hover:bg-brand-dark-border/70 text-gray-300 font-bold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-sky hover:bg-brand-sky-light text-black font-black uppercase rounded-lg transition"
                >
                  {editingId ? "Save Changes" : "Register Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Record Supplier Debt payment */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-brand-dark-surface border border-emerald-500/30 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in-up font-sans">
            <div className="flex justify-between items-center border-b border-brand-dark-border pb-3 mb-4 text-xs">
              <h3 className="font-black text-white">Disburse Supplier Payout</h3>
              <button onClick={() => { setShowPaymentModal(false); setPaymentError(""); }} className="text-gray-400 hover:text-white">Cancel</button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs">
              <div>
                <h4 className="text-white font-bold">{selectedSupplier?.company}</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">Accounts Payable Outstanding: <span className="text-red-400 font-black font-mono">{currencySymbol} {selectedSupplier?.dueAmount.toLocaleString()}</span></p>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Disbursed Amount Paid</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 5000"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white font-mono font-bold focus:outline-none focus:border-brand-sky"
                />
                {paymentError && <p className="text-red-400 text-[9px] mt-1.5 flex items-center gap-1"><AlertCircle size={10} /> {paymentError}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase rounded transition"
              >
                Log Debt Settlement Payout
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-brand-dark-surface border border-red-500/30 p-6 rounded-2xl w-full max-w-sm shadow-2xl text-center space-y-4 animate-fade-in-up">
            <AlertCircle size={40} className="text-red-400 mx-auto" />
            <div>
              <h3 className="font-black text-white text-base">Remove Supplier?</h3>
              <p className="text-[10px] text-gray-400 mt-1">
                This will permanently delete Nestle distributor profile. Purchase order history inside the inventory system will not be deleted.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 bg-brand-dark-border text-gray-300 font-bold rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-black rounded-lg text-xs transition"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
