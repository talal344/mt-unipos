import { BusinessSettings } from "@/context/global-context";
import { ZReportData } from "@/lib/z-report-pdf";

export interface SaleItem {
  productName: string;
  qty: number;
  price: number;
  subtotal: number;
}

export interface SaleReceiptData {
  id?: string;
  receiptNumber: string;
  date: string;
  cashierName?: string;
  customerName?: string;
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
  isCredit?: boolean;
  notes?: string;
}

/**
 * Normalizes phone numbers for WhatsApp wa.me links.
 * Handles Pakistani mobile numbers (03001234567 -> 923001234567),
 * international codes (+92, 0092), and strips spaces, hyphens, and parentheses.
 */
export function cleanPhoneNumber(rawPhone?: string): string {
  if (!rawPhone) return "";
  let cleaned = rawPhone.replace(/[^\d+]/g, "").trim();

  // Strip leading '+'
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }

  // Strip leading '00' (international prefix)
  if (cleaned.startsWith("00")) {
    cleaned = cleaned.substring(2);
  }

  // Pakistan local mobile starting with '03' -> convert to '923'
  if (cleaned.startsWith("03") && cleaned.length === 11) {
    cleaned = "92" + cleaned.substring(1);
  } else if (cleaned.startsWith("0") && cleaned.length >= 10) {
    // Other local numbers starting with 0
    cleaned = "92" + cleaned.substring(1);
  } else if (cleaned.startsWith("3") && cleaned.length === 10) {
    // 3001234567 without leading 0
    cleaned = "92" + cleaned;
  }

  return cleaned;
}

/**
 * Formats an itemized digital sales receipt for WhatsApp sharing.
 */
export function formatWhatsAppSaleReceipt(
  sale: SaleReceiptData,
  settings?: BusinessSettings,
  branch?: string,
  currency: string = "PKR"
): string {
  const storeName = settings?.businessName || "MT UniPOS Retail Store";
  const storePhone = settings?.phone || "";
  const storeAddress = settings?.address ? `${settings.address}${settings.city ? `, ${settings.city}` : ""}` : "";
  const cur = currency || settings?.defaultCurrency || "PKR";

  const lines: string[] = [];

  // Header
  lines.push("🧾 *DIGITAL SALES RECEIPT*");
  lines.push("━━━━━━━━━━━━━━━━━━━━━");
  lines.push(`🏬 *${storeName}*`);
  if (storeAddress) lines.push(`📍 ${storeAddress}`);
  if (storePhone) lines.push(`📞 ${storePhone}`);
  if (branch && branch !== "Main Branch") lines.push(`🏢 Branch: ${branch}`);
  lines.push("━━━━━━━━━━━━━━━━━━━━━");

  // Meta
  lines.push(`📋 *Invoice:* #${sale.receiptNumber}`);
  lines.push(`📅 *Date:* ${sale.date}`);
  lines.push(`👤 *Customer:* ${sale.customerName?.trim() || "Valued Customer"}`);
  if (sale.cashierName) lines.push(`🧑‍💼 *Cashier:* ${sale.cashierName}`);
  lines.push("━━━━━━━━━━━━━━━━━━━━━");

  // Items
  lines.push("🛍️ *ITEMS PURCHASED:*");
  sale.items.forEach((item, idx) => {
    const itemTotal = Number(item.subtotal || item.qty * item.price).toLocaleString();
    const itemPrice = Number(item.price).toLocaleString();
    lines.push(`${idx + 1}. *${item.productName}*`);
    lines.push(`   ${item.qty} × ${cur} ${itemPrice} = *${cur} ${itemTotal}*`);
  });
  lines.push("━━━━━━━━━━━━━━━━━━━━━");

  // Totals
  lines.push("💵 *PAYMENT SUMMARY:*");
  lines.push(`• Subtotal: ${cur} ${Number(sale.subtotal).toLocaleString()}`);
  if (Number(sale.discount) > 0) {
    lines.push(`• Discount: -${cur} ${Number(sale.discount).toLocaleString()}`);
  }
  if (Number(sale.tax) > 0) {
    lines.push(`• Tax/GST: +${cur} ${Number(sale.tax).toLocaleString()}`);
  }
  lines.push(`• *GRAND TOTAL: ${cur} ${Number(sale.total).toLocaleString()}*`);
  lines.push(`• Tender Method: *${sale.paymentMethod || (sale.isCredit ? "Customer Credit" : "Cash")}*`);

  if (sale.receivedAmount && sale.receivedAmount > 0) {
    lines.push(`• Amount Paid: ${cur} ${Number(sale.receivedAmount).toLocaleString()}`);
  }
  if (sale.changeReturned && sale.changeReturned > 0) {
    lines.push(`• Change Returned: ${cur} ${Number(sale.changeReturned).toLocaleString()}`);
  }

  if (sale.loyaltyPointsEarned && sale.loyaltyPointsEarned > 0) {
    lines.push(`⭐ Points Earned: +${sale.loyaltyPointsEarned}`);
  }
  if (sale.loyaltyPointsBalance && sale.loyaltyPointsBalance > 0) {
    lines.push(`🏆 Loyalty Balance: ${sale.loyaltyPointsBalance} pts`);
  }

  // Footer & branding
  lines.push("━━━━━━━━━━━━━━━━━━━━━");
  if (settings?.receiptFooter) {
    lines.push(settings.receiptFooter);
  } else {
    lines.push("Thank you for your business! Please visit us again.");
  }
  lines.push("🔒 _Verified digital receipt powered by MT UniPOS_");

  return lines.join("\n");
}

