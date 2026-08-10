"use client";

import React, { useMemo, useState } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import { useGlobalContext } from "@/context/global-context";
import { Network, Search, Download, Users, ZoomIn, ZoomOut, Maximize } from "lucide-react";

export default function OrgChartPage() {
  const { hrEmployees, hrDepartments } = useGlobalContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [zoom, setZoom] = useState(1);

  // Map employees to a nested structure
  const orgTree = useMemo(() => {
    const map = new Map();
    const roots: any[] = [];
    
    // Create node for each
    hrEmployees.forEach(emp => {
      map.set(emp.id, { ...emp, children: [] });
    });

    // Link
    hrEmployees.forEach(emp => {
      const node = map.get(emp.id);
      if (emp.reportsTo && map.has(emp.reportsTo)) {
        map.get(emp.reportsTo).children.push(node);
      } else {
        // If no reportsTo, or reporting to someone deleted, it's a root
        roots.push(node);
      }
    });

    return roots;
  }, [hrEmployees]);

  // Dept color map
  const deptColors = useMemo(() => {
    const colors = ["border-teal-500", "border-sky-500", "border-amber-500", "border-purple-500", "border-rose-500", "border-indigo-500", "border-emerald-500"];
    const map: Record<string, string> = {};
    hrDepartments.forEach((d, i) => {
      map[d.name] = colors[i % colors.length];
    });
    return map;
  }, [hrDepartments]);

  const renderNode = (node: any) => {
    const isMatched = searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase());
    const deptColor = deptColors[node.department] || "border-gray-500";
    
    return (
      <div key={node.id} className="flex flex-col items-center org-node relative">
        <div className={`
          relative z-10 w-48 bg-[#0b0f17] border-t-4 ${deptColor} border-l border-r border-b border-gray-800 rounded-xl p-3 shadow-xl flex flex-col items-center gap-2 text-center transition
          ${isMatched ? 'ring-2 ring-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'hover:border-gray-600'}
        `}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-black text-white bg-black border-2 ${deptColor}`}>
            {node.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">{node.name}</p>
            <p className="text-[10px] text-gray-400 font-mono mt-1">{node.designation}</p>
            <span className={`inline-block mt-2 text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-black/50 border ${deptColor} text-gray-300`}>
              {node.department}
            </span>
          </div>
        </div>
        
        {node.children && node.children.length > 0 && (
          <div className="relative pt-6">
            {/* Vertical line down from parent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 bg-gray-700"></div>
            
            <div className="flex justify-center gap-8 relative">
              {/* Horizontal connecting line for siblings */}
              {node.children.length > 1 && (
                <div className="absolute top-0 left-0 right-0 h-px bg-gray-700" 
                     style={{ 
                       left: 'calc(25% - 1rem)', // rough estimation, purely CSS org chart requires tricky widths
                       right: 'calc(25% - 1rem)'
                     }}></div>
              )}
              {node.children.map((child: any) => (
                <div key={child.id} className="relative">
                  {/* Vertical line down to child */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-px h-6 bg-gray-700"></div>
                  {renderNode(child)}
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
      
      <main className="flex-grow flex flex-col h-screen">
        <div className="p-6 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 bg-[#05080d] z-20">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Network size={20} className="text-teal-400" />
              Organizational Chart
            </h1>
            <p className="text-xs text-gray-400">
              Interactive visual hierarchy of MT UniPOS staff.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search employee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-gray-800 pl-9 pr-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500 placeholder-gray-600"
              />
            </div>
            <div className="flex items-center gap-1 bg-black border border-gray-800 rounded-xl p-1">
              <button onClick={() => setZoom(z => Math.max(0.4, z - 0.2))} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"><ZoomOut size={14}/></button>
              <span className="text-[10px] font-mono text-gray-500 w-8 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(2, z + 0.2))} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"><ZoomIn size={14}/></button>
              <button onClick={() => setZoom(1)} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition ml-1 border-l border-gray-800"><Maximize size={14}/></button>
            </div>
          </div>
        </div>

        <div className="flex-grow relative overflow-auto bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
          {hrEmployees.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
              No employee data found to build chart.
            </div>
          ) : (
            <div 
              className="min-w-max min-h-max p-20 flex justify-center transform origin-top transition-transform duration-300 ease-out"
              style={{ transform: `scale(${zoom})` }}
            >
              {orgTree.length > 0 ? (
                <div className="flex gap-16">
                  {orgTree.map(root => renderNode(root))}
                </div>
              ) : (
                <div className="text-gray-500">Circular reporting structure detected or missing root nodes.</div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
