"use client";

import React, { useState } from "react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { useGlobalContext } from "@/context/global-context";
import {
  CheckCircle2,
  Laptop,
  ShieldCheck,
  Receipt,
  Printer,
  ExternalLink,
  X,
  AlertTriangle,
} from "lucide-react";

export default function DemoPage() {
  const { addDemoRequest } = useGlobalContext();

  const [demoForm, setDemoForm] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    country: "Pakistan",
    businessType: "POS (Supermarkets & Retail)",
  });

  const [submitted, setSubmitted]               = useState(false);
  const [ticketNo, setTicketNo]                 = useState("");
  const [ticketTime, setTicketTime]             = useState("");
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Keep a snapshot of the form data for the receipt (since form resets after submit)
  const [snapshot, setSnapshot] = useState(demoForm);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoForm.name || !demoForm.email || !demoForm.businessName) return;
    setErrorMsg(null);

    try {
      const no = addDemoRequest(demoForm);
      setSnapshot({ ...demoForm });
      setTicketNo(no);
      setTicketTime(
        new Date().toLocaleString("en-PK", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setSubmitted(true);
      setShowReceiptModal(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit demo request.");
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setErrorMsg(null);
    setTicketNo("");
    setDemoForm({
      name: "",
      businessName: "",
      email: "",
      phone: "",
      country: "Pakistan",
      businessType: "POS (Supermarkets & Retail)",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-black font-sans text-gray-100">
      <SiteHeader />

      <section className="relative py-24 flex-grow flex items-center justify-center overflow-hidden border-b border-brand-dark-border">
        {/* Glow background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.06),transparent_60%)] pointer-events-none" />

        <div className="max-w-xl w-full mx-auto px-4 sm:px-6 relative z-10">
          <div className="bg-brand-dark-surface/80 border border-brand-sky/20 rounded-3xl p-8 sky-glow glass-panel">

            {/* Header */}
            <div className="text-center mb-8">
              <Laptop className="text-brand-sky mx-auto mb-3" size={32} />
              <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
                {submitted ? "Request Submitted!" : "Configure Sandbox"}
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                {submitted
                  ? "Your demo request has been received. Save your ticket number to track status."
                  : "MT Core provides an instant secure demo environment sharded specifically for your industry line. The core technology behind your business."}
              </p>
            </div>

            {/* ── Success State ── */}
            {submitted ? (
              <div className="space-y-4 animate-fade-in-up">
                {/* Ticket Number box */}
                <div className="bg-black/60 border border-brand-sky/40 rounded-2xl px-6 py-5 text-center">
                  <p className="text-[9px] uppercase tracking-widest text-gray-500 mb-1.5 font-semibold">
                    Your Ticket Number
                  </p>
                  <p className="text-3xl font-black font-mono text-brand-sky tracking-widest">
                    {ticketNo}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-2">
                    Save this number — you&apos;ll need it to track your demo request
                  </p>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setShowReceiptModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-brand-sky hover:bg-brand-sky-light text-black font-black text-xs uppercase rounded-xl transition-all transform hover:scale-[1.01]"
                  >
                    <Receipt size={14} /> View Full Receipt
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => window.print()}
                      className="flex items-center justify-center gap-1.5 py-2.5 border border-brand-dark-border text-gray-300 text-[10px] font-black uppercase rounded-xl hover:bg-white/5 transition"
                    >
                      <Printer size={12} /> Print
                    </button>
                    <a
                      href="/tracking"
                      className="flex items-center justify-center gap-1.5 py-2.5 border border-brand-dark-border text-gray-300 text-[10px] font-black uppercase rounded-xl hover:bg-white/5 transition"
                    >
                      <ExternalLink size={12} /> Track Status
                    </a>
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="w-full text-[10px] text-gray-600 hover:text-gray-400 transition pt-2"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              /* ── Form ── */
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {errorMsg && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                    <AlertTriangle size={16} className="shrink-0 text-red-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mian Talal"
                    value={demoForm.name}
                    onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                    className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white focus:outline-none focus:border-brand-sky"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Al-Fatah Stores"
                    value={demoForm.businessName}
                    onChange={(e) => setDemoForm({ ...demoForm, businessName: e.target.value })}
                    className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white focus:outline-none focus:border-brand-sky"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. sales@company.com"
                    value={demoForm.email}
                    onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                    className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white focus:outline-none focus:border-brand-sky"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +92 321 5550100"
                    value={demoForm.phone}
                    onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                    className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white focus:outline-none focus:border-brand-sky"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                      Country
                    </label>
                    <select
                      value={demoForm.country}
                      onChange={(e) => setDemoForm({ ...demoForm, country: e.target.value })}
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white focus:outline-none focus:border-brand-sky"
                    >
                      <option>Pakistan</option>
                      <option>Saudi Arabia</option>
                      <option>United Kingdom</option>
                      <option>United States</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                      Software Line of Business
                    </label>
                    <select
                      value={demoForm.businessType}
                      onChange={(e) => setDemoForm({ ...demoForm, businessType: e.target.value })}
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white focus:outline-none focus:border-brand-sky font-bold"
                    >
                      <option value="POS (Supermarkets & Retail)">🏬 POS (Supermarkets &amp; Retail Stores)</option>
                      <option value="HRMS (Human Resources & Payroll)">👥 HRMS (Human Resources &amp; Payroll)</option>
                      <option value="SMS (School & College ERP)">🎓 SMS (School &amp; College Management ERP)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-sky hover:bg-brand-sky-light text-black font-black uppercase text-xs tracking-wider rounded transition-all transform hover:scale-[1.01]"
                >
                  Confirm Demo Allocation
                </button>
              </form>
            )}

            <div className="flex items-center gap-1.5 justify-center text-[10px] text-gray-500 mt-6 border-t border-brand-dark-border/40 pt-4">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Simulated SSL Sharded Security Standard</span>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />

      {/* ══════════════════════════════════════════════════════════════
          THERMAL SLIP RECEIPT MODAL
      ══════════════════════════════════════════════════════════════ */}
      {showReceiptModal && ticketNo && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.82)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowReceiptModal(false); }}
        >
          <div
            id="demo-ticket-receipt"
            className="relative bg-white dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl max-w-sm w-full border border-gray-200 dark:border-brand-sky/20 overflow-hidden"
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            {/* Close */}
            <button
              onClick={() => setShowReceiptModal(false)}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition z-10"
              aria-label="Close"
            >
              <X size={14} className="text-gray-600 dark:text-gray-300" />
            </button>

            {/* Header band */}
            <div className="bg-brand-sky px-6 py-5 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Receipt size={18} className="text-black" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black">
                  MT Core
                </span>
              </div>
              <p className="text-[9px] text-black/70 uppercase tracking-widest">
                The core technology behind your business.
              </p>
            </div>

            {/* Zigzag tear edge */}
            <div
              className="h-3 bg-white dark:bg-[#0f172a]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 50% 0%, #0ea5e9 12px, transparent 13px)",
                backgroundSize: "24px 12px",
                backgroundRepeat: "repeat-x",
              }}
            />

            <div className="px-6 pb-2">
              {/* Ticket Number */}
              <div className="text-center mb-5">
                <p className="text-[9px] uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                  Ticket Number
                </p>
                <p
                  className="text-2xl font-black text-brand-sky tracking-widest"
                  style={{ fontFamily: "'Courier New', monospace" }}
                >
                  {ticketNo}
                </p>
              </div>

              <div className="border-t border-dashed border-gray-300 dark:border-gray-700 mb-4" />

              {/* Details */}
              <div className="space-y-2.5 text-[10px] mb-4">
                {[
                  { label: "Business", value: snapshot.businessName },
                  { label: "Contact",  value: snapshot.name },
                  { label: "Email",    value: snapshot.email },
                  ...(snapshot.phone ? [{ label: "Phone", value: snapshot.phone }] : []),
                  { label: "Type",     value: snapshot.businessType },
                  { label: "Country",  value: snapshot.country },
                  { label: "Submitted",value: ticketTime },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {label}
                    </span>
                    <span className="font-bold text-right max-w-[55%] truncate">{value}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-gray-300 dark:border-gray-700 mb-4" />

              {/* Status badge */}
              <div className="flex justify-center mb-4">
                <span className="inline-flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/40 text-amber-500 dark:text-amber-400 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  PENDING REVIEW
                </span>
              </div>

              {/* Note */}
              <p className="text-[9px] text-gray-500 dark:text-gray-400 text-center leading-relaxed mb-5">
                Please save your ticket number. You can track your request status at any time on our website.
              </p>

              {/* Zigzag bottom edge */}
              <div
                className="h-3 -mx-6 mb-2"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 50% 100%, #0ea5e9 12px, transparent 13px)",
                  backgroundSize: "24px 12px",
                  backgroundRepeat: "repeat-x",
                }}
              />

              {/* Action buttons */}
              <div className="flex gap-2 pb-5">
                <button
                  onClick={() => window.print()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-brand-sky text-black text-[10px] font-black uppercase rounded-xl hover:bg-brand-sky-light transition"
                >
                  <Printer size={12} /> Print Ticket
                </button>
                <a
                  href="/tracking"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-gray-300 dark:border-brand-dark-border text-gray-700 dark:text-gray-300 text-[10px] font-black uppercase rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition"
                >
                  <ExternalLink size={12} /> Track Ticket
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
