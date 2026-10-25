import jsPDF from "jspdf";

export interface ZReportData {
  id: string; // e.g. "Z-2026-0042"
  reportNumber?: number;
  businessName: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  taxNumber?: string;
  branch: string;
  counterName: string;
  cashierName: string;
  cashierEmail?: string;
  shiftStartTime: string;
  shiftEndTime: string;
  generatedAt: string;
  currencySymbol: string;

  // Financial Summary
  grossSales: number;
  discounts: number;
  netSales: number;
  tax: number;
  refunds: number;
  totalRevenue: number;

  // Tender / Payment breakdown
  cashSales: number;
  cardSales: number;
  bankSales: number;
  walletSales: number;
  creditSales: number;

  // Cash Drawer Reconciliation
  openingFloat: number;
  cashReceived: number;
  cashExpenses: number;
  expectedCash: number;
  actualCash: number;
  discrepancy: number; // actualCash - expectedCash

  // Transaction Metrics
  totalTransactions: number;
  itemsSold: number;
  firstReceiptNumber?: string;
  lastReceiptNumber?: string;
  averageTransactionValue: number;
  returnsCount: number;

  // Category breakdown
  categoryBreakdown?: Array<{
    category: string;
    itemsCount: number;
    totalAmount: number;
    percentage: number;
  }>;

  notes?: string;
}

/**
 * Generates an Executive A4 High-Resolution PDF document for Z-Report closing
 */
