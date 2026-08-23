"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useGlobalContext } from "@/context/global-context";
import { 
  Laptop, 
  ShieldAlert, 
  BarChart3, 
  Users, 
  DollarSign, 
  MessageSquare, 
  LogOut, 
  ArrowLeft, 
  PieChart, 
  Settings, 
  Bell, 
  X, 
  Mail, 
  UserPlus,
  Sun,
  Moon
} from "lucide-react";
import MTCoreLogo from "@/components/mt-logo";

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, currentUser, demoRequests, supportTickets, theme, toggleTheme } = useGlobalContext();
  const isLight = theme === "light";

  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotifications]);

  // Notifications calculation
  // 1. Pending demo requests
  const pendingDemos = demoRequests.filter(d => d.status === "Pending");
  
  // 2. Demo client messages (new chat replies)
  const demoMessages = demoRequests.filter(d => 
    d.messages.length > 0 && d.messages[d.messages.length - 1].sender === "Client"
  );

  // 3. Open support tickets or tickets with last reply by Client
  const openTickets = supportTickets.filter(t => 
    t.status === "Open" || (t.replies.length > 0 && t.replies[t.replies.length - 1].sender === "Client")
  );

  const totalNotifications = pendingDemos.length + demoMessages.length + openTickets.length;

  const links = [
    { name: "Statistics", href: "/admin/dashboard", icon: BarChart3 },
    { name: "Tenants Directory", href: "/admin/clients", icon: Users },
    { name: "SaaS Reports", href: "/admin/reports", icon: PieChart },
    { name: "SaaS Invoices", href: "/admin/invoices", icon: DollarSign },
    { name: "Email Logs", href: "/admin/emails", icon: Mail },
    { name: "Support Tickets", href: "/admin/support", icon: MessageSquare },
    { name: "Platform Settings", href: "/admin/settings", icon: Settings }
  ];

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
  return (
    <aside className={`relative w-64 h-screen border-r flex flex-col shrink-0 font-sans print:hidden transition-colors duration-200 ${
      isLight ? "bg-white border-slate-200 text-slate-900 shadow-xs" : "bg-brand-dark-surface border-purple-500/10 text-gray-100"
    }`}>
      
      {/* ═══════════════════════════════════════════════════════════════
          NOTIFICATION PANEL — anchored to sidebar full-width below header
      ═══════════════════════════════════════════════════════════════ */}
      {showNotifications && (
        <div
          ref={notifRef}
          className={`absolute left-0 top-16 w-full border-x border-b shadow-2xl z-[999] ${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#111111] border-purple-500/20 text-gray-100"
          }`}
          style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}
        >
          {/* Panel Header */}
          <div className={`flex items-center justify-between px-4 py-2.5 border-b ${
            isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-purple-500/15"
          }`}>
            <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
              isLight ? "text-slate-800" : "text-white"
            }`}>
              <Bell size={11} className="text-purple-500" />
              SaaS Admin Center
              {totalNotifications > 0 && (
                <span className="ml-1 bg-purple-600 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black">
                  {totalNotifications}
                </span>
              )}
            </span>
            <button
              onClick={() => setShowNotifications(false)}
              className={`transition p-1 rounded ${isLight ? "text-slate-400 hover:text-slate-900 hover:bg-slate-100" : "text-gray-500 hover:text-white hover:bg-brand-dark-border"}`}
            >
              <X size={12} />
            </button>
          </div>

          <div className={`max-h-80 overflow-y-auto divide-y ${isLight ? "divide-slate-100" : "divide-purple-500/5"}`}>
            {/* Pending Demo Requests */}
            {pendingDemos.length > 0 && (
              <div>
                <div className={`px-4 py-1.5 border-b ${isLight ? "bg-purple-50/80 border-purple-100" : "bg-purple-950/20 border-purple-500/10"}`}>
                  <span className="text-[8px] font-black text-purple-600 uppercase tracking-widest flex items-center gap-1">
                    <UserPlus size={9} /> Demo Requests ({pendingDemos.length})
                  </span>
                </div>
                {pendingDemos.map(d => (
                  <Link
                    key={d.id}
                    href="/admin/clients"
                    onClick={() => setShowNotifications(false)}
                    className={`flex items-center justify-between px-4 py-2 transition group ${
                      isLight ? "hover:bg-slate-50" : "hover:bg-purple-950/10"
                    }`}
                  >
                    <div className="min-w-0 flex-grow py-1">
                      <div className={`text-[10px] font-bold truncate transition ${isLight ? "text-slate-900 group-hover:text-purple-600" : "text-white group-hover:text-purple-400"}`}>{d.businessName}</div>
                      <div className={`text-[8px] font-mono ${isLight ? "text-slate-400" : "text-gray-500"}`}>By {d.name}</div>
                    </div>
                    <span className="text-[8px] bg-amber-500/10 text-amber-500 font-black px-1.5 py-0.2 rounded border border-amber-500/20 shrink-0 ml-2">PENDING</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Demo Chat Messages */}
            {demoMessages.length > 0 && (
              <div>
                <div className={`px-4 py-1.5 border-b ${isLight ? "bg-purple-50/80 border-purple-100" : "bg-purple-950/20 border-purple-500/10"}`}>
                  <span className="text-[8px] font-black text-purple-600 uppercase tracking-widest flex items-center gap-1">
                    <Mail size={9} /> Demo Chats ({demoMessages.length})
                  </span>
                </div>
                {demoMessages.map(d => {
                  const lastMsg = d.messages[d.messages.length - 1];
                  return (
                    <Link
                      key={d.id}
                      href="/admin/clients"
                      onClick={() => setShowNotifications(false)}
                      className={`flex flex-col px-4 py-2 transition group ${
                        isLight ? "hover:bg-slate-50" : "hover:bg-purple-950/10"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-bold truncate transition ${isLight ? "text-slate-900 group-hover:text-purple-600" : "text-white group-hover:text-purple-400"}`}>{d.businessName}</span>
                        <span className={`text-[7px] font-mono font-bold shrink-0 ${isLight ? "text-slate-400" : "text-gray-500"}`}>{d.ticketNumber}</span>
                      </div>
                      <p className={`text-[8px] truncate mt-0.5 ${isLight ? "text-slate-500" : "text-gray-400"}`}>"{lastMsg?.message}"</p>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Support Tickets */}
            {openTickets.length > 0 && (
              <div>
                <div className={`px-4 py-1.5 border-b ${isLight ? "bg-purple-50/80 border-purple-100" : "bg-purple-950/20 border-purple-500/10"}`}>
                  <span className="text-[8px] font-black text-purple-600 uppercase tracking-widest flex items-center gap-1">
                    <MessageSquare size={9} /> Active Tickets ({openTickets.length})
                  </span>
                </div>
                {openTickets.map(t => {
                  const isReplied = t.replies.length > 0 && t.replies[t.replies.length - 1].sender === "Client";
                  return (
                    <Link
                      key={t.id}
                      href="/admin/support"
                      onClick={() => setShowNotifications(false)}
                      className={`flex items-center justify-between px-4 py-2 transition group ${
                        isLight ? "hover:bg-slate-50" : "hover:bg-purple-950/10"
                      }`}
                    >
                      <div className="min-w-0 flex-grow py-1">
                        <div className={`text-[10px] font-bold truncate transition ${isLight ? "text-slate-900 group-hover:text-purple-600" : "text-white group-hover:text-purple-400"}`}>{t.subject}</div>
                        <div className={`text-[8px] truncate ${isLight ? "text-slate-400" : "text-gray-500"}`}>{t.businessName}</div>
                      </div>
                      <span className={`text-[8px] font-black px-1.5 py-0.2 rounded border shrink-0 ml-2 ${
                        isReplied 
                          ? "bg-purple-500/15 border-purple-500/30 text-purple-500 animate-pulse" 
                          : "bg-red-500/10 border-red-500/20 text-red-500"
                      }`}>
                        {isReplied ? "REPLY" : "OPEN"}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* All Clear View */}
            {totalNotifications === 0 && (
              <div className={`px-4 py-8 text-center ${isLight ? "bg-slate-50/50" : "bg-black/20"}`}>
                <div className="text-xl mb-1.5">⚡</div>
                <div className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-gray-400"}`}>All Systems Operational</div>
                <div className={`text-[8px] mt-0.5 ${isLight ? "text-slate-400" : "text-gray-600"}`}>No pending demo requests or client messages.</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className={`py-3 px-4 border-b shrink-0 flex items-center justify-center relative ${
          isLight ? "bg-purple-50/60 border-slate-200" : "bg-black/60 border-brand-dark-border"
        }`}>
          <Link href="/admin/dashboard" className="flex items-center justify-center gap-2">
            <MTCoreLogo variant="purple" size="sm" showText={true} />
            <span className="bg-purple-500/20 text-purple-600 text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase shrink-0">
              Admin
            </span>
          </Link>
          
          {/* Bell Icon Notification Button */}
          <button
            onClick={() => setShowNotifications(v => !v)}
            className={`absolute right-3 w-8 h-8 flex items-center justify-center rounded-lg transition shrink-0 ${
              showNotifications
                ? "bg-purple-500/20 border border-purple-500/40"
                : isLight
                ? "hover:bg-slate-100 text-slate-600"
                : "hover:bg-brand-dark-border text-gray-500"
            }`}
            title="Notifications"
          >
            <Bell size={14} className={totalNotifications > 0 ? "text-purple-600" : isLight ? "text-slate-400" : "text-gray-500"} />
            {totalNotifications > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center leading-none px-0.5">
                {totalNotifications}
              </span>
            )}
          </button>
        </div>

        {/* User Card */}
        <div className={`p-4 border-b shrink-0 ${isLight ? "border-slate-200" : "border-brand-dark-border/40"}`}>
          <div className={`flex items-center gap-3 p-3 rounded-lg border ${
            isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-black/40 border-brand-dark-border/80 text-white"
          }`}>
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
              MT
            </div>
            <div className="min-w-0">
              <h4 className={`font-bold text-xs truncate ${isLight ? "text-slate-900" : "text-white"}`}>Mian Talal</h4>
              <p className={`text-[9px] truncate ${isLight ? "text-slate-500" : "text-gray-500"}`}>Super SaaS Admin</p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-grow p-4 space-y-1 overflow-y-auto no-scrollbar">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                  active
                    ? isLight
                      ? "bg-purple-100/90 border border-purple-300 text-purple-900 font-bold shadow-xs"
                      : "bg-purple-600/10 border border-purple-500/30 text-purple-400 font-bold"
                    : isLight
                    ? "text-slate-600 hover:text-purple-900 hover:bg-purple-50/70"
                    : "text-gray-400 hover:text-white hover:bg-brand-dark-border"
                }`}
              >
                <Icon size={14} className={active ? (isLight ? "text-purple-700" : "text-purple-400") : ""} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className={`p-4 border-t space-y-2 shrink-0 ${isLight ? "border-slate-200" : "border-brand-dark-border"}`}>
        <button
          type="button"
          onClick={toggleTheme}
          className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg transition text-xs font-bold cursor-pointer ${
            isLight
              ? "bg-purple-50 border-purple-200 text-purple-900 hover:bg-purple-100 shadow-xs"
              : "bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
          }`}
          title={isLight ? "Switch to Dark/Black Mode" : "Switch to Light Mode"}
        >
          <div className="flex items-center gap-2">
            {isLight ? <Moon size={14} className="text-indigo-600" /> : <Sun size={14} className="text-amber-400" />}
            <span>{isLight ? "Light Mode" : "Dark Mode"}</span>
          </div>
          <span className={`text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded border ${
            isLight ? "bg-purple-100 border-purple-300 text-purple-800" : "bg-purple-500/20 border-purple-500/30 text-purple-300"
          }`}>
            {isLight ? "LIGHT" : "DARK"}
          </span>
        </button>

        <Link
          href="/"
          className={`flex items-center gap-2 px-3 py-2 transition text-xs font-semibold ${
            isLight ? "text-slate-500 hover:text-slate-900" : "text-gray-500 hover:text-white"
          }`}
        >
          <ArrowLeft size={14} />
          <span>Exit to Website</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 font-bold text-xs rounded transition"
        >
          <LogOut size={14} />
          <span>Logout Session</span>
        </button>
      </div>
    </aside>
  );
}
