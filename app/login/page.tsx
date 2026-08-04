"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useGlobalContext } from "@/context/global-context";
import {
  Laptop, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, Building2, Lock
} from "lucide-react";

function LoginContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { tenants, setCurrentUser, importTenantFromLicenseKey } = useGlobalContext();

  const [inputTenantId, setInputTenantId] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [otpCode, setOtpCode]   = useState(["", "", "", ""]);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading]   = useState(false);

  // Offline Activation State
  const [showOfflineActivation, setShowOfflineActivation] = useState(false);
  const [offlineKey, setOfflineKey] = useState("");
  const [offlineEmail, setOfflineEmail] = useState("");
  const [offlineLoading, setOfflineLoading] = useState(false);
  const [offlineError, setOfflineError] = useState("");
  const [offlineSuccess, setOfflineSuccess] = useState("");

  const activeTenant = tenants.find(t => t.id === inputTenantId) || null;
  const presets      = activeTenant?.credentialPresets || [];

  const isValidTenant = activeTenant !== null;
  const showValidation = inputTenantId.length > 0;
  const tenantGlowClass = !showValidation
    ? "border-brand-dark-border focus:border-brand-sky"
    : isValidTenant
    ? "border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)] focus:border-emerald-400"
    : "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)] focus:border-red-400";

  useEffect(() => {
    if (searchParams.get("onboarded") === "true") {
      setShowSuccess(true);
      if (presets.length > 0) { setEmail(presets[0].email); setPassword(presets[0].pass); }
      else { setEmail("owner@alfatah.com"); setPassword("owner123"); }
    }
  }, [searchParams, presets]);

  useEffect(() => {
    if (searchParams.get("expired") === "true") {
      const tenantName = searchParams.get("tenantName") || "workspace";
      setErrorMessage(`The workspace "${tenantName}" has expired or been suspended. Please contact administration.`);
    }
  }, [searchParams]);



  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setErrorMessage("Please enter both email and password."); return; }
    if (!isValidTenant) {
      setErrorMessage("Workspace ID not found. Please verify your ID.");
      return;
    }
    const isTrialExpired = activeTenant.status === "Trial" && activeTenant.trialEndsAt && new Date(activeTenant.trialEndsAt + "T23:59:59") < new Date();
    if (activeTenant.status === "Expired" || isTrialExpired) {
      setErrorMessage("Your trial has expired. Please contact administration to activate your workspace.");
      return;
    }
    if (activeTenant.status === "Suspended") {
      setErrorMessage("This workspace has been suspended. Please contact administration.");
      return;
    }

    // Check Online-Only requirement
    if (activeTenant.connectivityPlan === "online-only" && typeof navigator !== "undefined" && !navigator.onLine) {
      setErrorMessage("This workspace is configured for Online-Only mode. Active internet connection is required to sign in.");
      return;
    }

    // Check License Expiration
    if (activeTenant.licenseExpiresAt && activeTenant.licenseExpiresAt !== "LIFETIME") {
      const expDate = new Date(activeTenant.licenseExpiresAt + "T23:59:59");
      if (expDate < new Date()) {
        setErrorMessage(`License expired on ${activeTenant.licenseExpiresAt}. Please contact administration for a new license key.`);
        return;
      }
    }

    // Load custom employees registered under this specific tenant ID
    const tenantEmployees = typeof window !== "undefined"
      ? (() => {
          try {
            const data = localStorage.getItem(`unipos_employees_${inputTenantId}`);
            return data ? JSON.parse(data) : [];
          } catch {
            return [];
          }
        })()
      : [];

    // Search preset in active tenant OR across all workspace tenants as fallback
    let presetMatch = presets.find(p => p.email.toLowerCase() === email.toLowerCase() && p.pass === password);

    if (!presetMatch) {
      for (const t of tenants) {
        const found = (t.credentialPresets || []).find(p => p.email.toLowerCase() === email.toLowerCase() && p.pass === password);
        if (found) {
          presetMatch = found;
          setInputTenantId(t.id);
          break;
        }
      }
    }

    const employeeMatch = tenantEmployees.find((emp: any) => emp.email.toLowerCase() === email.toLowerCase() && emp.password === password);

    if (presetMatch || employeeMatch) {
      if (employeeMatch && employeeMatch.status === "Inactive") {
        setErrorMessage("This account is inactive. Please contact your manager.");
        return;
      }
      setErrorMessage("");
      setLoading(true);
      setTimeout(() => { setLoading(false); setStep("otp"); }, 700);
    } else {
      setErrorMessage("Invalid credentials. Please double-check your email and password.");
    }
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otpCode];
    next[i] = val.slice(-1);
    setOtpCode(next);
    if (val && i < 3) (document.getElementById(`otp-${i + 1}`) as HTMLInputElement)?.focus();
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpCode.join("");
    if (code.length < 4) { setErrorMessage("Please enter the 4-digit code."); return; }
    setLoading(true);
    setTimeout(() => {
      setVerificationSuccess(true);
      setErrorMessage("");

      const tenantEmployees = typeof window !== "undefined"
        ? (() => {
            try {
              const data = localStorage.getItem(`unipos_employees_${inputTenantId}`);
              return data ? JSON.parse(data) : [];
            } catch {
              return [];
            }
          })()
        : [];

      const presetMatch = presets.find(p => p.email.toLowerCase() === email.toLowerCase());
      const employeeMatch = tenantEmployees.find((emp: any) => emp.email.toLowerCase() === email.toLowerCase());

      const role = presetMatch?.role || employeeMatch?.role || "Owner";
      const name = presetMatch
        ? (role === "Owner" ? activeTenant?.ownerName || "Owner" : role + " User")
        : (employeeMatch?.name || "Staff User");

      const user = {
        name,
        role,
        email,
        businessName: activeTenant?.businessName || "Unknown",
        tenantId: activeTenant?.id || "",
      };
      setTimeout(() => {
        localStorage.setItem("unipos_current_user", JSON.stringify(user));
        setCurrentUser(user);
        router.push(role === "Cashier" ? "/pos" : "/dashboard");
      }, 1200);
    }, 600);
  };

  const handleOfflineActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offlineKey.trim()) { setOfflineError("License key paste karein."); return; }
    setOfflineLoading(true);
    setOfflineError("");
    setOfflineSuccess("");
    const result = await importTenantFromLicenseKey(offlineKey.trim(), offlineEmail.trim());
    setOfflineLoading(false);
    if (result.success) {
      setOfflineSuccess(`Tenant activate ho gaya! Workspace ID: ${result.tenantId}. Ab login karein.`);
      setInputTenantId(result.tenantId || "");
      if (offlineEmail.trim()) setEmail(offlineEmail.trim());
      setOfflineKey("");
      setOfflineEmail("");
      setTimeout(() => setShowOfflineActivation(false), 3000);
    } else {
      setOfflineError(result.error || "Key invalid hai.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-black font-sans text-gray-100 justify-center items-center gap-12 lg:gap-16 xl:gap-24 px-6 lg:px-16 xl:px-24 relative overflow-y-auto py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.07),transparent_65%)] pointer-events-none" />

      {/* LEFT COLUMN: Features & Details Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col max-w-lg space-y-6 relative z-10">
        <div>
          <span className="bg-brand-sky/10 border border-brand-sky/30 text-brand-sky font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
            All-In-One ERP & POS Platform
          </span>
          <h1 className="text-3xl xl:text-4xl font-black tracking-tight text-white mt-4 leading-tight">
            Streamline your store, dining floor & sharded databases.
          </h1>
          <p className="text-gray-400 text-xs mt-3 leading-relaxed">
            MT UniPOS provides enterprise-grade sharded database tenancy, real-time inventory tracking, dual ledger accounting, and interactive kitchen routing in one unified suite.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-brand-dark-surface/40 border border-brand-dark-border/50 p-4 rounded-xl space-y-1.5 sky-glow-border transition hover:scale-[1.01]">
            <h3 className="text-white font-black text-xs uppercase tracking-wider text-brand-sky">Real-time Stock</h3>
            <p className="text-gray-500 text-[10px] leading-normal">Monitor stock valuation, barcode registries, low-stock notifications, and auto-purchase orders.</p>
          </div>
          <div className="bg-brand-dark-surface/40 border border-brand-dark-border/50 p-4 rounded-xl space-y-1.5 sky-glow-border transition hover:scale-[1.01]">
            <h3 className="text-white font-black text-xs uppercase tracking-wider text-brand-sky">Restaurant POS</h3>
            <p className="text-gray-500 text-[10px] leading-normal">Visual physical table maps, custom waiter routing, and instant kitchen display status syncing.</p>
          </div>
          <div className="bg-brand-dark-surface/40 border border-brand-dark-border/50 p-4 rounded-xl space-y-1.5 sky-glow-border transition hover:scale-[1.01]">
            <h3 className="text-white font-black text-xs uppercase tracking-wider text-brand-sky">Double Ledger</h3>
            <p className="text-gray-500 text-[10px] leading-normal">Automated transactional entries, accounts receivable tracking, payroll shunts, and cash book ledgers.</p>
          </div>
          <div className="bg-brand-dark-surface/40 border border-brand-dark-border/50 p-4 rounded-xl space-y-1.5 sky-glow-border transition hover:scale-[1.01]">
            <h3 className="text-white font-black text-xs uppercase tracking-wider text-brand-sky">AI Analytics</h3>
            <p className="text-gray-500 text-[10px] leading-normal">Interactive demand forecasting, peak times reporting, sales matrix analysis, and data-driven insights.</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-[9px] font-mono text-gray-500 pt-2 border-t border-brand-dark-border/40">
          <div>
            <span className="text-white font-bold block text-xs">99.9%</span>
            Uptime SLA
          </div>
          <div>
            <span className="text-white font-bold block text-xs">AES-256</span>
            Data Encryption
          </div>
          <div>
            <span className="text-white font-bold block text-xs">Tenancy</span>
            Multi-Tenant Isolation
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Sign In Card & Logo */}
      <div className="flex flex-col items-center w-full max-w-md relative z-10 shrink-0">
        
        {/* Welcome shop name header (Floating absolute above) */}
        {isValidTenant && activeTenant && (
          <div className="absolute bottom-full left-0 right-0 mb-5 text-center animate-fade-in-up">
            <span className="text-brand-sky text-[9px] font-mono uppercase tracking-widest bg-brand-sky/10 border border-brand-sky/20 px-2.5 py-0.5 rounded">Connected Workspace</span>
            <h2 className="text-2xl font-black sky-gradient-text mt-1.5 px-4 leading-snug">
              Welcome to {activeTenant.businessName}
            </h2>
          </div>
        )}

        {/* Logo */}
        <Link href="/" className="flex items-center justify-center mb-6 group">
          <img src="/logo.png" alt="MT UniPOS Logo" className="h-20 sm:h-24 md:h-28 w-auto max-w-[320px] object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-[0_0_20px_rgba(14,165,233,0.4)]" />
        </Link>

        {/* Sign In Box */}
        <div className="bg-brand-dark-surface border border-brand-dark-border/80 w-full p-7 rounded-2xl glass-panel sky-glow space-y-6">

          <div className="text-center">
            <h2 className="text-lg font-black text-white">Client Portal Sign In</h2>
            <p className="text-[10px] text-gray-500 mt-1">
              Access POS terminals, inventory, accounting &amp; CRM.
            </p>
          </div>

          {showSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/40 p-3 rounded-xl text-xs flex items-start gap-2 text-emerald-400">
              <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
              Tenant provisioned! Login with the auto-filled Owner credentials below.
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-xs flex items-start gap-2 text-red-400">
              <AlertCircle size={15} className="shrink-0 mt-0.5" /> {errorMessage}
            </div>
          )}

          {/* ── CREDENTIALS STEP ── */}
          {step === "credentials" && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4 text-xs">
              
              {/* Quick Demo Credentials Shortcuts */}
              <div className="bg-brand-dark-surface/60 border border-brand-dark-border/60 p-2.5 rounded-xl space-y-1.5">
                <div className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Quick Demo Credentials:</div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => { setEmail("owner@alfatah.com"); setPassword("owner123"); setErrorMessage(""); }}
                    className="px-2 py-1 bg-brand-sky/10 border border-brand-sky/30 text-brand-sky text-[9px] font-bold rounded hover:bg-brand-sky/20 transition"
                  >
                    👤 Owner (owner123)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEmail("kashif@alfatah.com"); setPassword("password123"); setErrorMessage(""); }}
                    className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[9px] font-bold rounded hover:bg-purple-500/20 transition"
                  >
                    👔 Manager (password123)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEmail("hassan@alfatah.com"); setPassword("password123"); setErrorMessage(""); }}
                    className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold rounded hover:bg-emerald-500/20 transition"
                  >
                    🛒 Cashier (password123)
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-brand-sky tracking-wider mb-1.5">
                  <Building2 size={9} className="inline mr-1" /> Workspace / Tenant ID
                </label>
                <input 
                  type="text" 
                  required 
                  value={inputTenantId}
                  onChange={e => { setInputTenantId(e.target.value.toUpperCase()); setErrorMessage(""); }}
                  placeholder="e.g. AFS-1234"
                  className={`w-full bg-black border p-3 rounded-xl text-white outline-none transition-all duration-300 ${tenantGlowClass}`} 
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Corporate Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="owner@company.com"
                  className="w-full bg-black border border-brand-dark-border p-3 rounded-xl text-white focus:outline-none focus:border-brand-sky transition" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Secure Password</label>
                  <button type="button" className="text-[10px] text-brand-sky hover:underline">Forgot Password?</button>
                </div>
                <div className="relative">
                  <input type={showPwd ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black border border-brand-dark-border p-3 pr-10 rounded-xl text-white focus:outline-none focus:border-brand-sky transition" />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-white transition">
                    {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-[10px] text-gray-400 cursor-pointer select-none">
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-brand-dark-border text-brand-sky" />
                Remember this terminal for 30 days
              </label>

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-brand-sky hover:bg-brand-sky-light disabled:opacity-60 text-black font-black uppercase text-xs tracking-wider rounded-xl flex items-center justify-center gap-2 transition transform hover:scale-[1.01] shadow-lg shadow-brand-sky/20">
                {loading
                  ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  : <>Sign In to Workspace <ArrowRight size={14} /></>}
              </button>
            </form>
          )}

          {/* ── OTP STEP ── */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5 animate-fade-in-up">
              <div className="bg-brand-sky/5 border border-brand-sky/20 p-4 rounded-xl text-[11px] leading-relaxed">
                <div className="text-brand-sky font-black mb-1 flex items-center gap-1.5">
                  <Lock size={11} /> 2FA Verification Required
                </div>
                <span className="text-gray-400">
                  A 4-digit code was sent to <span className="text-white font-bold">{email}</span>.<br />
                  Enter <span className="font-black text-white bg-brand-sky/20 px-1.5 rounded">1 2 3 4</span> for demo access.
                </span>
              </div>

              {verificationSuccess ? (
                <div className="text-center py-8 space-y-3 animate-bounce">
                  <CheckCircle2 size={40} className="text-emerald-400 mx-auto" />
                  <p className="text-emerald-400 font-black text-sm">Identity Verified — Launching...</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-3 text-center">
                      Enter 4-Digit Security Code
                    </label>
                    <div className="flex justify-center gap-3">
                      {otpCode.map((digit, i) => (
                        <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1}
                          value={digit} onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => { if (e.key === "Backspace" && !digit && i > 0) (document.getElementById(`otp-${i - 1}`) as HTMLInputElement)?.focus(); }}
                          className="w-13 h-13 w-12 h-12 bg-black border-2 border-brand-dark-border focus:border-brand-sky rounded-xl text-center text-xl font-black text-white focus:outline-none transition" />
                      ))}
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-3 bg-brand-sky hover:bg-brand-sky-light text-black font-black uppercase text-xs tracking-wider rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-brand-sky/20">
                    {loading
                      ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      : <>Verify &amp; Enter <ArrowRight size={14} /></>}
                  </button>
                  <button type="button" onClick={() => { setStep("credentials"); setOtpCode(["", "", "", ""]); setErrorMessage(""); }}
                    className="w-full text-center text-[10px] text-gray-500 hover:text-white transition">
                    ← Back to credentials
                  </button>
                </>
              )}
            </form>
          )}

          <p className="text-[9px] text-gray-600 text-center">
            Don&apos;t have an account?{" "}
            <Link href="/demo" className="text-brand-sky hover:underline font-bold">Request a Demo</Link>
            {" · "}
            <Link href="/" className="text-gray-500 hover:text-white">Back to Website</Link>
          </p>
        </div>

        {/* ── OFFLINE ACTIVATION PANEL ── */}
        <div className="w-full max-w-md relative z-10">
          <button
            type="button"
            onClick={() => { setShowOfflineActivation(v => !v); setOfflineError(""); setOfflineSuccess(""); }}
            className="w-full flex items-center justify-between text-[10px] text-gray-500 hover:text-gray-300 border border-dashed border-brand-dark-border/50 hover:border-violet-500/40 rounded-xl px-4 py-3 transition group"
          >
            <span className="flex items-center gap-2">
              <Lock size={11} className="text-violet-400" />
              Offline ho? License Key se activate karein
            </span>
            <span className={`transition-transform duration-200 ${showOfflineActivation ? "rotate-180" : ""}`}>▾</span>
          </button>

          {showOfflineActivation && (
            <div className="mt-2 bg-brand-dark-surface border border-violet-500/30 rounded-xl p-5 space-y-4 animate-fade-in-up">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Lock size={11} className="text-violet-400" />
                  <span className="text-[10px] font-black text-violet-400 uppercase tracking-wider">Offline License Activation</span>
                </div>
                <p className="text-[9px] text-gray-500 leading-relaxed">
                  Admin se mili hui license key yahan paste karein. Internet ke baghair bhi kaam karega.
                </p>
              </div>

              {offlineError && (
                <div className="bg-red-500/10 border border-red-500/30 p-2.5 rounded-lg text-[10px] flex items-start gap-2 text-red-400">
                  <AlertCircle size={12} className="shrink-0 mt-0.5" /> {offlineError}
                </div>
              )}
              {offlineSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-lg text-[10px] flex items-start gap-2 text-emerald-400">
                  <CheckCircle2 size={12} className="shrink-0 mt-0.5" /> {offlineSuccess}
                </div>
              )}

              <form onSubmit={handleOfflineActivation} className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">
                    Owner Corporate Email
                  </label>
                  <input
                    type="email"
                    required
                    value={offlineEmail}
                    onChange={e => setOfflineEmail(e.target.value)}
                    placeholder="owner@company.com"
                    className="w-full bg-black border border-brand-dark-border focus:border-violet-500 p-2.5 rounded-xl text-white text-xs outline-none transition mb-2"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">
                    License Key
                  </label>
                  <textarea
                    value={offlineKey}
                    onChange={e => setOfflineKey(e.target.value)}
                    placeholder="UNIPOS-V1.eyJ0ZW5hbn..."
                    rows={4}
                    className="w-full bg-black border border-brand-dark-border focus:border-violet-500 p-3 rounded-xl text-white text-[10px] font-mono outline-none transition resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={offlineLoading}
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-black uppercase text-xs tracking-wider rounded-xl flex items-center justify-center gap-2 transition"
                >
                  {offlineLoading
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><Lock size={12} /> Verify &amp; Activate Workspace</>}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClientLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-black font-sans text-gray-500 justify-center items-center text-xs font-mono">
        Loading MT UniPOS authentication...
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
