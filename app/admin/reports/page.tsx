"use client";

import React, { useState, useMemo } from "react";
import { useGlobalContext } from "@/context/global-context";
import AdminSidebar from "@/components/admin-sidebar";
import { 
  PieChart, 
  TrendingUp, 
  Database, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  FileText,
  Activity,
  Layers,
  Percent,
  Download,
  Calendar,
  Zap,
  Sliders,
  AlertCircle
} from "lucide-react";

export default function AdminReportsPage() {
  const { tenants, saasInvoices, demoRequests, supportTickets, theme } = useGlobalContext();
  const isLight = theme === "light";

  // Helper to query dynamic stats from localStorage per tenant
  const getTenantDynamicStats = (tenantId: string) => {
    if (typeof window === "undefined") return { staffCount: 1, monthlyRevenue: 0 };
    
    let staffCount = 1;
    try {
      const empsStr = localStorage.getItem("unipos_employees_" + tenantId);
      if (empsStr) {
        const emps = JSON.parse(empsStr);
        if (Array.isArray(emps) && emps.length > 0) {
          staffCount = emps.length;
        }
      }
    } catch (e) {}

    let monthlyRevenue = 0;
    try {
      const salesStr = localStorage.getItem("unipos_sales_" + tenantId);
      if (salesStr) {
        const sales = JSON.parse(salesStr);
        if (Array.isArray(sales)) {
          const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
          monthlyRevenue = sales.reduce((sum, sale) => {
            const saleDate = new Date(sale.date).getTime();
            if (saleDate >= thirtyDaysAgo) {
              return sum + (sale.total || 0);
            }
            return sum;
          }, 0);
        }
      }
    } catch (e) {}

    return { staffCount, monthlyRevenue };
  };

  const [dateFilter, setDateFilter] = useState("Last 30 Days");
  const [planFilter, setPlanFilter] = useState<"All" | "Starter" | "Professional" | "Enterprise">("All");
  const [sectorFilter, setSectorFilter] = useState<string>("All");
  
  // Simulation States
  const [expectedGrowth, setExpectedGrowth] = useState<number>(15); // monthly growth %
  const [conversionTarget, setConversionTarget] = useState<number>(30); // lead conversion %

  // Filter Tenants
  const filteredTenants = useMemo(() => {
    return tenants.filter(t => {
      const matchPlan = planFilter === "All" || t.plan === planFilter;
      let matchSector = true;
      if (sectorFilter !== "All") {
        if (sectorFilter === "Super Markets") matchSector = t.businessType?.includes("Super");
        else if (sectorFilter === "Pharmacy Stores") matchSector = t.businessType?.includes("Pharmacy");
        else if (sectorFilter === "Restaurants / Cafes") matchSector = t.businessType?.includes("Rest") || t.businessType?.includes("Cafe");
        else if (sectorFilter === "Electronics Stores") matchSector = t.businessType?.includes("Elect");
        else if (sectorFilter === "Clothing Stores") matchSector = t.businessType?.includes("Cloth");
      }
      return matchPlan && matchSector;
    });
  }, [tenants, planFilter, sectorFilter]);

  // Calculate dynamic operational SaaS statistics
  const totalTenantsCount = filteredTenants.length;
  const activeTenantsCount = filteredTenants.filter(t => t.status === "Active" || t.status === "Trial").length;

  // Monthly Recurring Revenue calculations
  const calculateMRR = (tenantList: typeof tenants) => {
    return tenantList.reduce((acc, t) => {
      if (t.status !== "Active" && t.status !== "Trial") return acc;
      let baseCost = 49; // Pro Plan monthly USD
      if (t.plan === "Starter") baseCost = 19;
      if (t.plan === "Enterprise") baseCost = 99;
      
      const pkrRate = 280;
      let costInPKR = baseCost * pkrRate;

      if (t.billingCycle === "yearly") {
        costInPKR = (costInPKR * 12 * 0.8) / 12; // 20% discount annual, monthly average
      }
      return acc + costInPKR;
    }, 0);
  };

  const currentMRR = calculateMRR(filteredTenants);
  const projectedARR = currentMRR * 12;

  // Invoices analytics
  const totalInvoicedPKR = saasInvoices.reduce((acc, inv) => acc + inv.amount * (inv.plan.includes("USD") || inv.plan.includes("Starter") || inv.plan.includes("Professional") || inv.plan.includes("Enterprise") ? 280 : 1), 0);
  const paidInvoicesPKR = saasInvoices.filter(inv => inv.status === "Paid").reduce((acc, inv) => acc + inv.amount * (inv.plan.includes("USD") || inv.plan.includes("Starter") || inv.plan.includes("Professional") || inv.plan.includes("Enterprise") ? 280 : 1), 0);
  const collectionRate = totalInvoicedPKR > 0 ? (paidInvoicesPKR / totalInvoicedPKR) * 100 : 0;

  // Plan Distribution counts
  const planStarter = filteredTenants.filter(t => t.plan === "Starter").length;
  const planPro = filteredTenants.filter(t => t.plan === "Professional").length;
  const planEnterprise = filteredTenants.filter(t => t.plan === "Enterprise").length;

  // Sharding visual data
  const restApiHits24h = totalTenantsCount * 1240 + (totalTenantsCount > 0 ? 3420 : 0);
  const avgQueryLatencyMs = totalTenantsCount > 0 ? 12 : 0;
  const totalShardsSizeMB = totalTenantsCount * 4.2 + (totalTenantsCount > 0 ? 12.8 : 0);

  // Lead Funnel Analytics
  const totalLeads = demoRequests.length;
  const pendingLeads = demoRequests.filter(d => d.status === "Pending").length;
  const convertedLeads = demoRequests.filter(d => d.status === "Reviewed" || d.status === "Approved").length;
  const leadConversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

  // Revenue projection simulation calculations
  const simulatedForecast = useMemo(() => {
    const avgPlanPKR = 49 * 280; // Pro Plan Avg in PKR
    const compoundingFactor = Math.pow(1 + (expectedGrowth / 100), 12);
    const simulatedDemoOnboardingRevenue = pendingLeads * (conversionTarget / 100) * avgPlanPKR;
    
    const nextYearMRR = (currentMRR * compoundingFactor) + simulatedDemoOnboardingRevenue;
    const nextYearARR = nextYearMRR * 12;

    return {
      mrr: nextYearMRR,
      arr: nextYearARR
    };
  }, [currentMRR, pendingLeads, expectedGrowth, conversionTarget]);

  // Determine Subscription standing status for each tenant
  const tenantStandingHeatmap = useMemo(() => {
    return filteredTenants.map(t => {
      const clientInvs = saasInvoices.filter(i => i.tenantId === t.id);
      let status: "PAID" | "UNPAID" | "TRIAL" = "TRIAL";
      
      if (t.status === "Trial") {
        status = "TRIAL";
      } else if (clientInvs.length > 0) {
        const hasUnpaid = clientInvs.some(i => i.status === "Unpaid");
        status = hasUnpaid ? "UNPAID" : "PAID";
      } else {
        status = "PAID";
      }

      return {
        id: t.id,
        businessName: t.businessName,
        status,
        plan: t.plan
      };
    });
  }, [filteredTenants, saasInvoices]);

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Tenant ID,Business Name,Plan,Billing,Revenue,Status,Signup Date"]
        .concat(filteredTenants.map(t => `${t.id},"${t.businessName}",${t.plan},${t.billingCycle},${t.monthlyRevenue},${t.status},${t.signupDate}`))
        .join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `unipos_saas_reports_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className={`flex min-h-screen font-sans ${isLight ? "bg-slate-100 text-slate-900" : "bg-black text-gray-100"}`}>
      <AdminSidebar />

      {/* Workspace */}
      <main className="flex-grow p-6 sm:p-8 space-y-6 overflow-y-auto max-h-screen">
        
        {/* Header */}
        <div className={`flex flex-col md:flex-row md:justify-between md:items-center border-b pb-4 gap-4 ${isLight ? "border-slate-200" : "border-brand-dark-border/60"}`}>
          <div>
            <h1 className={`text-xl font-black tracking-tight flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
              <PieChart size={24} className="text-purple-500" />
              Super SaaS Analytics &amp; Reports
            </h1>
            <p className={`text-[10px] font-sans ${isLight ? "text-slate-500" : "text-gray-500"}`}>Cross-tenant statistics, database sharding capacities, and platform revenue metrics.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value as any)}
              className={`px-3 py-1.5 rounded-xl text-[10px] focus:outline-none focus:border-purple-500 font-sans border ${
                isLight ? "bg-white border-slate-300 text-slate-900" : "bg-brand-dark-surface border-brand-dark-border text-gray-300"
              }`}
            >
              <option value="All">All Plans</option>
              <option value="Starter">Starter Plan</option>
              <option value="Professional">Professional Plan</option>
              <option value="Enterprise">Enterprise Plan</option>
            </select>

            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className={`px-3 py-1.5 rounded-xl text-[10px] focus:outline-none focus:border-purple-500 font-sans border ${
                isLight ? "bg-white border-slate-300 text-slate-900" : "bg-brand-dark-surface border-brand-dark-border text-gray-300"
              }`}
            >
              <option value="All">All Sectors</option>
              <option value="Super Markets">Super Markets</option>
              <option value="Pharmacy Stores">Pharmacy Stores</option>
              <option value="Restaurants / Cafes">Restaurants / Cafes</option>
              <option value="Electronics Stores">Electronics Stores</option>
              <option value="Clothing Stores">Clothing Stores</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold rounded-xl transition shadow-lg"
            >
              <Download size={12} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Dynamic SaaS Financial KPI metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`border p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[110px] ${
            isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/50 border-brand-dark-border text-gray-100"
          }`}>
            <div className={`flex justify-between items-start ${isLight ? "text-slate-500" : "text-gray-500"}`}>
              <span className="text-[10px] uppercase font-bold tracking-wider">Monthly Recurring Revenue (MRR)</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500"><TrendingUp size={14} /></div>
            </div>
            <div>
              <div className={`text-2xl font-black font-mono mt-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                Rs. {currentMRR.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className={`text-[9px] mt-1 ${isLight ? "text-slate-500" : "text-gray-500"}`}>PKR equivalent sharded sum</p>
            </div>
          </div>

          <div className={`border p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[110px] ${
            isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/50 border-brand-dark-border text-gray-100"
          }`}>
            <div className={`flex justify-between items-start ${isLight ? "text-slate-500" : "text-gray-500"}`}>
              <span className="text-[10px] uppercase font-bold tracking-wider">Projected ARR</span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500"><DollarSign size={14} /></div>
            </div>
            <div>
              <div className={`text-2xl font-black font-mono mt-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                Rs. {projectedARR.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className={`text-[9px] mt-1 ${isLight ? "text-slate-500" : "text-gray-500"}`}>Based on current customer base</p>
            </div>
          </div>

          <div className={`border p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[110px] ${
            isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/50 border-brand-dark-border text-gray-100"
          }`}>
            <div className={`flex justify-between items-start ${isLight ? "text-slate-500" : "text-gray-500"}`}>
              <span className="text-[10px] uppercase font-bold tracking-wider">Invoices Collection Rate</span>
              <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500"><Percent size={14} /></div>
            </div>
            <div>
              <div className={`text-2xl font-black font-mono mt-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                {collectionRate.toFixed(1)}%
              </div>
              <p className={`text-[9px] mt-1 ${isLight ? "text-slate-500" : "text-gray-500"}`}>Rs. {paidInvoicesPKR.toLocaleString(undefined, { maximumFractionDigits: 0 })} collected in cash</p>
            </div>
          </div>

          <div className={`border p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[110px] ${
            isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/50 border-brand-dark-border text-gray-100"
          }`}>
            <div className={`flex justify-between items-start ${isLight ? "text-slate-500" : "text-gray-500"}`}>
              <span className="text-[10px] uppercase font-bold tracking-wider">Lead Conversion Funnel</span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500"><Users size={14} /></div>
            </div>
            <div>
              <div className={`text-2xl font-black font-mono mt-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                {leadConversionRate.toFixed(1)}%
              </div>
              <p className={`text-[9px] mt-1 ${isLight ? "text-slate-500" : "text-gray-500"}`}>{convertedLeads} out of {totalLeads} requests processed</p>
            </div>
          </div>
        </div>

        {/* Database Load & Shard Analytics Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Sharded Database Load Metrics */}
          <div className={`lg:col-span-1 border p-6 rounded-2xl space-y-4 ${
            isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/30 border-brand-dark-border text-gray-100"
          }`}>
            <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isLight ? "text-slate-700" : "text-gray-400"}`}>
              <Database size={14} className="text-purple-500" />
              Platform Database Shards (PostgreSQL)
            </h3>
            
            <div className="space-y-4 pt-2">
              <div className={`border p-3 rounded-lg flex justify-between items-center text-xs font-mono ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-black/40 border-brand-dark-border/80 text-white"
              }`}>
                <span className={isLight ? "text-slate-500" : "text-gray-400"}>Total Active Shards:</span>
                <span className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{totalTenantsCount} Databases</span>
              </div>

              <div className={`border p-3 rounded-lg flex justify-between items-center text-xs font-mono ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-black/40 border-brand-dark-border/80 text-white"
              }`}>
                <span className={isLight ? "text-slate-500" : "text-gray-400"}>Total Shard Size:</span>
                <span className="text-purple-500 font-bold">{totalShardsSizeMB.toFixed(1)} MB</span>
              </div>

              <div className={`border p-3 rounded-lg flex justify-between items-center text-xs font-mono ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-black/40 border-brand-dark-border/80 text-white"
              }`}>
                <span className={isLight ? "text-slate-500" : "text-gray-400"}>Avg Query Response:</span>
                <span className="text-emerald-500 font-bold">{avgQueryLatencyMs} ms</span>
              </div>

              <div className={`border p-3 rounded-lg flex justify-between items-center text-xs font-mono ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-black/40 border-brand-dark-border/80 text-white"
              }`}>
                <span className={isLight ? "text-slate-500" : "text-gray-400"}>24h REST API Hits:</span>
                <span className="text-sky-500 font-bold">{restApiHits24h.toLocaleString()} hits</span>
              </div>

              <div className={`border p-3 rounded-lg flex justify-between items-center text-xs font-mono ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-black/40 border-brand-dark-border/80 text-white"
              }`}>
                <span className={isLight ? "text-slate-500" : "text-gray-400"}>Cache Hit Ratio:</span>
                <span className="text-emerald-500 font-bold">{totalTenantsCount > 0 ? "99.8% (Redis Active)" : "—"}</span>
              </div>
            </div>
          </div>

          {/* Right: Plan Distribution & Revenue Simulator */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Plan distribution */}
            <div className={`border p-6 rounded-2xl space-y-4 ${
              isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/40 border-brand-dark-border text-gray-100"
            }`}>
              <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isLight ? "text-slate-700" : "text-gray-400"}`}>
                <Layers size={14} className="text-purple-500" />
                Subscription Plan Tiers Distribution
              </h3>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className={`border p-4 rounded-xl text-center space-y-1 ${
                  isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-black/30 border-brand-dark-border/60 text-white"
                }`}>
                  <div className={`text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-500"}`}>Starter Plan</div>
                  <div className={`text-xl font-mono font-black ${isLight ? "text-slate-900" : "text-white"}`}>{planStarter}</div>
                  <div className={`text-[8px] font-sans ${isLight ? "text-slate-400" : "text-gray-500"}`}>Starter DB schema sharded</div>
                  <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden mt-2">
                    <div className="bg-sky-500 h-full" style={{ width: `${totalTenantsCount > 0 ? (planStarter / totalTenantsCount) * 100 : 0}%` }} />
                  </div>
                </div>

                <div className="bg-black/30 border border-brand-dark-border/60 p-4 rounded-xl text-center space-y-1">
                  <div className="text-[10px] uppercase font-bold text-gray-400">Professional Plan</div>
                  <div className="text-xl font-mono font-black text-white">{planPro}</div>
                  <div className="text-[8px] text-gray-500 font-sans">Mid-tier database instances</div>
                  <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden mt-2">
                    <div className="bg-purple-500 h-full" style={{ width: `${totalTenantsCount > 0 ? (planPro / totalTenantsCount) * 100 : 0}%` }} />
                  </div>
                </div>

                <div className="bg-black/30 border border-brand-dark-border/60 p-4 rounded-xl text-center space-y-1">
                  <div className="text-[10px] uppercase font-bold text-gray-500">Enterprise Plan</div>
                  <div className="text-xl font-mono font-black text-white">{planEnterprise}</div>
                  <div className="text-[8px] text-gray-500 font-sans">Heavy-capacity sharded instances</div>
                  <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden mt-2">
                    <div className="bg-emerald-400 h-full" style={{ width: `${totalTenantsCount > 0 ? (planEnterprise / totalTenantsCount) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Compounding Projection Simulator */}
            <div className="bg-brand-dark-surface/40 border border-brand-dark-border p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                <Sliders size={14} className="text-purple-400" />
                12-Month ARR Growth Projection Simulator
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Sliders */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-gray-400">Compounded Growth/Mo:</span>
                      <span className="text-purple-400 font-mono">{expectedGrowth}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="50" 
                      value={expectedGrowth} 
                      onChange={(e) => setExpectedGrowth(parseInt(e.target.value))}
                      className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-gray-400">Lead Conversion Rate:</span>
                      <span className="text-purple-400 font-mono">{conversionTarget}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="5" 
                      max="100" 
                      value={conversionTarget} 
                      onChange={(e) => setConversionTarget(parseInt(e.target.value))}
                      className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                </div>

                {/* Outputs */}
                <div className="bg-black/35 border border-brand-dark-border/80 rounded-xl p-4 flex flex-col justify-between font-mono">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-400">Compounded MRR (Year 1):</span>
                    <span className="text-emerald-400 font-bold">Rs. {simulatedForecast.mrr.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] border-t border-brand-dark-border/40 pt-2.5 mt-2.5">
                    <span className="text-gray-400">Compounded ARR Projection:</span>
                    <span className="text-purple-400 font-bold text-sm">Rs. {simulatedForecast.arr.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <span className="text-[8px] text-gray-500 font-sans mt-2.5 leading-normal">
                    *Compounded from current MRR (Rs. {currentMRR.toLocaleString()}) and {pendingLeads} pending demo conversions at average plan pricing.
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Subscription standing Heatmap Grid */}
        <div className="bg-brand-dark-surface/40 border border-brand-dark-border p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5 border-b border-brand-dark-border pb-2">
            <Zap size={14} className="text-purple-400" />
            Client subscription billing standing heatmap
          </h3>
          {tenantStandingHeatmap.length === 0 ? (
            <p className="text-center text-xs text-gray-500 py-6 italic font-sans">
              No database shards active to map standings.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {tenantStandingHeatmap.map(client => (
                <div 
                  key={client.id}
                  className={`border p-3 rounded-xl flex flex-col justify-between space-y-2 relative overflow-hidden transition-all duration-300 ${
                    client.status === "PAID" ? "bg-emerald-500/5 border-emerald-500/25 hover:border-emerald-500/50 text-emerald-400" :
                    client.status === "UNPAID" ? "bg-amber-500/5 border-amber-500/25 hover:border-amber-500/50 text-amber-400" :
                    "bg-brand-sky/5 border-brand-sky/25 hover:border-brand-sky/50 text-brand-sky"
                  }`}
                >
                  <div>
                    <span className="text-[8px] font-mono tracking-wider opacity-60 uppercase font-bold block">{client.id}</span>
                    <span className="text-[11px] text-white font-bold block truncate font-sans mt-0.5">{client.businessName}</span>
                  </div>
                  <div className="flex justify-between items-center text-[8px] font-mono">
                    <span className="opacity-60">{client.plan}</span>
                    <span className={`px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider text-[8px] ${
                      client.status === "PAID" ? "bg-emerald-500/10 text-emerald-400" :
                      client.status === "UNPAID" ? "bg-amber-500/10 text-amber-400" :
                      "bg-brand-sky/10 text-brand-sky"
                    }`}>
                      {client.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Tenant Performance Analytics Ledger */}
        <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-brand-dark-border bg-black/40 flex justify-between items-center">
            <h4 className="text-xs font-black uppercase text-gray-300 tracking-wider">Tenant Performance Ledger</h4>
            <span className="text-[10px] text-gray-500 font-mono">Showing {filteredTenants.length} entries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="bg-black/60 text-gray-400 uppercase tracking-wider text-[9px] font-black border-b border-brand-dark-border">
                  <th className="px-6 py-4">Client ID</th>
                  <th className="px-6 py-4">Business Name</th>
                  <th className="px-6 py-4">Sharded Branches</th>
                  <th className="px-6 py-4 text-center">User Count</th>
                  <th className="px-6 py-4 text-right">Est. Monthly Volume</th>
                  <th className="px-6 py-4 text-center">Operational Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark-border/30">
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-600 italic font-sans">
                      No records match the selected plan or sector filters.
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map(tenant => {
                    const stats = getTenantDynamicStats(tenant.id);
                    return (
                      <tr key={tenant.id} className="hover:bg-brand-dark-border/20 transition font-mono text-[11px]">
                        <td className="px-6 py-3.5 text-purple-400 font-bold">{tenant.id}</td>
                        <td className="px-6 py-3.5 text-white font-bold font-sans">{tenant.businessName}</td>
                        <td className="px-6 py-3.5 font-sans text-gray-300">
                          {tenant.branches ? tenant.branches.join(", ") : "Main Branch"}
                        </td>
                        <td className="px-6 py-3.5 text-center text-gray-400 font-bold">{stats.staffCount} staff</td>
                        <td className="px-6 py-3.5 text-right text-emerald-400 font-bold">
                          Rs. {(stats.monthlyRevenue * (tenant.defaultCurrency === "USD" ? 280 : 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black ${
                            tenant.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                            tenant.status === "Trial" ? "bg-brand-sky/10 text-brand-sky border border-brand-sky/20" :
                            "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}>
                            {tenant.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
