"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const OFFLINE_ROUTES = [
  "/dashboard",
  "/pos",
  "/sales",
  "/customers",
  "/products",
  "/suppliers",
  "/purchases",
  "/inventory",
  "/expenses",
  "/accounting",
  "/payroll",
  "/staff",
  "/crm",
  "/reports",
  "/ai",
  "/support",
  "/settings",
  "/restaurant",
  "/kds",
  "/menu-builder",
  "/floor-editor",
  "/pharmacy",
  "/hrms",
  "/sms",
  "/admin/dashboard",
  "/admin/clients",
  "/admin/reports",
  "/admin/invoices",
  "/admin/emails",
  "/admin/support",
  "/admin/settings"
];

export default function OfflinePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefetchRoutes = () => {
      // Stagger route prefetching so high-priority page navigation is never blocked
      const routesToPrefetch = [...OFFLINE_ROUTES];
      let i = 0;

      const prefetchNextBatch = () => {
        const batch = routesToPrefetch.slice(i, i + 4);
        batch.forEach((route) => {
          try {
            router.prefetch(route);
          } catch (e) {}
        });
        i += 4;
        if (i < routesToPrefetch.length) {
          if ("requestIdleCallback" in window) {
            (window as any).requestIdleCallback(prefetchNextBatch, { timeout: 1000 });
          } else {
            setTimeout(prefetchNextBatch, 250);
          }
        }
      };

      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(prefetchNextBatch, { timeout: 1500 });
      } else {
        setTimeout(prefetchNextBatch, 500);
      }
    };

    prefetchRoutes();
    window.addEventListener("online", prefetchRoutes);
    return () => {
      window.removeEventListener("online", prefetchRoutes);
    };
  }, [router]);

  return null;
}
