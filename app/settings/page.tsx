"use client";

import React, { useState } from "react";
import { useGlobalContext } from "@/context/global-context";
import ClientSidebar from "@/components/client-sidebar";
import {
  Settings, Building, DollarSign, Award, CreditCard, Save, Check,
  Sliders, ShieldAlert, RotateCcw, AlertTriangle, FileText, Image, HelpCircle, HardDrive, Folder,
  Download, Upload, Database, RefreshCw, Trash2
} from "lucide-react";
import { selectAndInitRootFolder } from "@/lib/local-storage-folder";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const {
    currentUser,
    businessSettings, updateBusinessSettings,
    currencySymbol, setCurrencySymbol,
    salesTaxRate, setSalesTaxRate,
    products, customers, suppliers, purchaseOrders, batches,
    posCounters, posShifts, sales, expenses, employees,
    attendanceRecords, payrollRecords, stockTransfers, tables,
    kitchenTickets, accounts, journalEntries, saasInvoices,
    supportTickets, demoRequests, tenants
  } = useGlobalContext();

  const [form, setForm] = useState({
    businessName: businessSettings.businessName || "",
    ownerName: businessSettings.ownerName || "",
    phone: businessSettings.phone || "",
    email: businessSettings.email || "",
    address: businessSettings.address || "",
    city: businessSettings.city || "",
    country: businessSettings.country || "Pakistan",
    taxNumber: businessSettings.taxNumber || "",
    receiptHeader: businessSettings.receiptHeader || "MT UniPOS ERP",
    receiptFooter: businessSettings.receiptFooter || "Thank you for shopping! Powered by MT UniPOS.",
    defaultTaxRate: businessSettings.defaultTaxRate !== undefined ? businessSettings.defaultTaxRate.toString() : "17",
    defaultCurrency: businessSettings.defaultCurrency || "PKR",
    lowStockAlert: businessSettings.lowStockAlert !== undefined ? businessSettings.lowStockAlert.toString() : "10",
    allowCreditSales: businessSettings.allowCreditSales !== undefined ? businessSettings.allowCreditSales : true,
    loyaltyPointsPerAmount: businessSettings.loyaltyPointsPerAmount !== undefined ? businessSettings.loyaltyPointsPerAmount.toString() : "50",
    loyaltyRedeemThreshold: businessSettings.loyaltyRedeemThreshold !== undefined ? businessSettings.loyaltyRedeemThreshold.toString() : "1000",
    loyaltyRedeemValue: businessSettings.loyaltyRedeemValue !== undefined ? businessSettings.loyaltyRedeemValue.toString() : "100",
    logoUrl: businessSettings.logoUrl || "",
  });

  React.useEffect(() => {
    setForm({
      businessName: businessSettings.businessName || "",
      ownerName: businessSettings.ownerName || "",
      phone: businessSettings.phone || "",
      email: businessSettings.email || "",
      address: businessSettings.address || "",
      city: businessSettings.city || "",
      country: businessSettings.country || "Pakistan",
      taxNumber: businessSettings.taxNumber || "",
      receiptHeader: businessSettings.receiptHeader || "MT UniPOS ERP",
      receiptFooter: businessSettings.receiptFooter || "Thank you for shopping! Powered by MT UniPOS.",
      defaultTaxRate: businessSettings.defaultTaxRate !== undefined ? businessSettings.defaultTaxRate.toString() : "17",
      defaultCurrency: businessSettings.defaultCurrency || "PKR",
      lowStockAlert: businessSettings.lowStockAlert !== undefined ? businessSettings.lowStockAlert.toString() : "10",
      allowCreditSales: businessSettings.allowCreditSales !== undefined ? businessSettings.allowCreditSales : true,
      loyaltyPointsPerAmount: businessSettings.loyaltyPointsPerAmount !== undefined ? businessSettings.loyaltyPointsPerAmount.toString() : "50",
      loyaltyRedeemThreshold: businessSettings.loyaltyRedeemThreshold !== undefined ? businessSettings.loyaltyRedeemThreshold.toString() : "1000",
      loyaltyRedeemValue: businessSettings.loyaltyRedeemValue !== undefined ? businessSettings.loyaltyRedeemValue.toString() : "100",
      logoUrl: businessSettings.logoUrl || "",
    });
  }, [businessSettings]);

  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "pos" | "loyalty" | "system">("general");
  const [selectedFolderName, setSelectedFolderName] = useState<string>("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("unipos_selected_folder_name");
      if (saved) setSelectedFolderName(saved);
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSelectFolder = async () => {
    const res = await selectAndInitRootFolder();
    if (res.success && res.folderName) {
      setSelectedFolderName(res.folderName);
      triggerToast(`✅ Storage folder set to: "${res.folderName}"! Subfolders created automatically.`);
    } else if (res.error) {
      triggerToast(`⚠️ ${res.error}`);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      businessName: form.businessName,
      ownerName: form.ownerName,
      phone: form.phone,
      email: form.email,
      address: form.address,
      city: form.city,
      country: form.country,
      taxNumber: form.taxNumber,
      receiptHeader: form.receiptHeader,
      receiptFooter: form.receiptFooter,
      defaultTaxRate: parseFloat(form.defaultTaxRate) || 0,
      defaultCurrency: form.defaultCurrency,
      lowStockAlert: parseInt(form.lowStockAlert) || 0,
      allowCreditSales: form.allowCreditSales,
      loyaltyPointsPerAmount: parseInt(form.loyaltyPointsPerAmount) || 50,
      loyaltyRedeemThreshold: parseInt(form.loyaltyRedeemThreshold) || 1000,
      loyaltyRedeemValue: parseInt(form.loyaltyRedeemValue) || 100,
      logoUrl: form.logoUrl,
    };

    // Update business settings inside context
    updateBusinessSettings(payload);

    // Sync direct context configurations
    setCurrencySymbol(form.defaultCurrency);
    setSalesTaxRate(parseFloat(form.defaultTaxRate) || 0);

    triggerToast("Business settings saved and synced successfully!");
  };

  const handleResetDatabase = async () => {
    const tid = currentUser?.tenantId;
    const storeName = form.businessName || currentUser?.businessName || "This Store";

    if (!tid) {
      triggerToast("⚠️ Store Tenant ID not identified. Cannot reset data.");
      return;
    }

    const confirm1 = confirm(
      `⚠️ WARNING: ARE YOU SURE YOU WANT TO RESET STORE DATA FOR "${storeName.toUpperCase()}"?\n\n` +
      "This action will PERMANENTLY ERASE ALL TRANSACTION DATA FOR THIS STORE ONLY:\n" +
      "• 🏷️ All Products & Inventory Catalog\n" +
      "• 🧾 All Sales Transactions & Bills\n" +
      "• 👤 All Customers, Debtors & Wallet Balances\n" +
      "• 🚚 All Suppliers & Purchase Orders\n" +
      "• 💸 All Expenses & Payroll Records\n" +
      "• 📖 All Accounting Ledgers & Journal Entries\n" +
      "• 👥 All Staff & Attendance Records\n" +
      "• ⚙️ Shift Logs & Store History\n\n" +
      "🔒 STRICT MULTI-TENANT SAFEGUARDS:\n" +
      "1. Other stores/shops data will NOT be touched or affected.\n" +
      "2. Store Owner login email & password credentials will NOT be deleted.\n\n" +
      "Do you wish to proceed?"
    );

    if (!confirm1) return;

    const confirm2 = confirm(
      `🚨 FINAL CONFIRMATION FOR "${storeName.toUpperCase()}"!\n\n` +
      "Are you 100% sure you want to wipe all transaction records for this store?"
    );

    if (!confirm2) return;

    triggerToast("⏳ Wiping store database from local and online cloud DB...");

    // 1. Wipe Online Supabase Cloud Database records for this tenant
    if (typeof window !== "undefined" && navigator.onLine && supabase) {
      try {
        // Delete all tenant collections
        await supabase.from('unipos_collections').delete().eq('tenant_id', tid);
        
        // Also explicitly upsert empty arrays for all collections so cloud sync doesn't restore old rows
        const collectionsToFlush = [
          "unipos_products", "unipos_customers", "unipos_suppliers", 
          "unipos_pos", "unipos_sales", "unipos_expenses", 
          "unipos_employees", "unipos_tables", "unipos_kitchen", 
          "unipos_accounts", "unipos_settings", "unipos_due_recovery",
          "unipos_shifts", "unipos_batches", "unipos_transfers", "unipos_payroll", "unipos_receipts"
        ];

        for (const col of collectionsToFlush) {
          await supabase.from('unipos_collections').upsert({
            tenant_id: tid,
            collection: col,
            item_id: 'all',
            data: [],
            updated_at: new Date().toISOString()
          });
        }
      } catch (e) {
        console.error("Supabase cloud reset error:", e);
      }
    }

    // 2. Clear IndexedDB offline database queue
    if (typeof window !== "undefined" && window.indexedDB) {
      try {
        window.indexedDB.deleteDatabase("mt-unipos-offline-db");
      } catch (e) {}
    }

    // 3. Clear LocalStorage keys specific to THIS tenant
    if (typeof window !== "undefined") {
      const tenantKeys = [
        `unipos_products_${tid}`,
        `unipos_customers_${tid}`,
        `unipos_suppliers_${tid}`,
        `unipos_pos_${tid}`,
        `unipos_sales_${tid}`,
        `unipos_expenses_${tid}`,
        `unipos_employees_${tid}`,
        `unipos_tables_${tid}`,
        `unipos_kitchen_${tid}`,
        `unipos_accounts_${tid}`,
        `unipos_settings_${tid}`,
        `unipos_due_recovery_${tid}`,
        `unipos_shifts_${tid}`,
        `unipos_batches_${tid}`,
        `unipos_transfers_${tid}`,
        `unipos_held_carts_${tid}`,
        `unipos_receipts_${tid}`,
        `unipos_payroll_${tid}`
      ];

      // Set to empty arrays
      tenantKeys.forEach(k => {
        try {
          localStorage.setItem(k, "[]");
        } catch (e) {}
      });

      // Remove dynamic keys matching _${tid}
      try {
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
          if (key.endsWith(`_${tid}`) && key !== "unipos_current_user" && key !== "unipos_tenants") {
            localStorage.setItem(key, "[]");
          }
        });
      } catch (e) {}
    }

    triggerToast(`💣 Store "${storeName}" database wiped clean! Owner credentials preserved.`);
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  const handleBackup = () => {
    const tid = currentUser?.tenantId || "default";
    
    // Everything Backup Payload
    const backupData = {
      backupMeta: {
        appName: "MT UniPOS ERP",
        version: "1.2",
        exportedAt: new Date().toISOString(),
        exportedBy: currentUser?.name || "Store Owner",
        tenantId: tid,
      },
      businessSettings,
      products,
      customers,
      suppliers,
      purchaseOrders,
      batches,
      posCounters,
      posShifts,
      sales,
      expenses,
      employees,
      attendanceRecords,
      payrollRecords,
      stockTransfers,
      tables,
      kitchenTickets,
      accounts,
      journalEntries,
      saasInvoices,
      supportTickets,
      demoRequests,
      tenants,
      rawLocalStorage: typeof window !== "undefined" ? { ...localStorage } : {},
    };

    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = (businessSettings?.businessName || "store").replace(/\s+/g, '-').toLowerCase();
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `MT-UniPOS-Full-Backup-${safeName}-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    triggerToast("✅ Everything Backup exported & downloaded successfully!");
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonText = event.target?.result as string;
        const data = JSON.parse(jsonText);

        const prodCount = Array.isArray(data.products) ? data.products.length : 0;
        const salesCount = Array.isArray(data.sales) ? data.sales.length : 0;
        const custCount = Array.isArray(data.customers) ? data.customers.length : 0;
        const expCount = Array.isArray(data.expenses) ? data.expenses.length : 0;
        const bName = data.businessSettings?.businessName || data.backupMeta?.appName || "MT UniPOS Store";

        const confirmMsg = `Are you sure you want to RESTORE this full system backup?\n\n` +
          `🏢 Store Name: ${bName}\n` +
          `📅 Backup Created: ${data.backupMeta?.exportedAt ? new Date(data.backupMeta.exportedAt).toLocaleString() : "Unknown"}\n` +
          `🏷️ Products: ${prodCount}\n` +
          `🧾 Sales Transactions: ${salesCount}\n` +
          `👤 Customers: ${custCount}\n` +
          `💸 Expenses: ${expCount}\n\n` +
          `WARNING: This will replace current local database records with the backup data. Do you wish to proceed?`;

        if (confirm(confirmMsg)) {
          const tid = currentUser?.tenantId || "default";

          if (data.rawLocalStorage && typeof window !== "undefined") {
            Object.entries(data.rawLocalStorage).forEach(([k, v]) => {
              if (typeof v === "string" && (k.startsWith("unipos_") || k.includes(tid))) {
                localStorage.setItem(k, v);
              }
            });
          }

          if (data.businessSettings) localStorage.setItem(`unipos_settings_${tid}`, JSON.stringify(data.businessSettings));
          if (data.products) localStorage.setItem(`unipos_products_${tid}`, JSON.stringify(data.products));
          if (data.customers) localStorage.setItem(`unipos_customers_${tid}`, JSON.stringify(data.customers));
          if (data.suppliers) localStorage.setItem(`unipos_suppliers_${tid}`, JSON.stringify(data.suppliers));
          if (data.sales) localStorage.setItem(`unipos_sales_${tid}`, JSON.stringify(data.sales));
          if (data.expenses) localStorage.setItem(`unipos_expenses_${tid}`, JSON.stringify(data.expenses));

          triggerToast("✅ Full Database Backup Restored! Reloading system...");
          setTimeout(() => window.location.reload(), 1200);
        }
      } catch (error) {
        alert("⚠️ Invalid backup file format! Could not parse JSON data.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="flex min-h-screen bg-black text-gray-100 font-sans">
      <ClientSidebar />

      {toast && (
        <div className="fixed top-4 right-4 bg-emerald-500/95 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-2xl z-50 flex items-center gap-2 animate-bounce">
          <Check size={14} /> {toast}
        </div>
      )}

      <main className="flex-grow p-6 sm:p-8 space-y-6 overflow-y-auto max-h-screen">
        
        {/* Header section */}
        <div className="flex justify-between items-center border-b border-brand-dark-border/60 pb-4">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Settings size={22} className="text-brand-sky" />
              Settings Panel
            </h1>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Configure your MT UniPOS business environment, tax rates, receipt thermal configurations, and loyalty programs.
            </p>
          </div>
        </div>

        {/* Outer form and sidebar grid */}
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Tabs Sidebar navigation (3 columns) */}
          <div className="lg:col-span-3 bg-brand-dark-surface/40 border border-brand-dark-border rounded-2xl p-4 space-y-1">
            {[
              { id: "general", label: "General Business", icon: Building },
              { id: "pos", label: "POS & Taxation", icon: Sliders },
              { id: "loyalty", label: "Loyalty Programs", icon: Award },
              { id: "system", label: "System Maintenance", icon: HardDrive },
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition ${
                  activeTab === t.id
                    ? "bg-brand-sky text-black font-black"
                    : "text-gray-400 hover:bg-brand-dark-surface hover:text-white"
                }`}
              >
                <t.icon size={14} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Form Content body (9 columns) */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* GENERAL BUSINESS TAB */}
            {activeTab === "general" && (
              <div className="bg-brand-dark-surface/20 border border-brand-dark-border rounded-2xl p-6 space-y-5 animate-fade-in-up">
                <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-brand-dark-border/40 pb-2 flex items-center gap-2">
                  <Building size={14} className="text-brand-sky" />
                  General Business Identity
                </h3>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Registered Business Name *</label>
                    <input
                      type="text" required
                      value={form.businessName}
                      onChange={e => setForm({ ...form, businessName: e.target.value })}
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded-lg text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Business Owner Name *</label>
                    <input
                      type="text" required
                      value={form.ownerName}
                      onChange={e => setForm({ ...form, ownerName: e.target.value })}
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Official Mobile Contact *</label>
                    <input
                      type="text" required
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Business Email Address *</label>
                    <input
                      type="email" required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">State Tax Registration Number (NTN / GST)</label>
                    <input
                      type="text"
                      placeholder="e.g. GST-1234567-8"
                      value={form.taxNumber}
                      onChange={e => setForm({ ...form, taxNumber: e.target.value })}
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Corporate Brand Logo URL</label>
                    <div className="relative">
                      <Image size={13} className="absolute left-3 top-3.5 text-gray-500" />
                      <input
                        type="text"
                        placeholder="https://yourstore.com/logo.png"
                        value={form.logoUrl}
                        onChange={e => setForm({ ...form, logoUrl: e.target.value })}
                        className="w-full bg-black border border-brand-dark-border pl-9 p-2.5 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={e => setForm({ ...form, address: e.target.value })}
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">City / State</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={e => setForm({ ...form, city: e.target.value })}
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded-lg text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* POS & TAXATION TAB */}
            {activeTab === "pos" && (
              <div className="bg-brand-dark-surface/20 border border-brand-dark-border rounded-2xl p-6 space-y-5 animate-fade-in-up">
                <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-brand-dark-border/40 pb-2 flex items-center gap-2">
                  <Sliders size={14} className="text-brand-sky" />
                  POS Checkout &amp; Billing Rules
                </h3>

                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Default Sales Tax Rate (%)</label>
                    <input
                      type="number" min="0" max="100"
                      value={form.defaultTaxRate}
                      onChange={e => setForm({ ...form, defaultTaxRate: e.target.value })}
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded-lg text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Base Currency Symbol</label>
                    <select
                      value={form.defaultCurrency}
                      onChange={e => setForm({ ...form, defaultCurrency: e.target.value })}
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded-lg text-white font-bold"
                    >
                      <option value="PKR">PKR (Rs.)</option>
                      <option value="USD">USD ($)</option>
                      <option value="SAR">SAR (SR)</option>
                      <option value="AED">AED (Dh)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Low Stock Alert Threshold</label>
                    <input
                      type="number" min="0"
                      value={form.lowStockAlert}
                      onChange={e => setForm({ ...form, lowStockAlert: e.target.value })}
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded-lg text-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="bg-brand-dark-surface/40 p-4 border border-brand-dark-border/80 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase">Enable Credit Sales (On Credit)</h4>
                      <p className="text-[9px] text-gray-500">Allow customers to buy goods on due account (Accounts Receivable balance)</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, allowCreditSales: !form.allowCreditSales })}
                      className={`w-12 h-6 rounded-full p-1 transition-all ${
                        form.allowCreditSales ? "bg-brand-sky" : "bg-brand-dark-border"
                      }`}
                    >
                      <div className={`h-4 w-4 bg-black rounded-full transition-all ${
                        form.allowCreditSales ? "translate-x-6" : "translate-x-0"
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <h4 className="text-[10px] uppercase font-bold text-gray-400">Thermal Receipt Thermal Header / Footer Customizer</h4>
                  <div>
                    <label className="block text-[9px] text-gray-500 mb-1">Receipt Top Header Text</label>
                    <input
                      type="text"
                      value={form.receiptHeader}
                      onChange={e => setForm({ ...form, receiptHeader: e.target.value })}
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-500 mb-1">Receipt Bottom Footer Message</label>
                    <textarea
                      rows={2}
                      value={form.receiptFooter}
                      onChange={e => setForm({ ...form, receiptFooter: e.target.value })}
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded-lg text-white text-[11px] resize-none focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* LOYALTY PROGRAMS TAB */}
            {activeTab === "loyalty" && (
              <div className="bg-brand-dark-surface/20 border border-brand-dark-border rounded-2xl p-6 space-y-5 animate-fade-in-up">
                <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-brand-dark-border/40 pb-2 flex items-center gap-2">
                  <Award size={14} className="text-brand-sky" />
                  CRM Loyalty Rewards Calculator
                </h3>

                <div className="bg-yellow-500/10 border border-yellow-500/20 p-3.5 rounded-xl text-[10px] text-gray-400 flex gap-2">
                  <AlertTriangle className="text-yellow-400 shrink-0 mt-0.5" size={13} />
                  <span>
                    Loyalty points program triggers automatically during sales checkouts inside the POS cashier terminal. Adjust parameters below to recalculate member points.
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 font-sans">Points Per Amount ({currencySymbol})</label>
                    <div className="relative">
                      <DollarSign size={12} className="absolute left-3 top-3 text-gray-500" />
                      <input
                        type="number" min="1"
                        value={form.loyaltyPointsPerAmount}
                        onChange={e => setForm({ ...form, loyaltyPointsPerAmount: e.target.value })}
                        className="w-full bg-black border border-brand-dark-border pl-8 p-2.5 rounded-lg text-white font-bold"
                      />
                    </div>
                    <span className="text-[8px] text-gray-500 mt-1 block font-sans">Customer gets 1 point per this PKR amount.</span>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 font-sans">Redeem Threshold (pts)</label>
                    <input
                      type="number" min="1"
                      value={form.loyaltyRedeemThreshold}
                      onChange={e => setForm({ ...form, loyaltyRedeemThreshold: e.target.value })}
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded-lg text-white font-bold"
                    />
                    <span className="text-[8px] text-gray-500 mt-1 block font-sans">Minimum points needed to qualify for discount voucher.</span>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 font-sans">Discount Value ({currencySymbol})</label>
                    <input
                      type="number" min="1"
                      value={form.loyaltyRedeemValue}
                      onChange={e => setForm({ ...form, loyaltyRedeemValue: e.target.value })}
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded-lg text-white font-bold"
                    />
                    <span className="text-[8px] text-gray-500 mt-1 block font-sans">Discount voucher value rewarded per threshold redeem.</span>
                  </div>
                </div>

                <div className="border-t border-brand-dark-border/40 pt-4">
                  <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-2">Simulated Reward Program Formula</h4>
                  <div className="bg-black/60 border border-brand-dark-border p-4 rounded-xl font-mono text-[10px] leading-relaxed space-y-1">
                    <div>1. Purchase Bill of <span className="text-brand-sky font-bold">PKR 5,000</span> will earn:</div>
                    <div className="text-yellow-400 font-bold ml-4">
                      = 5,000 / {form.loyaltyPointsPerAmount || "50"} = {Math.round(5000 / (parseInt(form.loyaltyPointsPerAmount) || 50))} points.
                    </div>
                    <div className="mt-2">2. When member balance crosses <span className="text-yellow-400 font-bold">{form.loyaltyRedeemThreshold || "1000"} pts</span>:</div>
                    <div className="text-emerald-400 font-bold ml-4">
                      = Customer receives flat discount of <span className="underline">PKR {form.loyaltyRedeemValue || "100"}</span> on next POS ticket.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SYSTEM MAINTENANCE TAB */}
            {activeTab === "system" && (
              <div className="bg-brand-dark-surface/20 border border-brand-dark-border rounded-2xl p-6 space-y-5 animate-fade-in-up">
                <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-brand-dark-border/40 pb-2 flex items-center gap-2">
                  <ShieldAlert size={14} className="text-red-400" />
                  System Database Maintenance
                </h3>

                <div className="flex flex-col justify-between p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                        <Folder size={14} className="text-emerald-400" /> Auto-Save Receipts &amp; Reports Storage Folder
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Select a folder on your PC (e.g. Documents). MT UniPOS will automatically create subfolders (<span className="font-mono text-emerald-400 font-bold">Sale Receipts</span>, <span className="font-mono text-emerald-400 font-bold">Reports</span>, etc.) and save files directly into it!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-black/40 border border-brand-dark-border p-3 rounded-lg text-xs font-mono">
                    <div>
                      <span className="text-gray-500 text-[10px] block">Current Storage Folder:</span>
                      <span className="text-emerald-400 font-bold">
                        {selectedFolderName ? `📁 ${selectedFolderName} (Subfolders created)` : "⚠️ Default System Folder (Click button to select custom folder)"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSelectFolder}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[11px] uppercase rounded-lg shadow transition shrink-0 flex items-center gap-1.5"
                    >
                      <Folder size={13} /> {selectedFolderName ? "Change Folder" : "Select Storage Folder"}
                    </button>
                  </div>
                </div>

                {/* EVERYTHING BACKUP & RESTORE SECTION */}
                <div className="bg-brand-dark-surface/40 border border-brand-sky/30 rounded-xl p-5 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-brand-dark-border/60 pb-3">
                    <div>
                      <h4 className="text-xs font-black text-white flex items-center gap-2">
                        <Database size={16} className="text-brand-sky" /> Full System Database Backup &amp; Restore (Everything Backup)
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Export a 100% complete JSON backup containing all products, inventory, sales transactions, customer ledgers, double-entry accounting, expenses, staff, and business settings.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Export Card */}
                    <div className="bg-black/50 border border-brand-dark-border/80 p-4 rounded-xl space-y-3">
                      <div>
                        <span className="text-xs font-bold text-emerald-400 block">📥 Export Everything Backup</span>
                        <p className="text-[10px] text-gray-400 mt-1">Download a single-file complete system backup JSON to your computer or USB drive for safety.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleBackup}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs py-2.5 rounded-lg transition uppercase tracking-wider shadow-lg shadow-emerald-500/20"
                      >
                        <Download size={14} /> Export Complete Backup (.json)
                      </button>
                    </div>

                    {/* Import / Restore Card */}
                    <div className="bg-black/50 border border-brand-dark-border/80 p-4 rounded-xl space-y-3">
                      <div>
                        <span className="text-xs font-bold text-brand-sky block">📤 Import &amp; Restore Backup</span>
                        <p className="text-[10px] text-gray-400 mt-1">Select a previously exported `.json` backup file from your computer to restore all store records.</p>
                      </div>
                      <label className="w-full flex items-center justify-center gap-2 bg-brand-sky hover:bg-brand-sky-light text-black font-black text-xs py-2.5 rounded-lg transition uppercase tracking-wider shadow-lg shadow-sky-500/20 cursor-pointer">
                        <Upload size={14} /> Select Backup File to Restore
                        <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-xl text-xs space-y-3 mt-4">
                  <div className="flex items-center justify-between border-b border-red-500/20 pb-2">
                    <p className="font-black text-red-400 flex items-center gap-1.5 uppercase tracking-wider text-xs">
                      <AlertTriangle className="text-red-400" size={15} /> DANGER ZONE — STORE DATABASE RESET
                    </p>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                      <Check size={11} /> STORE ISOLATED
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    Executing a store reset will <strong>PERMANENTLY ERASE ALL TRANSACTION RECORDS FOR THIS STORE ONLY</strong> (products, sales history, customer ledgers, staff records, supplier dues, expenses, shift logs).
                  </p>

                  <div className="p-3 bg-black/60 border border-brand-dark-border/80 rounded-xl space-y-1 text-[11px]">
                    <span className="text-emerald-400 font-bold block flex items-center gap-1">
                      <Check size={13} /> Strict Multi-Tenant Safeguards Active:
                    </span>
                    <ul className="text-gray-400 space-y-0.5 pl-4 list-disc text-[10px]">
                      <li>Only THIS store's data ({form.businessName || "Active Store"}) will be cleared. Other shops/branches remain 100% untouched.</li>
                      <li>Store Owner login credentials (email &amp; password) are <strong>PRESERVED &amp; NOT DELETED</strong>.</li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-black/60 border border-red-500/30 rounded-xl mt-2">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Trash2 size={14} className="text-red-400" /> Wipe This Store's Database
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Flush products, sales, customers, staff &amp; ledgers for {form.businessName || "this store"}.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetDatabase}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase rounded-lg shadow-lg shadow-red-600/30 transition shrink-0"
                    >
                      <Trash2 size={14} /> Wipe Store Database
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons footer */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-brand-sky hover:bg-brand-sky-light text-black font-black text-xs px-5 py-3 rounded-lg shadow-lg transition"
              >
                <Save size={14} /> Save Business Settings
              </button>
            </div>

          </div>

        </form>

      </main>
    </div>
  );
}
