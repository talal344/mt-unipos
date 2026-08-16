"use client";

import React, { useState } from "react";
import { useSMS, TransportRoute } from "@/context/sms-context";
import {
  Bus,
  Plus,
  Users,
  Phone,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Clock,
  Car
} from "lucide-react";

export default function SMSTransportPage() {
  const { theme, transportRoutes } = useSMS();
  const isLight = theme === "light";

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${isLight ? "border-slate-200" : "border-gray-800"} pb-4`}>
        <div>
          <h1 className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-2`}>
            <Bus className={isLight ? "text-sky-600" : "text-sky-400"} size={22} />
            <span>School Transport &amp; Bus Fleet Management</span>
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Manage school van and bus routes, driver contact points, student pickup allocations, and monthly transport dues.
          </p>
        </div>

        <button
          onClick={() => alert("Add Bus Route modal")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-600/20 transition cursor-pointer"
        >
          <Plus size={14} />
          <span>Add Transport Route</span>
        </button>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {transportRoutes.map((route) => (
          <div key={route.id} className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl p-6 space-y-4`}>
            <div className="flex justify-between items-center">
              <span className={`text-xs font-mono font-bold ${
                isLight ? "bg-sky-50 text-sky-700 border-sky-300" : "bg-sky-500/10 text-sky-400 border-sky-500/20"
              } border px-2.5 py-1 rounded-lg`}>
                {route.routeCode}
              </span>
              <span className={`text-xs font-bold ${isLight ? "text-emerald-700 font-black" : "text-emerald-400"}`}>
                Rs {route.monthlyFeePerStudent.toLocaleString()} / Student
              </span>
            </div>

            <h3 className={`text-base font-black ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-2`}>
              <MapPin size={16} className={`${isLight ? "text-sky-600" : "text-sky-400"} shrink-0`} />
              <span>{route.routeName}</span>
            </h3>

            <div className={`grid grid-cols-2 gap-2 text-xs ${isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-gray-800"} border p-3 rounded-xl`}>
              <div>
                <span className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-500"} uppercase block font-bold`}>Assigned Vehicle</span>
                <span className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{route.vehicleNumber}</span>
              </div>
              <div>
                <span className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-500"} uppercase block font-bold`}>Capacity Filled</span>
                <span className={`font-bold ${isLight ? "text-sky-700" : "text-sky-400"}`}>{route.assignedStudentsCount} / {route.totalSeats} Seats</span>
              </div>
              <div>
                <span className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-500"} uppercase block font-bold`}>Driver Name</span>
                <span className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{route.driverName}</span>
              </div>
              <div>
                <span className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-500"} uppercase block font-bold`}>Driver Hotline</span>
                <span className={`font-bold ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>{route.driverPhone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
