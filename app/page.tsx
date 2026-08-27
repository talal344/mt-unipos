"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useGlobalContext } from "@/context/global-context";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import SoftwareShowcase from "@/components/software-showcase";
import {
  Laptop, ArrowRight, CheckCircle2, Star, TrendingUp, Zap, Check,
  Layers, Award, ShieldCheck, BarChart3, Users, Package, Receipt,
  Brain, Smartphone, Globe, CreditCard, Building2, Banknote,
  HeadphonesIcon, RefreshCw, Database, Clock, ChevronRight,
  Play, Sparkles, Activity, Lock, Server, GraduationCap,
  X, Printer, ExternalLink
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const industries = [
  { name: "Super Markets",      icon: Layers,    desc: "Multi-lane barcode checkout, weight-scale integration, batch-expiry controls & loyalty tiers." },
  { name: "Pharmacy Stores",    icon: Zap,       desc: "Drug batch tracking, expiry alerts 60 days prior, prescription management & supplier POs." },
  { name: "Restaurants / Cafés",icon: Award,     desc: "Visual table grid, kitchen display KDS, waiter app, split bills & real-time order routing." },
  { name: "Clothing Stores",    icon: Sparkles,  desc: "Color/size matrix inventory, promotions engine, CRM loyalty points & barcode label printing." },
  { name: "Wholesale Business", icon: TrendingUp,desc: "Bulk discount matrix, dealer credit ledger, due-payment tracker & purchase order management." },
];

const features = [
  { icon: ShieldCheck,   color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", title: "Enterprise Security",     desc: "JWT auth, role-based permissions, 2FA OTP, and full audit trail for every action." },
  { icon: Zap,           color: "text-yellow-400",  bg: "bg-yellow-500/10  border-yellow-500/20",  title: "Lightning Fast POS",     desc: "Sub-second barcode scan, cart checkout, thermal receipt, and stock deduction." },
  { icon: BarChart3,     color: "text-brand-sky",   bg: "bg-sky-500/10     border-sky-500/20",     title: "Real-Time Analytics",   desc: "Live revenue dashboard, top-products ranking, staff performance, and hourly trends." },
  { icon: Package,       color: "text-purple-400",  bg: "bg-purple-500/10  border-purple-500/20",  title: "Smart Inventory",        desc: "Multi-branch stock sync, min-stock alerts, automatic reorder suggestions." },
  { icon: Users,         color: "text-pink-400",    bg: "bg-pink-500/10    border-pink-500/20",    title: "CRM & Loyalty",          desc: "Customer profiles, purchase history, points tiers, credit accounts & dues recovery." },
  { icon: Receipt,       color: "text-orange-400",  bg: "bg-orange-500/10  border-orange-500/20",  title: "Double-Entry Ledger",    desc: "Auto-posted GL journals, P&L statement, balance sheet, and expense tracking." },
  { icon: Brain,         color: "text-indigo-400",  bg: "bg-indigo-500/10  border-indigo-500/20",  title: "AI Forecasting",         desc: "Revenue prediction, slow-mover detection, customer lifetime value, reorder alerts." },
  { icon: Smartphone,    color: "text-teal-400",    bg: "bg-teal-500/10    border-teal-500/20",    title: "Mobile REST API",        desc: "Flutter / React Native SDK, barcode scanner integration, offline-sync support." },
  { icon: Globe,         color: "text-blue-400",    bg: "bg-blue-500/10    border-blue-500/20",    title: "Multi-Branch Network",   desc: "Centralized stock, staff, and accounting across unlimited store branches." },
  { icon: CreditCard,    color: "text-green-400",   bg: "bg-green-500/10   border-green-500/20",   title: "Payment Methods",        desc: "Cash, card, JazzCash, EasyPaisa, bank transfer, and credit sales all in one." },
  { icon: Banknote,      color: "text-amber-400",   bg: "bg-amber-500/10   border-amber-500/20",   title: "Payroll & HR",           desc: "Staff attendance, salary slips, advance requests, and leave management." },
  { icon: HeadphonesIcon,color: "text-rose-400",    bg: "bg-rose-500/10    border-rose-500/20",    title: "24/7 Support",           desc: "Dedicated account manager, in-app chat, phone support, and knowledge base." },
];

const pricingPlans = [
  {
    name: "Starter", priceMonthly: 19, highlight: false,
    desc: "Designed for small single-store kiosks, bookshops & gift stores.",
    features: ["1 Store Branch","2 Cashier Terminals","Barcode Printing","Standard Inventory","Basic Sales Reports","Email Support"],
  },
  {
    name: "Professional", priceMonthly: 49, highlight: true,
    desc: "Perfect for supermarkets, clothing chains & high-volume pharmacies.",
    features: ["3 Integrated Branches","Unlimited Cashiers","Multi-Branch Stock Transfers","Pharmacy Expiry Alerts","Double-Entry Accounting","AI Sales Analytics","WhatsApp & SMS Alerts","Priority 24/7 Support"],
  },
  {
    name: "Enterprise", priceMonthly: 99, highlight: false,
    desc: "The ultimate ERP for massive franchise chains & corporate groups.",
    features: ["Unlimited Branches","Global Warehouse Stock","AI Forecasting Engine","Smart Reordering","Android / iOS API","White-label SSL Subdomain","Dedicated Account Manager","Custom Integrations"],
  },
];

const testimonials = [
  { stars: 5, name: "Dr. Zainab Ghafoor",  role: "Director, MedCare Pharmacy Networks", initials: "DR", color: "bg-brand-sky",
    text: "MT Core solved our worst stock leakages. The drug batch expiry tracker alerts us 60 days before expiry, saving thousands in waste. Excellent ERP!" },
  { stars: 5, name: "Mian Talal",          role: "CEO & Owner, Al-Fatah Superstores",   initials: "MT", color: "bg-pink-500",
    text: "Lightning-fast POS terminal, retail/wholesale pricing toggle, cash drawers auto-feeding balance sheets. Mian Talal and team built a powerhouse." },
  { stars: 5, name: "Kamran Ishfaq",       role: "GM, Kamran Brothers Wholesale",        initials: "KI", color: "bg-emerald-500",
    text: "Managing 200+ dealers' credit accounts was a nightmare. Now MT Core tracks every rupee. The due-payment recovery feature alone paid for itself." },
  { stars: 5, name: "Sana Mirza",          role: "Owner, Glamour Clothing Boutique",     initials: "SM", color: "bg-purple-500",
    text: "The color/size matrix inventory is exactly what boutiques need. Barcode labels, loyalty points, CRM — we scaled from 1 to 3 branches effortlessly." },
];

const statsBar = [
  { value: "500+",  label: "Businesses"      },
  { value: "50K+",  label: "Daily Txns"      },
  { value: "99.9%", label: "Uptime"          },
  { value: "12+",   label: "Industries"      },
  { value: "3",     label: "Countries"       },
  { value: "24/7",  label: "Support"         },
];

const howItWorks = [
  { step: "01", title: "Request Demo",      icon: Play,       desc: "Fill in your business details and schedule a personalized walkthrough session.",   color: "text-brand-sky",  border: "border-brand-sky/30"  },
  { step: "02", title: "Tenant Setup",      icon: Building2,  desc: "We provision your isolated SaaS tenant with your products, branches & staff.", color: "text-emerald-400", border: "border-emerald-500/30"},
  { step: "03", title: "Train Your Team",   icon: Users,      desc: "Short 2-hour onboarding session. Cashiers can sell on day one.",               color: "text-purple-400",  border: "border-purple-500/30" },
  { step: "04", title: "Go Live & Scale",   icon: TrendingUp, desc: "Start transacting, track analytics live, and expand to more branches anytime.", color: "text-yellow-400",  border: "border-yellow-500/30" },
];

export default function HomePage() {
  const { addDemoRequest, theme } = useGlobalContext();
  const isLight = theme === "light";
  const [billingCycle, setBillingCycle]         = useState<"monthly"|"yearly">("yearly");
  const [selectedIndustry, setSelectedIndustry]   = useState("Super Markets");
  const [demoSubmitted, setDemoSubmitted]         = useState(false);
  const [demoTicketNo, setDemoTicketNo]           = useState("");
  const [demoTicketTime, setDemoTicketTime]       = useState("");
  const [showReceiptModal, setShowReceiptModal]   = useState(false);
  const [demoForm, setDemoForm]                   = useState({
    name: "", businessName: "", email: "", phone: "", country: "Pakistan", businessType: "POS (Supermarkets, Retail & Restaurant ERP)"
  });
  const [counter, setCounter] = useState({ businesses: 0, txns: 0, uptime: 0 });

  // Animated counters
  useEffect(() => {
    const timer = setTimeout(() => setCounter({ businesses: 500, txns: 50000, uptime: 99.9 }), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoForm.name || !demoForm.email || !demoForm.businessName) return;
    const ticketNo = addDemoRequest(demoForm);
    setDemoSubmitted(true);
    setDemoTicketNo(ticketNo);
    setShowReceiptModal(true);
    setDemoTicketTime(new Date().toLocaleString("en-PK", {
      year: "numeric", month: "short", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    }));
  };

  return (
    <div className={`flex flex-col min-h-screen font-sans transition-colors duration-200 ${
      isLight ? "bg-slate-50 text-slate-900" : "bg-black text-gray-100"
    }`}>
      <SiteHeader />

      {/* ══════════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════════ */}
      <section className={`relative pt-24 pb-28 overflow-hidden border-b transition-colors duration-200 ${
        isLight ? "bg-white border-slate-200" : "border-brand-dark-border"
      }`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.10),transparent_65%)] pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-brand-sky/4 rounded-full blur-[130px] pointer-events-none" />

        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 text-center relative z-10">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 shadow-sm animate-fade-in-up ${
            isLight ? "bg-sky-50 border border-sky-200 text-sky-700" : "bg-[#0b121e] border border-sky-500/30 text-sky-400 shadow-sky-500/10"
          }`}>
            <Sparkles className="text-sky-500 animate-bounce" size={14} />
            <span className="text-xs font-black uppercase tracking-wider">
              MT Core 3.0 — The Unified Autonomous Enterprise Ecosystem
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-tight mb-6">
            <span className="bg-gradient-to-r from-sky-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent">
              One Unified Engine.
            </span>
            <br />
            <span className={isLight ? "text-slate-900" : "text-white"}>Three Standalone Super-Systems.</span>
          </h1>

          {/* 3 Flagship Pills */}
          <div className="flex flex-wrap justify-center items-center gap-3 mb-8">
            <span className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs border ${
              isLight ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-sky-500/10 text-sky-400 border-sky-500/30"
            }`}>
              <Laptop size={14} /> 🏬 Retail &amp; Supermarket POS ERP
            </span>
            <span className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs border ${
              isLight ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
            }`}>
              <Users size={14} /> 👥 Corporate HRMS &amp; Payroll
            </span>
            <span className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs border ${
              isLight ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-purple-500/10 text-purple-400 border-purple-500/30"
            }`}>
              <GraduationCap size={14} /> 🎓 School &amp; Campus ERP (SMS)
            </span>
          </div>

          <p className={`max-w-2xl mx-auto text-sm sm:text-base leading-relaxed mb-10 ${
            isLight ? "text-slate-600 font-medium" : "text-gray-400"
          }`}>
            MT Core powers high-volume retail transactions, corporate employee lifecycles, and academic institutional governance through independent, ultra-secure, multi-tenant architectures.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-emerald-500 to-purple-500 px-8 py-4 text-sm font-black text-white hover:opacity-95 transition-all transform hover:scale-105 shadow-xl shadow-sky-500/20">
              Request Free Demo Sandbox <ArrowRight size={16} />
            </Link>
            <Link href="/login"
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border px-8 py-4 text-sm font-bold transition ${
                isLight ? "border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-sm" : "border-gray-800 bg-[#0b121e] hover:bg-[#121c2e] text-white"
              }`}>
              <Laptop size={14} /> Instant Access Portals
            </Link>
          </div>

          {/* Animated Product Demo */}
          <div className="relative w-full max-w-5xl xl:max-w-6xl mx-auto mt-12 mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-500/15 via-emerald-500/10 to-purple-500/15 blur-3xl opacity-60 rounded-[40px]"></div>
            <div className={`relative border rounded-[24px] shadow-2xl overflow-hidden ${
              isLight ? "bg-white border-slate-300 ring-1 ring-slate-200/70 shadow-slate-300/40" : "bg-[#09090b] border-white/10 shadow-brand-sky/10 ring-1 ring-white/5"
            }`}>
              {/* Fake Window Header */}
              <div className={`px-4 py-3 flex items-center gap-2 border-b ${
                isLight ? "bg-slate-100 border-slate-200" : "bg-[#18181b] border-white/5"
              }`}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className={`mx-auto flex items-center gap-2 text-[10px] font-mono px-3 py-1 rounded border ${
                  isLight ? "text-slate-700 bg-white border-slate-300 font-bold" : "text-gray-300 bg-black/40 border-white/10"
                }`}>
                  <Lock size={10} className="text-emerald-500" />
                  pos.mtcore.xyz/pos
                </div>
              </div>
              {/* Fake POS Interface */}
              <div className="flex flex-col sm:flex-row min-h-[350px]">
                {/* Left: Products */}
                <div className={`w-full sm:w-2/3 p-4 overflow-hidden relative ${isLight ? "bg-slate-50" : "bg-[#09090b]"}`}>
                  <div className="grid grid-cols-3 gap-3">
                    {/* Animated Item 1 */}
                    <div className={`border p-3 rounded-xl flex flex-col items-center justify-center h-28 relative group ${
                      isLight ? "bg-white border-slate-200 shadow-xs" : "bg-[#18181b] border-white/10"
                    }`}>
                      <div className="w-10 h-10 bg-sky-500/15 rounded-full mb-2 flex items-center justify-center"><Package size={16} className="text-sky-600" /></div>
                      <div className={`text-[10px] font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Wireless Mouse</div>
                      <div className={`text-[10px] ${isLight ? "text-slate-600 font-bold" : "text-gray-400"}`}>$29.99</div>
                      {/* Scan Laser Animation */}
                      <div className="absolute inset-0 border border-sky-500 rounded-xl opacity-0 animate-[scan_3s_ease-in-out_infinite]"></div>
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] opacity-0 animate-[laser_3s_ease-in-out_infinite]"></div>
                    </div>
                    {/* Item 2 */}
                    <div className={`border p-3 rounded-xl flex flex-col items-center justify-center h-28 ${
                      isLight ? "bg-white border-slate-200 shadow-xs" : "bg-[#18181b] border-white/10"
                    }`}>
                      <div className="w-10 h-10 bg-purple-500/15 rounded-full mb-2 flex items-center justify-center"><Laptop size={16} className="text-purple-600" /></div>
                      <div className={`text-[10px] font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Mechanical Keyboard</div>
                      <div className={`text-[10px] ${isLight ? "text-slate-600 font-bold" : "text-gray-400"}`}>$89.99</div>
                    </div>
                    {/* Item 3 */}
                    <div className={`border p-3 rounded-xl flex flex-col items-center justify-center h-28 ${
                      isLight ? "bg-white border-slate-200 shadow-xs" : "bg-[#18181b] border-white/10"
                    }`}>
                      <div className="w-10 h-10 bg-emerald-500/15 rounded-full mb-2 flex items-center justify-center"><HeadphonesIcon size={16} className="text-emerald-600" /></div>
                      <div className={`text-[10px] font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Gaming Headset</div>
                      <div className={`text-[10px] ${isLight ? "text-slate-600 font-bold" : "text-gray-400"}`}>$59.99</div>
                    </div>
                  </div>
                  
                  {/* Floating Add to Cart notification */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 opacity-0 animate-[pop-in_3s_ease-in-out_infinite] shadow-md">
                    <CheckCircle2 size={12} /> Added to Cart
                  </div>
                </div>

                {/* Right: Cart Panel */}
                <div className={`w-full sm:w-1/3 p-4 flex flex-col justify-between ${
                  isLight ? "bg-white border-t sm:border-t-0 sm:border-l border-slate-200 text-slate-900" : "bg-[#121215] border-t sm:border-t-0 sm:border-l border-white/10 text-white"
                }`}>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <div className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Current Order #1042</div>
                      <div className="text-[10px] bg-emerald-500/15 text-emerald-600 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">Walk-in</div>
                    </div>
                    {/* Cart Item Row */}
                    <div className={`flex items-center justify-between p-2 rounded-lg border text-xs relative overflow-hidden ${
                      isLight ? "bg-slate-50 border-slate-200" : "bg-[#18181b] border-white/10"
                    }`}>
                      <div className="absolute inset-0 bg-sky-500/10 opacity-0 animate-[flash_3s_ease-in-out_infinite]"></div>
                      <div className="relative z-10">
                        <div className={`font-bold text-[10px] ${isLight ? "text-slate-900" : "text-white"}`}>Wireless Mouse</div>
                        <div className={`text-[8px] ${isLight ? "text-slate-500" : "text-gray-500"}`}>Qty: 1</div>
                      </div>
                      <div className={`text-[10px] font-mono font-bold relative z-10 ${isLight ? "text-sky-600" : "text-sky-400"}`}>$29.99</div>
                    </div>
                  </div>
                  <div className={`pt-3 border-t ${isLight ? "border-slate-200" : "border-white/10"}`}>
                    <div className={`flex justify-between items-center text-xs mb-1 ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
                      <span>Subtotal</span><span>$29.99</span>
                    </div>
                    <div className={`flex justify-between items-center text-xs mb-2 ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
                      <span>Tax (10%)</span><span>$3.00</span>
                    </div>
                    <div className={`flex justify-between items-center text-sm font-bold mb-4 ${isLight ? "text-slate-900" : "text-white"}`}>
                      <span>Total</span><span className="text-sky-500 font-black">$32.99</span>
                    </div>
                    <button className="w-full bg-sky-500 hover:bg-sky-400 text-white text-xs font-black py-2.5 rounded-xl flex items-center justify-center gap-2 relative overflow-hidden group shadow-md transition cursor-pointer">
                      <span className="relative z-10">Pay Now</span>
                      <ArrowRight size={14} className="relative z-10" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Inline keyframes for the demo animations */}
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes laser {
                0%, 20% { opacity: 0; top: 0; }
                30% { opacity: 1; top: 0; }
                50% { opacity: 1; top: 100%; }
                60% { opacity: 0; top: 100%; }
                100% { opacity: 0; }
              }
              @keyframes scan {
                0%, 25% { opacity: 0; }
                30%, 55% { opacity: 1; }
                60%, 100% { opacity: 0; }
              }
              @keyframes pop-in {
                0%, 50% { opacity: 0; transform: translate(-50%, 10px) scale(0.9); }
                55% { opacity: 1; transform: translate(-50%, 0) scale(1.1); }
                60%, 90% { opacity: 1; transform: translate(-50%, 0) scale(1); }
                95%, 100% { opacity: 0; transform: translate(-50%, -10px) scale(0.9); }
              }
              @keyframes flash {
                0%, 50% { opacity: 0; }
                55% { opacity: 1; }
                65% { opacity: 0; }
                100% { opacity: 0; }
              }
            `}} />
          </div>

        </div>
      </section>

      {/* ── MTCore Multi-SaaS Software Showcase ── */}
      <SoftwareShowcase />

      {/* ══════════════════════════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════════════════════════ */}
      <section className={`py-10 border-b transition-colors duration-200 ${
        isLight ? "bg-white border-slate-200 text-slate-900" : "bg-brand-dark-surface/30 border-brand-dark-border"
      }`}>
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            {statsBar.map(s => (
              <div key={s.label}>
                <div className="text-2xl sm:text-3xl font-black font-mono text-sky-500">{s.value}</div>
                <div className={`text-[10px] uppercase tracking-wider mt-0.5 font-bold ${
                  isLight ? "text-slate-500" : "text-gray-500"
                }`}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          INDUSTRIES & SOFTWARE SUITES
      ══════════════════════════════════════════════════════════════════════ */}
      <section className={`py-20 border-b transition-colors duration-200 ${
        isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-brand-dark-surface/20 border-brand-dark-border"
      }`}>
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="text-center mb-12">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 border ${
              isLight ? "bg-white border-slate-200 text-slate-700 shadow-xs" : "bg-brand-dark-surface border-brand-dark-border text-gray-400"
            }`}>
              <Layers size={12} className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Industries &amp; Software Lines</span>
            </div>
            <h2 className={`text-2xl sm:text-4xl font-black mb-4 ${isLight ? "text-slate-900" : "text-white"}`}>Designed for Multi-Industry Operations</h2>
            <p className={`text-xs sm:text-sm max-w-xl mx-auto ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
              MTCore powers retail stores, supermarkets, corporate HR &amp; payroll operations, educational institutions, healthcare clinics, and real estate networks.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {industries.map(ind => {
              const Icon = ind.icon;
              const active = selectedIndustry === ind.name;
              return (
                <button key={ind.name} onClick={() => setSelectedIndustry(ind.name)}
                  className={`p-4 rounded-2xl text-left border transition-all duration-300 cursor-pointer ${
                    active
                      ? isLight
                        ? "bg-emerald-50 border-emerald-500 shadow-md text-slate-900"
                        : "bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-900/10"
                      : isLight
                      ? "bg-white border-slate-200 hover:border-emerald-400 text-slate-800 shadow-xs"
                      : "bg-black/40 border-brand-dark-border/60 hover:border-emerald-500/30"
                  }`}>
                  <div className={`p-2.5 rounded-lg w-fit mb-3 ${
                    active ? "bg-emerald-500 text-white font-bold" : isLight ? "bg-slate-100 text-slate-600" : "bg-brand-dark-border text-gray-400"
                  }`}>
                    <Icon size={16} />
                  </div>
                  <h4 className={`font-bold text-xs mb-1 ${isLight ? "text-slate-900" : "text-white"}`}>{ind.name}</h4>
                  <p className={`text-[9px] leading-snug ${isLight ? "text-slate-500 font-medium" : "text-gray-500"}`}>{ind.desc}</p>
                </button>
              );
            })}
          </div>

          <div className={`border rounded-xl p-4 text-center text-[10px] ${
            isLight ? "bg-white border-slate-200 shadow-xs" : "bg-black/50 border-brand-dark-border"
          }`}>
            <span className={`mr-2 font-bold ${isLight ? "text-slate-500" : "text-gray-500"}`}>Supported Enterprise Sectors:</span>
            <span className="inline-flex flex-wrap justify-center gap-1.5">
              {["Supermarkets & Departmental Stores","HR & Payroll Management","Schools & Colleges","Hospitals & Clinics","Real Estate & Property","Retail Boutiques","Pharmacies","Restaurants & Cafes","Wholesale & Distribution"].map(t => (
                <span key={t} className={`border px-2.5 py-1 rounded-lg font-bold ${
                  isLight ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-brand-dark-surface border-brand-dark-border/50 text-gray-300"
                }`}>{t}</span>
              ))}
            </span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FEATURES GRID (12 cards)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className={`py-20 border-b relative overflow-hidden transition-colors duration-200 ${
        isLight ? "bg-white border-slate-200" : "border-brand-dark-border"
      }`}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-emerald-500/3 rounded-full blur-[120px] pointer-events-none" />
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
          <div className="text-center mb-12">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 border ${
              isLight ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-brand-dark-surface border-brand-dark-border text-gray-400"
            }`}>
              <Sparkles size={11} className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Enterprise Platform Features</span>
            </div>
            <h2 className={`text-2xl sm:text-4xl font-black mb-4 ${isLight ? "text-slate-900" : "text-white"}`}>Everything Your Enterprise Needs</h2>
            <p className={`text-xs sm:text-sm max-w-xl mx-auto ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
              Multi-SaaS architecture — from POS barcode checkout and HR payroll to real-time analytics and double-entry accounting.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {features.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.title}
                  className={`rounded-2xl p-5 flex items-start gap-4 group transition-all duration-200 hover:scale-[1.02] border ${
                    isLight
                      ? "bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-white shadow-xs"
                      : `bg-brand-dark-surface/40 ${f.bg} hover:shadow-lg`
                  }`}>
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                    isLight ? "bg-white border-slate-200 shadow-xs" : f.bg
                  }`}>
                    <Icon size={16} className={f.color} />
                  </div>
                  <div>
                    <h4 className={`text-xs font-black mb-1 transition ${
                      isLight ? "text-slate-900 group-hover:text-sky-600" : `text-white group-hover:${f.color}`
                    }`}>{f.title}</h4>
                    <p className={`text-[10px] leading-snug ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className={`py-20 border-b transition-colors duration-200 ${
        isLight ? "bg-slate-50 border-slate-200" : "bg-brand-dark-surface/20 border-brand-dark-border"
      }`}>
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="text-center mb-12">
            <h2 className={`text-2xl sm:text-4xl font-black mb-4 ${isLight ? "text-slate-900" : "text-white"}`}>Get Started in 4 Simple Steps</h2>
            <p className={`text-xs sm:text-sm ${isLight ? "text-slate-500 font-bold" : "text-gray-500"}`}>From demo request to live operations in under 48 hours.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Connecting line */}
            <div className={`hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px ${
              isLight ? "bg-slate-200" : "bg-gradient-to-r from-transparent via-brand-sky/30 to-transparent"
            }`} />
            {howItWorks.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="text-center group">
                  <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 ${
                    isLight ? "bg-white border-slate-200 shadow-md" : `${s.border} bg-black/60`
                  }`}>
                    <Icon size={24} className={s.color} />
                  </div>
                  <div className={`text-[10px] font-black ${s.color} tracking-widest mb-1`}>STEP {s.step}</div>
                  <h4 className={`text-sm font-black mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>{s.title}</h4>
                  <p className={`text-[11px] leading-relaxed ${isLight ? "text-slate-600 font-medium" : "text-gray-500"}`}>{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className={`py-20 border-b transition-colors duration-200 ${
        isLight ? "bg-white border-slate-200" : "bg-brand-dark-surface/20 border-brand-dark-border"
      }`}>
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="text-center mb-12">
            <h2 className={`text-2xl sm:text-4xl font-black mb-4 ${isLight ? "text-slate-900" : "text-white"}`}>Loved by Leading Businesses</h2>
            <p className={`text-xs sm:text-sm max-w-xl mx-auto ${isLight ? "text-slate-600 font-medium" : "text-gray-500"}`}>
              Retail owners, pharmacy directors, and wholesale bosses share how MT Core transformed their operations.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className={`p-6 rounded-2xl transition-all group border ${
                isLight
                  ? "bg-slate-50 border-slate-200 hover:border-sky-300 hover:bg-white shadow-xs"
                  : "bg-brand-dark-surface/60 border-brand-dark-border hover:border-brand-sky/30"
              }`}>
                <div className="flex gap-1 text-amber-400 mb-4">
                  {Array(t.stars).fill(0).map((_,i) => <Star key={i} size={13} fill="currentColor" />)}
                </div>
                <p className={`text-xs italic mb-5 leading-relaxed ${isLight ? "text-slate-700 font-medium" : "text-gray-300"}`}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.color} text-white font-black flex items-center justify-center text-xs shrink-0 shadow-sm`}>{t.initials}</div>
                  <div>
                    <h4 className={`font-black text-xs ${isLight ? "text-slate-900" : "text-white"}`}>{t.name}</h4>
                    <p className={`text-[9px] ${isLight ? "text-slate-500 font-semibold" : "text-gray-500"}`}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          DEMO REQUEST FORM
      ══════════════════════════════════════════════════════════════════════ */}
      <section className={`py-20 border-b relative overflow-hidden transition-colors duration-200 ${
        isLight ? "bg-slate-50 border-slate-200" : "border-brand-dark-border"
      }`} id="demo-section">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.06),transparent_70%)] pointer-events-none" />
        <div className="w-full max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
          <div className={`rounded-3xl p-8 shadow-2xl border ${
            isLight ? "bg-white border-slate-200 shadow-slate-200/50" : "bg-brand-dark-surface/80 border-brand-sky/20 shadow-brand-sky/5"
          }`}>
            <div className="text-center mb-8">
              <h2 className={`text-2xl sm:text-3xl font-black mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>Request a Custom Live Demo</h2>
              <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>Schedule your personalized walkthrough or start a 14-day free trial sandbox.</p>
            </div>

            {demoSubmitted ? (
              <div className={`p-6 rounded-2xl text-center animate-fade-in-up space-y-4 border ${
                isLight ? "bg-slate-50 border-emerald-400" : "bg-brand-dark-surface border-emerald-500/40"
              }`}>
                <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
                <h4 className={`font-black text-sm ${isLight ? "text-slate-900" : "text-white"}`}>Demo Request Received!</h4>
                {/* Ticket number — always visible */}
                <div className={`rounded-xl px-6 py-4 border ${
                  isLight ? "bg-white border-sky-300 shadow-xs" : "bg-black/60 border-brand-sky/30"
                }`}>
                  <p className={`text-[9px] uppercase tracking-widest mb-1 ${isLight ? "text-slate-500 font-bold" : "text-gray-500"}`}>Your Ticket Number</p>
                  <p className="text-2xl font-black font-mono text-sky-500 tracking-widest">{demoTicketNo}</p>
                  <p className={`text-[10px] mt-1 ${isLight ? "text-slate-500" : "text-gray-500"}`}>Save this number to track your request status</p>
                </div>
                <div className="flex gap-2 justify-center flex-wrap">
                  <button
                    onClick={() => setShowReceiptModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-500 text-white text-[10px] font-black uppercase rounded-xl hover:bg-sky-600 transition shadow-xs cursor-pointer"
                  >
                    <Receipt size={12} /> View Receipt
                  </button>
                  <button
                    onClick={() => window.print()}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 border text-[10px] font-black uppercase rounded-xl transition cursor-pointer ${
                      isLight ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-100" : "border-brand-dark-border text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    <Printer size={12} /> Print
                  </button>
                  <a href="/tracking"
                    className={`inline-flex items-center gap-1.5 px-4 py-2 border text-[10px] font-black uppercase rounded-xl transition ${
                      isLight ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-100" : "border-brand-dark-border text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    <ExternalLink size={12} /> Track Status
                  </a>
                </div>
                <button
                  onClick={() => {
                    setDemoSubmitted(false);
                    setDemoTicketNo("");
                    setDemoForm({ name: "", businessName: "", email: "", phone: "", country: "Pakistan", businessType: "POS (Supermarkets, Retail & Restaurant ERP)" });
                  }}
                  className={`text-[10px] transition cursor-pointer ${isLight ? "text-slate-500 hover:text-slate-800" : "text-gray-600 hover:text-gray-400"}`}
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Your Full Name",  key: "name",         placeholder: "Ali Raza",           type: "text"  },
                    { label: "Business Name",   key: "businessName", placeholder: "Al-Fateh Supermarket",type: "text"  },
                    { label: "Corporate Email", key: "email",        placeholder: "name@company.com",    type: "email" },
                    { label: "Mobile Hotline",  key: "phone",        placeholder: "+92 321 1234567",     type: "tel"   },
                  ].map(field => (
                    <div key={field.key}>
                      <label className={`block text-[10px] uppercase tracking-wider font-bold mb-1.5 ${isLight ? "text-slate-600" : "text-gray-500"}`}>{field.label}</label>
                      <input type={field.type} required={field.key !== "phone"} placeholder={field.placeholder}
                        value={(demoForm as any)[field.key]}
                        onChange={e => setDemoForm({...demoForm, [field.key]: e.target.value})}
                        className={`w-full p-3 rounded-xl text-xs focus:outline-none transition border ${
                          isLight
                            ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-sky-500"
                            : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                        }`} />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-[10px] uppercase tracking-wider font-bold mb-1.5 ${isLight ? "text-slate-600" : "text-gray-500"}`}>Country</label>
                    <select value={demoForm.country} onChange={e => setDemoForm({...demoForm, country: e.target.value})}
                      className={`w-full p-3 rounded-xl text-xs focus:outline-none transition border ${
                        isLight
                          ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-sky-500"
                          : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                      }`}>
                      {["Pakistan","United Arab Emirates","Saudi Arabia","United Kingdom","United States"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-[10px] uppercase tracking-wider font-bold mb-1.5 ${isLight ? "text-slate-600" : "text-gray-500"}`}>Select Software System</label>
                    <select value={demoForm.businessType} onChange={e => setDemoForm({...demoForm, businessType: e.target.value})}
                      className={`w-full p-3 rounded-xl text-xs font-bold focus:outline-none transition border ${
                        isLight
                          ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-sky-500"
                          : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                      }`}>
                      <option value="POS (Supermarkets, Retail & Restaurant ERP)">🏬 1. POS (Supermarkets, Retail &amp; Restaurants)</option>
                      <option value="HRMS (Human Resources & Payroll Suite)">👥 2. HRMS (Human Resources &amp; Payroll Suite)</option>
                      <option value="SMS (School & College Management ERP)">🎓 3. SMS (School &amp; College Management ERP)</option>
                    </select>
                  </div>
                </div>
                <button type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-95 text-white font-black text-xs rounded-xl uppercase tracking-widest transition-all transform hover:scale-[1.01] shadow-lg shadow-sky-500/20 cursor-pointer">
                  Configure My Free Demo Environment →
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════════════════════════════ */}
      <section className={`py-16 relative overflow-hidden border-b transition-colors duration-200 ${
        isLight ? "bg-white border-slate-200" : "border-brand-dark-border"
      }`}>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-sky/5 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 text-center relative z-10">
          <h2 className={`text-2xl sm:text-3xl font-black mb-4 ${isLight ? "text-slate-900" : "text-white"}`}>
            Ready to transform your business?
          </h2>
          <p className={`text-sm mb-8 max-w-xl mx-auto ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Join 500+ businesses already running on MT Core. The core technology behind your business. No credit card required for the 14-day trial.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/demo"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-8 py-3.5 text-sm font-black text-white hover:opacity-95 transition transform hover:scale-105 shadow-xl shadow-sky-500/25">
              Start Free 14-Day Trial <ArrowRight size={15} />
            </Link>
            <Link href="/login"
              className={`inline-flex items-center gap-2 text-sm font-bold transition ${
                isLight ? "text-slate-700 hover:text-slate-900" : "text-gray-400 hover:text-white"
              }`}>
              <Laptop size={14} /> View Live Demo <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />

      {/* ══════════════════════════════════════════════════════════════════════
          TICKET RECEIPT MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showReceiptModal && demoTicketNo && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.80)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowReceiptModal(false); }}
        >
          <div
            id="ticket-receipt-card"
            className="relative bg-white dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl max-w-sm w-full border border-gray-200 dark:border-brand-sky/20 overflow-hidden"
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            {/* Close button */}
            <button
              onClick={() => setShowReceiptModal(false)}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition z-10"
              aria-label="Close ticket"
            >
              <X size={14} className="text-gray-600 dark:text-gray-300" />
            </button>

            {/* Header band */}
            <div className="bg-brand-sky px-6 py-4 text-center">
              <img src="/logo.png" style={{ height: "36px", width: "auto", objectFit: "contain", margin: "0 auto 4px auto", display: "block" }} alt="MT Core" />
              <div className="flex items-center justify-center gap-2 mb-0.5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black">MT Core</span>
              </div>
              <p className="text-[9px] text-black/70 uppercase tracking-widest">The core technology behind your business</p>
            </div>

            {/* Zigzag edge */}
            <div
              className="h-3 bg-white dark:bg-[#0f172a]"
              style={{
                backgroundImage: "radial-gradient(circle at 50% 0%, #0ea5e9 12px, transparent 13px)",
                backgroundSize: "24px 12px",
                backgroundRepeat: "repeat-x",
              }}
            />

            <div className="px-6 pb-2">
              {/* Ticket Number */}
              <div className="text-center mb-5">
                <p className="text-[9px] uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">Ticket Number</p>
                <p className="text-2xl font-black text-brand-sky tracking-widest" style={{ fontFamily: "'Courier New', monospace" }}>
                  {demoTicketNo}
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-gray-300 dark:border-gray-700 mb-4" />

              {/* Details */}
              <div className="space-y-2.5 text-[10px] mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">Business</span>
                  <span className="font-bold text-right max-w-[55%] truncate">{demoForm.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</span>
                  <span className="font-bold">{demoForm.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</span>
                  <span className="font-bold text-right max-w-[55%] truncate">{demoForm.email}</span>
                </div>
                {demoForm.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</span>
                    <span className="font-bold">{demoForm.phone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">Business Type</span>
                  <span className="font-bold text-right max-w-[55%] truncate">{demoForm.businessType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</span>
                  <span className="font-bold">{demoTicketTime}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-gray-300 dark:border-gray-700 mb-4" />

              {/* Status badge */}
              <div className="flex justify-center mb-4">
                <span className="inline-flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/40 text-amber-500 dark:text-amber-400 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  PENDING
                </span>
              </div>

              {/* Message */}
              <p className="text-[9px] text-gray-500 dark:text-gray-400 text-center leading-relaxed mb-5">
                Please save your ticket number. You can track your request status at any time on our website.
              </p>
            </div>

            {/* Zigzag bottom edge */}
            <div
              className="h-3 bg-white dark:bg-[#0f172a]"
              style={{
                backgroundImage: "radial-gradient(circle at 50% 100%, #0ea5e9 12px, transparent 13px)",
                backgroundSize: "24px 12px",
                backgroundRepeat: "repeat-x",
                backgroundPosition: "bottom",
              }}
            />

            {/* Action buttons */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-[10px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition"
              >
                <Printer size={12} /> Print Ticket
              </button>
              <a
                href="/tracking"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-brand-sky text-black text-[10px] font-black uppercase tracking-wider hover:bg-brand-sky-light transition shadow-lg shadow-brand-sky/20"
              >
                <ExternalLink size={12} /> Track My Ticket
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
