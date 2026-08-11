"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useGlobalContext } from "@/context/global-context";
import {
  AlertTriangle,
  Package,
  CreditCard,
  AlertCircle,
  Bell,
  ChevronRight,
  X,
  Megaphone,
  Edit3,
  CheckCircle2,
  DollarSign,
  Truck
} from "lucide-react";

export default function POSAlertBanner() {
  const {
    products,
    customers,
    suppliers,
    isOffline,
    currentUser,
    currencySymbol
  } = useGlobalContext();

  const [dismissed, setDismissed] = useState(false);
  const [storeNotice, setStoreNotice] = useState<string>("");
  const [isEditingNotice, setIsEditingNotice] = useState(false);
  const [noticeInput, setNoticeInput] = useState("");
  const [activeAlertIdx, setActiveAlertIdx] = useState(0);

  const isOwner = currentUser?.role === "Owner" || !currentUser?.role;

  // Load store owner announcement from localStorage
  useEffect(() => {
    if (currentUser?.tenantId && typeof window !== "undefined") {
      const key = `pos_store_announcement_${currentUser.tenantId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        setStoreNotice(saved);
        setNoticeInput(saved);
      }
    }
  }, [currentUser?.tenantId]);

  const saveStoreNotice = (text: string) => {
    setStoreNotice(text);
    if (currentUser?.tenantId) {
      localStorage.setItem(`pos_store_announcement_${currentUser.tenantId}`, text);
    }
    setIsEditingNotice(false);
  };

  // Compute live POS alerts
  const alerts = useMemo(() => {
    const list: Array<{
      id: string;
      type: "stock" | "dues" | "supplier" | "system" | "custom";
      title: string;
      subtitle: string;
      actionUrl?: string;
      actionLabel?: string;
      severity: "critical" | "warning" | "info";
    }> = [];

    // 1. Custom Store Owner Bulletin (if set)
    if (storeNotice.trim()) {
      list.push({
        id: "owner-bulletin",
        type: "custom",
        title: "Store Desk Announcement",
        subtitle: storeNotice,
        severity: "info"
      });
    }

    // 2. Low Stock Alerts
    const lowStockItems = products.filter((p) => p.stock <= (p.minStock || 5));
    if (lowStockItems.length > 0) {
      list.push({
        id: "low-stock",
        type: "stock",
        title: `${lowStockItems.length} Products Low in Stock / Depleted`,
        subtitle: `Items like "${lowStockItems[0]?.name}" need urgent Purchase Reorder.`,
        actionUrl: "/inventory",
        actionLabel: "Restock Now",
        severity: lowStockItems.some((p) => p.stock === 0) ? "critical" : "warning"
      });
    }

    // 3. Customer Dues / Credit Receivables
    const debtors = customers.filter((c) => (c.balance || 0) > 0);
    const totalDues = debtors.reduce((sum, c) => sum + (c.balance || 0), 0);
    if (debtors.length > 0) {
      list.push({
        id: "customer-dues",
        type: "dues",
        title: `Pending Customer Credit Dues: ${currencySymbol || "PKR"} ${totalDues.toLocaleString()}`,
        subtitle: `${debtors.length} customer ledgers have overdue receivables pending collection.`,
        actionUrl: "/customers",
        actionLabel: "View Debtors",
        severity: "warning"
      });
    }

    // 4. Supplier Payables
    const creditorSuppliers = suppliers.filter((s) => (s.balance || 0) > 0);
    const totalPayable = creditorSuppliers.reduce((sum, s) => sum + (s.balance || 0), 0);
    if (creditorSuppliers.length > 0) {
      list.push({
        id: "supplier-payables",
        type: "supplier",
        title: `Supplier Payables Due: ${currencySymbol || "PKR"} ${totalPayable.toLocaleString()}`,
        subtitle: `${creditorSuppliers.length} vendor balance invoices awaiting settlement.`,
        actionUrl: "/suppliers",
        actionLabel: "Pay Suppliers",
        severity: "info"
      });
    }

    // 5. System Offline Warning
    if (isOffline) {
      list.push({
        id: "system-offline",
        type: "system",
        title: "POS Running in Local Offline Fallback Mode",
        subtitle: "Transactions will automatically sync with cloud database when network restores.",
        severity: "critical"
      });
    }

    return list;
  }, [products, customers, suppliers, isOffline, storeNotice, currencySymbol]);

  // Auto-cycle through alerts
  useEffect(() => {
    if (alerts.length <= 1) return;
    const interval = setInterval(() => {
      setActiveAlertIdx((prev) => (prev + 1) % alerts.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [alerts.length]);

  if (dismissed || alerts.length === 0) {
    return (
      <div className="flex justify-end -mt-2 mb-2">
        {isOwner && (
          <button
            onClick={() => setIsEditingNotice(true)}
            className="text-[10px] text-gray-500 hover:text-brand-sky flex items-center gap-1 font-mono transition"
          >
            <Edit3 size={11} /> Edit Store Desk Notice
          </button>
        )}
      </div>
    );
  }

  const current = alerts[activeAlertIdx] || alerts[0];

  const getStyle = (sev: string) => {
    switch (sev) {
      case "critical":
        return {
          border: "border-red-500/40 bg-gradient-to-r from-red-950/40 via-black to-black",
          badge: "bg-red-500/20 text-red-400 border-red-500/30",
          icon: <AlertCircle size={16} className="text-red-400" />
        };
      case "warning":
        return {
          border: "border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-black to-black",
          badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
          icon: <AlertTriangle size={16} className="text-amber-400" />
        };
      default:
        return {
          border: "border-sky-500/30 bg-gradient-to-r from-sky-950/30 via-black to-black",
          badge: "bg-sky-500/20 text-sky-300 border-sky-500/30",
          icon: <Megaphone size={16} className="text-sky-400" />
        };
    }
  };

  const style = getStyle(current.severity);

  return (
    <div className="space-y-2">
      <div
        className={`relative overflow-hidden rounded-2xl border p-3.5 shadow-lg backdrop-blur-md transition-all ${style.border}`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Alert Content */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 rounded-xl bg-black/60 border border-gray-800 shrink-0">
              {style.icon}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${style.badge}`}>
                  POS Operational Alert
                </span>
                {alerts.length > 1 && (
                  <span className="text-[10px] text-gray-500 font-mono">
                    ({activeAlertIdx + 1}/{alerts.length})
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-white truncate">{current.title}</div>
              <div className="text-[11px] text-gray-400 truncate">{current.subtitle}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {current.actionUrl && (
              <Link
                href={current.actionUrl}
                className="flex items-center gap-1 bg-brand-sky/20 hover:bg-brand-sky/30 text-brand-sky border border-brand-sky/40 font-bold text-[11px] px-3 py-1.5 rounded-xl transition"
              >
                {current.actionLabel || "Review"} <ChevronRight size={12} />
              </Link>
            )}

            {isOwner && (
              <button
                onClick={() => setIsEditingNotice(true)}
                className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition"
                title="Post / Edit Store Owner Announcement"
              >
                <Edit3 size={13} />
              </button>
            )}

            <button
              onClick={() => setDismissed(true)}
              className="text-gray-500 hover:text-gray-300 p-1.5 rounded-lg hover:bg-white/5 transition"
              title="Dismiss for this session"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Store Announcement Modal */}
      {isEditingNotice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c1219] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Megaphone size={16} className="text-brand-sky" />
                Store Desk Operational Announcement
              </h3>
              <button onClick={() => setIsEditingNotice(false)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Broadcast a custom notice to your store cashiers, counter staff, and managers (e.g. today's discount promotions, shift handoff notes).
            </p>

            <textarea
              rows={3}
              placeholder="e.g. Special 10% Cash Discount on Bakery items today. Reconcile terminal floats at 6 PM."
              value={noticeInput}
              onChange={(e) => setNoticeInput(e.target.value)}
              className="w-full bg-black border border-gray-800 text-white text-xs p-3 rounded-xl focus:outline-none focus:border-brand-sky placeholder-gray-600"
            />

            <div className="flex gap-2">
              <button
                onClick={() => saveStoreNotice(noticeInput)}
                className="flex-1 bg-brand-sky hover:bg-sky-400 text-black font-bold text-xs p-2.5 rounded-xl transition"
              >
                Save Announcement
              </button>
              {storeNotice && (
                <button
                  onClick={() => saveStoreNotice("")}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs px-3 rounded-xl transition font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
