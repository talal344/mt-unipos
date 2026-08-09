"use client";

import React, { useState, useMemo } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import HRMSTopHeader from "@/components/hrms-top-header";
import { useGlobalContext } from "@/context/global-context";
import { 
  Users, 
  User, 
  Network, 
  Mail, 
  Briefcase, 
  Building2, 
  UserCircle, 
  ChevronRight, 
  ChevronDown 
} from "lucide-react";

export default function MyTeamPage() {
  const { hrEmployees, hrDesignations, currentUser } = useGlobalContext();

  const empMatch = useMemo(() => {
    return hrEmployees.find(
      (e) => e.email?.toLowerCase().trim() === currentUser?.email?.toLowerCase().trim()
    );
  }, [hrEmployees, currentUser]);

  const isOwner = currentUser?.role === "Owner";
  const myDepartment = empMatch?.department || "N/A";

  // Get department members
  const departmentEmployees = useMemo(() => {
    if (isOwner) return hrEmployees;
    if (!empMatch) return [];
    return hrEmployees.filter((e) => e.department === myDepartment);
  }, [hrEmployees, isOwner, myDepartment, empMatch]);

  // Hierarchy building
  const { roots, nodeMap, directReportsCount, totalTeamCount, manager } = useMemo(() => {
    const map = new Map<string, any>();
    const roots: any[] = [];
    
    let directReports = 0;
    let totalTeam = 0;
    let myManager: any = null;

    // Create maps
    departmentEmployees.forEach((emp) => {
      map.set(emp.id, { ...emp, children: [] });
    });

    departmentEmployees.forEach((emp) => {
      const node = map.get(emp.id);
      if (emp.reportsTo && map.has(emp.reportsTo)) {
        map.get(emp.reportsTo).children.push(node);
        if (empMatch && emp.reportsTo === empMatch.id) {
          directReports++;
        }
      } else {
        roots.push(node);
      }
    });

    if (empMatch) {
      if (empMatch.reportsTo) {
        myManager = hrEmployees.find(e => e.id === empMatch.reportsTo) || null;
      }
      
      // Count total team (all descendants)
      const countDescendants = (nodeId: string) => {
        let count = 0;
        const node = map.get(nodeId);
        if (node && node.children) {
          count += node.children.length;
          node.children.forEach((c: any) => {
            count += countDescendants(c.id);
          });
        }
        return count;
      };
      totalTeam = countDescendants(empMatch.id);
    }

    return { roots, nodeMap: map, directReportsCount: directReports, totalTeamCount: totalTeam, manager: myManager };
  }, [departmentEmployees, empMatch, hrEmployees]);

  const getRank = (designationTitle: string) => {
    return hrDesignations.find((d) => d.title === designationTitle)?.rank || 9;
  };

  const sortNodes = (nodes: any[]) => {
    return nodes.sort((a, b) => {
      return getRank(a.designation) - getRank(b.designation);
    });
  };

  // Node Component
  const TreeNode = ({ node, isLast, level = 0 }: { node: any, isLast?: boolean, level?: number }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const isMe = empMatch && node.id === empMatch.id;
    const hasChildren = node.children && node.children.length > 0;
    const sortedChildren = sortNodes([...(node.children || [])]);

    return (
      <div className="relative pl-8 pt-4">
        {/* Lines */}
        <div className={`absolute top-0 left-4 w-px bg-gray-700 ${isLast ? 'h-10' : 'h-full'}`} />
        <div className="absolute top-10 left-4 w-4 h-px bg-gray-700" />
        
        <div className="flex flex-col mb-4 relative z-10">
          <div 
            className={`
              flex items-center gap-4 p-4 rounded-xl border w-[400px] shadow-lg transition-all
              ${isMe 
                ? 'bg-emerald-900/20 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                : 'bg-[#111823] border-gray-800 hover:border-gray-700'}
            `}
          >
            {hasChildren && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute -left-3 top-1/2 -translate-y-1/2 bg-[#0b0f17] border border-gray-700 rounded-full p-0.5 hover:bg-gray-800 transition-colors z-20"
              >
                {isExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
              </button>
            )}

            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isMe ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-400'}`}>
              {node.avatar ? (
                <img src={node.avatar} alt={node.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <UserCircle size={24} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className={`font-medium truncate ${isMe ? 'text-emerald-400' : 'text-gray-100'}`}>
                  {node.name} {isMe && <span className="ml-2 text-[10px] uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">You</span>}
                </h3>
              </div>
              <p className="text-xs text-gray-400 truncate mb-1">{node.designation}</p>
              <div className="flex items-center gap-3 text-[10px] text-gray-500">
                <span className="flex items-center gap-1"><Briefcase size={10} /> {node.employeeCode}</span>
                <span className="flex items-center gap-1"><Mail size={10} /> {node.email || 'N/A'}</span>
              </div>
            </div>
          </div>

          {hasChildren && isExpanded && (
            <div className="ml-4 border-l border-gray-700/0">
              {sortedChildren.map((child, idx) => (
                <TreeNode 
                  key={child.id} 
                  node={child} 
                  isLast={idx === sortedChildren.length - 1} 
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans">
      <HRMSSidebar />
      <main className="flex-grow overflow-y-auto max-h-screen">
        <HRMSTopHeader title="My Team" subtitle="View your team hierarchy and direct reports" />
        
        <div className="p-6 space-y-6">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#0b0f17] border border-gray-800 rounded-xl p-5 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  <Building2 size={20} />
                </div>
                <h3 className="text-sm text-gray-400 font-medium">Department</h3>
              </div>
              <p className="text-xl font-semibold text-gray-100">{isOwner ? 'All Departments' : myDepartment}</p>
            </div>
            
            <div className="bg-[#0b0f17] border border-gray-800 rounded-xl p-5 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                  <User size={20} />
                </div>
                <h3 className="text-sm text-gray-400 font-medium">Reporting Manager</h3>
              </div>
              <p className="text-xl font-semibold text-gray-100 truncate">{manager?.name || 'None (Top Level)'}</p>
              {manager && <p className="text-xs text-gray-500 mt-1 truncate">{manager.designation}</p>}
            </div>

            <div className="bg-[#0b0f17] border border-gray-800 rounded-xl p-5 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                  <Users size={20} />
                </div>
                <h3 className="text-sm text-gray-400 font-medium">Direct Reports</h3>
              </div>
              <p className="text-xl font-semibold text-gray-100">{directReportsCount}</p>
            </div>

            <div className="bg-[#0b0f17] border border-gray-800 rounded-xl p-5 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
                  <Network size={20} />
                </div>
                <h3 className="text-sm text-gray-400 font-medium">Total Team Members</h3>
              </div>
              <p className="text-xl font-semibold text-gray-100">{totalTeamCount}</p>
              <p className="text-xs text-gray-500 mt-1">Under your reporting line</p>
            </div>
          </div>

          {/* Tree View */}
          <div className="bg-[#0b0f17] border border-gray-800 rounded-xl p-6 min-h-[500px] overflow-x-auto">
            <h2 className="text-lg font-medium text-gray-100 mb-6 flex items-center gap-2">
              <Network size={18} className="text-emerald-400" />
              Organizational Hierarchy
            </h2>
            
            {departmentEmployees.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
                <Network size={48} className="mb-4 text-gray-700" />
                <p>No team assignments configured yet.</p>
                <p className="text-sm mt-1">Please contact HR or your manager to set up team structure.</p>
              </div>
            ) : (
              <div className="py-4">
                {sortNodes(roots).map((root, idx) => (
                  <TreeNode key={root.id} node={root} isLast={idx === roots.length - 1} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
