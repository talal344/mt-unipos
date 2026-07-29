"use client";

import React from "react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { Award, Eye, Rocket, ShieldCheck, Heart } from "lucide-react";

export default function AboutPage() {
  const team = [
    { name: "Mian Talal", role: "Founder & CEO", desc: "Visionary retail strategist with a decade of enterprise software engineering experience.", initial: "MT" },
    { name: "Sarah Ghafoor", role: "Chief Operating Officer", desc: "Expert in retail supply chains and multinational pharmaceutical database operations.", initial: "SG" },
    { name: "Kashif Shah", role: "VP of Product Engineering", desc: "NextJS + Node cloud architect specializing in low-latency POS transaction logic.", initial: "KS" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black font-sans text-gray-100">
      <SiteHeader />

      {/* Hero Banner */}
      <section className="relative pt-20 pb-20 border-b border-brand-dark-border text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.08),transparent_60%)] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <h1 className="text-3xl sm:text-5xl font-black mb-4">
            Our Story: <span className="sky-gradient-text">MT UniPOS</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
            MT UniPOS (Mian Talal UniPOS) is built on a simple premise: commercial businesses, regardless of scale, deserve unified POS operations that auto-sync double-entry accounting ledgers.
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
            To empower retail networks, busy F&amp;B diners, and pharmaceutical pharmacies with a secure, zero-lag cloud terminal to manage checkouts, adjust inventory, and analyze profit sheets.
          </p>
        </div>

        {/* Vision */}
        <div className="bg-brand-dark-surface/50 border border-brand-dark-border p-6 rounded-2xl">
          <div className="p-3 bg-brand-sky/10 border border-brand-sky/20 rounded-xl w-fit text-brand-sky mb-4">
            <Eye size={20} />
          </div>
          <h3 className="text-white font-black text-sm uppercase tracking-wider mb-2">Our Vision</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            To build the standard global commerce platform where inventory reorders, employee payrolls, tax compliance, and smart AI forecasts unify in a single screen.
          </p>
        </div>

        {/* Values */}
        <div className="bg-brand-dark-surface/50 border border-brand-dark-border p-6 rounded-2xl">
          <div className="p-3 bg-brand-sky/10 border border-brand-sky/20 rounded-xl w-fit text-brand-sky mb-4">
            <ShieldCheck size={20} />
          </div>
          <h3 className="text-white font-black text-sm uppercase tracking-wider mb-2">Core Values</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Uncompromising data encryption security, instant double-entry accounting integrity, operational transparency, and dedication to merchant success.
          </p>
        </div>

      </section>

      {/* Founder Spotlight */}
      <section className="py-16 bg-brand-dark-surface/30 border-t border-b border-brand-dark-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 bg-brand-sky/10 border border-brand-sky/30 px-3 py-1 rounded-full text-[10px] text-brand-sky font-bold uppercase tracking-wider">
              <Award size={12} />
              Founder Spotlight
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Meet Mian Talal
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Mian Talal founded MT UniPOS with a simple objective: to replace old, disjointed systems that require manual tallying. Having observed the operational hassles of supermarket cashiers and pharmacy stores, he created a unified ERP software.
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              "We didn't just build a cash register. We built a real-time ledger that empowers small and large store owners to understand their exact cash velocity, profit margins, and inventory restock timelines automatically."
            </p>
            <div className="border-t border-brand-dark-border/60 pt-4 text-xs font-bold text-white">
              Mian Talal <br />
              <span className="text-[10px] font-normal text-gray-500">Founder, CEO &amp; Chief Architect</span>
            </div>
          </div>

          {/* Founder Graphic Box */}
          <div className="relative rounded-2xl border border-brand-sky/20 p-2 bg-black/40 sky-glow-border h-64 sm:h-80 flex flex-col justify-end overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.1),transparent_70%)] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-sky/20 font-black text-9xl select-none font-mono">
              MT
            </div>
            <div className="relative p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-10 text-center md:text-left">
              <h4 className="text-lg font-black text-white">Mian Talal UniPOS</h4>
              <p className="text-[10px] text-brand-sky">Crafted in Lahore, Pakistan for global scale.</p>
            </div>
          </div>

        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Executive Leadership</h2>
          <p className="text-xs text-gray-500 max-w-md mx-auto">Meet the executive team driving retail innovation worldwide.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member) => (
            <div key={member.name} className="bg-brand-dark-surface/40 border border-brand-dark-border p-6 rounded-2xl text-center hover:border-brand-sky/30 transition-all duration-300">
              <div className="w-14 h-14 bg-brand-sky hover:bg-brand-sky-light text-black font-black rounded-full flex items-center justify-center text-lg mx-auto mb-4 transition-all duration-300">
                {member.initial}
              </div>
              <h4 className="text-white font-bold text-sm mb-1">{member.name}</h4>
              <h5 className="text-brand-sky text-[10px] font-bold uppercase tracking-wider mb-3">{member.role}</h5>
              <p className="text-xs text-gray-400 leading-normal">{member.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
