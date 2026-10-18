"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
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

  // Notifications calculation memoized
  const pendingDemos = useMemo(() => demoRequests.filter(d => d.status === "Pending"), [demoRequests]);
  
  const demoMessages = useMemo(() => demoRequests.filter(d => 
    d.messages.length > 0 && d.messages[d.messages.length - 1].sender === "Client"
  ), [demoRequests]);

  const openTickets = useMemo(() => supportTickets.filter(t => 
    t.status === "Open" || (t.replies.length > 0 && t.replies[t.replies.length - 1].sender === "Client")
  ), [supportTickets]);

  const totalNotifications = pendingDemos.length + demoMessages.length + openTickets.length;

  const links = useMemo(() => [
    { name: "Statistics", href: "/admin/dashboard", icon: BarChart3 },
    { name: "Tenants Directory", href: "/admin/clients", icon: Users },
    { name: "SaaS Reports", href: "/admin/reports", icon: PieChart },
    { name: "SaaS Invoices", href: "/admin/invoices", icon: DollarSign },
    { name: "Email Logs", href: "/admin/emails", icon: Mail },
    { name: "Support Tickets", href: "/admin/support", icon: MessageSquare },
    { name: "Platform Settings", href: "/admin/settings", icon: Settings }
  ], []);

  // Eagerly prefetch all admin routes into Next.js router cache
  useEffect(() => {
    links.forEach((l) => {
      try {
        router.prefetch(l.href);
      } catch (e) {}
    });
  }, [router, links]);

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors duration-200 font-sans print:hidden ${
      isLight
        ? "bg-white/95 border-slate-200 text-slate-900 shadow-xs"
        : "bg-black/95 border-purple-500/20 text-gray-100 shadow-lg shadow-purple-950/20"
    }`}>
      <div className="w-full px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* ── Left: Brand Logo & Navigation Links ── */}
        <div className="flex items-center gap-2 sm:gap-5 min-w-0 flex-1">
          {/* Brand Logo & Admin Badge */}
          <Link href="/admin/dashboard" prefetch={true} className="flex items-center gap-2 shrink-0">
            <MTCoreLogo variant="purple" size="sm" showText={true} theme={isLight ? "light" : "dark"} />
            <span className={`text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase shrink-0 ${
              isLight ? "bg-purple-100 text-purple-800 border border-purple-200" : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
            }`}>
              Admin
            </span>
          </Link>

          <div className={`h-6 w-px ${isLight ? "bg-slate-200" : "bg-purple-500/20"} hidden md:block shrink-0`} />

          {/* Navigation Links (horizontal scrollable on smaller screens) */}
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            {links.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  prefetch={true}
                  onMouseEnter={() => router.prefetch(link.href)}
                  onMouseDown={() => router.prefetch(link.href)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    active
                      ? isLight
                        ? "bg-purple-100 text-purple-900 font-bold border border-purple-300 shadow-xs"
                        : "bg-purple-600/20 text-purple-400 font-bold border border-purple-500/40 shadow-xs"
                      : isLight
                      ? "text-slate-600 hover:text-purple-900 hover:bg-slate-100"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={14} className={active ? (isLight ? "text-purple-700" : "text-purple-400") : "opacity-75"} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ── Right Controls: Notifications, Theme Switch, Exit, Profile, Logout ── */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Notifications Bell Button & Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(v => !v)}
              className={`relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl transition ${
                showNotifications
                  ? isLight ? "bg-purple-100 border border-purple-300 text-purple-900" : "bg-purple-500/20 border border-purple-500/40 text-purple-300"
                  : isLight
                  ? "hover:bg-slate-100 text-slate-600 border border-transparent"
                  : "hover:bg-white/5 text-gray-400 hover:text-white border border-transparent"
              }`}
              title="Notifications"
            >
              <Bell size={15} className={totalNotifications > 0 ? "text-purple-500" : ""} />
              {totalNotifications > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center leading-none px-0.5 shadow-sm">
                  {totalNotifications}
                </span>
              )}
            </button>

            {/* Notification Dropdown (hanging below top bar) */}
            {showNotifications && (
              <div
                className={`absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl z-[999] overflow-hidden ${
                  isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#111111] border-purple-500/20 text-gray-100"
                }`}
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
                    className={`transition p-1 rounded ${isLight ? "text-slate-400 hover:text-slate-900 hover:bg-slate-100" : "text-gray-500 hover:text-white hover:bg-white/10"}`}
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
                          prefetch={true}
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
                            prefetch={true}
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
                            prefetch={true}
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
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 border rounded-xl transition text-xs font-bold cursor-pointer flex items-center gap-1.5 ${
              isLight
                ? "bg-purple-50 border-purple-200 text-purple-900 hover:bg-purple-100 shadow-xs"
                : "bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
            }`}
            title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {isLight ? <Moon size={14} className="text-indigo-600" /> : <Sun size={14} className="text-amber-400" />}
            <span className="hidden xl:inline text-[9px] uppercase font-mono tracking-wider">{isLight ? "LIGHT" : "DARK"}</span>
          </button>

          {/* Exit to Website Link */}
          <Link
            href="/"
            prefetch={true}
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition text-xs font-semibold border ${
              isLight
                ? "border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-xs"
                : "border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
            }`}
            title="Exit to Website"
          >
            <ArrowLeft size={13} />
            <span className="hidden lg:inline text-[11px]">Website</span>
          </Link>

          {/* User Badge */}
          <div className={`hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl border ${
            isLight ? "bg-slate-50 border-slate-200 text-slate-900 shadow-xs" : "bg-white/5 border-white/10 text-white"
          }`}>
            <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 shadow-xs">
              MT
            </div>
            <div className="leading-tight text-left">
              <div className="font-bold text-[11px] truncate max-w-[85px]">Mian Talal</div>
              <div className={`text-[8px] font-mono ${isLight ? "text-purple-700" : "text-purple-400"}`}>SuperAdmin</div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 font-bold text-xs rounded-xl transition cursor-pointer"
            title="Logout Session"
          >
            <LogOut size={13} />
            <span className="text-[11px] font-bold">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

// Aliases for clean semantic imports
export { AdminSidebar as AdminHeader, AdminSidebar as AdminNavbar };
