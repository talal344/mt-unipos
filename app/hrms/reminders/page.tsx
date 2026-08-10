"use client";

import React, { useState, useEffect } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import { useGlobalContext } from "@/context/global-context";
import { Bell, Plus, X, Check, Clock, AlertTriangle, CalendarDays } from "lucide-react";

interface HRReminder {
  id: string;
  title: string;
  description: string;
  category: "Probation End" | "Contract Renewal" | "Birthday" | "Anniversary" | "Visa Expiry" | "Custom";
  dueDate: string;
  employeeName?: string;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "Done" | "Snoozed";
  createdAt: string;
}

export default function HRRemindersPage() {
  const { currentUser, hrEmployees } = useGlobalContext();
  const [reminders, setReminders] = useState<HRReminder[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState("Pending");

  useEffect(() => {
    if (currentUser?.tenantId) {
      const saved = localStorage.getItem(`hr_reminders_${currentUser.tenantId}`);
      let currentReminders: HRReminder[] = saved ? JSON.parse(saved) : [];

      // Auto-generate probation reminders
      const today = new Date();
      hrEmployees.forEach(emp => {
        if (emp.joiningDate) {
          const joinDate = new Date(emp.joiningDate);
          const probEnd = new Date(joinDate);
          probEnd.setMonth(probEnd.getMonth() + 3); // 3 month probation assumption
          
          if (probEnd >= today) {
            const id = `AUTO-PROB-\${emp.id}`;
            if (!currentReminders.some(r => r.id === id)) {
              currentReminders.push({
                id,
                title: `Probation Ends for \${emp.name}`,
                description: "Evaluate performance to confirm permanent employment.",
                category: "Probation End",
                dueDate: probEnd.toISOString().split("T")[0],
                employeeName: emp.name,
                priority: "High",
                status: "Pending",
                createdAt: new Date().toISOString()
              });
            }
          }
        }
      });

      setReminders(currentReminders);
      localStorage.setItem(`hr_reminders_${currentUser.tenantId}`, JSON.stringify(currentReminders));
    }
  }, [currentUser?.tenantId, hrEmployees]);

  const saveReminders = (newRems: HRReminder[]) => {
    setReminders(newRems);
    if (currentUser?.tenantId) localStorage.setItem(`hr_reminders_${currentUser.tenantId}`, JSON.stringify(newRems));
  };

  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: new Date().toISOString().split("T")[0],
    priority: "Medium" as HRReminder["priority"]
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newRem: HRReminder = {
      id: "REM-" + Math.floor(Math.random() * 100000),
      title: form.title,
      description: form.description,
      category: "Custom",
      dueDate: form.dueDate,
      priority: form.priority,
      status: "Pending",
      createdAt: new Date().toISOString()
    };
    saveReminders([...reminders, newRem]);
    setShowAddModal(false);
  };

  const updateStatus = (id: string, status: HRReminder["status"]) => {
    saveReminders(reminders.map(r => r.id === id ? { ...r, status } : r));
  };

  const filtered = reminders
    .filter(r => filter === "All" || r.status === filter)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const getPriorityColor = (p: string) => {
    if (p === "High") return "text-red-400 bg-red-500/20 border-red-500/30";
    if (p === "Medium") return "text-amber-400 bg-amber-500/20 border-amber-500/30";
    return "text-gray-400 bg-gray-500/20 border-gray-500/30";
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const overdueCount = reminders.filter(r => r.status === "Pending" && r.dueDate < todayStr).length;

  return (
    <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans">
      <HRMSSidebar />
      <main className="flex-grow p-6 space-y-6 overflow-y-auto max-h-screen">
        <div className="flex justify-between items-center border-b border-gray-800 pb-5">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Bell size={20} className="text-yellow-400" /> HR Smart Reminders
            </h1>
            <p className="text-xs text-gray-400">Automated and custom alerts for HR ops.</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-black font-black text-xs px-4 py-2.5 rounded-xl transition">
            <Plus size={14} /> Add Reminder
          </button>
        </div>

        {overdueCount > 0 && (
          <div className="bg-red-900/30 border border-red-500/50 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
            <AlertTriangle size={24} className="text-red-400" />
            <div>
              <h3 className="text-sm font-bold text-red-400">Action Required</h3>
              <p className="text-xs text-red-300">You have {overdueCount} overdue reminders.</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 bg-[#0b0f17] border border-gray-800 p-2 rounded-2xl w-fit">
          {["Pending", "Done", "All"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition \${filter === f ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' : 'text-gray-400 hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <p className="text-xs text-gray-500 italic p-4">No {filter.toLowerCase()} reminders found.</p>
          ) : filtered.map(rem => {
            const isOverdue = rem.status === "Pending" && rem.dueDate < todayStr;
            return (
              <div key={rem.id} className={`bg-[#0b0f17] border \${isOverdue ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-gray-800'} p-5 rounded-2xl flex flex-col gap-3 relative overflow-hidden`}>
                <div className="flex justify-between items-start">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded border \${getPriorityColor(rem.priority)}`}>
                    {rem.priority} Priority
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase bg-black px-2 py-1 rounded">{rem.category}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{rem.title}</h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{rem.description}</p>
                </div>
                <div className="mt-auto pt-4 flex justify-between items-center border-t border-gray-800/60">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <CalendarDays size={14} className={isOverdue ? 'text-red-400' : 'text-yellow-400'} /> 
                    <span className={isOverdue ? 'text-red-400 font-bold' : ''}>{rem.dueDate}</span>
                  </div>
                  {rem.status === "Pending" ? (
                    <button onClick={() => updateStatus(rem.id, "Done")} className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 px-3 py-1.5 rounded-lg text-xs font-bold transition">
                      <Check size={14} /> Done
                    </button>
                  ) : (
                    <span className="text-emerald-500 flex items-center gap-1 text-xs font-bold"><Check size={14}/> Completed</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0c1018] border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-sm font-bold text-white">Create Custom Reminder</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white"><X size={16} /></button>
            </div>
            <form onSubmit={handleAdd} className="p-4 space-y-4">
              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Title</label>
                <input required type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full bg-black border border-gray-800 text-white text-xs p-2 rounded-xl" />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Description</label>
                <textarea required value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full bg-black border border-gray-800 text-white text-xs p-2 rounded-xl h-20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Due Date</label>
                  <input required type="date" value={form.dueDate} onChange={(e) => setForm({...form, dueDate: e.target.value})} className="w-full bg-black border border-gray-800 text-white text-xs p-2 rounded-xl" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value as any})} className="w-full bg-black border border-gray-800 text-white text-xs p-2 rounded-xl">
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-black text-xs p-3 rounded-xl transition">Save Reminder</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
