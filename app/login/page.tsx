"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useGlobalContext } from "@/context/global-context";
import {
  Laptop, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, Building2, Lock, Download, ShieldCheck
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
  const [step, setStep] = useState<"credentials" | "otp" | "offline">("credentials");
  const [otpCode, setOtpCode]   = useState(["", "", "", ""]);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading]   = useState(false);

  // Offline Activation State
  const [offlineKey, setOfflineKey] = useState("");
  const [offlineEmail, setOfflineEmail] = useState("");
  const [offlineLoading, setOfflineLoading] = useState(false);
  const [offlineError, setOfflineError] = useState("");
  const [offlineSuccess, setOfflineSuccess] = useState("");
  const [isDesktopApp, setIsDesktopApp] = useState(false);

  // Activation Modal State
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activatedCredentials, setActivatedCredentials] = useState<{ tenantId: string; email: string; pass: string; businessName: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && ((window as any).electronAPI || navigator.userAgent.includes("Electron"))) {
      setIsDesktopApp(true);
    }
  }, []);

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const activatedTenantId = localStorage.getItem("unipos_last_activated_tenant");
      let blacklisted: string[] = [];
      try {
        blacklisted = JSON.parse(localStorage.getItem("unipos_blacklisted_tenants") || "[]");
      } catch {}

      if (activatedTenantId) {
        const tenantInReg = tenants.find(t => t.id === activatedTenantId);
        const isDeleted = blacklisted.includes(activatedTenantId) || (!tenantInReg && tenants.length > 0);
        const isSuspended = tenantInReg && ((tenantInReg.status as string) === "Suspended" || (tenantInReg.status as string) === "Inactive");

        if (isDeleted || isSuspended) {
          localStorage.removeItem("unipos_offline_activated_system");
          localStorage.removeItem("unipos_last_activated_tenant");
          localStorage.removeItem("unipos_current_user");
          setErrorMessage(
            isDeleted
              ? `⛔ ACCESS DENIED: Workspace "${activatedTenantId}" Super Admin se DELETE ho chuka hai. License access stopped!`
              : `⛔ ACCESS DENIED: Workspace "${activatedTenantId}" Super Admin se SUSPEND ho chuka hai. License access stopped!`
          );
        }
      }
    }
  }, [tenants]);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setErrorMessage("Please enter both email and password."); return; }

    let blacklisted: string[] = [];
    try {
      blacklisted = JSON.parse(localStorage.getItem("unipos_blacklisted_tenants") || "[]");
    } catch {}

    const tenantInReg = tenants.find(t => t.id === inputTenantId);
    if (tenantInReg && tenantInReg.status === "Active") {
      if (blacklisted.includes(inputTenantId)) {
        blacklisted = blacklisted.filter(b => b !== inputTenantId);
        localStorage.setItem("unipos_blacklisted_tenants", JSON.stringify(blacklisted));
      }
    } else if (blacklisted.includes(inputTenantId)) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("unipos_offline_activated_system");
        localStorage.removeItem("unipos_last_activated_tenant");
        localStorage.removeItem("unipos_current_user");
      }
      setErrorMessage(`⛔ ACCESS DENIED: Workspace "${inputTenantId}" has been deleted by Super Admin. Login rejected.`);
      return;
    }

    if (!isValidTenant) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("unipos_offline_activated_system");
        localStorage.removeItem("unipos_last_activated_tenant");
        localStorage.removeItem("unipos_current_user");
      }
      setErrorMessage(`⛔ ACCESS DENIED: Workspace ID "${inputTenantId}" not found or deleted by Super Admin.`);
      return;
    }

    const isTrialExpired = activeTenant.status === "Trial" && activeTenant.trialEndsAt && new Date(activeTenant.trialEndsAt + "T23:59:59") < new Date();
    if (activeTenant.status === "Expired" || isTrialExpired) {
      setErrorMessage("Your trial has expired. Please contact administration to activate your workspace.");
      return;
    }
    if ((activeTenant.status as string) === "Suspended" || (activeTenant.status as string) === "Inactive") {
      if (typeof window !== "undefined") {
        localStorage.removeItem("unipos_offline_activated_system");
        localStorage.removeItem("unipos_last_activated_tenant");
        localStorage.removeItem("unipos_current_user");
      }
      setErrorMessage("⛔ ACCESS DENIED: Workspace has been suspended/deactivated by Super Admin.");
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
      if (typeof window !== "undefined") {
        localStorage.setItem("unipos_offline_activated_system", "true");
        localStorage.setItem("unipos_last_activated_tenant", result.tenantId || "");
      }
      const ownerEmail = offlineEmail.trim() || "owner@alfatah.com";
      const ownerPass = "owner123";

      setInputTenantId(result.tenantId || "");
      setEmail(ownerEmail);
      setPassword(ownerPass);

      setActivatedCredentials({
        tenantId: result.tenantId || "AFS-1001",
        email: ownerEmail,
        pass: ownerPass,
        businessName: (result as any).businessName || "Talal Mart",
      });

      setShowActivationModal(true);
    } else {
      setOfflineError(result.error || "Key invalid hai. Sahi license key paste karein.");
    }
  };

  const handleDownloadCredentialsFile = () => {
    if (!activatedCredentials) return;
    const content = `==============================================\nMT UniPOS Offline License Activation Record\n==============================================\nBusiness Name   : ${activatedCredentials.businessName}\nWorkspace ID    : ${activatedCredentials.tenantId}\nCorporate Email : ${activatedCredentials.email}\nDefault Password: ${activatedCredentials.pass}\nLicense Status  : ACTIVATED & LIFETIME VERIFIED\nActivation Date : ${new Date().toLocaleDateString()}\nSystem ID       : UNIPOS-OFFLINE-LOCAL\n==============================================\n`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `MT_UniPOS_Credentials_${activatedCredentials.tenantId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLaunchDashboardFromActivation = () => {
    if (!activatedCredentials) return;
    const user = {
      name: "Owner",
      role: "Owner",
      email: activatedCredentials.email,
      businessName: activatedCredentials.businessName,
      tenantId: activatedCredentials.tenantId,
    };
    localStorage.setItem("unipos_current_user", JSON.stringify(user));
    setCurrentUser(user);
    setShowActivationModal(false);
    router.push("/dashboard");
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

          {/* ── OFFLINE LICENSE ACTIVATION STEP ── */}
          {step === "offline" && (
            <form onSubmit={handleOfflineActivation} className="space-y-4 text-xs animate-fade-in-up">
              <div className="bg-purple-500/10 border border-purple-500/30 p-3.5 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-purple-400 font-black text-xs uppercase tracking-wider">
                  <Lock size={13} /> Offline License Activation
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Enter your Owner Corporate Email &amp; License Key. System will activate offline for lifetime.
                </p>
              </div>

              {offlineError && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-xs flex items-start gap-2 text-red-400">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" /> {offlineError}
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">
                  Owner Corporate Email
                </label>
                <input
                  type="email"
                  required
                  value={offlineEmail}
                  onChange={(e) => { setOfflineEmail(e.target.value); setOfflineError(""); }}
                  placeholder="owner@company.com"
                  className="w-full bg-black border border-brand-dark-border p-3 rounded-xl text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">
                  License Key / Activation String
                </label>
                <textarea
                  required
                  rows={3}
                  value={offlineKey}
                  onChange={(e) => { setOfflineKey(e.target.value); setOfflineError(""); }}
                  placeholder="UNIPOS-V1.eyJ0ZW5hbnRJZCI6IkFGUy0xMDAxI..."
                  className="w-full bg-black border border-brand-dark-border p-3 rounded-xl text-white font-mono text-[10px] focus:outline-none focus:border-purple-500 transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={offlineLoading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-black uppercase text-xs tracking-wider rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-purple-600/20"
              >
                {offlineLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>🔑 Activate &amp; Generate Credentials <ArrowRight size={14} /></>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setStep("credentials"); setOfflineError(""); }}
                className="w-full text-center text-[10px] text-gray-500 hover:text-white transition pt-1"
              >
                ← Back to Online Sign In
              </button>
            </form>
          )}

          {/* Quick links & Desktop action bar */}
          <div className="space-y-2 text-center pt-2">
            <div className="flex items-center justify-center gap-3 text-[10px] text-gray-400 flex-wrap">
              <Link href="/demo" className="text-brand-sky font-bold hover:underline flex items-center gap-1">
                📝 Apply for Demo
              </Link>
              <span>·</span>
              <Link href="/track-ticket" className="text-purple-400 font-bold hover:underline flex items-center gap-1">
                🎟️ Track Ticket
              </Link>
              <span>·</span>
              <Link href="/features" className="text-emerald-400 font-bold hover:underline flex items-center gap-1">
                ✨ Features
              </Link>
            </div>
            {!isDesktopApp && (
              <p className="text-[9px] text-gray-600">
                <Link href="/" className="text-gray-500 hover:text-white">← Back to Website</Link>
              </p>
            )}
          </div>
        </div>

        {/* ── OFFLINE ACTIVATION BUTTON ── */}
        <div className="w-full max-w-md relative z-10">
          {step !== "offline" && (
            <button
              type="button"
              onClick={() => { setStep("offline"); setOfflineError(""); setErrorMessage(""); }}
              className="w-full flex items-center justify-between text-[10px] text-gray-400 hover:text-white border border-dashed border-brand-dark-border/60 hover:border-purple-500/50 rounded-xl px-4 py-3 transition group bg-brand-dark-surface/40"
            >
              <span className="flex items-center gap-2">
                <Lock size={12} className="text-purple-400" />
                Offline ho? License Key se activate karein
              </span>
              <span className="text-purple-400 font-bold group-hover:translate-x-1 transition-transform">→</span>
            </button>
          )}
        </div>

      </div>

      {/* ── ACTIVATION CREDENTIALS POPUP MODAL ── */}
      {showActivationModal && activatedCredentials && (
        <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0d1117] border border-purple-500/40 w-full max-w-md rounded-2xl p-6 shadow-[0_0_50px_rgba(168,85,247,0.3)] space-y-5 relative font-sans">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center mx-auto mb-2 animate-bounce">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-lg font-black text-white">System Activated Successfully!</h3>
              <p className="text-[11px] text-gray-400">
                Aap ka offline system 1-time activate ho gaya hai. Aap ke Login Credentials yeh hain:
              </p>
            </div>

            {/* Credentials Card */}
            <div className="bg-black/80 border border-purple-500/30 p-4 rounded-xl space-y-3 text-xs font-mono">
              <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                <span className="text-gray-400 text-[10px] uppercase font-bold">Workspace / Tenant ID</span>
                <span className="text-purple-300 font-black text-sm">{activatedCredentials.tenantId}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                <span className="text-gray-400 text-[10px] uppercase font-bold">Username / Email</span>
                <span className="text-white font-bold">{activatedCredentials.email}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-[10px] uppercase font-bold">Default Password</span>
                <span className="text-emerald-400 font-black tracking-widest">{activatedCredentials.pass}</span>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl text-[10px] text-emerald-400 flex items-center gap-2">
              <ShieldCheck size={14} className="shrink-0" />
              <span>Next time se is system par sirf Workspace ID &amp; Password se direct login ho ga!</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleDownloadCredentialsFile}
                className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition border border-gray-700"
              >
                <Download size={14} /> Save &amp; Download Credentials File (.txt)
              </button>

              <button
                type="button"
                onClick={handleLaunchDashboardFromActivation}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase text-xs tracking-wider rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-purple-600/30"
              >
                🚀 Launch Dashboard Now <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
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
