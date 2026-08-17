"use client";

import React from "react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import {
  Award, Eye, Rocket, ShieldCheck, Heart, Building2, MapPin, Mail, Phone,
  MessageCircle, Zap, BarChart3, Database, Brain, Lock, CheckCircle2, ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useGlobalContext } from "@/context/global-context";
import MTCoreLogo from "@/components/mt-logo";

export default function AboutPage() {
  const { theme } = useGlobalContext();
  const isLight = theme === "light";

  const leadership = [
    {
      name: "Mian Talal",
      role: "Founder, CEO & Chief Architect",
      location: "Kohinoor, Faisalabad, Pakistan",
      desc: "Visionary enterprise software architect. Designed and engineered MT Core — The core technology behind your business — from the ground up to replace outdated, fragmented systems with a unified, real-time enterprise SaaS ERP & HRMS platform.",
      initial: "MT",
      email: "miantalal2@gmail.com",
      phone: "03396399895"
    }
  ];

  const coreCapabilities = [
    { icon: Zap, title: "Sub-Second Barcode Checkout", desc: "Multi-lane high speed checkout supporting barcode scanners, weight-scale integration, and camera scanners." },
    { icon: Database, title: "Double-Entry General Ledger", desc: "Automated debit-credit journal vouchers for every sale, return, expense, and dues recovery transaction." },
    { icon: Heart, title: "Drug Batch Expiry Alerts", desc: "Built for pharmacies. Tracks drug batch numbers, shelf locations, and triggers alerts 60 days before expiry." },
    { icon: Brain, title: "AI Analytics & Forecasting", desc: "Predictive algorithms analyze store sales velocity, calculate 7-day/30-day revenue trends, and detect slow movers." },
    { icon: Building2, title: "Multi-Branch Network", desc: "Centralized stock transfers, cashier shift management, and branch-wise profit tracking across unlimited locations." },
    { icon: Lock, title: "Enterprise Security & Audits", desc: "JWT session auth, role-based permissions (Cashier vs Admin), 2FA OTP, and direct local disk report exports." }
  ];

  return (
    <div className={`flex flex-col min-h-screen font-sans transition-colors duration-200 ${
      isLight ? "bg-slate-50 text-slate-900" : "bg-black text-gray-100"
    }`}>
      <SiteHeader />

      {/* Hero Banner */}
      <section className={`relative pt-24 pb-20 border-b text-center overflow-hidden transition-colors duration-200 ${
        isLight ? "bg-white border-slate-200" : "border-brand-dark-border"
      }`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.10),transparent_65%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full mb-6 border ${
            isLight ? "bg-sky-50 border-sky-200 text-sky-700" : "bg-brand-dark-surface border-brand-sky/30 text-brand-sky"
          }`}>
            <Building2 size={13} />
            <span className="text-[11px] font-black uppercase tracking-wider">
              Headquartered in Kohinoor, Faisalabad
            </span>
          </div>

          <h1 className={`text-4xl sm:text-6xl font-black tracking-tight mb-4 leading-none ${isLight ? "text-slate-900" : "text-white"}`}>
            About <span className="sky-gradient-text">MT Core</span>
          </h1>
          <p className={`text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            MT Core — The core technology behind your business. Engineered to solve retail stock leakages, streamline checkout speeds, automate double-entry accounting, and manage complete HR operations for growing enterprises.
          </p>
        </div>
      </section>

      {/* Vision & Mission Grid */}
      <section className="py-16 w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Mission */}
        <div className={`p-6 rounded-2xl border ${
          isLight ? "bg-white border-slate-200 shadow-xs" : "bg-brand-dark-surface/50 border-brand-dark-border"
        }`}>
          <div className={`p-3 rounded-xl w-fit mb-4 border ${
            isLight ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-brand-sky/10 border-brand-sky/20 text-brand-sky"
          }`}>
            <Rocket size={20} />
          </div>
          <h3 className={`font-black text-sm uppercase tracking-wider mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>Our Mission</h3>
          <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-gray-400"}`}>
            To empower retail store owners, pharmacies, and commercial enterprises with a zero-lag, highly reliable SaaS POS &amp; ERP platform that eliminates spreadsheet errors and tracks exact cash velocity.
          </p>
        </div>

        {/* Vision */}
        <div className={`p-6 rounded-2xl border ${
          isLight ? "bg-white border-slate-200 shadow-xs" : "bg-brand-dark-surface/50 border-brand-dark-border"
        }`}>
          <div className={`p-3 rounded-xl w-fit mb-4 border ${
            isLight ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-brand-sky/10 border-brand-sky/20 text-brand-sky"
          }`}>
            <Eye size={20} />
          </div>
          <h3 className={`font-black text-sm uppercase tracking-wider mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>Our Vision</h3>
          <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-gray-400"}`}>
            To define the standard in commercial commerce where multi-branch inventory, cashier shifts, customer credit ledgers, and AI-driven stock reorders operate seamlessly in real time.
          </p>
        </div>

        {/* Values */}
        <div className={`p-6 rounded-2xl border ${
          isLight ? "bg-white border-slate-200 shadow-xs" : "bg-brand-dark-surface/50 border-brand-dark-border"
        }`}>
          <div className={`p-3 rounded-xl w-fit mb-4 border ${
            isLight ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-brand-sky/10 border-brand-sky/20 text-brand-sky"
          }`}>
            <ShieldCheck size={20} />
          </div>
          <h3 className={`font-black text-sm uppercase tracking-wider mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>Core Values</h3>
          <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-gray-400"}`}>
            Uncompromising financial integrity, high-speed cashier throughput, direct local storage safety for confidential reports, and constant innovation.
          </p>
        </div>

      </section>

      {/* Founder Spotlight */}
      <section className={`py-20 border-t border-b relative transition-colors duration-200 ${
        isLight ? "bg-slate-100/60 border-slate-200 text-slate-900" : "bg-brand-dark-surface/30 border-brand-dark-border text-white"
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
              isLight ? "bg-sky-50 border-sky-200 text-sky-700" : "bg-brand-sky/10 border-brand-sky/30 text-brand-sky"
            }`}>
              <Award size={12} />
              Founder Spotlight
            </div>
            <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
              Meet Mian Talal
            </h2>
            <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
              Mian Talal founded MT Core with a clear mission: to eliminate disjointed legacy software with cutting-edge technology. Having observed the operational hassles of multi-branch stores, wholesale dealers, pharmacies, and growing businesses, he architected MT Core — The core technology behind your business.
            </p>
            <blockquote className={`border-l-2 border-sky-500 pl-4 italic text-xs leading-relaxed ${isLight ? "text-slate-700" : "text-gray-300"}`}>
              "We didn't just build a cash register. We built a real-time double-entry ledger that empowers store owners to understand their exact cash velocity, profit margins, and inventory restock timelines automatically."
            </blockquote>
            
            <div className={`border-t pt-4 flex flex-wrap items-center justify-between gap-4 ${isLight ? "border-slate-200" : "border-brand-dark-border/60"}`}>
              <div>
                <div className={`text-sm font-black ${isLight ? "text-slate-900" : "text-white"}`}>Mian Talal</div>
                <div className="text-[11px] text-sky-600 font-semibold">Founder, CEO &amp; Chief Architect</div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                <a href="tel:03396399895" className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition font-mono text-[11px] ${
                  isLight ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-50" : "bg-brand-dark-surface border-brand-dark-border text-gray-300 hover:text-white"
                }`}>
                  <Phone size={12} className="text-sky-500" /> 03396399895
                </a>
                <a href="mailto:miantalal2@gmail.com" className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition font-mono text-[11px] ${
                  isLight ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-50" : "bg-brand-dark-surface border-brand-dark-border text-gray-300 hover:text-white"
                }`}>
                  <Mail size={12} className="text-sky-500" /> miantalal2@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Founder Graphic Box with Logo */}
          <div className={`relative rounded-2xl border p-6 shadow-2xl overflow-hidden flex flex-col justify-between items-center text-center group min-h-[320px] ${
            isLight ? "bg-white border-slate-200 shadow-slate-200" : "border-brand-sky/30 bg-[#09090b]"
          }`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.15),transparent_70%)] pointer-events-none" />
            
            {/* Logo Image in Box */}
            <div className="my-auto relative z-10 flex flex-col items-center justify-center p-4">
              <div className={`p-4 rounded-2xl shadow-xl backdrop-blur-md mb-4 group-hover:scale-105 transition-transform duration-300 border ${
                isLight ? "bg-slate-50 border-slate-200" : "bg-black/60 border-brand-sky/20"
              }`}>
                <MTCoreLogo variant="sky" size="lg" shape="square" theme={isLight ? "light" : "dark"} />
              </div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase">
                ENTERPRISE ERP READY
              </span>
            </div>

            <div className={`relative z-10 border-t pt-4 w-full text-center ${isLight ? "border-slate-100" : "border-white/10"}`}>
              <h4 className={`text-base font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>MT Core</h4>
              <p className="text-[11px] text-sky-600 font-semibold flex items-center justify-center gap-1 mt-0.5">
                <MapPin size={12} /> The core technology behind your business. Crafted in Faisalabad.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Core Capabilities Section */}
      <section className={`py-20 w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 border-b transition-colors duration-200 ${
        isLight ? "border-slate-200" : "border-brand-dark-border"
      }`}>
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-3 border ${
            isLight ? "bg-slate-100 border-slate-200 text-slate-700" : "bg-brand-dark-surface border-brand-dark-border text-gray-400"
          }`}>
            <Zap size={12} className="text-sky-500" />
            Engineered Capabilities
          </div>
          <h2 className={`text-2xl sm:text-4xl font-black tracking-tight mb-3 ${isLight ? "text-slate-900" : "text-white"}`}>
            Why Business Owners Trust MT Core
          </h2>
          <p className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Built with modern web technologies, real-time database synchronization, and local disk export security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreCapabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <div key={i} className={`p-6 rounded-2xl transition-all duration-300 space-y-3 border ${
                isLight ? "bg-white border-slate-200 hover:border-sky-300 shadow-xs" : "bg-brand-dark-surface/40 border-brand-dark-border hover:border-brand-sky/30"
              }`}>
                <div className={`p-3 rounded-xl w-fit border ${
                  isLight ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-brand-sky/10 border-brand-sky/20 text-brand-sky"
                }`}>
                  <Icon size={20} />
                </div>
                <h3 className={`font-black text-sm ${isLight ? "text-slate-900" : "text-white"}`}>{cap.title}</h3>
                <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-gray-400"}`}>{cap.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Executive Leadership */}
      <section className="py-20 w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="text-center mb-12">
          <h2 className={`text-2xl sm:text-4xl font-black tracking-tight mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>Executive Leadership</h2>
          <p className={`text-xs sm:text-sm max-w-md mx-auto ${isLight ? "text-slate-500 font-bold" : "text-gray-500"}`}>
            Directly led by Founder &amp; Chief Architect Mian Talal.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          {leadership.map((member) => (
            <div key={member.name} className={`p-8 rounded-2xl text-center shadow-xl transition-all duration-300 space-y-4 border ${
              isLight ? "bg-white border-slate-200 shadow-slate-200" : "bg-brand-dark-surface/60 border-brand-sky/30 hover:shadow-brand-sky/10"
            }`}>
              <div className="w-20 h-20 bg-sky-500 text-white font-black rounded-full flex items-center justify-center text-2xl mx-auto shadow-lg shadow-sky-500/25">
                {member.initial}
              </div>
              <div>
                <h4 className={`font-black text-xl mb-1 ${isLight ? "text-slate-900" : "text-white"}`}>{member.name}</h4>
                <h5 className="text-sky-600 text-xs font-bold uppercase tracking-wider mb-2">{member.role}</h5>
                <p className={`text-[11px] flex items-center justify-center gap-1 font-mono ${isLight ? "text-slate-500 font-medium" : "text-gray-400"}`}>
                  <MapPin size={12} className="text-sky-500" /> {member.location}
                </p>
              </div>
              <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-gray-300"}`}>{member.desc}</p>
              
              <div className={`pt-4 border-t flex flex-wrap items-center justify-center gap-4 text-xs font-mono ${isLight ? "border-slate-200" : "border-brand-dark-border"}`}>
                <a href={`tel:${member.phone}`} className={`flex items-center gap-1.5 transition ${isLight ? "text-slate-700 hover:text-sky-600" : "text-gray-300 hover:text-brand-sky"}`}>
                  <Phone size={13} className="text-sky-500" /> {member.phone}
                </a>
                <a href={`mailto:${member.email}`} className={`flex items-center gap-1.5 transition ${isLight ? "text-slate-700 hover:text-sky-600" : "text-gray-300 hover:text-brand-sky"}`}>
                  <Mail size={13} className="text-sky-500" /> {member.email}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Direct Contact Banner */}
      <section className={`py-12 border-t text-center transition-colors duration-200 ${
        isLight ? "bg-slate-100 border-slate-200" : "bg-brand-dark-surface/40 border-brand-dark-border"
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h3 className={`text-xl font-black mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>Ready to Upgrade Your Store Operations?</h3>
          <p className={`text-xs mb-6 max-w-lg mx-auto ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Get in touch directly with Mian Talal for custom hardware installation, thermal printer setup, or multi-branch deployment.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://wa.me/923396399895"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-black text-white hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <MessageCircle size={15} /> WhatsApp Direct (03396399895)
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-xs font-black text-white hover:bg-sky-600 transition shadow-lg shadow-sky-500/20 cursor-pointer"
            >
              Contact Desk <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
