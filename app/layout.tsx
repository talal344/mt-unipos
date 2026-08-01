import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalProvider } from "@/context/global-context";
import DevToolbar from "@/components/dev-toolbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "MT UniPOS - Enterprise SaaS POS ERP",
  description: "The ultimate cloud-based POS and SaaS ERP system for Supermarkets, Pharmacies, Restaurants, and Multi-branch Retailers. Created by Founder Mian Talal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-black text-gray-100 min-h-full flex flex-col font-sans">
        <GlobalProvider>
          {children}
          <DevToolbar />
        </GlobalProvider>
      </body>
    </html>
  );
}
