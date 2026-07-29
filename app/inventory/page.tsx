"use client";

import React, { useState } from "react";
import { useGlobalContext } from "@/context/global-context";
import ClientSidebar from "@/components/client-sidebar";
import { TrendingDown, TrendingUp, AlertTriangle, ShieldCheck, Database, Layers, ArrowLeftRight } from "lucide-react";

export default function InventoryPage() {
  const { products, updateProduct, currentBranch, currencySymbol } = useGlobalContext();
  const [successMsg, setSuccessMsg] = useState("");
  
  // Stock Adjustment States
  const [activeAdjustProduct, setActiveAdjustProduct] = useState<any>(null);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustType, setAdjustType] = useState<"Add" | "Subtract">("Add");

  // Multi-branch Transfer States
  const [activeTransferProduct, setActiveTransferProduct] = useState<any>(null);
  const [transferQty, setTransferQty] = useState("");
  const [targetBranch, setTargetBranch] = useState("DHA Phase 6");

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAdjustProduct || !adjustQty) return;

    const delta = Number(adjustQty) * (adjustType === "Add" ? 1 : -1);
    const nextStock = Math.max(0, activeAdjustProduct.stock + delta);
    updateProduct(activeAdjustProduct.id, { stock: nextStock });

    setSuccessMsg(`Inventory adjusted: ${activeAdjustProduct.name} stock set to ${nextStock}`);
    setActiveAdjustProduct(null);
    setAdjustQty("");
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTransferProduct || !transferQty) return;

    const qty = Number(transferQty);
    if (qty > activeTransferProduct.stock) {
      alert("Transfer quantity exceeds current active warehouse stock!");
      return;
    }

    const nextStock = activeTransferProduct.stock - qty;
    updateProduct(activeTransferProduct.id, { stock: nextStock });

    setSuccessMsg(`Dispatched ${qty} units of ${activeTransferProduct.name} from ${currentBranch} to ${targetBranch}`);
    setActiveTransferProduct(null);
    setTransferQty("");
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  // Stock valuation computations
  const totalStockValue = products.reduce((acc, p) => acc + (p.costPrice * p.stock), 0);
  const totalStockLines = products.length;

  return (
    <div className="flex min-h-screen bg-black text-gray-100 font-sans">
      <ClientSidebar />

      <main className="flex-grow p-6 sm:p-8 space-y-6 overflow-y-auto max-h-screen">
        
        {/* Top Header */}
        <div className="flex justify-between items-center border-b border-brand-dark-border/60 pb-4">
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">Inventory Central Ledger</h1>
            <p className="text-[10px] text-gray-500">Real-time stock reconciliations, warehouse adjustments, and sharded transfers.</p>
          </div>
          <span className="text-[10px] font-mono text-gray-500 bg-brand-dark-surface border border-brand-dark-border px-3 py-1 rounded">
            Active: {currentBranch}
          </span>
        </div>

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500 p-3 rounded-lg text-xs flex items-center gap-2 text-emerald-400 font-bold animate-fade-in-up">
            <ShieldCheck size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Inventory Analytics Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="bg-brand-dark-surface/50 border border-brand-dark-border p-4 rounded-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-wide font-bold text-gray-500">Inventory Valuation</span>
              <div className="text-lg font-black text-white">{currencySymbol} {totalStockValue.toLocaleString()}</div>
            </div>
            <Database size={24} className="text-brand-sky opacity-80" />
          </div>

          <div className="bg-brand-dark-surface/50 border border-brand-dark-border p-4 rounded-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-wide font-bold text-gray-500">Stock SKU Count</span>
              <div className="text-lg font-black text-white">{totalStockLines} Lines</div>
            </div>
            <Layers size={24} className="text-purple-500 opacity-80" />
          </div>

          <div className="bg-brand-dark-surface/50 border border-brand-dark-border p-4 rounded-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-wide font-bold text-gray-500">System Expiries Active</span>
              <div className="text-lg font-black text-white">4 Active warnings</div>
            </div>
            <AlertTriangle size={24} className="text-amber-500 opacity-80" />
          </div>

        </div>

        {/* Master Inventory grid */}
        <div className="bg-brand-dark-surface/30 border border-brand-dark-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brand-dark-border text-gray-500 font-mono">
                  <th className="p-4 font-semibold">SKU / Barcode</th>
                  <th className="p-4 font-semibold">Product Name</th>
                  <th className="p-4 font-semibold">Current Stock</th>
                  <th className="p-4 font-semibold">Cost Valuation</th>
                  <th className="p-4 font-semibold">Wholesale Price</th>
                  <th className="p-4 font-semibold text-center">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark-border/40 font-mono text-[11px]">
                {products.map(prod => {
                  const valTotal = prod.costPrice * prod.stock;
                  return (
                    <tr key={prod.id} className="hover:bg-brand-dark-surface/60 transition">
                      <td className="p-4">
                        <div className="text-white font-bold">{prod.sku}</div>
                        <div className="text-[9px] text-gray-500">{prod.barcode}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-white font-bold font-sans">{prod.name}</div>
                        <div className="text-[9px] text-brand-sky font-sans">{prod.category} • {prod.unit}</div>
                      </td>
                      <td className="p-4">
                        <span className={`font-bold ${prod.stock <= prod.minStock ? "text-red-400 font-bold" : "text-emerald-400"}`}>
                          {prod.stock} units
                        </span>
                      </td>
                      <td className="p-4 text-white font-bold">{currencySymbol} {valTotal.toLocaleString()}</td>
                      <td className="p-4 text-gray-400">{currencySymbol} {prod.wholesalePrice || prod.salePrice * 0.9}</td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => setActiveAdjustProduct(prod)}
                            className="p-1.5 bg-brand-dark-border hover:bg-brand-sky/20 text-gray-300 hover:text-white rounded transition text-[10px] font-bold"
                            title="Adjust stock quantity"
                          >
                            Adjust
                          </button>
                          <button
                            onClick={() => setActiveTransferProduct(prod)}
                            className="p-1.5 bg-brand-dark-border hover:bg-purple-600/30 text-gray-300 hover:text-white rounded transition text-[10px] font-bold flex items-center gap-1"
                            title="Disburse to branch"
                          >
                            <ArrowLeftRight size={10} />
                            Transfer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Adjust Stock Modal */}
        {activeAdjustProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <div className="bg-brand-dark-surface border border-brand-sky/30 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in-up">
              <div className="flex justify-between items-center border-b border-brand-dark-border pb-3 mb-4 text-xs">
                <h3 className="font-black text-white">Direct Stock Adjust</h3>
                <button onClick={() => setActiveAdjustProduct(null)} className="text-gray-400 hover:text-white">Cancel</button>
              </div>

              <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
                <div>
                  <h4 className="text-white font-bold">{activeAdjustProduct.name}</h4>
                  <p className="text-[9px] text-gray-500">Current active ledger stock: {activeAdjustProduct.stock}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Adjustment Type</label>
                    <select
                      value={adjustType}
                      onChange={(e) => setAdjustType(e.target.value as any)}
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white"
                    >
                      <option>Add</option>
                      <option>Subtract</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Adjust Quantity</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 10"
                      value={adjustQty}
                      onChange={(e) => setAdjustQty(e.target.value)}
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-sky hover:bg-brand-sky-light text-black font-black uppercase rounded"
                >
                  Adjust Inventory Balance
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Transfer Stock Modal */}
        {activeTransferProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <div className="bg-brand-dark-surface border border-purple-500/30 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in-up">
              <div className="flex justify-between items-center border-b border-brand-dark-border pb-3 mb-4 text-xs">
                <h3 className="font-black text-white">Disburse Branch Stock</h3>
                <button onClick={() => setActiveTransferProduct(null)} className="text-gray-400 hover:text-white">Cancel</button>
              </div>

              <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
                <div>
                  <h4 className="text-white font-bold">{activeTransferProduct.name}</h4>
                  <p className="text-[9px] text-gray-500">Available at {currentBranch}: {activeTransferProduct.stock}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Target Branch Shard</label>
                    <select
                      value={targetBranch}
                      onChange={(e) => setTargetBranch(e.target.value)}
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white"
                    >
                      <option>DHA Phase 6</option>
                      <option>Johar Town</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Disburse Qty</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 5"
                      value={transferQty}
                      onChange={(e) => setTransferQty(e.target.value)}
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase rounded"
                >
                  Initiate Sharded Transfer
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
