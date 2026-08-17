"use client";

import React, { useState, useRef } from "react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { useGlobalContext, SaleTransaction } from "@/context/global-context";
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  EyeOff,
  Send,
  MessageCircle,
  Ticket,
  Shield,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  CreditCard,
  User,
  Hash,
  Receipt,
  Phone,
  Printer,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Coins,
  Wallet
} from "lucide-react";
import type { DemoRequest, SupportTicket } from "@/context/global-context";

// ─── Timeline steps for Support / Demo Tickets ────────────────────────────────
const STEPS = [
  { label: "Submitted",     key: "submitted"  },
  { label: "Under Review",  key: "reviewed"   },
  { label: "Decision Made", key: "decided"    },
  { label: "Result",        key: "result"     },
] as const;

function getStepIndex(status: DemoRequest["status"]): number {
  switch (status) {
    case "Pending":  return 0;
    case "Under Review":
    case "Reviewed": return 1;
    case "Approved":
    case "Rejected": return 3;
    default:         return 0;
  }
}

// ─── Status Badge for Tickets ──────────────────────────────────────────────────
function StatusBadge({ status }: { status: DemoRequest["status"] }) {
  const map: Record<DemoRequest["status"], { label: string; cls: string }> = {
    Pending:  { label: "PENDING",  cls: "bg-amber-500/15 text-amber-400 border-amber-500/40"   },
    "Under Review": { label: "REVIEWING", cls: "bg-purple-500/15 text-purple-400 border-purple-500/40"       },
    Reviewed: { label: "REVIEWED", cls: "bg-blue-500/15 text-blue-400 border-blue-500/40"       },
    Approved: { label: "APPROVED", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40" },
    Rejected: { label: "REJECTED", cls: "bg-red-500/15 text-red-400 border-red-500/40"         },
    Converted: { label: "ACTIVE PAID", cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/60 font-black" },
  };
  const { label, cls } = map[status] || { label: status, cls: "bg-gray-800 text-gray-300 border-gray-700" };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[10px] font-black tracking-widest uppercase ${cls}`}>
      {label}
    </span>
  );
}

// ─── Horizontal Progress Timeline ─────────────────────────────────────────────
function StatusTimeline({ status }: { status: DemoRequest["status"] }) {
  const activeStep = getStepIndex(status);

  return (
    <div className="w-full mt-4 mb-2">
      <div className="flex items-center w-full">
        {STEPS.map((step, idx) => {
          const isActive    = idx === activeStep;
          const isCompleted = idx < activeStep;
          const isResult    = idx === 3;

          let dotCls = "bg-gray-700 border-gray-600";
          let labelCls = "text-gray-500";

          if (isCompleted) {
            dotCls   = "bg-brand-sky border-brand-sky";
            labelCls = "text-brand-sky";
          } else if (isActive) {
            if (status === "Approved") {
              dotCls   = "bg-emerald-500 border-emerald-400 ring-2 ring-emerald-500/30";
              labelCls = "text-emerald-400 font-bold";
            } else if (status === "Rejected") {
              dotCls   = "bg-red-500 border-red-400 ring-2 ring-red-500/30";
              labelCls = "text-red-400 font-bold";
            } else {
              dotCls   = "bg-brand-sky border-brand-sky ring-2 ring-brand-sky/30";
              labelCls = "text-brand-sky font-bold";
            }
          }

          let displayLabel: string = step.label;
          if (isResult) {
            if (status === "Approved") displayLabel = "Active";
            else if (status === "Rejected") displayLabel = "Rejected";
          }

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${dotCls}`}>
                  {isCompleted ? (
                    <CheckCircle2 size={14} className="text-black" />
                  ) : isActive && status === "Approved" ? (
                    <CheckCircle2 size={14} className="text-black" />
                  ) : isActive && status === "Rejected" ? (
                    <XCircle size={14} className="text-black" />
                  ) : isActive ? (
                    <Clock size={14} className="text-black" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-600" />
                  )}
                </div>
                <span className={`text-[9px] mt-1.5 font-semibold uppercase tracking-wide text-center whitespace-nowrap ${labelCls}`}>
                  {displayLabel}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 transition-all duration-500 ${idx < activeStep ? "bg-brand-sky" : "bg-gray-700"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  return (local ? local.slice(0, 4) : "user") + "***@" + (domain || "mtcore.xyz");
}
function maskPassword(pw: string): string {
  return pw.slice(0, 5) + "***";
}

function daysRemaining(trialEndsAt: string): number {
  const diff = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function ChatBubble({ sender, message, date }: { sender: "Client" | "Admin"; message: string; date: string }) {
  const isAdmin = sender === "Admin";
  return (
    <div className={`flex gap-2 ${isAdmin ? "justify-start" : "justify-end"}`}>
      {isAdmin && (
        <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center shrink-0 mt-0.5">
          <Shield size={12} className="text-gray-300" />
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
          isAdmin
            ? "bg-brand-dark-surface border border-brand-dark-border text-gray-200 rounded-tl-none"
            : "bg-brand-sky text-black rounded-tr-none"
        }`}
      >
        <p className="text-xs leading-relaxed">{message}</p>
        <p className={`text-[9px] mt-1 ${isAdmin ? "text-gray-500" : "text-sky-900"}`}>
          {sender} · {new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      {!isAdmin && (
        <div className="w-7 h-7 rounded-full bg-brand-sky/20 border border-brand-sky/40 flex items-center justify-center shrink-0 mt-0.5">
          <MessageCircle size={12} className="text-brand-sky" />
        </div>
      )}
    </div>
  );
}

function maskPhone(phone?: string): string {
  if (!phone) return "0300****000";
  const clean = phone.trim().replace(/\s+/g, "");
  if (clean.length < 7) return clean;
  const first4 = clean.slice(0, 4);
  const last3 = clean.slice(-3);
  return `${first4}****${last3}`;
}

// ─── Main Self-Service & Tracking Portal Page ──────────────────────────────────
export default function TrackingPage() {
  const {
    demoRequests,
    supportTickets,
    tenants,
    saasInvoices,
    addDemoMessage,
    replyToTicket,
    updateSupportTicket,
    customers,
    sales,
    currencySymbol,
    businessSettings,
    theme
  } = useGlobalContext();
  const isLight = theme === "light";

  // Search Mode: 'receipt' | 'customer' | 'ticket'
  const [searchMode, setSearchMode] = useState<"receipt" | "customer" | "ticket">("receipt");

  // Inputs
  const [receiptInput, setReceiptInput] = useState("");
  const [custNoInput, setCustNoInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [ticketInput, setTicketInput] = useState("");

  // Search Triggered & Results
  const [hasSearched, setHasSearched] = useState(false);
  const [foundReceipt, setFoundReceipt] = useState<SaleTransaction | null>(null);
  const [foundSaasInvoice, setFoundSaasInvoice] = useState<any | null>(null);
  const [foundCustomer, setFoundCustomer] = useState<any | null>(null);
  const [foundTicket, setFoundTicket] = useState<any | null>(null);
  const [foundTicketType, setFoundTicketType] = useState<"demo" | "support" | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Customer Portal Sub-Tabs
  const [custSubTab, setCustSubTab] = useState<"purchases" | "returns" | "credit">("purchases");
  const [expandedSales, setExpandedSales] = useState<Record<string, boolean>>({});

  // Ticket Chat / State
  const [revealCredentials, setRevealCredentials] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [softwareForm, setSoftwareForm] = useState({ name: "", businessNature: "", features: "" });
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);

  const toggleSaleExpand = (saleId: string) => {
    setExpandedSales((prev) => ({ ...prev, [saleId]: !prev[saleId] }));
  };

  // Helper: execute receipt search
  const executeReceiptSearch = (queryStr: string) => {
    const query = queryStr.trim().toLowerCase();
    if (!query) return;

    setHasSearched(true);
    setAuthError(null);
    setFoundReceipt(null);
    setFoundSaasInvoice(null);
    setFoundCustomer(null);
    setFoundTicket(null);

    // 1. Search POS Store Sales
    const saleMatch = sales.find(
      (s) => s.receiptNumber.toLowerCase() === query || s.id.toLowerCase() === query
    );
    if (saleMatch) {
      setFoundReceipt(saleMatch);
      return;
    }

    // 2. Search SaaS Admin Invoices
    const saasMatch = saasInvoices.find(
      (inv) => inv.id.toLowerCase() === query || inv.tenantId.toLowerCase() === query
    );
    if (saasMatch) {
      setFoundSaasInvoice(saasMatch);
      return;
    }

    // 3. Fallback: check localStorage
    try {
      const storedInvoices: any[] = JSON.parse(localStorage.getItem("unipos_invoices") || "[]");
      const localMatch = storedInvoices.find(
        (inv) => inv.id?.toLowerCase() === query || inv.tenantId?.toLowerCase() === query
      );
      if (localMatch) {
        setFoundSaasInvoice(localMatch);
        return;
      }
    } catch {}
  };

  // Helper: execute ticket search
  const executeTicketSearch = (queryStr: string) => {
    const query = queryStr.trim().toLowerCase();
    if (!query) return;

    setHasSearched(true);
    setAuthError(null);
    setFoundReceipt(null);
    setFoundSaasInvoice(null);
    setFoundCustomer(null);
    setFoundTicket(null);
    setFoundTicketType(null);

    const demoMatch = demoRequests.find(
      (r) => (r.ticketNumber && r.ticketNumber.toLowerCase() === query) || r.id.toLowerCase() === query
    );
    const suppMatch = supportTickets.find(
      (r) => (r.ticketNumber && r.ticketNumber.toLowerCase() === query) || r.id.toLowerCase() === query
    );

    if (demoMatch) {
      setFoundTicket(demoMatch);
      setFoundTicketType("demo");
    } else if (suppMatch) {
      setFoundTicket(suppMatch);
      setFoundTicketType("support");
    } else {
      // LocalStorage Fallback check for demo requests
      try {
        const localDemos: DemoRequest[] = JSON.parse(localStorage.getItem("unipos_demos") || "[]");
        const localMatch = localDemos.find(
          (r) => (r.ticketNumber && r.ticketNumber.toLowerCase() === query) || r.id?.toLowerCase() === query
        );
        if (localMatch) {
          setFoundTicket(localMatch);
          setFoundTicketType("demo");
        }
      } catch {}
    }
  };

  // Auto-search on page load when URL contains ?id=... or ?receipt=... or ?ticket=... or ?inv=...
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get("id") || params.get("receipt") || params.get("ticket") || params.get("inv");
      if (urlId) {
        const query = urlId.trim();
        if (query.toUpperCase().startsWith("TKT-") || params.get("ticket")) {
          setTicketInput(query);
          setSearchMode("ticket");
          executeTicketSearch(query);
        } else {
          setReceiptInput(query);
          setSearchMode("receipt");
          executeReceiptSearch(query);
        }
      }
    }
  }, [sales, saasInvoices, demoRequests, supportTickets]);

  // Execute Search Form Submit
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (searchMode === "receipt") {
      executeReceiptSearch(receiptInput);
    } else if (searchMode === "customer") {
      setHasSearched(true);
      setAuthError(null);
      setFoundReceipt(null);
      setFoundSaasInvoice(null);
      setFoundCustomer(null);
      setFoundTicket(null);
      const cNo = custNoInput.trim().toLowerCase();
      const pNo = phoneInput.trim().replace(/\D/g, "");

      if (!cNo && !pNo) {
        setAuthError("Please enter your Customer ID or Registered Phone Number.");
        return;
      }

      const match = customers.find((c) => {
        const matchesNo = cNo && c.customerNo && c.customerNo.toLowerCase() === cNo;
        const cPhoneClean = (c.mobile || "").replace(/\D/g, "");
        const matchesPhone = pNo && cPhoneClean.length >= 6 && (cPhoneClean.includes(pNo) || pNo.includes(cPhoneClean));

        if (cNo && pNo) return matchesNo && matchesPhone;
        if (cNo) return matchesNo;
        if (pNo) return matchesPhone;
        return false;
      });

      if (!match) {
        setAuthError("No registered customer profile matches the provided Customer ID & Phone Number.");
      } else {
        setFoundCustomer(match);
      }
    } else if (searchMode === "ticket") {
      executeTicketSearch(ticketInput);
    }
  };

  // Ticket Message Sender
  const handleSendMessage = () => {
    if (!messageText.trim() || !foundTicket) return;
    if (foundTicketType === "demo") {
      addDemoMessage(foundTicket.ticketNumber, messageText.trim(), "Client");
    } else if (foundTicketType === "support") {
      replyToTicket(foundTicket.id, messageText.trim(), "Client");
    }
    setMessageText("");
    setMessageSent(true);
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
    setTimeout(() => setMessageSent(false), 3000);
  };

  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (foundTicketType === "support" && foundTicket) {
      updateSupportTicket(foundTicket.id, {
        softwareRequestData: {
          ...softwareForm,
          requestedAt: new Date().toISOString()
        }
      });
      setShowPurchaseForm(false);
    }
  };

  // Print Digital Thermal Slip Window
  const handlePrintSlip = (sale: SaleTransaction) => {
    const printWin = window.open("", "_blank", "width=400,height=600");
    if (!printWin) return;

    const itemsHtml = sale.items
      .map(
        (it) => `
      <tr style="border-bottom:1px dashed #ccc; font-size:11px;">
        <td style="padding:4px 0;">${it.productName}<br/><span style="font-size:9px;color:#666;">x${it.qty} @ ${currencySymbol} ${it.price.toLocaleString()}</span></td>
        <td style="text-align:right;padding:4px 0;font-weight:bold;">${currencySymbol} ${it.subtotal.toLocaleString()}</td>
      </tr>`
      )
      .join("");

    printWin.document.write(`
      <html>
        <head>
          <title>Receipt ${sale.receiptNumber}</title>
          <style>
            body { font-family: monospace; padding: 15px; margin: 0; width: 280px; font-size: 11px; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 8px 0; }
            .flex { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="center">
            <img src="/rectangle dark.png" style="height:44px;max-width:160px;object-fit:contain;margin:0 auto 4px auto;display:block" alt="MT Core" />
            <h2 style="margin:0;">${businessSettings?.businessName || "MT CORE STORE"}</h2>
            <p style="margin:2px 0;font-size:10px;">${businessSettings?.address || "Official Retail Outlet"}</p>
            <p style="margin:2px 0;font-size:9px;">Ph: ${businessSettings?.phone || "0300-1234567"}</p>
            <div class="line"></div>
            <p class="bold" style="margin:4px 0;">OFFICIAL PURCHASE RECEIPT</p>
            <p style="margin:2px 0;font-size:10px;">Receipt #: ${sale.receiptNumber}</p>
            <p style="margin:2px 0;font-size:9px;">${new Date(sale.date).toLocaleString()}</p>
            <p style="margin:2px 0;font-size:9px;">Customer: ${sale.customerName || "Walk-in Customer"}</p>
            ${sale.customerNo && sale.customerNo !== "N/A" ? `<p style="margin:2px 0;font-size:9px;">Customer ID: <b>${sale.customerNo}</b></p>` : ""}
            ${((sale as any).customerPhone || (sale as any).phone || (sale as any).mobile) ? `<p style="margin:2px 0;font-size:9px;font-family:monospace;">Phone: <b>${(() => { const p = ((sale as any).customerPhone || (sale as any).phone || (sale as any).mobile || "").trim(); return p.length >= 7 ? p.slice(0, 4) + "****" + p.slice(-3) : p; })()}</b></p>` : ""}
          </div>
          <div class="line"></div>
          <table style="width:100%; border-collapse:collapse;">
            ${itemsHtml}
          </table>
          <div class="line"></div>
          <div class="flex"><span>Subtotal:</span><span>${currencySymbol} ${(sale.subtotal || sale.total).toLocaleString()}</span></div>
          ${sale.discount ? `<div class="flex" style="color:red;"><span>Discount:</span><span>-${currencySymbol} ${sale.discount.toLocaleString()}</span></div>` : ""}
          ${sale.tax ? `<div class="flex"><span>Tax:</span><span>${currencySymbol} ${sale.tax.toLocaleString()}</span></div>` : ""}
          <div class="line"></div>
          <div class="flex bold" style="font-size:13px;"><span>GRAND TOTAL:</span><span>${currencySymbol} ${sale.total.toLocaleString()}</span></div>
          <div class="flex" style="margin-top:4px;"><span>Payment Mode:</span><span class="bold">${sale.paymentMethod}</span></div>
          <div class="line"></div>

          <!-- Online Self-Service Guidance Note -->
          <div style="border:1px dashed #000;border-radius:6px;padding:6px;margin:8px 0;text-align:center;background:#fafafa">
            <div style="font-weight:900;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;">🌐 ONLINE LEDGER &amp; RECEIPT PORTAL</div>
            <div style="font-size:8px;margin-top:3px;color:#333;line-height:1.4">
              Track your past receipts &amp; credit dues 24/7 online:<br/>
              <b style="font-size:9px;color:#0284c7;font-family:monospace">pos.mtcore.xyz/tracking</b><br/>
              Search Invoice #: <b>${sale.receiptNumber}</b>${sale.customerNo ? ` or Customer ID: <b>${sale.customerNo}</b>` : ""}
            </div>
          </div>

          <div class="center" style="font-size:9px;margin-top:10px;">
            <p>Thank you for your business!</p>
            <p>Powered by MT Core | The core technology behind your business.</p>
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => printWin.print(), 300);
  };

  const handlePrintSaasSlip = (inv: any) => {
    const printWin = window.open("", "_blank", "width=600,height=800");
    if (!printWin) return;

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>SaaS Invoice ${inv.id}</title>
<style>
  body { font-family: sans-serif; background: #fff; color: #000; padding: 20px; font-size: 12px; }
  .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
  .box { border: 1px solid #ddd; padding: 12px; border-radius: 8px; margin-bottom: 15px; background: #f8fafc; }
  .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  .total { text-align: right; font-weight: bold; font-size: 14px; margin-top: 15px; color: #0284c7; }
</style>
</head>
<body>
  <div class="header">
    <img src="/rectangle dark.png" style="height:46px;max-width:180px;object-fit:contain;margin:0 auto 6px auto;display:block" alt="MT Core" />
    <h2 style="margin:0;color:#0284c7;">MT Core Software Suite</h2>
    <div style="font-size:8px;color:#64748b;margin-top:2px;">The core technology behind your business.</div>
    <p style="margin:4px 0;font-size:11px;">Official SaaS Invoice Receipt: <b>${inv.id}</b></p>
    <p style="margin:0;font-size:11px;">Official Web Portal: <b>pos.mtcore.xyz</b></p>
  </div>

  <div class="box">
    <b>Client / Tenant:</b> ${inv.tenantName}<br/>
    <b>Workspace Tenant ID:</b> ${inv.tenantId}<br/>
    <b>Issued Date:</b> ${inv.date}<br/>
    <b>Status:</b> ${inv.status.toUpperCase()}
  </div>

  <table class="table">
    <thead>
      <tr style="background:#f1f5f9;">
        <th>Subscription Package</th>
        <th style="text-align:right;">Amount (${inv.currency || "PKR"})</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><b>${inv.plan}</b><br/><span style="font-size:10px;color:#666;">Enterprise Sharding Access & Cloud Backup Sync</span></td>
        <td style="text-align:right;font-weight:bold;">${inv.currency || "PKR"} ${Number(inv.amount || 0).toLocaleString()}</td>
      </tr>
    </tbody>
  </table>

  <div class="total">
    Remaining Balance Due: ${inv.currency || "PKR"} ${Number(inv.remainingBalance ?? 0).toLocaleString()}
  </div>

  <div style="margin-top:30px;text-align:center;font-size:10px;color:#666;border-top:1px solid #ddd;padding-top:10px;">
    MT Core SaaS Management • The core technology behind your business. • Support: 03396399895 • pos.mtcore.xyz
  </div>

  <script>
    window.onload = function() { setTimeout(function(){ window.print(); }, 300); };
  </script>
</body>
</html>`;

    printWin.document.write(html);
    printWin.document.close();
  };

  return (
    <div className={`flex flex-col min-h-screen font-sans transition-colors duration-200 ${
      isLight ? "bg-slate-50 text-slate-900" : "bg-black text-gray-100"
    }`}>
      <SiteHeader />

      {/* Hero / Portal Header */}
      <section className={`relative py-16 border-b overflow-hidden transition-colors duration-200 ${
        isLight ? "bg-white border-slate-200" : "border-brand-dark-border"
      }`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.08),transparent_70%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 border ${
            isLight ? "bg-sky-50 border-sky-200 text-sky-700 shadow-sm" : "bg-brand-sky/10 border-brand-sky/30 text-brand-sky shadow-lg shadow-sky-500/10"
          }`}>
            <Sparkles size={14} className="text-sky-500 animate-pulse" />
            <span className="text-xs font-bold tracking-wide font-sans uppercase">
              Customer Self-Service &amp; Support Portal
            </span>
          </div>

          <h1 className={`text-3xl sm:text-4xl font-black tracking-tight mb-3 font-sans ${isLight ? "text-slate-900" : "text-white"}`}>
            Track Receipt, <span className="text-sky-500 font-sans">Customer Account</span> &amp; Tickets
          </h1>
          <p className={`text-xs sm:text-sm mb-8 max-w-lg mx-auto leading-relaxed font-sans ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Verify purchase receipts, review your full customer purchase ledger &amp; credit dues, or track support ticket status in real-time.
          </p>

          {/* Search Mode Switcher Tabs */}
          <div className={`grid grid-cols-3 gap-2 p-1.5 rounded-2xl max-w-xl mx-auto mb-8 border ${
            isLight ? "bg-slate-100 border-slate-200 shadow-sm" : "bg-brand-dark-surface/90 border-brand-dark-border/90 shadow-xl"
          }`}>
            <button
              type="button"
              onClick={() => { setSearchMode("receipt"); setHasSearched(false); setAuthError(null); }}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                searchMode === "receipt"
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/25 scale-[1.02]"
                  : isLight
                  ? "text-slate-600 hover:text-slate-900 hover:bg-white"
                  : "text-gray-400 hover:text-white hover:bg-black/40"
              }`}
            >
              <Receipt size={15} />
              <span>Receipt Lookup</span>
            </button>

            <button
              type="button"
              onClick={() => { setSearchMode("customer"); setHasSearched(false); setAuthError(null); }}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                searchMode === "customer"
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/25 scale-[1.02]"
                  : isLight
                  ? "text-slate-600 hover:text-slate-900 hover:bg-white"
                  : "text-gray-400 hover:text-white hover:bg-black/40"
              }`}
            >
              <User size={15} />
              <span>Customer Account</span>
            </button>

            <button
              type="button"
              onClick={() => { setSearchMode("ticket"); setHasSearched(false); setAuthError(null); }}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                searchMode === "ticket"
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/25 scale-[1.02]"
                  : isLight
                  ? "text-slate-600 hover:text-slate-900 hover:bg-white"
                  : "text-gray-400 hover:text-white hover:bg-black/40"
              }`}
            >
              <Ticket size={15} />
              <span>Track Ticket</span>
            </button>
          </div>

          {/* Search Form Forms */}
          <form onSubmit={handleSearchSubmit} className="space-y-4 max-w-xl mx-auto">
            {/* Mode A: Receipt Search */}
            {searchMode === "receipt" && (
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className={`relative flex-1 rounded-xl overflow-hidden border ${
                  isLight ? "bg-white border-slate-300 shadow-xs" : "bg-brand-dark-surface border-brand-sky/40 sky-glow-border"
                }`}>
                  <Receipt size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${isLight ? "text-slate-400" : "text-gray-500"}`} />
                  <input
                    type="text"
                    required
                    placeholder="Enter Invoice / Receipt # (e.g. MT-TXN-0908260005)"
                    value={receiptInput}
                    onChange={(e) => setReceiptInput(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3.5 text-xs sm:text-sm focus:outline-none font-mono tracking-wider ${
                      isLight ? "bg-white text-slate-900 placeholder-slate-400" : "bg-brand-dark-surface text-white placeholder-gray-600"
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-sky-500/20 cursor-pointer"
                >
                  <Search size={15} />
                  <span>Search Receipt</span>
                </button>
              </div>
            )}

            {/* Mode B: Customer Account Search (Customer ID + Registered Phone) */}
            {searchMode === "customer" && (
              <div className={`space-y-3 p-5 rounded-2xl border transition-all ${
                isLight ? "bg-white border-slate-200 shadow-xl text-slate-900" : "bg-brand-dark-surface/80 border-brand-dark-border/80 shadow-2xl"
              }`}>
                <div className="text-left">
                  <p className={`text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5 ${
                    isLight ? "text-sky-600 font-black" : "text-brand-sky"
                  }`}>
                    <ShieldCheck size={13} /> Registered Customer Authentication
                  </p>
                  <p className={`text-[11px] ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
                    Enter your Customer ID and Registered Phone Number to access your full purchase ledger and credit dues statement.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="relative">
                    <Hash size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? "text-slate-400" : "text-gray-500"}`} />
                    <input
                      type="text"
                      placeholder="Customer ID (e.g. CUST-7294)"
                      value={custNoInput}
                      onChange={(e) => setCustNoInput(e.target.value)}
                      className={`w-full pl-9 pr-3 py-3 text-xs rounded-xl focus:outline-none font-mono transition border ${
                        isLight
                          ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-sky-500"
                          : "bg-black border-brand-dark-border/80 text-white placeholder-gray-600 focus:border-brand-sky"
                      }`}
                    />
                  </div>
                  <div className="relative">
                    <Phone size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? "text-slate-400" : "text-gray-500"}`} />
                    <input
                      type="text"
                      placeholder="Registered Phone (e.g. 03215550100)"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className={`w-full pl-9 pr-3 py-3 text-xs rounded-xl focus:outline-none font-mono transition border ${
                        isLight
                          ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-sky-500"
                          : "bg-black border-brand-dark-border/80 text-white placeholder-gray-600 focus:border-brand-sky"
                      }`}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs py-3 rounded-xl transition-all shadow-lg shadow-sky-500/20 uppercase tracking-wider cursor-pointer"
                >
                  <Search size={14} />
                  <span>Verify Credentials &amp; Access Ledger</span>
                </button>
              </div>
            )}

            {/* Mode C: Support / Demo Ticket Search */}
            {searchMode === "ticket" && (
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className={`relative flex-1 rounded-xl overflow-hidden border ${
                  isLight ? "bg-white border-slate-300 shadow-xs" : "bg-brand-dark-surface border-brand-sky/40 sky-glow-border"
                }`}>
                  <Ticket size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${isLight ? "text-slate-400" : "text-gray-500"}`} />
                  <input
                    type="text"
                    required
                    placeholder="Enter Ticket # (e.g. TKT-991001-11)"
                    value={ticketInput}
                    onChange={(e) => setTicketInput(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3.5 text-xs sm:text-sm focus:outline-none font-mono tracking-wider ${
                      isLight ? "bg-white text-slate-900 placeholder-slate-400" : "bg-brand-dark-surface text-white placeholder-gray-600"
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-sky-500/20 cursor-pointer"
                >
                  <Search size={15} />
                  <span>Track Ticket</span>
                </button>
              </div>
            )}
          </form>

        </div>
      </section>

      {/* Main Content Area */}
      <section className="flex-grow py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Initial State / Prompt */}
          {!hasSearched && (
            <div className={`text-center py-16 rounded-3xl p-8 border transition-all ${
              isLight ? "bg-white border-slate-200 shadow-md text-slate-900" : "bg-brand-dark-surface/40 border-brand-dark-border/60 shadow-2xl text-white"
            }`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${
                isLight ? "bg-sky-50 border-sky-200 text-sky-600 shadow-xs" : "bg-brand-sky/10 border-brand-sky/30 text-brand-sky"
              }`}>
                <Receipt size={30} />
              </div>
              <h3 className={`font-black text-base mb-1 ${isLight ? "text-slate-900" : "text-white"}`}>Customer Self-Service Search</h3>
              <p className={`text-xs max-w-md mx-auto leading-relaxed ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
                Use the search box above to lookup any single receipt invoice, view your complete customer account purchase ledger &amp; credit dues, or track a support ticket.
              </p>
            </div>
          )}

          {/* Authentication / Auth Errors */}
          {hasSearched && authError && (
            <div className={`rounded-2xl p-6 text-center animate-fade-in-up border ${
              isLight ? "bg-rose-50 border-rose-200 text-rose-900" : "bg-red-500/10 border-red-500/30 text-red-300"
            }`}>
              <AlertTriangle size={36} className="text-rose-500 mx-auto mb-3" />
              <h3 className={`font-black text-sm mb-1 ${isLight ? "text-rose-950" : "text-red-300"}`}>Authentication Failed</h3>
              <p className={`text-xs ${isLight ? "text-rose-800 font-medium" : "text-gray-300"}`}>{authError}</p>
              <button
                type="button"
                onClick={() => { setHasSearched(false); setAuthError(null); }}
                className={`mt-4 inline-flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl transition cursor-pointer border ${
                  isLight ? "bg-white border-rose-300 text-rose-800 hover:bg-rose-100 shadow-xs" : "border-brand-dark-border text-gray-400 hover:text-white"
                }`}
              >
                <RefreshCw size={12} /> Retry Search
              </button>
            </div>
          )}

          {/* Record Not Found State */}
          {hasSearched && !authError && !foundReceipt && !foundSaasInvoice && !foundCustomer && !foundTicket && (
            <div className={`rounded-2xl p-8 text-center animate-fade-in-up border ${
              isLight ? "bg-white border-slate-200 shadow-md text-slate-900" : "bg-brand-dark-surface border-red-500/30 text-white"
            }`}>
              <XCircle size={40} className="text-rose-500 mx-auto mb-3" />
              <h3 className={`font-black text-base mb-1 ${isLight ? "text-slate-900" : "text-white"}`}>Record Not Found</h3>
              <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
                No matching receipt, customer profile, or support ticket was found for your query.
              </p>
              <button
                type="button"
                onClick={() => { setHasSearched(false); }}
                className={`mt-5 inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl transition cursor-pointer border ${
                  isLight ? "bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200" : "border-brand-dark-border text-gray-400 hover:text-white"
                }`}
              >
                <RefreshCw size={13} /> Clear &amp; Try Again
              </button>
            </div>
          )}

          {/* 🧾 RESULT A: SINGLE DIGITAL RECEIPT LOOKUP RESULT */}
          {hasSearched && searchMode === "receipt" && foundReceipt && (
            <div className="space-y-6 animate-fade-in-up text-left">
              <div className={`rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6 transition-all ${
                isLight ? "bg-white border-slate-200 shadow-slate-200/60 text-slate-900" : "bg-brand-dark-surface border-emerald-500/30 shadow-2xl sky-glow text-white"
              }`}>
                
                {/* Header Row */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b ${
                  isLight ? "border-slate-200" : "border-brand-dark-border/80"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${
                      isLight ? "bg-emerald-50 border-emerald-200 text-emerald-600 shadow-xs" : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    }`}>
                      <Receipt size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-emerald-600 uppercase">VERIFIED OFFICIAL RECEIPT</span>
                        <span className={`font-mono text-[9px] px-2 py-0.5 rounded font-bold border ${
                          isLight ? "bg-emerald-100 border-emerald-300 text-emerald-800" : "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                        }`}>
                          {foundReceipt.status}
                        </span>
                      </div>
                      <h2 className={`text-xl sm:text-2xl font-black font-mono mt-0.5 ${isLight ? "text-slate-900" : "text-white"}`}>{foundReceipt.receiptNumber}</h2>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePrintSlip(foundReceipt)}
                    className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <Printer size={15} />
                    <span>Print / Save PDF Receipt</span>
                  </button>
                </div>

                {/* Meta details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className={`p-3.5 rounded-xl border ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-black/50 border-brand-dark-border/60"
                  }`}>
                    <span className={`text-[9px] uppercase font-bold block mb-0.5 font-sans ${isLight ? "text-slate-500" : "text-gray-500"}`}>Date &amp; Time</span>
                    <span className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                      {new Date(foundReceipt.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className={`p-3.5 rounded-xl border ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-black/50 border-brand-dark-border/60"
                  }`}>
                    <span className={`text-[9px] uppercase font-bold block mb-0.5 font-sans ${isLight ? "text-slate-500" : "text-gray-500"}`}>Customer</span>
                    <span className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{foundReceipt.customerName || "Walk-in Customer"}</span>
                  </div>
                  <div className={`p-3.5 rounded-xl border ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-black/50 border-brand-dark-border/60"
                  }`}>
                    <span className={`text-[9px] uppercase font-bold block mb-0.5 font-sans ${isLight ? "text-slate-500" : "text-gray-500"}`}>Payment Method</span>
                    <span className="text-emerald-600 font-bold">{foundReceipt.paymentMethod}</span>
                  </div>
                  <div className={`p-3.5 rounded-xl border ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-black/50 border-brand-dark-border/60"
                  }`}>
                    <span className={`text-[9px] uppercase font-bold block mb-0.5 font-sans ${isLight ? "text-slate-500" : "text-gray-500"}`}>Grand Total</span>
                    <span className="text-sky-600 font-black text-sm">{currencySymbol} {foundReceipt.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Itemized Table */}
                <div className="space-y-2">
                  <h4 className={`text-xs font-bold uppercase tracking-wider font-sans flex items-center gap-1.5 ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}>
                    <ShoppingBag size={14} className="text-sky-500" /> Itemized Purchased Products
                  </h4>
                  <div className={`rounded-2xl overflow-hidden border ${
                    isLight ? "border-slate-200 bg-white" : "border-brand-dark-border/60 bg-black/40"
                  }`}>
                    <div className={`divide-y ${isLight ? "divide-slate-100" : "divide-brand-dark-border/40"}`}>
                      {foundReceipt.items.map((item, idx) => (
                        <div key={idx} className="p-3.5 flex justify-between items-center text-xs font-sans">
                          <div>
                            <p className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{item.productName}</p>
                            <p className={`text-[10px] font-mono mt-0.5 ${isLight ? "text-slate-500" : "text-gray-500"}`}>
                              Qty: <span className={`font-bold ${isLight ? "text-slate-800" : "text-white"}`}>{item.qty}</span> × {currencySymbol} {item.price.toLocaleString()}
                            </p>
                          </div>
                          <span className="font-mono font-bold text-emerald-600 text-sm">
                            {currencySymbol} {item.subtotal.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Breakdown Totals */}
                    <div className={`p-4 border-t flex flex-col items-end gap-1.5 font-mono text-xs ${
                      isLight ? "bg-slate-50 border-slate-200" : "bg-black/80 border-brand-dark-border/60"
                    }`}>
                      <div className="flex justify-between w-full sm:max-w-[240px]">
                        <span className={isLight ? "text-slate-600 font-medium" : "text-gray-400"}>Subtotal:</span>
                        <span className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{currencySymbol} {(foundReceipt.subtotal || foundReceipt.total).toLocaleString()}</span>
                      </div>
                      {foundReceipt.discount > 0 && (
                        <div className="flex justify-between w-full sm:max-w-[240px] text-emerald-600 font-bold">
                          <span>Discount:</span>
                          <span>-{currencySymbol} {foundReceipt.discount.toLocaleString()}</span>
                        </div>
                      )}
                      {foundReceipt.tax > 0 && (
                        <div className={`flex justify-between w-full sm:max-w-[240px] ${isLight ? "text-slate-600" : "text-gray-400"}`}>
                          <span>Tax:</span>
                          <span className={isLight ? "text-slate-900 font-bold" : "text-white"}>+{currencySymbol} {foundReceipt.tax.toLocaleString()}</span>
                        </div>
                      )}
                      <div className={`flex justify-between w-full sm:max-w-[240px] border-t pt-2 text-sm font-black ${
                        isLight ? "border-slate-200 text-slate-900" : "border-brand-dark-border/60 text-white"
                      }`}>
                        <span>Grand Total Paid:</span>
                        <span className="text-emerald-600">{currencySymbol} {foundReceipt.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Split Payment details if present */}
                {foundReceipt.splitPayments && Object.keys(foundReceipt.splitPayments).length > 0 && (
                  <div className={`p-4 rounded-xl border space-y-2 ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-black/40 border-brand-dark-border/60"
                  }`}>
                    <p className={`text-[10px] uppercase font-bold font-sans ${isLight ? "text-slate-600" : "text-gray-400"}`}>Payment Channel Breakdown:</p>
                    <div className="flex flex-wrap gap-2 font-mono text-xs">
                      {Object.entries(foundReceipt.splitPayments).map(([mode, amt]) => (
                        <span key={mode} className={`px-3 py-1 rounded-lg border ${
                          isLight ? "bg-white border-slate-300 text-slate-800" : "bg-brand-dark-surface border-brand-dark-border"
                        }`}>
                          {mode}: <strong className="text-emerald-600">{currencySymbol} {amt.toLocaleString()}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Registered Customer Portal Guide Card */}
                {(() => {
                  const custObj = customers.find(c => c.name.toLowerCase() === (foundReceipt.customerName || "").toLowerCase());
                  return (
                    <div className={`rounded-2xl p-5 mt-6 border shadow-md text-xs space-y-3 font-sans ${
                      isLight
                        ? "bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 border-sky-200 text-slate-800"
                        : "bg-gradient-to-r from-sky-950/40 via-purple-950/30 to-black border-sky-500/30"
                    }`}>
                      <div className={`flex items-center gap-2 font-black uppercase tracking-wider text-xs ${
                        isLight ? "text-sky-700" : "text-sky-400"
                      }`}>
                        <Sparkles size={16} />
                        <span>Registered Customer Account Portal Guide</span>
                      </div>
                      <p className={`leading-relaxed ${isLight ? "text-slate-700 font-medium" : "text-gray-300"}`}>
                        Dear Customer (<b className={isLight ? "text-slate-900" : "text-white"}>{foundReceipt.customerName || "Valued Customer"}</b> - <b className={`font-mono ${isLight ? "text-sky-700" : "text-sky-300"}`}>{custObj ? maskPhone(custObj.mobile) : "0300****567"}</b>), your purchase receipt is verified!
                      </p>
                      <div className={`p-3.5 rounded-xl border space-y-1.5 text-[11px] ${
                        isLight ? "bg-white border-sky-200 text-slate-700 shadow-xs" : "bg-black/60 border-brand-dark-border text-gray-300"
                      }`}>
                        <div className={`font-bold flex items-center gap-1.5 ${isLight ? "text-purple-700" : "text-purple-400"}`}>
                          <span>📱 How to view your complete purchase ledger, credit dues &amp; past receipts online:</span>
                        </div>
                        <ol className={`list-decimal list-inside space-y-1 pl-1 ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
                          <li>Click on the <b>Customer Account</b> tab above on this portal.</li>
                          <li>Enter your registered mobile number: <b className="text-sky-600 font-mono">{custObj ? maskPhone(custObj.mobile) : "0300****567"}</b> (or Customer ID: <b className="text-purple-600 font-mono">{custObj?.customerNo || "CUST-VERIFIED"}</b>).</li>
                          <li>Click <b>Access Customer Ledger</b> to view your entire transaction history, return records, and remaining balance anytime 24/7!</li>
                        </ol>
                      </div>
                    </div>
                  );
                })()}

              </div>
            </div>
          )}

          {/* 🧾 RESULT A-2: SAAS INVOICE LOOKUP RESULT (e.g. INV-2026-5408) */}
          {hasSearched && searchMode === "receipt" && foundSaasInvoice && (
            <div className="space-y-6 animate-fade-in-up text-left">
              <div className={`rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6 transition-all ${
                isLight ? "bg-white border-slate-200 shadow-slate-200/60 text-slate-900" : "bg-brand-dark-surface border-sky-500/40 shadow-2xl text-white"
              }`}>
                
                {/* Header Row */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b ${
                  isLight ? "border-slate-200" : "border-brand-dark-border/80"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${
                      isLight ? "bg-sky-50 border-sky-200 text-sky-600 shadow-xs" : "bg-sky-500/15 border-sky-500/30 text-sky-400"
                    }`}>
                      <Receipt size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-sky-600 uppercase">OFFICIAL SAAS BILLING STATEMENT</span>
                        <span className={`font-mono text-[9px] px-2.5 py-0.5 rounded font-black border uppercase ${
                          foundSaasInvoice.status === "Paid"
                            ? isLight ? "bg-emerald-100 border-emerald-300 text-emerald-800" : "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                            : isLight ? "bg-amber-100 border-amber-300 text-amber-800" : "bg-amber-500/15 border-amber-500/40 text-amber-300"
                        }`}>
                          STATUS: {foundSaasInvoice.status}
                        </span>
                      </div>
                      <h2 className={`text-xl sm:text-2xl font-black font-mono mt-0.5 ${isLight ? "text-slate-900" : "text-white"}`}>{foundSaasInvoice.id}</h2>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePrintSaasSlip(foundSaasInvoice)}
                    className="inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-sky-500/20 cursor-pointer"
                  >
                    <Printer size={15} />
                    <span>Print / Save Executive Invoice</span>
                  </button>
                </div>

                {/* Billed Provider & Client Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                  <div className={`p-4 rounded-xl border space-y-1 ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-black/50 border-brand-dark-border/80 text-white"
                  }`}>
                    <div className="text-[10px] uppercase font-bold text-sky-600">🏢 BILLED PROVIDER</div>
                    <div className={`font-black text-sm ${isLight ? "text-slate-900" : "text-white"}`}>MT Core Software Suite</div>
                    <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>The core technology behind your business.</div>
                    <div className={`text-[11px] leading-relaxed ${isLight ? "text-slate-600" : "text-gray-400"}`}>
                      Engineered by Founder <b>Mian Talal</b><br/>
                      Support Contact: <b>03396399895</b><br/>
                      Corporate Email: <b>miantalal2@gmail.com</b><br/>
                      Official Portal: <b className="text-sky-600 font-mono">pos.mtcore.xyz</b>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border space-y-1 ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-black/50 border-brand-dark-border/80 text-white"
                  }`}>
                    <div className="text-[10px] uppercase font-bold text-sky-600">👤 CLIENT / TENANT INFORMATION</div>
                    <div className={`font-black text-sm ${isLight ? "text-slate-900" : "text-white"}`}>{foundSaasInvoice.tenantName}</div>
                    <div className={`text-[11px] leading-relaxed ${isLight ? "text-slate-600" : "text-gray-400"}`}>
                      Workspace / Tenant ID: <b className="text-sky-600 font-mono">{foundSaasInvoice.tenantId}</b><br/>
                      {(() => {
                        const tObj = tenants.find(t => t.id === foundSaasInvoice.tenantId);
                        return (
                          <>
                            Owner Name: <b>{tObj?.ownerName || foundSaasInvoice.tenantName}</b><br/>
                            Registered Phone: <b className="text-amber-600 font-mono">{maskPhone(tObj?.phone || "03001234567")}</b><br/>
                          </>
                        );
                      })()}
                      Issued Date: <b>{foundSaasInvoice.date}</b><br/>
                      Status: <b className="text-emerald-600">Active</b>
                    </div>
                  </div>
                </div>

                {/* Financial Details Table */}
                <div className={`rounded-xl overflow-hidden border text-xs font-sans ${
                  isLight ? "border-slate-200 bg-white" : "border-brand-dark-border/80 bg-black/40"
                }`}>
                  <div className={`p-3 font-bold uppercase text-[10px] ${
                    isLight ? "bg-slate-100 text-slate-700" : "bg-black/80 text-gray-300"
                  }`}>BILLED PACKAGE &amp; PAYMENT BREAKDOWN</div>
                  <div className="p-4 space-y-3 font-mono">
                    <div className="flex justify-between items-center text-sm">
                      <span className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{foundSaasInvoice.plan}</span>
                      <span className="text-sky-600 font-black">
                        {foundSaasInvoice.currency || "PKR"} {foundSaasInvoice.amount.toLocaleString()}
                      </span>
                    </div>
                    <hr className={isLight ? "border-slate-200" : "border-brand-dark-border/60"} />
                    <div className={`flex justify-between text-xs ${isLight ? "text-slate-600" : "text-gray-400"}`}>
                      <span>Total Bill Amount:</span>
                      <span className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{foundSaasInvoice.currency || "PKR"} {foundSaasInvoice.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-emerald-600 font-bold">
                      <span>Amount Paid / Received:</span>
                      <span>{foundSaasInvoice.currency || "PKR"} {(foundSaasInvoice.paidAmount ?? (foundSaasInvoice.status === "Paid" ? foundSaasInvoice.amount : 0)).toLocaleString()}</span>
                    </div>
                    <div className={`flex justify-between text-sm text-sky-600 font-black pt-1 border-t ${
                      isLight ? "border-slate-200" : "border-brand-dark-border/60"
                    }`}>
                      <span>Remaining Balance Due:</span>
                      <span>{foundSaasInvoice.currency || "PKR"} {(foundSaasInvoice.remainingBalance ?? 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Registered Tenant Guide Card */}
                <div className={`rounded-2xl p-5 border shadow-md text-xs space-y-3 font-sans ${
                  isLight
                    ? "bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 border-sky-200 text-slate-800"
                    : "bg-gradient-to-r from-sky-950/40 via-purple-950/30 to-black border-sky-500/30"
                }`}>
                  <div className={`flex items-center gap-2 font-black uppercase tracking-wider text-xs ${
                    isLight ? "text-sky-700" : "text-sky-400"
                  }`}>
                    <Sparkles size={16} />
                    <span>Registered Tenant Online Portal Guide</span>
                  </div>
                  <p className={`leading-relaxed ${isLight ? "text-slate-700 font-medium" : "text-gray-300"}`}>
                    Dear Tenant (<b className={isLight ? "text-slate-900" : "text-white"}>{foundSaasInvoice.tenantName}</b> - <b className={`font-mono ${isLight ? "text-sky-700" : "text-sky-300"}`}>{(() => { const t = tenants.find(x => x.id === foundSaasInvoice.tenantId); return maskPhone(t?.phone || "03001234567"); })()}</b>), your SaaS subscription invoice &amp; workspace are active!
                  </p>
                  <div className={`p-3.5 rounded-xl border space-y-1.5 text-[11px] ${
                    isLight ? "bg-white border-sky-200 text-slate-700 shadow-xs" : "bg-black/60 border-brand-dark-border text-gray-300"
                  }`}>
                    <div className={`font-bold flex items-center gap-1.5 ${isLight ? "text-purple-700" : "text-purple-400"}`}>
                      <span>🌐 Direct Access to Software &amp; Invoice History:</span>
                    </div>
                    <ol className={`list-decimal list-inside space-y-1 pl-1 ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
                      <li>Log in to your POS &amp; ERP Portal: <a href="https://pos.mtcore.xyz/login" target="_blank" rel="noreferrer" className="text-sky-600 underline font-bold">https://pos.mtcore.xyz/login</a></li>
                      <li>Use your Workspace Tenant ID <b className={`font-mono ${isLight ? "text-sky-700" : "text-sky-300"}`}>{foundSaasInvoice.tenantId}</b> &amp; registered credentials.</li>
                      <li>To check past invoices anytime, search invoice ID <b className={`font-mono ${isLight ? "text-purple-700" : "text-purple-300"}`}>{foundSaasInvoice.id}</b> in Receipt Lookup above!</li>
                    </ol>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 👤 RESULT B: CUSTOMER ACCOUNT LEDGER & HISTORY PORTAL */}
          {hasSearched && searchMode === "customer" && foundCustomer && (
            <div className="space-y-6 animate-fade-in-up text-left">
              
              {/* Customer Profile Summary Header */}
              <div className={`rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6 transition-all ${
                isLight ? "bg-white border-slate-200 shadow-slate-200/60 text-slate-900" : "bg-brand-dark-surface border-brand-dark-border shadow-2xl sky-glow text-white"
              }`}>
                <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b ${
                  isLight ? "border-slate-200" : "border-brand-dark-border/60"
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center font-black text-2xl font-sans shrink-0 ${
                      isLight ? "bg-sky-50 border-sky-200 text-sky-600 shadow-xs" : "bg-brand-sky/15 border-brand-sky/30 text-brand-sky"
                    }`}>
                      {foundCustomer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className={`text-xl sm:text-2xl font-black font-sans ${isLight ? "text-slate-900" : "text-white"}`}>{foundCustomer.name}</h2>
                        <span className={`font-mono text-[9px] px-2.5 py-0.5 rounded-full font-bold border ${
                          isLight ? "bg-emerald-100 border-emerald-300 text-emerald-800" : "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                        }`}>
                          VERIFIED CUSTOMER
                        </span>
                      </div>
                      <div className={`flex flex-wrap items-center gap-2 mt-1.5 text-xs font-mono ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                        <span className={`font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                          isLight ? "bg-sky-50 border-sky-200 text-sky-700" : "bg-brand-sky/10 border-brand-sky/30 text-brand-sky"
                        }`}>
                          <Hash size={11} /> {foundCustomer.customerNo || "CUST-VERIFIED"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone size={12} className={isLight ? "text-slate-400" : "text-gray-500"} /> {foundCustomer.mobile || "0300-0000000"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className={`p-3 rounded-xl border text-center ${
                      isLight ? "bg-slate-50 border-slate-200" : "bg-black/50 border-brand-dark-border/60"
                    }`}>
                      <p className={`text-[9px] uppercase font-semibold mb-0.5 font-sans ${isLight ? "text-slate-500" : "text-gray-500"}`}>Loyalty Points</p>
                      <p className={`font-mono font-black text-sm ${isLight ? "text-amber-600" : "text-yellow-400"}`}>{foundCustomer.loyaltyPoints || 0} pts</p>
                    </div>
                    <div className={`p-3 rounded-xl border text-center ${
                      isLight ? "bg-slate-50 border-slate-200" : "bg-black/50 border-brand-dark-border/60"
                    }`}>
                      <p className={`text-[9px] uppercase font-semibold mb-0.5 font-sans ${isLight ? "text-slate-500" : "text-gray-500"}`}>Wallet Balance</p>
                      <p className={`font-mono font-black text-sm ${isLight ? "text-sky-600" : "text-brand-sky"}`}>{currencySymbol} {(foundCustomer.walletBalance || 0).toLocaleString()}</p>
                    </div>
                    <div className={`p-3 rounded-xl border text-center col-span-2 sm:col-span-1 ${
                      isLight ? "bg-slate-50 border-slate-200" : "bg-black/50 border-brand-dark-border/60"
                    }`}>
                      <p className={`text-[9px] uppercase font-semibold mb-0.5 font-sans ${isLight ? "text-slate-500" : "text-gray-500"}`}>Credit Dues (Udhar)</p>
                      <p className={`font-mono font-black text-sm ${foundCustomer.creditBalance > 0 ? (isLight ? "text-rose-600 animate-pulse" : "text-red-400 animate-pulse") : (isLight ? "text-emerald-600" : "text-emerald-400")}`}>
                        {currencySymbol} {(foundCustomer.creditBalance || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Outstanding Credit Alert */}
                {foundCustomer.creditBalance > 0 ? (
                  <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                    isLight ? "bg-rose-50 border-rose-200 text-rose-900" : "bg-red-500/10 border-red-500/30 text-gray-300"
                  }`}>
                    <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                    <div className="text-xs font-sans leading-relaxed">
                      <span className={`font-bold ${isLight ? "text-rose-950" : "text-red-400"}`}>Outstanding Udhar Balance:</span> You currently have a pending credit balance of <strong className={`font-mono ${isLight ? "text-slate-900 font-black" : "text-white"}`}>{currencySymbol} {foundCustomer.creditBalance.toLocaleString()}</strong>. Please visit the store counter to clear your dues.
                    </div>
                  </div>
                ) : (
                  <div className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs font-sans ${
                    isLight ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  }`}>
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>All Credit Dues Cleared! Your account is in excellent standing.</span>
                  </div>
                )}
              </div>

              {/* Sub-Tabs Navigation for Customer Portal */}
              <div className={`rounded-3xl border overflow-hidden shadow-xl ${
                isLight ? "bg-white border-slate-200" : "bg-brand-dark-surface border-brand-dark-border"
              }`}>
                <div className={`flex border-b ${isLight ? "border-slate-200 bg-slate-50" : "border-brand-dark-border bg-black/40"}`}>
                  <button
                    type="button"
                    onClick={() => setCustSubTab("purchases")}
                    className={`flex-1 py-4 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center justify-center gap-2 cursor-pointer ${
                      custSubTab === "purchases"
                        ? isLight ? "border-sky-500 text-sky-600 bg-sky-50/70 font-black" : "border-brand-sky text-brand-sky bg-brand-sky/5 font-black"
                        : isLight ? "border-transparent text-slate-600 hover:text-slate-900" : "border-transparent text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    <ShoppingBag size={14} />
                    <span>Purchase History</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustSubTab("returns")}
                    className={`flex-1 py-4 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center justify-center gap-2 cursor-pointer ${
                      custSubTab === "returns"
                        ? isLight ? "border-sky-500 text-sky-600 bg-sky-50/70 font-black" : "border-brand-sky text-brand-sky bg-brand-sky/5 font-black"
                        : isLight ? "border-transparent text-slate-600 hover:text-slate-900" : "border-transparent text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    <RotateCcw size={14} />
                    <span>Returns &amp; Refunds</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustSubTab("credit")}
                    className={`flex-1 py-4 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center justify-center gap-2 cursor-pointer ${
                      custSubTab === "credit"
                        ? isLight ? "border-sky-500 text-sky-600 bg-sky-50/70 font-black" : "border-brand-sky text-brand-sky bg-brand-sky/5 font-black"
                        : isLight ? "border-transparent text-slate-600 hover:text-slate-900" : "border-transparent text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    <CreditCard size={14} />
                    <span>Udhar &amp; Recovery Ledger</span>
                  </button>
                </div>

                {/* Sub-Tab 1: Purchases */}
                {custSubTab === "purchases" && (
                  <div className="p-6 space-y-4">
                    {(() => {
                      const custSales = sales
                        .filter(s => s.customerNo === foundCustomer.customerNo || s.customerName === foundCustomer.name)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                      if (custSales.length === 0) {
                        return (
                          <div className={`text-center py-12 text-xs font-sans ${isLight ? "text-slate-500" : "text-gray-500"}`}>
                            No purchases recorded for this customer account yet.
                          </div>
                        );
                      }

                      return custSales.map((sale) => {
                        const isExpanded = !!expandedSales[sale.id];
                        return (
                          <div key={sale.id} className={`rounded-2xl border overflow-hidden text-left transition-all ${
                            isLight ? "border-slate-200 bg-white shadow-xs" : "border-brand-dark-border/60 bg-black/40"
                          }`}>
                            <div
                              onClick={() => toggleSaleExpand(sale.id)}
                              className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition ${
                                isLight ? "hover:bg-slate-50" : "hover:bg-brand-dark-surface/40"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                                  isLight ? "bg-sky-50 border-sky-200 text-sky-600" : "bg-brand-sky/10 border-brand-sky/30 text-brand-sky"
                                }`}>
                                  <ShoppingBag size={16} />
                                </div>
                                <div>
                                  <p className={`font-mono font-black text-xs flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                                    {sale.receiptNumber}
                                    <span className={`text-[9px] px-2 py-0.5 rounded font-sans border ${
                                      isLight ? "bg-slate-100 border-slate-200 text-slate-700" : "bg-brand-dark-surface border-brand-dark-border text-gray-400"
                                    }`}>
                                      {sale.paymentMethod}
                                    </span>
                                  </p>
                                  <p className={`text-[10px] mt-0.5 font-sans ${isLight ? "text-slate-500 font-medium" : "text-gray-500"}`}>
                                    {new Date(sale.date).toLocaleString(undefined, {
                                      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
                                    })}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-5">
                                <div className="text-right font-mono">
                                  <span className="text-emerald-600 font-black text-sm block">
                                    {currencySymbol} {sale.total.toLocaleString()}
                                  </span>
                                  <span className={`text-[9px] ${isLight ? "text-slate-500 font-medium" : "text-gray-500"}`}>{sale.items.length} item(s)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handlePrintSlip(sale); }}
                                    className={`p-1.5 rounded-lg border transition ${
                                      isLight ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200" : "bg-black border-brand-dark-border text-gray-400 hover:text-white"
                                    }`}
                                    title="Print Digital Slip"
                                  >
                                    <Printer size={13} />
                                  </button>
                                  <button type="button" className={`p-1.5 rounded-lg border transition ${
                                    isLight ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200" : "bg-black border-brand-dark-border text-gray-400 hover:text-white"
                                  }`}>
                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Itemized Drilldown */}
                            {isExpanded && (
                              <div className={`px-4 pb-4 pt-2 border-t text-xs space-y-3 font-sans ${
                                isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "border-brand-dark-border/50 bg-black/20 text-gray-300"
                              }`}>
                                <div className={`divide-y ${isLight ? "divide-slate-200" : "divide-brand-dark-border/40"}`}>
                                  {sale.items.map((it, idx) => (
                                    <div key={idx} className="py-2.5 flex justify-between items-center">
                                      <div>
                                        <p className={`font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>{it.productName}</p>
                                        <p className={`text-[10px] font-mono ${isLight ? "text-slate-500" : "text-gray-500"}`}>x{it.qty} @ {currencySymbol} {it.price.toLocaleString()}</p>
                                      </div>
                                      <span className={`font-mono font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{currencySymbol} {it.subtotal.toLocaleString()}</span>
                                    </div>
                                  ))}
                                </div>

                                <div className={`border-t pt-2 flex flex-col items-end gap-1 font-mono text-xs ${
                                  isLight ? "border-slate-200" : "border-brand-dark-border/40"
                                }`}>
                                  <div className="flex justify-between w-full sm:max-w-[200px]">
                                    <span className={isLight ? "text-slate-600 font-medium" : "text-gray-400"}>Total:</span>
                                    <span className="text-emerald-600 font-bold">{currencySymbol} {sale.total.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}

                {/* Sub-Tab 2: Returns & Refunds */}
                {custSubTab === "returns" && (
                  <div className="p-6 space-y-4">
                    {(() => {
                      const returnsList = sales.filter(
                        s => (s.customerNo === foundCustomer.customerNo || s.customerName === foundCustomer.name) &&
                        (s.status === "Returned" || s.status === "Refunded")
                      );

                      if (returnsList.length === 0) {
                        return (
                          <div className={`text-center py-12 text-xs font-sans ${isLight ? "text-slate-500" : "text-gray-500"}`}>
                            No return or refund records found for this customer.
                          </div>
                        );
                      }

                      return returnsList.map(ret => (
                        <div key={ret.id} className={`p-4 rounded-2xl border flex justify-between items-center font-sans text-xs ${
                          isLight ? "border-rose-200 bg-rose-50/60" : "border-red-500/20 bg-red-500/5"
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isLight ? "bg-rose-100 text-rose-700" : "bg-red-500/15 text-red-400"
                            }`}>
                              <RotateCcw size={15} />
                            </div>
                            <div>
                              <p className={`font-mono font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{ret.receiptNumber}</p>
                              <p className={`text-[10px] mt-0.5 ${isLight ? "text-slate-500 font-medium" : "text-gray-400"}`}>
                                {new Date(ret.date).toLocaleDateString()} · {ret.items.length} item(s) refunded
                              </p>
                            </div>
                          </div>
                          <div className="text-right font-mono">
                            <span className="text-rose-600 font-black text-sm block">-{currencySymbol} {ret.total.toLocaleString()}</span>
                            <span className={`text-[9px] uppercase font-bold ${isLight ? "text-rose-700" : "text-red-300"}`}>{ret.status}</span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}

                {/* Sub-Tab 3: Udhar & Recovery Statement */}
                {custSubTab === "credit" && (
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                      <div className={`p-4 rounded-xl border ${
                        isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-black/40 border-brand-dark-border/60 text-white"
                      }`}>
                        <span className={`text-[9px] uppercase font-bold block mb-1 ${isLight ? "text-slate-500" : "text-gray-500"}`}>Total Credit Taken</span>
                        {(() => {
                          const creditSales = sales.filter(
                            s => (s.customerNo === foundCustomer.customerNo || s.customerName === foundCustomer.name) &&
                            (s.paymentMethod === "On Credit" || (s.splitPayments && (s.splitPayments["On Credit"] || 0) > 0))
                          );
                          const totalCredit = creditSales.reduce((sum, s) => sum + (s.splitPayments ? (s.splitPayments["On Credit"] || 0) : s.total), 0);
                          return <span className={`text-xl font-mono font-black ${isLight ? "text-slate-900" : "text-white"}`}>{currencySymbol} {totalCredit.toLocaleString()}</span>;
                        })()}
                      </div>

                      <div className={`p-4 rounded-xl border ${
                        isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-black/40 border-brand-dark-border/60 text-white"
                      }`}>
                        <span className={`text-[9px] uppercase font-bold block mb-1 ${isLight ? "text-slate-500" : "text-gray-500"}`}>Total Udhar Recovered</span>
                        {(() => {
                          const totalRecovered = (foundCustomer.dueRecoveryHistory || []).reduce((sum: number, r: any) => sum + r.amount, 0);
                          return <span className="text-xl font-mono font-black text-emerald-600">{currencySymbol} {totalRecovered.toLocaleString()}</span>;
                        })()}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-3">
                      <h4 className={`text-xs font-bold uppercase tracking-wider font-sans ${isLight ? "text-slate-900" : "text-white"}`}>Account Statement Ledger History</h4>
                      {(() => {
                        const creditEvents = sales
                          .filter(
                            s => (s.customerNo === foundCustomer.customerNo || s.customerName === foundCustomer.name) &&
                            (s.paymentMethod === "On Credit" || (s.splitPayments && (s.splitPayments["On Credit"] || 0) > 0))
                          )
                          .map(s => ({
                            type: "credit_charge",
                            date: s.date,
                            receipt: s.receiptNumber,
                            amount: s.splitPayments ? (s.splitPayments["On Credit"] || 0) : s.total
                          }));

                        const recoveryEvents = (foundCustomer.dueRecoveryHistory || []).map((r: any) => ({
                          type: "recovery_payment",
                          date: r.date,
                          receipt: "Dues Settlement",
                          amount: r.amount
                        }));

                        const timeline = [...creditEvents, ...recoveryEvents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                        if (timeline.length === 0) {
                          return <div className={`text-center py-10 text-xs font-sans ${isLight ? "text-slate-500" : "text-gray-500"}`}>No credit ledger history found.</div>;
                        }

                        return (
                          <div className={`rounded-xl divide-y overflow-hidden border text-xs font-sans ${
                            isLight ? "border-slate-200 bg-white divide-slate-100 shadow-xs" : "border-brand-dark-border/60 bg-black/30 divide-brand-dark-border/40"
                          }`}>
                            {timeline.map((ev, idx) => {
                              const isCharge = ev.type === "credit_charge";
                              return (
                                <div key={idx} className="p-3.5 flex justify-between items-center">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                      isCharge
                                        ? isLight ? "bg-rose-100 text-rose-600" : "bg-red-500/10 text-red-400"
                                        : isLight ? "bg-emerald-100 text-emerald-600" : "bg-emerald-500/10 text-emerald-400"
                                    }`}>
                                      <CreditCard size={15} />
                                    </div>
                                    <div>
                                      <p className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{isCharge ? `Udhar Charge (${ev.receipt})` : "Credit Dues Settlement Payment"}</p>
                                      <p className={`text-[10px] mt-0.5 ${isLight ? "text-slate-500" : "text-gray-500"}`}>{new Date(ev.date).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                  <div className="text-right font-mono">
                                    <span className={`font-black text-sm ${isCharge ? "text-rose-600" : "text-emerald-600"}`}>
                                      {isCharge ? "+" : "-"}{currencySymbol} {ev.amount.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* 🎫 RESULT C: SUPPORT TICKET & DEMO TRACKER RESULT */}
          {hasSearched && searchMode === "ticket" && foundTicket && (
            <div className="space-y-6 animate-fade-in-up text-left">
              <div className={`rounded-3xl p-6 sm:p-8 border shadow-xl transition-all ${
                isLight ? "bg-white border-slate-200 shadow-slate-200/60 text-slate-900" : "bg-brand-dark-surface border-brand-dark-border shadow-2xl sky-glow text-white"
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                  <div>
                    <p className={`text-[10px] uppercase tracking-widest mb-1 font-bold ${isLight ? "text-slate-500" : "text-gray-500"}`}>
                      {foundTicketType === "demo" ? "Demo Ticket Number" : "Support Ticket Number"}
                    </p>
                    <p className="text-2xl sm:text-3xl font-black font-mono text-sky-500 tracking-wider">
                      {foundTicketType === "demo" ? foundTicket.ticketNumber : foundTicket.ticketNumber}
                    </p>
                    {foundTicketType === "support" && (
                      <p className={`text-sm font-bold mt-2 ${isLight ? "text-slate-900" : "text-white"}`}>{foundTicket.subject}</p>
                    )}
                  </div>
                  {foundTicketType === "demo" ? (
                    <StatusBadge status={foundTicket.status} />
                  ) : (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[10px] font-black tracking-widest uppercase ${
                      isLight ? "bg-sky-100 text-sky-800 border-sky-300" : "bg-blue-500/15 text-blue-400 border-blue-500/40"
                    }`}>
                      {foundTicket.status}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-sm">
                  <div className={`p-4 rounded-xl border ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-black/40 border-brand-dark-border/60 text-white"
                  }`}>
                    <p className={`text-[10px] uppercase font-bold mb-1 tracking-wide ${isLight ? "text-slate-500" : "text-gray-500"}`}>Business</p>
                    <p className={`font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>{foundTicket.businessName}</p>
                  </div>
                  <div className={`p-4 rounded-xl border ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-black/40 border-brand-dark-border/60 text-white"
                  }`}>
                    <p className={`text-[10px] uppercase font-bold mb-1 tracking-wide ${isLight ? "text-slate-500" : "text-gray-500"}`}>Contact / Category</p>
                    <p className={`font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>{foundTicketType === "demo" ? foundTicket.name : foundTicket.category}</p>
                  </div>
                  <div className={`p-4 rounded-xl border ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-black/40 border-brand-dark-border/60 text-white"
                  }`}>
                    <p className={`text-[10px] uppercase font-bold mb-1 tracking-wide ${isLight ? "text-slate-500" : "text-gray-500"}`}>Submitted</p>
                    <p className={`font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
                      {new Date(foundTicket.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                </div>

                {foundTicketType === "demo" && (
                  <div className="mb-2">
                    <p className={`text-[10px] uppercase font-bold mb-3 tracking-wide ${isLight ? "text-slate-500" : "text-gray-500"}`}>Request Progress</p>
                    <StatusTimeline status={foundTicket.status} />
                  </div>
                )}
              </div>

              {/* Chat Panel */}
              <div className={`rounded-3xl border overflow-hidden shadow-xl ${
                isLight ? "bg-white border-slate-200" : "bg-brand-dark-surface border-brand-dark-border"
              }`}>
                <div className={`flex items-center gap-3 px-6 py-4 border-b ${
                  isLight ? "border-slate-200 bg-slate-50 text-slate-900" : "border-brand-dark-border text-white"
                }`}>
                  <MessageCircle size={18} className="text-sky-500" />
                  <p className="font-bold text-sm">Support Chat</p>
                </div>
                <div className={`px-5 py-4 space-y-4 max-h-80 overflow-y-auto ${
                  isLight ? "bg-slate-50/50" : "bg-black/30"
                }`}>
                  {(foundTicketType === "demo" ? foundTicket.messages : foundTicket.replies).map((msg: any, idx: number) => (
                    <ChatBubble key={idx} sender={msg.sender} message={msg.message} date={msg.date} />
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className={`px-5 pb-5 pt-3 border-t space-y-3 ${
                  isLight ? "border-slate-200 bg-white" : "border-brand-dark-border/50 bg-brand-dark-surface"
                }`}>
                  <textarea
                    rows={3}
                    placeholder="Type your message here…"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className={`w-full p-3.5 rounded-xl text-sm focus:outline-none resize-none transition border ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-sky-500"
                        : "bg-black border-brand-dark-border text-white placeholder-gray-600 focus:border-brand-sky"
                    }`}
                  />
                  <div className="flex items-center justify-between">
                    <p className={`text-[10px] ${isLight ? "text-slate-500 font-medium" : "text-gray-600"}`}>Press Ctrl+Enter to send</p>
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                      <Send size={13} />
                      <span>Send Message</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
