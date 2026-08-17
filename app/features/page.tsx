"use client";

import React, { useState } from "react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import SoftwareShowcase from "@/components/software-showcase";
import { Laptop, ShoppingCart, Database, Barcode, TrendingUp, DollarSign, Users, Award, Heart, MessageSquare, Brain, Lock } from "lucide-react";
import { useGlobalContext } from "@/context/global-context";

export default function FeaturesPage() {
  const [filterCat, setFilterCat] = useState("All");
  const { theme } = useGlobalContext();
  const isLight = theme === "light";

  const modules = [
    { title: "Point of Sale Terminal", desc: "Ultra-responsive cashier screen with live barcode scanner inputs, quick products category drawers, manual discounts, tax additions, pending hold queues, and printable receipts.", category: "Core POS", icon: ShoppingCart },
    { title: "Centralized Inventory Registry", desc: "Track stock quantities in real time across branches, configure multiple colors/sizes variants, handle stock adjustment registers, and view total product asset valuation.", category: "Inventory", icon: Database },
    { title: "Dynamic Barcode System", desc: "Automatically generate SKU and standard barcode values for new items. Directly print custom pricing and barcode labels onto label sheets.", category: "Inventory", icon: Barcode },
    { title: "Double-Entry Accounting Books", desc: "All POS cashier sales, supplier purchases, and operations expenses automatically generate live debit-credit journal vouchers, feeding real Profit & Loss and Balance Sheets.", category: "Accounting", icon: DollarSign },
    { title: "Visual Restaurant Board", desc: "Designed for F&B. Arrange dining tables, check occupied/free states, dispatch kitchen tickets (KDS) for chefs, and compute split-bills.", category: "Food & Beverage", icon: Award },
    { title: "Pharmaceutical Batch Tracker", desc: "Crucial for pharmacies. Register drugs with manufacturing batch numbers, shelves, and active expiry dates. Receive instant warnings 60 days before expiry.", category: "Healthcare", icon: Heart },
    { title: "CRM Loyalty & Campaigns", desc: "Keep customer CNIC, address, and mobile numbers. Accumulate loyalty points on checkout. Build and launch SMS or email marketing templates.", category: "CRM", icon: MessageSquare },
    { title: "Staff Attendance & Payroll", desc: "Track employee attendance (Present, Absent, Late), process monthly salaries based on hours/salaries, and print payslips.", category: "HRM & Payroll", icon: Users },
    { title: "AI Foresight & Predictions", desc: "Generate sales velocity forecasts and smart reorder triggers, warning you of stock-outs before they happen.", category: "AI Analytics", icon: Brain },
    { title: "JWT & Audit Security Log", desc: "Enterprise-grade safety featuring session auditors, system backup schedulers, and strict IP whitelist rules.", category: "Security", icon: Lock }
  ];

  const categories = ["All", "Core POS", "Inventory", "Accounting", "Healthcare", "Food & Beverage", "CRM", "HRM & Payroll", "AI Analytics"];

  const filteredModules = filterCat === "All" ? modules : modules.filter(m => m.category === filterCat);

  return (
    <div className={`flex flex-col min-h-screen font-sans transition-colors duration-200 ${
      isLight ? "bg-slate-50 text-slate-900" : "bg-black text-gray-100"
    }`}>
      <SiteHeader />

      {/* Hero Banner */}
      <section className={`relative pt-20 pb-16 border-b text-center overflow-hidden transition-colors duration-200 ${
        isLight ? "bg-white border-slate-200" : "border-brand-dark-border"
      }`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.08),transparent_60%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <h1 className={`text-3xl sm:text-5xl font-black mb-4 ${isLight ? "text-slate-900" : "text-white"}`}>
            MT Core <span className="sky-gradient-text">Modules &amp; Features</span>
          </h1>
          <p className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            MT Core — The core technology behind your business. Enterprise-level tools out of the box, optimized to eliminate manual calculations and spreadsheets.
          </p>
        </div>
      </section>

      {/* Filter Buttons */}
      <section className={`py-8 border-b transition-colors duration-200 ${
        isLight ? "bg-slate-100/70 border-slate-200" : "bg-brand-dark-surface/30 border-brand-dark-border"
      }`}>
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterCat === cat
                  ? "bg-sky-500 text-white font-black shadow-sm"
                  : isLight
                  ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  : "bg-brand-dark-surface border border-brand-dark-border hover:border-brand-sky/30 text-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Modules Grid */}
      <section className="py-16 w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.title}
                className={`p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] border ${
                  isLight
                    ? "bg-white border-slate-200 hover:border-sky-300 shadow-xs text-slate-900"
                    : "bg-brand-dark-surface/50 border-brand-dark-border hover:border-brand-sky/20 text-white"
                }`}
              >
                <div>
                  <div className={`p-3 rounded-xl w-fit mb-4 border ${
                    isLight ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-brand-sky/10 border-brand-sky/20 text-brand-sky"
                  }`}>
                    <Icon size={20} />
                  </div>
                  <h3 className={`font-black text-sm mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>{mod.title}</h3>
                  <p className={`text-xs leading-relaxed mb-6 ${isLight ? "text-slate-600" : "text-gray-400"}`}>{mod.desc}</p>
                </div>
                
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded w-fit border ${
                  isLight ? "bg-slate-100 border-slate-200 text-slate-600" : "text-gray-500 bg-black/40 border-brand-dark-border"
                }`}>
                  {mod.category}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
