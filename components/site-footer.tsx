"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Laptop, Mail, Phone, MapPin, MessageCircle } from "lucide-react";

export default function SiteFooter() {

  const softwareProducts = [
    "POS & Retail ERP Engine", "HRMS & Payroll Suite", 
    "School Management (SMS) 🚀", "Hospital & Clinic (HMS) 🚀", 
    "Real Estate ERP 🚀", "Omnichannel E-Commerce 🚀"
  ];

  const QuickLinks = [
    { name: "SaaS Ecosystem", href: "/features" },
    { name: "About MTCore", href: "/about" },
    { name: "SaaS Blog", href: "/blog" },
    { name: "Contact Sales", href: "/contact" }
  ];


  return (
    <footer className="bg-brand-dark-surface border-t border-brand-dark-border pt-16 pb-8 px-6 lg:px-16 xl:px-24 font-sans">
      <div suppressHydrationWarning className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        
        {/* Branding & Contact */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="MTCore Logo" className="h-14 w-auto max-w-[220px] object-contain drop-shadow-[0_0_16px_rgba(14,165,233,0.35)]" />
          </Link>
          <p className="text-xs leading-relaxed text-gray-400">
            MTCore is a unified multi-SaaS enterprise platform offering specialized software suites including POS Retail ERP, HRMS & Payroll, and upcoming School, Hospital, and Property management platforms. Founded by Mian Talal.
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-gray-300 hover:text-white transition">
              <Mail size={14} className="text-emerald-400" />
              <a href="mailto:miantalal2@gmail.com">miantalal2@gmail.com</a>
            </div>
            <div className="flex items-center gap-2 text-gray-300 hover:text-white transition">
              <Phone size={14} className="text-emerald-400" />
              <a href="tel:03396399895">03396399895</a>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 hover:underline transition">
              <MessageCircle size={14} />
              <a href="https://wa.me/923396399895" target="_blank" rel="noreferrer">WhatsApp Support (03396399895)</a>
            </div>
          </div>
        </div>

        {/* Software Lines Offered */}
        <div className="col-span-1 md:col-span-2">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-l-2 border-emerald-400 pl-2">MTCore Multi-SaaS Software Suite</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {softwareProducts.map((prod) => (
              <span key={prod} className="bg-black/50 border border-gray-800 p-2 rounded-lg text-[11px] text-gray-300 hover:border-emerald-500/40 transition-colors">
                • {prod}
              </span>
            ))}
          </div>
        </div>

        {/* Company Links & Address */}
        <div className="space-y-4 text-xs">
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-l-2 border-emerald-400 pl-2">Sitemap</h4>
            <div className="grid grid-cols-2 gap-2">
              {QuickLinks.map((link) => (
                <Link key={link.name} href={link.href} className="text-gray-400 hover:text-white transition">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="pt-2 border-t border-brand-dark-border/50 text-[11px] leading-relaxed text-gray-400">
            <div className="flex items-start gap-1.5">
              <MapPin size={16} className="text-emerald-400 shrink-0" />
              <span>Headquarters: Kohinoor, Faisalabad, Pakistan.</span>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-brand-dark-border/50 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
        <p>© {new Date().getFullYear()} MTCore SaaS Platform. All Rights Reserved. Engineered by Founder Mian Talal.</p>
        <div className="flex gap-4 mt-4 sm:mt-0">
          <span className="hover:text-gray-400 transition cursor-pointer">Privacy Policy</span>
          <span className="hover:text-gray-400 transition cursor-pointer">Terms of Service</span>
          <span className="hover:text-gray-400 transition cursor-pointer">SLA Agreement</span>
        </div>
      </div>
    </footer>
  );
}
