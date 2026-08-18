"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGlobalContext } from "@/context/global-context";
import MTCoreLogo from "@/components/mt-logo";
import {
  ShieldAlert, ArrowRight, Eye, EyeOff, Lock, KeyRound, Server,
  Database, Zap, Award, Sparkles, Sun, Moon, Home, Users, Laptop,
  GraduationCap, CheckCircle2, ShieldCheck, Activity
} from "lucide-react";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { setCurrentUser, theme, toggleTheme } = useGlobalContext();
  const isLight = theme === "light";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading]   = useState(false);

  const handleApplyPreset = () => {
    setEmail("talal344");
    setPassword("talal344");
    setErrorMessage("");
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "talal344" && password === "talal344") {
      setErrorMessage("");
      setLoading(true);
      const adminUser = { name: "Mian Talal (SaaS Admin)", role: "SuperAdmin", email: "talal344" };
      setTimeout(() => {
        localStorage.setItem("unipos_current_user", JSON.stringify(adminUser));
        setCurrentUser(adminUser);
        router.push("/admin/dashboard");
      }, 500);
    } else {
      setErrorMessage("Invalid Super Admin credentials. Use the preset button below.");
    }
  };

  return (
    <div className={`flex flex-col min-h-screen font-sans justify-center items-center relative overflow-y-auto py-12 px-6 lg:px-12 xl:px-20 transition-colors duration-200 ${
      isLight ? "bg-slate-50 text-slate-900" : "bg-black text-gray-100"
    }`}>
      {/* Background Ambient Glow */}
      <div className={`absolute inset-0 pointer-events-none ${
        isLight
          ? "bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.08),transparent_65%),radial-gradient(ellipse_at_bottom_left,rgba(14,165,233,0.06),transparent_60%)]"
          : "bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.09),transparent_65%)]"
      }`} />

      {/* Top Floating Controls */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <Link
          href="/"
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
            isLight
              ? "bg-white border-slate-200 text-slate-700 hover:text-purple-600 hover:border-purple-300 shadow-xs"
              : "bg-white/5 border-white/10 text-gray-300 hover:text-white hover:border-purple-500/40"
          }`}
          title="Return to Home"
        >
          <Home size={14} />
          <span className="hidden sm:inline">Back to Website</span>
        </Link>

        <Link
          href="/login"
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
            isLight
              ? "bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100 shadow-xs"
              : "bg-sky-500/10 border-sky-500/30 text-sky-300 hover:bg-sky-500/20"
          }`}
          title="Client Portal Login"
        >
          <Laptop size={14} />
          <span className="hidden sm:inline">Client Login</span>
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-center ${
            isLight
              ? "bg-white border-slate-200 text-slate-800 hover:bg-slate-100 shadow-xs"
              : "bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10"
          }`}
          title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {isLight ? <Moon size={15} className="text-slate-800" /> : <Sun size={15} className="text-yellow-400" />}
        </button>
      </div>

      {/* 2-PANE MAIN CONTAINER */}
      <div className="flex flex-col lg:flex-row w-full max-w-6xl justify-center items-stretch gap-10 lg:gap-14 xl:gap-16 relative z-10 my-auto">

        {/* ── LEFT PANE: Super Admin Login Setup ── */}
        <div className="flex flex-col items-center justify-center w-full lg:max-w-md shrink-0">
          
          {/* Brand Logo */}
          <Link href="/" className="flex flex-col items-center justify-center mb-6 group cursor-pointer">
            <div className="transition-all duration-300 group-hover:scale-105">
              <MTCoreLogo variant="purple" size="lg" showText={true} collapsed={false} theme={isLight ? "light" : "dark"} />
            </div>
            <span className={`text-[10px] font-medium mt-3 tracking-wider uppercase ${isLight ? "text-slate-500" : "text-gray-500"}`}>
              The core technology behind your business.
            </span>
          </Link>

          {/* Admin Card */}
          <div className={`w-full p-7 sm:p-8 rounded-3xl border space-y-6 transition-all ${
            isLight
              ? "bg-white border-slate-200 shadow-xl shadow-slate-200/60 text-slate-900"
              : "bg-brand-dark-surface border-purple-500/30 glass-panel shadow-2xl shadow-purple-500/10 text-white"
          }`}>
            
            <div className="text-center">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border ${
                isLight
                  ? "bg-purple-50 border-purple-200 text-purple-700"
                  : "bg-purple-500/15 border-purple-500/40 text-purple-300"
              }`}>
                <ShieldAlert size={12} className="animate-pulse" />
                <span>Restricted Access Control</span>
              </div>
              <h2 className={`text-xl font-black ${isLight ? "text-slate-900" : "text-white"}`}>
                Super Admin Gate
              </h2>
              <p className={`text-xs mt-1.5 ${isLight ? "text-slate-500 font-medium" : "text-gray-400"}`}>
                Global SaaS master control — manage tenants, billing, microservices &amp; security policies.
              </p>
            </div>

            {errorMessage && (
              <div className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 border ${
                isLight ? "bg-rose-50 border-rose-200 text-rose-800 font-medium" : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}>
                <ShieldAlert size={15} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* ── ADMIN LOGIN FORM ── */}
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className={`block text-[10px] uppercase font-bold tracking-wider mb-1.5 ${
                  isLight ? "text-purple-800" : "text-purple-300"
                }`}>
                  Super Admin Username
                </label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="talal344"
                  className={`w-full p-3 rounded-xl focus:outline-none transition font-bold font-mono border ${
                    isLight
                      ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-purple-500"
                      : "bg-black border-brand-dark-border text-white placeholder-gray-600 focus:border-purple-500"
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[10px] uppercase font-bold tracking-wider mb-1.5 ${
                  isLight ? "text-slate-600" : "text-gray-400"
                }`}>
                  Secure Master Password
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full p-3 pr-10 rounded-xl focus:outline-none transition font-bold border ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-purple-500"
                        : "bg-black border-brand-dark-border text-white placeholder-gray-600 focus:border-purple-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className={`absolute right-3 top-3 transition ${
                      isLight ? "text-slate-400 hover:text-slate-800" : "text-gray-500 hover:text-white"
                    }`}
                  >
                    {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-60 text-white font-black uppercase text-xs tracking-wider rounded-xl flex items-center justify-center gap-2 transition transform hover:scale-[1.01] active:scale-95 shadow-lg shadow-purple-500/25 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Super Admin</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            {/* Autofill Demo Credentials */}
            <div className={`border-t pt-4 ${isLight ? "border-slate-200" : "border-brand-dark-border/60"}`}>
              <button
                type="button"
                onClick={handleApplyPreset}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border ${
                  isLight
                    ? "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 shadow-xs"
                    : "bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                }`}
              >
                <Zap size={14} className="text-amber-500" />
                <span>⚡ Autofill Demo Credentials</span>
              </button>
            </div>

            {/* Footer Navigation */}
            <div className="text-center pt-1">
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-gray-500"}`}>
                <Link href="/login" className={`hover:underline font-bold ${isLight ? "text-sky-600" : "text-sky-400"}`}>← Client Login</Link>
                {" · "}
                <Link href="/" className={`hover:underline ${isLight ? "text-slate-600 hover:text-slate-900" : "text-gray-400 hover:text-white"}`}>Back to Website</Link>
              </p>
            </div>

          </div>
        </div>

        {/* ── RIGHT PANE: Software Information & Text Effects Showcase ── */}
        <div className="flex flex-col justify-between space-y-6 lg:max-w-lg">
          
          <div className="space-y-4">
            {/* Header Badge */}
            <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
              isLight
                ? "bg-purple-50 border-purple-200 text-purple-700 shadow-xs"
                : "bg-purple-500/15 border-purple-500/30 text-purple-300"
            }`}>
              <Sparkles size={12} className="text-purple-500 animate-pulse" />
              <span>Global SaaS Infrastructure Plane</span>
            </div>

            {/* Glowing Headline with text effects */}
            <h1 className={`text-3xl sm:text-4xl font-black tracking-tight leading-tight ${
              isLight ? "text-slate-900" : "text-white"
            }`}>
              Autonomous Multi-Tenant <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent">ERP &amp; Infrastructure</span> Control
            </h1>

            <p className={`text-xs sm:text-sm leading-relaxed ${
              isLight ? "text-slate-600 font-medium" : "text-gray-400"
            }`}>
              Real-time tenant isolated database schemas, high-frequency POS checkout microservices, double-entry automated accounting vouchers, and synchronized biometric attendance matrices.
            </p>

            {/* Live Status Pill */}
            <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-mono ${
              isLight
                ? "bg-white border-slate-200 text-slate-800 shadow-xs"
                : "bg-brand-dark-surface/60 border-brand-dark-border text-gray-300"
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>114 Microservices Active</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                isLight ? "bg-emerald-100 text-emerald-800" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              }`}>
                &lt;15ms Latency
              </span>
            </div>
          </div>

          {/* 4 Feature Architecture Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            <div className={`p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
              isLight
                ? "bg-white border-slate-200 shadow-xs hover:border-purple-300 hover:shadow-md"
                : "bg-brand-dark-surface/40 border-purple-500/20 hover:border-purple-500/50"
            }`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 border ${
                isLight ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-purple-500/10 border-purple-500/30 text-purple-400"
              }`}>
                <Server size={16} />
              </div>
              <h3 className={`font-bold text-xs mb-1 ${isLight ? "text-slate-900" : "text-white"}`}>
                Multi-Tenant Sharding
              </h3>
              <p className={`text-[10px] leading-relaxed ${isLight ? "text-slate-500 font-medium" : "text-gray-400"}`}>
                Dynamic tenant isolation with zero cross-tenant data leakage and separate general ledgers.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
              isLight
                ? "bg-white border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md"
                : "bg-brand-dark-surface/40 border-sky-500/20 hover:border-sky-500/50"
            }`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 border ${
                isLight ? "bg-sky-50 border-sky-200 text-sky-700" : "bg-sky-500/10 border-sky-500/30 text-sky-400"
              }`}>
                <Activity size={16} />
              </div>
              <h3 className={`font-bold text-xs mb-1 ${isLight ? "text-slate-900" : "text-white"}`}>
                Tri-Platform Ecosystem
              </h3>
              <p className={`text-[10px] leading-relaxed ${isLight ? "text-slate-500 font-medium" : "text-gray-400"}`}>
                Unified control over Universal POS, Corporate HRMS &amp; EduCloud SMS from one hub.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
              isLight
                ? "bg-white border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md"
                : "bg-brand-dark-surface/40 border-emerald-500/20 hover:border-emerald-500/50"
            }`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 border ${
                isLight ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              }`}>
                <Database size={16} />
              </div>
              <h3 className={`font-bold text-xs mb-1 ${isLight ? "text-slate-900" : "text-white"}`}>
                Cloud Zero-Loss Backup
              </h3>
              <p className={`text-[10px] leading-relaxed ${isLight ? "text-slate-500 font-medium" : "text-gray-400"}`}>
                Continuous Google Drive sync, local disk exports &amp; encrypted point-in-time recovery.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
              isLight
                ? "bg-white border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-md"
                : "bg-brand-dark-surface/40 border-amber-500/20 hover:border-amber-500/50"
            }`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 border ${
                isLight ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-amber-500/10 border-amber-500/30 text-amber-400"
              }`}>
                <Award size={16} />
              </div>
              <h3 className={`font-bold text-xs mb-1 ${isLight ? "text-slate-900" : "text-white"}`}>
                Automated Billing &amp; SLA
              </h3>
              <p className={`text-[10px] leading-relaxed ${isLight ? "text-slate-500 font-medium" : "text-gray-400"}`}>
                Recurring SaaS invoices, lifetime offline license generators &amp; 99.99% guaranteed SLA.
              </p>
            </div>

          </div>

          {/* Footer Metrics */}
          <div className={`flex items-center justify-between text-[10px] font-mono pt-3 border-t ${
            isLight ? "border-slate-200 text-slate-500" : "border-brand-dark-border/50 text-gray-500"
          }`}>
            <div>
              <span className={`font-bold block text-xs ${isLight ? "text-slate-900" : "text-white"}`}>99.99%</span>
              Cloud SLA Uptime
            </div>
            <div>
              <span className={`font-bold block text-xs ${isLight ? "text-slate-900" : "text-white"}`}>256-Bit</span>
              Bank-Grade TLS
            </div>
            <div>
              <span className={`font-bold block text-xs ${isLight ? "text-slate-900" : "text-white"}`}>Mian Talal</span>
              Chief Architect
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
