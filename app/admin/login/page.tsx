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
  const [step, setStep] = useState<"login" | "otp">("login");
  const [otpCode, setOtpCode]   = useState(["", "", "", ""]);
  const [otpSuccess, setOtpSuccess] = useState(false);
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
      setTimeout(() => { setLoading(false); setStep("otp"); }, 700);
    } else {
      setErrorMessage("Invalid Super Admin credentials. Use the preset button below.");
    }
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otpCode];
    next[i] = val.slice(-1);
    setOtpCode(next);
    if (val && i < 3) (document.getElementById(`admin-otp-${i + 1}`) as HTMLInputElement)?.focus();
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpCode.join("");
    if (code !== "7777") { setErrorMessage("Incorrect PIN. Enter 7777 for demo access."); return; }
    setLoading(true);
    setTimeout(() => {
      setOtpSuccess(true);
      setErrorMessage("");
      const adminUser = { name: "Mian Talal (SaaS Admin)", role: "SuperAdmin", email: "talal344" };
      setTimeout(() => {
        localStorage.setItem("unipos_current_user", JSON.stringify(adminUser));
        setCurrentUser(adminUser);
        router.push("/admin/dashboard");
      }, 1200);
    }, 600);
  };

  return (
    <div className="flex flex-col min-h-screen bg-black font-sans text-gray-100 justify-center items-center px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.08),transparent_65%)] pointer-events-none" />

      {/* Brand Header */}
      <Link href="/" className="flex items-center justify-center mb-6 group">
        <img src="/logo.png" alt="MT UniPOS Logo" className="h-20 sm:h-24 w-auto max-w-[320px] object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]" />
      </Link>

      <div className="bg-brand-dark-surface border border-purple-500/20 w-full max-w-md p-7 rounded-2xl glass-panel relative z-10 shadow-2xl shadow-purple-500/5 space-y-6">

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <ShieldAlert size={14} className="text-purple-400" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">Restricted Access</span>
          </div>
          <h2 className="text-lg font-black text-white">Super Admin Gate</h2>
          <p className="text-[10px] text-gray-500 mt-1">
            Global SaaS management — tenants, billing, analytics &amp; platform settings.
          </p>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-3 bg-purple-500/5 border border-purple-500/20 rounded-xl px-4 py-2.5">
          <KeyRound size={13} className="text-purple-400 shrink-0" />
          <div className="flex-1">
            <div className="text-[10px] font-black text-purple-300">Hardware-Grade 2FA Enabled</div>
            <div className="text-[9px] text-gray-600">All sessions are logged and audited</div>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
            <span className="text-[8px] text-purple-400 font-black">SECURE</span>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-xs text-red-400 flex items-start gap-2">
            <ShieldAlert size={13} className="shrink-0 mt-0.5" /> {errorMessage}
          </div>
        )}

        {/* ── LOGIN FORM ── */}
        {step === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Super Admin Username</label>
              <input type="text" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="talal344"
                className="w-full bg-black border border-brand-dark-border p-3 rounded-xl text-white focus:outline-none focus:border-purple-500 transition" />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Secure Password</label>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black border border-brand-dark-border p-3 pr-10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition" />
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
                : <>Authenticate <ArrowRight size={14} /></>}
            </button>
          </form>
        )}

        {/* ── OTP STEP ── */}
        {step === "otp" && (
          <form onSubmit={handleOtpVerify} className="space-y-5 animate-fade-in-up">
            <div className="bg-purple-500/5 border border-purple-500/20 p-4 rounded-xl text-[11px] leading-relaxed">
              <div className="text-purple-400 font-black mb-1 flex items-center gap-1.5">
                <Lock size={11} /> Hardware 2FA Token
              </div>
              <span className="text-gray-400">
                Enter your time-based security PIN.<br />
                For demo use: <span className="font-black text-white bg-purple-500/20 px-1.5 rounded">7 7 7 7</span>
              </span>
            </div>

            {otpSuccess ? (
              <div className="text-center py-8 space-y-3 animate-bounce">
                <CheckCircle2 size={40} className="text-emerald-400 mx-auto" />
                <p className="text-emerald-400 font-black text-sm">Security Cleared. Welcome, Mian Talal.</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-3 text-center">
                    4-Digit Admin PIN
                  </label>
                  <div className="flex justify-center gap-3">
                    {otpCode.map((digit, i) => (
                      <input key={i} id={`admin-otp-${i}`} type="text" inputMode="numeric" maxLength={1}
                        value={digit} onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => { if (e.key === "Backspace" && !digit && i > 0) (document.getElementById(`admin-otp-${i - 1}`) as HTMLInputElement)?.focus(); }}
                        className="w-12 h-12 bg-black border-2 border-brand-dark-border focus:border-purple-500 rounded-xl text-center text-xl font-black text-white focus:outline-none transition" />
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase text-xs tracking-wider rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-purple-500/20">
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <>Verify Token <ArrowRight size={14} /></>}
                </button>
                <button type="button" onClick={() => { setStep("login"); setOtpCode(["", "", "", ""]); setErrorMessage(""); }}
                  className="w-full text-center text-[10px] text-gray-600 hover:text-white transition">
                  ← Back to login
                </button>
              </>
            )}
          </form>
        )}

        {/* Preset */}
        {step === "login" && (
          <div className="border-t border-brand-dark-border/40 pt-4">
            <button onClick={handleApplyPreset}
              className="w-full px-4 py-2.5 bg-purple-500/10 border border-purple-500/25 rounded-xl text-[10px] font-black text-purple-400 hover:bg-purple-500/20 transition">
              ⚡ Autofill Demo Credentials
            </button>
          </div>
        )}

        <p className="text-[9px] text-gray-700 text-center">
          <Link href="/login" className="text-gray-500 hover:text-white">← Client Login</Link>
          {" · "}
          <Link href="/" className="text-gray-500 hover:text-white">Back to Website</Link>
        </p>
      </div>
    </div>
  );
}
