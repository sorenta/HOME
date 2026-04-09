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
    <div className={`kitchen-theme-layer maj-theme-page kitchen-theme--${themeId}`}>
      <div className={`maj-theme-page-aura maj-theme-page-aura--${themeId}`} aria-hidden />
      <div className={`maj-theme-page-aura maj-theme-page-aura--secondary maj-theme-page-aura--${themeId}`} aria-hidden />
      <div className={`maj-theme-page-pattern maj-theme-page-pattern--${themeId}`} aria-hidden />

      {/* Forge: subtle red scan-line across inventory */}
      {themeId === "forge" && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px animate-forge-scan bg-gradient-to-r from-transparent via-primary to-transparent opacity-40" aria-hidden />
      )}

      {/* Botanical: decorative leaf accent */}
      {themeId === "botanical" && (
        <div className="pointer-events-none absolute -right-4 top-10 h-32 w-24 rounded-[100%_0_100%_0] border border-primary/10 bg-primary/[0.05] rotate-12 blur-[1px]" aria-hidden />
      )}

      {/* Pulse: offset block (brutalist depth) */}
      {themeId === "pulse" && (
        <div className="pointer-events-none absolute inset-4 -z-10 rounded-[1rem] translate-x-1 translate-y-1 border-2 border-black/8 bg-black/[0.015]" aria-hidden />
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
  let formControl = "";
  let actionButton = "";

  switch (themeId) {
    case "forge":
      itemCard = "border-l-2 border-l-primary/50 rounded-sm";
      categoryPill = "border-primary/30 bg-primary/10 rounded-sm";
      detailsSection = "border-primary/20 rounded-sm";
      formControl = "rounded-sm border-primary/20 focus:border-primary bg-background/40";
      actionButton = "rounded-sm metal-gradient border-2 border-primary/50 text-primary";
      break;
    case "botanical":
      itemCard = "rounded-[1.25rem]";
      categoryPill = "rounded-[1.5rem]";
      detailsSection = "rounded-[1.5rem]";
      formControl = "rounded-[1.25rem] border-primary/10 bg-primary/[0.03]";
      actionButton = "rounded-[1.5rem] bg-primary text-primary-foreground";
      break;
    case "pulse":
      itemCard = "border-2 border-black shadow-[2px_2px_0px_#000] rounded-sm";
      categoryPill = "border-2 border-black rounded-none";
      detailsSection = "border-2 border-black shadow-[3px_3px_0px_#000] rounded-sm";
      formControl = "border-2 border-black rounded-none focus:translate-x-0.5 focus:translate-y-0.5";
      actionButton = "border-2 border-black rounded-none shadow-[4px_4px_0px_#000] active:shadow-none active:translate-x-1 active:translate-y-1";
      break;
    case "hive":
      itemCard = "border-amber-300/40 rounded-xl";
      categoryPill = "border-amber-300/50 rounded-full";
      detailsSection = "border-amber-300/30 rounded-xl";
      formControl = "rounded-xl border-amber-300/20 focus:border-amber-400 bg-amber-50/10";
      actionButton = "theme-octagon bg-primary text-primary-foreground";
      break;
    case "lucent":
      itemCard = "backdrop-blur-sm bg-background/30 rounded-[1.5rem]";
      categoryPill = "backdrop-blur-sm rounded-full";
      detailsSection = "border-border/40 shadow-sm rounded-[1.5rem]";
      formControl = "rounded-full bg-background/30 border-white/20 backdrop-blur-md px-4";
      actionButton = "rounded-full bg-primary/10 text-primary backdrop-blur-md border border-primary/20";
      break;
  }

  return { itemCard, categoryPill, detailsSection, formControl, actionButton };
}
