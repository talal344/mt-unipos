"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Zap,
  Lock,
  Server,
  FileText,
  Clock,
  Sparkles,
  ShoppingBag,
  Users,
  GraduationCap,
  ChevronRight,
  X,
  CheckCircle2,
  ExternalLink,
  Award,
  Globe
} from "lucide-react";
import MTCoreLogo from "@/components/mt-logo";

type LegalModalType = "privacy" | "terms" | "sla" | null;

export default function SiteFooter() {
  const [activeModal, setActiveModal] = useState<LegalModalType>(null);

  const posLinks = [
    { name: "Supermarket & Retail POS", href: "/pos" },
    { name: "Barcode Inventory & Stocks", href: "/inventory" },
    { name: "Restaurant Tables & Floor", href: "/restaurant" },
    { name: "Kitchen Display System (KDS)", href: "/kds" },
    { name: "Pharmacy Expiry & Salts", href: "/pharmacy" },
    { name: "Live Order & Parcel Tracker", href: "/tracking" }
  ];

  const hrmsLinks = [
    { name: "Employee 360 Directory", href: "/hrms/employees" },
    { name: "Biometric Daily Attendance", href: "/hrms/attendance" },
    { name: "Automated Monthly Payroll", href: "/hrms/payroll" },
    { name: "Shift Planner & Rota", href: "/hrms/shift-planner" },
    { name: "Goals, OKRs & Appraisals", href: "/hrms/goals" },
    { name: "Recruitment ATS & Jobs", href: "/hrms/recruitment" }
  ];

  const smsLinks = [
    { name: "Academic Hub & Subjects", href: "/sms/classes" },
    { name: "Teacher Faculty Matrix", href: "/sms/teachers" },
    { name: "Class Timetable & Periods", href: "/sms/timetable" },
    { name: "Student 360 PVC ID Cards", href: "/sms/students" },
    { name: "Exam Marks & Report Cards", href: "/sms/exams" },
    { name: "3-Copy Bank Fee Challans", href: "/sms/fees" }
  ];

  const platformLinks = [
    { name: "Features Catalog", href: "/features" },
    { name: "About MTCore & Team", href: "/about" },
    { name: "Commercial SaaS Blog", href: "/blog" },
    { name: "Request Live Demo", href: "/demo" },
    { name: "Track Demo Ticket", href: "/track-ticket" },
    { name: "Super Admin Gateway", href: "/admin/login" }
  ];

  return (
    <footer className="bg-gradient-to-b from-[#060a10] via-black to-black border-t border-gray-800 text-gray-400 font-sans relative overflow-hidden">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-32 bg-sky-500/5 blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-emerald-500/5 blur-3xl pointer-events-none" />

      {/* Main Multi-Column Footer Grid */}
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 xl:gap-12 pb-14 border-b border-gray-800/80">
          
          {/* Column 1 & 2: Brand Identity & Contact */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="inline-block">
              <MTCoreLogo variant="sky" size="lg" shape="rectangle" showText={true} />
            </Link>

            <p className="text-xs text-gray-400 leading-relaxed max-w-md">
              <b>MT Core</b> is a next-generation, autonomous Multi-Tenant Cloud ERP ecosystem uniting 
              <b>Universal POS &amp; Retail</b>, <b>Corporate HRMS &amp; Payroll</b>, and 
              <b>EduCloud SMS 360</b> into a single, high-speed platform.
            </p>

            {/* Live System Status Widget */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#0b121e] border border-emerald-500/30 text-xs text-gray-300 shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-emerald-400">Operational</span>
                <span className="text-gray-500">&bull;</span>
                <span className="text-gray-400 text-[11px] font-mono">114 Microservices Live (&lt;15ms)</span>
              </div>
            </div>

            {/* Direct Contact Matrix */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-gray-300 hover:text-sky-400 transition">
                <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                  <Mail size={14} />
                </div>
                <a href="mailto:miantalal2@gmail.com" className="font-bold">miantalal2@gmail.com</a>
              </div>

              <div className="flex items-center gap-2.5 text-gray-300 hover:text-emerald-400 transition">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Phone size={14} />
                </div>
                <a href="tel:03396399895" className="font-bold">03396399895</a>
              </div>

              <div className="flex items-center gap-2.5 text-emerald-400 hover:underline transition">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <MessageCircle size={14} />
                </div>
                <a href="https://wa.me/923396399895" target="_blank" rel="noreferrer" className="font-black tracking-wide">
                  WhatsApp Support (03396399895)
                </a>
              </div>

              <div className="flex items-start gap-2.5 text-gray-400 pt-1">
                <div className="w-7 h-7 rounded-lg bg-gray-800 text-gray-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={14} />
                </div>
                <span className="text-[11px] leading-snug">Headquarters: Kohinoor Plaza, Jaranwala Road, Faisalabad, Pakistan.</span>
              </div>
            </div>
          </div>

          {/* Column 3: POS Systems */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-sky-400 flex items-center gap-1.5">
              <ShoppingBag size={14} />
              <span>Universal POS</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              {posLinks.map((l) => (
                <li key={l.name}>
                  <Link href={l.href} className="hover:text-white transition flex items-center gap-1 group">
                    <ChevronRight size={12} className="text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{l.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: HRMS Systems */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
              <Users size={14} />
              <span>HRMS &amp; Payroll</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              {hrmsLinks.map((l) => (
                <li key={l.name}>
                  <Link href={l.href} className="hover:text-white transition flex items-center gap-1 group">
                    <ChevronRight size={12} className="text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{l.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: School SMS 360 */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
              <GraduationCap size={14} />
              <span>EduCloud SMS</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              {smsLinks.map((l) => (
                <li key={l.name}>
                  <Link href={l.href} className="hover:text-white transition flex items-center gap-1 group">
                    <ChevronRight size={12} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{l.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 6: Platform & Ecosystem */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>Platform Hub</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              {platformLinks.map((l) => (
                <li key={l.name}>
                  <Link href={l.href} className="hover:text-white transition flex items-center gap-1 group">
                    <ChevronRight size={12} className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{l.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Security & Architecture Trust Bar */}
        <div className="py-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-gray-800/80 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-gray-800">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400"><Lock size={16} /></div>
            <div>
              <div className="font-bold text-white">256-Bit SSL / TLS</div>
              <div className="text-[10px] text-gray-500">Bank-Grade Encryption</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-gray-800">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400"><Server size={16} /></div>
            <div>
              <div className="font-bold text-white">Multi-Tenant Isolation</div>
              <div className="text-[10px] text-gray-500">Zero Cross-Tenant Leakage</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-gray-800">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400"><ShieldCheck size={16} /></div>
            <div>
              <div className="font-bold text-white">Cloud Zero-Loss Backup</div>
              <div className="text-[10px] text-gray-500">Auto Google Drive Sync</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-gray-800">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400"><Award size={16} /></div>
            <div>
              <div className="font-bold text-white">99.99% Cloud SLA</div>
              <div className="text-[10px] text-gray-500">Guaranteed High Availability</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal Modal Triggers */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div>
            <p>© {new Date().getFullYear()} <b>MTCore SaaS Platform</b>. All Rights Reserved. Engineered by Founder <b>Mian Talal</b>.</p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <button
              onClick={() => setActiveModal("privacy")}
              className="hover:text-sky-400 transition cursor-pointer font-bold underline-offset-4 hover:underline"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveModal("terms")}
              className="hover:text-emerald-400 transition cursor-pointer font-bold underline-offset-4 hover:underline"
            >
              Terms of Service
            </button>
            <button
              onClick={() => setActiveModal("sla")}
              className="hover:text-purple-400 transition cursor-pointer font-bold underline-offset-4 hover:underline"
            >
              SLA Agreement
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PRIVACY POLICY MODAL                                                   */}
      {/* ========================================================================= */}
      {activeModal === "privacy" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-[#0b121e] border border-sky-500/40 text-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400"><Lock size={18} /></div>
                <div>
                  <h3 className="font-black text-lg text-white">MTCore Privacy &amp; Data Protection Policy</h3>
                  <p className="text-[10px] text-gray-400 font-mono">Last Updated: {new Date().getFullYear()} &bull; Enterprise Compliance</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
              <section className="space-y-1.5">
                <h4 className="font-black text-sm text-sky-400">1. Strict Multi-Tenant Data Isolation</h4>
                <p>
                  Every tenant (business, school, clinic, or enterprise) operating on the MTCore ecosystem is provisioned with strictly partitioned data boundaries. Your products, employee salaries, student records, and transactional financial statements are never shared or co-mingled with any other tenant.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-black text-sm text-sky-400">2. Encryption at Rest &amp; in Transit</h4>
                <p>
                  All network communications are secured using <b>256-Bit SSL/TLS cryptographic protocols</b>. Critical database records (including passwords, employee CNIC documents, biometric logs, and financial ledgers) are hashed and encrypted.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-black text-sm text-sky-400">3. Cloud Backup Synchronization</h4>
                <p>
                  Automated backups synchronized to client Google Drive or local storage are performed through direct OAuth authorization. MTCore does not sell, broker, or monetize client data to any third-party advertisers.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-black text-sm text-sky-400">4. Right to Data Export &amp; Clean Deletion</h4>
                <p>
                  Business owners retain 100% ownership of their commercial data. You have the right to request a complete JSON/CSV export of your database or execute a full clean-slate tenant termination at any time.
                </p>
              </section>
            </div>

            <div className="pt-4 border-t border-gray-800 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
              >
                I Understand &amp; Agree
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TERMS OF SERVICE MODAL                                                 */}
      {/* ========================================================================= */}
      {activeModal === "terms" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-[#0b121e] border border-emerald-500/40 text-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><FileText size={18} /></div>
                <div>
                  <h3 className="font-black text-lg text-white">MTCore Terms of Service &amp; Licensing</h3>
                  <p className="text-[10px] text-gray-400 font-mono">Governing Enterprise SaaS Operations</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
              <section className="space-y-1.5">
                <h4 className="font-black text-sm text-emerald-400">1. Software License Grant</h4>
                <p>
                  Upon subscribing to MTCore (POS, HRMS, SMS, or Multi-Suite), the customer is granted a non-exclusive, revocable, and subscription-bound license to utilize the selected enterprise software modules for legitimate business management.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-black text-sm text-emerald-400">2. Account Responsibility &amp; Credentials</h4>
                <p>
                  The tenant administrator is responsible for maintaining the confidentiality of master credentials and employee role-based access controls (RBAC). MTCore is not liable for unauthorized operations executed through compromised user accounts.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-black text-sm text-emerald-400">3. Recurring Billing &amp; Subscriptions</h4>
                <p>
                  SaaS subscription licenses are billed on a monthly or annual recurring basis as agreed upon in the invoice. Invoices are generated automatically and must be settled within the grace period to avoid automated terminal lock.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-black text-sm text-emerald-400">4. Prohibited Uses</h4>
                <p>
                  Tenants agree not to reverse engineer, decompile, launch denial-of-service attacks, or use MTCore to process unlawful transactions or prohibited goods.
                </p>
              </section>
            </div>

            <div className="pt-4 border-t border-gray-800 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
              >
                Accept Terms of Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SLA AGREEMENT MODAL                                                    */}
      {/* ========================================================================= */}
      {activeModal === "sla" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-[#0b121e] border border-purple-500/40 text-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400"><Award size={18} /></div>
                <div>
                  <h3 className="font-black text-lg text-white">Service Level Agreement (SLA Commitment)</h3>
                  <p className="text-[10px] text-gray-400 font-mono">99.99% Uptime Guarantee &amp; Priority SLA</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
              <section className="space-y-1.5">
                <h4 className="font-black text-sm text-purple-400">1. 99.99% Uptime Commitment</h4>
                <p>
                  MTCore guarantees a monthly system availability of <b>99.99%</b> across all core transaction endpoints, terminal barcode checkout engines, and attendance sync services.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-black text-sm text-purple-400">2. Offline Resilience Guarantee</h4>
                <p>
                  In the event of localized internet outages at retail stores, the <b>MTCore POS IndexedDB Offline Engine</b> continues processing sales orders seamlessly without interruption, queuing transactions for automatic cloud sync upon reconnection.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-black text-sm text-purple-400">3. Priority Support &amp; Incident Resolution</h4>
                <ul className="space-y-1.5 pl-2 list-disc list-inside text-gray-400">
                  <li><b>Critical Outages (Severity 1)</b>: Response within 15 minutes; 24/7 dedicated engineering hotline.</li>
                  <li><b>Major Module Issues (Severity 2)</b>: Response within 2 hours.</li>
                  <li><b>General Inquiries &amp; Feature Requests</b>: Response within 24 hours.</li>
                </ul>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-black text-sm text-purple-400">4. Scheduled Maintenance Windows</h4>
                <p>
                  Routine infrastructure upgrades and database optimizations are executed strictly during low-traffic off-peak hours (02:00 AM – 04:00 AM PKT) with advance customer notification.
                </p>
              </section>
            </div>

            <div className="pt-4 border-t border-gray-800 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
              >
                Acknowledge SLA Agreement
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
