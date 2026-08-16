"use client";

import React, { useState } from "react";
import { useSMS, HouseRecord, HousePointEvent } from "@/context/sms-context";
import {
  Trophy,
  Plus,
  Award,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  X,
  Medal,
  Star,
  Users
} from "lucide-react";

export default function SMSHouseSystemPage() {
  const { theme, houses, housePointEvents, awardHousePoints, students } = useSMS();
  const isLight = theme === "light";

  const [showAwardModal, setShowAwardModal] = useState(false);
  const [awardForm, setAwardForm] = useState({
    houseName: "Jinnah House" as HouseRecord["name"],
    studentName: "Ahmed Talal",
    studentId: "STU-001",
    eventType: "Academic Distinction" as HousePointEvent["eventType"],
    points: 25,
    awardedBy: "Prof. Muhammad Aslam (Principal)"
  });

  const sortedHouses = [...houses].sort((a, b) => b.totalPoints - a.totalPoints);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    awardHousePoints(awardForm);
    setShowAwardModal(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${isLight ? "border-slate-200" : "border-gray-800"} pb-4`}>
        <div>
          <h1 className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-2`}>
            <Trophy className={isLight ? "text-amber-600" : "text-amber-400"} size={22} />
            <span>School House Championship, Merits &amp; Disciplinary System</span>
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Track inter-house championship points, star student academic merits, sports gala trophies, and student disciplinary infractions.
          </p>
        </div>

        <button
          onClick={() => setShowAwardModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-black text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
        >
          <Award size={14} />
          <span>Award House Points / Infraction</span>
        </button>
      </div>

      {/* Houses Leaderboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedHouses.map((house, idx) => (
          <div
            key={house.id}
            className={`${
              isLight ? "bg-white border-slate-200 shadow-sm hover:border-amber-400" : "bg-[#0b121e] border-[#1e293b] hover:border-amber-500/40"
            } border rounded-2xl p-5 space-y-3 relative overflow-hidden group transition`}
          >
            <div
              className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20"
              style={{ backgroundColor: house.color }}
            />

            <div className="flex justify-between items-center">
              <span
                className="text-xs font-black px-2.5 py-0.5 rounded-md uppercase text-white shadow-sm"
                style={{ backgroundColor: house.color }}
              >
                {idx === 0 ? "👑 Rank 1" : `#${idx + 1} House`}
              </span>
              <span className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"} font-mono flex items-center gap-1`}>
                <Trophy size={11} className={isLight ? "text-amber-600" : "text-amber-400"} />
                <span>{house.trophiesCount} Trophies</span>
              </span>
            </div>

            <div>
              <h3 className={`text-base font-black ${isLight ? "text-slate-900" : "text-white"}`}>{house.name}</h3>
              <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"} italic`}>"{house.motto}"</p>
            </div>

            <div className={`pt-2 border-t ${isLight ? "border-slate-100" : "border-gray-800"} flex justify-between items-end`}>
              <div>
                <span className={`text-[9px] ${isLight ? "text-slate-500" : "text-gray-500"} uppercase block`}>House Master</span>
                <span className={`text-xs font-bold ${isLight ? "text-slate-800" : "text-gray-200"}`}>{house.houseMaster}</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black" style={{ color: house.color }}>
                  {house.totalPoints}
                </span>
                <span className={`text-[9px] ${isLight ? "text-slate-500" : "text-gray-500"} block`}>PTS</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* House Point Events Feed */}
      <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl overflow-hidden shadow-2xl`}>
        <div className={`p-4 border-b ${isLight ? "border-slate-100 bg-slate-50/80" : "border-gray-800 bg-black/40"} flex justify-between items-center`}>
          <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-xs uppercase tracking-wider`}>
            Recent Merit Awards &amp; Disciplinary Events ({housePointEvents.length})
          </h3>
          <span className={`text-[10px] ${isLight ? "text-amber-700 font-bold" : "text-amber-400"} font-mono`}>Real-time House Scoreboard</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b ${isLight ? "border-slate-200 text-slate-600 bg-slate-100/70" : "border-gray-800 text-gray-400 bg-black/20"} font-mono text-[10px]`}>
                <th className="p-3.5 font-bold">House</th>
                <th className="p-3.5 font-bold">Student Name</th>
                <th className="p-3.5 font-bold">Event &amp; Merit Reason</th>
                <th className="p-3.5 font-bold text-center">Points Awarded</th>
                <th className="p-3.5 font-bold">Awarded By</th>
                <th className="p-3.5 font-bold">Date</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? "divide-slate-100" : "divide-gray-800/50"} font-mono text-[10px]`}>
              {housePointEvents.map((ev) => (
                <tr key={ev.id} className={`${isLight ? "hover:bg-slate-50/80" : "hover:bg-white/[0.02]"} transition`}>
                  <td className={`p-3.5 font-sans font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{ev.houseName}</td>
                  <td className={`p-3.5 font-sans ${isLight ? "text-sky-700 font-bold" : "text-sky-300 font-bold"}`}>{ev.studentName}</td>
                  <td className={`p-3.5 font-sans ${isLight ? "text-slate-700" : "text-gray-300"}`}>{ev.eventType}</td>
                  <td className={`p-3.5 text-center font-black ${isLight ? "text-emerald-700" : "text-emerald-400"} text-xs`}>
                    +{ev.points} PTS
                  </td>
                  <td className={`p-3.5 font-sans ${isLight ? "text-slate-600" : "text-gray-400"}`}>{ev.awardedBy}</td>
                  <td className={`p-3.5 ${isLight ? "text-slate-500" : "text-gray-500"}`}>{ev.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Award Modal */}
      {showAwardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-amber-500/40 text-white"
          } border rounded-3xl w-full max-w-md shadow-2xl p-6 animate-fade-in-up`}>
            <div className={`flex justify-between items-center border-b ${isLight ? "border-slate-100" : "border-gray-800"} pb-3 mb-4`}>
              <div className="flex items-center gap-2">
                <Award size={16} className={isLight ? "text-amber-600" : "text-amber-400"} />
                <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>Award House Points / Merit</h3>
              </div>
              <button onClick={() => setShowAwardModal(false)} className={`${isLight ? "text-slate-400 hover:text-slate-800" : "text-gray-400 hover:text-white"} cursor-pointer`}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Select House</label>
                <select
                  value={awardForm.houseName}
                  onChange={(e) => setAwardForm({ ...awardForm, houseName: e.target.value as any })}
                  className={`w-full ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                  } border p-2.5 rounded-xl font-bold focus:outline-none`}
                >
                  <option value="Jinnah House">Jinnah House (Green)</option>
                  <option value="Iqbal House">Iqbal House (Blue)</option>
                  <option value="Sir Syed House">Sir Syed House (Purple)</option>
                  <option value="Liaquat House">Liaquat House (Red)</option>
                </select>
              </div>

              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-sky-700 font-bold" : "text-sky-400"} mb-1`}>Select Student</label>
                <select
                  value={awardForm.studentName}
                  onChange={(e) => setAwardForm({ ...awardForm, studentName: e.target.value })}
                  className={`w-full ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                  } border p-2.5 rounded-xl font-bold focus:outline-none`}
                >
                  {students.map((s) => (
                    <option key={s.id} value={`${s.firstName} ${s.lastName}`}>
                      {s.firstName} {s.lastName} ({s.className})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Merit / Infraction Category</label>
                <select
                  value={awardForm.eventType}
                  onChange={(e) => setAwardForm({ ...awardForm, eventType: e.target.value as any })}
                  className={`w-full ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                  } border p-2.5 rounded-xl font-bold focus:outline-none`}
                >
                  <option value="Academic Distinction">Academic Distinction (+50)</option>
                  <option value="Sports Gala Gold">Sports Gala Gold Medal (+40)</option>
                  <option value="Debate Championship">All-Pakistan Debate Championship (+35)</option>
                  <option value="Cleanliness Drive">Campus Cleanliness Champion (+20)</option>
                  <option value="Discipline Infraction (-)">Disciplinary Infraction Warning (-15)</option>
                </select>
              </div>

              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-amber-700 font-bold" : "text-amber-400"} mb-1`}>Points Delta</label>
                <input
                  type="number"
                  value={awardForm.points}
                  onChange={(e) => setAwardForm({ ...awardForm, points: parseInt(e.target.value, 10) || 0 })}
                  className={`w-full ${
                    isLight ? "bg-slate-50 border-slate-200 text-amber-800 focus:bg-white" : "bg-black border-gray-800 text-amber-400"
                  } border p-2.5 rounded-xl font-bold focus:outline-none`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-black uppercase rounded-xl transition text-xs cursor-pointer shadow-lg"
              >
                Confirm Point Assignment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
