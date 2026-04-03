"use client";

import { useTheme } from "@/components/providers/theme-provider";
import type { ReactNode } from "react";

type Props = { children: ReactNode };

/**
 * Theme-specific decorative wrapper for the Kitchen page.
 */
export function KitchenThemeLayer({ children }: Props) {
  const { themeId } = useTheme();

  return (
    <div className={`kitchen-theme-layer kitchen-theme--${themeId}`}>
      {/* Forge: subtle red scan-line across inventory */}
      {themeId === "forge" && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px animate-forge-scan bg-gradient-to-r from-transparent via-primary to-transparent opacity-40" aria-hidden />
      )}

      {/* Botanical: decorative leaf accent */}
      {themeId === "botanical" && (
        <div className="pointer-events-none absolute -right-3 top-12 text-[6rem] leading-none text-primary/[0.06] rotate-12 select-none" aria-hidden>
          🌿
        </div>
      )}

      {/* Pulse: offset block (brutalist depth) */}
      {themeId === "pulse" && (
        <div className="pointer-events-none absolute inset-4 -z-10 translate-x-1 translate-y-1 border-2 border-black/8 bg-black/[0.015]" aria-hidden />
      )}

      {/* Hive: hex watermark */}
      {themeId === "hive" && (
        <div className="pointer-events-none absolute left-4 bottom-8 text-[7rem] leading-none text-primary/[0.04] font-black select-none -rotate-6" aria-hidden>
          ⬡
        </div>
      )}

      {/* Lucent: warm radial glow */}
      {themeId === "lucent" && (
        <div className="pointer-events-none absolute right-1/4 top-1/4 h-48 w-48 rounded-full bg-primary/[0.05] blur-[60px]" aria-hidden />
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * Returns theme-specific CSS classes for inventory/shopping item rows.
 */
export function useKitchenItemTheme() {
  const { themeId } = useTheme();

  let itemCard = "";
  let categoryPill = "";
  let detailsSection = "";

  switch (themeId) {
    case "forge":
      itemCard = "border-l-2 border-l-primary/50";
      categoryPill = "border-primary/30 bg-primary/10";
      detailsSection = "border-primary/20";
      break;
    case "botanical":
      itemCard = "rounded-[1.25rem]";
      categoryPill = "rounded-[1.5rem]";
      detailsSection = "rounded-[1.5rem]";
      break;
    case "pulse":
      itemCard = "border-2 border-black shadow-[2px_2px_0px_#000] rounded-sm";
      categoryPill = "border-2 border-black rounded-none";
      detailsSection = "border-2 border-black shadow-[3px_3px_0px_#000] rounded-sm";
      break;
    case "hive":
      itemCard = "border-amber-300/40";
      categoryPill = "border-amber-300/50";
      detailsSection = "border-amber-300/30";
      break;
    case "lucent":
      itemCard = "backdrop-blur-sm bg-background/30";
      categoryPill = "backdrop-blur-sm";
      detailsSection = "border-border/40 shadow-sm";
      break;
  }

  return { itemCard, categoryPill, detailsSection };
}
