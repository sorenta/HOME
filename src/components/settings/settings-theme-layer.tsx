"use client";

import { useTheme } from "@/components/providers/theme-provider";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

/**
 * Theme-specific decorative wrapper for the Settings page.
 * Settings = precizitāte, kontrole, kārtība.
 */
export function SettingsThemeLayer({ children }: Props) {
  const { themeId } = useTheme();

  return (
    <div className={`settings-theme-layer maj-theme-page settings-theme--${themeId}`}>
      <div className={`maj-theme-page-aura maj-theme-page-aura--${themeId}`} aria-hidden />
      <div className={`maj-theme-page-aura maj-theme-page-aura--secondary maj-theme-page-aura--${themeId}`} aria-hidden />
      <div className={`maj-theme-page-pattern maj-theme-page-pattern--${themeId}`} aria-hidden />

      {/* Forge: red accent top bar + control panel scan */}
      {themeId === "forge" && (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary/0 via-primary/70 to-primary/0"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px animate-forge-scan bg-gradient-to-r from-transparent via-primary to-transparent opacity-55"
            aria-hidden
          />
        </>
      )}

      {/* Botanical: calm vine border + subtle leaf */}
      {themeId === "botanical" && (
        <>
          <div
            className="pointer-events-none absolute -left-1 top-16 bottom-16 w-0.5 rounded-full bg-gradient-to-b from-primary/0 via-primary/22 to-primary/0"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute right-4 bottom-20 text-[5rem] leading-none select-none opacity-[0.04] rotate-[20deg]"
            aria-hidden
          >
            🍃
          </div>
        </>
      )}

      {/* Pulse: brutalist top band + offset shadow */}
      {themeId === "pulse" && (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-primary/20"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-5 -z-10 rounded-[1.2rem] translate-x-1.5 translate-y-1.5 border-2 border-black/8 bg-black/[0.02]"
            aria-hidden
          />
        </>
      )}

      {/* Hive: honeycomb watermark bottom + amber glow */}
      {themeId === "hive" && (
        <>
          <div
            className="pointer-events-none absolute right-4 top-20 text-[7rem] leading-none text-primary/[0.038] font-black select-none"
            aria-hidden
          >
            ⬡
          </div>
          <div
            className="pointer-events-none absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-primary/[0.04] to-transparent"
            aria-hidden
          />
        </>
      )}

      {/* Lucent: dual pearl ellipses — airy control room */}
      {themeId === "lucent" && (
        <>
          <div
            className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 h-64 w-80 rounded-full bg-primary/[0.05] blur-[100px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute right-0 bottom-1/4 h-48 w-48 rounded-full bg-accent/[0.04] blur-[70px]"
            aria-hidden
          />
        </>
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
