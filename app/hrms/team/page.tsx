"use client";

import React, { useState, useMemo } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import HRMSTopHeader from "@/components/hrms-top-header";
import {
  useGlobalContext,
  calculateDesignationRankAndGrade,
  isEligibleForDepartmentHead,
  getDepartmentHeadEmployee,
  HREmployee
} from "@/context/global-context";
import {
  Users,
  User,
  Network,
  Mail,
  Phone,
  Briefcase,
  Building2,
  UserCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Crown,
  ShieldCheck,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Maximize,
  Search,
  CheckCircle2,
  X,
  Layers,
  ArrowUpRight
} from "lucide-react";

interface TeamTreeNode {
  id: string;
  type: "owner" | "director" | "manager" | "supervisor" | "team_lead" | "me" | "peer" | "subordinate";
  name: string;
  title: string;
  code?: string;
  email?: string;
  phone?: string;
  department?: string;
  rank?: number;
  grade?: string;
  status?: string;
  isMe?: boolean;
  avatar?: string;
  empRef?: HREmployee;
  children: TeamTreeNode[];
  collapsed?: boolean;
}

export default function MyTeamPage() {
  const { hrEmployees, hrDepartments, hrDesignations, currentUser } = useGlobalContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [selectedEmpModal, setSelectedEmpModal] = useState<HREmployee | null>(null);

  // 1. Identify the logged-in user in HRMS
  const empMatch = useMemo(() => {
    return hrEmployees.find(
      (e) => e.email?.toLowerCase().trim() === currentUser?.email?.toLowerCase().trim()
    );
  }, [hrEmployees, currentUser]);

  const isOwner = currentUser?.role === "Owner" && !empMatch;
  const myDepartment = empMatch?.department || (hrDepartments[0]?.name || "All Departments");

  // Calculate Logged-in user's rank info
  const myRankInfo = useMemo(() => {
    if (isOwner) return { rank: 0, grade: "FOUNDER", roleCategory: "Company Owner" };
    if (!empMatch) return { rank: 9, grade: "E-2", roleCategory: "Team Member" };
    const desg = hrDesignations.find((d) => d.title.toLowerCase() === empMatch.designation.toLowerCase());
    const info = desg && desg.rank ? desg : calculateDesignationRankAndGrade(empMatch.designation);

    let roleCategory = "Team Member";
    if (info.rank <= 2) roleCategory = "Executive Director / HOD";
    else if (info.rank <= 4) roleCategory = "Department Manager";
    else if (info.rank <= 6) roleCategory = "Supervisor";
    else if (info.rank === 7) roleCategory = "Team Lead";

    return { rank: info.rank, grade: info.grade, roleCategory };
  }, [empMatch, isOwner, hrDesignations]);

  // Find My Direct Superior / Team Lead / Reporting Manager
  const myManager = useMemo(() => {
    if (isOwner) return null;
    if (!empMatch) return null;

    // 1. Explicit reportsTo
    if (empMatch.reportsTo) {
      const explicit = hrEmployees.find((e) => e.id === empMatch.reportsTo);
      if (explicit) return explicit;
    }

    // 2. Highest ranking member in my department above my rank
    const deptSeniors = hrEmployees
      .filter((e) => e.department === empMatch.department && e.id !== empMatch.id && e.status === "Active")
      .map((e) => {
        const desg = hrDesignations.find((d) => d.title.toLowerCase() === e.designation.toLowerCase());
        const info = desg && desg.rank ? desg : calculateDesignationRankAndGrade(e.designation);
        return { emp: e, rank: info.rank };
      })
      .filter((e) => e.rank < myRankInfo.rank)
      .sort((a, b) => b.rank - a.rank); // immediate supervisor above user

    if (deptSeniors.length > 0) {
      return deptSeniors[0].emp;
    }

    // 3. Department Head
    const hod = getDepartmentHeadEmployee(empMatch.department, hrEmployees, hrDesignations);
    if (hod && hod.id !== empMatch.id) return hod;

    return null;
  }, [empMatch, isOwner, hrEmployees, hrDesignations, myRankInfo]);

  // Count direct reports under logged-in user
  const directReports = useMemo(() => {
    if (isOwner) {
      return hrEmployees.filter((e) => {
        const desg = hrDesignations.find((d) => d.title.toLowerCase() === e.designation.toLowerCase());
        const rank = desg?.rank || calculateDesignationRankAndGrade(e.designation).rank;
        return rank <= 4; // Department Heads / Managers report to Owner
      });
    }
    if (!empMatch) return [];

    // Explicit reportsTo
    const explicit = hrEmployees.filter((e) => e.reportsTo === empMatch.id && e.status === "Active");
    if (explicit.length > 0) return explicit;

    // If Team Lead / Supervisor / Manager, juniors in department who have lower rank
    if (myRankInfo.rank <= 7) {
      return hrEmployees.filter((e) => {
        if (e.department !== empMatch.department || e.id === empMatch.id || e.status !== "Active") return false;
        const desg = hrDesignations.find((d) => d.title.toLowerCase() === e.designation.toLowerCase());
        const r = desg?.rank || calculateDesignationRankAndGrade(e.designation).rank;
        return r > myRankInfo.rank;
      });
    }

    return [];
  }, [empMatch, isOwner, hrEmployees, hrDesignations, myRankInfo]);

  // Total Team Members in User's Scope
  const totalTeamMembersCount = useMemo(() => {
    if (isOwner) return hrEmployees.length;
    if (!empMatch) return 0;
    return hrEmployees.filter((e) => e.department === empMatch.department && e.status === "Active").length;
  }, [empMatch, isOwner, hrEmployees]);

  // Department color map
  const deptColors = useMemo(() => {
    const palette = [
      { border: "border-teal-500", text: "text-teal-400", bg: "bg-teal-500/10", badge: "border-teal-500/30 text-teal-300" },
      { border: "border-sky-500", text: "text-sky-400", bg: "bg-sky-500/10", badge: "border-sky-500/30 text-sky-300" },
      { border: "border-amber-500", text: "text-amber-400", bg: "bg-amber-500/10", badge: "border-amber-500/30 text-amber-300" },
      { border: "border-purple-500", text: "text-purple-400", bg: "bg-purple-500/10", badge: "border-purple-500/30 text-purple-300" },
      { border: "border-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10", badge: "border-emerald-500/30 text-emerald-300" }
    ];
    const map: Record<string, typeof palette[0]> = {};
    hrDepartments.forEach((d, i) => {
      map[d.name] = palette[i % palette.length];
    });
    return map;
  }, [hrDepartments]);

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ─── BUILD THE USER-SCOPED REPORTING TREE HIERARCHY ─────────────────────────
  const teamTree: TeamTreeNode = useMemo(() => {
    // 1. Apex Root: Company Owner
    const ownerName = currentUser?.name || currentUser?.businessName?.split(" ")?.[0] || "Company Owner";
    const businessTitle = currentUser?.businessName || "MT UniPOS Enterprise";

    const ownerNode: TeamTreeNode = {
      id: "TEAM-OWNER",
      type: "owner",
      name: ownerName,
      title: "Company Owner / Executive Leadership",
      code: "APEX-001",
      email: currentUser?.email || "owner@mtcore.xyz",
      department: businessTitle,
      rank: 0,
      grade: "FOUNDER",
      status: "Active",
      isMe: isOwner,
      avatar: currentUser?.avatar,
      children: []
    };

    // Helper: Map an HREmployee to a TeamTreeNode
    const createEmpNode = (
      emp: HREmployee,
      typeOverride?: TeamTreeNode["type"]
    ): TeamTreeNode => {
      const desg = hrDesignations.find((d) => d.title.toLowerCase() === emp.designation.toLowerCase());
      const rankInfo = desg && desg.rank ? desg : calculateDesignationRankAndGrade(emp.designation);
      const isMe = empMatch ? emp.id === empMatch.id : false;

      let determinedType: TeamTreeNode["type"] = "subordinate";
      if (isMe) determinedType = "me";
      else if (typeOverride) determinedType = typeOverride;
      else if (rankInfo.rank <= 2) determinedType = "director";
      else if (rankInfo.rank <= 4) determinedType = "manager";
      else if (rankInfo.rank <= 6) determinedType = "supervisor";
      else if (rankInfo.rank === 7) determinedType = "team_lead";
      else if (empMatch && emp.department === empMatch.department && rankInfo.rank === myRankInfo.rank) determinedType = "peer";

      return {
        id: `TEAM-EMP-${emp.id}`,
        type: determinedType,
        name: emp.name,
        title: emp.designation,
        code: emp.employeeCode,
        email: emp.email,
        phone: emp.phone,
        department: emp.department,
        rank: rankInfo.rank,
        grade: rankInfo.grade,
        status: emp.status,
        avatar: emp.avatar,
        isMe,
        empRef: emp,
        children: []
      };
    };

    // CASE A: User is Owner
    if (isOwner) {
      // Group by department heads
      hrDepartments.forEach((dept) => {
        const hod = getDepartmentHeadEmployee(dept.name, hrEmployees, hrDesignations, dept);
        const deptEmps = hrEmployees.filter((e) => e.department === dept.name && e.status === "Active");

        if (hod) {
          const hodNode = createEmpNode(hod, "director");
          const subordinates = deptEmps.filter((e) => e.id !== hod.id);
          subordinates.forEach((sub) => {
            hodNode.children.push(createEmpNode(sub));
          });
          ownerNode.children.push(hodNode);
        } else if (deptEmps.length > 0) {
          // Open department branch
          const dummyDeptHead: TeamTreeNode = {
            id: `OPEN-DEPT-${dept.id}`,
            type: "manager",
            name: `${dept.name} Division`,
            title: "Supervised by Company Owner",
            code: dept.code,
            department: dept.name,
            rank: 3,
            grade: "DIRECT",
            status: "Active",
            children: deptEmps.map((e) => createEmpNode(e))
          };
          ownerNode.children.push(dummyDeptHead);
        }
      });
      return ownerNode;
    }

    // CASE B: Normal Employee / Team Lead / Supervisor / Manager
    if (!empMatch) {
      return ownerNode;
    }

    // 1. Find the reporting chain upwards for this employee:
    // User -> Team Lead -> Supervisor -> Manager/HOD -> Director -> Owner
    const deptName = empMatch.department;
    const deptAllMembers = hrEmployees.filter((e) => e.department === deptName && e.status === "Active");

    const hod = getDepartmentHeadEmployee(deptName, hrEmployees, hrDesignations);

    // If HOD exists and is NOT the user, create HOD node
    let deptHeadNode: TeamTreeNode;
    if (hod) {
      deptHeadNode = createEmpNode(hod, hod.id === empMatch.id ? "me" : "director");
    } else {
      deptHeadNode = {
        id: `DEPT-HEAD-${deptName}`,
        type: "director",
        name: `${deptName} Head Desk`,
        title: "Department Executive Leadership",
        department: deptName,
        rank: 2,
        grade: "EXEC",
        status: "Active",
        children: []
      };
    }

    // Identify intermediate levels in this department
    const managers = deptAllMembers.filter((e) => {
      const r = calculateDesignationRankAndGrade(e.designation).rank;
      return (r === 3 || r === 4) && (!hod || e.id !== hod.id);
    });

    const supervisors = deptAllMembers.filter((e) => {
      const r = calculateDesignationRankAndGrade(e.designation).rank;
      return (r === 5 || r === 6) && (!hod || e.id !== hod.id);
    });

    const teamLeads = deptAllMembers.filter((e) => {
      const r = calculateDesignationRankAndGrade(e.designation).rank;
      return r === 7 && (!hod || e.id !== hod.id);
    });

    const staffMembers = deptAllMembers.filter((e) => {
      const r = calculateDesignationRankAndGrade(e.designation).rank;
      return r >= 8 && (!hod || e.id !== hod.id);
    });

    // ── Build Team Hierarchy Branch ──────────────────────────────────────────
    // If logged-in user IS the HOD / Director:
    if (hod && hod.id === empMatch.id) {
      // User is at the top of the department. Under user, attach all supervisors/leads/staff
      if (managers.length > 0) {
        managers.forEach((mgr) => {
          const mgrNode = createEmpNode(mgr, "manager");
          // Under manager, attach supervisors or leads
          supervisors.forEach((sup) => mgrNode.children.push(createEmpNode(sup, "supervisor")));
          deptHeadNode.children.push(mgrNode);
        });
      } else if (supervisors.length > 0) {
        supervisors.forEach((sup) => {
          const supNode = createEmpNode(sup, "supervisor");
          teamLeads.forEach((tl) => supNode.children.push(createEmpNode(tl, "team_lead")));
          deptHeadNode.children.push(supNode);
        });
      } else {
        teamLeads.forEach((tl) => deptHeadNode.children.push(createEmpNode(tl, "team_lead")));
        staffMembers.forEach((st) => deptHeadNode.children.push(createEmpNode(st, "subordinate")));
      }
      ownerNode.children.push(deptHeadNode);
      return ownerNode;
    }

    // If logged-in user is a Manager (Rank 3-4):
    if (myRankInfo.rank === 3 || myRankInfo.rank === 4) {
      const myNode = createEmpNode(empMatch, "me");
      if (supervisors.length > 0) {
        supervisors.forEach((sup) => {
          const supNode = createEmpNode(sup, "supervisor");
          teamLeads.forEach((tl) => supNode.children.push(createEmpNode(tl, "team_lead")));
          myNode.children.push(supNode);
        });
      } else {
        teamLeads.forEach((tl) => myNode.children.push(createEmpNode(tl, "team_lead")));
        staffMembers.forEach((st) => myNode.children.push(createEmpNode(st, "subordinate")));
      }
      deptHeadNode.children.push(myNode);
      ownerNode.children.push(deptHeadNode);
      return ownerNode;
    }

    // If logged-in user is a Supervisor (Rank 5-6):
    if (myRankInfo.rank === 5 || myRankInfo.rank === 6) {
      const mySupervisorNode = createEmpNode(empMatch, "me");
      teamLeads.forEach((tl) => {
        const tlNode = createEmpNode(tl, "team_lead");
        staffMembers.forEach((st) => tlNode.children.push(createEmpNode(st, "subordinate")));
        mySupervisorNode.children.push(tlNode);
      });
      if (teamLeads.length === 0) {
        staffMembers.forEach((st) => mySupervisorNode.children.push(createEmpNode(st, "subordinate")));
      }

      if (managers.length > 0) {
        const mgrNode = createEmpNode(managers[0], "manager");
        mgrNode.children.push(mySupervisorNode);
        deptHeadNode.children.push(mgrNode);
      } else {
        deptHeadNode.children.push(mySupervisorNode);
      }
      ownerNode.children.push(deptHeadNode);
      return ownerNode;
    }

    // If logged-in user is a Team Lead (Rank 7):
    if (myRankInfo.rank === 7) {
      const myLeadNode = createEmpNode(empMatch, "me");
      // Attach all staff / direct reports under this Team Lead
      staffMembers.forEach((member) => {
        myLeadNode.children.push(createEmpNode(member, "subordinate"));
      });

      // Chain upwards: Supervisor -> Manager -> HOD -> Owner
      if (supervisors.length > 0) {
        const supNode = createEmpNode(supervisors[0], "supervisor");
        supNode.children.push(myLeadNode);
        deptHeadNode.children.push(supNode);
      } else if (managers.length > 0) {
        const mgrNode = createEmpNode(managers[0], "manager");
        mgrNode.children.push(myLeadNode);
        deptHeadNode.children.push(mgrNode);
      } else {
        deptHeadNode.children.push(myLeadNode);
      }
      ownerNode.children.push(deptHeadNode);
      return ownerNode;
    }

    // If logged-in user is an Employee / Associate / Intern (Rank >= 8):
    // Construct chain: HOD -> Manager / Supervisor -> Team Lead -> [Logged-in User + Peers]
    let activeLeadNode: TeamTreeNode;
    if (teamLeads.length > 0) {
      activeLeadNode = createEmpNode(teamLeads[0], "team_lead");
    } else if (supervisors.length > 0) {
      activeLeadNode = createEmpNode(supervisors[0], "supervisor");
    } else if (managers.length > 0) {
      activeLeadNode = createEmpNode(managers[0], "manager");
    } else {
      activeLeadNode = deptHeadNode;
    }

    // Under the Team Lead, attach Logged-In User (`⭐ You`) and their Peers
    const myNode = createEmpNode(empMatch, "me");
    if (activeLeadNode !== deptHeadNode) {
      activeLeadNode.children.push(myNode);
      // Add other peers in the same team
      staffMembers
        .filter((s) => s.id !== empMatch.id)
        .forEach((peer) => {
          activeLeadNode.children.push(createEmpNode(peer, "peer"));
        });

      // Connect upward into Supervisor / Manager / HOD
      if (supervisors.length > 0 && activeLeadNode.type === "team_lead") {
        const supNode = createEmpNode(supervisors[0], "supervisor");
        supNode.children.push(activeLeadNode);
        deptHeadNode.children.push(supNode);
      } else {
        deptHeadNode.children.push(activeLeadNode);
      }
    } else {
      deptHeadNode.children.push(myNode);
      staffMembers
        .filter((s) => s.id !== empMatch.id)
        .forEach((peer) => {
          deptHeadNode.children.push(createEmpNode(peer, "peer"));
        });
    }

    ownerNode.children.push(deptHeadNode);
    return ownerNode;
  }, [currentUser, hrEmployees, hrDepartments, hrDesignations, empMatch, isOwner, myRankInfo]);

  // ─── RENDER AN INDIVIDUAL TEAM NODE ─────────────────────────────────────────
  const renderTeamNode = (node: TeamTreeNode) => {
    const isOwnerNode = node.type === "owner";
    const isMeNode = node.isMe || node.type === "me";
    const isDirector = node.type === "director";
    const isManager = node.type === "manager";
    const isSupervisor = node.type === "supervisor";
    const isTeamLead = node.type === "team_lead";
    const isPeer = node.type === "peer";
    const isSubordinate = node.type === "subordinate";

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
        (node.code && node.code.toLowerCase().includes(searchQuery.toLowerCase())));

    return (
      <div key={node.id} className="flex flex-col items-center relative select-none">
        {/* Node Card Container */}
        <div
          onClick={() => {
            if (node.empRef) setSelectedEmpModal(node.empRef);
          }}
          className={`
            relative z-10 transition-all duration-300 rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center cursor-pointer group
            ${
              isMeNode
                ? "w-72 sm:w-80 bg-gradient-to-b from-[#062c20] via-[#091b15] to-[#050e0c] border-2 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.4)] scale-105 hover:border-emerald-300"
                : isOwnerNode
                ? "w-72 sm:w-80 bg-gradient-to-b from-[#191408] via-[#0c0d12] to-[#06080d] border-2 border-amber-400/90 shadow-[0_0_30px_rgba(245,158,11,0.25)] hover:scale-105"
                : isDirector
                ? "w-72 bg-gradient-to-b from-[#180f24] via-[#0e0c18] to-[#07080f] border-t-4 border-purple-500 border-l border-r border-b border-gray-800 hover:scale-105"
                : isManager
                ? "w-68 bg-[#090e18] border-t-4 border-sky-500 border-l border-r border-b border-gray-800 hover:scale-105"
                : isSupervisor
                ? "w-64 bg-[#0a1215] border-t-4 border-teal-500 border-l border-r border-b border-gray-800 hover:scale-105"
                : isTeamLead
                ? "w-64 bg-[#17130a] border-t-4 border-amber-500 border-l border-r border-b border-gray-800 hover:scale-105"
                : isPeer
                ? "w-60 bg-[#090d14] border-t-2 border-cyan-500/70 border-l border-r border-b border-gray-800 hover:scale-105"
                : `w-60 bg-[#080c14] border-t-2 ${deptStyle.border} border-l border-r border-b border-gray-800/90 hover:scale-105`
            }
            ${isMatch ? "ring-4 ring-white scale-110 shadow-[0_0_35px_rgba(255,255,255,0.4)]" : ""}
          `}
        >
          {/* Header Role Badges */}
          {isMeNode ? (
            <div className="absolute -top-3.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-black text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-emerald-500/40">
              <Sparkles size={12} className="fill-black" />
              <span>⭐ YOU (Active Profile)</span>
            </div>
          ) : isOwnerNode ? (
            <div className="absolute -top-3 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md shadow-amber-500/20">
              <Crown size={11} className="fill-black" />
              <span>Company Owner</span>
            </div>
          ) : isDirector ? (
            <div className="absolute -top-2.5 px-2.5 py-0.5 rounded-full bg-purple-950 border border-purple-500/40 text-purple-300 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck size={10} />
              <span>Department Head</span>
            </div>
          ) : isManager ? (
            <div className="absolute -top-2.5 px-2.5 py-0.5 rounded-full bg-sky-950 border border-sky-500/40 text-sky-300 text-[9px] font-black uppercase tracking-wider">
              <span>Department Manager</span>
            </div>
          ) : isSupervisor ? (
            <div className="absolute -top-2.5 px-2.5 py-0.5 rounded-full bg-teal-950 border border-teal-500/40 text-teal-300 text-[9px] font-black uppercase tracking-wider">
              <span>Supervisor</span>
            </div>
          ) : isTeamLead ? (
            <div className="absolute -top-2.5 px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-500/40 text-amber-300 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
              <span>⚡ Team Lead</span>
            </div>
          ) : isPeer ? (
            <div className="absolute -top-2.5 px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-[9px] font-black uppercase tracking-wider">
              <span>🤝 Team Peer</span>
            </div>
          ) : (
            <div className="absolute -top-2.5 px-2 py-0.5 rounded-md bg-gray-900 border border-gray-700 text-gray-400 text-[9px] font-mono font-bold">
              {node.grade || "E-1"}
            </div>
          )}

          {/* Large Avatar Photo */}
          <div className="mt-1 flex justify-center">
            {isMeNode ? (
              empMatch?.avatar || currentUser?.avatar || node.avatar ? (
                <img
                  src={empMatch?.avatar || currentUser?.avatar || node.avatar}
                  alt={node.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-emerald-400 shadow-xl"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center font-black text-3xl shadow-xl">
                  {node.name.charAt(0)}
                </div>
              )
            ) : isOwnerNode ? (
              currentUser?.avatar || node.avatar ? (
                <img
                  src={currentUser?.avatar || node.avatar}
                  alt={node.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-amber-400 shadow-xl"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-amber-400/20 border-2 border-amber-400 text-amber-300 flex items-center justify-center font-black text-3xl shadow-xl">
                  👑
                </div>
              )
            ) : isDirector ? (
              node.avatar || node.empRef?.avatar ? (
                <img
                  src={node.avatar || node.empRef?.avatar}
                  alt={node.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-purple-400 shadow-xl"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-purple-500/20 border-2 border-purple-400 text-purple-200 flex items-center justify-center font-black text-2xl shadow-xl">
                  {node.name.charAt(0)}
                </div>
              )
            ) : isManager ? (
              node.avatar || node.empRef?.avatar ? (
                <img
                  src={node.avatar || node.empRef?.avatar}
                  alt={node.name}
                  className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl object-cover border-2 border-sky-400 shadow-lg"
                />
              ) : (
                <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-sky-500/20 border-2 border-sky-400 text-sky-200 flex items-center justify-center font-black text-2xl shadow-lg">
                  {node.name.charAt(0)}
                </div>
              )
            ) : isSupervisor || isTeamLead ? (
              node.avatar || node.empRef?.avatar ? (
                <img
                  src={node.avatar || node.empRef?.avatar}
                  alt={node.name}
                  className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 ${deptStyle.border} shadow-lg`}
                />
              ) : (
                <div className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-black border-2 ${deptStyle.border} ${deptStyle.text} flex items-center justify-center font-black text-2xl shadow-md`}>
                  {node.name.charAt(0)}
                </div>
              )
            ) : node.avatar || node.empRef?.avatar ? (
              <img
                src={node.avatar || node.empRef?.avatar}
                alt={node.name}
                className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 ${deptStyle.border} shadow-md`}
              />
            ) : (
              <div className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-black border-2 ${deptStyle.border} ${deptStyle.text} flex items-center justify-center font-bold text-xl shadow-sm`}>
                {node.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Name & Title */}
          <div className="mt-1.5 w-full">
            <p className={`font-black truncate ${isMeNode ? "text-sm text-emerald-200" : isOwnerNode ? "text-sm text-amber-200" : "text-xs text-white"}`}>
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

            {node.department && (
              <div className="mt-1">
                <span className={`inline-block text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 border ${deptStyle.badge}`}>
                  {node.department}
                </span>
              </div>
            )}
          </div>

          {/* Subordinates Toggle */}
          {node.children && node.children.length > 0 && (
            <button
              onClick={(e) => toggleCollapse(node.id, e)}
              className="mt-2 px-2 py-0.5 rounded-full bg-black/80 hover:bg-gray-800 border border-gray-700 text-[8px] font-mono text-gray-300 flex items-center gap-1 transition"
              title={isCollapsed ? "Expand team reports" : "Collapse team reports"}
            >
              <Users size={9} className="text-emerald-400" />
              <span>{node.children.length} {node.children.length === 1 ? "report" : "reports"}</span>
              {isCollapsed ? <ChevronDown size={9} /> : <ChevronUp size={9} />}
            </button>
          )}
        </div>

        {/* Child Subtree Lines & Connectors */}
        {node.children && node.children.length > 0 && !isCollapsed && (
          <div className="relative pt-7">
            {/* Vertical Line down from parent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-7 bg-gradient-to-b from-gray-600 to-gray-700"></div>

            <div className="flex justify-center gap-6 sm:gap-8 relative">
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
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-0.5 h-7 bg-gray-700"></div>
                  {renderTeamNode(child)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans overflow-hidden">
      <HRMSSidebar />

      <main className="flex-grow flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <HRMSTopHeader
          title="My Team & Reporting Hierarchy"
          subtitle="Interactive reporting line, supervisory chain, team leads, and direct reports."
        />

        <div className="p-4 sm:p-5 flex flex-col gap-4 flex-grow overflow-hidden">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            {/* Department */}
            <div className="bg-[#0b0f17] border border-sky-500/20 p-3.5 rounded-2xl flex items-center justify-between shadow-lg">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">My Department</span>
                <span className="text-xs sm:text-sm font-black text-sky-400 mt-0.5 truncate block max-w-[140px]">
                  {isOwner ? "All Departments" : myDepartment}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 shrink-0">
                <Building2 size={16} />
              </div>
            </div>

            {/* Reporting Superior / TL */}
            <div className="bg-[#0b0f17] border border-amber-500/20 p-3.5 rounded-2xl flex items-center justify-between shadow-lg">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">My Supervisor / TL</span>
                <span className="text-xs sm:text-sm font-black text-amber-300 mt-0.5 truncate block max-w-[140px]">
                  {isOwner ? "None (Apex Owner)" : myManager ? myManager.name : "Direct Owner Leadership"}
                </span>
                {myManager && (
                  <span className="text-[9px] text-gray-400 font-mono block truncate max-w-[130px]">
                    {myManager.designation}
                  </span>
                )}
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                <ShieldCheck size={16} />
              </div>
            </div>

            {/* Direct Reports */}
            <div className="bg-[#0b0f17] border border-emerald-500/20 p-3.5 rounded-2xl flex items-center justify-between shadow-lg">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Direct Reports</span>
                <span className="text-sm sm:text-lg font-black text-emerald-400 mt-0.5 block">
                  {directReports.length} <span className="text-[10px] text-gray-400 font-normal">Staff</span>
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                <Users size={16} />
              </div>
            </div>

            {/* Total Unit Count */}
            <div className="bg-[#0b0f17] border border-purple-500/20 p-3.5 rounded-2xl flex items-center justify-between shadow-lg">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">My Role Category</span>
                <span className="text-xs sm:text-sm font-black text-purple-300 mt-0.5 truncate block max-w-[140px]">
                  {myRankInfo.roleCategory}
                </span>
                <span className="text-[9px] text-gray-400 font-mono block">
                  Unit Staff: {totalTeamMembersCount}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shrink-0">
                <Crown size={16} />
              </div>
            </div>
          </div>

          {/* Canvas Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#080c14] border border-gray-800/80 p-3 rounded-2xl shrink-0">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
                <Network size={14} />
              </span>
              <span className="text-xs font-black text-white">Hierarchical Tree of Your Team &amp; Direct Reports</span>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Search */}
              <div className="relative w-44 sm:w-56">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Find team member..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black border border-gray-800 pl-8 pr-3 py-1.5 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500 placeholder-gray-600"
                />
              </div>

              {/* Zoom */}
              <div className="flex items-center gap-1 bg-black border border-gray-800 rounded-xl p-1">
                <button
                  onClick={() => setZoom((z) => Math.max(0.3, z - 0.15))}
                  className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
                >
                  <ZoomOut size={12} />
                </button>
                <span className="text-[10px] font-mono text-gray-400 w-8 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
                  className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
                >
                  <ZoomIn size={12} />
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition border-l border-gray-800 ml-0.5"
                >
                  <Maximize size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Org Canvas for My Team */}
          <div className="flex-grow relative overflow-auto bg-[#05080d] border border-gray-800/80 rounded-2xl bg-[radial-gradient(#1f293d_1px,transparent_1px)] [background-size:24px_24px]">
            <div
              className="min-w-max min-h-max p-12 sm:p-20 flex justify-center transform origin-top transition-transform duration-300 ease-out"
              style={{ transform: `scale(${zoom})` }}
            >
              {renderTeamNode(teamTree)}
            </div>
          </div>
        </div>

        {/* ─── EMPLOYEE QUICK PROFILE MODAL ─────────────────────────────────── */}
        {selectedEmpModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0b0f17] border border-emerald-500/40 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-fade-in-up">
              <div className="flex justify-between items-start border-b border-gray-800 pb-3">
                <div className="flex items-center gap-3">
                  {selectedEmpModal.avatar ? (
                    <img
                      src={selectedEmpModal.avatar}
                      alt={selectedEmpModal.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center font-black text-xl">
                      {selectedEmpModal.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-black text-white text-base leading-tight">
                      {selectedEmpModal.name}
                    </h3>
                    <p className="text-xs text-emerald-400 font-mono font-bold">
                      {selectedEmpModal.employeeCode} • {selectedEmpModal.designation}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEmpModal(null)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-gray-300">
                <div className="flex items-center justify-between p-2.5 bg-black/50 border border-gray-800 rounded-xl">
                  <span className="text-gray-500">Department:</span>
                  <span className="font-bold text-white">{selectedEmpModal.department}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-black/50 border border-gray-800 rounded-xl">
                  <span className="text-gray-500">Work Email:</span>
                  <span className="font-mono text-sky-400 font-bold">{selectedEmpModal.email}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-black/50 border border-gray-800 rounded-xl">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-mono text-gray-200">{selectedEmpModal.phone}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-black/50 border border-gray-800 rounded-xl">
                  <span className="text-gray-500">Status:</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    {selectedEmpModal.status}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-800 flex justify-end">
                <button
                  onClick={() => setSelectedEmpModal(null)}
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
