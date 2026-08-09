"use client";

import React from "react";
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
  Clock
} from "lucide-react";

export default function SoftwareShowcase() {
  const products = [
    {
      id: "pos",
      name: "POS & Retail ERP Engine",
      subtitle: "Point of Sale, Inventory, Multi-Branch & Supermarket Management",
      icon: Laptop,
      color: "from-sky-500/20 to-blue-500/20",
      borderColor: "border-sky-500/40 hover:border-sky-400",
      accentColor: "text-sky-400",
      badge: "LIVE & ACTIVE ⚡",
      badgeStyle: "bg-sky-500/10 text-sky-400 border-sky-500/30",
      description:
        "Sub-second barcode sales checkout, weight-scale integration, batch expiry tracking, supplier purchase orders, and automated double-entry accounting ledger.",
      features: [
        "Sub-second Barcode Checkout",
        "Multi-Branch Stock Transfer",
        "Pharmacy Batch & Expiry Alerts",
        "Double-Entry Accounting & P&L"
      ],
      link: "/demo?line=POS",
      cta: "Test POS Demo",
      active: true
    },
    {
      id: "hrms",
      name: "HRMS & Payroll Suite",
      subtitle: "Human Resource Information System, Attendance, Leaves & Payroll",
      icon: Users,
      color: "from-emerald-500/20 to-teal-500/20",
      borderColor: "border-emerald-500/40 hover:border-emerald-400",
      accentColor: "text-emerald-400",
      badge: "LIVE & ACTIVE ⚡",
      badgeStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      description:
        "Complete employee lifecycle management, attendance check-in/out roster, manager leave approvals, performance KPIs, and automated month-end salary slip engine.",
      features: [
        "Employee Profile Directory (EIS)",
        "Daily Attendance & Overtime Log",
        "1-Click Leave Approvals",
        "Automated Salary & Payslip Engine"
      ],
      link: "/demo?line=HRMS",
      cta: "Test HRMS Demo",
      active: true
    },
    {
      id: "sms",
      name: "School Management System (SMS)",
      subtitle: "Student Admissions, Fee Vouchers, Exam Grading & Attendance",
      icon: GraduationCap,
      color: "from-purple-500/10 to-indigo-500/10",
      borderColor: "border-purple-500/20",
      accentColor: "text-purple-400",
      badge: "COMING SOON 🚀",
      badgeStyle: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      description:
        "Comprehensive academic management for schools & colleges. Digital fee generation, exam report cards, parent portal app, and teacher salary management.",
      features: [
        "Student Admission Portal",
        "Automated Fee Voucher Billing",
        "Exam Grading & Progress Cards",
        "Parent-Teacher Portal App"
      ],
      link: "#",
      cta: "In Development",
      active: false
    },
    {
      id: "hms",
      name: "Hospital & Clinic ERP (HMS)",
      subtitle: "OPD Patient Registry, Doctor Appointments & Lab Reports",
      icon: Stethoscope,
      color: "from-pink-500/10 to-rose-500/10",
      borderColor: "border-pink-500/20",
      accentColor: "text-pink-400",
      badge: "COMING SOON 🚀",
      badgeStyle: "bg-pink-500/10 text-pink-400 border-pink-500/30",
      description:
        "End-to-end healthcare system for hospitals and diagnostic labs. E-Prescriptions, patient history, bed management, and medical inventory.",
      features: [
        "OPD Patient Token System",
        "Doctor E-Prescriptions",
        "Diagnostic Lab Test Reports",
        "Bed & Ward Management"
      ],
      link: "#",
      cta: "In Development",
      active: false
    },
    {
      id: "realestate",
      name: "Real Estate & Property ERP",
      subtitle: "Property Listings, Tenant Rent Agreements & Installments",
      icon: Building2,
      color: "from-amber-500/10 to-yellow-500/10",
      borderColor: "border-amber-500/20",
      accentColor: "text-amber-400",
      badge: "COMING SOON 🚀",
      badgeStyle: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      description:
        "Property management software for housing societies and realtors. Rent collection, installment schedules, buyer verification, and commission tracking.",
      features: [
        "Property Inventory Ledger",
        "Rent Agreement Management",
        "Installment Plan Tracker",
        "Agent Commission Payouts"
      ],
      link: "#",
      cta: "In Development",
      active: false
    },
    {
      id: "ecommerce",
      name: "Omnichannel E-Commerce Engine",
      subtitle: "Online Store Builder, Inventory Sync & Payment Gateways",
      icon: ShoppingCart,
      color: "from-teal-500/10 to-cyan-500/10",
      borderColor: "border-teal-500/20",
      accentColor: "text-teal-400",
      badge: "COMING SOON 🚀",
      badgeStyle: "bg-teal-500/10 text-teal-400 border-teal-500/30",
      description:
        "Direct-to-consumer online webstore seamlessly synchronized with MTCore inventory. Instant checkout, order tracking, and local payment integration.",
      features: [
        "Instant Webstore Builder",
        "Real-Time Inventory Sync",
        "JazzCash / EasyPaisa / Cards",
        "Order Delivery Tracking"
      ],
      link: "#",
      cta: "In Development",
      active: false
    }
  ];

  return (
    <section className="py-16 bg-[#03060a] border-y border-gray-800/80 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-extrabold uppercase tracking-widest">
            <Sparkles size={12} /> The MTCore Enterprise Suite
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            One Unified Platform. Multiple Specialized SaaS Solutions.
          </h2>
          <p className="text-sm text-gray-400">
            MTCore powers your entire business operations. From high-volume retail POS and enterprise HRMS to upcoming education and healthcare ERPs.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className={`bg-[#0b0f17] border ${p.borderColor} p-6 rounded-2xl space-y-4 transition duration-300 relative group flex flex-col justify-between shadow-xl`}
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${p.color} border border-gray-800 ${p.accentColor}`}>
                      <Icon size={24} />
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${p.badgeStyle}`}>
                      {p.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg font-extrabold text-white group-hover:text-emerald-400 transition">
                      {p.name}
                    </h3>
                    <p className="text-[11px] font-medium text-gray-500 mt-0.5">
                      {p.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    {p.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2 pt-2 border-t border-gray-800/80 text-xs">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-400">
                        <CheckCircle2 size={13} className={p.accentColor} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <div className="pt-4">
                  {p.active ? (
                    <Link
                      href={p.link}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase rounded-xl transition shadow-lg shadow-emerald-900/20"
                    >
                      <span>{p.cta}</span>
                      <ArrowRight size={14} />
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full py-3 bg-gray-800/50 text-gray-500 border border-gray-800 font-bold text-xs uppercase rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Clock size={14} />
                      <span>{p.cta}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
