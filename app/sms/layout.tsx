"use client";

import React from "react";
import { SMSProvider } from "@/context/sms-context";
import SMSSidebar from "@/components/sms-sidebar";
import SMSHeader from "@/components/sms-header";

export default function SMSLayout({ children }: { children: React.ReactNode }) {
  return (
    <SMSProvider>
      <div className="flex min-h-screen bg-[#05080e] text-gray-100 antialiased font-sans">
        <SMSSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <SMSHeader />
          <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-h-[calc(100vh-64px)]">
            {children}
          </main>
        </div>
      </div>
    </SMSProvider>
  );
}
