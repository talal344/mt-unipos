"use client";

import React from "react";

/**
 * MTCoreLogo — Pure CSS animated letter logo for MT Core
 *
 * Props:
 *   variant   – "sky" (client/public) | "purple" (admin) | "emerald" (hrms)
 *   size      – "sm" | "md" | "lg"
 *   showText  – show "MT Core" word-mark next to the badge (default: true)
 *   collapsed – sidebar collapsed mode: show only badge (default: false)
 *   className – extra wrapper classes
 */

type Variant = "sky" | "purple" | "emerald";
type Size = "sm" | "md" | "lg";

interface MTCoreLogoProps {
  variant?: Variant;
  size?: Size;
  showText?: boolean;
  collapsed?: boolean;
  className?: string;
}

const PALETTE: Record<Variant, {
  grad1: string; grad2: string; grad3: string;
  ring: string; glow: string; textColor: string; subColor: string;
}> = {
  sky: {
    grad1: "#38BDF8", grad2: "#0EA5E9", grad3: "#0369A1",
    ring: "rgba(14,165,233,0.4)", glow: "rgba(14,165,233,0.25)",
    textColor: "#E0F2FE", subColor: "#38BDF8",
  },
  purple: {
    grad1: "#C084FC", grad2: "#A855F7", grad3: "#7C3AED",
    ring: "rgba(168,85,247,0.4)", glow: "rgba(168,85,247,0.25)",
    textColor: "#F3E8FF", subColor: "#C084FC",
  },
  emerald: {
    grad1: "#6EE7B7", grad2: "#10B981", grad3: "#047857",
    ring: "rgba(16,185,129,0.4)", glow: "rgba(16,185,129,0.25)",
    textColor: "#D1FAE5", subColor: "#6EE7B7",
  },
};

const SIZE_MAP: Record<Size, {
  badge: number; font: number; sub: number; wordTitle: number; wordSub: number;
}> = {
  sm: { badge: 36, font: 13, sub: 5,  wordTitle: 13, wordSub: 8  },
  md: { badge: 44, font: 16, sub: 6,  wordTitle: 15, wordSub: 9  },
  lg: { badge: 56, font: 21, sub: 7,  wordTitle: 18, wordSub: 10 },
};

export default function MTCoreLogo({
  variant = "sky",
  size = "md",
  showText = true,
  collapsed = false,
  className = "",
}: MTCoreLogoProps) {
  const pal  = PALETTE[variant];
  const sz   = SIZE_MAP[size];
  const id   = `mt-logo-${variant}-${size}`;

  return (
    <div
      className={`flex items-center gap-2.5 select-none ${className}`}
      style={{ fontFamily: "'Inter', 'Outfit', system-ui, sans-serif" }}
    >
      {/* ── Animated Badge ────────────────────────────────────────────── */}
      <div
        style={{
          width:  sz.badge,
          height: sz.badge,
          borderRadius: "30%",
          flexShrink: 0,
          position: "relative",
          background: `linear-gradient(145deg, ${pal.grad1} 0%, ${pal.grad2} 50%, ${pal.grad3} 100%)`,
          boxShadow: `0 0 0 1.5px ${pal.ring}, 0 4px 18px ${pal.glow}, 0 2px 6px rgba(0,0,0,0.5)`,
          animation: "mtLogoFloat 3s ease-in-out infinite",
        }}
      >
        {/* inner gloss */}
        <div
          style={{
            position: "absolute", inset: 0,
            borderRadius: "inherit",
            background: "linear-gradient(145deg, rgba(255,255,255,0.25) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        {/* shine sweep */}
        <div
          style={{
            position: "absolute", inset: 0,
            borderRadius: "inherit",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-60%", left: "-60%",
              width: "60%", height: "200%",
              background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)",
              animation: "mtLogoShine 3.5s ease-in-out infinite",
              transform: "rotate(20deg)",
            }}
          />
        </div>

        {/* MT text */}
        <div
          style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: sz.font,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: "#fff",
              textShadow: "0 1px 4px rgba(0,0,0,0.5)",
            }}
          >
            MT
          </span>
          <span
            style={{
              fontSize: sz.sub,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.75)",
              marginTop: 1,
            }}
          >
            CORE
          </span>
        </div>

        {/* pulse ring */}
        <div
          style={{
            position: "absolute",
            inset: -2,
            borderRadius: "calc(30% + 4px)",
            border: `1.5px solid ${pal.ring}`,
            animation: "mtLogoPulse 2.8s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ── Word-mark (hidden when collapsed) ─────────────────────────── */}
      {showText && !collapsed && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
          <span
            style={{
              fontSize: sz.wordTitle,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: pal.textColor,
              animation: "mtLogoGradShift 4s ease-in-out infinite alternate",
            }}
          >
            MT Core
          </span>
          <span
            style={{
              fontSize: sz.wordSub,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: pal.subColor,
              marginTop: 1,
              opacity: 0.85,
            }}
          >
            Enterprise Platform
          </span>
        </div>
      )}

      {/* ── Keyframes injected once via <style> ───────────────────────── */}
      <style>{`
        @keyframes mtLogoFloat {
          0%,100% { transform: translateY(0px) scale(1); }
          50%      { transform: translateY(-2px) scale(1.03); }
        }
        @keyframes mtLogoPulse {
          0%,100% { opacity: 0.6; transform: scale(1); }
          50%      { opacity: 0;   transform: scale(1.18); }
        }
        @keyframes mtLogoShine {
          0%   { left: -60%; }
          60%,100% { left: 160%; }
        }
        @keyframes mtLogoGradShift {
          0%   { filter: brightness(1); }
          100% { filter: brightness(1.15); }
        }
      `}</style>
    </div>
  );
}
