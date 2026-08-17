"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Laptop, Menu, X, ArrowRight, ShieldAlert, KeyRound, Sun, Moon, LogIn } from "lucide-react";
import MTCoreLogo from "@/components/mt-logo";
import { useGlobalContext } from "@/context/global-context";

const SUPER_ADMIN_PASSCODE = "talal344";

export default function SiteHeader() {
  const pathname = usePathname();
  const router   = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useGlobalContext();
  const isLight = theme === "light";

  // ── Hidden Super Admin access ───────────────────────────────────────────────
  const [keyBuffer, setKeyBuffer]           = useState("");
  const [superVisible, setSuperVisible]     = useState(false);
  const [showPasscodeBox, setShowPasscodeBox] = useState(false);
  const [passcodeInput, setPasscodeInput]   = useState("");
  const [passcodeError, setPasscodeError]   = useState(false);
  const passcodeRef = useRef<HTMLInputElement>(null);
  const bufferTimer = useRef<ReturnType<typeof setTimeout>|null>(null);
  const [logoTaps, setLogoTaps]             = useState(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout>|null>(null);

  // Listen for keyboard typing of secret code anywhere on the page
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return;
      const next = (keyBuffer + e.key).slice(-SUPER_ADMIN_PASSCODE.length);
      setKeyBuffer(next);
      if (next === SUPER_ADMIN_PASSCODE) {
        setSuperVisible(true);
        setKeyBuffer("");
      }
      // Reset buffer after 3 seconds of inactivity
      if (bufferTimer.current) clearTimeout(bufferTimer.current);
      bufferTimer.current = setTimeout(() => setKeyBuffer(""), 3000);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [keyBuffer]);

  const handleSuperAdminClick = () => {
    router.push("/admin/login");
    setSuperVisible(false);
  };

  const handleLogoTap = () => {
    setLogoTaps(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setSuperVisible(true);
        return 0;
      }
      return next;
    });
    
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => setLogoTaps(0), 2000); // reset if gap > 2s
  };

  const navLinks = [
    { name: "Features",     href: "/features"      },
    { name: "About Us",     href: "/about"         },
    { name: "SaaS Blog",    href: "/blog"          },
    { name: "Tracking",     href: "/track-ticket"  },
    { name: "Contact",      href: "/contact"       },
  ];


  return (
    <header className={`sticky top-0 z-40 w-full border-b transition-colors duration-200 ${
      isLight ? "bg-white/95 border-slate-200 text-slate-900 shadow-xs" : "bg-black/85 border-brand-dark-border text-white"
    } backdrop-blur-md font-sans`}>
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex h-20 items-center justify-between py-2">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer select-none" onClick={handleLogoTap}>
            <Link href="/" className="flex items-center gap-2 group">
              <MTCoreLogo variant="sky" size="md" shape="rectangle" showText={true} theme={isLight ? "light" : "dark"} />
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.name} href={link.href}
                  className={`text-sm font-semibold tracking-wide transition-colors duration-200 ${
                    isLight
                      ? isActive ? "text-sky-600 font-black" : "text-slate-700 hover:text-sky-600"
                      : isActive ? "text-brand-sky font-black" : "text-gray-300 hover:text-brand-sky"
                  }`}>
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-center ${
                isLight
                  ? "bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200"
                  : "bg-[#0b121e] border-gray-800 text-yellow-400 hover:bg-white/10"
              }`}
              title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {isLight ? <Moon size={16} className="text-slate-800" /> : <Sun size={16} className="text-yellow-400" />}
            </button>

            {/* Hidden Super Admin Button — only visible after passcode */}
            {superVisible && (
              <button
                onClick={handleSuperAdminClick}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-purple-400 border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-lg transition animate-pulse"
                title="Super Admin Portal"
              >
                <ShieldAlert size={12} /> Super Admin
              </button>
            )}
            <Link
              href="/login"
              className={`group relative inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 border ${
                isLight
                  ? "bg-slate-100/90 hover:bg-white text-slate-800 hover:text-sky-600 border-slate-200/90 hover:border-sky-400 shadow-xs hover:shadow-md hover:shadow-sky-500/10"
                  : "bg-white/[0.04] hover:bg-sky-500/10 text-gray-200 hover:text-sky-300 border-white/10 hover:border-sky-500/40 shadow-xs hover:shadow-lg hover:shadow-sky-500/15"
              }`}
            >
              <LogIn size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-sky-500" />
              <span>Sign In</span>
              <span className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
                isLight ? "bg-gradient-to-r from-sky-500/5 via-sky-400/10 to-transparent" : "bg-gradient-to-r from-sky-500/10 via-transparent to-transparent"
              }`} />
            </Link>
            <Link href="/demo"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-black text-white hover:opacity-95 shadow-md shadow-sky-500/25 transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105 active:scale-95">
              <span>Request Demo</span> <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Mobile Menu & Theme Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition ${
                isLight ? "bg-slate-100 border-slate-200 text-slate-800" : "bg-black border-gray-800 text-yellow-400"
              }`}
            >
              {isLight ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`${isLight ? "text-slate-700 hover:text-slate-900" : "text-gray-400 hover:text-white"} p-2`}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-t p-4 space-y-4 animate-fade-in-up ${isLight ? "bg-white border-slate-200" : "bg-black border-brand-dark-border"}`}>
          <nav className="flex flex-col gap-3">
            {navLinks.map(link => (
              <Link key={link.name} href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-semibold py-2 border-b transition ${
                  isLight
                    ? `border-slate-100 ${pathname === link.href ? "text-sky-600 font-bold" : "text-slate-800"}`
                    : `border-brand-dark-border/40 ${pathname === link.href ? "text-brand-sky font-bold" : "text-gray-300"}`
                }`}>
                {link.name}
              </Link>
            ))}
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-center gap-2 text-center text-xs font-bold py-3 rounded-xl border transition-all active:scale-95 ${
                isLight
                  ? "text-slate-800 bg-slate-100 border-slate-300 hover:bg-white hover:text-sky-600 hover:border-sky-400 shadow-xs"
                  : "text-gray-200 bg-white/[0.04] hover:bg-sky-500/10 hover:text-sky-300 border-white/10 hover:border-sky-500/40 shadow-xs"
              }`}>
              <LogIn size={15} />
              <span>Sign In to Portal</span>
            </Link>
            <Link href="/demo" onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 text-center text-xs font-black py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-95 text-white rounded-xl shadow-md shadow-sky-500/20 active:scale-95">
              <span>Request Demo</span>
              <ArrowRight size={15} />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
