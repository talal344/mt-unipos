"use client";

import React, { useMemo } from "react";
import { useGlobalContext } from "@/context/global-context";
import ClientSidebar from "@/components/client-sidebar";
import {
  Brain, TrendingUp, TrendingDown, AlertTriangle, Users, Star, BarChart3,
  Target, Zap, Award, ShoppingBag, ArrowUp, Package, CreditCard,
  RefreshCw, ChevronRight
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const TIER_CFG = [
  { label: "Bronze",   minPts: 0,    color: "text-amber-600",  bg: "bg-amber-600/10 border-amber-600/20" },
  { label: "Silver",   minPts: 500,  color: "text-gray-300",   bg: "bg-gray-300/10 border-gray-300/20"  },
  { label: "Gold",     minPts: 2000, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
  { label: "Platinum", minPts: 5000, color: "text-brand-sky",  bg: "bg-brand-sky/10 border-brand-sky/20"  },
];
const getTier = (pts: number) => [...TIER_CFG].reverse().find(t => pts >= t.minPts) || TIER_CFG[0];

// ─── SVG Bar Chart ────────────────────────────────────────────────────────────
function SvgBarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const W = 480, H = 150, BAR_W = Math.floor(W / data.length) - 8, PAD = 28;
  return (
    <svg viewBox={`0 0 ${W} ${H + PAD}`} className="w-full h-auto">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const barH = (d.value / max) * H;
        const x = i * (W / data.length) + (W / data.length - BAR_W) / 2;
        const y = H - barH;
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={BAR_W} height={barH} rx={4} fill="url(#barGrad)" />
            {d.value > 0 && (
              <text x={x + BAR_W / 2} y={y - 4} textAnchor="middle" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold">
                {d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}k` : d.value.toFixed(0)}
              </text>
            )}
            <text x={x + BAR_W / 2} y={H + PAD - 6} textAnchor="middle" fill="#6b7280" fontSize="9" fontFamily="sans-serif">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AiPage() {
  const { products, customers, sales, currencySymbol } = useGlobalContext();

  // ── Day-of-week revenue breakdown ──────────────────────────────────────────
  const salesByDay = useMemo(() => {
    const totals = Array(7).fill(0);
    sales.forEach(s => {
      const d = new Date(s.date).getDay();
      totals[d] += s.total;
    });
    return DAY_NAMES.map((name, i) => ({ label: name.slice(0, 3), value: totals[i] }));
  }, [sales]);

  const bestDayIdx = salesByDay.reduce((best, d, i) => d.value > salesByDay[best].value ? i : best, 0);

  // ── Top 10 products by units sold ──────────────────────────────────────────
  const productSales = useMemo(() => {
    const map: Record<string, { name: string; units: number; revenue: number; productId: string }> = {};
    sales.forEach(s => {
      s.items.forEach(item => {
        if (!map[item.productId]) map[item.productId] = { name: item.productName, units: 0, revenue: 0, productId: item.productId };
        map[item.productId].units += item.qty;
        map[item.productId].revenue += item.subtotal;
      });
    });
    return Object.values(map).sort((a, b) => b.units - a.units).slice(0, 10);
  }, [sales]);

  // ── Slow movers (high stock, low sales) ────────────────────────────────────
  const slowMovers = useMemo(() => {
    const sold: Record<string, number> = {};
    sales.forEach(s => s.items.forEach(item => { sold[item.productId] = (sold[item.productId] || 0) + item.qty; }));
    return products
      .filter(p => p.stock > 5)
      .map(p => ({ ...p, unitsSold: sold[p.id] || 0 }))
      .sort((a, b) => a.unitsSold - b.unitsSold)
      .slice(0, 5);
  }, [products, sales]);

  // ── Customer CLV ───────────────────────────────────────────────────────────
  const customerCLV = useMemo(() => {
    const map: Record<string, { name: string; mobile: string; spent: number; visits: number; loyaltyPoints: number }> = {};
    customers.forEach(c => { map[c.id] = { name: c.name, mobile: c.mobile, spent: 0, visits: 0, loyaltyPoints: c.loyaltyPoints }; });
    sales.forEach(s => {
      const match = customers.find(c => c.name === s.customerName);
      if (match && map[match.id]) { map[match.id].spent += s.total; map[match.id].visits += 1; }
    });
    return Object.values(map).sort((a, b) => b.spent - a.spent).slice(0, 8);
  }, [customers, sales]);

  // ── Reorder recommendations ────────────────────────────────────────────────
  const reorderList = useMemo(() =>
    products.filter(p => p.stock <= p.minStock && p.minStock > 0)
      .sort((a, b) => (a.stock / Math.max(a.minStock, 1)) - (b.stock / Math.max(b.minStock, 1)))
  , [products]);

  // ── Revenue forecast ───────────────────────────────────────────────────────
  const forecast = useMemo(() => {
    const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSales = sales.filter(s => new Date(s.date) >= sevenDaysAgo);
    const totalRecent = recentSales.reduce((a, s) => a + s.total, 0);
    const avgDaily = totalRecent / 7;
    return { avgDaily, next7: avgDaily * 7, next30: avgDaily * 30 };
  }, [sales]);

  // ── Summary stats ──────────────────────────────────────────────────────────
  const totalRevenue = sales.reduce((a, s) => a + s.total, 0);

  const RANK_COLORS = ["text-yellow-400","text-gray-300","text-amber-600"];

  return (
    <div className="flex min-h-screen bg-black text-gray-100 font-sans">
      <ClientSidebar />

      <main className="flex-grow p-5 space-y-5 overflow-y-auto max-h-screen">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-dark-border/60 pb-4">
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <Brain className="text-brand-sky animate-pulse" size={22} />
              AI Analytics Engine
            </h1>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Real-time intelligence from your store data · {sales.length} transactions analysed
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-black uppercase bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
            <RefreshCw size={9} /> Live Data
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: "Total Revenue",
              value: `${currencySymbol} ${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
              icon: TrendingUp, color: "text-brand-sky", bg: "bg-brand-sky/10 border-brand-sky/20",
              sub: `from ${sales.length} sales`,
            },
            {
              label: "Best Day of Week",
              value: DAY_NAMES[bestDayIdx],
              icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20",
              sub: `${currencySymbol} ${salesByDay[bestDayIdx].value.toLocaleString(undefined, {maximumFractionDigits:0})} revenue`,
            },
            {
              label: "Reorder Alerts",
              value: reorderList.length.toString(),
              icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20",
              sub: reorderList.length > 0 ? "Products below min stock" : "All stock healthy",
            },
            {
              label: "7-Day Avg Daily",
              value: `${currencySymbol} ${forecast.avgDaily.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
              icon: Target, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20",
              sub: "revenue per day",
            },
          ].map(card => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-brand-dark-surface/50 border border-brand-dark-border hover:border-brand-sky/30 transition rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg border ${card.bg} flex items-center justify-center`}>
                    <Icon size={14} className={card.color} />
                  </div>
                </div>
                <div className={`text-base font-black font-mono ${card.color}`}>{card.value}</div>
                <div className="text-[9px] text-gray-500 uppercase tracking-wider font-bold mt-0.5">{card.label}</div>
                <div className="text-[9px] text-gray-600 mt-1">{card.sub}</div>
              </div>
            );
          })}
        </div>

        {/* ── REVENUE FORECAST ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl p-4 space-y-3">
            <h3 className="text-[10px] uppercase font-black text-white tracking-widest flex items-center gap-1.5">
              <TrendingUp size={11} className="text-brand-sky" /> Revenue Forecast
            </h3>
            <div className="space-y-2">
              {[
                { period: "Next 7 Days", amount: forecast.next7, color: "text-brand-sky" },
                { period: "Next 30 Days", amount: forecast.next30, color: "text-purple-400" },
              ].map(f => (
                <div key={f.period} className="bg-black/60 border border-brand-dark-border rounded-lg p-3">
                  <div className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">{f.period}</div>
                  <div className={`text-base font-black font-mono ${f.color}`}>
                    {currencySymbol} {f.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-emerald-400 mt-1">
                    <ArrowUp size={9} /> Based on 7-day trend
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Day of Week Chart */}
          <div className="lg:col-span-2 bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl p-4">
            <h3 className="text-[10px] uppercase font-black text-white tracking-widest mb-4 flex items-center gap-1.5">
              <BarChart3 size={11} className="text-brand-sky" /> Revenue by Day of Week
            </h3>
            {sales.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-600 text-[10px]">
                No sales data yet. Make some sales to see analytics!
              </div>
            ) : (
              <SvgBarChart data={salesByDay} />
            )}
          </div>
        </div>

        {/* ── TOP PRODUCTS + SLOW MOVERS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Top 10 Products */}
          <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-brand-dark-border flex items-center gap-2">
              <Award size={13} className="text-yellow-400" />
              <h3 className="text-[10px] uppercase font-black text-white tracking-widest">Top Products by Units Sold</h3>
            </div>
            {productSales.length === 0 ? (
              <div className="p-6 text-center text-gray-600 text-[10px]">No product sales recorded yet.</div>
            ) : (
              <div className="divide-y divide-brand-dark-border/30">
                {productSales.map((p, i) => (
                  <div key={p.productId} className="flex items-center gap-3 px-4 py-2.5 hover:bg-brand-dark-border/20 transition">
                    <span className={`text-sm font-black w-5 text-right shrink-0 ${i < 3 ? RANK_COLORS[i] : "text-gray-600"}`}>
                      {i + 1}
                    </span>
                    <div className="flex-grow min-w-0">
                      <div className="text-[11px] font-bold text-white truncate">{p.name}</div>
                      <div className="text-[9px] text-gray-500 font-mono">{currencySymbol} {p.revenue.toLocaleString(undefined,{maximumFractionDigits:0})} revenue</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-[11px] font-black text-brand-sky font-mono">{p.units}</div>
                      <div className="text-[9px] text-gray-600">units</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Slow Movers */}
          <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-brand-dark-border flex items-center gap-2">
              <TrendingDown size={13} className="text-amber-400" />
              <h3 className="text-[10px] uppercase font-black text-white tracking-widest">Slow Movers — High Stock Low Sales</h3>
            </div>
            {slowMovers.length === 0 ? (
              <div className="p-6 text-center text-gray-600 text-[10px]">No slow moving products detected.</div>
            ) : (
              <div className="divide-y divide-brand-dark-border/30">
                {slowMovers.map(p => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-brand-dark-border/20 transition">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <Package size={12} className="text-amber-400" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="text-[11px] font-bold text-white truncate">{p.name}</div>
                      <div className="text-[9px] text-gray-500 font-mono">{p.sku}</div>
                    </div>
                    <div className="shrink-0 text-right space-y-0.5">
                      <div className="text-[10px] font-black text-amber-400 font-mono">{p.stock} in stock</div>
                      <div className="text-[9px] text-gray-600 font-mono">{(p as any).unitsSold} sold</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── CUSTOMER CLV TABLE ── */}
        <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-brand-dark-border flex items-center gap-2">
            <Users size={13} className="text-purple-400" />
            <h3 className="text-[10px] uppercase font-black text-white tracking-widest">Customer Lifetime Value — Top Spenders</h3>
          </div>
          {customerCLV.length === 0 ? (
            <div className="p-6 text-center text-gray-600 text-[10px]">No customer data yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-brand-dark-border text-[9px] text-gray-500 uppercase font-bold tracking-wider">
                    <th className="text-left px-4 py-2.5">Customer</th>
                    <th className="text-right px-4 py-2.5">Total Spent</th>
                    <th className="text-right px-4 py-2.5">Visits</th>
                    <th className="text-right px-4 py-2.5">Loyalty Pts</th>
                    <th className="text-center px-4 py-2.5">Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-dark-border/20">
                  {customerCLV.map((c, i) => {
                    const tier = getTier(c.loyaltyPoints);
                    return (
                      <tr key={i} className="hover:bg-brand-dark-border/20 transition">
                        <td className="px-4 py-2.5">
                          <div className="font-bold text-white text-[11px]">{c.name}</div>
                          <div className="text-[9px] text-gray-500 font-mono">{c.mobile}</div>
                        </td>
                        <td className="px-4 py-2.5 text-right font-black font-mono text-brand-sky text-[11px]">
                          {currencySymbol} {c.spent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold font-mono text-gray-300 text-[11px]">{c.visits}</td>
                        <td className="px-4 py-2.5 text-right font-bold font-mono text-yellow-400 text-[11px]">{c.loyaltyPoints.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${tier.bg} ${tier.color}`}>
                            {tier.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── REORDER RECOMMENDATIONS ── */}
        <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-brand-dark-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={13} className="text-red-400" />
              <h3 className="text-[10px] uppercase font-black text-white tracking-widest">Reorder Recommendations</h3>
              {reorderList.length > 0 && (
                <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">{reorderList.length}</span>
              )}
            </div>
            <a href="/inventory" className="text-[9px] text-brand-sky font-black hover:underline flex items-center gap-1">
              Go to Inventory <ChevronRight size={9} />
            </a>
          </div>
          {reorderList.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-2xl mb-2">✅</div>
              <div className="text-[10px] text-gray-500 font-bold">All stock levels healthy!</div>
              <div className="text-[9px] text-gray-600 mt-0.5">No products are below minimum stock threshold.</div>
            </div>
          ) : (
            <div className="divide-y divide-brand-dark-border/20">
              {reorderList.map(p => {
                const pct = Math.min(100, Math.round((p.stock / Math.max(p.minStock, 1)) * 100));
                const danger = pct === 0 ? "bg-red-500" : pct < 50 ? "bg-amber-500" : "bg-yellow-400";
                return (
                  <div key={p.id} className="px-4 py-3 flex items-center gap-4 hover:bg-brand-dark-border/20 transition">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                      <ShoppingBag size={12} className="text-red-400" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="text-[11px] font-bold text-white truncate">{p.name}</div>
                      <div className="text-[9px] text-gray-500 font-mono">{p.sku}</div>
                      <div className="mt-1.5 w-full bg-brand-dark-border rounded-full h-1.5">
                        <div className={`${danger} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="text-[8px] text-gray-600 mt-0.5">{p.stock} / {p.minStock} min</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-[10px] font-black text-red-400 font-mono">{p.stock} left</div>
                      <div className="text-[8px] text-gray-600">min: {p.minStock}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
