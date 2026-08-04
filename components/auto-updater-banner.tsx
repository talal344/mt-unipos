"use client";

import React, { useState, useEffect } from "react";
import { Zap, RefreshCw, X, Sparkles } from "lucide-react";

export default function AutoUpdaterBanner() {
  const [updateReady, setUpdateReady] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Check for Service Worker updates
    navigator.serviceWorker.ready.then((reg) => {
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setUpdateReady(true);
            }
          });
        }
      });
    });

    // Listen for custom update messages
    const updateHandler = () => setUpdateReady(true);
    window.addEventListener("app_update_available", updateHandler);

    return () => {
      window.removeEventListener("app_update_available", updateHandler);
    };
  }, []);

  const handleApplyUpdate = async () => {
    setUpdating(true);
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.update();
        }
      }
    } catch (e) {
      console.warn("Cache purge error:", e);
    }
    // Instant reload to apply update
    window.location.reload();
  };

  if (!updateReady) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[99999] max-w-lg w-[92%] bg-[#0d1117] border border-brand-sky/40 shadow-[0_0_30px_rgba(14,165,233,0.3)] rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs font-sans animate-fade-in-up">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-brand-sky/20 border border-brand-sky/40 flex items-center justify-center text-brand-sky shrink-0 animate-pulse">
          <Sparkles size={16} />
        </div>
        <div className="min-w-0">
          <div className="text-white font-black flex items-center gap-1.5 text-xs truncate">
            <span>New Feature Update Ready</span>
            <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">Auto-Detect</span>
          </div>
          <p className="text-[10px] text-gray-400 truncate">Click below to load the latest features instantly.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleApplyUpdate}
          disabled={updating}
          className="px-3 py-1.5 bg-brand-sky hover:bg-brand-sky-light text-black font-black uppercase text-[10px] tracking-wider rounded-xl transition flex items-center gap-1.5 shadow-md shadow-brand-sky/20"
        >
          {updating ? (
            <>
              <RefreshCw size={12} className="animate-spin" /> Updating...
            </>
          ) : (
            <>
              <Zap size={12} /> Update Now
            </>
          )}
        </button>

        <button
          onClick={() => setUpdateReady(false)}
          className="text-gray-500 hover:text-white p-1 transition rounded hover:bg-brand-dark-border"
          title="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
