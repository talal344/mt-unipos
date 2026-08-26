"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useGlobalContext } from "@/context/global-context";
import {
  Laptop, LayoutDashboard, ShoppingCart, Database, DollarSign, Utensils,
  Heart, Users, Users2, MessageCircle, FileDown, Brain, ExternalLink, Menu,
  LogOut, ShieldAlert, ShoppingBag, Receipt, Sliders, Bell, X, Package, CreditCard,
  Monitor, Settings, Landmark, Sun, Moon, Clock, WifiOff, ChevronDown, ChevronRight,
  Sparkles, CheckCircle2, ChevronRight as ChevronRightIcon
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

  const menuGroups = [
    {
      id: "sales",
      title: "Point of Sale",
      badge: "POS",
      icon: ShoppingCart,
      color: {
        darkHeader: "text-sky-400 hover:bg-sky-500/10 border-sky-500/20",
        lightHeader: "text-sky-800 hover:bg-sky-50 border-sky-200",
        badgeDark: "bg-sky-500/20 text-sky-300 border-sky-500/30",
        badgeLight: "bg-sky-100 text-sky-800 border-sky-200",
        iconColorDark: "text-sky-400",
        iconColorLight: "text-sky-600",
        iconBgDark: "bg-sky-500/15 border-sky-500/30",
        iconBgLight: "bg-sky-100 border-sky-200",
        activeDark: "bg-sky-500/15 border-sky-500/40 text-sky-300 font-bold",
        activeLight: "bg-sky-100 border-sky-300 text-sky-950 font-bold",
      },
      links: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["Owner","Manager","Accountant","Cashier","HR","Warehouse Staff"], verticals: ["Retail","F&B","Pharmacy","Bookstore"] },
        { name: "Point of Sale", href: "/pos", icon: ShoppingCart, roles: ["Owner","Manager","Cashier"], verticals: ["Retail","Pharmacy","Bookstore"] },
        { name: "Restaurant POS", href: "/restaurant", icon: Utensils, roles: ["Owner","Manager","Cashier"], verticals: ["F&B"] },
        { name: "Kitchen Display", href: "/kds", icon: Monitor, roles: ["Owner","Manager"], verticals: ["F&B"] },
        { name: "Sales History", href: "/sales", icon: Receipt, roles: ["Owner","Manager","Cashier","Accountant"], verticals: ["Retail","F&B","Pharmacy","Bookstore"] },
        { name: "Customers Directory", href: "/customers", icon: Users2, roles: ["Owner","Manager","Cashier"], verticals: ["Retail","F&B","Pharmacy","Bookstore"] },
      ]
    },
    {
      id: "inventory",
      title: "Inventory",
      badge: "Stock",
      icon: Package,
      color: {
        darkHeader: "text-amber-400 hover:bg-amber-500/10 border-amber-500/20",
        lightHeader: "text-amber-800 hover:bg-amber-50 border-amber-200",
        badgeDark: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        badgeLight: "bg-amber-100 text-amber-800 border-amber-200",
        iconColorDark: "text-amber-400",
        iconColorLight: "text-amber-600",
        iconBgDark: "bg-amber-500/15 border-amber-500/30",
        iconBgLight: "bg-amber-100 border-amber-200",
        activeDark: "bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold",
        activeLight: "bg-amber-100 border-amber-300 text-amber-950 font-bold",
      },
      links: [
        { name: "Products Catalog", href: "/products", icon: Database, roles: ["Owner","Manager","Warehouse Staff"], verticals: ["Retail"] },
        { name: "Drugs Registry", href: "/products", icon: Database, roles: ["Owner","Manager","Warehouse Staff"], verticals: ["Pharmacy"] },
        { name: "Drug Expiries FEFO", href: "/pharmacy", icon: Heart, roles: ["Owner","Manager","Warehouse Staff"], verticals: ["Pharmacy"] },
        { name: "Books Directory", href: "/products", icon: Database, roles: ["Owner","Manager","Warehouse Staff"], verticals: ["Bookstore"] },
        { name: "Menu & Recipes", href: "/menu-builder", icon: Database, roles: ["Owner","Manager","Warehouse Staff"], verticals: ["F&B"] },
        { name: "Floor Plan Editor", href: "/floor-editor", icon: Settings, roles: ["Owner","Manager"], verticals: ["F&B"] },
        { name: "Suppliers Directory", href: "/suppliers", icon: ShoppingBag, roles: ["Owner","Manager","Warehouse Staff"], verticals: ["Retail","F&B","Pharmacy","Bookstore"] },
        { name: "Purchase Orders", href: "/purchases", icon: ShoppingBag, roles: ["Owner","Manager","Warehouse Staff"], verticals: ["Retail","Pharmacy","Bookstore"] },
        { name: "Inventory Ledger", href: "/inventory", icon: Database, roles: ["Owner","Manager","Warehouse Staff"], verticals: ["Retail","Pharmacy","Bookstore"] },
      ]
    },
    {
      id: "finance",
      title: "Finance",
      badge: "Ledger",
      icon: Landmark,
      color: {
        darkHeader: "text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/20",
        lightHeader: "text-emerald-800 hover:bg-emerald-50 border-emerald-200",
        badgeDark: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        badgeLight: "bg-emerald-100 text-emerald-800 border-emerald-200",
        iconColorDark: "text-emerald-400",
        iconColorLight: "text-emerald-600",
        iconBgDark: "bg-emerald-500/15 border-emerald-500/30",
        iconBgLight: "bg-emerald-100 border-emerald-200",
        activeDark: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold",
        activeLight: "bg-emerald-100 border-emerald-300 text-emerald-950 font-bold",
      },
      links: [
        { name: "Expense Vouchers", href: "/expenses", icon: Receipt, roles: ["Owner","Manager","Accountant"], verticals: ["Retail","F&B","Pharmacy","Bookstore"] },
        { name: "Accounting Ledgers", href: "/accounting", icon: Landmark, roles: ["Owner","Manager","Accountant"], verticals: ["Retail","F&B","Pharmacy","Bookstore"] },
      ]
    },
    {
      id: "staff",
      title: "Staff & HRMS",
      badge: "Team",
      icon: Users,
      color: {
        darkHeader: "text-purple-400 hover:bg-purple-500/10 border-purple-500/20",
        lightHeader: "text-purple-800 hover:bg-purple-50 border-purple-200",
        badgeDark: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        badgeLight: "bg-purple-100 text-purple-800 border-purple-200",
        iconColorDark: "text-purple-400",
        iconColorLight: "text-purple-600",
        iconBgDark: "bg-purple-500/15 border-purple-500/30",
        iconBgLight: "bg-purple-100 border-purple-200",
        activeDark: "bg-purple-500/15 border-purple-500/40 text-purple-300 font-bold",
        activeLight: "bg-purple-100 border-purple-300 text-purple-950 font-bold",
      },
      links: [
        { name: "Staff Payroll", href: "/payroll", icon: Users, roles: ["Owner","Manager","HR"], verticals: ["Retail","F&B","Pharmacy","Bookstore"] },
        { name: "Staff & Roles", href: "/staff", icon: ShieldAlert, roles: ["Owner","HR"], verticals: ["Retail","F&B","Pharmacy","Bookstore"] },
      ]
    },
    {
      id: "growth",
      title: "Reports & AI",
      badge: "AI",
      icon: Brain,
      color: {
        darkHeader: "text-rose-400 hover:bg-rose-500/10 border-rose-500/20",
        lightHeader: "text-rose-800 hover:bg-rose-50 border-rose-200",
        badgeDark: "bg-rose-500/20 text-rose-300 border-rose-500/30",
        badgeLight: "bg-rose-100 text-rose-800 border-rose-200",
        iconColorDark: "text-rose-400",
        iconColorLight: "text-rose-600",
        iconBgDark: "bg-rose-500/15 border-rose-500/30",
        iconBgLight: "bg-rose-100 border-rose-200",
        activeDark: "bg-rose-500/15 border-rose-500/40 text-rose-300 font-bold",
        activeLight: "bg-rose-100 border-rose-300 text-rose-950 font-bold",
      },
      links: [
        { name: "CRM Campaigns", href: "/crm", icon: MessageCircle, roles: ["Owner","Manager"], verticals: ["Retail","F&B","Pharmacy"] },
        { name: "Reading Club Loyalty", href: "/crm", icon: MessageCircle, roles: ["Owner","Manager"], verticals: ["Bookstore"] },
        { name: "Data Reports", href: "/reports", icon: FileDown, roles: ["Owner","Manager","Accountant"], verticals: ["Retail","F&B","Pharmacy","Bookstore"] },
        { name: "AI Analytics", href: "/ai", icon: Brain, roles: ["Owner","Manager"], verticals: ["Retail","F&B","Pharmacy","Bookstore"] },
      ]
    },
    {
      id: "system",
      title: "Settings & Desk",
      badge: "Desk",
      icon: Sliders,
      color: {
        darkHeader: "text-cyan-400 hover:bg-cyan-500/10 border-cyan-500/20",
        lightHeader: "text-cyan-800 hover:bg-cyan-50 border-cyan-200",
        badgeDark: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
        badgeLight: "bg-cyan-100 text-cyan-800 border-cyan-200",
        iconColorDark: "text-cyan-400",
        iconColorLight: "text-cyan-600",
        iconBgDark: "bg-cyan-500/15 border-cyan-500/30",
        iconBgLight: "bg-cyan-100 border-cyan-200",
        activeDark: "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-bold",
        activeLight: "bg-cyan-100 border-cyan-300 text-cyan-950 font-bold",
      },
      links: [
        { name: "Settings Desk", href: "/settings", icon: Sliders, roles: ["Owner","Manager"], verticals: ["Retail","F&B","Pharmacy","Bookstore"] },
        { name: "Help & Support", href: "/support", icon: MessageCircle, roles: ["Owner","Manager"], verticals: ["Retail","F&B","Pharmacy","Bookstore"] },
      ]
    }
  ];

  const visibleGroups = menuGroups
    .map(group => ({
      ...group,
      links: group.links.filter(l => l.roles.includes(userRole) && l.verticals.includes(vertical))
    }))
    .filter(group => group.links.length > 0);

  const handleLogout = () => { logout(); router.push("/login"); };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initialOpen: Record<string, boolean> = {};
    visibleGroups.forEach(g => {
      if (g.links.some(l => l.href === pathname)) {
        initialOpen[g.id] = true;
      }
    });
    return initialOpen;
  });

  useEffect(() => {
    setIsMobileMenuOpen(false);
    visibleGroups.forEach(g => {
      if (g.links.some(l => l.href === pathname)) {
        setOpenGroups(prev => ({ ...prev, [g.id]: true }));
      }
    });
  }, [pathname]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const renderNavContent = () => (
    <div className="space-y-2.5">
      {visibleGroups.map(group => {
        const isOpen = !!openGroups[group.id];
        const isGroupActive = group.links.some(l => l.href === pathname);
        const GroupIcon = group.icon;

        return (
          <div 
            key={group.id} 
            className={`rounded-xl border transition-colors ${
              isLight 
                ? isGroupActive ? "bg-slate-50/80 border-slate-300" : "bg-slate-50/40 border-slate-200" 
                : isGroupActive ? "bg-brand-dark-surface/90 border-brand-dark-border" : "bg-black/30 border-brand-dark-border/40"
            }`}
          >
            <button
              onClick={() => toggleGroup(group.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors text-left gap-2 ${
                isLight ? group.color.lightHeader : group.color.darkHeader
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className={`p-1.5 rounded-lg border shrink-0 ${
                  isLight ? group.color.iconBgLight : group.color.iconBgDark
                }`}>
                  <GroupIcon size={14} className={isLight ? group.color.iconColorLight : group.color.iconColorDark} />
                </div>
                <span className="text-[11.5px] font-black uppercase tracking-wide whitespace-nowrap">
                  {group.title}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded font-mono border ${
                  isLight ? group.color.badgeLight : group.color.badgeDark
                }`}>
                  {group.badge}
                </span>
                <span className={`p-0.5 rounded transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"} opacity-70`}>
                  <ChevronDown size={14} />
                </span>
              </div>
            </button>

            {isOpen && (
              <div className={`px-2 pb-2 pt-1 space-y-1 border-t ${
                isLight ? "border-slate-200/60" : "border-brand-dark-border/30"
              }`}>
                {group.links.map(link => {
                  const Icon = link.icon;
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.name + link.href}
                      href={link.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                        active
                          ? isLight
                            ? group.color.activeLight
                            : group.color.activeDark
                          : isLight
                          ? "border-transparent text-slate-600 hover:text-slate-900 hover:bg-white"
                          : "border-transparent text-gray-400 hover:text-white hover:bg-brand-dark-border/40"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon size={14} className={active ? (isLight ? group.color.iconColorLight : group.color.iconColorDark) : "opacity-70"} />
                        <span className="truncate">{link.name}</span>
                      </div>
                      {active && (
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          isLight ? "bg-sky-600" : "bg-brand-sky"
                        }`} />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <>

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
            <div className={`text-[9px] uppercase font-bold tracking-wider ${isLight ? "text-slate-500" : "text-gray-400"}`}>
              {currentBranch}
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors ${
              isLight 
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200" 
                : "bg-brand-dark-border/50 text-gray-300 hover:bg-brand-dark-border hover:text-white"
            }`}
            title={`Switch to ${isLight ? "Dark" : "Light"} Mode`}
          >
            {isLight ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(prev => !prev)}
              className={`relative p-2 rounded-full transition ${
                isLight ? "text-slate-700 hover:bg-slate-100" : "text-gray-300 hover:bg-brand-dark-border"
              }`}
              title="Notifications"
            >
              <Bell size={18} />
              {totalAlerts > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <div className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl border z-50 overflow-hidden font-sans ${
                isLight ? "bg-white border-slate-200 text-slate-900 shadow-xl" : "bg-brand-dark-surface border-brand-dark-border text-gray-100"
              }`}>
                <div className={`px-4 py-3 border-b flex items-center justify-between ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-brand-dark-border"
                }`}>
                  <div className="flex items-center gap-2">
                    <Bell size={14} className="text-sky-500" />
                    <span className="text-xs font-black uppercase tracking-wider">Live System Alerts</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full">
                    {totalAlerts} New
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-brand-dark-border/30">
                  {lowStockAlerts.length > 0 && (
                    <div className="p-3">
                      <div className="text-[9px] font-black uppercase tracking-widest text-amber-500 mb-2 flex items-center gap-1">
                        <Package size={11} /> Low Stock Warnings ({lowStockAlerts.length})
                      </div>
                      {lowStockAlerts.map(p => (
                        <Link 
                          key={p.id} 
                          href="/inventory"
                          onClick={() => setShowNotifications(false)}
                          className={`flex items-center justify-between py-1.5 px-2 rounded-lg transition mb-1 ${
                            isLight ? "hover:bg-slate-50 border-slate-100" : "hover:bg-brand-dark-border/30 border-brand-dark-border/15"
                          }`}
                        >
                          <div className="min-w-0 flex-grow">
                            <div className={`text-[11px] font-bold truncate ${isLight ? "text-slate-900" : "text-white"}`}>{p.name}</div>
                            <div className={`text-[9px] font-mono ${isLight ? "text-slate-400" : "text-gray-500"}`}>Min: {p.minStock} {p.unit}</div>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <div className="text-[10px] font-black text-amber-500 font-mono">{p.stock} left</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {overdueCustomers.length > 0 && (
                    <div className="p-3">
                      <div className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-2 flex items-center gap-1">
                        <CreditCard size={11} /> Outstanding Balances ({overdueCustomers.length})
                      </div>
                      {overdueCustomers.map(c => (
                        <Link 
                          key={c.id} 
                          href="/customers"
                          onClick={() => setShowNotifications(false)}
                          className={`flex items-center justify-between py-1.5 px-2 rounded-lg transition mb-1 group ${
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
        fixed ${isOffline ? "top-[88px]" : "top-16"} bottom-0 left-0 z-[999] w-72 border-r flex flex-col md:hidden font-sans print:hidden transform transition-transform duration-200 ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      } ${
        isLight ? "bg-white border-slate-200 text-slate-900 shadow-2xl" : "bg-brand-dark-surface border-brand-dark-border text-gray-100"
      }`}>
        <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar">
          {renderNavContent()}
        </nav>
      </aside>

      <aside className={`
        hidden md:flex flex-col relative top-0 h-full w-72 border-r shrink-0 font-sans print:hidden z-10 ${
        isLight ? "bg-white border-slate-200 text-slate-900 shadow-xs" : "bg-brand-dark-surface border-brand-dark-border text-gray-100"
      }`}>
        <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar">
          {renderNavContent()}
        </nav>
      </aside>
    </>
  );
}
