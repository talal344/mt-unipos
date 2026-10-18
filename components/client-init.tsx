"use client";

import { useEffect } from "react";

export default function ClientInit() {
  useEffect(() => {
    // 1. Unregister obsolete service workers & purge legacy caches safely on the client
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        let needReload = false;
        for (const r of regs) {
          r.unregister();
          needReload = true;
        }
        if ("caches" in window) {
          caches.keys().then((keys) => {
            for (const k of keys) {
              caches.delete(k);
              needReload = true;
            }
          });
        }
        if (needReload && !sessionStorage.getItem("sw_purged_v2")) {
          sessionStorage.setItem("sw_purged_v2", "1");
          window.location.reload();
        }
      }).catch(() => {});
    }

    // 2. Dynamic favicon switcher for dark/light mode preference
    const applyFavicon = (e?: MediaQueryListEvent) => {
      try {
        const isDark = e ? e.matches : window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        const target = isDark ? "/logo light.png" : "/Logo Dark.png";
        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          link.type = "image/png";
          document.head.appendChild(link);
        }
        link.href = target;
      } catch {}
    };

    applyFavicon();
    if (window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener?.("change", applyFavicon);
      return () => {
        mq.removeEventListener?.("change", applyFavicon);
      };
    }
  }, []);

  return null;
}
