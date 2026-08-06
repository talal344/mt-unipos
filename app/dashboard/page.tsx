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
  Users,
  FileSpreadsheet,
  Printer,
  Download,
  Wallet,
  RotateCcw,
  X,
  CheckCircle2,
  Eye
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
    posShifts,
    closePOSShift,
    updateCustomerWalletBalance,
    addJournalEntry,
    setCurrencySymbol,
    salesTaxRate,
    setSalesTaxRate,
  } = useGlobalContext();

    const [activeReportModal, setActiveReportModal] = React.useState<"revenue" | "gross_profit" | "net_profit" | "stock_value" | "wallet" | null>(null);

  // CSV Export Helper
  const downloadCSVReport = (type: string) => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `MT_UniPOS_${type}_Report_${new Date().toISOString().split("T")[0]}.csv`;

    if (type === "revenue") {
      headers = ["Receipt ID", "Date", "Customer Name", "Payment Method", "Items Count", "Subtotal", "Tax", "Discount", "Grand Total", "Status"];
      rows = sales.map(s => [
        s.receiptNumber,
        new Date(s.date).toLocaleString(),
        s.customerName,
        s.paymentMethod,
        s.items.length,
        s.subtotal,
        s.tax,
        s.discount,
        s.status === "Returned" || s.status === "Refunded" ? -s.total : s.total,
        s.status
      ]);
    } else if (type === "gross_profit") {
      headers = ["Receipt ID", "Date", "Product Name", "Qty", "Sale Price", "Cost Price", "Revenue", "COGS Cost", "Gross Profit", "Status"];
      sales.forEach(s => {
        const isReturn = s.status === "Returned" || s.status === "Refunded";
        s.items.forEach(item => {
          const prod = products.find(p => p.id === item.productId);
          const cost = prod ? prod.costPrice : 0;
          const rev = isReturn ? -item.subtotal : item.subtotal;
          const cogsCost = isReturn ? -(cost * item.qty) : (cost * item.qty);
          const profit = rev - cogsCost;
          rows.push([
            s.receiptNumber,
            new Date(s.date).toLocaleDateString(),
            item.productName,
            item.qty,
            item.price,
            cost,
            rev,
            cogsCost,
            profit,
            s.status
          ]);
        });
      });
    } else if (type === "net_profit") {
      headers = ["Type", "Category / Description", "Date", "Payment Source", "Amount (PKR)"];
      rows = [
        ["Revenue", "Total Sales Revenue (Net of Returns)", new Date().toLocaleDateString(), "All Sources", totalRevenue],
        ["Cost", "Cost of Goods Sold (COGS)", new Date().toLocaleDateString(), "Inventory Cost", -totalCOGS],
        ["Profit", "Gross Profit", new Date().toLocaleDateString(), "Revenue - COGS", grossProfit],
        ...expenses.map(e => ["Expense", e.category, e.date, e.paymentMethod, -e.amount]),
        ["Net Profit", "Final Net Profit", new Date().toLocaleDateString(), "P&L Balance", netProfit]
      ];
    } else if (type === "stock_value") {
      headers = ["SKU", "Barcode", "Product Name", "Category", "Brand", "Cost Price", "Sale Price", "Stock Qty", "Total Stock Value (Cost)", "Status"];
      rows = products.map(p => [
        p.sku,
        p.barcode || "N/A",
        p.name,
        p.category,
        p.brand,
        p.costPrice,
        p.salePrice,
        p.stock,
        p.costPrice * p.stock,
        p.stock <= p.minStock ? "LOW STOCK" : "IN STOCK"
      ]);
    } else if (type === "wallet") {
      headers = ["Customer ID", "Customer Name", "Contact Mobile", "Email", "Store Wallet Credit (Liability PKR)"];
      rows = walletCustomers.map(c => [
        c.customerNo || c.id,
        c.name,
        c.mobile,
        c.email,
        c.walletBalance || 0
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Audit Report Helper
  const printReportWindow = (title: string, headers: string[], rows: (string | number)[][]) => {
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>${title} - ${activeTenant?.businessName || "MT UniPOS"}</title>
          <style>
            body { font-family: monospace; padding: 20px; color: #000; }
            h2 { margin-bottom: 4px; }
            .meta { font-size: 11px; color: #555; margin-bottom: 16px; border-bottom: 2px solid #000; padding-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
            th { background: #f2f2f2; font-weight: bold; }
            .num { text-align: right; font-weight: bold; }
            .footer { margin-top: 20px; text-align: center; font-size: 10px; border-top: 1px solid #aaa; padding-top: 8px; }
          </style>
        </head>
        <body>
          <h2>${activeTenant?.businessName || "MT UniPOS"} — ${title}</h2>
          <div class="meta">Generated Date: ${new Date().toLocaleString()} | Total Records: ${rows.length}</div>
          <table>
            <thead>
              <tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}
            </tbody>
          </table>
          <div class="footer">Powered by MT UniPOS ERP Engine</div>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const [showWalletModal, setShowWalletModal] = React.useState(false);
  const [selectedWalletCust, setSelectedWalletCust] = React.useState<any>(null);

  const totalWalletLiability = useMemo(() => {
    return customers.reduce((acc, c) => acc + (c.walletBalance || 0), 0);
  }, [customers]);

  const walletCustomers = useMemo(() => {
    return customers.filter(c => (c.walletBalance || 0) > 0);
  }, [customers]);

  const handleSettleWalletLiability = (cust: any) => {
    if (!cust || !cust.walletBalance) return;
    const refundAmt = cust.walletBalance;
    updateCustomerWalletBalance(cust.id, -refundAmt);
    addJournalEntry(
      `Refunded Store Wallet Liability (${cust.name}) in Cash`,
      [{ accountCode: "2003", amount: refundAmt }],
      [{ accountCode: "1001", amount: refundAmt }]
    );
    setSelectedWalletCust(null);
  };

  const sym = currencySymbol || "PKR";
  const formatAmt = (val: number) => {
    if (sym === "PKR") {
      return `PKR ${Math.round(val).toLocaleString()}`;
    }
    return `${sym} ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

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
  const totalRevenue = sales.reduce((acc, s) => {
    if (s.status === "Returned" || s.status === "Refunded") return acc - s.total;
    if ((s as any).status === "Dues_Recovery") return acc;
    return acc + s.total;
  }, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalStockValue = products.reduce((acc, p) => acc + (p.costPrice * p.stock), 0);
  const lowStockAlerts = products.filter(p => p.stock <= p.minStock);

  // Real P&L: COGS from actual sale items × product cost prices
  const totalCOGS = useMemo(() => {
    let cogs = 0;
    sales.forEach(s => {
      const isReturn = s.status === "Returned" || s.status === "Refunded";
      if ((s as any).status === "Dues_Recovery") return;
      s.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        const cost = prod ? prod.costPrice * item.qty : 0;
        if (isReturn) cogs -= cost;
        else cogs += cost;
      });
    });
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
      const daySales = sales.filter(s => new Date(s.date).toDateString() === key);
      const dayRev = daySales.reduce((a, s) => {
        if (s.status === "Returned" || s.status === "Refunded") return a - s.total;
        if ((s as any).status === "Dues_Recovery") return a;
        return a + s.total;
      }, 0);
      days.push(dayRev);
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
      const revenue = daySales.reduce((a, s) => {
        if (s.status === "Returned" || s.status === "Refunded") return a - s.total;
        if ((s as any).status === "Dues_Recovery") return a;
        return a + s.total;
      }, 0);
      let cost = 0;
      daySales.forEach(s => {
        const isReturn = s.status === "Returned" || s.status === "Refunded";
        if ((s as any).status === "Dues_Recovery") return;
        s.items.forEach(item => {
          const prod = products.find(p => p.id === item.productId);
          const c = prod ? prod.costPrice * item.qty : 0;
          if (isReturn) cost -= c;
          else cost += c;
        });
      });
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
          <div className="bg-brand-dark-surface/40 border border-brand-dark-border p-5 rounded-2xl flex flex-col min-h-[300px] overflow-hidden">
            <h3 className="text-xs uppercase font-bold text-white tracking-wide flex items-center gap-1.5 mb-2">
              <Package className="text-amber-400" size={14} />
              Today's Top Products
            </h3>
            {todayTopProducts.length > 0 ? (
              <div className="flex flex-col justify-between flex-1">
                <div className="h-[150px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={todayTopProducts}
                        dataKey="revenue"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={4}
                        stroke="none"
                      >
                        {todayTopProducts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value: any) => [formatAmt(Number(value || 0)), 'Revenue']}
                        contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Legend */}
                <div className="mt-2 space-y-1.5 px-1 border-t border-brand-dark-border/40 pt-2">
                  {todayTopProducts.slice(0, 3).map((p, i) => (
                    <div key={p.name} className="flex justify-between items-center text-[10px]">
                      <div className="flex items-center gap-1.5 truncate pr-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: pieColors[i] }} />
                        <span className="text-gray-300 truncate">{p.name}</span>
                      </div>
                      <span className="font-bold text-white font-mono shrink-0">{formatAmt(p.revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-50 py-8">
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
                <div className="text-xl font-black text-white">{formatAmt(totalRevenue)}</div>
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

        
        {/* -------------------- LIVE POS COUNTERS & CASH DRAWERS MONITOR -------------------- */}
        <section className="bg-brand-dark-surface/40 border border-brand-dark-border p-5 rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-brand-dark-border pb-3">
            <div>
              <h3 className="text-xs uppercase font-bold text-white tracking-wide flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                Live POS Counters &amp; Cash Drawers Monitor
              </h3>
              <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                Real-time cash float, cash sales inflow, and expected drawer balances per cashier counter.
              </p>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
              {posShifts.filter(s => s.status === "Open").length} Counters Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posShifts.length === 0 ? (
              <div className="col-span-full py-8 text-center text-gray-500 italic text-xs">
                No active POS shift sessions logged. Cashiers will appear here as soon as they open a counter shift.
              </div>
            ) : (
              posShifts.map(shift => {
                const shiftSalesList = sales.filter(s => new Date(s.date) >= new Date(shift.startTime));
                const shiftCashInflow = shiftSalesList.reduce((acc, s) => {
                  if (s.status === "Returned" || s.status === "Refunded") {
                    return acc - (s.paymentMethod === "Cash" ? s.total : 0);
                  }
                  if (s.splitPayments) return acc + (s.splitPayments["Cash"] || 0);
                  return acc + (s.paymentMethod === "Cash" ? s.total : 0);
                }, 0);
                const expectedDrawer = (shift.openingFloat || 0) + shiftCashInflow;
                const isOpen = shift.status === "Open";

                return (
                  <div key={shift.id} className={`p-4 rounded-xl border space-y-3 font-sans transition ${
                    isOpen ? "bg-black/50 border-emerald-500/30 hover:border-emerald-500/60" : "bg-black/20 border-brand-dark-border opacity-70"
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-emerald-400 animate-pulse" : "bg-gray-600"}`} />
                          <span className="font-black text-white text-sm">{shift.counterId}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-mono">Cashier: <strong className="text-white">{shift.cashierName}</strong></p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono ${
                        isOpen ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-gray-800 text-gray-400"
                      }`}>
                        {shift.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-b border-brand-dark-border/40 py-2.5">
                      <div>
                        <span className="text-gray-500 block">Opening Float</span>
                        <span className="text-white font-bold">{currencySymbol} {(shift.openingFloat || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Cash Sales Inflow</span>
                        <span className="text-emerald-400 font-bold">+{currencySymbol} {shiftCashInflow.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1 font-mono">
                      <div>
                        <div className="text-[9px] uppercase font-bold text-gray-400">Current Expected Drawer</div>
                        <div className="text-lg font-black text-emerald-400">{currencySymbol} {expectedDrawer.toLocaleString()}</div>
                      </div>
                      {isOpen && (
                        <button
                          onClick={() => {
                            if (confirm(`Audit & Close shift for ${shift.counterId} (${shift.cashierName})? Expected Cash: ${currencySymbol} ${expectedDrawer}`)) {
                              closePOSShift(shift.id, expectedDrawer, "Audit Closed by Owner");
                            }
                          }}
                          className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white font-bold text-[9px] uppercase tracking-wider rounded-lg transition"
                        >
                          Audit &amp; Close
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>


        {/* SECTION 4: DEPARTMENTAL / SUPER MARKETS / GENERAL RETAIL VERTICAL */}
        {vertical === "Retail" && (
          <div className="space-y-6">
            
            {/* General Retail Metric Tiles — Real P&L */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Revenue + sparkline */}
              <div onClick={() => setActiveReportModal("revenue")} className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-xl space-y-2 cursor-pointer hover:bg-emerald-500/20 transition group">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Revenue</span>
                  <TrendingUp size={14} className="text-emerald-400" />
                </div>
                <div className="text-xl font-black text-white font-mono">{currencySymbol} {totalRevenue.toLocaleString(undefined,{maximumFractionDigits:0})}</div>
                <Sparkline values={sparkline7} color="#10b981" />
                <p className="text-[9px] text-gray-500">{totalSalesCount} transactions</p>
              </div>

              {/* Gross Profit */}
              <div onClick={() => setActiveReportModal("gross_profit")} className="bg-brand-sky/10 border border-brand-sky/25 p-4 rounded-xl space-y-2 cursor-pointer hover:bg-brand-sky/20 transition group">
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
              <div onClick={() => setActiveReportModal("net_profit")} className={`border p-4 rounded-xl space-y-2 cursor-pointer hover:opacity-90 transition group ${
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
              <div onClick={() => setActiveReportModal("stock_value")} className="bg-amber-500/10 border border-amber-500/25 p-4 rounded-xl space-y-2 cursor-pointer hover:bg-amber-500/20 transition group">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Stock Value</span>
                  <Database size={14} className="text-amber-400" />
                </div>
                <div className="text-xl font-black text-amber-400 font-mono">{currencySymbol} {totalStockValue.toLocaleString(undefined,{maximumFractionDigits:0})}</div>
                <p className="text-[9px] text-gray-500">{products.length} SKUs in catalog</p>
              </div>

              {/* Customer Wallet Liabilities */}
              <div 
                onClick={() => setShowWalletModal(true)}
                className="bg-purple-500/10 border border-purple-500/25 p-4 rounded-xl space-y-2 cursor-pointer hover:bg-purple-500/15 transition group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Wallet Liabilities</span>
                  <Wallet size={14} className="text-purple-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-xl font-black text-purple-400 font-mono">{currencySymbol} {totalWalletLiability.toLocaleString(undefined,{maximumFractionDigits:0})}</div>
                <p className="text-[9px] text-purple-400/80 font-bold">{walletCustomers.length} customers with store credit &rarr;</p>
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
                        <span className="text-[10px] font-black font-mono text-brand-sky shrink-0">{formatAmt(p.revenue)}</span>
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
                        <span className="text-red-400 font-black font-mono text-[11px] shrink-0">{formatAmt(c.creditBalance)}</span>
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

      
        {/* ── CUSTOMER WALLET LIABILITIES REPORT MODAL ── */}
        {showWalletModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-brand-dark-surface border border-purple-500/30 rounded-2xl w-full max-w-4xl p-6 space-y-5 shadow-2xl animate-fade-in-up max-h-[90vh] flex flex-col">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-brand-dark-border/60 pb-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Wallet size={18} className="text-purple-400" />
                    Customer Store Wallet Liabilities &amp; Returns Report
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Store liabilities owed to customers from returned sales or prepayments.
                  </p>
                </div>
                <button 
                  onClick={() => setShowWalletModal(false)}
                  className="p-1 text-gray-400 hover:text-white rounded-lg transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* KPI Banner */}
              <div className="grid grid-cols-2 gap-4 font-mono">
                <div className="bg-purple-500/10 border border-purple-500/30 p-3.5 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-gray-400">Total Wallet Liability</div>
                  <div className="text-2xl font-black text-purple-400 mt-1">{currencySymbol} {totalWalletLiability.toLocaleString()}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">Account 2003 (Customer Wallet Payable)</div>
                </div>
                <div className="bg-brand-dark-border/40 border border-brand-dark-border p-3.5 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-gray-400">Customers with Balance</div>
                  <div className="text-2xl font-black text-white mt-1">{walletCustomers.length} Customers</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">Holding active wallet credit</div>
                </div>
              </div>

              {/* Customers List Table */}
              <div className="flex-1 overflow-y-auto border border-brand-dark-border/60 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/60 sticky top-0 border-b border-brand-dark-border text-gray-400 font-mono">
                    <tr>
                      <th className="p-3 font-semibold">Customer Details</th>
                      <th className="p-3 font-semibold">Source Return Receipts</th>
                      <th className="p-3 font-semibold text-right">Wallet Credit Balance</th>
                      <th className="p-3 font-semibold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-dark-border/40 font-mono text-[11px]">
                    {walletCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-gray-500 italic font-sans">
                          No active customer wallet liabilities. All returns refunded or settled.
                        </td>
                      </tr>
                    ) : (
                      walletCustomers.map(cust => {
                        const custReturns = sales.filter(s => 
                          (s.status === "Returned" || s.status === "Refunded") &&
                          (s.paymentMethod === "Store Wallet Credit" || s.paymentMethod === "Wallet" || (s.splitPayments && (s.splitPayments["Store Wallet Credit"] || s.splitPayments["Wallet"]))) &&
                          ((s.customerName || "").toLowerCase().trim() === (cust.name || "").toLowerCase().trim() || s.customerNo === cust.customerNo)
                        );

                        return (
                          <tr key={cust.id} className="hover:bg-brand-dark-surface/60 transition">
                            <td className="p-3 font-sans">
                              <div className="font-bold text-white text-xs">{cust.name}</div>
                              <div className="text-[10px] text-gray-400 font-mono">{cust.mobile || cust.email}</div>
                              <div className="text-[9px] text-purple-400 font-mono mt-0.5">ID: {cust.customerNo || cust.id}</div>
                            </td>

                            <td className="p-3 font-sans">
                              {custReturns.length > 0 ? (
                                <div className="space-y-1">
                                  {custReturns.map(ret => (
                                    <div key={ret.id} className="bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded text-[10px] font-mono flex items-center justify-between gap-2">
                                      <span className="text-purple-300 font-bold">{ret.receiptNumber}</span>
                                      <span className="text-gray-400 text-[9px]">{new Date(ret.date).toLocaleDateString()}</span>
                                      <span className="text-emerald-400 font-bold">{currencySymbol} {ret.total}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-500 text-[10px] italic">Direct Deposit / Migration</span>
                              )}
                            </td>

                            <td className="p-3 text-right">
                              <div className="text-sm font-black text-purple-400 font-mono">
                                {currencySymbol} {(cust.walletBalance || 0).toLocaleString()}
                              </div>
                              <div className="text-[9px] text-gray-500">Payable Liability</div>
                            </td>

                            <td className="p-3 text-center">
                              <button
                                onClick={() => {
                                  if (confirm(`Refund ${currencySymbol} ${cust.walletBalance} cash to ${cust.name} and clear wallet liability?`)) {
                                    handleSettleWalletLiability(cust);
                                  }
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition shadow-md shadow-emerald-600/20"
                              >
                                Refund Cash
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-2 border-t border-brand-dark-border/60">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadCSVReport("wallet")}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-purple-600/20"
                  >
                    <Download size={14} /> Download CSV Liabilities Report
                  </button>
                </div>
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="px-4 py-2 bg-brand-dark-border hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition"
                >
                  Close Report
                </button>
              </div>

            </div>
          </div>
        )}

      
        {/* ── REVENUE AUDIT REPORT MODAL ── */}
        {activeReportModal === "revenue" && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-brand-dark-surface border border-emerald-500/30 rounded-2xl w-full max-w-4xl p-6 space-y-5 shadow-2xl animate-fade-in-up max-h-[90vh] flex flex-col">
              
              <div className="flex justify-between items-start border-b border-brand-dark-border/60 pb-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <TrendingUp size={18} className="text-emerald-400" />
                    Sales Revenue Audit &amp; Returns Breakdown Report
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Complete transaction ledger detailing net sales revenue, returns deductions, and payment methods.
                  </p>
                </div>
                <button onClick={() => setActiveReportModal(null)} className="p-1 text-gray-400 hover:text-white rounded-lg transition">
                  <X size={18} />
                </button>
              </div>

              {/* KPI Summary Banner */}
              <div className="grid grid-cols-3 gap-3 font-mono">
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-gray-400">Total Net Revenue</div>
                  <div className="text-xl font-black text-emerald-400 mt-1">{currencySymbol} {totalRevenue.toLocaleString()}</div>
                  <div className="text-[9px] text-gray-500">Gross Sales − Returns</div>
                </div>
                <div className="bg-brand-dark-border/40 border border-brand-dark-border p-3 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-gray-400">Completed Transactions</div>
                  <div className="text-xl font-black text-white mt-1">{sales.filter(s => s.status === "Completed").length} Checkouts</div>
                  <div className="text-[9px] text-gray-500">Active sales receipts</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-gray-400">Returned Sales Deducted</div>
                  <div className="text-xl font-black text-red-400 mt-1">
                    {currencySymbol} {sales.filter(s => s.status === "Returned" || s.status === "Refunded").reduce((a, s) => a + s.total, 0).toLocaleString()}
                  </div>
                  <div className="text-[9px] text-red-400/80 font-bold">Subtracted from revenue</div>
                </div>
              </div>

              {/* Sales List Table */}
              <div className="flex-1 overflow-y-auto border border-brand-dark-border/60 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/60 sticky top-0 border-b border-brand-dark-border text-gray-400 font-mono">
                    <tr>
                      <th className="p-3 font-semibold">Receipt No</th>
                      <th className="p-3 font-semibold">Date &amp; Time</th>
                      <th className="p-3 font-semibold">Customer</th>
                      <th className="p-3 font-semibold">Payment Source</th>
                      <th className="p-3 font-semibold text-right">Net Amount</th>
                      <th className="p-3 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-dark-border/40 font-mono text-[11px]">
                    {sales.map(s => {
                      const isReturn = s.status === "Returned" || s.status === "Refunded";
                      return (
                        <tr key={s.id} className="hover:bg-brand-dark-surface/60 transition">
                          <td className="p-3 text-brand-sky font-bold">{s.receiptNumber}</td>
                          <td className="p-3 text-gray-400">{new Date(s.date).toLocaleString()}</td>
                          <td className="p-3 text-white font-sans">{s.customerName}</td>
                          <td className="p-3 text-gray-300">{s.paymentMethod}</td>
                          <td className={`p-3 text-right font-black ${isReturn ? "text-red-400" : "text-white"}`}>
                            {isReturn ? "-" : ""}{currencySymbol} {s.total.toLocaleString()}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isReturn ? "bg-red-500/10 border border-red-500/30 text-red-400" : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                            }`}>
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-2 border-t border-brand-dark-border/60">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadCSVReport("revenue")}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20"
                  >
                    <Download size={14} /> Download CSV Report
                  </button>
                  <button
                    onClick={() => printReportWindow("Sales Revenue Audit Report", ["Receipt No", "Date", "Customer", "Payment Source", "Net Amount (PKR)", "Status"], sales.map(s => [s.receiptNumber, new Date(s.date).toLocaleString(), s.customerName, s.paymentMethod, s.status === "Returned" ? -s.total : s.total, s.status]))}
                    className="px-3 py-2 bg-brand-dark-border hover:bg-gray-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Printer size={14} /> Print Audit Report
                  </button>
                </div>
                <button onClick={() => setActiveReportModal(null)} className="px-4 py-2 bg-brand-dark-border hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition">
                  Close Report
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ── GROSS PROFIT AUDIT REPORT MODAL ── */}
        {activeReportModal === "gross_profit" && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-brand-dark-surface border border-brand-sky/30 rounded-2xl w-full max-w-5xl p-6 space-y-5 shadow-2xl animate-fade-in-up max-h-[90vh] flex flex-col">
              
              <div className="flex justify-between items-start border-b border-brand-dark-border/60 pb-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <ArrowUpRight size={18} className="text-brand-sky" />
                    Gross Profit &amp; Item Cost Matching Report
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Real-time Product Sales Price vs Unit COGS Cost matching for exact gross profit margin calculation.
                  </p>
                </div>
                <button onClick={() => setActiveReportModal(null)} className="p-1 text-gray-400 hover:text-white rounded-lg transition">
                  <X size={18} />
                </button>
              </div>

              {/* KPI Summary Banner */}
              <div className="grid grid-cols-4 gap-3 font-mono">
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-gray-400">Total Net Revenue</div>
                  <div className="text-lg font-black text-emerald-400 mt-1">{currencySymbol} {totalRevenue.toLocaleString()}</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-gray-400">Total COGS Cost</div>
                  <div className="text-lg font-black text-red-400 mt-1">{currencySymbol} {totalCOGS.toLocaleString()}</div>
                </div>
                <div className="bg-brand-sky/10 border border-brand-sky/30 p-3 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-gray-400">Net Gross Profit</div>
                  <div className="text-lg font-black text-brand-sky mt-1">{currencySymbol} {grossProfit.toLocaleString()}</div>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-gray-400">Gross Margin %</div>
                  <div className="text-lg font-black text-purple-400 mt-1">{grossMarginPct.toFixed(1)}%</div>
                </div>
              </div>

              {/* Product Cost Matching Table */}
              <div className="flex-1 overflow-y-auto border border-brand-dark-border/60 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/60 sticky top-0 border-b border-brand-dark-border text-gray-400 font-mono">
                    <tr>
                      <th className="p-3 font-semibold">Receipt ID</th>
                      <th className="p-3 font-semibold">Product Name</th>
                      <th className="p-3 font-semibold text-center">Qty</th>
                      <th className="p-3 font-semibold text-right">Sale Price</th>
                      <th className="p-3 font-semibold text-right">Unit Cost</th>
                      <th className="p-3 font-semibold text-right">Revenue</th>
                      <th className="p-3 font-semibold text-right">COGS Cost</th>
                      <th className="p-3 font-semibold text-right">Gross Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-dark-border/40 font-mono text-[11px]">
                    {sales.flatMap(s => {
                      const isReturn = s.status === "Returned" || s.status === "Refunded";
                      return s.items.map((item, idx) => {
                        const prod = products.find(p => p.id === item.productId);
                        const unitCost = prod ? prod.costPrice : 0;
                        const itemRev = isReturn ? -item.subtotal : item.subtotal;
                        const itemCost = isReturn ? -(unitCost * item.qty) : (unitCost * item.qty);
                        const itemProfit = itemRev - itemCost;

                        return (
                          <tr key={`${s.id}-${idx}`} className="hover:bg-brand-dark-surface/60 transition">
                            <td className="p-3 text-brand-sky font-bold">{s.receiptNumber}</td>
                            <td className="p-3 text-white font-sans">{item.productName}</td>
                            <td className="p-3 text-center font-bold text-gray-300">{item.qty}</td>
                            <td className="p-3 text-right text-gray-300">{currencySymbol} {item.price}</td>
                            <td className="p-3 text-right text-gray-400">{currencySymbol} {unitCost}</td>
                            <td className={`p-3 text-right font-bold ${isReturn ? "text-red-400" : "text-emerald-400"}`}>{currencySymbol} {itemRev.toLocaleString()}</td>
                            <td className="p-3 text-right text-red-400">{currencySymbol} {itemCost.toLocaleString()}</td>
                            <td className={`p-3 text-right font-black ${itemProfit >= 0 ? "text-brand-sky" : "text-red-400"}`}>{currencySymbol} {itemProfit.toLocaleString()}</td>
                          </tr>
                        );
                      });
                    })}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-2 border-t border-brand-dark-border/60">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadCSVReport("gross_profit")}
                    className="px-3.5 py-2 bg-brand-sky hover:bg-sky-400 text-black font-black text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-sky-500/20"
                  >
                    <Download size={14} /> Download CSV Report
                  </button>
                </div>
                <button onClick={() => setActiveReportModal(null)} className="px-4 py-2 bg-brand-dark-border hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition">
                  Close Report
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ── NET PROFIT & LOSS STATEMENT MODAL ── */}
        {activeReportModal === "net_profit" && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-brand-dark-surface border border-purple-500/30 rounded-2xl w-full max-w-4xl p-6 space-y-5 shadow-2xl animate-fade-in-up max-h-[90vh] flex flex-col">
              
              <div className="flex justify-between items-start border-b border-brand-dark-border/60 pb-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <DollarSign size={18} className="text-purple-400" />
                    Profit &amp; Loss (P&amp;L) Statement Audit Report
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Complete income statement breaking down Revenue, Cost of Goods Sold, Gross Margin, and Operating Expenses.
                  </p>
                </div>
                <button onClick={() => setActiveReportModal(null)} className="p-1 text-gray-400 hover:text-white rounded-lg transition">
                  <X size={18} />
                </button>
              </div>

              {/* P&L Statement Table */}
              <div className="bg-black/40 border border-brand-dark-border rounded-xl p-4 font-mono space-y-3">
                <div className="flex justify-between items-center text-sm border-b border-brand-dark-border/60 pb-2 text-emerald-400 font-bold">
                  <span>1. TOTAL SALES REVENUE (NET OF RETURNS)</span>
                  <span>{currencySymbol} {totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-brand-dark-border/60 pb-2 text-red-400">
                  <span>2. LESS: COST OF GOODS SOLD (COGS)</span>
                  <span>- {currencySymbol} {totalCOGS.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-base border-b border-brand-dark-border pb-2 text-brand-sky font-black">
                  <span>3. GROSS PROFIT MARGIN</span>
                  <span>{currencySymbol} {grossProfit.toLocaleString()} ({grossMarginPct.toFixed(1)}%)</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-brand-dark-border/60 pb-2 text-amber-400">
                  <span>4. LESS: OPERATING &amp; UTILITY EXPENSES</span>
                  <span>- {currencySymbol} {totalExpenses.toLocaleString()}</span>
                </div>
                <div className={`flex justify-between items-center text-lg pt-1 font-black ${netProfit >= 0 ? "text-purple-400" : "text-red-400"}`}>
                  <span>5. FINAL NET OPERATING PROFIT</span>
                  <span>{netProfit < 0 ? "-" : ""}{currencySymbol} {Math.abs(netProfit).toLocaleString()}</span>
                </div>
              </div>

              {/* Expenses Breakdown List */}
              <div className="flex-1 overflow-y-auto border border-brand-dark-border/60 rounded-xl">
                <div className="p-3 bg-black/60 font-bold text-xs text-white border-b border-brand-dark-border uppercase tracking-wider font-mono">
                  Operating Expenses Audit Ledger ({expenses.length} Vouchers)
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/40 border-b border-brand-dark-border text-gray-400 font-mono text-[10px]">
                    <tr>
                      <th className="p-2.5 font-semibold">Expense ID</th>
                      <th className="p-2.5 font-semibold">Category</th>
                      <th className="p-2.5 font-semibold">Date</th>
                      <th className="p-2.5 font-semibold">Description</th>
                      <th className="p-2.5 font-semibold">Payment Source</th>
                      <th className="p-2.5 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-dark-border/40 font-mono text-[11px]">
                    {expenses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-gray-500 italic font-sans">No operating expenses recorded yet.</td>
                      </tr>
                    ) : (
                      expenses.map(exp => (
                        <tr key={exp.id} className="hover:bg-brand-dark-surface/60 transition">
                          <td className="p-2.5 text-purple-400 font-bold">{exp.id}</td>
                          <td className="p-2.5 text-white font-sans">{exp.category}</td>
                          <td className="p-2.5 text-gray-400">{exp.date}</td>
                          <td className="p-2.5 text-gray-400 font-sans">{exp.description}</td>
                          <td className="p-2.5 text-gray-300">{exp.paymentMethod}</td>
                          <td className="p-2.5 text-right font-bold text-red-400">{currencySymbol} {exp.amount.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-2 border-t border-brand-dark-border/60">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadCSVReport("net_profit")}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-purple-600/20"
                  >
                    <Download size={14} /> Download P&amp;L CSV Statement
                  </button>
                </div>
                <button onClick={() => setActiveReportModal(null)} className="px-4 py-2 bg-brand-dark-border hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition">
                  Close Report
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ── STOCK VALUATION AUDIT REPORT MODAL ── */}
        {activeReportModal === "stock_value" && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-brand-dark-surface border border-amber-500/30 rounded-2xl w-full max-w-5xl p-6 space-y-5 shadow-2xl animate-fade-in-up max-h-[90vh] flex flex-col">
              
              <div className="flex justify-between items-start border-b border-brand-dark-border/60 pb-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Database size={18} className="text-amber-400" />
                    Inventory Stock Valuation &amp; Catalog Audit Report
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Live inventory asset valuation computed as (Product Cost Price × Current Available Stock).
                  </p>
                </div>
                <button onClick={() => setActiveReportModal(null)} className="p-1 text-gray-400 hover:text-white rounded-lg transition">
                  <X size={18} />
                </button>
              </div>

              {/* KPI Summary Banner */}
              <div className="grid grid-cols-3 gap-3 font-mono">
                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-gray-400">Total Stock Value</div>
                  <div className="text-xl font-black text-amber-400 mt-1">{currencySymbol} {totalStockValue.toLocaleString()}</div>
                  <div className="text-[9px] text-gray-500">Asset Account 1003</div>
                </div>
                <div className="bg-brand-dark-border/40 border border-brand-dark-border p-3 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-gray-400">Catalog SKUs Count</div>
                  <div className="text-xl font-black text-white mt-1">{products.length} Products</div>
                  <div className="text-[9px] text-gray-500">Active inventory SKUs</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-gray-400">Low Stock Alerts</div>
                  <div className="text-xl font-black text-red-400 mt-1">{lowStockAlerts.length} Products</div>
                  <div className="text-[9px] text-red-400/80 font-bold">Below minimum threshold</div>
                </div>
              </div>

              {/* Inventory SKUs Table */}
              <div className="flex-1 overflow-y-auto border border-brand-dark-border/60 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/60 sticky top-0 border-b border-brand-dark-border text-gray-400 font-mono">
                    <tr>
                      <th className="p-3 font-semibold">SKU &amp; Barcode</th>
                      <th className="p-3 font-semibold">Product Name</th>
                      <th className="p-3 font-semibold">Category</th>
                      <th className="p-3 font-semibold text-right">Cost Price</th>
                      <th className="p-3 font-semibold text-right">Sale Price</th>
                      <th className="p-3 font-semibold text-center">Stock Qty</th>
                      <th className="p-3 font-semibold text-right">Valuation (Cost)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-dark-border/40 font-mono text-[11px]">
                    {products.map(p => {
                      const val = p.costPrice * p.stock;
                      const isLow = p.stock <= p.minStock;
                      return (
                        <tr key={p.id} className="hover:bg-brand-dark-surface/60 transition">
                          <td className="p-3 text-brand-sky font-bold">{p.sku}</td>
                          <td className="p-3 text-white font-sans">{p.name}</td>
                          <td className="p-3 text-gray-400">{p.category}</td>
                          <td className="p-3 text-right text-gray-300">{currencySymbol} {p.costPrice}</td>
                          <td className="p-3 text-right text-gray-300">{currencySymbol} {p.salePrice}</td>
                          <td className={`p-3 text-center font-bold ${isLow ? "text-red-400 font-black" : "text-white"}`}>
                            {p.stock} {p.unit || "Pcs"}
                          </td>
                          <td className="p-3 text-right font-black text-amber-400">{currencySymbol} {val.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-2 border-t border-brand-dark-border/60">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadCSVReport("stock_value")}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20"
                  >
                    <Download size={14} /> Download CSV Inventory Valuation
                  </button>
                </div>
                <button onClick={() => setActiveReportModal(null)} className="px-4 py-2 bg-brand-dark-border hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition">
                  Close Report
                </button>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
