"use client";

import { useTheme } from "@/components/providers/theme-provider";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

/**
 * Theme-specific decorative wrapper for the Household page.
 * Household = koplietošana, savienojums, ģimene.
 */
export function HouseholdThemeLayer({ children }: Props) {
  const { themeId } = useTheme();

  return (
    <div className={`household-theme-layer maj-theme-page household-theme--${themeId}`}>
      <div className={`maj-theme-page-aura maj-theme-page-aura--${themeId}`} aria-hidden />
      <div className={`maj-theme-page-aura maj-theme-page-aura--secondary maj-theme-page-aura--${themeId}`} aria-hidden />
      <div className={`maj-theme-page-pattern maj-theme-page-pattern--${themeId}`} aria-hidden />

      {/* Forge: scan line + network node dots (people connections) */}
      {themeId === "forge" && (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px animate-forge-scan bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute right-6 top-24 grid grid-cols-3 gap-2 opacity-[0.06]"
            aria-hidden
          >
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-1.5 w-1.5 rounded-full bg-primary" />
            ))}
          </div>
        </>
      )}

      {/* Botanical: twin vine accents — left + right borders */}
      {themeId === "botanical" && (
        <>
          <div
            className="pointer-events-none absolute -left-1 top-20 bottom-20 w-0.5 rounded-full bg-gradient-to-b from-primary/0 via-primary/25 to-primary/0"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-1 top-32 bottom-32 w-0.5 rounded-full bg-gradient-to-b from-primary/0 via-primary/15 to-primary/0"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute right-5 top-16 text-[4.5rem] leading-none select-none opacity-[0.045] -rotate-12"
            aria-hidden
          >
            🌿
          </div>
        </>
      )}

      {/* Pulse: bold corner bracket marks — top-left + bottom-right */}
      {themeId === "pulse" && (
        <>
          <div
            className="pointer-events-none absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2 border-black/10"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute right-3 bottom-3 h-6 w-6 border-r-2 border-b-2 border-black/10"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-4 -z-10 rounded-[1.2rem] translate-x-1 translate-y-1 border-2 border-black/6 bg-black/[0.015]"
            aria-hidden
          />
        </>
      )}

      {/* Hive: dual hexagon watermarks — people cluster */}
      {themeId === "hive" && (
        <>
          <div
            className="pointer-events-none absolute right-3 top-16 text-[8rem] leading-none text-primary/[0.04] font-black select-none"
            aria-hidden
          >
            ⬡
          </div>
          <div
            className="pointer-events-none absolute left-2 bottom-24 text-[5rem] leading-none text-primary/[0.03] font-black select-none rotate-12"
            aria-hidden
          >
            ⬡
          </div>
        </>
      )}

      {/* Lucent: soft pearl glow — warmth of home */}
      {themeId === "lucent" && (
        <>
          <div
            className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 h-72 w-72 rounded-full bg-primary/[0.055] blur-[90px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute right-0 bottom-1/3 h-40 w-40 rounded-full bg-accent/[0.04] blur-[60px]"
            aria-hidden
          />
        </>
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
