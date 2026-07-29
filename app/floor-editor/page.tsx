"use client";

import React, { useState, useMemo } from "react";
import ClientSidebar from "@/components/client-sidebar";
import { useGlobalContext } from "@/context/global-context";
import { Plus, Edit2, Trash2, Star, Check, X, Move, Settings, Users } from "lucide-react";

export default function FloorEditorPage() {
  const { tables, addTable, updateTableBase, deleteTable } = useGlobalContext();

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);

  // New table form state
  const [newHall, setNewHall] = useState("Main Hall");
  const [newNumber, setNewNumber] = useState("");
  const [newCapacity, setNewCapacity] = useState<number>(4);
  const [newVip, setNewVip] = useState(false);

  // Editing state
  const [editHall, setEditHall] = useState("");
  const [editNumber, setEditNumber] = useState("");
  const [editCapacity, setEditCapacity] = useState<number>(4);
  const [editVip, setEditVip] = useState(false);

  // Derived state
  const tablesByHall = useMemo(() => {
    const grouped: Record<string, typeof tables> = {};
    // Ensure standard halls are present even if empty
    grouped["Main Hall"] = [];
    grouped["Patio"] = [];

    tables.forEach(t => {
      const h = t.hall || "Main Hall";
      if (!grouped[h]) grouped[h] = [];
      grouped[h].push(t);
    });

    return grouped;
  }, [tables]);

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNumber.trim()) return;
    addTable({
      number: newNumber,
      capacity: newCapacity,
      hall: newHall,
      vip: newVip
    });
    setNewNumber("");
    setAddModalOpen(false);
  };

  const startEdit = (t: any) => {
    setEditingTableId(t.id);
    setEditHall(t.hall || "Main Hall");
    setEditNumber(t.number);
    setEditCapacity(t.capacity);
    setEditVip(!!t.vip);
  };

  const cancelEdit = () => {
    setEditingTableId(null);
  };

  const saveEdit = () => {
    if (editingTableId) {
      updateTableBase(editingTableId, {
        hall: editHall,
        number: editNumber,
        capacity: editCapacity,
        vip: editVip
      });
      setEditingTableId(null);
    }
  };

  const halls = Object.keys(tablesByHall).sort();

  return (
    <div className="flex h-screen bg-black text-white font-sans">
      <ClientSidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#0d0d0d]">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-brand-dark-border bg-brand-dark-surface">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings size={20} className="text-brand-sky" /> Floor Plan Editor
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage seating areas, table capacities, and VIP assignments</p>
          </div>
          <button 
            onClick={() => setAddModalOpen(true)}
            className="bg-brand-sky text-black font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-brand-sky/90 transition"
          >
            <Plus size={16} /> Add Table
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {halls.map(hall => (
            <div key={hall} className="bg-brand-dark-surface border border-brand-dark-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-brand-dark-border/50">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Move size={18} className="text-gray-400" />
                  {hall}
                  <span className="bg-brand-dark-border/50 text-gray-400 text-xs px-2 py-0.5 rounded-full">
                    {tablesByHall[hall].length} Tables
                  </span>
                </h2>
                <button 
                  onClick={() => {
                    setNewHall(hall);
                    setAddModalOpen(true);
                  }}
                  className="text-xs text-brand-sky font-bold hover:underline flex items-center gap-1"
                >
                  <Plus size={12} /> Add to {hall}
                </button>
              </div>

              {tablesByHall[hall].length === 0 ? (
                <div className="text-center py-8 text-gray-500 border border-dashed border-brand-dark-border/50 rounded-lg bg-black/20">
                  <p className="text-sm">No tables in {hall}.</p>
                  <button 
                    onClick={() => { setNewHall(hall); setAddModalOpen(true); }}
                    className="text-xs text-brand-sky mt-2 hover:underline"
                  >
                    Add one now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {tablesByHall[hall].map(t => (
                    <div 
                      key={t.id} 
                      className={`relative bg-black/40 border p-4 rounded-lg flex flex-col justify-between transition-all group ${t.vip ? "border-amber-500/30" : "border-brand-dark-border hover:border-gray-600"}`}
                    >
                      {/* Editing View */}
                      {editingTableId === t.id ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <input 
                              type="text" 
                              value={editNumber} 
                              onChange={e => setEditNumber(e.target.value)} 
                              className="w-full bg-black border border-brand-dark-border text-white text-sm rounded px-2 py-1"
                              placeholder="Table No."
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-gray-400" />
                            <input 
                              type="number" 
                              value={editCapacity} 
                              onChange={e => setEditCapacity(Number(e.target.value))} 
                              className="w-full bg-black border border-brand-dark-border text-white text-sm rounded px-2 py-1"
                              min={1}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Move size={14} className="text-gray-400" />
                            <select 
                              value={editHall} 
                              onChange={e => setEditHall(e.target.value)}
                              className="w-full bg-black border border-brand-dark-border text-white text-sm rounded px-2 py-1"
                            >
                              <option value="Main Hall">Main Hall</option>
                              <option value="Patio">Patio</option>
                              <option value="Rooftop">Rooftop</option>
                              <option value="Private Dining">Private Dining</option>
                            </select>
                          </div>
                          <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={editVip} 
                              onChange={e => setEditVip(e.target.checked)} 
                              className="accent-amber-500 rounded bg-black border-brand-dark-border"
                            />
                            VIP Table
                          </label>

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-brand-dark-border/50">
                            <button onClick={cancelEdit} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-brand-dark-border transition">
                              <X size={14} />
                            </button>
                            <button onClick={saveEdit} className="p-1.5 text-brand-sky hover:text-brand-sky/80 rounded hover:bg-brand-sky/10 transition">
                              <Check size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Normal View */
                        <>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-black text-white">{t.number}</h3>
                              {t.vip && <Star size={12} className="text-amber-400 fill-amber-400" />}
                            </div>
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => startEdit(t)} className="p-1 text-gray-400 hover:text-white">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => deleteTable(t.id)} className="p-1 text-red-500/70 hover:text-red-500">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                            <span className="flex items-center gap-1.5">
                              <Users size={14} className="text-brand-sky" /> {t.capacity} Seats
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'Occupied' ? 'bg-red-500/20 text-red-400' : t.status === 'Reserved' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                              {t.status}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-brand-dark-surface border border-brand-dark-border rounded-xl w-full max-w-sm shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-brand-dark-border">
                <h2 className="text-lg font-bold text-white">Add New Table</h2>
                <button onClick={() => setAddModalOpen(false)} className="text-gray-400 hover:text-white transition">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddTable} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Hall / Area</label>
                  <select 
                    value={newHall} 
                    onChange={e => setNewHall(e.target.value)}
                    className="w-full bg-black border border-brand-dark-border text-white text-sm rounded-lg px-3 py-2.5 focus:border-brand-sky focus:ring-1 focus:ring-brand-sky outline-none transition"
                  >
                    <option value="Main Hall">Main Hall</option>
                    <option value="Patio">Patio</option>
                    <option value="Rooftop">Rooftop</option>
                    <option value="Private Dining">Private Dining</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Table Number</label>
                  <input 
                    type="text" 
                    value={newNumber} 
                    onChange={e => setNewNumber(e.target.value)}
                    placeholder="e.g. T-12"
                    className="w-full bg-black border border-brand-dark-border text-white text-sm rounded-lg px-3 py-2.5 focus:border-brand-sky focus:ring-1 focus:ring-brand-sky outline-none transition"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Seating Capacity</label>
                  <input 
                    type="number" 
                    value={newCapacity} 
                    onChange={e => setNewCapacity(Number(e.target.value))}
                    min={1}
                    className="w-full bg-black border border-brand-dark-border text-white text-sm rounded-lg px-3 py-2.5 focus:border-brand-sky focus:ring-1 focus:ring-brand-sky outline-none transition"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-white cursor-pointer bg-black/40 border border-brand-dark-border p-3 rounded-lg">
                  <input 
                    type="checkbox" 
                    checked={newVip} 
                    onChange={e => setNewVip(e.target.checked)} 
                    className="accent-amber-500 w-4 h-4 rounded border-brand-dark-border bg-black"
                  />
                  <span className="flex items-center gap-1.5"><Star size={16} className={newVip ? "text-amber-400 fill-amber-400" : "text-gray-500"} /> VIP Table</span>
                </label>

                <div className="pt-4 border-t border-brand-dark-border flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setAddModalOpen(false)}
                    className="flex-1 py-2.5 bg-transparent border border-brand-dark-border text-white rounded-lg text-sm font-bold hover:bg-brand-dark-border transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={!newNumber.trim()}
                    className="flex-1 py-2.5 bg-brand-sky text-black rounded-lg text-sm font-bold hover:bg-brand-sky/90 transition disabled:opacity-50"
                  >
                    Save Table
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
