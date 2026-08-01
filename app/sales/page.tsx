"use client";

import React, { useState, useMemo, useRef } from "react";
import { useGlobalContext } from "@/context/global-context";
import ClientSidebar from "@/components/client-sidebar";
import ThermalSlipModal from "@/components/thermal-slip-modal";
import {
  Receipt, Search, Calendar, Eye, TrendingUp, ShoppingCart,
  Users, Banknote, FileDown, Printer, User, X,
  CreditCard, Landmark, Wallet, Smartphone, ChevronDown,
  BarChart3, ArrowUpRight
} from "lucide-react";
import * as XLSX from "xlsx";

// ─── Types ────────────────────────────────────────────────────────────────────
type Period = "today" | "week" | "month" | "custom";
type StatusFilter = "All" | "Completed" | "Returned" | "Refunded";
type ViewMode = "table" | "staff";

// ─── Constants ────────────────────────────────────────────────────────────────
const ALL_PAYMENT_METHODS = [
  { key: "Cash",          label: "Cash",          icon: Banknote,   color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { key: "Card",          label: "Card",          icon: CreditCard, color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20"    },
  { key: "Bank Transfer", label: "Bank",          icon: Landmark,   color: "text-purple-400",  bg: "bg-purple-500/10 border-purple-500/20" },
  { key: "EasyPaisa",     label: "EasyPaisa",     icon: Smartphone, color: "text-green-400",   bg: "bg-green-500/10 border-green-500/20"  },
  { key: "JazzCash",      label: "JazzCash",      icon: Smartphone, color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20"      },
  { key: "On Credit",     label: "On Credit",     icon: Wallet,     color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20"  },
];

const METHOD_COLORS: Record<string, string> = {
  "Cash":          "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  "Card":          "text-blue-400    bg-blue-500/10    border-blue-500/30",
  "Bank Transfer": "text-purple-400  bg-purple-500/10  border-purple-500/30",
  "EasyPaisa":     "text-green-400   bg-green-500/10   border-green-500/30",
  "JazzCash":      "text-red-400     bg-red-500/10     border-red-500/30",
  "On Credit":     "text-amber-400   bg-amber-500/10   border-amber-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  "Completed": "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  "Returned":  "text-amber-400   bg-amber-500/10   border-amber-500/30",
  "Refunded":  "text-red-400     bg-red-500/10     border-red-500/30",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function startOfDay(d: Date) { const r = new Date(d); r.setHours(0,0,0,0); return r; }
function endOfDay(d: Date)   { const r = new Date(d); r.setHours(23,59,59,999); return r; }
function fmtDate(s: string) {
  try { return new Date(s).toLocaleDateString("en-PK",{day:"2-digit",month:"short",year:"numeric"}); }
  catch { return s; }
}
function fmtDateTime(s: string) {
  try { return new Date(s).toLocaleString("en-PK",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}); }
  catch { return s; }
}
function periodLabel(period: Period, customFrom: string, customTo: string) {
  if (period === "today") return `Today — ${fmtDate(new Date().toISOString())}`;
  if (period === "week")  return "This Week";
  if (period === "month") return `${new Date().toLocaleString("en-PK",{month:"long",year:"numeric"})}`;
  if (customFrom && customTo) return `${fmtDate(customFrom)} to ${fmtDate(customTo)}`;
  return "Custom Range";
}

// ─── Print Report Builder ─────────────────────────────────────────────────────
function buildStaffReportHTML(
  staffName: string,
  sales: any[],
  currencySymbol: string,
  period: string,
  branch: string
): string {
  const completed = sales.filter(s => s.status === "Completed");
  const total     = completed.reduce((a, s) => a + s.total, 0);
  const byMethod: Record<string, number> = {};
  completed.forEach(s => { byMethod[s.paymentMethod] = (byMethod[s.paymentMethod] || 0) + s.total; });

  const methodRows = Object.entries(byMethod).map(([m, v]) =>
    `<tr><td style="padding:3px 0">${m}</td><td style="text-align:right;font-weight:700">${currencySymbol} ${v.toFixed(2)}</td></tr>`
  ).join("");

  const saleRows = sales.map(s =>
    `<tr style="border-bottom:1px solid #ddd">
      <td style="padding:3px 2px;font-size:9px">${s.receiptNumber}</td>
      <td style="padding:3px 2px;font-size:9px">${new Date(s.date).toLocaleTimeString("en-PK",{hour:"2-digit",minute:"2-digit"})}</td>
      <td style="padding:3px 2px;font-size:9px">${s.customerName}</td>
      <td style="padding:3px 2px;font-size:9px;text-align:right;font-weight:700">${currencySymbol} ${s.total.toFixed(2)}</td>
      <td style="padding:3px 2px;font-size:9px">${s.paymentMethod}</td>
      <td style="padding:3px 2px;font-size:9px">${s.status}</td>
    </tr>`
  ).join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>Staff Report — ${staffName}</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Courier New',monospace; font-size:10px; color:#000; background:#fff; width:80mm; padding:8px 10px 16px; line-height:1.4; }
  .center { text-align:center; }
  .bold { font-weight:700; }
  .divider { border-top:1px solid #000; margin:5px 0; }
  .dash { border-top:1px dashed #000; margin:5px 0; }
  table { width:100%; border-collapse:collapse; }
</style>
</head><body>
  <div class="center" style="margin-bottom:8px">
    <div style="font-size:13px;font-weight:900;font-family:Arial,sans-serif">MT UNIPOS</div>
    <div style="font-size:8px;text-transform:uppercase;letter-spacing:2px;color:#555">Staff Sales Report</div>
    <div style="font-size:9px">${branch}</div>
  </div>
  <div class="divider"></div>
  <div style="margin-bottom:6px">
    <div><b>Staff:</b> ${staffName}</div>
    <div><b>Period:</b> ${period}</div>
    <div><b>Generated:</b> ${new Date().toLocaleString()}</div>
    <div><b>Transactions:</b> ${sales.length}</div>
  </div>
  <div class="divider"></div>
  <div style="font-weight:700;margin-bottom:4px;font-size:10px">PAYMENT BREAKDOWN</div>
  <table style="margin-bottom:6px">
    ${methodRows}
    <tr style="border-top:1px solid #000;margin-top:4px">
      <td style="padding-top:4px;font-weight:900">TOTAL COLLECTED</td>
      <td style="text-align:right;font-weight:900;font-size:12px;padding-top:4px">${currencySymbol} ${total.toFixed(2)}</td>
    </tr>
  </table>
  <div class="dash"></div>
  <div style="font-weight:700;margin-bottom:4px;font-size:10px">TRANSACTIONS</div>
  <table>
    <thead><tr style="border-bottom:1px solid #000;font-weight:700;font-size:9px">
      <th style="text-align:left;padding-bottom:3px">Receipt</th>
      <th style="text-align:left;padding-bottom:3px">Time</th>
      <th style="text-align:left;padding-bottom:3px">Customer</th>
      <th style="text-align:right;padding-bottom:3px">Total</th>
      <th style="text-align:left;padding-bottom:3px">Method</th>
      <th style="text-align:left;padding-bottom:3px">Status</th>
    </tr></thead>
    <tbody>${saleRows}</tbody>
  </table>
  <div class="divider"></div>
  <div class="center" style="font-size:8px;margin-top:6px">Powered by MT UniPOS SaaS ERP</div>
</body></html>`;
}

// ─── Staff Report Card ────────────────────────────────────────────────────────
function StaffCard({ staffName, sales, currencySymbol, onViewSales, onPrintReport, onSlipView }: {
  staffName: string;
  sales: any[];
  currencySymbol: string;
  onViewSales: () => void;
  onPrintReport: () => void;
  onSlipView: (sale: any) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const completed = sales.filter(s => s.status === "Completed");
  const total     = completed.reduce((a, s) => a + s.total, 0);
  const byMethod: Record<string, number> = {};
  completed.forEach(s => { byMethod[s.paymentMethod] = (byMethod[s.paymentMethod] || 0) + s.total; });

  return (
    <div className="bg-brand-dark-surface/40 border border-brand-dark-border hover:border-brand-sky/30 transition rounded-2xl overflow-hidden">
      {/* Staff header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-brand-dark-border/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-sky/15 border border-brand-sky/30 flex items-center justify-center shrink-0">
            <User size={14} className="text-brand-sky" />
          </div>
          <div>
            <div className="font-black text-white text-sm">{staffName}</div>
            <div className="text-[9px] text-gray-500">{sales.length} transactions · {completed.length} completed</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right mr-2">
            <div className="font-black font-mono text-brand-sky text-sm">{currencySymbol} {total.toLocaleString(undefined,{maximumFractionDigits:0})}</div>
            <div className="text-[8px] text-gray-500 uppercase">total collected</div>
          </div>
          <button onClick={onPrintReport}
            className="p-2 rounded-lg bg-brand-dark-border hover:bg-brand-sky/20 hover:text-brand-sky text-gray-400 transition"
            title="Print Staff Report">
            <Printer size={13} />
          </button>
          <button
            onClick={() => setExpanded(v => !v)}
            className={`p-2 rounded-lg bg-brand-dark-border hover:bg-brand-dark-border/70 text-gray-400 transition ${expanded ? "rotate-180" : ""}`}
          >
            <ChevronDown size={13} />
          </button>
        </div>
      </div>

      {/* Payment breakdown */}
      <div className="px-4 py-3 grid grid-cols-3 lg:grid-cols-6 gap-2">
        {ALL_PAYMENT_METHODS.map(m => {
          const val = byMethod[m.key] || 0;
          const Icon = m.icon;
          return (
            <div key={m.key} className={`rounded-xl border p-2.5 ${val > 0 ? m.bg : "bg-black/20 border-brand-dark-border/30"}`}>
              <div className="flex items-center gap-1 mb-1">
                <Icon size={9} className={val > 0 ? m.color : "text-gray-700"} />
                <span className={`text-[8px] font-bold uppercase tracking-wider ${val > 0 ? m.color : "text-gray-700"}`}>{m.label}</span>
              </div>
              <div className={`font-black font-mono text-[10px] ${val > 0 ? m.color : "text-gray-700"}`}>
                {val > 0 ? `${currencySymbol} ${val.toLocaleString(undefined,{maximumFractionDigits:0})}` : "—"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expandable transactions */}
      {expanded && (
        <div className="border-t border-brand-dark-border/40 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[9px] text-gray-500 uppercase border-b border-brand-dark-border/30">
                <th className="px-4 py-2 text-left">Receipt</th>
                <th className="px-4 py-2 text-left">Time</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2 text-left">Method</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-center">Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark-border/15">
              {sales.map(s => (
                <tr key={s.id} className="hover:bg-brand-dark-surface/60 transition group">
                  <td className="px-4 py-2 font-mono text-[10px] text-purple-400 font-black whitespace-nowrap">{s.receiptNumber}</td>
                  <td className="px-4 py-2 font-mono text-[10px] text-gray-400">
                    {new Date(s.date).toLocaleTimeString("en-PK",{hour:"2-digit",minute:"2-digit"})}
                  </td>
                  <td className="px-4 py-2 text-[10px] text-white font-bold">{s.customerName}</td>
                  <td className="px-4 py-2 text-right font-black font-mono text-brand-sky text-[10px] whitespace-nowrap">
                    {currencySymbol} {s.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${METHOD_COLORS[s.paymentMethod] || "text-gray-400 bg-brand-dark-border border-brand-dark-border"}`}>
                      {s.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${STATUS_COLORS[s.status] || "text-gray-400 bg-brand-dark-border border-brand-dark-border"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => onSlipView(s)}
                      className="flex items-center gap-1 mx-auto px-2 py-1 bg-brand-dark-border hover:bg-brand-sky/20 hover:text-brand-sky text-gray-400 font-bold text-[8px] rounded transition">
                      <Eye size={9} /> Slip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SalesPage() {
  const { sales, currencySymbol, currentBranch, businessSettings } = useGlobalContext();

  // ── View & Filters ─────────────────────────────────────────────────────────
  const [viewMode, setViewMode]       = useState<ViewMode>("table");
  const [period, setPeriod]           = useState<Period>("today");
  const [customFrom, setCustomFrom]   = useState("");
  const [customTo, setCustomTo]       = useState("");
  const [searchQ, setSearchQ]         = useState("");
  const [statusF, setStatusF]         = useState<StatusFilter>("All");
  const [staffF, setStaffF]           = useState("All");
  const [methodF, setMethodF]         = useState("All");

  // ── Modals ─────────────────────────────────────────────────────────────────
  const [slipSale, setSlipSale]       = useState<any>(null);
  const [printReportStaff, setPrintReportStaff] = useState<string|null>(null);

  // ── Date range ─────────────────────────────────────────────────────────────
  const { fromDate, toDate } = useMemo(() => {
    const now = new Date();
    if (period === "today") return { fromDate: startOfDay(now), toDate: endOfDay(now) };
    if (period === "week") {
      const mon = new Date(now); mon.setDate(now.getDate() - now.getDay() + 1);
      return { fromDate: startOfDay(mon), toDate: endOfDay(now) };
    }
    if (period === "month") {
      return { fromDate: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)), toDate: endOfDay(now) };
    }
    return {
      fromDate: customFrom ? startOfDay(new Date(customFrom)) : new Date(0),
      toDate:   customTo   ? endOfDay(new Date(customTo))     : new Date(9999,0,1),
    };
  }, [period, customFrom, customTo]);

  // ── All staff names ────────────────────────────────────────────────────────
  const allStaff = useMemo(() =>
    Array.from(new Set(sales.map(s => s.cashierName || "Unknown").filter(Boolean))).sort()
  , [sales]);

  // ── Filtered sales ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => sales.filter(s => {
    const d = new Date(s.date);
    if (d < fromDate || d > toDate) return false;
    if (statusF !== "All" && s.status !== statusF) return false;
    if (methodF !== "All") {
      if (s.splitPayments) {
        if (!(s.splitPayments[methodF] > 0)) return false;
      } else if (s.paymentMethod !== methodF) {
        return false;
      }
    }
    if (staffF  !== "All" && (s.cashierName || "Unknown") !== staffF) return false;
    const q = searchQ.toLowerCase();
    if (q && !s.receiptNumber.toLowerCase().includes(q) &&
             !s.customerName.toLowerCase().includes(q) &&
             !(s.cashierName||"").toLowerCase().includes(q)) return false;
    return true;
  }), [sales, fromDate, toDate, statusF, methodF, staffF, searchQ]);

  // ── Payment method totals (for filtered) ───────────────────────────────────
  const paymentTotals = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.filter(s => s.status === "Completed").forEach(s => {
      if (s.splitPayments) {
        Object.entries(s.splitPayments).forEach(([m, v]) => {
          map[m] = (map[m] || 0) + v;
        });
      } else {
        map[s.paymentMethod] = (map[s.paymentMethod] || 0) + s.total;
      }
    });
    return map;
  }, [filtered]);

  // ── Grand stats ────────────────────────────────────────────────────────────
  const grandTotal     = Object.values(paymentTotals).reduce((a,v) => a+v, 0);
  const completedCount = filtered.filter(s => s.status === "Completed").length;
  const uniqueCusts    = new Set(filtered.filter(s=>s.status==="Completed").map(s=>s.customerName)).size;

  // ── Staff-grouped view ─────────────────────────────────────────────────────
  const staffGroups = useMemo(() => {
    const map: Record<string, any[]> = {};
    filtered.forEach(s => {
      const name = s.cashierName || "Unknown";
      if (!map[name]) map[name] = [];
      map[name].push(s);
    });
    return Object.entries(map).sort(([a],[b]) => a.localeCompare(b));
  }, [filtered]);

  // ── Export Excel ───────────────────────────────────────────────────────────
  const handleExport = () => {
    const rows = filtered.map(s => ({
      "Receipt #":   s.receiptNumber,
      "Date":        fmtDateTime(s.date),
      "Staff":       s.cashierName || "",
      "Customer":    s.customerName,
      "Items":       s.items.map((i:any) => `${i.productName} x${i.qty}`).join(", "),
      "Subtotal":    s.subtotal,
      "Discount":    s.discount,
      "Tax":         s.tax,
      "Total":       s.total,
      "Payment":     s.paymentMethod,
      "Status":      s.status,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales");
    XLSX.writeFile(wb, `Sales_${staffF !== "All" ? staffF+"_" : ""}${period}_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // ── Print staff report ─────────────────────────────────────────────────────
  const handlePrintStaffReport = (staffName: string, staffSales: any[]) => {
    const label = periodLabel(period, customFrom, customTo);
    const html = buildStaffReportHTML(staffName, staffSales, currencySymbol, label, currentBranch);
    const win = window.open("", "_blank", "width=400,height=700");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  // ── Print full summary ─────────────────────────────────────────────────────
  const handlePrintSummary = () => {
    const label = periodLabel(period, customFrom, customTo);
    const staffFor = staffF !== "All" ? staffF : "All Staff";
    const methodRows = ALL_PAYMENT_METHODS
      .filter(m => paymentTotals[m.key])
      .map(m => `<tr><td>${m.label}</td><td style="text-align:right;font-weight:700">${currencySymbol} ${(paymentTotals[m.key]||0).toFixed(2)}</td></tr>`)
      .join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>Sales Summary Report</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Courier New',monospace; font-size:10px; color:#000; background:#fff; width:80mm; padding:8px 10px 16px; }
  table { width:100%; border-collapse:collapse; }
  .center { text-align:center; } .bold { font-weight:700; }
  .divider { border-top:1px solid #000; margin:5px 0; }
</style></head><body>
  <div class="center" style="margin-bottom:8px">
    <div style="font-size:13px;font-weight:900;font-family:Arial,sans-serif">MT UNIPOS</div>
    <div style="font-size:8px;text-transform:uppercase;letter-spacing:2px;color:#555">Sales Summary Report</div>
    <div style="font-size:9px">${currentBranch}</div>
  </div>
  <div class="divider"></div>
  <div style="margin-bottom:6px;line-height:1.6">
    <div><b>Period:</b> ${label}</div>
    <div><b>Staff:</b> ${staffFor}</div>
    <div><b>Printed:</b> ${new Date().toLocaleString()}</div>
    <div><b>Total Transactions:</b> ${filtered.length}</div>
    <div><b>Completed:</b> ${completedCount}</div>
  </div>
  <div class="divider"></div>
  <div style="font-weight:700;margin-bottom:4px">PAYMENT BREAKDOWN</div>
  <table style="margin-bottom:6px">${methodRows}
    <tr style="border-top:1px solid #000">
      <td style="padding-top:4px;font-weight:900">GRAND TOTAL</td>
      <td style="text-align:right;font-weight:900;font-size:12px;padding-top:4px">${currencySymbol} ${grandTotal.toFixed(2)}</td>
    </tr>
  </table>
  <div class="divider"></div>
  <div class="center" style="font-size:8px;margin-top:6px">Powered by MT UniPOS SaaS ERP</div>
</body></html>`;

    const win = window.open("", "_blank", "width=400,height=700");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  const pLabel = periodLabel(period, customFrom, customTo);

  return (
    <div className="flex min-h-screen bg-black text-gray-100 font-sans">
      <ClientSidebar />

      {slipSale && (
        <ThermalSlipModal
          sale={slipSale}
          currencySymbol={currencySymbol}
          branch={currentBranch}
          businessSettings={businessSettings}
          onClose={() => setSlipSale(null)}
        />
      )}

      <main className="flex-grow p-5 space-y-5 overflow-y-auto max-h-screen">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between border-b border-brand-dark-border/60 pb-4">
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <Receipt size={20} className="text-brand-sky" />
              Sales History
            </h1>
            <p className="text-[10px] text-gray-500 mt-0.5">
              {pLabel} · {filtered.length} transactions · filter by staff, payment or date
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrintSummary}
              className="flex items-center gap-1.5 bg-brand-sky/15 border border-brand-sky/30 hover:bg-brand-sky/25 text-brand-sky font-bold text-xs px-3.5 py-2 rounded-xl transition">
              <Printer size={13} /> Print Summary
            </button>
            <button onClick={handleExport}
              className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-400 font-bold text-xs px-3.5 py-2 rounded-xl transition">
              <FileDown size={13} /> Export Excel
            </button>
          </div>
        </div>

        {/* ── VIEW MODE TOGGLE ── */}
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase transition ${viewMode==="table" ? "bg-brand-sky text-black shadow-brand-sky/20 shadow-lg" : "bg-brand-dark-surface border border-brand-dark-border text-gray-400 hover:text-white"}`}>
            <Receipt size={11} /> Sale Table
          </button>
          <button onClick={() => setViewMode("staff")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase transition ${viewMode==="staff" ? "bg-purple-500 text-white shadow-purple-500/20 shadow-lg" : "bg-brand-dark-surface border border-brand-dark-border text-gray-400 hover:text-white"}`}>
            <User size={11} /> By Staff
          </button>
        </div>

        {/* ── PERIOD TABS ── */}
        <div className="flex flex-wrap gap-2 items-center">
          {([["today","Today"],["week","This Week"],["month","This Month"],["custom","Custom"]] as const).map(([val, label]) => (
            <button key={val} onClick={() => setPeriod(val)}
              className={`px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase transition ${
                period === val
                  ? "bg-brand-sky text-black"
                  : "bg-brand-dark-surface border border-brand-dark-border text-gray-400 hover:text-white hover:border-brand-sky/40"
              }`}>{label}
            </button>
          ))}

          {period === "custom" && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-brand-dark-surface border border-brand-dark-border rounded-xl px-2.5 py-1.5">
                <Calendar size={11} className="text-gray-500" />
                <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                  className="bg-transparent text-[10px] text-white focus:outline-none" />
              </div>
              <span className="text-gray-600 text-[10px]">to</span>
              <div className="flex items-center gap-1.5 bg-brand-dark-surface border border-brand-dark-border rounded-xl px-2.5 py-1.5">
                <Calendar size={11} className="text-gray-500" />
                <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                  className="bg-transparent text-[10px] text-white focus:outline-none" />
              </div>
            </div>
          )}
        </div>

        {/* ── PAYMENT METHOD TOTALS PANEL ── */}
        <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1.5">
              <BarChart3 size={11} className="text-brand-sky" /> Payment Method Breakdown
            </h3>
            <span className="text-[10px] font-black font-mono text-brand-sky">
              Grand Total: {currencySymbol} {grandTotal.toLocaleString(undefined,{maximumFractionDigits:2})}
            </span>
          </div>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
            {ALL_PAYMENT_METHODS.map(m => {
              const val  = paymentTotals[m.key] || 0;
              const pct  = grandTotal > 0 ? (val/grandTotal*100) : 0;
              const Icon = m.icon;
              return (
                <div key={m.key} className={`rounded-xl border p-3 ${val > 0 ? m.bg : "bg-black/30 border-brand-dark-border/30"}`}>
                  <div className="flex items-center gap-1 mb-2">
                    <Icon size={10} className={val > 0 ? m.color : "text-gray-700"} />
                    <span className={`text-[8px] font-black uppercase tracking-wider ${val > 0 ? m.color : "text-gray-700"}`}>{m.label}</span>
                  </div>
                  <div className={`font-black font-mono text-[11px] ${val > 0 ? m.color : "text-gray-700"}`}>
                    {val > 0 ? `${currencySymbol} ${val.toLocaleString(undefined,{maximumFractionDigits:0})}` : "—"}
                  </div>
                  {val > 0 && (
                    <div className="mt-1.5">
                      <div className="w-full bg-black/40 rounded-full h-1">
                        <div className={`h-1 rounded-full ${val > 0 ? m.color.replace("text-","bg-") : ""}`} style={{width:`${pct}%`}} />
                      </div>
                      <div className="text-[7px] text-gray-500 mt-0.5 font-mono">{pct.toFixed(1)}%</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SUMMARY STATS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Transactions",  value: filtered.length.toString(),            icon: ShoppingCart, color: "text-brand-sky"   },
            { label: "Completed",     value: completedCount.toString(),              icon: Receipt,      color: "text-emerald-400" },
            { label: "Total Revenue", value: `${currencySymbol} ${grandTotal.toLocaleString(undefined,{maximumFractionDigits:0})}`, icon: TrendingUp,   color: "text-yellow-400"  },
            { label: "Customers",     value: uniqueCusts.toString(),                 icon: Users,        color: "text-purple-400"  },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl p-3.5 flex items-center gap-3">
                <Icon size={15} className={s.color} />
                <div>
                  <div className={`text-sm font-black font-mono ${s.color}`}>{s.value}</div>
                  <div className="text-[8px] text-gray-500 uppercase font-bold tracking-wider">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── SEARCH & FILTERS ── */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative max-w-xs flex-grow">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={12} />
            <input type="text" placeholder="Receipt #, customer, staff..."
              value={searchQ} onChange={e => setSearchQ(e.target.value)}
              className="w-full bg-brand-dark-surface border border-brand-dark-border pl-9 pr-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-brand-sky" />
          </div>

          {/* Staff filter */}
          <select value={staffF} onChange={e => setStaffF(e.target.value)}
            className="bg-brand-dark-surface border border-brand-dark-border text-gray-300 text-[10px] rounded-xl px-3 py-2 focus:outline-none focus:border-brand-sky font-bold">
            <option value="All">👤 All Staff</option>
            {allStaff.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Payment method filter */}
          <select value={methodF} onChange={e => setMethodF(e.target.value)}
            className="bg-brand-dark-surface border border-brand-dark-border text-gray-300 text-[10px] rounded-xl px-3 py-2 focus:outline-none focus:border-brand-sky">
            <option value="All">💳 All Methods</option>
            {ALL_PAYMENT_METHODS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>

          {/* Status filter */}
          <div className="flex items-center gap-1">
            {(["All","Completed","Returned","Refunded"] as StatusFilter[]).map(s => (
              <button key={s} onClick={() => setStatusF(s)}
                className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase transition ${
                  statusF === s ? "bg-brand-sky text-black" : "bg-brand-dark-surface border border-brand-dark-border text-gray-400 hover:text-white"
                }`}>{s}</button>
            ))}
          </div>

          <span className="text-[10px] text-gray-600 font-mono ml-auto">{filtered.length} results</span>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            STAFF VIEW
        ══════════════════════════════════════════════════════════════════ */}
        {viewMode === "staff" && (
          <div className="space-y-4">
            {staffGroups.length === 0 ? (
              <div className="text-center py-16 text-gray-600 text-xs">
                <div className="text-4xl mb-3">👤</div>
                <div className="font-bold">No staff sales found for this period.</div>
              </div>
            ) : staffGroups.map(([name, sales]) => (
              <StaffCard
                key={name}
                staffName={name}
                sales={sales}
                currencySymbol={currencySymbol}
                onViewSales={() => {}}
                onPrintReport={() => handlePrintStaffReport(name, sales)}
                onSlipView={setSlipSale}
              />
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TABLE VIEW
        ══════════════════════════════════════════════════════════════════ */}
        {viewMode === "table" && (
          <div className="bg-brand-dark-surface/30 border border-brand-dark-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-brand-dark-border text-[9px] text-gray-500 uppercase font-bold tracking-wider">
                    <th className="px-4 py-3">Receipt #</th>
                    <th className="px-4 py-3">Date &amp; Time</th>
                    <th className="px-4 py-3">Staff</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Slip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-dark-border/20">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-16 text-center">
                        <div className="text-3xl mb-3">🧾</div>
                        <div className="text-gray-500 text-xs font-bold">No sales found.</div>
                        <div className="text-gray-600 text-[10px] mt-1">Try adjusting the date range, staff or payment filters.</div>
                      </td>
                    </tr>
                  ) : filtered.map(sale => (
                    <tr key={sale.id} className="hover:bg-brand-dark-surface/60 transition group">
                      <td className="px-4 py-3 font-black font-mono text-purple-400 text-[11px] whitespace-nowrap">{sale.receiptNumber}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-[10px] text-white font-mono">{fmtDate(sale.date)}</div>
                        <div className="text-[8px] text-gray-500">{new Date(sale.date).toLocaleTimeString("en-PK",{hour:"2-digit",minute:"2-digit"})}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-brand-sky/20 border border-brand-sky/30 flex items-center justify-center shrink-0">
                            <User size={9} className="text-brand-sky" />
                          </div>
                          <span className="text-[10px] font-bold text-gray-300">{sale.cashierName || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-white text-[11px]">{sale.customerName}</div>
                      </td>
                      <td className="px-4 py-3 max-w-[160px]">
                        <div className="text-[10px] text-gray-300 truncate">
                          {sale.items.slice(0,2).map((i:any) => i.productName).join(", ")}
                          {sale.items.length > 2 && <span className="text-gray-500"> +{sale.items.length-2} more</span>}
                        </div>
                        <div className="text-[8px] text-gray-600">{sale.items.length} item{sale.items.length!==1?"s":""}</div>
                      </td>
                      <td className="px-4 py-3 font-black font-mono text-brand-sky text-[11px] whitespace-nowrap">
                        {currencySymbol} {sale.total.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${METHOD_COLORS[sale.paymentMethod] || "text-gray-400 bg-brand-dark-border/50 border-brand-dark-border"}`}>
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${STATUS_COLORS[sale.status] || "text-gray-400 bg-brand-dark-border/50 border-brand-dark-border"}`}>
                          {sale.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => setSlipSale(sale)}
                          className="flex items-center gap-1 mx-auto px-3 py-1.5 bg-brand-dark-border hover:bg-brand-sky/20 hover:border-brand-sky/40 border border-transparent text-gray-400 hover:text-brand-sky font-bold text-[9px] rounded-lg transition">
                          <Eye size={10} /> View Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length > 0 && (
              <div className="px-4 py-3 border-t border-brand-dark-border flex items-center justify-between bg-black/30">
                <span className="text-[10px] text-gray-500 font-mono">{filtered.length} transactions</span>
                <span className="text-[10px] font-mono text-gray-500">
                  Total: <span className="text-brand-sky font-black">{currencySymbol} {grandTotal.toLocaleString(undefined,{maximumFractionDigits:2})}</span>
                </span>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
