import { saveFileToSelectedFolder } from "@/lib/local-storage-folder";
import { BusinessSettings } from "@/context/global-context";

const savedReceiptsSet = new Set<string>();

/**
 * Automatically captures a rich, full thermal receipt image matching Picture 2
 * (with MT UniPOS header, Customer ID, totals breakdown, payment details,
 * loyalty ledger, customer credit statement, thank you notes, and barcode)
 * and saves it directly into the local disk folder.
 */
export async function autoSaveReceiptToDisk(
  sale: any,
  businessSettings?: BusinessSettings,
  currencySymbol: string = "PKR"
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    if (typeof window === "undefined" || !sale || !sale.receiptNumber) {
      return { success: false, error: "Invalid parameters or SSR context" };
    }

    if (savedReceiptsSet.has(sale.receiptNumber)) {
      return { success: true, filePath: `${sale.receiptNumber}.jpg` };
    }
    savedReceiptsSet.add(sale.receiptNumber);

    const category =
      sale.status === "Dues_Recovery"
        ? "dues-receipt"
        : sale.status === "Returned" || sale.status === "Refunded"
        ? "return-receipt"
        : "sale-receipt";

    const localFileName = `${sale.receiptNumber}.jpg`;

    // 1. Construct temporary off-screen receipt DOM element
    const container = document.createElement("div");
    container.style.cssText =
      "position:fixed;left:-9999px;top:0;width:302px;background:#ffffff;color:#000000;padding:10px 10px 20px;font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:1.4;z-index:-9999;";

    const dateObj = sale.date ? new Date(sale.date) : new Date();
    const dateStr = dateObj.toLocaleDateString("en-PK", { day: "2-digit", month: "2-digit", year: "numeric" });
    const timeStr = dateObj.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: true });

    const businessName = businessSettings?.businessName || "MT STORE";
    const city = businessSettings?.city || "";
    const phone = businessSettings?.phone || "";
    const ntn = businessSettings?.taxNumber || "";
    const receiptFooter = businessSettings?.receiptFooter || "We Appreciate Your Business\nExchange Within 7 Days\nNo Return Without Original Invoice";

    const totalItems = sale.items ? sale.items.length : 0;
    const totalQty = sale.items ? sale.items.reduce((a: number, i: any) => a + (i.qty || 1), 0) : 0;

    const isCreditSale = sale.paymentMethod === "On Credit" || sale.isCredit || (sale as any).splitPayments?.["On Credit"] > 0;
    const statusLabel =
      sale.status === "Dues_Recovery"
        ? "DUES PAYMENT RECEIPT"
        : sale.status === "Returned" || sale.status === "Refunded"
        ? "RETURN RECEIPT"
        : isCreditSale
        ? "CREDIT SALE RECEIPT"
        : "CASH SALE RECEIPT";

    const itemsHtml = (sale.items || [])
      .map((item: any, idx: number) => {
        const rate = item.price ?? (item.subtotal / (item.qty || 1));
        const qtyStr = typeof item.qty === "number" && item.qty % 1 !== 0 ? item.qty.toFixed(3) : String(item.qty || 1);
        return `
        <tr>
          <td style="padding:3px 2px;font-size:10px;text-align:center;border-bottom:1px dotted #ccc">${idx + 1}</td>
          <td style="padding:3px 4px;font-size:10px;word-break:break-word;border-bottom:1px dotted #ccc">${item.productName || item.name}</td>
          <td style="padding:3px 2px;font-size:10px;text-align:center;white-space:nowrap;border-bottom:1px dotted #ccc">${qtyStr}</td>
          <td style="padding:3px 2px;font-size:10px;text-align:right;white-space:nowrap;border-bottom:1px dotted #ccc">${Math.round(rate)}</td>
          <td style="padding:3px 2px;font-size:10px;text-align:right;white-space:nowrap;font-weight:700;border-bottom:1px dotted #ccc">${Math.round(item.subtotal || 0)}</td>
        </tr>`;
      })
      .join("");

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
            <span>Total Outstanding Balance:</span><span style="color:#b00000">${currencySymbol} ${Math.round(totalCredit)}</span>
          </div>
        </div>
      </div>` : "";

    const loyaltySection = ((sale.loyaltyPointsEarned !== undefined || sale.loyaltyPointsBalance !== undefined) && sale.customerName !== "Walk-in Customer")
      ? `
      <div style="border:1px solid #ddd;border-radius:4px;margin:8px 0;overflow:hidden">
        <div style="background:#000;color:#fff;font-weight:900;text-align:center;padding:4px 6px;font-size:10px;letter-spacing:1px">LOYALTY POINTS LEDGER</div>
        <div style="padding:6px 8px;font-size:10px">
          <div style="display:flex;justify-content:space-between;padding:2px 0">
            <span>Points Earned Today:</span><span style="font-weight:700">+${sale.loyaltyPointsEarned || 0}</span>
          </div>
          ${sale.redeemLoyalty ? `<div style="display:flex;justify-content:space-between;padding:2px 0"><span>Points Redeemed:</span><span style="font-weight:700;color:#b00000">-1000 pts</span></div>` : ""}
          <div style="display:flex;justify-content:space-between;padding:2px 0;font-weight:900;font-size:11px">
            <span>Total Points Balance:</span><span>${sale.loyaltyPointsBalance ?? 0} pts</span>
          </div>
        </div>
      </div>`
      : "";

    container.innerHTML = `
      <!-- Header -->
      <div style="text-align:center;margin-bottom:8px">
        <div style="font-size:16px;font-weight:900;letter-spacing:0.5px">🛒 MT UniPOS</div>
        <div style="font-size:8px;color:#666;margin-bottom:2px">Smart POS for Smart Business</div>
        <div style="font-size:14px;font-weight:900;letter-spacing:0.5px;margin-top:4px;text-transform:uppercase">${businessName}</div>
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
        ${((sale as any).customerPhone || (sale as any).phone || (sale as any).mobile) ? `<div style="display:flex;justify-content:space-between"><span>Customer Phone:</span><span style="font-weight:700;font-family:monospace">${(() => { const p = (((sale as any).customerPhone || (sale as any).phone || (sale as any).mobile) || "").trim(); return p.length >= 7 ? p.slice(0, 4) + "****" + p.slice(-3) : p; })()}</span></div>` : ""}
      </div>

      <!-- Items Table -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:0">
        <thead>
          <tr style="background:#000;color:#fff">
            <th style="padding:4px 2px;font-size:9px;text-align:center;width:16px">#</th>
            <th style="padding:4px 4px;font-size:9px;text-align:left">Item</th>
            <th style="padding:4px 2px;font-size:9px;text-align:center">Qty</th>
            <th style="padding:4px 2px;font-size:9px;text-align:right">Rate</th>
            <th style="padding:4px 2px;font-size:9px;text-align:right">Amt</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <!-- Totals -->
      <div style="border-top:1px dashed #aaa;border-bottom:1px dashed #aaa;padding:5px 0;margin:4px 0;font-size:10px">
        <div style="display:flex;justify-content:space-between"><span>Total Items:</span><span style="font-weight:700">${totalItems}</span></div>
        <div style="display:flex;justify-content:space-between"><span>Total Quantity:</span><span style="font-weight:700">${totalQty}</span></div>
        ${sale.discount > 0 ? `<div style="display:flex;justify-content:space-between"><span>Discount:</span><span style="font-weight:700">-${currencySymbol} ${Math.round(sale.discount)}</span></div>` : ""}
        ${sale.tax > 0 ? `<div style="display:flex;justify-content:space-between"><span>Tax:</span><span style="font-weight:700">${currencySymbol} ${Math.round(sale.tax)}</span></div>` : ""}
        <div style="display:flex;justify-content:space-between"><span>Sub Total:</span><span style="font-weight:700">${currencySymbol} ${Math.round(sale.subtotal || sale.total || 0)}</span></div>
      </div>

      <!-- Grand Total -->
      <div style="background:#000;color:#fff;display:flex;justify-content:space-between;align-items:center;padding:7px 6px;margin:4px 0;font-weight:900;font-size:13px">
        <span>GRAND TOTAL:</span>
        <span>${currencySymbol} ${Math.round(sale.total || 0)}</span>
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

      <!-- Thank You & Online Self-Service Guidance -->
      <div style="text-align:center;margin-top:10px;font-size:9px">
        <div style="font-weight:900;font-size:12px">THANK YOU!</div>
        <div style="margin-top:3px;color:#333;white-space:pre-line">${receiptFooter.replace(/\./g, ".\n")}</div>
      </div>

      <!-- Online Self-Service Guidance Note -->
      <div style="border:1px dashed #000;border-radius:6px;padding:6px 8px;margin:10px 0 6px 0;text-align:center;background:#fafafa">
        <div style="font-weight:900;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;color:#000">🌐 ONLINE LEDGER &amp; RECEIPT PORTAL</div>
        <div style="font-size:8px;margin-top:3px;color:#333;line-height:1.4">
          Track your past receipts, full purchase ledger &amp; credit dues 24/7 online:<br/>
          <b style="font-size:9px;color:#0284c7;font-family:monospace">pos.mtcore.xyz/track-ticket</b><br/>
          Search Invoice #: <b>${sale.receiptNumber}</b>${sale.customerNo ? ` or Customer ID: <b>${sale.customerNo}</b>` : ""}
        </div>
      </div>

      <!-- Barcode -->
      <div style="text-align:center;margin:10px 0 4px">
        <svg id="barcode-svg" style="display:block;margin:0 auto"></svg>
        <div style="font-size:9px;font-weight:700;letter-spacing:1px;margin-top:2px">${sale.receiptNumber}</div>
      </div>

      <!-- Footer -->
      <div style="text-align:center;font-size:8px;color:#555;margin-top:8px;border-top:1px dashed #aaa;padding-top:5px">
        Powered By: MT UniPOS | Developed By: MT Softwares
      </div>
    `;

    document.body.appendChild(container);

    // Render Barcode via JsBarcode into svg
    const svgElem = container.querySelector("#barcode-svg");
    if (svgElem) {
      try {
        const JsBarcode = (await import("jsbarcode")).default;
        JsBarcode(svgElem, sale.receiptNumber, {
          format: "CODE128",
          width: 1.5,
          height: 40,
          displayValue: false,
          margin: 0,
        });
      } catch (bcErr) {
        console.warn("JsBarcode SVG render skipped:", bcErr);
      }
    }

    // 2. Capture canvas
    const html2canvas = (await import("html2canvas-pro")).default;
    const canvas = await html2canvas(container, {
      backgroundColor: "#ffffff",
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    document.body.removeChild(container);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    if (!dataUrl || dataUrl === "data:,") {
      return { success: false, error: "Canvas capture returned empty data" };
    }

    // 3. Save to user selected folder / API / Download fallback
    return await saveFileToSelectedFolder(category, localFileName, dataUrl);
  } catch (err: any) {
    console.error("autoSaveReceiptToDisk failed:", err);
    return { success: false, error: err?.message || String(err) };
  }
}
