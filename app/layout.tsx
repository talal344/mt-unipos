import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalProvider } from "@/context/global-context";
import AuthGuard from "@/components/auth-guard";

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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0ea5e9" />
      </head>
      <body suppressHydrationWarning className="bg-black text-gray-100 min-h-full flex flex-col font-sans">
        <GlobalProvider>
          <AuthGuard>
            {children}
          </AuthGuard>
        </GlobalProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    reg.onupdatefound = function() {
                      var installingWorker = reg.installing;
                      if (installingWorker) {
                        installingWorker.onstatechange = function() {
                          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            if (window.caches) {
                              caches.keys().then(function(names) {
                                for (var name of names) caches.delete(name);
                              });
                            }
                            window.location.reload();
                          }
                        };
                      }
                    };
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
