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
    <aside className="relative w-64 h-screen bg-brand-dark-surface border-r border-purple-500/10 flex flex-col shrink-0 font-sans print:hidden">
      
      {/* ═══════════════════════════════════════════════════════════════
          NOTIFICATION PANEL — anchored to sidebar full-width below header
      ═══════════════════════════════════════════════════════════════ */}
      {showNotifications && (
        <div
          ref={notifRef}
          className="absolute left-0 top-16 w-full bg-[#111111] border-x border-b border-purple-500/20 shadow-2xl z-[999]"
          style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-black/40 border-b border-purple-500/15">
            <span className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Bell size={11} className="text-purple-400" />
              SaaS Admin Center
              {totalNotifications > 0 && (
                <span className="ml-1 bg-purple-600 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black">
                  {totalNotifications}
                </span>
              )}
            </span>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-gray-500 hover:text-white transition p-1 rounded hover:bg-brand-dark-border"
            >
              <X size={12} />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-purple-500/5">
            {/* Pending Demo Requests */}
            {pendingDemos.length > 0 && (
              <div>
                <div className="px-4 py-1.5 bg-purple-950/20 border-b border-purple-500/10">
                  <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1">
                    <UserPlus size={9} /> Demo Requests ({pendingDemos.length})
                  </span>
                </div>
                {pendingDemos.map(d => (
                  <Link
                    key={d.id}
                    href="/admin/clients"
                    onClick={() => setShowNotifications(false)}
                    className="flex items-center justify-between px-4 py-2 hover:bg-purple-950/10 transition group"
                  >
                    <div className="min-w-0 flex-grow py-1">
                      <div className="text-[10px] font-bold text-white truncate group-hover:text-purple-400 transition">{d.businessName}</div>
                      <div className="text-[8px] text-gray-500 font-mono">By {d.name}</div>
                    </div>
                    <span className="text-[8px] bg-amber-500/10 text-amber-400 font-black px-1.5 py-0.2 rounded border border-amber-500/20 shrink-0 ml-2">PENDING</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Demo Chat Messages */}
            {demoMessages.length > 0 && (
              <div>
                <div className="px-4 py-1.5 bg-purple-950/20 border-b border-purple-500/10">
                  <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1">
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
                      className="flex flex-col px-4 py-2 hover:bg-purple-950/10 transition group"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-white truncate group-hover:text-purple-400 transition">{d.businessName}</span>
                        <span className="text-[7px] text-gray-500 font-mono font-bold shrink-0">{d.ticketNumber}</span>
                      </div>
                      <p className="text-[8px] text-gray-400 truncate mt-0.5">"{lastMsg?.message}"</p>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Support Tickets */}
            {openTickets.length > 0 && (
              <div>
                <div className="px-4 py-1.5 bg-purple-950/20 border-b border-purple-500/10">
                  <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1">
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
                      className="flex items-center justify-between px-4 py-2 hover:bg-purple-950/10 transition group"
                    >
                      <div className="min-w-0 flex-grow py-1">
                        <div className="text-[10px] font-bold text-white truncate group-hover:text-purple-400 transition">{t.subject}</div>
                        <div className="text-[8px] text-gray-500 truncate">{t.businessName}</div>
                      </div>
                      <span className={`text-[8px] font-black px-1.5 py-0.2 rounded border shrink-0 ml-2 ${
                        isReplied 
                          ? "bg-purple-500/15 border-purple-500/30 text-purple-400 animate-pulse" 
                          : "bg-red-500/10 border-red-500/20 text-red-400"
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
              <div className="px-4 py-8 text-center bg-black/20">
                <div className="text-xl mb-1.5">⚡</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">All Systems Operational</div>
                <div className="text-[8px] text-gray-600 mt-0.5">No pending demo requests or client messages.</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className="py-3 px-4 border-b border-brand-dark-border shrink-0 bg-black/60 flex items-center justify-center relative">
          <Link href="/admin/dashboard" className="flex items-center justify-center gap-2">
            <MTCoreLogo variant="purple" size="sm" showText={true} />
            <span className="bg-purple-500/20 text-purple-400 text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase shrink-0">
              Admin
            </span>
          </Link>
          
          {/* Bell Icon Notification Button */}
          <button
            onClick={() => setShowNotifications(v => !v)}
            className={`absolute right-3 w-8 h-8 flex items-center justify-center rounded-lg transition shrink-0 ${
              showNotifications ? "bg-purple-500/20 border border-purple-500/40" : "hover:bg-brand-dark-border"
            }`}
            title="Notifications"
          >
            <Bell size={14} className={totalNotifications > 0 ? "text-purple-400" : "text-gray-500"} />
            {totalNotifications > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center leading-none px-0.5">
                {totalNotifications}
              </span>
            )}
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-brand-dark-border/40 shrink-0">
          <div className="flex items-center gap-3 bg-black/40 border border-brand-dark-border/80 p-3 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
              MT
            </div>
            <div className="min-w-0">
              <h4 className="text-white font-bold text-xs truncate">Mian Talal</h4>
              <p className="text-[9px] text-gray-500 truncate">Super SaaS Admin</p>
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
                    ? "bg-purple-600/10 border border-purple-500/30 text-purple-400 font-bold"
                    : "text-gray-400 hover:text-white hover:bg-brand-dark-border"
                }`}
              >
                <Icon size={14} className={active ? "text-purple-400" : ""} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-brand-dark-border space-y-2 shrink-0">
        <button
          type="button"
          onClick={toggleTheme}
          className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg transition text-xs font-bold cursor-pointer ${
            isLight
              ? "bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100"
              : "bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
          }`}
          title={isLight ? "Switch to Dark/Black Mode" : "Switch to Light Mode"}
        >
          <div className="flex items-center gap-2">
            {isLight ? <Moon size={14} className="text-indigo-600" /> : <Sun size={14} className="text-amber-400" />}
            <span>{isLight ? "Light Mode" : "Dark Mode"}</span>
          </div>
          <span className="text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-purple-300">
            {isLight ? "LIGHT" : "DARK"}
          </span>
        </button>

        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-white transition text-xs font-semibold"
        >
          <ArrowLeft size={14} />
          <span>Exit to Website</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-400 font-bold text-xs rounded transition"
        >
          <LogOut size={14} />
          <span>Logout Session</span>
        </button>
      </div>
    </aside>
  );
}
