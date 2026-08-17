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
  // Determine if we should display 1:1 Square or Rectangle
  const isSquare = collapsed || !showText || shape === "square";

  // Determine dark vs light background
  // If theme === "dark" (on dark surface), we use the Light logo files
  // If theme === "light" (on light surface), we use the Dark logo files
  const isDarkBackground = theme !== "light";

  let logoSrc = "";
  if (isSquare) {
    logoSrc = isDarkBackground ? "/logo light.png" : "/Logo Dark.png";
  } else {
    logoSrc = isDarkBackground ? "/rectangle light.png" : "/rectangle dark.png";
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

  return (
    <div className={`inline-flex items-center select-none transition duration-200 group ${className}`}>
      <img
        src={logoSrc}
        alt={alt}
        width={finalW}
        height={finalH}
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
