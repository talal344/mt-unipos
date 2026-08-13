"use client";

import React from "react";

/**
 * MTCoreLogo — Premium animated atom/nucleus logo for MT Core
 * Features: 3 animated orbiting elliptical rings (emerald → cyan gradient),
 *           glowing MT badge center, glassmorphism icon container,
 *           animated word-mark with shimmer effect.
 *
 * Props:
 *   variant   – "sky" | "purple" | "emerald"
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
  ring1: string; ring2: string; ring3: string;
  glow1: string; glow2: string;
  textColor: string; subColor: string;
  iconBg1: string; iconBg2: string;
}> = {
  sky: {
    ring1: "#0EA5E9", ring2: "#38BDF8", ring3: "#06B6D4",
    glow1: "rgba(14,165,233,0.55)", glow2: "rgba(6,182,212,0.3)",
    textColor: "#FFFFFF", subColor: "#38BDF8",
    iconBg1: "#0c1a2e", iconBg2: "#0a1520",
  },
  purple: {
    ring1: "#A855F7", ring2: "#C084FC", ring3: "#8B5CF6",
    glow1: "rgba(168,85,247,0.55)", glow2: "rgba(139,92,246,0.3)",
    textColor: "#FFFFFF", subColor: "#C084FC",
    iconBg1: "#1a0e2e", iconBg2: "#120a20",
  },
  emerald: {
    ring1: "#10B981", ring2: "#34D399", ring3: "#0EA5E9",
    glow1: "rgba(16,185,129,0.6)", glow2: "rgba(14,165,233,0.35)",
    textColor: "#FFFFFF", subColor: "#10B981",
    iconBg1: "#061a12", iconBg2: "#041510",
  },
};

const SIZE_MAP: Record<Size, {
  badge: number; svgSize: number; mtFont: number; coreFont: number;
  wordTitle: number; wordSub: number; gap: number;
}> = {
  sm: { badge: 36, svgSize: 28, mtFont: 10, coreFont: 4,  wordTitle: 13, wordSub: 7,  gap: 8  },
  md: { badge: 46, svgSize: 36, mtFont: 13, coreFont: 5,  wordTitle: 16, wordSub: 9,  gap: 10 },
  lg: { badge: 60, svgSize: 48, mtFont: 17, coreFont: 6,  wordTitle: 20, wordSub: 11, gap: 12 },
};

export default function MTCoreLogo({
  variant = "emerald",
  size = "md",
  showText = true,
  collapsed = false,
  className = "",
}: MTCoreLogoProps) {
  const pal = PALETTE[variant];
  const sz  = SIZE_MAP[size];
  const uid = `mtl-${variant}-${size}`;

  // SVG viewBox is 100x100, we scale via width/height
  const cx = 50, cy = 50, r = 30; // center + nucleus radius

  return (
    <div
      className={`flex items-center select-none ${className}`}
      style={{ gap: sz.gap, fontFamily: "'Inter', 'Outfit', system-ui, sans-serif" }}
    >
      {/* ── Animated Icon Badge ───────────────────────────────────────── */}
      <div
        style={{
          width:  sz.badge,
          height: sz.badge,
          borderRadius: "28%",
          flexShrink: 0,
          position: "relative",
          background: `radial-gradient(ellipse at 30% 25%, ${pal.iconBg1} 0%, ${pal.iconBg2} 100%)`,
          boxShadow: `0 0 0 1px rgba(255,255,255,0.08), 0 0 22px ${pal.glow2}, 0 3px 12px rgba(0,0,0,0.6)`,
          overflow: "visible",
        }}
      >
        {/* Outer glow halo */}
        <div
          style={{
            position: "absolute",
            inset: -4,
            borderRadius: "calc(28% + 6px)",
            background: `radial-gradient(ellipse, ${pal.glow2} 0%, transparent 72%)`,
            animation: `mtHaloPulse-${uid} 2.8s ease-in-out infinite`,
            pointerEvents: "none",
          }}
        />

        {/* Inner glass gloss */}
        <div
          style={{
            position: "absolute", inset: 0,
            borderRadius: "inherit",
            background: "linear-gradient(140deg, rgba(255,255,255,0.12) 0%, transparent 55%)",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />

        {/* Shine sweep */}
        <div style={{ position: "absolute", inset: 0, borderRadius: "inherit", overflow: "hidden", zIndex: 3 }}>
          <div
            style={{
              position: "absolute",
              top: "-50%", left: "-80%",
              width: "50%", height: "220%",
              background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)",
              animation: `mtShine-${uid} 4s ease-in-out infinite`,
              transform: "rotate(20deg)",
            }}
          />
        </div>

        {/* SVG atom nucleus */}
        <svg
          width={sz.badge}
          height={sz.badge}
          viewBox="0 0 100 100"
          style={{ position: "absolute", inset: 0, zIndex: 1 }}
        >
          <defs>
            {/* Ring gradient 1 */}
            <linearGradient id={`rg1-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={pal.ring1} stopOpacity="0.9" />
              <stop offset="100%" stopColor={pal.ring2} stopOpacity="0.5" />
            </linearGradient>
            {/* Ring gradient 2 */}
            <linearGradient id={`rg2-${uid}`} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={pal.ring2} stopOpacity="0.9" />
              <stop offset="100%" stopColor={pal.ring3} stopOpacity="0.5" />
            </linearGradient>
            {/* Ring gradient 3 */}
            <linearGradient id={`rg3-${uid}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={pal.ring3} stopOpacity="0.9" />
              <stop offset="100%" stopColor={pal.ring1} stopOpacity="0.5" />
            </linearGradient>
            {/* Center glow filter */}
            <filter id={`cglow-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id={`rglow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Orbit ring 1 — horizontal tilt */}
          <ellipse
            cx={cx} cy={cy}
            rx={r} ry={r * 0.32}
            fill="none"
            stroke={`url(#rg1-${uid})`}
            strokeWidth="2.5"
            filter={`url(#rglow-${uid})`}
            style={{ animation: `mtRing1-${uid} 3s linear infinite` }}
          />

          {/* Orbit ring 2 — diagonal tilt 60° */}
          <ellipse
            cx={cx} cy={cy}
            rx={r} ry={r * 0.32}
            fill="none"
            stroke={`url(#rg2-${uid})`}
            strokeWidth="2.5"
            filter={`url(#rglow-${uid})`}
            transform={`rotate(60, ${cx}, ${cy})`}
            style={{ animation: `mtRing2-${uid} 3.4s linear infinite reverse` }}
          />

          {/* Orbit ring 3 — diagonal tilt -60° */}
          <ellipse
            cx={cx} cy={cy}
            rx={r} ry={r * 0.32}
            fill="none"
            stroke={`url(#rg3-${uid})`}
            strokeWidth="2.5"
            filter={`url(#rglow-${uid})`}
            transform={`rotate(-60, ${cx}, ${cy})`}
            style={{ animation: `mtRing3-${uid} 2.8s linear infinite` }}
          />

          {/* Center nucleus glow */}
          <circle
            cx={cx} cy={cy} r={10}
            fill={`${pal.ring1}22`}
            filter={`url(#cglow-${uid})`}
          />
          <circle
            cx={cx} cy={cy} r={6.5}
            fill={`${pal.ring1}55`}
            style={{ animation: `mtNucleus-${uid} 2.2s ease-in-out infinite` }}
          />
          <circle cx={cx} cy={cy} r={4.5} fill={pal.ring1} opacity="0.9" />

          {/* MT text inside nucleus */}
          <text
            x={cx} y={cy + sz.mtFont * 0.36}
            textAnchor="middle"
            fontSize={sz.mtFont}
            fontWeight="900"
            fill="#ffffff"
            fontFamily="'Inter', system-ui, sans-serif"
            letterSpacing="-0.5"
            style={{ textShadow: `0 0 8px ${pal.glow1}` }}
          >
            MT
          </text>
        </svg>
      </div>

      {/* ── Word-mark ────────────────────────────────────────────────────── */}
      {showText && !collapsed && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
          <span
            style={{
              fontSize: sz.wordTitle,
              fontWeight: 900,
              letterSpacing: "-0.035em",
              color: pal.textColor,
              whiteSpace: "nowrap",
              position: "relative",
              animation: `mtWordPulse-${uid} 4s ease-in-out infinite alternate`,
            }}
          >
            MT Core
          </span>
          <span
            style={{
              fontSize: sz.wordSub,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: pal.subColor,
              marginTop: 2,
              opacity: 0.9,
              whiteSpace: "nowrap",
            }}
          >
            Enterprise Platform
          </span>
        </div>
      )}

      {/* ── Keyframes ────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes mtRing1-${uid} {
          0%   { transform: rotateX(70deg) rotateY(0deg); }
          100% { transform: rotateX(70deg) rotateY(360deg); }
        }
        @keyframes mtRing2-${uid} {
          0%   { stroke-dashoffset: 0; opacity: 0.9; }
          50%  { opacity: 0.5; }
          100% { stroke-dashoffset: -200; opacity: 0.9; }
        }
        @keyframes mtRing3-${uid} {
          0%   { stroke-dashoffset: 0; opacity: 0.7; }
          50%  { opacity: 1; }
          100% { stroke-dashoffset: 200; opacity: 0.7; }
        }
        @keyframes mtNucleus-${uid} {
          0%,100% { r: 6.5; opacity: 0.8; }
          50%      { r: 8;   opacity: 1; }
        }
        @keyframes mtHaloPulse-${uid} {
          0%,100% { opacity: 0.4; transform: scale(1); }
          50%      { opacity: 0.8; transform: scale(1.06); }
        }
        @keyframes mtShine-${uid} {
          0%     { left: -80%; }
          55%,100% { left: 160%; }
        }
        @keyframes mtWordPulse-${uid} {
          0%   { opacity: 0.92; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
