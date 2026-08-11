"use client";

import React, { useState, useMemo, useEffect } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import { useGlobalContext } from "@/context/global-context";
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Filter,
  Users,
  Sun,
  Moon,
  Sunset,
  Coffee,
  Check
} from "lucide-react";

interface ShiftCell {
  shiftType: "Morning" | "Evening" | "Night" | "Off";
}

export default function HRShiftPlannerPage() {
  const { currentUser, hrEmployees, hrDepartments } = useGlobalContext();
  const [selectedDept, setSelectedDept] = useState("All");

  // Current week state
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const weekDays = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sun
    const distanceToMon = (currentDay + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMon + currentWeekOffset * 7);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push({
        name: d.toLocaleDateString("en-US", { weekday: "short" }),
        dateStr: d.toISOString().split("T")[0],
        dayNum: d.getDate(),
        month: d.toLocaleDateString("en-US", { month: "short" })
      });
    }
    return days;
  }, [currentWeekOffset]);

  // Roster schedule map: employeeId -> dateStr -> "Morning" | "Evening" | "Night" | "Off"
  const [roster, setRoster] = useState<Record<string, Record<string, "Morning" | "Evening" | "Night" | "Off">>>({});

  useEffect(() => {
    if (currentUser?.tenantId) {
      const key = `hr_shift_roster_${currentUser.tenantId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        setRoster(JSON.parse(saved));
      }
    }
  }, [currentUser?.tenantId]);

  const saveRoster = (data: Record<string, Record<string, "Morning" | "Evening" | "Night" | "Off">>) => {
    setRoster(data);
    if (currentUser?.tenantId) {
      localStorage.setItem(`hr_shift_roster_${currentUser.tenantId}`, JSON.stringify(data));
    }
  };

  const getShift = (empId: string, dateStr: string): "Morning" | "Evening" | "Night" | "Off" => {
    if (roster[empId] && roster[empId][dateStr]) {
      return roster[empId][dateStr];
    }
    // Default: Weekdays morning, weekend Off
    const day = new Date(dateStr).getDay();
    return day === 0 || day === 6 ? "Off" : "Morning";
  };

  const cycleShift = (empId: string, dateStr: string) => {
    const current = getShift(empId, dateStr);
    const order: Array<"Morning" | "Evening" | "Night" | "Off"> = ["Morning", "Evening", "Night", "Off"];
    const nextIdx = (order.indexOf(current) + 1) % order.length;
    const nextShift = order[nextIdx];

    const updated = {
      ...roster,
      [empId]: {
        ...(roster[empId] || {}),
        [dateStr]: nextShift
      }
    };
    saveRoster(updated);
  };

  const filteredEmployees = useMemo(() => {
    return hrEmployees.filter((e) => {
      const matchDept = selectedDept === "All" || e.department === selectedDept;
      const matchActive = e.status === "Active";
      return matchDept && matchActive;
    });
  }, [hrEmployees, selectedDept]);

  const getShiftBadge = (shift: string) => {
    switch (shift) {
      case "Morning":
        return {
          bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20",
          icon: <Sun size={12} className="text-emerald-400 shrink-0" />,
          label: "09:00 - 18:00"
        };
      case "Evening":
        return {
          bg: "bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/20",
          icon: <Sunset size={12} className="text-sky-400 shrink-0" />,
          label: "14:00 - 23:00"
        };
      case "Night":
        return {
          bg: "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20",
          icon: <Moon size={12} className="text-purple-400 shrink-0" />,
          label: "23:00 - 08:00"
        };
      default:
        return {
          bg: "bg-gray-900/60 text-gray-500 border-gray-800 hover:bg-gray-800",
          icon: <Coffee size={12} className="text-gray-500 shrink-0" />,
          label: "Weekly Off"
        };
    }
  };

  return (
    <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans">
      <HRMSSidebar />
      <main className="flex-grow p-6 space-y-6 overflow-y-auto max-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-5">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <CalendarRange size={22} className="text-emerald-400" />
              Visual Shift Planner & Weekly Duty Roster
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Click any schedule cell to cycle shifts (Morning &rarr; Evening &rarr; Night &rarr; Off).
            </p>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center gap-2 bg-[#0b0f17] border border-gray-800 p-1.5 rounded-2xl">
            <button
              onClick={() => setCurrentWeekOffset((prev) => prev - 1)}
              className="p-1.5 hover:bg-gray-800 rounded-xl text-gray-400 hover:text-white transition"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-gray-200 px-3 font-mono">
              {weekDays[0].name} {weekDays[0].dayNum} {weekDays[0].month} &mdash; {weekDays[6].name} {weekDays[6].dayNum} {weekDays[6].month}
            </span>
            <button
              onClick={() => setCurrentWeekOffset((prev) => prev + 1)}
              className="p-1.5 hover:bg-gray-800 rounded-xl text-gray-400 hover:text-white transition"
            >
              <ChevronRight size={16} />
            </button>
            {currentWeekOffset !== 0 && (
              <button
                onClick={() => setCurrentWeekOffset(0)}
                className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg hover:bg-emerald-500/20 transition"
              >
                Current Week
              </button>
            )}
          </div>
        </div>

        {/* Legend & Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0b0f17] border border-gray-800 p-3 rounded-2xl">
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
            <span className="text-gray-500 text-[10px] uppercase tracking-wider">Shift Legend:</span>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Sun size={14} /> Morning (09-18)
            </div>
            <div className="flex items-center gap-1.5 text-sky-400">
              <Sunset size={14} /> Evening (14-23)
            </div>
            <div className="flex items-center gap-1.5 text-purple-400">
              <Moon size={14} /> Night (23-08)
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <Coffee size={14} /> Weekly Off
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-black border border-gray-800 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Departments</option>
              {hrDepartments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Roster Calendar Matrix */}
        <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-800 bg-black/60 font-mono text-gray-400 uppercase text-[10px]">
                  <th className="p-4 w-64">Staff Member</th>
                  {weekDays.map((d) => (
                    <th key={d.dateStr} className="p-3 text-center min-w-[120px]">
                      <div className="font-bold text-white text-xs">{d.name}</div>
                      <div className="text-[10px] text-emerald-400">
                        {d.month} {d.dayNum}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500 text-xs">
                      No active staff found for this department.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-emerald-500/5 transition">
                      <td className="p-3.5 border-r border-gray-800/80 bg-black/20">
                        <div className="font-bold text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black flex items-center justify-center border border-emerald-500/30">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <div>{emp.name}</div>
                            <div className="text-[10px] text-gray-500 font-mono">{emp.designation}</div>
                          </div>
                        </div>
                      </td>
                      {weekDays.map((d) => {
                        const shift = getShift(emp.id, d.dateStr);
                        const badge = getShiftBadge(shift);
                        return (
                          <td key={d.dateStr} className="p-2 text-center">
                            <button
                              onClick={() => cycleShift(emp.id, d.dateStr)}
                              className={`w-full py-2 px-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition cursor-pointer active:scale-95 ${badge.bg}`}
                              title="Click to cycle shift"
                            >
                              <div className="flex items-center gap-1 font-bold text-[11px]">
                                {badge.icon}
                                {shift}
                              </div>
                              <div className="text-[9px] opacity-75 font-mono">{badge.label}</div>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
