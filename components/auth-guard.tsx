"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useGlobalContext } from "@/context/global-context";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { currentUser } = useGlobalContext()!;
  const pathname = usePathname();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Wait for context hydration from localStorage
    const timer = setTimeout(() => setHydrated(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    // Public un-protected routes across all subdomains
    const isPublicRoute =
      pathname === "/" ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/admin/login") ||
      pathname.startsWith("/qr-menu") ||
      pathname.startsWith("/tracking") ||
      pathname.startsWith("/track-ticket") ||
      pathname.startsWith("/demo") ||
      pathname.startsWith("/features") ||
      pathname.startsWith("/about") ||
      pathname.startsWith("/blog") ||
      pathname.startsWith("/contact");

    if (isPublicRoute) {
      return;
    }

    // If no user is logged in, redirect to login page
    if (!currentUser) {
      if (pathname.startsWith("/admin")) {
        router.replace("/admin/login");
      } else {
        router.replace("/login");
      }
      return;
    }

    // Line of Business Isolation: HRMS vs POS vs SMS
    const currentSoftware = (currentUser as any).assignedSoftware;
    const isHRMSUser = currentSoftware === "HRMS" || (currentUser.businessName && currentUser.businessName.includes("HRMS"));
    const isSMSUser = currentSoftware === "SMS" || (currentUser.businessName && currentUser.businessName.includes("SMS"));
    const assignedSoftware = isSMSUser ? "SMS" : isHRMSUser ? "HRMS" : "POS";

    if (assignedSoftware === "HRMS") {
      // HRMS users can ONLY access /hrms routes (and /support /settings /profile)
      if (!pathname.startsWith("/hrms") && !pathname.startsWith("/support") && !pathname.startsWith("/settings")) {
        router.replace("/hrms");
        return;
      }
    } else if (assignedSoftware === "SMS") {
      // SMS users can ONLY access /sms routes
      if (!pathname.startsWith("/sms") && !pathname.startsWith("/support") && !pathname.startsWith("/settings")) {
        router.replace("/sms");
        return;
      }
    } else {
      // POS users cannot access HRMS or SMS routes
      if (pathname.startsWith("/hrms") || pathname.startsWith("/sms")) {
        router.replace("/dashboard");
        return;
      }
    }

    // Role-based restrictions
    const role = currentUser.role;

    // Cashier allowed routes (/pos, /sales, /customers, /restaurant, /kds)
    const cashierAllowedRoutes = ["/pos", "/sales", "/customers", "/restaurant", "/kds"];
    if (role === "Cashier" && !cashierAllowedRoutes.some((route) => pathname.startsWith(route))) {
      router.replace("/pos");
      return;
    }
  }, [hydrated, currentUser, pathname, router]);

  // Optionally show loader until hydrated
  if (!hydrated) return null;

  return <>{children}</>;
}
