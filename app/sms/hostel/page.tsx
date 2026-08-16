"use client";

import React, { useState } from "react";
import { useSMS } from "@/context/sms-context";
import {
  BedDouble,
  Utensils,
  Plus,
  CheckCircle2,
  Users,
  Building2,
  Calendar,
  Sparkles
} from "lucide-react";

export default function SMSHostelPage() {
  const { theme, hostelRooms, messMenu } = useSMS();
  const isLight = theme === "light";

  const [activeTab, setActiveTab] = useState<"rooms" | "mess">("rooms");

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${isLight ? "border-slate-200" : "border-gray-800"} pb-4`}>
        <div>
          <h1 className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-2`}>
            <BedDouble className={isLight ? "text-sky-600" : "text-sky-400"} size={22} />
            <span>Hostel Boarding &amp; 7-Day Mess Nutrition Matrix</span>
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Manage residential hostel blocks, room bed allocations, warden night rolls, and weekly dietary meal plans.
          </p>
        </div>

        <div className={`flex gap-1 ${isLight ? "bg-slate-100 border-slate-200" : "bg-[#0b121e] border-[#1e293b]"} border p-1 rounded-xl`}>
          <button
            onClick={() => setActiveTab("rooms")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === "rooms"
                ? "bg-sky-600 text-white shadow-sm"
                : isLight
                ? "text-slate-700 hover:text-slate-950"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Hostel Rooms ({hostelRooms.length})
          </button>
          <button
            onClick={() => setActiveTab("mess")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === "mess"
                ? "bg-sky-600 text-white shadow-sm"
                : isLight
                ? "text-slate-700 hover:text-slate-950"
                : "text-gray-400 hover:text-white"
            }`}
          >
            7-Day Mess Menu
          </button>
        </div>
      </div>

      {/* Tab 1: Rooms */}
      {activeTab === "rooms" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hostelRooms.map((room) => (
            <div key={room.id} className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl p-5 space-y-3`}>
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-mono font-bold ${
                  isLight ? "bg-sky-50 text-sky-700 border-sky-300" : "bg-sky-500/10 text-sky-400 border-sky-500/20"
                } border px-2 py-0.5 rounded`}>
                  {room.buildingName}
                </span>
                <span className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>{room.floor}</span>
              </div>

              <h3 className={`text-base font-black ${isLight ? "text-slate-900" : "text-white"}`}>{room.roomNumber}</h3>

              <div className={`${isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-gray-800"} border p-3 rounded-xl space-y-1.5 text-xs`}>
                <div className="flex justify-between">
                  <span className={isLight ? "text-slate-500" : "text-gray-400"}>Bed Occupancy:</span>
                  <b className={isLight ? "text-sky-700" : "text-sky-300"}>{room.occupiedBeds} / {room.totalBeds} Beds Filled</b>
                </div>
                <div className="flex justify-between">
                  <span className={isLight ? "text-slate-500" : "text-gray-400"}>Monthly Boarding Fee:</span>
                  <b className={isLight ? "text-emerald-700" : "text-emerald-400"}>Rs {room.monthlyFee.toLocaleString()}</b>
                </div>
                <div className="flex justify-between">
                  <span className={isLight ? "text-slate-500" : "text-gray-400"}>Hostel Warden:</span>
                  <b className={isLight ? "text-slate-800" : "text-gray-200"}>{room.wardenName}</b>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: 7-Day Mess Menu */}
      {activeTab === "mess" && (
        <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl overflow-hidden shadow-2xl`}>
          <div className={`p-4 border-b ${isLight ? "border-slate-100 bg-slate-50/80" : "border-gray-800 bg-black/40"} flex justify-between items-center`}>
            <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-xs uppercase tracking-wider flex items-center gap-2`}>
              <Utensils size={14} className={isLight ? "text-amber-600" : "text-amber-400"} />
              <span>Weekly Nutritional Dining Menu (Breakfast • Lunch • Dinner)</span>
            </h3>
            <span className={`text-[10px] ${isLight ? "text-emerald-700 font-bold" : "text-emerald-400"} font-mono`}>Hygienic &amp; Balanced</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b ${isLight ? "border-slate-200 text-slate-600 bg-slate-100/70" : "border-gray-800 text-gray-400 bg-black/20"} font-mono text-[10px]`}>
                  <th className="p-4 font-bold">Day of Week</th>
                  <th className={`p-4 font-bold ${isLight ? "text-amber-700" : "text-amber-400"}`}>🍳 Breakfast (07:00 AM)</th>
                  <th className={`p-4 font-bold ${isLight ? "text-sky-700" : "text-sky-400"}`}>🍲 Lunch (01:30 PM)</th>
                  <th className={`p-4 font-bold ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>🍗 Dinner (08:00 PM)</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? "divide-slate-100" : "divide-gray-800/50"} font-sans text-xs`}>
                {messMenu.map((m) => (
                  <tr key={m.day} className={`${isLight ? "hover:bg-slate-50/80" : "hover:bg-white/[0.02]"} transition`}>
                    <td className={`p-4 font-black ${isLight ? "text-slate-900" : "text-white"} font-mono`}>{m.day}</td>
                    <td className={`p-4 ${isLight ? "text-slate-700" : "text-gray-300"}`}>{m.breakfast}</td>
                    <td className={`p-4 ${isLight ? "text-slate-700" : "text-gray-300"}`}>{m.lunch}</td>
                    <td className={`p-4 ${isLight ? "text-slate-700" : "text-gray-300"}`}>{m.dinner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
