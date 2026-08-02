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
    // Wait for the next tick to ensure Context has loaded from localStorage
    const timer = setTimeout(() => setHydrated(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    // Public routes that don't need protection
    if (
      pathname.startsWith("/login") || 
      pathname.startsWith("/admin/login") || 
      pathname === "/" || 
      pathname.startsWith("/qr-menu") ||
      pathname.startsWith("/track-ticket") ||
      pathname.startsWith("/demo") ||
      pathname.startsWith("/features") ||
      pathname.startsWith("/about") ||
      pathname.startsWith("/blog") ||
      pathname.startsWith("/contact")
    ) {
      return;
    }

    // If no user is logged in, send them to login
    if (!currentUser) {
      router.replace("/login");
      return;
    }

    // Role-based restrictions
    const role = currentUser.role;

    // Cashier can ONLY access /pos
    if (role === "Cashier" && pathname !== "/pos") {
      router.replace("/pos");
      return;
    }

  }, [hydrated, currentUser, pathname, router]);

  // Optionally show nothing or a loader until hydrated
  if (!hydrated) return null;

  return <>{children}</>;
}
