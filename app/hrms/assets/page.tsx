"use client";

import React, { useState, useEffect, useMemo } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import { useGlobalContext } from "@/context/global-context";
import {
  Package,
  Plus,
  Search,
  Filter,
  Laptop,
  Smartphone,
  CreditCard,
  Car,
  Armchair,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  X,
  UserCheck,
  DollarSign,
  Edit2,
  Trash2
} from "lucide-react";

interface HRAsset {
  id: string;
  assetCode: string;
  name: string;
  category: "Laptop" | "Mobile" | "SIM Card" | "Vehicle" | "Furniture" | "Other";
  brand?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchaseValue?: number;
  assignedTo?: string; // employeeId
  assignedToName?: string;
  assignedDate?: string;
  condition: "New" | "Good" | "Fair" | "Damaged";
  status: "Available" | "Assigned" | "Under Repair" | "Disposed";
  notes?: string;
}

export default function HRAssetsPage() {
  const { currentUser, hrEmployees, currencySymbol } = useGlobalContext();
  const [assets, setAssets] = useState<HRAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<HRAsset | null>(null);
  const [editingAsset, setEditingAsset] = useState<HRAsset | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    if (currentUser?.tenantId) {
      const key = `hr_assets_${currentUser.tenantId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed: HRAsset[] = JSON.parse(saved);
          const filtered = parsed.filter(a => a.id !== "ASSET-1" && a.id !== "ASSET-2" && a.id !== "ASSET-3" && a.id !== "ASSET-4" && a.assetCode !== "AST-001" && a.assetCode !== "AST-002" && a.assetCode !== "AST-003" && a.assetCode !== "AST-004");
          setAssets(filtered);
          if (filtered.length !== parsed.length) {
            localStorage.setItem(key, JSON.stringify(filtered));
          }
        } catch {
          setAssets([]);
        }
      } else {
        setAssets([]);
      }
    }
  }, [currentUser?.tenantId]);

  const saveAssets = (data: HRAsset[]) => {
    setAssets(data);
    if (currentUser?.tenantId) {
      localStorage.setItem(`hr_assets_${currentUser.tenantId}`, JSON.stringify(data));
    }
  };

  const [form, setForm] = useState({
    name: "",
    category: "Laptop" as HRAsset["category"],
    brand: "",
    serialNumber: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    purchaseValue: 0,
    condition: "New" as HRAsset["condition"],
    notes: ""
  });

  const [assignForm, setAssignForm] = useState({
    employeeId: ""
  });

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const count = assets.length + 1;
    const newAsset: HRAsset = {
      id: `ASSET-${Date.now()}`,
      assetCode: `AST-${String(count).padStart(3, "0")}`,
      name: form.name,
      category: form.category,
      brand: form.brand,
      serialNumber: form.serialNumber,
      purchaseDate: form.purchaseDate,
      purchaseValue: Number(form.purchaseValue) || 0,
      condition: form.condition,
      status: "Available",
      notes: form.notes
    };
    saveAssets([newAsset, ...assets]);
    setShowAddModal(false);
    setForm({
      name: "",
      category: "Laptop",
      brand: "",
      serialNumber: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      purchaseValue: 0,
      condition: "New",
      notes: ""
    });
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    const emp = hrEmployees.find((e) => e.id === assignForm.employeeId);
    if (!emp) return;

    const updated = assets.map((a) => {
      if (a.id === selectedAsset.id) {
        return {
          ...a,
          assignedTo: emp.id,
          assignedToName: emp.name,
          assignedDate: new Date().toISOString().split("T")[0],
          status: "Assigned" as const
        };
      }
      return a;
    });

    saveAssets(updated);
    setShowAssignModal(false);
    setSelectedAsset(null);
  };

  const handleDeleteAsset = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete asset "${name}"?`)) {
      const updated = assets.filter((a) => a.id !== id);
      saveAssets(updated);
      triggerToast(`🗑️ Asset "${name}" deleted successfully!`);
    }
  };

  const handleUpdateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;
    const updated = assets.map((a) => {
      if (a.id === editingAsset.id) {
        return {
          ...a,
          name: editingAsset.name,
          category: editingAsset.category,
          brand: editingAsset.brand,
          serialNumber: editingAsset.serialNumber,
          purchaseDate: editingAsset.purchaseDate,
          purchaseValue: Number(editingAsset.purchaseValue) || 0,
          condition: editingAsset.condition,
          status: editingAsset.status,
          notes: editingAsset.notes
        };
      }
      return a;
    });
    saveAssets(updated);
    setEditingAsset(null);
    triggerToast("✅ Asset updated successfully!");
  };

  const handleReturn = (id: string) => {
    const updated = assets.map((a) => {
      if (a.id === id) {
        return {
          ...a,
          assignedTo: undefined,
          assignedToName: undefined,
          assignedDate: undefined,
          status: "Available" as const
        };
      }
      return a;
    });
    saveAssets(updated);
    triggerToast("✅ Asset marked as returned and available!");
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const matchesSearch =
        searchQuery === "" ||
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.assignedToName && a.assignedToName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat = selectedCategory === "All" || a.category === selectedCategory;
      const matchesStat = selectedStatus === "All" || a.status === selectedStatus;
      return matchesSearch && matchesCat && matchesStat;
    });
  }, [assets, searchQuery, selectedCategory, selectedStatus]);

  const totalValue = assets.reduce((sum, a) => sum + (a.purchaseValue || 0), 0);
  const assignedCount = assets.filter((a) => a.status === "Assigned").length;
  const availableCount = assets.filter((a) => a.status === "Available").length;
  const repairCount = assets.filter((a) => a.status === "Under Repair").length;

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Laptop":
        return <Laptop size={16} className="text-sky-400" />;
      case "Mobile":
        return <Smartphone size={16} className="text-emerald-400" />;
      case "SIM Card":
        return <CreditCard size={16} className="text-amber-400" />;
      case "Vehicle":
        return <Car size={16} className="text-indigo-400" />;
      case "Furniture":
        return <Armchair size={16} className="text-teal-400" />;
      default:
        return <Package size={16} className="text-purple-400" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans">
      <HRMSSidebar />
      <main className="flex-grow p-6 space-y-6 overflow-y-auto max-h-screen">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-5">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Package size={22} className="text-emerald-400" />
              Company Hardware & Asset Management
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Track laptops, mobile devices, SIMs, and office assets assigned to staff.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-950/40"
          >
            <Plus size={15} /> Add New Asset
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0b0f17] border border-gray-800 p-4 rounded-2xl">
            <div className="flex justify-between text-gray-400 text-xs font-bold uppercase">
              <span>Total Assets</span>
              <Package size={16} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white mt-2">{assets.length}</div>
            <div className="text-[11px] text-gray-400 mt-1 font-mono">
              Value: {currencySymbol || "$"}{totalValue.toLocaleString()}
            </div>
          </div>

          <div className="bg-[#0b0f17] border border-sky-500/20 p-4 rounded-2xl">
            <div className="flex justify-between text-gray-400 text-xs font-bold uppercase">
              <span>Currently Assigned</span>
              <UserCheck size={16} className="text-sky-400" />
            </div>
            <div className="text-2xl font-black text-sky-400 mt-2">{assignedCount}</div>
            <div className="text-[11px] text-sky-400/80 mt-1">
              {assets.length > 0 ? Math.round((assignedCount / assets.length) * 100) : 0}% utilization
            </div>
          </div>

          <div className="bg-[#0b0f17] border border-emerald-500/20 p-4 rounded-2xl">
            <div className="flex justify-between text-gray-400 text-xs font-bold uppercase">
              <span>Available in Stock</span>
              <CheckCircle2 size={16} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-2">{availableCount}</div>
            <div className="text-[11px] text-emerald-400/80 mt-1">Ready for deployment</div>
          </div>

          <div className="bg-[#0b0f17] border border-amber-500/20 p-4 rounded-2xl">
            <div className="flex justify-between text-gray-400 text-xs font-bold uppercase">
              <span>Under Repair / Maintenance</span>
              <AlertTriangle size={16} className="text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 mt-2">{repairCount}</div>
            <div className="text-[11px] text-amber-400/80 mt-1">Service center</div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-[#0b0f17] border border-gray-800 p-3 rounded-2xl">
          <div className="relative w-full md:w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by asset name, code, or employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-gray-800 pl-9 pr-3 py-2 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-black border border-gray-800 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Categories</option>
              <option value="Laptop">Laptop</option>
              <option value="Mobile">Mobile</option>
              <option value="SIM Card">SIM Card</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Furniture">Furniture</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-black border border-gray-800 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Assigned">Assigned</option>
              <option value="Under Repair">Under Repair</option>
              <option value="Disposed">Disposed</option>
            </select>
          </div>
        </div>

        {/* Assets Table */}
        <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-gray-800 text-[10px] uppercase tracking-wider text-gray-500 font-mono bg-black/40">
                  <th className="p-3.5">Asset Details</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Serial / ID</th>
                  <th className="p-3.5">Assigned Employee</th>
                  <th className="p-3.5">Condition</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-gray-500 text-xs">
                      No assets found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-emerald-500/5 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-white flex items-center gap-2">
                          {getCategoryIcon(asset.category)}
                          {asset.name}
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono">
                          {asset.assetCode} &bull; {asset.brand || "Standard"}
                        </div>
                      </td>
                      <td className="p-3.5 text-gray-300">{asset.category}</td>
                      <td className="p-3.5 text-gray-400 font-mono text-[11px]">{asset.serialNumber || "—"}</td>
                      <td className="p-3.5">
                        {asset.assignedToName ? (
                          <div>
                            <div className="text-white font-bold">{asset.assignedToName}</div>
                            <div className="text-[10px] text-gray-500 font-mono">Since {asset.assignedDate}</div>
                          </div>
                        ) : (
                          <span className="text-gray-600 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                          {asset.condition}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                            asset.status === "Assigned"
                              ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                              : asset.status === "Available"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {asset.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {asset.status === "Available" ? (
                            <button
                              onClick={() => {
                                setSelectedAsset(asset);
                                setShowAssignModal(true);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-2.5 py-1.2 rounded-lg transition cursor-pointer"
                            >
                              Assign
                            </button>
                          ) : asset.status === "Assigned" ? (
                            <button
                              onClick={() => handleReturn(asset.id)}
                              className="bg-gray-800 hover:bg-red-500/20 text-gray-300 hover:text-red-400 font-bold text-[11px] px-2.5 py-1.2 rounded-lg transition border border-gray-700 hover:border-red-500/30 cursor-pointer"
                            >
                              Return
                            </button>
                          ) : null}
                          <button
                            onClick={() => setEditingAsset(asset)}
                            title="Edit Asset"
                            className="p-1.5 rounded-lg bg-gray-800 hover:bg-sky-500/20 text-gray-400 hover:text-sky-400 border border-gray-700 transition cursor-pointer"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteAsset(asset.id, asset.name)}
                            title="Delete Asset"
                            className="p-1.5 rounded-lg bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-gray-700 transition cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Edit Asset Modal */}
      {editingAsset && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c1018] border border-sky-500/30 rounded-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-sky-500/5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit2 size={16} className="text-sky-400" />
                Edit Company Asset ({editingAsset.assetCode})
              </h2>
              <button onClick={() => setEditingAsset(null)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleUpdateAsset} className="p-4 space-y-3.5">
              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Asset Name</label>
                <input
                  required
                  type="text"
                  value={editingAsset.name}
                  onChange={(e) => setEditingAsset({ ...editingAsset, name: e.target.value })}
                  className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Category</label>
                  <select
                    value={editingAsset.category}
                    onChange={(e) => setEditingAsset({ ...editingAsset, category: e.target.value as any })}
                    className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="Laptop">Laptop / PC</option>
                    <option value="Mobile">Mobile Phone</option>
                    <option value="SIM Card">SIM Card</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Other">Other Equipment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Status</label>
                  <select
                    value={editingAsset.status}
                    onChange={(e) => setEditingAsset({ ...editingAsset, status: e.target.value as any })}
                    className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="Available">Available</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Under Repair">Under Repair</option>
                    <option value="Disposed">Disposed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Brand / Maker</label>
                  <input
                    type="text"
                    value={editingAsset.brand || ""}
                    onChange={(e) => setEditingAsset({ ...editingAsset, brand: e.target.value })}
                    className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Serial / IMEI #</label>
                  <input
                    type="text"
                    value={editingAsset.serialNumber || ""}
                    onChange={(e) => setEditingAsset({ ...editingAsset, serialNumber: e.target.value })}
                    className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Condition</label>
                  <select
                    value={editingAsset.condition}
                    onChange={(e) => setEditingAsset({ ...editingAsset, condition: e.target.value as any })}
                    className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="New">New / Mint</option>
                    <option value="Good">Good Condition</option>
                    <option value="Fair">Fair / Used</option>
                    <option value="Damaged">Damaged / Faulty</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Value ({currencySymbol || "$"})</label>
                  <input
                    type="number"
                    value={editingAsset.purchaseValue || 0}
                    onChange={(e) => setEditingAsset({ ...editingAsset, purchaseValue: Number(e.target.value) })}
                    className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs p-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs p-2.5 rounded-xl transition shadow-lg shadow-sky-950/50 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c1018] border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Package size={16} className="text-emerald-400" />
                Register New Asset
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddAsset} className="p-4 space-y-3.5">
              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Asset Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Lenovo ThinkPad T14 Gen 4"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="Mobile">Mobile</option>
                    <option value="SIM Card">SIM Card</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Brand / Make</label>
                  <input
                    type="text"
                    placeholder="e.g. Apple, Dell, HP"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Serial / IMEI / Plate</label>
                  <input
                    type="text"
                    placeholder="SN-12345678"
                    value={form.serialNumber}
                    onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                    className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Cost ({currencySymbol || "$"})</label>
                  <input
                    type="number"
                    value={form.purchaseValue}
                    onChange={(e) => setForm({ ...form, purchaseValue: Number(e.target.value) })}
                    className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Initial Condition</label>
                <select
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value as any })}
                  className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                >
                  <option value="New">Brand New</option>
                  <option value="Good">Good (Used)</option>
                  <option value="Fair">Fair</option>
                  <option value="Damaged">Damaged</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs p-3 rounded-xl transition mt-2 shadow-lg shadow-emerald-950/50"
              >
                Register Asset
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedAsset && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c1018] border border-gray-700 rounded-2xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-sm font-bold text-white">Assign Asset</h2>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAssign} className="p-4 space-y-4">
              <div className="p-3 bg-black/50 border border-gray-800 rounded-xl">
                <div className="text-xs font-bold text-white">{selectedAsset.name}</div>
                <div className="text-[10px] text-emerald-400 font-mono">{selectedAsset.assetCode}</div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Select Employee</label>
                <select
                  required
                  value={assignForm.employeeId}
                  onChange={(e) => setAssignForm({ employeeId: e.target.value })}
                  className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Choose Employee...</option>
                  {hrEmployees
                    .filter((e) => e.status === "Active")
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} &bull; {emp.department}
                      </option>
                    ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs p-3 rounded-xl transition"
              >
                Confirm Assignment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
