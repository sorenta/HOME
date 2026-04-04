"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "@/components/providers/theme-provider";
import HiveBackground from "@/components/theme/hive-background";

export function ThemeAmbientChrome() {
  const pathname = usePathname();
  const { themeId } = useTheme();

  if (pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <div className="maj-theme-ambient-shell" aria-hidden>
      <div className="maj-theme-ambient-glow" />
      <div className="maj-theme-ambient-glow maj-theme-ambient-glow--secondary" />
      <div className="maj-theme-ambient-grain" />

      {/* Forge: red scan line at top edge */}
      {themeId === "forge" && (
        <div className="absolute inset-x-0 top-0 h-px animate-forge-scan bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-30" />
      )}

      {/* Lucent: floating orb that drifts slowly */}
      {themeId === "lucent" && (
        <div className="maj-lucent-float-orb" />
      )}

      {/* Botanical: leaf silhouette overlay */}
      {themeId === "botanical" && (
        <div className="maj-botanical-leaf-overlay" />
      )}

      {/* Pulse: halftone dot pattern */}
      {themeId === "pulse" && (
        <div className="maj-pulse-halftone" />
      )}

      {/* Hive: background bees (only for hive theme) */}
      {themeId === "hive" && (
        <HiveBackground beeCount={5} navSelector="header" />
      )}
      {themeId === "hive" && (
        <style dangerouslySetInnerHTML={{ __html: `
          /* Hive-only: make all bento tiles hexagonal */
          :root[data-theme="hive"] .bento-tile {
            clip-path: polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%);
            overflow: hidden;
          }
        ` }} />
      )}
    </div>
  );
}
