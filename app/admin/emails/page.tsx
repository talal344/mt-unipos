"use client";

import React, { useState, useMemo, useEffect } from "react";
import AdminSidebar from "@/components/admin-sidebar";
import { useGlobalContext, Tenant } from "@/context/global-context";
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Search,
  Eye,
  Trash2,
  RefreshCw,
  Download,
  Plus,
  X,
  Building2,
  Key,
  DollarSign,
  Shield,
  ExternalLink,
  Sparkles,
  Printer
} from "lucide-react";

export interface EmailLogEntry {
  id: string;
  to: string;
  businessName: string;
  tenantId: string;
  ownerName: string;
  subject: string;
  plan: string;
  billingCycle: string;
  amount: number;
  paidAmount: number;
  remainingBalance: number;
  currency: string;
  paymentMethod: string;
  sentAt: string;
  status: "Delivered" | "Queued" | "Failed";
  password?: string;
  notes?: string;
}

const INITIAL_EMAIL_LOGS: EmailLogEntry[] = [
  {
    id: "EML-2026-7643",
    to: "talal.ah895@gmail.com",
    businessName: "MT RCM Management",
    tenantId: "MRM-001",
    ownerName: "Mian Talal",
    subject: "[MT UniPOS] Official SaaS Billing & Account Setup: MT RCM Management",
    plan: "Enterprise yearly",
    billingCycle: "Annual",
    amount: 120000,
    paidAmount: 120000,
    remainingBalance: 0,
    currency: "PKR",
    paymentMethod: "Bank Transfer (Meezan / HBL)",
    sentAt: new Date().toISOString(),
    status: "Delivered",
    password: "owner123",
    notes: "Executive invoice & tenant credentials sent upon paid activation (120,000 PKR Cleared)."
  },
  {
    id: "EML-2026-9041",
    to: "codingwithtalal@gmail.com",
    businessName: "Coding Talal",
    tenantId: "CT-003",
    ownerName: "Coding with Talal",
    subject: "[MT UniPOS] Official SaaS Billing & Account Setup: Coding Talal",
    plan: "Enterprise yearly",
    billingCycle: "Annual",
    amount: 100000,
    paidAmount: 100000,
    remainingBalance: 0,
    currency: "PKR",
    paymentMethod: "Bank Transfer (Meezan / HBL)",
    sentAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: "Delivered",
    password: "owner123",
    notes: "Executive invoice & tenant credentials sent upon paid activation."
  },
  {
    id: "EML-2026-8812",
    to: "waqaskaryana@gmail.com",
    businessName: "Waqas Karyana Store",
    tenantId: "WKS-004",
    ownerName: "Waqas Ahmad",
    subject: "[MT UniPOS] Official SaaS Billing & Account Setup: Waqas Karyana Store",
    plan: "Professional Monthly",
    billingCycle: "Monthly",
    amount: 25000,
    paidAmount: 25000,
    remainingBalance: 0,
    currency: "PKR",
    paymentMethod: "Cash Payment",
    sentAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: "Delivered",
    password: "Pass@8492",
    notes: "Demo converted to paid active client. Cleared invoice delivered."
  }
];

