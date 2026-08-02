"use client";

import React, { useState } from "react";
import {
  LayoutDashboard, ShoppingCart, BarChart3, Brain, Eye, Maximize2, X, CheckCircle2, Zap, ArrowRight
} from "lucide-react";
import Link from "next/link";

interface ShowcaseItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  icon: any;
  src: string;
  url: string;
  badge: string;
  description: string;
  highlights: string[];
}

const showcaseItems: ShowcaseItem[] = [
  {
    id: "dashboard",
    title: "Executive Dashboard",
    subtitle: "Real-time Multi-Branch Shards & Revenue Trends",
    category: "Store Shards & Revenue",
    icon: LayoutDashboard,
    src: "/showcase-dashboard.jpg",
    url: "mt-unipos.com/dashboard",
    badge: "LIVE SHARD SYNC ACTIVE",
    description: "Monitor 7-day revenue & profit curves, live stock asset valuations, net profit margins, top products ranking, and overdue receivables all from a single screen.",
    highlights: [
      "7-Day Revenue & Profit Trend Analysis",
      "Live Net Profit & Gross Margin %",
      "Stock Asset Valuation ($32,400+)",
      "Global Store Shard Configurations"
    ]
  },
  {
    id: "pos",
    title: "Lightning POS Terminal",
    subtitle: "High-Speed Barcode Checkout & Multi-Channel Billing",
    category: "POS Counter Terminal",
    icon: ShoppingCart,
    src: "/showcase-pos.png",
    url: "mt-unipos.com/pos",
    badge: "SUB-SECOND BARCODE SCAN",
    description: "Built for peak retail velocity. Features instant camera barcode scanner, parked carts queue, retail vs wholesale pricing toggles, and customer credit ledger integration.",
    highlights: [
      "Sub-second Barcode & SKU Scanning",
      "Mobile Camera Scanner Support",
      "Hold & Park Multiple Carts",
      "Split Payments: Cash, Card, Bank, Credit"
    ]
  },
  {
    id: "reports",
    title: "Analytics & Cash Flow Audit",
    subtitle: "Executive Financial Ledger & Printable A4 Reports",
    category: "Reports & Auditing",
    icon: BarChart3,
    src: "/showcase-reports.jpg",
    url: "mt-unipos.com/reports",
    badge: "A4 PDF DIRECT DISK EXPORT",
    description: "Complete financial transparency with Daily Cash Flow Audits, payment mix percentages, Tax collected logs, and direct export to Excel, JPG, or PDF.",
    highlights: [
      "Daily Cash Flow & Inflow/Outflow Audit",
      "Payment Mix % (Cash, Credit, Wallet, Card)",
      "Itemized Sales & Return Reports",
      "Direct Save to Documents/MT POS/"
    ]
  },
  {
    id: "ai",
    title: "AI Analytics & Forecasting",
    subtitle: "Predictive Revenue Intelligence & Slow Movers Alert",
    category: "AI Business Intelligence",
    icon: Brain,
    src: "/showcase-ai.png",
    url: "mt-unipos.com/ai",
    badge: "REAL-TIME AI ENGINE",
    description: "AI-driven algorithms analyze store transaction velocity, calculate 7-day & 30-day revenue projections, identify slow-moving stock, and automate reorder alerts.",
    highlights: [
      "7-Day & 30-Day Predictive Revenue",
      "Best Day of Week Sales Velocity",
      "Slow Movers & Dead Stock Detection",
      "Automated Supplier Reorder Triggers"
    ]
  }
];

