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
    <div className="maj-theme-ambient-shell" aria-hidden style={{ zIndex: 100 }}>
      <div className="maj-theme-ambient-glow" />
      <div className="maj-theme-ambient-glow maj-theme-ambient-glow--secondary" />
      <div className="maj-theme-ambient-grain" />

      {/* Forge: red scan line at top edge */}
      {themeId === "forge" && (
        <div className="absolute inset-x-8 top-0 h-[3px] animate-forge-scan rounded-full bg-primary opacity-90 shadow-[0_0_12px_rgba(225,29,46,0.7),0_0_4px_rgba(255,255,255,0.3)] blur-[0.5px]" />
      )}

      {/* Lucent: floating orb that drifts slowly */}
      {themeId === "lucent" && (
        <>
          <div className="maj-lucent-float-orb" />
          <div className="maj-lucent-silk-veil" />
          <div className="maj-lucent-air-haze" />
        </>
      )}

      {/* Botanical: leaf silhouette overlay */}
      {themeId === "botanical" && (
        <>
          <div className="maj-botanical-leaf-overlay" />
          <div className="maj-botanical-mist" />
          <div className="maj-botanical-treetops" />
        </>
      )}

      {/* Pulse: halftone dot pattern */}
      {themeId === "pulse" && (
        <>
          <div className="maj-pulse-halftone" />
          <div className="maj-pulse-burst" />
          <div className="maj-pulse-ink-shadow" />
        </>
      )}

      {/* Hive: hexagonal CSS pattern + background bees */}
      {themeId === "hive" && (
        <>
          <div className="maj-hive-hex-ambient" />
          <HiveBackground beeCount={1} />
        </>
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