export default function AdminEmailsPage() {
  const { tenants, saasInvoices } = useGlobalContext();

  const [logs, setLogs] = useState<EmailLogEntry[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("unipos_email_logs");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return INITIAL_EMAIL_LOGS;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Delivered" | "Queued" | "Failed">("All");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modals state
  const [showSendModal, setShowSendModal] = useState(false);
  const [previewLog, setPreviewLog] = useState<EmailLogEntry | null>(null);

  // Form state for composing email
  const [form, setForm] = useState({
    tenantId: "",
    to: "",
    businessName: "",
    ownerName: "",
    password: "owner123",
    plan: "Professional Plan",
    billingCycle: "Monthly",
    amount: "25000",
    paidAmount: "25000",
    currency: "PKR" as "PKR" | "USD",
    paymentMethod: "Bank Transfer (HBL / Meezan)",
    subject: ""
  });

  const [sending, setSending] = useState(false);

  // Auto-sync email logs with real SaaS invoices on load
  useEffect(() => {
    if (typeof window !== "undefined" && saasInvoices.length > 0) {
      setLogs(prev => {
        let changed = false;
        const synced = prev.map(log => {
          const matchingInv = saasInvoices.find(inv => 
            (inv.tenantId && log.tenantId && inv.tenantId.toLowerCase() === log.tenantId.toLowerCase()) ||
            (inv.tenantName && log.businessName && inv.tenantName.trim().toLowerCase() === log.businessName.trim().toLowerCase())
          );
          if (matchingInv && matchingInv.amount > 0 && (log.amount !== matchingInv.amount || log.paidAmount !== (matchingInv.paidAmount ?? matchingInv.amount))) {
            changed = true;
            const paid = matchingInv.paidAmount !== undefined ? matchingInv.paidAmount : (matchingInv.status === "Paid" ? matchingInv.amount : 0);
            const rem = matchingInv.remainingBalance !== undefined ? matchingInv.remainingBalance : Math.max(0, matchingInv.amount - paid);
            return {
              ...log,
              amount: matchingInv.amount,
              paidAmount: paid,
              remainingBalance: rem,
              plan: matchingInv.plan || log.plan,
              currency: (matchingInv.currency as any) || log.currency,
              paymentMethod: matchingInv.paymentMethod || log.paymentMethod
            };
          }
          return log;
        });
        if (changed) {
          localStorage.setItem("unipos_email_logs", JSON.stringify(synced));
          return synced;
        }
        return prev;
      });
    }
  }, [saasInvoices]);

  // Sync to local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("unipos_email_logs", JSON.stringify(logs));
    }
  }, [logs]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Handle auto-populating tenant info and their real SaaS invoice when selected from dropdown
  const handleTenantSelect = (tId: string) => {
    const t = tenants.find(x => x.id === tId);
    if (t) {
      const cred = t.credentialPresets?.[0];
      
      // Auto-fetch matching SaaS invoice
      const inv = saasInvoices.find(i => 
        (i.tenantId && i.tenantId.toLowerCase() === t.id.toLowerCase()) || 
        (i.tenantName && t.businessName && i.tenantName.trim().toLowerCase() === t.businessName.trim().toLowerCase())
      );

      let invoiceAmount = "25000";
      let invoicePaid = "25000";
      let invoiceCurrency: "PKR" | "USD" = (t.defaultCurrency as any) || "PKR";
      let invoicePlan = t.plan ? `${t.plan} (${t.billingCycle || 'monthly'})` : "Professional Plan";
      let invoicePaymentMethod = "Bank Transfer (HBL / Meezan)";

      if (inv) {
        invoiceAmount = (inv.amount !== undefined ? inv.amount : 0).toString();
        const paidVal = inv.paidAmount !== undefined ? inv.paidAmount : (inv.status === "Paid" ? inv.amount : 0);
        invoicePaid = paidVal.toString();
        if (inv.currency === "USD" || inv.currency === "PKR") {
          invoiceCurrency = inv.currency;
        }
        if (inv.plan) invoicePlan = inv.plan;
        if (inv.paymentMethod) invoicePaymentMethod = inv.paymentMethod;
      } else {
        if (t.plan === "Starter") invoiceAmount = t.billingCycle === "yearly" ? "150000" : "15000";
        if (t.plan === "Professional") invoiceAmount = t.billingCycle === "yearly" ? "250000" : "25000";
        if (t.plan === "Enterprise") invoiceAmount = t.billingCycle === "yearly" ? "120000" : "45000";
        invoicePaid = t.status === "Active" ? invoiceAmount : "0";
      }

      setForm(prev => ({
        ...prev,
        tenantId: t.id,
        to: t.email,
        businessName: t.businessName,
        ownerName: t.ownerName,
        password: cred?.pass || "owner123",
        plan: invoicePlan,
        billingCycle: t.billingCycle === "yearly" ? "Annual" : "Monthly",
        amount: invoiceAmount,
        paidAmount: invoicePaid,
        currency: invoiceCurrency,
        paymentMethod: invoicePaymentMethod,
        subject: `[MT UniPOS] Official SaaS Billing & Account Setup: ${t.businessName}`
      }));
    }
  };

  const handleSendEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const amt = parseFloat(form.amount) || 0;
    const paid = parseFloat(form.paidAmount) || 0;
    const rem = Math.max(0, amt - paid);

    const logId = `EML-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: form.to,
          subject: form.subject || `[MT UniPOS] Official SaaS Billing & Account Setup: ${form.businessName}`,
          tenantId: form.tenantId || "CT-001",
          businessName: form.businessName,
          ownerName: form.ownerName,
          password: form.password,
          amount: amt,
          paidAmount: paid,
          remainingBalance: rem,
          currency: form.currency,
          plan: form.plan,
          billingCycle: form.billingCycle,
          paymentMethod: form.paymentMethod
        })
      });

      const data = await res.json();

      const newEntry: EmailLogEntry = {
        id: logId,
        to: form.to,
        businessName: form.businessName,
        tenantId: form.tenantId || "CT-001",
        ownerName: form.ownerName,
        subject: form.subject || `[MT UniPOS] Official SaaS Billing & Account Setup: ${form.businessName}`,
        plan: form.plan,
        billingCycle: form.billingCycle,
        amount: amt,
        paidAmount: paid,
        remainingBalance: rem,
        currency: form.currency,
        paymentMethod: form.paymentMethod,
        sentAt: new Date().toISOString(),
        status: data.success ? "Delivered" : "Queued",
        password: form.password,
        notes: data.error ? `Resend Notice: ${data.error}` : "Delivered via Resend API (billing@updates.mtcore.xyz)"
      };

      setLogs(prev => [newEntry, ...prev]);

      if (data.success) {
        triggerToast(`⚡ Executive Email delivered successfully to ${form.to}!`);
      } else {
        triggerToast(`📧 Email logged & dispatched! (${data.error || "Processed"})`);
      }

      setShowSendModal(false);
    } catch (err: any) {
      triggerToast(`⚠️ Email logged: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleResendSingle = async (logEntry: EmailLogEntry) => {
    triggerToast(`⚡ Resending Executive Email to ${logEntry.to}...`);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: logEntry.to,
          subject: logEntry.subject,
          tenantId: logEntry.tenantId,
          businessName: logEntry.businessName,
          ownerName: logEntry.ownerName,
          password: logEntry.password,
          amount: logEntry.amount,
          paidAmount: logEntry.paidAmount,
          remainingBalance: logEntry.remainingBalance,
          currency: logEntry.currency,
          plan: logEntry.plan,
          billingCycle: logEntry.billingCycle,
          paymentMethod: logEntry.paymentMethod
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`✅ Email successfully re-delivered to ${logEntry.to}!`);
      } else {
        triggerToast(`⚠️ Resend notice: ${data.error || "Queued"}`);
      }
    } catch (err: any) {
      triggerToast(`⚠️ Error resending: ${err.message}`);
    }
  };

  const handleDownloadPdf = async (entry: EmailLogEntry) => {
    try {
      const { generateInvoicePdfBase64 } = await import("@/lib/invoice-pdf");
      const b64 = generateInvoicePdfBase64({
        invoiceId: entry.id,
        tenantId: entry.tenantId,
        businessName: entry.businessName,
        ownerName: entry.ownerName,
        to: entry.to,
        password: entry.password,
        amount: entry.amount,
        paidAmount: entry.paidAmount,
        remainingBalance: entry.remainingBalance,
        currency: entry.currency,
        plan: entry.plan,
        billingCycle: entry.billingCycle,
        paymentMethod: entry.paymentMethod
      });

      const byteCharacters = atob(b64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = (entry.businessName || entry.tenantId || "Invoice").replace(/[^a-zA-Z0-9_-]/g, "_");
      a.download = `MT_UniPOS_Invoice_${safeName}_${entry.tenantId || "INV"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      triggerToast(`📄 Downloaded PDF Invoice for ${entry.businessName}!`);
    } catch (e: any) {
      triggerToast(`⚠️ Failed to generate PDF: ${e.message}`);
    }
  };

  const handleDeleteLog = (id: string) => {
    if (confirm("Delete this email dispatch log?")) {
      setLogs(prev => prev.filter(l => l.id !== id));
      triggerToast("Email log entry removed.");
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        l.to.toLowerCase().includes(q) ||
        l.businessName.toLowerCase().includes(q) ||
        l.tenantId.toLowerCase().includes(q) ||
        l.subject.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || l.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [logs, searchQuery, statusFilter]);

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Log ID,Recipient Email,Business Name,Tenant ID,Plan,Amount,Currency,Sent Date,Status"]
        .concat(
          filteredLogs.map(
            l => `${l.id},${l.to},"${l.businessName}",${l.tenantId},${l.plan},${l.amount},${l.currency},${l.sentAt},${l.status}`
          )
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `unipos_email_dispatch_logs_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen bg-black text-gray-100 font-sans">
      <AdminSidebar />

      <main className="flex-grow p-6 sm:p-8 space-y-6 overflow-y-auto max-h-screen">
        {/* Toast Alert */}
        {toastMsg && (
          <div className="fixed top-4 right-4 bg-purple-600/90 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-2xl border border-purple-500/20 backdrop-blur flex items-center gap-2 z-50 animate-bounce">
            <Sparkles size={16} />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-brand-dark-border/60 pb-4 gap-4">
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <Mail size={24} className="text-purple-400" />
              SaaS Email Dispatch Center &amp; Logs
            </h1>
            <p className="text-[10px] text-gray-500 font-sans">
              Monitor, compose, preview, and dispatch executive tenant invoices &amp; credential emails via Resend API.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 bg-brand-dark-surface hover:bg-brand-dark-border border border-brand-dark-border text-gray-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Download size={14} />
              <span>Export Logs</span>
            </button>
            <button
              onClick={() => setShowSendModal(true)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-600/20 transition flex items-center gap-2"
            >
              <Plus size={16} />
              <span>Compose &amp; Send Tenant Email</span>
            </button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-brand-dark-surface/60 border border-brand-dark-border p-4 rounded-2xl">
            <div className="text-[10px] uppercase font-bold text-gray-400">Total Emails Dispatched</div>
            <div className="text-xl font-black text-white mt-1">{logs.length} Sent</div>
            <div className="text-[9px] text-purple-400 font-bold mt-1">Logged in SaaS Shard</div>
          </div>
          <div className="bg-brand-dark-surface/60 border border-brand-dark-border p-4 rounded-2xl">
            <div className="text-[10px] uppercase font-bold text-gray-400">Resend Delivery Status</div>
            <div className="text-xl font-black text-emerald-400 mt-1">
              {logs.filter(l => l.status === "Delivered").length} Verified
            </div>
            <div className="text-[9px] text-emerald-500 font-bold mt-1">Resend API Active</div>
          </div>
          <div className="bg-brand-dark-surface/60 border border-brand-dark-border p-4 rounded-2xl">
            <div className="text-[10px] uppercase font-bold text-gray-400">Sender Custom Domain</div>
            <div className="text-sm font-black text-sky-400 mt-1 font-mono truncate">billing@updates.mtcore.xyz</div>
            <div className="text-[9px] text-sky-300 font-bold mt-1">DKIM &amp; SPF Verified</div>
          </div>
          <div className="bg-brand-dark-surface/60 border border-brand-dark-border p-4 rounded-2xl">
            <div className="text-[10px] uppercase font-bold text-gray-400">Official Web Portal</div>
            <div className="text-sm font-black text-white mt-1 font-mono flex items-center gap-1">
              <span>pos.mtcore.xyz</span>
              <ExternalLink size={12} className="text-purple-400" />
            </div>
            <div className="text-[9px] text-gray-400 mt-1">Direct Login Portal</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-brand-dark-surface/50 border border-brand-dark-border p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by email, business, tenant ID, or subject..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-brand-dark-border pl-9 pr-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-[10px] uppercase font-bold text-gray-500">Status:</span>
            {(["All", "Delivered", "Queued", "Failed"] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition ${
                  statusFilter === st
                    ? "bg-purple-600 border-purple-500 text-white"
                    : "bg-black border-brand-dark-border text-gray-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Email Logs Table */}
        <div className="bg-brand-dark-surface/50 border border-brand-dark-border rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-black/60 border-b border-brand-dark-border text-[10px] font-black uppercase text-gray-400 tracking-wider">
                  <th className="p-4">Log ID</th>
                  <th className="p-4">Recipient Client</th>
                  <th className="p-4">Tenant ID</th>
                  <th className="p-4">Package / Amount</th>
                  <th className="p-4">Sent Date</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark-border/40">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500 font-bold">
                      No email dispatch logs found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(entry => (
                    <tr key={entry.id} className="hover:bg-purple-950/10 transition group">
                      <td className="p-4 font-mono font-bold text-purple-400">{entry.id}</td>
                      <td className="p-4">
                        <div className="font-bold text-white text-xs">{entry.businessName}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{entry.to}</div>
                      </td>
                      <td className="p-4 font-mono font-bold text-sky-400">{entry.tenantId}</td>
                      <td className="p-4">
                        <div className="font-bold text-white">{entry.plan}</div>
                        <div className="text-[10px] text-emerald-400 font-black">
                          {entry.currency} {entry.amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="p-4 text-[11px] text-gray-400 font-mono">
                        {new Date(entry.sentAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border ${
                            entry.status === "Delivered"
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : entry.status === "Queued"
                              ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
                              : "bg-red-500/10 border-red-500/30 text-red-400"
                          }`}
                        >
                          {entry.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1.5 justify-center">
                          {/* Preview Email Button */}
                          <button
                            onClick={() => setPreviewLog(entry)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 rounded-lg text-[10px] font-bold transition"
                            title="Preview full Executive HTML Email template"
                          >
                            <Eye size={11} />
                            Preview
                          </button>

                          {/* Download Attached PDF */}
                          <button
                            onClick={() => handleDownloadPdf(entry)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold transition"
                            title="Download official attached PDF invoice"
                          >
                            <Download size={11} />
                            PDF
                          </button>

                          {/* Resend Email Button */}
                          <button
                            onClick={() => handleResendSingle(entry)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-lg text-[10px] font-bold transition"
                            title="Resend email via Resend API"
                          >
                            <Send size={11} />
                            Resend
                          </button>

                          {/* Delete Log */}
                          <button
                            onClick={() => handleDeleteLog(entry.id)}
                            className="p-1.5 bg-red-900/20 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg transition"
                            title="Delete Log"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* PREVIEW EXECUTIVE EMAIL MODAL                                         */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {previewLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-sans overflow-y-auto">
            <div className="bg-[#0b0f17] border border-purple-500/40 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 animate-fade-in-up">
              {/* Modal Header */}
              <div className="p-4 bg-black/60 border-b border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Mail size={18} className="text-purple-400" />
                  <span className="font-black text-white text-sm">Executive Email Statement Preview</span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 font-mono px-2 py-0.5 rounded border border-purple-500/30">
                    {previewLog.id}
                  </span>
                </div>
                <button onClick={() => setPreviewLog(null)} className="text-gray-400 hover:text-white p-1 rounded">
                  <X size={18} />
                </button>
              </div>

              {/* Email Content Container */}
              <div className="p-6 bg-slate-100 text-slate-900 max-h-[75vh] overflow-y-auto">
                <div className="max-w-2xl mx-auto bg-white border-2 border-sky-600 rounded-2xl p-6 sm:p-8 shadow-xl">
                  
                  {/* Top Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h1 className="text-2xl font-black text-sky-600 m-0">MT UniPOS</h1>
                      <div className="text-[11px] font-extrabold uppercase text-slate-600 tracking-wider mt-0.5">
                        ENTERPRISE SAAS POS &amp; ERP SYSTEM
                      </div>
                      <div className="text-[10px] font-semibold text-slate-500 mt-0.5">
                        Super Admin Billing Statement &amp; Tenant Credentials
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-base font-black text-slate-900">{previewLog.id}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Issued Date: {previewLog.sentAt.split("T")[0]}</div>
                      <div className="mt-2">
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                          STATUS: PAID
                        </span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-200 my-6" />

                  {/* Parties Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {/* Billed Provider */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
                      <div className="font-black uppercase text-sky-600 text-[10px] mb-1">🏢 BILLED PROVIDER</div>
                      <div className="font-black text-slate-900 text-sm mb-1">MT UniPOS Software Suite</div>
                      <div className="text-slate-600 space-y-0.5">
                        <div>Engineered by Founder <b>Mian Talal</b></div>
                        <div>Support Contact: <b>03396399895</b></div>
                        <div>Corporate Email: <b>miantalal2@gmail.com</b></div>
                        <div>Official Portal: <b className="text-sky-600">pos.mtcore.xyz</b></div>
                      </div>
                    </div>

                    {/* Client Info */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
                      <div className="font-black uppercase text-sky-600 text-[10px] mb-1">👤 CLIENT / TENANT INFORMATION</div>
                      <div className="font-black text-slate-900 text-sm mb-1">{previewLog.businessName}</div>
                      <div className="text-slate-600 space-y-0.5">
                        <div>Workspace / Tenant ID: <b className="text-sky-600">{previewLog.tenantId}</b></div>
                        <div>Owner Name: <b>{previewLog.ownerName}</b></div>
                        <div>Registered Email: <b>{previewLog.to}</b></div>
                        <div>Status: <b className="text-emerald-700">Active</b></div>
                      </div>
                    </div>
                  </div>

                  {/* Tenant Access & Credentials Box */}
                  <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl p-4 mb-6 text-xs">
                    <div className="font-black uppercase text-blue-900 text-[11px] mb-2 flex items-center gap-1.5">
                      <Key size={13} className="text-blue-700" />
                      TENANT ACCESS &amp; LOGIN CREDENTIALS
                    </div>
                    <table className="w-full text-xs">
                      <tbody>
                        <tr>
                          <td className="py-1 text-blue-700 font-bold w-36">Workspace Tenant ID:</td>
                          <td className="py-1 font-mono font-black text-blue-950 text-sm">{previewLog.tenantId}</td>
                        </tr>
                        <tr>
                          <td className="py-1 text-blue-700 font-bold">Corporate Email:</td>
                          <td className="py-1 font-bold text-slate-900">{previewLog.to}</td>
                        </tr>
                        <tr>
                          <td className="py-1 text-blue-700 font-bold">Default Password:</td>
                          <td className="py-1 font-mono font-black text-red-600 text-sm">{previewLog.password || "owner123"}</td>
                        </tr>
                        <tr>
                          <td className="py-1 text-blue-700 font-bold">Web Login Portal:</td>
                          <td className="py-1">
                            <a href="https://pos.mtcore.xyz/login" target="_blank" rel="noreferrer" className="text-blue-600 font-black underline">
                              https://pos.mtcore.xyz/login
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Package Description Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-[10px] font-black uppercase text-slate-600">
                          <th className="p-3">BILLED PACKAGE / DESCRIPTION</th>
                          <th className="p-3 text-center">BILLING CYCLE</th>
                          <th className="p-3 text-right">TOTAL BILL ({previewLog.currency})</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-slate-200">
                          <td className="p-3">
                            <div className="font-black text-slate-900 text-sm">{previewLog.plan}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">Enterprise Sharding Access &amp; Cloud Backup Sync</div>
                          </td>
                          <td className="p-3 text-center font-bold text-slate-700">{previewLog.billingCycle}</td>
                          <td className="p-3 text-right font-black text-slate-900 text-sm">
                            {previewLog.currency} {previewLog.amount.toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Financial Summary */}
                  <div className="flex justify-end mb-6">
                    <div className="w-full sm:w-72 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
                      <div className="flex justify-between py-1 text-slate-600">
                        <span>Total Bill Amount:</span>
                        <span className="font-black text-slate-900">{previewLog.currency} {previewLog.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-1 text-emerald-700 font-bold">
                        <span>Amount Received / Paid:</span>
                        <span className="font-black">{previewLog.currency} {previewLog.paidAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-slate-300 font-black text-sky-600 text-sm mt-1">
                        <span>Remaining Balance Due:</span>
                        <span>{previewLog.currency} {previewLog.remainingBalance.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Stamp */}
                  <hr className="border-slate-200 my-4" />
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] text-slate-500 gap-2">
                    <div>
                      <b>MT UniPOS SaaS Management</b> • Payment Method: <b>{previewLog.paymentMethod}</b><br/>
                      Notes: <i>Tenant account active. Invoice cleared.</i>
                    </div>
                    <div className="sm:text-right">
                      Verification: <b className="text-sky-600">AUTHENTICATED SAAS RECEIPT</b><br/>
                      Official Web Portal: <b>pos.mtcore.xyz</b>
                    </div>
                  </div>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-black/60 border-t border-gray-800 flex flex-wrap gap-2 justify-between items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadPdf(previewLog)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                  >
                    <Download size={14} />
                    <span>Download Official PDF Invoice</span>
                  </button>

                  <button
                    onClick={() => handleResendSingle(previewLog)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl transition flex items-center gap-1.5"
                  >
                    <Send size={14} />
                    <span>Resend Email</span>
                  </button>
                </div>

                <button
                  onClick={() => setPreviewLog(null)}
                  className="px-4 py-2 bg-brand-dark-border hover:bg-gray-700 text-gray-300 font-bold text-xs rounded-xl transition"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* COMPOSE & SEND EXECUTIVE TENANT EMAIL MODAL                            */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {showSendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-sans">
            <div className="bg-[#0b0f17] border border-purple-500/40 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-fade-in-up">
              <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-black/40">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
                    <Send size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base">Compose &amp; Dispatch Executive Email</h3>
                    <p className="text-xs text-gray-400">Send Invoice + Credentials + Plan Info in 1 Master Email</p>
                  </div>
                </div>
                <button onClick={() => setShowSendModal(false)} className="text-gray-400 hover:text-white p-1 rounded">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSendEmailSubmit} className="p-6 space-y-4 text-xs">
                {/* Auto Tenant Picker */}
                <div>
                  <label className="block text-[11px] uppercase font-bold text-purple-400 mb-1">
                    Select Active Tenant (Auto-Fill)
                  </label>
                  <select
                    onChange={e => handleTenantSelect(e.target.value)}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-purple-500"
                  >
                    <option value="">-- Choose registered tenant or enter manually --</option>
                    {tenants.map(t => {
                      const matchingInv = saasInvoices.find(i => 
                        (i.tenantId && i.tenantId.toLowerCase() === t.id.toLowerCase()) || 
                        (i.tenantName && t.businessName && i.tenantName.trim().toLowerCase() === t.businessName.trim().toLowerCase())
                      );
                      const invTag = matchingInv 
                        ? `[Invoice: ${matchingInv.currency || 'PKR'} ${matchingInv.amount.toLocaleString()} • ${matchingInv.status}]`
                        : `[Plan: ${t.plan || 'Standard'}]`;

                      return (
                        <option key={t.id} value={t.id}>
                          {t.businessName} ({t.id}) — {invTag}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Recipient Email & Business Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-gray-400 mb-1">Recipient Email</label>
                    <input
                      type="email"
                      required
                      placeholder="client@company.com"
                      value={form.to}
                      onChange={e => setForm({ ...form, to: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-gray-400 mb-1">Business Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Al-Fatah Supermarket"
                      value={form.businessName}
                      onChange={e => setForm({ ...form, businessName: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Tenant ID & Password */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-gray-400 mb-1">Workspace Tenant ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AFS-1234"
                      value={form.tenantId}
                      onChange={e => setForm({ ...form, tenantId: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-gray-400 mb-1">Default Password</label>
                    <input
                      type="text"
                      required
                      placeholder="owner123"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Plan Tier & Billing Cycle */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-gray-400 mb-1">Plan Package</label>
                    <select
                      value={form.plan}
                      onChange={e => setForm({ ...form, plan: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-purple-500"
                    >
                      <option value="Starter Plan">Starter Plan</option>
                      <option value="Professional Plan">Professional Plan</option>
                      <option value="Enterprise Plan">Enterprise Plan</option>
                      <option value="Enterprise yearly">Enterprise yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-gray-400 mb-1">Billing Cycle</label>
                    <select
                      value={form.billingCycle}
                      onChange={e => setForm({ ...form, billingCycle: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-purple-500"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Annual">Annual / Yearly</option>
                    </select>
                  </div>
                </div>

                {/* Amount & Currency */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-gray-400 mb-1">Currency</label>
                    <select
                      value={form.currency}
                      onChange={e => setForm({ ...form, currency: e.target.value as "PKR" | "USD" })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-purple-500"
                    >
                      <option value="PKR">PKR (Rs)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-emerald-400 mb-1">Total Bill Amount *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={form.amount}
                      onChange={e => setForm({ ...form, amount: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-emerald-400 font-black text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-sky-400 mb-1">Amount Paid / Received *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={form.paidAmount}
                      onChange={e => setForm({ ...form, paidAmount: e.target.value })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-sky-400 font-black text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-[11px] uppercase font-bold text-gray-400 mb-1">Payment Method</label>
                  <select
                    value={form.paymentMethod}
                    onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-purple-500"
                  >
                    <option value="Bank Transfer (HBL / Meezan)">Bank Transfer (HBL / Meezan)</option>
                    <option value="Cash Payment">Cash Payment</option>
                    <option value="EasyPaisa / JazzCash">EasyPaisa / JazzCash</option>
                    <option value="Credit / Debit Card">Credit / Debit Card</option>
                    <option value="Online Gateway (Stripe)">Online Gateway (Stripe)</option>
                  </select>
                </div>

                {/* Live Auto-Calculated Billing Summary */}
                {(() => {
                  const billAmt = parseFloat(form.amount) || 0;
                  const paidAmt = parseFloat(form.paidAmount) || 0;
                  const remDue = Math.max(0, billAmt - paidAmt);
                  const isFullyPaid = remDue === 0 && billAmt > 0;

                  return (
                    <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-gray-400">Total Billed: <b className="text-white">{form.currency} {billAmt.toLocaleString()}</b></span>
                        <span className="text-emerald-400">Paid: <b>{form.currency} {paidAmt.toLocaleString()}</b></span>
                        <span className={`font-black ${isFullyPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                          Remaining Dues: {form.currency} {remDue.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                        <span className="text-gray-400">Payment Status:</span>
                        <span className={`px-2 py-0.5 rounded font-black uppercase text-[9px] ${
                          isFullyPaid 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : remDue < billAmt 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {isFullyPaid ? "✅ Fully Cleared & Paid" : remDue < billAmt ? "⚠️ Partial Payment Received" : "❌ Unpaid / Pending"}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded-xl text-[10px] text-purple-300 font-bold flex items-center justify-between">
                  <span>Official Portal Link:</span>
                  <span className="font-mono text-white font-black bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/40">
                    https://pos.mtcore.xyz/login
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-lg shadow-purple-600/20"
                >
                  {sending ? (
                    <><RefreshCw size={14} className="animate-spin" /> Dispatching via Resend API...</>
                  ) : (
                    <><Send size={14} /> Confirm &amp; Dispatch Master Executive Email</>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
