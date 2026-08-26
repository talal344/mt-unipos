"use client";

import React from "react";
import Image from "next/image";

export type LogoVariant = "sky" | "purple" | "emerald";
export type LogoSize = "sm" | "md" | "lg" | "xl";
export type LogoShape = "auto" | "square" | "rectangle";
export type LogoTheme = "dark" | "light" | "auto";

export interface MTCoreLogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  shape?: LogoShape;
  theme?: LogoTheme; // "dark" (on dark background -> uses light logo) | "light" (on light background -> uses dark logo)
  showText?: boolean;
  collapsed?: boolean;
  className?: string;
  height?: number;
  width?: number;
  alt?: string;
}

export default function MTCoreLogo({
  variant = "sky",
  size = "md",
  shape = "auto",
  theme = "dark",
  showText = true,
  collapsed = false,
  className = "",
  height,
  width,
  alt = "MT Core Enterprise Platform"
}: MTCoreLogoProps) {
  const [imgError, setImgError] = React.useState(false);

  // Determine if we should display 1:1 Square or Rectangle
  const isSquare = collapsed || !showText || shape === "square";

  // Determine dark vs light background
  const isDarkBackground = theme !== "light";

  let logoSrc = "";
  if (isSquare) {
    logoSrc = isDarkBackground ? "/logo%20light.png" : "/Logo%20Dark.png";
  } else {
    logoSrc = isDarkBackground ? "/rectangle%20light.png" : "/rectangle%20dark.png";
  }

  // Size dimensions
  const sizeMap: Record<LogoSize, { square: { h: number; w: number }; rect: { h: number; w: number } }> = {
    sm: { square: { h: 32, w: 32 }, rect: { h: 30, w: 120 } },
    md: { square: { h: 42, w: 42 }, rect: { h: 38, w: 155 } },
    lg: { square: { h: 54, w: 54 }, rect: { h: 48, w: 190 } },
    xl: { square: { h: 72, w: 72 }, rect: { h: 64, w: 250 } }
  };

  const activeDim = isSquare ? sizeMap[size].square : sizeMap[size].rect;
  const finalH = height || activeDim.h;
  const finalW = width || activeDim.w;

  if (imgError) {
    return (
      <div className={`inline-flex items-center gap-2 select-none font-sans group ${className}`}>
        <div className={`rounded-xl flex items-center justify-center font-black tracking-tighter border shadow-sm ${
          size === "sm" ? "w-8 h-8 text-[11px]" : size === "lg" ? "w-12 h-12 text-base" : size === "xl" ? "w-16 h-16 text-xl" : "w-9 h-9 text-xs"
        } ${
          isDarkBackground
            ? "bg-gradient-to-tr from-sky-600 to-cyan-400 text-white border-sky-400/40 shadow-sky-500/20"
            : "bg-gradient-to-tr from-sky-700 to-blue-600 text-white border-sky-600/30 shadow-sky-700/20"
        }`}>
          MT
        </div>
        {showText && !collapsed && (
          <div className="flex flex-col text-left">
            <span className={`font-black text-sm tracking-tight leading-none ${isDarkBackground ? "text-white" : "text-slate-900"}`}>
              MT <span className="text-sky-500 font-extrabold">CORE</span>
            </span>
            <span className={`text-[8px] font-bold uppercase tracking-widest mt-0.5 ${isDarkBackground ? "text-gray-400" : "text-slate-500"}`}>
              Enterprise Platform
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center select-none transition duration-200 group ${className}`}>
      <img
        src={logoSrc}
        alt={alt}
        width={finalW}
        height={finalH}
        onError={() => setImgError(true)}
        className={`object-contain transition-transform duration-200 group-hover:scale-105 ${
          isSquare ? "rounded-xl" : ""
        }`}
        style={{
          maxHeight: `${finalH}px`,
          width: isSquare ? `${finalW}px` : "auto"
        }}
        loading="eager"
      />
    </div>
  );
}
