import { saveFileToSelectedFolder } from "@/lib/local-storage-folder";
import { BusinessSettings } from "@/context/global-context";

/**
 * Automatically captures a receipt image and saves it directly into the
 * local disk folder chosen by the user (or default folder) with fail-safe fallbacks.
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
      "position:fixed;left:-9999px;top:0;width:302px;background:#ffffff;color:#000000;padding:10px;font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:1.4;z-index:-9999;";

    const dateObj = sale.date ? new Date(sale.date) : new Date();
    const dateStr = dateObj.toLocaleDateString("en-PK", { day: "2-digit", month: "2-digit", year: "numeric" });
    const timeStr = dateObj.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: true });

    const businessName = businessSettings?.businessName || "MT STORE";
    const city = businessSettings?.city || "";
    const phone = businessSettings?.phone || "";
    const ntn = businessSettings?.taxNumber || "";
    const receiptFooter = businessSettings?.receiptFooter || "Thank You! Exchange Within 7 Days.\nNo Return Without Original Invoice";

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

    container.innerHTML = `
      <div style="text-align:center;margin-bottom:8px">
        <div style="font-size:14px;font-weight:900;letter-spacing:0.5px;margin-top:4px;text-transform:uppercase">${businessName}</div>
        ${city ? `<div style="font-size:9px">${city}</div>` : ""}
        ${phone ? `<div style="font-size:9px">Ph: ${phone}</div>` : ""}
        ${ntn ? `<div style="font-size:9px">NTN: ${ntn}</div>` : ""}
      </div>
      <div style="background:#000;color:#fff;text-align:center;font-weight:900;font-size:10px;letter-spacing:2px;padding:5px 4px;margin-bottom:8px">
        ${statusLabel}
      </div>
      <div style="border-bottom:1px dashed #aaa;padding-bottom:6px;margin-bottom:6px;font-size:10px">
        <div style="display:flex;justify-content:space-between"><span>Invoice No:</span><span style="font-weight:900">${sale.receiptNumber}</span></div>
        <div style="display:flex;justify-content:space-between"><span>Date:</span><span>${dateStr}</span></div>
        <div style="display:flex;justify-content:space-between"><span>Time:</span><span>${timeStr}</span></div>
        ${sale.cashierName ? `<div style="display:flex;justify-content:space-between"><span>Cashier:</span><span>${sale.cashierName}</span></div>` : ""}
        ${sale.customerName ? `<div style="display:flex;justify-content:space-between;margin-top:3px"><span>Customer Name:</span><span style="font-weight:900">${sale.customerName}</span></div>` : ""}
      </div>
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
      <div style="border-top:1px dashed #aaa;border-bottom:1px dashed #aaa;padding:5px 0;margin:4px 0;font-size:10px">
        <div style="display:flex;justify-content:space-between"><span>Sub Total:</span><span style="font-weight:700">${currencySymbol} ${Math.round(sale.subtotal || sale.total || 0)}</span></div>
        ${sale.discount ? `<div style="display:flex;justify-content:space-between"><span>Discount:</span><span style="font-weight:700">-${currencySymbol} ${Math.round(sale.discount)}</span></div>` : ""}
        ${sale.tax ? `<div style="display:flex;justify-content:space-between"><span>Tax:</span><span style="font-weight:700">${currencySymbol} ${Math.round(sale.tax)}</span></div>` : ""}
      </div>
      <div style="background:#000;color:#fff;display:flex;justify-content:space-between;align-items:center;padding:7px 6px;margin:4px 0;font-weight:900;font-size:13px">
        <span>GRAND TOTAL:</span>
        <span>${currencySymbol} ${Math.round(sale.total || 0)}</span>
      </div>
      <div style="text-align:center;margin-top:10px;font-size:9px">
        <div style="font-weight:900;font-size:12px">THANK YOU!</div>
        <div style="margin-top:3px;color:#333;white-space:pre-line">${receiptFooter.replace(/\./g, ".\n")}</div>
      </div>
      <div style="text-align:center;font-size:8px;color:#555;margin-top:8px;border-top:1px dashed #aaa;padding-top:5px">
        Powered By: MT UniPOS | Developed By: MT Softwares
      </div>
    `;

    document.body.appendChild(container);

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
