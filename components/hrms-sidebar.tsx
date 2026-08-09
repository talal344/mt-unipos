"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useGlobalContext } from "@/context/global-context";
import {
  Users,
  Clock,
  CalendarDays,
  DollarSign,
  UserPlus,
  TrendingUp,
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Building2,
  HelpCircle,
  Settings,
  Sparkles
} from "lucide-react";

export default function HRMSSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, businessSettings, hrEmployees } = useGlobalContext();
  const [collapsed, setCollapsed] = useState(false);

  const empMatch = hrEmployees.find(
    (e) => e.email?.toLowerCase().trim() === currentUser?.email?.toLowerCase().trim()
  );

  const isITUser = Boolean(
    (currentUser?.role as string) === "IT" ||
    currentUser?.email?.toLowerCase().includes("it@") ||
    empMatch?.department === "IT & Software Operations"
  );

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItems = isITUser
    ? [
        {
          label: "IT Dashboard",
          href: "/hrms",
          icon: LayoutDashboard,
        },
        {
          label: "Employees Directory",
          href: "/hrms/employees",
          icon: Users,
        },
        {
          label: "My Attendance",
          href: "/hrms/attendance",
          icon: Clock,
        },
        {
          label: "My Leave Applications",
          href: "/hrms/leaves",
          icon: CalendarDays,
        },
        {
          label: "IT Provisioning Tasks",
          href: "/hrms/recruitment",
          icon: UserPlus,
        },
        {
          label: "Helpdesk Tickets",
          href: "/hrms/tickets",
          icon: HelpCircle,
        },
      ]
    : [
        {
          label: "HR Dashboard",
          href: "/hrms",
          icon: LayoutDashboard,
        },
        {
          label: "Employees Directory",
          href: "/hrms/employees",
          icon: Users,
        },
        {
          label: "Attendance & Shifts",
          href: "/hrms/attendance",
          icon: Clock,
        },
        {
          label: "Leave Applications",
          href: "/hrms/leaves",
          icon: CalendarDays,
        },
        {
          label: "Payroll & Payslips",
          href: "/hrms/payroll",
          icon: DollarSign,
        },
        {
          label: "Recruitment (ATS)",
          href: "/hrms/recruitment",
          icon: UserPlus,
        },
        {
          label: "Performance (KPIs)",
          href: "/hrms/performance",
          icon: TrendingUp,
        },
        {
          label: "Helpdesk Tickets",
          href: "/hrms/tickets",
          icon: HelpCircle,
        },
        {
          label: "HRMS Settings",
          href: "/hrms/settings",
          icon: Settings,
        },
      ];

  return (
    <aside
      className={`relative flex flex-col min-h-screen bg-[#070a0f] border-r border-emerald-500/20 text-gray-300 transition-all duration-300 z-30 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg transition"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Brand Header */}
      <div className="p-4 border-b border-gray-800/80 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 shrink-0">
          <Building2 size={20} />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-black text-sm text-white tracking-wide truncate">
              {currentUser?.businessName || businessSettings?.businessName || "MT Enterprise"}
            </h1>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                HRMS Suite
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-grow p-3 space-y-1.5 overflow-y-auto">
        <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 ${collapsed ? "hidden" : "block"}`}>
          HR Core Modules
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition ${
                isActive
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30"
                  : "text-gray-400 hover:text-white hover:bg-emerald-500/10"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={16} className={isActive ? "text-white" : "text-emerald-400/80"} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-gray-800/80 bg-black/40">
        {!collapsed && (
          <div className="mb-3 p-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-between">
            <div className="overflow-hidden pr-2">
              <div className="text-xs font-bold text-white truncate">
                {currentUser?.name || "HR Admin"}
              </div>
              <div className="text-[10px] text-emerald-400 truncate font-mono">
                {currentUser?.email || "hr@corporate.com"}
              </div>
            </div>
            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 shrink-0">
              {currentUser?.role || "HR"}
            </span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 transition border border-red-500/20`}
          title="Sign Out of HRMS"
        >
          <LogOut size={14} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
