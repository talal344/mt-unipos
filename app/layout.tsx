import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalProvider } from "@/context/global-context";
import AuthGuard from "@/components/auth-guard";
import AutoUpdaterBanner from "@/components/auto-updater-banner";
import OfflinePrefetcher from "@/components/offline-prefetcher";
import ClientInit from "@/components/client-init";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "MT Core - The core technology behind your business.",
  description: "MT Core — The core technology behind your business. The ultimate multi-tenant enterprise SaaS platform for POS ERP, HRMS, and modern business management. Founded by Mian Talal.",
  icons: {
    icon: [
      { url: "/logo light.png", media: "(prefers-color-scheme: dark)", type: "image/png" },
      { url: "/Logo Dark.png", media: "(prefers-color-scheme: light)", type: "image/png" },
    ],
    shortcut: "/logo light.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo light.png" media="(prefers-color-scheme: dark)" type="image/png" />
        <link rel="icon" href="/Logo Dark.png" media="(prefers-color-scheme: light)" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0ea5e9" />
      </head>
      <body suppressHydrationWarning className="bg-black text-gray-100 min-h-full flex flex-col font-sans">
        <GlobalProvider>
          <ClientInit />
          <AutoUpdaterBanner />
          <OfflinePrefetcher />
          <AuthGuard>
            {children}
          </AuthGuard>
        </GlobalProvider>
      </body>
    </html>
  );
}
