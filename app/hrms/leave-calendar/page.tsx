"use client";

import React, { useState } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import { useGlobalContext } from "@/context/global-context";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Info } from "lucide-react";

export default function HRLeaveCalendarPage() {
  const { hrLeaves, hrEmployees } = useGlobalContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterDept, setFilterDept] = useState("All");

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const depts = ["All", ...Array.from(new Set(hrEmployees.map(e => e.department)))];

  const approvedLeaves = hrLeaves.filter(l => l.status === "Approved");

  const getLeaveColor = (type: string) => {
    switch(type) {
      case "Casual": return "bg-sky-500/20 border-sky-500/50 text-sky-400";
      case "Sick": return "bg-amber-500/20 border-amber-500/50 text-amber-400";
      case "Annual": return "bg-emerald-500/20 border-emerald-500/50 text-emerald-400";
      case "Maternity": return "bg-pink-500/20 border-pink-500/50 text-pink-400";
      default: return "bg-gray-500/20 border-gray-500/50 text-gray-400";
    }
  };

  const leavesForDate = (day: number) => {
    const dateStr = \`\${currentDate.getFullYear()}-\${String(currentDate.getMonth() + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
    return approvedLeaves.filter(l => {
      const emp = hrEmployees.find(e => e.id === l.employeeId);
      if (filterDept !== "All" && emp?.department !== filterDept) return false;
      return l.startDate <= dateStr && l.endDate >= dateStr;
    });
  };

  return (
    <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans">
      <HRMSSidebar />
      <main className="flex-grow p-6 space-y-6 overflow-y-auto max-h-screen">
        <div className="flex justify-between items-center border-b border-gray-800 pb-5">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <CalendarIcon size={20} className="text-sky-400" /> Leave Calendar
            </h1>
            <p className="text-xs text-gray-400">Visual overview of employee absences.</p>
          </div>
          <div className="flex gap-2 bg-[#0b0f17] border border-gray-800 p-2 rounded-2xl">
            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="bg-black border border-gray-800 text-white text-xs p-1.5 rounded-xl">
              {depts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl overflow-hidden shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <button onClick={prevMonth} className="p-2 bg-gray-800 rounded-xl hover:bg-gray-700 transition"><ChevronLeft size={16} /></button>
            <h2 className="text-lg font-bold text-white">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <button onClick={nextMonth} className="p-2 bg-gray-800 rounded-xl hover:bg-gray-700 transition"><ChevronRight size={16} /></button>
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-800 rounded-xl overflow-hidden border border-gray-800">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="bg-black/60 p-2 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">{d}</div>
            ))}
            
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={\`empty-\${i}\`} className="bg-[#0c1018] min-h-[100px] p-2" />
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const leaves = leavesForDate(day);
              const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
              
              return (
                <div key={day} className={\`bg-black min-h-[100px] p-2 flex flex-col gap-1 border-t border-gray-800/50 \${isToday ? 'bg-sky-900/10' : ''}\`}>
                  <div className="flex justify-between items-start">
                    <span className={\`text-xs font-bold \${isToday ? 'bg-sky-500 text-white px-1.5 rounded-md' : 'text-gray-500'}\`}>{day}</span>
                  </div>
                  <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-[70px] no-scrollbar">
                    {leaves.map((l, idx) => (
                      <div key={idx} className={\`text-[9px] truncate px-1.5 py-0.5 rounded border \${getLeaveColor(l.leaveType)}\`}>
                        {l.employeeName.split(' ')[0]}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-4 items-center justify-center text-xs">
            <span className="flex items-center gap-1 text-gray-400"><div className="w-3 h-3 rounded-sm bg-sky-500/20 border border-sky-500/50"></div> Casual</span>
            <span className="flex items-center gap-1 text-gray-400"><div className="w-3 h-3 rounded-sm bg-amber-500/20 border border-amber-500/50"></div> Sick</span>
            <span className="flex items-center gap-1 text-gray-400"><div className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500/50"></div> Annual</span>
            <span className="flex items-center gap-1 text-gray-400"><div className="w-3 h-3 rounded-sm bg-pink-500/20 border border-pink-500/50"></div> Maternity</span>
            <span className="flex items-center gap-1 text-gray-400"><div className="w-3 h-3 rounded-sm bg-gray-500/20 border border-gray-500/50"></div> Unpaid</span>
          </div>
        </div>
      </main>
    </div>
  );
}
