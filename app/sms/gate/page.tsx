"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarCheck2, ArrowRight } from "lucide-react";

export default function SMSGatePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/sms/attendance");
  }, [router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4 font-sans">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-lg">
        <CalendarCheck2 size={32} />
      </div>
      <h2 className="text-lg font-black">Gate module has been integrated into Daily Attendance</h2>
      <p className="text-xs text-gray-500 max-w-md">
        Student attendance is marked directly by Class Teachers, and Faculty attendance is managed by the Headmaster / Principal.
      </p>
      <Link
        href="/sms/attendance"
        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-md"
      >
        <span>Go to Daily Attendance Portal</span>
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