/**
 * Formats an Executive Z-Report shift closing summary for the store owner.
 */
export function formatWhatsAppZReport(
  report: ZReportData,
  settings?: BusinessSettings
): string {
  const storeName = report.businessName || settings?.businessName || "MT UniPOS";
  const cur = report.currencySymbol || "PKR";

  const discStatus =
    report.discrepancy === 0
      ? "✅ BALANCED (0.00)"
      : report.discrepancy > 0
      ? `🟢 CASH SURPLUS (+${cur} ${report.discrepancy.toLocaleString()})`
      : `🔴 CASH SHORTAGE (-${cur} ${Math.abs(report.discrepancy).toLocaleString()})`;

  const lines: string[] = [];

  // Header
  lines.push("📊 *EXECUTIVE SHIFT CLOSING (Z-REPORT)*");
  lines.push("━━━━━━━━━━━━━━━━━━━━━");
  lines.push(`🏬 *${storeName}*`);
  lines.push(`📍 Branch: *${report.branch}*`);
  lines.push(`🖥️ Counter: *${report.counterName}*`);
  lines.push(`🧑‍💼 Cashier: *${report.cashierName}*`);
  lines.push(`🆔 Shift ID: *${report.id}*`);
  lines.push(`⏰ Shift Time: ${report.shiftStartTime} ➔ ${report.shiftEndTime}`);
  lines.push("━━━━━━━━━━━━━━━━━━━━━");

  // Financials
  lines.push("💰 *FINANCIAL AUDIT SUMMARY:*");
  lines.push(`• Gross Sales: *${cur} ${report.grossSales.toLocaleString()}*`);
  if (report.discounts > 0) {
    lines.push(`• Total Discounts: -${cur} ${report.discounts.toLocaleString()}`);
  }
  lines.push(`• Net Sales: *${cur} ${report.netSales.toLocaleString()}*`);
  if (report.tax > 0) {
    lines.push(`• Tax/GST Collected: +${cur} ${report.tax.toLocaleString()}`);
  }
  if (report.refunds > 0) {
    lines.push(`• Refunds/Returns: -${cur} ${report.refunds.toLocaleString()} (${report.returnsCount} items)`);
  }
  lines.push(`• *TOTAL REVENUE: ${cur} ${report.totalRevenue.toLocaleString()}*`);
  lines.push("━━━━━━━━━━━━━━━━━━━━━");

  // Payment Tenders
  lines.push("💳 *TENDER BREAKDOWN:*");
  lines.push(`• Cash: ${cur} ${report.cashSales.toLocaleString()}`);
  lines.push(`• Card: ${cur} ${report.cardSales.toLocaleString()}`);
  lines.push(`• Bank Transfer: ${cur} ${report.bankSales.toLocaleString()}`);
  lines.push(`• Digital Wallets: ${cur} ${report.walletSales.toLocaleString()}`);
  if (report.creditSales > 0) {
    lines.push(`• Customer Credit: ${cur} ${report.creditSales.toLocaleString()}`);
  }
  lines.push("━━━━━━━━━━━━━━━━━━━━━");

  // Till Reconciliation
  lines.push("📥 *CASH DRAWER RECONCILIATION:*");
  lines.push(`• Opening Float: ${cur} ${report.openingFloat.toLocaleString()}`);
  lines.push(`• Cash Sales Inflow: +${cur} ${report.cashReceived.toLocaleString()}`);
  if (report.cashExpenses > 0) {
    lines.push(`• Cash Drawer Expenses: -${cur} ${report.cashExpenses.toLocaleString()}`);
  }
  lines.push(`• Expected in Drawer: *${cur} ${report.expectedCash.toLocaleString()}*`);
  lines.push(`• Actual Counted Cash: *${cur} ${report.actualCash.toLocaleString()}*`);
  lines.push(`• Till Status: *${discStatus}*`);
  lines.push("━━━━━━━━━━━━━━━━━━━━━");

  // Operations Metrics
  lines.push("📈 *SHIFT PRODUCTIVITY:*");
  lines.push(`• Total Orders: *${report.totalTransactions}*`);
  lines.push(`• Items Sold: *${report.itemsSold}*`);
  lines.push(`• Avg Ticket Value: ${cur} ${Number(report.averageTransactionValue.toFixed(1)).toLocaleString()}`);
  if (report.firstReceiptNumber && report.lastReceiptNumber) {
    lines.push(`• Invoice Range: #${report.firstReceiptNumber} ➔ #${report.lastReceiptNumber}`);
  }

  // Category Breakdown if available
  if (report.categoryBreakdown && report.categoryBreakdown.length > 0) {
    lines.push("━━━━━━━━━━━━━━━━━━━━━");
    lines.push("🏷️ *TOP CATEGORIES:*");
    report.categoryBreakdown.slice(0, 5).forEach((cat) => {
      lines.push(`• ${cat.category}: ${cur} ${cat.totalAmount.toLocaleString()} (${cat.percentage.toFixed(0)}%)`);
    });
  }

  // Cashier Notes
  if (report.notes && report.notes.trim()) {
    lines.push("━━━━━━━━━━━━━━━━━━━━━");
    lines.push("📝 *CLOSING HANDOVER NOTE:*");
    lines.push(`"${report.notes.trim()}"`);
  }

  lines.push("━━━━━━━━━━━━━━━━━━━━━");
  lines.push(`🕒 Generated: ${report.generatedAt}`);
  lines.push("🔒 _MT UniPOS Automated Executive Shift Audit_");

  return lines.join("\n");
}

/**
 * Triggers opening WhatsApp Web or Native App with phone & pre-filled message text.
 */
export function openWhatsApp(phone: string, text: string): void {
  const clean = cleanPhoneNumber(phone);
  const encodedText = encodeURIComponent(text);

  let url: string;
  if (clean) {
    url = `https://wa.me/${clean}?text=${encodedText}`;
  } else {
    // If no phone is provided, wa.me allows opening chat selector
    url = `https://api.whatsapp.com/send?text=${encodedText}`;
  }

  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
