"use client";

import React, { useState, useEffect } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import { useGlobalContext } from "@/context/global-context";
import { Target, Plus, X, BarChart, CheckCircle, Clock, AlertCircle, Filter } from "lucide-react";

interface HRGoal {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  title: string;
  description: string;
  category: "Performance" | "Learning" | "Revenue" | "Operational" | "Personal Development";
  targetDate: string;
  progress: number;
  status: "Not Started" | "In Progress" | "Completed" | "Overdue" | "Cancelled";
  createdBy: string;
  createdAt: string;
  keyResults?: { id: string; title: string; completed: boolean }[];
}

export default function HRGoalsPage() {
  const { currentUser, hrEmployees } = useGlobalContext();
  const [goals, setGoals] = useState<HRGoal[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterDept, setFilterDept] = useState("All");

  useEffect(() => {
    if (currentUser?.tenantId) {
      const saved = localStorage.getItem(`hr_goals_${currentUser.tenantId}`);
      if (saved) {
        setGoals(JSON.parse(saved));
      } else {
        setGoals([]);
      }
    }
  }, [currentUser?.tenantId]);

  const saveGoals = (newGoals: HRGoal[]) => {
    setGoals(newGoals);
    if (currentUser?.tenantId) {
      localStorage.setItem(`hr_goals_${currentUser.tenantId}`, JSON.stringify(newGoals));
    }
  };

  const [form, setForm] = useState({
    employeeId: "",
    title: "",
    description: "",
    category: "Performance" as HRGoal["category"],
    targetDate: new Date().toISOString().split("T")[0]
  });

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = hrEmployees.find((e) => e.id === form.employeeId);
    if (!emp) return;

    const newGoal: HRGoal = {
      id: "GOAL-" + Math.floor(Math.random() * 100000),
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      title: form.title,
      description: form.description,
      category: form.category,
      targetDate: form.targetDate,
      progress: 0,
      status: "Not Started",
      createdBy: currentUser?.name || "System",
      createdAt: new Date().toISOString()
    };
    saveGoals([...goals, newGoal]);
    setShowAddModal(false);
  };

  const updateProgress = (id: string, newProgress: number) => {
    const updated = goals.map(g => {
      if (g.id === id) {
        let status = g.status;
        if (newProgress === 100) status = "Completed";
        else if (newProgress > 0) status = "In Progress";
        else status = "Not Started";
        return { ...g, progress: newProgress, status };
      }
      return g;
    });
    saveGoals(updated);
  };

  const filteredGoals = goals.filter(g => filterDept === "All" || g.department === filterDept);
  const columns = ["Not Started", "In Progress", "Completed", "Overdue"];
  const depts = ["All", ...Array.from(new Set(hrEmployees.map(e => e.department)))];

  const totalGoals = goals.length;
  const onTrack = goals.filter(g => g.status === "In Progress").length;
  const completed = goals.filter(g => g.status === "Completed").length;
  const overdue = goals.filter(g => g.status === "Overdue").length;

  return (
    <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans">
      <HRMSSidebar />
      <main className="flex-grow p-6 space-y-6 overflow-y-auto max-h-screen">
        <div className="flex justify-between items-center border-b border-gray-800 pb-5">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Target size={20} className="text-purple-400" /> OKR &amp; Goals Tracker
            </h1>
            <p className="text-xs text-gray-400">Track performance objectives and key results.</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition">
            <Plus size={14} /> Add Goal
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#0b0f17] border border-gray-800 p-4 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl"><Target size={20} /></div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Goals</p>
              <h3 className="text-2xl font-black">{totalGoals}</h3>
            </div>
          </div>
          <div className="bg-[#0b0f17] border border-gray-800 p-4 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-sky-500/20 text-sky-400 rounded-xl"><Clock size={20} /></div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">On Track</p>
              <h3 className="text-2xl font-black">{onTrack}</h3>
            </div>
          </div>
          <div className="bg-[#0b0f17] border border-gray-800 p-4 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl"><CheckCircle size={20} /></div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Completed</p>
              <h3 className="text-2xl font-black">{completed}</h3>
            </div>
          </div>
          <div className="bg-[#0b0f17] border border-gray-800 p-4 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-red-500/20 text-red-400 rounded-xl"><AlertCircle size={20} /></div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Overdue</p>
              <h3 className="text-2xl font-black">{overdue}</h3>
            </div>
          </div>
        </div>

        <div className="flex gap-2 items-center bg-[#0b0f17] border border-gray-800 p-2 rounded-2xl w-fit">
          <Filter size={14} className="text-gray-500 mx-2" />
          {depts.map(d => (
            <button key={d} onClick={() => setFilterDept(d)} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${filterDept === d ? "bg-purple-500/20 text-purple-400 border border-purple-500/40" : "bg-gray-800 text-white"}`}>
              {d}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {columns.map(col => (
            <div key={col} className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-4 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex justify-between">
                {col} <span className="bg-gray-800 px-2 py-0.5 rounded-full text-[10px]">{filteredGoals.filter(g => g.status === col).length}</span>
              </h3>
              <div className="space-y-3">
                {filteredGoals.filter(g => g.status === col).map(goal => (
                  <div key={goal.id} className="bg-black border border-gray-800 p-3 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-white">{goal.title}</p>
                        <p className="text-[10px] text-gray-500">{goal.employeeName} ({goal.department})</p>
                      </div>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase ${goal.category === 'Performance' ? 'bg-sky-500/20 text-sky-400' : 'bg-purple-500/20 text-purple-400'}`}>{goal.category}</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-purple-400 font-bold">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-900 rounded-full h-1.5">
                        <div className="bg-purple-500 h-1.5 rounded-full transition-all duration-500" style={{ width: \`\${goal.progress}%\` }}></div>
                      </div>
                      <input type="range" min="0" max="100" value={goal.progress} onChange={(e) => updateProgress(goal.id, parseInt(e.target.value))} className="w-full mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0c1018] border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-sm font-bold text-white">Add New Goal</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white"><X size={16} /></button>
            </div>
            <form onSubmit={handleAddGoal} className="p-4 space-y-4">
              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Employee</label>
                <select required value={form.employeeId} onChange={(e) => setForm({...form, employeeId: e.target.value})} className="w-full bg-black border border-gray-800 text-white text-xs p-2 rounded-xl">
                  <option value="">Select Employee</option>
                  {hrEmployees.map(e => <option key={e.id} value={e.id}>{e.name} - {e.department}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Goal Title</label>
                <input required type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full bg-black border border-gray-800 text-white text-xs p-2 rounded-xl" placeholder="e.g. Increase sales by 20%" />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value as any})} className="w-full bg-black border border-gray-800 text-white text-xs p-2 rounded-xl">
                  <option>Performance</option><option>Learning</option><option>Revenue</option><option>Operational</option><option>Personal Development</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Target Date</label>
                <input required type="date" value={form.targetDate} onChange={(e) => setForm({...form, targetDate: e.target.value})} className="w-full bg-black border border-gray-800 text-white text-xs p-2 rounded-xl" />
              </div>
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs p-3 rounded-xl transition">Create Goal</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
