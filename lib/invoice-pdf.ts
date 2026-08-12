import { jsPDF } from "jspdf";

export interface InvoicePdfData {
  invoiceId?: string;
  tenantId?: string;
  businessName?: string;
  ownerName?: string;
  to?: string;
  password?: string;
  amount?: number | string;
  paidAmount?: number | string;
  remainingBalance?: number | string;
  currency?: string;
  plan?: string;
  billingCycle?: string;
  paymentMethod?: string;
}

export function generateInvoicePdfBase64(data: InvoicePdfData): string {
  const {
    invoiceId = "INV-2026-LIVE",
    tenantId = "MRM-001",
    businessName = "MT RCM Management",
    ownerName = "Mian Talal",
    to = "talal.ah895@gmail.com",
    password = "owner123",
    amount = 120000,
    paidAmount = 120000,
    remainingBalance = 0,
    currency = "PKR",
    plan = "Enterprise yearly",
    billingCycle = "Annual",
    paymentMethod = "Bank Transfer (Meezan / HBL)"
  } = data;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - (margin * 2);

  // Outer Border Box (Sky Blue)
  doc.setDrawColor(2, 132, 199); // #0284c7
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, margin, contentWidth, 265, 4, 4, "S");

  let y = margin + 10;

  // Header Left: MT UniPOS
  doc.setTextColor(2, 132, 199);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("MT UniPOS", margin + 6, y);

  // Header Right: Invoice No & Date
  doc.setTextColor(15, 23, 42); // #0f172a
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(invoiceId, pageWidth - margin - 6, y, { align: "right" });

  y += 5;
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("ENTERPRISE SAAS POS & ERP SYSTEM", margin + 6, y);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Issued Date: ${new Date().toISOString().split("T")[0]}`, pageWidth - margin - 6, y, { align: "right" });

  y += 4;
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.text("Super Admin Billing Statement & Tenant Credentials", margin + 6, y);

  // Status Badge (Paid vs Partial/Unpaid)
  const remNum = Number(remainingBalance ?? 0);
  const amtNum = Number(amount ?? 0);
  const isPaid = remNum === 0 && amtNum > 0;
  const statusText = isPaid ? "STATUS: PAID" : "STATUS: PENDING DUES";
  
  doc.setFillColor(isPaid ? 220 : 254, isPaid ? 252 : 243, isPaid ? 231 : 199); // #dcfce7 vs #fef3c7
  doc.setDrawColor(isPaid ? 187 : 251, isPaid ? 247 : 191, isPaid ? 208 : 36);
  doc.roundedRect(pageWidth - margin - 38, y - 2, 32, 6, 3, 3, "FD");
  doc.setTextColor(isPaid ? 22 : 180, isPaid ? 101 : 83, isPaid ? 52 : 9);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text(statusText, pageWidth - margin - 22, y + 2, { align: "center" });

  y += 7;
  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin + 6, y, pageWidth - margin - 6, y);

  y += 6;

  // 2 Side-by-Side Boxes: Provider vs Client
  const boxWidth = (contentWidth - 16) / 2;
  const boxHeight = 42;

  // Billed Provider Box (Left)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin + 6, y, boxWidth, boxHeight, 3, 3, "FD");

  doc.setTextColor(2, 132, 199);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("BILLED PROVIDER", margin + 10, y + 6);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text("MT UniPOS Software Suite", margin + 10, y + 12);

  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Engineered by Founder Mian Talal", margin + 10, y + 18);
  doc.text("Support Contact: 03396399895", margin + 10, y + 23);
  doc.text("Corporate Email: miantalal2@gmail.com", margin + 10, y + 28);
  doc.setTextColor(2, 132, 199);
  doc.setFont("helvetica", "bold");
  doc.text("Official Portal: pos.mtcore.xyz", margin + 10, y + 33);

  // Client Info Box (Right)
  const rightBoxX = margin + 6 + boxWidth + 4;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightBoxX, y, boxWidth, boxHeight, 3, 3, "FD");

  doc.setTextColor(2, 132, 199);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("CLIENT / TENANT INFORMATION", rightBoxX + 4, y + 6);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text(businessName || "Tenant Business", rightBoxX + 4, y + 12);

  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Workspace / Tenant ID: `, rightBoxX + 4, y + 18);
  doc.setTextColor(2, 132, 199);
  doc.setFont("helvetica", "bold");
  doc.text(`${tenantId || "MRM-001"}`, rightBoxX + 38, y + 18);

  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "normal");
  doc.text(`Owner Name: ${ownerName || "Owner"}`, rightBoxX + 4, y + 23);
  doc.text(`Registered Email: ${to || ""}`, rightBoxX + 4, y + 28);
  doc.setTextColor(22, 101, 52);
  doc.setFont("helvetica", "bold");
  doc.text("Status: Active", rightBoxX + 4, y + 33);

  y += boxHeight + 6;

  // Credentials Box (Dashed Light Blue)
  const credBoxHeight = 36;
  doc.setFillColor(239, 246, 255); // #eff6ff
  doc.setDrawColor(147, 197, 253); // #93c5fd
  doc.roundedRect(margin + 6, y, contentWidth - 12, credBoxHeight, 3, 3, "FD");

  doc.setTextColor(30, 64, 175); // #1e40af
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("TENANT ACCESS & LOGIN CREDENTIALS", margin + 10, y + 6);

  doc.setTextColor(59, 130, 246);
  doc.setFontSize(8);
  doc.text("Workspace Tenant ID:", margin + 10, y + 13);
  doc.setTextColor(30, 58, 138);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text(`${tenantId || "MRM-001"}`, margin + 48, y + 13);

  doc.setTextColor(59, 130, 246);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Corporate Email:", margin + 10, y + 19);
  doc.setTextColor(15, 23, 42);
  doc.text(`${to || ""}`, margin + 48, y + 19);

  doc.setTextColor(59, 130, 246);
  doc.text("Default Password:", margin + 10, y + 25);
  doc.setTextColor(220, 38, 38);
  doc.setFontSize(9.5);
  doc.text(`${password || "owner123"}`, margin + 48, y + 25);

  doc.setTextColor(59, 130, 246);
  doc.setFontSize(8);
  doc.text("Web Login Portal:", margin + 10, y + 31);
  doc.setTextColor(37, 99, 235);
  doc.text("https://pos.mtcore.xyz/login", margin + 48, y + 31);

  y += credBoxHeight + 6;

  // Package Table Header
  const tableWidth = contentWidth - 12;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin + 6, y, tableWidth, 8, "FD");

  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("BILLED PACKAGE / DESCRIPTION", margin + 10, y + 5.5);
  doc.text("BILLING CYCLE", margin + 6 + (tableWidth / 2), y + 5.5, { align: "center" });
  doc.text(`TOTAL BILL (${currency})`, margin + 6 + tableWidth - 4, y + 5.5, { align: "right" });

  y += 8;

  // Table Row Content
  doc.setFillColor(255, 255, 255);
  doc.rect(margin + 6, y, tableWidth, 14, "FD");

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`${plan || "Enterprise yearly"}`, margin + 10, y + 6);
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Enterprise Sharding Access & Cloud Backup Sync", margin + 10, y + 10.5);

  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(`${billingCycle || "Annual"}`, margin + 6 + (tableWidth / 2), y + 8, { align: "center" });

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text(`${currency} ${Number(amount || 0).toLocaleString()}`, margin + 6 + tableWidth - 4, y + 8, { align: "right" });

  y += 18;

  // Financial Summary Box (Right Aligned)
  const summaryBoxWidth = 70;
  const summaryBoxX = margin + 6 + tableWidth - summaryBoxWidth;
  const summaryBoxHeight = 28;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(summaryBoxX, y, summaryBoxWidth, summaryBoxHeight, 3, 3, "FD");

  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Total Bill Amount:", summaryBoxX + 4, y + 6);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(`${currency} ${Number(amount || 0).toLocaleString()}`, summaryBoxX + summaryBoxWidth - 4, y + 6, { align: "right" });

  doc.setTextColor(22, 101, 52);
  doc.setFont("helvetica", "bold");
  doc.text("Amount Received / Paid:", summaryBoxX + 4, y + 13);
  doc.text(`${currency} ${Number(paidAmount ?? amount ?? 0).toLocaleString()}`, summaryBoxX + summaryBoxWidth - 4, y + 13, { align: "right" });

  doc.setDrawColor(203, 213, 225);
  doc.line(summaryBoxX + 4, y + 17, summaryBoxX + summaryBoxWidth - 4, y + 17);

  doc.setTextColor(2, 132, 199);
  doc.setFontSize(9);
  doc.text("Remaining Balance Due:", summaryBoxX + 4, y + 23);
  doc.text(`${currency} ${Number(remainingBalance ?? 0).toLocaleString()}`, summaryBoxX + summaryBoxWidth - 4, y + 23, { align: "right" });

  y += summaryBoxHeight + 12;

  // Footer Divider & Notes
  doc.setDrawColor(226, 232, 240);
  doc.line(margin + 6, y, pageWidth - margin - 6, y);

  y += 5;
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`MT UniPOS SaaS Management • Payment Method: ${paymentMethod || "Bank Transfer"}`, margin + 6, y);
  doc.text("Verification: AUTHENTICATED SAAS RECEIPT", pageWidth - margin - 6, y, { align: "right" });

  y += 4;
  doc.text("Notes: Tenant account active. Official tax receipt & credentials statement.", margin + 6, y);
  doc.text("Official Web Portal: pos.mtcore.xyz", pageWidth - margin - 6, y, { align: "right" });

  const arrayBuffer = doc.output("arraybuffer");
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return base64;
}