export default function SoftwareShowcase() {
  const [activeId, setActiveId] = useState("dashboard");
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const activeItem = showcaseItems.find(item => item.id === activeId) || showcaseItems[0];

  return (
    <section className="py-20 bg-black border-b border-brand-dark-border relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-brand-sky/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-brand-dark-surface border border-brand-sky/30 px-3.5 py-1.5 rounded-full mb-4">
            <Zap className="text-brand-sky" size={13} />
            <span className="text-[11px] font-black uppercase tracking-wider text-brand-sky">Live Platform Screenshots</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Experience the <span className="sky-gradient-text">MT UniPOS Interface</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Sleek, dark-mode engineered software designed for maximum visibility, high speed, and immediate operational clarity.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {showcaseItems.map(item => {
            const Icon = item.icon;
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                onClick={() => setActiveId(item.id)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-brand-sky text-black font-black shadow-lg shadow-brand-sky/25 scale-105"
                    : "bg-brand-dark-surface/80 border border-brand-dark-border/80 text-gray-300 hover:border-brand-sky/40 hover:text-white"
                }`}
              >
                <Icon size={16} className={isActive ? "text-black" : "text-brand-sky"} />
                {item.title}
              </button>
            );
          })}
        </div>

        {/* Screenshot Showcase Main Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Screenshot Screen (8 Cols) */}
          <div className="lg:col-span-8">
            <div className="relative bg-[#09090b] border border-white/15 rounded-2xl shadow-2xl overflow-hidden shadow-brand-sky/15 group">
              
              {/* Chrome Top Bar */}
              <div className="bg-[#18181b] px-4 py-3 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  <span className="text-[10px] text-gray-400 font-mono ml-2 hidden sm:inline">{activeItem.subtitle}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    {activeItem.badge}
                  </span>
                  <button
                    onClick={() => setLightboxImg(activeItem.src)}
                    className="p-1.5 bg-black/50 hover:bg-brand-sky hover:text-black text-gray-300 rounded-lg transition"
                    title="View Fullscreen"
                  >
                    <Maximize2 size={13} />
                  </button>
                </div>
              </div>

              {/* Image Screen Container */}
              <div className="relative cursor-pointer overflow-hidden" onClick={() => setLightboxImg(activeItem.src)}>
                <img
                  src={activeItem.src}
                  alt={activeItem.title}
                  className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-[1.02]"
                />
                
                {/* Hover Overlay Hint */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <div className="bg-brand-sky text-black font-black text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-xl">
                    <Eye size={16} /> Click to View High-Res Screenshot
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Details & Highlights (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-brand-dark-surface/60 border border-brand-dark-border p-6 rounded-2xl space-y-4">
              <div className="inline-flex items-center gap-2 bg-brand-sky/10 border border-brand-sky/20 px-3 py-1 rounded-full text-brand-sky font-bold text-[10px] uppercase tracking-wider">
                <activeItem.icon size={12} />
                {activeItem.category}
              </div>

              <h3 className="text-xl font-black text-white tracking-tight">{activeItem.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{activeItem.description}</p>

              <div className="pt-3 border-t border-brand-dark-border/60 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Key System Metrics</div>
                {activeItem.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-200">
                    <CheckCircle2 size={14} className="text-brand-sky shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center gap-3">
                <Link
                  href="/login"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-sky hover:bg-brand-sky-light text-black font-black text-xs py-3 px-4 rounded-xl transition shadow-lg shadow-brand-sky/20"
                >
                  Test Live System <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Lightbox Fullscreen Modal */}
      {lightboxImg && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 sm:p-8 flex flex-col justify-between animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <div className="text-white font-bold text-sm font-mono flex items-center gap-2">
              <Eye size={16} className="text-brand-sky" />
              MT UniPOS High-Definition Screenshot Preview
            </div>
            <button
              onClick={() => setLightboxImg(null)}
              className="p-2 bg-white/10 hover:bg-red-500 text-white rounded-xl transition"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 flex items-center justify-center overflow-auto">
            <img
              src={lightboxImg}
              alt="High-Res Screenshot"
              className="max-w-full max-h-[85vh] object-contain rounded-xl border border-white/20 shadow-2xl"
            />
          </div>

          <div className="text-center text-xs text-gray-400 mt-4">
            Press ESC or click close to exit preview
          </div>
        </div>
      )}
    </section>
  );
}
