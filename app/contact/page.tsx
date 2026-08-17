"use client";

import React, { useState } from "react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { Mail, Phone, MapPin, MessageCircle, Send, CheckCircle2 } from "lucide-react";
import { useGlobalContext } from "@/context/global-context";

export default function ContactPage() {
  const { createPublicSupportTicket, theme } = useGlobalContext();
  const isLight = theme === "light";
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
            Contact <span className="sky-gradient-text">Our Helpdesk</span>
          </h1>
          <p className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Need custom pricing modules or custom printer integrations? Get in touch with Mian Talal's deployment team directly.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-16 w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Contact Cards */}
        <div className="space-y-6">
          <h3 className={`font-black text-xl mb-4 ${isLight ? "text-slate-900" : "text-white"}`}>Head Office &amp; Channels</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl space-y-2 border ${
              isLight ? "bg-white border-slate-200 shadow-xs" : "bg-brand-dark-surface/50 border-brand-dark-border"
            }`}>
              <Mail className="text-sky-500" size={20} />
              <h4 className={`font-bold text-xs ${isLight ? "text-slate-900" : "text-white"}`}>Direct Email</h4>
              <p className={`text-[10px] ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>miantalal2@gmail.com</p>
            </div>
            <div className={`p-4 rounded-2xl space-y-2 border ${
              isLight ? "bg-white border-slate-200 shadow-xs" : "bg-brand-dark-surface/50 border-brand-dark-border"
            }`}>
              <Phone className="text-sky-500" size={20} />
              <h4 className={`font-bold text-xs ${isLight ? "text-slate-900" : "text-white"}`}>Direct Hotline</h4>
              <p className={`text-[10px] ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>03396399895</p>
            </div>
          </div>

          <div className={`p-5 rounded-2xl flex items-start gap-4 border ${
            isLight ? "bg-white border-slate-200 shadow-xs" : "bg-brand-dark-surface/50 border-brand-dark-border"
          }`}>
            <MapPin className="text-sky-500 shrink-0" size={24} />
            <div>
              <h4 className={`font-bold text-xs mb-1 ${isLight ? "text-slate-900" : "text-white"}`}>Headquarters Location</h4>
              <p className={`text-[10px] leading-relaxed ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
                Kohinoor Plaza, Jaranwala Road, Faisalabad, Pakistan.
              </p>
            </div>
          </div>

          {/* Interactive WhatsApp Hotline */}
          <a
            href="https://wa.me/923396399895"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/80 p-4 rounded-2xl transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="text-emerald-500 animate-pulse" size={24} />
              <div className="text-left">
                <h4 className="text-emerald-600 font-bold text-xs">Immediate WhatsApp Assistance</h4>
                <p className={`text-[9px] ${isLight ? "text-slate-600" : "text-gray-400"}`}>Direct chat with Founder Mian Talal (03396399895)</p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Chat Now</span>
          </a>

          {/* SVG Map Mockup */}
          <div className={`border rounded-2xl overflow-hidden h-48 relative flex flex-col justify-end p-4 ${
            isLight ? "bg-slate-100 border-slate-200" : "border-brand-dark-border bg-brand-dark-surface/30"
          }`}>
            <svg className={`absolute inset-0 w-full h-full ${isLight ? "text-slate-300" : "text-brand-dark-border/40"}`} xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill={isLight ? "#f8fafc" : "#050505"} />
              <path d="M0,40 h500 M0,100 h500 M0,160 h500 M100,0 v200 M240,0 v200 M380,0 v200" stroke="currentColor" strokeWidth="1" />
              <path d="M0,80 L200,120 L400,90" fill="none" stroke={isLight ? "#cbd5e1" : "#111"} strokeWidth="6" />
              <circle cx="240" cy="100" r="8" fill="#0EA5E9" className="animate-ping" />
              <circle cx="240" cy="100" r="4" fill="#0EA5E9" />
            </svg>
            <div className={`relative p-2.5 rounded-xl text-[10px] w-fit font-mono leading-tight border ${
              isLight ? "bg-white border-slate-200 text-slate-800 shadow-xs" : "bg-black/80 border-brand-dark-border text-white"
            }`}>
              <span className="font-bold">Kohinoor Plaza, Faisalabad</span> <br />
              <span className={isLight ? "text-slate-500" : "text-gray-500"}>Corporate HQ Location</span>
            </div>
          </div>

        </div>

        {/* Contact Form */}
        <div className={`p-6 sm:p-8 rounded-3xl border ${
          isLight ? "bg-white border-slate-200 shadow-xl" : "bg-brand-dark-surface/60 border-brand-dark-border"
        }`}>
          <h3 className={`font-black text-sm uppercase tracking-wider mb-6 border-l-2 border-sky-500 pl-2 ${
            isLight ? "text-slate-900" : "text-white"
          }`}>Send Message</h3>
          
          {generatedTicket ? (
            <div className="bg-emerald-500/10 border border-emerald-500/40 p-6 rounded-2xl text-center py-12 animate-fade-in-up">
              <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" />
              <h4 className={`font-bold text-lg mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>Message Sent &amp; Ticket Generated!</h4>
              <p className={`text-sm leading-normal mb-4 ${isLight ? "text-slate-600" : "text-gray-400"}`}>
                Thank you {formData.name}. Our technical managers will review your message.
              </p>
              <div className={`p-4 rounded-xl inline-block border mb-6 ${
                isLight ? "bg-white border-sky-300 shadow-xs" : "bg-black/50 border-brand-dark-border"
              }`}>
                <p className={`text-xs uppercase tracking-widest font-bold mb-1 ${isLight ? "text-slate-500" : "text-gray-500"}`}>Your Support Ticket No.</p>
                <p className="text-xl font-black text-sky-500 font-mono tracking-wider">{generatedTicket}</p>
              </div>
              <div>
                <a href="/tracking" className="bg-sky-500 hover:bg-sky-600 text-white font-black px-6 py-2.5 rounded-xl uppercase tracking-wider text-xs inline-flex items-center gap-2 shadow-xs">
                  Track Your Ticket <Send size={12} />
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className={`block text-[10px] uppercase font-bold mb-1.5 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ali Raza"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full p-3 rounded-xl focus:outline-none transition border ${
                    isLight
                      ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-sky-500"
                      : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[10px] uppercase font-bold mb-1.5 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ali@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full p-3 rounded-xl focus:outline-none transition border ${
                    isLight
                      ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-sky-500"
                      : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[10px] uppercase font-bold mb-1.5 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Pharmacy drug shelf module query"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className={`w-full p-3 rounded-xl focus:outline-none transition border ${
                    isLight
                      ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-sky-500"
                      : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[10px] uppercase font-bold mb-1.5 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Your Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your query in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={`w-full p-3 rounded-xl focus:outline-none resize-none transition border ${
                    isLight
                      ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-sky-500"
                      : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-95 text-white font-black uppercase text-xs tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/20 cursor-pointer"
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
