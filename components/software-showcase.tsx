"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Laptop,
  Users,
  GraduationCap,
  Stethoscope,
  Building2,
  ShoppingCart,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Zap,
  ShieldCheck,
  Award,
  BarChart3,
  TrendingUp,
  Receipt,
  FileText,
  Calendar,
  Layers,
  ChevronRight,
  Printer,
  QrCode
} from "lucide-react";

export default function SoftwareShowcase() {
  const [activeTab, setActiveTab] = useState<"all" | "pos" | "hrms" | "sms">("all");

  const flagshipProducts = [
    {
      id: "pos",
      name: "MT Retail & Supermarket POS ERP",
      tagline: "Sub-Second Barcode Register, Multi-Branch & Auto Accounting",
      badge: "Flagship POS ⚡",
      badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/30",
      glowColor: "from-sky-600/30 via-blue-600/10 to-transparent",
      borderColor: "border-sky-500/40 hover:border-sky-400",
      accentBg: "bg-sky-500/10 text-sky-400",
      demoLink: "/pos",
      requestLink: "/demo?line=POS",
      icon: Laptop,
      stats: [
        { label: "Scan Speed", val: "0.12s" },
        { label: "Branch Sync", val: "Real-time" },
        { label: "Ledger", val: "Double-Entry" }
      ],
      features: [
        "Multi-Lane Barcode Cart Checkout & Weight-Scale",
        "Pharmacy 60-Day Expiry Alerts & Drug Batch Tracking",
        "Restaurant Table Grid, Visual KDS & Waiter App",
        "Multi-Branch Stock Transfers & Auto Reorder POs",
        "Customer Loyalty Tier Points & Credit Sales Ledger"
      ]
    },
    {
      id: "hrms",
      name: "MT People & Enterprise HRMS Suite",
      tagline: "Complete Employee Lifecycle, Biometric Shifts & Payroll",
      badge: "Enterprise HRMS 👥",
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      glowColor: "from-emerald-600/30 via-teal-600/10 to-transparent",
      borderColor: "border-emerald-500/40 hover:border-emerald-400",
      accentBg: "bg-emerald-500/10 text-emerald-400",
      demoLink: "/hrms",
      requestLink: "/demo?line=HRMS",
      icon: Users,
      stats: [
        { label: "Payroll Gen", val: "1-Click" },
        { label: "Attendance", val: "Biometric" },
        { label: "Portals", val: "Employee + Admin" }
      ],
      features: [
        "Employee Information System (EIS) & Digital Dossiers",
        "Shift Planner, Overtime Matrix & Geofenced Punching",
        "Multi-Level Leave Approval Hierarchy & Quotas",
        "Automated Tax, EOBI, PF & Payslip PDF Distribution",
        "KPI Performance Appraisals & Attrition Analytics"
      ]
    },
    {
      id: "sms",
      name: "MT Campus & College Management ERP",
      tagline: "Student 360, Board Paper Maker, 3-Copy Challans & Leaderboard",
      badge: "Autonomous SMS 🎓",
      badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      glowColor: "from-purple-600/30 via-indigo-600/10 to-transparent",
      borderColor: "border-purple-500/40 hover:border-purple-400",
      accentBg: "bg-purple-500/10 text-purple-400",
      demoLink: "/sms",
      requestLink: "/demo?line=SMS",
      icon: GraduationCap,
      stats: [
        { label: "Positions", val: "Auto 3D Podium" },
        { label: "Bank Challan", val: "3-Copy Auto" },
        { label: "Portals", val: "7 Switchable Roles" }
      ],
      features: [
        "Unique Admission GR Numbers, B-Form & PVC Smart ID Cards",
        "Automated Board Exam Paper Generator from Question Bank",
        "Dynamic Academic Hall of Fame with 1st/2nd/3rd Podiums",
        "Smart RFID Gate Attendance, Visitor Passes & SMS Alerts",
        "Faculty Class-Period Matrix & Student Section Shifting"
      ]
    }
  ];

  const filtered = activeTab === "all" ? flagshipProducts : flagshipProducts.filter(p => p.id === activeTab);

  return (
    <section className="relative py-20 bg-black font-sans border-b border-gray-800/80 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* 1. ANIMATED LIVE TICKER MARQUEE                                              */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <div className="w-full bg-[#080d15] border-y border-gray-800 py-3 mb-16 overflow-hidden relative">
        <div className="flex gap-8 whitespace-nowrap animate-marquee text-xs font-mono font-bold text-gray-400">
          <span className="flex items-center gap-2 text-sky-400">
            <Sparkles size={14} /> MT CORE 3.0: UNIFIED ENTERPRISE SOFTWARE SUITE
          </span>
          <span>•</span>
          <span className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 size={14} /> 1. MT RETAIL &amp; SUPERMARKET POS ERP
          </span>
          <span>•</span>
          <span className="flex items-center gap-2 text-teal-400">
            <Users size={14} /> 2. MT PEOPLE &amp; ENTERPRISE HRMS SUITE
          </span>
          <span>•</span>
          <span className="flex items-center gap-2 text-purple-400">
            <GraduationCap size={14} /> 3. MT CAMPUS &amp; SCHOOL MANAGEMENT ERP (SMS)
          </span>
          <span>•</span>
          <span className="text-yellow-400">★ 100% INDEPENDENT ARCHITECTURES • REAL-TIME DATA SYNC • MULTI-TENANT ISOLATED SAAS</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#0b121e] border border-sky-500/30 px-3.5 py-1.5 rounded-full text-xs font-black uppercase text-sky-400">
            <Zap size={14} className="text-sky-400" />
            <span>3 Industry-Leading Standalone Systems — One Unified Ecosystem</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Engineered for <span className="bg-gradient-to-r from-sky-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent">Total Operational Mastery</span>
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Whether powering multi-branch retail superstores, corporate workforce payrolls, or high-tier educational campuses, MT Core provides uncompromising speed and deep domain architecture.
          </p>

          {/* Interactive Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                activeTab === "all"
                  ? "bg-white text-black shadow-lg"
                  : "bg-[#0b121e] text-gray-400 hover:text-white border border-gray-800"
              }`}
            >
              All 3 Systems
            </button>
            <button
              onClick={() => setActiveTab("pos")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                activeTab === "pos"
                  ? "bg-sky-500 text-black shadow-lg shadow-sky-500/20"
                  : "bg-[#0b121e] text-gray-400 hover:text-sky-400 border border-gray-800"
              }`}
            >
              <Laptop size={14} />
              <span>Retail POS ERP</span>
            </button>
            <button
              onClick={() => setActiveTab("hrms")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                activeTab === "hrms"
                  ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                  : "bg-[#0b121e] text-gray-400 hover:text-emerald-400 border border-gray-800"
              }`}
            >
              <Users size={14} />
              <span>HRMS &amp; Payroll</span>
            </button>
            <button
              onClick={() => setActiveTab("sms")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                activeTab === "sms"
                  ? "bg-purple-500 text-black shadow-lg shadow-purple-500/20"
                  : "bg-[#0b121e] text-gray-400 hover:text-purple-400 border border-gray-800"
              }`}
            >
              <GraduationCap size={14} />
              <span>School ERP (SMS)</span>
            </button>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────────────────────── */}
        {/* 2. THE 3 FLAGSHIP SYSTEM CARDS                                               */}
        {/* ───────────────────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {filtered.map((prod) => {
            const Icon = prod.icon;
            return (
              <div
                key={prod.id}
                className={`bg-gradient-to-b from-[#0e1626] to-[#080d15] border ${prod.borderColor} rounded-3xl p-7 flex flex-col justify-between shadow-2xl relative overflow-hidden group transition duration-300 transform hover:-translate-y-1.5`}
              >
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${prod.glowColor} rounded-full blur-3xl pointer-events-none`} />

                <div className="space-y-6 relative z-10">
                  {/* Header Badge */}
                  <div className="flex justify-between items-center">
                    <div className={`p-3.5 rounded-2xl ${prod.accentBg} border border-white/10 shadow-lg`}>
                      <Icon size={26} />
                    </div>
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${prod.badgeClass}`}>
                      {prod.badge}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-white group-hover:text-sky-300 transition">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed">
                      {prod.tagline}
                    </p>
                  </div>

                  {/* Micro Stats Bar */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-800/80 bg-black/40 rounded-xl px-3 text-center">
                    {prod.stats.map((s, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="text-[10px] text-gray-500 uppercase font-mono">{s.label}</div>
                        <div className="text-xs font-black text-white">{s.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 pt-1">
                    <div className="text-[10px] uppercase font-mono font-bold text-gray-500 tracking-wider">
                      Key Architectural Capabilities
                    </div>
                    {prod.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                        <CheckCircle2 size={14} className="shrink-0 text-emerald-400 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call to Actions */}
                <div className="pt-8 space-y-2 relative z-10 border-t border-gray-800/60 mt-6">
                  <Link
                    href={prod.demoLink}
                    className="w-full py-3 px-4 bg-white hover:bg-gray-100 text-black font-black text-xs uppercase rounded-xl flex items-center justify-center gap-2 shadow-lg transition duration-200"
                  >
                    <span>Launch Live Interactive Sandbox</span>
                    <ArrowRight size={14} />
                  </Link>

                  <Link
                    href={prod.requestLink}
                    className="w-full py-2.5 px-4 bg-[#0b121e] hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-1.5 transition duration-200"
                  >
                    <span>Request Custom Commercial License</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* ───────────────────────────────────────────────────────────────────────────── */}
        {/* 3. FUTURE PIPELINE VERTICALS                                                 */}
        {/* ───────────────────────────────────────────────────────────────────────────── */}
        <div className="pt-8 border-t border-gray-800/80">
          <div className="text-center mb-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 font-mono">
              In Active Development • Upcoming Enterprise Suites
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-[#0b121e]/60 border border-pink-500/20 rounded-2xl p-5 flex items-center gap-4">
              <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl">
                <Stethoscope size={24} />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-white">Hospital &amp; Clinic ERP (HMS)</h4>
                  <span className="text-[9px] font-bold bg-pink-500/10 text-pink-400 border border-pink-500/30 px-2 py-0.5 rounded">
                    Q4 2026
                  </span>
                </div>
                <p className="text-xs text-gray-400">OPD Patient Token Registry, Doctor E-Prescriptions &amp; Pathology Lab Sync.</p>
              </div>
            </div>

            <div className="bg-[#0b121e]/60 border border-amber-500/20 rounded-2xl p-5 flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                <Building2 size={24} />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-white">Real Estate &amp; Property ERP</h4>
                  <span className="text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
                    Q1 2027
                  </span>
                </div>
                <p className="text-xs text-gray-400">Housing Scheme Installments, Tenant Rent Agreements &amp; Plot Verification.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
