"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useGlobalContext } from "@/context/global-context";
import {
  Laptop, LayoutDashboard, ShoppingCart, Database, DollarSign, Utensils,
  Heart, Users, Users2, MessageCircle, FileDown, Brain, ExternalLink,
  LogOut, ShieldAlert, ShoppingBag, Receipt, Sliders, Bell, X, Package, CreditCard, Monitor, Settings, Landmark
} from "lucide-react";
import MTCoreLogo from "@/components/mt-logo";

export default function ClientSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, currentUser, tenants, currentBranch, setCurrentBranch, products, customers } = useGlobalContext();

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

  return (
    <aside className="relative w-64 h-screen sticky top-0 bg-brand-dark-surface border-r border-brand-dark-border flex flex-col shrink-0 font-sans print:hidden">

      {/* ═══════════════════════════════════════════════════════════════
          NOTIFICATION PANEL — anchored to aside full-width below header
      ═══════════════════════════════════════════════════════════════ */}
      {showNotifications && (
        <div
          ref={notifRef}
          className="absolute left-0 top-16 w-full bg-[#111111] border-x border-b border-brand-dark-border shadow-2xl z-[999]"
          style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-black/40 border-b border-brand-dark-border">
            <span className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Bell size={11} className="text-amber-400" />
              Alerts &amp; Notices
              <span className="ml-1 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black">{totalAlerts}</span>
            </span>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-gray-500 hover:text-white transition p-1 rounded hover:bg-brand-dark-border"
            >
              <X size={12} />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {/* Low Stock alerts */}
            {lowStockAlerts.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-amber-500/5 border-b border-brand-dark-border/40">
                  <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                    <Package size={9} /> Low Stock ({lowStockAlerts.length} items)
                  </span>
                </div>
                {lowStockAlerts.map(p => (
                  <Link
                    key={p.id} href="/inventory"
                    onClick={() => setShowNotifications(false)}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-brand-dark-border/30 transition group border-b border-brand-dark-border/15"
                  >
                    <div className="min-w-0 flex-grow">
                      <div className="text-[11px] font-bold text-white truncate group-hover:text-brand-sky transition">{p.name}</div>
                      <div className="text-[9px] text-gray-500 font-mono">{p.sku}</div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <div className="text-[10px] font-black text-red-400 font-mono">{p.stock}</div>
                      <div className="text-[8px] text-gray-600">/ min {p.minStock}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Overdue dues alerts */}
            {overdueCustomers.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-red-500/5 border-b border-brand-dark-border/40">
                  <span className="text-[9px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1">
                    <CreditCard size={9} /> Overdue Dues ({overdueCustomers.length})
                  </span>
                </div>
                {overdueCustomers.map(c => (
                  <Link
                    key={c.id} href="/crm"
                    onClick={() => setShowNotifications(false)}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-brand-dark-border/30 transition group border-b border-brand-dark-border/15"
                  >
                    <div className="min-w-0 flex-grow">
                      <div className="text-[11px] font-bold text-white truncate group-hover:text-red-400 transition">{c.name}</div>
                      <div className="text-[9px] text-gray-500 font-mono">{c.mobile}</div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <div className="text-[10px] font-black text-red-400 font-mono">
                        {c.creditBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                      <div className="text-[8px] text-gray-600">PKR due</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* All clear */}
            {totalAlerts === 0 && (
              <div className="px-4 py-8 text-center">
                <div className="text-2xl mb-2">✅</div>
                <div className="text-[10px] text-gray-400 font-bold">All systems healthy!</div>
                <div className="text-[9px] text-gray-600 mt-0.5">No active alerts right now.</div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-brand-dark-border/40 px-4 py-2 bg-black/30">
            <Link href="/reports" onClick={() => setShowNotifications(false)}
              className="text-[9px] text-brand-sky font-black uppercase tracking-wider hover:underline">
              View Full Reports →
            </Link>
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className="py-4 px-3 border-b border-brand-dark-border shrink-0 bg-black/50 flex items-center justify-center">
          <Link href="/dashboard" className="w-full flex items-center justify-center">
            <MTCoreLogo variant="sky" size="md" showText={true} />
          </Link>
        </div>

        {/* User Role Card */}
        <div className="p-3 border-b border-brand-dark-border/40 space-y-2 shrink-0">
          <div className="flex items-center justify-between gap-2 bg-black/40 border border-brand-dark-border/80 p-2.5 rounded-lg">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-brand-sky text-black font-black flex items-center justify-center text-xs shrink-0">
                {currentUser?.name?.substring(0, 2).toUpperCase() || "MT"}
              </div>
              <div className="min-w-0">
                <h4 className="text-white font-bold text-xs truncate">{currentUser?.name || "Mian Talal"}</h4>
                <p className="text-[9px] text-brand-sky font-bold uppercase tracking-wider">{userRole}</p>
              </div>
            </div>
            {/* Bell Icon inside User Card */}
            <button
              onClick={() => setShowNotifications(v => !v)}
              className={`relative shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition ${
                showNotifications ? "bg-amber-500/20 border border-amber-500/40" : "hover:bg-brand-dark-border/80"
              }`}
              title="Notifications"
            >
              <Bell size={15} className={totalAlerts > 0 ? "text-amber-400" : "text-gray-400"} />
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
                    ? "bg-brand-sky/10 border border-brand-sky/30 text-brand-sky font-bold"
                    : "text-gray-400 hover:text-white hover:bg-brand-dark-border"
                }`}
              >
                <Icon size={14} className={active ? "text-brand-sky" : ""} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-brand-dark-border space-y-1.5 shrink-0">
        <div className="bg-brand-dark-border/40 p-2 rounded text-[9px] text-gray-500 leading-normal flex items-start gap-1">
          <ShieldAlert size={12} className="text-amber-400 shrink-0 mt-0.5" />
          <span>RBAC Active · Role: <span className="text-white font-bold">{userRole}</span></span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-400 font-bold text-xs rounded transition"
        >
          <LogOut size={14} />
          <span>Lock Workstation</span>
        </button>
      </div>
    </aside>
  );
}
