"use client";

import React, { useState, useMemo, useEffect } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import HRMSTopHeader from "@/components/hrms-top-header";
import { useGlobalContext } from "@/context/global-context";
import { 
  Users, GitBranch, Building2, ChevronDown, ChevronRight, 
  CheckCircle2, AlertTriangle, Search, ShieldAlert
} from "lucide-react";

export default function TeamAssignPage() {
  const { 
    hrEmployees, 
    updateHREmployee, 
    hrDepartments, 
    hrDesignations, 
    currentUser 
  } = useGlobalContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDeps, setExpandedDeps] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  // Authorization check
  const empMatch = hrEmployees.find(e => e.email?.toLowerCase().trim() === currentUser?.email?.toLowerCase().trim());
  const isHRUser = Boolean((currentUser?.role as string) === "HR" || currentUser?.email?.toLowerCase().includes("hr@") || empMatch?.department === "Human Resources");
  const isOwner = currentUser?.role === "Owner";
  const isAuthorized = isOwner || isHRUser;

  useEffect(() => {
    // Initial expansion state for departments
    const initialExp: Record<string, boolean> = {};
    hrDepartments.forEach(d => { initialExp[d.name] = true; });
    setExpandedDeps(initialExp);
    setLoading(false);
  }, [hrDepartments]);

  const toggleDept = (deptTitle: string) => {
    setExpandedDeps(prev => ({ ...prev, [deptTitle]: !prev[deptTitle] }));
  };

  const getEmpRank = (designationTitle: string) => {
    const desig = hrDesignations.find(d => d.title === designationTitle);
    return desig?.rank || 9; // Default to Employee if not found
  };

  const handleAssignManager = (empId: string, managerId: string) => {
    let reportingDesignation = "";
    if (managerId) {
      const manager = hrEmployees.find(e => e.id === managerId);
      if (manager) {
        reportingDesignation = manager.designation;
      }
    }
    updateHREmployee(empId, { reportsTo: managerId, reportingDesignation });
    
    // Simple toast simulation
    const el = document.getElementById("toast-container");
    if (el) {
      const toast = document.createElement("div");
      toast.className = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-4 py-2 rounded-md mb-2 flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2";
      toast.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Assignment updated successfully</span>`;
      el.appendChild(toast);
      setTimeout(() => {
        toast.classList.add("opacity-0", "transition-opacity", "duration-300");
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
  };

  const activeEmployees = hrEmployees.filter(e => e.status === "Active");
  const assignedCount = activeEmployees.filter(e => e.reportsTo).length;
  const unassignedCount = activeEmployees.length - assignedCount;

  // Group active employees by department
  const deptEmployees = useMemo(() => {
    const groups: Record<string, typeof hrEmployees> = {};
    hrDepartments.forEach(d => { groups[d.name] = []; });
    
    activeEmployees.forEach(emp => {
      if (!groups[emp.department]) {
        groups[emp.department] = [];
      }
      groups[emp.department].push(emp);
    });
    return groups;
  }, [activeEmployees, hrDepartments]);

  if (loading) return null;

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans">
        <HRMSSidebar />
        <main className="flex-grow overflow-y-auto max-h-screen">
          <HRMSTopHeader title="Assign Team" subtitle="Manage reporting structures" />
          <div className="p-6 flex items-center justify-center h-[calc(100vh-100px)]">
            <div className="text-center p-8 bg-[#0b0f17] border border-gray-800 rounded-xl max-w-md w-full shadow-2xl">
              <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-white mb-2">Access Denied</h2>
              <p className="text-gray-400 text-sm">You do not have permission to access the team assignment settings. This area is restricted to HR personnel and Owners.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans">
      <HRMSSidebar />
      <main className="flex-grow overflow-y-auto max-h-screen relative">
        <HRMSTopHeader title="Assign Team" subtitle="Manage organizational hierarchy and reporting lines" />
        
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0b0f17] border border-gray-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-gray-400 text-xs font-medium mb-1">Total Active Staff</p>
                <p className="text-2xl font-semibold text-white">{activeEmployees.length}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="bg-[#0b0f17] border border-gray-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-gray-400 text-xs font-medium mb-1">Assigned Employees</p>
                <p className="text-2xl font-semibold text-emerald-400">{assignedCount}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="bg-[#0b0f17] border border-gray-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-gray-400 text-xs font-medium mb-1">Unassigned Employees</p>
                <p className="text-2xl font-semibold text-amber-400">{unassignedCount}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </div>

          {/* Search/Filter */}
          <div className="bg-[#0b0f17] border border-gray-800 rounded-xl p-4 flex items-center shadow-sm">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search employees by name, ID or designation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#05080d] border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Department List */}
          <div className="space-y-4">
            {Object.entries(deptEmployees).map(([deptTitle, employees]) => {
              // Filter by search query
              const filteredEmployees = employees.filter(emp => 
                emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.designation.toLowerCase().includes(searchQuery.toLowerCase())
              );

              if (filteredEmployees.length === 0) return null;

              const isExpanded = expandedDeps[deptTitle];

              return (
                <div key={deptTitle} className="bg-[#0b0f17] border border-gray-800 rounded-xl overflow-hidden shadow-sm">
                  <div 
                    className="px-5 py-4 border-b border-gray-800 flex items-center justify-between cursor-pointer hover:bg-gray-800/30 transition-colors"
                    onClick={() => toggleDept(deptTitle)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-white">{deptTitle}</h3>
                        <p className="text-xs text-gray-400">{filteredEmployees.length} employees</p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  
                  {isExpanded && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                          <tr className="bg-[#05080d]/50 text-xs text-gray-400 uppercase tracking-wider">
                            <th className="px-5 py-3 font-medium w-[30%]">Employee</th>
                            <th className="px-5 py-3 font-medium w-[20%]">Role Details</th>
                            <th className="px-5 py-3 font-medium w-[15%]">Status</th>
                            <th className="px-5 py-3 font-medium w-[35%]">Reports To</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                          {filteredEmployees.map(emp => {
                            const empRank = getEmpRank(emp.designation);
                            
                            // Get possible managers (same department, strictly lower rank number meaning higher rank)
                            const possibleManagers = activeEmployees.filter(e => 
                              e.department === emp.department && 
                              e.id !== emp.id && 
                              getEmpRank(e.designation) < empRank
                            );

                            return (
                              <tr key={emp.id} className="hover:bg-gray-800/20 transition-colors group">
                                <td className="px-5 py-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700">
                                      {emp.avatar ? (
                                        <img src={emp.avatar} alt={emp.name} className="w-full h-full rounded-full object-cover" />
                                      ) : (
                                        <span className="text-sm font-medium text-gray-300">{emp.name.charAt(0)}</span>
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-200">{emp.name}</p>
                                      <p className="text-xs text-gray-500">{emp.employeeCode}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-3">
                                  <p className="text-sm text-gray-300">{emp.designation}</p>
                                  <p className="text-xs text-gray-500">Rank: {empRank}</p>
                                </td>
                                <td className="px-5 py-3">
                                  {emp.reportsTo ? (
                                    <div className="flex items-center space-x-1.5">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                      <span className="text-xs text-emerald-400/90 font-medium">Assigned</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center space-x-1.5">
                                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                      <span className="text-xs text-amber-400/90 font-medium">Unassigned</span>
                                    </div>
                                  )}
                                </td>
                                <td className="px-5 py-3">
                                  <select
                                    value={emp.reportsTo || ""}
                                    onChange={(e) => handleAssignManager(emp.id, e.target.value)}
                                    className="w-full bg-[#05080d] border border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1em] bg-[right_0.5rem_center] bg-no-repeat pr-8 hover:border-gray-600 shadow-inner"
                                  >
                                    <option value="">None / Top Level</option>
                                    {possibleManagers.map(mgr => (
                                      <option key={mgr.id} value={mgr.id}>
                                        {mgr.name} ({mgr.designation})
                                      </option>
                                    ))}
                                  </select>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Toast Container */}
        <div id="toast-container" className="fixed bottom-4 right-4 z-50 flex flex-col items-end pointer-events-none transition-all"></div>
      </main>
    </div>
  );
}
