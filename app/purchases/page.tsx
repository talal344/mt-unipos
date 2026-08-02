"use client";

import React, { useState, useEffect } from "react";
import { useGlobalContext } from "@/context/global-context";
import ClientSidebar from "@/components/client-sidebar";
import {
  Plus, CheckCircle2, ShieldCheck, X, Search, Package, Truck,
  Eye, Trash2, AlertTriangle, Filter, ClipboardList, Calendar,
  ChevronDown, DollarSign
} from "lucide-react";

interface POLineItem {
  productId: string;
  productName: string;
  costPrice: number;
  qty: number;
  subtotal: number;
}

interface ReceiveItem {
  idx: number;
  productId: string;
  productName: string;
  orderedQty: number;
  receivedQty: number;
  costPrice: number;
}

export default function PurchasesPage() {
  const { purchaseOrders, suppliers, products, createPurchaseOrder, receiveGoods, currencySymbol } = useGlobalContext();

  // ── List state ──────────────────────────────────────────────────────────────
  const [searchQ, setSearchQ]         = useState("");
  const [statusFilter, setStatusFilter] = useState<"All"|"Pending"|"Received">("All");
  const [toast, setToast]             = useState<string|null>(null);

  // ── Create PO Modal ─────────────────────────────────────────────────────────
  const [showCreate, setShowCreate]   = useState(false);
  const [supplierId, setSupplierId]   = useState("");
  const [poLines, setPoLines]         = useState<POLineItem[]>([]);

  // ── Receive Goods Modal ─────────────────────────────────────────────────────
  const [receivePO, setReceivePO]     = useState<any>(null);
  const [receiveItems, setReceiveItems] = useState<ReceiveItem[]>([]);
  const [receiveNotes, setReceiveNotes] = useState("");
  const [batchInputs, setBatchInputs] = useState<Record<number, { batchNumber?: string; expiryDate?: string; salePrice?: string }>>({});

  // ── Detail Modal ────────────────────────────────────────────────────────────
  const [detailPO, setDetailPO]       = useState<any>(null);

  const triggerToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  // Defaults on mount
  useEffect(() => {
    if (suppliers.length > 0 && !supplierId) setSupplierId(suppliers[0].id);
  }, [suppliers, supplierId]);

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = purchaseOrders.filter(po => {
    const q = searchQ.toLowerCase();
    const matchQ = po.id.toLowerCase().includes(q) || po.supplierName.toLowerCase().includes(q);
    const matchS = statusFilter === "All" || po.status === statusFilter;
    return matchQ && matchS;
  });

  // ── Stats ───────────────────────────────────────────────────────────────────
  const totalValue   = purchaseOrders.reduce((a, po) => a + po.total, 0);
  const pendingCount = purchaseOrders.filter(po => po.status === "Pending").length;
  const recvdCount   = purchaseOrders.filter(po => po.status === "Received").length;

  // ── PO Line helpers ─────────────────────────────────────────────────────────
  const addLine = () => {
    if (products.length === 0) return;
    const p = products[0];
    setPoLines(prev => [...prev, { productId: p.id, productName: p.name, costPrice: p.costPrice, qty: 1, subtotal: p.costPrice }]);
  };

  const updateLine = (i: number, field: keyof POLineItem, val: string) => {
    setPoLines(prev => prev.map((line, idx) => {
      if (idx !== i) return line;
      let updated = { ...line, [field]: field === "productId" ? val : Number(val) };
      if (field === "productId") {
        const p = products.find(pr => pr.id === val);
        if (p) { updated.productName = p.name; updated.costPrice = p.costPrice; updated.subtotal = p.costPrice * updated.qty; }
      }
      if (field === "qty" || field === "costPrice") updated.subtotal = updated.costPrice * updated.qty;
      return updated;
    }));
  };

  const removeLine = (i: number) => setPoLines(prev => prev.filter((_, idx) => idx !== i));

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || poLines.length === 0) return;
    const supp = suppliers.find(s => s.id === supplierId);
    if (!supp) return;
    const total = poLines.reduce((a, l) => a + l.subtotal, 0);
    createPurchaseOrder({ supplierId, supplierName: supp.name, items: poLines, total });
    triggerToast(`✅ PO generated for ${supp.name}! ${poLines.length} item(s), total ${currencySymbol} ${total.toLocaleString()}`);
    setShowCreate(false);
    setPoLines([]);
  };

  // ── Open receive modal ──────────────────────────────────────────────────────
  const openReceive = (po: any) => {
    setReceivePO(po);
    setReceiveItems(po.items.map((item: any, idx: number) => ({
      idx, productId: item.productId, productName: item.productName,
      orderedQty: item.qty, receivedQty: item.qty, costPrice: item.costPrice
    })));
    setReceiveNotes("");
    setBatchInputs({});
  };

  const handleConfirmReceive = () => {
    if (!receivePO) return;
    
    const batchDataArray = receiveItems.map((item, i) => ({
      productId: item.productId,
      batchNumber: batchInputs[i]?.batchNumber || `BTH-${receivePO.id}`,
      expiryDate: batchInputs[i]?.expiryDate || undefined,
      salePrice: parseFloat(batchInputs[i]?.salePrice || '0') || (products.find(p => p.id === item.productId)?.salePrice || item.costPrice * 1.3)
    }));

    receiveGoods(receivePO.id, batchDataArray);
    triggerToast(`📦 GRN Confirmed! Stock updated for PO ${receivePO.id}.`);
    setReceivePO(null);
    setBatchInputs({});
  };

  const poGrandTotal = poLines.reduce((a, l) => a + l.subtotal, 0);

  return (
    <div className="flex min-h-screen bg-black text-gray-100 font-sans">
      <ClientSidebar />

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500/95 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={14} /> {toast}
        </div>
      )}

      <main className="flex-grow p-5 space-y-5 overflow-y-auto max-h-screen">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-dark-border/60 pb-4">
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <Truck size={20} className="text-brand-sky" />
              Purchase Orders &amp; GRN
            </h1>
            <p className="text-[10px] text-gray-500 mt-0.5">Create supplier POs, receive goods, and auto-update inventory stock.</p>
          </div>
          <button
            onClick={() => { setShowCreate(true); if (poLines.length === 0) addLine(); }}
            className="flex items-center gap-1.5 bg-brand-sky hover:bg-brand-sky-light text-black font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition"
          >
            <Plus size={14} /> Generate PO
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total POs",      value: purchaseOrders.length, color: "text-brand-sky",   icon: ClipboardList },
            { label: "Pending",        value: pendingCount,          color: "text-amber-400",   icon: AlertTriangle },
            { label: "Received",       value: recvdCount,            color: "text-emerald-400", icon: CheckCircle2  },
            { label: "Total PO Value", value: `${currencySymbol} ${totalValue.toLocaleString(undefined,{maximumFractionDigits:0})}`, color: "text-purple-400", icon: DollarSign },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-brand-dark-surface/50 border border-brand-dark-border rounded-xl p-4 flex items-center gap-3">
                <Icon size={16} className={s.color} />
                <div>
                  <div className={`text-sm font-black font-mono ${s.color}`}>{s.value}</div>
                  <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-grow max-w-xs">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={13} />
            <input
              type="text" placeholder="Search PO# or supplier..."
              value={searchQ} onChange={e => setSearchQ(e.target.value)}
              className="w-full bg-brand-dark-surface border border-brand-dark-border pl-9 pr-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-brand-sky"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter size={12} className="text-gray-500" />
            {(["All","Pending","Received"] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${
                  statusFilter === s ? "bg-brand-sky text-black" : "bg-brand-dark-surface border border-brand-dark-border text-gray-400 hover:text-white"
                }`}
              >{s}</button>
            ))}
          </div>
        </div>

        {/* PO Table */}
        <div className="bg-brand-dark-surface/30 border border-brand-dark-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brand-dark-border text-[9px] text-gray-500 uppercase font-bold tracking-wider">
                  <th className="px-4 py-3">PO Number</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark-border/30">
                {filtered.map(po => (
                  <tr key={po.id} className="hover:bg-brand-dark-surface/60 transition">
                    <td className="px-4 py-3 text-purple-400 font-black font-mono text-[11px]">{po.id}</td>
                    <td className="px-4 py-3 text-white font-bold">{po.supplierName}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-[10px]">
                      {new Date(po.date).toLocaleDateString("en-PK",{day:"2-digit",month:"short",year:"numeric"})}
                    </td>
                    <td className="px-4 py-3 text-gray-300 max-w-[180px]">
                      {po.items.map((item, i) => (
                        <div key={i} className="truncate text-[10px]">
                          {item.productName} <span className="text-brand-sky font-mono font-bold">×{item.qty}</span>
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-white font-black font-mono">{currencySymbol} {po.total.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                        po.status === "Received"
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                          : "bg-amber-500/10 border border-amber-500/30 text-amber-400 animate-pulse"
                      }`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {po.status === "Pending" ? (
                          <button onClick={() => openReceive(po)}
                            className="px-2.5 py-1.5 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-400 font-black text-[9px] rounded-lg transition flex items-center gap-1">
                            <Package size={9} /> Receive GRN
                          </button>
                        ) : (
                          <button onClick={() => setDetailPO(po)}
                            className="px-2.5 py-1.5 bg-brand-dark-border hover:bg-brand-dark-border/70 text-gray-400 font-black text-[9px] rounded-lg transition flex items-center gap-1">
                            <Eye size={9} /> View
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-600 text-[10px]">
                      No purchase orders found. Generate your first PO above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* ═══════════════════════════════════════════════════════════════════════
          CREATE PO MODAL
      ═══════════════════════════════════════════════════════════════════════ */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 font-sans">
          <div className="bg-[#0d0d0d] border border-brand-sky/25 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-dark-border shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-sky/15 border border-brand-sky/30 flex items-center justify-center">
                  <ClipboardList size={14} className="text-brand-sky" />
                </div>
                <div>
                  <h3 className="font-black text-white text-sm">Generate Purchase Order</h3>
                  <p className="text-[9px] text-gray-500">Add multiple products in a single PO</p>
                </div>
              </div>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white"><X size={16} /></button>
            </div>

            <form onSubmit={handleCreatePO} className="flex flex-col flex-grow overflow-hidden">
              <div className="p-5 space-y-4 overflow-y-auto flex-grow">
                {/* Supplier */}
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Select Supplier</label>
                  <select value={supplierId} onChange={e => setSupplierId(e.target.value)}
                    className="w-full bg-black border border-brand-dark-border p-2.5 rounded-lg text-white text-xs focus:outline-none focus:border-brand-sky">
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} — {s.company}</option>)}
                  </select>
                  {suppliers.length === 0 && <p className="text-[9px] text-amber-400 mt-1">⚠ No suppliers found. Add a supplier first.</p>}
                </div>

                {/* Line Items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[9px] uppercase font-bold text-gray-400">Product Lines</label>
                    <button type="button" onClick={addLine}
                      className="flex items-center gap-1 text-[9px] text-brand-sky font-black hover:underline">
                      <Plus size={10} /> Add Product
                    </button>
                  </div>
                  <div className="space-y-2">
                    {poLines.map((line, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 bg-black/40 border border-brand-dark-border rounded-xl p-3 items-center">
                        {/* Product */}
                        <div className="col-span-5">
                          <select value={line.productId} onChange={e => updateLine(i, "productId", e.target.value)}
                            className="w-full bg-black border border-brand-dark-border p-2 rounded text-white text-[10px] focus:outline-none focus:border-brand-sky">
                            {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                          </select>
                        </div>
                        {/* Qty */}
                        <div className="col-span-2">
                          <input type="number" min="1" value={line.qty} onChange={e => updateLine(i, "qty", e.target.value)}
                            placeholder="Qty" className="w-full bg-black border border-brand-dark-border p-2 rounded text-white text-[10px] font-mono focus:outline-none focus:border-brand-sky" />
                        </div>
                        {/* Cost */}
                        <div className="col-span-2">
                          <input type="number" min="0" value={line.costPrice} onChange={e => updateLine(i, "costPrice", e.target.value)}
                            placeholder="Cost" className="w-full bg-black border border-brand-dark-border p-2 rounded text-white text-[10px] font-mono focus:outline-none focus:border-brand-sky" />
                        </div>
                        {/* Subtotal */}
                        <div className="col-span-2 text-right">
                          <span className="text-brand-sky font-black font-mono text-[10px]">
                            {currencySymbol} {line.subtotal.toLocaleString()}
                          </span>
                        </div>
                        {/* Remove */}
                        <div className="col-span-1 flex justify-end">
                          <button type="button" onClick={() => removeLine(i)} className="text-gray-600 hover:text-red-400 transition">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {poLines.length === 0 && (
                      <div className="text-center py-6 text-gray-600 text-[10px] border border-dashed border-brand-dark-border rounded-xl">
                        No product lines yet. Click "Add Product" above.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-brand-dark-border shrink-0 flex items-center justify-between gap-3">
                <div className="font-mono text-[11px] text-gray-400">
                  Grand Total: <span className="text-brand-sky font-black text-sm">{currencySymbol} {poGrandTotal.toLocaleString()}</span>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowCreate(false)}
                    className="px-4 py-2.5 bg-brand-dark-border text-gray-300 font-bold text-xs rounded-xl hover:bg-brand-dark-border/70 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={poLines.length === 0 || !supplierId}
                    className="px-5 py-2.5 bg-brand-sky hover:bg-brand-sky-light disabled:opacity-40 disabled:cursor-not-allowed text-black font-black text-xs rounded-xl transition">
                    Generate &amp; Dispatch PO
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          RECEIVE GOODS (GRN) MODAL
      ═══════════════════════════════════════════════════════════════════════ */}
      {receivePO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 font-sans">
          <div className="bg-[#0d0d0d] border border-emerald-500/25 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-dark-border shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <Package size={14} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-black text-white text-sm">Receive Goods — GRN</h3>
                  <p className="text-[9px] text-gray-500">PO: <span className="text-purple-400 font-mono">{receivePO.id}</span> · {receivePO.supplierName}</p>
                </div>
              </div>
              <button onClick={() => { setReceivePO(null); setBatchInputs({}); }} className="text-gray-400 hover:text-white"><X size={16} /></button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-grow text-xs">
              {/* Items */}
              <div>
                <label className="text-[9px] uppercase font-bold text-gray-400 block mb-2">Items to Receive</label>
                <div className="space-y-2">
                  {receiveItems.map((item, i) => (
                    <div key={i} className="bg-black/50 border border-brand-dark-border rounded-xl p-3 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-grow min-w-0">
                          <div className="font-bold text-white text-[11px] truncate">{item.productName}</div>
                          <div className="text-[9px] text-gray-500 font-mono">Ordered: {item.orderedQty}</div>
                        </div>
                        <div className="shrink-0">
                          <label className="text-[8px] text-gray-500 block mb-1">Received Qty</label>
                          <input
                            type="number" min="0" max={item.orderedQty}
                            value={item.receivedQty}
                            onChange={e => setReceiveItems(prev => prev.map((it, idx) =>
                              idx === i ? { ...it, receivedQty: Math.min(Number(e.target.value), it.orderedQty) } : it
                            ))}
                            className="w-20 bg-black border border-brand-sky/30 p-1.5 rounded text-white font-mono text-[10px] focus:outline-none focus:border-brand-sky text-center"
                          />
                        </div>
                      </div>
                      
                      {/* Batch Details */}
                      <div className="grid grid-cols-3 gap-2 border-t border-brand-dark-border/40 pt-3 mt-1">
                        <div>
                          <label className="text-[8px] text-gray-500 block mb-1">Batch Number</label>
                          <input 
                            type="text" 
                            placeholder={`BTH-${receivePO.id}`}
                            value={batchInputs[i]?.batchNumber || ''}
                            onChange={e => setBatchInputs(prev => ({ ...prev, [i]: { ...prev[i], batchNumber: e.target.value } }))}
                            className="w-full bg-black border border-brand-dark-border p-1.5 rounded text-white font-mono text-[10px] focus:outline-none focus:border-brand-sky"
                          />
                        </div>
                        <div>
                          <label className="text-[8px] text-gray-500 block mb-1">Expiry Date</label>
                          <input 
                            type="date"
                            value={batchInputs[i]?.expiryDate || ''}
                            onChange={e => setBatchInputs(prev => ({ ...prev, [i]: { ...prev[i], expiryDate: e.target.value } }))}
                            className="w-full bg-black border border-brand-dark-border p-1.5 rounded text-white font-mono text-[10px] focus:outline-none focus:border-brand-sky"
                            style={{ colorScheme: 'dark' }}
                          />
                        </div>
                        <div>
                          <label className="text-[8px] text-gray-500 block mb-1">Sale Price</label>
                          <input 
                            type="number" step="0.01" min="0"
                            placeholder={String(products.find(p => p.id === item.productId)?.salePrice || item.costPrice * 1.3)}
                            value={batchInputs[i]?.salePrice || ''}
                            onChange={e => setBatchInputs(prev => ({ ...prev, [i]: { ...prev[i], salePrice: e.target.value } }))}
                            className="w-full bg-black border border-brand-dark-border p-1.5 rounded text-white font-mono text-[10px] focus:outline-none focus:border-brand-sky"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1.5">Receiving Notes / Remarks</label>
                <textarea
                  rows={2} placeholder="Optional: note damaged goods, shortage etc."
                  value={receiveNotes} onChange={e => setReceiveNotes(e.target.value)}
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded-lg text-white text-[10px] focus:outline-none focus:border-brand-sky resize-none"
                />
              </div>

              {/* Summary */}
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 font-mono text-[10px] space-y-1">
                <div className="flex justify-between"><span className="text-gray-500">Total Items:</span><span className="text-white font-black">{receiveItems.length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">PO Total:</span><span className="text-emerald-400 font-black">{currencySymbol} {receivePO.total.toLocaleString()}</span></div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-brand-dark-border shrink-0 flex gap-2">
              <button onClick={() => { setReceivePO(null); setBatchInputs({}); }}
                className="flex-1 py-2.5 bg-brand-dark-border text-gray-300 font-bold text-xs rounded-xl hover:bg-brand-dark-border/70 transition">
                Cancel
              </button>
              <button onClick={handleConfirmReceive}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase rounded-xl transition flex items-center justify-center gap-1.5">
                <ShieldCheck size={13} /> Confirm GRN &amp; Update Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          PO DETAIL MODAL
      ═══════════════════════════════════════════════════════════════════════ */}
      {detailPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 font-sans">
          <div className="bg-[#0d0d0d] border border-brand-dark-border rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-dark-border">
              <div>
                <h3 className="font-black text-white text-sm">PO Detail</h3>
                <p className="text-[9px] text-purple-400 font-mono">{detailPO.id}</p>
              </div>
              <button onClick={() => setDetailPO(null)} className="text-gray-400 hover:text-white"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <div className="bg-black/50 border border-brand-dark-border rounded-xl p-3 font-mono text-[10px] space-y-1.5">
                <div className="flex justify-between"><span className="text-gray-500">Supplier:</span><span className="text-white font-bold">{detailPO.supplierName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Date:</span><span className="text-gray-300">{new Date(detailPO.date).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Status:</span>
                  <span className="text-emerald-400 font-black">{detailPO.status}</span>
                </div>
                <div className="flex justify-between border-t border-brand-dark-border/40 pt-1.5">
                  <span className="text-gray-400 font-bold">Grand Total:</span>
                  <span className="text-brand-sky font-black">{currencySymbol} {detailPO.total.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-gray-400 mb-2">Items</p>
                <div className="space-y-1.5">
                  {detailPO.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-black/40 border border-brand-dark-border/50 rounded-lg px-3 py-2 font-mono text-[10px]">
                      <span className="text-white font-bold">{item.productName}</span>
                      <span className="text-gray-400">×{item.qty} @ {currencySymbol}{item.costPrice} = <span className="text-brand-sky font-black">{currencySymbol}{item.subtotal.toLocaleString()}</span></span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => setDetailPO(null)}
                className="w-full py-2.5 bg-brand-dark-border text-gray-300 font-bold text-xs rounded-xl hover:bg-brand-dark-border/70 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
