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
  const { houses, housePointEvents, awardHousePoints, students } = useSMS();

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <Trophy className="text-amber-400" size={22} />
            <span>School House Championship, Merits &amp; Disciplinary System</span>
          </h1>
          <p className="text-xs text-gray-400">
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
            className="bg-[#0b121e] border border-[#1e293b] rounded-2xl p-5 space-y-3 relative overflow-hidden group hover:border-amber-500/40 transition"
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
              <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                <Trophy size={11} className="text-amber-400" />
                <span>{house.trophiesCount} Trophies</span>
              </span>
            </div>

            <div>
              <h3 className="text-base font-black text-white">{house.name}</h3>
              <p className="text-[10px] text-gray-400 italic">"{house.motto}"</p>
            </div>

            <div className="pt-2 border-t border-gray-800 flex justify-between items-end">
              <div>
                <span className="text-[9px] text-gray-500 uppercase block">House Master</span>
                <span className="text-xs font-bold text-gray-200">{house.houseMaster}</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-white" style={{ color: house.color }}>
                  {house.totalPoints}
                </span>
                <span className="text-[9px] text-gray-500 block">PTS</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* House Point Events Feed */}
      <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/40">
          <h3 className="font-black text-white text-xs uppercase tracking-wider">
            Recent Merit Awards &amp; Disciplinary Events ({housePointEvents.length})
          </h3>
          <span className="text-[10px] text-amber-400 font-mono">Real-time House Scoreboard</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-mono text-[10px] bg-black/20">
                <th className="p-3.5 font-bold">House</th>
                <th className="p-3.5 font-bold">Student Name</th>
                <th className="p-3.5 font-bold">Event &amp; Merit Reason</th>
                <th className="p-3.5 font-bold text-center">Points Awarded</th>
                <th className="p-3.5 font-bold">Awarded By</th>
                <th className="p-3.5 font-bold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50 font-mono text-[10px]">
              {housePointEvents.map((ev) => (
                <tr key={ev.id} className="hover:bg-white/[0.02] transition">
                  <td className="p-3.5 font-sans font-bold text-white">{ev.houseName}</td>
                  <td className="p-3.5 font-sans text-sky-300 font-bold">{ev.studentName}</td>
                  <td className="p-3.5 font-sans text-gray-300">{ev.eventType}</td>
                  <td className="p-3.5 text-center font-black text-emerald-400 text-xs">
                    +{ev.points} PTS
                  </td>
                  <td className="p-3.5 font-sans text-gray-400">{ev.awardedBy}</td>
                  <td className="p-3.5 text-gray-500">{ev.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Award Modal */}
      {showAwardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#0b121e] border border-amber-500/40 rounded-3xl w-full max-w-md shadow-2xl p-6 animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-amber-400" />
                <h3 className="font-black text-white text-sm">Award House Points / Merit</h3>
              </div>
              <button onClick={() => setShowAwardModal(false)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Select House</label>
                <select
                  value={awardForm.houseName}
                  onChange={(e) => setAwardForm({ ...awardForm, houseName: e.target.value as any })}
                  className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
                >
                  <option value="Jinnah House">Jinnah House (Green)</option>
                  <option value="Iqbal House">Iqbal House (Blue)</option>
                  <option value="Sir Syed House">Sir Syed House (Purple)</option>
                  <option value="Liaquat House">Liaquat House (Red)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-sky-400 mb-1">Select Student</label>
                <select
                  value={awardForm.studentName}
                  onChange={(e) => setAwardForm({ ...awardForm, studentName: e.target.value })}
                  className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
                >
                  {students.map((s) => (
                    <option key={s.id} value={`${s.firstName} ${s.lastName}`}>
                      {s.firstName} {s.lastName} ({s.className})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Merit / Infraction Category</label>
                <select
                  value={awardForm.eventType}
                  onChange={(e) => setAwardForm({ ...awardForm, eventType: e.target.value as any })}
                  className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
                >
                  <option value="Academic Distinction">Academic Distinction (+50)</option>
                  <option value="Sports Gala Gold">Sports Gala Gold Medal (+40)</option>
                  <option value="Debate Championship">All-Pakistan Debate Championship (+35)</option>
                  <option value="Cleanliness Drive">Campus Cleanliness Champion (+20)</option>
                  <option value="Discipline Infraction (-)">Disciplinary Infraction Warning (-15)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-amber-400 mb-1">Points Delta</label>
                <input
                  type="number"
                  value={awardForm.points}
                  onChange={(e) => setAwardForm({ ...awardForm, points: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-amber-400 font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-black uppercase rounded-xl transition text-xs"
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
