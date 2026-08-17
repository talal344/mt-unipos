"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShoppingBag,
  Users,
  GraduationCap,
  ShieldCheck,
  Zap,
  Layers,
  Palette,
  Layout,
  FileSpreadsheet,
  QrCode,
  Printer,
  CalendarCheck2,
  Clock,
  Award,
  CreditCard,
  Building2,
  Database,
  Lock,
  ArrowRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  ChevronRight,
  Code2,
  Monitor,
  Smartphone,
  Server,
  Cloud,
  Check
} from "lucide-react";
import MTCoreLogo from "@/components/mt-logo";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export default function CaseStudyPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "pos" | "hrms" | "sms" | "admin" | "design" | "architecture">("overview");
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const colorPalettes = [
    {
      system: "Core & Platform Brand",
      primary: { name: "Cyan / Sky Blue", hex: "#0284c7", rgb: "rgb(2, 132, 199)", class: "bg-sky-600" },
      accent: { name: "Indigo Velvet", hex: "#4f46e5", rgb: "rgb(79, 70, 229)", class: "bg-indigo-600" },
      bg: { name: "Obsidian Black", hex: "#000000", rgb: "rgb(0, 0, 0)", class: "bg-black" },
      surface: { name: "Midnight Navy", hex: "#0b121e", rgb: "rgb(11, 18, 30)", class: "bg-[#0b121e]" }
    },
    {
      system: "Universal POS Suite",
      primary: { name: "Emerald Growth", hex: "#059669", rgb: "rgb(5, 150, 105)", class: "bg-emerald-600" },
      accent: { name: "Teal Matrix", hex: "#0d9488", rgb: "rgb(13, 148, 136)", class: "bg-teal-600" },
      bg: { name: "Deep Forest Dark", hex: "#06130d", rgb: "rgb(6, 19, 13)", class: "bg-[#06130d]" },
      surface: { name: "Slate Dark", hex: "#0f172a", rgb: "rgb(15, 23, 42)", class: "bg-slate-900" }
    },
    {
      system: "Enterprise HRMS Suite",
      primary: { name: "Royal Purple", hex: "#9333ea", rgb: "rgb(147, 51, 234)", class: "bg-purple-600" },
      accent: { name: "Fuchsia Glow", hex: "#c026d3", rgb: "rgb(192, 38, 211)", class: "bg-fuchsia-600" },
      bg: { name: "Deep Violet Dark", hex: "#0d0617", rgb: "rgb(13, 6, 23)", class: "bg-[#0d0617]" },
      surface: { name: "Dark Indigo", hex: "#1e1b4b", rgb: "rgb(30, 27, 75)", class: "bg-indigo-950" }
    },
    {
      system: "EduCloud SMS 360",
      primary: { name: "Academic Emerald", hex: "#10b981", rgb: "rgb(16, 185, 129)", class: "bg-emerald-500" },
      accent: { name: "Sun Amber", hex: "#f59e0b", rgb: "rgb(245, 158, 11)", class: "bg-amber-500" },
      bg: { name: "Midnight Teal", hex: "#02120e", rgb: "rgb(2, 18, 14)", class: "bg-[#02120e]" },
      surface: { name: "Slate 900", hex: "#0f172a", rgb: "rgb(15, 23, 42)", class: "bg-slate-900" }
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-sky-500 selection:text-black font-sans relative overflow-x-hidden">
      <SiteHeader />

      {/* Background Ambient Glowing Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24 space-y-16">
        
        {/* ========================================================================= */}
        {/* HERO SECTION                                                              */}
        {/* ========================================================================= */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
            <Sparkles size={14} className="animate-spin text-sky-400" />
            <span>Official Architectural Case Study &bull; Multi-Tenant Enterprise ERP</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
            The Ultimate <br />
            <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(56,189,248,0.4)]">
              Multi-Tenant Cloud ERP
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
            A comprehensive, next-generation enterprise software platform uniting <b>Universal POS (Retail &amp; Restaurant)</b>, 
            <b>Enterprise HRMS &amp; Payroll</b>, and <b>EduCloud SMS 360</b> into a single, lightning-fast web application.
          </p>

          {/* Key Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            <div className="p-5 rounded-2xl bg-[#0b121e]/80 border border-sky-500/20 backdrop-blur-md text-center space-y-1 hover:border-sky-500/50 transition">
              <div className="text-2xl sm:text-3xl font-black text-sky-400">4-in-1</div>
              <div className="text-xs text-gray-400 font-bold uppercase">Flagship Systems</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#0b121e]/80 border border-emerald-500/20 backdrop-blur-md text-center space-y-1 hover:border-emerald-500/50 transition">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">116+</div>
              <div className="text-xs text-gray-400 font-bold uppercase">Dynamic Routes</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#0b121e]/80 border border-purple-500/20 backdrop-blur-md text-center space-y-1 hover:border-purple-500/50 transition">
              <div className="text-2xl sm:text-3xl font-black text-purple-400">100%</div>
              <div className="text-xs text-gray-400 font-bold uppercase">Offline-Resilient</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#0b121e]/80 border border-amber-500/20 backdrop-blur-md text-center space-y-1 hover:border-amber-500/50 transition">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">&lt; 15ms</div>
              <div className="text-xs text-gray-400 font-bold uppercase">Real-Time Sync</div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE NAVIGATION TABS                                               */}
        {/* ========================================================================= */}
        <div className="flex justify-center">
          <div className="inline-flex flex-wrap p-1.5 rounded-2xl bg-[#0b121e] border border-gray-800 backdrop-blur-xl gap-1.5 shadow-2xl">
            {[
              { id: "overview", label: "Executive Overview", icon: Layout },
              { id: "pos", label: "Universal POS Suite", icon: ShoppingBag },
              { id: "hrms", label: "Enterprise HRMS", icon: Users },
              { id: "sms", label: "EduCloud SMS 360", icon: GraduationCap },
              { id: "admin", label: "Super Admin Governance", icon: ShieldCheck },
              { id: "design", label: "Design System & Logos", icon: Palette },
              { id: "architecture", label: "Tech Architecture", icon: Code2 }
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-600/30"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: EXECUTIVE OVERVIEW                                                  */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-12 animate-fade-in-up">
            {/* System Breakdown 4-Card Bento */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* POS */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-[#0b121e] to-black border border-emerald-500/30 hover:border-emerald-500/60 transition space-y-4 shadow-xl relative overflow-hidden group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black">
                  <ShoppingBag size={24} />
                </div>
                <h3 className="text-lg font-black text-white">Universal POS Engine</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Dual-mode retail &amp; hospitality POS with thermal receipt printing, restaurant table editor, Kitchen Display System (KDS), and pharmacy salt matrix.
                </p>
                <div className="pt-2">
                  <Link href="/pos" className="text-xs text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
                    <span>Explore POS</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              {/* HRMS */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-[#0b121e] to-black border border-purple-500/30 hover:border-purple-500/60 transition space-y-4 shadow-xl relative overflow-hidden group">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center font-black">
                  <Users size={24} />
                </div>
                <h3 className="text-lg font-black text-white">Enterprise HRMS</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Full employee lifecycle suite with biometric attendance, automated salary slips, shift rota, OKRs, fleet management, and corporate loan tracking.
                </p>
                <div className="pt-2">
                  <Link href="/hrms" className="text-xs text-purple-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
                    <span>Explore HRMS</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              {/* SMS */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-[#0b121e] to-black border border-sky-500/30 hover:border-sky-500/60 transition space-y-4 shadow-xl relative overflow-hidden group">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center font-black">
                  <GraduationCap size={24} />
                </div>
                <h3 className="text-lg font-black text-white">EduCloud SMS 360</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Institutional governance with Student 360 PVC Cards, Excel Bulk Importer, Class Timetable live sync, AI OMR grading, and 3-copy fee challans.
                </p>
                <div className="pt-2">
                  <Link href="/sms" className="text-xs text-sky-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
                    <span>Explore SMS</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              {/* Super Admin */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-[#0b121e] to-black border border-amber-500/30 hover:border-amber-500/60 transition space-y-4 shadow-xl relative overflow-hidden group">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-lg font-black text-white">Super Admin Suite</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Multi-tenant tenant isolation, selective module allocation, Google Drive zero-loss backup automation, billing invoices, and telemetry control.
                </p>
                <div className="pt-2">
                  <Link href="/admin/dashboard" className="text-xs text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
                    <span>Explore Governance</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Strategic Value Proposition */}
            <div className="p-8 rounded-3xl bg-[#0b121e]/90 border border-gray-800 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-black">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black">Why This Platform Outperforms Legacy Software</h3>
                  <p className="text-xs text-gray-400">Zero bloat, instant sub-millisecond reactions, and seamless multi-tenant ergonomics.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                <div className="p-4 rounded-2xl bg-black/50 border border-gray-800 space-y-2">
                  <span className="text-sky-400 font-black text-sm block">1. Clean Slate Deployment</span>
                  <p className="text-gray-400 leading-relaxed">
                    When Super Admin provisions software to a new school, clinic, or enterprise, the software launches <b>100% brand new</b> with no ghost mock data.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-black/50 border border-gray-800 space-y-2">
                  <span className="text-emerald-400 font-black text-sm block">2. High-Performance Bulk Tools</span>
                  <p className="text-gray-400 leading-relaxed">
                    Includes Excel/CSV master bulk uploaders with downloadable demo templates, batch barcode generators, and printable 3-copy vouchers.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-black/50 border border-gray-800 space-y-2">
                  <span className="text-purple-400 font-black text-sm block">3. Responsive Dark/Light Engine</span>
                  <p className="text-gray-400 leading-relaxed">
                    Full day/night switching with meticulously tuned high-contrast color tokens adhering to modern AAA accessibility standards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: UNIVERSAL POS SUITE                                                */}
        {/* ========================================================================= */}
        {activeTab === "pos" && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-[#0b121e] to-black border border-emerald-500/30 space-y-4">
              <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest block">Core Module &bull; Retail &amp; Hospitality</span>
              <h2 className="text-3xl font-black">Universal Multi-Vertical POS Engine</h2>
              <p className="text-xs text-gray-300 max-w-3xl leading-relaxed">
                Engineered for supermarkets, retail fashion, restaurants, and pharmacies with sub-second barcode checkout, offline transaction resilience, and automated thermal printing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
              <div className="p-5 rounded-2xl bg-[#0b121e] border border-gray-800 space-y-2">
                <div className="text-emerald-400 font-black text-sm flex items-center gap-2">
                  <Printer size={16} />
                  <span>Thermal Receipt Designer</span>
                </div>
                <p className="text-gray-400">
                  Customizable 80mm &amp; 58mm POS receipt layout with QR code invoice verification, bilingual Urdu/English headers, and FBR POS integration support.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0b121e] border border-gray-800 space-y-2">
                <div className="text-sky-400 font-black text-sm flex items-center gap-2">
                  <Layout size={16} />
                  <span>Restaurant Floor &amp; KDS</span>
                </div>
                <p className="text-gray-400">
                  Visual drag-and-drop table layout editor, live table orders with dine-in / takeaway split, and real-time Kitchen Display System (KDS) order sync.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0b121e] border border-gray-800 space-y-2">
                <div className="text-purple-400 font-black text-sm flex items-center gap-2">
                  <Database size={16} />
                  <span>Batch &amp; Expiry Inventory</span>
                </div>
                <p className="text-gray-400">
                  Multi-warehouse inventory tracking with FIFO costing, low-stock reorder triggers, supplier purchase orders, and pharmacy salt/generic search.
                </p>
              </div>
            </div>

            {/* Direct Route Links Matrix */}
            <div className="p-6 rounded-2xl bg-[#0b121e] border border-gray-800 space-y-3">
              <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">POS Routes Directory</h4>
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { name: "Terminal POS", href: "/pos" },
                  { name: "Product Catalog", href: "/products" },
                  { name: "Inventory Stock", href: "/inventory" },
                  { name: "Sales Register", href: "/sales" },
                  { name: "Purchases & PO", href: "/purchases" },
                  { name: "Expenses Tracker", href: "/expenses" },
                  { name: "Customer CRM", href: "/customers" },
                  { name: "Supplier Matrix", href: "/suppliers" },
                  { name: "Restaurant Tables", href: "/restaurant" },
                  { name: "Floor Plan Editor", href: "/floor-editor" },
                  { name: "Kitchen KDS", href: "/kds" },
                  { name: "Pharmacy Matrix", href: "/pharmacy" },
                  { name: "Parcel Tracker", href: "/tracking" }
                ].map((r) => (
                  <Link
                    key={r.name}
                    href={r.href}
                    className="px-3 py-1.5 rounded-lg bg-black border border-gray-800 hover:border-emerald-500/50 text-gray-300 hover:text-white transition flex items-center gap-1"
                  >
                    <span>{r.name}</span>
                    <ExternalLink size={11} className="text-gray-500" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ENTERPRISE HRMS SUITE                                              */}
        {/* ========================================================================= */}
        {activeTab === "hrms" && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 via-[#0b121e] to-black border border-purple-500/30 space-y-4">
              <span className="text-purple-400 font-bold text-xs uppercase tracking-widest block">Enterprise Module &bull; Human Resources</span>
              <h2 className="text-3xl font-black">Next-Gen HRMS, Payroll &amp; Workforce Lifecycle</h2>
              <p className="text-xs text-gray-300 max-w-3xl leading-relaxed">
                Complete corporate personnel platform covering recruitment applicant tracking, biometric attendance, tax compliant multi-allowance payroll, shift scheduling, and fleet management.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
              <div className="p-5 rounded-2xl bg-[#0b121e] border border-gray-800 space-y-2">
                <div className="text-purple-400 font-black text-sm flex items-center gap-2">
                  <CreditCard size={16} />
                  <span>Automated Payroll &amp; Bank Salary</span>
                </div>
                <p className="text-gray-400">
                  One-click monthly payroll calculation with allowances, tax brackets, EOBI, loan deductions, and printable confidential payslips.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0b121e] border border-gray-800 space-y-2">
                <div className="text-indigo-400 font-black text-sm flex items-center gap-2">
                  <CalendarCheck2 size={16} />
                  <span>Attendance &amp; Leave Rota</span>
                </div>
                <p className="text-gray-400">
                  Biometric punch sync, multi-tier leave approval workflow, dynamic shift planner, and holiday calendar with overtime computation.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0b121e] border border-gray-800 space-y-2">
                <div className="text-pink-400 font-black text-sm flex items-center gap-2">
                  <Award size={16} />
                  <span>Performance OKRs &amp; Appraisals</span>
                </div>
                <p className="text-gray-400">
                  Quarterly KPI tracking, 360 peer reviews, annual increments &amp; salary hike recommendations, and automated employee letter generation.
                </p>
              </div>
            </div>

            {/* Direct Route Links Matrix */}
            <div className="p-6 rounded-2xl bg-[#0b121e] border border-gray-800 space-y-3">
              <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">HRMS Routes Directory (28 Dedicated Pages)</h4>
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { name: "HRMS Dashboard", href: "/hrms" },
                  { name: "Employee Directory", href: "/hrms/employees" },
                  { name: "Live Attendance", href: "/hrms/attendance" },
                  { name: "Monthly Payroll", href: "/hrms/payroll" },
                  { name: "Leave Requests", href: "/hrms/leaves" },
                  { name: "Shift Planner", href: "/hrms/shift-planner" },
                  { name: "Goals & OKRs", href: "/hrms/goals" },
                  { name: "Recruitment ATS", href: "/hrms/recruitment" },
                  { name: "Corporate Fleet", href: "/hrms/fleet" },
                  { name: "Assets Inventory", href: "/hrms/assets" },
                  { name: "Loans & Advance", href: "/hrms/loans" },
                  { name: "PF & Gratuity", href: "/hrms/gratuity-pf" },
                  { name: "Org Chart", href: "/hrms/org-chart" },
                  { name: "Workplace Analytics", href: "/hrms/analytics" }
                ].map((r) => (
                  <Link
                    key={r.name}
                    href={r.href}
                    className="px-3 py-1.5 rounded-lg bg-black border border-gray-800 hover:border-purple-500/50 text-gray-300 hover:text-white transition flex items-center gap-1"
                  >
                    <span>{r.name}</span>
                    <ExternalLink size={11} className="text-gray-500" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: EDUCLOUD SMS 360                                                   */}
        {/* ========================================================================= */}
        {activeTab === "sms" && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="p-8 rounded-3xl bg-gradient-to-r from-sky-950/40 via-[#0b121e] to-black border border-sky-500/30 space-y-4">
              <span className="text-sky-400 font-bold text-xs uppercase tracking-widest block">Core Module &bull; Education ERP</span>
              <h2 className="text-3xl font-black">EduCloud SMS 360 Institutional Platform</h2>
              <p className="text-xs text-gray-300 max-w-3xl leading-relaxed">
                Tailored for modern schools, colleges, and academies. Features unified academic curriculum hubs, Excel bulk uploader, dual-mode attendance, automated 3-copy fee challans, and AI OMR bubble sheet grading.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
              <div className="p-5 rounded-2xl bg-[#0b121e] border border-gray-800 space-y-2">
                <div className="text-sky-400 font-black text-sm flex items-center gap-2">
                  <FileSpreadsheet size={16} />
                  <span>Classes &amp; Subjects Hub + Excel Importer</span>
                </div>
                <p className="text-gray-400">
                  Single-screen hub for classes, sections, and curriculum with compulsory/elective badges. Includes one-click Sample Excel template download &amp; bulk parser.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0b121e] border border-gray-800 space-y-2">
                <div className="text-emerald-400 font-black text-sm flex items-center gap-2">
                  <GraduationCap size={16} />
                  <span>Faculty Matrix &amp; Subject Allocation</span>
                </div>
                <p className="text-gray-400">
                  Assign complete classes or specific subjects to teachers. Synchronizes live with daily teaching timetables and student 360 academic dossiers.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0b121e] border border-gray-800 space-y-2">
                <div className="text-amber-400 font-black text-sm flex items-center gap-2">
                  <Clock size={16} />
                  <span>Bell Timings Matrix &amp; Live Timetable</span>
                </div>
                <p className="text-gray-400">
                  Institutional bell timings schedule synchronizes live with class timetables, allowing principals to allocate teachers with a single click.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0b121e] border border-gray-800 space-y-2">
                <div className="text-purple-400 font-black text-sm flex items-center gap-2">
                  <Award size={16} />
                  <span>Exam Marks &amp; Student Result Upload</span>
                </div>
                <p className="text-gray-400">
                  Teacher marks entry portal with real-time grade calculations, clean slate data entry, and printable A4 Student Report Cards.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0b121e] border border-gray-800 space-y-2">
                <div className="text-rose-400 font-black text-sm flex items-center gap-2">
                  <QrCode size={16} />
                  <span>Student 360 &amp; Scannable PVC Card</span>
                </div>
                <p className="text-gray-400">
                  Guaranteed unique sequential Admission ID generator (`ADM-2026-0101`), full academic dossier, and animated printable PVC Student ID cards.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0b121e] border border-gray-800 space-y-2">
                <div className="text-teal-400 font-black text-sm flex items-center gap-2">
                  <CalendarCheck2 size={16} />
                  <span>Dual-Mode Attendance Portal</span>
                </div>
                <p className="text-gray-400">
                  Class teachers mark student attendance with 1-click absent WhatsApp notifications, while Headmaster records faculty daily duty &amp; leave status.
                </p>
              </div>
            </div>

            {/* Direct Route Links Matrix */}
            <div className="p-6 rounded-2xl bg-[#0b121e] border border-gray-800 space-y-3">
              <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">SMS Routes Directory (24 Dedicated Pages)</h4>
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { name: "SMS Dashboard", href: "/sms" },
                  { name: "Student 360 Directory", href: "/sms/students" },
                  { name: "Classes & Subjects Hub", href: "/sms/classes" },
                  { name: "Teacher Faculty Matrix", href: "/sms/teachers" },
                  { name: "Daily Attendance", href: "/sms/attendance" },
                  { name: "Examinations & Marks", href: "/sms/exams" },
                  { name: "3-Copy Fee Challans", href: "/sms/fees" },
                  { name: "Class Timetable", href: "/sms/timetable" },
                  { name: "AI OMR Grader", href: "/sms/omr-grader" },
                  { name: "Paper Generator", href: "/sms/paper-generator" },
                  { name: "Parent WhatsApp Hub", href: "/sms/whatsapp" },
                  { name: "Certificates & SLC", href: "/sms/certificates" },
                  { name: "Institutional Settings", href: "/sms/settings" }
                ].map((r) => (
                  <Link
                    key={r.name}
                    href={r.href}
                    className="px-3 py-1.5 rounded-lg bg-black border border-gray-800 hover:border-sky-500/50 text-gray-300 hover:text-white transition flex items-center gap-1"
                  >
                    <span>{r.name}</span>
                    <ExternalLink size={11} className="text-gray-500" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: SUPER ADMIN GOVERNANCE                                             */}
        {/* ========================================================================= */}
        {activeTab === "admin" && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-950/40 via-[#0b121e] to-black border border-amber-500/30 space-y-4">
              <span className="text-amber-400 font-bold text-xs uppercase tracking-widest block">Governance Module &bull; Multi-Tenant Control</span>
              <h2 className="text-3xl font-black">Super Admin Multi-Tenant Suite</h2>
              <p className="text-xs text-gray-300 max-w-3xl leading-relaxed">
                Centralized cloud control tower for software vendor administrators to manage client tenants, license provisioning, automated cloud backups, recurring billing invoices, and telemetry.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
              <div className="p-5 rounded-2xl bg-[#0b121e] border border-gray-800 space-y-2">
                <div className="text-amber-400 font-black text-sm flex items-center gap-2">
                  <Building2 size={16} />
                  <span>Tenant Provisioning &amp; Licenses</span>
                </div>
                <p className="text-gray-400">
                  Provision new business clients, assign dedicated subdomains, and toggle POS, HRMS, and SMS modules per tenant.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0b121e] border border-gray-800 space-y-2">
                <div className="text-sky-400 font-black text-sm flex items-center gap-2">
                  <Cloud size={16} />
                  <span>Google Drive Automated Backup</span>
                </div>
                <p className="text-gray-400">
                  Zero-loss cloud backup synchronization to Google Drive with automated daily cron snapshot triggers and manual instant JSON dumps.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0b121e] border border-gray-800 space-y-2">
                <div className="text-emerald-400 font-black text-sm flex items-center gap-2">
                  <CreditCard size={16} />
                  <span>SaaS Invoices &amp; Revenue</span>
                </div>
                <p className="text-gray-400">
                  Track recurring monthly SaaS subscriptions, client payment history, and automated invoice PDF generation.
                </p>
              </div>
            </div>

            {/* Direct Route Links Matrix */}
            <div className="p-6 rounded-2xl bg-[#0b121e] border border-gray-800 space-y-3">
              <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Super Admin Routes Directory</h4>
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { name: "Super Admin Dashboard", href: "/admin/dashboard" },
                  { name: "Client Tenants Matrix", href: "/admin/clients" },
                  { name: "SaaS Invoices", href: "/admin/invoices" },
                  { name: "Email Gateway", href: "/admin/emails" },
                  { name: "Financial Reports", href: "/admin/reports" },
                  { name: "Helpdesk Support", href: "/admin/support" },
                  { name: "System Settings", href: "/admin/settings" }
                ].map((r) => (
                  <Link
                    key={r.name}
                    href={r.href}
                    className="px-3 py-1.5 rounded-lg bg-black border border-gray-800 hover:border-amber-500/50 text-gray-300 hover:text-white transition flex items-center gap-1"
                  >
                    <span>{r.name}</span>
                    <ExternalLink size={11} className="text-gray-500" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: DESIGN SYSTEM & LOGOS                                              */}
        {/* ========================================================================= */}
        {activeTab === "design" && (
          <div className="space-y-10 animate-fade-in-up">
            {/* Logo Variations Showcase */}
            <div className="p-8 rounded-3xl bg-[#0b121e] border border-gray-800 space-y-6">
              <div className="flex items-center gap-3">
                <Palette size={22} className="text-sky-400" />
                <div>
                  <h3 className="text-lg font-black">Official Brand Identity &amp; Logo Matrix</h3>
                  <p className="text-xs text-gray-400">Dynamic SVG vector marks and responsive branding tokens.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { variant: "sky" as const, label: "Platform Sky Core (Brand)", bg: "bg-sky-950/30 border-sky-500/30", sub: "Universal Platform" },
                  { variant: "emerald" as const, label: "POS & EduCloud Emerald", bg: "bg-emerald-950/30 border-emerald-500/30", sub: "Retail & Academics" },
                  { variant: "purple" as const, label: "HRMS Royal Purple", bg: "bg-purple-950/30 border-purple-500/30", sub: "Workforce & Payroll" }
                ].map((item) => (
                  <div key={item.label} className={`p-6 rounded-3xl border ${item.bg} flex flex-col items-center justify-center text-center space-y-4 shadow-xl`}>
                    <MTCoreLogo variant={item.variant} size="lg" showText={false} />
                    <div>
                      <div className="text-xs font-black text-white">{item.label}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Color Palettes & Hex Swatches */}
            <div className="space-y-4">
              <h3 className="text-base font-black flex items-center gap-2">
                <Sparkles size={16} className="text-sky-400" />
                <span>Curated Color System Tokens (Click to Copy HEX)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {colorPalettes.map((pal) => (
                  <div key={pal.system} className="p-6 rounded-3xl bg-[#0b121e] border border-gray-800 space-y-4">
                    <h4 className="font-black text-sm text-white">{pal.system}</h4>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {[pal.primary, pal.accent, pal.bg, pal.surface].map((color) => (
                        <div
                          key={color.name}
                          onClick={() => copyToClipboard(color.hex)}
                          className="p-3 rounded-xl bg-black/60 border border-gray-800 hover:border-sky-500 transition cursor-pointer flex items-center gap-3 group"
                        >
                          <div className={`w-8 h-8 rounded-lg ${color.class} border border-white/20 flex-shrink-0`} />
                          <div className="overflow-hidden">
                            <div className="font-bold text-gray-200 truncate">{color.name}</div>
                            <div className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                              <span>{color.hex}</span>
                              {copiedHex === color.hex ? (
                                <Check size={10} className="text-emerald-400" />
                              ) : (
                                <Copy size={10} className="opacity-0 group-hover:opacity-100 transition" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography Hierarchy */}
            <div className="p-8 rounded-3xl bg-[#0b121e] border border-gray-800 space-y-4">
              <h3 className="text-base font-black">Typography &amp; Hierarchy System</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-black/40 border border-gray-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-sky-400 block">Primary Display Typeface</span>
                  <div className="text-base font-black">Plus Jakarta Sans</div>
                  <p className="text-gray-400">Headings, titles, banners, KPI stats.</p>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-gray-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">Body &amp; Data Typeface</span>
                  <div className="text-base font-bold">Inter / System UI</div>
                  <p className="text-gray-400">Tables, forms, inputs, long descriptions.</p>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-gray-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-purple-400 block">Monospace Code &amp; IDs</span>
                  <div className="text-base font-mono font-black">JetBrains Mono</div>
                  <p className="text-gray-400">Admission IDs, Barcodes, Financial Challans, Timestamps.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: TECH ARCHITECTURE                                                  */}
        {/* ========================================================================= */}
        {activeTab === "architecture" && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-[#0b121e] to-black border border-indigo-500/30 space-y-4">
              <span className="text-indigo-400 font-bold text-xs uppercase tracking-widest block">Technical Specifications</span>
              <h2 className="text-3xl font-black">Full-Stack Cloud &amp; Hybrid Architecture</h2>
              <p className="text-xs text-gray-300 max-w-3xl leading-relaxed">
                Built upon Next.js 16 App Router with Turbopack, React 19, TypeScript strict mode, and unified Context state synchronization with automatic persistence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-6 rounded-3xl bg-[#0b121e] border border-gray-800 space-y-3">
                <h4 className="font-black text-sm text-sky-400 flex items-center gap-2">
                  <Server size={16} />
                  <span>Frontend &amp; Server-Side Performance</span>
                </h4>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-sky-400 mt-0.5" />
                    <span><b>Next.js 16.2.6 (Turbopack)</b>: Sub-second hot reloads and optimized production compilation.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-sky-400 mt-0.5" />
                    <span><b>Static + Dynamic Hybrid Generation</b>: 116 routes statically optimized with dynamic on-demand endpoints.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-sky-400 mt-0.5" />
                    <span><b>Zero Hydration Mismatch</b>: Defensive state mounting with clean-slate migration hooks.</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-3xl bg-[#0b121e] border border-gray-800 space-y-3">
                <h4 className="font-black text-sm text-emerald-400 flex items-center gap-2">
                  <Database size={16} />
                  <span>Data Layer &amp; Cloud Backup Engine</span>
                </h4>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 mt-0.5" />
                    <span><b>Atomic Context Stores</b>: Decoupled POS, HRMS, and SMS contexts with instant local persistence.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 mt-0.5" />
                    <span><b>Google Drive Backup API</b>: Multi-tenant database snapshots backed up automatically via secure OAuth2 tokens.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 mt-0.5" />
                    <span><b>IndexedDB Offline Support</b>: Continuous point-of-sale operation even when internet connectivity drops.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FOOTER CALL TO ACTION                                                     */}
        {/* ========================================================================= */}
        <div className="p-10 rounded-3xl bg-gradient-to-r from-sky-900/40 via-indigo-900/30 to-purple-900/40 border border-sky-500/30 text-center space-y-6 shadow-2xl">
          <h3 className="text-2xl sm:text-4xl font-black">
            Ready to Experience the Full Platform Live?
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto">
            Test any of the 4 flagship systems right in your browser or request a personalized enterprise deployment for your business.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/demo"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-sky-500/30 transition transform hover:scale-105"
            >
              Request Live Demo
            </Link>
            <Link
              href="/pos"
              className="px-6 py-3.5 rounded-xl bg-[#0b121e] border border-gray-700 hover:border-white text-white font-bold text-xs transition"
            >
              Launch POS System
            </Link>
            <Link
              href="/sms"
              className="px-6 py-3.5 rounded-xl bg-[#0b121e] border border-gray-700 hover:border-white text-white font-bold text-xs transition"
            >
              Launch SMS 360
            </Link>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
