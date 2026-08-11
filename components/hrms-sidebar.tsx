"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useGlobalContext } from "@/context/global-context";
import {
  Users,
  Clock,
  CalendarDays,
  DollarSign,
  UserPlus,
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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
  FileText,
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
  Layers,
  HeartHandshake
} from "lucide-react";
import MTCoreLogo from "@/components/mt-logo";

export default function HRMSSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, hrEmployees } = useGlobalContext();
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

  // ── Core quick links (Always visible) ───────────────────────────────
  const coreItems = [
    { label: "HR Dashboard",        href: "/hrms",              icon: LayoutDashboard },
    { label: "Employees Directory",  href: "/hrms/employees",   icon: Users },
    { label: "Attendance & Shifts",  href: "/hrms/attendance",  icon: Clock },
    { label: "Leave Applications",   href: "/hrms/leaves",      icon: CalendarDays },
    { label: "Payroll & Payslips",   href: "/hrms/payroll",     icon: DollarSign },
    { label: "Recruitment (ATS)",    href: "/hrms/recruitment", icon: UserPlus },
    { label: "My Team",             href: "/hrms/team",        icon: Network },
  ];

  // ── Priority 1 — Analytics & Operations (Dropdown) ──────────────────
  const p1Items = [
    { label: "HR Letter Generator",  href: "/hrms/letters",        icon: FileText },
    { label: "Employee Analytics",   href: "/hrms/analytics",      icon: BarChart3 },
    { label: "Asset Management",     href: "/hrms/assets",         icon: Package },
    { label: "Disciplinary Records", href: "/hrms/disciplinary",   icon: AlertTriangle },
    { label: "Shift Planner",        href: "/hrms/shift-planner",  icon: CalendarRange },
    { label: "Announcements",        href: "/hrms/announcements",  icon: Megaphone },
    { label: "Document Vault",       href: "/hrms/documents",      icon: FileArchive },
  ];

  // ── Priority 2 — People & Engagement (Dropdown) ─────────────────────
  const p2Items = [
    { label: "Goals & OKR Tracker",  href: "/hrms/goals",          icon: Target },
    { label: "Leave Calendar",       href: "/hrms/leave-calendar", icon: Calendar },
    { label: "Salary Hike Manager",  href: "/hrms/salary-hike",    icon: ArrowUpRight },
    { label: "Birthdays & Anniv.",   href: "/hrms/birthdays",      icon: Gift },
    { label: "Exit & Clearance",     href: "/hrms/exit",           icon: DoorOpen },
    { label: "HR Reminders",         href: "/hrms/reminders",      icon: BellRing },
  ];

  // ── Priority 3 — AI & Advanced Suite (Dropdown) ─────────────────────
  const p3Items = [
    { label: "AI Attrition Risk",    href: "/hrms/attrition",      icon: Brain },
    { label: "Performance Board",    href: "/hrms/leaderboard",    icon: Trophy },
    { label: "Self-Service Portal",  href: "/hrms/self-service",   icon: UserCheck },
    { label: "Remote Work Tracker",  href: "/hrms/remote",         icon: Wifi },
    { label: "Org Chart",            href: "/hrms/org-chart",      icon: GitMerge },
  ];

  // ── Admin / System Settings ─────────────────────────────────────────
  const adminItems = [
    ...(isOwner || isHRUser ? [{ label: "Assign Team",   href: "/hrms/team-assign", icon: GitBranch }] : []),
    { label: "Helpdesk Tickets", href: "/hrms/tickets",   icon: HelpCircle },
    ...(isOwner || isHRUser ? [{ label: "HRMS Settings", href: "/hrms/settings",    icon: Settings  }] : []),
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

  // Dropdown collapse/expand state
  const isP1Active = p1Items.some((i) => pathname === i.href);
  const isP2Active = p2Items.some((i) => pathname === i.href);
  const isP3Active = p3Items.some((i) => pathname === i.href);

  const [openP1, setOpenP1] = useState(isP1Active);
  const [openP2, setOpenP2] = useState(isP2Active);
  const [openP3, setOpenP3] = useState(isP3Active);

  useEffect(() => {
    if (isP1Active) setOpenP1(true);
    if (isP2Active) setOpenP2(true);
    if (isP3Active) setOpenP3(true);
  }, [pathname, isP1Active, isP2Active, isP3Active]);

  return (
    <aside
      className={`relative flex flex-col min-h-screen bg-[#070a0f] border-r border-emerald-500/20 text-gray-300 transition-all duration-300 z-30 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg transition z-40"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
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

      {/* Navigation Links with Sleek Dropdowns */}
      <nav className="flex-grow p-3 space-y-2 overflow-y-auto custom-scrollbar">
        {isITUser ? (
          <div className="space-y-1">
            {!collapsed && (
              <div className="px-2 pt-2 pb-1 text-[9px] font-black uppercase tracking-widest text-gray-500">
                IT Operations
              </div>
            )}
            {itItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-xs transition ${
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
        ) : isFinanceUser && !isOwner ? (
          <div className="space-y-1">
            {!collapsed && (
              <div className="px-2 pt-2 pb-1 text-[9px] font-black uppercase tracking-widest text-gray-500">
                Finance Operations
              </div>
            )}
            {financeItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-xs transition ${
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
        ) : (
          <>
            {/* 1. Core Modules */}
            <div className="space-y-0.5">
              {!collapsed && (
                <div className="px-2 pt-1 pb-1 text-[9px] font-black uppercase tracking-widest text-gray-500">
                  Core HR
                </div>
              )}
              {coreItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-xs transition ${
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

            {/* 2. DROPDOWN: P1 — Analytics & Operations */}
            <div className="pt-2">
              <button
                onClick={() => setOpenP1(!openP1)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-xs transition border ${
                  isP1Active
                    ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
                    : "bg-[#0b0f17] border-gray-800/80 text-gray-300 hover:border-emerald-500/30 hover:text-white"
                }`}
                title={collapsed ? "Analytics & Tools" : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <BarChart3 size={14} />
                  </div>
                  {!collapsed && (
                    <div className="text-left">
                      <div className="leading-tight">Analytics & Ops</div>
                      <div className="text-[9px] text-gray-500 font-mono font-normal">P1 High Impact</div>
                    </div>
                  )}
                </div>
                {!collapsed && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      6
                    </span>
                    <ChevronDown
                      size={13}
                      className={`text-gray-400 transition-transform duration-300 ${openP1 ? "rotate-180 text-emerald-400" : ""}`}
                    />
                  </div>
                )}
              </button>

              {/* Sub-items */}
              {openP1 && !collapsed && (
                <div className="mt-1 ml-2 pl-3 border-l border-emerald-500/20 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  {p1Items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                          isActive
                            ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 shadow-sm"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Icon size={13} className={isActive ? "text-emerald-300" : "text-gray-500"} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. DROPDOWN: P2 — People & Engagement */}
            <div className="pt-1">
              <button
                onClick={() => setOpenP2(!openP2)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-xs transition border ${
                  isP2Active
                    ? "bg-sky-950/30 border-sky-500/30 text-sky-300"
                    : "bg-[#0b0f17] border-gray-800/80 text-gray-300 hover:border-sky-500/30 hover:text-white"
                }`}
                title={collapsed ? "People & Engagement" : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded-lg bg-sky-500/10 text-sky-400">
                    <HeartHandshake size={14} />
                  </div>
                  {!collapsed && (
                    <div className="text-left">
                      <div className="leading-tight">People & Goals</div>
                      <div className="text-[9px] text-gray-500 font-mono font-normal">P2 Medium Impact</div>
                    </div>
                  )}
                </div>
                {!collapsed && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400">
                      6
                    </span>
                    <ChevronDown
                      size={13}
                      className={`text-gray-400 transition-transform duration-300 ${openP2 ? "rotate-180 text-sky-400" : ""}`}
                    />
                  </div>
                )}
              </button>

              {/* Sub-items */}
              {openP2 && !collapsed && (
                <div className="mt-1 ml-2 pl-3 border-l border-sky-500/20 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  {p2Items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                          isActive
                            ? "bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30 shadow-sm"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Icon size={13} className={isActive ? "text-sky-300" : "text-gray-500"} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. DROPDOWN: P3 — Premium AI & Work Suite */}
            <div className="pt-1">
              <button
                onClick={() => setOpenP3(!openP3)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-xs transition border ${
                  isP3Active
                    ? "bg-purple-950/30 border-purple-500/30 text-purple-300"
                    : "bg-[#0b0f17] border-gray-800/80 text-gray-300 hover:border-purple-500/30 hover:text-white"
                }`}
                title={collapsed ? "Premium & AI Suite" : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded-lg bg-purple-500/10 text-purple-400">
                    <Sparkles size={14} />
                  </div>
                  {!collapsed && (
                    <div className="text-left">
                      <div className="leading-tight">AI & Premium</div>
                      <div className="text-[9px] text-purple-400/80 font-mono font-bold uppercase tracking-wider">P3 Suite</div>
                    </div>
                  )}
                </div>
                {!collapsed && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      PRO
                    </span>
                    <ChevronDown
                      size={13}
                      className={`text-gray-400 transition-transform duration-300 ${openP3 ? "rotate-180 text-purple-400" : ""}`}
                    />
                  </div>
                )}
              </button>

              {/* Sub-items */}
              {openP3 && !collapsed && (
                <div className="mt-1 ml-2 pl-3 border-l border-purple-500/20 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  {p3Items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                          isActive
                            ? "bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 shadow-sm"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Icon size={13} className={isActive ? "text-purple-300" : "text-gray-500"} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 5. System Administration */}
            <div className="pt-2 space-y-0.5 border-t border-gray-800/80">
              {!collapsed && (
                <div className="px-2 pt-1 pb-1 text-[9px] font-black uppercase tracking-widest text-gray-500">
                  System Admin
                </div>
              )}
              {adminItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-xs transition ${
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
          </>
        )}
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
          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 transition border border-red-500/20"
          title="Sign Out of HRMS"
        >
          <LogOut size={14} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
