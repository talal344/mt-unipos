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
  Sparkles,
  Network,
  GitBranch,
  BarChart3,
  Package,
  AlertTriangle,
  CalendarRange,
  Megaphone,
  FileArchive,
  Target,
  Calendar,
  ArrowUpRight,
  Gift,
  DoorOpen,
  BellRing,
  Brain,
  Trophy,
  UserCheck,
  Wifi,
  GitMerge,
} from "lucide-react";
import MTCoreLogo from "@/components/mt-logo";

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

  const isHRUser = Boolean(
    (currentUser?.role as string) === "HR" ||
    currentUser?.email?.toLowerCase().includes("hr@") ||
    empMatch?.department === "Human Resources"
  );

  const isFinanceUser = Boolean(
    (currentUser?.role as string) === "Finance" ||
    currentUser?.email?.toLowerCase().includes("finance@") ||
    empMatch?.department === "Finance & Accounts"
  );

  const isOwner = currentUser?.role === "Owner";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // ── Core nav (all roles) ────────────────────────────────────────────
  const coreItems = [
    { label: "HR Dashboard",        href: "/hrms",              icon: LayoutDashboard },
    { label: "Employees Directory",  href: "/hrms/employees",   icon: Users },
    { label: "Attendance & Shifts",  href: "/hrms/attendance",  icon: Clock },
    { label: "Leave Applications",   href: "/hrms/leaves",      icon: CalendarDays },
    { label: "Payroll & Payslips",   href: "/hrms/payroll",     icon: DollarSign },
    { label: "Recruitment (ATS)",    href: "/hrms/recruitment", icon: UserPlus },
    { label: "My Team",             href: "/hrms/team",        icon: Network },
  ];

  // ── IT-only nav ─────────────────────────────────────────────────────
  const itItems = [
    { label: "IT Dashboard",              href: "/hrms",              icon: LayoutDashboard },
    { label: "Employees Directory",        href: "/hrms/employees",   icon: Users },
    { label: "My Attendance",             href: "/hrms/attendance",  icon: Clock },
    { label: "My Leave Applications",      href: "/hrms/leaves",      icon: CalendarDays },
    { label: "IT Provisioning Tasks",      href: "/hrms/recruitment", icon: UserPlus },
    { label: "My Team",                   href: "/hrms/team",        icon: Network },
    { label: "Helpdesk Tickets",          href: "/hrms/tickets",     icon: HelpCircle },
    { label: "Self-Service Portal",        href: "/hrms/self-service",icon: UserCheck },
  ];

  // ── Finance-only nav ────────────────────────────────────────────────
  const financeItems = [
    { label: "Finance Dashboard",          href: "/hrms",              icon: LayoutDashboard },
    { label: "Employees Directory",        href: "/hrms/employees",   icon: Users },
    { label: "My Attendance",             href: "/hrms/attendance",  icon: Clock },
    { label: "My Leave Applications",      href: "/hrms/leaves",      icon: CalendarDays },
    { label: "Payroll & Payslips",         href: "/hrms/payroll",     icon: DollarSign },
    { label: "Salary Hike Manager",        href: "/hrms/salary-hike", icon: ArrowUpRight },
    { label: "Finance Activation Tasks",   href: "/hrms/recruitment", icon: UserPlus },
    { label: "My Team",                   href: "/hrms/team",        icon: Network },
    { label: "Helpdesk Tickets",          href: "/hrms/tickets",     icon: HelpCircle },
    { label: "Self-Service Portal",        href: "/hrms/self-service",icon: UserCheck },
  ];

  // ── Priority 1 — High Impact (HR/Owner only) ────────────────────────
  const p1Items = [
    { label: "Employee Analytics",   href: "/hrms/analytics",      icon: BarChart3 },
    { label: "Asset Management",     href: "/hrms/assets",         icon: Package },
    { label: "Disciplinary Records", href: "/hrms/disciplinary",   icon: AlertTriangle },
    { label: "Shift Planner",        href: "/hrms/shift-planner",  icon: CalendarRange },
    { label: "Announcements",        href: "/hrms/announcements",  icon: Megaphone },
    { label: "Document Vault",       href: "/hrms/documents",      icon: FileArchive },
  ];

  // ── Priority 2 — Medium Impact (HR/Owner only) ──────────────────────
  const p2Items = [
    { label: "Goals & OKR Tracker",  href: "/hrms/goals",          icon: Target },
    { label: "Leave Calendar",       href: "/hrms/leave-calendar", icon: Calendar },
    { label: "Salary Hike Manager",  href: "/hrms/salary-hike",    icon: ArrowUpRight },
    { label: "Birthdays & Anniv.",   href: "/hrms/birthdays",      icon: Gift },
    { label: "Exit & Clearance",     href: "/hrms/exit",           icon: DoorOpen },
    { label: "HR Reminders",         href: "/hrms/reminders",      icon: BellRing },
  ];

  // ── Priority 3 — Premium (HR/Owner only) ───────────────────────────
  const p3Items = [
    { label: "AI Attrition Risk",    href: "/hrms/attrition",      icon: Brain },
    { label: "Performance Board",    href: "/hrms/leaderboard",    icon: Trophy },
    { label: "Self-Service Portal",  href: "/hrms/self-service",   icon: UserCheck },
    { label: "Remote Work Tracker",  href: "/hrms/remote",         icon: Wifi },
    { label: "Org Chart",            href: "/hrms/org-chart",      icon: GitMerge },
  ];

  // ── Admin / settings ────────────────────────────────────────────────
  const adminItems = [
    ...(isOwner || isHRUser ? [{ label: "Assign Team",   href: "/hrms/team-assign", icon: GitBranch }] : []),
    { label: "Helpdesk Tickets", href: "/hrms/tickets",   icon: HelpCircle },
    ...(isOwner || isHRUser ? [{ label: "HRMS Settings", href: "/hrms/settings",    icon: Settings  }] : []),
  ];

  // ── Build nav sections ──────────────────────────────────────────────
  type NavSection = { heading: string; items: { label: string; href: string; icon: React.ElementType }[] };

  const navSections: NavSection[] = isITUser
    ? [{ heading: "IT Modules", items: itItems }]
    : isFinanceUser && !isOwner
    ? [{ heading: "Finance Modules", items: financeItems }]
    : [
        { heading: "Core HR",            items: coreItems  },
        { heading: "Analytics & Tools",  items: p1Items    },
        { heading: "People Insights",    items: p2Items    },
        { heading: "Premium Features",   items: p3Items    },
        { heading: "Admin",              items: adminItems },
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
      <div className="p-3 border-b border-gray-800/80 bg-black/50 flex items-center justify-between">
        <Link href="/hrms" className="flex items-center gap-2 overflow-hidden">
          <MTCoreLogo
            variant="emerald"
            size="sm"
            showText={true}
            collapsed={collapsed}
          />
        </Link>
        {!collapsed && (
          <span className="bg-emerald-500/20 text-emerald-400 text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase shrink-0">
            HRMS
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-grow p-3 space-y-0.5 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.heading} className="mb-2">
            {/* Section heading */}
            {!collapsed && (
              <div className="px-2 pt-3 pb-1 text-[9px] font-black uppercase tracking-widest text-gray-600">
                {section.heading}
              </div>
            )}
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-xs transition mb-0.5 ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30"
                      : "text-gray-400 hover:text-white hover:bg-emerald-500/10"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={15} className={isActive ? "text-white" : "text-emerald-400/80"} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
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
