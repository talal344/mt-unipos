"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useGlobalContext } from "@/context/global-context";
import {
  Laptop, LayoutDashboard, ShoppingCart, Database, DollarSign, Utensils,
  Heart, Users, Users2, MessageCircle, FileDown, Brain, ExternalLink, Menu,
  LogOut, ShieldAlert, ShoppingBag, Receipt, Sliders, Bell, X, Package, CreditCard, Monitor, Settings, Landmark, Sun, Moon, Clock, WifiOff
} from "lucide-react";
import MTCoreLogo from "@/components/mt-logo";

export default function ClientSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, currentUser, tenants, currentBranch, setCurrentBranch, products, customers, theme, toggleTheme, isOffline } = useGlobalContext();
  const isLight = theme === "light";

  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotifications]);

  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const root = document.querySelector('.flex.h-screen, .flex.min-h-screen');
    if (root) {
      root.classList.add('layout-topbar-adjusted');
    }
    return () => {
      if (root) {
        root.classList.remove('layout-topbar-adjusted');
      }
    };
  }, []);

  const lowStockAlerts   = products.filter(p => p.stock <= p.minStock && p.minStock > 0).slice(0, 6);
  const overdueCustomers = customers.filter(c => c.creditBalance > 0).slice(0, 6);
  const totalAlerts      = lowStockAlerts.length + overdueCustomers.length;

  const userRole     = currentUser?.role || "Owner";
  const activeTenant = tenants.find(t => t.id === currentUser?.tenantId);
  const bizType      = activeTenant?.businessType || "Super Markets";
  const businessName = activeTenant?.businessName || "MT STORE";

  let vertical: "Retail" | "F&B" | "Pharmacy" | "Bookstore" = "Retail";
  if (bizType.includes("Restaurant") || bizType.includes("Cafe") || bizType.includes("Baker")) vertical = "F&B";
  else if (bizType.includes("Pharmacy") || bizType.includes("Medical") || bizType.includes("Health") || bizType.includes("Clinic")) vertical = "Pharmacy";
  else if (bizType.includes("Book") || bizType.includes("Library") || bizType.includes("Gift")) vertical = "Bookstore";

  const allLinks = [
    { name: "Dashboard",           href: "/dashboard",  icon: LayoutDashboard, roles: ["Owner","Manager","Accountant","Cashier","HR","Warehouse Staff"], verticals: ["Retail","F&B","Pharmacy","Bookstore"] },
    { name: "Restaurant POS",       href: "/restaurant", icon: Utensils,        roles: ["Owner","Manager","Cashier"],                                 verticals: ["F&B"] },
    { name: "Kitchen Display",      href: "/kds",        icon: Monitor,         roles: ["Owner","Manager"],                                           verticals: ["F&B"] },
    { name: "Point of Sale",          href: "/pos",        icon: ShoppingCart,    roles: ["Owner","Manager","Cashier"],                                 verticals: ["Retail","Pharmacy","Bookstore"] },
    { name: "Sales History",         href: "/sales",      icon: Receipt,         roles: ["Owner","Manager","Cashier","Accountant"],                   verticals: ["Retail","F&B","Pharmacy","Bookstore"] },
    { name: "Customers",            href: "/customers",  icon: Users2,          roles: ["Owner","Manager","Cashier"],                                 verticals: ["Retail","F&B","Pharmacy","Bookstore"] },
    { name: "Menu & Recipes",       href: "/menu-builder",   icon: Database,        roles: ["Owner","Manager","Warehouse Staff"],                         verticals: ["F&B"] },
    { name: "Floor Plan Editor",    href: "/floor-editor",   icon: Settings,        roles: ["Owner","Manager"],                                           verticals: ["F&B"] },
    { name: "Drug Expiries FEFO",   href: "/pharmacy",   icon: Heart,           roles: ["Owner","Manager","Warehouse Staff"],                         verticals: ["Pharmacy"] },
    { name: "Drugs Registry",       href: "/products",   icon: Database,        roles: ["Owner","Manager","Warehouse Staff"],                         verticals: ["Pharmacy"] },
    { name: "Books Directory",      href: "/products",   icon: Database,        roles: ["Owner","Manager","Warehouse Staff"],                         verticals: ["Bookstore"] },
    { name: "Reading Club Loyalty", href: "/crm",        icon: MessageCircle,   roles: ["Owner","Manager"],                                          verticals: ["Bookstore"] },
    { name: "Products Catalog",     href: "/products",   icon: Database,        roles: ["Owner","Manager","Warehouse Staff"],                         verticals: ["Retail"] },
    { name: "Suppliers Directory",  href: "/suppliers",  icon: ShoppingBag,     roles: ["Owner","Manager","Warehouse Staff"],     verticals: ["Retail","F&B","Pharmacy","Bookstore"] },
    { name: "Purchase Orders",      href: "/purchases",  icon: ShoppingBag,     roles: ["Owner","Manager","Warehouse Staff"],     verticals: ["Retail","Pharmacy","Bookstore"] },
    { name: "Inventory Ledger",     href: "/inventory",  icon: Database,        roles: ["Owner","Manager","Warehouse Staff"],     verticals: ["Retail","Pharmacy","Bookstore"] },
    { name: "Expense Vouchers",     href: "/expenses",   icon: Receipt,         roles: ["Owner","Manager","Accountant"],                             verticals: ["Retail","F&B","Pharmacy","Bookstore"] },
    { name: "Accounting Ledgers",   href: "/accounting", icon: Landmark,        roles: ["Owner","Manager","Accountant"],                             verticals: ["Retail","F&B","Pharmacy","Bookstore"] },
    { name: "Staff Payroll",        href: "/payroll",    icon: Users,           roles: ["Owner","Manager","HR"],                                     verticals: ["Retail","F&B","Pharmacy","Bookstore"] },
    { name: "Staff & Roles",        href: "/staff",      icon: Users,           roles: ["Owner","HR"],                                               verticals: ["Retail","F&B","Pharmacy","Bookstore"] },
    { name: "CRM Campaigns",        href: "/crm",        icon: MessageCircle,   roles: ["Owner","Manager"],                                          verticals: ["Retail","F&B","Pharmacy"] },
    { name: "Data Reports",         href: "/reports",    icon: FileDown,        roles: ["Owner","Manager","Accountant"],                             verticals: ["Retail","F&B","Pharmacy","Bookstore"] },
    { name: "AI Analytics",         href: "/ai",         icon: Brain,           roles: ["Owner","Manager"],                                          verticals: ["Retail","F&B","Pharmacy","Bookstore"] },
    { name: "Help & Support",       href: "/support",    icon: MessageCircle,   roles: ["Owner","Manager"],                                           verticals: ["Retail","F&B","Pharmacy","Bookstore"] },
    { name: "Settings Desk",        href: "/settings",   icon: Sliders,         roles: ["Owner","Manager"],                                          verticals: ["Retail","F&B","Pharmacy","Bookstore"] },
  ];

  const activeLinks = allLinks.filter(l => l.roles.includes(userRole) && l.verticals.includes(vertical));
  const handleLogout = () => { logout(); router.push("/login"); };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <style>{`
        .layout-topbar-adjusted {
          padding-top: ${isOffline ? "88px" : "64px"} !important;
          height: 100vh !important;
          box-sizing: border-box !important;
        }
        .layout-topbar-adjusted > aside,
        .layout-topbar-adjusted > main {
          height: 100% !important;
        }
      `}</style>

      {/* Persistent Top Offline Warning Banner */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 h-6 bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white text-[10px] font-black tracking-widest flex items-center justify-center gap-2 z-[1001] px-4 uppercase shadow-sm">
          <WifiOff size={11} className="shrink-0 animate-pulse text-amber-200" />
          <span className="truncate">OFFLINE MODE ACTIVE — LOCAL DATABASE RUNNING · AUTO-SYNC WILL RESUME WHEN RECONNECTED</span>
        </div>
      )}

      <header className={`fixed ${isOffline ? "top-6" : "top-0"} left-0 right-0 h-16 z-[1000] border-b flex items-center justify-between px-4 sm:px-6 transition-all duration-200 ${
        isLight ? "bg-white border-slate-200 text-slate-900 shadow-xs" : "bg-brand-dark-surface border-brand-dark-border text-gray-100"
      }`}>
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className={`md:hidden p-2 rounded-lg transition-transform hover:scale-105 active:scale-95 ${
              isLight ? "bg-sky-50 text-sky-600 hover:bg-sky-100" : "bg-brand-dark-border/60 text-brand-sky hover:bg-brand-dark-border"
            }`}
          >
            <Menu size={20} />
          </button>
          <Link href="/dashboard" className="flex items-center ml-2">
            <MTCoreLogo variant="sky" size="md" showText={true} theme={isLight ? "light" : "dark"} />
          </Link>
        </div>

        <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 flex-col items-center">
          <span className={`font-black text-lg tracking-widest uppercase ${isLight ? "text-slate-900" : "text-white"}`}>
            {businessName}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-sky-500 font-bold uppercase tracking-wider">{bizType}</span>
            {isOffline && (
              <span className="bg-red-500/20 text-red-500 text-[8px] font-black uppercase px-1.5 py-0.2 rounded font-mono border border-red-500/30 animate-pulse">
                Offline
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          
          <div className="hidden lg:flex flex-col items-end mr-2">
            <div className={`text-xs font-bold font-mono flex items-center gap-1 ${isLight ? "text-slate-700" : "text-gray-300"}`}>
              <Clock size={12} className="text-sky-500" />
              {time.toLocaleTimeString()}
            </div>
            <div className={`text-[9px] ${isLight ? "text-slate-500" : "text-gray-500"}`}>
              {time.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {isOffline && (
              <div className="flex items-center gap-1.5 bg-red-500/15 border border-red-500/40 text-red-500 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse shrink-0">
                <WifiOff size={12} className="text-red-500 shrink-0" />
                <span className="hidden md:inline">OFFLINE MODE</span>
                <span className="text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded font-mono">SYNC PAUSED</span>
              </div>
            )}

            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition ${
                isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-600" : "bg-black/50 border border-brand-dark-border hover:bg-brand-dark-border text-gray-400"
              }`}
              title="Toggle Theme"
            >
              {isLight ? <Moon size={16} /> : <Sun size={16} className="text-amber-500" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-full transition ${
                  showNotifications
                    ? "bg-amber-500/20 text-amber-500"
                    : isLight
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-600"
                    : "bg-black/50 border border-brand-dark-border hover:bg-brand-dark-border text-gray-400"
                }`}
                title="Notifications"
              >
                <Bell size={16} className={totalAlerts > 0 ? "text-amber-500" : ""} />
                {totalAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center leading-none px-0.5 shadow-xs border-2 border-white dark:border-black">
                    {totalAlerts > 9 ? "9+" : totalAlerts}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  ref={notifRef}
                  className={`absolute right-0 top-12 w-72 sm:w-80 border shadow-2xl rounded-xl overflow-hidden z-[1001] animate-fade-in-up ${
                    isLight ? "bg-white border-slate-200" : "bg-[#111111] border-brand-dark-border"
                  }`}
                >
                  <div className={`flex items-center justify-between px-4 py-2.5 border-b ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-black/40 border-brand-dark-border text-white"
                  }`}>
                    <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Bell size={11} className="text-amber-500" />
                      Alerts &amp; Notices
                      <span className="ml-1 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black">{totalAlerts}</span>
                    </span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className={`p-1 rounded transition ${isLight ? "text-slate-400 hover:text-slate-900 hover:bg-slate-100" : "text-gray-500 hover:text-white hover:bg-brand-dark-border"}`}
                    >
                      <X size={12} />
                    </button>
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto">
                    {lowStockAlerts.length > 0 && (
                      <div>
                        <div className={`px-4 py-2 border-b ${isLight ? "bg-amber-50 border-amber-100" : "bg-amber-500/5 border-brand-dark-border/40"}`}>
                          <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                            <Package size={9} /> Low Stock ({lowStockAlerts.length} items)
                          </span>
                        </div>
                        {lowStockAlerts.map(p => (
                          <Link
                            key={p.id} href="/inventory"
                            onClick={() => setShowNotifications(false)}
                            className={`flex items-center justify-between px-4 py-2.5 transition group border-b ${
                              isLight ? "hover:bg-slate-50 border-slate-100" : "hover:bg-brand-dark-border/30 border-brand-dark-border/15"
                            }`}
                          >
                            <div className="min-w-0 flex-grow">
                              <div className={`text-[11px] font-bold truncate transition ${isLight ? "text-slate-900 group-hover:text-sky-600" : "text-white group-hover:text-brand-sky"}`}>{p.name}</div>
                              <div className={`text-[9px] font-mono ${isLight ? "text-slate-400" : "text-gray-500"}`}>{p.sku}</div>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <div className="text-[10px] font-black text-red-500 font-mono">{p.stock}</div>
                              <div className={`text-[8px] ${isLight ? "text-slate-400" : "text-gray-600"}`}>/ min {p.minStock}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {overdueCustomers.length > 0 && (
                      <div>
                        <div className={`px-4 py-2 border-b ${isLight ? "bg-red-50 border-red-100" : "bg-red-500/5 border-brand-dark-border/40"}`}>
                          <span className="text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
                            <CreditCard size={9} /> Overdue Dues ({overdueCustomers.length})
                          </span>
                        </div>
                        {overdueCustomers.map(c => (
                          <Link
                            key={c.id} href="/crm"
                            onClick={() => setShowNotifications(false)}
                            className={`flex items-center justify-between px-4 py-2.5 transition group border-b ${
                              isLight ? "hover:bg-slate-50 border-slate-100" : "hover:bg-brand-dark-border/30 border-brand-dark-border/15"
                            }`}
                          >
                            <div className="min-w-0 flex-grow">
                              <div className={`text-[11px] font-bold truncate transition ${isLight ? "text-slate-900 group-hover:text-red-600" : "text-white group-hover:text-red-400"}`}>{c.name}</div>
                              <div className={`text-[9px] font-mono ${isLight ? "text-slate-400" : "text-gray-500"}`}>{c.mobile}</div>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <div className="text-[10px] font-black text-red-500 font-mono">
                                {c.creditBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                              </div>
                              <div className={`text-[8px] ${isLight ? "text-slate-400" : "text-gray-600"}`}>PKR due</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {totalAlerts === 0 && (
                      <div className="px-4 py-8 text-center">
                        <div className="text-2xl mb-2">✅</div>
                        <div className={`text-[10px] font-bold ${isLight ? "text-slate-700" : "text-gray-400"}`}>All systems healthy!</div>
                        <div className={`text-[9px] mt-0.5 ${isLight ? "text-slate-400" : "text-gray-600"}`}>No active alerts right now.</div>
                      </div>
                    )}
                  </div>
                  
                  <div className={`border-t px-4 py-2 ${isLight ? "bg-slate-50 border-slate-200" : "bg-black/30 border-brand-dark-border/40"}`}>
                    <Link href="/reports" onClick={() => setShowNotifications(false)}
                      className="text-[9px] text-sky-500 font-black uppercase tracking-wider hover:underline">
                      View Full Reports →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="h-6 w-px bg-slate-300 dark:bg-brand-dark-border mx-1"></div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <div className={`text-xs font-bold leading-tight ${isLight ? "text-slate-900" : "text-white"}`}>{currentUser?.name || "User"}</div>
              <div className="text-[9px] text-sky-500 uppercase font-black">{userRole}</div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sky-500 text-white font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                {currentUser?.name?.substring(0, 2).toUpperCase() || "MT"}
              </div>
              <button 
                onClick={handleLogout} 
                className={`p-2 rounded-full transition ${isLight ? "text-red-500 hover:bg-red-50" : "text-red-400 hover:bg-red-500/20"}`}
                title="Lock Workstation"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
          
        </div>
      </header>

      {isMobileMenuOpen && (
        <div 
          className={`fixed inset-0 bg-black/60 z-[998] md:hidden backdrop-blur-sm transition-opacity ${isOffline ? "top-[88px]" : "top-16"}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed ${isOffline ? "top-[88px]" : "top-16"} bottom-0 left-0 z-[999] transform transition-transform duration-300 md:relative md:top-0 md:inset-y-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        w-64 border-r flex flex-col shrink-0 font-sans print:hidden transition-colors ${
        isLight ? "bg-white border-slate-200 text-slate-900 shadow-xs" : "bg-brand-dark-surface border-brand-dark-border text-gray-100"
      }`}>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {activeLinks.map(link => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${
                  active
                    ? isLight
                      ? "bg-sky-100/90 border border-sky-300 text-sky-900 font-bold shadow-xs"
                      : "bg-brand-sky/10 border border-brand-sky/30 text-brand-sky font-bold"
                    : isLight
                    ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    : "text-gray-400 hover:text-white hover:bg-brand-dark-border"
                }`}
              >
                <Icon size={16} className={active ? "text-sky-500" : "opacity-80"} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
