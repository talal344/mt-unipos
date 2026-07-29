"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal, Shield, Layers, Award, Laptop, Users, Calendar, ShoppingCart, DollarSign, Database, Stethoscope, Utensils, TrendingUp } from "lucide-react";

export default function DevToolbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Hidden in printable sheets
  if (pathname.includes("/receipt")) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans print:hidden">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-brand-sky hover:bg-brand-sky-light text-black font-bold px-3 py-2 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          <Terminal size={18} className="animate-pulse" />
          <span className="text-xs">MT UniPOS Navigator</span>
        </button>
      ) : (
        <div className="bg-brand-dark-surface border border-brand-sky/30 rounded-xl shadow-2xl p-4 w-80 max-h-[85vh] overflow-y-auto glass-panel sky-glow">
          <div className="flex items-center justify-between border-b border-brand-dark-border pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="text-brand-sky" size={18} />
              <span className="font-bold text-sm tracking-wide sky-gradient-text">Developer Quick Jumps</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white text-xs bg-brand-dark-border px-2 py-0.5 rounded"
            >
              Close
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* SaaS Marketing */}
            <div>
              <h4 className="text-brand-sky font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                <Laptop size={12} />
                SaaS Marketing Website
              </h4>
              <div className="grid grid-cols-2 gap-1.5 text-gray-300">
                <Link href="/" className="hover:text-brand-sky bg-black/40 p-1.5 rounded transition border border-transparent hover:border-brand-sky/20">Home Page</Link>
                <Link href="/about" className="hover:text-brand-sky bg-black/40 p-1.5 rounded transition border border-transparent hover:border-brand-sky/20">About Us</Link>
                <Link href="/features" className="hover:text-brand-sky bg-black/40 p-1.5 rounded transition border border-transparent hover:border-brand-sky/20">Features</Link>
                <Link href="/pricing" className="hover:text-brand-sky bg-black/40 p-1.5 rounded transition border border-transparent hover:border-brand-sky/20">Pricing Portal</Link>
                <Link href="/contact" className="hover:text-brand-sky bg-black/40 p-1.5 rounded transition border border-transparent hover:border-brand-sky/20">Contact Us</Link>
                <Link href="/blog" className="hover:text-brand-sky bg-black/40 p-1.5 rounded transition border border-transparent hover:border-brand-sky/20">SaaS Blog</Link>
                <Link href="/demo" className="hover:text-brand-sky bg-black/40 p-1.5 rounded transition border border-transparent hover:border-brand-sky/20">Demo Request</Link>
              </div>
            </div>

            {/* Authentication Roles */}
            <div>
              <h4 className="text-pink-500 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                <Users size={12} />
                Authentication Portals
              </h4>
              <div className="grid grid-cols-2 gap-1.5 text-gray-300">
                <Link href="/login" className="hover:text-pink-400 bg-black/40 p-1.5 rounded transition border border-transparent hover:border-pink-500/20">Client Login</Link>
                <Link href="/admin/login" className="hover:text-pink-400 bg-black/40 p-1.5 rounded transition border border-transparent hover:border-pink-500/20">Super Admin Login</Link>
              </div>
            </div>

            {/* Super Admin Control */}
            <div>
              <h4 className="text-purple-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                <Shield size={12} />
                Super Admin SaaS Panel
              </h4>
              <div className="grid grid-cols-2 gap-1.5 text-gray-300">
                <Link href="/admin/dashboard" className="hover:text-purple-400 bg-black/40 p-1.5 rounded transition border border-transparent hover:border-purple-500/20">Dashboard Statistics</Link>
                <Link href="/admin/clients" className="hover:text-purple-400 bg-black/40 p-1.5 rounded transition border border-transparent hover:border-purple-500/20">Tenants List</Link>
                <Link href="/admin/invoices" className="hover:text-purple-400 bg-black/40 p-1.5 rounded transition border border-transparent hover:border-purple-500/20">SaaS Billing</Link>
                <Link href="/admin/support" className="hover:text-purple-400 bg-black/40 p-1.5 rounded transition border border-transparent hover:border-purple-500/20">Support Tickets</Link>
              </div>
            </div>

            {/* Client POS Dashboard */}
            <div>
              <h4 className="text-emerald-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                <Layers size={12} />
                Client ERP Operations
              </h4>
              <div className="grid grid-cols-2 gap-1.5 text-gray-300">
                <Link href="/dashboard" className="hover:text-emerald-400 bg-black/40 p-1.5 rounded transition border border-transparent hover:border-emerald-500/20">Client Home</Link>
                <Link href="/pos" className="hover:text-emerald-400 bg-brand-sky/20 border border-brand-sky/50 text-white font-bold p-1.5 rounded transition">CASHIER POS SCREEN</Link>
                <Link href="/products" className="hover:text-emerald-400 bg-black/40 p-1.5 rounded transition border border-transparent hover:border-emerald-500/20">Products Catalog</Link>
                <Link href="/inventory" className="hover:text-emerald-400 bg-black/40 p-1.5 rounded transition border border-transparent hover:border-emerald-500/20">Inventory Ledger</Link>
                <Link href="/restaurant" className="hover:text-emerald-400 bg-black/40 p-1.5 rounded transition border border-transparent hover:border-emerald-500/20">Restaurant Tables</Link>
                <Link href="/pharmacy" className="hover:text-emerald-400 bg-black/40 p-1.5 rounded transition border border-transparent hover:border-emerald-500/20">Pharmacy Expiries</Link>
                <Link href="/accounting" className="hover:text-emerald-400 bg-black/40 p-1.5 rounded transition border border-transparent hover:border-emerald-500/20">Double Ledger</Link>
                <Link href="/payroll" className="hover:text-emerald-400 bg-black/40 p-1.5 rounded transition border border-transparent hover:border-emerald-500/20">Payroll Sheet</Link>
                <Link href="/crm" className="hover:text-emerald-400 bg-black/40 p-1.5 rounded transition border border-transparent hover:border-emerald-500/20">CRM Campaigns</Link>
                <Link href="/reports" className="hover:text-emerald-400 bg-black/40 p-1.5 rounded transition border border-transparent hover:border-emerald-500/20">Report Exports</Link>
                <Link href="/ai" className="hover:text-emerald-400 bg-black/40 p-1.5 rounded transition border border-transparent hover:border-emerald-500/20">AI Forecasting</Link>
                <Link href="/api-docs" className="hover:text-emerald-400 bg-black/40 p-1.5 rounded transition border border-transparent hover:border-emerald-500/20">REST OpenAPI Docs</Link>
              </div>
            </div>

            <div className="bg-brand-dark-border p-2 rounded border border-gray-800 text-[10px] text-gray-400 leading-relaxed text-center">
              Active Path: <code className="text-white font-mono">{pathname}</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
