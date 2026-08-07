"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Laptop, Mail, Phone, MapPin, MessageCircle } from "lucide-react";

export default function SiteFooter() {

  const industries = [
    "Departmental Stores", "Super Markets", "Grocery Stores", 
    "Pharmacy Stores", "Medical Stores", "Book Stores", 
    "Clothing Stores", "Shoe Stores", "Electronics Stores", 
    "Mobile Shops", "Hardware Stores", "Cosmetic Stores"
  ];

  const QuickLinks = [
    { name: "POS Features", href: "/features" },
    { name: "About Us", href: "/about" },
    { name: "Company Blog", href: "/blog" },
    { name: "Contact Sales", href: "/contact" }
  ];


  return (
    <footer className="bg-brand-dark-surface border-t border-brand-dark-border pt-16 pb-8 px-6 lg:px-16 xl:px-24">
      <div suppressHydrationWarning className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        
        {/* Branding & Contact */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="MT UniPOS Logo" className="h-14 w-auto max-w-[220px] object-contain drop-shadow-[0_0_16px_rgba(14,165,233,0.35)]" />
          </Link>
          <p className="text-xs leading-relaxed text-gray-500">
            MT UniPOS (Mian Talal UniPOS) is a premium cloud-based multi-tenant SaaS POS & ERP platform designed to optimize retail checkout, automated inventory, and split-ledger accounting.
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 hover:text-white transition">
              <Mail size={14} className="text-brand-sky" />
              <a href="mailto:miantalal2@gmail.com">miantalal2@gmail.com</a>
            </div>
            <div className="flex items-center gap-2 hover:text-white transition">
              <Phone size={14} className="text-brand-sky" />
              <a href="tel:03396399895">03396399895</a>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 hover:underline transition">
              <MessageCircle size={14} />
              <a href="https://wa.me/923396399895" target="_blank" rel="noreferrer">WhatsApp Chat Support (03396399895)</a>
            </div>
          </div>
        </div>

        {/* Industries Served */}
        <div className="col-span-1 md:col-span-2">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-l-2 border-brand-sky pl-2">Industries Powering on UniPOS</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {industries.map((ind) => (
              <span key={ind} className="bg-brand-dark-surface/50 border border-brand-dark-border/40 p-1.5 rounded text-[11px] hover:border-brand-sky/20 transition-colors">
                • {ind}
              </span>
            ))}
          </div>
        </div>

        {/* Company Links & Address */}
        <div className="space-y-4 text-xs">
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-l-2 border-brand-sky pl-2">Sitemap</h4>
            <div className="grid grid-cols-2 gap-2">
              {QuickLinks.map((link) => (
                <Link key={link.name} href={link.href} className="hover:text-brand-sky transition">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="pt-2 border-t border-brand-dark-border/50 text-[11px] leading-relaxed text-gray-500">
            <div className="flex items-start gap-1.5">
              <MapPin size={16} className="text-brand-sky shrink-0" />
              <span>Headquarters: Kohinoor, Faisalabad, Pakistan.</span>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-brand-dark-border/50 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600">
        <p>© {new Date().getFullYear()} MT UniPOS. All Rights Reserved. Designed by Founder Mian Talal.</p>
        <div className="flex gap-4 mt-4 sm:mt-0">
          <span className="hover:text-gray-400 transition cursor-pointer">Privacy Policy</span>
          <span className="hover:text-gray-400 transition cursor-pointer">Terms of Service</span>
          <span className="hover:text-gray-400 transition cursor-pointer">SLA Agreement</span>
        </div>
      </div>
    </footer>
  );
}
