"use client";

import React, { useRef, useState, useEffect } from "react";
import { Printer, Download, X, ArrowLeft, Loader2 } from "lucide-react";
import { BusinessSettings, useGlobalContext } from "@/context/global-context";
import { supabase } from "@/lib/supabase";
import { queueOfflineReceipt } from "@/lib/offline-sync";

import Barcode from "react-barcode";
import { autoSaveReceiptToDisk } from "@/lib/receipt-saver";

interface SaleItem {
  productName: string;
  qty: number;
  price: number;
  subtotal: number;
}

interface Sale {
  id?: string;
  receiptNumber: string;
  date: string;
  cashierName?: string;
  customerName: string;
  customerNo?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod?: string;
  receivedAmount?: number;
  changeReturned?: number;
  loyaltyPointsEarned?: number;
  loyaltyPointsBalance?: number;
  redeemLoyalty?: boolean;
  isCredit?: boolean;
  notes?: string;
  status?: string;
  previousCreditBalance?: number;
  totalCreditBalance?: number;
}

interface Props {
  sale: Sale;
  currencySymbol?: string;
  branch?: string;
  businessSettings?: BusinessSettings;
  onClose: () => void;
  onBack?: () => void;
  isHidden?: boolean;
}

// ─── Inline Thermal Slip HTML builder ─────────────────────────────────────────
function buildSlipHTML(
  sale: Sale,
  currencySymbol: string,
  branch: string,
  biz: BusinessSettings | undefined
): string {
  const dateObj = new Date(sale.date);
  const dateStr = dateObj.toLocaleDateString("en-PK", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = dateObj.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: true });

  const businessName = biz?.businessName || "MT STORE";
  const city = biz?.city || "";
  const phone = biz?.phone || "";
  const ntn = biz?.taxNumber || "";
  const receiptFooter = biz?.receiptFooter || "Thank You! Exchange Within 7 Days. No Return Without Original Invoice.";

  const totalItems = sale.items.length;
  const totalQty = sale.items.reduce((a, i) => a + i.qty, 0);

  // Determine receipt type label
  const isCreditSale = sale.paymentMethod === "On Credit" || sale.isCredit || (sale as any).splitPayments?.["On Credit"] > 0;
  const statusLabel = sale.status === "Dues_Recovery"
    ? "DUES PAYMENT RECEIPT"
    : sale.status === "Returned" || sale.status === "Refunded"
      ? "RETURN RECEIPT"
      : isCreditSale
        ? "CREDIT SALE RECEIPT"
        : "CASH SALE RECEIPT";

  const itemRows = sale.items.map((item, idx) => {
    const rate = item.price ?? (item.subtotal / item.qty);
    const qtyStr = typeof item.qty === "number" && item.qty % 1 !== 0
      ? item.qty.toFixed(3)
      : String(item.qty);
    return `
      <tr>
        <td style="padding:3px 2px;font-size:10px;text-align:center;border-bottom:1px dotted #ccc">${idx + 1}</td>
        <td style="padding:3px 4px;font-size:10px;word-break:break-word;border-bottom:1px dotted #ccc">${item.productName}</td>
        <td style="padding:3px 2px;font-size:10px;text-align:center;white-space:nowrap;border-bottom:1px dotted #ccc">${qtyStr}</td>
        <td style="padding:3px 2px;font-size:10px;text-align:right;white-space:nowrap;border-bottom:1px dotted #ccc">${Math.round(rate)}</td>
        <td style="padding:3px 2px;font-size:10px;text-align:right;white-space:nowrap;font-weight:700;border-bottom:1px dotted #ccc">${Math.round(item.subtotal)}</td>
      </tr>`;
  }).join("");

  const receivedAmt = sale.receivedAmount ?? (sale.paymentMethod === "Cash" ? sale.total : undefined);
  const changeAmt = sale.changeReturned ?? (receivedAmt !== undefined ? Math.max(0, receivedAmt - sale.total) : 0);

  const prevCredit = sale.previousCreditBalance ?? 0;
  const currentCredit = (sale as any).splitPayments && (sale as any).splitPayments["On Credit"] !== undefined
    ? ((sale as any).splitPayments["On Credit"] || 0)
    : (sale.paymentMethod === "On Credit" || sale.isCredit)
      ? sale.total
      : 0;
  const totalCredit = sale.totalCreditBalance ?? (prevCredit + currentCredit);
  const showCreditStatement = (sale.previousCreditBalance !== undefined && sale.previousCreditBalance > 0) || isCreditSale || (sale.totalCreditBalance !== undefined && sale.totalCreditBalance > 0);

  const creditSection = (showCreditStatement && sale.customerName !== "Walk-in Customer") ? `
    <div style="border:1px solid #000;border-radius:4px;margin:8px 0;overflow:hidden">
      <div style="background:#000;color:#fff;font-weight:900;text-align:center;padding:4px 6px;font-size:10px;letter-spacing:1px">CUSTOMER CREDIT STATEMENT</div>
      <div style="padding:6px 8px;font-size:10px">
        <div style="display:flex;justify-content:space-between;padding:2px 0">
          <span>Previous Credit Balance:</span><span>${currencySymbol} ${Math.round(prevCredit)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:2px 0">
          <span>This Invoice Credit:</span><span style="font-weight:700">${currencySymbol} ${Math.round(currentCredit)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:3px 0;font-weight:900;font-size:11px;border-top:1px dashed #aaa;margin-top:2px">
          <span>Total Outstanding Balance:</span><span style="color:#b00">${currencySymbol} ${Math.round(totalCredit)}</span>
        </div>
      </div>
    </div>` : "";

  const loyaltySection = (sale.loyaltyPointsEarned !== undefined && sale.customerName !== "Walk-in Customer")
    ? `
    <div style="border:1px solid #ddd;border-radius:4px;margin:8px 0;overflow:hidden">
      <div style="background:#000;color:#fff;font-weight:900;text-align:center;padding:4px 6px;font-size:10px;letter-spacing:1px">LOYALTY POINTS LEDGER</div>
      <div style="padding:6px 8px;font-size:10px">
        <div style="display:flex;justify-content:space-between;padding:2px 0">
          <span>Points Earned Today:</span><span style="font-weight:700">+${sale.loyaltyPointsEarned}</span>
        </div>
        ${sale.redeemLoyalty ? `<div style="display:flex;justify-content:space-between;padding:2px 0"><span>Points Redeemed:</span><span style="font-weight:700;color:#b00">-1000 pts</span></div>` : ""}
        <div style="display:flex;justify-content:space-between;padding:2px 0;font-weight:900;font-size:11px">
          <span>Total Points Balance:</span><span>${sale.loyaltyPointsBalance ?? 0} pts</span>
        </div>
      </div>
    </div>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${statusLabel} ${sale.receiptNumber}</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  html, body { width: 80mm; margin: 0; padding: 0; background: #fff; color: #000; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; padding: 8px 8px 20px; line-height: 1.4; }
  @media print { html, body { width: 80mm !important; margin: 0 !important; } }
</style>
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.0/dist/JsBarcode.all.min.js"></script>
</head>
<body>

  <!-- Header -->
  <div style="text-align:center;margin-bottom:8px">
    <img src="/logo.png" style="height:44px;max-width:180px;object-fit:contain;margin:0 auto 4px auto;display:block" alt="MT UniPOS" />
    <div style="font-size:13px;font-weight:900;letter-spacing:1px;margin-top:4px;text-transform:uppercase">${businessName}</div>
    ${city ? `<div style="font-size:9px">${city}</div>` : ""}
    ${phone ? `<div style="font-size:9px">Ph: ${phone}</div>` : ""}
    ${ntn ? `<div style="font-size:9px">NTN: ${ntn}</div>` : ""}
  </div>

  <!-- Section Title -->
  <div style="background:#000;color:#fff;text-align:center;font-weight:900;font-size:10px;letter-spacing:2px;padding:5px 4px;margin-bottom:8px">
    ${statusLabel}
  </div>

  <!-- Invoice Info -->
  <div style="border-bottom:1px dashed #aaa;padding-bottom:6px;margin-bottom:6px;font-size:10px">
    <div style="display:flex;justify-content:space-between"><span>Invoice No:</span><span style="font-weight:900">${sale.receiptNumber}</span></div>
    <div style="display:flex;justify-content:space-between"><span>Date:</span><span>${dateStr}</span></div>
    <div style="display:flex;justify-content:space-between"><span>Time:</span><span>${timeStr}</span></div>
    ${sale.cashierName ? `<div style="display:flex;justify-content:space-between"><span>Cashier:</span><span>${sale.cashierName}</span></div>` : ""}
    ${sale.customerName ? `<div style="display:flex;justify-content:space-between;margin-top:2px"><span>Customer Name:</span><span style="font-weight:900">${sale.customerName}</span></div>` : ""}
    ${sale.customerNo && sale.customerNo !== "N/A" ? `<div style="display:flex;justify-content:space-between"><span>Customer ID:</span><span style="font-weight:700">${sale.customerNo}</span></div>` : ""}
  </div>
  </div>

  <!-- Items Table -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:0">
    <thead>
      <tr style="background:#000;color:#fff">
        <th style="padding:4px 2px;font-size:9px;text-align:center;width:14px">#</th>
        <th style="padding:4px 4px;font-size:9px;text-align:left">Item</th>
        <th style="padding:4px 2px;font-size:9px;text-align:center">Qty</th>
        <th style="padding:4px 2px;font-size:9px;text-align:right">Rate</th>
        <th style="padding:4px 2px;font-size:9px;text-align:right">Amt</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <!-- Totals -->
  <div style="border-top:1px dashed #aaa;border-bottom:1px dashed #aaa;padding:5px 0;margin:4px 0;font-size:10px">
    <div style="display:flex;justify-content:space-between"><span>Total Items:</span><span style="font-weight:700">${totalItems}</span></div>
    <div style="display:flex;justify-content:space-between"><span>Total Quantity:</span><span style="font-weight:700">${totalQty}</span></div>
    ${sale.discount > 0 ? `<div style="display:flex;justify-content:space-between"><span>Discount:</span><span style="font-weight:700">-${currencySymbol} ${Math.round(sale.discount)}</span></div>` : ""}
    ${sale.tax > 0 ? `<div style="display:flex;justify-content:space-between"><span>Tax:</span><span style="font-weight:700">${currencySymbol} ${Math.round(sale.tax)}</span></div>` : ""}
    <div style="display:flex;justify-content:space-between"><span>Sub Total:</span><span style="font-weight:700">${currencySymbol} ${Math.round(sale.subtotal)}</span></div>
  </div>

  <!-- Grand Total -->
  <div style="background:#000;color:#fff;display:flex;justify-content:space-between;align-items:center;padding:7px 6px;margin:4px 0;font-weight:900;font-size:13px">
    <span>GRAND TOTAL:</span>
    <span>${currencySymbol} ${Math.round(sale.total)}</span>
  </div>

  <!-- Payment Details -->
  <div style="border:1px solid #ddd;border-radius:4px;margin:8px 0;overflow:hidden">
    <div style="background:#f5f5f5;font-weight:900;font-size:10px;padding:4px 8px;letter-spacing:1px;border-bottom:1px solid #ddd">PAYMENT DETAILS</div>
    <div style="padding:6px 8px;font-size:10px">
      <div style="display:flex;justify-content:space-between;padding:2px 0"><span>Payment Method:</span><span style="font-weight:700">${sale.paymentMethod || "Cash"}</span></div>
      ${receivedAmt !== undefined ? `<div style="display:flex;justify-content:space-between;padding:2px 0"><span>Received Amount:</span><span style="font-weight:700">${currencySymbol} ${Math.round(receivedAmt)}</span></div>` : ""}
      ${changeAmt > 0 ? `<div style="display:flex;justify-content:space-between;padding:2px 0"><span>Change Returned:</span><span style="font-weight:700;color:#007700">${currencySymbol} ${Math.round(changeAmt)}</span></div>` : ""}
    </div>
  </div>

  ${loyaltySection}
  ${creditSection}

  <!-- Thank You -->
  <div style="text-align:center;margin-top:10px;font-size:9px">
    <div style="font-weight:900;font-size:12px">THANK YOU!</div>
    <div style="margin-top:3px;color:#333;white-space:pre-line">${receiptFooter.replace(/\./g, ".\n")}</div>
  </div>

  <!-- Barcode -->
  <div style="text-align:center;margin:10px 0 4px">
    <svg id="barcode"></svg>
    <div style="font-size:9px;font-weight:700;letter-spacing:1px;margin-top:2px">${sale.receiptNumber}</div>
  </div>

  <!-- Footer -->
  <div style="text-align:center;font-size:8px;color:#555;margin-top:8px;border-top:1px dashed #aaa;padding-top:5px">
    Powered By: MT UniPOS | Developed By: MT Softwares
  </div>

  <script>
    try {
      JsBarcode("#barcode", "${sale.receiptNumber}", {
        format: "CODE128",
        width: 1.5,
        height: 40,
        displayValue: false,
        margin: 0
      });
    } catch(e) {
      console.error(e);
    }
  </script>
</body>
</html>`;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ThermalSlipModal({
  sale,
  currencySymbol,
  branch = "Store",
  businessSettings,
  onClose,
  onBack,
  isHidden = false
}: Props) {
  const slipRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { localReceiptsDirHandle, currentUser } = useGlobalContext();
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [autoSavedPath, setAutoSavedPath] = useState<string>("");
  const hasAutoSaved = useRef(false);

  const slipHTML = buildSlipHTML(sale, currencySymbol || "PKR", branch, businessSettings);

  // Auto-save logic — saves receipt to MT UniPOS folder on disk automatically
  useEffect(() => {
    if (hasAutoSaved.current) return;
    hasAutoSaved.current = true;

    const performAutoSave = async () => {
      setIsAutoSaving(true);
      setAutoSaveStatus("saving");

      const result = await autoSaveReceiptToDisk(sale, businessSettings, currencySymbol || "PKR");

      if (result.success) {
        setAutoSaveStatus("success");
        setAutoSavedPath(result.filePath || "");
      } else {
        console.warn("ThermalSlipModal auto-save error:", result.error);
        setAutoSaveStatus("error");
      }
      setIsAutoSaving(false);
    };

    performAutoSave();
  }, [sale.receiptNumber]);

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=420,height=800");
    if (!win) return;
    win.document.write(slipHTML);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 300);
  };

  const handleDownload = async () => {
    if (!slipRef.current) return;
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const canvas = await html2canvas(slipRef.current, {
        backgroundColor: "#ffffff",
        scale: 3,
        logging: false,
        useCORS: true
      });
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      const a = document.createElement("a");
      a.href = dataUrl;  // ← was missing — this is what triggers the download
      a.download = `${sale.receiptNumber}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to generate image:", err);
    }
  };

  const handleSaveToDisk = async () => {
    if (!slipRef.current) return;
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const canvas = await html2canvas(slipRef.current, {
        backgroundColor: "#ffffff",
        scale: 3,
        logging: false,
        useCORS: true
      });
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      const category = sale.status === "Dues_Recovery"
        ? "dues-receipt"
        : (sale.status === "Returned" || sale.status === "Refunded")
          ? "return-receipt"
          : "sale-receipt";

      const res = await fetch("/api/save-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          fileName: `${sale.receiptNumber}.jpg`,
          fileBase64: dataUrl,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setAutoSavedPath(json.filePath || "");
        setAutoSaveStatus("success");
      }
    } catch (err) {
      console.error("Save to disk error:", err);
    }
  };

  const dateObj = new Date(sale.date);
  const dateStr = dateObj.toLocaleDateString("en-PK", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = dateObj.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: true });

  const businessName = businessSettings?.businessName || "MT STORE";
  const city = businessSettings?.city || "";
  const phone = businessSettings?.phone || "";
  const ntn = businessSettings?.taxNumber || "";
  const receiptFooter = businessSettings?.receiptFooter || "Thank You! Exchange Within 7 Days.\nNo Return Without Original Invoice";

  const totalItems = sale.items.length;
  const totalQty = sale.items.reduce((a, i) => a + i.qty, 0);

  const isCreditSale = sale.paymentMethod === "On Credit" || sale.isCredit || (sale as any).splitPayments?.["On Credit"] > 0;
  const statusLabel = sale.status === "Dues_Recovery"
    ? "DUES PAYMENT RECEIPT"
    : sale.status === "Returned" || sale.status === "Refunded"
      ? "RETURN RECEIPT"
      : isCreditSale
        ? "CREDIT SALE RECEIPT"
        : "CASH SALE RECEIPT";

  const receivedAmt = sale.receivedAmount ?? (sale.paymentMethod === "Cash" ? sale.total : undefined);
  const changeAmt = sale.changeReturned ?? (receivedAmt !== undefined ? Math.max(0, receivedAmt - sale.total) : 0);

  return (
    <div className={isHidden ? "fixed -left-[9999px] top-0 opacity-0 pointer-events-none z-[-1]" : "fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-sans"}>
      <div className="bg-[#0d0d0d] border border-brand-dark-border rounded-2xl w-full max-w-sm shadow-2xl flex flex-col max-h-[96vh]">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-brand-dark-border shrink-0">
          <div className="flex items-center gap-2">
            {onBack && (
              <button onClick={onBack} className="text-gray-500 hover:text-white p-1 rounded hover:bg-brand-dark-border transition">
                <ArrowLeft size={14} />
              </button>
            )}
            <div>
              <h3 className="font-black text-white text-sm flex items-center gap-2">
                Thermal Slip
                {autoSaveStatus === "saving" && <Loader2 size={12} className="animate-spin text-brand-sky" />}
                {autoSaveStatus === "success" && (
                  <span
                    className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 cursor-pointer"
                    title={autoSavedPath ? `Saved to: ${autoSavedPath}` : "Saved to MT UniPOS folder"}
                  >
                    ✅ Auto-saved
                  </span>
                )}
                {autoSaveStatus === "error" && <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30">Save Failed</span>}
              </h3>
              <p className="text-[9px] text-gray-500 font-mono">{sale.receiptNumber}</p>
              {autoSaveStatus === "success" && autoSavedPath && (
                <p className="text-[8px] text-emerald-400/70 font-mono truncate max-w-[200px]" title={autoSavedPath}>
                  📁 {autoSavedPath.split(/[\/\\]/).slice(-3).join(" › ")}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white p-1 rounded hover:bg-brand-dark-border transition">
            <X size={15} />
          </button>
        </div>

        {/* Slip Preview */}
        <div className="flex-grow overflow-y-auto p-4 flex justify-center items-start bg-gray-900/40">
          <div
            ref={slipRef}
            className="bg-white text-black shadow-2xl"
            style={{
              width: "302px",
              minWidth: "302px",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: "10px",
              padding: "10px 10px 20px",
              lineHeight: 1.4
            }}
          >
            {/* ── Store Header ── */}
            <div style={{ textAlign: "center", marginBottom: "8px" }}>
              <img src="/logo.png" style={{ height: "44px", maxWidth: "180px", objectFit: "contain", margin: "0 auto 4px auto", display: "block" }} alt="MT UniPOS Logo" />
              <div style={{ fontSize: "14px", fontWeight: 900, letterSpacing: "0.5px", marginTop: "4px", textTransform: "uppercase" }}>{businessName}</div>
              {city && <div style={{ fontSize: "9px" }}>{city}</div>}
              {phone && <div style={{ fontSize: "9px" }}>Ph: {phone}</div>}
              {ntn && <div style={{ fontSize: "9px" }}>NTN: {ntn}</div>}
            </div>

            {/* ── Receipt Type Header ── */}
            <div style={{ background: "#000", color: "#fff", textAlign: "center", fontWeight: 900, fontSize: "10px", letterSpacing: "2px", padding: "5px 4px", marginBottom: "8px" }}>
              {statusLabel}
            </div>

            {/* ── Invoice Info ── */}
            <div style={{ borderBottom: "1px dashed #aaa", paddingBottom: "6px", marginBottom: "6px", fontSize: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Invoice No:</span><span style={{ fontWeight: 900 }}>{sale.receiptNumber}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Date:</span><span>{dateStr}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Time:</span><span>{timeStr}</span>
              </div>
              {sale.cashierName && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Cashier:</span><span>{sale.cashierName}</span>
                </div>
              )}
              {sale.customerName && (
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3px" }}>
                  <span>Customer Name:</span><span style={{ fontWeight: 900 }}>{sale.customerName}</span>
                </div>
              )}
              {sale.customerNo && sale.customerNo !== "N/A" && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Customer ID:</span><span style={{ fontWeight: 700 }}>{sale.customerNo}</span>
                </div>
              )}
            </div>

            {/* ── Items Table ── */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "0" }}>
              <thead>
                <tr style={{ background: "#000", color: "#fff" }}>
                  <th style={{ padding: "4px 2px", fontSize: "9px", textAlign: "center", width: "16px" }}>#</th>
                  <th style={{ padding: "4px 4px", fontSize: "9px", textAlign: "left" }}>Item</th>
                  <th style={{ padding: "4px 2px", fontSize: "9px", textAlign: "center" }}>Qty</th>
                  <th style={{ padding: "4px 2px", fontSize: "9px", textAlign: "right" }}>Rate</th>
                  <th style={{ padding: "4px 2px", fontSize: "9px", textAlign: "right" }}>Amt</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item, idx) => {
                  const rate = item.price ?? (item.subtotal / item.qty);
                  const qtyStr = typeof item.qty === "number" && item.qty % 1 !== 0
                    ? item.qty.toFixed(3)
                    : String(item.qty);
                  return (
                    <tr key={idx}>
                      <td style={{ padding: "3px 2px", fontSize: "10px", textAlign: "center", borderBottom: "1px dotted #ccc" }}>{idx + 1}</td>
                      <td style={{ padding: "3px 4px", fontSize: "10px", wordBreak: "break-word", borderBottom: "1px dotted #ccc" }}>{item.productName}</td>
                      <td style={{ padding: "3px 2px", fontSize: "10px", textAlign: "center", whiteSpace: "nowrap", borderBottom: "1px dotted #ccc" }}>{qtyStr}</td>
                      <td style={{ padding: "3px 2px", fontSize: "10px", textAlign: "right", whiteSpace: "nowrap", borderBottom: "1px dotted #ccc" }}>{Math.round(rate)}</td>
                      <td style={{ padding: "3px 2px", fontSize: "10px", textAlign: "right", whiteSpace: "nowrap", fontWeight: 700, borderBottom: "1px dotted #ccc" }}>{Math.round(item.subtotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* ── Subtotals ── */}
            <div style={{ borderTop: "1px dashed #aaa", borderBottom: "1px dashed #aaa", padding: "5px 0", margin: "4px 0", fontSize: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Total Items:</span><span style={{ fontWeight: 700 }}>{totalItems}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Total Quantity:</span><span style={{ fontWeight: 700 }}>{totalQty}</span>
              </div>
              {sale.discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Discount:</span><span style={{ fontWeight: 700 }}>-{currencySymbol} {Math.round(sale.discount)}</span>
                </div>
              )}
              {sale.tax > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Tax:</span><span style={{ fontWeight: 700 }}>{currencySymbol} {Math.round(sale.tax)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Sub Total:</span><span style={{ fontWeight: 700 }}>{currencySymbol} {Math.round(sale.subtotal)}</span>
              </div>
            </div>

            {/* ── Grand Total Bar ── */}
            <div style={{ background: "#000", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 6px", margin: "4px 0", fontWeight: 900, fontSize: "13px" }}>
              <span>GRAND TOTAL:</span>
              <span>{currencySymbol} {Math.round(sale.total)}</span>
            </div>

            {/* ── Payment Details ── */}
            <div style={{ border: "1px solid #ddd", borderRadius: "4px", margin: "8px 0", overflow: "hidden" }}>
              <div style={{ background: "#f5f5f5", fontWeight: 900, fontSize: "10px", padding: "4px 8px", letterSpacing: "1px", borderBottom: "1px solid #ddd" }}>
                PAYMENT DETAILS
              </div>
              <div style={{ padding: "6px 8px", fontSize: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                  <span>Payment Method:</span><span style={{ fontWeight: 700 }}>{sale.paymentMethod || "Cash"}</span>
                </div>
                {receivedAmt !== undefined && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                    <span>Received Amount:</span><span style={{ fontWeight: 700 }}>{currencySymbol} {Math.round(receivedAmt)}</span>
                  </div>
                )}
                {changeAmt > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                    <span>Change Returned:</span><span style={{ fontWeight: 700, color: "#007700" }}>{currencySymbol} {Math.round(changeAmt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Loyalty Points ── */}
            {sale.loyaltyPointsEarned !== undefined && sale.customerName !== "Walk-in Customer" && (
              <div style={{ border: "1px solid #ddd", borderRadius: "4px", margin: "8px 0", overflow: "hidden" }}>
                <div style={{ background: "#000", color: "#fff", fontWeight: 900, textAlign: "center", padding: "4px 6px", fontSize: "10px", letterSpacing: "1px" }}>
                  LOYALTY POINTS LEDGER
                </div>
                <div style={{ padding: "6px 8px", fontSize: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                    <span>Points Earned Today:</span><span style={{ fontWeight: 700 }}>+{sale.loyaltyPointsEarned}</span>
                  </div>
                  {sale.redeemLoyalty && (
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                      <span>Points Redeemed:</span><span style={{ fontWeight: 700, color: "#b00000" }}>-1000 pts</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontWeight: 900, fontSize: "11px", borderTop: "1px solid #eee", marginTop: "2px", paddingTop: "4px" }}>
                    <span>Total Points Balance:</span><span>{sale.loyaltyPointsBalance ?? 0} pts</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Customer Credit Statement ── */}
            {((sale.previousCreditBalance !== undefined && sale.previousCreditBalance > 0) || isCreditSale || (sale.totalCreditBalance !== undefined && sale.totalCreditBalance > 0)) && sale.customerName !== "Walk-in Customer" && (() => {
              const prevCredit = sale.previousCreditBalance ?? 0;
              const currentCredit = (sale as any).splitPayments && (sale as any).splitPayments["On Credit"] !== undefined
                ? ((sale as any).splitPayments["On Credit"] || 0)
                : (sale.paymentMethod === "On Credit" || sale.isCredit)
                  ? sale.total
                  : 0;
              const totalCredit = sale.totalCreditBalance ?? (prevCredit + currentCredit);
              return (
                <div style={{ border: "1px solid #000", borderRadius: "4px", margin: "8px 0", overflow: "hidden" }}>
                  <div style={{ background: "#000", color: "#fff", fontWeight: 900, textAlign: "center", padding: "4px 6px", fontSize: "10px", letterSpacing: "1px" }}>
                    CUSTOMER CREDIT STATEMENT
                  </div>
                  <div style={{ padding: "6px 8px", fontSize: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                      <span>Previous Credit Balance:</span><span>{currencySymbol} {Math.round(prevCredit)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                      <span>This Invoice Credit:</span><span style={{ fontWeight: 700 }}>{currencySymbol} {Math.round(currentCredit)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontWeight: 900, fontSize: "11px", borderTop: "1px dashed #aaa", marginTop: "2px" }}>
                      <span>Total Outstanding Credit:</span><span style={{ color: "#b00000" }}>{currencySymbol} {Math.round(totalCredit)}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── Notes ── */}
            {sale.notes && (
              <div style={{ fontSize: "9px", marginTop: "6px", borderTop: "1px dashed #aaa", paddingTop: "4px" }}>
                Note: {sale.notes}
              </div>
            )}

            {/* ── Thank You ── */}
            <div style={{ textAlign: "center", marginTop: "10px", fontSize: "9px" }}>
              <div style={{ fontWeight: 900, fontSize: "13px" }}>THANK YOU!</div>
              <div style={{ marginTop: "4px", color: "#333", fontSize: "9px", lineHeight: 1.6 }}>
                We Appreciate Your Business<br/>
                Exchange Within 7 Days<br/>
                No Return Without Original Invoice
              </div>
            </div>

            {/* ── Barcode ── */}
            <div style={{ textAlign: "center", margin: "10px auto 4px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Barcode value={sale.receiptNumber} width={1.5} height={40} displayValue={false} margin={0} />
              <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "1px", marginTop: "2px" }}>{sale.receiptNumber}</div>
            </div>

            {/* ── Footer ── */}
            <div style={{ textAlign: "center", fontSize: "8px", color: "#555", marginTop: "8px", borderTop: "1px dashed #aaa", paddingTop: "5px" }}>
              Powered By: MT UniPOS | Developed By: MT Softwares
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-3 border-t border-brand-dark-border shrink-0 grid grid-cols-3 gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-brand-sky hover:bg-brand-sky-light text-black font-black text-xs uppercase rounded-xl transition shadow-lg shadow-brand-sky/20"
          >
            <Printer size={14} /> Print
          </button>
          <button
            onClick={handleSaveToDisk}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase rounded-xl transition shadow-lg shadow-emerald-500/20"
          >
            <Download size={14} /> Save to Disk
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-brand-dark-border hover:bg-brand-dark-border/70 text-gray-300 font-bold text-xs uppercase rounded-xl transition"
          >
            <Download size={14} /> Export JPG
          </button>
        </div>
      </div>

      {/* Hidden iframe ref for potential future use */}
      <iframe ref={iframeRef} style={{ display: "none" }} title="thermal-print" />
    </div>
  );
}
