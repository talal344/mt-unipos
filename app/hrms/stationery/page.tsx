"use client";

import React, { useState, useEffect, useMemo } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import HRMSTopHeader from "@/components/hrms-top-header";
import { useGlobalContext } from "@/context/global-context";
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Package,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  ArrowUpRight,
  Printer,
  Coffee,
  Shirt,
  FileText,
  X,
  Send,
  Sparkles
} from "lucide-react";

interface StationeryItem {
  id: string;
  itemCode: string;
  name: string;
  category: "Paper & Printing" | "POS Thermal Rolls" | "Office Desk Supplies" | "Uniforms & Badges" | "Pantry & Cleaning";
  currentStock: number;
  unit: string;
  minThreshold: number;
  unitCost: number;
  lastRestocked: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

export default function StationeryPage() {
  const { currentUser, hrEmployees, currencySymbol } = useGlobalContext();
  const [items, setItems] = useState<StationeryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [dispatchItem, setDispatchItem] = useState<StationeryItem | null>(null);
  const [dispatchQty, setDispatchQty] = useState(1);
  const [dispatchEmpId, setDispatchEmpId] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    if (currentUser?.tenantId) {
      const key = `hr_stationery_${currentUser.tenantId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed: StationeryItem[] = JSON.parse(saved);
          const filtered = parsed.filter(s => s.id !== "ST-1" && s.id !== "ST-2" && s.id !== "ST-3" && s.id !== "ST-4" && s.id !== "ST-5");
          setItems(filtered);
          if (filtered.length !== parsed.length) {
            localStorage.setItem(key, JSON.stringify(filtered));
          }
        } catch {
          setItems([]);
        }
      } else {
        setItems([]);
      }
    }
  }, [currentUser?.tenantId]);

  const saveItems = (data: StationeryItem[]) => {
    setItems(data);
    if (currentUser?.tenantId) {
      localStorage.setItem(`hr_stationery_${currentUser.tenantId}`, JSON.stringify(data));
    }
  };

  const [form, setForm] = useState({
    name: "",
    category: "Paper & Printing" as StationeryItem["category"],
    currentStock: 10,
    unit: "Units",
    minThreshold: 5,
    unitCost: 10
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const count = items.length + 1;
    const newItem: StationeryItem = {
      id: `ST-${Date.now()}`,
      itemCode: `STN-${String(count).padStart(3, "0")}`,
      name: form.name,
      category: form.category,
      currentStock: Number(form.currentStock) || 0,
      unit: form.unit,
      minThreshold: Number(form.minThreshold) || 1,
      unitCost: Number(form.unitCost) || 0,
      lastRestocked: new Date().toISOString().split("T")[0],
      status: Number(form.currentStock) <= Number(form.minThreshold) ? "Low Stock" : "In Stock"
    };

    saveItems([newItem, ...items]);
    setShowAddModal(false);
    setForm({
      name: "",
      category: "Paper & Printing",
      currentStock: 10,
      unit: "Units",
      minThreshold: 5,
      unitCost: 10
    });
    triggerToast("✅ Consumable item added to stationery inventory!");
  };

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchItem) return;

    const emp = hrEmployees.find((e) => e.id === dispatchEmpId);
    const updated = items.map((item) => {
      if (item.id === dispatchItem.id) {
        const newStock = Math.max(0, item.currentStock - dispatchQty);
        return {
          ...item,
          currentStock: newStock,
          status: newStock === 0 ? ("Out of Stock" as const) : newStock <= item.minThreshold ? ("Low Stock" as const) : ("In Stock" as const)
        };
      }
      return item;
    });

    saveItems(updated);
    triggerToast(`📦 Dispatched ${dispatchQty} ${dispatchItem.unit} of "${dispatchItem.name}" to ${emp?.name || "Staff"}!`);
    setDispatchItem(null);
    setDispatchQty(1);
    setDispatchEmpId("");
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        q === "" ||
        item.name.toLowerCase().includes(q) ||
        item.itemCode.toLowerCase().includes(q);
      const matchCat = categoryFilter === "All" || item.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [items, searchQuery, categoryFilter]);

  const totalStockValue = items.reduce((acc, i) => acc + i.currentStock * i.unitCost, 0);
  const lowStockCount = items.filter((i) => i.status === "Low Stock" || i.status === "Out of Stock").length;

  return (
    <div className="flex h-screen bg-[#05080d] text-gray-100 font-sans overflow-hidden">
      <HRMSSidebar />

      <main className="flex-grow overflow-y-auto h-full relative">
        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-black px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce border border-emerald-400/50">
            <CheckCircle2 size={16} />
            <span>{toastMsg}</span>
          </div>
        )}

        <HRMSTopHeader
          title="📦 Stationery &amp; Office Consumables Inventory"
          subtitle="Manage office supplies, POS thermal rolls, toners, uniforms, pantry items, and employee dispatch quotas."
        />

        <div className="p-6 space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-4.5">
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Total SKU Items</p>
              <p className="text-2xl font-black text-white">{items.length} Products</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Office &amp; POS Consumables</p>
            </div>

            <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-4.5">
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Inventory Asset Value</p>
              <p className="text-2xl font-black text-emerald-400">
                {currencySymbol || "$"}{totalStockValue.toLocaleString()}
              </p>
              <p className="text-[10px] text-emerald-500/80 mt-0.5">Current Stock Valuation</p>
            </div>

            <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-4.5">
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Low Stock Triggers</p>
              <p className="text-2xl font-black text-amber-400">{lowStockCount} Items</p>
              <p className="text-[10px] text-amber-500/80 mt-0.5">Below Minimum Threshold</p>
            </div>

            <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-4.5 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Add New Item</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-1 flex items-center gap-1.5 text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 px-3.5 py-2 rounded-xl transition shadow cursor-pointer"
                >
                  <Plus size={14} /> Add Stock Item
                </button>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Boxes className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0b0f17] border border-gray-800 p-3 rounded-2xl">
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search consumables by name, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-gray-800 pl-9 pr-3 py-2 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-black border border-gray-800 text-xs text-gray-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Paper & Printing">Paper &amp; Printing</option>
              <option value="POS Thermal Rolls">POS Thermal Rolls</option>
              <option value="Office Desk Supplies">Office Desk Supplies</option>
              <option value="Uniforms & Badges">Uniforms &amp; Badges</option>
              <option value="Pantry & Cleaning">Pantry &amp; Cleaning</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-black/40 text-[10px] text-gray-500 uppercase tracking-wider font-mono border-b border-gray-800">
                    <th className="p-3.5">Item Details</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Current Stock</th>
                    <th className="p-3.5">Unit Cost</th>
                    <th className="p-3.5">Total Value</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-emerald-500/5 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{item.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">
                          {item.itemCode} &bull; Min Alert: {item.minThreshold} {item.unit}
                        </div>
                      </td>
                      <td className="p-3.5 text-gray-300">{item.category}</td>
                      <td className="p-3.5 font-mono font-black text-sm text-white">
                        {item.currentStock} <span className="text-xs font-normal text-gray-400">{item.unit}</span>
                      </td>
                      <td className="p-3.5 font-mono text-gray-300">{currencySymbol || "$"}{item.unitCost}</td>
                      <td className="p-3.5 font-mono font-bold text-emerald-400">
                        {currencySymbol || "$"}{(item.currentStock * item.unitCost).toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                            item.status === "In Stock"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : item.status === "Low Stock"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setDispatchItem(item)}
                          className="flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg transition ml-auto cursor-pointer shadow"
                        >
                          <Send size={12} /> Dispatch Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Dispatch Modal */}
      {dispatchItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c1018] border border-indigo-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-indigo-500/5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Send size={16} className="text-indigo-400" />
                Dispatch / Issue: {dispatchItem.name}
              </h2>
              <button onClick={() => setDispatchItem(null)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleDispatch} className="p-4 space-y-3.5 text-xs">
              <div className="bg-black/60 border border-gray-800 p-3 rounded-xl font-mono flex justify-between">
                <span>Available in Stock:</span>
                <span className="text-emerald-400 font-bold">
                  {dispatchItem.currentStock} {dispatchItem.unit}
                </span>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Issue To Employee</label>
                <select
                  required
                  value={dispatchEmpId}
                  onChange={(e) => setDispatchEmpId(e.target.value)}
                  className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">Select Employee...</option>
                  {hrEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} &bull; {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">
                  Quantity ({dispatchItem.unit})
                </label>
                <input
                  required
                  type="number"
                  min={1}
                  max={dispatchItem.currentStock}
                  value={dispatchQty}
                  onChange={(e) => setDispatchQty(Number(e.target.value))}
                  className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDispatchItem(null)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-indigo-950/50 cursor-pointer"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Consumable Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c1018] border border-emerald-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-emerald-500/5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus size={16} className="text-emerald-400" />
                Add Consumable / Stationery Item
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddItem} className="p-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Item Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. A4 Paper, Thermal Rolls, Coffee"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Paper & Printing">Paper &amp; Printing</option>
                    <option value="POS Thermal Rolls">POS Thermal Rolls</option>
                    <option value="Office Desk Supplies">Office Desk Supplies</option>
                    <option value="Uniforms & Badges">Uniforms &amp; Badges</option>
                    <option value="Pantry & Cleaning">Pantry &amp; Cleaning</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Unit of Measure</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Reams, Boxes, Kg"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={form.currentStock}
                    onChange={(e) => setForm({ ...form, currentStock: Number(e.target.value) })}
                    className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Unit Cost ({currencySymbol || "$"})</label>
                  <input
                    type="number"
                    value={form.unitCost}
                    onChange={(e) => setForm({ ...form, unitCost: Number(e.target.value) })}
                    className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Minimum Alert Threshold</label>
                <input
                  type="number"
                  value={form.minThreshold}
                  onChange={(e) => setForm({ ...form, minThreshold: Number(e.target.value) })}
                  className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-emerald-950/50 cursor-pointer"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
