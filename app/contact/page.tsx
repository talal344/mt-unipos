"use client";

import React, { useState } from "react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { Mail, Phone, MapPin, MessageCircle, Send, CheckCircle2 } from "lucide-react";

import { useGlobalContext } from "@/context/global-context";

export default function ContactPage() {
  const { createPublicSupportTicket } = useGlobalContext();
  const [generatedTicket, setGeneratedTicket] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    const ticket = createPublicSupportTicket(
      formData.name,
      formData.email,
      formData.subject,
      formData.message
    );
    
    setGeneratedTicket(ticket.ticketNumber || ticket.id);
  };

  return (
    <div className="flex flex-col min-h-screen bg-black font-sans text-gray-100">
      <SiteHeader />

      {/* Hero Banner */}
      <section className="relative pt-20 pb-16 border-b border-brand-dark-border text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.08),transparent_60%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <h1 className="text-3xl sm:text-5xl font-black mb-4">
            Contact <span className="sky-gradient-text">Our Helpdesk</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
            Need custom pricing modules or custom printer integrations? Get in touch with Mian Talal's deployment team directly.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Contact Cards */}
        <div className="space-y-6">
          <h3 className="text-white font-black text-xl mb-4">Head Office &amp; Channels</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-brand-dark-surface/50 border border-brand-dark-border p-4 rounded-xl space-y-2">
              <Mail className="text-brand-sky" size={20} />
              <h4 className="text-white font-bold text-xs">Email Communication</h4>
              <p className="text-[10px] text-gray-400">sales@mtunipos.com<br />support@mtunipos.com</p>
            </div>
            <div className="bg-brand-dark-surface/50 border border-brand-dark-border p-4 rounded-xl space-y-2">
              <Phone className="text-brand-sky" size={20} />
              <h4 className="text-white font-bold text-xs">Phone Hotline</h4>
              <p className="text-[10px] text-gray-400">Mon-Fri, 9am - 6pm PKT<br />+92 321 5550100</p>
            </div>
          </div>

          <div className="bg-brand-dark-surface/50 border border-brand-dark-border p-5 rounded-xl flex items-start gap-4">
            <MapPin className="text-brand-sky shrink-0" size={24} />
            <div>
              <h4 className="text-white font-bold text-xs mb-1">Corporate Headquarters</h4>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Penthouse Suite #4A, Eden Heights, Main Boulevard, Gulberg III, Lahore, Punjab, Pakistan.
              </p>
            </div>
          </div>

          {/* Interactive WhatsApp Hotline */}
          <a
            href="https://wa.me/923215550100"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/80 p-4 rounded-xl transition"
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="text-emerald-400 animate-pulse" size={24} />
              <div className="text-left">
                <h4 className="text-emerald-400 font-bold text-xs">Immediate WhatsApp Assistance</h4>
                <p className="text-[9px] text-gray-400">Direct query handling with Mian Talal's dev desk</p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Chat Now</span>
          </a>

          {/* SVG Map Mockup */}
          <div className="border border-brand-dark-border rounded-2xl overflow-hidden h-48 bg-brand-dark-surface/30 relative flex flex-col justify-end p-4">
            <svg className="absolute inset-0 w-full h-full text-brand-dark-border/40" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="#050505" />
              <path d="M0,40 h500 M0,100 h500 M0,160 h500 M100,0 v200 M240,0 v200 M380,0 v200" stroke="currentColor" strokeWidth="1" />
              <path d="M0,80 L200,120 L400,90" fill="none" stroke="#111" strokeWidth="6" />
              <circle cx="240" cy="100" r="8" fill="#0EA5E9" className="animate-ping" />
              <circle cx="240" cy="100" r="4" fill="#0EA5E9" />
            </svg>
            <div className="relative bg-black/80 border border-brand-dark-border p-2 rounded text-[10px] w-fit font-mono leading-tight">
              <span className="text-white font-bold">Eden Heights, Gulberg III</span> <br />
              <span className="text-gray-500">Corporate HQ Location</span>
            </div>
          </div>

        </div>

        {/* Contact Form */}
        <div className="bg-brand-dark-surface/60 border border-brand-dark-border p-6 rounded-2xl">
          <h3 className="text-white font-black text-sm uppercase tracking-wider mb-4 border-l-2 border-brand-sky pl-2">Send Message</h3>
          
          {generatedTicket ? (
            <div className="bg-emerald-500/10 border border-emerald-500 p-6 rounded-xl text-center py-12 animate-fade-in-up">
              <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-3" />
              <h4 className="text-white font-bold text-lg mb-2">Message Sent & Ticket Generated!</h4>
              <p className="text-sm text-gray-400 leading-normal mb-4">
                Thank you {formData.name}. Our technical managers will review your message.
              </p>
              <div className="bg-black/50 p-4 rounded-lg inline-block border border-brand-dark-border mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Your Support Ticket No.</p>
                <p className="text-xl font-black text-brand-sky sky-neon-text">{generatedTicket}</p>
              </div>
              <div>
                <a href="/track-ticket" className="bg-brand-sky hover:bg-brand-sky-light text-black font-black px-6 py-2 rounded uppercase tracking-wider text-xs inline-flex items-center gap-2">
                  Track Your Ticket <Send size={12} />
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ali Raza"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black border border-brand-dark-border p-3 rounded text-white focus:outline-none focus:border-brand-sky"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ali@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-black border border-brand-dark-border p-3 rounded text-white focus:outline-none focus:border-brand-sky"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Pharmacy drug shelf module query"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-black border border-brand-dark-border p-3 rounded text-white focus:outline-none focus:border-brand-sky"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Your Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your query in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-black border border-brand-dark-border p-3 rounded text-white focus:outline-none focus:border-brand-sky resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-sky hover:bg-brand-sky-light text-black font-black uppercase text-xs tracking-wider rounded flex items-center justify-center gap-1.5"
              >
                <Send size={14} />
                Send Inquiry
              </button>
            </form>
          )}
        </div>

      </section>

      <SiteFooter />
    </div>
  );
}
