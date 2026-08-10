"use client";

import React, { useState } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import { useGlobalContext } from "@/context/global-context";
import { Gift, Award, CalendarDays, Filter, Send } from "lucide-react";

export default function HRBirthdaysPage() {
  const { hrEmployees } = useGlobalContext();
  const [filterDept, setFilterDept] = useState("All");

  // Generate mock birthdays based on employee ID hash
  const generateMockDOB = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const day = Math.abs(hash) % 28 + 1;
    const month = Math.abs(hash) % 12;
    const currentYear = new Date().getFullYear();
    const dob = new Date(currentYear, month, day);
    return dob;
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDays = new Date(today);
    thirtyDays.setDate(today.getDate() + 30);

    const events = hrEmployees.flatMap(emp => {
      if (filterDept !== "All" && emp.department !== filterDept) return [];
      
      const res = [];
      const dob = generateMockDOB(emp.id);
      if (dob >= today && dob <= thirtyDays) {
        res.push({ type: "Birthday", date: dob, emp, days: Math.floor((dob.getTime() - today.getTime())/(1000*3600*24)) });
      }

      if (emp.joiningDate) {
        const joinDate = new Date(emp.joiningDate);
        const annivDate = new Date(today.getFullYear(), joinDate.getMonth(), joinDate.getDate());
        if (annivDate < today) annivDate.setFullYear(today.getFullYear() + 1);
        
        if (annivDate >= today && annivDate <= thirtyDays) {
          const years = annivDate.getFullYear() - joinDate.getFullYear();
          if (years > 0) {
            res.push({ type: "Anniversary", date: annivDate, emp, years, days: Math.floor((annivDate.getTime() - today.getTime())/(1000*3600*24)) });
          }
        }
      }
      return res;
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const events = getUpcomingEvents();
  const todayEvents = events.filter(e => e.days === 0);
  const upcomingEvents = events.filter(e => e.days > 0);
  const depts = ["All", ...Array.from(new Set(hrEmployees.map(e => e.department)))];

  const handleSendWishes = (name: string, type: string) => {
    alert(\`🎉 Sent Happy \${type} wishes to \${name} via email/slack!\`);
  };

  return (
    <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans">
      <HRMSSidebar />
      <main className="flex-grow p-6 space-y-6 overflow-y-auto max-h-screen">
        <div className="flex justify-between items-center border-b border-gray-800 pb-5">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Gift size={20} className="text-pink-400" /> Celebrations &amp; Milestones
            </h1>
            <p className="text-xs text-gray-400">Track upcoming birthdays and work anniversaries.</p>
          </div>
          <div className="flex items-center gap-2 bg-[#0b0f17] border border-gray-800 p-2 rounded-2xl">
            <Filter size={14} className="text-gray-500" />
            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="bg-black border border-gray-800 text-white text-xs p-1.5 rounded-xl">
              {depts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {todayEvents.length > 0 && (
          <div className="bg-gradient-to-r from-pink-900/40 to-purple-900/40 border border-pink-500/30 p-6 rounded-2xl">
            <h2 className="text-lg font-black text-white flex items-center gap-2 mb-4">🎉 Today's Celebrations!</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {todayEvents.map((evt, idx) => (
                <div key={idx} className="bg-black/50 backdrop-blur border border-pink-500/20 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-black">
                      {evt.type === 'Birthday' ? <Gift size={20}/> : <Award size={20}/>}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{evt.emp.name}</p>
                      <p className="text-[10px] text-pink-300">
                        {evt.type} {evt.years ? \`(\${evt.years} Years)\` : ''}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => handleSendWishes(evt.emp.name, evt.type)} className="p-2 bg-pink-600 hover:bg-pink-500 rounded-lg text-white transition">
                    <Send size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl overflow-hidden shadow-xl p-6">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CalendarDays size={16} className="text-gray-500" /> Upcoming Next 30 Days
          </h2>
          
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-gray-500 italic p-4 text-center">No upcoming events in the next 30 days.</p>
            ) : upcomingEvents.map((evt, idx) => (
              <div key={idx} className="bg-black border border-gray-800 p-4 rounded-xl flex items-center justify-between hover:border-gray-700 transition">
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[50px]">
                    <div className="text-[10px] text-gray-500 uppercase font-bold">{evt.date.toLocaleDateString('en-US', { month: 'short' })}</div>
                    <div className="text-xl font-black text-white">{evt.date.getDate()}</div>
                  </div>
                  <div className={\`w-1 h-10 rounded-full \${evt.type === 'Birthday' ? 'bg-pink-500' : 'bg-purple-500'}\`}></div>
                  <div>
                    <p className="text-sm font-bold text-white">{evt.emp.name}</p>
                    <p className="text-xs text-gray-400">{evt.emp.department} &bull; {evt.emp.designation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={\`text-xs font-bold \${evt.type === 'Birthday' ? 'text-pink-400' : 'text-purple-400'}\`}>
                      {evt.type} {evt.years ? \`(\${evt.years} Years)\` : ''}
                    </p>
                    <p className="text-[10px] text-gray-500">in {evt.days} days</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
