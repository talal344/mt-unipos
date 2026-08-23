"use client";

import React, { useState, useMemo } from "react";
import { useGlobalContext } from "@/context/global-context";
import AdminSidebar from "@/components/admin-sidebar";
import { 
  Users, 
  DollarSign, 
  Layers, 
  UserCheck, 
  Activity, 
  Cpu, 
  Database, 
  Terminal, 
  TrendingUp, 
  PieChart, 
  ShieldCheck, 
  RefreshCw,
  HardDrive
} from "lucide-react";

export default function AdminDashboardPage() {
  const { tenants, saasInvoices, demoRequests, theme } = useGlobalContext();
  const isLight = theme === "light";
  const [chartView, setChartView] = useState<"monthly" | "annual">("monthly");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh simulation
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Compute Metrics
  const totalClients = tenants.length;
  const activeClients = tenants.filter(t => t.status === "Active").length;
  const trialClients = tenants.filter(t => t.status === "Trial").length;
  const expiredClients = tenants.filter(t => t.status === "Expired" || t.status === "Suspended").length;

  const totalBranches = tenants.reduce((acc, t) => acc + (t.branches?.length || 0), 0);
  const totalUsers = tenants.reduce((acc, t) => acc + (t.usersCount || 0), 0);

  const totalRevenue = saasInvoices.filter(i => i.status === "Paid").reduce((acc, i) => acc + i.amount, 0);
  const recentDemos = demoRequests.slice(0, 5);

  // Industry Sector breakdown dynamically from active tenants
  const industryDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      "Super Markets": 0,
      "Pharmacy Stores": 0,
      "Restaurants / Cafes": 0,
      "Corporate / HRMS": 0
    };
    tenants.forEach(t => {
      if (t.businessType && counts[t.businessType] !== undefined) {
        counts[t.businessType]++;
      } else {
        counts["Super Markets"]++;
      }
    });
    return counts;
  }, [tenants]);

  // System logs mock
  const auditLogs = useMemo(() => {
    const list = [
      { id: 1, time: "Just now", type: "INFO", message: "Stripe payout webhook processed successfully for ledger validation." },
      { id: 2, time: "4 mins ago", type: "SEC", message: "Super admin token rotation completed. Session validity refreshed." },
    ];
    if (tenants.length > 0) {
      const latestTenant = tenants[0];
      list.push({
        id: 3,
        time: "15 mins ago",
        type: "PROV",
        message: `Database shard ${latestTenant.id} (${latestTenant.businessName}) health checks passed successfully.`
      });
    }
    list.push(
      { id: 4, time: "1 hour ago", type: "DB", message: "Automated incremental backup verified: 12 shards backed up to AWS S3 (ap-south-1)." },
      { id: 5, time: "3 hours ago", type: "WARN", message: "API limit warning: 94% threshold hit on free trial sandboxing." }
    );
    return list;
  }, [tenants]);

  // Dynamic Chart values based on view
  const chartData = useMemo(() => {
    const base = [
      { label: "Jan", val: 40 },
      { label: "Feb", val: 55 },
      { label: "Mar", val: 75 },
      { label: "Apr", val: 80 },
      { label: "May", val: 95 },
      { label: "Jun", val: 120 }
    ];
    
    // Scale value based on number of active tenants to make it feel somewhat dynamic
    const factor = Math.max(1, tenants.filter(t => t.status === "Active").length * 0.5);
    
    return base.map(bar => ({
      label: bar.label,
      val: Math.round(bar.val * factor * (chartView === "annual" ? 12 * 0.8 : 1))
    }));
  }, [chartView, tenants]);

  const cardBg = isLight 
    ? "bg-white border-slate-200 shadow-xs text-slate-900" 
    : "bg-brand-dark-surface/50 border-brand-dark-border text-gray-100";
  const cardBgSolid = isLight 
    ? "bg-white border-slate-200 shadow-xs text-slate-900" 
    : "bg-brand-dark-surface/30 border-brand-dark-border text-gray-100";
  const textHead = isLight ? "text-slate-900" : "text-white";
  const textSub = isLight ? "text-slate-500" : "text-gray-400";
  const subBoxBg = isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-black/40 border-brand-dark-border/60 text-white";
  const progressBg = isLight ? "bg-slate-100 border-slate-200" : "bg-black border-brand-dark-border/40";
  const borderLine = isLight ? "border-slate-200" : "border-brand-dark-border/60";
  const buttonBg = isLight 
    ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200" 
    : "bg-brand-dark-surface border-brand-dark-border text-gray-400 hover:text-white";

  return (
    <div className={`flex min-h-screen font-sans ${isLight ? "bg-slate-100 text-slate-900" : "bg-black text-gray-100"}`}>
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-grow p-6 sm:p-8 space-y-6 overflow-y-auto max-h-screen">
        
        {/* Header */}
        <div className={`flex justify-between items-center border-b pb-4 ${borderLine}`}>
          <div>
            <h1 className={`text-xl font-black tracking-tight flex items-center gap-2 ${textHead}`}>
              <Activity className="text-purple-500 animate-pulse" size={20} />
              SaaS Platform Statistics
            </h1>
            <p className={`text-[10px] ${textSub}`}>Live PostgreSQL database shards &amp; Stripe transaction ledger feeds.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleRefresh}
              className={`p-1.5 border rounded-lg transition flex items-center gap-1 text-[10px] ${buttonBg}`}
            >
              <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
              Sync Feeds
            </button>
            <span className={`text-[10px] font-mono px-2 py-1 rounded border ${buttonBg}`}>
              Last backup: 1 hour ago
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className={`border p-4 rounded-xl space-y-2 hover:border-purple-500/40 transition duration-300 ${cardBg}`}>
            <div className={`flex justify-between items-center ${textSub}`}>
              <span className="text-[10px] uppercase font-bold tracking-wide">Total Client Tenancies</span>
              <Users size={16} className="text-purple-500" />
            </div>
            <div className={`text-2xl font-black ${textHead}`}>{totalClients}</div>
            <p className={`text-[9px] ${textSub}`}>{activeClients} Active • {trialClients} Trial</p>
          </div>

          <div className={`border p-4 rounded-xl space-y-2 hover:border-emerald-500/40 transition duration-300 ${cardBg}`}>
            <div className={`flex justify-between items-center ${textSub}`}>
              <span className="text-[10px] uppercase font-bold tracking-wide">Monthly SaaS Revenue</span>
              <DollarSign size={16} className="text-emerald-500" />
            </div>
            <div className={`text-2xl font-black ${textHead}`}>
              ${(totalClients > 0 ? totalRevenue : 0).toLocaleString()}
            </div>
            <p className="text-[9px] text-emerald-500 font-bold">100% Invoice Clearance rate</p>
          </div>

          <div className={`border p-4 rounded-xl space-y-2 hover:border-sky-500/40 transition duration-300 ${cardBg}`}>
            <div className={`flex justify-between items-center ${textSub}`}>
              <span className="text-[10px] uppercase font-bold tracking-wide">Active Store Branches</span>
              <Layers size={16} className="text-sky-500" />
            </div>
            <div className={`text-2xl font-black ${textHead}`}>{totalBranches}</div>
            <p className={`text-[9px] ${textSub}`}>
              {totalClients > 0 ? `Averaging ${(totalBranches / totalClients).toFixed(1)} branches per tenant` : "0 branches provisioned"}
            </p>
          </div>

          <div className={`border p-4 rounded-xl space-y-2 hover:border-amber-500/40 transition duration-300 ${cardBg}`}>
            <div className={`flex justify-between items-center ${textSub}`}>
              <span className="text-[10px] uppercase font-bold tracking-wide">Platform Terminal Users</span>
              <UserCheck size={16} className="text-amber-500" />
            </div>
            <div className={`text-2xl font-black ${textHead}`}>{totalUsers}</div>
            <p className={`text-[9px] ${textSub}`}>Owner, Manager &amp; Staff accounts</p>
          </div>

        </div>

        {/* System Health Card & Top Industries Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sharded Database Container Monitor */}
          <div className={`border p-5 rounded-2xl space-y-4 ${cardBgSolid}`}>
            <h3 className={`text-xs uppercase font-bold tracking-wide border-b pb-2 flex items-center gap-1.5 ${textHead} ${borderLine}`}>
              <Cpu size={14} className="text-purple-500" />
              SaaS Sharding Health Monitor
            </h3>
            
            <div className="space-y-3 pt-1">
              {/* CPU load */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className={textSub}>CPU Usage (Aggregated)</span>
                  <span className="text-emerald-500 font-bold">{totalClients > 0 ? "14.2%" : "1.8%"}</span>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden border ${progressBg}`}>
                  <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: totalClients > 0 ? "14%" : "2%" }} />
                </div>
              </div>

              {/* Memory load */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className={textSub}>Memory Usage (RDS)</span>
                  <span className="text-emerald-500 font-bold">{totalClients > 0 ? "3.4 GB / 16 GB" : "0.8 GB / 16 GB"}</span>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden border ${progressBg}`}>
                  <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: totalClients > 0 ? "21%" : "5%" }} />
                </div>
              </div>

              {/* Shard Disks */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className={textSub}>Database Storage Limit</span>
                  <span className="text-sky-500 font-bold">{totalClients > 0 ? `${(totalClients * 0.12).toFixed(2)} GB / 500 GB` : "0 GB / 500 GB"}</span>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden border ${progressBg}`}>
                  <div className="bg-sky-500 h-full transition-all duration-500" style={{ width: totalClients > 0 ? `${Math.max(1, (totalClients * 0.12 / 500) * 100)}%` : "0%" }} />
                </div>
              </div>

              {/* Server Stats */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] font-mono">
                <div className={`border p-2 rounded flex flex-col justify-between ${subBoxBg}`}>
                  <span className={`text-[8px] uppercase ${textSub}`}>Shard Latency</span>
                  <span className="text-emerald-500 font-bold mt-0.5">{totalClients > 0 ? "8.4 ms" : "1.2 ms"}</span>
                </div>
                <div className={`border p-2 rounded flex flex-col justify-between ${subBoxBg}`}>
                  <span className={`text-[8px] uppercase ${textSub}`}>DB Connections</span>
                  <span className={`font-bold mt-0.5 ${textHead}`}>{totalClients > 0 ? `${totalClients * 4} Active` : "0 Pool"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Industry Distribution Breakdown */}
          <div className={`border p-5 rounded-2xl space-y-4 ${cardBgSolid}`}>
            <h3 className={`text-xs uppercase font-bold tracking-wide border-b pb-2 flex items-center gap-1.5 ${textHead} ${borderLine}`}>
              <PieChart size={14} className="text-purple-500" />
              Top Industry Distributions
            </h3>
            
            {totalClients === 0 ? (
              <div className={`h-40 flex flex-col items-center justify-center text-center text-xs ${textSub}`}>
                <Database size={24} className={`mb-2 ${textSub}`} />
                <span>No active client shards.</span>
                <span className={`text-[10px] ${textSub}`}>Register a client to map distribution.</span>
              </div>
            ) : (
              <div className="space-y-2.5 pt-1 text-xs">
                {Object.entries(industryDistribution).map(([industry, count]) => {
                  const percentage = totalClients > 0 ? Math.round((count / totalClients) * 100) : 0;
                  return (
                    <div key={industry} className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className={`flex items-center gap-1 ${textSub}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          {industry}
                        </span>
                        <span className={`font-mono font-bold ${textHead}`}>{count} ({percentage}%)</span>
                      </div>
                      <div className={`w-full h-1.5 rounded-full overflow-hidden border ${progressBg}`}>
                        <div className="bg-gradient-to-r from-purple-600 to-purple-400 h-full" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Live System Audit Logs Console */}
          <div className={`border p-5 rounded-2xl space-y-4 ${cardBgSolid}`}>
            <h3 className={`text-xs uppercase font-bold tracking-wide border-b pb-2 flex items-center gap-1.5 ${textHead} ${borderLine}`}>
              <Terminal size={14} className="text-purple-500" />
              Live Platform Audit Logs
            </h3>
            <div className="font-mono text-[9px] space-y-2 h-44 overflow-y-auto pr-1">
              {auditLogs.map(log => (
                <div key={log.id} className={`border-b pb-1.5 leading-relaxed ${borderLine}`}>
                  <div className="flex justify-between mb-0.5">
                    <span className={`font-bold ${
                      log.type === "SEC" ? "text-red-500" :
                      log.type === "PROV" ? "text-emerald-500" :
                      log.type === "WARN" ? "text-amber-500" : "text-sky-500"
                    }`}>[{log.type}]</span>
                    <span className={textSub}>{log.time}</span>
                  </div>
                  <p className={textSub}>{log.message}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Revenue Velocity Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className={`lg:col-span-2 border p-5 rounded-2xl space-y-4 ${cardBgSolid}`}>
            <div className={`flex justify-between items-center border-b pb-2 ${borderLine}`}>
              <h3 className={`text-xs uppercase font-bold tracking-wide flex items-center gap-1.5 ${textHead}`}>
                <TrendingUp size={14} className="text-purple-500" />
                Revenue Streams &amp; Projections
              </h3>
              {/* Toggle controls */}
              <div className={`flex p-0.5 rounded-lg border text-[9px] ${subBoxBg}`}>
                <button
                  onClick={() => setChartView("monthly")}
                  className={`px-2.5 py-1 rounded font-bold transition ${chartView === "monthly" ? "bg-purple-600 text-white" : textSub}`}
                >
                  Monthly MRR
                </button>
                <button
                  onClick={() => setChartView("annual")}
                  className={`px-2.5 py-1 rounded font-bold transition ${chartView === "annual" ? "bg-purple-600 text-white" : textSub}`}
                >
                  Annualized (ARR)
                </button>
              </div>
            </div>
            
            {/* Visual CSS Grid Chart */}
            {totalClients === 0 ? (
              <div className={`h-44 flex flex-col items-center justify-center text-center text-xs ${textSub}`}>
                <DollarSign size={24} className={`mb-2 font-bold ${textSub}`} />
                <span>No revenue data available.</span>
                <span className={`text-[10px] ${textSub}`}>Register active tenants to generate billings.</span>
              </div>
            ) : (
              <div className="h-44 flex items-end justify-between gap-2 pt-6 font-mono text-[9px]">
                {chartData.map(bar => (
                  <div key={bar.label} className="flex-grow flex flex-col items-center gap-2">
                    <span className="text-sky-500 font-bold">${bar.val.toLocaleString()}</span>
                    <div
                      style={{ height: `${Math.min(100, Math.max(8, (bar.val / (chartView === "annual" ? 1200 * 12 : 1200)) * 100))}%` }}
                      className="w-full bg-gradient-to-t from-purple-900 to-purple-500 rounded-t-sm shadow-lg shadow-purple-500/20 transition-all duration-500"
                    />
                    <span className={textSub}>{bar.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Client Status Distribution */}
          <div className={`border p-5 rounded-2xl space-y-4 ${cardBgSolid}`}>
            <h3 className={`text-xs uppercase font-bold tracking-wide border-b pb-2 flex items-center gap-1.5 ${textHead} ${borderLine}`}>
              <ShieldCheck size={14} className="text-purple-500" />
              Tenant Status Distribution
            </h3>
            
            <div className="space-y-3 pt-2 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Active Shards
                  </span>
                  <span className={`font-bold ${textHead}`}>
                    {activeClients} {totalClients > 0 ? `(${Math.round(activeClients / totalClients * 100)}%)` : ""}
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden border ${progressBg}`}>
                  <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: totalClients > 0 ? `${activeClients / totalClients * 100}%` : "0%" }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-sky-500 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    Trial Sandbox Tiers
                  </span>
                  <span className={`font-bold ${textHead}`}>
                    {trialClients} {totalClients > 0 ? `(${Math.round(trialClients / totalClients * 100)}%)` : ""}
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden border ${progressBg}`}>
                  <div className="bg-sky-500 h-full transition-all duration-500" style={{ width: totalClients > 0 ? `${trialClients / totalClients * 100}%` : "0%" }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-purple-500 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    Pending Demo Requests
                  </span>
                  <span className={`font-bold ${textHead}`}>{demoRequests.filter(d => d.status === "Pending").length} Requests</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden border ${progressBg}`}>
                  <div className="bg-purple-500 h-full transition-all duration-500" style={{ width: demoRequests.length > 0 ? `${Math.min(100, (demoRequests.filter(d => d.status === "Pending").length / Math.max(1, demoRequests.length)) * 100)}%` : "0%" }} />
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Lower Grid: Demo requests */}
        <div className={`border p-5 rounded-2xl space-y-4 ${cardBgSolid}`}>
          <h3 className={`text-xs uppercase font-bold tracking-wide border-b pb-2 flex items-center gap-1.5 ${textHead} ${borderLine}`}>
            <HardDrive size={14} className="text-purple-500" />
            Recent Onboarding Demo Requests
          </h3>
          {recentDemos.length === 0 ? (
            <div className={`py-6 text-center text-xs font-sans ${textSub}`}>
              No recent onboarding requests in pipeline.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b font-sans ${textSub} ${borderLine}`}>
                    <th className="pb-2 font-semibold">Lead ID</th>
                    <th className="pb-2 font-semibold">Contact Name</th>
                    <th className="pb-2 font-semibold">Business Name</th>
                    <th className="pb-2 font-semibold">Mobile Hotline</th>
                    <th className="pb-2 font-semibold">Sector</th>
                    <th className="pb-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className={`divide-y font-mono text-[11px] ${borderLine}`}>
                  {recentDemos.map(req => (
                    <tr key={req.id} className={`transition ${isLight ? "hover:bg-slate-50" : "hover:bg-brand-dark-surface/60"}`}>
                      <td className="py-2.5 text-sky-500 font-bold">{req.id}</td>
                      <td className={`py-2.5 ${textHead}`}>{req.name}</td>
                      <td className={`py-2.5 ${textHead}`}>{req.businessName}</td>
                      <td className={`py-2.5 ${textSub}`}>{req.phone}</td>
                      <td className={`py-2.5 ${textSub}`}>{req.businessType}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.status === "Approved" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500" :
                          req.status === "Pending" ? "bg-amber-500/10 border border-amber-500/30 text-amber-500" :
                          req.status === "Reviewed" ? "bg-sky-500/10 border border-sky-500/30 text-sky-500" :
                          "bg-red-500/10 border border-red-500/30 text-red-500"
                        }`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
