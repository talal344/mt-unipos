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
  return (local ? local.slice(0, 4) : "user") + "***@" + (domain || "unipos.com");
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

// ─── Main Self-Service & Ticket Portal Page ──────────────────────────────────
export default function TrackTicketPage() {
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
    businessSettings
  } = useGlobalContext();

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

  // Execute Search
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setHasSearched(true);
    setAuthError(null);
    setFoundReceipt(null);
    setFoundCustomer(null);
    setFoundTicket(null);
    setFoundTicketType(null);

    if (searchMode === "receipt") {
      const query = receiptInput.trim().toLowerCase();
      if (!query) return;
      const match = sales.find(
        (s) =>
          s.receiptNumber.toLowerCase() === query ||
          s.id.toLowerCase() === query
      );
      setFoundReceipt(match || null);
    } else if (searchMode === "customer") {
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
      const query = ticketInput.trim();
      if (!query) return;
      const demoMatch = demoRequests.find((r) => r.ticketNumber.toLowerCase() === query.toLowerCase());
      const suppMatch = supportTickets.find(
        (r) => (r.ticketNumber && r.ticketNumber.toLowerCase() === query.toLowerCase()) || r.id.toLowerCase() === query.toLowerCase()
      );

      if (demoMatch) {
        setFoundTicket(demoMatch);
        setFoundTicketType("demo");
      } else if (suppMatch) {
        setFoundTicket(suppMatch);
        setFoundTicketType("support");
      }
    }
  };

  // Preset Quick Demo Chips
  const handleQuickDemo = (mode: "receipt" | "customer" | "ticket") => {
    setSearchMode(mode);
    if (mode === "receipt") {
      const sampleSale = sales[0];
      const rNo = sampleSale ? sampleSale.receiptNumber : "MT-TXN-0908260005";
      setReceiptInput(rNo);
      setTimeout(() => {
        const match = sales.find((s) => s.receiptNumber.toLowerCase() === rNo.toLowerCase() || s.id.toLowerCase() === rNo.toLowerCase()) || sampleSale;
        setFoundReceipt(match || null);
        setHasSearched(true);
      }, 50);
    } else if (mode === "customer") {
      const sampleCust = customers.find(c => c.customerNo && c.customerNo !== "N/A") || customers[0];
      if (sampleCust) {
        setCustNoInput(sampleCust.customerNo || "CUST-7294");
        setPhoneInput(sampleCust.mobile || "03215550100");
        setTimeout(() => {
          setFoundCustomer(sampleCust);
          setHasSearched(true);
        }, 50);
      }
    } else if (mode === "ticket") {
      const sampleTkt = demoRequests[0] ? demoRequests[0].ticketNumber : "TKT-991001-11";
      setTicketInput(sampleTkt);
      setTimeout(() => {
        const demoMatch = demoRequests.find((r) => r.ticketNumber.toLowerCase() === sampleTkt.toLowerCase());
        const suppMatch = supportTickets.find((r) => (r.ticketNumber && r.ticketNumber.toLowerCase() === sampleTkt.toLowerCase()) || r.id.toLowerCase() === sampleTkt.toLowerCase());
        if (demoMatch) {
          setFoundTicket(demoMatch);
          setFoundTicketType("demo");
        } else if (suppMatch) {
          setFoundTicket(suppMatch);
          setFoundTicketType("support");
        }
        setHasSearched(true);
      }, 50);
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
        <td style="padding:4px 0;">${it.productName}<br/><span style="font-size:9px;color:#666;">x${it.qty} @ ${currencySymbol} ${it.unitPrice.toLocaleString()}</span></td>
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
            <h2 style="margin:0;">${businessSettings?.storeName || "MT UNIPOS STORE"}</h2>
            <p style="margin:2px 0;font-size:10px;">${businessSettings?.address || "Official Retail Outlet"}</p>
            <p style="margin:2px 0;font-size:9px;">Ph: ${businessSettings?.phone || "0300-1234567"}</p>
            <div class="line"></div>
            <p class="bold" style="margin:4px 0;">OFFICIAL PURCHASE RECEIPT</p>
            <p style="margin:2px 0;font-size:10px;">Receipt #: ${sale.receiptNumber}</p>
            <p style="margin:2px 0;font-size:9px;">${new Date(sale.date).toLocaleString()}</p>
            <p style="margin:2px 0;font-size:9px;">Customer: ${sale.customerName || "Walk-in Customer"}</p>
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
          <div class="center" style="font-size:9px;margin-top:10px;">
            <p>Thank you for your business!</p>
            <p>Powered by MT UniPOS SaaS ERP</p>
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => printWin.print(), 300);
  };

  return (
    <div className="flex flex-col min-h-screen bg-black font-sans text-gray-100">
      <SiteHeader />

      {/* Hero / Portal Header */}
      <section className="relative py-16 border-b border-brand-dark-border overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.08),transparent_70%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          
          <div className="inline-flex items-center gap-2 bg-brand-sky/10 border border-brand-sky/30 rounded-full px-4 py-1.5 mb-5 shadow-lg shadow-sky-500/10">
            <Sparkles size={14} className="text-brand-sky animate-pulse" />
            <span className="text-xs font-bold text-brand-sky tracking-wide font-sans uppercase">
              Customer Self-Service & Support Portal
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3 font-sans">
            Track Receipt, <span className="text-brand-sky sky-neon-text font-sans">Customer Account</span> & Tickets
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed font-sans">
            Verify purchase receipts, review your full customer purchase ledger & credit dues, or track support ticket status in real-time.
          </p>

          {/* Search Mode Switcher Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-brand-dark-surface/90 border border-brand-dark-border/90 rounded-2xl max-w-xl mx-auto mb-8 shadow-xl">
            <button
              type="button"
              onClick={() => { setSearchMode("receipt"); setHasSearched(false); setAuthError(null); }}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all ${
                searchMode === "receipt"
                  ? "bg-brand-sky text-black shadow-lg shadow-sky-500/25 scale-[1.02]"
                  : "text-gray-400 hover:text-white hover:bg-black/40"
              }`}
            >
              <Receipt size={15} />
              <span>Receipt Lookup</span>
            </button>

            <button
              type="button"
              onClick={() => { setSearchMode("customer"); setHasSearched(false); setAuthError(null); }}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all ${
                searchMode === "customer"
                  ? "bg-brand-sky text-black shadow-lg shadow-sky-500/25 scale-[1.02]"
                  : "text-gray-400 hover:text-white hover:bg-black/40"
              }`}
            >
              <User size={15} />
              <span>Customer Account</span>
            </button>

            <button
              type="button"
              onClick={() => { setSearchMode("ticket"); setHasSearched(false); setAuthError(null); }}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all ${
                searchMode === "ticket"
                  ? "bg-brand-sky text-black shadow-lg shadow-sky-500/25 scale-[1.02]"
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
                <div className="relative flex-1 sky-glow-border rounded-xl overflow-hidden">
                  <Receipt size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Enter Invoice / Receipt # (e.g. MT-TXN-0908260005)"
                    value={receiptInput}
                    onChange={(e) => setReceiptInput(e.target.value)}
                    className="w-full bg-brand-dark-surface pl-10 pr-4 py-3.5 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none font-mono tracking-wider"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-brand-sky hover:bg-sky-400 text-black font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-sky-500/20"
                >
                  <Search size={15} />
                  <span>Search Receipt</span>
                </button>
              </div>
            )}

            {/* Mode B: Customer Account Search (Customer ID + Registered Phone) */}
            {searchMode === "customer" && (
              <div className="space-y-3 bg-brand-dark-surface/80 border border-brand-dark-border/80 p-4 rounded-2xl shadow-2xl">
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold text-brand-sky tracking-wider mb-1 flex items-center gap-1.5">
                    <ShieldCheck size={13} /> Registered Customer Authentication
                  </p>
                  <p className="text-[11px] text-gray-400">Enter your Customer ID and Registered Phone Number to access your full purchase ledger and credit dues statement.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="relative">
                    <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Customer ID (e.g. CUST-7294)"
                      value={custNoInput}
                      onChange={(e) => setCustNoInput(e.target.value)}
                      className="w-full bg-black border border-brand-dark-border/80 pl-9 pr-3 py-3 text-xs text-white placeholder-gray-600 rounded-xl focus:outline-none focus:border-brand-sky font-mono"
                    />
                  </div>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Registered Phone (e.g. 03215550100)"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full bg-black border border-brand-dark-border/80 pl-9 pr-3 py-3 text-xs text-white placeholder-gray-600 rounded-xl focus:outline-none focus:border-brand-sky font-mono"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-brand-sky hover:bg-sky-400 text-black font-black text-xs py-3 rounded-xl transition-all shadow-lg shadow-sky-500/20 uppercase tracking-wider"
                >
                  <Search size={14} />
                  <span>Verify Credentials & Access Ledger</span>
                </button>
              </div>
            )}

            {/* Mode C: Support / Demo Ticket Search */}
            {searchMode === "ticket" && (
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1 sky-glow-border rounded-xl overflow-hidden">
                  <Ticket size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Enter Ticket # (e.g. TKT-991001-11)"
                    value={ticketInput}
                    onChange={(e) => setTicketInput(e.target.value)}
                    className="w-full bg-brand-dark-surface pl-10 pr-4 py-3.5 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none font-mono tracking-wider"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-brand-sky hover:bg-sky-400 text-black font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-sky-500/20"
                >
                  <Search size={15} />
                  <span>Track Ticket</span>
                </button>
              </div>
            )}
          </form>

          {/* Quick Demo Test Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Quick 1-Click Demo:</span>
            <button
              type="button"
              onClick={() => handleQuickDemo("receipt")}
              className="text-[10px] bg-brand-dark-surface border border-brand-dark-border hover:border-brand-sky text-gray-300 hover:text-brand-sky px-2.5 py-1 rounded-lg font-mono transition"
            >
              🧾 Demo Receipt
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("customer")}
              className="text-[10px] bg-brand-dark-surface border border-brand-dark-border hover:border-brand-sky text-gray-300 hover:text-brand-sky px-2.5 py-1 rounded-lg font-mono transition"
            >
              👤 Demo Customer (Talal Ahmad)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("ticket")}
              className="text-[10px] bg-brand-dark-surface border border-brand-dark-border hover:border-brand-sky text-gray-300 hover:text-brand-sky px-2.5 py-1 rounded-lg font-mono transition"
            >
              🎫 Demo Ticket
            </button>
          </div>

        </div>
      </section>

      {/* Main Content Area */}
      <section className="flex-grow py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Initial State / Prompt */}
          {!hasSearched && (
            <div className="text-center py-16 bg-brand-dark-surface/40 border border-brand-dark-border/60 rounded-3xl p-8 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-brand-sky/10 border border-brand-sky/30 text-brand-sky flex items-center justify-center mx-auto mb-4">
                <Receipt size={30} />
              </div>
              <h3 className="text-white font-bold text-base mb-1">Customer Self-Service Search</h3>
              <p className="text-gray-400 text-xs max-w-md mx-auto leading-relaxed">
                Use the search box above to lookup any single receipt invoice, view your complete customer account purchase ledger & credit dues, or track a support ticket.
              </p>
            </div>
          )}

          {/* Authentication / Auth Errors */}
          {hasSearched && authError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center animate-fade-in-up">
              <AlertTriangle size={36} className="text-red-400 mx-auto mb-3" />
              <h3 className="text-red-300 font-bold text-sm mb-1">Authentication Failed</h3>
              <p className="text-gray-300 text-xs">{authError}</p>
              <button
                type="button"
                onClick={() => { setHasSearched(false); setAuthError(null); }}
                className="mt-4 inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-brand-dark-border px-3.5 py-1.5 rounded-lg transition"
              >
                <RefreshCw size={12} /> Retry Search
              </button>
            </div>
          )}

          {/* Record Not Found State */}
          {hasSearched && !authError && !foundReceipt && !foundCustomer && !foundTicket && (
            <div className="bg-brand-dark-surface border border-red-500/30 rounded-2xl p-8 text-center animate-fade-in-up">
              <XCircle size={40} className="text-red-500 mx-auto mb-3" />
              <h3 className="text-white font-bold text-base mb-1">Record Not Found</h3>
              <p className="text-gray-400 text-xs">
                No matching receipt, customer profile, or support ticket was found for your query.
              </p>
              <button
                type="button"
                onClick={() => { setHasSearched(false); }}
                className="mt-5 inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-brand-dark-border px-4 py-2 rounded-lg transition"
              >
                <RefreshCw size={13} /> Clear & Try Again
              </button>
            </div>
          )}

          {/* 🧾 RESULT A: SINGLE DIGITAL RECEIPT LOOKUP RESULT */}
          {hasSearched && searchMode === "receipt" && foundReceipt && (
            <div className="space-y-6 animate-fade-in-up text-left">
              <div className="bg-brand-dark-surface border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl sky-glow space-y-6">
                
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-dark-border/80">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                      <Receipt size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-emerald-400 uppercase">VERIFIED OFFICIAL RECEIPT</span>
                        <span className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-[9px] px-2 py-0.5 rounded font-bold">
                          {foundReceipt.status}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black font-mono text-white mt-0.5">{foundReceipt.receiptNumber}</h2>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePrintSlip(foundReceipt)}
                    className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/20"
                  >
                    <Printer size={15} />
                    <span>Print / Save PDF Receipt</span>
                  </button>
                </div>

                {/* Meta details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="bg-black/50 border border-brand-dark-border/60 p-3 rounded-xl">
                    <span className="text-[9px] uppercase font-bold text-gray-500 block mb-0.5 font-sans">Date & Time</span>
                    <span className="text-white font-bold">
                      {new Date(foundReceipt.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="bg-black/50 border border-brand-dark-border/60 p-3 rounded-xl">
                    <span className="text-[9px] uppercase font-bold text-gray-500 block mb-0.5 font-sans">Customer</span>
                    <span className="text-white font-bold">{foundReceipt.customerName || "Walk-in Customer"}</span>
                  </div>
                  <div className="bg-black/50 border border-brand-dark-border/60 p-3 rounded-xl">
                    <span className="text-[9px] uppercase font-bold text-gray-500 block mb-0.5 font-sans">Payment Method</span>
                    <span className="text-emerald-400 font-bold">{foundReceipt.paymentMethod}</span>
                  </div>
                  <div className="bg-black/50 border border-brand-dark-border/60 p-3 rounded-xl">
                    <span className="text-[9px] uppercase font-bold text-gray-500 block mb-0.5 font-sans">Grand Total</span>
                    <span className="text-brand-sky font-black text-sm">{currencySymbol} {foundReceipt.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Itemized Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans flex items-center gap-1.5">
                    <ShoppingBag size={14} className="text-brand-sky" /> Itemized Purchased Products
                  </h4>
                  <div className="border border-brand-dark-border/60 rounded-xl overflow-hidden bg-black/40">
                    <div className="divide-y divide-brand-dark-border/40">
                      {foundReceipt.items.map((item, idx) => (
                        <div key={idx} className="p-3 flex justify-between items-center text-xs font-sans">
                          <div>
                            <p className="text-white font-bold">{item.productName}</p>
                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                              Qty: <span className="text-white font-bold">{item.qty}</span> × {currencySymbol} {item.unitPrice.toLocaleString()}
                            </p>
                          </div>
                          <span className="font-mono font-bold text-emerald-400 text-sm">
                            {currencySymbol} {item.subtotal.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Breakdown Totals */}
                    <div className="p-4 bg-black/80 border-t border-brand-dark-border/60 flex flex-col items-end gap-1.5 font-mono text-xs">
                      <div className="flex justify-between w-full sm:max-w-[240px]">
                        <span className="text-gray-400">Subtotal:</span>
                        <span className="text-white font-bold">{currencySymbol} {(foundReceipt.subtotal || foundReceipt.total).toLocaleString()}</span>
                      </div>
                      {foundReceipt.discount > 0 && (
                        <div className="flex justify-between w-full sm:max-w-[240px] text-emerald-400">
                          <span>Discount:</span>
                          <span>-{currencySymbol} {foundReceipt.discount.toLocaleString()}</span>
                        </div>
                      )}
                      {foundReceipt.tax > 0 && (
                        <div className="flex justify-between w-full sm:max-w-[240px] text-gray-400">
                          <span>Tax:</span>
                          <span className="text-white">+{currencySymbol} {foundReceipt.tax.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between w-full sm:max-w-[240px] border-t border-brand-dark-border/60 pt-2 text-sm text-white font-black">
                        <span>Grand Total Paid:</span>
                        <span className="text-emerald-400">{currencySymbol} {foundReceipt.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Split Payment details if present */}
                {foundReceipt.splitPayments && Object.keys(foundReceipt.splitPayments).length > 0 && (
                  <div className="p-4 bg-black/40 border border-brand-dark-border/60 rounded-xl space-y-2">
                    <p className="text-[10px] uppercase font-bold text-gray-400 font-sans">Payment Channel Breakdown:</p>
                    <div className="flex flex-wrap gap-2 font-mono text-xs">
                      {Object.entries(foundReceipt.splitPayments).map(([mode, amt]) => (
                        <span key={mode} className="bg-brand-dark-surface border border-brand-dark-border px-3 py-1 rounded-lg">
                          {mode}: <strong className="text-emerald-400">{currencySymbol} {amt.toLocaleString()}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* 👤 RESULT B: CUSTOMER ACCOUNT LEDGER & HISTORY PORTAL */}
          {hasSearched && searchMode === "customer" && foundCustomer && (
            <div className="space-y-6 animate-fade-in-up text-left">
              
              {/* Customer Profile Summary Header */}
              <div className="bg-brand-dark-surface border border-brand-dark-border rounded-2xl p-6 sm:p-8 sky-glow space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-brand-dark-border/60">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-brand-sky/15 border border-brand-sky/30 text-brand-sky flex items-center justify-center font-black text-2xl font-sans shrink-0">
                      {foundCustomer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-black text-white font-sans">{foundCustomer.name}</h2>
                        <span className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-mono text-[9px] px-2.5 py-0.5 rounded-full font-bold">
                          VERIFIED CUSTOMER
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-gray-400 font-mono">
                        <span className="bg-brand-sky/10 border border-brand-sky/30 text-brand-sky font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Hash size={11} /> {foundCustomer.customerNo || "CUST-VERIFIED"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone size={12} className="text-gray-500" /> {foundCustomer.mobile || "0300-0000000"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-black/50 border border-brand-dark-border/60 rounded-xl p-3 text-center">
                      <p className="text-[9px] uppercase text-gray-500 font-semibold mb-0.5 font-sans">Loyalty Points</p>
                      <p className="text-yellow-400 font-mono font-black text-sm">{foundCustomer.loyaltyPoints || 0} pts</p>
                    </div>
                    <div className="bg-black/50 border border-brand-dark-border/60 rounded-xl p-3 text-center">
                      <p className="text-[9px] uppercase text-gray-500 font-semibold mb-0.5 font-sans">Wallet Balance</p>
                      <p className="text-brand-sky font-mono font-black text-sm">{currencySymbol} {(foundCustomer.walletBalance || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-black/50 border border-brand-dark-border/60 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
                      <p className="text-[9px] uppercase text-gray-500 font-semibold mb-0.5 font-sans">Credit Dues (Udhar)</p>
                      <p className={`font-mono font-black text-sm ${foundCustomer.creditBalance > 0 ? "text-red-400 animate-pulse" : "text-emerald-400"}`}>
                        {currencySymbol} {(foundCustomer.creditBalance || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Outstanding Credit Alert */}
                {foundCustomer.creditBalance > 0 ? (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                    <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-gray-300 font-sans">
                      <span className="font-bold text-red-400">Outstanding Udhar Balance:</span> You currently have a pending credit balance of <strong className="text-white font-mono">{currencySymbol} {foundCustomer.creditBalance.toLocaleString()}</strong>. Please visit the store counter to clear your dues.
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-400 font-sans">
                    <CheckCircle2 size={16} />
                    <span>All Credit Dues Cleared! Your account is in excellent standing.</span>
                  </div>
                )}
              </div>

              {/* Sub-Tabs Navigation for Customer Portal */}
              <div className="bg-brand-dark-surface border border-brand-dark-border rounded-2xl overflow-hidden shadow-2xl">
                <div className="flex border-b border-brand-dark-border bg-black/40">
                  <button
                    type="button"
                    onClick={() => setCustSubTab("purchases")}
                    className={`flex-1 py-4 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center justify-center gap-2 ${
                      custSubTab === "purchases"
                        ? "border-brand-sky text-brand-sky bg-brand-sky/5 font-black"
                        : "border-transparent text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    <ShoppingBag size={14} />
                    <span>Purchase History</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustSubTab("returns")}
                    className={`flex-1 py-4 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center justify-center gap-2 ${
                      custSubTab === "returns"
                        ? "border-brand-sky text-brand-sky bg-brand-sky/5 font-black"
                        : "border-transparent text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    <RotateCcw size={14} />
                    <span>Returns & Refunds</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustSubTab("credit")}
                    className={`flex-1 py-4 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center justify-center gap-2 ${
                      custSubTab === "credit"
                        ? "border-brand-sky text-brand-sky bg-brand-sky/5 font-black"
                        : "border-transparent text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    <CreditCard size={14} />
                    <span>Udhar & Recovery Ledger</span>
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
                          <div className="text-center py-12 text-gray-500 text-xs font-sans">
                            No purchases recorded for this customer account yet.
                          </div>
                        );
                      }

                      return custSales.map((sale) => {
                        const isExpanded = !!expandedSales[sale.id];
                        return (
                          <div key={sale.id} className="border border-brand-dark-border/60 bg-black/40 rounded-xl overflow-hidden text-left">
                            <div
                              onClick={() => toggleSaleExpand(sale.id)}
                              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-brand-dark-surface/40 transition"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-brand-sky/10 border border-brand-sky/30 flex items-center justify-center shrink-0 text-brand-sky">
                                  <ShoppingBag size={16} />
                                </div>
                                <div>
                                  <p className="font-mono font-black text-xs text-white flex items-center gap-2">
                                    {sale.receiptNumber}
                                    <span className="text-[9px] bg-brand-dark-surface border border-brand-dark-border px-2 py-0.5 rounded text-gray-400 font-sans">
                                      {sale.paymentMethod}
                                    </span>
                                  </p>
                                  <p className="text-[10px] text-gray-500 mt-0.5 font-sans">
                                    {new Date(sale.date).toLocaleString(undefined, {
                                      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
                                    })}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-5">
                                <div className="text-right font-mono">
                                  <span className="text-emerald-400 font-black text-sm block">
                                    {currencySymbol} {sale.total.toLocaleString()}
                                  </span>
                                  <span className="text-[9px] text-gray-500">{sale.items.length} item(s)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handlePrintSlip(sale); }}
                                    className="p-1.5 rounded-lg bg-black border border-brand-dark-border text-gray-400 hover:text-white"
                                    title="Print Digital Slip"
                                  >
                                    <Printer size={13} />
                                  </button>
                                  <button type="button" className="p-1.5 rounded-lg bg-black border border-brand-dark-border text-gray-400 hover:text-white">
                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Itemized Drilldown */}
                            {isExpanded && (
                              <div className="px-4 pb-4 pt-2 border-t border-brand-dark-border/50 bg-black/20 text-xs space-y-3 font-sans">
                                <div className="divide-y divide-brand-dark-border/40">
                                  {sale.items.map((it, idx) => (
                                    <div key={idx} className="py-2.5 flex justify-between items-center text-gray-300">
                                      <div>
                                        <p className="font-semibold text-white">{it.productName}</p>
                                        <p className="text-[10px] text-gray-500 font-mono">x{it.qty} @ {currencySymbol} {it.unitPrice.toLocaleString()}</p>
                                      </div>
                                      <span className="font-mono text-white font-bold">{currencySymbol} {it.subtotal.toLocaleString()}</span>
                                    </div>
                                  ))}
                                </div>

                                <div className="border-t border-brand-dark-border/40 pt-2 flex flex-col items-end gap-1 font-mono text-xs">
                                  <div className="flex justify-between w-full sm:max-w-[200px]">
                                    <span className="text-gray-400">Total:</span>
                                    <span className="text-emerald-400 font-bold">{currencySymbol} {sale.total.toLocaleString()}</span>
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
                          <div className="text-center py-12 text-gray-500 text-xs font-sans">
                            No return or refund records found for this customer.
                          </div>
                        );
                      }

                      return returnsList.map(ret => (
                        <div key={ret.id} className="p-4 border border-red-500/20 bg-red-500/5 rounded-xl flex justify-between items-center font-sans text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center shrink-0">
                              <RotateCcw size={15} />
                            </div>
                            <div>
                              <p className="font-mono font-bold text-white">{ret.receiptNumber}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {new Date(ret.date).toLocaleDateString()} · {ret.items.length} item(s) refunded
                              </p>
                            </div>
                          </div>
                          <div className="text-right font-mono">
                            <span className="text-red-400 font-black text-sm block">-{currencySymbol} {ret.total.toLocaleString()}</span>
                            <span className="text-[9px] uppercase text-red-300 font-bold">{ret.status}</span>
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
                      <div className="p-4 bg-black/40 border border-brand-dark-border/60 rounded-xl">
                        <span className="text-[9px] uppercase font-bold text-gray-500 block mb-1">Total Credit Taken</span>
                        {(() => {
                          const creditSales = sales.filter(
                            s => (s.customerNo === foundCustomer.customerNo || s.customerName === foundCustomer.name) &&
                            (s.paymentMethod === "On Credit" || (s.splitPayments && (s.splitPayments["On Credit"] || 0) > 0))
                          );
                          const totalCredit = creditSales.reduce((sum, s) => sum + (s.splitPayments ? (s.splitPayments["On Credit"] || 0) : s.total), 0);
                          return <span className="text-xl font-mono font-black text-white">{currencySymbol} {totalCredit.toLocaleString()}</span>;
                        })()}
                      </div>

                      <div className="p-4 bg-black/40 border border-brand-dark-border/60 rounded-xl">
                        <span className="text-[9px] uppercase font-bold text-gray-500 block mb-1">Total Udhar Recovered</span>
                        {(() => {
                          const totalRecovered = (foundCustomer.dueRecoveryHistory || []).reduce((sum: number, r: any) => sum + r.amount, 0);
                          return <span className="text-xl font-mono font-black text-emerald-400">{currencySymbol} {totalRecovered.toLocaleString()}</span>;
                        })()}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">Account Statement Ledger History</h4>
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
                          return <div className="text-center py-10 text-gray-500 text-xs font-sans">No credit ledger history found.</div>;
                        }

                        return (
                          <div className="border border-brand-dark-border/60 rounded-xl divide-y divide-brand-dark-border/40 overflow-hidden bg-black/30 text-xs font-sans">
                            {timeline.map((ev, idx) => {
                              const isCharge = ev.type === "credit_charge";
                              return (
                                <div key={idx} className="p-3.5 flex justify-between items-center">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isCharge ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                                      <CreditCard size={15} />
                                    </div>
                                    <div>
                                      <p className="font-bold text-white">{isCharge ? `Udhar Charge (${ev.receipt})` : "Credit Dues Settlement Payment"}</p>
                                      <p className="text-[10px] text-gray-500 mt-0.5">{new Date(ev.date).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                  <div className="text-right font-mono">
                                    <span className={`font-black text-sm ${isCharge ? "text-red-400" : "text-emerald-400"}`}>
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
              <div className="bg-brand-dark-surface border border-brand-dark-border rounded-2xl p-6 sm:p-8 sky-glow">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-semibold">
                      {foundTicketType === "demo" ? "Demo Ticket Number" : "Support Ticket Number"}
                    </p>
                    <p className="text-2xl sm:text-3xl font-black font-mono text-brand-sky sky-neon-text tracking-wider">
                      {foundTicketType === "demo" ? foundTicket.ticketNumber : foundTicket.ticketNumber}
                    </p>
                    {foundTicketType === "support" && (
                      <p className="text-sm font-bold text-white mt-2">{foundTicket.subject}</p>
                    )}
                  </div>
                  {foundTicketType === "demo" ? (
                    <StatusBadge status={foundTicket.status} />
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full border text-[10px] font-black tracking-widest uppercase bg-blue-500/15 text-blue-400 border-blue-500/40">
                      {foundTicket.status}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-sm">
                  <div className="bg-black/40 border border-brand-dark-border/60 rounded-xl p-4">
                    <p className="text-[10px] uppercase text-gray-500 font-semibold mb-1 tracking-wide">Business</p>
                    <p className="text-white font-semibold">{foundTicket.businessName}</p>
                  </div>
                  <div className="bg-black/40 border border-brand-dark-border/60 rounded-xl p-4">
                    <p className="text-[10px] uppercase text-gray-500 font-semibold mb-1 tracking-wide">Contact / Category</p>
                    <p className="text-white font-semibold">{foundTicketType === "demo" ? foundTicket.name : foundTicket.category}</p>
                  </div>
                  <div className="bg-black/40 border border-brand-dark-border/60 rounded-xl p-4">
                    <p className="text-[10px] uppercase text-gray-500 font-semibold mb-1 tracking-wide">Submitted</p>
                    <p className="text-white font-semibold">
                      {new Date(foundTicket.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                </div>

                {foundTicketType === "demo" && (
                  <div className="mb-2">
                    <p className="text-[10px] uppercase text-gray-500 font-semibold mb-3 tracking-wide">Request Progress</p>
                    <StatusTimeline status={foundTicket.status} />
                  </div>
                )}
              </div>

              {/* Chat Panel */}
              <div className="bg-brand-dark-surface border border-brand-dark-border rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-brand-dark-border">
                  <MessageCircle size={18} className="text-brand-sky" />
                  <p className="text-white font-bold text-sm">Support Chat</p>
                </div>
                <div className="px-5 py-4 space-y-4 max-h-80 overflow-y-auto bg-black/30">
                  {(foundTicketType === "demo" ? foundTicket.messages : foundTicket.replies).map((msg: any, idx: number) => (
                    <ChatBubble key={idx} sender={msg.sender} message={msg.message} date={msg.date} />
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="px-5 pb-5 pt-3 border-t border-brand-dark-border/50 bg-brand-dark-surface space-y-3">
                  <textarea
                    rows={3}
                    placeholder="Type your message here…"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full bg-black border border-brand-dark-border rounded-xl p-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-sky resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600 text-[10px]">Press Ctrl+Enter to send</p>
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className="inline-flex items-center gap-2 bg-brand-sky text-black font-black text-xs px-5 py-2 rounded-xl"
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
