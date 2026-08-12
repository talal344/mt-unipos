"use client";

import React, { useMemo, useState } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import {
  useGlobalContext,
  calculateDesignationRankAndGrade,
  isEligibleForDepartmentHead,
  getDepartmentHeadEmployee,
  HREmployee,
  HRDepartment
} from "@/context/global-context";
import {
  Network,
  Search,
  Users,
  ZoomIn,
  ZoomOut,
  Maximize,
  Crown,
  Building2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Mail,
  Phone,
  Briefcase,
  Layers,
  Sparkles,
  Plus,
  Edit2,
  X,
  CheckCircle2,
  ChevronRight,
  UserCheck,
  Check
} from "lucide-react";

interface TreeNode {
  id: string;
  type: "owner" | "multi_head" | "dept_head" | "open_dept" | "employee";
  name: string;
  title: string;
  code?: string;
  email?: string;
  phone?: string;
  department?: string;
  headedDepartments?: string[];
  rank?: number;
  grade?: string;
  status?: string;
  avatar?: string;
  empRef?: HREmployee;
  children: TreeNode[];
  collapsed?: boolean;
}

export default function OrgChartPage() {
  const {
    currentUser,
    hrEmployees,
    hrDepartments,
    hrDesignations,
    assignDepartmentHead
  } = useGlobalContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("All");
  const [zoom, setZoom] = useState(1);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [selectedEmployeeDetail, setSelectedEmployeeDetail] = useState<HREmployee | null>(null);
  const [showManageHeadsModal, setShowManageHeadsModal] = useState(false);
  const [headAssignments, setHeadAssignments] = useState<Record<string, string>>({}); // deptName -> empId

  // Department color map
  const deptColors = useMemo(() => {
    const palette = [
      { border: "border-teal-500", text: "text-teal-400", bg: "bg-teal-500/10", badge: "border-teal-500/30 text-teal-300" },
      { border: "border-sky-500", text: "text-sky-400", bg: "bg-sky-500/10", badge: "border-sky-500/30 text-sky-300" },
      { border: "border-amber-500", text: "text-amber-400", bg: "bg-amber-500/10", badge: "border-amber-500/30 text-amber-300" },
      { border: "border-purple-500", text: "text-purple-400", bg: "bg-purple-500/10", badge: "border-purple-500/30 text-purple-300" },
      { border: "border-rose-500", text: "text-rose-400", bg: "bg-rose-500/10", badge: "border-rose-500/30 text-rose-300" },
      { border: "border-indigo-500", text: "text-indigo-400", bg: "bg-indigo-500/10", badge: "border-indigo-500/30 text-indigo-300" },
      { border: "border-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10", badge: "border-emerald-500/30 text-emerald-300" }
    ];
    const map: Record<string, typeof palette[0]> = {};
    hrDepartments.forEach((d, i) => {
      map[d.name] = palette[i % palette.length];
    });
    return map;
  }, [hrDepartments]);

  // Open Manage Heads Modal with current assignments
  const handleOpenManageHeads = () => {
    const initialMap: Record<string, string> = {};
    hrDepartments.forEach((dept) => {
      const head = getDepartmentHeadEmployee(dept.name, hrEmployees, hrDesignations, dept);
      initialMap[dept.name] = head ? head.id : "";
    });
    setHeadAssignments(initialMap);
    setShowManageHeadsModal(true);
  };

  const handleSaveHeadAssignments = () => {
    // Group selected departments per employee
    const empToDepts: Record<string, string[]> = {};
    Object.entries(headAssignments).forEach(([deptName, empId]) => {
      if (empId) {
        if (!empToDepts[empId]) empToDepts[empId] = [];
        empToDepts[empId].push(deptName);
      }
    });

    // Save each eligible employee's assignments
    hrEmployees
      .filter((e) => isEligibleForDepartmentHead(e.designation))
      .forEach((emp) => {
        const assignedDepts = empToDepts[emp.id] || [];
        assignDepartmentHead(emp.id, assignedDepts);
      });

    setShowManageHeadsModal(false);
  };

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ─── BUILD THE COMPLETE CORPORATE HIERARCHICAL TREE ─────────────────────────
  const corporateTree: TreeNode = useMemo(() => {
    // 1. Apex Root: Company Owner
    const ownerName = currentUser?.name || currentUser?.businessName?.split(" ")?.[0] || "Company Owner";
    const businessTitle = currentUser?.businessName || "MT UniPOS Enterprise";

    const ownerNode: TreeNode = {
      id: "ROOT-OWNER",
      type: "owner",
      name: ownerName,
      title: "Company Owner / Executive Founder",
      code: "APEX-001",
      email: currentUser?.email || "owner@mtcore.xyz",
      department: businessTitle,
      rank: 0,
      grade: "FOUNDER",
      status: "Active",
      avatar: currentUser?.avatar,
      children: []
    };

    // Filter departments if filter selected
    const activeDepts = selectedDeptFilter === "All"
      ? hrDepartments
      : hrDepartments.filter((d) => d.name === selectedDeptFilter);

    // Map each department to its head employee
    const deptHeadMap = new Map<string, HREmployee | null>();
    activeDepts.forEach((dept) => {
      const head = getDepartmentHeadEmployee(dept.name, hrEmployees, hrDesignations, dept);
      deptHeadMap.set(dept.name, head);
    });

    // Group departments by unique head employee
    // Case A: A Director/Manager heading MULTIPLE departments
    // Case B: A Director/Manager heading a SINGLE department
    // Case C: A department with NO head assigned yet (Open HOD)
    const headToDepts = new Map<string, { head: HREmployee; depts: HRDepartment[] }>();
    const unheadedDepts: HRDepartment[] = [];

    activeDepts.forEach((dept) => {
      const head = deptHeadMap.get(dept.name);
      if (head) {
        if (!headToDepts.has(head.id)) {
          headToDepts.set(head.id, { head, depts: [dept] });
        } else {
          headToDepts.get(head.id)!.depts.push(dept);
        }
      } else {
        unheadedDepts.push(dept);
      }
    });

    // Helper: Build subordinates sub-tree within a department
    const buildDepartmentSubordinatesTree = (
      deptName: string,
      headEmpId?: string
    ): TreeNode[] => {
      const deptMembers = hrEmployees.filter(
        (e) => e.department === deptName && e.status === "Active" && e.id !== headEmpId
      );

      if (deptMembers.length === 0) return [];

      // Map of nodes
      const nodeMap = new Map<string, TreeNode>();
      deptMembers.forEach((emp) => {
        const desgInfo = hrDesignations.find((d) => d.title.toLowerCase() === emp.designation.toLowerCase());
        const rankAndGrade = desgInfo && desgInfo.rank ? desgInfo : calculateDesignationRankAndGrade(emp.designation);

        nodeMap.set(emp.id, {
          id: `EMP-${emp.id}`,
          type: "employee",
          name: emp.name,
          title: emp.designation,
          code: emp.employeeCode,
          email: emp.email,
          phone: emp.phone,
          department: emp.department,
          rank: rankAndGrade.rank,
          grade: rankAndGrade.grade,
          status: emp.status,
          avatar: emp.avatar,
          empRef: emp,
          children: []
        });
      });

      // Construct reporting hierarchy
      const directDeptRoots: TreeNode[] = [];

      deptMembers.forEach((emp) => {
        const node = nodeMap.get(emp.id)!;
        if (emp.reportsTo && nodeMap.has(emp.reportsTo) && emp.reportsTo !== headEmpId) {
          nodeMap.get(emp.reportsTo)!.children.push(node);
        } else {
          directDeptRoots.push(node);
        }
      });

      // Sort direct subordinates by Rank (e.g. Asst. Manager -> Supervisor -> Team Lead -> Officer -> Intern)
      directDeptRoots.sort((a, b) => (a.rank || 9) - (b.rank || 9));

      return directDeptRoots;
    };

    // 2. Attach Department Heads under Owner
    headToDepts.forEach(({ head, depts }) => {
      const desgInfo = hrDesignations.find((d) => d.title.toLowerCase() === head.designation.toLowerCase());
      const rankAndGrade = desgInfo && desgInfo.rank ? desgInfo : calculateDesignationRankAndGrade(head.designation);
      const isMultiHead = depts.length > 1;

      if (isMultiHead) {
        // MULTI-DEPARTMENT HEAD NODE
        const multiHeadNode: TreeNode = {
          id: `MULTI-HEAD-${head.id}`,
          type: "multi_head",
          name: head.name,
          title: head.designation,
          code: head.employeeCode,
          email: head.email,
          phone: head.phone,
          headedDepartments: depts.map((d) => d.name),
          department: depts.map((d) => d.name).join(", "),
          rank: rankAndGrade.rank,
          grade: rankAndGrade.grade,
          status: head.status,
          avatar: head.avatar,
          empRef: head,
          children: []
        };

        // For each headed department, create a department branch under this shared head
        depts.forEach((dept) => {
          const deptSubordinates = buildDepartmentSubordinatesTree(dept.name, head.id);
          const deptBranchNode: TreeNode = {
            id: `DEPT-BRANCH-${dept.id}`,
            type: "open_dept",
            name: `${dept.name}`,
            title: `Operational Division (${dept.code})`,
            code: dept.code,
            department: dept.name,
            rank: rankAndGrade.rank,
            grade: "DIVISION",
            status: "Active",
            children: deptSubordinates
          };
          multiHeadNode.children.push(deptBranchNode);
        });

        ownerNode.children.push(multiHeadNode);
      } else {
        // SINGLE DEPARTMENT HEAD NODE
        const singleDept = depts[0];
        const deptSubordinates = buildDepartmentSubordinatesTree(singleDept.name, head.id);

        const singleHeadNode: TreeNode = {
          id: `HEAD-${head.id}-${singleDept.id}`,
          type: "dept_head",
          name: head.name,
          title: head.designation,
          code: head.employeeCode,
          email: head.email,
          phone: head.phone,
          department: singleDept.name,
          headedDepartments: [singleDept.name],
          rank: rankAndGrade.rank,
          grade: rankAndGrade.grade,
          status: head.status,
          avatar: head.avatar,
          empRef: head,
          children: deptSubordinates
        };

        ownerNode.children.push(singleHeadNode);
      }
    });

    // 3. Attach Unheaded / Open Departments directly under Owner
    unheadedDepts.forEach((dept) => {
      const deptSubordinates = buildDepartmentSubordinatesTree(dept.name);

      const openDeptNode: TreeNode = {
        id: `OPEN-DEPT-${dept.id}`,
        type: "open_dept",
        name: `${dept.name}`,
        title: "Direct Company Owner Supervision",
        code: dept.code,
        department: dept.name,
        rank: 2,
        grade: "DIRECT-OPS",
        status: "Active",
        children: deptSubordinates
      };

      ownerNode.children.push(openDeptNode);
    });

    return ownerNode;
  }, [currentUser, hrEmployees, hrDepartments, hrDesignations, selectedDeptFilter]);

  // ─── RENDER AN INDIVIDUAL ORG NODE ──────────────────────────────────────────
  const renderNode = (node: TreeNode) => {
    const isOwner = node.type === "owner";
    const isMultiHead = node.type === "multi_head";
    const isDeptHead = node.type === "dept_head";
    const isOpenDept = node.type === "open_dept";
    const isEmployee = node.type === "employee";

    const isCollapsed = collapsedNodes[node.id];
    const deptStyle = deptColors[node.department || ""] || {
      border: "border-gray-700",
      text: "text-gray-400",
      bg: "bg-gray-800/40",
      badge: "border-gray-700 text-gray-400"
    };

    const isMatch =
      searchQuery &&
      (node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (node.department && node.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (node.code && node.code.toLowerCase().includes(searchQuery.toLowerCase())));

    return (
      <div key={node.id} className="flex flex-col items-center relative org-node select-none">
        {/* Node Card Box */}
        <div
          onClick={() => {
            if (node.empRef) setSelectedEmployeeDetail(node.empRef);
          }}
          className={`
            relative z-10 transition-all duration-300 rounded-2xl p-4 shadow-2xl flex flex-col items-center text-center cursor-pointer group
            ${
              isOwner
                ? "w-72 bg-gradient-to-b from-[#161208] via-[#0c0d12] to-[#06080d] border-2 border-amber-400/90 shadow-[0_0_30px_rgba(245,158,11,0.25)] hover:border-amber-300 hover:scale-105"
                : isMultiHead
                ? "w-64 bg-gradient-to-b from-[#180f24] via-[#0e0c18] to-[#07080f] border-2 border-purple-400/90 shadow-[0_0_25px_rgba(168,85,247,0.2)] hover:border-purple-300 hover:scale-105"
                : isDeptHead
                ? `w-60 bg-[#0a0e17] border-t-4 ${deptStyle.border} border-l border-r border-b border-gray-800 hover:border-emerald-500/60 hover:scale-105`
                : isOpenDept
                ? "w-56 bg-[#080d16] border-2 border-dashed border-sky-500/50 hover:border-sky-400 hover:scale-105"
                : `w-52 bg-[#090d14] border-t-2 ${deptStyle.border} border-l border-r border-b border-gray-800/90 hover:border-gray-600 hover:scale-105`
            }
            ${isMatch ? "ring-4 ring-white scale-110 shadow-[0_0_35px_rgba(255,255,255,0.4)]" : ""}
          `}
        >
          {/* Header Crown / Rank Badge */}
          {isOwner ? (
            <div className="absolute -top-3.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-amber-500/30">
              <Crown size={11} className="fill-black" />
              <span>Company Owner &amp; Apex Leader</span>
            </div>
          ) : isMultiHead ? (
            <div className="absolute -top-3.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-purple-900/40">
              <Crown size={11} className="text-amber-300 fill-amber-300" />
              <span>Multi-Dept Head ({node.headedDepartments?.length || 2})</span>
            </div>
          ) : isDeptHead ? (
            <div className={`absolute -top-3 px-2 py-0.5 rounded-full bg-black border ${deptStyle.border} ${deptStyle.text} text-[8px] font-black uppercase tracking-wider flex items-center gap-1`}>
              <ShieldCheck size={10} />
              <span>Head of Department</span>
            </div>
          ) : isOpenDept ? (
            <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-sky-950 border border-sky-500/40 text-sky-300 text-[8px] font-black uppercase tracking-wider">
              <span>Operational Division</span>
            </div>
          ) : (
            <div className="absolute -top-2.5 right-3 px-1.5 py-0.2 rounded bg-black/60 border border-gray-800 text-[8px] font-mono text-gray-400">
              {node.grade || "E-1"}
            </div>
          )}

          {/* Avatar Icon */}
          <div className="mt-1">
            {isOwner ? (
              node.avatar || currentUser?.avatar ? (
                <img
                  src={node.avatar || currentUser?.avatar}
                  alt={node.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 to-yellow-600/20 border-2 border-amber-400 text-amber-300 flex items-center justify-center font-black text-xl shadow-inner">
                  👑
                </div>
              )
            ) : isMultiHead ? (
              node.avatar || node.empRef?.avatar ? (
                <img
                  src={node.avatar || node.empRef?.avatar}
                  alt={node.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-400 shadow-md"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border-2 border-purple-400 text-purple-200 flex items-center justify-center font-black text-lg shadow-inner">
                  {node.name.charAt(0)}
                </div>
              )
            ) : isOpenDept ? (
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center font-black text-sm">
                <Building2 size={18} />
              </div>
            ) : node.avatar || node.empRef?.avatar ? (
              <img
                src={node.avatar || node.empRef?.avatar}
                alt={node.name}
                className={`w-10 h-10 rounded-xl object-cover border ${deptStyle.border} shadow-sm`}
              />
            ) : (
              <div className={`w-10 h-10 rounded-xl bg-black border ${deptStyle.border} ${deptStyle.text} flex items-center justify-center font-black text-sm`}>
                {node.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Name & Title */}
          <div className="mt-2 w-full">
            <p className={`font-black truncate ${isOwner ? "text-base text-amber-200" : isMultiHead ? "text-sm text-purple-100" : "text-xs text-white"}`}>
              {node.name}
            </p>
            <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">
              {node.title}
            </p>

            {node.code && (
              <p className="text-[9px] font-mono text-emerald-400 mt-0.5">
                {node.code}
              </p>
            )}

            {/* Multi Department Badges */}
            {isMultiHead && node.headedDepartments && (
              <div className="mt-2 pt-2 border-t border-purple-500/20 flex flex-wrap gap-1 justify-center">
                {node.headedDepartments.map((deptName) => (
                  <span
                    key={deptName}
                    className="px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-purple-200 text-[8px] font-bold"
                  >
                    {deptName}
                  </span>
                ))}
              </div>
            )}

            {/* Single Department Badge */}
            {!isOwner && !isMultiHead && node.department && (
              <div className="mt-1.5">
                <span className={`inline-block text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 border ${deptStyle.badge}`}>
                  {node.department}
                </span>
              </div>
            )}
          </div>

          {/* Subordinates Collapse Toggle */}
          {node.children && node.children.length > 0 && (
            <button
              onClick={(e) => toggleCollapse(node.id, e)}
              className="mt-2.5 px-2 py-0.5 rounded-full bg-black/80 hover:bg-gray-800 border border-gray-700 text-[9px] font-mono text-gray-300 flex items-center gap-1 transition"
              title={isCollapsed ? "Expand direct reports" : "Collapse direct reports"}
            >
              <Users size={10} className="text-emerald-400" />
              <span>{node.children.length} {node.children.length === 1 ? "branch" : "branches"}</span>
              {isCollapsed ? <ChevronDown size={10} /> : <ChevronUp size={10} />}
            </button>
          )}
        </div>

        {/* Child Subtree Lines & Nodes */}
        {node.children && node.children.length > 0 && !isCollapsed && (
          <div className="relative pt-8">
            {/* Vertical Line down from parent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-gray-600 to-gray-700"></div>

            <div className="flex justify-center gap-6 sm:gap-10 relative">
              {/* Horizontal Connecting Bar */}
              {node.children.length > 1 && (
                <div
                  className="absolute top-0 h-0.5 bg-gray-700"
                  style={{
                    left: "calc(10% + 10px)",
                    right: "calc(10% + 10px)"
                  }}
                ></div>
              )}

              {node.children.map((child) => (
                <div key={child.id} className="relative">
                  {/* Vertical Line down to child */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gray-700"></div>
                  {renderNode(child)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─── ELIGIBLE LEADERS FOR HEAD OF DEPARTMENT (DIRECTOR / MANAGER) ───────────
  const eligibleLeaders = useMemo(() => {
    return hrEmployees.filter((e) => isEligibleForDepartmentHead(e.designation) && e.status === "Active");
  }, [hrEmployees]);

  return (
    <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans overflow-hidden">
      <HRMSSidebar />

      <main className="flex-grow flex flex-col h-screen overflow-hidden">
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 bg-[#070b12] z-20 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
                <Network size={20} />
              </div>
              <div>
                <h1 className="text-lg font-black text-white flex items-center gap-2">
                  <span>Organizational Hierarchy &amp; Reporting Tree</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold uppercase tracking-wider">
                    Apex Owner &rarr; Heads &rarr; Subordinates
                  </span>
                </h1>
                <p className="text-[11px] text-gray-400">
                  Interactive corporate reporting structure with multi-department leadership support.
                </p>
              </div>
            </div>
          </div>

          {/* Actions & Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Manage Department Heads Button */}
            <button
              onClick={handleOpenManageHeads}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-900/30 transition"
            >
              <Crown size={13} className="text-amber-300 fill-amber-300" />
              <span>Manage Department Heads</span>
            </button>

            {/* Department Filter */}
            <div className="flex items-center gap-1.5 bg-black border border-gray-800 rounded-xl px-2.5 py-1.5 text-xs text-gray-300">
              <Building2 size={13} className="text-teal-400" />
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-[#0b0f17]">All Departments</option>
                {hrDepartments.map((d) => (
                  <option key={d.id} value={d.name} className="bg-[#0b0f17]">
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Search Box */}
            <div className="relative w-48 sm:w-56">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Find employee, head, dept..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-gray-800 pl-8 pr-3 py-1.5 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500 placeholder-gray-600"
              />
            </div>

            {/* Canvas Zoom Controls */}
            <div className="flex items-center gap-1 bg-black border border-gray-800 rounded-xl p-1">
              <button
                onClick={() => setZoom((z) => Math.max(0.3, z - 0.15))}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
                title="Zoom Out"
              >
                <ZoomOut size={13} />
              </button>
              <span className="text-[10px] font-mono text-gray-400 w-9 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
                title="Zoom In"
              >
                <ZoomIn size={13} />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition border-l border-gray-800 ml-0.5"
                title="Reset Zoom"
              >
                <Maximize size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Org Chart Infinite Canvas */}
        <div className="flex-grow relative overflow-auto bg-[#05080d] bg-[radial-gradient(#1f293d_1px,transparent_1px)] [background-size:24px_24px]">
          <div
            className="min-w-max min-h-max p-16 sm:p-24 flex justify-center transform origin-top transition-transform duration-300 ease-out"
            style={{ transform: `scale(${zoom})` }}
          >
            {renderNode(corporateTree)}
          </div>
        </div>

        {/* ─── MODAL 1: MANAGE DEPARTMENT HEADS MODAL ───────────────────────── */}
        {showManageHeadsModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0b0f17] border border-purple-500/40 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden p-6 space-y-4 animate-fade-in-up">
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                    <Crown size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">
                      Assign Department Heads (Director / Manager Level)
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Select which Director or Manager leads each department. A single leader can head multiple departments.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowManageHeadsModal(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {hrDepartments.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-xs italic">
                    No departments created yet. Add departments in HRMS Settings first.
                  </div>
                ) : (
                  hrDepartments.map((dept) => {
                    const currentSelectedEmpId = headAssignments[dept.name] || "";
                    return (
                      <div
                        key={dept.id}
                        className="p-3.5 bg-black/60 border border-gray-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-teal-400 px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/30">
                              {dept.code}
                            </span>
                            <span className="font-bold text-white text-xs">{dept.name}</span>
                          </div>
                          {dept.description && (
                            <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">
                              {dept.description}
                            </p>
                          )}
                        </div>

                        <div className="w-full sm:w-72">
                          <select
                            value={currentSelectedEmpId}
                            onChange={(e) => {
                              const val = e.target.value;
                              setHeadAssignments((prev) => ({ ...prev, [dept.name]: val }));
                            }}
                            className="w-full bg-[#080d14] border border-gray-700 p-2 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-purple-500"
                          >
                            <option value="">-- Direct Owner Oversight / Open --</option>
                            {eligibleLeaders.map((emp) => {
                              const isHeadingOthers = Object.entries(headAssignments).some(
                                ([dName, id]) => id === emp.id && dName !== dept.name
                              );
                              return (
                                <option key={emp.id} value={emp.id}>
                                  {emp.name} — {emp.designation} {isHeadingOthers ? "(👑 Multi-Head)" : ""}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-xl text-[10px] text-purple-200 flex items-start gap-2">
                <Crown size={14} className="text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <b>Rule:</b> Only personnel with Director or Manager level ranks (Rank 1 to 4) can be chosen as Department Heads. If an employee is chosen for 2 or more departments, they are rendered with a <b>Multi-Department Leadership card</b> branching into all assigned units.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
                <button
                  onClick={() => setShowManageHeadsModal(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveHeadAssignments}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-900/30"
                >
                  <Check size={14} className="stroke-[3]" />
                  <span>Save Leadership Assignments</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── MODAL 2: EMPLOYEE QUICK DETAILS DRAWER ──────────────────────── */}
        {selectedEmployeeDetail && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0b0f17] border border-emerald-500/40 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-fade-in-up">
              <div className="flex justify-between items-start border-b border-gray-800 pb-3">
                <div className="flex items-center gap-3">
                  {selectedEmployeeDetail.avatar ? (
                    <img
                      src={selectedEmployeeDetail.avatar}
                      alt={selectedEmployeeDetail.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center font-black text-xl">
                      {selectedEmployeeDetail.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-black text-white text-base leading-tight">
                      {selectedEmployeeDetail.name}
                    </h3>
                    <p className="text-xs text-emerald-400 font-mono font-bold">
                      {selectedEmployeeDetail.employeeCode} • {selectedEmployeeDetail.designation}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEmployeeDetail(null)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-gray-300">
                <div className="flex items-center justify-between p-2.5 bg-black/50 border border-gray-800 rounded-xl">
                  <span className="text-gray-500">Primary Department:</span>
                  <span className="font-bold text-white">{selectedEmployeeDetail.department}</span>
                </div>

                {selectedEmployeeDetail.headedDepartments && selectedEmployeeDetail.headedDepartments.length > 0 && (
                  <div className="p-2.5 bg-purple-950/30 border border-purple-500/30 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-purple-300 flex items-center gap-1 mb-1">
                      <Crown size={12} className="text-amber-400" />
                      <span>Heads of Departments:</span>
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedEmployeeDetail.headedDepartments.map((hd) => (
                        <span
                          key={hd}
                          className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-purple-200 text-[10px] font-bold"
                        >
                          {hd}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-2.5 bg-black/50 border border-gray-800 rounded-xl">
                  <span className="text-gray-500">Work Email:</span>
                  <span className="font-mono text-sky-400 font-bold">{selectedEmployeeDetail.email}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-black/50 border border-gray-800 rounded-xl">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-mono text-gray-200">{selectedEmployeeDetail.phone}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-black/50 border border-gray-800 rounded-xl">
                  <span className="text-gray-500">Employment Status:</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    {selectedEmployeeDetail.status}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-800 flex justify-end">
                <button
                  onClick={() => setSelectedEmployeeDetail(null)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
