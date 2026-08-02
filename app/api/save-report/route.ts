import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

export async function POST(req: Request) {
  try {
    const { fileType, fileName, fileBase64 } = await req.json();

    if (!fileType || !fileName || !fileBase64) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Determine target subfolder: PDF, Excel, JPG
    let folderName = fileType.toUpperCase();
    if (folderName === "XLSX" || folderName === "XLS") folderName = "Excel";
    if (folderName === "JPEG") folderName = "JPG";

    // Target path: C:\Users\<User>\Documents\Reports\<PDF | Excel | JPG>
    const userDocsDir = path.join(os.homedir(), "Documents");
    const reportsDir = path.join(userDocsDir, "Reports", folderName);

    // Ensure directory structure exists on Windows hard drive
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const targetFilePath = path.join(reportsDir, fileName);

    // Strip base64 metadata header if present
    const base64Clean = fileBase64.replace(/^data:.*?;base64,/, "");
    const buffer = Buffer.from(base64Clean, "base64");

    // Write file directly to local Documents/Reports subfolder
    fs.writeFileSync(targetFilePath, buffer);

    return NextResponse.json({
      success: true,
      filePath: targetFilePath,
      reportsDir,
      fileName,
      message: `File saved directly to ${targetFilePath}`
    });
  } catch (err: any) {
    console.error("Save Report Local Disk API error:", err);
    return NextResponse.json({ error: err.message || "Failed to write file to Documents" }, { status: 500 });
  }
}
