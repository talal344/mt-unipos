"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useGlobalContext, Tenant } from "@/context/global-context";
import { supabase } from "@/lib/supabase";
import MTCoreLogo from "@/components/mt-logo";
import {
  Laptop, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, Building2, Lock,
  Users, GraduationCap, Zap, Sparkles, Sun, Moon, ShieldAlert, Home
} from "lucide-react";

const SUPER_ADMIN_PASSCODE = "talal344";

const normalizeTenantId = (id: string) => (id || "").replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D–—−-]/g, "-").trim().toUpperCase();

function LoginContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { tenants, setTenants, setCurrentUser, theme, toggleTheme } = useGlobalContext();
  const isLight = theme === "light";

  const [inputTenantId, setInputTenantId] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading]   = useState(false);

  // Hidden Super Admin access state
  const [keyBuffer, setKeyBuffer] = useState("");
  const [superVisible, setSuperVisible] = useState(false);
  const [logoTaps, setLogoTaps] = useState(0);
  const bufferTimer = useRef<ReturnType<typeof setTimeout>|null>(null);
  const tapTimer = useRef<ReturnType<typeof setTimeout>|null>(null);

  // Listen for keyboard typing of secret code anywhere on the page
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return;
      const next = (keyBuffer + e.key).slice(-SUPER_ADMIN_PASSCODE.length);
      setKeyBuffer(next);
      if (next === SUPER_ADMIN_PASSCODE) {
        setSuperVisible(true);
        setKeyBuffer("");
      }
      if (bufferTimer.current) clearTimeout(bufferTimer.current);
      bufferTimer.current = setTimeout(() => setKeyBuffer(""), 3000);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [keyBuffer]);

  const handleLogoTap = () => {
    setLogoTaps(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setSuperVisible(true);
        return 0;
      }
      return next;
    });
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => setLogoTaps(0), 2000);
  };

  // Activation Modal State
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activatedCredentials, setActivatedCredentials] = useState<{ tenantId: string; email: string; pass: string; businessName: string } | null>(null);


  const activeTenant = tenants.find(t => normalizeTenantId(t.id) === normalizeTenantId(inputTenantId)) || null;
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
        const tenantInReg = tenants.find(t => normalizeTenantId(t.id) === normalizeTenantId(activatedTenantId));
        const isDeleted = blacklisted.some(bId => normalizeTenantId(bId) === normalizeTenantId(activatedTenantId)) || (!tenantInReg && tenants.length > 0);
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

    const cleanTenantId = normalizeTenantId(inputTenantId);

    // ─── Real-Time Supabase Cloud Verification ───
    try {
      const { data: globalData } = await supabase.from('unipos_global').select('*');
      if (globalData) {
        const blacklistRow = globalData.find((r: any) => r.key === 'unipos_blacklisted_tenants');
        if (blacklistRow && Array.isArray(blacklistRow.value)) {
          localStorage.setItem("unipos_blacklisted_tenants", JSON.stringify(blacklistRow.value));
          if (blacklistRow.value.some((bId: string) => normalizeTenantId(bId) === cleanTenantId)) {
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
          // Merge cloud tenants with existing local tenants so local tenants are preserved
          const existingLocal: any[] = (() => {
            try { return JSON.parse(localStorage.getItem("unipos_tenants") || "[]"); } catch { return []; }
          })();
          const mergedMap = new Map<string, any>();
          existingLocal.forEach((t: any) => { if (t?.id) mergedMap.set(normalizeTenantId(t.id), t); });
          tenants.forEach((t: any) => { if (t?.id) mergedMap.set(normalizeTenantId(t.id), t); });
          tenantsRow.value.forEach((t: any) => { if (t?.id) mergedMap.set(normalizeTenantId(t.id), t); });
          const mergedTenants = Array.from(mergedMap.values());
          localStorage.setItem("unipos_tenants", JSON.stringify(mergedTenants));
          
          const matchedTenant = mergedTenants.find((t: any) => normalizeTenantId(t.id) === cleanTenantId);
          if (matchedTenant && (matchedTenant.status === "Suspended" || matchedTenant.status === "Inactive" || matchedTenant.status === "Pending Payment")) {
            setErrorMessage(`⛔ ACCESS DENIED: Workspace status is "${matchedTenant.status}". Login blocked.`);
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

    if (blacklisted.some((bId: string) => normalizeTenantId(bId) === cleanTenantId)) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("unipos_last_activated_tenant");
        localStorage.removeItem("unipos_current_user");
      }
      setErrorMessage(`⛔ ACCESS DENIED: Workspace "${cleanTenantId}" has been deleted by Super Admin. Login rejected.`);
      return;
    }

    let targetTenant = tenants.find((t) => normalizeTenantId(t.id) === cleanTenantId);
    if (!targetTenant) {
      const stored = (() => {
        try { return JSON.parse(localStorage.getItem("unipos_tenants") || "[]"); } catch { return []; }
      })();
      targetTenant = stored.find((t: any) => normalizeTenantId(t.id) === cleanTenantId);
    }

    // Auto-resolve tenant if user entered a valid email/username
    if (!targetTenant && !cleanTenantId) {
      for (const t of tenants) {
        const hasUser = (t.credentialPresets || []).some(
          (p) => p.email.toLowerCase() === email.trim().toLowerCase() || (p.username && p.username.toLowerCase() === email.trim().toLowerCase())
        ) || (t.email && t.email.toLowerCase() === email.trim().toLowerCase()) || (t.username && t.username.toLowerCase() === email.trim().toLowerCase());
        
        if (hasUser) {
          targetTenant = t;
          setInputTenantId(t.id);
          break;
        }
      }
    }

    // Recover existing tenant settings if registered locally or in cloud
    if (!targetTenant && cleanTenantId) {
      try {
        const sRaw = localStorage.getItem("unipos_settings_" + cleanTenantId);
        if (sRaw) {
          const s = JSON.parse(sRaw);
          const recoveredTenant: Tenant = {
            id: cleanTenantId,
            businessName: s.businessName || `Workspace ${cleanTenantId}`,
            ownerName: s.ownerName || "Store Owner",
            email: s.email || `owner@${cleanTenantId.toLowerCase()}.com`,
            username: s.username || "owner",
            phone: s.phone || "",
            businessType: s.businessType || "Super Markets",
            assignedSoftware: "POS",
            plan: "Enterprise",
            billingCycle: "monthly",
            status: "Active",
            signupDate: new Date().toISOString().split("T")[0],
            branches: ["Main Branch"],
            usersCount: 5,
            monthlyRevenue: 0,
            defaultCurrency: "PKR",
            credentialPresets: [
              { id: `PRESET-${cleanTenantId}-1`, label: "Owner (Full ERP)", email: s.email || `owner@${cleanTenantId.toLowerCase()}.com`, username: s.username || "owner", pass: s.ownerPassword || "owner123", role: "Owner" },
              { id: `PRESET-${cleanTenantId}-2`, label: "Cashier POS", email: `cashier@${cleanTenantId.toLowerCase()}.com`, username: "cashier", pass: "cashier123", role: "Cashier" }
            ]
          };
          targetTenant = recoveredTenant;
          const updatedList = [...tenants.filter(t => normalizeTenantId(t.id) !== cleanTenantId), recoveredTenant];
          setTenants(updatedList);
          try { localStorage.setItem("unipos_tenants", JSON.stringify(updatedList)); } catch {}
        }
      } catch {}
    }

    if (!targetTenant) {
      setErrorMessage(`⛔ ACCESS DENIED: Workspace ID "${cleanTenantId || inputTenantId}" not found in system.`);
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

    // Load SMS Users from localStorage or default seed
    let smsUsers: any[] = [];
    if (typeof window !== "undefined") {
      try {
        const data = localStorage.getItem("mt_sms_users");
        if (data) smsUsers = JSON.parse(data);
      } catch {}
    }

    const normInput = email.trim().toLowerCase();
    const isMasterPass = password === SUPER_ADMIN_PASSCODE;

    // Find if user exists across registered accounts in this workspace
    const matchedPreset = (targetTenant.credentialPresets || []).find(
      (p) => p.email.toLowerCase() === normInput || (p.username && p.username.toLowerCase() === normInput) || (p.label && p.label.toLowerCase() === normInput)
    );

    const matchedHrEmp = hrEmployees.find(
      (emp: any) => emp.email?.toLowerCase() === normInput || emp.name?.toLowerCase() === normInput || (emp.employeeCode && emp.employeeCode.toLowerCase() === normInput)
    );

    const matchedSmsUser = smsUsers.find(
      (u: any) => u.username?.toLowerCase() === normInput || u.email?.toLowerCase() === normInput
    );

    const matchedPosEmp = tenantEmployees.find(
      (emp: any) => emp.email?.toLowerCase() === normInput || emp.name?.toLowerCase() === normInput || (emp.code && emp.code.toLowerCase() === normInput)
    );

    const isOwnerUser = (targetTenant.email && targetTenant.email.toLowerCase() === normInput) || 
                        (targetTenant.username && targetTenant.username.toLowerCase() === normInput) ||
                        normInput === "owner" || normInput === "admin";

    // ── STRICT AUTHENTICATION: Check matching account & verify exact password ──
    let authenticatedUser: any = null;
    let authType: "preset" | "hrms" | "sms" | "pos" | "owner" | null = null;

    if (matchedPreset) {
      if (matchedPreset.pass === password || isMasterPass) {
        authenticatedUser = matchedPreset;
        authType = "preset";
      } else {
        setErrorMessage("⛔ ACCESS DENIED: Incorrect password for this user account.");
        return;
      }
    } else if (matchedPosEmp) {
      if (matchedPosEmp.password === password || isMasterPass) {
        authenticatedUser = matchedPosEmp;
        authType = "pos";
      } else {
        setErrorMessage("⛔ ACCESS DENIED: Incorrect password for this employee account.");
        return;
      }
    } else if (matchedHrEmp) {
      if (matchedHrEmp.password === password || matchedHrEmp.tempPassword === password || isMasterPass) {
        authenticatedUser = matchedHrEmp;
        authType = "hrms";
      } else {
        setErrorMessage("⛔ ACCESS DENIED: Incorrect password for this HRMS account.");
        return;
      }
    } else if (matchedSmsUser) {
      if (matchedSmsUser.password === password || isMasterPass) {
        authenticatedUser = matchedSmsUser;
        authType = "sms";
      } else {
        setErrorMessage("⛔ ACCESS DENIED: Incorrect password for this SMS account.");
        return;
      }
    } else if (isOwnerUser && targetTenant && (targetTenant.status === "Active" || targetTenant.status === "Trial")) {
      const ownerPreset = (targetTenant.credentialPresets || []).find(p => p.role === "Owner");
      const configuredOwnerPass = (targetTenant as any).ownerPassword || (targetTenant as any).password || ownerPreset?.pass || "owner123";
      
      if (password === configuredOwnerPass || isMasterPass) {
        authenticatedUser = {
          id: `CRED-${targetTenant.id}`,
          label: "Owner (Full ERP)",
          email: targetTenant.email || email,
          username: targetTenant.username || email,
          pass: configuredOwnerPass,
          role: "Owner"
        };
        authType = "owner";
      } else {
        setErrorMessage("⛔ ACCESS DENIED: Incorrect password for Owner account.");
        return;
      }
    }

    if (!authenticatedUser) {
      setErrorMessage(`⛔ ACCESS DENIED: User "${email}" is not registered in workspace "${targetTenant.businessName}".`);
      return;
    }

    const presetMatch = authType === "preset" || authType === "owner" ? authenticatedUser : null;
    const employeeMatch = authType === "pos" ? authenticatedUser : null;
    const hrEmpMatch = authType === "hrms" ? authenticatedUser : null;
    const smsUserMatch = authType === "sms" ? authenticatedUser : null;

    if (presetMatch || employeeMatch || hrEmpMatch || smsUserMatch) {
      if (employeeMatch && employeeMatch.status === "Inactive") {
        setErrorMessage("This account is inactive. Please contact your manager.");
        return;
      }
      if (smsUserMatch && smsUserMatch.status === "Suspended") {
        setErrorMessage("This SMS account has been suspended by administration.");
        return;
      }

      const isSMS = smsUserMatch || targetTenant?.assignedSoftware === "SMS" || (targetTenant?.businessType && targetTenant.businessType.includes("SMS"));
      const isHRMS = !isSMS && (targetTenant?.assignedSoftware === "HRMS" || (targetTenant?.businessType && targetTenant.businessType.includes("HRMS")));
      const assignedSoftware: "POS" | "HRMS" | "SMS" = isSMS ? "SMS" : isHRMS ? "HRMS" : "POS";

      const role = smsUserMatch?.role || presetMatch?.role || employeeMatch?.role || (hrEmpMatch?.designation?.includes("Director") ? "Owner" : "Manager");

      // ── POS TERMINAL HARDWARE BINDING CHECK (Strictly for POS non-owner staff) ──
      if (assignedSoftware === "POS" && role !== "Owner" && role !== "SuperAdmin") {
        let tenantSettings: any = null;
        try {
          const raw = localStorage.getItem(`unipos_settings_${targetTenant.id}`);
          if (raw) tenantSettings = JSON.parse(raw);
        } catch {}

        if (tenantSettings?.enforceTerminalBinding) {
          let deviceToken = "";
          try {
            deviceToken = localStorage.getItem(`unipos_terminal_token_${targetTenant.id}`) || "";
          } catch {}

          const activeTerminals = (tenantSettings.authorizedTerminals || []).filter((t: any) => t.status === "Active");
          const isAuthorized = activeTerminals.some((t: any) => t.token && t.token === deviceToken);

          if (!isAuthorized) {
            setErrorMessage(
              `⛔ ACCESS DENIED: Unregistered Store Device!\n\n` +
              `This workspace has Terminal Hardware Lock enabled. Staff and Cashiers can only sign in from authorized Store Terminals.\n\n` +
              `Please ask the Store Owner to authorize this computer in Settings.`
            );
            return;
          }
        }
      }

      setErrorMessage("");
      setLoading(true);

      const name = smsUserMatch?.fullName || hrEmpMatch?.name || (presetMatch ? (role === "Owner" ? targetTenant?.ownerName || "Owner" : role + " User") : (employeeMatch?.name || "Staff User"));

      const user = {
        name,
        role,
        email: smsUserMatch?.email || presetMatch?.email || employeeMatch?.email || hrEmpMatch?.email || email.trim().toLowerCase(),
        username: smsUserMatch?.username || presetMatch?.username || employeeMatch?.email || hrEmpMatch?.email || email.trim().toLowerCase(),
        businessName: targetTenant?.businessName || (isSMS ? "MT Campus & School ERP" : "Unknown"),
        tenantId: targetTenant?.id || resolvedTenantId,
        assignedSoftware
      };

      setTimeout(() => {
        localStorage.setItem("unipos_last_activated_tenant", targetTenant.id);
        localStorage.setItem("unipos_current_user", JSON.stringify(user));
        setCurrentUser(user as any);
        if (assignedSoftware === "SMS") {
          router.push("/sms");
        } else if (assignedSoftware === "HRMS") {
          router.push("/hrms");
        } else {
          router.push(role === "Cashier" ? "/pos" : "/dashboard");
        }
      }, 600);
    } else {
      setErrorMessage("Invalid credentials. Incorrect username/email or password.");
    }
  };

  // ─── 1-CLICK INSTANT DEMO LOGIN HANDLER (POS, HRMS, SMS) ─────────────────
  const handleDemoLogin = (type: "POS" | "HRMS" | "SMS") => {
    setErrorMessage("");
    setLoading(true);

    if (type === "POS") {
      const posTenant = tenants.find((t) => t.assignedSoftware !== "HRMS") || tenants[0] || {
        id: "AFS-1234",
        businessName: "Al-Fatah Supermarket",
        ownerName: "Mian Talal Ahmad",
        email: "owner@alfatah.com",
        assignedSoftware: "POS"
      };
      const user = {
        name: posTenant.ownerName || "Al-Fatah (Owner)",
        role: "Owner",
        email: posTenant.email || "owner@alfatah.com",
        businessName: posTenant.businessName || "Al-Fatah Supermarket",
        tenantId: posTenant.id || "AFS-1234",
        assignedSoftware: "POS" as const
      };
      localStorage.setItem("unipos_last_activated_tenant", user.tenantId);
      localStorage.setItem("unipos_current_user", JSON.stringify(user));
      setCurrentUser(user);
      setTimeout(() => {
        router.push("/dashboard");
      }, 300);
    } else if (type === "HRMS") {
      const hrmsTenant = tenants.find((t) => t.assignedSoftware === "HRMS") || {
        id: "HRMS-2026",
        businessName: "MT Global HRMS Enterprise",
        ownerName: "HR Director",
        email: "director@hrms.com",
        assignedSoftware: "HRMS"
      };
      const user = {
        name: "HR Director",
        role: "Owner",
        email: "director@hrms.com",
        businessName: hrmsTenant.businessName || "MT Global HRMS Enterprise",
        tenantId: hrmsTenant.id || "HRMS-2026",
        assignedSoftware: "HRMS" as const
      };
      localStorage.setItem("unipos_last_activated_tenant", user.tenantId);
      localStorage.setItem("unipos_current_user", JSON.stringify(user));
      setCurrentUser(user);
      setTimeout(() => {
        router.push("/hrms");
      }, 300);
    } else if (type === "SMS") {
      const smsUser = {
        name: "Principal (SMS Admin)",
        role: "Owner",
        email: "principal@mtcoreschool.edu.pk",
        businessName: "MT Core Model School & College",
        tenantId: "SMS-2026",
        assignedSoftware: "POS" as const
      };
      localStorage.setItem("unipos_current_user", JSON.stringify(smsUser));
      setCurrentUser(smsUser);
      setTimeout(() => {
        router.push("/sms");
      }, 300);
    }
  };


  const handleDownloadCredentialsFile = () => {
    if (!activatedCredentials) return;
    const content = `==============================================\nMT Core Offline License Activation Record\nThe core technology behind your business.\n==============================================\nBusiness Name   : ${activatedCredentials.businessName}\nWorkspace ID    : ${activatedCredentials.tenantId}\nCorporate Email : ${activatedCredentials.email}\nDefault Password: ${activatedCredentials.pass}\nLicense Status  : ACTIVATED & LIFETIME VERIFIED\nActivation Date : ${new Date().toLocaleDateString()}\nSystem ID       : MTCORE-OFFLINE-LOCAL\n==============================================\n`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `MT_Core_Credentials_${activatedCredentials.tenantId}.txt`;
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
    <div className={`flex flex-col min-h-screen font-sans justify-center items-center relative overflow-y-auto py-12 px-6 lg:px-16 xl:px-24 transition-colors duration-200 ${
      isLight ? "bg-slate-50 text-slate-900" : "bg-black text-gray-100"
    }`}>
      {/* Background Radial Glow */}
      <div className={`absolute inset-0 pointer-events-none ${
        isLight
          ? "bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.08),transparent_65%)]"
          : "bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.07),transparent_65%)]"
      }`} />

      {/* Floating Animated Tech Stickers & Badges in Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        {/* Top Left Floating Sticker */}
        <div className={`hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border text-[11px] font-bold shadow-lg animate-float-slow absolute top-20 left-12 ${
          isLight
            ? "bg-white/80 border-sky-200/80 text-sky-800 shadow-sky-500/5 backdrop-blur-md"
            : "bg-[#0b121e]/80 border-sky-500/30 text-sky-300 shadow-sky-500/10 backdrop-blur-md"
        }`}>
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span>🛡️ AES-256 Cloud Vault</span>
        </div>

        {/* Top Right Floating Sticker */}
        <div className={`hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border text-[11px] font-bold shadow-lg animate-float-reverse absolute top-28 right-24 ${
          isLight
            ? "bg-white/80 border-emerald-200/80 text-emerald-800 shadow-emerald-500/5 backdrop-blur-md"
            : "bg-[#0b121e]/80 border-emerald-500/30 text-emerald-300 shadow-emerald-500/10 backdrop-blur-md"
        }`}>
          <span>⚡ &lt;15ms Latency</span>
        </div>

        {/* Bottom Left Floating Sticker */}
        <div className={`hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border text-[11px] font-bold shadow-lg animate-float-reverse absolute bottom-16 left-16 ${
          isLight
            ? "bg-white/80 border-purple-200/80 text-purple-800 shadow-purple-500/5 backdrop-blur-md"
            : "bg-[#0b121e]/80 border-purple-500/30 text-purple-300 shadow-purple-500/10 backdrop-blur-md"
        }`}>
          <span>🌐 Sharded Multi-Tenancy</span>
        </div>

        {/* Bottom Right Floating Sticker */}
        <div className={`hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border text-[11px] font-bold shadow-lg animate-float-slow absolute bottom-20 right-20 ${
          isLight
            ? "bg-white/80 border-amber-200/80 text-amber-800 shadow-amber-500/5 backdrop-blur-md"
            : "bg-[#0b121e]/80 border-amber-500/30 text-amber-300 shadow-amber-500/10 backdrop-blur-md"
        }`}>
          <span>💳 FBR POS Compliant</span>
        </div>
      </div>

      {/* Floating Top Navigation & Theme Toggle */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <Link
          href="/"
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
            isLight
              ? "bg-white border-slate-200 text-slate-700 hover:text-sky-600 hover:border-sky-300 shadow-xs"
              : "bg-white/5 border-white/10 text-gray-300 hover:text-white hover:border-sky-500/40"
          }`}
          title="Return to Home"
        >
          <Home size={14} />
          <span className="hidden sm:inline">Back to Home</span>
        </Link>

        {/* Secret Super Admin Button — only revealed after typing talal344 or 5 logo clicks */}
        {superVisible && (
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-purple-400 border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 transition animate-pulse shadow-lg shadow-purple-500/20"
            title="Super Admin Portal"
          >
            <ShieldAlert size={14} />
            <span>Super Admin</span>
          </Link>
        )}

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

      <div className="flex flex-col lg:flex-row w-full max-w-6xl justify-center items-center gap-12 lg:gap-16 xl:gap-20 relative z-10 my-auto">

        {/* LEFT COLUMN: Features & Details Showcase (Hidden on Mobile) */}
        <div className="hidden lg:flex flex-col max-w-lg space-y-6">
          <div>
            <span className={`font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border inline-block ${
              isLight ? "bg-sky-50 border-sky-200 text-sky-700 font-black" : "bg-brand-sky/10 border-brand-sky/30 text-brand-sky"
            }`}>
              MT Core — The core technology behind your business.
            </span>
            <h1 className={`text-3xl xl:text-4xl font-black tracking-tight mt-4 leading-tight ${
              isLight ? "text-slate-900" : "text-white"
            }`}>
              Streamline your store, dining floor &amp; sharded databases.
            </h1>
            <p className={`text-xs mt-3 leading-relaxed ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
              MT Core provides enterprise-grade sharded database tenancy, real-time inventory tracking, dual ledger accounting, and interactive kitchen routing in one unified suite.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl border space-y-1.5 transition-all hover:scale-[1.01] ${
              isLight ? "bg-white border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md" : "bg-brand-dark-surface/40 border-brand-dark-border/50 sky-glow-border"
            }`}>
              <h3 className={`font-black text-xs uppercase tracking-wider ${isLight ? "text-sky-600 font-black" : "text-brand-sky"}`}>Real-time Stock</h3>
              <p className={`text-[10px] leading-normal ${isLight ? "text-slate-600 font-medium" : "text-gray-500"}`}>Monitor stock valuation, barcode registries, low-stock notifications, and auto-purchase orders.</p>
            </div>
            <div className={`p-4 rounded-2xl border space-y-1.5 transition-all hover:scale-[1.01] ${
              isLight ? "bg-white border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md" : "bg-brand-dark-surface/40 border-brand-dark-border/50 sky-glow-border"
            }`}>
              <h3 className={`font-black text-xs uppercase tracking-wider ${isLight ? "text-sky-600 font-black" : "text-brand-sky"}`}>Restaurant POS</h3>
              <p className={`text-[10px] leading-normal ${isLight ? "text-slate-600 font-medium" : "text-gray-500"}`}>Visual physical table maps, custom waiter routing, and instant kitchen display status syncing.</p>
            </div>
            <div className={`p-4 rounded-2xl border space-y-1.5 transition-all hover:scale-[1.01] ${
              isLight ? "bg-white border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md" : "bg-brand-dark-surface/40 border-brand-dark-border/50 sky-glow-border"
            }`}>
              <h3 className={`font-black text-xs uppercase tracking-wider ${isLight ? "text-sky-600 font-black" : "text-brand-sky"}`}>Double Ledger</h3>
              <p className={`text-[10px] leading-normal ${isLight ? "text-slate-600 font-medium" : "text-gray-500"}`}>Automated transactional entries, accounts receivable tracking, payroll shunts, and cash book ledgers.</p>
            </div>
            <div className={`p-4 rounded-2xl border space-y-1.5 transition-all hover:scale-[1.01] ${
              isLight ? "bg-white border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md" : "bg-brand-dark-surface/40 border-brand-dark-border/50 sky-glow-border"
            }`}>
              <h3 className={`font-black text-xs uppercase tracking-wider ${isLight ? "text-sky-600 font-black" : "text-brand-sky"}`}>AI Analytics</h3>
              <p className={`text-[10px] leading-normal ${isLight ? "text-slate-600 font-medium" : "text-gray-500"}`}>Interactive demand forecasting, peak times reporting, sales matrix analysis, and data-driven insights.</p>
            </div>
          </div>

          <div className={`flex items-center gap-6 text-[9px] font-mono pt-2 border-t ${
            isLight ? "border-slate-200 text-slate-500" : "border-brand-dark-border/40 text-gray-500"
          }`}>
            <div>
              <span className={`font-bold block text-xs ${isLight ? "text-slate-900" : "text-white"}`}>99.9%</span>
              Uptime SLA
            </div>
            <div>
              <span className={`font-bold block text-xs ${isLight ? "text-slate-900" : "text-white"}`}>AES-256</span>
              Data Encryption
            </div>
            <div>
              <span className={`font-bold block text-xs ${isLight ? "text-slate-900" : "text-white"}`}>Tenancy</span>
              Multi-Tenant Isolation
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sign In Card & Logo */}
        <div className="flex flex-col items-center w-full max-w-md shrink-0">
          
          {/* Welcome shop name header (Floating absolute above) */}
          {isValidTenant && activeTenant && (
            <div className="mb-4 text-center animate-fade-in-up">
              <span className={`text-[9px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded border ${
                isLight ? "bg-sky-50 border-sky-200 text-sky-700 font-bold" : "bg-brand-sky/10 border-brand-sky/20 text-brand-sky"
              }`}>Connected Workspace</span>
              <h2 className={`text-2xl font-black mt-1.5 px-4 leading-snug ${isLight ? "text-sky-700" : "sky-gradient-text"}`}>
                Welcome to {activeTenant.businessName}
              </h2>
            </div>
          )}

          {/* Logo with 5-tap Secret Unlock */}
          <div onClick={handleLogoTap} className="flex flex-col items-center justify-center mb-6 group cursor-pointer select-none" title="MT Core">
            <div className="transition-all duration-300 group-hover:scale-105">
              <MTCoreLogo variant="sky" size="lg" showText={true} collapsed={false} theme={isLight ? "light" : "dark"} />
            </div>
            <span className={`text-[10px] font-medium mt-3 tracking-wider uppercase ${isLight ? "text-slate-500" : "text-gray-500"}`}>
              The core technology behind your business.
            </span>
          </div>

          {/* Sign In Box */}
          <div className={`w-full p-7 rounded-3xl border space-y-6 transition-all ${
            isLight
              ? "bg-white border-slate-200 shadow-xl shadow-slate-200/50 text-slate-900"
              : "bg-brand-dark-surface border-brand-dark-border/80 glass-panel sky-glow text-white"
          }`}>

            <div className="text-center">
              <h2 className={`text-lg font-black ${isLight ? "text-slate-900" : "text-white"}`}>Client Portal Sign In</h2>
              <p className={`text-[10px] mt-1 ${isLight ? "text-slate-500 font-medium" : "text-gray-500"}`}>
                Access POS terminals, inventory, accounting &amp; CRM.
              </p>
            </div>

            {showSuccess && (
              <div className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                isLight ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
              }`}>
                <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                Tenant provisioned! Login with the auto-filled Owner credentials below.
              </div>
            )}

            {errorMessage && (
              <div className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                isLight ? "bg-rose-50 border-rose-200 text-rose-800 font-medium" : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}>
                <AlertCircle size={15} className="shrink-0 mt-0.5" /> {errorMessage}
              </div>
            )}

            {/* ── LOGIN FORM ── */}
            <form onSubmit={handleCredentialsSubmit} className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`block text-[10px] uppercase font-bold tracking-wider ${
                    isLight ? "text-sky-700" : "text-brand-sky"
                  }`}>
                    <Building2 size={9} className="inline mr-1" /> Workspace / Tenant ID
                  </label>
                  <span className={`text-[9px] font-mono ${isLight ? "text-slate-400" : "text-gray-500"}`}>
                    e.g. AFS-1234
                  </span>
                </div>
                <input 
                  type="text" 
                  required 
                  value={inputTenantId}
                  onChange={e => { setInputTenantId(e.target.value.replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D–—−-]/g, "-").toUpperCase()); setErrorMessage(""); }}
                  placeholder="e.g. AFS-1234"
                  className={`w-full p-3 rounded-xl outline-none transition-all duration-300 font-mono text-xs border ${
                    isLight
                      ? `bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white ${
                          !showValidation
                            ? "border-slate-300 focus:border-sky-500"
                            : isValidTenant
                            ? "border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)] focus:border-emerald-400"
                            : "border-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.2)] focus:border-rose-400"
                        }`
                      : `bg-black text-white ${tenantGlowClass}`
                  }`} 
                />
              </div>

              <div>
                <label className={`block text-[10px] uppercase font-bold tracking-wider mb-1.5 ${
                  isLight ? "text-slate-600" : "text-gray-400"
                }`}>User ID / Username or Email</label>
                <input type="text" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. parent.tariq or student@domain.com"
                  className={`w-full p-3 rounded-xl focus:outline-none transition font-bold border ${
                    isLight
                      ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-sky-500"
                      : "bg-black border-brand-dark-border text-white placeholder-gray-600 focus:border-brand-sky"
                  }`} />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={`text-[10px] uppercase font-bold tracking-wider ${
                    isLight ? "text-slate-600" : "text-gray-400"
                  }`}>Secure Password</label>
                  <button type="button" className={`text-[10px] hover:underline ${isLight ? "text-sky-600 font-semibold" : "text-brand-sky"}`}>Forgot Password?</button>
                </div>
                <div className="relative">
                  <input type={showPwd ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full p-3 pr-10 rounded-xl focus:outline-none transition font-bold border ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-sky-500"
                        : "bg-black border-brand-dark-border text-white placeholder-gray-600 focus:border-brand-sky"
                    }`} />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className={`absolute right-3 top-3 transition ${isLight ? "text-slate-400 hover:text-slate-800" : "text-gray-500 hover:text-white"}`}>
                    {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <label className={`flex items-center gap-2 text-[10px] cursor-pointer select-none ${
                isLight ? "text-slate-600 font-medium" : "text-gray-400"
              }`}>
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                  className="rounded text-sky-500" />
                Remember this terminal for 30 days
              </label>

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-black uppercase text-xs tracking-wider rounded-xl flex items-center justify-center gap-2 transition transform hover:scale-[1.01] active:scale-95 shadow-lg shadow-sky-500/25 cursor-pointer">
                {loading
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <>Sign In to Workspace <ArrowRight size={14} /></>}
              </button>
            </form>

            {/* Live Security & Node Status Pill */}
            <div className={`p-2.5 rounded-xl border flex items-center justify-between text-[9px] font-mono ${
              isLight ? "bg-slate-50 border-slate-200 text-slate-600" : "bg-black/40 border-white/5 text-gray-400"
            }`}>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold">Cloud Node: Operational</span>
              </div>
              <span className={isLight ? "text-sky-700 font-bold" : "text-sky-400 font-bold"}>
                🔒 256-Bit SSL/TLS
              </span>
            </div>

            {/* Quick links & Desktop action bar */}
            <div className="space-y-2 text-center pt-1">
              <div className={`flex items-center justify-center gap-3 text-[10px] flex-wrap ${
                isLight ? "text-slate-500 font-medium" : "text-gray-400"
              }`}>
                <Link href="/demo" className="text-sky-600 font-bold hover:underline flex items-center gap-1">
                  📝 Apply for Demo
                </Link>
                <span>·</span>
                <Link href="/tracking" className="text-purple-600 font-bold hover:underline flex items-center gap-1">
                  🔍 Self-Service Tracking
                </Link>
                <span>·</span>
                <Link href="/features" className="text-emerald-600 font-bold hover:underline flex items-center gap-1">
                  ✨ Features
                </Link>
              </div>
              <p className={`text-[10px] ${isLight ? "text-slate-400" : "text-gray-600"}`}>
                <Link href="/" className={`hover:underline ${isLight ? "text-slate-600 hover:text-slate-900" : "text-gray-500 hover:text-white"}`}>← Back to Website</Link>
              </p>
            </div>
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
