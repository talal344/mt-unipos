"use client";

import React, { useState, useMemo, useRef } from "react";
import { useGlobalContext } from "@/context/global-context";
import ClientSidebar from "@/components/client-sidebar";
import {
  FileDown, Calendar, TrendingUp, TrendingDown, BarChart3,
  ShoppingCart, DollarSign, CreditCard, Download, Package,
  Users, ArrowUpRight, AlertTriangle, CheckCircle2, UserCheck, ShieldAlert,
  Image, Printer, FileSpreadsheet
} from "lucide-react";
import * as XLSX from "xlsx";

// ── Date helpers ──────────────────────────────────────────────────────────────
function isoDate(d: Date) {
  return d.toISOString().split("T")[0];
}
function getRange(period: string): { from: Date; to: Date } {
  const now = new Date();
  const to = new Date(now);
  let from = new Date(now);
  if (period === "today") { from = new Date(now.setHours(0, 0, 0, 0)); }
  else if (period === "week") { from.setDate(from.getDate() - 7); }
  else if (period === "month") { from.setDate(1); from.setHours(0, 0, 0, 0); }
  else if (period === "quarter") { from.setMonth(from.getMonth() - 3); }
  return { from, to };
}

// ── Tiny inline SVG bar chart ─────────────────────────────────────────────────
function BarChart({ data, color = "#38bdf8", height = 80 }: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const barW = Math.max(8, Math.floor(280 / data.length) - 4);
  return (
    <svg viewBox={`0 0 ${data.length * (barW + 4)} ${height + 20}`} className="w-full" style={{ height: height + 20 }}>
      {data.map((d, i) => {
        const h = Math.max(2, Math.round((d.value / max) * height));
        const x = i * (barW + 4);
        const y = height - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} fill={color} rx="2" opacity="0.85" />
            <text x={x + barW / 2} y={height + 14} textAnchor="middle" fontSize="7" fill="#6b7280"
              style={{ fontFamily: "monospace" }}>
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Tiny sparkline ────────────────────────────────────────────────────────────
function Sparkline({ values, color = "#38bdf8" }: { values: number[]; color?: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const W = 120, H = 30;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - Math.round((v / max) * H);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-8">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ReportsPage() {
  const { 
    sales, 
    products, 
    expenses, 
    customers, 
    employees, 
    purchaseOrders, 
    suppliers, 
    currencySymbol, 
    currentBranch 
  } = useGlobalContext();

  const [period, setPeriod] = useState<"today" | "week" | "month" | "quarter" | "custom">("month");
  const [customFromDate, setCustomFromDate] = useState<string>("");
  const [customToDate, setCustomToDate] = useState<string>("");

  const [activeTab, setActiveTab] = useState<
    "overview" | "pl" | "sales" | "inventory" | "expenses" | "employees" | "customers" | "suppliers" | "payroll"
  >("overview");

  // Sales View & Filter States
  const [salesFilterType, setSalesFilterType] = useState<"all" | "customer" | "staff">("all");
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState<string>("ALL");
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>("ALL");
  const [salesDetailLevel, setSalesDetailLevel] = useState<"summary" | "itemized">("itemized");

  const [toast, setToast] = useState<string | null>(null);
  const reportContainerRef = useRef<HTMLDivElement>(null);

  const triggerToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const PERIOD_LABELS: Record<string, string> = {
    today: "Today", week: "Last 7 Days", month: "This Month", quarter: "Last Quarter", custom: "Custom Date Range"
  };

  // ── Filter sales & expenses by period and filters ──────────────────────────────
  const { from, to } = useMemo(() => {
    const now = new Date();
    let toDate = new Date(now);
    let fromDate = new Date(now);
    if (period === "today") { fromDate = new Date(now.setHours(0, 0, 0, 0)); }
    else if (period === "week") { fromDate.setDate(fromDate.getDate() - 7); }
    else if (period === "month") { fromDate.setDate(1); fromDate.setHours(0, 0, 0, 0); }
    else if (period === "quarter") { fromDate.setMonth(fromDate.getMonth() - 3); }
    else if (period === "custom" && customFromDate && customToDate) {
      fromDate = new Date(customFromDate + "T00:00:00");
      toDate = new Date(customToDate + "T23:59:59");
    }
    return { from: fromDate, to: toDate };
  }, [period, customFromDate, customToDate]);

  const filteredSales = useMemo(() => {
    let list = sales.filter(s => {
      const d = new Date(s.date);
      return d >= from && d <= to;
    });

    if (activeTab === "sales") {
      if (salesFilterType === "customer" && selectedCustomerFilter !== "ALL") {
        list = list.filter(s => 
          (s.customerName || "").toLowerCase().trim() === selectedCustomerFilter.toLowerCase().trim() ||
          s.customerNo === selectedCustomerFilter
        );
      } else if (salesFilterType === "staff" && selectedStaffFilter !== "ALL") {
        list = list.filter(s => 
          (s.cashierName || "").toLowerCase().trim() === selectedStaffFilter.toLowerCase().trim()
        );
      }
    }

    return list;
  }, [sales, from, to, activeTab, salesFilterType, selectedCustomerFilter, selectedStaffFilter]);

  const filteredExpenses = useMemo(() =>
    expenses.filter(e => { const d = new Date(e.date); return d >= from && d <= to; }),
    [expenses, from, to]
  );

  // ── Executive P/L Financial Calculation ──────────────────────────────────
  const plSummary = useMemo(() => {
    let completedRevenue = 0;
    let returnsTotal = 0;
    let duesRecoveredTotal = 0;
    let creditSalesIssuedTotal = 0;
    let cogsTotal = 0;

    filteredSales.forEach(s => {
      const isReturn = s.status === "Returned" || s.status === "Refunded";
      const isDuesRecovery = s.status === "Dues_Recovery";

      if (isReturn) {
        returnsTotal += s.total;
      } else if (isDuesRecovery) {
        duesRecoveredTotal += s.total;
      } else {
        completedRevenue += s.total;

        s.items.forEach(item => {
          const prod = products.find(p => p.id === item.productId);
          if (prod) cogsTotal += prod.costPrice * item.qty;
        });

        if (s.paymentMethod === "On Credit") {
          creditSalesIssuedTotal += s.total;
        } else if (s.splitPayments?.["On Credit"]) {
          creditSalesIssuedTotal += s.splitPayments["On Credit"];
        }
      }
    });

    const netSalesRevenue = completedRevenue - returnsTotal;
    const netOperatingIncome = netSalesRevenue + duesRecoveredTotal;
    const grossProfit = netOperatingIncome - cogsTotal;
    const grossMargin = netOperatingIncome > 0 ? (grossProfit / netOperatingIncome) * 100 : 0;
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netExecutiveProfit = grossProfit - totalExpenses;

    const totalOutstandingDues = customers.reduce((sum, c) => sum + (c.creditBalance || 0), 0);
    const totalWalletBalances = customers.reduce((sum, c) => sum + (c.walletBalance || 0), 0);

    return {
      completedRevenue,
      returnsTotal,
      duesRecoveredTotal,
      creditSalesIssuedTotal,
      netSalesRevenue,
      netOperatingIncome,
      cogsTotal,
      grossProfit,
      grossMargin,
      totalExpenses,
      netExecutiveProfit,
      totalOutstandingDues,
      totalWalletBalances
    };
  }, [filteredSales, filteredExpenses, products, customers]);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const totalRevenue = filteredSales.reduce((a, s) => a + s.total, 0);
  const totalExpAmt  = filteredExpenses.reduce((a, e) => a + e.amount, 0);
  const totalTax     = filteredSales.reduce((a, s) => a + s.tax, 0);
  const totalDiscount= filteredSales.reduce((a, s) => a + s.discount, 0);
  const totalCOGS    = (() => {
    let cogs = 0;
    filteredSales.forEach(s => {
      s.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        if (prod) cogs += prod.costPrice * item.qty;
      });
    });
    return cogs;
  })();
  const grossProfit  = totalRevenue - totalCOGS;
  const netProfit    = grossProfit - totalExpAmt;
  const grossMargin  = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  // ── Cash Flow Audit ("Kahan Sy Aaye, Kahan Gae") ───────────────────
  const cashSalesInflow = filteredSales
    .filter(s => (s.status as string) !== "Returned" && (s.status as string) !== "Dues_Recovery" && (s.paymentMethod === "Cash" || s.splitPayments?.["Cash"]))
    .reduce((a, s) => a + (s.splitPayments ? (s.splitPayments["Cash"] || 0) : s.total), 0);

  const duesRecoveredInflow = filteredSales
    .filter(s => (s as any).status === "Dues_Recovery")
    .reduce((a, s) => a + s.total, 0);

  const cardBankInflow = filteredSales
    .filter(s => s.status !== "Returned" && (s.paymentMethod === "Card" || s.paymentMethod === "Bank Transfer" || s.paymentMethod === "EasyPaisa / JazzCash"))
    .reduce((a, s) => a + s.total, 0);

  const totalInflow = cashSalesInflow + duesRecoveredInflow + cardBankInflow;

  const cashReturnsOutflow = filteredSales
    .filter(s => s.status === "Returned" && s.paymentMethod !== "Store Wallet Credit")
    .reduce((a, s) => a + s.total, 0);

  const totalOutflow = cashReturnsOutflow + totalExpAmt;
  const netCashInHand = totalInflow - totalOutflow;

  // ── Daily revenue for bar chart (last 14 days bucketed) ──────────────────
  const dailyRevenue = useMemo(() => {
    const days: Record<string, number> = {};
    filteredSales.forEach(s => {
      const day = new Date(s.date).toLocaleDateString("en-PK", { day: "2-digit", month: "short" });
      days[day] = (days[day] || 0) + s.total;
    });
    return Object.entries(days).slice(-14).map(([label, value]) => ({ label, value }));
  }, [filteredSales]);

  // ── Top 8 selling products ─────────────────────────────────────────────
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number }> = {};
    filteredSales.forEach(s => s.items.forEach(item => {
      if (!map[item.productId]) map[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
      map[item.productId].qty += item.qty;
      map[item.productId].revenue += item.subtotal;
    }));
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  }, [filteredSales]);

  // ── Payment method breakdown ───────────────────────────────────────────
  const paymentBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredSales.forEach(s => {
      if (s.splitPayments) {
        Object.entries(s.splitPayments).forEach(([m, val]) => {
          map[m] = (map[m] || 0) + val;
        });
      } else {
        map[s.paymentMethod] = (map[s.paymentMethod] || 0) + s.total;
      }
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredSales]);

  // ── Customer dues leaderboard ──────────────────────────────────────────
  const overdueCustomers = [...customers]
    .filter(c => c.creditBalance > 0)
    .sort((a, b) => b.creditBalance - a.creditBalance)
    .slice(0, 6);

  // ── Expense breakdown by category ────────────────────────────────────
  const expCats = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredExpenses]);

  // ── Daily sparklines for last 7 days ─────────────────────────────────
  const last7 = useMemo(() => {
    const days: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toDateString();
      const total = sales.filter(s => new Date(s.date).toDateString() === key).reduce((a, s) => a + s.total, 0);
      days.push(total);
    }
    return days;
  }, [sales]);

  // ── Payment method colors ─────────────────────────────────────────────
  const pmColors: Record<string, string> = {
    "Cash": "#10b981", "Card": "#38bdf8", "Bank Transfer": "#a78bfa",
    "EasyPaisa": "#f59e0b", "JazzCash": "#ef4444", "On Credit": "#f97316"
  };

  // ── Employee Performance Stats ──────────────────────────────────────────
  const employeeStats = useMemo(() => {
    return employees.map(emp => {
      const empSales = filteredSales.filter(s => s.cashierName.toLowerCase() === emp.name.toLowerCase());
      const rev = empSales.reduce((sum, s) => sum + s.total, 0);
      const count = empSales.length;
      return {
        id: emp.id,
        name: emp.name,
        role: emp.role,
        status: emp.status,
        phone: emp.phone || "N/A",
        salesCount: count,
        revenue: rev
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [employees, filteredSales]);

  const topSalesperson = useMemo(() => {
    if (employeeStats.length === 0) return "N/A";
    const top = employeeStats[0];
    return top.revenue > 0 ? `${top.name} (${currencySymbol} ${Math.round(top.revenue).toLocaleString()})` : "None";
  }, [employeeStats, currencySymbol]);

  // ── Customer Ledger Stats ───────────────────────────────────────────────
  const customerStats = useMemo(() => {
    return customers.map(c => {
      const custSales = filteredSales.filter(s => s.customerName.toLowerCase() === c.name.toLowerCase());
      const spent = custSales.reduce((sum, s) => sum + s.total, 0);
      const count = custSales.length;
      return {
        id: c.id,
        name: c.name,
        mobile: c.mobile,
        creditBalance: c.creditBalance,
        loyaltyPoints: c.loyaltyPoints,
        buyCount: count,
        totalSpent: spent
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [customers, filteredSales]);

  // ── Supplier Ledger Stats ───────────────────────────────────────────────
  const supplierStats = useMemo(() => {
    return suppliers.map(sup => {
      const supPOs = purchaseOrders.filter(po => {
        const match = po.supplierId === sup.id || po.supplierName.toLowerCase() === sup.name.toLowerCase();
        const d = new Date(po.date);
        return match && d >= from && d <= to;
      });
      const totalPOVal = supPOs.reduce((sum, po) => sum + po.total, 0);
      const count = supPOs.length;
      return {
        id: sup.id,
        name: sup.name,
        company: sup.company,
        mobile: sup.mobile,
        email: sup.email,
        dueAmount: sup.dueAmount,
        poCount: count,
        totalPOValue: totalPOVal
      };
    }).sort((a, b) => b.totalPOValue - a.totalPOValue);
  }, [suppliers, purchaseOrders, from, to]);

  // ── Payroll & Attendance Roster Stats ───────────────────────────────────
  const payrollStats = useMemo(() => {
    return employees.map(emp => {
      const attendanceEntries = Object.entries(emp.attendance || {}).filter(([dateStr]) => {
        const d = new Date(dateStr);
        return d >= from && d <= to;
      });
      let presents = 0;
      let absents = 0;
      let lates = 0;
      let leaves = 0;
      attendanceEntries.forEach(([_, status]) => {
        if (status === "Present") presents++;
        else if (status === "Absent") absents++;
        else if (status === "Late") lates++;
        else if (status === "Leave") leaves++;
      });
      const totalDays = presents + absents + lates + leaves;
      const attendanceRate = totalDays > 0 ? ((presents + lates) / totalDays) * 100 : 100;
      return {
        id: emp.id,
        name: emp.name,
        role: emp.role,
        salary: emp.salary || 0,
        presents,
        absents,
        lates,
        leaves,
        attendanceRate
      };
    }).sort((a, b) => b.salary - a.salary);
  }, [employees, from, to]);

  // ─────────────────────────────────────────────────────────────────────────
  //  EXPORTS HANDLERS
  // ─────────────────────────────────────────────────────────────────────────
  //  EXPORTS HANDLERS
  // ─────────────────────────────────────────────────────────────────────────
  const handleExcelExport = () => {
    const wb = XLSX.utils.book_new();

    if (activeTab === "pl") {
      const plData = [
        { "Financial Metric": "Branch Name", "Amount / Details": currentBranch },
        { "Financial Metric": "Date Period", "Amount / Details": PERIOD_LABELS[period] },
        { "Financial Metric": "Completed Gross Sales", "Amount / Details": `${currencySymbol} ${plSummary.completedRevenue.toFixed(2)}` },
        { "Financial Metric": "Sales Returns & Refunds (-)", "Amount / Details": `${currencySymbol} ${plSummary.returnsTotal.toFixed(2)}` },
        { "Financial Metric": "Dues Recoveries Received (+)", "Amount / Details": `${currencySymbol} ${plSummary.duesRecoveredTotal.toFixed(2)}` },
        { "Financial Metric": "Net Operating Revenue", "Amount / Details": `${currencySymbol} ${plSummary.netOperatingIncome.toFixed(2)}` },
        { "Financial Metric": "Cost of Goods Sold (COGS) (-)", "Amount / Details": `${currencySymbol} ${plSummary.cogsTotal.toFixed(2)}` },
        { "Financial Metric": "Gross Operating Profit", "Amount / Details": `${currencySymbol} ${plSummary.grossProfit.toFixed(2)}` },
        { "Financial Metric": "Gross Margin %", "Amount / Details": `${plSummary.grossMargin.toFixed(1)}%` },
        { "Financial Metric": "Total Operating Expenses (-)", "Amount / Details": `${currencySymbol} ${plSummary.totalExpenses.toFixed(2)}` },
        { "Financial Metric": "NET EXECUTIVE PROFIT / (LOSS)", "Amount / Details": `${currencySymbol} ${plSummary.netExecutiveProfit.toFixed(2)}` },
        { "Financial Metric": "Outstanding Accounts Receivable Dues", "Amount / Details": `${currencySymbol} ${plSummary.totalOutstandingDues.toFixed(2)}` },
        { "Financial Metric": "Customer Store Wallet Balances Held", "Amount / Details": `${currencySymbol} ${plSummary.totalWalletBalances.toFixed(2)}` },
      ];
      const ws = XLSX.utils.json_to_sheet(plData);
      ws["!cols"] = [{ wch: 38 }, { wch: 25 }];
      XLSX.utils.book_append_sheet(wb, ws, "Profit & Loss Statement");
      XLSX.writeFile(wb, `Reports_Excel_PL_Statement_${period}_${isoDate(new Date())}.xlsx`);
      triggerToast("📁 P/L Excel report ready! Saved into Reports/Excel/ folder.");
      return;
    }

    if (activeTab === "overview") {
      // Sheet 1: Overview & P&L Summary
      const plData = [
        { "Report Parameter": "Branch Name", "Value": currentBranch },
        { "Report Parameter": "Date Period", "Value": PERIOD_LABELS[period] },
        { "Report Parameter": "Total Revenue", "Value": `${currencySymbol} ${totalRevenue.toFixed(2)}` },
        { "Report Parameter": "Cost of Goods Sold (COGS)", "Value": `${currencySymbol} ${totalCOGS.toFixed(2)}` },
        { "Report Parameter": "Gross Profit", "Value": `${currencySymbol} ${grossProfit.toFixed(2)}` },
        { "Report Parameter": "Total Expenses", "Value": `${currencySymbol} ${totalExpAmt.toFixed(2)}` },
        { "Report Parameter": "Net Profit", "Value": `${currencySymbol} ${netProfit.toFixed(2)}` },
        { "Report Parameter": "Gross Margin %", "Value": `${grossMargin.toFixed(1)}%` },
        { "Report Parameter": "Total Tax Collected", "Value": `${currencySymbol} ${totalTax.toFixed(2)}` },
        { "Report Parameter": "Total Discounts Given", "Value": `${currencySymbol} ${totalDiscount.toFixed(2)}` },
      ];
      const ws1 = XLSX.utils.json_to_sheet(plData);
      ws1["!cols"] = [{ wch: 30 }, { wch: 25 }];
      XLSX.utils.book_append_sheet(wb, ws1, "P&L Summary");

      // Sheet 2: Sales Transactions
      const salesData = filteredSales.map(s => ({
        "Receipt #": s.receiptNumber,
        "Date": new Date(s.date).toLocaleString(),
        "Customer": s.customerName,
        "Cashier": s.cashierName,
        "Payment Method": s.paymentMethod,
        "Items Count": s.items.length,
        [`Subtotal (${currencySymbol})`]: s.subtotal,
        [`Discount (${currencySymbol})`]: s.discount,
        [`Tax (${currencySymbol})`]: s.tax,
        [`Total (${currencySymbol})`]: s.total,
        "Status": s.status,
      }));
      const ws2 = XLSX.utils.json_to_sheet(salesData);
      if (salesData.length > 0) {
        ws2["!cols"] = Object.keys(salesData[0]).map(() => ({ wch: 16 }));
      }
      XLSX.utils.book_append_sheet(wb, ws2, "Sales Transactions");

      // Sheet 3: Inventory Status
      const invData = products.map(p => ({
        "SKU": p.sku,
        "Product Name": p.name,
        "Category": p.category,
        [`Cost Price (${currencySymbol})`]: p.costPrice,
        [`Retail Price (${currencySymbol})`]: p.salePrice,
        "Current Stock": p.stock,
        "Unit": p.unit,
        [`Stock Value (${currencySymbol})`]: p.costPrice * p.stock,
        "Status": p.stock === 0 ? "Out of Stock" : p.stock <= p.minStock ? "Low Stock" : "OK",
      }));
      const ws3 = XLSX.utils.json_to_sheet(invData);
      if (invData.length > 0) {
        ws3["!cols"] = Object.keys(invData[0]).map(() => ({ wch: 16 }));
      }
      XLSX.utils.book_append_sheet(wb, ws3, "Inventory Status");

      // Sheet 4: Expenses Summary
      const expData = filteredExpenses.map(e => ({
        "Voucher ID": e.id,
        "Date": e.date,
        "Category": e.category,
        "Description": e.description,
        "Payment Method": e.paymentMethod,
        [`Amount (${currencySymbol})`]: e.amount,
      }));
      const ws4 = XLSX.utils.json_to_sheet(expData);
      if (expData.length > 0) {
        ws4["!cols"] = Object.keys(expData[0]).map(() => ({ wch: 16 }));
      }
      XLSX.utils.book_append_sheet(wb, ws4, "Expenses Summary");

      XLSX.writeFile(wb, `Reports_Excel_Overview_Report_${period}_${isoDate(new Date())}.xlsx`);
      triggerToast("📁 Complete Overview Excel report ready! Saved into Reports/Excel/ folder.");
    } else if (activeTab === "sales") {
      // Sheet 1: Transactions Summary
      const salesData = filteredSales.map(s => ({
        "Receipt #": s.receiptNumber,
        "Date": new Date(s.date).toLocaleString(),
        "Customer": s.customerName,
        "Cashier / Staff": s.cashierName,
        "Payment Method": s.paymentMethod,
        "Items Count": s.items.length,
        [`Subtotal (${currencySymbol})`]: s.subtotal,
        [`Discount (${currencySymbol})`]: s.discount,
        [`Tax (${currencySymbol})`]: s.tax,
        [`Total (${currencySymbol})`]: s.total,
        "Status": s.status,
      }));
      const ws = XLSX.utils.json_to_sheet(salesData);
      if (salesData.length > 0) {
        ws["!cols"] = Object.keys(salesData[0]).map(() => ({ wch: 16 }));
      }
      XLSX.utils.book_append_sheet(wb, ws, "Sales Summary");

      // Sheet 2: Itemized Products Line Breakdown
      const itemizedData = filteredSales.flatMap(s =>
        (s.items || []).map(item => ({
          "Receipt #": s.receiptNumber,
          "Date & Time": new Date(s.date).toLocaleString(),
          "Customer": s.customerName,
          "Cashier / Staff": s.cashierName,
          "Payment Method": s.paymentMethod,
          "Product Name": item.productName || item.name || "Item",
          "Quantity": item.qty,
          [`Unit Price (${currencySymbol})`]: item.price || item.unitPrice || 0,
          [`Total Amount (${currencySymbol})`]: (item.qty || 1) * (item.price || item.unitPrice || 0),
          "Transaction Status": s.status,
        }))
      );
      if (itemizedData.length > 0) {
        const wsItem = XLSX.utils.json_to_sheet(itemizedData);
        wsItem["!cols"] = Object.keys(itemizedData[0]).map(() => ({ wch: 18 }));
        XLSX.utils.book_append_sheet(wb, wsItem, "Itemized Products Detail");
      }

      XLSX.writeFile(wb, `Reports_Excel_Sales_Report_${period}_${isoDate(new Date())}.xlsx`);
      triggerToast("📁 Itemized Sales Excel report ready! Saved into Reports/Excel/ folder.");
    } else if (activeTab === "inventory") {
      const invData = products.map(p => ({
        "SKU": p.sku,
        "Product Name": p.name,
        "Category": p.category,
        [`Cost Price (${currencySymbol})`]: p.costPrice,
        [`Retail Price (${currencySymbol})`]: p.salePrice,
        "Current Stock": p.stock,
        "Unit": p.unit,
        [`Stock Value (${currencySymbol})`]: p.costPrice * p.stock,
        "Status": p.stock === 0 ? "Out of Stock" : p.stock <= p.minStock ? "Low Stock" : "OK",
      }));
      const ws = XLSX.utils.json_to_sheet(invData);
      if (invData.length > 0) {
        ws["!cols"] = Object.keys(invData[0]).map(() => ({ wch: 16 }));
      }
      XLSX.utils.book_append_sheet(wb, ws, "Inventory Status");
      XLSX.writeFile(wb, `Reports_Excel_Inventory_Report_${isoDate(new Date())}.xlsx`);
      triggerToast("📁 Inventory Excel report ready! Saved into Reports/Excel/ folder.");
    } else if (activeTab === "expenses") {
      const expData = filteredExpenses.map(e => ({
        "Voucher ID": e.id,
        "Date": e.date,
        "Category": e.category,
        "Description": e.description,
        "Payment Method": e.paymentMethod,
        [`Amount (${currencySymbol})`]: e.amount,
      }));
      const ws = XLSX.utils.json_to_sheet(expData);
      if (expData.length > 0) {
        ws["!cols"] = Object.keys(expData[0]).map(() => ({ wch: 16 }));
      }
      XLSX.utils.book_append_sheet(wb, ws, "Expenses Summary");
      XLSX.writeFile(wb, `Reports_Excel_Expenses_Report_${period}_${isoDate(new Date())}.xlsx`);
      triggerToast("📁 Expenses Excel report ready! Saved into Reports/Excel/ folder.");
    } else if (activeTab === "employees") {
      const empData = employeeStats.map(e => ({
        "Staff ID": e.id,
        "Name": e.name,
        "Role": e.role,
        "Mobile Contact": e.phone,
        "Sales Transaction Count": e.salesCount,
        [`Revenue Generated (${currencySymbol})`]: e.revenue,
        "Status": e.status,
      }));
      const ws = XLSX.utils.json_to_sheet(empData);
      if (empData.length > 0) {
        ws["!cols"] = Object.keys(empData[0]).map(() => ({ wch: 18 }));
      }
      XLSX.utils.book_append_sheet(wb, ws, "Employees Performance");
      XLSX.writeFile(wb, `Reports_Excel_Employees_Report_${period}_${isoDate(new Date())}.xlsx`);
      triggerToast("📁 Employees Performance Excel report ready! Saved into Reports/Excel/ folder.");
    } else if (activeTab === "customers") {
      const custData = customerStats.map(c => ({
        "Customer ID": c.id,
        "Name": c.name,
        "Mobile": c.mobile,
        "Purchase Count": c.buyCount,
        [`Total Amount Spent (${currencySymbol})`]: c.totalSpent,
        [`Credit Balance Due (${currencySymbol})`]: c.creditBalance,
        "Loyalty Points Balance": c.loyaltyPoints,
      }));
      const ws = XLSX.utils.json_to_sheet(custData);
      if (custData.length > 0) {
        ws["!cols"] = Object.keys(custData[0]).map(() => ({ wch: 18 }));
      }
      XLSX.utils.book_append_sheet(wb, ws, "Customers Ledger");
      XLSX.writeFile(wb, `Reports_Excel_Customers_Report_${period}_${isoDate(new Date())}.xlsx`);
      triggerToast("📁 Customers Ledger Excel report ready! Saved into Reports/Excel/ folder.");
    } else if (activeTab === "suppliers") {
      const supData = supplierStats.map(s => ({
        "Supplier ID": s.id,
        "Company": s.company,
        "Agent Name": s.name,
        "Mobile Contact": s.mobile,
        "Email": s.email,
        "POs Filed": s.poCount,
        [`Total PO Amount (${currencySymbol})`]: s.totalPOValue,
        [`Outstanding Due (${currencySymbol})`]: s.dueAmount,
      }));
      const ws = XLSX.utils.json_to_sheet(supData);
      if (supData.length > 0) {
        ws["!cols"] = Object.keys(supData[0]).map(() => ({ wch: 18 }));
      }
      XLSX.utils.book_append_sheet(wb, ws, "Suppliers Ledger");
      XLSX.writeFile(wb, `Reports_Excel_Suppliers_Report_${period}_${isoDate(new Date())}.xlsx`);
      triggerToast("📁 Suppliers Ledger Excel report ready! Saved into Reports/Excel/ folder.");
    } else if (activeTab === "payroll") {
      const payData = payrollStats.map(p => ({
        "Staff ID": p.id,
        "Name": p.name,
        "Role": p.role,
        [`Base Salary (${currencySymbol})`]: p.salary,
        "Presents": p.presents,
        "Lates": p.lates,
        "Absents": p.absents,
        "Leaves": p.leaves,
        "Attendance Rate %": `${p.attendanceRate.toFixed(0)}%`,
      }));
      const ws = XLSX.utils.json_to_sheet(payData);
      if (payData.length > 0) {
        ws["!cols"] = Object.keys(payData[0]).map(() => ({ wch: 18 }));
      }
      XLSX.utils.book_append_sheet(wb, ws, "Payroll & Attendance");
      XLSX.writeFile(wb, `Reports_Excel_Payroll_Report_${period}_${isoDate(new Date())}.xlsx`);
      triggerToast("📁 Payroll & Attendance Excel report ready! Saved into Reports/Excel/ folder.");
    }
  };

  const handleImageExport = async () => {
    if (!reportContainerRef.current) return;
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const canvas = await html2canvas(reportContainerRef.current, {
        backgroundColor: "#000000",
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      const link = document.createElement("a");
      link.download = `Reports_JPG_${activeTab.toUpperCase()}_Report_${period}_${isoDate(new Date())}.jpg`;
      link.href = dataUrl;
      link.click();
      triggerToast("📁 Report image ready! Saved into Reports/JPG/ folder.");
    } catch (err) {
      console.error("Image export failed", err);
      triggerToast("❌ Image export failed.");
    }
  };

  const handlePdfExport = () => {
    if (!reportContainerRef.current) return;

    // Create a clone to remove max-height and inner scrollbar constraints
    const cloned = reportContainerRef.current.cloneNode(true) as HTMLElement;
    const scrollContainers = cloned.querySelectorAll('.overflow-x-auto, .overflow-y-auto, [class*="max-h-"]');
    scrollContainers.forEach(el => {
      el.classList.remove('overflow-x-auto', 'overflow-y-auto', 'max-h-[500px]');
      (el as HTMLElement).style.overflow = 'visible';
      (el as HTMLElement).style.maxHeight = 'none';
      (el as HTMLElement).style.height = 'auto';
    });

    const printContent = cloned.innerHTML;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      triggerToast("❌ Popup blocked! Please allow popups to export PDF.");
      return;
    }

    const title = `MT UniPOS - ${activeTab.toUpperCase()} Report (${PERIOD_LABELS[period]})`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=JetBrains+Mono:wght@400;700&display=swap');
            @page {
              size: A4 portrait;
              margin: 10mm 12mm;
            }
            body {
              font-family: 'Outfit', sans-serif;
              background-color: #ffffff !important;
              color: #111827 !important;
              padding: 0 !important;
              margin: 0 !important;
              font-size: 10pt;
            }
            .bg-brand-dark-surface, .bg-brand-dark-surface\\/30, .bg-brand-dark-surface\\/40, .bg-[#0d0d0d], .bg-black {
              background-color: #ffffff !important;
              background: #ffffff !important;
            }
            .border-brand-dark-border, .border-brand-dark-border\\/60, .border-brand-dark-border\\/40, .border-brand-dark-border\\/30 {
              border-color: #e5e7eb !important;
            }
            .text-white, .text-gray-100, .text-gray-300, .text-gray-400 {
              color: #111827 !important;
            }
            .text-gray-500, .text-gray-600 {
              color: #4b5563 !important;
            }
            .text-brand-sky {
              color: #0284c7 !important;
            }
            .text-emerald-400 {
              color: #059669 !important;
            }
            .text-red-400 {
              color: #dc2626 !important;
            }
            .text-amber-400 {
              color: #d97706 !important;
            }
            .text-purple-400 {
              color: #7c3aed !important;
            }
            .font-mono {
              font-family: 'JetBrains Mono', monospace !important;
            }
            .overflow-x-auto, .overflow-y-auto, [class*="max-h-"], [class*="overflow-"] {
              overflow: visible !important;
              max-height: none !important;
              height: auto !important;
            }
            table {
              width: 100% !important;
              border-collapse: collapse !important;
              table-layout: auto !important;
            }
            th, td {
              padding: 8px 10px !important;
              border-bottom: 1px solid #e5e7eb !important;
              word-break: break-word !important;
              white-space: normal !important;
            }
            .no-print, button, input, select {
              display: none !important;
            }
            .page-break-avoid {
              page-break-inside: avoid !important;
            }
          </style>
        </head>
        <body>
          <div class="flex justify-between items-center border-b-2 border-gray-200 pb-5 mb-6 p-4">
            <div class="flex items-center gap-3">
              <img src="/logo-report.png" style="height:55px;width:auto;object-fit:contain;" alt="MT UniPOS Logo" />
              <div>
                <h1 class="text-2xl font-black uppercase tracking-tight text-gray-900">${title}</h1>
                <p class="text-xs text-gray-500 mt-1">Branch: ${currentBranch} · Period: ${PERIOD_LABELS[period]} · Save Destination: Reports/PDF/</p>
              </div>
            </div>
            <div class="text-right text-[10px] text-gray-400 font-mono">
              Printed: ${new Date().toLocaleString()}<br/>
              MT UniPOS ERP System
            </div>
          </div>
          <div class="p-4">
            ${printContent}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    triggerToast("📁 A4 PDF Report ready! Save inside Reports/PDF/ subfolder.");
  };

  return (
    <div className="flex min-h-screen bg-black text-gray-100 font-sans">
      <ClientSidebar />

      {toast && (
        <div className="fixed top-4 right-4 bg-emerald-500/95 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-2xl z-50 flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={14} /> {toast}
        </div>
      )}

      <main className="flex-grow p-6 sm:p-8 space-y-6 overflow-y-auto max-h-screen">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center border-b border-brand-dark-border/60 pb-4">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <BarChart3 size={20} className="text-brand-sky" /> Analytics & Reports
            </h1>
            <p className="text-[10px] text-gray-500 mt-0.5">
              {PERIOD_LABELS[period]} · {filteredSales.length} transactions · {currentBranch}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Period selector */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-brand-dark-surface border border-brand-dark-border p-1 rounded-lg flex gap-1 text-[10px]">
                {(["today", "week", "month", "quarter", "custom"] as const).map(p => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 rounded font-bold uppercase tracking-wide transition ${
                      period === p ? "bg-brand-sky text-black font-black" : "text-gray-400 hover:text-white"
                    }`}>
                    {PERIOD_LABELS[p]}
                  </button>
                ))}
              </div>

              {/* Custom Date Range Inputs */}
              {period === "custom" && (
                <div className="flex items-center gap-1.5 bg-brand-dark-surface border border-brand-dark-border p-1 rounded-lg text-xs font-mono">
                  <input 
                    type="date" 
                    value={customFromDate} 
                    onChange={e => setCustomFromDate(e.target.value)}
                    className="bg-black text-white px-2 py-1 rounded border border-brand-dark-border focus:outline-none focus:border-brand-sky text-[10px]"
                    style={{ colorScheme: "dark" }}
                  />
                  <span className="text-gray-500 text-[10px]">to</span>
                  <input 
                    type="date" 
                    value={customToDate} 
                    onChange={e => setCustomToDate(e.target.value)}
                    className="bg-black text-white px-2 py-1 rounded border border-brand-dark-border focus:outline-none focus:border-brand-sky text-[10px]"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              )}
            </div>

            {/* Exports button group */}
            <div className="flex items-center gap-1.5">
              <button onClick={handleExcelExport}
                className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[11px] px-3.5 py-2.5 rounded-lg shadow-lg transition">
                <FileSpreadsheet size={13} /> Excel
              </button>
              <button onClick={handleImageExport}
                className="flex items-center gap-1 bg-blue-500 hover:bg-blue-400 text-white font-black text-[11px] px-3.5 py-2.5 rounded-lg shadow-lg transition">
                <Image size={13} /> JPG
              </button>
              <button onClick={handlePdfExport}
                className="flex items-center gap-1 bg-purple-500 hover:bg-purple-400 text-white font-black text-[11px] px-3.5 py-2.5 rounded-lg shadow-lg transition">
                <Printer size={13} /> PDF (A4)
              </button>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 border-b border-brand-dark-border/40 overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5">
          {(["overview", "pl", "sales", "inventory", "expenses", "employees", "customers", "suppliers", "payroll"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider transition border-b-2 -mb-px shrink-0 ${
                activeTab === tab
                  ? "border-brand-sky text-brand-sky"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}>
              {tab === "overview" ? "Overview" : tab === "pl" ? "📈 P/L Statement" : tab === "sales" ? "Sales" : tab === "inventory" ? "Inventory" : tab === "expenses" ? "Expenses" : tab === "employees" ? "Employees" : tab === "customers" ? "Customers" : tab === "suppliers" ? "Suppliers" : "Payroll"}
            </button>
          ))}
        </div>

        {/* ── Active Tab Container (Ref for exports) ── */}
        <div ref={reportContainerRef} className="space-y-6 bg-black p-1 rounded-2xl">

          {/* ══════════════════════════════════════════════════════════════════
              OVERVIEW TAB
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div className="space-y-6">

              {/* KPI Cards row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Revenue", val: totalRevenue, color: "text-emerald-400", icon: TrendingUp, bg: "bg-emerald-500/10 border-emerald-500/25" },
                  { label: "Gross Profit", val: grossProfit, color: grossProfit >= 0 ? "text-brand-sky" : "text-red-400", icon: DollarSign, bg: "bg-brand-sky/10 border-brand-sky/25" },
                  { label: "Net Profit", val: netProfit, color: netProfit >= 0 ? "text-purple-400" : "text-red-400", icon: ArrowUpRight, bg: "bg-purple-500/10 border-purple-500/25" },
                  { label: "Total Expenses", val: totalExpAmt, color: "text-red-400", icon: TrendingDown, bg: "bg-red-500/10 border-red-500/25" },
                ].map(k => (
                  <div key={k.label} className={`border rounded-2xl p-4 space-y-3 ${k.bg} page-break-avoid`}>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">{k.label}</span>
                      <k.icon size={14} className={k.color} />
                    </div>
                    <div className={`text-lg font-black font-mono ${k.color}`}>
                      {currencySymbol} {Math.abs(k.val).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <div className="no-print">
                      <Sparkline values={last7} color={k.color.replace("text-", "").replace("-400", "")} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Margin + Tax strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Gross Margin", val: `${grossMargin.toFixed(1)}%`, color: "text-emerald-400" },
                  { label: "Tax Collected", val: `${currencySymbol} ${totalTax.toLocaleString(undefined,{maximumFractionDigits:0})}`, color: "text-red-400" },
                  { label: "Discounts Given", val: `${currencySymbol} ${totalDiscount.toLocaleString(undefined,{maximumFractionDigits:0})}`, color: "text-amber-400" },
                  { label: "Avg Sale Value", val: `${currencySymbol} ${filteredSales.length ? Math.round(totalRevenue / filteredSales.length).toLocaleString() : 0}`, color: "text-brand-sky" },
                ].map(s => (
                  <div key={s.label} className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl p-3 text-center page-break-avoid">
                    <div className={`text-base font-black font-mono ${s.color}`}>{s.val}</div>
                    <div className="text-[9px] text-gray-500 uppercase tracking-wide mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Cash Flow Audit */}
              <div className="bg-brand-dark-surface/40 border border-brand-sky/20 rounded-2xl p-5 space-y-4 page-break-avoid">
                <div className="flex justify-between items-center border-b border-brand-dark-border pb-3">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <DollarSign size={14} className="text-emerald-400" />
                    Daily Cash Flow Audit
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                    Net Cash In Hand: <span className="text-emerald-400 font-black">{currencySymbol} {netCashInHand.toLocaleString()}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  {/* Inflows */}
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 space-y-2">
                    <div className="text-[10px] font-black uppercase text-emerald-400 tracking-wider flex items-center justify-between">
                      <span>📥 Total Cash Inflow</span>
                      <span>{currencySymbol} {totalInflow.toLocaleString()}</span>
                    </div>
                    <div className="space-y-1 text-[11px] pt-1 border-t border-emerald-500/20 text-gray-300">
                      <div className="flex justify-between"><span>Direct Cash Sales:</span><span className="font-bold">{currencySymbol} {cashSalesInflow.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>Credit Dues Recovery Payments:</span><span className="font-bold text-emerald-400">+{currencySymbol} {duesRecoveredInflow.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>Card & Online Receipts:</span><span className="font-bold">{currencySymbol} {cardBankInflow.toLocaleString()}</span></div>
                    </div>
                  </div>

                  {/* Outflows */}
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 space-y-2">
                    <div className="text-[10px] font-black uppercase text-red-400 tracking-wider flex items-center justify-between">
                      <span>📤 Total Outflow & Expenses</span>
                      <span>{currencySymbol} {totalOutflow.toLocaleString()}</span>
                    </div>
                    <div className="space-y-1 text-[11px] pt-1 border-t border-red-500/20 text-gray-300">
                      <div className="flex justify-between"><span>Cash Sales Returns / Refunds:</span><span className="font-bold text-red-400">-{currencySymbol} {cashReturnsOutflow.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>Operating Expenses:</span><span className="font-bold text-red-400">-{currencySymbol} {totalExpAmt.toLocaleString()}</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue chart + Payment breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Daily Revenue Bar Chart */}
                <div className="lg:col-span-2 bg-brand-dark-surface/30 border border-brand-dark-border rounded-2xl p-5 page-break-avoid">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <BarChart3 size={13} className="text-brand-sky" /> Daily Revenue
                  </h3>
                  <div className="no-print">
                    {dailyRevenue.length > 0 ? (
                      <BarChart data={dailyRevenue} color="#38bdf8" height={100} />
                    ) : (
                      <div className="h-24 flex items-center justify-center text-gray-600 text-xs">No sales in this period</div>
                    )}
                  </div>
                </div>

                {/* Payment method breakdown */}
                <div className="bg-brand-dark-surface/30 border border-brand-dark-border rounded-2xl p-5 page-break-avoid">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <CreditCard size={13} className="text-purple-400" /> Payment Mix
                  </h3>
                  {paymentBreakdown.length === 0
                    ? <div className="text-center py-8 text-gray-600 text-xs">No data</div>
                    : (
                    <div className="space-y-2.5">
                      {paymentBreakdown.map(([method, amount]) => {
                        const pct = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;
                        return (
                          <div key={method}>
                            <div className="flex justify-between text-[10px] mb-1">
                              <span className="font-bold text-gray-300" style={{ color: pmColors[method] || "#9ca3af" }}>{method}</span>
                              <span className="font-mono text-gray-300">{pct.toFixed(0)}%</span>
                            </div>
                            <div className="h-1.5 bg-brand-dark-border rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, backgroundColor: pmColors[method] || "#9ca3af" }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Top Products + Customer Dues */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Top selling products */}
                <div className="bg-brand-dark-surface/30 border border-brand-dark-border rounded-2xl p-5 page-break-avoid">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Package size={13} className="text-amber-400" /> Top Selling Products
                  </h3>
                  {topProducts.length === 0
                    ? <div className="text-center py-8 text-gray-600 text-xs">No sales data</div>
                    : (
                    <div className="space-y-2">
                      {topProducts.map((p, i) => {
                        const pct = topProducts[0].revenue > 0 ? (p.revenue / topProducts[0].revenue) * 100 : 0;
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-[9px] font-black font-mono text-gray-500 w-4 shrink-0">#{i + 1}</span>
                            <div className="flex-grow min-w-0">
                              <div className="text-[10px] font-bold text-white truncate">{p.name}</div>
                              <div className="h-1 bg-brand-dark-border rounded-full mt-1">
                                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-[10px] font-black font-mono text-brand-sky">{currencySymbol} {Math.round(p.revenue).toLocaleString()}</div>
                              <div className="text-[8px] text-gray-600">{p.qty} sold</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Customer dues */}
                <div className="bg-brand-dark-surface/30 border border-brand-dark-border rounded-2xl p-5 page-break-avoid">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <AlertTriangle size={13} className="text-red-400" /> Customer Overdue Dues
                  </h3>
                  {overdueCustomers.length === 0
                    ? <div className="text-center py-8 text-gray-600 text-xs">No outstanding dues 🎉</div>
                    : (
                    <div className="space-y-2">
                      {overdueCustomers.map(c => (
                        <div key={c.id} className="flex items-center justify-between py-2 border-b border-brand-dark-border/30 last:border-0">
                          <div>
                            <div className="text-[11px] font-bold text-white">{c.name}</div>
                            <div className="text-[9px] text-gray-500 font-mono">{c.mobile}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[11px] font-black text-red-400 font-mono">
                              {currencySymbol} {c.creditBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </div>
                            <div className="text-[8px] text-gray-600">overdue</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              PROFIT & LOSS FINANCIAL STATEMENT TAB
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === "pl" && (
            <div className="space-y-6">
              {/* Executive P/L Headline Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 space-y-2">
                  <div className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Net Operating Revenue</div>
                  <div className="text-2xl font-black font-mono text-white">
                    {currencySymbol} {plSummary.netOperatingIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-[9px] text-gray-400">Completed Sales + Recoveries - Returns</div>
                </div>

                <div className="bg-brand-sky/10 border border-brand-sky/30 rounded-2xl p-5 space-y-2">
                  <div className="text-[10px] font-black uppercase text-brand-sky tracking-wider">Gross Operating Profit</div>
                  <div className="text-2xl font-black font-mono text-brand-sky">
                    {currencySymbol} {plSummary.grossProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-[9px] text-gray-400">Margin: {plSummary.grossMargin.toFixed(1)}% (Net Income - COGS)</div>
                </div>

                <div className={`border rounded-2xl p-5 space-y-2 ${plSummary.netExecutiveProfit >= 0 ? "bg-purple-500/10 border-purple-500/30 text-purple-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
                  <div className="text-[10px] font-black uppercase tracking-wider">Net Executive Profit</div>
                  <div className="text-2xl font-black font-mono text-white">
                    {currencySymbol} {plSummary.netExecutiveProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-[9px] text-gray-300">Bottom-line Profit after Operating Expenses</div>
                </div>
              </div>

              {/* Detailed P/L Ledger Statement Table */}
              <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-2xl p-6 space-y-6 page-break-avoid">
                <div className="flex justify-between items-center border-b border-brand-dark-border/60 pb-4">
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                      <TrendingUp size={18} className="text-brand-sky" /> Profit & Loss Statement (P/L Ledger)
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-1">Branch: {currentBranch} · Period: {PERIOD_LABELS[period]}</p>
                  </div>
                  <div className="text-right text-[10px] font-mono text-gray-500">
                    Auto Generated Report<br />
                    MT UniPOS Financial Engine
                  </div>
                </div>

                <div className="space-y-6 text-xs font-mono">
                  {/* 1. Revenue & Sales Income */}
                  <div className="space-y-2">
                    <div className="text-xs font-black uppercase text-emerald-400 border-b border-emerald-500/30 pb-1.5 flex justify-between">
                      <span>1. OPERATING REVENUE & INCOME</span>
                      <span>AMOUNT ({currencySymbol})</span>
                    </div>
                    <div className="flex justify-between py-1 text-gray-300">
                      <span>Completed Gross Sales Revenue</span>
                      <span className="font-bold">+{currencySymbol} {plSummary.completedRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 text-emerald-400">
                      <span>Dues Recoveries Received (+)</span>
                      <span className="font-bold">+{currencySymbol} {plSummary.duesRecoveredTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 text-red-400">
                      <span>Sales Returns & Refunds (-)</span>
                      <span className="font-bold">-{currencySymbol} {plSummary.returnsTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-brand-dark-border font-black text-white text-xs">
                      <span>TOTAL NET OPERATING REVENUE</span>
                      <span className="text-emerald-400">{currencySymbol} {plSummary.netOperatingIncome.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* 2. Cost of Sales */}
                  <div className="space-y-2">
                    <div className="text-xs font-black uppercase text-brand-sky border-b border-brand-sky/30 pb-1.5 flex justify-between">
                      <span>2. COST OF SALES (COGS)</span>
                      <span>AMOUNT ({currencySymbol})</span>
                    </div>
                    <div className="flex justify-between py-1 text-gray-300">
                      <span>Cost of Inventory Sold (COGS) (-)</span>
                      <span className="font-bold text-red-400">-{currencySymbol} {plSummary.cogsTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-brand-dark-border font-black text-white text-xs">
                      <span>GROSS OPERATING PROFIT (Margin: {plSummary.grossMargin.toFixed(1)}%)</span>
                      <span className="text-brand-sky">{currencySymbol} {plSummary.grossProfit.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* 3. Operating Expenses */}
                  <div className="space-y-2">
                    <div className="text-xs font-black uppercase text-red-400 border-b border-red-500/30 pb-1.5 flex justify-between">
                      <span>3. OPERATING EXPENSES (OPEX)</span>
                      <span>AMOUNT ({currencySymbol})</span>
                    </div>
                    {expCats.length === 0 ? (
                      <div className="py-2 text-gray-500 text-[10px]">No expenses recorded in this period</div>
                    ) : (
                      expCats.map(([cat, amt]) => (
                        <div key={cat} className="flex justify-between py-1 text-gray-300">
                          <span>{cat}</span>
                          <span className="font-bold text-red-400">-{currencySymbol} {amt.toLocaleString()}</span>
                        </div>
                      ))
                    )}
                    <div className="flex justify-between py-2 border-t border-brand-dark-border font-black text-white text-xs">
                      <span>TOTAL OPERATING EXPENSES</span>
                      <span className="text-red-400">-{currencySymbol} {plSummary.totalExpenses.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* 4. Credit & Receivables Ledger */}
                  <div className="space-y-2 bg-black/40 p-4 rounded-xl border border-brand-dark-border">
                    <div className="text-xs font-black uppercase text-amber-400 border-b border-amber-500/30 pb-1.5 flex justify-between">
                      <span>4. CREDIT & RECEIVABLES LEDGER POSITION</span>
                      <span>STATUS</span>
                    </div>
                    <div className="flex justify-between py-1 text-gray-300">
                      <span>On-Credit Sales Issued in Period</span>
                      <span className="font-bold text-amber-400">{currencySymbol} {plSummary.creditSalesIssuedTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 text-gray-300">
                      <span>Total Accounts Receivable (Outstanding Customer Dues)</span>
                      <span className="font-bold text-red-400">{currencySymbol} {plSummary.totalOutstandingDues.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 text-gray-300">
                      <span>Customer Store Wallet Balances Held</span>
                      <span className="font-bold text-brand-sky">{currencySymbol} {plSummary.totalWalletBalances.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* 5. Bottom Line Executive Profit */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/30 via-black to-emerald-900/30 border border-purple-500/40 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider text-gray-300">NET EXECUTIVE BOTTOM-LINE PROFIT / (LOSS)</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">Calculated as: Gross Operating Profit - Total Operating Expenses</div>
                    </div>
                    <div className="text-2xl font-black font-mono text-emerald-400">
                      {currencySymbol} {plSummary.netExecutiveProfit.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              SALES TAB — Itemized & Summary transactions with filters
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === "sales" && (
            <div className="space-y-4">
              {/* Sales Filter Bar */}
              <div className="bg-brand-dark-surface/40 border border-brand-dark-border p-4 rounded-2xl flex flex-col lg:flex-row gap-3 justify-between items-start lg:items-center no-print">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Filter By:</span>
                    <div className="bg-black border border-brand-dark-border p-1 rounded-lg flex gap-1 text-[10px]">
                      <button 
                        onClick={() => setSalesFilterType("all")}
                        className={`px-3 py-1 rounded font-bold uppercase ${salesFilterType === "all" ? "bg-brand-sky text-black font-black" : "text-gray-400 hover:text-white"}`}
                      >
                        All Sales
                      </button>
                      <button 
                        onClick={() => setSalesFilterType("customer")}
                        className={`px-3 py-1 rounded font-bold uppercase ${salesFilterType === "customer" ? "bg-brand-sky text-black font-black" : "text-gray-400 hover:text-white"}`}
                      >
                        Customer-wise
                      </button>
                      <button 
                        onClick={() => setSalesFilterType("staff")}
                        className={`px-3 py-1 rounded font-bold uppercase ${salesFilterType === "staff" ? "bg-brand-sky text-black font-black" : "text-gray-400 hover:text-white"}`}
                      >
                        Staff-wise
                      </button>
                    </div>
                  </div>

                  {/* Format Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Format:</span>
                    <div className="bg-black border border-brand-dark-border p-1 rounded-lg flex gap-1 text-[10px]">
                      <button 
                        onClick={() => setSalesDetailLevel("itemized")}
                        className={`px-3 py-1 rounded font-bold uppercase ${salesDetailLevel === "itemized" ? "bg-purple-500 text-white font-black" : "text-gray-400 hover:text-white"}`}
                      >
                        📦 Itemized Products
                      </button>
                      <button 
                        onClick={() => setSalesDetailLevel("summary")}
                        className={`px-3 py-1 rounded font-bold uppercase ${salesDetailLevel === "summary" ? "bg-purple-500 text-white font-black" : "text-gray-400 hover:text-white"}`}
                      >
                        📋 Summary Table
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dropdown Filters */}
                <div className="flex items-center gap-2 w-full lg:w-auto">
                  {salesFilterType === "customer" && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Customer:</label>
                      <select 
                        value={selectedCustomerFilter}
                        onChange={e => setSelectedCustomerFilter(e.target.value)}
                        className="bg-black border border-brand-sky/40 text-white text-xs p-2 rounded-lg font-mono focus:outline-none w-full sm:w-auto"
                      >
                        <option value="ALL">All Customers</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.name}>{c.name} ({c.customerNo})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {salesFilterType === "staff" && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Staff / Cashier:</label>
                      <select 
                        value={selectedStaffFilter}
                        onChange={e => setSelectedStaffFilter(e.target.value)}
                        className="bg-black border border-brand-sky/40 text-white text-xs p-2 rounded-lg font-mono focus:outline-none w-full sm:w-auto"
                      >
                        <option value="ALL">All Staff</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.name}>{emp.name} ({emp.role})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Transactions Title Header */}
              <div className="bg-brand-dark-surface/40 border border-brand-dark-border p-4 rounded-2xl flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    {salesFilterType === "customer" && selectedCustomerFilter !== "ALL" 
                      ? `Customer Purchase History: ${selectedCustomerFilter}` 
                      : salesFilterType === "staff" && selectedStaffFilter !== "ALL" 
                      ? `Staff Sales & Returns Log: ${selectedStaffFilter}` 
                      : "Sales Transactions History"}
                  </h3>
                  <p className="text-[9px] text-gray-500 mt-0.5">{filteredSales.length} transactions in {PERIOD_LABELS[period]}</p>
                </div>
                <div className="font-mono text-xs text-right">
                  <span className="text-gray-400">Total Value: </span>
                  <span className="text-emerald-400 font-black">{currencySymbol} {totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              </div>

              {/* ── ITEMIZED PRODUCTS BREAKDOWN VIEW ── */}
              {salesDetailLevel === "itemized" ? (
                <div className="space-y-4">
                  {filteredSales.length === 0 ? (
                    <div className="bg-brand-dark-surface/30 border border-brand-dark-border rounded-2xl p-12 text-center text-gray-600 font-mono text-xs">
                      No transactions match your selected filter
                    </div>
                  ) : (
                    filteredSales.map(s => (
                      <div key={s.id} className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-2xl p-4 space-y-3 page-break-avoid">
                        {/* Transaction Header Info */}
                        <div className="flex flex-wrap justify-between items-center border-b border-brand-dark-border/60 pb-3 text-xs font-mono gap-2">
                          <div className="flex items-center gap-3">
                            <span className="text-brand-sky font-bold text-sm">{s.receiptNumber}</span>
                            <span className="text-gray-400 text-[11px]">{new Date(s.date).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-[11px]">
                            <span className="text-gray-300"><span className="text-gray-500 uppercase">Customer:</span> <strong className="text-white">{s.customerName}</strong></span>
                            <span className="text-gray-300"><span className="text-gray-500 uppercase">Cashier:</span> <strong className="text-white">{s.cashierName}</strong></span>
                            <span className="px-2 py-0.5 rounded font-bold text-[10px]" style={{ color: pmColors[s.paymentMethod] || "#9ca3af", backgroundColor: (pmColors[s.paymentMethod] || "#9ca3af") + "20" }}>
                              {s.paymentMethod}
                            </span>
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              s.status === "Completed" ? "bg-emerald-500/15 text-emerald-400"
                              : s.status === "Returned" ? "bg-amber-500/15 text-amber-400"
                              : "bg-red-500/15 text-red-400"
                            }`}>{s.status}</span>
                          </div>
                        </div>

                        {/* Purchased Items Table */}
                        <div className="w-full">
                          <table className="w-full text-left text-xs font-mono border-collapse">
                            <thead>
                              <tr className="text-gray-500 text-[10px] uppercase border-b border-brand-dark-border/40">
                                <th className="pb-2">Product Item</th>
                                <th className="pb-2 text-center">Qty Purchased / Returned</th>
                                <th className="pb-2 text-right">Unit Sale Price</th>
                                <th className="pb-2 text-right">Total Line Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-dark-border/20 text-[11px]">
                              {(s.items || []).map((item, idx) => (
                                <tr key={idx} className="hover:bg-black/20">
                                  <td className="py-2 text-white font-sans font-bold">{item.productName || item.name}</td>
                                  <td className="py-2 text-center font-bold text-gray-300">{item.qty} {item.unit || "units"}</td>
                                  <td className="py-2 text-right text-gray-400">{currencySymbol} {(item.price || item.unitPrice || 0).toLocaleString()}</td>
                                  <td className="py-2 text-right font-bold text-emerald-400">{currencySymbol} {((item.qty || 1) * (item.price || item.unitPrice || 0)).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Transaction Footer Summary */}
                        <div className="flex justify-between items-center pt-2 border-t border-brand-dark-border/40 text-[11px] font-mono text-gray-400">
                          <div className="flex gap-4 text-[10px]">
                            <span>Subtotal: {currencySymbol} {s.subtotal.toFixed(0)}</span>
                            <span>Tax: <strong className="text-red-400">{currencySymbol} {s.tax.toFixed(0)}</strong></span>
                            <span>Discount: <strong className="text-amber-400">{currencySymbol} {s.discount.toFixed(0)}</strong></span>
                          </div>
                          <div className="text-xs font-black text-white">
                            Receipt Net Total: <span className="text-brand-sky font-mono text-sm">{currencySymbol} {s.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                /* ── SUMMARY TABLE VIEW ── */
                <div className="bg-brand-dark-surface/30 border border-brand-dark-border rounded-2xl overflow-hidden page-break-avoid">
                  <div className="w-full">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 bg-[#0d0d0d]">
                        <tr className="border-b border-brand-dark-border text-gray-500 font-mono">
                          <th className="p-3 font-semibold">Receipt #</th>
                          <th className="p-3 font-semibold">Date & Time</th>
                          <th className="p-3 font-semibold">Customer</th>
                          <th className="p-3 font-semibold">Cashier</th>
                          <th className="p-3 font-semibold">Method</th>
                          <th className="p-3 font-semibold text-right">Tax</th>
                          <th className="p-3 font-semibold text-right">Discount</th>
                          <th className="p-3 font-semibold text-right">Total</th>
                          <th className="p-3 font-semibold text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-dark-border/30 font-mono text-[11px]">
                        {filteredSales.length === 0 ? (
                          <tr><td colSpan={9} className="p-12 text-center text-gray-600">No transactions match your selected filter</td></tr>
                        ) : filteredSales.map(s => (
                          <tr key={s.id} className="hover:bg-brand-dark-surface/40 transition">
                            <td className="p-3 text-brand-sky font-bold">{s.receiptNumber}</td>
                            <td className="p-3 text-gray-400">{new Date(s.date).toLocaleString("en-PK", { dateStyle: "short", timeStyle: "short" })}</td>
                            <td className="p-3 text-white font-sans">{s.customerName}</td>
                            <td className="p-3 text-gray-400 font-sans">{s.cashierName}</td>
                            <td className="p-3">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                                style={{ color: pmColors[s.paymentMethod] || "#9ca3af", backgroundColor: (pmColors[s.paymentMethod] || "#9ca3af") + "20" }}>
                                {s.paymentMethod}
                              </span>
                            </td>
                            <td className="p-3 text-right text-red-400">{currencySymbol} {s.tax.toFixed(0)}</td>
                            <td className="p-3 text-right text-amber-400">{currencySymbol} {s.discount.toFixed(0)}</td>
                            <td className="p-3 text-right text-white font-black">{currencySymbol} {s.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                            <td className="p-3 text-center">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                s.status === "Completed" ? "bg-emerald-500/15 text-emerald-400"
                                : s.status === "Returned" ? "bg-amber-500/15 text-amber-400"
                                : "bg-red-500/15 text-red-400"
                              }`}>{s.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              INVENTORY TAB
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === "inventory" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Total SKUs", val: products.length, color: "text-brand-sky" },
                  { label: "Stock Value", val: `${currencySymbol} ${products.reduce((a, p) => a + p.costPrice * p.stock, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "text-emerald-400" },
                  { label: "Low Stock Items", val: products.filter(p => p.stock <= p.minStock).length, color: "text-red-400" },
                  { label: "Out of Stock", val: products.filter(p => p.stock === 0).length, color: "text-red-500" },
                ].map(s => (
                  <div key={s.label} className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl p-3 text-center page-break-avoid">
                    <div className={`text-base font-black font-mono ${s.color}`}>{s.val}</div>
                    <div className="text-[9px] text-gray-500 uppercase tracking-wide mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-brand-dark-surface/30 border border-brand-dark-border rounded-2xl overflow-hidden page-break-avoid">
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-[#0d0d0d]">
                      <tr className="border-b border-brand-dark-border text-gray-500 font-mono">
                        <th className="p-3">SKU</th><th className="p-3">Product</th>
                        <th className="p-3">Category</th><th className="p-3 text-right">Cost</th>
                        <th className="p-3 text-right">Stock</th><th className="p-3 text-right">Value</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-dark-border/30 font-mono text-[11px]">
                      {products.map(p => (
                        <tr key={p.id} className="hover:bg-brand-dark-surface/40 transition">
                          <td className="p-3 text-purple-400 font-bold">{p.sku}</td>
                          <td className="p-3 text-white font-sans font-bold">{p.name}</td>
                          <td className="p-3 text-gray-400">{p.category}</td>
                          <td className="p-3 text-right">{currencySymbol} {p.costPrice.toLocaleString()}</td>
                          <td className="p-3 text-right text-brand-sky">{p.stock} {p.unit}</td>
                          <td className="p-3 text-right text-white font-bold">{currencySymbol} {(p.costPrice * p.stock).toLocaleString()}</td>
                          <td className="p-3 text-center">
                            {p.stock === 0
                              ? <span className="text-[9px] bg-red-500/15 text-red-500 px-1.5 py-0.5 rounded font-bold">Out</span>
                              : p.stock <= p.minStock
                              ? <span className="text-[9px] bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded font-bold">Low</span>
                              : <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-bold">OK</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              EXPENSES TAB
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === "expenses" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Expense breakdown bar chart */}
                <div className="lg:col-span-2 bg-brand-dark-surface/30 border border-brand-dark-border rounded-2xl p-5 page-break-avoid">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Expense by Category</h3>
                  <div className="no-print">
                    {expCats.length > 0
                      ? <BarChart data={expCats.map(([l, v]) => ({ label: l.slice(0, 8), value: v }))} color="#f87171" height={100} />
                      : <div className="h-24 flex items-center justify-center text-gray-600 text-xs">No expenses this period</div>
                    }
                  </div>
                </div>
                <div className="bg-brand-dark-surface/30 border border-brand-dark-border rounded-2xl p-5 space-y-3 page-break-avoid">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Category Totals</h3>
                  {expCats.length === 0
                    ? <div className="text-center py-6 text-gray-600 text-xs">No data</div>
                    : expCats.map(([cat, amt]) => (
                    <div key={cat} className="flex justify-between text-[11px]">
                      <span className="text-gray-400 font-sans">{cat}</span>
                      <span className="text-red-400 font-black font-mono">{currencySymbol} {amt.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t border-brand-dark-border/40 pt-2 flex justify-between font-black text-xs">
                    <span className="text-white">Total</span>
                    <span className="text-red-400 font-mono">{currencySymbol} {totalExpAmt.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="bg-brand-dark-surface/30 border border-brand-dark-border rounded-2xl overflow-hidden page-break-avoid">
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-[#0d0d0d]">
                      <tr className="border-b border-brand-dark-border text-gray-500 font-mono">
                        <th className="p-3">Voucher ID</th><th className="p-3">Date</th>
                        <th className="p-3">Category</th><th className="p-3">Description</th>
                        <th className="p-3">Payment</th><th className="p-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-dark-border/30 font-mono text-[11px]">
                      {filteredExpenses.length === 0
                        ? <tr><td colSpan={6} className="p-12 text-center text-gray-600">No expenses this period</td></tr>
                        : filteredExpenses.map(e => (
                        <tr key={e.id} className="hover:bg-brand-dark-surface/40 transition">
                          <td className="p-3 text-red-400 font-bold">{e.id}</td>
                          <td className="p-3 text-gray-400">{e.date}</td>
                          <td className="p-3 text-white font-sans font-bold">{e.category}</td>
                          <td className="p-3 text-gray-500 font-sans">{e.description}</td>
                          <td className="p-3 text-gray-400">{e.paymentMethod}</td>
                          <td className="p-3 text-right text-white font-bold">{currencySymbol} {e.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              EMPLOYEES PERFORMANCE TAB
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === "employees" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: "Active Staff Roster", val: employees.filter(e => e.status === "Active").length, color: "text-brand-sky" },
                  { label: "Roster Total Sales", val: filteredSales.length + " invoices", color: "text-purple-400" },
                  { label: "Top Performer", val: topSalesperson, color: "text-emerald-400" },
                ].map(s => (
                  <div key={s.label} className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl p-4 text-center page-break-avoid">
                    <div className={`text-sm font-black font-mono truncate ${s.color}`}>{s.val}</div>
                    <div className="text-[9px] text-gray-500 uppercase tracking-wide mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-brand-dark-surface/30 border border-brand-dark-border rounded-2xl overflow-hidden page-break-avoid">
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-[#0d0d0d]">
                      <tr className="border-b border-brand-dark-border text-gray-500 font-mono">
                        <th className="p-3 font-semibold">Staff ID</th>
                        <th className="p-3 font-semibold">Name & Role</th>
                        <th className="p-3 font-semibold">Contact Mobile</th>
                        <th className="p-3 font-semibold text-right">Transactions Count</th>
                        <th className="p-3 font-semibold text-right">Revenue Generated</th>
                        <th className="p-3 font-semibold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-dark-border/30 font-mono text-[11px]">
                      {employeeStats.map(emp => (
                        <tr key={emp.id} className="hover:bg-brand-dark-surface/40 transition">
                          <td className="p-3 text-brand-sky font-bold">{emp.id}</td>
                          <td className="p-3">
                            <div className="text-white font-bold font-sans">{emp.name}</div>
                            <div className="text-[9px] text-gray-500 font-sans">{emp.role}</div>
                          </td>
                          <td className="p-3 text-gray-300 font-sans">{emp.phone}</td>
                          <td className="p-3 text-right text-purple-400 font-bold">{emp.salesCount} invoices</td>
                          <td className="p-3 text-right text-emerald-400 font-black">{currencySymbol} {emp.revenue.toLocaleString()}</td>
                          <td className="p-3 text-center">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              emp.status === "Active" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                            }`}>{emp.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              CUSTOMERS PURCHASE TAB
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === "customers" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: "Total Customers", val: customers.length, color: "text-brand-sky" },
                  { label: "Total Outstanding Credit", val: `${currencySymbol} ${customers.reduce((a, c) => a + c.creditBalance, 0).toLocaleString()}`, color: "text-red-400" },
                  { label: "Total Loyalty points", val: `${customers.reduce((a, c) => a + c.loyaltyPoints, 0).toLocaleString()} pts`, color: "text-amber-400" },
                ].map(s => (
                  <div key={s.label} className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl p-4 text-center page-break-avoid">
                    <div className={`text-base font-black font-mono ${s.color}`}>{s.val}</div>
                    <div className="text-[9px] text-gray-500 uppercase tracking-wide mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-brand-dark-surface/30 border border-brand-dark-border rounded-2xl overflow-hidden page-break-avoid">
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-[#0d0d0d]">
                      <tr className="border-b border-brand-dark-border text-gray-500 font-mono">
                        <th className="p-3 font-semibold">Customer ID</th>
                        <th className="p-3 font-semibold">Name & Mobile</th>
                        <th className="p-3 font-semibold text-right">Purchases Count</th>
                        <th className="p-3 font-semibold text-right">Amount Spent</th>
                        <th className="p-3 font-semibold text-right">Credit Due</th>
                        <th className="p-3 font-semibold text-right">Loyalty Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-dark-border/30 font-mono text-[11px]">
                      {customerStats.map(cust => (
                        <tr key={cust.id} className="hover:bg-brand-dark-surface/40 transition">
                          <td className="p-3 text-brand-sky font-bold">{cust.id}</td>
                          <td className="p-3">
                            <div className="text-white font-bold font-sans">{cust.name}</div>
                            <div className="text-[9px] text-gray-500 font-mono">{cust.mobile}</div>
                          </td>
                          <td className="p-3 text-right text-purple-400 font-bold">{cust.buyCount} orders</td>
                          <td className="p-3 text-right text-emerald-400 font-black">{currencySymbol} {cust.totalSpent.toLocaleString()}</td>
                          <td className="p-3 text-right text-red-400 font-bold">{currencySymbol} {cust.creditBalance.toLocaleString()}</td>
                          <td className="p-3 text-right text-amber-400 font-bold">{cust.loyaltyPoints} pts</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              SUPPLIERS LEDGER TAB
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === "suppliers" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: "Authorized Suppliers", val: suppliers.length, color: "text-brand-sky" },
                  { label: "Accounts Payable Due", val: `${currencySymbol} ${suppliers.reduce((a, s) => a + s.dueAmount, 0).toLocaleString()}`, color: "text-red-400" },
                  { label: "Purchase Orders Filed", val: `${purchaseOrders.length} bills`, color: "text-purple-400" },
                ].map(s => (
                  <div key={s.label} className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl p-4 text-center page-break-avoid">
                    <div className={`text-base font-black font-mono ${s.color}`}>{s.val}</div>
                    <div className="text-[9px] text-gray-500 uppercase tracking-wide mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-brand-dark-surface/30 border border-brand-dark-border rounded-2xl overflow-hidden page-break-avoid">
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-[#0d0d0d]">
                      <tr className="border-b border-brand-dark-border text-gray-500 font-mono">
                        <th className="p-3 font-semibold">Supplier ID</th>
                        <th className="p-3 font-semibold">Company & Agent</th>
                        <th className="p-3 font-semibold">Contact Info</th>
                        <th className="p-3 font-semibold text-right">POs Filed</th>
                        <th className="p-3 font-semibold text-right">Total PO Value</th>
                        <th className="p-3 font-semibold text-right">Accounts Payable</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-dark-border/30 font-mono text-[11px]">
                      {supplierStats.map(sup => (
                        <tr key={sup.id} className="hover:bg-brand-dark-surface/40 transition">
                          <td className="p-3 text-brand-sky font-bold">{sup.id}</td>
                          <td className="p-3">
                            <div className="text-white font-bold font-sans">{sup.company}</div>
                            <div className="text-[9px] text-gray-400 font-sans">{sup.name}</div>
                          </td>
                          <td className="p-3 font-sans">
                            <div className="text-gray-300">{sup.mobile}</div>
                            <div className="text-[9px] text-gray-500 font-mono">{sup.email}</div>
                          </td>
                          <td className="p-3 text-right text-purple-400 font-bold">{sup.poCount} bills</td>
                          <td className="p-3 text-right text-emerald-400 font-black">{currencySymbol} {sup.totalPOValue.toLocaleString()}</td>
                          <td className="p-3 text-right text-red-400 font-bold">{currencySymbol} {sup.dueAmount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              PAYROLL & ATTENDANCE TAB
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === "payroll" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: "Active Team Roster", val: employees.length + " employees", color: "text-brand-sky" },
                  { label: "Base Monthly Salary Bill", val: `${currencySymbol} ${employees.reduce((a, e) => a + (e.salary || 0), 0).toLocaleString()}`, color: "text-emerald-400" },
                  { label: "Avg Attendance Rate", val: `${payrollStats.length > 0 ? (payrollStats.reduce((a, p) => a + p.attendanceRate, 0) / payrollStats.length).toFixed(0) : 100}%`, color: "text-purple-400" },
                ].map(s => (
                  <div key={s.label} className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl p-4 text-center page-break-avoid">
                    <div className={`text-base font-black font-mono ${s.color}`}>{s.val}</div>
                    <div className="text-[9px] text-gray-500 uppercase tracking-wide mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-brand-dark-surface/30 border border-brand-dark-border rounded-2xl overflow-hidden page-break-avoid">
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-[#0d0d0d]">
                      <tr className="border-b border-brand-dark-border text-gray-500 font-mono">
                        <th className="p-3 font-semibold">Staff ID</th>
                        <th className="p-3 font-semibold">Employee Details</th>
                        <th className="p-3 font-semibold text-right">Base Salary</th>
                        <th className="p-3 font-semibold text-center">Roster Tally (P / L / A / Lv)</th>
                        <th className="p-3 font-semibold text-right">Attendance Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-dark-border/30 font-mono text-[11px]">
                      {payrollStats.map(emp => (
                        <tr key={emp.id} className="hover:bg-brand-dark-surface/40 transition">
                          <td className="p-3 text-brand-sky font-bold">{emp.id}</td>
                          <td className="p-3">
                            <div className="text-white font-bold font-sans">{emp.name}</div>
                            <div className="text-[9px] text-gray-500 font-sans">{emp.role}</div>
                          </td>
                          <td className="p-3 text-right text-emerald-400 font-bold">{currencySymbol} {emp.salary.toLocaleString()}</td>
                          <td className="p-3 text-center">
                            <span className="text-emerald-400 font-bold">{emp.presents}P</span> /{" "}
                            <span className="text-amber-400 font-bold">{emp.lates}L</span> /{" "}
                            <span className="text-red-400 font-bold">{emp.absents}A</span> /{" "}
                            <span className="text-purple-400 font-bold">{emp.leaves}Lv</span>
                          </td>
                          <td className="p-3 text-right font-bold">
                            <span className={emp.attendanceRate >= 90 ? "text-emerald-400" : emp.attendanceRate >= 75 ? "text-amber-400" : "text-red-400"}>
                              {emp.attendanceRate.toFixed(0)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
