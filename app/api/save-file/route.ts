import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

export async function POST(req: Request) {
  try {
    const { category, fileType, fileName, fileBase64, subfolder } = await req.json();

    if (!fileName || !fileBase64) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userDocsDir = path.join(os.homedir(), "Documents");

    let subfolderName = "Sale Receipts";
    if (category === "dues-receipt" || subfolder === "Dues_Clear") {
      subfolderName = "Dues Clear Receipts";
    } else if (category === "return-receipt") {
      subfolderName = "Sale or Purchase Return Receipts";
    } else if (category === "report-pdf") {
      subfolderName = "Reports/PDF";
    } else if (category === "report-excel") {
      subfolderName = "Reports/Excel";
    } else if (category === "report-jpg") {
      subfolderName = "Reports/JPG";
    } else if (subfolder) {
      subfolderName = subfolder;
    } else if (fileType) {
      let folderName = fileType.toUpperCase();
      if (folderName === "XLSX" || folderName === "XLS") folderName = "Excel";
      if (folderName === "JPEG") folderName = "JPG";
      subfolderName = `Reports/${folderName}`;
    }

    const targetDir = path.join(userDocsDir, "MT POS", subfolderName);

    // Ensure directory structure exists on local hard drive
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetFilePath = path.join(targetDir, fileName);

    // Strip base64 metadata header if present
    const base64Clean = fileBase64.replace(/^data:.*?;base64,/, "");
    const buffer = Buffer.from(base64Clean, "base64");

    // Write file directly to local Documents subfolder
    fs.writeFileSync(targetFilePath, buffer);

    return NextResponse.json({
      success: true,
      filePath: targetFilePath,
      targetDir,
      fileName,
      message: `File saved directly to ${targetFilePath}`
    });
  } catch (err: any) {
    console.error("Save Local File API error:", err);
    return NextResponse.json({ error: err.message || "Failed to write file to disk" }, { status: 500 });
  }
}
