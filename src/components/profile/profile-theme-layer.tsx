"use client";

import { useTheme } from "@/components/providers/theme-provider";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

/**
 * Theme-specific decorative wrapper for the Profile page.
 * Profile = identitāte, personiskums, unikalitāte.
 */
export function ProfileThemeLayer({ children }: Props) {
  const { themeId } = useTheme();

  return (
    <div className={`profile-theme-layer maj-theme-page profile-theme--${themeId}`}>
      <div className={`maj-theme-page-aura maj-theme-page-aura--${themeId}`} aria-hidden />
      <div className={`maj-theme-page-aura maj-theme-page-aura--secondary maj-theme-page-aura--${themeId}`} aria-hidden />
      <div className={`maj-theme-page-pattern maj-theme-page-pattern--${themeId}`} aria-hidden />

      {/* Forge: vertical steel accent + identity scan line */}
      {themeId === "forge" && (
        <>
          <div
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/0 via-primary/40 to-primary/0"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px animate-forge-scan bg-gradient-to-r from-transparent via-primary to-transparent opacity-45"
            aria-hidden
          />
        </>
      )}

      {/* Botanical: warm parchment glow + botanical leaf accent */}
      {themeId === "botanical" && (
        <>
          <div
            className="pointer-events-none absolute right-4 top-12 text-[6rem] leading-none select-none opacity-[0.05] rotate-6"
            aria-hidden
          >
            🌸
          </div>
          <div
            className="pointer-events-none absolute -left-1 top-24 bottom-24 w-0.5 rounded-full bg-gradient-to-b from-primary/0 via-primary/20 to-primary/0"
            aria-hidden
          />
        </>
      )}

      {/* Pulse: poster-frame corner brackets + offset card shadow */}
      {themeId === "pulse" && (
        <>
          <div
            className="pointer-events-none absolute left-2 top-2 h-8 w-8 border-l-[3px] border-t-[3px] border-black/12"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute right-2 top-2 h-8 w-8 border-r-[3px] border-t-[3px] border-black/12"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-2 bottom-2 h-8 w-8 border-l-[3px] border-b-[3px] border-black/12"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute right-2 bottom-2 h-8 w-8 border-r-[3px] border-b-[3px] border-black/12"
            aria-hidden
          />
        </>
      )}

      {/* Hive: single large hexagon watermark — identity cell */}
      {themeId === "hive" && (
        <div
          className="pointer-events-none absolute right-2 top-20 text-[10rem] leading-none text-primary/[0.038] font-black select-none -rotate-6"
          aria-hidden
        >
          ⬡
        </div>
      )}

      {/* Lucent: champagne double-glow — soft portrait lighting */}
      {themeId === "lucent" && (
        <>
          <div
            className="pointer-events-none absolute left-1/4 top-0 h-56 w-56 rounded-full bg-primary/[0.07] blur-[80px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute right-1/4 top-1/3 h-40 w-40 rounded-full bg-accent/[0.05] blur-[60px]"
            aria-hidden
          />
        </>
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
