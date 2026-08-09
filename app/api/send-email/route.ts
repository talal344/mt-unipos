import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { to, subject, html, invoiceId, businessName, amount, currency, plan } = await req.json();

    const apiKey = process.env.NEXT_PUBLIC_RESEND_API_KEY || process.env.RESEND_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ success: false, error: "Resend API Key is missing." }, { status: 400 });
    }

    const emailSubject = subject || `[MT UniPOS] Invoice Statement: ${invoiceId || businessName}`;

    const defaultHtml = html || `
      <div style="font-family: Arial, sans-serif; background-color: #0b0f17; color: #ffffff; padding: 24px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1f2937;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #a855f7; margin: 0;">MT UniPOS ERP Shard</h2>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 4px;">Official SaaS Billing &amp; Invoice Statement</p>
        </div>
        <div style="background-color: #111827; padding: 16px; border-radius: 8px; border: 1px solid #374151; margin-bottom: 20px;">
          <p style="font-size: 14px; margin: 0 0 8px 0;"><strong>Dear ${businessName || "Valued Client"},</strong></p>
          <p style="font-size: 13px; color: #d1d5db; margin: 0;">Your SaaS subscription invoice <strong>${invoiceId || ""}</strong> has been issued and processed.</p>
        </div>
        <table style="width: 100%; font-size: 13px; color: #e5e7eb; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #374151; color: #9ca3af;">Business Name</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #374151; text-align: right; font-weight: bold;">${businessName || "Tenant"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #374151; color: #9ca3af;">Subscription Plan</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #374151; text-align: right; font-weight: bold; color: #38bdf8;">${plan || "Professional"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #374151; color: #9ca3af;">Invoice Total</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #374151; text-align: right; font-weight: bold; color: #34d399; font-size: 16px;">${currency || "PKR"} ${Number(amount || 0).toLocaleString()}</td>
          </tr>
        </table>
        <div style="text-align: center; padding-top: 10px; border-top: 1px solid #374151; font-size: 11px; color: #6b7280;">
          <p style="margin: 0;">MT UniPOS Platform Management — Powered by Mian Talal</p>
        </div>
      </div>
    `;

    // Send email using Resend HTTP API
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "MT UniPOS <onboarding@resend.dev>",
        to: [to],
        subject: emailSubject,
        html: defaultHtml,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.warn("Resend API warning / error response:", data);
      return NextResponse.json({ success: false, error: data.message || "Email dispatch failed", details: data }, { status: res.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Email route error:", err);
    return NextResponse.json({ success: false, error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
