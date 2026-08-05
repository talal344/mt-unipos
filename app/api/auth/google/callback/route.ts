import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return new NextResponse(
      `<html><body><h2>Google Auth Error</h2><p>${error || 'No authorization code returned'}</p></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/google/callback`;

  return new NextResponse(
    `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Google Drive Auto-Connect</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0b0f17; color: #fff; text-align: center; padding: 50px 20px; }
    .card { background: #161e2e; border: 1px solid #374151; border-radius: 16px; padding: 30px; max-width: 450px; margin: 0 auto; }
    .btn { background: #0284c7; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <h2 style="color:#38bdf8;">🎉 Authorization Code Captured!</h2>
    <p style="font-size:14px;color:#9ca3af;">Authorization Code: <br/><code style="color:#4ade80;font-size:12px;word-break:break-all;">${code}</code></p>
    <p style="font-size:12px;color:#d1d5db;margin-top:15px;">Aap ka Google Drive login code successfully mil gaya hai. Ab aap Refresh Token easily exchange kar saktay hain!</p>
    <script>
      if (window.opener) {
        window.opener.postMessage({ type: 'GOOGLE_AUTH_CODE', code: '${code}' }, '*');
      }
    </script>
    <a href="/admin/clients" class="btn">Return to SaaS Admin Console</a>
  </div>
</body>
</html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
