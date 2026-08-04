"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function MacTitlebar() {
  const [isDesktopApp, setIsDesktopApp] = useState(false);

  useEffect(() => {
    // Detect if running inside Electron Desktop App or Web App
    if (typeof window !== "undefined" && ((window as any).electronAPI || navigator.userAgent.includes("Electron"))) {
      setIsDesktopApp(true);
    }
  }, []);

  const handleMinimize = () => {
    if (typeof window !== "undefined" && (window as any).electronAPI?.minimizeWindow) {
      (window as any).electronAPI.minimizeWindow();
    }
  };

  const handleMaximize = () => {
    if (typeof window !== "undefined" && (window as any).electronAPI?.maximizeWindow) {
      (window as any).electronAPI.maximizeWindow();
    }
  };

  const handleClose = () => {
    if (typeof window !== "undefined" && (window as any).electronAPI?.closeWindow) {
      (window as any).electronAPI.closeWindow();
    }
  };

  // Render mac-style custom titlebar for desktop app (and fallback top bar)
  return (
    <div
      className="w-full bg-[#0A0A0B] border-b border-[#1F2937]/80 h-9 px-3 flex items-center justify-between select-none z-[999999] shrink-0 font-sans print:hidden"
      style={{ WebkitAppRegion: "drag" } as any}
    >
      {/* Left: macOS Traffic-Light Round Control Buttons */}
      <div
        className="flex items-center gap-2"
        style={{ WebkitAppRegion: "no-drag" } as any}
      >
        <button
          type="button"
          onClick={handleClose}
          title="Close Window"
          className="w-3 h-3 rounded-full bg-[#ff5f56] hover:bg-[#e0443e] active:scale-95 transition flex items-center justify-center group shadow-inner"
        >
          <span className="opacity-0 group-hover:opacity-100 text-[8px] text-[#4d0000] font-black leading-none">✕</span>
        </button>

        <button
          type="button"
          onClick={handleMinimize}
          title="Minimize Window"
          className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:bg-[#dea123] active:scale-95 transition flex items-center justify-center group shadow-inner"
        >
          <span className="opacity-0 group-hover:opacity-100 text-[8px] text-[#5e4000] font-black leading-none">−</span>
        </button>

        <button
          type="button"
          onClick={handleMaximize}
          title="Zoom / Maximize Window"
          className="w-3 h-3 rounded-full bg-[#27c93f] hover:bg-[#1aab29] active:scale-95 transition flex items-center justify-center group shadow-inner"
        >
          <span className="opacity-0 group-hover:opacity-100 text-[8px] text-[#004d0d] font-black leading-none">⤢</span>
        </button>
      </div>

      {/* Center: Branding & Title */}
      <div className="flex items-center gap-2 pointer-events-none">
        <div className="w-4 h-4 relative rounded-full overflow-hidden shrink-0">
          <Image src="/logo.png" alt="MT UniPOS" fill className="object-contain" />
        </div>
        <span className="text-[11px] font-extrabold text-gray-300 tracking-tight font-sans">
          MT UniPOS <span className="text-gray-500 font-normal">| Enterprise SaaS POS ERP</span>
        </span>
      </div>

      {/* Right: Badge / Status Indicator */}
      <div className="flex items-center gap-2 pointer-events-none">
        <span className="bg-brand-sky/10 border border-brand-sky/20 text-brand-sky text-[8px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          {isDesktopApp ? "Desktop Native" : "Web Workstation"}
        </span>
      </div>
    </div>
  );
}
