"use client";

import React from "react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import {
  Award, Eye, Rocket, ShieldCheck, Heart, Building2, MapPin, Mail, Phone,
  MessageCircle, Zap, BarChart3, Database, Brain, Lock, CheckCircle2, ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
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
    <div className="flex flex-col min-h-screen bg-black font-sans text-gray-100">
      <SiteHeader />

      {/* Hero Banner */}
      <section className="relative pt-24 pb-20 border-b border-brand-dark-border text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.10),transparent_65%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-brand-dark-surface border border-brand-sky/30 px-3.5 py-1 rounded-full mb-6">
            <Building2 className="text-brand-sky" size={13} />
            <span className="text-[11px] font-black uppercase tracking-wider text-brand-sky">
              Headquartered in Kohinoor, Faisalabad
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4 leading-none">
            About <span className="sky-gradient-text">MT Core</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
            MT Core — The core technology behind your business. Engineered to solve retail stock leakages, streamline checkout speeds, automate double-entry accounting, and manage complete HR operations for growing enterprises.
          </p>
        </div>
      </section>

      {/* Vision & Mission Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Mission */}
        <div className="bg-brand-dark-surface/50 border border-brand-dark-border p-6 rounded-2xl">
          <div className="p-3 bg-brand-sky/10 border border-brand-sky/20 rounded-xl w-fit text-brand-sky mb-4">
            <Rocket size={20} />
          </div>
          <h3 className="text-white font-black text-sm uppercase tracking-wider mb-2">Our Mission</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            To empower retail store owners, pharmacies, and commercial enterprises with a zero-lag, highly reliable SaaS POS &amp; ERP platform that eliminates spreadsheet errors and tracks exact cash velocity.
          </p>
        </div>

        {/* Vision */}
        <div className="bg-brand-dark-surface/50 border border-brand-dark-border p-6 rounded-2xl">
          <div className="p-3 bg-brand-sky/10 border border-brand-sky/20 rounded-xl w-fit text-brand-sky mb-4">
            <Eye size={20} />
          </div>
          <h3 className="text-white font-black text-sm uppercase tracking-wider mb-2">Our Vision</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            To define the standard in commercial commerce where multi-branch inventory, cashier shifts, customer credit ledgers, and AI-driven stock reorders operate seamlessly in real time.
          </p>
        </div>

        {/* Values */}
        <div className="bg-brand-dark-surface/50 border border-brand-dark-border p-6 rounded-2xl">
          <div className="p-3 bg-brand-sky/10 border border-brand-sky/20 rounded-xl w-fit text-brand-sky mb-4">
            <ShieldCheck size={20} />
          </div>
          <h3 className="text-white font-black text-sm uppercase tracking-wider mb-2">Core Values</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Uncompromising financial integrity, high-speed cashier throughput, direct local storage safety for confidential reports, and constant innovation.
          </p>
        </div>

      </section>

      {/* Founder Spotlight */}
      <section className="py-20 bg-brand-dark-surface/30 border-t border-b border-brand-dark-border relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 bg-brand-sky/10 border border-brand-sky/30 px-3.5 py-1 rounded-full text-[10px] text-brand-sky font-black uppercase tracking-wider">
              <Award size={12} />
              Founder Spotlight
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Meet Mian Talal
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Mian Talal founded MT Core with a clear mission: to eliminate disjointed legacy software with cutting-edge technology. Having observed the operational hassles of multi-branch stores, wholesale dealers, pharmacies, and growing businesses, he architected MT Core — The core technology behind your business.
            </p>
            <blockquote className="border-l-2 border-brand-sky pl-4 italic text-xs text-gray-300 leading-relaxed">
              "We didn't just build a cash register. We built a real-time double-entry ledger that empowers store owners to understand their exact cash velocity, profit margins, and inventory restock timelines automatically."
            </blockquote>
            
            <div className="border-t border-brand-dark-border/60 pt-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm font-black text-white">Mian Talal</div>
                <div className="text-[11px] text-brand-sky font-semibold">Founder, CEO &amp; Chief Architect</div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                <a href="tel:03396399895" className="flex items-center gap-1 bg-brand-dark-surface border border-brand-dark-border px-3 py-1.5 rounded-lg text-gray-300 hover:text-white hover:border-brand-sky/40 transition font-mono text-[11px]">
                  <Phone size={12} className="text-brand-sky" /> 03396399895
                </a>
                <a href="mailto:miantalal2@gmail.com" className="flex items-center gap-1 bg-brand-dark-surface border border-brand-dark-border px-3 py-1.5 rounded-lg text-gray-300 hover:text-white hover:border-brand-sky/40 transition font-mono text-[11px]">
                  <Mail size={12} className="text-brand-sky" /> miantalal2@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Founder Graphic Box with Logo */}
          <div className="relative rounded-2xl border border-brand-sky/30 bg-[#09090b] p-6 shadow-2xl overflow-hidden flex flex-col justify-between items-center text-center group min-h-[320px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.15),transparent_70%)] pointer-events-none" />
            
            {/* Logo Image in Box */}
            <div className="my-auto relative z-10 flex flex-col items-center justify-center p-4">
              <div className="p-4 bg-black/60 border border-brand-sky/20 rounded-2xl shadow-xl backdrop-blur-md mb-4 group-hover:scale-105 transition-transform duration-300">
                <img
                  src="/logo.png"
                  alt="MT Core Logo"
                  className="h-16 sm:h-20 w-auto object-contain drop-shadow-[0_0_16px_rgba(14,165,233,0.4)]"
                />
              </div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase">
                ENTERPRISE ERP READY
              </span>
            </div>

            <div className="relative z-10 border-t border-white/10 pt-4 w-full text-center">
              <h4 className="text-base font-black text-white tracking-tight">MT Core</h4>
              <p className="text-[11px] text-brand-sky font-semibold flex items-center justify-center gap-1 mt-0.5">
                <MapPin size={12} /> The core technology behind your business. Crafted in Faisalabad.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Core Capabilities Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-brand-dark-border">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 bg-brand-dark-surface border border-brand-dark-border px-3 py-1 rounded-full text-[10px] text-gray-400 font-black uppercase tracking-wider mb-3">
            <Zap size={12} className="text-brand-sky" />
            Engineered Capabilities
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3">
            Why Business Owners Trust MT Core
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
            Built with modern web technologies, real-time database synchronization, and local disk export security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreCapabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <div key={i} className="bg-brand-dark-surface/40 border border-brand-dark-border p-6 rounded-2xl hover:border-brand-sky/30 transition-all duration-300 space-y-3">
                <div className="p-3 bg-brand-sky/10 border border-brand-sky/20 rounded-xl w-fit text-brand-sky">
                  <Icon size={20} />
                </div>
                <h3 className="text-white font-black text-sm">{cap.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{cap.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Executive Leadership */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">Executive Leadership</h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            Directly led by Founder &amp; Chief Architect Mian Talal.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          {leadership.map((member) => (
            <div key={member.name} className="bg-brand-dark-surface/60 border border-brand-sky/30 p-8 rounded-2xl text-center shadow-xl hover:shadow-brand-sky/10 transition-all duration-300 space-y-4">
              <div className="w-20 h-20 bg-brand-sky text-black font-black rounded-full flex items-center justify-center text-2xl mx-auto shadow-lg shadow-brand-sky/25">
                {member.initial}
              </div>
              <div>
                <h4 className="text-white font-black text-xl mb-1">{member.name}</h4>
                <h5 className="text-brand-sky text-xs font-bold uppercase tracking-wider mb-2">{member.role}</h5>
                <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1 font-mono">
                  <MapPin size={12} className="text-brand-sky" /> {member.location}
                </p>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">{member.desc}</p>
              
              <div className="pt-4 border-t border-brand-dark-border flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
                <a href={`tel:${member.phone}`} className="flex items-center gap-1.5 text-gray-300 hover:text-brand-sky transition">
                  <Phone size={13} className="text-brand-sky" /> {member.phone}
                </a>
                <a href={`mailto:${member.email}`} className="flex items-center gap-1.5 text-gray-300 hover:text-brand-sky transition">
                  <Mail size={13} className="text-brand-sky" /> {member.email}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Direct Contact Banner */}
      <section className="py-12 bg-brand-dark-surface/40 border-t border-brand-dark-border text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h3 className="text-xl font-black text-white mb-2">Ready to Upgrade Your Store Operations?</h3>
          <p className="text-xs text-gray-400 mb-6 max-w-lg mx-auto">
            Get in touch directly with Mian Talal for custom hardware installation, thermal printer setup, or multi-branch deployment.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://wa.me/923396399895"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-black text-black hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
            >
              <MessageCircle size={15} /> WhatsApp Direct (03396399895)
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-sky px-6 py-3 text-xs font-black text-black hover:bg-brand-sky-light transition shadow-lg shadow-brand-sky/20"
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
