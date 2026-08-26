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
  "/sms"
];

export default function OfflinePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefetchRoutes = () => {
      // 1. Next.js Router Prefetch: Downloads JS chunks and RSC data into memory cache
      OFFLINE_ROUTES.forEach((route) => {
        try {
          router.prefetch(route);
        } catch (e) {}
      });

      // 2. Fetch and Cache HTML, RSC streams, and static assets in CacheStorage
      if (typeof navigator !== "undefined" && navigator.onLine && "caches" in window) {
        const logoFiles = [
          "/rectangle light.png",
          "/rectangle%20light.png",
          "/rectangle dark.png",
          "/rectangle%20dark.png",
          "/logo light.png",
          "/logo%20light.png",
          "/Logo Dark.png",
          "/Logo%20Dark.png",
          "/logo.png",
          "/favicon.png"
        ];

        caches.open("mt-unipos-v5").then((cache) => {
          logoFiles.forEach((logo) => {
            fetch(logo, { cache: "no-cache" })
              .then((res) => { if (res && res.status === 200) cache.put(logo, res); })
              .catch(() => {});
          });

          OFFLINE_ROUTES.forEach(async (route) => {
            try {
              // Cache HTML document
              const htmlRes = await fetch(route, { cache: "no-cache" });
              if (htmlRes && htmlRes.status === 200) {
                const cloned = htmlRes.clone();
                await cache.put(route, htmlRes);
                const htmlText = await cloned.text();
                
                // Extract script chunks and css
                const scripts = htmlText.matchAll(/src="(\/_next\/static\/[^"]+)"/g);
                for (const match of scripts) {
                  const assetUrl = match[1];
                  fetch(assetUrl, { cache: "no-cache" })
                    .then((res) => {
                      if (res && res.status === 200) cache.put(assetUrl, res);
                    })
                    .catch(() => {});
                }
                const cssFiles = htmlText.matchAll(/href="(\/_next\/static\/[^"]+\.css)"/g);
                for (const match of cssFiles) {
                  const assetUrl = match[1];
                  fetch(assetUrl, { cache: "no-cache" })
                    .then((res) => {
                      if (res && res.status === 200) cache.put(assetUrl, res);
                    })
                    .catch(() => {});
                }
              }

              // Cache RSC stream for Next.js App Router
              const rscRes = await fetch(route, {
                headers: { RSC: "1" },
                cache: "no-cache"
              });
              if (rscRes && rscRes.status === 200) {
                await cache.put(`${route}?_rsc=precache`, rscRes.clone());
                await cache.put(route + "__rsc__", rscRes);
              }
            } catch (err) {}
          });
        });
      }
    };

    // Run shortly after initial load so we do not block critical rendering
    const timer = setTimeout(prefetchRoutes, 1500);

    window.addEventListener("online", prefetchRoutes);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("online", prefetchRoutes);
    };
  }, [router]);

  return null;
}
