"use client";

import React, { useMemo, useState } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import { useGlobalContext } from "@/context/global-context";
import { Trophy, Star, Award, Medal, Filter, Calendar } from "lucide-react";

export default function PerformanceLeaderboardPage() {
  const { hrEmployees, hrAttendance, hrAppraisals } = useGlobalContext();
  const [selectedDept, setSelectedDept] = useState("All");
  
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const leaderboard = useMemo(() => {
    return hrEmployees.map(emp => {
      // 1. Avg appraisal rating
      const empAppraisals = hrAppraisals.filter(a => a.employeeId === emp.id);
      let avgRating = 0;
      if (empAppraisals.length > 0) {
        avgRating = empAppraisals.reduce((acc, curr) => acc + curr.rating, 0) / empAppraisals.length;
      }
      
      const appraisalScore = avgRating * 20; // max 100

      // 2. Attendance this month
      const empAttendanceThisMonth = hrAttendance.filter(a => 
        a.employeeId === emp.id && a.date.startsWith(selectedMonth)
      );
      
      const totalDays = empAttendanceThisMonth.length;
      const presentDays = empAttendanceThisMonth.filter(a => a.status === "Present").length;
      
      const attendancePercent = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
      const attendanceBonus = attendancePercent * 0.3; // max 30

      // 3. Perfect attendance bonus
      const perfectAttendanceBonus = (totalDays > 0 && totalDays === presentDays) ? 10 : 0;

      // 4. No late arrivals
      const lateDays = empAttendanceThisMonth.filter(a => a.status === "Late").length;
      const noLateBonus = (totalDays > 0 && lateDays === 0) ? 5 : 0;

      const totalScore = Math.round(appraisalScore + attendanceBonus + perfectAttendanceBonus + noLateBonus);

      return {
        ...emp,
        score: totalScore,
        details: {
          appraisalScore: Math.round(appraisalScore),
          attendanceBonus: Math.round(attendanceBonus),
          perfectAttendanceBonus,
          noLateBonus
        }
      };
    })
    .filter(emp => selectedDept === "All" || emp.department === selectedDept)
    .sort((a, b) => b.score - a.score);
  }, [hrEmployees, hrAppraisals, hrAttendance, selectedDept, selectedMonth]);

  const departments = ["All", ...Array.from(new Set(hrEmployees.map(e => e.department)))];

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans">
      <HRMSSidebar />
      
      <main className="flex-grow p-6 space-y-8 overflow-y-auto max-h-screen relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Trophy size={20} className="text-amber-400" />
              Performance Leaderboard
            </h1>
            <p className="text-xs text-gray-400">
              Monthly ranking based on appraisals, attendance, and punctuality.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-black border border-gray-800 p-2 rounded-xl">
              <Filter size={14} className="text-gray-500" />
              <select 
                value={selectedDept} 
                onChange={e => setSelectedDept(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none"
              >
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            
            <div className="flex items-center gap-2 bg-black border border-gray-800 p-2 rounded-xl">
              <Calendar size={14} className="text-gray-500" />
              <input 
                type="month" 
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {/* Podium */}
        {top3.length > 0 && (
          <div className="flex justify-center items-end gap-2 sm:gap-6 pt-10 pb-4">
            {/* Rank 2 - Silver */}
            {top3[1] && (
              <div className="flex flex-col items-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="relative mb-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 p-1">
                    <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-xl font-black">
                      {top3[1].name.charAt(0)}
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-gray-200 text-black text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-black">
                    2
                  </div>
                </div>
                <div className="text-center mb-4">
                  <p className="text-xs font-bold text-white max-w-[100px] truncate">{top3[1].name}</p>
                  <p className="text-[10px] text-gray-500">{top3[1].department}</p>
                </div>
                <div className="w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-t from-gray-500/20 to-gray-400/40 rounded-t-2xl border-t border-l border-r border-gray-400/50 flex items-center justify-center flex-col shadow-[0_0_30px_rgba(156,163,175,0.1)]">
                  <span className="text-gray-300 font-black text-xl">{top3[1].score}</span>
                  <span className="text-[9px] uppercase tracking-wider text-gray-400">pts</span>
                </div>
              </div>
            )}

            {/* Rank 1 - Gold */}
            {top3[0] && (
              <div className="flex flex-col items-center animate-fade-in-up z-10">
                <div className="text-2xl mb-1 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">👑</div>
                <div className="relative mb-2">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-600 p-1 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                    <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-2xl font-black text-amber-400">
                      {top3[0].name.charAt(0)}
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-amber-400 text-black text-[12px] font-black w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-black">
                    1
                  </div>
                </div>
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-1">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <p className="text-sm font-black text-white max-w-[120px] truncate">{top3[0].name}</p>
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                  </div>
                  <p className="text-[10px] text-amber-400/70 font-bold uppercase tracking-wider">{top3[0].department}</p>
                </div>
                <div className="w-28 sm:w-40 h-32 sm:h-44 bg-gradient-to-t from-amber-600/20 to-amber-400/40 rounded-t-2xl border-t border-l border-r border-amber-400/50 flex items-center justify-center flex-col shadow-[0_0_40px_rgba(245,158,11,0.2)]">
                  <span className="text-amber-400 font-black text-3xl">{top3[0].score}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500/70">Points</span>
                </div>
              </div>
            )}

            {/* Rank 3 - Bronze */}
            {top3[2] && (
              <div className="flex flex-col items-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="relative mb-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 p-1">
                    <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-xl font-black text-amber-700">
                      {top3[2].name.charAt(0)}
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-amber-700 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-black">
                    3
                  </div>
                </div>
                <div className="text-center mb-4">
                  <p className="text-xs font-bold text-white max-w-[100px] truncate">{top3[2].name}</p>
                  <p className="text-[10px] text-gray-500">{top3[2].department}</p>
                </div>
                <div className="w-24 sm:w-32 h-20 sm:h-24 bg-gradient-to-t from-amber-900/20 to-amber-800/40 rounded-t-2xl border-t border-l border-r border-amber-800/50 flex items-center justify-center flex-col shadow-[0_0_30px_rgba(180,83,9,0.1)]">
                  <span className="text-amber-600 font-black text-xl">{top3[2].score}</span>
                  <span className="text-[9px] uppercase tracking-wider text-amber-700">pts</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* List of remaining employees */}
        <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-4 shadow-xl">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Rankings</h3>
          <div className="space-y-2">
            {rest.map((emp, idx) => (
              <div key={emp.id} className="flex items-center gap-4 bg-black/40 hover:bg-gray-800/30 p-3 rounded-xl border border-gray-800/50 transition group">
                <div className="w-8 text-center text-xs font-black text-gray-500 group-hover:text-amber-400 transition">
                  #{idx + 4}
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-white">{emp.name}</p>
                    <p className="text-[10px] text-gray-500">{emp.designation} • {emp.department}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Score Bar */}
                    <div className="hidden sm:block w-32 md:w-64 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                        style={{ width: `${Math.min((emp.score / 145) * 100, 100)}%` }} // 145 is max possible roughly
                      />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-white">{emp.score} <span className="text-[10px] font-normal text-gray-500">pts</span></p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <div className="text-center p-8 text-gray-500 italic text-xs">
                No employees found for the selected criteria.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