export function generateZReportPDF(data: ZReportData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const cur = data.currencySymbol || "PKR";

  // Helper formatting
  const fmt = (val: number) => {
    return `${cur} ${Number(val || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const fmtDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })} ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
    } catch {
      return iso;
    }
  };

  let y = margin;

  // ── 1. Top Decorative Brand Banner ──────────────────────────────────────────
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, contentWidth, 24, "F");

  // Business Name & Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text((data.businessName || "MT UNIPOS").toUpperCase(), margin + 5, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  const subAddress = [data.branch ? `Branch: ${data.branch}` : "", data.taxNumber ? `NTN/Tax: ${data.taxNumber}` : "", data.businessPhone ? `Tel: ${data.businessPhone}` : ""]
    .filter(Boolean)
    .join("  |  ");
  doc.text(subAddress || "Official Point of Sale Daily Audit Record", margin + 5, y + 14);

  // Right-aligned Z-Report Sequence Badge
  doc.setFillColor(124, 58, 237); // purple-600
  doc.roundedRect(pageWidth - margin - 52, y + 4, 47, 16, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("DAILY Z-REPORT", pageWidth - margin - 28.5, y + 10, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(data.id || "Z-REPORT", pageWidth - margin - 28.5, y + 15, { align: "center" });

  y += 28;

  // ── 2. Meta Information Bar ────────────────────────────────────────────────
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, "FD");

  const col1X = margin + 4;
  const col2X = margin + contentWidth * 0.28 + 4;
  const col3X = margin + contentWidth * 0.52 + 4;
  const col4X = margin + contentWidth * 0.77 + 4;

  // Meta Col 1: Register
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("REGISTER / TILL", col1X, y + 5.5);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(7.5);
  doc.text(data.counterName || "Main Counter", col1X, y + 12, { maxWidth: contentWidth * 0.26 });

  // Meta Col 2: Cashier
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("CASHIER", col2X, y + 5.5);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(7.5);
  doc.text(data.cashierName || "System Cashier", col2X, y + 12, { maxWidth: contentWidth * 0.22 });

  // Meta Col 3: Shift Period
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("SHIFT PERIOD", col3X, y + 5.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text(`${fmtDate(data.shiftStartTime)}`, col3X, y + 10);
  doc.text(`to ${fmtDate(data.shiftEndTime)}`, col3X, y + 14);

  // Meta Col 4: Generated At
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("GENERATED AT", col4X, y + 5.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(fmtDate(data.generatedAt || new Date().toISOString()), col4X, y + 12, { maxWidth: contentWidth * 0.22 });

  y += 23;

  // ── 3. High-Level Stat KPI Cards ──────────────────────────────────────────
  const kpiW = (contentWidth - 9) / 4;
  const kpiH = 17;

  const kpis = [
    { label: "NET REVENUE", val: fmt(data.totalRevenue), color: [16, 185, 129], bg: [236, 253, 245] },
    { label: "TRANSACTIONS", val: String(data.totalTransactions || 0), color: [2, 132, 199], bg: [240, 249, 255] },
    { label: "ITEMS SOLD", val: String(data.itemsSold || 0), color: [124, 58, 237], bg: [245, 243, 255] },
    {
      label: "TILL DISCREPANCY",
      val: data.discrepancy === 0 ? "EXACT (0.00)" : (data.discrepancy > 0 ? `+${fmt(data.discrepancy)}` : fmt(data.discrepancy)),
      color: data.discrepancy === 0 ? [16, 185, 129] : (data.discrepancy > 0 ? [217, 119, 6] : [225, 29, 72]),
      bg: data.discrepancy === 0 ? [236, 253, 245] : (data.discrepancy > 0 ? [254, 243, 199] : [255, 241, 242])
    }
  ];

  kpis.forEach((kpi, idx) => {
    const kpiX = margin + idx * (kpiW + 3);
    doc.setFillColor(kpi.bg[0], kpi.bg[1], kpi.bg[2]);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(kpiX, y, kpiW, kpiH, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, kpiX + 3.5, y + 5);

    doc.setFontSize(9.5);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.val, kpiX + 3.5, y + 12);
  });

  y += 22;

  // ── 4. Two Columns: Financial Statement (Left) & Tender Breakdown (Right) ──
  const halfW = (contentWidth - 6) / 2;

  // Section Titles
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("1. SALES FINANCIAL STATEMENT", margin, y);
  doc.text("2. PAYMENT TENDER BREAKDOWN", margin + halfW + 6, y);

  y += 3.5;

  // Table Left: Financial Statement
  const finRows = [
    { label: "Gross Sales (Item Totals)", val: fmt(data.grossSales) },
    { label: "(-) Discounts / Markdowns Given", val: `-${fmt(data.discounts)}` },
    { label: "(=) Net Sales", val: fmt(data.netSales), bold: true },
    { label: "(+) Sales Tax / VAT Collected", val: fmt(data.tax) },
    { label: "(-) Returns & Refunds Issued", val: `-${fmt(data.refunds)}` },
    { label: "(=) Grand Total Net Revenue", val: fmt(data.totalRevenue), bold: true, highlight: true }
  ];

  const rowH = 6.2;
  finRows.forEach((r, idx) => {
    const curY = y + idx * rowH;
    if (r.highlight) {
      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(margin, curY, halfW, rowH, "F");
    } else if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, curY, halfW, rowH, "F");
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, curY + rowH, margin + halfW, curY + rowH);

    doc.setFont("helvetica", r.bold ? "bold" : "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(r.bold ? 15 : 71, r.bold ? 23 : 85, r.bold ? 42 : 105);
    doc.text(r.label, margin + 2.5, curY + 4.2);

    doc.text(r.val, margin + halfW - 2.5, curY + 4.2, { align: "right" });
  });

  // Table Right: Tender Breakdown
  const tenderRows = [
    { label: "Cash Collections", val: fmt(data.cashSales) },
    { label: "Card Transactions (Debit / Credit)", val: fmt(data.cardSales) },
    { label: "Bank Direct Transfers", val: fmt(data.bankSales) },
    { label: "Mobile Wallets (EasyPaisa/Jazz/Sada)", val: fmt(data.walletSales) },
    { label: "Store Credit / Customer Udhar", val: fmt(data.creditSales) },
    { label: "Total Tender Received", val: fmt(data.cashSales + data.cardSales + data.bankSales + data.walletSales + data.creditSales), bold: true, highlight: true }
  ];

  tenderRows.forEach((r, idx) => {
    const curY = y + idx * rowH;
    const rightX = margin + halfW + 6;
    if (r.highlight) {
      doc.setFillColor(241, 245, 249);
      doc.rect(rightX, curY, halfW, rowH, "F");
    } else if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(rightX, curY, halfW, rowH, "F");
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(rightX, curY + rowH, rightX + halfW, curY + rowH);

    doc.setFont("helvetica", r.bold ? "bold" : "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(r.bold ? 15 : 71, r.bold ? 23 : 85, r.bold ? 42 : 105);
    doc.text(r.label, rightX + 2.5, curY + 4.2);

    doc.text(r.val, rightX + halfW - 2.5, curY + 4.2, { align: "right" });
  });

  y += finRows.length * rowH + 6;

  // ── 5. Cash Drawer Till Reconciliation (Full Width Box) ─────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("3. CASH DRAWER (TILL RECONCILIATION & AUDIT)", margin, y);

  y += 3.5;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 26, 1.5, 1.5, "FD");

  const tillColW = contentWidth / 6;

  const tillItems = [
    { label: "OPENING FLOAT", val: fmt(data.openingFloat) },
    { label: "(+) CASH SALES", val: `+${fmt(data.cashSales)}`, color: [16, 185, 129] },
    { label: "(-) TILL EXPENSES", val: `-${fmt(data.cashExpenses)}`, color: [225, 29, 72] },
    { label: "EXPECTED CASH", val: fmt(data.expectedCash), bold: true },
    { label: "COUNTED CASH", val: fmt(data.actualCash), bold: true, color: [2, 132, 199] },
    {
      label: "DISCREPANCY",
      val: data.discrepancy === 0 ? "BALANCED" : (data.discrepancy > 0 ? `OVER +${fmt(data.discrepancy)}` : `SHORT ${fmt(data.discrepancy)}`),
      bold: true,
      color: data.discrepancy === 0 ? [16, 185, 129] : (data.discrepancy > 0 ? [217, 119, 6] : [225, 29, 72])
    }
  ];

  tillItems.forEach((item, idx) => {
    const itemX = margin + idx * tillColW;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(item.label, itemX + 3, y + 6);

    doc.setFont("helvetica", item.bold ? "bold" : "normal");
    doc.setFontSize(8);
    if (item.color) {
      doc.setTextColor(item.color[0], item.color[1], item.color[2]);
    } else {
      doc.setTextColor(15, 23, 42);
    }
    doc.text(item.val, itemX + 3, y + 14);

    if (idx < tillItems.length - 1) {
      doc.setDrawColor(226, 232, 240);
      doc.line(itemX + tillColW, y + 2, itemX + tillColW, y + 24);
    }
  });

  // Discrepancy Note bar under till
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 116, 139);
  const discrepancyExplanation = data.discrepancy === 0
    ? "Drawer cash matched the exact system calculated balance perfectly (Zero variance)."
    : data.discrepancy > 0
      ? `Cashier counted ${fmt(data.discrepancy)} higher than expected in till.`
      : `Shortage of ${fmt(Math.abs(data.discrepancy))} detected between counted till cash and system expected balance.`;
  doc.text(`Audit Note: ${discrepancyExplanation}`, margin + 3, y + 22);

  y += 32;

  // ── 6. Category Performance Table (if available) ───────────────────────────
  if (data.categoryBreakdown && data.categoryBreakdown.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text("4. DEPARTMENT / CATEGORY BREAKDOWN", margin, y);

    y += 3.5;

    // Header row
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, contentWidth, 5.5, "F");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text("CATEGORY", margin + 3, y + 3.8);
    doc.text("ITEMS SOLD", margin + contentWidth * 0.45, y + 3.8, { align: "right" });
    doc.text("TOTAL REVENUE", margin + contentWidth * 0.75, y + 3.8, { align: "right" });
    doc.text("SHARE %", margin + contentWidth - 3, y + 3.8, { align: "right" });

    y += 5.5;

    data.categoryBreakdown.slice(0, 6).forEach((cat, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentWidth, 5, "F");
      }
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y + 5, margin + contentWidth, y + 5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(15, 23, 42);
      doc.text(cat.category, margin + 3, y + 3.6);
      doc.text(String(cat.itemsCount), margin + contentWidth * 0.45, y + 3.6, { align: "right" });
      doc.text(fmt(cat.totalAmount), margin + contentWidth * 0.75, y + 3.6, { align: "right" });
      doc.text(`${(cat.percentage || 0).toFixed(1)}%`, margin + contentWidth - 3, y + 3.6, { align: "right" });

      y += 5;
    });

    y += 4;
  }

  // ── 7. Operational Audit Trail ─────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("5. OPERATIONAL AUDIT METRICS", margin, y);
  y += 3.5;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, "FD");

  const auditW = contentWidth / 3;
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);

  doc.text(`First Receipt: ${data.firstReceiptNumber || "N/A"}`, margin + 4, y + 4.5);
  doc.text(`Last Receipt: ${data.lastReceiptNumber || "N/A"}`, margin + 4, y + 9);

  doc.text(`Average Basket: ${fmt(data.averageTransactionValue)}`, margin + auditW + 4, y + 4.5);
  doc.text(`Items Sold: ${data.itemsSold} units`, margin + auditW + 4, y + 9);

  doc.text(`Refunds Issued: ${data.returnsCount || 0} returns`, margin + auditW * 2 + 4, y + 4.5);
  doc.text(`Cash Drawer Payouts: ${fmt(data.cashExpenses)}`, margin + auditW * 2 + 4, y + 9);

  y += 15.5;

  // Dedicated Cashier / Manager Handover Note
  if (data.notes) {
    const noteLines = doc.splitTextToSize(data.notes, contentWidth - 8);
    const noteBoxH = Math.max(10, 5 + noteLines.length * 3.6);
    doc.setFillColor(254, 243, 199); // amber-100
    doc.setDrawColor(245, 158, 11);  // amber-500
    doc.roundedRect(margin, y, contentWidth, noteBoxH, 1.5, 1.5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(180, 83, 9);
    doc.text("CASHIER / MANAGER CLOSING NOTE:", margin + 4, y + 4);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(69, 26, 3);
    doc.text(noteLines, margin + 4, y + 7.8);
    y += noteBoxH + 3;
  } else {
    y += 3;
  }

  // ── 8. Official Sign-off & Stamp Lines ──────────────────────────────────────
  const signBoxW = (contentWidth - 16) / 2;
  const signY = pageHeight - margin - 22;

  // Cashier Signature Line
  doc.setDrawColor(148, 163, 184);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(margin, signY + 12, margin + signBoxW, signY + 12);
  doc.setLineDashPattern([], 0);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("CASHIER SIGNATURE / TILL OPERATOR", margin, signY + 16);
  doc.text(`${data.cashierName || "Cashier"} (${fmtDate(data.shiftEndTime)})`, margin, signY + 19.5);

  // Manager Approval & Stamp
  const mgrX = margin + signBoxW + 16;
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(mgrX, signY + 12, mgrX + signBoxW, signY + 12);
  doc.setLineDashPattern([], 0);

  doc.text("STORE MANAGER / AUDITOR APPROVAL STAMP", mgrX, signY + 16);
  doc.text("Verified & Reconciled into General Ledger", mgrX, signY + 19.5);

  // ── 9. Official Footer ──────────────────────────────────────────────────────
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text(
    `MT UniPOS Enterprise Edition · Official Fiscal Z-Report · Record: ${data.id} · Page 1 of 1`,
    pageWidth / 2,
    pageHeight - 5,
    { align: "center" }
  );

  if (typeof window !== "undefined") {
    try {
      doc.save(`Z-Report-${data.id}.pdf`);
    } catch {}
  }

  return doc;
}

/**
 * Direct print-ready 80mm thermal receipt markup string
 */
export function generateThermalZReportHTML(data: ZReportData): string {
  const cur = data.currencySymbol || "PKR";
  const fmt = (n: number) => `${cur} ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return `
    <div style="font-family: 'Courier New', Courier, monospace; width: 280px; margin: 0 auto; padding: 8px; font-size: 11px; line-height: 1.35; color: #000; background: #fff;">
      <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 6px; margin-bottom: 6px;">
        <h2 style="margin: 0; font-size: 15px; font-weight: bold; text-transform: uppercase;">${data.businessName || "MT UNIPOS"}</h2>
        <div style="font-size: 10px;">${data.branch || "Main Branch"}</div>
        <div style="font-size: 10px; font-weight: bold; margin-top: 4px;">*** DAILY Z-REPORT ***</div>
        <div style="font-size: 9px;">REPORT ID: ${data.id}</div>
      </div>

      <div style="font-size: 10px; margin-bottom: 6px;">
        <div>TILL: ${data.counterName || "Counter 1"}</div>
        <div>CASHIER: ${data.cashierName || "Cashier"}</div>
        <div>START: ${new Date(data.shiftStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${new Date(data.shiftStartTime).toLocaleDateString()})</div>
        <div>CLOSE: ${new Date(data.shiftEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${new Date(data.shiftEndTime).toLocaleDateString()})</div>
      </div>

      <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 4px 0; margin-bottom: 6px;">
        <div style="font-weight: bold; text-align: center; margin-bottom: 3px;">SALES SUMMARY</div>
        <div style="display: flex; justify-content: space-between;"><span>GROSS SALES:</span><span>${fmt(data.grossSales)}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>DISCOUNTS:</span><span>-${fmt(data.discounts)}</span></div>
        <div style="display: flex; justify-content: space-between; font-weight: bold;"><span>NET SALES:</span><span>${fmt(data.netSales)}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>TAX / VAT:</span><span>${fmt(data.tax)}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>REFUNDS/RETURNS:</span><span>-${fmt(data.refunds)}</span></div>
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 12px; margin-top: 2px; border-top: 1px solid #000; padding-top: 2px;">
          <span>TOTAL REVENUE:</span><span>${fmt(data.totalRevenue)}</span>
        </div>
      </div>

      <div style="border-bottom: 1px dashed #000; padding-bottom: 6px; margin-bottom: 6px;">
        <div style="font-weight: bold; text-align: center; margin-bottom: 3px;">TENDER BREAKDOWN</div>
        <div style="display: flex; justify-content: space-between;"><span>CASH:</span><span>${fmt(data.cashSales)}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>CARD:</span><span>${fmt(data.cardSales)}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>BANK:</span><span>${fmt(data.bankSales)}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>WALLETS:</span><span>${fmt(data.walletSales)}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>CREDIT:</span><span>${fmt(data.creditSales)}</span></div>
      </div>

      <div style="border-bottom: 1px dashed #000; padding-bottom: 6px; margin-bottom: 6px;">
        <div style="font-weight: bold; text-align: center; margin-bottom: 3px;">CASH DRAWER AUDIT</div>
        <div style="display: flex; justify-content: space-between;"><span>OPENING FLOAT:</span><span>${fmt(data.openingFloat)}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>+ CASH SALES:</span><span>+${fmt(data.cashSales)}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>- DRAWER EXPENSES:</span><span>-${fmt(data.cashExpenses)}</span></div>
        <div style="display: flex; justify-content: space-between; font-weight: bold;"><span>EXPECTED CASH:</span><span>${fmt(data.expectedCash)}</span></div>
        <div style="display: flex; justify-content: space-between; font-weight: bold;"><span>COUNTED CASH:</span><span>${fmt(data.actualCash)}</span></div>
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 11px; margin-top: 3px; border-top: 1px solid #000; padding-top: 2px;">
          <span>VARIANCE:</span><span>${data.discrepancy === 0 ? "EXACT (0.00)" : (data.discrepancy > 0 ? `+${fmt(data.discrepancy)}` : fmt(data.discrepancy))}</span>
        </div>
      </div>

      <div style="font-size: 10px; margin-bottom: 8px;">
        <div>TOTAL INVOICES: ${data.totalTransactions}</div>
        <div>ITEMS SOLD: ${data.itemsSold}</div>
        <div>FIRST INVOICE: ${data.firstReceiptNumber || "N/A"}</div>
        <div>LAST INVOICE: ${data.lastReceiptNumber || "N/A"}</div>
      </div>

      <div style="text-align: center; font-size: 9px; margin-top: 12px; border-top: 1px dashed #000; padding-top: 6px;">
        <div>*** END OF SHIFT REPORT ***</div>
        <div>CASHIER SIGN: ___________________</div>
        <div style="margin-top: 6px;">MANAGER SIGN: ___________________</div>
      </div>
    </div>
  `;
}
