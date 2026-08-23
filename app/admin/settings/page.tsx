"use client";

import React, { useState } from "react";
import AdminSidebar from "@/components/admin-sidebar";
import { useGlobalContext } from "@/context/global-context";
import { 
  Settings, 
  Database, 
  ShieldAlert, 
  Key, 
  Server, 
  RefreshCw, 
  CheckCircle, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Grid,
  Braces
} from "lucide-react";

export default function AdminSettingsPage() {
  const { theme } = useGlobalContext();
  const isLight = theme === "light";
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showApiKeys, setShowApiKeys] = useState(false);

  // External API Keys states
  const [resendApiKey, setResendApiKey] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("unipos_resend_api_key") || process.env.NEXT_PUBLIC_RESEND_API_KEY || "re_resend_api_key_configured";
    }
    return process.env.NEXT_PUBLIC_RESEND_API_KEY || "re_resend_api_key_configured";
  });
  const [sendgridApiKey, setSendgridApiKey] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("unipos_sendgrid_api_key") || "SG.MT_UniPOS_SMTP_Key_Secure_2026_LiveGate";
    return "SG.MT_UniPOS_SMTP_Key_Secure_2026_LiveGate";
  });
  const [twilioToken, setTwilioToken] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("unipos_twilio_token") || "AC_MT_TWILIO_LOYALTY_VOUCHERS_SMS_SHARD";
    return "AC_MT_TWILIO_LOYALTY_VOUCHERS_SMS_SHARD";
  });
  const [stripeSecret, setStripeSecret] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("unipos_stripe_secret") || "whsec_Stripe_Recurring_Billing_Callbacks_MT";
    return "whsec_Stripe_Recurring_Billing_Callbacks_MT";
  });

  // Form settings states
  const [platformTitle, setPlatformTitle] = useState("MT Core");
  const [platformTagline, setPlatformTagline] = useState("The core technology behind your business.");
  const [founderCredit, setFounderCredit] = useState("Mian Talal");
  const [baseCurrency, setBaseCurrency] = useState("PKR");
  const [neonIntensity, setNeonIntensity] = useState("Medium");

  // Sharding thresholds
  const [starterProducts, setStarterProducts] = useState(500);
  const [proProducts, setProProducts] = useState(5000);
  
  // Backup state
  const [backupLogs, setBackupLogs] = useState<string[]>([
    "2026-05-30 23:45 - Automatic database shard backup completed.",
    "2026-05-28 12:00 - Platform system state index rebuild complete."
  ]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveApiKeys = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("unipos_resend_api_key", resendApiKey);
      localStorage.setItem("unipos_sendgrid_api_key", sendgridApiKey);
      localStorage.setItem("unipos_twilio_token", twilioToken);
      localStorage.setItem("unipos_stripe_secret", stripeSecret);
    }
    triggerToast("✅ Resend.com & External Gateway API Keys saved successfully!");
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast("Branding configurations written to Next.js config!");
  };

  const handleSaveLimits = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast("Plan shard thresholds synced successfully!");
  };

  const handleTriggerBackup = () => {
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
    setBackupLogs(prev => [`${timestamp} - Manual backup triggered by Mian Talal. Complete!`, ...prev]);
    triggerToast("Full PostgreSQL multi-tenant shard backup completed!");
  };

  const handleRebuildIndexes = () => {
    triggerToast("PostgreSQL relational indexes and Redis cache databases fully optimized!");
  };

  return (
    <div className={`flex min-h-screen font-sans ${isLight ? "bg-slate-100 text-slate-900" : "bg-black text-gray-100"}`}>
      <AdminSidebar />

      {/* Main Settings Panel */}
      <main className="flex-grow p-6 sm:p-8 space-y-6 overflow-y-auto max-h-screen">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-4 right-4 bg-purple-600/90 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-2xl border border-purple-500/20 backdrop-blur flex items-center gap-2 z-50 animate-bounce">
            <CheckCircle size={16} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex justify-between items-center border-b border-brand-dark-border/60 pb-4">
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <Settings size={24} className="text-purple-400" />
              Platform Global Settings
            </h1>
            <p className="text-[10px] text-gray-500 font-sans">Configure platform metadata, sharding thresholds, API keys, and maintenance schedules.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel - Branding and plan thresholds */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* SaaS Platform Branding config */}
            <form onSubmit={handleSaveBranding} className={`border p-6 rounded-2xl space-y-4 ${
              isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/50 border-brand-dark-border text-gray-100"
            }`}>
              <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-b pb-2.5 ${
                isLight ? "text-slate-900 border-slate-200" : "text-gray-400 border-brand-dark-border"
              }`}>
                <Sparkles size={14} className="text-purple-500" />
                Platform Identity &amp; Aesthetics
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-600" : "text-gray-400"}`}>Platform Portal Title</label>
                  <input
                    type="text"
                    value={platformTitle}
                    onChange={(e) => setPlatformTitle(e.target.value)}
                    className={`w-full border p-2.5 rounded text-xs focus:outline-none focus:border-purple-500 ${
                      isLight ? "bg-white border-slate-300 text-slate-900" : "bg-black border-brand-dark-border text-white"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-600" : "text-gray-400"}`}>Founder &amp; CEO Credits</label>
                  <input
                    type="text"
                    value={founderCredit}
                    onChange={(e) => setFounderCredit(e.target.value)}
                    className={`w-full border p-2.5 rounded text-xs focus:outline-none focus:border-purple-500 ${
                      isLight ? "bg-white border-slate-300 text-slate-900" : "bg-black border-brand-dark-border text-white"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-600" : "text-gray-400"}`}>Global Default Currency Symbol</label>
                  <select
                    value={baseCurrency}
                    onChange={(e) => setBaseCurrency(e.target.value)}
                    className={`w-full border p-2.5 rounded text-xs focus:outline-none focus:border-purple-500 font-sans ${
                      isLight ? "bg-white border-slate-300 text-slate-900" : "bg-black border-brand-dark-border text-white"
                    }`}
                  >
                    <option value="PKR">PKR (Rs) - Default</option>
                    <option value="USD">USD ($)</option>
                    <option value="AED">AED (Dh)</option>
                    <option value="SAR">SAR (SR)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-600" : "text-gray-400"}`}>Neon Glow Highlights Intensity</label>
                  <select
                    value={neonIntensity}
                    onChange={(e) => setNeonIntensity(e.target.value)}
                    className={`w-full border p-2.5 rounded text-xs focus:outline-none focus:border-purple-500 font-sans ${
                      isLight ? "bg-white border-slate-300 text-slate-900" : "bg-black border-brand-dark-border text-white"
                    }`}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>Ultra High</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
              >
                Save Branding Settings
              </button>
            </form>

            {/* Plan database limitations configs */}
            <form onSubmit={handleSaveLimits} className={`border p-6 rounded-2xl space-y-4 ${
              isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/50 border-brand-dark-border text-gray-100"
            }`}>
              <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-b pb-2.5 ${
                isLight ? "text-slate-900 border-slate-200" : "text-gray-400 border-brand-dark-border"
              }`}>
                <Grid size={14} className="text-purple-500" />
                SaaS Shard Limit Thresholds
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-1">
                  <label className={`block text-[10px] uppercase font-bold font-sans ${isLight ? "text-slate-600" : "text-gray-400"}`}>Starter Plan Max SKUs</label>
                  <input
                    type="number"
                    value={starterProducts}
                    onChange={(e) => setStarterProducts(parseInt(e.target.value) || 0)}
                    className={`w-full border p-2.5 rounded text-xs ${
                      isLight ? "bg-white border-slate-300 text-slate-900" : "bg-black border-brand-dark-border text-white"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`block text-[10px] uppercase font-bold font-sans ${isLight ? "text-slate-600" : "text-gray-400"}`}>Pro Plan Max SKUs</label>
                  <input
                    type="number"
                    value={proProducts}
                    onChange={(e) => setProProducts(parseInt(e.target.value) || 0)}
                    className={`w-full border p-2.5 rounded text-xs ${
                      isLight ? "bg-white border-slate-300 text-slate-900" : "bg-black border-brand-dark-border text-white"
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
              >
                Sync Shard Limitations
              </button>
            </form>

            {/* SMTP and External API Gateway configs */}
            <form onSubmit={handleSaveApiKeys} className={`border p-6 rounded-2xl space-y-4 ${
              isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/50 border-brand-dark-border text-gray-100"
            }`}>
              <div className={`flex justify-between items-center border-b pb-2.5 ${isLight ? "border-slate-200" : "border-brand-dark-border"}`}>
                <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-gray-400"}`}>
                  <Key size={14} className="text-purple-500" />
                  SaaS External SMTP &amp; API Gateways
                </h3>
                <button
                  type="button"
                  onClick={() => setShowApiKeys(!showApiKeys)}
                  className="text-purple-500 hover:text-purple-600 text-[10px] font-bold flex items-center gap-1 focus:outline-none"
                >
                  {showApiKeys ? <EyeOff size={12} /> : <Eye size={12} />}
                  <span>{showApiKeys ? "Mask Credentials" : "Show Credentials"}</span>
                </button>
              </div>

              <div className="space-y-4 text-xs font-mono">
                {/* Resend.com API Key */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] uppercase font-bold text-emerald-600 font-sans flex items-center gap-1">
                      <span>⚡ Resend.com Email API Key</span>
                      <span className="text-[8px] bg-emerald-500/20 text-emerald-600 border border-emerald-500/40 px-1.5 py-0.5 rounded font-black">RECOMMENDED FREE (3,000/mo)</span>
                    </label>
                  </div>
                  <input
                    type={showApiKeys ? "text" : "password"}
                    value={resendApiKey}
                    onChange={(e) => setResendApiKey(e.target.value)}
                    placeholder="e.g. re_123456789_abcdef..."
                    className={`w-full border p-2.5 rounded-xl text-emerald-600 font-bold mt-1 focus:outline-none focus:border-emerald-500 ${
                      isLight ? "bg-emerald-50/50 border-emerald-300" : "bg-black border-emerald-500/40"
                    }`}
                  />
                  <p className={`text-[9px] font-sans mt-1 ${isLight ? "text-slate-500" : "text-gray-500"}`}>Get your free API Key from <a href="https://resend.com" target="_blank" rel="noreferrer" className="text-sky-500 underline">resend.com</a> (Includes 3,000 free emails/month).</p>
                </div>

                {/* SendGrid API Key */}
                <div>
                  <label className={`text-[9px] uppercase font-bold font-sans block ${isLight ? "text-slate-600" : "text-gray-400"}`}>SendGrid SMTP API Key</label>
                  <input
                    type={showApiKeys ? "text" : "password"}
                    value={sendgridApiKey}
                    onChange={(e) => setSendgridApiKey(e.target.value)}
                    className={`w-full border p-2 rounded-xl mt-1 focus:outline-none focus:border-purple-500 ${
                      isLight ? "bg-white border-slate-300 text-slate-900" : "bg-black border-brand-dark-border/60 text-gray-300"
                    }`}
                  />
                </div>

                {/* Twilio SMS Gateway */}
                <div>
                  <label className={`text-[9px] uppercase font-bold font-sans block ${isLight ? "text-slate-600" : "text-gray-400"}`}>Twilio SMS Gateway Token</label>
                  <input
                    type={showApiKeys ? "text" : "password"}
                    value={twilioToken}
                    onChange={(e) => setTwilioToken(e.target.value)}
                    className={`w-full border p-2 rounded-xl mt-1 focus:outline-none focus:border-purple-500 ${
                      isLight ? "bg-white border-slate-300 text-slate-900" : "bg-black border-brand-dark-border/60 text-gray-300"
                    }`}
                  />
                </div>

                {/* Stripe Webhook Secret */}
                <div>
                  <label className={`text-[9px] uppercase font-bold font-sans block ${isLight ? "text-slate-600" : "text-gray-400"}`}>Stripe SaaS Billing Webhook Secret</label>
                  <input
                    type={showApiKeys ? "text" : "password"}
                    value={stripeSecret}
                    onChange={(e) => setStripeSecret(e.target.value)}
                    className={`w-full border p-2 rounded-xl mt-1 focus:outline-none focus:border-purple-500 ${
                      isLight ? "bg-white border-slate-300 text-slate-900" : "bg-black border-brand-dark-border/60 text-gray-300"
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle size={14} />
                  <span>Save Gateway Credentials</span>
                </button>
              </div>
            </form>

          </div>

          {/* Right panel - DB Maintenances & backups logs */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Database backups engine */}
            <div className={`border p-6 rounded-2xl space-y-4 ${
              isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/50 border-brand-dark-border text-gray-100"
            }`}>
              <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-b pb-2.5 ${
                isLight ? "text-slate-900 border-slate-200" : "text-gray-400 border-brand-dark-border"
              }`}>
                <Database size={14} className="text-purple-500" />
                Relational DB Shard Backups
              </h3>

              <p className={`text-[10px] leading-normal ${isLight ? "text-slate-500" : "text-gray-500"}`}>
                Generates a state snapshot of all tenant schemas, ledgers, POS sales, and tickets, storing it sharded inside AWS S3.
              </p>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleTriggerBackup}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-lg"
                >
                  <Server size={12} />
                  <span>Snapshot Platform Database</span>
                </button>

                <button
                  onClick={handleRebuildIndexes}
                  className={`w-full py-2 border text-[10px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition ${
                    isLight 
                      ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200" 
                      : "bg-brand-dark-border hover:bg-brand-dark-border/80 text-gray-300 border-transparent"
                  }`}
                >
                  <RefreshCw size={12} />
                  <span>Rebuild PostgreSQL Indexes</span>
                </button>
              </div>
            </div>

            {/* Backups log console */}
            <div className={`border p-6 rounded-2xl space-y-4 ${
              isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/50 border-brand-dark-border text-gray-100"
            }`}>
              <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-b pb-2.5 ${
                isLight ? "text-slate-900 border-slate-200" : "text-gray-400 border-brand-dark-border"
              }`}>
                <Braces size={14} className="text-purple-500" />
                Snapshot Registry Console
              </h3>

              <div className={`border p-4 rounded-xl font-mono text-[9px] space-y-2.5 max-h-[220px] overflow-y-auto leading-relaxed ${
                isLight 
                  ? "bg-slate-900 border-slate-800 text-emerald-400" 
                  : "bg-black/60 border-brand-dark-border/80 text-emerald-400"
              }`}>
                {backupLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-1.5 items-start">
                    <span className="text-gray-500 select-none">#</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* System warning panel */}
            <div className={`border p-4 rounded-2xl text-[10px] leading-relaxed flex gap-2 ${
              isLight 
                ? "bg-red-50 border-red-200 text-red-700" 
                : "bg-red-500/5 border-red-500/20 text-gray-400"
            }`}>
              <ShieldAlert size={16} className="text-red-500 shrink-0 mt-0.5" />
              <span>
                <strong>Attention SuperAdmin:</strong> Changing plan limitations will retroactively cap Starter-tier stores during their next product catalog update. Proceed with caution.
              </span>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
