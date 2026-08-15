"use client";

import React from "react";
import { SMSProvider, useSMS } from "@/context/sms-context";
import SMSSidebar from "@/components/sms-sidebar";
import SMSHeader from "@/components/sms-header";

function SMSLayoutInner({ children }: { children: React.ReactNode }) {
  const { theme } = useSMS();
  const isLight = theme === "light";

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${
      isLight ? "bg-[#f8fafc] text-slate-900" : "bg-[#05080e] text-gray-100"
    } antialiased font-sans`}>
      <SMSSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <SMSHeader />
        <main className={`flex-1 p-6 sm:p-8 overflow-y-auto max-h-[calc(100vh-64px)] ${
          isLight ? "bg-[#f8fafc]" : "bg-[#05080e]"
        }`}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function SMSLayout({ children }: { children: React.ReactNode }) {
  return (
    <SMSProvider>
      <SMSLayoutInner>{children}</SMSLayoutInner>
    </SMSProvider>
  );
}
