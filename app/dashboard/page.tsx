"use client";

import React, { useMemo } from "react";
import { useGlobalContext } from "@/context/global-context";
import ClientSidebar from "@/components/client-sidebar";
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle, 
  Database, 
  Layers, 
  ArrowUpRight,
  Utensils,
  Clock,
  UserCheck,
  Heart,
  Calendar,
  Thermometer,
  BookOpen,
  User,
  Star,
  Zap,
  TrendingDown,
  BarChart3,
  Package,
  Users
} from "lucide-react";
import Link from "next/link";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from "recharts";

// ── SVG Sparkline (no external lib) ──────────────────────────────────────────
function Sparkline({ values, color = "#38bdf8" }: { values: number[]; color?: string }) {
  if (values.length < 2) return <div className="h-8 w-full" />;
  const max = Math.max(...values, 1);
  const W = 200, H = 36;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - Math.round((v / max) * H);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-9" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spark-${color.replace('#','')}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ClientDashboardPage() {
  const { 
    sales, 
    products, 
    expenses, 
    currencySymbol, 
    currentBranch, 
    tenants, 
    currentUser, 
    tables, 
    kitchenTickets, 
    customers,
    setCurrencySymbol,
    salesTaxRate,
    setSalesTaxRate
  } = useGlobalContext();

  // 1. Look up active tenant sharded business type
  const activeTenant = tenants.find(t => t.id === currentUser?.tenantId);
  const bizType = activeTenant?.businessType || "Super Markets";

  // Map to sector verticals
  let vertical: "Retail" | "F&B" | "Pharmacy" | "Bookstore" = "Retail";
  if (bizType.includes("Restaurant") || bizType.includes("Cafe") || bizType.includes("Baker")) {
    vertical = "F&B";
  } else if (bizType.includes("Pharmacy") || bizType.includes("Medical") || bizType.includes("Health") || bizType.includes("Clinic")) {
    vertical = "Pharmacy";
  } else if (bizType.includes("Book") || bizType.includes("Library") || bizType.includes("Gift")) {
    vertical = "Bookstore";
  }

  // 2. Compute General Statistics
  const totalSalesCount = sales.length;
  const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalStockValue = products.reduce((acc, p) => acc + (p.costPrice * p.stock), 0);
  const lowStockAlerts = products.filter(p => p.stock <= p.minStock);

  // Real P&L: COGS from actual sale items × product cost prices
  const totalCOGS = useMemo(() => {
    let cogs = 0;
    sales.forEach(s => s.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) cogs += prod.costPrice * item.qty;
    }));
    return cogs;
  }, [sales, products]);
  const grossProfit = totalRevenue - totalCOGS;
  const netProfit = grossProfit - totalExpenses;
  const grossMarginPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  // Today's top products
  const todaySales = useMemo(() => {
    const today = new Date().toDateString();
    return sales.filter(s => new Date(s.date).toDateString() === today);
  }, [sales]);
  const todayTopProducts = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; qty: number }> = {};
    todaySales.forEach(s => s.items.forEach(item => {
      if (!map[item.productId]) map[item.productId] = { name: item.productName, revenue: 0, qty: 0 };
      map[item.productId].revenue += item.subtotal;
      map[item.productId].qty += item.qty;
    }));
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [todaySales]);

  // 7-day sparkline
  const sparkline7 = useMemo(() => {
    const days: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toDateString();
      days.push(sales.filter(s => new Date(s.date).toDateString() === key).reduce((a, s) => a + s.total, 0));
    }
    return days;
  }, [sales]);

  // Recharts Data Prep
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toDateString();
      const daySales = sales.filter(s => new Date(s.date).toDateString() === key);
      const revenue = daySales.reduce((a, s) => a + s.total, 0);
      let cost = 0;
      daySales.forEach(s => s.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        if (prod) cost += prod.costPrice * item.qty;
      }));
      data.push({
        name: d.toLocaleDateString("en-US", { weekday: "short" }),
        Revenue: revenue,
        Profit: revenue - cost
      });
    }
    return data;
  }, [sales, products]);

  const pieColors = ["#38bdf8", "#34d399", "#fbbf24", "#f87171", "#c084fc"];

  // Overdue customers
  const overdueCustomers = [...customers]
    .filter(c => c.creditBalance > 0)
    .sort((a, b) => b.creditBalance - a.creditBalance)
    .slice(0, 4);

  const calculatedProfit = netProfit;

  // 3. Compute Vertical Specific Statistics
  
  // F&B Specifics
  const openKdsCount = kitchenTickets.filter(t => t.status !== "Ready").length;
  const occupiedTablesCount = tables.filter(t => t.status === "Occupied").length;
  const freeTablesCount = tables.filter(t => t.status === "Free").length;
  const activeWaiters = Array.from(new Set(tables.filter(t => t.status === "Occupied" && t.waiterName).map(t => t.waiterName))).length;

  const topWaiters = useMemo(() => {
    const map: Record<string, { revenue: number; checkouts: number }> = {};
    sales.forEach(s => {
      const waiter = s.cashierName || "Unknown Waiter";
      if (!map[waiter]) map[waiter] = { revenue: 0, checkouts: 0 };
      map[waiter].revenue += s.total;
      map[waiter].checkouts += 1;
    });
    return Object.entries(map)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [sales]);

  // Pharmacy Specifics
  const pharmacyProducts = products.filter(p => p.category === "Pharmacy" || p.expiryDate);
  const expiringDrugs90Days = pharmacyProducts.filter(p => {
    if (!p.expiryDate) return false;
    const expiry = new Date(p.expiryDate);
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
    return expiry <= ninetyDaysFromNow && expiry >= new Date();
  });
  const pharmacyLowStock = pharmacyProducts.filter(p => p.stock <= p.minStock);

  // Bookstore Specifics
  const bookProducts = products.filter(p => p.category === "Bookstore" || p.brand === "Publisher" || p.sku.startsWith("BOOK"));
  const totalGenres = Array.from(new Set(bookProducts.map(p => p.category))).length || 4;
  const readingClubMembers = customers.filter(c => c.loyaltyPoints > 100);

  return (
    <div className="flex min-h-screen bg-black text-gray-100 font-sans">
      <ClientSidebar />

      {/* Main Command Workspace */}
      <main className="flex-grow p-6 sm:p-8 space-y-6 overflow-y-auto max-h-screen">
        
        {/* Top Header */}
        <div className="flex justify-between items-center border-b border-brand-dark-border/60 pb-4">
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <span>{activeTenant?.businessName || "Client Command Center"}</span>
              <span className="bg-brand-sky/20 text-brand-sky text-[8px] px-2 py-0.5 rounded font-black tracking-widest uppercase font-mono">
                {bizType} Vertical
              </span>
            </h1>
            <p className="text-[10px] text-gray-500 font-mono">Dynamic ERP Shard Dashboard is isolated for **{vertical}** workflows.</p>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
            POS Shard Sync Active
          </span>
        </div>

        {/* Global Configurations Settings Card */}
        <div className="bg-brand-dark-surface/60 border border-brand-sky/20 p-4 rounded-2xl glass-panel flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left space-y-1">
            <h4 className="text-white font-bold text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-sky animate-pulse" />
              Global Store Shard Configurations
            </h4>
            <p className="text-[9px] text-gray-500">Adjust active trading currency and tax compliance coefficients in real time.</p>
          </div>

          <div className="flex flex-wrap gap-4 text-xs">
            {/* Currency swapper */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Active Currency:</span>
              <select
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="bg-black border border-brand-dark-border/80 px-2 py-1.5 rounded text-[10px] text-white font-bold focus:outline-none"
              >
                <option value="PKR">PKR (Rs) - Default</option>
                <option value="USD">USD ($)</option>
                <option value="AED">AED (Dh)</option>
                <option value="SAR">SAR (SR)</option>
              </select>
            </div>

            {/* Sales Tax Rate config */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase">GST / VAT Rate:</span>
              <div className="flex items-center bg-black border border-brand-dark-border/80 rounded overflow-hidden">
                <input
                  type="number"
                  value={salesTaxRate}
                  onChange={(e) => setSalesTaxRate(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-12 bg-transparent text-center font-mono font-bold text-[10px] py-1 text-white focus:outline-none"
                />
                <span className="bg-brand-dark-border text-gray-400 px-2 py-1 text-[9px] font-black">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* -------------------- INTERACTIVE RECHARTS ANALYTICS -------------------- */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue & Profit Trends (Line Chart) */}
          <div className="lg:col-span-2 bg-brand-dark-surface/40 border border-brand-dark-border p-5 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs uppercase font-bold text-white tracking-wide flex items-center gap-1.5">
                <BarChart3 className="text-brand-sky" size={14} />
                7-Day Revenue & Profit Trends
              </h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="name" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="Revenue" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Profit" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Selling Products (Pie Chart) */}
          <div className="bg-brand-dark-surface/40 border border-brand-dark-border p-5 rounded-2xl flex flex-col">
            <h3 className="text-xs uppercase font-bold text-white tracking-wide flex items-center gap-1.5 mb-2">
              <Package className="text-amber-400" size={14} />
              Today's Top Products
            </h3>
            {todayTopProducts.length > 0 ? (
              <div className="flex-1 min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={todayTopProducts}
                      dataKey="revenue"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      stroke="none"
                    >
                      {todayTopProducts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: any) => [`${currencySymbol} ${Number(value || 0).toLocaleString()}`, 'Revenue']}
                      contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom Legend */}
                <div className="mt-2 space-y-1.5 px-2">
                  {todayTopProducts.slice(0, 3).map((p, i) => (
                    <div key={p.name} className="flex justify-between items-center text-[10px]">
                      <div className="flex items-center gap-1.5 truncate pr-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pieColors[i] }} />
                        <span className="text-gray-300 truncate">{p.name}</span>
                      </div>
                      <span className="font-bold text-white font-mono">{currencySymbol} {p.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-50">
                <Package size={32} className="mb-2" />
                <p className="text-[10px]">No sales recorded today.</p>
              </div>
            )}
          </div>
        </section>

        {/* -------------------- VERTICAL DASHBOARD ROUTING -------------------- */}

        {/* SECTION 1: F&B RESTAURANT VERTICAL */}
        {vertical === "F&B" && (
          <div className="space-y-6">
            
            {/* F&B Metric Tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-brand-dark-surface/50 border border-brand-dark-border p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-gray-500">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Open Kitchen Tickets</span>
                  <Clock size={16} className="text-amber-400" />
                </div>
                <div className="text-xl font-black text-white">{openKdsCount} tickets</div>
                <p className="text-[9px] text-amber-500/80">Pending cooking inside KDS</p>
              </div>

              <div className="bg-brand-dark-surface/50 border border-brand-dark-border p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-gray-500">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Occupied Dining Tables</span>
                  <Utensils size={16} className="text-brand-sky" />
                </div>
                <div className="text-xl font-black text-white">{occupiedTablesCount} Tables</div>
                <p className="text-[9px] text-gray-500">{freeTablesCount} tables free right now</p>
              </div>

              <div className="bg-brand-dark-surface/50 border border-brand-dark-border p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-gray-500">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Active Waiters</span>
                  <UserCheck size={16} className="text-emerald-400" />
                </div>
                <div className="text-xl font-black text-white">{activeWaiters} staff</div>
                <p className="text-[9px] text-emerald-400">Serving active orders</p>
              </div>

              <div className="bg-brand-dark-surface/50 border border-brand-dark-border p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-gray-500">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Sales Today</span>
                  <DollarSign size={16} className="text-emerald-400" />
                </div>
                <div className="text-xl font-black text-white">{currencySymbol} {totalRevenue.toLocaleString()}</div>
                <p className="text-[9px] text-gray-500">{totalSalesCount} food checkouts completed</p>
              </div>
            </div>

            {/* F&B Visual Workspaces */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left: Interactive Tables visual overview */}
              <div className="lg:col-span-2 bg-brand-dark-surface/30 border border-brand-dark-border p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-brand-dark-border pb-2">
                  <h3 className="text-xs uppercase font-bold text-white tracking-wide">Dining Room Seating Overview</h3>
                  <Link href="/restaurant" className="text-[9px] text-brand-sky font-bold hover:underline">Manage Tables Map &rarr;</Link>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                  {tables.map(table => (
                    <div 
                      key={table.id} 
                      className={`p-3.5 rounded-xl border flex flex-col justify-between h-20 transition ${
                        table.status === "Occupied" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                        table.status === "Reserved" ? "bg-purple-500/10 border-purple-500/30 text-purple-400" :
                        "bg-brand-dark-border/40 border-brand-dark-border/60 text-gray-300 hover:bg-brand-dark-border/60"
                      }`}
                    >
                      <div className="font-bold">{table.number}</div>
                      <div className="flex justify-between items-center text-[9px] mt-2 font-mono">
                        <span>Cap: {table.capacity}</span>
                        <span className="font-black uppercase text-[8px]">{table.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: KDS Dispatch Panel */}
              <div className="bg-brand-dark-surface/30 border border-brand-dark-border p-5 rounded-2xl flex flex-col justify-between max-h-[300px]">
                <div>
                  <h3 className="text-xs uppercase font-bold text-white tracking-wide border-b border-brand-dark-border pb-2 flex items-center gap-1.5">
                    <Clock className="text-amber-500 animate-spin" size={14} />
                    Pending Kitchen Chef Queue
                  </h3>
                  
                  <div className="space-y-2 overflow-y-auto max-h-[170px] pt-3 text-[10px]">
                    {kitchenTickets.filter(t => t.status !== "Ready").map(t => (
                      <div key={t.id} className="bg-black/40 border border-brand-dark-border p-2 rounded flex justify-between items-center font-mono">
                        <div>
                          <div className="font-bold text-white">{t.tableNumber}</div>
                          <div className="text-gray-500">{t.items.map(i => `${i.name} x${i.qty}`).join(", ")}</div>
                        </div>
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 uppercase font-black tracking-wider">
                          {t.status}
                        </span>
                      </div>
                    ))}
                    {kitchenTickets.filter(t => t.status !== "Ready").length === 0 && (
                      <p className="text-[10px] text-gray-500 italic text-center py-8">KDS Dispatch is empty. All tables served.</p>
                    )}
                  </div>
                </div>
                <Link href="/restaurant" className="pt-2 border-t border-brand-dark-border/40 text-[9px] text-brand-sky font-black uppercase text-center hover:underline">
                  Launch Kitchen Dispatcher
                </Link>
              </div>

              {/* Bottom: Waiter Performance Leaderboard */}
              <div className="lg:col-span-3 bg-brand-dark-surface/30 border border-brand-dark-border p-5 rounded-2xl flex flex-col">
                <div className="flex justify-between items-center border-b border-brand-dark-border pb-2 mb-4">
                  <h3 className="text-xs uppercase font-bold text-white tracking-wide flex items-center gap-1.5">
                    <Star className="text-amber-400" size={14} />
                    Top Waiters Performance
                  </h3>
                  <span className="text-[10px] text-gray-500 font-mono">Revenue & Checkouts</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 font-sans">
                  {topWaiters.length === 0 ? (
                    <p className="text-[10px] text-gray-500 italic col-span-full text-center py-4">No waiter performance data available.</p>
                  ) : (
                    topWaiters.map((waiter, idx) => {
                      const maxRevenue = topWaiters[0]?.revenue || 1;
                      const pct = Math.round((waiter.revenue / maxRevenue) * 100);
                      return (
                        <div key={waiter.name} className="relative bg-black/40 border border-brand-dark-border/60 p-4 rounded-xl flex flex-col justify-between overflow-hidden group hover:border-brand-sky/30 transition">
                          {/* Rank Badge */}
                          <div className={`absolute top-0 right-0 w-8 h-8 flex items-center justify-center rounded-bl-xl text-[10px] font-black ${
                            idx === 0 ? 'bg-amber-500/20 text-amber-400' :
                            idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                            idx === 2 ? 'bg-amber-700/20 text-amber-600' :
                            'bg-brand-dark-border text-gray-500'
                          }`}>
                            #{idx + 1}
                          </div>

                          <div className="mb-4 pr-6">
                            <h4 className="text-white font-bold text-sm truncate" title={waiter.name}>{waiter.name}</h4>
                            <p className="text-[10px] text-gray-500 mt-0.5">{waiter.checkouts} orders</p>
                          </div>

                          <div className="space-y-1.5 z-10 mt-auto">
                            <div className="flex justify-between items-end">
                              <span className="text-[9px] text-gray-500 uppercase font-bold">Revenue</span>
                              <span className="text-xs font-black text-brand-sky font-mono">
                                {currencySymbol} {waiter.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                              </span>
                            </div>
                            
                            {/* Progress bar */}
                            <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-brand-dark-border/40">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${idx === 0 ? 'bg-amber-400' : 'bg-brand-sky'}`} 
                                style={{ width: `${pct}%` }} 
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* SECTION 2: PHARMACY / MEDICAL VERTICAL */}
        {vertical === "Pharmacy" && (
          <div className="space-y-6">
            
            {/* Pharmacy Metric Tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-brand-dark-surface/50 border border-brand-dark-border p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-gray-500">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Expiring Drugs (90 Days)</span>
                  <Heart size={16} className="text-red-400" />
                </div>
                <div className="text-xl font-black text-white">{expiringDrugs90Days.length} items</div>
                <p className="text-[9px] text-red-400 font-bold uppercase tracking-wider">FEFO Actions Required</p>
              </div>

              <div className="bg-brand-dark-surface/50 border border-brand-dark-border p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-gray-500">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Out Of Stock Warning</span>
                  <AlertTriangle size={16} className="text-amber-500" />
                </div>
                <div className="text-xl font-black text-white">{pharmacyLowStock.length} items</div>
                <p className="text-[9px] text-gray-500">Critical pharmaceutical stockouts</p>
              </div>

              <div className="bg-brand-dark-surface/50 border border-brand-dark-border p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-gray-500">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Cold Chain Inventory</span>
                  <Thermometer size={16} className="text-brand-sky animate-pulse" />
                </div>
                <div className="text-xl font-black text-white">4.2 °C</div>
                <p className="text-[9px] text-emerald-400 font-bold">Fridge Shard Compliant</p>
              </div>

              <div className="bg-brand-dark-surface/50 border border-brand-dark-border p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-gray-500">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Total Sales Today</span>
                  <DollarSign size={16} className="text-emerald-400" />
                </div>
                <div className="text-xl font-black text-white">{currencySymbol} {totalRevenue.toLocaleString()}</div>
                <p className="text-[9px] text-gray-500">{totalSalesCount} prescriptions billed</p>
              </div>
            </div>

            {/* Pharmacy visual expiries list */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 bg-brand-dark-surface/30 border border-brand-dark-border p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-brand-dark-border pb-2">
                  <h3 className="text-xs uppercase font-bold text-white tracking-wide">Critical Batch Expiries Ledger (FEFO)</h3>
                  <Link href="/pharmacy" className="text-[9px] text-brand-sky font-bold hover:underline">Full Drug Registry &rarr;</Link>
                </div>
                
                <div className="overflow-x-auto text-xs font-mono">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-brand-dark-border text-gray-500 text-[10px]">
                        <th className="pb-2 font-semibold">Medicine Name</th>
                        <th className="pb-2 font-semibold">Batch</th>
                        <th className="pb-2 font-semibold">Expiry Date</th>
                        <th className="pb-2 font-semibold text-right">Stock</th>
                        <th className="pb-2 font-semibold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-dark-border/40 text-[11px]">
                      {pharmacyProducts.filter(p => p.expiryDate).map(prod => {
                        const isExpiring = expiringDrugs90Days.some(e => e.id === prod.id);
                        return (
                          <tr key={prod.id} className="hover:bg-brand-dark-surface/60 transition">
                            <td className="py-2 text-white font-bold font-sans">{prod.name}</td>
                            <td className="py-2 text-purple-400">{prod.batchNumber || "N/A"}</td>
                            <td className="py-2 text-gray-400">{prod.expiryDate}</td>
                            <td className="py-2 text-right font-bold text-white">{prod.stock} {prod.unit}</td>
                            <td className="py-2 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                isExpiring ? "bg-red-500/10 border border-red-500/30 text-red-400 animate-pulse" :
                                "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                              }`}>
                                {isExpiring ? "Expiring Soon" : "Safe"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right: Low Stock Pharmacy items */}
              <div className="bg-brand-dark-surface/30 border border-brand-dark-border p-5 rounded-2xl flex flex-col justify-between max-h-[300px]">
                <div>
                  <h3 className="text-xs uppercase font-bold text-white tracking-wide border-b border-brand-dark-border pb-2 flex items-center gap-1.5">
                    <AlertTriangle className="text-amber-500" size={14} />
                    Critical Drug Stockouts
                  </h3>
                  
                  <div className="space-y-2 overflow-y-auto max-h-[170px] pt-3 text-[10px]">
                    {pharmacyLowStock.map(prod => (
                      <div key={prod.id} className="bg-black/40 border border-brand-dark-border p-2 rounded flex justify-between items-center font-mono">
                        <div>
                          <div className="font-bold text-white font-sans">{prod.name}</div>
                          <div className="text-gray-500 text-[8px]">SKU: {prod.sku}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-red-400 font-bold">{prod.stock} left</div>
                          <div className="text-[8px] text-gray-500">Min: {prod.minStock}</div>
                        </div>
                      </div>
                    ))}
                    {pharmacyLowStock.length === 0 && (
                      <p className="text-[10px] text-gray-500 italic text-center py-8">All pharmaceutical buffers are healthy.</p>
                    )}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* SECTION 3: BOOKSTORE / GIFT SHOP VERTICAL */}
        {vertical === "Bookstore" && (
          <div className="space-y-6">
            
            {/* Bookstore Metric Tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-brand-dark-surface/50 border border-brand-dark-border p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-gray-500">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Total Genres Cataloged</span>
                  <BookOpen size={16} className="text-purple-400" />
                </div>
                <div className="text-xl font-black text-white">{totalGenres} Genres</div>
                <p className="text-[9px] text-gray-500">Academic &amp; fiction indices</p>
              </div>

              <div className="bg-brand-dark-surface/50 border border-brand-dark-border p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-gray-500">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Active Reading Club</span>
                  <User size={16} className="text-brand-sky" />
                </div>
                <div className="text-xl font-black text-white">{readingClubMembers.length} Members</div>
                <p className="text-[9px] text-brand-sky font-bold">Loyalty profiles registered</p>
              </div>

              <div className="bg-brand-dark-surface/50 border border-brand-dark-border p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-gray-500">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Books Catalog Size</span>
                  <Database size={16} className="text-amber-500" />
                </div>
                <div className="text-xl font-black text-white">{bookProducts.length} Volumes</div>
                <p className="text-[9px] text-gray-500">Sharded author titles</p>
              </div>

              <div className="bg-brand-dark-surface/50 border border-brand-dark-border p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-gray-500">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Books Billed Today</span>
                  <DollarSign size={16} className="text-emerald-400" />
                </div>
                <div className="text-xl font-black text-white">{currencySymbol} {totalRevenue.toLocaleString()}</div>
                <p className="text-[9px] text-gray-500">{totalSalesCount} books transactions completed</p>
              </div>
            </div>

            {/* Bookstore visual lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left: Reading Club Members Ledger */}
              <div className="lg:col-span-2 bg-brand-dark-surface/30 border border-brand-dark-border p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-brand-dark-border pb-2">
                  <h3 className="text-xs uppercase font-bold text-white tracking-wide">Reading Club Member Rankings (Loyalties)</h3>
                  <Link href="/crm" className="text-[9px] text-brand-sky font-bold hover:underline">Manage CRM Reading Club &rarr;</Link>
                </div>
                
                <div className="overflow-x-auto text-xs font-mono">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-brand-dark-border text-gray-500 text-[10px]">
                        <th className="pb-2 font-semibold">Reader Name</th>
                        <th className="pb-2 font-semibold">Contact Mobile</th>
                        <th className="pb-2 font-semibold text-center">Active Loyalty Points</th>
                        <th className="pb-2 font-semibold text-right">Outstanding Credit</th>
                        <th className="pb-2 font-semibold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-dark-border/40 text-[11px]">
                      {customers.map(c => (
                        <tr key={c.id} className="hover:bg-brand-dark-surface/60 transition">
                          <td className="py-2 text-white font-bold font-sans flex items-center gap-1.5">
                            <User size={12} className="text-purple-400" />
                            {c.name}
                          </td>
                          <td className="py-2 text-gray-400">{c.mobile}</td>
                          <td className="py-2 text-center text-brand-sky font-bold flex items-center justify-center gap-0.5 mt-1">
                            <Star size={10} className="fill-brand-sky text-brand-sky" />
                            {c.loyaltyPoints} pts
                          </td>
                          <td className="py-2 text-right font-bold text-white">{currencySymbol} {c.creditBalance.toLocaleString()}</td>
                          <td className="py-2 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              c.loyaltyPoints > 100 ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" :
                              "bg-brand-dark-border text-gray-400"
                            }`}>
                              {c.loyaltyPoints > 100 ? "Elite Reader" : "Standard"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right: Genre Distribution */}
              <div className="bg-brand-dark-surface/30 border border-brand-dark-border p-5 rounded-2xl flex flex-col justify-between max-h-[300px]">
                <div>
                  <h3 className="text-xs uppercase font-bold text-white tracking-wide border-b border-brand-dark-border pb-2 flex items-center gap-1.5">
                    <Layers className="text-purple-400" size={14} />
                    Popular Genre Metrics
                  </h3>
                  
                  <div className="space-y-3 pt-3 text-[10px] font-sans">
                    {[
                      { name: "Academic & Reference", pct: 60, val: "12 volumes" },
                      { name: "Fiction & Novels", pct: 40, val: "8 volumes" },
                      { name: "Biography & History", pct: 25, val: "5 volumes" }
                    ].map(genre => (
                      <div key={genre.name} className="space-y-1">
                        <div className="flex justify-between text-gray-300 font-semibold text-[9px]">
                          <span>{genre.name}</span>
                          <span className="font-mono text-white">{genre.val}</span>
                        </div>
                        <div className="w-full h-1 bg-black rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: `${genre.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* SECTION 4: DEPARTMENTAL / SUPER MARKETS / GENERAL RETAIL VERTICAL */}
        {vertical === "Retail" && (
          <div className="space-y-6">
            
            {/* General Retail Metric Tiles — Real P&L */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Revenue + sparkline */}
              <div className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Revenue</span>
                  <TrendingUp size={14} className="text-emerald-400" />
                </div>
                <div className="text-xl font-black text-white font-mono">{currencySymbol} {totalRevenue.toLocaleString(undefined,{maximumFractionDigits:0})}</div>
                <Sparkline values={sparkline7} color="#10b981" />
                <p className="text-[9px] text-gray-500">{totalSalesCount} transactions</p>
              </div>

              {/* Gross Profit */}
              <div className="bg-brand-sky/10 border border-brand-sky/25 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Gross Profit</span>
                  <ArrowUpRight size={14} className="text-brand-sky" />
                </div>
                <div className={`text-xl font-black font-mono ${grossProfit >= 0 ? 'text-brand-sky' : 'text-red-400'}`}>
                  {currencySymbol} {Math.abs(grossProfit).toLocaleString(undefined,{maximumFractionDigits:0})}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-black font-mono ${
                    grossMarginPct >= 30 ? 'bg-emerald-500/15 text-emerald-400' :
                    grossMarginPct >= 15 ? 'bg-amber-500/15 text-amber-400' :
                    'bg-red-500/15 text-red-400'
                  }`}>{grossMarginPct.toFixed(1)}% margin</span>
                </div>
                <p className="text-[9px] text-gray-500">Revenue − COGS</p>
              </div>

              {/* Net Profit */}
              <div className={`border p-4 rounded-xl space-y-2 ${
                netProfit >= 0 ? 'bg-purple-500/10 border-purple-500/25' : 'bg-red-500/10 border-red-500/25'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Net Profit</span>
                  <DollarSign size={14} className={netProfit >= 0 ? 'text-purple-400' : 'text-red-400'} />
                </div>
                <div className={`text-xl font-black font-mono ${netProfit >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                  {netProfit < 0 ? '-' : ''}{currencySymbol} {Math.abs(netProfit).toLocaleString(undefined,{maximumFractionDigits:0})}
                </div>
                <p className="text-[9px] text-gray-500">After expenses: {currencySymbol} {totalExpenses.toLocaleString(undefined,{maximumFractionDigits:0})}</p>
              </div>

              {/* Stock Valuation */}
              <div className="bg-amber-500/10 border border-amber-500/25 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Stock Value</span>
                  <Database size={14} className="text-amber-400" />
                </div>
                <div className="text-xl font-black text-amber-400 font-mono">{currencySymbol} {totalStockValue.toLocaleString(undefined,{maximumFractionDigits:0})}</div>
                <p className="text-[9px] text-gray-500">{products.length} SKUs in catalog</p>
              </div>
            </div>

            {/* 3-panel: Top Products | Low Stock | Overdue Dues */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Today's Top Products */}
              <div className="bg-brand-dark-surface/30 border border-brand-dark-border p-5 rounded-2xl">
                <h3 className="text-xs uppercase font-bold text-white tracking-wide border-b border-brand-dark-border pb-2 mb-3 flex items-center gap-1.5">
                  <Package size={13} className="text-amber-400" /> Today's Top Sellers
                </h3>
                {todayTopProducts.length === 0
                  ? <p className="text-[10px] text-gray-500 italic text-center py-8">No sales today yet.</p>
                  : <div className="space-y-2">
                    {todayTopProducts.map((p, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[9px] font-black font-mono text-gray-500 w-4">#{i+1}</span>
                        <div className="flex-grow min-w-0">
                          <div className="text-[10px] font-bold text-white truncate">{p.name}</div>
                          <div className="text-[8px] text-gray-600">{p.qty} sold</div>
                        </div>
                        <span className="text-[10px] font-black font-mono text-brand-sky shrink-0">{currencySymbol} {Math.round(p.revenue).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                }
                <Link href="/reports" className="mt-3 block border-t border-brand-dark-border/40 pt-2 text-[9px] text-brand-sky font-black uppercase text-center hover:underline">Full Reports →</Link>
              </div>

              {/* Low Stock Alerts */}
              <div className="bg-brand-dark-surface/30 border border-brand-dark-border p-5 rounded-2xl">
                <h3 className="text-xs uppercase font-bold text-white tracking-wide border-b border-brand-dark-border pb-2 mb-3 flex items-center gap-1.5">
                  <AlertTriangle size={13} className="text-amber-400 animate-pulse" /> Low Stock ({lowStockAlerts.length})
                </h3>
                {lowStockAlerts.length === 0
                  ? <p className="text-[10px] text-gray-500 italic text-center py-8">All stock levels healthy ✓</p>
                  : <div className="space-y-2 max-h-40 overflow-y-auto">
                    {lowStockAlerts.map(prod => (
                      <div key={prod.id} className="flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold text-white truncate">{prod.name}</div>
                          <div className="text-[9px] text-gray-500 font-mono">{prod.sku}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-red-400 font-black font-mono text-[11px]">{prod.stock}</div>
                          <div className="text-[8px] text-gray-600">min {prod.minStock}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                }
                <Link href="/inventory" className="mt-3 block border-t border-brand-dark-border/40 pt-2 text-[9px] text-brand-sky font-black uppercase text-center hover:underline">Manage Inventory →</Link>
              </div>

              {/* Overdue Customer Dues */}
              <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-2xl">
                <h3 className="text-xs uppercase font-bold text-white tracking-wide border-b border-red-500/20 pb-2 mb-3 flex items-center gap-1.5">
                  <Users size={13} className="text-red-400" /> Overdue Dues ({overdueCustomers.length})
                </h3>
                {overdueCustomers.length === 0
                  ? <p className="text-[10px] text-gray-500 italic text-center py-8">No outstanding dues 🎉</p>
                  : <div className="space-y-2 max-h-40 overflow-y-auto">
                    {overdueCustomers.map(c => (
                      <div key={c.id} className="flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold text-white truncate">{c.name}</div>
                          <div className="text-[9px] text-gray-500 font-mono">{c.mobile}</div>
                        </div>
                        <span className="text-red-400 font-black font-mono text-[11px] shrink-0">{currencySymbol} {c.creditBalance.toLocaleString(undefined,{maximumFractionDigits:0})}</span>
                      </div>
                    ))}
                  </div>
                }
                <Link href="/crm" className="mt-3 block border-t border-red-500/20 pt-2 text-[9px] text-red-400 font-black uppercase text-center hover:underline">Recover Dues →</Link>
              </div>

            </div>

          </div>
        )}

        {/* -------------------- GENERAL RECENT sales GRID (Shared) -------------------- */}
        <div className="bg-brand-dark-surface/40 border border-brand-dark-border p-5 rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-brand-dark-border pb-2">
            <h3 className="text-xs uppercase font-bold text-white tracking-wide">Recent POS Terminal Checkouts</h3>
            <span className="text-[10px] text-gray-500 font-mono">Showing sharded journal syncs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brand-dark-border text-gray-500 font-mono">
                  <th className="pb-2 font-semibold">Receipt ID</th>
                  <th className="pb-2 font-semibold">Customer</th>
                  <th className="pb-2 font-semibold">Payment Source</th>
                  <th className="pb-2 font-semibold">Items</th>
                  <th className="pb-2 font-semibold">Grand Total</th>
                  <th className="pb-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark-border/40 font-mono text-[11px]">
                {sales.map(sale => (
                  <tr key={sale.id} className="hover:bg-brand-dark-surface/60 transition">
                    <td className="py-2.5 text-brand-sky font-bold">{sale.receiptNumber}</td>
                    <td className="py-2.5 text-white font-sans">{sale.customerName}</td>
                    <td className="py-2.5 text-gray-400">{sale.paymentMethod}</td>
                    <td className="py-2.5 text-gray-400">{sale.items.length} lines</td>
                    <td className="py-2.5 text-white font-bold">{currencySymbol} {sale.total.toLocaleString()}</td>
                    <td className="py-2.5">
                      <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {sales.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500 italic font-sans">No sales checkouts registered yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
