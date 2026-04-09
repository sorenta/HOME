"use client";

import { useTheme } from "@/components/providers/theme-provider";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

/**
 * Theme-specific decorative wrapper for the Finance page.
 * Adds visual personality per theme around the finance content.
 */
export function FinanceThemeLayer({ children }: Props) {
  const { themeId } = useTheme();

  return (
    <div className={`finance-theme-layer maj-theme-page finance-theme--${themeId}`}>
      <div className={`maj-theme-page-aura maj-theme-page-aura--${themeId}`} aria-hidden />
      <div className={`maj-theme-page-aura maj-theme-page-aura--secondary maj-theme-page-aura--${themeId}`} aria-hidden />
      <div className={`maj-theme-page-pattern maj-theme-page-pattern--${themeId}`} aria-hidden />

      {/* Forge: scanning line + dark chrome ambient */}
      {themeId === "forge" && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px animate-forge-scan bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" aria-hidden />
      )}

      {/* Botanical: vine border accents */}
      {themeId === "botanical" && (
        <div className="pointer-events-none absolute -left-2 top-16 bottom-16 w-1 rounded-full bg-gradient-to-b from-primary/0 via-primary/30 to-primary/0" aria-hidden />
      )}

      {/* Pulse: soft poster shadow */}
      {themeId === "pulse" && (
        <div className="pointer-events-none absolute inset-5 -z-10 rounded-[1.2rem] translate-x-1 translate-y-1 border-2 border-black/8 bg-black/[0.02]" aria-hidden />
      )}

      {/* Hive: subtle hexagon watermark */}
      {themeId === "hive" && (
        <div className="pointer-events-none absolute right-4 top-20 text-[7rem] leading-none text-primary/[0.035] font-black select-none" aria-hidden>
          ⬡
        </div>
      )}

      {/* Lucent: soft radial glow behind content */}
      {themeId === "lucent" && (
        <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 h-64 w-64 rounded-full bg-primary/[0.06] blur-[80px]" aria-hidden />
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
