import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

export async function POST(req: Request) {
  try {
    const { fileType, fileName, fileBase64, subfolder } = await req.json();

    if (!fileType || !fileName || !fileBase64) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userDocsDir = path.join(os.homedir(), "Documents");
    let targetDir = "";

    if (fileType === "Receipt" || fileType.includes("Receipt") || subfolder?.includes("Receipt") || subfolder === "Dues_Clear") {
      const receiptFolder = subfolder || "Sales_Receipts";
      targetDir = path.join(userDocsDir, "MT POS", "Receipts", receiptFolder);
    } else {
      let folderName = fileType.toUpperCase();
      if (folderName === "XLSX" || folderName === "XLS") folderName = "Excel";
      if (folderName === "JPEG") folderName = "JPG";
      targetDir = path.join(userDocsDir, "MT POS", "Reports", folderName);
    }

    // Ensure directory structure exists on Windows hard drive
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
    console.error("Save Local Disk API error:", err);
    return NextResponse.json({ error: err.message || "Failed to write file to Documents" }, { status: 500 });
  }
}
