import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalProvider } from "@/context/global-context";
import AuthGuard from "@/components/auth-guard";
import AutoUpdaterBanner from "@/components/auto-updater-banner";

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function applyFavicon() {
                  try {
                    var isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                    var target = isDark ? '/logo light.png' : '/Logo Dark.png';
                    var link = document.querySelector("link[rel~='icon']");
                    if (!link) {
                      link = document.createElement('link');
                      link.rel = 'icon';
                      link.type = 'image/png';
                      document.head.appendChild(link);
                    }
                    link.href = target;
                  } catch (e) {}
                }
                applyFavicon();
                if (window.matchMedia) {
                  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyFavicon);
                }
              })();
            `
          }}
        />
      </head>
      <body suppressHydrationWarning className="bg-black text-gray-100 min-h-full flex flex-col font-sans">
        <GlobalProvider>
          <AutoUpdaterBanner />
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
                    if (navigator.onLine) {
                      var routes = [
                        '/dashboard', '/pos', '/sales', '/customers', '/products', 
                        '/suppliers', '/purchases', '/inventory', '/expenses', 
                        '/accounting', '/payroll', '/staff', '/crm', '/reports', 
                        '/ai', '/support', '/settings', '/restaurant', '/kds', 
                        '/menu-builder', '/floor-editor', '/pharmacy'
                      ];
                      setTimeout(function() {
                        routes.forEach(function(r) {
                          fetch(r, { cache: 'no-cache' }).catch(function() {});
                        });
                      }, 2500);
                    }
                  }).catch(function(err) {
                    console.warn('SW registration failed:', err);
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
