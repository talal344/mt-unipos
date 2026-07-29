"use client";

import React, { useState, useMemo } from "react";
import { useGlobalContext } from "@/context/global-context";
import AdminSidebar from "@/components/admin-sidebar";
import { 
  DollarSign, 
  Download, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Plus, 
  Search, 
  Check, 
  X, 
  CreditCard,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Percent,
  Edit2,
  Trash2,
  Printer
} from "lucide-react";

function buildThermalInvoiceHTML(invoice: any, tenantEmail: string): string {
  const dateStr = new Date(invoice.date).toLocaleDateString("en-PK", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>SaaS Invoice ${invoice.id}</title>
<style>
  @page {
    size: 80mm auto;
    margin: 0;
  }
  html, body {
    width: 80mm;
    margin: 0;
    padding: 0;
    background: #fff;
    color: #000;
  }
  @media print {
    html, body {
      width: 80mm !important;
      margin: 0 !important;
      padding: 4px 8px !important;
    }
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Courier New', Courier, monospace;
    font-size: 11px;
    padding: 8px 10px 16px;
    line-height: 1.5;
  }
  .center { text-align: center; }
  .bold { font-weight: 700; }
  .divider { border-top: 1px solid #000; margin: 6px 0; }
  .divider-dash { border-top: 1px dashed #000; margin: 6px 0; }
  .right { text-align: right; }
  .footer { font-size: 9px; text-align: center; margin-top: 10px; }
  .row { display: flex; justify-content: space-between; }
</style>
</head>
<body>
  <div class="center" style="margin-bottom:10px">
    <div style="font-size:14px;font-weight:900;font-family:Arial,sans-serif;letter-spacing:1px">MT UNIPOS</div>
    <div style="font-size:8px;text-transform:uppercase;letter-spacing:2px;color:#555">SaaS Platform Billing</div>
    <div style="font-size:9px">Superadmin Console</div>
  </div>
  <div class="divider"></div>
  <div style="margin-bottom:6px;font-size:10px">
    <div>Invoice ID: <span class="bold">${invoice.id}</span></div>
    <div>Tenant ID: <span class="bold">${invoice.tenantId}</span></div>
    <div>Client Name: <span class="bold">${invoice.tenantName}</span></div>
    <div>Email: ${tenantEmail}</div>
    <div>Issued Date: ${invoice.date}</div>
    <div>Due Date: ${invoice.dueDate}</div>
  </div>
  <div class="divider"></div>
  <div style="margin-bottom:6px;font-size:10px">
    <div class="row">
      <span class="bold">Billed Service:</span>
      <span>SaaS Subscription</span>
    </div>
    <div class="row">
      <span>Plan details:</span>
      <span>${invoice.plan}</span>
    </div>
  </div>
  <div class="divider-dash"></div>
  <div class="row" style="font-size:12px;font-weight:900;margin-bottom:6px">
    <span>TOTAL DUE:</span>
    <span>$${invoice.amount.toFixed(2)}</span>
  </div>
  <div class="row" style="font-size:10px;font-weight:700;margin-bottom:6px">
    <span>STATUS:</span>
    <span style="color: ${invoice.status === "Paid" ? "green" : "red"}; text-transform: uppercase;">${invoice.status}</span>
  </div>
  <div class="divider"></div>
  <div class="footer">
    ─────────────────<br/>
    Thank you for subscribing to MT UniPOS!<br/>
    Automated Tenant Provisioning Shards<br/>
    ─────────────────
  </div>
</body>
</html>`;
}

export default function AdminInvoicesPage() {
  const { saasInvoices, tenants, addSaasInvoice, updateSaasInvoiceStatus, deleteSaasInvoice, updateSaasInvoice } = useGlobalContext();
  const [successMsg, setSuccessMsg] = useState("");
  const invoiceSlipRef = React.useRef<HTMLDivElement>(null);
  const [activeInvoice, setActiveInvoice] = useState<any>(null); // For digital view modal
  const [editingInvoice, setEditingInvoice] = useState<any>(null); // For manual edit modal
  const [editForm, setEditForm] = useState({
    amount: "",
    plan: "",
    status: "Unpaid" as "Paid" | "Unpaid"
  });
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Paid" | "Unpaid">("All");
  const [planFilter, setPlanFilter] = useState<"All" | "Starter" | "Professional" | "Enterprise">("All");
  
  // Manual Invoice Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newInvoiceForm, setNewInvoiceForm] = useState({
    tenantId: "",
    amount: "",
    plan: "Professional Monthly",
    status: "Unpaid" as "Paid" | "Unpaid"
  });

  // KPI Calculations
  const stats = useMemo(() => {
    const total = saasInvoices.reduce((acc, inv) => acc + inv.amount, 0);
    const paid = saasInvoices.filter(i => i.status === "Paid").reduce((acc, inv) => acc + inv.amount, 0);
    const unpaid = saasInvoices.filter(i => i.status === "Unpaid").reduce((acc, inv) => acc + inv.amount, 0);
    const rate = total > 0 ? (paid / total) * 100 : 0;
    return { total, paid, unpaid, rate };
  }, [saasInvoices]);

  // Filter Invoices
  const filteredInvoices = useMemo(() => {
    return saasInvoices.filter(inv => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || inv.id.toLowerCase().includes(q) || inv.tenantName.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || inv.status === statusFilter;
      const matchPlan = planFilter === "All" || inv.plan.toLowerCase().includes(planFilter.toLowerCase());
      return matchSearch && matchStatus && matchPlan;
    });
  }, [saasInvoices, searchQuery, statusFilter, planFilter]);

  const handleTriggerEmail = (id: string) => {
    const inv = saasInvoices.find(i => i.id === id);
    if (!inv) return;
    const tenantObj = tenants.find(t => t.id === inv.tenantId);
    const email = tenantObj ? tenantObj.email : "billing@tenant.com";
    setSuccessMsg(`SaaS Onboarding invoice statement sent successfully to client ${inv.tenantName} at ${email}!`);
    setTimeout(() => setSuccessMsg(""), 4500);
  };

  const handleDownloadPdf = async (id: string) => {
    const inv = saasInvoices.find(i => i.id === id);
    if (!inv) return;
    const tenantObj = tenants.find(t => t.id === inv.tenantId);
    const email = tenantObj ? tenantObj.email : "billing@tenant.com";

    // Create temporary offscreen container
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "-9999px";
    container.style.width = "80mm";
    container.style.background = "#ffffff";
    container.style.color = "#000000";
    container.style.fontFamily = "Courier New, Courier, monospace";
    container.style.fontSize = "11px";
    container.style.lineHeight = "1.5";
    container.style.padding = "16px 12px 24px";
    
    container.innerHTML = `
      <div style="text-align:center;margin-bottom:10px;">
        <div style="font-size:14px;font-weight:900;font-family:Arial,sans-serif;letter-spacing:1px">MT UNIPOS</div>
        <div style="font-size:8px;text-transform:uppercase;letter-spacing:2px;color:#555">SaaS Platform Billing</div>
        <div style="font-size:9px">Superadmin Console</div>
      </div>
      <div style="border-top:1px solid #000;margin:6px 0;"></div>
      <div style="margin-bottom:6px;font-size:10px;">
        <div>Invoice ID: <b>${inv.id}</b></div>
        <div>Tenant ID: <b>${inv.tenantId}</b></div>
        <div>Client Name: <b>${inv.tenantName}</b></div>
        <div>Email: ${email}</div>
        <div>Issued Date: ${inv.date}</div>
        <div>Due Date: ${inv.dueDate}</div>
      </div>
      <div style="border-top:1px solid #000;margin:6px 0;"></div>
      <div style="margin-bottom:6px;font-size:10px;">
        <div style="display:flex;justify-content:space-between;">
          <b>Billed Service:</b>
          <span>SaaS Subscription</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span>Plan details:</span>
          <span>${inv.plan}</span>
        </div>
      </div>
      <div style="border-top:1px dashed #000;margin:6px 0;"></div>
      <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:900;margin-bottom:6px;">
        <span>TOTAL DUE:</span>
        <span>$${inv.amount.toFixed(2)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:10px;font-weight:700;margin-bottom:6px;">
        <span>STATUS:</span>
        <span style="color: ${inv.status === "Paid" ? "green" : "red"}; text-transform: uppercase;">${inv.status}</span>
      </div>
      <div style="border-top:1px solid #000;margin:6px 0;"></div>
      <div style="text-align:center;font-size:8px;margin-top:10px;">
        ─────────────────<br/>
        Thank you for subscribing to MT UniPOS!<br/>
        Automated Tenant Provisioning Shards<br/>
        ─────────────────
      </div>
    `;
    
    document.body.appendChild(container);
    
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(container, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false
      });
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `SaaS_Invoice_${inv.id}.jpg`;
      a.click();
      setSuccessMsg(`Downloaded SaaS invoice statement: SaaS_Invoice_${inv.id}.jpg`);
    } catch (err) {
      console.error("Failed to generate image:", err);
    } finally {
      document.body.removeChild(container);
    }
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const handleEditClick = (inv: any) => {
    setEditingInvoice(inv);
    setEditForm({
      amount: inv.amount.toString(),
      plan: inv.plan,
      status: inv.status
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;
    updateSaasInvoice(editingInvoice.id, {
      amount: parseFloat(editForm.amount) || 0,
      plan: editForm.plan,
      status: editForm.status
    });
    setEditingInvoice(null);
    setSuccessMsg(`Invoice ${editingInvoice.id} details updated manually!`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDeleteInvoice = (id: string) => {
    if (confirm(`Are you sure you want to delete invoice ${id}?`)) {
      deleteSaasInvoice(id);
      setSuccessMsg(`Invoice ${id} has been deleted successfully!`);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  // Toggle invoice status directly
  const handleToggleStatus = (id: string, currentStatus: "Paid" | "Unpaid") => {
    const nextStatus = currentStatus === "Paid" ? "Unpaid" : "Paid";
    updateSaasInvoiceStatus(id, nextStatus);
    setSuccessMsg(`Invoice ${id} payment status changed to ${nextStatus}!`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Submit manual invoice creation
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { tenantId, amount, plan, status } = newInvoiceForm;
    if (!tenantId || !amount) return;

    // Find tenant name
    const tenantObj = tenants.find(t => t.id === tenantId);
    const tenantName = tenantObj ? tenantObj.businessName : "Unknown Client";

    addSaasInvoice({
      tenantId,
      tenantName,
      amount: parseFloat(amount) || 0,
      plan,
      status
    });

    setShowCreateModal(false);
    setNewInvoiceForm({
      tenantId: "",
      amount: "",
      plan: "Professional Monthly",
      status: "Unpaid"
    });
    setSuccessMsg(`Manually issued new SaaS invoice for ${tenantName}!`);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Invoice No,Tenant ID,Tenant Name,Plan,Amount,Issued Date,Due Date,Status"]
        .concat(filteredInvoices.map(i => `${i.id},${i.tenantId},"${i.tenantName}",${i.plan},${i.amount},${i.date},${i.dueDate},${i.status}`))
        .join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `unipos_saas_invoices_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setSuccessMsg("Exported SaaS invoices ledger in CSV format!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="flex min-h-screen bg-black text-gray-100 font-sans">
      <AdminSidebar />

      <main className="flex-grow p-6 sm:p-8 space-y-6 overflow-y-auto max-h-screen">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-brand-dark-border/60 pb-4">
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">SaaS Client Invoices</h1>
            <p className="text-[10px] text-gray-500">Track automatic recurring billing cycles, stripe payouts, and custom bank receipt audits.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs px-4 py-2.5 rounded-lg shadow-lg transition"
          >
            <Plus size={14} />
            Issue SaaS Invoice
          </button>
        </div>

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500 p-3 rounded-lg text-xs flex items-center gap-2 text-emerald-400 font-bold animate-fade-in-up">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Dynamic Invoices Statistics summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl p-4 space-y-1">
            <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Total Invoiced</div>
            <div className="text-xl font-black text-white">${stats.total.toLocaleString()}</div>
            <div className="text-[9px] text-purple-400 font-mono">Gross platform revenue</div>
          </div>
          <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl p-4 space-y-1">
            <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Total Collected</div>
            <div className="text-xl font-black text-emerald-400">${stats.paid.toLocaleString()}</div>
            <div className="text-[9px] text-emerald-500/80 font-mono">Paid clear status</div>
          </div>
          <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl p-4 space-y-1">
            <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Outstanding Receivables</div>
            <div className="text-xl font-black text-amber-500">${stats.unpaid.toLocaleString()}</div>
            <div className="text-[9px] text-amber-500/80 font-mono">Unpaid pending standing</div>
          </div>
          <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl p-4 space-y-1">
            <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Collection Rate</div>
            <div className="text-xl font-black text-brand-sky">{stats.rate.toFixed(1)}%</div>
            <div className="text-[9px] text-brand-sky/85 font-mono">SaaS financial efficiency</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-grow">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search by invoice number or tenant client name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-dark-surface/40 border border-brand-dark-border pl-9 pr-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 placeholder-gray-600"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Status dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-brand-dark-surface/40 border border-brand-dark-border px-3 py-1.5 rounded-lg text-[10px] text-gray-300 focus:outline-none focus:border-purple-500"
            >
              <option value="All">All Standings</option>
              <option value="Paid">Paid Only</option>
              <option value="Unpaid">Unpaid Only</option>
            </select>

            {/* Plan dropdown */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value as any)}
              className="bg-brand-dark-surface/40 border border-brand-dark-border px-3 py-1.5 rounded-lg text-[10px] text-gray-300 focus:outline-none focus:border-purple-500"
            >
              <option value="All">All Plans</option>
              <option value="Starter">Starter</option>
              <option value="Professional">Professional</option>
              <option value="Enterprise">Enterprise</option>
            </select>

            {/* Export CSV button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-brand-dark-surface border border-brand-dark-border px-3 py-1.5 rounded-lg text-[10px] text-gray-300 hover:text-white transition"
              title="Download CSV log"
            >
              <Download size={12} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Invoice List */}
        <div className="bg-brand-dark-surface/30 border border-brand-dark-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brand-dark-border text-gray-500 font-mono">
                  <th className="p-4 font-semibold">Invoice No</th>
                  <th className="p-4 font-semibold">Tenant Client Name</th>
                  <th className="p-4 font-semibold">Deploy Plan</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold">Issued Date</th>
                  <th className="p-4 font-semibold">Due Date</th>
                  <th className="p-4 font-semibold">Payment Status</th>
                  <th className="p-4 font-semibold text-center">Settings &amp; Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark-border/40 font-mono text-[11px]">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-600 italic font-sans">
                      No invoices found matching current search/filter settings.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-brand-dark-surface/60 transition">
                      <td className="p-4 text-purple-400 font-bold">{inv.id}</td>
                      <td className="p-4 text-white font-bold">{inv.tenantName}</td>
                      <td className="p-4 text-gray-400">{inv.plan}</td>
                      <td className="p-4 text-white font-bold">${inv.amount.toLocaleString()}</td>
                      <td className="p-4 text-gray-400">{inv.date}</td>
                      <td className="p-4 text-gray-400">{inv.dueDate}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === "Paid" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" :
                          "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex gap-2 justify-center">
                          {/* Toggle Payment Status */}
                          <button
                            onClick={() => handleToggleStatus(inv.id, inv.status as any)}
                            className={`p-1.5 rounded transition ${
                              inv.status === "Paid" 
                                ? "bg-emerald-500/15 text-emerald-400 hover:bg-amber-500/20 hover:text-amber-400" 
                                : "bg-amber-500/15 text-amber-400 hover:bg-emerald-500/20 hover:text-emerald-400"
                            }`}
                            title={inv.status === "Paid" ? "Mark as Unpaid" : "Mark as Paid"}
                          >
                            {inv.status === "Paid" ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                          </button>
                          
                          <button
                            onClick={() => handleDownloadPdf(inv.id)}
                            className="p-1.5 bg-brand-dark-border hover:bg-purple-600/30 text-gray-300 hover:text-white rounded transition"
                            title="Download Invoice Slip"
                          >
                            <Download size={12} />
                          </button>
                          <button
                            onClick={() => handleTriggerEmail(inv.id)}
                            className="p-1.5 bg-brand-dark-border hover:bg-purple-600/30 text-gray-300 hover:text-white rounded transition"
                            title="Resend Email Statement"
                          >
                            <Send size={12} />
                          </button>
                          <button
                            onClick={() => handleEditClick(inv)}
                            className="p-1.5 bg-brand-dark-border hover:bg-amber-600/30 text-gray-300 hover:text-amber-400 rounded transition"
                            title="Edit Invoice"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(inv.id)}
                            className="p-1.5 bg-brand-dark-border hover:bg-red-600/30 text-gray-300 hover:text-red-400 rounded transition"
                            title="Delete Invoice"
                          >
                            <Trash2 size={12} />
                          </button>
                          <button
                            onClick={() => setActiveInvoice(inv)}
                            className="p-1.5 bg-brand-dark-border hover:bg-purple-600/30 text-gray-300 hover:text-white rounded transition"
                            title="View Thermal Slip"
                          >
                            <Eye size={12} />
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

        {/* Thermal Slip View Modal */}
        {activeInvoice && (() => {
          const tenantObj = tenants.find(t => t.id === activeInvoice.tenantId);
          const tenantEmail = tenantObj ? tenantObj.email : "billing@tenant.com";
          const slipHTML = buildThermalInvoiceHTML(activeInvoice, tenantEmail);

          const handlePrintSlip = () => {
            const win = window.open("", "_blank", "width=400,height=700");
            if (!win) return;
            win.document.write(slipHTML);
            win.document.close();
            win.focus();
            setTimeout(() => { win.print(); }, 300);
          };

           const handleDownloadSlip = async () => {
            if (!invoiceSlipRef.current) return;
            try {
              const html2canvas = (await import("html2canvas")).default;
              const canvas = await html2canvas(invoiceSlipRef.current, {
                backgroundColor: "#ffffff",
                scale: 2,
                logging: false,
                useCORS: true
              });
              const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
              const a = document.createElement("a");
              a.href = dataUrl;
              a.download = `SaaS_Invoice_${activeInvoice.id}.jpg`;
              a.click();
            } catch (err) {
              console.error("Failed to generate image:", err);
            }
          };

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 font-sans">
              <div className="bg-[#0d0d0d] border border-brand-dark-border rounded-2xl w-full max-w-sm shadow-2xl flex flex-col max-h-[96vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-brand-dark-border shrink-0">
                  <div>
                    <h3 className="font-black text-white text-sm">Thermal Invoice Slip</h3>
                    <p className="text-[9px] text-gray-500 font-mono">{activeInvoice.id}</p>
                  </div>
                  <button onClick={() => setActiveInvoice(null)} className="text-gray-500 hover:text-white p-1 rounded hover:bg-brand-dark-border transition">
                    <X size={15} />
                  </button>
                </div>

                {/* Slip Preview Area */}
                <div className="flex-grow overflow-y-auto p-4 flex justify-center items-start bg-gray-900/40">
                  <div
                    ref={invoiceSlipRef}
                    className="bg-white text-black font-mono text-[11px] leading-relaxed shadow-2xl animate-fade-in-up"
                    style={{ width: "80mm", minWidth: "80mm", padding: "16px 12px 24px" }}
                  >
                    {/* Header */}
                    <div className="text-center mb-3 space-y-0.5">
                      <div className="font-sans font-black text-sm tracking-tight">MT UNIPOS</div>
                      <div className="text-[8px] uppercase tracking-widest text-gray-500">SaaS Platform Billing</div>
                      <div className="text-[9px] text-gray-700">Superadmin Console</div>
                    </div>

                    <div className="border-t border-black" />

                    {/* Metadata */}
                    <div className="py-2 space-y-0.5 text-[10px]">
                      <div>Invoice ID: <span className="font-bold">{activeInvoice.id}</span></div>
                      <div>Tenant ID: <span className="font-bold">{activeInvoice.tenantId}</span></div>
                      <div>Client Name: <span className="font-bold">{activeInvoice.tenantName}</span></div>
                      <div>Email: {tenantEmail}</div>
                      <div>Issued Date: {activeInvoice.date}</div>
                      <div>Due Date: {activeInvoice.dueDate}</div>
                    </div>

                    <div className="border-t border-black" />

                    {/* Content */}
                    <div className="py-2 space-y-0.5 text-[10px]">
                      <div className="flex justify-between">
                        <span className="font-bold">Billed Service:</span>
                        <span>SaaS Subscription</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Plan details:</span>
                        <span>{activeInvoice.plan}</span>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-black" />

                    {/* Totals */}
                    <div className="flex justify-between font-black text-sm py-2">
                      <span>TOTAL DUE:</span>
                      <span>${activeInvoice.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[10px] pb-1">
                      <span>STATUS:</span>
                      <span className={activeInvoice.status === "Paid" ? "text-emerald-700" : "text-red-700"}>
                        {activeInvoice.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="border-t border-black pt-2 text-center text-[8px] space-y-0.5">
                      <div>─────────────────</div>
                      <div>Thank you for subscribing to MT UniPOS!</div>
                      <div>Automated Tenant Provisioning Shards</div>
                      <div>─────────────────</div>
                    </div>
                  </div>
                </div>

                {/* Print/Download Controls */}
                <div className="px-4 py-3 border-t border-brand-dark-border shrink-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={handlePrintSlip}
                    className="flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase rounded-xl transition"
                  >
                    <Printer size={13} /> Print Slip
                  </button>
                  <button
                    onClick={handleDownloadSlip}
                    className="flex items-center justify-center gap-2 py-2.5 bg-brand-dark-border hover:bg-brand-dark-border/70 text-white font-black text-xs uppercase rounded-xl transition"
                  >
                    <Download size={13} /> Download Slip
                  </button>
                </div>

              </div>
            </div>
          );
        })()}

        {/* Manual Invoice Edit Modal */}
        {editingInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <form 
              onSubmit={handleEditSubmit}
              className="bg-brand-dark-surface border border-purple-500/30 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up space-y-4 text-xs font-sans"
            >
              <div className="flex justify-between items-center border-b border-brand-dark-border pb-3 mb-2">
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-purple-400" />
                  <h3 className="font-black text-white text-sm">Edit SaaS Client Invoice</h3>
                </div>
                <button type="button" onClick={() => setEditingInvoice(null)} className="text-gray-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              {/* Invoice Info */}
              <div className="bg-black/30 p-3 rounded-lg border border-brand-dark-border/40 font-mono space-y-1">
                <div><span className="text-gray-500">Invoice:</span> <span className="text-purple-400 font-bold">{editingInvoice.id}</span></div>
                <div><span className="text-gray-500">Client:</span> <span className="text-white font-bold">{editingInvoice.tenantName}</span></div>
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-gray-400">Invoice Amount ($ USD)</label>
                <input 
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 49"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white"
                />
              </div>

              {/* Plan Billed */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-gray-400">Billed Plan Details</label>
                <select
                  value={editForm.plan}
                  onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white"
                >
                  <option value="Starter Monthly">Starter Plan (Monthly)</option>
                  <option value="Starter Yearly">Starter Plan (Yearly)</option>
                  <option value="Professional Monthly">Professional Plan (Monthly)</option>
                  <option value="Professional Yearly">Professional Plan (Yearly)</option>
                  <option value="Enterprise Monthly">Enterprise Plan (Monthly)</option>
                  <option value="Enterprise Yearly">Enterprise Plan (Yearly)</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-gray-400">Invoice Standing</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="editStatus"
                      checked={editForm.status === "Unpaid"}
                      onChange={() => setEditForm({ ...editForm, status: "Unpaid" })}
                      className="accent-purple-500" 
                    />
                    <span>Unpaid Invoice</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="editStatus"
                      checked={editForm.status === "Paid"}
                      onChange={() => setEditForm({ ...editForm, status: "Paid" })}
                      className="accent-purple-500" 
                    />
                    <span>Paid Clearance</span>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-wide rounded transition"
              >
                Save Changes
              </button>
            </form>
          </div>
        )}

        {/* Manual Invoice Issuance Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <form 
              onSubmit={handleCreateSubmit}
              className="bg-brand-dark-surface border border-purple-500/30 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up space-y-4 text-xs font-sans"
            >
              <div className="flex justify-between items-center border-b border-brand-dark-border pb-3 mb-2">
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-purple-400" />
                  <h3 className="font-black text-white text-sm">Issue SaaS Client Invoice</h3>
                </div>
                <button type="button" onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              {/* Tenant selector */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-gray-400">Select Client Tenant</label>
                <select
                  required
                  value={newInvoiceForm.tenantId}
                  onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, tenantId: e.target.value })}
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white"
                >
                  <option value="">-- Choose registered tenant --</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.businessName} ({t.id})</option>
                  ))}
                </select>
                {tenants.length === 0 && (
                  <p className="text-[9px] text-amber-400 mt-1">Note: No active database shards registered. Provision a client first.</p>
                )}
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-gray-400">Invoice Amount ($ USD)</label>
                <input 
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 49"
                  value={newInvoiceForm.amount}
                  onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, amount: e.target.value })}
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white"
                />
              </div>

              {/* Plan Billed */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-gray-400">Billed Plan Details</label>
                <select
                  value={newInvoiceForm.plan}
                  onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, plan: e.target.value })}
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white"
                >
                  <option value="Starter Monthly">Starter Plan (Monthly)</option>
                  <option value="Starter Yearly">Starter Plan (Yearly)</option>
                  <option value="Professional Monthly">Professional Plan (Monthly)</option>
                  <option value="Professional Yearly">Professional Plan (Yearly)</option>
                  <option value="Enterprise Monthly">Enterprise Plan (Monthly)</option>
                  <option value="Enterprise Yearly">Enterprise Plan (Yearly)</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-gray-400">Initial Standing</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="initialStatus"
                      checked={newInvoiceForm.status === "Unpaid"}
                      onChange={() => setNewInvoiceForm({ ...newInvoiceForm, status: "Unpaid" })}
                      className="accent-purple-500" 
                    />
                    <span>Unpaid Invoice</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="initialStatus"
                      checked={newInvoiceForm.status === "Paid"}
                      onChange={() => setNewInvoiceForm({ ...newInvoiceForm, status: "Paid" })}
                      className="accent-purple-500" 
                    />
                    <span>Paid Clearance</span>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={tenants.length === 0}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-45 disabled:cursor-not-allowed text-white font-black uppercase tracking-wide rounded transition"
              >
                Compile &amp; Issue Invoice
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}
