"use client";

import { useTheme } from "@/components/providers/theme-provider";
import type { ReactNode } from "react";

type Props = { children: ReactNode };

/**
 * Theme-specific decorative wrapper for the Events / Calendar page.
 * Adds visual personality per theme around the events content.
 */
export function EventsThemeLayer({ children }: Props) {
  const { themeId } = useTheme();

  return (
    <div className={`events-theme-layer events-theme--${themeId}`}>
      {/* Forge: scan line across calendar grid */}
      {themeId === "forge" && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px animate-forge-scan bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" aria-hidden />
      )}

      {/* Botanical: decorative leaf corner */}
      {themeId === "botanical" && (
        <div className="pointer-events-none absolute right-2 top-14 text-[5rem] leading-none text-primary/[0.06] -rotate-12 select-none" aria-hidden>
          🍃
        </div>
      )}

      {/* Pulse: brutalist offset depth */}
      {themeId === "pulse" && (
        <div className="pointer-events-none absolute inset-4 -z-10 translate-x-1 translate-y-1 border-2 border-black/8 bg-black/[0.015]" aria-hidden />
      )}

      {/* Hive: hex watermark */}
      {themeId === "hive" && (
        <div className="pointer-events-none absolute right-6 bottom-12 text-[7rem] leading-none text-primary/[0.04] font-black select-none rotate-12" aria-hidden>
          ⬡
        </div>
      )}

      {/* Lucent: warm ambient glow */}
      {themeId === "lucent" && (
        <div className="pointer-events-none absolute left-1/3 top-1/3 h-52 w-52 rounded-full bg-primary/[0.05] blur-[70px]" aria-hidden />
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * Returns theme-specific CSS classes for calendar grid cells.
 */
export function useEventsCalendarTheme() {
  const { themeId } = useTheme();

  let dayCell = "";
  let selectedCell = "";
  let eventDot = "";

  switch (themeId) {
    case "forge":
      dayCell = "border-primary/20";
      selectedCell = "bg-primary/20 border-primary";
      eventDot = "bg-primary";
      break;
    case "botanical":
      dayCell = "rounded-[1rem]";
      selectedCell = "bg-primary/15 rounded-[1rem]";
      eventDot = "bg-primary rounded-full";
      break;
    case "pulse":
      dayCell = "border-2 border-black/10 rounded-sm";
      selectedCell = "bg-primary border-2 border-black shadow-[2px_2px_0px_#000]";
      eventDot = "bg-black rounded-none w-2 h-2";
      break;
    case "hive":
      dayCell = "border-amber-300/30";
      selectedCell = "bg-primary/20 border-amber-400";
      eventDot = "bg-amber-400";
      break;
    case "lucent":
      dayCell = "backdrop-blur-sm";
      selectedCell = "bg-primary/10 backdrop-blur-md shadow-sm";
      eventDot = "bg-primary/60";
      break;
  }

  return { dayCell, selectedCell, eventDot };
}
