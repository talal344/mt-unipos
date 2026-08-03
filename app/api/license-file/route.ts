import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

function getLicenseDir(): string {
  const platform = os.platform();
  const base =
    platform === "darwin"
      ? path.join(os.homedir(), "Desktop", "MT UniPOS", "License")
      : path.join(os.homedir(), "Documents", "MT UniPOS", "License");

  if (!fs.existsSync(base)) {
    fs.mkdirSync(base, { recursive: true });
  }
  return base;
}

function getLicenseFilePath(): string {
  return path.join(getLicenseDir(), "unipos_license.json");
}

// GET: Read saved computer-level license data
export async function GET() {
  try {
    const filePath = getLicenseFilePath();
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, message: "No license file found on hard drive" });
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);
    return NextResponse.json({ success: true, data, filePath });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}

// POST: Save license data to computer's hard drive
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || !body.tenants) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    const filePath = getLicenseFilePath();
    const payload = {
      updatedAt: new Date().toISOString(),
      computerId: os.hostname(),
      tenants: body.tenants,
    };

    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf-8");
    return NextResponse.json({ success: true, filePath, message: "License file saved to hard drive" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
