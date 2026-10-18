import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";
  const pathname = url.pathname;

  // Extract clean host without port (e.g. "admin.mtcore.xyz" or "admin.localhost")
  const host = hostname.split(":")[0].toLowerCase();

  // 1. ADMIN SUBDOMAIN (e.g. admin.mtcore.xyz or admin.localhost)
  if (host.startsWith("admin.")) {
    // If accessing root on admin subdomain, redirect to admin dashboard
    if (pathname === "/") {
      url.pathname = "/admin/dashboard";
      return NextResponse.rewrite(url);
    }
    // If path does not start with /admin, prefix with /admin
    if (!pathname.startsWith("/admin")) {
      url.pathname = `/admin${pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // 2. POS SUBDOMAIN (e.g. pos.mtcore.xyz or pos.localhost)
  if (host.startsWith("pos.")) {
    // If accessing root on pos subdomain, route directly to POS page
    if (pathname === "/") {
      url.pathname = "/pos";
      return NextResponse.rewrite(url);
    }
    // Prevent admin routes on pos subdomain
    if (pathname.startsWith("/admin")) {
      const adminUrl = request.nextUrl.clone();
      adminUrl.host = host.replace("pos.", "admin.");
      return NextResponse.redirect(adminUrl);
    }
    return NextResponse.next();
  }

  // 3. MAIN ROOT DOMAIN (e.g. mtcore.xyz or localhost)
  // Optional convenience: if someone visits mtcore.xyz/admin/*, redirect to admin.mtcore.xyz
  if (host.includes("mtcore.xyz")) {
    if (pathname.startsWith("/admin")) {
      const adminUrl = request.nextUrl.clone();
      adminUrl.host = `admin.${host.replace(/^www\./, "")}`;
      return NextResponse.redirect(adminUrl);
    }
    if (pathname === "/pos") {
      const posUrl = request.nextUrl.clone();
      posUrl.host = `pos.${host.replace(/^www\./, "")}`;
      return NextResponse.redirect(posUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - Static asset files (.png, .jpg, .jpeg, .svg, .webp, .ico, .css, .js)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf)$).*)",
  ],
};
