"use client";

import React from "react";
import { useGlobalContext } from "@/context/global-context";
import { User, Award, Calendar, Building2, ShieldCheck, Clock, Sparkles } from "lucide-react";

export default function HRMSTopHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  const { currentUser, hrEmployees, businessSettings } = useGlobalContext();

  // Find employee matching logged-in user email
  const empMatch = hrEmployees.find(
    (e) => e.email?.toLowerCase().trim() === currentUser?.email?.toLowerCase().trim()
  );

  const name = empMatch?.name || currentUser?.name || "Corporate Executive";
  const designation = empMatch?.designation || (currentUser?.role === "Owner" ? "Business Owner / Executive Director" : `${currentUser?.role || 'Executive'} Administrator`);
  const department = empMatch?.department || (currentUser?.email?.includes("it@") ? "IT & Software Operations" : currentUser?.email?.includes("hr@") ? "Human Resources" : "Executive Board");
  const joiningDateStr = empMatch?.joiningDate || "2024-01-15";

  // Calculate Tenure
  const startDate = new Date(joiningDateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - startDate.getTime());
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const years = Math.floor(totalDays / 365);
  const months = Math.floor((totalDays % 365) / 30);
  const days = totalDays % 30;

  let tenureText = "";
  if (years > 0) tenureText += `${years}y `;
  if (months > 0) tenureText += `${months}m `;
  tenureText += `${days}d (${totalDays} Days Tenure)`;

  const formattedJoining = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className="bg-[#090d16] border-b border-emerald-500/20 p-4 space-y-3">
      {/* Logged-In User Corporate Profile & Tenure Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-black/60 p-3 rounded-2xl border border-gray-800/80 shadow-lg">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <User size={18} />
            </div>
            <div>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Logged-In User</span>
              <strong className="text-sm font-black text-white">{name}</strong>
            </div>
          </div>

          <div className="hidden sm:block h-7 w-[1px] bg-gray-800"></div>

          <div>
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Designation / Role</span>
            <span className="text-xs font-extrabold text-emerald-400">{designation}</span>
          </div>

          <div className="hidden sm:block h-7 w-[1px] bg-gray-800"></div>

          <div>
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Department</span>
            <span className="text-xs font-bold text-gray-300 flex items-center gap-1">
              <Building2 size={12} className="text-sky-400" /> {department}
            </span>
          </div>

          <div className="hidden md:block h-7 w-[1px] bg-gray-800"></div>

          <div className="hidden md:block">
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Joining Date</span>
            <span className="text-xs font-mono font-bold text-gray-300 flex items-center gap-1">
              <Calendar size={12} className="text-amber-400" /> {formattedJoining}
            </span>
          </div>
        </div>

        {/* Tenure Days Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-black shadow-md">
          <Award size={15} className="text-emerald-400 animate-pulse" />
          <span>{tenureText}</span>
        </div>
      </div>

      {title && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
