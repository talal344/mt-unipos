"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useGlobalContext } from "@/context/global-context";
import {
  Laptop, LayoutDashboard, ShoppingCart, Database, DollarSign, Utensils,
  Heart, Users, Users2, MessageCircle, FileDown, Brain, ExternalLink, Menu,
  LogOut, ShieldAlert, ShoppingBag, Receipt, Sliders, Bell, X, Package, CreditCard, Monitor, Settings, Landmark, Sun, Moon
} from "lucide-react";
import MTCoreLogo from "@/components/mt-logo";

export default function ClientSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, currentUser, tenants, currentBranch, setCurrentBranch, products, customers, theme, toggleTheme } = useGlobalContext();
  const isLight = theme === "light";

  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notification panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotifications]);

  // Live alerts
  const lowStockAlerts   = products.filter(p => p.stock <= p.minStock && p.minStock > 0).slice(0, 6);
  const overdueCustomers = customers.filter(c => c.creditBalance > 0).slice(0, 6);
  const totalAlerts      = lowStockAlerts.length + overdueCustomers.length;

  const userRole     = currentUser?.role || "Owner";
  const activeTenant = tenants.find(t => t.id === currentUser?.tenantId);
  const bizType      = activeTenant?.businessType || "Super Markets";

  let vertical: "Retail" | "F&B" | "Pharmacy" | "Bookstore" = "Retail";
  if (bizType.includes("Restaurant") || bizType.includes("Cafe") || bizType.includes("Baker")) vertical = "F&B";
  else if (bizType.includes("Pharmacy") || bizType.includes("Medical") || bizType.includes("Health") || bizType.includes("Clinic")) vertical = "Pharmacy";
  else if (bizType.includes("Book") || bizType.includes("Library") || bizType.includes("Gift")) vertical = "Bookstore";

  const allLinks = [
    { name: "ERP Dashboard",       href: "/dashboard",  icon: LayoutDashboard, roles: ["Owner","Manager","Accountant"],                              verticals: ["Retail","F&B","Pharmacy","Bookstore"] },
    { name: "Restaurant POS",       href: "/restaurant", icon: Utensils,        roles: ["Owner","Manager","Cashier"],                                 verticals: ["F&B"] },
    { name: "Kitchen Display",      href: "/kds",        icon: Monitor,         roles: ["Owner","Manager"],                                           verticals: ["F&B"] },
    { name: "CASHIER POS",          href: "/pos",        icon: ShoppingCart,    roles: ["Owner","Manager","Cashier"],                                 verticals: ["Retail","Pharmacy","Bookstore"] },
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

  // Auto-close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button 
        onClick={() => setIsMobileMenuOpen(true)}
        className={`md:hidden fixed bottom-6 right-6 z-40 p-3.5 rounded-full shadow-2xl ${isLight ? "bg-sky-600 text-white" : "bg-brand-sky text-black"} transition-transform hover:scale-105 active:scale-95`}
      >
        <Menu size={24} />
      </button>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[998] md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[999] transform transition-transform duration-300 md:relative md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        w-64 h-screen md:sticky md:top-0 border-r flex flex-col shrink-0 font-sans print:hidden transition-colors ${
        isLight ? "bg-white border-slate-200 text-slate-900 shadow-xs" : "bg-brand-dark-surface border-brand-dark-border text-gray-100"
      }`}>

      {/* ═══════════════════════════════════════════════════════════════
          NOTIFICATION PANEL — anchored to aside full-width below header
      ═══════════════════════════════════════════════════════════════ */}
      {showNotifications && (
        <div
          ref={notifRef}
          className={`absolute left-0 top-16 w-full border-x border-b shadow-2xl z-[999] ${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#111111] border-brand-dark-border text-white"
          }`}
          style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}
        >
          {/* Panel header */}
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

          <div className="max-h-80 overflow-y-auto">
            {/* Low Stock alerts */}
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

            {/* Overdue dues alerts */}
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

            {/* All clear */}
            {totalAlerts === 0 && (
              <div className="px-4 py-8 text-center">
                <div className="text-2xl mb-2">✅</div>
                <div className={`text-[10px] font-bold ${isLight ? "text-slate-700" : "text-gray-400"}`}>All systems healthy!</div>
                <div className={`text-[9px] mt-0.5 ${isLight ? "text-slate-400" : "text-gray-600"}`}>No active alerts right now.</div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`border-t px-4 py-2 ${isLight ? "bg-slate-50 border-slate-200" : "bg-black/30 border-brand-dark-border/40"}`}>
            <Link href="/reports" onClick={() => setShowNotifications(false)}
              className="text-[9px] text-sky-500 font-black uppercase tracking-wider hover:underline">
              View Full Reports →
            </Link>
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className={`py-4 px-3 border-b shrink-0 flex items-center justify-center ${
          isLight ? "bg-slate-50 border-slate-200" : "bg-black/50 border-brand-dark-border"
        }`}>
          <Link href="/dashboard" className="w-full flex items-center justify-center">
            <MTCoreLogo variant="sky" size="md" showText={true} theme={isLight ? "light" : "dark"} />
          </Link>
        </div>

        {/* User Role Card */}
        <div className={`p-3 border-b space-y-2 shrink-0 ${isLight ? "border-slate-200" : "border-brand-dark-border/40"}`}>
          <div className={`flex items-center justify-between gap-2 border p-2.5 rounded-lg ${
            isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-brand-dark-border/80"
          }`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-sky-500 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                {currentUser?.name?.substring(0, 2).toUpperCase() || "MT"}
              </div>
              <div className="min-w-0">
                <h4 className={`font-bold text-xs truncate ${isLight ? "text-slate-900" : "text-white"}`}>{currentUser?.name || "Mian Talal"}</h4>
                <p className="text-[9px] text-sky-500 font-bold uppercase tracking-wider">{userRole}</p>
              </div>
            </div>
            {/* Bell Icon inside User Card */}
            <button
              onClick={() => setShowNotifications(v => !v)}
              className={`relative shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition ${
                showNotifications 
                  ? "bg-amber-500/20 border border-amber-500/40" 
                  : isLight 
                  ? "hover:bg-slate-200/60" 
                  : "hover:bg-brand-dark-border/80"
              }`}
              title="Notifications"
            >
              <Bell size={15} className={totalAlerts > 0 ? "text-amber-500" : isLight ? "text-slate-500" : "text-gray-400"} />
              {totalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center leading-none px-0.5">
                  {totalAlerts > 9 ? "9+" : totalAlerts}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-2.5 space-y-[2px] overflow-y-auto no-scrollbar">
          {activeLinks.map(link => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  active
                    ? isLight
                      ? "bg-sky-100/90 border border-sky-300 text-sky-900 font-bold shadow-xs"
                      : "bg-brand-sky/10 border border-brand-sky/30 text-brand-sky font-bold"
                    : isLight
                    ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    : "text-gray-400 hover:text-white hover:bg-brand-dark-border"
                }`}
              >
                <Icon size={14} className={active ? "text-sky-500" : ""} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className={`p-3 border-t space-y-1.5 shrink-0 ${isLight ? "border-slate-200" : "border-brand-dark-border"}`}>
        {/* Theme Switcher Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg transition font-bold text-xs ${
            isLight
              ? "bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200"
              : "bg-black/60 border-brand-dark-border text-gray-300 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            {isLight ? <Sun size={14} className="text-amber-500" /> : <Moon size={14} className="text-sky-400" />}
            <span>{isLight ? "Light Mode" : "Black Mode"}</span>
          </div>
          <span className="text-[9px] uppercase tracking-wider font-mono opacity-80">
            {isLight ? "LIGHT" : "DARK"}
          </span>
        </button>

        <div className={`p-2 rounded text-[9px] leading-normal flex items-start gap-1 ${
          isLight ? "bg-slate-100 text-slate-600 border border-slate-200" : "bg-brand-dark-border/40 text-gray-500"
        }`}>
          <ShieldAlert size={12} className="text-amber-500 shrink-0 mt-0.5" />
          <span>RBAC Active · Role: <span className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{userRole}</span></span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 font-bold text-xs rounded transition"
        >
          <LogOut size={14} />
          <span>Lock Workstation</span>
        </button>
      </div>
    </aside>
    </>
  );
}
