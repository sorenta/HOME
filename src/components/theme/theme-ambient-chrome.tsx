"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "@/components/providers/theme-provider";

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

      {/* Forge: secondary red scan line at top edge */}
      {themeId === "forge" && (
        <div className="absolute inset-x-0 top-0 h-px animate-forge-scan bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-30" />
      )}
    </div>
  );
}
