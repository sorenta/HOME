"use client";

import { useTheme } from "@/components/providers/theme-provider";
import type { ReactNode } from "react";

type Props = { children: ReactNode };

/**
 * Theme-specific decorative wrapper for the Reset / Wellness page.
 * Each theme creates a distinct wellness mood atmosphere.
 */
export function ResetThemeLayer({ children }: Props) {
  const { themeId } = useTheme();

  return (
    <div className={`reset-theme-layer maj-theme-page reset-theme--${themeId}`}>
      {/* Base aura elements */}
      <div className={`maj-theme-page-aura maj-theme-page-aura--${themeId}`} aria-hidden />
      <div className={`maj-theme-page-aura maj-theme-page-aura--secondary maj-theme-page-aura--${themeId}`} aria-hidden />
      <div className={`maj-theme-page-pattern maj-theme-page-pattern--${themeId}`} aria-hidden />

      {/* FORGE — Engine heartbeat: red scan + steel glow */}
      {themeId === "forge" && (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-48 opacity-80"
            style={{
              background: "linear-gradient(180deg, rgba(217,31,38,0.10) 0%, transparent 100%)",
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(217,31,38,0.6) 40%, rgba(217,31,38,0.6) 60%, transparent)",
              boxShadow: "0 0 16px rgba(217,31,38,0.4)",
            }}
            aria-hidden
          />
          {/* Vertical steel accent line */}
          <div
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-0.5"
            style={{
              background: "linear-gradient(180deg, rgba(217,31,38,0.5), rgba(217,31,38,0.15) 50%, transparent)",
            }}
            aria-hidden
          />
        </>
      )}

      {/* BOTANICAL — Living garden: vine borders + warm parchment glow */}
      {themeId === "botanical" && (
        <>
          <div
            className="pointer-events-none absolute -left-1 top-10 bottom-10 w-0.75 rounded-full"
            style={{
              background: "linear-gradient(180deg, transparent, rgba(62,107,50,0.35) 30%, rgba(62,107,50,0.5) 60%, transparent)",
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
            style={{
              background: "linear-gradient(0deg, rgba(180,120,60,0.06) 0%, transparent 100%)",
            }}
            aria-hidden
          />
          {/* Leaf accent top-right */}
          <div
            className="pointer-events-none absolute right-4 top-8 text-5xl select-none"
            style={{ opacity: 0.07, color: "var(--color-primary)" }}
            aria-hidden
          >
            🌿
          </div>
        </>
      )}

      {/* PULSE — Neobrutalist: corner brackets + outer shadow */}
      {themeId === "pulse" && (
        <>
          <div
            className="pointer-events-none absolute inset-3 -z-10 rounded-2xl"
            style={{
              border: "2px dashed rgba(0,0,0,0.06)",
              transform: "translate(3px, 3px)",
            }}
            aria-hidden
          />
          {/* Top band */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-1.5"
            style={{ background: "var(--color-primary)" }}
            aria-hidden
          />
        </>
      )}

      {/* HIVE — Wabi-Sabi amber: honeycomb atmosphere */}
      {themeId === "hive" && (
        <>
          <div
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-8 select-none text-[14rem] leading-none font-black"
            style={{ color: "rgba(217,119,6,0.04)" }}
            aria-hidden
          >
            ⬡
          </div>
          <div
            className="pointer-events-none absolute right-0 bottom-0 select-none text-[8rem] leading-none font-black"
            style={{ color: "rgba(217,119,6,0.03)" }}
            aria-hidden
          >
            ⬡
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
            style={{ background: "linear-gradient(0deg, rgba(217,119,6,0.04) 0%, transparent 100%)" }}
            aria-hidden
          />
        </>
      )}

      {/* LUCENT — Quiet luxury: dreamy pearl glow */}
      {themeId === "lucent" && (
        <>
          <div
            className="pointer-events-none absolute left-1/2 top-16 -translate-x-1/2 rounded-full"
            style={{
              width: "320px",
              height: "220px",
              background: "radial-gradient(ellipse, rgba(184,150,106,0.08) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute right-8 bottom-24 rounded-full"
            style={{
              width: "160px",
              height: "160px",
              background: "radial-gradient(ellipse, rgba(216,234,239,0.12) 0%, transparent 70%)",
              filter: "blur(30px)",
            }}
            aria-hidden
          />
        </>
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
