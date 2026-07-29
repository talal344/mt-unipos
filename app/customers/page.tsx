"use client";

import React, { useState, useMemo } from "react";
import { useGlobalContext } from "@/context/global-context";
import ClientSidebar from "@/components/client-sidebar";
import {
  Users, Plus, Search, Edit2, Trash2, Eye, Star, ShoppingBag,
  Phone, Mail, MapPin, CreditCard, X, ChevronRight, Receipt,
  TrendingUp, Award, AlertCircle, Check, ChevronDown, ArrowLeft,
  Printer, User, RefreshCw, BadgeCheck, Hash
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "overview" | "purchases" | "receipts" | "loyalty" | "credit";

const EMPTY_FORM = {
  name: "",
  mobile: "",
  email: "",
  address: "",
  cnic: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-PK", {
      day: "2-digit", month: "short", year: "numeric"
    });
  } catch { return dateStr; }
}

function formatDateTime(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleString("en-PK", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  } catch { return dateStr; }
}

const TIER_CONFIG = [
  { label: "Bronze", minPts: 0, color: "text-amber-600", bg: "bg-amber-600/10 border-amber-600/20" },
  { label: "Silver", minPts: 500, color: "text-gray-300", bg: "bg-gray-300/10 border-gray-300/20" },
  { label: "Gold", minPts: 2000, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
  { label: "Platinum", minPts: 5000, color: "text-brand-sky", bg: "bg-brand-sky/10 border-brand-sky/20" },
];

function getLoyaltyTier(pts: number) {
  return [...TIER_CONFIG].reverse().find(t => pts >= t.minPts) || TIER_CONFIG[0];
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CustomersPage() {
  const {
    customers, addCustomer, updateCustomer, deleteCustomer,
    sales, currencySymbol, recordDueRecovery
  } = useGlobalContext();

  // ── List state
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "points" | "spent" | "visits">("name");

  // ── Detail drawer state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<Tab>("overview");

  // ── Add/Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // ── Due Recovery Modal
  const [recoveryCustomer, setRecoveryCustomer] = useState<any>(null);
  const [recoveryAmount, setRecoveryAmount] = useState("");
  const [recoveryError, setRecoveryError] = useState("");

  // ── Credit Report Modal
  const [showCreditReportModal, setShowCreditReportModal] = useState(false);

  // ── Toast
  const [toast, setToast] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ── Credit Thermal Slip Printing Helpers
  const printIndividualCreditSlip = (sale: any) => {
    const win = window.open("", "_blank", "width=340,height=600");
    if (!win) return;
    win.document.write(`
      <html><head><title>Credit Sale ${sale.receiptNumber}</title>
      <style>
        body { font-family: monospace; font-size: 11px; padding: 16px; width: 280px; margin: 0; }
        .center { text-align: center; }
        .line { border-top: 1px dashed #000; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; }
        .bold { font-weight: bold; }
        .big { font-size: 14px; }
        .sm { font-size: 9px; }
        .signature-box { border-top: 1px solid #000; margin-top: 40px; text-align: center; padding-top: 4px; width: 120px; }
      </style>
      </head><body>
      <div class="center">
        <div class="bold big">CREDIT SALE RECEIPT</div>
        <div class="bold">MT UNIPOS</div>
        <div class="sm">Mian Talal UniPOS ERP</div>
      </div>
      <div class="line"></div>
      <div class="row"><span>Date:</span><span>${new Date(sale.date).toLocaleString()}</span></div>
      <div class="row"><span>Receipt:</span><span class="bold">${sale.receiptNumber}</span></div>
      <div class="row"><span>Customer:</span><span class="bold">${sale.customerName}</span></div>
      <div class="row"><span>Cashier:</span><span>${sale.cashierName}</span></div>
      <div class="line"></div>
      <div class="bold">ITEMS ON CREDIT:</div>
      ${sale.items.map((i: any) => `<div class="row"><span>${i.productName} x${i.qty}</span><span>PKR ${i.subtotal}</span></div>`).join("")}
      <div class="line"></div>
      <div class="row"><span>Subtotal:</span><span>PKR ${sale.subtotal}</span></div>
      <div class="row"><span>Tax:</span><span>PKR ${Math.round(sale.tax)}</span></div>
      <div class="row"><span>Discount:</span><span>-PKR ${Math.round(sale.discount)}</span></div>
      <div class="line"></div>
      <div class="row bold big"><span>CREDIT TOTAL:</span><span>PKR ${Math.round(sale.total)}</span></div>
      <div class="line"></div>
      
      <div style="display: flex; justify-content: space-between; margin-top: 10px;">
        <div class="signature-box sm">Customer Signature</div>
        <div class="signature-box sm">Authorized By</div>
      </div>
      <div class="line" style="margin-top: 30px;"></div>
      <div class="center sm">Please keep this receipt for credit clearance.<br/>Powered by MT UniPOS</div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  const printCustomerCreditStatement = (cust: any, custSales: any[]) => {
    const creditSales = custSales.filter(s => s.paymentMethod === "On Credit" || (s.splitPayments && s.splitPayments["On Credit"] > 0));
    const win = window.open("", "_blank", "width=340,height=600");
    if (!win) return;
    
    let totalCredits = 0;
    const salesHtml = creditSales.map((s: any) => {
      const creditAmt = s.splitPayments ? (s.splitPayments["On Credit"] || 0) : s.total;
      totalCredits += creditAmt;
      return `
        <div class="bold" style="margin-top: 6px;">${new Date(s.date).toLocaleDateString()} (${s.receiptNumber})</div>
        ${s.items.map((i: any) => `<div class="row sm"><span>&nbsp;&nbsp;${i.productName} x${i.qty}</span><span>PKR ${i.subtotal}</span></div>`).join("")}
        <div class="row bold sm"><span>&nbsp;&nbsp;Credit Amount:</span><span>PKR ${creditAmt}</span></div>
      `;
    }).join("");

    const totalRecoveries = cust.dueRecoveryHistory?.reduce((a: number, r: any) => a + r.amount, 0) || 0;
    const recoveriesHtml = cust.dueRecoveryHistory?.map((r: any) => `
      <div class="row sm"><span>&nbsp;&nbsp;${new Date(r.date).toLocaleDateString()} - Payment</span><span>-PKR ${r.amount}</span></div>
    `).join("") || `<div class="sm center">No recovery payments logged</div>`;

    win.document.write(`
      <html><head><title>Credit Statement - ${cust.name}</title>
      <style>
        body { font-family: monospace; font-size: 11px; padding: 16px; width: 280px; margin: 0; }
        .center { text-align: center; }
        .line { border-top: 1px dashed #000; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; }
        .bold { font-weight: bold; }
        .big { font-size: 13px; }
        .sm { font-size: 9px; }
        .signature-box { border-top: 1px solid #000; margin-top: 40px; text-align: center; padding-top: 4px; width: 120px; }
      </style>
      </head><body>
      <div class="center">
        <div class="bold big">CREDIT STATEMENT REPORT</div>
        <div class="bold">MT UNIPOS</div>
        <div class="sm">Gulberg III, Main Boulevard, Lahore</div>
      </div>
      <div class="line"></div>
      <div class="row"><span>Customer:</span><span class="bold">${cust.name}</span></div>
      ${cust.customerNo && cust.customerNo !== "N/A" ? `<div class="row"><span>Customer No:</span><span class="bold">${cust.customerNo}</span></div>` : ""}
      <div class="row"><span>Mobile:</span><span>${cust.mobile}</span></div>
      ${cust.cnic ? `<div class="row"><span>CNIC:</span><span>${cust.cnic}</span></div>` : ""}
      <div class="row"><span>Statement Date:</span><span>${new Date().toLocaleDateString()}</span></div>
      <div class="line"></div>
      
      <div class="bold">CREDIT PURCHASES HISTORY:</div>
      ${salesHtml || `<div class="sm center">No credit sales logged</div>`}
      
      <div class="line"></div>
      <div class="bold">RECOVERY / SETTLE PAYMENTS:</div>
      ${recoveriesHtml}
      
      <div class="line"></div>
      <div class="row"><span>Total Credit Purchases:</span><span>PKR ${totalCredits}</span></div>
      <div class="row"><span>Total Payments Settled:</span><span>-PKR ${totalRecoveries}</span></div>
      <div class="line"></div>
      <div class="row bold big text-red-500"><span>NET OUTSTANDING DUE:</span><span>PKR ${cust.creditBalance}</span></div>
      <div class="line"></div>
      
      <div style="display: flex; justify-content: space-between; margin-top: 10px;">
        <div class="signature-box sm">Customer Signature</div>
        <div class="signature-box sm">Authorized Cashier</div>
      </div>
      <div class="line" style="margin-top: 30px;"></div>
      <div class="center sm">Thank you for your business!<br/>Powered by MT UniPOS</div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  const printCreditRecoverySlip = (cust: any, paymentAmount: number) => {
    const win = window.open("", "_blank", "width=340,height=600");
    if (!win) return;
    win.document.write(`
      <html><head><title>Recovery Receipt - ${cust.name}</title>
      <style>
        body { font-family: monospace; font-size: 11px; padding: 16px; width: 280px; margin: 0; }
        .center { text-align: center; }
        .line { border-top: 1px dashed #000; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; }
        .bold { font-weight: bold; }
        .big { font-size: 14px; }
        .sm { font-size: 9px; }
        .signature-box { border-top: 1px solid #000; margin-top: 40px; text-align: center; padding-top: 4px; width: 120px; }
      </style>
      </head><body>
      <div class="center">
        <div class="bold big">CREDIT RECOVERY SLIP</div>
        <div class="bold">MT UNIPOS</div>
        <div class="sm">Mian Talal UniPOS ERP</div>
      </div>
      <div class="line"></div>
      <div class="row"><span>Payment Date:</span><span>${new Date().toLocaleString()}</span></div>
      <div class="row"><span>Customer:</span><span class="bold">${cust.name}</span></div>
      ${cust.customerNo && cust.customerNo !== "N/A" ? `<div class="row"><span>Customer No:</span><span class="bold">${cust.customerNo}</span></div>` : ""}
      <div class="row"><span>Mobile:</span><span>${cust.mobile}</span></div>
      <div class="line"></div>
      <div class="row bold big"><span>AMOUNT PAID:</span><span>PKR ${paymentAmount.toLocaleString()}</span></div>
      <div class="line"></div>
      <div class="row"><span>Previous Balance:</span><span>PKR ${(cust.creditBalance + paymentAmount).toLocaleString()}</span></div>
      <div class="row bold"><span>REMAINING BALANCE:</span><span>PKR ${cust.creditBalance.toLocaleString()}</span></div>
      <div class="line"></div>
      
      <div style="display: flex; justify-content: space-between; margin-top: 10px;">
        <div class="signature-box sm">Customer Signature</div>
        <div class="signature-box sm">Cashier Signature</div>
      </div>
      <div class="line" style="margin-top: 30px;"></div>
      <div class="center sm">Your credit account has been adjusted.<br/>Thank you for clearing your dues.</div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  const printFullCreditLedgerReport = () => {
    const creditCustomers = enriched.filter(c => c.creditBalance > 0);
    const win = window.open("", "_blank", "width=340,height=600");
    if (!win) return;
    
    const totalDues = creditCustomers.reduce((a, c) => a + c.creditBalance, 0);
    const listHtml = creditCustomers.map(c => `
      <div class="row">
        <span>${c.name} (${c.mobile})${c.customerNo && c.customerNo !== "N/A" ? `<br/><span style="font-size:9px;color:#666;">No: ${c.customerNo}</span>` : ""}</span>
        <span class="bold">PKR ${c.creditBalance.toLocaleString()}</span>
      </div>
    `).join("");

    win.document.write(`
      <html><head><title>Full Credit Ledger Report</title>
      <style>
        body { font-family: monospace; font-size: 11px; padding: 16px; width: 280px; margin: 0; }
        .center { text-align: center; }
        .line { border-top: 1px dashed #000; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; margin: 4px 0; }
        .bold { font-weight: bold; }
        .big { font-size: 13px; }
        .sm { font-size: 9px; }
      </style>
      </head><body>
      <div class="center">
        <div class="bold big">ALL-CUSTOMER CREDIT REPORT</div>
        <div class="bold">MT UNIPOS</div>
        <div class="sm">Report generated: ${new Date().toLocaleString()}</div>
      </div>
      <div class="line"></div>
      <div class="row bold">
        <span>Customer Details</span>
        <span>Outstanding Due</span>
      </div>
      <div class="line"></div>
      ${listHtml || `<div class="center sm">No outstanding customer credits.</div>`}
      <div class="line"></div>
      <div class="row bold big text-red-500">
        <span>TOTAL OUTSTANDING:</span>
        <span>PKR ${totalDues.toLocaleString()}</span>
      </div>
      <div class="line"></div>
      <div class="center sm" style="margin-top: 20px;">
        End of report.<br/>Powered by MT UniPOS
      </div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  // ── Derived: enrich customers with purchase stats
  const enriched = useMemo(() => {
    return customers.map(c => {
      const custSales = sales.filter(s => s.customerName === c.name);
      const totalSpent = custSales.reduce((a, s) => a + s.total, 0);
      const totalVisits = custSales.length;
      const lastVisit = custSales.length
        ? custSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
        : null;
      return { ...c, totalSpent, totalVisits, lastVisit, purchases: custSales };
    });
  }, [customers, sales]);

  // ── Filtered + sorted list
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return enriched
      .filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.mobile.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.cnic || "").includes(q)
      )
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "points") return b.loyaltyPoints - a.loyaltyPoints;
        if (sortBy === "spent") return b.totalSpent - a.totalSpent;
        if (sortBy === "visits") return b.totalVisits - a.totalVisits;
        return 0;
      });
  }, [enriched, search, sortBy]);

  const selectedCustomer = useMemo(() =>
    enriched.find(c => c.id === selectedId) || null, [enriched, selectedId]);

  // ── Handlers
  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setShowModal(true);
  };

  const openEdit = (c: typeof enriched[0]) => {
    setEditingId(c.id);
    setForm({
      name: c.name, mobile: c.mobile,
      email: c.email, address: c.address, cnic: c.cnic || ""
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.mobile.trim()) return;

    // Check if phone number matches another customer
    const existing = customers.find(c => c.mobile === form.mobile.trim() && c.id !== editingId);
    if (existing) {
      alert(`Customer already exists with ${existing.name}`);
      return;
    }

    if (editingId) {
      updateCustomer(editingId, {
        name: form.name, mobile: form.mobile,
        email: form.email, address: form.address, cnic: form.cnic
      });
      triggerToast("Customer profile updated successfully!");
    } else {
      addCustomer({
        name: form.name, mobile: form.mobile,
        email: form.email, address: form.address, cnic: form.cnic
      });
      triggerToast("New customer registered!");
    }
    setShowModal(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteCustomer(id);
    if (selectedId === id) setSelectedId(null);
    setConfirmDeleteId(null);
    triggerToast("Customer removed from database.");
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryCustomer || !recoveryAmount) return;
    const amount = parseFloat(recoveryAmount);
    if (isNaN(amount) || amount <= 0) {
      setRecoveryError("Please enter a valid amount");
      return;
    }
    if (amount > recoveryCustomer.creditBalance) {
      setRecoveryError("Recovery amount cannot exceed customer outstanding balance");
      return;
    }

    recordDueRecovery(recoveryCustomer.id, amount);
    triggerToast(`Logged recovery payment of ${currencySymbol} ${amount.toLocaleString()} from customer.`);
    
    if (confirm("Do you want to print a Credit Recovery Slip for this payment?")) {
      const adjustedCustomer = {
        ...recoveryCustomer,
        creditBalance: Math.max(0, recoveryCustomer.creditBalance - amount)
      };
      printCreditRecoverySlip(adjustedCustomer, amount);
    }

    setRecoveryCustomer(null);
    setRecoveryAmount("");
    setRecoveryError("");
  };

  // ── Aggregate stats
  const totalCustomers = customers.length;
  const totalLoyaltyPts = customers.reduce((a, c) => a + c.loyaltyPoints, 0);
  const totalRevenue = enriched.reduce((a, c) => a + c.totalSpent, 0);
  const activeThisMonth = enriched.filter(c => {
    if (!c.lastVisit) return false;
    const d = new Date(c.lastVisit);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="flex min-h-screen bg-black text-gray-100 font-sans">
      <ClientSidebar />

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed top-4 right-4 bg-emerald-500/95 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-2xl z-50 flex items-center gap-2 animate-bounce">
          <Check size={14} /> {toast}
        </div>
      )}

      <main className="flex-grow flex overflow-hidden max-h-screen">

        {/* ═══════════════════════════════════════════════════════════════
            LEFT PANEL — Customer List
        ═══════════════════════════════════════════════════════════════ */}
        <section className={`flex flex-col border-r border-brand-dark-border transition-all duration-300 ${selectedId ? "w-0 lg:w-[420px] overflow-hidden" : "flex-grow"}`}>
          <div className="flex-grow overflow-y-auto p-6 space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-black text-white flex items-center gap-2">
                  <Users size={20} className="text-brand-sky" />
                  Customer Directory
                </h1>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {totalCustomers} registered loyalty members
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreditReportModal(true)}
                  className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-bold text-xs px-3.5 py-2.5 rounded-lg transition"
                >
                  <CreditCard size={13} /> Credit Report
                </button>
                <button
                  type="button"
                  onClick={openAdd}
                  className="flex items-center gap-1.5 bg-brand-sky hover:bg-brand-sky-light text-black font-black text-xs px-4 py-2.5 rounded-lg shadow-lg transition"
                >
                  <Plus size={14} /> Add Customer
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { icon: Users, label: "Total Customers", val: totalCustomers, color: "text-brand-sky" },
                { icon: TrendingUp, label: "Total Revenue", val: `${currencySymbol} ${Math.round(totalRevenue).toLocaleString()}`, color: "text-emerald-400" },
                { icon: Star, label: "Loyalty Points Issued", val: totalLoyaltyPts.toLocaleString(), color: "text-yellow-400" },
                { icon: BadgeCheck, label: "Active This Month", val: activeThisMonth, color: "text-purple-400" },
              ].map(stat => (
                <div key={stat.label} className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl p-4">
                  <stat.icon size={16} className={stat.color} />
                  <div className={`text-lg font-black font-mono mt-1 ${stat.color}`}>{stat.val}</div>
                  <div className="text-[9px] text-gray-500 uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Search + Sort */}
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-2.5 text-gray-500" size={14} />
                <input
                  type="text"
                  placeholder="Search by name, mobile, email or CNIC..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-brand-dark-surface border border-brand-dark-border pl-9 pr-4 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-brand-sky"
                />
              </div>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-brand-dark-surface border border-brand-dark-border rounded-lg text-[10px] text-gray-300 px-3 py-2 focus:outline-none focus:border-brand-sky"
              >
                <option value="name">Sort: Name</option>
                <option value="points">Sort: Top Points</option>
                <option value="spent">Sort: Most Spent</option>
                <option value="visits">Sort: Most Visits</option>
              </select>
            </div>

            {/* Customer Cards */}
            <div className="space-y-2">
              {filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-600">
                  <Users size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="text-xs">No customers found. Add your first customer above.</p>
                </div>
              ) : filtered.map(c => {
                const tier = getLoyaltyTier(c.loyaltyPoints);
                const isActive = selectedId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => { setSelectedId(c.id); setDrawerTab("overview"); }}
                    className={`group flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      isActive
                        ? "bg-brand-sky/10 border-brand-sky/40"
                        : "bg-brand-dark-surface/30 border-brand-dark-border hover:border-brand-sky/30 hover:bg-brand-dark-surface/60"
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                      isActive ? "bg-brand-sky text-black" : "bg-brand-dark-border text-gray-300"
                    }`}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm truncate">{c.name}</span>
                        {c.customerNo && c.customerNo !== "N/A" && (
                          <span className="text-[8px] bg-brand-sky/15 border border-brand-sky/30 text-brand-sky font-mono font-bold px-1.5 py-0.5 rounded">
                            {c.customerNo}
                          </span>
                        )}
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${tier.bg} ${tier.color}`}>
                          {tier.label}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-3">
                        <span className="flex items-center gap-1"><Phone size={9} /> {c.mobile}</span>
                        {c.totalVisits > 0 && (
                          <span className="flex items-center gap-1"><ShoppingBag size={9} /> {c.totalVisits} purchases</span>
                        )}
                      </div>
                    </div>

                    {/* Points + Spent + Credit Balance */}
                    <div className="text-right shrink-0 space-y-1">
                      <div className="flex items-center gap-1 justify-end text-yellow-400 font-black text-xs font-mono">
                        <Star size={10} className="fill-yellow-400" /> {c.loyaltyPoints}
                      </div>
                      <div className="text-[10px] text-brand-sky font-bold font-mono">
                        {currencySymbol} {Math.round(c.totalSpent).toLocaleString()}
                      </div>
                      {c.creditBalance > 0 && (
                        <div className="text-[8px] bg-red-500/10 border border-red-500/35 text-red-400 font-black px-1.5 py-0.5 rounded mt-1 font-mono uppercase tracking-wide">
                          Due: {currencySymbol} {c.creditBalance.toLocaleString()}
                        </div>
                      )}
                    </div>

                    <ChevronRight size={14} className="text-gray-600 group-hover:text-brand-sky transition shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            RIGHT PANEL — Customer Detail Drawer
        ═══════════════════════════════════════════════════════════════ */}
        {selectedCustomer && (
          <section className="flex-grow flex flex-col overflow-hidden bg-black/60">

            {/* Drawer Header */}
            <div className="shrink-0 border-b border-brand-dark-border p-5 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedId(null)}
                  className="lg:hidden p-2 rounded-lg bg-brand-dark-border text-gray-400 hover:text-white"
                >
                  <ArrowLeft size={14} />
                </button>

                {/* Big Avatar */}
                <div className="w-14 h-14 rounded-2xl bg-brand-sky text-black font-black text-xl flex items-center justify-center shrink-0">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-black text-white text-lg">{selectedCustomer.name}</h2>
                    {(() => {
                      const tier = getLoyaltyTier(selectedCustomer.loyaltyPoints);
                      return (
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${tier.bg} ${tier.color}`}>
                          {tier.label} Member
                        </span>
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-gray-400 mt-1">
                    <span className="flex items-center gap-1"><Phone size={10} />{selectedCustomer.mobile}</span>
                    {selectedCustomer.email && <span className="flex items-center gap-1"><Mail size={10} />{selectedCustomer.email}</span>}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {selectedCustomer.creditBalance > 0 && (
                  <button
                    onClick={() => setRecoveryCustomer(selectedCustomer)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-lg text-[10px] uppercase transition"
                  >
                    <CreditCard size={12} /> Settle Dues
                  </button>
                )}
                <button
                  onClick={() => openEdit(selectedCustomer)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-brand-dark-border hover:bg-brand-sky/20 text-gray-300 hover:text-brand-sky rounded-lg text-[10px] font-bold transition"
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button
                  onClick={() => setConfirmDeleteId(selectedCustomer.id)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-brand-dark-border hover:bg-red-500/20 text-gray-300 hover:text-red-400 rounded-lg text-[10px] font-bold transition"
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

            {/* Loyalty Points Bar */}
            <div className="shrink-0 px-5 py-3 bg-brand-dark-surface/30 border-b border-brand-dark-border">
              <div className="flex items-center justify-between gap-6">
                {[
                  { label: "Loyalty Points", val: `${selectedCustomer.loyaltyPoints.toLocaleString()} pts`, icon: Star, color: "text-yellow-400" },
                  { label: "Total Spent", val: `${currencySymbol} ${Math.round(selectedCustomer.totalSpent).toLocaleString()}`, icon: TrendingUp, color: "text-emerald-400" },
                  { label: "Total Purchases", val: `${selectedCustomer.totalVisits} orders`, icon: ShoppingBag, color: "text-brand-sky" },
                  { label: "Credit Balance", val: `${currencySymbol} ${selectedCustomer.creditBalance.toLocaleString()}`, icon: CreditCard, color: selectedCustomer.creditBalance > 0 ? "text-red-400" : "text-gray-500" },
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

            {/* Tabs */}
            <div className="shrink-0 border-b border-brand-dark-border px-5 flex gap-1 pt-2">
              {(["overview", "purchases", "receipts", "loyalty", "credit"] as Tab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setDrawerTab(tab)}
                  className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-t-lg border-b-2 transition ${
                    drawerTab === tab
                      ? "border-brand-sky text-brand-sky bg-brand-sky/5"
                      : "border-transparent text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-grow overflow-y-auto p-5 space-y-4">

              {/* ── OVERVIEW TAB ── */}
              {drawerTab === "overview" && (
                <div className="space-y-5">

                  {/* Contact Info Card */}
                  <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-2xl p-5 space-y-3">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-brand-dark-border/50 pb-2 mb-3">Contact Information</h3>
                    {[
                      { icon: Hash, label: "Customer Number", val: selectedCustomer.customerNo || "N/A" },
                      { icon: User, label: "Full Name", val: selectedCustomer.name },
                      { icon: Phone, label: "Mobile", val: selectedCustomer.mobile },
                      { icon: Mail, label: "Email", val: selectedCustomer.email || "—" },
                      { icon: MapPin, label: "Address", val: selectedCustomer.address || "—" },
                      { icon: CreditCard, label: "CNIC", val: selectedCustomer.cnic || "—" },
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

                  {/* Recent Activity Snapshot */}
                  <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-2xl p-5">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-brand-dark-border/50 pb-2 mb-3">Purchase Activity</h3>
                    {selectedCustomer.purchases.length === 0 ? (
                      <p className="text-xs text-gray-600 text-center py-6">No purchases recorded yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedCustomer.purchases.slice(0, 5).map(s => (
                          <div key={s.id} className="flex items-center justify-between text-xs py-2 border-b border-brand-dark-border/30 last:border-0">
                            <div>
                              <span className="font-bold text-white text-[11px]">{s.receiptNumber}</span>
                              <span className="text-gray-500 text-[9px] ml-2">{formatDate(s.date)}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[9px] bg-brand-dark-border px-2 py-0.5 rounded text-gray-400">{s.paymentMethod}</span>
                              <span className="font-black text-brand-sky font-mono">{currencySymbol} {Math.round(s.total).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                        {selectedCustomer.purchases.length > 5 && (
                          <button
                            onClick={() => setDrawerTab("purchases")}
                            className="text-brand-sky text-[10px] font-bold mt-2 hover:underline"
                          >
                            View all {selectedCustomer.purchases.length} purchases →
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Loyalty Progress */}
                  <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-2xl p-5">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-brand-dark-border/50 pb-2 mb-3">Loyalty Tier Progress</h3>
                    {TIER_CONFIG.map((tier, i) => {
                      const next = TIER_CONFIG[i + 1];
                      const pts = selectedCustomer.loyaltyPoints;
                      const isActive = pts >= tier.minPts && (!next || pts < next.minPts);
                      const isCurrent = isActive;
                      const progress = next
                        ? Math.min(100, Math.round(((pts - tier.minPts) / (next.minPts - tier.minPts)) * 100))
                        : 100;
                      return (
                        <div key={tier.label} className={`flex items-center gap-3 p-3 rounded-lg mb-2 border ${isCurrent ? tier.bg : "border-transparent"}`}>
                          <Award size={14} className={pts >= tier.minPts ? tier.color : "text-gray-700"} />
                          <div className="flex-grow">
                            <div className="flex justify-between text-[10px] font-bold mb-1">
                              <span className={pts >= tier.minPts ? tier.color : "text-gray-600"}>{tier.label}</span>
                              <span className="text-gray-500">{tier.minPts} pts</span>
                            </div>
                            {isCurrent && next && (
                              <>
                                <div className="h-1.5 bg-brand-dark-border rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-brand-sky rounded-full transition-all duration-700"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <div className="text-[9px] text-gray-600 mt-1">
                                  {next.minPts - pts} more pts to reach {next.label}
                                </div>
                              </>
                            )}
                          </div>
                          {isCurrent && <BadgeCheck size={14} className="text-brand-sky shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── PURCHASES TAB ── */}
              {drawerTab === "purchases" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">
                      Purchase History <span className="text-brand-sky">({selectedCustomer.purchases.length})</span>
                    </h3>
                    <span className="text-[10px] text-gray-500">
                      Total: <span className="text-brand-sky font-bold">{currencySymbol} {Math.round(selectedCustomer.totalSpent).toLocaleString()}</span>
                    </span>
                  </div>

                  {selectedCustomer.purchases.length === 0 ? (
                    <div className="text-center py-16 text-gray-600">
                      <ShoppingBag size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-xs">No purchase history found.</p>
                    </div>
                  ) : (
                    [...selectedCustomer.purchases]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(sale => (
                        <div key={sale.id} className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl overflow-hidden">
                          {/* Sale Header */}
                          <div className="flex items-center justify-between px-4 py-3 border-b border-brand-dark-border/50">
                            <div>
                              <span className="text-[11px] font-black text-white">{sale.receiptNumber}</span>
                              <span className="text-[9px] text-gray-500 ml-2">{formatDateTime(sale.date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                                sale.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                sale.status === "Returned" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                              }`}>{sale.status}</span>
                              <span className="text-[9px] bg-brand-dark-border px-2 py-0.5 rounded text-gray-400">{sale.paymentMethod}</span>
                            </div>
                          </div>

                          {/* Items */}
                          <div className="px-4 py-2 space-y-1.5">
                            {sale.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-[10px]">
                                <span className="text-gray-300">{item.productName} <span className="text-gray-600">×{item.qty}</span></span>
                                <span className="text-gray-400 font-mono">{currencySymbol} {item.subtotal.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>

                          {/* Totals */}
                          <div className="px-4 py-2.5 border-t border-brand-dark-border/40 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-[9px] text-gray-500">
                              {sale.discount > 0 && <span className="text-red-400">Disc: -{currencySymbol} {Math.round(sale.discount)}</span>}
                              {sale.loyaltyPointsEarned !== undefined && (
                                <span className="text-yellow-400 flex items-center gap-0.5">
                                  <Star size={9} className="fill-yellow-400" />
                                  +{sale.loyaltyPointsEarned} pts earned
                                </span>
                              )}
                              {sale.redeemLoyalty && (
                                <span className="text-purple-400">Points redeemed</span>
                              )}
                            </div>
                            <span className="text-sm font-black text-brand-sky font-mono">
                              {currencySymbol} {Math.round(sale.total).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}

              {/* ── RECEIPTS TAB ── */}
              {drawerTab === "receipts" && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    Thermal Receipts <span className="text-brand-sky">({selectedCustomer.purchases.length})</span>
                  </h3>

                  {selectedCustomer.purchases.length === 0 ? (
                    <div className="text-center py-16 text-gray-600">
                      <Receipt size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-xs">No receipts to display.</p>
                    </div>
                  ) : (
                    [...selectedCustomer.purchases]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(sale => (
                        <div key={sale.id} className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <span className="text-xs font-black text-white">{sale.receiptNumber}</span>
                              <span className="text-[9px] text-gray-500 ml-2">{formatDateTime(sale.date)}</span>
                            </div>
                            <button
                              onClick={() => {
                                // Build a mini print receipt
                                const win = window.open("", "_blank", "width=340,height=600");
                                if (!win) return;
                                win.document.write(`
                                  <html><head><title>Receipt ${sale.receiptNumber}</title>
                                  <style>body{font-family:monospace;font-size:11px;padding:16px;width:280px}
                                  .center{text-align:center}.line{border-top:1px dashed #000;margin:8px 0}
                                  .row{display:flex;justify-content:space-between}
                                  .bold{font-weight:bold}.big{font-size:14px}.sm{font-size:9px}</style>
                                  </head><body>
                                  <div class="center">
                                    <div class="bold big">MT UNIPOS</div>
                                    <div class="sm">Mian Talal UniPOS ERP</div>
                                    <div class="sm">Hotline: +92 321 5550100</div>
                                  </div>
                                  <div class="line"></div>
                                  <div class="row"><span>Receipt:</span><span class="bold">${sale.receiptNumber}</span></div>
                                  <div class="row"><span>Date:</span><span>${new Date(sale.date).toLocaleString()}</span></div>
                                  <div class="row"><span>Cashier:</span><span>${sale.cashierName}</span></div>
                                  <div class="row"><span>Customer:</span><span class="bold">${sale.customerName}</span></div>
                                  <div class="line"></div>
                                  ${sale.items.map(i => `<div class="row"><span>${i.productName} x${i.qty}</span><span>PKR ${i.subtotal}</span></div>`).join("")}
                                  <div class="line"></div>
                                  <div class="row"><span>Subtotal:</span><span>PKR ${sale.subtotal}</span></div>
                                  <div class="row"><span>Tax:</span><span>PKR ${Math.round(sale.tax)}</span></div>
                                  <div class="row"><span>Discount:</span><span>-PKR ${Math.round(sale.discount)}</span></div>
                                  <div class="line"></div>
                                  <div class="row bold"><span>TOTAL:</span><span>PKR ${Math.round(sale.total)}</span></div>
                                  <div class="line"></div>
                                  ${sale.loyaltyPointsEarned !== undefined ? `<div class="row"><span>Points Earned:</span><span>+${sale.loyaltyPointsEarned} pts</span></div>
                                  <div class="row"><span>Points Balance:</span><span>${sale.loyaltyPointsBalance} pts</span></div>` : ""}
                                  <div class="line"></div>
                                  <div class="center sm">Thank you for shopping!<br/>Powered by MT UniPOS</div>
                                  </body></html>
                                `);
                                win.document.close();
                                win.print();
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-sky/10 border border-brand-sky/20 text-brand-sky hover:bg-brand-sky hover:text-black rounded-lg text-[10px] font-bold transition"
                            >
                              <Printer size={11} /> Print Receipt
                            </button>
                          </div>

                          {/* Mini receipt preview */}
                          <div className="bg-white text-black rounded-lg p-4 font-mono text-[9px] space-y-1 leading-relaxed">
                            <div className="text-center font-sans font-black text-[11px]">MT UNIPOS</div>
                            <div className="text-center text-gray-500 text-[8px]">Mian Talal UniPOS ERP</div>
                            <div className="border-t border-dashed border-gray-300 my-1.5" />
                            <div className="flex justify-between"><span className="text-gray-500">Receipt</span><span className="font-bold">{sale.receiptNumber}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Customer</span><span className="font-bold">{sale.customerName}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{formatDate(sale.date)}</span></div>
                            <div className="border-t border-dashed border-gray-300 my-1.5" />
                            {sale.items.map((item, i) => (
                              <div key={i} className="flex justify-between">
                                <span>{item.productName} ×{item.qty}</span>
                                <span>{currencySymbol} {item.subtotal}</span>
                              </div>
                            ))}
                            <div className="border-t border-dashed border-gray-300 my-1.5" />
                            <div className="flex justify-between font-bold">
                              <span>TOTAL</span>
                              <span>{currencySymbol} {Math.round(sale.total)}</span>
                            </div>
                            {sale.loyaltyPointsEarned !== undefined && (
                              <div className="flex justify-between text-gray-500">
                                <span>Points Earned</span><span>+{sale.loyaltyPointsEarned} pts</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}

              {/* ── LOYALTY TAB ── */}
              {drawerTab === "loyalty" && (
                <div className="space-y-5">
                  {/* Current Points Card */}
                  <div className="bg-gradient-to-br from-yellow-500/10 to-brand-sky/5 border border-yellow-500/20 rounded-2xl p-6 text-center">
                    <Star size={32} className="text-yellow-400 fill-yellow-400 mx-auto mb-2" />
                    <div className="text-4xl font-black text-yellow-400 font-mono">{selectedCustomer.loyaltyPoints.toLocaleString()}</div>
                    <div className="text-xs text-gray-400 mt-1">Total Loyalty Points</div>
                    {selectedCustomer.loyaltyPoints >= 1000 && (
                      <div className="mt-3 bg-purple-500/15 border border-purple-500/30 rounded-lg py-2 px-3 text-[10px] text-purple-300 font-bold">
                        🎉 Eligible for {currencySymbol} 100 discount! (1000 pts redemption)
                      </div>
                    )}
                    {selectedCustomer.loyaltyPoints < 1000 && (
                      <div className="mt-3 bg-brand-dark-border/60 rounded-lg py-2 px-3 text-[10px] text-gray-500">
                        {1000 - selectedCustomer.loyaltyPoints} more points needed for {currencySymbol} 100 discount
                      </div>
                    )}
                  </div>

                  {/* Earning Rules */}
                  <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-2xl p-5 space-y-3">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Loyalty Program Rules</h3>
                    {[
                      { rule: "Earn 2 points per PKR 100 spent", detail: "Automatically awarded on every purchase" },
                      { rule: "Redeem 1,000 pts = PKR 100 Discount", detail: "Applied at POS checkout when eligible" },
                      { rule: "Points never expire", detail: "Balance accumulates across all purchases" },
                      { rule: "Tier upgrades are automatic", detail: "Silver at 500 · Gold at 2000 · Platinum at 5000" },
                    ].map(r => (
                      <div key={r.rule} className="flex items-start gap-2 text-xs">
                        <Check size={12} className="text-brand-sky mt-0.5 shrink-0" />
                        <div>
                          <div className="text-white font-semibold">{r.rule}</div>
                          <div className="text-gray-500 text-[9px]">{r.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Points Ledger */}
                  <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-2xl p-5">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-brand-dark-border/50 pb-2 mb-3">Points Transaction Ledger</h3>
                    {selectedCustomer.purchases.length === 0 ? (
                      <p className="text-xs text-gray-600 text-center py-4">No point transactions yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {[...selectedCustomer.purchases]
                          .filter(s => s.loyaltyPointsEarned !== undefined)
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map(s => (
                            <div key={s.id} className="flex items-center justify-between text-[10px] py-2 border-b border-brand-dark-border/30 last:border-0">
                              <div>
                                <div className="text-white font-bold">{s.receiptNumber}</div>
                                <div className="text-gray-500">{formatDate(s.date)} · {currencySymbol} {Math.round(s.total).toLocaleString()}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-yellow-400 font-black">+{s.loyaltyPointsEarned} pts</div>
                                {s.redeemLoyalty && <div className="text-purple-400 text-[9px]">-1000 pts redeemed</div>}
                                <div className="text-gray-600 text-[9px]">Bal: {s.loyaltyPointsBalance} pts</div>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── CREDIT TAB ── */}
              {drawerTab === "credit" && (
                <div className="space-y-4 font-sans">
                  {/* Credit summary banner */}
                  <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="text-xs text-gray-400 font-sans font-bold">Total Outstanding Credit Due</div>
                      <div className="text-2xl font-black text-red-400 font-mono mt-1">
                        {currencySymbol} {selectedCustomer.creditBalance.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          printCustomerCreditStatement(selectedCustomer, selectedCustomer.purchases);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 bg-brand-sky hover:bg-brand-sky-light text-black font-black rounded-lg text-[10px] uppercase transition"
                      >
                        <Printer size={12} /> Print Statement Slip
                      </button>
                      {selectedCustomer.creditBalance > 0 && (
                        <button
                          type="button"
                          onClick={() => setRecoveryCustomer(selectedCustomer)}
                          className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-lg text-[10px] uppercase transition"
                        >
                          <CreditCard size={12} /> Settle Dues
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Credit Purchases section */}
                  <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-2xl p-5 space-y-3">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-brand-dark-border/50 pb-2">Credit Purchases Ledger</h3>
                    {(() => {
                      const creditSales = selectedCustomer.purchases.filter(
                        s => s.paymentMethod === "On Credit" || (s.splitPayments && s.splitPayments["On Credit"] > 0)
                      );
                      if (creditSales.length === 0) {
                        return <p className="text-xs text-gray-600 text-center py-4">No credit purchases recorded.</p>;
                      }
                      return (
                        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                          {creditSales.map(sale => {
                            const creditAmt = sale.splitPayments ? (sale.splitPayments["On Credit"] || 0) : sale.total;
                            return (
                              <div key={sale.id} className="bg-black/30 border border-brand-dark-border/50 rounded-xl p-3 space-y-2 font-mono">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="text-[10px] font-bold text-white block">{sale.receiptNumber}</span>
                                    <span className="text-[8px] text-gray-500">{formatDateTime(sale.date)}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => printIndividualCreditSlip(sale)}
                                    className="p-1.5 bg-brand-dark-border hover:bg-brand-sky/20 text-gray-400 hover:text-brand-sky rounded transition"
                                    title="Print Credit Receipt"
                                  >
                                    <Printer size={11} />
                                  </button>
                                </div>
                                <div className="space-y-1 pl-1">
                                  {sale.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between text-[9px] text-gray-400">
                                      <span className="font-sans">{item.productName} ×{item.qty}</span>
                                      <span>{currencySymbol} {item.subtotal.toLocaleString()}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="border-t border-brand-dark-border/40 pt-1.5 flex justify-between items-center text-[10px]">
                                  <span className="text-gray-500 font-bold font-sans">Credit Share:</span>
                                  <span className="font-black text-red-400">{currencySymbol} {creditAmt.toLocaleString()}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Dues Settle payments ledger */}
                  <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-2xl p-5 space-y-3">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-brand-dark-border/50 pb-2">Due Clearance / Settlement History</h3>
                    {!selectedCustomer.dueRecoveryHistory || selectedCustomer.dueRecoveryHistory.length === 0 ? (
                      <p className="text-xs text-gray-600 text-center py-4">No due settlements logged yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {selectedCustomer.dueRecoveryHistory.map((rec: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-[10px] py-2 border-b border-brand-dark-border/30 last:border-0 font-mono">
                            <div>
                              <div className="text-emerald-400 font-bold font-sans">Clearance Payment</div>
                              <div className="text-gray-500 text-[9px] mt-0.5">{formatDate(rec.date)}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-400 font-bold">- {currencySymbol} {rec.amount.toLocaleString()}</span>
                              <button
                                type="button"
                                onClick={() => printCreditRecoverySlip(selectedCustomer, rec.amount)}
                                className="p-1 bg-brand-dark-border hover:bg-brand-sky/20 text-gray-400 hover:text-brand-sky rounded transition"
                                title="Print Recovery Receipt"
                              >
                                <Printer size={10} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </section>
        )}
      </main>

      {/* ═══════════════════════════════════════════════════════════════
          ADD / EDIT CUSTOMER MODAL
      ═══════════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-brand-dark-surface border border-brand-sky/30 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-brand-dark-border pb-3 mb-5">
              <div>
                <h3 className="font-black text-white text-sm flex items-center gap-2">
                  <Users size={16} className="text-brand-sky" />
                  {editingId ? "Edit Customer Profile" : "Register New Customer"}
                </h3>
                <p className="text-[9px] text-gray-500 mt-0.5">
                  {editingId ? "Update contact details and information" : "New customer starts with 0 loyalty points"}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Full Name *</label>
                  <input
                    type="text" required
                    placeholder="e.g. Ahmed Raza"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-black border border-brand-dark-border p-2.5 rounded-lg text-white focus:outline-none focus:border-brand-sky"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Mobile Number *</label>
                  <input
                    type="text" required
                    placeholder="03xxxxxxxxx"
                    value={form.mobile}
                    onChange={e => setForm({ ...form, mobile: e.target.value })}
                    className="w-full bg-black border border-brand-dark-border p-2.5 rounded-lg text-white focus:outline-none focus:border-brand-sky font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="customer@email.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded-lg text-white focus:outline-none focus:border-brand-sky"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Home / Office Address</label>
                <input
                  type="text"
                  placeholder="Street, Area, City..."
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded-lg text-white focus:outline-none focus:border-brand-sky"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">CNIC Number (optional)</label>
                <input
                  type="text"
                  placeholder="XXXXX-XXXXXXX-X"
                  value={form.cnic}
                  onChange={e => setForm({ ...form, cnic: e.target.value })}
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded-lg text-white focus:outline-none focus:border-brand-sky font-mono"
                />
              </div>

              {!editingId && (
                <div className="flex items-center gap-2 bg-brand-sky/5 border border-brand-sky/15 rounded-lg p-2.5 text-[9px] text-gray-400">
                  <Star size={11} className="text-yellow-400 fill-yellow-400 shrink-0" />
                  <span>Customer starts with <span className="text-white font-bold">0 loyalty points</span>. Points are earned automatically at each purchase.</span>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-brand-dark-border hover:bg-brand-dark-border/70 text-gray-300 font-bold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-sky hover:bg-brand-sky-light text-black font-black uppercase rounded-lg transition"
                >
                  {editingId ? "Save Changes" : "Register Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          DELETE CONFIRM MODAL
      ═══════════════════════════════════════════════════════════════ */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-brand-dark-surface border border-red-500/30 p-6 rounded-2xl w-full max-w-sm shadow-2xl text-center space-y-4 animate-fade-in-up">
            <AlertCircle size={40} className="text-red-400 mx-auto" />
            <div>
              <h3 className="font-black text-white text-base">Delete Customer?</h3>
              <p className="text-[10px] text-gray-400 mt-1">
                This will permanently remove the customer and all their profile data. Purchase history in sales ledger will remain.
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
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          DUE RECOVERY SETTLEMENT MODAL
      ═══════════════════════════════════════════════════════════════ */}
      {recoveryCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-brand-dark-surface border border-emerald-500/30 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in-up font-sans">
            <div className="flex justify-between items-center border-b border-brand-dark-border pb-3 mb-4 text-xs">
              <h3 className="font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard size={14} className="text-emerald-400" />
                Settle Customer Dues
              </h3>
              <button onClick={() => { setRecoveryCustomer(null); setRecoveryAmount(""); setRecoveryError(""); }} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRecoverySubmit} className="space-y-4 text-xs">
              <div>
                <h4 className="text-white font-bold text-sm">{recoveryCustomer.name}</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Outstanding Credit Balance: <span className="text-red-400 font-black font-mono">{currencySymbol} {recoveryCustomer.creditBalance.toLocaleString()}</span>
                </p>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Log Payment Received</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 5000"
                  value={recoveryAmount}
                  onChange={e => setRecoveryAmount(e.target.value)}
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white font-mono font-bold focus:outline-none focus:border-brand-sky"
                />
                {recoveryError && <p className="text-red-400 text-[9px] mt-1.5 flex items-center gap-1"><AlertCircle size={10} /> {recoveryError}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase rounded-lg transition"
              >
                Record Recovery Settlement
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          COMPLETE CREDIT REPORT MODAL
      ═══════════════════════════════════════════════════════════════ */}
      {showCreditReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-brand-dark-surface border border-red-500/30 p-6 rounded-2xl w-full max-w-2xl shadow-2xl animate-fade-in-up font-sans">
            <div className="flex justify-between items-center border-b border-brand-dark-border pb-3 mb-4 text-xs">
              <h3 className="font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard size={14} className="text-red-400" />
                All-Customer Credit Ledger Report
              </h3>
              <button onClick={() => setShowCreditReportModal(false)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-brand-dark-surface/60 border border-brand-dark-border rounded-xl p-4">
                  <div className="text-xs text-gray-500 font-sans font-bold">Total Customers with Credit</div>
                  <div className="text-xl font-black text-white font-mono mt-1">
                    {customers.filter(c => c.creditBalance > 0).length}
                  </div>
                </div>
                <div className="bg-brand-dark-surface/60 border border-brand-dark-border rounded-xl p-4">
                  <div className="text-xs text-gray-500 font-sans font-bold">Total Outstanding Credit Dues</div>
                  <div className="text-xl font-black text-red-400 font-mono mt-1">
                    {currencySymbol} {customers.reduce((a, c) => a + c.creditBalance, 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Table list */}
              <div className="max-h-72 overflow-y-auto border border-brand-dark-border rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-brand-dark-surface/70 border-b border-brand-dark-border text-gray-500 font-mono text-[10px]">
                      <th className="p-3">Customer</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3 text-right">Outstanding Credit</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-dark-border/40 font-mono text-[11px]">
                    {(() => {
                      const creditCusts = enriched.filter(c => c.creditBalance > 0);
                      if (creditCusts.length === 0) {
                        return (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-gray-600 font-sans">
                              <Check size={24} className="mx-auto mb-1 text-emerald-400" />
                              No customers have outstanding credit balances.
                            </td>
                          </tr>
                        );
                      }
                      return creditCusts.map(c => (
                        <tr key={c.id} className="hover:bg-brand-dark-surface/40 transition">
                          <td className="p-3 font-sans font-bold text-white">
                            <div>{c.name}</div>
                            {c.customerNo && c.customerNo !== "N/A" && (
                              <div className="text-[9px] text-gray-500 font-mono mt-0.5">{c.customerNo}</div>
                            )}
                          </td>
                          <td className="p-3 text-gray-400">{c.mobile}</td>
                          <td className="p-3 text-right font-black text-red-400">{currencySymbol} {c.creditBalance.toLocaleString()}</td>
                          <td className="p-3">
                            <div className="flex gap-2 justify-center">
                              <button
                                type="button"
                                onClick={() => {
                                  printCustomerCreditStatement(c, c.purchases);
                                }}
                                className="px-2 py-1 bg-brand-dark-border hover:bg-brand-sky/20 text-gray-300 hover:text-brand-sky rounded flex items-center gap-1 text-[10px] font-sans"
                                title="Print Statement Slip"
                              >
                                <Printer size={11} /> Statement
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRecoveryCustomer(c);
                                  setShowCreditReportModal(false);
                                }}
                                className="px-2 py-1 bg-brand-dark-border hover:bg-emerald-500/20 text-gray-300 hover:text-emerald-400 rounded flex items-center gap-1 text-[10px] font-sans"
                                title="Settle Due"
                              >
                                <CreditCard size={11} /> Settle
                              </button>
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreditReportModal(false)}
                  className="flex-1 py-3 bg-brand-dark-border hover:bg-brand-dark-border/70 text-gray-300 font-bold rounded-lg transition text-xs tracking-wider font-sans"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={printFullCreditLedgerReport}
                  disabled={customers.filter(c => c.creditBalance > 0).length === 0}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-400 disabled:bg-brand-dark-border disabled:text-gray-600 text-white font-black uppercase rounded-lg transition text-xs tracking-wider flex items-center justify-center gap-1.5 font-sans"
                >
                  <Printer size={13} /> Print Full Ledger Slip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
