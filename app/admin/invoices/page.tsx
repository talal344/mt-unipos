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
  const total = Number(invoice.amount || 0);
  const paid = Number(invoice.paidAmount ?? (invoice.status === "Paid" ? total : 0));
  const remaining = Number(invoice.remainingBalance ?? (total - paid));
  const curr = invoice.currency || (invoice.plan?.toLowerCase().includes("usd") || invoice.plan?.includes("$") ? "USD" : "PKR");
  const sym = curr === "USD" || curr === "$" ? "$" : "PKR ";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>SaaS Thermal Invoice ${invoice.id}</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  html, body { width: 80mm; margin: 0; padding: 0; background: #fff; color: #000; }
  @media print { html, body { width: 80mm !important; margin: 0 !important; padding: 4px 8px !important; } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Courier New', Courier, monospace; font-size: 11px; padding: 8px 10px 16px; line-height: 1.5; }
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
    <div style="font-size:8px;text-transform:uppercase;letter-spacing:2px;color:#555">SaaS Enterprise Billing</div>
    <div style="font-size:9px">Superadmin Master Console</div>
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
      <span class="bold">Billed Plan:</span>
      <span>${invoice.plan}</span>
    </div>
    <div class="row">
      <span>Payment Method:</span>
      <span>${invoice.paymentMethod || 'Direct Payment'}</span>
    </div>
  </div>
  <div class="divider-dash"></div>
  <div class="row" style="font-size:11px;font-weight:700;">
    <span>TOTAL BILL:</span>
    <span>${sym}${total.toLocaleString()}</span>
  </div>
  <div class="row" style="font-size:11px;font-weight:700;color:green;">
    <span>PAID RECEIVED:</span>
    <span>${sym}${paid.toLocaleString()}</span>
  </div>
  <div class="row" style="font-size:11px;font-weight:700;color:red;">
    <span>REMAINING DUES:</span>
    <span>${sym}${remaining.toLocaleString()}</span>
  </div>
  <div class="divider-dash"></div>
  <div class="row" style="font-size:10px;font-weight:700;margin-bottom:6px">
    <span>STATUS:</span>
    <span style="color: ${invoice.status === "Paid" ? "green" : invoice.status === "Partial" ? "orange" : "red"}; text-transform: uppercase;">${invoice.status}</span>
  </div>
  <div class="divider"></div>
  <div class="footer">
    ─────────────────<br/>
    Engineered by Founder Mian Talal<br/>
    Support: 03396399895 | miantalal2@gmail.com<br/>
    Thank you for choosing MT UniPOS System!<br/>
    ─────────────────
  </div>
</body>
</html>`;
}

function buildA4ExecutiveInvoiceHTML(invoice: any, tenant: any): string {
  const total = Number(invoice.amount || 0);
  const paid = Number(invoice.paidAmount ?? (invoice.status === "Paid" ? total : 0));
  const remaining = Number(invoice.remainingBalance ?? (total - paid));
  const curr = invoice.currency || (invoice.plan?.toLowerCase().includes("usd") || invoice.plan?.includes("$") ? "USD" : (tenant?.defaultCurrency || "PKR"));
  const sym = curr === "USD" || curr === "$" ? "$" : "PKR ";
  const tenantEmail = tenant?.email || "owner@tenant.com";
  const ownerName = tenant?.ownerName || invoice.tenantName;
  const businessName = tenant?.businessName || invoice.tenantName;
  const workspaceId = invoice.tenantId;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>SaaS Executive Invoice - ${invoice.id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: #ffffff;
      color: #0f172a;
      padding: 40px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .invoice-card {
      border: 2px solid #0ea5e9;
      border-radius: 16px;
      padding: 40px;
      background: #ffffff;
      box-shadow: 0 10px 30px rgba(14,165,233,0.08);
      position: relative;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 24px;
      margin-bottom: 30px;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 900;
      color: #0284c7;
      letter-spacing: -0.5px;
    }
    .brand-sub {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .inv-meta { text-align: right; }
    .inv-id {
      font-size: 18px;
      font-weight: 900;
      color: #0f172a;
      font-family: 'JetBrains Mono', monospace;
    }
    .inv-badge {
      display: inline-block;
      margin-top: 6px;
      font-size: 10px;
      font-weight: 800;
      padding: 5px 12px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .badge-paid { background: #dcfce7; color: #15803d; }
    .badge-partial { background: #fef9c3; color: #a16207; }
    .badge-unpaid { background: #fee2e2; color: #b91c1c; }

    .parties-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 30px;
    }
    .party-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
    }
    .party-title {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      color: #0284c7;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .party-name {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .party-detail {
      font-size: 11px;
      color: #64748b;
      line-height: 1.5;
    }

    .table-container {
      margin-bottom: 30px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    th {
      background: #f1f5f9;
      color: #475569;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
      padding: 12px 16px;
      text-align: left;
    }
    td {
      padding: 16px;
      border-top: 1px solid #e2e8f0;
      color: #0f172a;
    }
    .summary-box {
      width: 320px;
      margin-left: auto;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 30px;
      font-size: 12px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .summary-total {
      border-top: 2px solid #0ea5e9;
      padding-top: 8px;
      font-weight: 900;
      font-size: 15px;
      color: #0284c7;
    }

    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #64748b;
    }
    .footer-bold {
      font-weight: 800;
      color: #0f172a;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; text-align: right;">
    <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 800; cursor: pointer; font-size: 12px; font-family: sans-serif;">
      🖨️ Print / Save Executive A4 PDF
    </button>
  </div>

  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="brand-title">MT UniPOS</div>
        <div class="brand-sub">Enterprise SaaS POS & ERP System</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Super Admin Billing Statement & Receipt</div>
      </div>
      <div class="inv-meta">
        <div class="inv-id">${invoice.id}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Issued Date: ${invoice.date}</div>
        <div class="inv-badge ${
          invoice.status === 'Paid' ? 'badge-paid' : invoice.status === 'Partial' ? 'badge-partial' : 'badge-unpaid'
        }">
          STATUS: ${invoice.status}
        </div>
      </div>
    </div>

    <div class="parties-grid">
      <div class="party-box">
        <div class="party-title">🏢 Billed Provider</div>
        <div class="party-name">MT UniPOS Software Suite</div>
        <div class="party-detail">
          Engineered by Founder <b>Mian Talal</b><br/>
          Support Contact: <b>03396399895</b><br/>
          Corporate Email: <b>miantalal2@gmail.com</b><br/>
          Official Portal: mt-unipos.vercel.app
        </div>
      </div>

      <div class="party-box">
        <div class="party-title">👤 Client / Tenant Information</div>
        <div class="party-name">${businessName}</div>
        <div class="party-detail">
          Workspace / Tenant ID: <b style="color:#0284c7;">${workspaceId}</b><br/>
          Owner Name: <b>${ownerName}</b><br/>
          Registered Email: <b>${tenantEmail}</b><br/>
          Status: <b>${tenant?.status || 'Active'}</b>
        </div>
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Billed Package / Description</th>
            <th>Billing Cycle</th>
            <th>Total Bill (${curr})</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <b>${invoice.plan}</b><br/>
              <span style="font-size:10px;color:#64748b;">Enterprise Sharding Access &amp; Cloud Backup Sync</span>
            </td>
            <td>${invoice.plan.includes('yearly') ? 'Annual' : 'Monthly'}</td>
            <td><b>${sym}${total.toLocaleString()}</b></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="summary-box">
      <div class="summary-row">
        <span>Total Bill Amount:</span>
        <b>${sym}${total.toLocaleString()}</b>
      </div>
      <div class="summary-row" style="color:#16a34a;">
        <span>Amount Received / Paid:</span>
        <b>${sym}${paid.toLocaleString()}</b>
      </div>
      <div class="summary-row summary-total" style="color: ${remaining > 0 ? '#b91c1c' : '#0284c7'};">
        <span>Remaining Balance Due:</span>
        <span>${sym}${remaining.toLocaleString()}</span>
      </div>
    </div>

    <div class="footer">
      <div>
        <span class="footer-bold">MT UniPOS SaaS Management</span> • Payment Method: <b>${invoice.paymentMethod || 'Direct Payment'}</b><br/>
        Notes: <i>${invoice.notes || 'Thank you for subscribing to MT UniPOS Enterprise System!'}</i>
      </div>
      <div style="text-align: right;">
        <span class="footer-bold">Verification:</span> AUTHENTICATED SaaS RECEIPT<br/>
        Issued Date: ${new Date().toLocaleDateString()}
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 500);
    };
  </script>
</body>
</html>`;
}

export default function AdminInvoicesPage() {
  const { saasInvoices, tenants, addSaasInvoice, updateSaasInvoiceStatus, deleteSaasInvoice, updateSaasInvoice, updateTenantStatus } = useGlobalContext();
  const [successMsg, setSuccessMsg] = useState("");
  const invoiceSlipRef = React.useRef<HTMLDivElement>(null);
  const [activeInvoice, setActiveInvoice] = useState<any>(null); // For digital view modal
  const [editingInvoice, setEditingInvoice] = useState<any>(null); // For manual edit modal

  // Payment Gate Activation Modal State
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<any>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "0",
    paidAmount: "0",
    paymentMethod: "Bank Transfer (HBL / Meezan)",
    notes: ""
  });

  const [editForm, setEditForm] = useState({
    amount: "",
    plan: "",
    currency: "PKR" as "PKR" | "USD",
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
    currency: "PKR" as "PKR" | "USD",
    status: "Unpaid" as "Paid" | "Unpaid"
  });

  const formatCurrency = (amt: number, curr?: string, plan?: string, tenantCurrency?: string) => {
    const c = curr || (plan?.toLowerCase().includes("usd") || plan?.includes("$") ? "USD" : (tenantCurrency || "PKR"));
    if (c === "USD" || c === "$") {
      return `$${amt.toLocaleString()}`;
    }
    return `PKR ${amt.toLocaleString()}`;
  };

  const handleOpenPaymentModal = (inv: any) => {
    setPaymentModalInvoice(inv);
    const total = inv.amount || 0;
    const paid = inv.paidAmount ?? (inv.status === "Paid" ? total : 0);
    setPaymentForm({
      amount: total.toString(),
      paidAmount: paid.toString(),
      paymentMethod: inv.paymentMethod || "Bank Transfer (HBL / Meezan)",
      notes: inv.notes || ""
    });
  };

  const handleConfirmPaymentAndActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;

    const total = parseFloat(paymentForm.amount) || 0;
    const paid = parseFloat(paymentForm.paidAmount) || 0;
    const remaining = Math.max(0, total - paid);
    const finalStatus = remaining <= 0 ? "Paid" : paid > 0 ? "Partial" : "Unpaid";
    const curr = paymentModalInvoice.currency || (paymentModalInvoice.plan?.toLowerCase().includes("usd") || paymentModalInvoice.plan?.includes("$") ? "USD" : "PKR");
    const formattedPaid = formatCurrency(paid, curr);

    updateSaasInvoice(paymentModalInvoice.id, {
      amount: total,
      paidAmount: paid,
      remainingBalance: remaining,
      status: finalStatus,
      paymentMethod: paymentForm.paymentMethod,
      notes: paymentForm.notes
    });

    // Automatically Activate Tenant Workspace upon payment confirmation!
    if (paid > 0 || total === 0) {
      updateTenantStatus(paymentModalInvoice.tenantId, "Active");
    }

    setPaymentModalInvoice(null);
    setSuccessMsg(`✅ Payment of ${formattedPaid} confirmed! Workspace ${paymentModalInvoice.tenantName} (${paymentModalInvoice.tenantId}) is now FULLY ACTIVE!`);
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  const handlePrintA4Invoice = (inv: any) => {
    const tenantObj = tenants.find(t => t.id === inv.tenantId);
    const html = buildA4ExecutiveInvoiceHTML(inv, tenantObj);
    const win = window.open("", "_blank", "width=900,height=1000");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  const handlePrintThermalReceipt = (inv: any) => {
    const tenantObj = tenants.find(t => t.id === inv.tenantId);
    const email = tenantObj ? tenantObj.email : "owner@tenant.com";
    const html = buildThermalInvoiceHTML(inv, email);
    const win = window.open("", "_blank", "width=400,height=700");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  // KPI Calculations (Multi-Currency Support: PKR & USD)
  const stats = useMemo(() => {
    let totalPKR = 0, totalUSD = 0;
    let paidPKR = 0, paidUSD = 0;
    let unpaidPKR = 0, unpaidUSD = 0;

    saasInvoices.forEach(inv => {
      const isUSD = inv.currency === "USD" || inv.currency === "$" || inv.plan.toLowerCase().includes("usd") || inv.plan.includes("$");
      const amt = Number(inv.amount || 0);
      const paidAmt = Number(inv.paidAmount ?? (inv.status === "Paid" ? amt : 0));
      const unpaidAmt = Math.max(0, amt - paidAmt);

      if (isUSD) {
        totalUSD += amt;
        paidUSD += paidAmt;
        unpaidUSD += unpaidAmt;
      } else {
        totalPKR += amt;
        paidPKR += paidAmt;
        unpaidPKR += unpaidAmt;
      }
    });

    const totalCount = saasInvoices.length;
    const paidCount = saasInvoices.filter(i => i.status === "Paid").length;
    const rate = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;

    return { totalPKR, totalUSD, paidPKR, paidUSD, unpaidPKR, unpaidUSD, rate };
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

  const handleTriggerEmail = async (id: string) => {
    const inv = saasInvoices.find(i => i.id === id);
    if (!inv) return;
    const tenantObj = tenants.find(t => t.id === inv.tenantId);
    const email = tenantObj ? tenantObj.email : "billing@tenant.com";

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          invoiceId: inv.id,
          businessName: inv.tenantName,
          amount: inv.amount,
          currency: inv.currency || "PKR",
          plan: inv.plan,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`⚡ Invoice ${inv.id} successfully sent via Resend API to ${email}!`);
      } else {
        setSuccessMsg(`📧 Invoice statement generated for ${inv.tenantName} (${email})`);
      }
    } catch {
      setSuccessMsg(`📧 Invoice statement queued for client ${inv.tenantName} at ${email}!`);
    }
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  const handleBackupDb = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    const tenantName = tenant?.businessName || tenantId;

    const TENANT_DATA_KEYS = [
      "unipos_products", "unipos_customers", "unipos_suppliers", "unipos_sales",
      "unipos_expenses", "unipos_employees", "unipos_settings", "unipos_pos",
      "unipos_batches", "unipos_tables", "unipos_kitchen", "unipos_accounts",
      "unipos_journal", "unipos_attendance", "unipos_payroll", "unipos_transfers",
    ];

    const backup: Record<string, any> = {
      _meta: {
        tenantId,
        businessName: tenantName,
        exportedAt: new Date().toISOString(),
        version: "unipos-v1",
      },
      tenantMeta: tenant,
      data: {} as Record<string, any>,
    };

    TENANT_DATA_KEYS.forEach(key => {
      const val = localStorage.getItem(`${key}_${tenantId}`);
      if (val) {
        try { backup.data[key] = JSON.parse(val); } catch { backup.data[key] = val; }
      }
    });

    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `unipos_backup_${tenantId}_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    setSuccessMsg(`✅ Full Database JSON Backup downloaded for ${tenantName}!`);
    setTimeout(() => setSuccessMsg(""), 3500);
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
    const curr = inv.currency || (inv.plan?.toLowerCase().includes("usd") || inv.plan?.includes("$") ? "USD" : "PKR");
    setEditForm({
      amount: inv.amount ? inv.amount.toString() : "0",
      plan: inv.plan || "",
      currency: curr as "PKR" | "USD",
      status: inv.status || "Unpaid"
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;
    updateSaasInvoice(editingInvoice.id, {
      amount: parseFloat(editForm.amount) || 0,
      plan: editForm.plan,
      currency: editForm.currency,
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
    const { tenantId, amount, plan, currency, status } = newInvoiceForm;
    if (!tenantId || !amount) return;

    // Find tenant name
    const tenantObj = tenants.find(t => t.id === tenantId);
    const tenantName = tenantObj ? tenantObj.businessName : "Unknown Client";

    addSaasInvoice({
      tenantId,
      tenantName,
      amount: parseFloat(amount) || 0,
      currency,
      plan,
      status
    });

    setShowCreateModal(false);
    setNewInvoiceForm({
      tenantId: "",
      amount: "",
      plan: "Professional Monthly",
      currency: "PKR",
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

        {/* Dynamic Invoices Statistics summary (PKR & USD) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl p-4 space-y-1">
            <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Total Invoiced</div>
            <div className="text-lg font-black text-white">
              PKR {stats.totalPKR.toLocaleString()} <span className="text-xs text-gray-400 font-normal">/ ${stats.totalUSD.toLocaleString()}</span>
            </div>
            <div className="text-[9px] text-purple-400 font-mono">Gross platform revenue</div>
          </div>
          <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl p-4 space-y-1">
            <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Total Collected</div>
            <div className="text-lg font-black text-emerald-400">
              PKR {stats.paidPKR.toLocaleString()} <span className="text-xs text-emerald-600/80 font-normal">/ ${stats.paidUSD.toLocaleString()}</span>
            </div>
            <div className="text-[9px] text-emerald-500/80 font-mono">Paid clear status</div>
          </div>
          <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl p-4 space-y-1">
            <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Outstanding Receivables</div>
            <div className="text-lg font-black text-amber-500">
              PKR {stats.unpaidPKR.toLocaleString()} <span className="text-xs text-amber-600/80 font-normal">/ ${stats.unpaidUSD.toLocaleString()}</span>
            </div>
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
                  <th className="p-4 font-semibold">Total Bill (Currency)</th>
                  <th className="p-4 font-semibold">Paid Amount</th>
                  <th className="p-4 font-semibold">Remaining Dues</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-center">Payment &amp; Print Controls</th>
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
                  filteredInvoices.map(inv => {
                    const total = Number(inv.amount || 0);
                    const paid = Number(inv.paidAmount ?? (inv.status === "Paid" ? total : 0));
                    const remaining = Math.max(0, total - paid);
                    const linkedTenant = tenants.find(t => t.id === inv.tenantId);
                    const isTenantActive = linkedTenant ? linkedTenant.status === "Active" : inv.status === "Paid";
                    const isFullyPaid = inv.status === "Paid" && remaining <= 0;

                    return (
                      <tr key={inv.id} className="hover:bg-brand-dark-surface/60 transition">
                        <td className="p-4 text-purple-400 font-bold">{inv.id}</td>
                        <td className="p-4 text-white font-bold">{inv.tenantName}</td>
                        <td className="p-4 text-gray-400">{inv.plan}</td>
                        <td className="p-4 text-white font-bold">{formatCurrency(total, inv.currency, inv.plan, linkedTenant?.defaultCurrency)}</td>
                        <td className="p-4 text-emerald-400 font-bold">{formatCurrency(paid, inv.currency, inv.plan, linkedTenant?.defaultCurrency)}</td>
                        <td className="p-4 text-amber-400 font-bold">{formatCurrency(remaining, inv.currency, inv.plan, linkedTenant?.defaultCurrency)}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inv.status === "Paid" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" :
                            inv.status === "Partial" ? "bg-amber-500/10 border border-amber-500/30 text-amber-400" :
                            "bg-red-500/10 border border-red-500/30 text-red-400"
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex gap-2 justify-center items-center">
                            {/* Payment Gate & Activation */}
                            {isFullyPaid || isTenantActive ? (
                              <button
                                onClick={() => handleOpenPaymentModal(inv)}
                                className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] rounded-lg transition flex items-center gap-1"
                                title="View Payment Receipts & Ledger"
                              >
                                <CheckCircle2 size={11} className="text-emerald-400" />
                                <span>Paid &amp; Active</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenPaymentModal(inv)}
                                className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/40 text-amber-300 font-bold text-[10px] rounded-lg transition flex items-center gap-1"
                                title="Enter Amount Received & Activate Tenant Workspace"
                              >
                                <CreditCard size={11} />
                                <span>Payment &amp; Activate</span>
                              </button>
                            )}

                            {/* Download JSON Backup */}
                            <button
                              onClick={() => handleBackupDb(inv.tenantId)}
                              className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 rounded-lg border border-emerald-500/30 transition"
                              title="Download Full Tenant JSON Database Backup"
                            >
                              <Download size={12} />
                            </button>

                            {/* Print Executive A4 PDF */}
                            <button
                              onClick={() => handlePrintA4Invoice(inv)}
                              className="p-1.5 bg-sky-500/20 hover:bg-sky-500/40 text-sky-300 rounded-lg border border-sky-500/30 transition"
                              title="Print / Save Executive A4 PDF Invoice"
                            >
                              <Printer size={12} />
                            </button>

                            {/* Print Thermal Slip */}
                            <button
                              onClick={() => handlePrintThermalReceipt(inv)}
                              className="p-1.5 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 rounded-lg border border-purple-500/30 transition"
                              title="Print Thermal POS Receipt"
                            >
                              <Eye size={12} />
                            </button>

                            {/* Resend Email Statement */}
                            <button
                              onClick={() => handleTriggerEmail(inv.id)}
                              className="p-1.5 bg-brand-dark-border hover:bg-purple-600/30 text-gray-300 hover:text-white rounded transition"
                              title="Resend Email Statement"
                            >
                              <Send size={12} />
                            </button>

                            {/* Delete Invoice */}
                            <button
                              onClick={() => handleDeleteInvoice(inv.id)}
                              className="p-1.5 bg-brand-dark-border hover:bg-red-600/30 text-gray-300 hover:text-red-400 rounded transition"
                              title="Delete Invoice"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Confirmation & Tenant Activation Modal */}
        {paymentModalInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-sans">
            <div className="bg-[#0b0f17] border border-emerald-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
              <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-black/40">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base">Payment Confirmation &amp; Activation</h3>
                    <p className="text-xs text-gray-400">Invoice #{paymentModalInvoice.id} • Client: {paymentModalInvoice.tenantName}</p>
                  </div>
                </div>
                <button onClick={() => setPaymentModalInvoice(null)} className="text-gray-400 hover:text-white p-1 rounded">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmPaymentAndActivate} className="p-6 space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-emerald-300 text-xs font-bold">
                  ℹ️ Payment details submit karne par client workspace automatically <b>ACTIVE</b> ho jaye ga.
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-gray-400 mb-1">
                    Total Plan Bill Amount ({paymentModalInvoice.currency === "USD" ? "$ USD" : "PKR"})
                  </label>
                  <input
                    type="number"
                    required
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-gray-400 mb-1">
                    Amount Received / Paid by Client ({paymentModalInvoice.currency === "USD" ? "$ USD" : "PKR"})
                  </label>
                  <input
                    type="number"
                    required
                    value={paymentForm.paidAmount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paidAmount: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-emerald-400 text-sm font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="bg-black/50 border border-gray-800 p-3 rounded-xl flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-bold">Calculated Remaining Dues:</span>
                  <span className={`font-black text-sm ${
                    (parseFloat(paymentForm.amount) || 0) - (parseFloat(paymentForm.paidAmount) || 0) > 0 ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    {formatCurrency(Math.max(0, (parseFloat(paymentForm.amount) || 0) - (parseFloat(paymentForm.paidAmount) || 0)), paymentModalInvoice.currency, paymentModalInvoice.plan)}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-gray-400 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Bank Transfer (HBL / Meezan)">Bank Transfer (HBL / Meezan)</option>
                    <option value="Cash Payment">Cash Payment</option>
                    <option value="JazzCash / EasyPaisa">JazzCash / EasyPaisa</option>
                    <option value="Cheque / Online Deposit">Cheque / Online Deposit</option>
                    <option value="Free Trial (0 PKR)">Free Trial (0 PKR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-gray-400 mb-1">
                    Notes / Transaction Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HBL Ref #10928374 or Paid in cash"
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentModalInvoice(null)}
                    className="px-4 py-2 bg-gray-800 text-gray-300 font-bold text-xs rounded-xl hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                  >
                    <CheckCircle2 size={14} />
                    Confirm Payment &amp; Activate Tenant
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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

              {/* Currency Selector */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-gray-400">Invoice Currency</label>
                <select
                  value={editForm.currency}
                  onChange={(e) => setEditForm({ ...editForm, currency: e.target.value as "PKR" | "USD" })}
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white font-bold"
                >
                  <option value="PKR">PKR - Pakistani Rupee (Rs)</option>
                  <option value="USD">USD - US Dollar ($)</option>
                </select>
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-gray-400">Invoice Amount ({editForm.currency === "USD" ? "$ USD" : "PKR"})</label>
                <input 
                  type="number"
                  required
                  min="1"
                  placeholder={editForm.currency === "USD" ? "e.g. 150" : "e.g. 25000"}
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white font-bold"
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

              {/* Currency Selector */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-gray-400">Invoice Currency</label>
                <select
                  value={newInvoiceForm.currency}
                  onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, currency: e.target.value as "PKR" | "USD" })}
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white font-bold"
                >
                  <option value="PKR">PKR - Pakistani Rupee (Rs)</option>
                  <option value="USD">USD - US Dollar ($)</option>
                </select>
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-gray-400">Invoice Amount ({newInvoiceForm.currency === "USD" ? "$ USD" : "PKR"})</label>
                <input 
                  type="number"
                  required
                  min="1"
                  placeholder={newInvoiceForm.currency === "USD" ? "e.g. 150" : "e.g. 25000"}
                  value={newInvoiceForm.amount}
                  onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, amount: e.target.value })}
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white font-bold"
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
