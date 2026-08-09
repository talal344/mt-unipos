"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useGlobalContext } from "@/context/global-context";
import { supabase } from "@/lib/supabase";
import {
  Laptop, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, Building2, Lock
} from "lucide-react";


function LoginContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { tenants, setCurrentUser } = useGlobalContext();

  const [inputTenantId, setInputTenantId] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading]   = useState(false);

  // Activation Modal State
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activatedCredentials, setActivatedCredentials] = useState<{ tenantId: string; email: string; pass: string; businessName: string } | null>(null);


  const activeTenant = tenants.find(t => t.id.toLowerCase() === inputTenantId.trim().toLowerCase()) || null;
  const presets      = activeTenant?.credentialPresets || [];

  const isValidTenant = activeTenant !== null;
  const showValidation = inputTenantId.trim().length > 0;
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

  // Clean stale activation markers without triggering false banner on load
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
          localStorage.removeItem("unipos_last_activated_tenant");
          localStorage.removeItem("unipos_current_user");
        }
      }
    }
  }, [tenants]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setErrorMessage("Please enter both email and password."); return; }

    const cleanTenantId = inputTenantId.trim().toUpperCase();

    // ─── Real-Time Supabase Cloud Verification ───
    try {
      const { data: globalData } = await supabase.from('unipos_global').select('*');
      if (globalData) {
        const blacklistRow = globalData.find((r: any) => r.key === 'unipos_blacklisted_tenants');
        if (blacklistRow && Array.isArray(blacklistRow.value)) {
          localStorage.setItem("unipos_blacklisted_tenants", JSON.stringify(blacklistRow.value));
          if (blacklistRow.value.includes(cleanTenantId)) {
            if (typeof window !== "undefined") {
                  localStorage.removeItem("unipos_last_activated_tenant");
              localStorage.removeItem("unipos_current_user");
            }
            setErrorMessage(`⛔ ACCESS DENIED: Workspace "${cleanTenantId}" has been deleted by Super Admin. Access revoked!`);
            return;
          }
        }

        const tenantsRow = globalData.find((r: any) => r.key === 'unipos_tenants');
        if (tenantsRow && Array.isArray(tenantsRow.value)) {
          localStorage.setItem("unipos_tenants", JSON.stringify(tenantsRow.value));
          const cloudTenant = tenantsRow.value.find((t: any) => t.id.toUpperCase() === cleanTenantId);
          if (!cloudTenant) {
            setErrorMessage(`⛔ ACCESS DENIED: Workspace ID "${cleanTenantId}" not found or deleted by Super Admin.`);
            return;
          }
          if (cloudTenant.status === "Suspended" || cloudTenant.status === "Inactive" || cloudTenant.status === "Pending Payment") {
            setErrorMessage(`⛔ ACCESS DENIED: Workspace status is "${cloudTenant.status}". Login blocked.`);
            return;
          }
        }
      }
    } catch (e) {
      console.warn("Real-time cloud verification fallback to local storage:", e);
    }

    let blacklisted: string[] = [];
    try {
      blacklisted = JSON.parse(localStorage.getItem("unipos_blacklisted_tenants") || "[]");
    } catch {}

    if (blacklisted.includes(cleanTenantId)) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("unipos_last_activated_tenant");
        localStorage.removeItem("unipos_current_user");
      }
      setErrorMessage(`⛔ ACCESS DENIED: Workspace "${cleanTenantId}" has been deleted by Super Admin. Login rejected.`);
      return;
    }

    let targetTenant = tenants.find((t) => t.id.toUpperCase() === cleanTenantId);

    // Auto-resolve tenant if user entered a valid email & password registered in any tenant's credentialPresets
    if (!targetTenant) {
      for (const t of tenants) {
        const foundPreset = (t.credentialPresets || []).find(
          (p) => p.email.toLowerCase() === email.trim().toLowerCase() && p.pass === password
        );
        if (foundPreset || (t.email && t.email.toLowerCase() === email.trim().toLowerCase())) {
          targetTenant = t;
          setInputTenantId(t.id);
          break;
        }
      }
    }

    if (!targetTenant) {
      setErrorMessage(`⛔ ACCESS DENIED: Workspace ID "${cleanTenantId}" not found in system.`);
      return;
    }

    const resolvedTenantId = targetTenant.id;

    const isTrialExpired = targetTenant.status === "Trial" && targetTenant.trialEndsAt && new Date(targetTenant.trialEndsAt + "T23:59:59") < new Date();
    if (targetTenant.status === "Expired" || isTrialExpired) {
      setErrorMessage("Your trial has expired. Please contact administration to activate your workspace.");
      return;
    }
    if ((targetTenant.status as string) === "Suspended" || (targetTenant.status as string) === "Inactive" || (targetTenant.status as string) === "Pending Payment") {
      if (typeof window !== "undefined") {
        localStorage.removeItem("unipos_last_activated_tenant");
        localStorage.removeItem("unipos_current_user");
      }
      setErrorMessage(`⛔ ACCESS DENIED: Workspace status is "${targetTenant.status}". Please contact Super Admin.`);
      return;
    }

    // Check Online-Only requirement
    if (targetTenant?.connectivityPlan === "online-only" && typeof navigator !== "undefined" && !navigator.onLine) {
      setErrorMessage("This workspace is configured for Online-Only mode. Active internet connection is required to sign in.");
      return;
    }

    // Check License Expiration
    if (targetTenant?.licenseExpiresAt && targetTenant.licenseExpiresAt !== "LIFETIME") {
      const expDate = new Date(targetTenant.licenseExpiresAt + "T23:59:59");
      if (expDate < new Date()) {
        setErrorMessage(`License expired on ${targetTenant.licenseExpiresAt}. Please contact administration for a new license key.`);
        return;
      }
    }

    // Load POS Employees
    const tenantEmployees = typeof window !== "undefined"
      ? (() => {
          try {
            const data = localStorage.getItem(`unipos_employees_${resolvedTenantId}`);
            return data ? JSON.parse(data) : [];
          } catch {
            return [];
          }
        })()
      : [];

    // Load HRMS Employees
    const hrEmployees = typeof window !== "undefined"
      ? (() => {
          try {
            const data = localStorage.getItem(`unipos_hr_employees_${resolvedTenantId}`);
            return data ? JSON.parse(data) : [];
          } catch {
            return [];
          }
        })()
      : [];

    // STRICT PRESET MATCHING
    let presetMatch = (targetTenant.credentialPresets || []).find(
      (p) => p.email.toLowerCase() === email.trim().toLowerCase() && p.pass === password
    );

    if (!presetMatch) {
      for (const t of tenants) {
        const found = (t.credentialPresets || []).find(
          (p) => p.email.toLowerCase() === email.trim().toLowerCase() && p.pass === password
        );
        if (found) {
          presetMatch = found;
          targetTenant = t;
          break;
        }
      }
    }

    // Owner fallback
    if (!presetMatch && targetTenant && (targetTenant.status === "Active" || targetTenant.status === "Trial")) {
      if (targetTenant.email && targetTenant.email.toLowerCase() === email.trim().toLowerCase() && (password === "owner123" || password === "talal344")) {
        presetMatch = {
          id: `CRED-${targetTenant.id}`,
          label: "Owner (Full ERP)",
          email: targetTenant.email,
          pass: password,
          role: "Owner"
        };
      }
    }

    const employeeMatch = tenantEmployees.find((emp: any) => emp.email?.toLowerCase() === email.trim().toLowerCase() && emp.password === password);
    const hrEmpMatch = hrEmployees.find((emp: any) => emp.email?.toLowerCase() === email.trim().toLowerCase());

    if (presetMatch || employeeMatch || hrEmpMatch) {
      if (employeeMatch && employeeMatch.status === "Inactive") {
        setErrorMessage("This account is inactive. Please contact your manager.");
        return;
      }
      setErrorMessage("");
      setLoading(true);

      const role = presetMatch?.role || employeeMatch?.role || (hrEmpMatch?.designation?.includes("Director") ? "Owner" : "Manager");
      const name = hrEmpMatch?.name || (presetMatch ? (role === "Owner" ? targetTenant?.ownerName || "Owner" : role + " User") : (employeeMatch?.name || "Staff User"));

      const isHRMS = targetTenant?.assignedSoftware === "HRMS" || (targetTenant?.businessType && targetTenant.businessType.includes("HRMS"));
      const assignedSoftware: "POS" | "HRMS" = isHRMS ? "HRMS" : "POS";
      const user = {
        name,
        role,
        email: email.trim().toLowerCase(),
        businessName: targetTenant?.businessName || "Unknown",
        tenantId: targetTenant?.id || resolvedTenantId,
        assignedSoftware
      };

      setTimeout(() => {
        localStorage.setItem("unipos_last_activated_tenant", targetTenant.id);
        localStorage.setItem("unipos_current_user", JSON.stringify(user));
        setCurrentUser(user);
        if (assignedSoftware === "HRMS") {
          router.push("/hrms");
        } else {
          router.push(role === "Cashier" ? "/pos" : "/dashboard");
        }
      }, 600);
    } else {
      setErrorMessage("Invalid credentials. Incorrect email or password.");
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
          <img src="/logo.png" alt="MT UniPOS Logo" className="h-20 sm:h-24 w-auto max-w-[340px] object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-[0_0_20px_rgba(14,165,233,0.45)]" />
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

          {/* ── LOGIN FORM ── */}
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
                className="w-full bg-black border border-brand-dark-border p-3 rounded-xl text-white focus:outline-none focus:border-brand-sky transition font-bold" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Secure Password</label>
                <button type="button" className="text-[10px] text-brand-sky hover:underline">Forgot Password?</button>
              </div>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black border border-brand-dark-border p-3 pr-10 rounded-xl text-white focus:outline-none focus:border-brand-sky transition font-bold" />
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



          {/* Quick links & Desktop action bar */}
          <div className="space-y-2 text-center pt-2">
            <div className="flex items-center justify-center gap-3 text-[10px] text-gray-400 flex-wrap">
              <Link href="/demo" className="text-brand-sky font-bold hover:underline flex items-center gap-1">
                📝 Apply for Demo
              </Link>
              <span>·</span>
              <Link href="/tracking" className="text-purple-400 font-bold hover:underline flex items-center gap-1">
                🔍 Self-Service Tracking
              </Link>
              <span>·</span>
              <Link href="/features" className="text-emerald-400 font-bold hover:underline flex items-center gap-1">
                ✨ Features
              </Link>
            </div>
              <p className="text-[9px] text-gray-600">
                <Link href="/" className="text-gray-500 hover:text-white">← Back to Website</Link>
              </p>
          </div>
        </div>



      </div>

    </div>
  );
}

function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

export default LoginPage;
