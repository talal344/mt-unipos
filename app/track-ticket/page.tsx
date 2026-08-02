"use client";

import React, { useState, useRef, useEffect } from "react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { useGlobalContext } from "@/context/global-context";
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
  Star,
  CreditCard,
  Mail,
  MapPin,
  User,
  Hash,
} from "lucide-react";
import type { DemoRequest, SupportTicket } from "@/context/global-context";

// ─── Timeline steps ──────────────────────────────────────────────────────────
const STEPS = [
  { label: "Submitted",     key: "submitted"  },
  { label: "Under Review",  key: "reviewed"   },
  { label: "Decision Made", key: "decided"    },
  { label: "Result",        key: "result"     },
] as const;

function getStepIndex(status: DemoRequest["status"]): number {
  switch (status) {
    case "Pending":  return 0;
    case "Reviewed": return 1;
    case "Approved":
    case "Rejected": return 3;
    default:         return 0;
  }
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: DemoRequest["status"] }) {
  const map: Record<DemoRequest["status"], { label: string; cls: string }> = {
    Pending:  { label: "PENDING",  cls: "bg-amber-500/15 text-amber-400 border-amber-500/40"   },
    Reviewed: { label: "REVIEWED", cls: "bg-blue-500/15 text-blue-400 border-blue-500/40"       },
    Approved: { label: "APPROVED", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40" },
    Rejected: { label: "REJECTED", cls: "bg-red-500/15 text-red-400 border-red-500/40"         },
  };
  const { label, cls } = map[status];
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

          // Special label for result step
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

// ─── Mask helpers ─────────────────────────────────────────────────────────────
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  return local.slice(0, 4) + "***@" + domain;
}
function maskPassword(pw: string): string {
  return pw.slice(0, 5) + "***";
}

// ─── Days remaining ────────────────────────────────────────────────────────────
function daysRemaining(trialEndsAt: string): number {
  const diff = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ─── Chat Bubble ──────────────────────────────────────────────────────────────
function ChatBubble({
  sender,
  message,
  date,
}: {
  sender: "Client" | "Admin";
  message: string;
  date: string;
}) {
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

// ─── Main Page ─────────────────────────────────────────────────────────────────
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
    currencySymbol
  } = useGlobalContext();

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const [revealCredentials, setRevealCredentials] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const [softwareForm, setSoftwareForm] = useState({
    name: "",
    businessNature: "",
    features: ""
  });
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);

  // Portal tabs and collapse state for customer tracking
  const [portalTab, setPortalTab] = useState<"purchases" | "ledger">("purchases");
  const [expandedSales, setExpandedSales] = useState<Record<string, boolean>>({});

  const toggleSaleExpand = (saleId: string) => {
    setExpandedSales((prev) => ({
      ...prev,
      [saleId]: !prev[saleId],
    }));
  };

  const demoTicket = demoRequests.find((r) => r.ticketNumber === searchQuery.trim());
  const supportTicket = supportTickets.find((r) => r.ticketNumber === searchQuery.trim() || r.id === searchQuery.trim());

  const matchingCustomer = customers.find(
    (c) =>
      c.customerNo &&
      c.customerNo.trim().toUpperCase() === searchQuery.trim().toUpperCase()
  );

  const ticketType = demoTicket ? "demo" : supportTicket ? "support" : null;
  const ticket = demoTicket || supportTicket;

  const matchingTenant = demoTicket ? tenants.find(t => t.email === demoTicket.email) : null;
  const matchingInvoice = matchingTenant ? saasInvoices.find(inv => inv.tenantId === matchingTenant.id) : null;

  const isExpired = demoTicket?.trialEndsAt
    ? new Date(demoTicket.trialEndsAt) < new Date()
    : false;

  // Auto-scroll removed from useEffect to prevent jump on search

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
    setHasSearched(true);
    setRevealCredentials(false);
    setMessageText("");
    setMessageSent(false);
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !ticket) return;
    
    if (ticketType === "demo") {
      addDemoMessage(demoTicket!.ticketNumber, messageText.trim(), "Client");
    } else if (ticketType === "support") {
      replyToTicket(supportTicket!.id, messageText.trim(), "Client");
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
    if (ticketType === "support" && supportTicket) {
      updateSupportTicket(supportTicket.id, {
        softwareRequestData: {
          ...softwareForm,
          requestedAt: new Date().toISOString()
        }
      });
      setShowPurchaseForm(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black font-sans text-gray-100">
      <SiteHeader />

      {/* Hero / Search Section */}
      <section className="relative py-20 border-b border-brand-dark-border overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.07),transparent_65%)] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-sky/10 border border-brand-sky/30 rounded-full px-4 py-1.5 mb-6">
            <Ticket size={14} className="text-brand-sky" />
            <span className="text-xs font-semibold text-brand-sky tracking-wide font-sans">Ticket & Customer Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3 font-sans">
            Track Ticket or <span className="text-brand-sky sky-neon-text font-sans">Customer Purchases</span>
          </h1>
          <p className="text-sm text-gray-400 mb-10 max-w-md mx-auto leading-relaxed font-sans">
            Enter your support ticket number or unique customer number below to view status and history.
          </p>

          {/* Search form */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <div className="relative flex-1 sky-glow-border rounded-xl overflow-hidden">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
              <input
                id="ticket-search-input"
                type="text"
                placeholder="e.g. TKT-991001-11 or CUST-7294"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-brand-dark-surface pl-10 pr-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none font-mono tracking-wider"
              />
            </div>
            <button
              id="ticket-search-btn"
              type="submit"
              className="flex items-center justify-center gap-2 bg-brand-sky hover:bg-brand-sky-light text-black font-black text-sm px-6 py-3.5 rounded-xl transition-all duration-200 transform hover:scale-105 whitespace-nowrap"
            >
              <Search size={15} />
              Track Ticket
            </button>
          </form>
        </div>
      </section>

      {/* Results Section */}
      <section className="flex-grow py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Not searched yet: placeholder hint */}
          {!hasSearched && (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-brand-dark-surface border border-brand-dark-border flex items-center justify-center mx-auto mb-5">
                <Ticket size={32} className="text-gray-600" />
              </div>
              <p className="text-gray-500 text-sm font-sans">Enter your ticket number or customer number above to get started.</p>
              <p className="text-gray-600 text-xs mt-2 font-sans">
                For tickets (e.g. <code className="text-brand-sky font-mono bg-brand-sky/5 px-1.5 py-0.5 rounded">TKT-991001-11</code>) or customers (e.g. <code className="text-brand-sky font-mono bg-brand-sky/5 px-1.5 py-0.5 rounded">CUST-7294</code>).
              </p>
            </div>
          )}

          {/* Not found */}
          {hasSearched && !ticket && !matchingCustomer && (
            <div className="bg-brand-dark-surface border border-red-500/30 rounded-2xl p-8 text-center animate-fade-in-up">
              <XCircle size={40} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-white font-bold text-base mb-2 font-sans">Record Not Found</h3>
              <p className="text-gray-400 text-sm font-sans">
                No ticket or customer profile found for{" "}
                <code className="text-red-400 font-mono bg-red-500/10 px-2 py-0.5 rounded">{searchQuery}</code>.
                <br />
                Please verify the ID and try again.
              </p>
              <button
                type="button"
                onClick={() => { setSearchInput(""); setHasSearched(false); setSearchQuery(""); }}
                className="mt-5 inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-brand-dark-border hover:border-gray-500 px-4 py-2 rounded-lg transition font-sans"
              >
                <RefreshCw size={13} /> Clear & Retry
              </button>
            </div>
          )}

          {/* Customer Portal Results */}
          {hasSearched && matchingCustomer && (
            <div className="space-y-6 animate-fade-in-up text-left">
              {/* Customer Overview Card */}
              <div className="bg-brand-dark-surface border border-brand-dark-border rounded-2xl p-6 sm:p-8 sky-glow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-brand-dark-border/60">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-brand-sky/15 border border-brand-sky/30 text-brand-sky flex items-center justify-center font-black text-2xl font-sans text-left">
                      {matchingCustomer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white font-sans">{matchingCustomer.name}</h2>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="bg-brand-sky/10 border border-brand-sky/30 text-brand-sky font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Hash size={10} /> ID: {matchingCustomer.customerNo}
                        </span>
                        {(() => {
                          const pts = matchingCustomer.loyaltyPoints || 0;
                          const tier = pts >= 5000 ? { label: "Platinum", cls: "bg-brand-sky/15 text-brand-sky border-brand-sky/30" }
                                     : pts >= 2000 ? { label: "Gold", cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" }
                                     : pts >= 500 ? { label: "Silver", cls: "bg-gray-500/15 text-gray-300 border-gray-500/30" }
                                     : { label: "Bronze", cls: "bg-amber-600/15 text-amber-500 border-amber-600/30" };
                          return (
                            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${tier.cls} font-sans`}>
                              {tier.label} Member
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Quick summary numbers */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div className="bg-black/40 border border-brand-dark-border/60 rounded-xl p-3 text-center min-w-[100px]">
                      <p className="text-[9px] uppercase text-gray-500 font-semibold mb-0.5 font-sans text-center">Loyalty Points</p>
                      <p className="text-yellow-400 font-mono font-black text-sm text-center">{matchingCustomer.loyaltyPoints || 0} pts</p>
                    </div>
                    <div className="bg-black/40 border border-brand-dark-border/60 rounded-xl p-3 text-center min-w-[100px]">
                      <p className="text-[9px] uppercase text-gray-500 font-semibold mb-0.5 font-sans text-center">Purchases</p>
                      <p className="text-brand-sky font-mono font-black text-sm text-center">
                        {sales.filter(s => s.customerNo === matchingCustomer.customerNo || s.customerName === matchingCustomer.name).length}
                      </p>
                    </div>
                    <div className="bg-black/40 border border-brand-dark-border/60 rounded-xl p-3 text-center min-w-[120px] col-span-2 sm:col-span-1">
                      <p className="text-[9px] uppercase text-gray-500 font-semibold mb-0.5 font-sans text-center">Outstanding Due</p>
                      <p className={`font-mono font-black text-sm text-center ${matchingCustomer.creditBalance > 0 ? "text-red-400" : "text-emerald-400"}`}>
                        {currencySymbol} {(matchingCustomer.creditBalance || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Credit Summary Bar */}
                {matchingCustomer.creditBalance > 0 && (
                  <div className="mt-4 p-4 bg-red-500/5 border border-red-500/20 rounded-xl flex items-start gap-3">
                    <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
                    <div className="text-xs text-gray-300 font-sans">
                      <span className="font-bold text-red-400">Outstanding Balance:</span> You currently have an outstanding credit balance of <span className="font-bold text-white font-mono">{currencySymbol} {matchingCustomer.creditBalance.toLocaleString()}</span>. Please settle this balance at the checkout counter.
                    </div>
                  </div>
                )}
              </div>

              {/* Details Tabs */}
              <div className="bg-brand-dark-surface border border-brand-dark-border rounded-2xl overflow-hidden">
                {/* Tabs list */}
                <div className="flex border-b border-brand-dark-border bg-black/40">
                  <button
                    type="button"
                    onClick={() => setPortalTab("purchases")}
                    className={`flex-1 py-4 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition font-sans ${
                      portalTab === "purchases"
                        ? "border-brand-sky text-brand-sky bg-brand-sky/5"
                        : "border-transparent text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    Purchase History
                  </button>
                  <button
                    type="button"
                    onClick={() => setPortalTab("ledger")}
                    className={`flex-1 py-4 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition font-sans ${
                      portalTab === "ledger"
                        ? "border-brand-sky text-brand-sky bg-brand-sky/5"
                        : "border-transparent text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    Credit Ledger & Recovery
                  </button>
                </div>

                {/* Portal Tab Contents */}
                <div className="p-6">
                  {portalTab === "purchases" ? (
                    /* Purchase History Tab */
                    <div className="space-y-4">
                      {(() => {
                        const custSales = sales
                          .filter(s => s.customerNo === matchingCustomer.customerNo || s.customerName === matchingCustomer.name)
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                        if (custSales.length === 0) {
                          return (
                            <div className="text-center py-10 text-gray-500 text-xs font-sans">
                              No purchases recorded in this account yet.
                            </div>
                          );
                        }

                        return custSales.map(sale => {
                          const isExpanded = !!expandedSales[sale.id];
                          return (
                            <div key={sale.id} className="border border-brand-dark-border/60 bg-black/40 rounded-xl overflow-hidden transition-all text-left">
                              {/* Header Row */}
                              <div
                                onClick={() => toggleSaleExpand(sale.id)}
                                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-brand-dark-surface/30 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-brand-sky/10 border border-brand-sky/20 flex items-center justify-center shrink-0">
                                    <ShoppingBag size={14} className="text-brand-sky" />
                                  </div>
                                  <div>
                                    <p className="font-mono font-bold text-xs text-white">{sale.receiptNumber}</p>
                                    <p className="text-[10px] text-gray-500 mt-0.5 font-sans">
                                      {new Date(sale.date).toLocaleString(undefined, {
                                        year: "numeric", month: "short", day: "numeric",
                                        hour: "2-digit", minute: "2-digit"
                                      })}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-6">
                                  <div className="text-right">
                                    <p className="font-mono font-black text-brand-sky text-sm">
                                      {currencySymbol} {sale.total.toLocaleString()}
                                    </p>
                                    <p className="text-[9px] text-gray-500 uppercase mt-0.5 font-mono">
                                      {sale.paymentMethod}
                                    </p>
                                  </div>
                                  <button type="button" className="text-gray-500 hover:text-white p-1 rounded-md bg-brand-dark-surface/50 border border-brand-dark-border/40">
                                    {isExpanded ? <EyeOff size={13} /> : <Eye size={13} />}
                                  </button>
                                </div>
                              </div>

                              {/* Expandable details */}
                              {isExpanded && (
                                <div className="px-4 pb-4 pt-1 border-t border-brand-dark-border/40 bg-black/20 text-xs space-y-3">
                                  {/* Items Table */}
                                  <div className="space-y-1.5 pt-2">
                                    <p className="text-[9px] uppercase tracking-wide text-gray-500 font-bold font-sans">Items List</p>
                                    <div className="divide-y divide-brand-dark-border/30">
                                      {sale.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between py-2 text-gray-300 font-sans">
                                          <div>
                                            <span className="text-white font-semibold">{item.productName}</span>
                                            <span className="text-gray-500 font-mono text-[10px] ml-2">x{item.qty}</span>
                                          </div>
                                          <span className="font-mono text-white">
                                            {currencySymbol} {item.subtotal.toLocaleString()}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Breakdown math */}
                                  <div className="border-t border-brand-dark-border/40 pt-2 flex flex-col items-end gap-1 font-mono text-[11px] text-gray-400">
                                    <div className="flex justify-between w-full sm:max-w-[200px]">
                                      <span>Subtotal:</span>
                                      <span className="text-white">{currencySymbol} {sale.subtotal.toLocaleString()}</span>
                                    </div>
                                    {sale.discount > 0 && (
                                      <div className="flex justify-between w-full sm:max-w-[200px] text-emerald-400">
                                        <span>Discount:</span>
                                        <span>-{currencySymbol} {sale.discount.toLocaleString()}</span>
                                      </div>
                                    )}
                                    {sale.tax > 0 && (
                                      <div className="flex justify-between w-full sm:max-w-[200px]">
                                        <span>Tax:</span>
                                        <span className="text-white">{currencySymbol} {sale.tax.toLocaleString()}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between w-full sm:max-w-[200px] border-t border-brand-dark-border/30 pt-1 text-xs text-white font-bold">
                                      <span>Total paid:</span>
                                      <span className="text-brand-sky">{currencySymbol} {sale.total.toLocaleString()}</span>
                                    </div>
                                  </div>

                                  {/* Split Details / Ledger details */}
                                  {sale.splitPayments && Object.keys(sale.splitPayments).length > 0 && (
                                    <div className="border-t border-brand-dark-border/40 pt-2 text-[10px]">
                                      <p className="text-gray-500 font-bold uppercase tracking-wide text-[9px] mb-1 font-sans">Split Payment Breakdown:</p>
                                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-300">
                                        {Object.entries(sale.splitPayments).map(([method, amt]) => (
                                          <div key={method} className="flex gap-1.5 items-center bg-brand-dark-surface/50 border border-brand-dark-border/40 px-2 py-0.5 rounded font-mono">
                                            <span>{method}:</span>
                                            <span className="font-bold text-white">{currencySymbol} {amt.toLocaleString()}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {sale.notes && (
                                    <div className="border-t border-brand-dark-border/40 pt-2 text-[10px] text-gray-500 italic font-sans">
                                      Notes: {sale.notes}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  ) : (
                    /* Ledger and Settlements Tab */
                    <div className="space-y-6 text-left">
                      {/* Credit Timeline Overview */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-black/30 border border-brand-dark-border/50 rounded-xl p-4">
                          <h4 className="text-[10px] uppercase text-gray-500 font-bold tracking-wide mb-3 font-sans">Total Credit Balance Taken</h4>
                          {(() => {
                            const creditSales = sales.filter(
                              s => (s.customerNo === matchingCustomer.customerNo || s.customerName === matchingCustomer.name) && 
                              (s.isCredit || s.paymentMethod === "On Credit" || (s.splitPayments && (s.splitPayments["On Credit"] || 0) > 0))
                            );
                            const totalCreditTaken = creditSales.reduce((a, s) => {
                              const creditPart = s.splitPayments ? (s.splitPayments["On Credit"] || 0) : s.total;
                              return a + creditPart;
                            }, 0);
                            return (
                              <div>
                                <p className="text-2xl font-mono font-black text-white">{currencySymbol} {totalCreditTaken.toLocaleString()}</p>
                                <p className="text-[10px] text-gray-500 mt-1 font-sans">Accumulated across {creditSales.length} purchases on credit</p>
                              </div>
                            );
                          })()}
                        </div>

                        <div className="bg-black/30 border border-brand-dark-border/50 rounded-xl p-4">
                          <h4 className="text-[10px] uppercase text-gray-500 font-bold tracking-wide mb-3 font-sans">Total Credit Settled</h4>
                          {(() => {
                            const totalPaid = matchingCustomer.dueRecoveryHistory?.reduce((a, r) => a + r.amount, 0) || 0;
                            return (
                              <div>
                                <p className="text-2xl font-mono font-black text-emerald-400">{currencySymbol} {totalPaid.toLocaleString()}</p>
                                <p className="text-[10px] text-gray-500 mt-1 font-sans">Cleared over {matchingCustomer.dueRecoveryHistory?.length || 0} recovery payments</p>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Combined Timeline of Credits and Recoveries */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">Account Statement Ledger</h4>
                        {(() => {
                          // Get all credit transactions
                          const creditSales = sales.filter(
                            s => (s.customerNo === matchingCustomer.customerNo || s.customerName === matchingCustomer.name) && 
                            (s.isCredit || s.paymentMethod === "On Credit" || (s.splitPayments && (s.splitPayments["On Credit"] || 0) > 0))
                          ).map(s => {
                            const creditPart = s.splitPayments ? (s.splitPayments["On Credit"] || 0) : s.total;
                            return {
                              type: "credit_purchase" as const,
                              date: s.date,
                              amount: creditPart,
                              title: `Credit Purchase (${s.receiptNumber})`,
                            };
                          });

                          // Get all recovery transactions
                          const recoveries = (matchingCustomer.dueRecoveryHistory || []).map(r => ({
                            type: "recovery_payment" as const,
                            date: r.date,
                            amount: r.amount,
                            title: "Credit Recovery Settlement",
                          }));

                          // Combine and sort chronologically
                          const timeline = [...creditSales, ...recoveries].sort(
                            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                          );

                          if (timeline.length === 0) {
                            return (
                              <div className="text-center py-10 text-gray-500 text-xs bg-black/20 border border-brand-dark-border/40 rounded-xl font-sans">
                                No credit or recovery ledger records found.
                              </div>
                            );
                          }

                          return (
                            <div className="border border-brand-dark-border/50 rounded-xl divide-y divide-brand-dark-border/40 overflow-hidden bg-black/20">
                              {timeline.map((event, idx) => {
                                const isPurchase = event.type === "credit_purchase";
                                return (
                                  <div key={idx} className="p-4 flex justify-between items-center text-xs text-left">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                                        isPurchase 
                                          ? "bg-red-500/10 border-red-500/20 text-red-400" 
                                          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                      }`}>
                                        <CreditCard size={14} />
                                      </div>
                                      <div>
                                        <p className="font-bold text-white font-sans">{event.title}</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5 font-sans">
                                          {new Date(event.date).toLocaleDateString(undefined, {
                                            year: "numeric", month: "short", day: "numeric"
                                          })}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className={`font-mono font-black ${isPurchase ? "text-red-400" : "text-emerald-400"}`}>
                                        {isPurchase ? "+" : "-"}{currencySymbol} {event.amount.toLocaleString()}
                                      </p>
                                      <p className="text-[9px] text-gray-500 uppercase mt-0.5 font-sans">
                                        {isPurchase ? "Charged" : "Settled"}
                                      </p>
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
            </div>
          )}

          {/* Ticket found */}
          {hasSearched && ticket && (
            <div className="space-y-5 animate-fade-in-up">

              {/* ── Main status card ── */}
              <div className="bg-brand-dark-surface border border-brand-dark-border rounded-2xl p-6 sm:p-8 sky-glow">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-semibold">
                      {ticketType === "demo" ? "Demo Ticket Number" : "Support Ticket Number"}
                    </p>
                    <p className="text-2xl sm:text-3xl font-black font-mono text-brand-sky sky-neon-text tracking-wider">
                      {ticketType === "demo" ? demoTicket!.ticketNumber : supportTicket!.ticketNumber}
                    </p>
                    {ticketType === "support" && (
                      <p className="text-sm font-bold text-white mt-2">{supportTicket!.subject}</p>
                    )}
                  </div>
                  {ticketType === "demo" ? (
                    <StatusBadge status={demoTicket!.status} />
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full border text-[10px] font-black tracking-widest uppercase bg-blue-500/15 text-blue-400 border-blue-500/40">
                      {supportTicket!.status}
                    </span>
                  )}
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-sm">
                  <div className="bg-black/40 border border-brand-dark-border/60 rounded-xl p-4">
                    <p className="text-[10px] uppercase text-gray-500 font-semibold mb-1 tracking-wide">Business</p>
                    <p className="text-white font-semibold">{ticket.businessName}</p>
                  </div>
                  <div className="bg-black/40 border border-brand-dark-border/60 rounded-xl p-4">
                    <p className="text-[10px] uppercase text-gray-500 font-semibold mb-1 tracking-wide">
                      {ticketType === "demo" ? "Contact" : "Category"}
                    </p>
                    <p className="text-white font-semibold">
                      {ticketType === "demo" ? demoTicket!.name : supportTicket!.category}
                    </p>
                    {ticketType === "demo" && <p className="text-gray-500 text-xs">{demoTicket!.email}</p>}
                  </div>
                  <div className="bg-black/40 border border-brand-dark-border/60 rounded-xl p-4">
                    <p className="text-[10px] uppercase text-gray-500 font-semibold mb-1 tracking-wide">Submitted</p>
                    <p className="text-white font-semibold">
                      {new Date(ticket.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                </div>

                {/* Progress timeline */}
                {ticketType === "demo" && (
                  <div className="mb-2">
                    <p className="text-[10px] uppercase text-gray-500 font-semibold mb-3 tracking-wide">Request Progress</p>
                    <StatusTimeline status={demoTicket!.status} />
                  </div>
                )}
                
                {ticketType === "support" && (
                  <div className="mt-4 pt-4 border-t border-brand-dark-border">
                    {supportTicket!.softwareRequestData ? (
                       <div className="bg-brand-sky/10 border border-brand-sky/30 rounded-xl p-4 text-brand-sky">
                         <h4 className="font-bold text-sm flex items-center gap-2 mb-2"><CheckCircle2 size={16} /> Software Purchase Requested</h4>
                         <p className="text-xs text-gray-300">Your request for software provisioning has been received. Our team is processing it.</p>
                       </div>
                    ) : (
                      <div className="flex flex-col items-start gap-4">
                        <p className="text-xs text-gray-400">Ready to purchase the software and get full credentials? Submit a request.</p>
                        <button onClick={() => setShowPurchaseForm(!showPurchaseForm)} className="bg-brand-sky text-black font-black text-xs px-5 py-2.5 rounded hover:bg-brand-sky-light transition">
                          Apply for Software Purchase
                        </button>
                      </div>
                    )}

                    {showPurchaseForm && !supportTicket!.softwareRequestData && (
                      <form onSubmit={handlePurchaseSubmit} className="mt-6 space-y-4 bg-black/50 border border-brand-dark-border p-5 rounded-xl">
                        <h4 className="font-bold text-white mb-2">Software Purchase Form</h4>
                        <div>
                          <label className="block text-[10px] uppercase text-gray-400 mb-1">Your Name</label>
                          <input required type="text" value={softwareForm.name} onChange={e => setSoftwareForm({...softwareForm, name: e.target.value})} className="w-full bg-brand-dark-surface p-2 rounded text-white text-xs border border-brand-dark-border" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-gray-400 mb-1">Nature of Business</label>
                          <input required type="text" placeholder="e.g. Pharmacy, Restaurant, Retail" value={softwareForm.businessNature} onChange={e => setSoftwareForm({...softwareForm, businessNature: e.target.value})} className="w-full bg-brand-dark-surface p-2 rounded text-white text-xs border border-brand-dark-border" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-gray-400 mb-1">Additional Features Required</label>
                          <input required type="text" placeholder="e.g. FBR Integration, Multi-branch" value={softwareForm.features} onChange={e => setSoftwareForm({...softwareForm, features: e.target.value})} className="w-full bg-brand-dark-surface p-2 rounded text-white text-xs border border-brand-dark-border" />
                        </div>
                        <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-black font-black w-full py-2 rounded text-xs">Submit Request</button>
                      </form>
                    )}
                  </div>
                )}
              </div>

              {/* ── APPROVED card ── */}
              {ticketType === "demo" && demoTicket!.status === "Approved" && (
                <div
                  className={`rounded-2xl p-6 sm:p-8 border transition-all duration-300 ${
                    isExpired
                      ? "bg-red-950/20 border-red-500/40"
                      : "bg-emerald-950/20 border-emerald-500/40"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
                    <div className="flex items-center gap-3">
                      <CheckCircle2
                        size={28}
                        className={isExpired ? "text-red-400" : "text-emerald-400"}
                      />
                      <div>
                        <h3 className={`font-black text-base ${isExpired ? "text-red-300" : "text-emerald-300"}`}>
                          {isExpired ? "Trial Expired" : "✅ Demo Account Approved!"}
                        </h3>
                        <p className="text-gray-400 text-xs">
                          {isExpired
                            ? "Your trial period has ended."
                            : "Your credentials are ready. Reveal them below to access your demo."}
                        </p>
                      </div>
                    </div>
                    {isExpired && (
                      <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                        <AlertTriangle size={11} /> TRIAL EXPIRED
                      </span>
                    )}
                    {!isExpired && demoTicket!.trialEndsAt && (
                      <div className="ml-auto bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2 text-center">
                        <p className="text-emerald-400 text-2xl font-black">{daysRemaining(demoTicket!.trialEndsAt)}</p>
                        <p className="text-gray-400 text-[10px] uppercase tracking-wide">Days Left</p>
                      </div>
                    )}
                  </div>

                  {/* Credentials or deactivated notice */}
                  {isExpired ? (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                      <p className="text-red-300 text-sm font-semibold">Account has been deactivated.</p>
                      <p className="text-gray-500 text-xs mt-1">
                        Please contact our sales team to upgrade to a full plan.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Credential fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="bg-black/40 border border-emerald-500/20 rounded-xl p-4">
                          <p className="text-[10px] uppercase text-gray-500 font-semibold mb-1 tracking-wide">Login Email</p>
                          <p className="text-emerald-300 font-mono font-bold">
                            {revealCredentials && demoTicket!.demoEmail
                              ? demoTicket!.demoEmail
                              : maskEmail(demoTicket!.demoEmail ?? "demo.xxxx@unipos.mt")}
                          </p>
                        </div>
                        <div className="bg-black/40 border border-emerald-500/20 rounded-xl p-4">
                          <p className="text-[10px] uppercase text-gray-500 font-semibold mb-1 tracking-wide">Password</p>
                          <p className="text-emerald-300 font-mono font-bold">
                            {revealCredentials && demoTicket!.demoPassword
                              ? demoTicket!.demoPassword
                              : maskPassword(demoTicket!.demoPassword ?? "Demo@0000")}
                          </p>
                        </div>
                        <div className="bg-black/40 border border-emerald-500/20 rounded-xl p-4">
                          <p className="text-[10px] uppercase text-gray-500 font-semibold mb-1 tracking-wide">Trial Period</p>
                          <p className="text-white font-bold">{demoTicket!.trialDays} days</p>
                        </div>
                        <div className="bg-black/40 border border-emerald-500/20 rounded-xl p-4">
                          <p className="text-[10px] uppercase text-gray-500 font-semibold mb-1 tracking-wide">Trial Ends</p>
                          <p className="text-white font-bold">
                            {demoTicket!.trialEndsAt
                              ? new Date(demoTicket!.trialEndsAt).toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : "—"}
                          </p>
                        </div>
                      </div>

                      {/* Onboarding Billing Invoice */}
                      {matchingInvoice && (
                        <div className="mt-4 p-4 rounded-xl border bg-black/40 border-purple-500/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 font-mono text-xs">
                          <div>
                            <p className="text-[10px] uppercase text-purple-400 font-semibold mb-0.5 tracking-wide">Onboarding SaaS Invoice ({matchingInvoice.id})</p>
                            <p className="text-gray-300 text-xs">Billed Plan: <span className="text-white font-bold">{matchingInvoice.plan}</span> · Amount: <span className="text-white font-bold">${matchingInvoice.amount}</span></p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500">Payment status:</span>
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                              matchingInvoice.status === "Paid" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" :
                              "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                            }`}>
                              {matchingInvoice.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Reveal button */}
                      <button
                        id="reveal-credentials-btn"
                        onClick={() => setRevealCredentials((v) => !v)}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border ${
                          revealCredentials
                            ? "bg-gray-700/50 border-gray-600 text-gray-200 hover:bg-gray-700"
                            : "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30"
                        }`}
                      >
                        {revealCredentials ? <EyeOff size={15} /> : <Eye size={15} />}
                        {revealCredentials ? "Hide Credentials" : "Reveal Credentials"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── REJECTED card ── */}
              {ticketType === "demo" && demoTicket!.status === "Rejected" && (
                <div className="bg-red-950/20 border border-red-500/40 rounded-2xl p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <XCircle size={28} className="text-red-400 shrink-0" />
                    <div>
                      <h3 className="text-red-300 font-black text-base">Request Declined</h3>
                      <p className="text-gray-400 text-xs">Your demo request was not approved at this time.</p>
                    </div>
                  </div>
                  {demoTicket!.rejectedReason && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                      <p className="text-[10px] uppercase text-gray-500 font-semibold mb-1.5 tracking-wide">Reason</p>
                      <p className="text-red-200 text-sm leading-relaxed">{demoTicket!.rejectedReason}</p>
                    </div>
                  )}
                  <p className="text-gray-500 text-xs mt-4">
                    If you believe this was a mistake, please use the chat below or contact{" "}
                    <a href="mailto:sales@mtunipos.com" className="text-brand-sky hover:underline">
                      sales@mtunipos.com
                    </a>
                    .
                  </p>
                </div>
              )}

              {/* ── PENDING / REVIEWED info ── */}
              {ticketType === "demo" && (demoTicket!.status === "Pending" || demoTicket!.status === "Reviewed") && (
                <div className="bg-brand-dark-surface border border-brand-dark-border rounded-2xl p-6 sm:p-8 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm mb-1">
                      {demoTicket!.status === "Pending" ? "Awaiting Review" : "Under Active Review"}
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      {demoTicket!.status === "Pending"
                        ? "Our team has received your request and will review it shortly. You'll be notified once a decision is made."
                        : "Our team is currently evaluating your request. A decision will be communicated here and via the chat below."}
                    </p>
                    <div className="flex items-center gap-1.5 mt-3 text-brand-sky text-xs font-semibold">
                      <ArrowRight size={12} />
                      <span>Check back soon or send us a message below.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Messages / Support Chat ── */}
              <div className="bg-brand-dark-surface border border-brand-dark-border rounded-2xl overflow-hidden">
                {/* Chat header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-brand-dark-border">
                  <div className="w-8 h-8 rounded-full bg-brand-sky/15 border border-brand-sky/40 flex items-center justify-center">
                    <MessageCircle size={15} className="text-brand-sky" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Support Chat</p>
                    <p className="text-gray-500 text-[10px]">
                      Questions? Chat with us below using your ticket number
                    </p>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>

                {/* Messages */}
                <div className="px-5 py-4 space-y-4 max-h-80 overflow-y-auto bg-black/30">
                  {(ticketType === "demo" ? demoTicket!.messages : supportTicket!.replies).length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle size={28} className="text-gray-700 mx-auto mb-2" />
                      <p className="text-gray-600 text-xs">No messages yet. Start the conversation below.</p>
                    </div>
                  ) : (
                    (ticketType === "demo" ? demoTicket!.messages : supportTicket!.replies).map((msg, idx) => (
                      <ChatBubble
                        key={idx}
                        sender={msg.sender}
                        message={msg.message}
                        date={msg.date}
                      />
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Message input */}
                <div className="px-5 pb-5 pt-3 border-t border-brand-dark-border/50 bg-brand-dark-surface space-y-3">
                  {messageSent && (
                    <div className="flex items-center gap-2 text-emerald-400 text-xs animate-fade-in-up">
                      <CheckCircle2 size={13} />
                      <span>Message sent! We'll respond shortly.</span>
                    </div>
                  )}
                  <textarea
                    id="chat-message-textarea"
                    rows={3}
                    placeholder="Type your message here…"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSendMessage();
                    }}
                    className="w-full bg-black border border-brand-dark-border rounded-xl p-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-sky resize-none transition-colors"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600 text-[10px]">Press Ctrl+Enter to send</p>
                    <button
                      id="send-message-btn"
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className="inline-flex items-center gap-2 bg-brand-sky hover:bg-brand-sky-light disabled:bg-gray-700 disabled:text-gray-500 text-black font-black text-xs px-5 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                    >
                      <Send size={13} />
                      Send Message
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
