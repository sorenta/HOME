"use client";

import { useTheme } from "@/components/providers/theme-provider";
import type { ReactNode } from "react";

type Props = { children: ReactNode };

/**
 * Theme-specific decorative wrapper for the Reset / Wellness page.
 * Adds mood-glow personality per theme around the reset content.
 */
export function ResetThemeLayer({ children }: Props) {
  const { themeId } = useTheme();

  return (
    <div className={`reset-theme-layer reset-theme--${themeId}`}>
      {/* Forge: pulsing red glow behind mood score — engine heartbeat */}
      {themeId === "forge" && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/[0.08] to-transparent" aria-hidden />
      )}

      {/* Botanical: growing vine accent on left edge */}
      {themeId === "botanical" && (
        <div className="pointer-events-none absolute -left-1 top-20 bottom-20 w-0.5 rounded-full bg-gradient-to-b from-primary/0 via-primary/25 to-primary/0" aria-hidden />
      )}

      {/* Pulse: offset block — brutalist depth for check-in cards */}
      {themeId === "pulse" && (
        <div className="pointer-events-none absolute inset-4 -z-10 translate-x-1 translate-y-1 border-2 border-black/10 bg-black/[0.02]" aria-hidden />
      )}

      {/* Hive: hexagon watermark behind wellness score */}
      {themeId === "hive" && (
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-16 text-[10rem] leading-none text-primary/[0.04] font-black select-none" aria-hidden>
          ⬡
        </div>
      )}

      {/* Lucent: soft dreamy glow behind mood panel */}
      {themeId === "lucent" && (
        <div className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2 h-56 w-56 rounded-full bg-primary/[0.07] blur-[90px]" aria-hidden />
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
