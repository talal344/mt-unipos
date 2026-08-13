"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGlobalContext } from "@/context/global-context";
import {
  Laptop, ShieldAlert, ArrowRight, CheckCircle2, Eye, EyeOff, Lock, KeyRound
} from "lucide-react";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useGlobalContext();

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
    <div className="flex flex-col min-h-screen bg-black font-sans text-gray-100 justify-center items-center px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.08),transparent_65%)] pointer-events-none" />

      {/* Brand Header */}
      <Link href="/" className="flex flex-col items-center justify-center mb-6 group">
        <img src="/logo.png" alt="MT Core Logo" className="h-20 sm:h-24 w-auto max-w-[340px] object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-[0_0_20px_rgba(168,85,247,0.45)]" />
        <span className="text-[10px] text-gray-400 font-medium mt-1">The core technology behind your business.</span>
      </Link>

      <div className="bg-brand-dark-surface border border-purple-500/20 w-full max-w-md p-7 rounded-2xl glass-panel relative z-10 shadow-2xl shadow-purple-500/5 space-y-6">

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <ShieldAlert size={14} className="text-purple-400" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">Restricted Access</span>
          </div>
          <h2 className="text-lg font-black text-white">MT Core Super Admin Gate</h2>
          <p className="text-[10px] text-gray-500 mt-1">
            Global MT Core SaaS management — tenants, billing, analytics &amp; platform settings.
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-xs text-red-400 flex items-start gap-2">
            <ShieldAlert size={13} className="shrink-0 mt-0.5" /> {errorMessage}
          </div>
        )}

        {/* ── LOGIN FORM ── */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Super Admin Username</label>
            <input type="text" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="talal344"
              className="w-full bg-black border border-brand-dark-border p-3 rounded-xl text-white focus:outline-none focus:border-purple-500 transition font-bold" />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Secure Password</label>
            <div className="relative">
              <input type={showPwd ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black border border-brand-dark-border p-3 pr-10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition font-bold" />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-3 text-gray-500 hover:text-white transition">
                {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-black uppercase text-xs tracking-wider rounded-xl flex items-center justify-center gap-2 transition transform hover:scale-[1.01] shadow-lg shadow-purple-500/20">
            {loading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <>Sign In to Super Admin <ArrowRight size={14} /></>}
          </button>
        </form>

        {/* Preset */}
        <div className="border-t border-brand-dark-border/40 pt-4">
          <button onClick={handleApplyPreset}
            className="w-full px-4 py-2.5 bg-purple-500/10 border border-purple-500/25 rounded-xl text-[10px] font-black text-purple-400 hover:bg-purple-500/20 transition">
            ⚡ Autofill Demo Credentials
          </button>
        </div>

        <p className="text-[9px] text-gray-700 text-center">
          <Link href="/login" className="text-gray-500 hover:text-white">← Client Login</Link>
          {" · "}
          <Link href="/" className="text-gray-500 hover:text-white">Back to Website</Link>
        </p>
      </div>
    </div>
  );
}
