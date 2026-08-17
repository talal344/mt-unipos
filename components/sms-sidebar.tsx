"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSMS, SMSRole } from "@/context/sms-context";
import MTCoreLogo from "@/components/mt-logo";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck2,
  Award,
  FileText,
  CreditCard,
  Clock,
  BookOpen,
  Bus,
  Library,
  Settings,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  MessageSquare,
  ShieldAlert,
  ScanLine,
  UserPlus,
  Trophy,
  CalendarRange,
  BedDouble,
  Stethoscope,
  Sparkles,
  FileCheck,
  Target,
  DollarSign,
  BrainCircuit,
  GraduationCap as AlumniCap,
  Layers,
  FolderOpen
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  badge?: string;
}

interface NavGroup {
  id: string;
  groupTitle: string;
  icon: any;
  color: string;
  items: NavItem[];
}

export default function SMSSidebar() {
  const pathname = usePathname();
  const {
    theme,
    activeRole,
    setActiveRole,
    campuses,
    selectedCampus,
    setSelectedCampus,
    sessions,
    selectedSession,
    setSelectedSession
  } = useSMS();

  const isLight = theme === "light";

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Accordion open/close state for all sidebar groups (Closed by default)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Auto-expand group if active route is inside it
  useEffect(() => {
    navGroups.forEach((group) => {
      if (group.items.some((i) => pathname === i.href || (i.href !== "/sms" && pathname.startsWith(i.href)))) {
        setOpenGroups((prev) => ({ ...prev, [group.id]: true }));
      }
    });
  }, [pathname]);

  const roleColors: Record<SMSRole, { bg: string; text: string; border: string; label: string }> = {
    Owner: {
      bg: isLight ? "bg-amber-50" : "bg-amber-500/10",
      text: isLight ? "text-amber-800" : "text-amber-400",
      border: isLight ? "border-amber-300" : "border-amber-500/30",
      label: "👑 Owner / Director"
    },
    Principal: {
      bg: isLight ? "bg-sky-50" : "bg-sky-500/10",
      text: isLight ? "text-sky-800" : "text-sky-400",
      border: isLight ? "border-sky-300" : "border-sky-500/30",
      label: "👔 Principal / Head"
    },
    Teacher: {
      bg: isLight ? "bg-emerald-50" : "bg-emerald-500/10",
      text: isLight ? "text-emerald-800" : "text-emerald-400",
      border: isLight ? "border-emerald-300" : "border-emerald-500/30",
      label: "👩‍🏫 Faculty / Teacher"
    },
    Student: {
      bg: isLight ? "bg-purple-50" : "bg-purple-500/10",
      text: isLight ? "text-purple-800" : "text-purple-400",
      border: isLight ? "border-purple-300" : "border-purple-500/30",
      label: "🎒 Student Portal"
    },
    Parent: {
      bg: isLight ? "bg-pink-50" : "bg-pink-500/10",
      text: isLight ? "text-pink-800" : "text-pink-400",
      border: isLight ? "border-pink-300" : "border-pink-500/30",
      label: "👨‍👩‍👧 Parent Portal"
    },
    HR: {
      bg: isLight ? "bg-indigo-50" : "bg-indigo-500/10",
      text: isLight ? "text-indigo-800" : "text-indigo-400",
      border: isLight ? "border-indigo-300" : "border-indigo-500/30",
      label: "👥 School HR"
    },
    Finance: {
      bg: isLight ? "bg-teal-50" : "bg-teal-500/10",
      text: isLight ? "text-teal-800" : "text-teal-400",
      border: isLight ? "border-teal-300" : "border-teal-500/30",
      label: "💳 Accounts & Fees"
    }
  };

  const navGroups: NavGroup[] = [
    {
      id: "hub",
      groupTitle: "Command & Comms",
      icon: LayoutDashboard,
      color: isLight ? "text-sky-600" : "text-sky-400",
      items: [
        { href: "/sms", label: "Executive Dashboard", icon: LayoutDashboard },
        { href: "/sms/users", label: "User Accounts & Logins", icon: Users, badge: "Auth" },
        { href: "/sms/whatsapp", label: "WhatsApp Broadcast Hub", icon: MessageSquare, badge: "Auto" }
      ]
    },
    {
      id: "students",
      groupTitle: "Students & Admissions",
      icon: Users,
      color: isLight ? "text-indigo-600" : "text-indigo-400",
      items: [
        { href: "/sms/students", label: "Student 360 & PVC Cards", icon: Users, badge: "Core" },
        { href: "/sms/admissions-online", label: "Online Admissions & Merit", icon: UserPlus, badge: "CRM" },
        { href: "/sms/certificates", label: "Certificates & Character", icon: FileCheck, badge: "Print" }
      ]
    },
    {
      id: "academics",
      groupTitle: "Academics & Operations",
      icon: Building2,
      color: isLight ? "text-emerald-600" : "text-emerald-400",
      items: [
        { href: "/sms/classes", label: "Classes & Student Allocation", icon: Building2, badge: "Alloc" },
        { href: "/sms/teachers", label: "Teachers Faculty Matrix", icon: GraduationCap, badge: "Schedule" },
        { href: "/sms/attendance", label: "Morning Live Attendance", icon: CalendarCheck2 },
        { href: "/sms/lesson-planner", label: "Lesson Plan & Syllabus", icon: Target, badge: "Syllabus" },
        { href: "/sms/timetable", label: "Class Timetable & Matrix", icon: Clock },
        { href: "/sms/lms", label: "Digital LMS & Daily Diary", icon: BookOpen }
      ]
    },
    {
      id: "exams",
      groupTitle: "Exams & AI Grading",
      icon: Award,
      color: isLight ? "text-purple-600" : "text-purple-400",
      items: [
        { href: "/sms/leaderboard", label: "Positions & Hall of Fame", icon: Trophy, badge: "1st/2nd" },
        { href: "/sms/exams", label: "Examinations & A4 Cards", icon: Award },
        { href: "/sms/omr-grader", label: "AI OMR Bubble Sheet Grader", icon: ScanLine, badge: "AI OMR" },
        { href: "/sms/paper-generator", label: "Board Exam Paper Builder", icon: FileText, badge: "Builder" },
        { href: "/sms/ai-advisor", label: "AI Academic Risk Advisor", icon: BrainCircuit, badge: "Predict" }
      ]
    },
    {
      id: "finance",
      groupTitle: "Finance & Payroll",
      icon: CreditCard,
      color: isLight ? "text-teal-600" : "text-teal-400",
      items: [
        { href: "/sms/fees", label: "3-Copy Challan & Cashier", icon: CreditCard },
        { href: "/sms/faculty-payroll", label: "Faculty Payroll & Payslips", icon: DollarSign, badge: "Salary" }
      ]
    },
    {
      id: "campus",
      groupTitle: "Campus Facilities & Life",
      icon: Trophy,
      color: isLight ? "text-amber-600" : "text-amber-400",
      items: [
        { href: "/sms/house-system", label: "House Points & Merits", icon: Trophy },
        { href: "/sms/ptm", label: "PTM Slot Scheduler", icon: CalendarRange },
        { href: "/sms/hostel", label: "Hostel & Mess Dining", icon: BedDouble },
        { href: "/sms/clinic", label: "School Clinic & Health", icon: Stethoscope },
        { href: "/sms/transport", label: "Transport Fleet & GPS", icon: Bus },
        { href: "/sms/library", label: "Library Catalog", icon: Library },
        { href: "/sms/alumni", label: "Alumni & Old Students", icon: AlumniCap },
        { href: "/sms/settings", label: "SMS ERP Configuration", icon: Settings }
      ]
    }
  ];

  // Strict Role-Based Access Control Filtering (RBAC)
  const allowedGroups = navGroups
    .map((group) => {
      const allowedItems = group.items.filter((item) => {
        // Owner & Principal have 100% full access
        if (activeRole === "Owner" || activeRole === "Principal") return true;

        if (activeRole === "Student") {
          const studentAllowed = [
            "/sms",
            "/sms/lms",
            "/sms/attendance",
            "/sms/exams",
            "/sms/fees",
            "/sms/timetable",
            "/sms/leaderboard",
            "/sms/certificates",
            "/sms/library",
            "/sms/transport",
            "/sms/house-system"
          ];
          return studentAllowed.includes(item.href);
        }

        if (activeRole === "Parent") {
          const parentAllowed = [
            "/sms",
            "/sms/students",
            "/sms/fees",
            "/sms/exams",
            "/sms/attendance",
            "/sms/ptm",
            "/sms/leaderboard",
            "/sms/transport"
          ];
          return parentAllowed.includes(item.href);
        }

        if (activeRole === "Teacher") {
          const teacherAllowed = [
            "/sms",
            "/sms/classes",
            "/sms/teachers",
            "/sms/attendance",
            "/sms/exams",
            "/sms/lesson-planner",
            "/sms/paper-generator",
            "/sms/omr-grader",
            "/sms/timetable",
            "/sms/lms",
            "/sms/ptm",
            "/sms/leaderboard"
          ];
          return teacherAllowed.includes(item.href);
        }

        if (activeRole === "Finance") {
          const financeAllowed = [
            "/sms",
            "/sms/fees",
            "/sms/faculty-payroll",
            "/sms/hostel",
            "/sms/transport"
          ];
          return financeAllowed.includes(item.href);
        }

        if (activeRole === "HR") {
          const hrAllowed = [
            "/sms",
            "/sms/teachers",
            "/sms/attendance",
            "/sms/faculty-payroll",
            "/sms/clinic",
            "/sms/hostel",
            "/sms/transport",
            "/sms/users"
          ];
          return hrAllowed.includes(item.href);
        }

        return false;
      });

      return {
        ...group,
        items: allowedItems
      };
    })
    .filter((group) => group.items.length > 0);

  return (
    <aside className={`w-64 transition-colors duration-200 ${
      isLight ? "bg-white border-r border-slate-200 text-slate-900 shadow-sm" : "bg-[#080d14] border-r border-[#1e293b] text-white"
    } flex flex-col justify-between shrink-0 min-h-screen font-sans select-none`}>
      {/* Top Section */}
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className={`p-4 border-b ${isLight ? "border-slate-200" : "border-[#1e293b]"} flex items-center justify-between`}>
          <Link href="/sms" className="flex items-center gap-3 group">
            <MTCoreLogo
              variant="emerald"
              size="md"
              shape="rectangle"
              theme={isLight ? "light" : "dark"}
              showText={true}
            />
          </Link>
        </div>

        {/* Multi-Role Switcher */}
        <div className={`p-3 border-b ${isLight ? "border-slate-200 bg-slate-50" : "border-[#1e293b] bg-black/30"}`}>
          <div className={`text-[9px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1.5 flex items-center justify-between`}>
            <span>Active Perspective</span>
            <span className="text-[9px] text-sky-500 font-mono">RBAC</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs font-bold transition ${roleColors[activeRole].bg} ${roleColors[activeRole].border} ${roleColors[activeRole].text}`}
            >
              <span>{roleColors[activeRole].label}</span>
              <ChevronDown size={14} className={`transition transform ${roleDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {roleDropdownOpen && (
              <div className={`absolute top-full left-0 right-0 mt-1.5 ${
                isLight ? "bg-white border-slate-200 shadow-2xl text-slate-900" : "bg-[#0e1624] border-[#1e293b] shadow-2xl text-white"
              } border rounded-xl z-50 p-1 space-y-0.5 animate-fade-in-up`}>
                {(["Owner", "Principal", "Teacher", "Student", "Parent", "HR", "Finance"] as SMSRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setActiveRole(r);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-between ${
                      activeRole === r
                        ? "bg-sky-600 text-white"
                        : isLight
                        ? "text-slate-700 hover:bg-slate-100"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>{roleColors[r].label}</span>
                    {activeRole === r && <ShieldCheck size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Campus & Session Quick Selector */}
        <div className={`p-3 border-b ${isLight ? "border-slate-200" : "border-[#1e293b]"} space-y-2 text-xs`}>
          <div>
            <div className={`flex justify-between text-[9px] font-bold ${isLight ? "text-slate-500" : "text-gray-400"} uppercase mb-1`}>
              <span>Campus Branch</span>
            </div>
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className={`w-full ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-black/60 border-[#1e293b] text-white"
              } border p-1.5 rounded-lg text-[11px] font-semibold focus:outline-none focus:border-sky-500`}
            >
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className={`flex justify-between text-[9px] font-bold ${isLight ? "text-slate-500" : "text-gray-400"} uppercase mb-1`}>
              <span>Academic Session</span>
            </div>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className={`w-full ${
                isLight ? "bg-slate-50 border-slate-200 text-emerald-700" : "bg-black/60 border-[#1e293b] text-emerald-400"
              } border p-1.5 rounded-lg text-[11px] font-mono font-bold focus:outline-none focus:border-emerald-500`}
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.isCurrent ? "★ Active" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Accordion Collapsible Navigation Groups (Role-Based Filtered) */}
        <nav className="p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-340px)] custom-scrollbar">
          {allowedGroups.map((group) => {
            const isOpen = !!openGroups[group.id];
            const hasActiveChild = group.items.some(
              (i) => pathname === i.href || (i.href !== "/sms" && pathname.startsWith(i.href))
            );
            const GroupIcon = group.icon;

            return (
              <div key={group.id} className="rounded-xl overflow-hidden border border-transparent transition">
                {/* Accordion Header Button */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-black tracking-wide uppercase transition rounded-xl ${
                    hasActiveChild
                      ? isLight
                        ? "bg-slate-100 text-slate-950 font-black shadow-sm"
                        : "bg-white/[0.04] text-white"
                      : isLight
                      ? "text-slate-800 hover:text-slate-950 hover:bg-slate-100 font-extrabold"
                      : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GroupIcon size={14} className={group.color} />
                    <span className="text-[11px]">{group.groupTitle}</span>
                  </div>
                  <ChevronDown
                    size={13}
                    className={`${isLight ? "text-slate-400" : "text-gray-500"} transition-transform duration-200 ${
                      isOpen ? "rotate-0 text-sky-600" : "-rotate-90"
                    }`}
                  />
                </button>

                {/* Dropdown Items (Collapsible body) */}
                {isOpen && (
                  <div className={`mt-1 pl-2 space-y-0.5 border-l-2 ${isLight ? "border-slate-200" : "border-gray-800/60"} ml-3.5 mb-1 animate-fade-in-up`}>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        pathname === item.href || (item.href !== "/sms" && pathname.startsWith(item.href));

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                            isActive
                              ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-bold shadow-md shadow-sky-600/20"
                              : isLight
                              ? "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                              : "text-gray-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon size={14} className={isActive ? "text-white" : isLight ? "text-slate-500" : "text-gray-400"} />
                            <span className="text-[11px]">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span
                              className={`text-[8px] font-black px-1.5 py-0.2 rounded uppercase ${
                                isActive
                                  ? "bg-white/20 text-white"
                                  : item.badge.includes("OMR") || item.badge === "Auto"
                                  ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/40"
                                  : "bg-sky-500/20 text-sky-600 border border-sky-500/40"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer Return Navigation */}
      <div className={`p-3 border-t ${isLight ? "border-slate-200 bg-slate-50" : "border-[#1e293b] bg-black/40"} space-y-2`}>
        <Link
          href="/"
          className={`flex items-center justify-between p-2.5 rounded-xl ${
            isLight ? "bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 border border-slate-200" : "bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5"
          } text-xs font-bold transition group`}
        >
          <div className="flex items-center gap-2">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition" />
            <span>Main Platform</span>
          </div>
          <span className={`text-[9px] ${isLight ? "text-slate-400" : "text-gray-500"} uppercase`}>POS &amp; HRMS</span>
        </Link>
      </div>
    </aside>
  );
}
