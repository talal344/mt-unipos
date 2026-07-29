"use client";

import React, { useRef } from "react";
import { Printer, Download, X, ArrowLeft } from "lucide-react";

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
  loyaltyPointsEarned?: number;
  loyaltyPointsBalance?: number;
  redeemLoyalty?: boolean;
  isCredit?: boolean;
  notes?: string;
}

interface Props {
  sale: Sale;
  currencySymbol: string;
  branch?: string;
  onClose: () => void;
  onBack?: () => void;
}

// ─── Inline Thermal Slip HTML builder ─────────────────────────────────────────
// ─── Inline Thermal Slip HTML builder ─────────────────────────────────────────
function buildSlipHTML(sale: Sale, currencySymbol: string, branch: string): string {
  const date = new Date(sale.date).toLocaleString("en-PK", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
  const itemRows = sale.items.map(item => {
    const qtyStr = typeof item.qty === "number" && item.qty % 1 !== 0
      ? item.qty.toFixed(3)
      : item.qty;
    return `
      <tr>
        <td style="padding:2px 0;word-break:break-word">${item.productName}</td>
        <td style="padding:2px 4px;text-align:center;white-space:nowrap">${qtyStr}</td>
        <td style="padding:2px 0;text-align:right;white-space:nowrap">${currencySymbol} ${item.subtotal.toFixed(2)}</td>
      </tr>`;
  }).join("");

  const loyaltySection = (sale.loyaltyPointsEarned !== undefined && sale.customerName !== "Walk-in Customer")
    ? `<div style="border-top:1px dashed #000;padding-top:6px;margin-top:6px;font-size:9px;text-align:right;">
        <div>Points Earned: +${sale.loyaltyPointsEarned} pts</div>
        <div>Balance: ${sale.loyaltyPointsBalance ?? 0} pts</div>
        ${sale.redeemLoyalty ? '<div style="font-weight:700;text-transform:uppercase">Points Redeemed: -1000 pts</div>' : ""}
       </div>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Receipt ${sale.receiptNumber}</title>
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
  table { width: 100%; border-collapse: collapse; }
  th { font-weight: 700; border-bottom: 1px solid #000; padding-bottom: 4px; }
  .right { text-align: right; }
  .footer { font-size: 9px; text-align: center; margin-top: 10px; }
</style>
</head>
<body>
  <div class="center" style="margin-bottom:10px">
    <div style="font-size:14px;font-weight:900;font-family:Arial,sans-serif;letter-spacing:1px">MT UNIPOS</div>
    <div style="font-size:8px;text-transform:uppercase;letter-spacing:2px;color:#555">Mian Talal UniPOS ERP</div>
    <div style="font-size:9px">${branch}</div>
  </div>
  <div class="divider"></div>
  <div style="margin-bottom:6px;font-size:10px">
    <div>Receipt: <span class="bold">${sale.receiptNumber}</span></div>
    <div>Date: ${date}</div>
    ${sale.cashierName ? `<div>Cashier: ${sale.cashierName}</div>` : ""}
    <div>Customer: <span class="bold">${sale.customerName}</span></div>
    ${sale.customerNo && sale.customerNo !== "N/A" ? `<div>Customer No: <span class="bold">${sale.customerNo}</span></div>` : ""}
    ${sale.paymentMethod ? `<div>Payment: ${sale.paymentMethod}${sale.isCredit ? " (On Credit)" : ""}</div>` : ""}
  </div>
  <div class="divider"></div>
  <table style="margin-bottom:6px">
    <thead>
      <tr>
        <th style="text-align:left">Item</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>
  <div class="divider"></div>
  <div style="text-align:right;font-size:10px;margin-bottom:4px">
    <div>Subtotal: ${currencySymbol} ${sale.subtotal.toFixed(2)}</div>
    ${sale.tax > 0 ? `<div>Tax: ${currencySymbol} ${sale.tax.toFixed(2)}</div>` : ""}
    ${sale.discount > 0 ? `<div>Discount: -${currencySymbol} ${sale.discount.toFixed(2)}</div>` : ""}
  </div>
  <div class="divider-dash"></div>
  <div style="text-align:right;font-size:14px;font-weight:900;margin-bottom:6px">
    TOTAL: ${currencySymbol} ${sale.total.toFixed(2)}
  </div>
  ${loyaltySection}
  ${sale.notes ? `<div style="font-size:9px;margin-top:6px;border-top:1px dashed #000;padding-top:4px">Note: ${sale.notes}</div>` : ""}
  <div class="footer">
    ─────────────────<br/>
    Thank you for shopping!<br/>
    Powered by MT UniPOS SaaS ERP<br/>
    ─────────────────
  </div>
</body>
</html>`;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ThermalSlipModal({ sale, currencySymbol, branch = "Store", onClose, onBack }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const slipRef = useRef<HTMLDivElement>(null);

  const slipHTML = buildSlipHTML(sale, currencySymbol, branch);

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=400,height=700");
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
        scale: 2,
        logging: false,
        useCORS: true
      });
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${sale.receiptNumber}.jpg`;
      a.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
    }
  };

  const date = new Date(sale.date).toLocaleString("en-PK", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-sans">
      <div className="bg-[#0d0d0d] border border-brand-dark-border rounded-2xl w-full max-w-sm shadow-2xl flex flex-col max-h-[96vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-brand-dark-border shrink-0">
          <div className="flex items-center gap-2">
            {onBack && (
              <button onClick={onBack} className="text-gray-500 hover:text-white p-1 rounded hover:bg-brand-dark-border transition">
                <ArrowLeft size={14} />
              </button>
            )}
            <div>
              <h3 className="font-black text-white text-sm">Thermal Slip Preview</h3>
              <p className="text-[9px] text-gray-500 font-mono">{sale.receiptNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white p-1 rounded hover:bg-brand-dark-border transition">
            <X size={15} />
          </button>
        </div>

        {/* Slip preview — 80mm width */}
        <div className="flex-grow overflow-y-auto p-4 flex justify-center items-start bg-gray-900/40">
          <div
            ref={slipRef}
            className="bg-white text-black font-mono text-[11px] leading-relaxed shadow-2xl"
            style={{ width: "80mm", minWidth: "80mm", padding: "8px 10px 20px" }}
          >
            {/* Store Header */}
            <div className="text-center mb-3 space-y-0.5">
              <div className="font-sans font-black text-sm tracking-tight">MT UNIPOS</div>
              <div className="text-[8px] uppercase tracking-widest text-gray-500">Mian Talal UniPOS ERP</div>
              <div className="text-[9px] text-gray-700">{branch}</div>
            </div>

            <div className="border-t border-black" />

            {/* Meta */}
            <div className="py-1.5 space-y-0.5 text-[10px]">
              <div>Receipt: <span className="font-bold">{sale.receiptNumber}</span></div>
              <div>Date: {date}</div>
              {sale.cashierName && <div>Cashier: {sale.cashierName}</div>}
              <div>Customer: <span className="font-bold">{sale.customerName}</span></div>
              {sale.customerNo && sale.customerNo !== "N/A" && (
                <div>Customer No: <span className="font-bold">{sale.customerNo}</span></div>
              )}
              {sale.paymentMethod && (
                <div>Payment: {sale.paymentMethod}{sale.isCredit ? " (On Credit)" : ""}</div>
              )}
            </div>

            <div className="border-t border-black" />

            {/* Items */}
            <table className="w-full text-[10px] my-1.5">
              <thead>
                <tr className="border-b border-black">
                  <th className="text-left pb-1 font-bold">Item</th>
                  <th className="text-center pb-1 font-bold">Qty</th>
                  <th className="text-right pb-1 font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-200">
                    <td className="py-0.5 pr-1 break-words">{item.productName}</td>
                    <td className="py-0.5 text-center whitespace-nowrap px-1">
                      {typeof item.qty === "number" && item.qty % 1 !== 0 ? item.qty.toFixed(3) : item.qty}
                    </td>
                    <td className="py-0.5 text-right whitespace-nowrap">
                      {currencySymbol} {item.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-black" />

            {/* Totals */}
            <div className="text-right text-[10px] py-1.5 space-y-0.5">
              <div>Subtotal: {currencySymbol} {sale.subtotal.toFixed(2)}</div>
              {sale.tax > 0 && <div>Tax: {currencySymbol} {sale.tax.toFixed(2)}</div>}
              {sale.discount > 0 && <div>Discount: -{currencySymbol} {sale.discount.toFixed(2)}</div>}
            </div>

            <div className="border-t border-dashed border-black" />

            <div className="text-right font-bold text-sm py-1.5">
              TOTAL: {currencySymbol} {sale.total.toFixed(2)}
            </div>

            {/* Loyalty */}
            {sale.loyaltyPointsEarned !== undefined && sale.customerName !== "Walk-in Customer" && (
              <div className="border-t border-dashed border-black pt-1.5 text-right space-y-0.5 text-[9px]">
                <div>Points Earned: +{sale.loyaltyPointsEarned} pts</div>
                <div>Balance: {sale.loyaltyPointsBalance ?? 0} pts</div>
                {sale.redeemLoyalty && <div className="font-bold uppercase">Points Redeemed: -1000 pts</div>}
              </div>
            )}

            {/* Notes */}
            {sale.notes && (
              <div className="border-t border-dashed border-black pt-1.5 text-[9px] mt-1.5">
                Note: {sale.notes}
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-[8px] mt-3 pt-2 border-t border-black space-y-0.5">
              <div>─────────────────</div>
              <div>Thank you for shopping!</div>
              <div>Powered by MT UniPOS SaaS ERP</div>
              <div>─────────────────</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-3 border-t border-brand-dark-border shrink-0 grid grid-cols-2 gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-3 bg-brand-sky hover:bg-brand-sky-light text-black font-black text-xs uppercase rounded-xl transition shadow-lg shadow-brand-sky/20"
          >
            <Printer size={14} /> Print Slip
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 py-3 bg-brand-dark-border hover:bg-brand-dark-border/70 text-white font-black text-xs uppercase rounded-xl transition"
          >
            <Download size={14} /> Download Slip
          </button>
        </div>
      </div>

      {/* Hidden iframe ref for potential future use */}
      <iframe ref={iframeRef} style={{ display: "none" }} title="thermal-print" />
    </div>
  );
}
