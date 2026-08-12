import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { 
      to, 
      subject, 
      html, 
      invoiceId, 
      tenantId,
      businessName, 
      ownerName,
      password,
      amount, 
      paidAmount,
      remainingBalance,
      currency, 
      plan,
      billingCycle,
      paymentMethod
    } = await req.json();

    const apiKey =
      process.env.Resend ||
      process.env.RESEND ||
      process.env.RESEND_API_KEY ||
      process.env.NEXT_PUBLIC_RESEND_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ success: false, error: "Resend API Key is missing." }, { status: 400 });
    }

    const emailSubject = subject || `[MT UniPOS] Official SaaS Billing & Account Setup: ${businessName || tenantId}`;

    const defaultHtml = html || `
      <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f8fafc; color: #0f172a; padding: 30px 15px; width: 100%; box-sizing: border-box;">
        <div style="max-width: 680px; margin: 0 auto; background-color: #ffffff; border: 2px solid #0284c7; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(2,132,199,0.1);">
          
          <!-- Top Header -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="vertical-align: top;">
                <h1 style="color: #0284c7; font-size: 24px; font-weight: 900; margin: 0;">MT UniPOS</h1>
                <div style="color: #475569; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-top: 2px;">ENTERPRISE SAAS POS &amp; ERP SYSTEM</div>
                <div style="color: #94a3b8; font-size: 10px; font-weight: 600; margin-top: 2px;">Super Admin Billing Statement &amp; Tenant Credentials</div>
              </td>
              <td style="vertical-align: top; text-align: right;">
                <div style="font-family: monospace; font-size: 16px; font-weight: 900; color: #0f172a;">${invoiceId || "INV-2026-LIVE"}</div>
                <div style="color: #64748b; font-size: 10px; margin-top: 2px;">Issued Date: ${new Date().toISOString().split("T")[0]}</div>
                <div style="margin-top: 8px;">
                  <span style="background-color: #dcfce7; color: #166534; border: 1px solid #bbf7d0; font-size: 10px; font-weight: 900; padding: 3px 10px; border-radius: 20px; text-transform: uppercase;">STATUS: PAID</span>
                </div>
              </td>
            </tr>
          </table>

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 24px;" />

          <!-- Parties Grid -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <!-- Billed Provider (Left) -->
              <td style="width: 48%; vertical-align: top; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
                <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0284c7; margin-bottom: 6px;">🏢 BILLED PROVIDER</div>
                <div style="font-size: 14px; font-weight: 900; color: #0f172a; margin-bottom: 4px;">MT UniPOS Software Suite</div>
                <div style="font-size: 11px; color: #475569; line-height: 1.6;">
                  Engineered by Founder <b>Mian Talal</b><br/>
                  Support Contact: <b>03396399895</b><br/>
                  Corporate Email: <b>miantalal2@gmail.com</b><br/>
                  Official Portal: <a href="https://pos.mtcore.xyz" style="color: #0284c7; text-decoration: none; font-weight: bold;">pos.mtcore.xyz</a>
                </div>
              </td>
              <td style="width: 4%;"></td>
              <!-- Client Info (Right) -->
              <td style="width: 48%; vertical-align: top; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
                <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0284c7; margin-bottom: 6px;">👤 CLIENT / TENANT INFORMATION</div>
                <div style="font-size: 14px; font-weight: 900; color: #0f172a; margin-bottom: 4px;">${businessName || "Tenant Business"}</div>
                <div style="font-size: 11px; color: #475569; line-height: 1.6;">
                  Workspace / Tenant ID: <b style="color: #0284c7;">${tenantId || "CT-001"}</b><br/>
                  Owner Name: <b>${ownerName || businessName || "Owner"}</b><br/>
                  Registered Email: <b>${to}</b><br/>
                  Status: <b style="color: #166534;">Active</b>
                </div>
              </td>
            </tr>
          </table>

          <!-- Credentials Box -->
          <div style="background-color: #eff6ff; border: 2px dashed #93c5fd; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
            <div style="font-size: 12px; font-weight: 900; text-transform: uppercase; color: #1e40af; margin-bottom: 8px;">🔑 TENANT ACCESS &amp; LOGIN CREDENTIALS</div>
            <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; color: #3b82f6; font-weight: bold; width: 140px;">Workspace Tenant ID:</td>
                <td style="padding: 4px 0; font-family: monospace; font-weight: 900; font-size: 14px; color: #1e3a8a;">${tenantId || "CT-001"}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #3b82f6; font-weight: bold;">Corporate Email:</td>
                <td style="padding: 4px 0; font-weight: bold; color: #0f172a;">${to}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #3b82f6; font-weight: bold;">Default Password:</td>
                <td style="padding: 4px 0; font-family: monospace; font-weight: 900; font-size: 14px; color: #dc2626;">${password || "owner123"}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #3b82f6; font-weight: bold;">Web Login Portal:</td>
                <td style="padding: 4px 0;"><a href="https://pos.mtcore.xyz/login" style="color: #2563eb; font-weight: 900; text-decoration: underline;">https://pos.mtcore.xyz/login</a></td>
              </tr>
            </table>
          </div>

          <!-- Package Table -->
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
            <tr style="background-color: #f1f5f9; text-transform: uppercase; font-size: 10px; font-weight: 800; color: #475569;">
              <th style="padding: 12px; text-align: left;">BILLED PACKAGE / DESCRIPTION</th>
              <th style="padding: 12px; text-align: center;">BILLING CYCLE</th>
              <th style="padding: 12px; text-align: right;">TOTAL BILL (${currency || "PKR"})</th>
            </tr>
            <tr>
              <td style="padding: 14px 12px; border-top: 1px solid #e2e8f0;">
                <div style="font-size: 13px; font-weight: 900; color: #0f172a;">${plan || "Enterprise Plan"}</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Enterprise Sharding Access &amp; Cloud Backup Sync</div>
              </td>
              <td style="padding: 14px 12px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; font-weight: 700; color: #334155;">
                ${billingCycle || "Annual"}
              </td>
              <td style="padding: 14px 12px; border-top: 1px solid #e2e8f0; text-align: right; font-size: 14px; font-weight: 900; color: #0f172a;">
                ${currency || "PKR"} ${Number(amount || 0).toLocaleString()}
              </td>
            </tr>
          </table>

          <!-- Totals & Payment Summary -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="width: 40%;"></td>
              <td style="width: 60%; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
                <table style="width: 100%; font-size: 12px;">
                  <tr>
                    <td style="padding: 4px 0; color: #475569;">Total Bill Amount:</td>
                    <td style="padding: 4px 0; text-align: right; font-weight: 900; color: #0f172a;">${currency || "PKR"} ${Number(amount || 0).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #166534; font-weight: bold;">Amount Received / Paid:</td>
                    <td style="padding: 4px 0; text-align: right; font-weight: 900; color: #166534;">${currency || "PKR"} ${Number(paidAmount ?? amount ?? 0).toLocaleString()}</td>
                  </tr>
                  <tr style="border-top: 1px solid #cbd5e1;">
                    <td style="padding: 8px 0 4px 0; font-size: 14px; font-weight: 900; color: #0284c7;">Remaining Balance Due:</td>
                    <td style="padding: 8px 0 4px 0; text-align: right; font-size: 16px; font-weight: 900; color: #0284c7;">${currency || "PKR"} ${Number(remainingBalance ?? 0).toLocaleString()}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Footer Stamp -->
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 16px;" />
          <table style="width: 100%; font-size: 10px; color: #64748b;">
            <tr>
              <td>
                <b>MT UniPOS SaaS Management</b> • Payment Method: <b>${paymentMethod || "Bank Transfer"}</b><br/>
                Notes: <i>Tenant account active. Invoice cleared.</i>
              </td>
              <td style="text-align: right;">
                Verification: <b style="color: #0284c7;">AUTHENTICATED SAAS RECEIPT</b><br/>
                Official Web Portal: <b>pos.mtcore.xyz</b>
              </td>
            </tr>
          </table>

        </div>
      </div>
    `;

    const fromEmail = process.env.NEXT_PUBLIC_RESEND_FROM_EMAIL || "MT UniPOS <billing@updates.mtcore.xyz>";

    // Send email using Resend HTTP API
    let res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: Array.isArray(to) ? to : [to],
        subject: emailSubject,
        html: defaultHtml,
      }),
    });

    let data = await res.json();

    // Automatic fallback to test domain if verified domain header is custom
    if (!res.ok && (data.message || "").includes("domain")) {
      const fallbackRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "MT UniPOS <onboarding@resend.dev>",
          to: Array.isArray(to) ? to : [to],
          subject: emailSubject,
          html: defaultHtml,
        }),
      });
      const fallbackData = await fallbackRes.json();
      if (fallbackRes.ok) {
        res = fallbackRes;
        data = fallbackData;
      }
    }

    if (!res.ok) {
      console.warn("Resend API error response:", data);
      let errorMsg = data.message || "Failed to deliver email via Resend API";
      if (data.statusCode === 403 || errorMsg.includes("testing emails")) {
        errorMsg = `[Resend Free Domain Restriction]: In free test mode (onboarding@resend.dev), emails can ONLY be sent to your registered Resend account email address. Add your domain in Resend Dashboard to send to all clients.`;
      }
      return NextResponse.json({ success: false, error: errorMsg, details: data }, { status: res.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Email route error:", err);
    return NextResponse.json({ success: false, error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
