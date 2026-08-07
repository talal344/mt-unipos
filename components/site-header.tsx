"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Laptop, Menu, X, ArrowRight, ShieldAlert, KeyRound } from "lucide-react";

const SUPER_ADMIN_PASSCODE = "talal344";

export default function SiteHeader() {
  const pathname = usePathname();
  const router   = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { name: "Track Ticket", href: "/track-ticket"  },
    { name: "Contact",      href: "/contact"       },
  ];


  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-dark-border bg-black/80 backdrop-blur-md glass-panel font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between py-2">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer select-none" onClick={handleLogoTap}>
            <Link href="/" className="flex items-center gap-2 group">
              <img src="/logo.png" alt="MT UniPOS" className="h-16 sm:h-20 w-auto max-w-[320px] object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-[0_0_20px_rgba(14,165,233,0.45)]" />
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.name} href={link.href}
                  className={`text-sm font-semibold tracking-wide transition-colors duration-200 hover:text-brand-sky ${isActive ? "text-brand-sky font-bold" : "text-gray-300"}`}>
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
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
            <Link href="/login"
              className="text-sm font-semibold text-gray-300 hover:text-white transition-colors duration-200">
              Sign In
            </Link>
            <Link href="/demo"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-sky px-4 py-2 text-sm font-black text-black hover:bg-brand-sky-light transition-all duration-200 transform hover:scale-105">
              Request Demo <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-400 hover:text-white p-2">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-brand-dark-border bg-black p-4 space-y-4 animate-fade-in-up">
          <nav className="flex flex-col gap-3">
            {navLinks.map(link => (
              <Link key={link.name} href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-semibold py-2 border-b border-brand-dark-border/40 ${pathname === link.href ? "text-brand-sky font-bold" : "text-gray-300"}`}>
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-3 pt-2">
            {superVisible && (
              <button onClick={() => { router.push("/admin/login"); setMobileMenuOpen(false); setSuperVisible(false); }}
                className="text-center text-xs font-black py-2 text-purple-400 border border-purple-500/40 bg-purple-500/10 rounded-lg flex items-center justify-center gap-1.5">
                <ShieldAlert size={12} /> Super Admin Portal
              </button>
            )}
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}
              className="text-center text-sm font-semibold py-2 text-gray-300 hover:text-white border border-brand-dark-border rounded-lg">
              Sign In
            </Link>
            <Link href="/demo" onClick={() => setMobileMenuOpen(false)}
              className="text-center text-sm font-black py-2.5 bg-brand-sky text-black rounded-lg hover:bg-brand-sky-light">
              Request Demo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
