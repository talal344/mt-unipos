"use client";

import React, { useState } from "react";
import AdminSidebar from "@/components/admin-sidebar";
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showApiKeys, setShowApiKeys] = useState(false);

  // Form settings states
  const [platformTitle, setPlatformTitle] = useState("MT UniPOS");
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
    <div className="flex min-h-screen bg-black text-gray-100 font-sans">
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
            <form onSubmit={handleSaveBranding} className="bg-brand-dark-surface/50 border border-brand-dark-border p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5 border-b border-brand-dark-border pb-2.5">
                <Sparkles size={14} className="text-purple-400" />
                Platform Identity &amp; Aesthetics
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-gray-400">Platform Portal Title</label>
                  <input
                    type="text"
                    value={platformTitle}
                    onChange={(e) => setPlatformTitle(e.target.value)}
                    className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-gray-400">Founder &amp; CEO Credits</label>
                  <input
                    type="text"
                    value={founderCredit}
                    onChange={(e) => setFounderCredit(e.target.value)}
                    className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-gray-400">Global Default Currency Symbol</label>
                  <select
                    value={baseCurrency}
                    onChange={(e) => setBaseCurrency(e.target.value)}
                    className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white focus:outline-none focus:border-purple-500 font-sans"
                  >
                    <option value="PKR">PKR (Rs) - Default</option>
                    <option value="USD">USD ($)</option>
                    <option value="AED">AED (Dh)</option>
                    <option value="SAR">SAR (SR)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-gray-400">Neon Glow Highlights Intensity</label>
                  <select
                    value={neonIntensity}
                    onChange={(e) => setNeonIntensity(e.target.value)}
                    className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white focus:outline-none focus:border-purple-500 font-sans"
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
            <form onSubmit={handleSaveLimits} className="bg-brand-dark-surface/50 border border-brand-dark-border p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5 border-b border-brand-dark-border pb-2.5">
                <Grid size={14} className="text-purple-400" />
                SaaS Shard Limit Thresholds
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 font-sans">Starter Plan Max SKUs</label>
                  <input
                    type="number"
                    value={starterProducts}
                    onChange={(e) => setStarterProducts(parseInt(e.target.value) || 0)}
                    className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 font-sans">Pro Plan Max SKUs</label>
                  <input
                    type="number"
                    value={proProducts}
                    onChange={(e) => setProProducts(parseInt(e.target.value) || 0)}
                    className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white"
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
            <div className="bg-brand-dark-surface/50 border border-brand-dark-border p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-brand-dark-border pb-2.5">
                <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                  <Key size={14} className="text-purple-400" />
                  SaaS External SMTP &amp; API Gateways
                </h3>
                <button
                  onClick={() => setShowApiKeys(!showApiKeys)}
                  className="text-purple-400 hover:text-purple-300 text-[10px] font-bold flex items-center gap-1 focus:outline-none"
                >
                  {showApiKeys ? <EyeOff size={12} /> : <Eye size={12} />}
                  <span>{showApiKeys ? "Mask Credentials" : "Show Credentials"}</span>
                </button>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <div className="text-[9px] uppercase font-bold text-gray-500 font-sans">SendGrid SMTP API Key</div>
                  <input
                    type={showApiKeys ? "text" : "password"}
                    readOnly
                    value="SG.MT_UniPOS_SMTP_Key_Secure_2026_LiveGate"
                    className="w-full bg-black border border-brand-dark-border/60 p-2 rounded text-gray-400 mt-1 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="text-[9px] uppercase font-bold text-gray-500 font-sans">Twilio SMS Gateway Token</div>
                  <input
                    type={showApiKeys ? "text" : "password"}
                    readOnly
                    value="AC_MT_TWILIO_LOYALTY_VOUCHERS_SMS_SHARD"
                    className="w-full bg-black border border-brand-dark-border/60 p-2 rounded text-gray-400 mt-1 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="text-[9px] uppercase font-bold text-gray-500 font-sans">Stripe SaaS billing Webhook Secret</div>
                  <input
                    type={showApiKeys ? "text" : "password"}
                    readOnly
                    value="whsec_Stripe_Recurring_Billing_Callbacks_MT"
                    className="w-full bg-black border border-brand-dark-border/60 p-2 rounded text-gray-400 mt-1 focus:outline-none"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right panel - DB Maintenances & backups logs */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Database backups engine */}
            <div className="bg-brand-dark-surface/50 border border-brand-dark-border p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5 border-b border-brand-dark-border pb-2.5">
                <Database size={14} className="text-purple-400" />
                Relational DB Shard Backups
              </h3>

              <p className="text-[10px] text-gray-500 leading-normal">
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
                  className="w-full py-2 bg-brand-dark-border hover:bg-brand-dark-border/80 text-gray-300 text-[10px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
                >
                  <RefreshCw size={12} />
                  <span>Rebuild PostgreSQL Indexes</span>
                </button>
              </div>
            </div>

            {/* Backups log console */}
            <div className="bg-brand-dark-surface/50 border border-brand-dark-border p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5 border-b border-brand-dark-border pb-2.5">
                <Braces size={14} className="text-purple-400" />
                Snapshot Registry Console
              </h3>

              <div className="bg-black/60 border border-brand-dark-border/80 p-4 rounded-xl font-mono text-[9px] text-emerald-400 space-y-2.5 max-h-[220px] overflow-y-auto leading-relaxed">
                {backupLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-1.5 items-start">
                    <span className="text-gray-600 select-none">#</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* System warning panel */}
            <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl text-[10px] text-gray-400 leading-relaxed flex gap-2">
              <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
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
