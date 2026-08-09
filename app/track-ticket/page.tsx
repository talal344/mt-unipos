"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TrackTicketRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const search = window.location.search || "";
      router.replace(`/tracking${search}`);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 font-sans text-center">
      <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center animate-spin mb-4 font-black">
        ⚡
      </div>
      <p className="text-sm font-bold text-gray-300">Redirecting to Tracking Portal...</p>
      <p className="text-xs text-sky-400 font-mono mt-1">https://pos.mtcore.xyz/tracking</p>
    </div>
  );
}
