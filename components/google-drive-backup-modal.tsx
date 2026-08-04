"use client";

import React, { useState, useEffect } from "react";
import {
  Cloud,
  FolderPlus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Play,
  Key,
  Shield,
  ExternalLink,
  HelpCircle,
  Clock,
  Database,
  Calendar,
} from "lucide-react";
import { useGlobalContext } from "@/context/global-context";
import {
  getGoogleDriveConfig,
  saveGoogleDriveConfig,
  getBackupLogs,
  runFullTenantsBackupToDrive,
  GoogleDriveConfig,
  BackupLogEntry,
} from "@/lib/google-drive-backup";

interface GoogleDriveBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoogleDriveBackupModal({
  isOpen,
  onClose,
}: GoogleDriveBackupModalProps) {
  const { tenants } = useGlobalContext();
  const [config, setConfig] = useState<GoogleDriveConfig>(getGoogleDriveConfig());
  const [logs, setLogs] = useState<BackupLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"settings" | "logs" | "guide">("settings");
  const [isRunning, setIsRunning] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(getGoogleDriveConfig());
      setLogs(getBackupLogs());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveGoogleDriveConfig(config);
    showToast("✅ Google Drive Backup Settings Saved Successfully!");
  };

  const handleManualBackupNow = async () => {
    setIsRunning(true);
    showToast("🚀 Starting automated backup across all active tenants...");
    const result = await runFullTenantsBackupToDrive(tenants);
    setIsRunning(false);
    setLogs(getBackupLogs());
    setConfig(getGoogleDriveConfig());

    if (result.success) {
      showToast("🎉 All Tenant Backups uploaded to Google Drive successfully!");
    } else {
      showToast(`⚠️ Backup completed: ${result.message}`);
    }
  };

  const isDriveConfigured = !!(config.clientId && config.clientSecret && config.refreshToken);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in font-sans">
      <div className="bg-[#0b0f17] border border-sky-500/40 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-400">
              <Cloud size={20} />
            </div>
            <div>
              <h3 className="font-black text-white text-base tracking-tight flex items-center gap-2">
                Automated Google Drive Backup System
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    isDriveConfigured
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {isDriveConfigured ? "Connected" : "Setup Required"}
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Automatic daily tenant data backup into separate Google Drive folders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMsg && (
          <div className="bg-sky-500/20 border-b border-sky-500/40 px-5 py-2.5 text-sky-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 size={14} className="text-sky-400" />
            {toastMsg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-800 bg-black/20 px-5">
          <button
            onClick={() => setActiveTab("settings")}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === "settings"
                ? "border-sky-500 text-sky-400"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Shield size={14} /> Drive Credentials &amp; Schedule
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === "logs"
                ? "border-sky-500 text-sky-400"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Clock size={14} /> Backup Activity Logs ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === "guide"
                ? "border-sky-500 text-sky-400"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <HelpCircle size={14} /> Easy Connect Guide (Urdu)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-5">
              {/* Quick Status Box */}
              <div className="bg-black/40 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase text-gray-400 block">
                    Last Backup Status
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar size={14} className="text-sky-400" />
                    <span className="text-xs font-mono text-white font-bold">
                      {config.lastBackupDate || "Never Executed"}
                    </span>
                    {config.lastBackupStatus && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          config.lastBackupStatus === "SUCCESS"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {config.lastBackupStatus}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleManualBackupNow}
                  disabled={isRunning}
                  className="py-2.5 px-5 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs uppercase rounded-xl flex items-center gap-2 transition shadow-lg shadow-sky-600/30 disabled:opacity-50"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Running Backup...
                    </>
                  ) : (
                    <>
                      <Play size={14} /> Run Instant Backup Now
                    </>
                  )}
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[11px] uppercase font-bold text-gray-400 mb-1">
                      Root Google Drive Folder Name / ID
                    </label>
                    <input
                      type="text"
                      value={config.rootFolderId || "MT_UniPOS_Master_Backups"}
                      onChange={(e) => setConfig({ ...config, rootFolderId: e.target.value })}
                      placeholder="e.g. MT_UniPOS_Master_Backups or Folder ID"
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                      Is folder ke andar har Tenant ka alag folder auto-create hoga (e.g. MT-344_Talal_Super_Mart)
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-bold text-gray-400 mb-1">
                      Google OAuth Client ID
                    </label>
                    <input
                      type="text"
                      value={config.clientId}
                      onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                      placeholder="xxxx.apps.googleusercontent.com"
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-bold text-gray-400 mb-1">
                      Google OAuth Client Secret
                    </label>
                    <input
                      type="password"
                      value={config.clientSecret}
                      onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
                      placeholder="GOCSPX-xxxxxxxxxxxxxxxx"
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] uppercase font-bold text-gray-400 mb-1">
                      Google Refresh Token (Permanent Access Token)
                    </label>
                    <input
                      type="password"
                      value={config.refreshToken}
                      onChange={(e) => setConfig({ ...config, refreshToken: e.target.value })}
                      placeholder="1//04xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Schedule Options */}
                <div className="bg-black/40 border border-gray-800 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="autoEnable"
                      checked={config.autoBackupEnabled}
                      onChange={(e) => setConfig({ ...config, autoBackupEnabled: e.target.checked })}
                      className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                    />
                    <label htmlFor="autoEnable" className="text-xs font-bold text-gray-200 cursor-pointer">
                      Enable Daily Automatic Background Backup (Roz Raat 12:00 AM)
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase rounded-xl transition shadow-lg shadow-emerald-600/20"
                  >
                    Save Drive Configuration
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: LOGS */}
          {activeTab === "logs" && (
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
                Recent Automated Backup Execution History
              </h4>
              {logs.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-xs font-mono bg-black/30 rounded-xl border border-gray-800">
                  Abhi tak koi automated backup run nahi hua. Settings tab par &quot;Run Instant Backup Now&quot; par click karein.
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-black/40 border border-gray-800 rounded-xl p-3.5 space-y-2"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2 font-mono">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              log.status === "SUCCESS" ? "bg-emerald-400" : "bg-red-400"
                            }`}
                          />
                          <span className="text-gray-300 font-bold">{log.timestamp}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            log.status === "SUCCESS"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {log.status} ({log.tenantCount} Tenants)
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 font-mono">{log.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EASY GUIDE */}
          {activeTab === "guide" && (
            <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
              <div className="bg-sky-500/10 border border-sky-500/30 p-4 rounded-xl text-sky-300 font-medium">
                <span className="font-black block mb-1">📖 Apni Google Drive Connect Karne Ka Tarika:</span>
                Google Drive ko MT UniPOS ke sath 3 aasan steps mein connect karein taakay roz raat aap ke tamaam stores ka backup automatically aap ki Google Drive par save ho sakay:
              </div>

              <div className="space-y-3">
                <div className="bg-black/40 border border-gray-800 p-3.5 rounded-xl space-y-1">
                  <span className="font-bold text-sky-400 block">Step 1: Google Cloud Console Kholein</span>
                  <p className="text-gray-400">
                    1. Google par <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-sky-400 underline">Google Cloud Console</a> khol kar apni Gmail ID se login karein.
                    <br />
                    2. Naya Project banayein (e.g. <b>MT-UniPOS-Backup</b>).
                  </p>
                </div>

                <div className="bg-black/40 border border-gray-800 p-3.5 rounded-xl space-y-1">
                  <span className="font-bold text-sky-400 block">Step 2: Google Drive API Enable Karein</span>
                  <p className="text-gray-400">
                    1. Cloud Console mein <b>APIs &amp; Services &gt; Library</b> par jayein.
                    <br />
                    2. Search bar mein <b>Google Drive API</b> type karein aur <b>ENABLE</b> par click karein.
                  </p>
                </div>

                <div className="bg-black/40 border border-gray-800 p-3.5 rounded-xl space-y-1">
                  <span className="font-bold text-sky-400 block">Step 3: OAuth Credentials Haasil Karein</span>
                  <p className="text-gray-400">
                    1. <b>APIs &amp; Services &gt; Credentials</b> mein jayein aur <b>Create Credentials &gt; OAuth client ID</b> select karein.
                    <br />
                    2. Application Type mein <b>Web Application</b> select karein.
                    <br />
                    3. Aap ko <b>Client ID</b> aur <b>Client Secret</b> mil jaye ga.
                    <br />
                    4. In keys ko yahan Settings tab mein paste karke <b>Save Drive Configuration</b> par click kar dein!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
