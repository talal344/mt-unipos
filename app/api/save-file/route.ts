import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

// ── MT UniPOS Folder Structure ────────────────────────────────────────────────
// Windows: C:\Users\<User>\Documents\MT UniPOS\
// macOS:   /Users/<User>/Desktop/MT UniPOS/
//
// MT UniPOS/
//   ├── Sale Receipts/
//   ├── Dues Clear Receipts/
//   ├── Sale or Purchase Return Receipts/
//   └── Reports/
//       ├── PDF/
//       ├── Excel/
//       └── JPG/
// ─────────────────────────────────────────────────────────────────────────────

function getMTUniPOSBaseDir(): string {
  const platform = os.platform();
  if (platform === "darwin") {
    // macOS → Desktop
    return path.join(os.homedir(), "Desktop", "MT UniPOS");
  } else {
    // Windows / Linux → Documents
    return path.join(os.homedir(), "Documents", "MT UniPOS");
  }
}

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Initialize all MT UniPOS folders
export async function GET() {
  try {
    const base = getMTUniPOSBaseDir();
    ensureDir(base);
    ensureDir(path.join(base, "Sale Receipts"));
    ensureDir(path.join(base, "Dues Clear Receipts"));
    ensureDir(path.join(base, "Sale or Purchase Return Receipts"));
    ensureDir(path.join(base, "Reports"));
    ensureDir(path.join(base, "Reports", "PDF"));
    ensureDir(path.join(base, "Reports", "Excel"));
    ensureDir(path.join(base, "Reports", "JPG"));

    return NextResponse.json({ success: true, baseDir: base });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { category, fileName, fileBase64 } = await req.json();

    // category: "sale-receipt" | "dues-receipt" | "return-receipt" | "report-pdf" | "report-excel" | "report-jpg"
    if (!category || !fileName || !fileBase64) {
      return NextResponse.json({ error: "Missing required fields: category, fileName, fileBase64" }, { status: 400 });
    }

    const base = getMTUniPOSBaseDir();

    let targetDir = "";
    switch (category) {
      case "sale-receipt":
        targetDir = path.join(base, "Sale Receipts");
        break;
      case "dues-receipt":
        targetDir = path.join(base, "Dues Clear Receipts");
        break;
      case "return-receipt":
        targetDir = path.join(base, "Sale or Purchase Return Receipts");
        break;
      case "report-pdf":
        targetDir = path.join(base, "Reports", "PDF");
        break;
      case "report-excel":
        targetDir = path.join(base, "Reports", "Excel");
        break;
      case "report-jpg":
        targetDir = path.join(base, "Reports", "JPG");
        break;
      default:
        return NextResponse.json({ error: `Unknown category: ${category}` }, { status: 400 });
    }

    // Ensure directory exists
    ensureDir(targetDir);

    const targetFilePath = path.join(targetDir, fileName);

    // Strip base64 data header if present (e.g. "data:image/jpeg;base64,...")
    const base64Clean = fileBase64.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(base64Clean, "base64");

    fs.writeFileSync(targetFilePath, buffer);

    return NextResponse.json({
      success: true,
      filePath: targetFilePath,
      message: `Saved to: ${targetFilePath}`
    });
  } catch (err: any) {
    console.error("MT UniPOS Save File API error:", err);
    return NextResponse.json({ error: err.message || "Failed to write file" }, { status: 500 });
  }
}
