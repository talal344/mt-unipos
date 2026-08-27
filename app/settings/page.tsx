"use client";

import React, { useState } from "react";
import { useGlobalContext } from "@/context/global-context";
import ClientSidebar from "@/components/client-sidebar";
import {
  Settings, Building, DollarSign, Award, CreditCard, Save, Check,
  Sliders, ShieldAlert, RotateCcw, AlertTriangle, FileText, Image, HelpCircle, HardDrive, Folder,
  Download, Upload, Database, RefreshCw, Trash2, Laptop, ShieldCheck, Key, Plus, CheckCircle2, XCircle, Smartphone, Shield
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
    supportTickets, demoRequests, tenants,
    theme
  } = useGlobalContext();
  const isLight = theme === "light";

  const tid = currentUser?.tenantId || "";

  const [form, setForm] = useState({
    businessName: businessSettings.businessName || "",
    ownerName: businessSettings.ownerName || "",
    phone: businessSettings.phone || "",
    email: businessSettings.email || "",
    address: businessSettings.address || "",
    city: businessSettings.city || "",
    country: businessSettings.country || "Pakistan",
    taxNumber: businessSettings.taxNumber || "",
    receiptHeader: businessSettings.receiptHeader || "MT Core",
    receiptFooter: businessSettings.receiptFooter || "Thank you for shopping! Powered by MT Core — The core technology behind your business.",
    defaultTaxRate: businessSettings.defaultTaxRate !== undefined ? businessSettings.defaultTaxRate.toString() : "17",
    defaultCurrency: businessSettings.defaultCurrency || "PKR",
    lowStockAlert: businessSettings.lowStockAlert !== undefined ? businessSettings.lowStockAlert.toString() : "10",
    allowCreditSales: businessSettings.allowCreditSales !== undefined ? businessSettings.allowCreditSales : true,
    loyaltyPointsPerAmount: businessSettings.loyaltyPointsPerAmount !== undefined ? businessSettings.loyaltyPointsPerAmount.toString() : "50",
    loyaltyRedeemThreshold: businessSettings.loyaltyRedeemThreshold !== undefined ? businessSettings.loyaltyRedeemThreshold.toString() : "1000",
    loyaltyRedeemValue: businessSettings.loyaltyRedeemValue !== undefined ? businessSettings.loyaltyRedeemValue.toString() : "100",
    logoUrl: businessSettings.logoUrl || "",
    enforceTerminalBinding: businessSettings.enforceTerminalBinding || false,
  });

  const [terminalNameInput, setTerminalNameInput] = useState("");
  const [currentDeviceToken, setCurrentDeviceToken] = useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined" && tid) {
      const token = localStorage.getItem(`unipos_terminal_token_${tid}`) || "";
      setCurrentDeviceToken(token);
    }
  }, [tid, businessSettings]);

  const currentRegisteredTerminal = (businessSettings.authorizedTerminals || []).find(
    (t: any) => t.token && t.token === currentDeviceToken && t.status === "Active"
  );

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
      receiptHeader: businessSettings.receiptHeader || "MT Core",
      receiptFooter: businessSettings.receiptFooter || "Thank you for shopping! Powered by MT Core — The core technology behind your business.",
      defaultTaxRate: businessSettings.defaultTaxRate !== undefined ? businessSettings.defaultTaxRate.toString() : "17",
      defaultCurrency: businessSettings.defaultCurrency || "PKR",
      lowStockAlert: businessSettings.lowStockAlert !== undefined ? businessSettings.lowStockAlert.toString() : "10",
      allowCreditSales: businessSettings.allowCreditSales !== undefined ? businessSettings.allowCreditSales : true,
      loyaltyPointsPerAmount: businessSettings.loyaltyPointsPerAmount !== undefined ? businessSettings.loyaltyPointsPerAmount.toString() : "50",
      loyaltyRedeemThreshold: businessSettings.loyaltyRedeemThreshold !== undefined ? businessSettings.loyaltyRedeemThreshold.toString() : "1000",
      loyaltyRedeemValue: businessSettings.loyaltyRedeemValue !== undefined ? businessSettings.loyaltyRedeemValue.toString() : "100",
      logoUrl: businessSettings.logoUrl || "",
      enforceTerminalBinding: businessSettings.enforceTerminalBinding || false,
    });
  }, [businessSettings]);

  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "pos" | "loyalty" | "system" | "security">("general");
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

  const handleRegisterCurrentDevice = () => {
    if (!tid) return;
    const name = terminalNameInput.trim() || `Counter Terminal ${((businessSettings.authorizedTerminals || []).length + 1)}`;
    const newToken = "TRM-" + Math.random().toString(36).substring(2, 9).toUpperCase() + "-" + Date.now().toString(36).toUpperCase();

    localStorage.setItem(`unipos_terminal_token_${tid}`, newToken);
    setCurrentDeviceToken(newToken);

    const newTerminal = {
      id: "TRM-" + Date.now(),
      name,
      token: newToken,
      registeredAt: new Date().toISOString(),
      registeredBy: currentUser?.name || "Store Owner",
      status: "Active" as const,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : ""
    };

    const updated = [...(businessSettings.authorizedTerminals || []), newTerminal];
    updateBusinessSettings({
      ...businessSettings,
      authorizedTerminals: updated
    });
    setTerminalNameInput("");
    triggerToast(`✅ This device is now registered as "${name}"!`);
  };

  const handleRevokeTerminal = (termId: string) => {
    const target = (businessSettings.authorizedTerminals || []).find(t => t.id === termId);
    if (!target) return;
    if (!confirm(`Are you sure you want to revoke authorization for "${target.name}"?\n\nStaff and cashiers will no longer be able to log in from that computer.`)) return;

    const updated = (businessSettings.authorizedTerminals || []).map(t => {
      if (t.id === termId) return { ...t, status: "Revoked" as const };
      return t;
    });

    if (target.token === currentDeviceToken) {
      localStorage.removeItem(`unipos_terminal_token_${tid}`);
      setCurrentDeviceToken("");
    }

    updateBusinessSettings({
      ...businessSettings,
      authorizedTerminals: updated
    });
    triggerToast(`✅ Terminal "${target.name}" authorization revoked.`);
  };

  const handleDeleteTerminal = (termId: string) => {
    const target = (businessSettings.authorizedTerminals || []).find(t => t.id === termId);
    if (!confirm(`Delete "${target?.name || "Terminal"}" permanently from registered devices?`)) return;

    const updated = (businessSettings.authorizedTerminals || []).filter(t => t.id !== termId);
    if (target?.token === currentDeviceToken) {
      localStorage.removeItem(`unipos_terminal_token_${tid}`);
      setCurrentDeviceToken("");
    }
    updateBusinessSettings({
      ...businessSettings,
      authorizedTerminals: updated
    });
    triggerToast(`✅ Terminal deleted.`);
  };

  const handleToggleTerminalBinding = (enforce: boolean) => {
    setForm(prev => ({ ...prev, enforceTerminalBinding: enforce }));
    updateBusinessSettings({
      ...businessSettings,
      enforceTerminalBinding: enforce
    });
    triggerToast(enforce ? "🔒 Terminal Hardware Lock ACTIVATED! Staff can only log in from registered computers." : "🔓 Terminal Lock DEACTIVATED. Staff can log in from any device.");
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
      ...businessSettings,
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
      enforceTerminalBinding: form.enforceTerminalBinding,
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
        appName: "MT Core Enterprise Platform",
        slogan: "The core technology behind your business.",
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
    a.download = `MT-Core-Full-Backup-${safeName}-${dateStr}.json`;
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
        const bName = data.businessSettings?.businessName || data.backupMeta?.appName || "MT Core Store";

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
    <div className={`flex min-h-screen font-sans ${isLight ? "bg-slate-100 text-slate-900" : "bg-black text-gray-100"}`}>
      <ClientSidebar />

      {toast && (
        <div className="fixed top-4 right-4 bg-emerald-500/95 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-2xl z-50 flex items-center gap-2 animate-bounce">
          <Check size={14} /> {toast}
        </div>
      )}

      <main className="flex-grow p-6 sm:p-8 space-y-6 overflow-y-auto max-h-screen">
        
        {/* Header section */}
        <div className={`flex justify-between items-center border-b pb-4 ${isLight ? "border-slate-200" : "border-brand-dark-border/60"}`}>
          <div>
            <h1 className={`text-xl font-black flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
              <Settings size={22} className="text-sky-500" />
              Settings Panel
            </h1>
            <p className={`text-[10px] mt-0.5 ${isLight ? "text-slate-500" : "text-gray-500"}`}>
              Configure your MT Core business environment (The core technology behind your business), tax rates, receipt thermal configurations, and loyalty programs.
            </p>
          </div>
        </div>

        {/* Outer form and sidebar grid */}
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Tabs Sidebar navigation (3 columns) */}
          <div className={`lg:col-span-3 border rounded-2xl p-4 space-y-1 ${
            isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/40 border-brand-dark-border text-gray-100"
          }`}>
            {[
              { id: "general", label: "General Business", icon: Building },
              { id: "pos", label: "POS & Taxation", icon: Sliders },
              { id: "loyalty", label: "Loyalty Programs", icon: Award },
              { id: "security", label: "Terminal Security", icon: ShieldCheck },
              { id: "system", label: "System Maintenance", icon: HardDrive },
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition ${
                  activeTab === t.id
                    ? isLight ? "bg-sky-600 text-white font-black shadow-xs" : "bg-brand-sky text-black font-black"
                    : isLight ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900" : "text-gray-400 hover:bg-brand-dark-surface hover:text-white"
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
              <div className={`border rounded-2xl p-6 space-y-5 animate-fade-in-up ${
                isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/20 border-brand-dark-border text-gray-100"
              }`}>
                <h3 className={`text-xs font-black uppercase tracking-wider border-b pb-2 flex items-center gap-2 ${
                  isLight ? "text-slate-900 border-slate-200" : "text-white border-brand-dark-border/40"
                }`}>
                  <Building size={14} className="text-sky-500" />
                  General Business Identity
                </h3>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Registered Business Name *</label>
                    <input
                      type="text" required
                      value={form.businessName}
                      onChange={e => setForm({ ...form, businessName: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border font-semibold ${
                        isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Business Owner Name *</label>
                    <input
                      type="text" required
                      value={form.ownerName}
                      onChange={e => setForm({ ...form, ownerName: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border font-semibold ${
                        isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Official Mobile Contact *</label>
                    <input
                      type="text" required
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border font-mono ${
                        isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Business Email Address *</label>
                    <input
                      type="email" required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border font-semibold ${
                        isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>State Tax Registration Number (NTN / GST)</label>
                    <input
                      type="text"
                      placeholder="e.g. GST-1234567-8"
                      value={form.taxNumber}
                      onChange={e => setForm({ ...form, taxNumber: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border font-mono ${
                        isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Corporate Brand Logo URL</label>
                    <div className="relative">
                      <Image size={13} className={`absolute left-3 top-3.5 ${isLight ? "text-slate-400" : "text-gray-500"}`} />
                      <input
                        type="text"
                        placeholder="https://yourstore.com/logo.png"
                        value={form.logoUrl}
                        onChange={e => setForm({ ...form, logoUrl: e.target.value })}
                        className={`w-full pl-9 p-2.5 rounded-lg border ${
                          isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="col-span-2">
                    <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Street Address</label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={e => setForm({ ...form, address: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border ${
                        isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>City / State</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={e => setForm({ ...form, city: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border ${
                        isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* POS & TAXATION TAB */}
            {activeTab === "pos" && (
              <div className={`border rounded-2xl p-6 space-y-5 animate-fade-in-up ${
                isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/20 border-brand-dark-border text-gray-100"
              }`}>
                <h3 className={`text-xs font-black uppercase tracking-wider border-b pb-2 flex items-center gap-2 ${
                  isLight ? "text-slate-900 border-slate-200" : "text-white border-brand-dark-border/40"
                }`}>
                  <Sliders size={14} className="text-sky-500" />
                  POS Checkout &amp; Billing Rules
                </h3>

                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Default Sales Tax Rate (%)</label>
                    <input
                      type="number" min="0" max="100"
                      value={form.defaultTaxRate}
                      onChange={e => setForm({ ...form, defaultTaxRate: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border font-mono font-bold ${
                        isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Base Currency Symbol</label>
                    <select
                      value={form.defaultCurrency}
                      onChange={e => setForm({ ...form, defaultCurrency: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border font-bold ${
                        isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                      }`}
                    >
                      <option value="PKR">PKR (Rs.)</option>
                      <option value="USD">USD ($)</option>
                      <option value="SAR">SAR (SR)</option>
                      <option value="AED">AED (Dh)</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Low Stock Alert Threshold</label>
                    <input
                      type="number" min="0"
                      value={form.lowStockAlert}
                      onChange={e => setForm({ ...form, lowStockAlert: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border font-mono font-bold ${
                        isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                      }`}
                    />
                  </div>
                </div>

                <div className={`p-4 border rounded-xl space-y-3 ${
                  isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-brand-dark-surface/40 border-brand-dark-border/80 text-gray-100"
                }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className={`text-xs font-bold uppercase ${isLight ? "text-slate-900" : "text-white"}`}>Enable Credit Sales (On Credit)</h4>
                      <p className={`text-[9px] ${isLight ? "text-slate-500" : "text-gray-500"}`}>Allow customers to buy goods on due account (Accounts Receivable balance)</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, allowCreditSales: !form.allowCreditSales })}
                      className={`w-12 h-6 rounded-full p-1 transition-all ${
                        form.allowCreditSales ? "bg-sky-600" : isLight ? "bg-slate-300" : "bg-brand-dark-border"
                      }`}
                    >
                      <div className={`h-4 w-4 bg-white rounded-full transition-all ${
                        form.allowCreditSales ? "translate-x-6" : "translate-x-0"
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <h4 className={`text-[10px] uppercase font-bold ${isLight ? "text-slate-600" : "text-gray-400"}`}>Thermal Receipt Header / Footer Customizer</h4>
                  <div>
                    <label className={`block text-[9px] mb-1 ${isLight ? "text-slate-500" : "text-gray-500"}`}>Receipt Top Header Text</label>
                    <input
                      type="text"
                      value={form.receiptHeader}
                      onChange={e => setForm({ ...form, receiptHeader: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border ${
                        isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[9px] mb-1 ${isLight ? "text-slate-500" : "text-gray-500"}`}>Receipt Bottom Footer Message</label>
                    <textarea
                      rows={2}
                      value={form.receiptFooter}
                      onChange={e => setForm({ ...form, receiptFooter: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border text-[11px] resize-none focus:outline-none ${
                        isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* LOYALTY PROGRAMS TAB */}
            {activeTab === "loyalty" && (
              <div className={`border rounded-2xl p-6 space-y-5 animate-fade-in-up ${
                isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/20 border-brand-dark-border text-gray-100"
              }`}>
                <h3 className={`text-xs font-black uppercase tracking-wider border-b pb-2 flex items-center gap-2 ${
                  isLight ? "text-slate-900 border-slate-200" : "text-white border-brand-dark-border/40"
                }`}>
                  <Award size={14} className="text-sky-500" />
                  CRM Loyalty Rewards Calculator
                </h3>

                <div className={`p-3.5 rounded-xl text-[10px] flex gap-2 border ${
                  isLight ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-yellow-500/10 border-yellow-500/20 text-gray-400"
                }`}>
                  <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={13} />
                  <span>
                    Loyalty points program triggers automatically during sales checkouts inside the POS cashier terminal. Adjust parameters below to recalculate member points.
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 font-sans ${isLight ? "text-slate-600" : "text-gray-400"}`}>Points Per Amount ({currencySymbol})</label>
                    <div className="relative">
                      <DollarSign size={12} className={`absolute left-3 top-3 ${isLight ? "text-slate-400" : "text-gray-500"}`} />
                      <input
                        type="number" min="1"
                        value={form.loyaltyPointsPerAmount}
                        onChange={e => setForm({ ...form, loyaltyPointsPerAmount: e.target.value })}
                        className={`w-full pl-8 p-2.5 rounded-lg border font-bold ${
                          isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                        }`}
                      />
                    </div>
                    <span className={`text-[8px] mt-1 block font-sans ${isLight ? "text-slate-500" : "text-gray-500"}`}>Customer gets 1 point per this PKR amount.</span>
                  </div>

                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 font-sans ${isLight ? "text-slate-600" : "text-gray-400"}`}>Redeem Threshold (pts)</label>
                    <input
                      type="number" min="1"
                      value={form.loyaltyRedeemThreshold}
                      onChange={e => setForm({ ...form, loyaltyRedeemThreshold: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border font-bold ${
                        isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                      }`}
                    />
                    <span className={`text-[8px] mt-1 block font-sans ${isLight ? "text-slate-500" : "text-gray-500"}`}>Minimum points needed to qualify for discount voucher.</span>
                  </div>

                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 font-sans ${isLight ? "text-slate-600" : "text-gray-400"}`}>Discount Value ({currencySymbol})</label>
                    <input
                      type="number" min="1"
                      value={form.loyaltyRedeemValue}
                      onChange={e => setForm({ ...form, loyaltyRedeemValue: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border font-bold ${
                        isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                      }`}
                    />
                    <span className={`text-[8px] mt-1 block font-sans ${isLight ? "text-slate-500" : "text-gray-500"}`}>Discount voucher value rewarded per threshold redeem.</span>
                  </div>
                </div>

                <div className={`border-t pt-4 ${isLight ? "border-slate-200" : "border-brand-dark-border/40"}`}>
                  <h4 className={`text-[10px] uppercase font-bold mb-2 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Simulated Reward Program Formula</h4>
                  <div className={`border p-4 rounded-xl font-mono text-[10px] leading-relaxed space-y-1 ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-black/60 border-brand-dark-border text-gray-100"
                  }`}>
                    <div>1. Purchase Bill of <span className="text-sky-600 font-bold">PKR 5,000</span> will earn:</div>
                    <div className="text-amber-600 font-bold ml-4">
                      = 5,000 / {form.loyaltyPointsPerAmount || "50"} = {Math.round(5000 / (parseInt(form.loyaltyPointsPerAmount) || 50))} points.
                    </div>
                    <div className="mt-2">2. When member balance crosses <span className="text-amber-600 font-bold">{form.loyaltyRedeemThreshold || "1000"} pts</span>:</div>
                    <div className="text-emerald-600 font-bold ml-4">
                      = Customer receives flat discount of <span className="underline">PKR {form.loyaltyRedeemValue || "100"}</span> on next POS ticket.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SYSTEM MAINTENANCE TAB */}
            {activeTab === "system" && (
              <div className={`border rounded-2xl p-6 space-y-5 animate-fade-in-up ${
                isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/20 border-brand-dark-border text-gray-100"
              }`}>
                <h3 className={`text-xs font-black uppercase tracking-wider border-b pb-2 flex items-center gap-2 ${
                  isLight ? "text-slate-900 border-slate-200" : "text-white border-brand-dark-border/40"
                }`}>
                  <ShieldAlert size={14} className="text-red-500" />
                  System Database Maintenance
                </h3>

                <div className={`flex flex-col justify-between p-4 border rounded-xl space-y-3 ${
                  isLight ? "bg-emerald-50 border-emerald-200 text-slate-900" : "bg-emerald-500/10 border-emerald-500/30 text-gray-100"
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`text-xs font-black flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-white"}`}>
                        <Folder size={14} className="text-emerald-600" /> Auto-Save Receipts &amp; Reports Storage Folder
                      </h4>
                      <p className={`text-[10px] mt-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>
                        Select a folder on your PC (e.g. Documents). MT Core will automatically create subfolders (<span className="font-mono text-emerald-600 font-bold">Sale Receipts</span>, <span className="font-mono text-emerald-600 font-bold">Reports</span>, etc.) and save files directly into it!
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-center justify-between p-3 rounded-lg text-xs font-mono border ${
                    isLight ? "bg-white border-slate-300 text-slate-900" : "bg-black/40 border-brand-dark-border text-gray-100"
                  }`}>
                    <div>
                      <span className={`text-[10px] block ${isLight ? "text-slate-500" : "text-gray-500"}`}>Current Storage Folder:</span>
                      <span className="text-emerald-600 font-bold">
                        {selectedFolderName ? `📁 ${selectedFolderName} (Subfolders created)` : "⚠️ Default System Folder (Click button to select custom folder)"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSelectFolder}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] uppercase rounded-lg shadow transition shrink-0 flex items-center gap-1.5"
                    >
                      <Folder size={13} /> {selectedFolderName ? "Change Folder" : "Select Storage Folder"}
                    </button>
                  </div>
                </div>

                {/* EVERYTHING BACKUP & RESTORE SECTION */}
                <div className={`border rounded-xl p-5 space-y-4 ${
                  isLight ? "bg-sky-50 border-sky-200 text-slate-900" : "bg-brand-dark-surface/40 border-brand-sky/30 text-gray-100 shadow-xl"
                }`}>
                  <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3 ${
                    isLight ? "border-sky-200" : "border-brand-dark-border/60"
                  }`}>
                    <div>
                      <h4 className={`text-xs font-black flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                        <Database size={16} className="text-sky-600" /> Full System Database Backup &amp; Restore (Everything Backup)
                      </h4>
                      <p className={`text-[10px] mt-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>
                        Export a 100% complete JSON backup containing all products, inventory, sales transactions, customer ledgers, double-entry accounting, expenses, staff, and business settings.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Export Card */}
                    <div className={`border p-4 rounded-xl space-y-3 ${
                      isLight ? "bg-white border-slate-200 shadow-xs" : "bg-black/50 border-brand-dark-border/80"
                    }`}>
                      <div>
                        <span className="text-xs font-bold text-emerald-600 block">📥 Export Everything Backup</span>
                        <p className={`text-[10px] mt-1 ${isLight ? "text-slate-500" : "text-gray-400"}`}>Download a single-file complete system backup JSON to your computer or USB drive for safety.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleBackup}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-2.5 rounded-lg transition uppercase tracking-wider shadow-lg"
                      >
                        <Download size={14} /> Export Complete Backup (.json)
                      </button>
                    </div>

                    {/* Import / Restore Card */}
                    <div className={`border p-4 rounded-xl space-y-3 ${
                      isLight ? "bg-white border-slate-200 shadow-xs" : "bg-black/50 border-brand-dark-border/80"
                    }`}>
                      <div>
                        <span className="text-xs font-bold text-sky-600 block">📤 Import &amp; Restore Backup</span>
                        <p className={`text-[10px] mt-1 ${isLight ? "text-slate-500" : "text-gray-400"}`}>Select a previously exported `.json` backup file from your computer to restore all store records.</p>
                      </div>
                      <label className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs py-2.5 rounded-lg transition uppercase tracking-wider shadow-lg cursor-pointer">
                        <Upload size={14} /> Select Backup File to Restore
                        <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className={`p-5 rounded-xl text-xs space-y-3 mt-4 border ${
                  isLight ? "bg-red-50 border-red-200 text-slate-900" : "bg-red-500/10 border-red-500/30 text-gray-100"
                }`}>
                  <div className={`flex items-center justify-between border-b pb-2 ${isLight ? "border-red-200" : "border-red-500/20"}`}>
                    <p className="font-black text-red-600 flex items-center gap-1.5 uppercase tracking-wider text-xs">
                      <AlertTriangle className="text-red-500" size={15} /> DANGER ZONE — STORE DATABASE RESET
                    </p>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                      <Check size={11} /> STORE ISOLATED
                    </span>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${isLight ? "text-slate-700" : "text-gray-300"}`}>
                    Executing a store reset will <strong>PERMANENTLY ERASE ALL TRANSACTION RECORDS FOR THIS STORE ONLY</strong> (products, sales history, customer ledgers, staff records, supplier dues, expenses, shift logs).
                  </p>

                  <div className={`p-3 rounded-xl space-y-1 text-[11px] border ${
                    isLight ? "bg-white border-slate-200" : "bg-black/60 border-brand-dark-border/80"
                  }`}>
                    <span className="text-emerald-600 font-bold block flex items-center gap-1">
                      <Check size={13} /> Strict Multi-Tenant Safeguards Active:
                    </span>
                    <ul className={`space-y-0.5 pl-4 list-disc text-[10px] ${isLight ? "text-slate-600" : "text-gray-400"}`}>
                      <li>Only THIS store's data ({form.businessName || "Active Store"}) will be cleared. Other shops/branches remain 100% untouched.</li>
                      <li>Store Owner login credentials (email &amp; password) are <strong>PRESERVED &amp; NOT DELETED</strong>.</li>
                    </ul>
                  </div>

                  <div className={`flex items-center justify-between p-3.5 rounded-xl mt-2 border ${
                    isLight ? "bg-white border-red-200" : "bg-black/60 border-red-500/30"
                  }`}>
                    <div>
                      <h4 className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-white"}`}>
                        <Trash2 size={14} className="text-red-500" /> Wipe This Store's Database
                      </h4>
                      <p className={`text-[10px] mt-0.5 ${isLight ? "text-slate-500" : "text-gray-400"}`}>Flush products, sales, customers, staff &amp; ledgers for {form.businessName || "this store"}.</p>
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

            {/* TERMINAL SECURITY & HARDWARE BINDING TAB */}
            {activeTab === "security" && (
              <div className={`border rounded-2xl p-6 space-y-6 animate-fade-in-up ${
                isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/20 border-brand-dark-border text-gray-100"
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                  <div>
                    <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}>
                      <ShieldCheck size={16} className="text-sky-500" />
                      POS Terminal Hardware Binding & Security Lock
                    </h3>
                    <p className={`text-[10px] mt-0.5 ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                      Restrict Cashier and Staff logins to authorized physical counter computers in your store. Store Owner can log in from any mobile or laptop anywhere.
                    </p>
                  </div>
                </div>

                {/* 1. MASTER ENFORCEMENT TOGGLE CARD */}
                <div className={`border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  form.enforceTerminalBinding
                    ? isLight ? "bg-emerald-50 border-emerald-300" : "bg-emerald-950/30 border-emerald-500/40"
                    : isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-brand-dark-border"
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black uppercase tracking-wider ${
                        form.enforceTerminalBinding ? "text-emerald-500" : isLight ? "text-slate-700" : "text-gray-300"
                      }`}>
                        {form.enforceTerminalBinding ? "🔒 Terminal Hardware Lock: ACTIVE" : "🔓 Terminal Hardware Lock: DISABLED"}
                      </span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        form.enforceTerminalBinding
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-gray-500/20 text-gray-400"
                      }`}>
                        {form.enforceTerminalBinding ? "Enforcing Store Terminals" : "Open Access"}
                      </span>
                    </div>
                    <p className={`text-[11px] ${isLight ? "text-slate-600" : "text-gray-400"}`}>
                      {form.enforceTerminalBinding
                        ? "Cashiers and Staff can ONLY log in from the authorized computers listed below. Unregistered devices will be blocked."
                        : "Staff members can log in from any device. Turn this ON to prevent staff from logging in from home or unauthorized phones."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleTerminalBinding(!form.enforceTerminalBinding)}
                    className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition shrink-0 flex items-center gap-2 shadow-lg ${
                      form.enforceTerminalBinding
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
                        : "bg-brand-sky hover:bg-sky-400 text-black shadow-sky-500/20"
                    }`}
                  >
                    {form.enforceTerminalBinding ? (
                      <>
                        <Check size={14} /> Enforced (Click to Disable)
                      </>
                    ) : (
                      <>
                        <Shield size={14} /> Enable Terminal Lock
                      </>
                    )}
                  </button>
                </div>

                {/* 2. THIS DEVICE STATUS CARD */}
                <div className={`border rounded-xl p-5 space-y-3 ${
                  currentRegisteredTerminal
                    ? isLight ? "bg-emerald-50/60 border-emerald-200" : "bg-emerald-950/20 border-emerald-500/30"
                    : isLight ? "bg-amber-50/60 border-amber-200" : "bg-amber-950/20 border-amber-500/30"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${
                        currentRegisteredTerminal
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}>
                        <Laptop size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black uppercase ${
                            currentRegisteredTerminal ? "text-emerald-500" : "text-amber-500"
                          }`}>
                            {currentRegisteredTerminal ? "✅ This Computer is an Authorized Store Terminal" : "⚠️ This Computer is Not Registered Yet"}
                          </span>
                        </div>
                        <p className={`text-[10px] mt-0.5 ${isLight ? "text-slate-600" : "text-gray-400"}`}>
                          {currentRegisteredTerminal
                            ? `Registered as "${currentRegisteredTerminal.name}" on ${new Date(currentRegisteredTerminal.registeredAt).toLocaleDateString()}. Staff can sign in on this device.`
                            : "To allow Cashiers/Staff to sign in from this computer, authorize and register it below."}
                        </p>
                      </div>
                    </div>

                    {currentRegisteredTerminal && (
                      <button
                        type="button"
                        onClick={() => handleRevokeTerminal(currentRegisteredTerminal.id)}
                        className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 rounded-lg text-[10px] font-bold uppercase transition self-start sm:self-auto"
                      >
                        Unregister This Device
                      </button>
                    )}
                  </div>

                  {!currentRegisteredTerminal && (
                    <div className={`pt-3 border-t flex flex-col sm:flex-row items-center gap-3 ${
                      isLight ? "border-amber-200" : "border-amber-500/20"
                    }`}>
                      <input
                        type="text"
                        placeholder="Terminal Name (e.g. Counter 1 - Front Desk Laptop)"
                        value={terminalNameInput}
                        onChange={(e) => setTerminalNameInput(e.target.value)}
                        className={`flex-grow p-2.5 rounded-lg border text-xs font-semibold ${
                          isLight ? "bg-white border-slate-300 text-slate-900" : "bg-black border-brand-dark-border text-white"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleRegisterCurrentDevice}
                        className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase rounded-lg shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <Plus size={14} /> Authorize & Register This Device
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. REGISTERED STORE TERMINALS LIST */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}>
                      <Building size={14} className="text-sky-500" />
                      All Authorized Store Terminals ({(businessSettings.authorizedTerminals || []).length})
                    </h4>
                  </div>

                  {(businessSettings.authorizedTerminals || []).length === 0 ? (
                    <div className={`p-8 text-center rounded-xl border text-xs ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-500" : "bg-black/30 border-brand-dark-border text-gray-500"
                    }`}>
                      <Laptop size={28} className="mx-auto mb-2 opacity-40" />
                      <p className="font-bold">No store terminals registered yet.</p>
                      <p className="text-[10px] mt-0.5">Click &quot;Authorize &amp; Register This Device&quot; above on your counter laptop to register it.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(businessSettings.authorizedTerminals || []).map((term) => {
                        const isCurrent = term.token === currentDeviceToken;
                        const isActive = term.status === "Active";

                        return (
                          <div
                            key={term.id}
                            className={`border rounded-xl p-4 flex flex-col justify-between gap-3 ${
                              isActive
                                ? isLight ? "bg-white border-slate-200 shadow-xs" : "bg-brand-dark-surface/40 border-brand-dark-border"
                                : isLight ? "bg-red-50/50 border-red-200 opacity-60" : "bg-red-950/20 border-red-500/20 opacity-60"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className={`p-2 rounded-lg ${
                                  isActive
                                    ? isCurrent
                                      ? "bg-sky-500/20 text-sky-400"
                                      : "bg-emerald-500/20 text-emerald-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}>
                                  <Laptop size={16} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                                      {term.name}
                                    </span>
                                    {isCurrent && (
                                      <span className="text-[8px] bg-sky-500/20 text-sky-400 font-bold px-1.5 py-0.2 rounded font-mono uppercase">
                                        This Device
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[9px] text-gray-500 font-mono block mt-0.5">
                                    Registered: {new Date(term.registeredAt).toLocaleDateString()} by {term.registeredBy}
                                  </span>
                                </div>
                              </div>

                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                                isActive
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}>
                                {term.status}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-brand-dark-border/30 text-[10px]">
                              <span className="font-mono text-gray-500 truncate max-w-[150px]">
                                Key: {term.token.substring(0, 10)}...
                              </span>
                              <div className="flex items-center gap-1.5">
                                {isActive ? (
                                  <button
                                    type="button"
                                    onClick={() => handleRevokeTerminal(term.id)}
                                    className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded text-[9px] font-bold uppercase transition"
                                  >
                                    Revoke
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTerminal(term.id)}
                                    className="px-2.5 py-1 bg-gray-500/20 hover:bg-red-600 text-gray-400 hover:text-white rounded text-[9px] font-bold uppercase transition"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 4. SECURITY INFO BANNER */}
                <div className={`p-4 rounded-xl text-xs space-y-1.5 border ${
                  isLight ? "bg-sky-50 border-sky-200 text-slate-800" : "bg-sky-950/20 border-sky-500/30 text-sky-200"
                }`}>
                  <div className="font-bold flex items-center gap-1.5 text-sky-500">
                    <ShieldCheck size={14} /> How Store Terminal Binding Protects You:
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-[10px] opacity-90">
                    <li><strong>Cashiers &amp; Staff</strong> can only sign in on computers registered in this list. If they try to log in from home, their phone, or another laptop, they will be blocked with an Access Denied screen.</li>
                    <li><strong>Store Owner</strong> is completely unrestricted and can sign in from any mobile, home PC, or tablet worldwide to check reports, download ledgers, and manage the business.</li>
                    <li><strong>HRMS &amp; SMS</strong> portals operate independently and are not affected by POS terminal locking.</li>
                  </ul>
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
