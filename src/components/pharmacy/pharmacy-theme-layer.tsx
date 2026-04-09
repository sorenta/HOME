"use client";

import { useTheme } from "@/components/providers/theme-provider";
import type { ReactNode } from "react";

type Props = { children: ReactNode };

/**
 * Theme-specific decorative wrapper for the Pharmacy page.
 * Adds visual personality per theme around the medication inventory.
 */
export function PharmacyThemeLayer({ children }: Props) {
  const { themeId } = useTheme();

  return (
    <div className={`pharmacy-theme-layer maj-theme-page pharmacy-theme--${themeId}`}>
      <div className={`maj-theme-page-aura maj-theme-page-aura--${themeId}`} aria-hidden />
      <div className={`maj-theme-page-aura maj-theme-page-aura--secondary maj-theme-page-aura--${themeId}`} aria-hidden />
      <div className={`maj-theme-page-pattern maj-theme-page-pattern--${themeId}`} aria-hidden />

      {/* Forge: clinical scan line */}
      {themeId === "forge" && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px animate-forge-scan bg-gradient-to-r from-transparent via-primary to-transparent opacity-40" aria-hidden />
      )}

      {/* Botanical: herb accent */}
      {themeId === "botanical" && (
        <div className="pointer-events-none absolute -left-2 top-16 bottom-16 w-0.5 rounded-full bg-gradient-to-b from-primary/0 via-primary/20 to-primary/0" aria-hidden />
      )}

      {/* Pulse: offset block */}
      {themeId === "pulse" && (
        <div className="pointer-events-none absolute inset-4 -z-10 rounded-[1rem] translate-x-1 translate-y-1 border-2 border-black/8 bg-black/[0.015]" aria-hidden />
      )}

      {/* Hive: hex watermark */}
      {themeId === "hive" && (
        <div className="pointer-events-none absolute right-3 top-24 text-[8rem] leading-none text-primary/[0.03] font-black select-none" aria-hidden>
          ⬡
        </div>
      )}

      {/* Lucent: soft glow */}
      {themeId === "lucent" && (
        <div className="pointer-events-none absolute right-1/4 top-1/4 h-44 w-44 rounded-full bg-primary/[0.05] blur-[60px]" aria-hidden />
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * Returns theme-specific CSS classes for medication item cards.
 */
export function usePharmacyItemTheme() {
  const { themeId } = useTheme();

  let itemCard = "";
  let expiryPill = "";
  let formControl = "";
  let actionButton = "";

  switch (themeId) {
    case "forge":
      itemCard = "border-l-2 border-l-primary/40 rounded-sm";
      expiryPill = "border-primary/30 bg-primary/10 rounded-sm";
      formControl = "rounded-sm border-primary/20 focus:border-primary";
      actionButton = "rounded-sm metal-gradient border-2 border-primary/50 text-primary";
      break;
    case "botanical":
      itemCard = "rounded-[1.25rem]";
      expiryPill = "rounded-[1.5rem]";
      formControl = "rounded-[1.25rem]";
      actionButton = "rounded-[1.5rem]";
      break;
    case "pulse":
      itemCard = "border-2 border-black shadow-[2px_2px_0px_#000] rounded-sm";
      expiryPill = "border-2 border-black rounded-none";
      formControl = "border-2 border-black rounded-none focus:translate-x-0.5 focus:translate-y-0.5";
      actionButton = "border-2 border-black rounded-none shadow-[3px_3px_0px_#000] active:shadow-none active:translate-x-0.5 active:translate-y-0.5";
      break;
    case "hive":
      itemCard = "border-amber-300/30 rounded-xl";
      expiryPill = "border-amber-300/50 rounded-full";
      formControl = "rounded-xl border-amber-300/20 focus:border-amber-400";
      actionButton = "rounded-xl bg-primary text-primary-foreground";
      break;
    case "lucent":
      itemCard = "backdrop-blur-sm bg-background/30 rounded-[2rem]";
      expiryPill = "backdrop-blur-sm rounded-full";
      formControl = "rounded-[1.5rem] bg-background/40 border-white/20";
      actionButton = "rounded-full bg-primary/10 text-primary backdrop-blur-md";
      break;
  }

  return { itemCard, expiryPill, formControl, actionButton };
}
