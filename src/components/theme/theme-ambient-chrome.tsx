"use client";

import { usePathname } from "next/navigation";
import { useSeasonal } from "@/components/providers/seasonal-provider";

const ORBS = [
  "maj-theme-orb maj-theme-orb--one",
  "maj-theme-orb maj-theme-orb--two",
  "maj-theme-orb maj-theme-orb--three",
  "maj-theme-orb maj-theme-orb--four",
  "maj-theme-orb maj-theme-orb--five",
  "maj-theme-orb maj-theme-orb--six",
];

export function ThemeAmbientChrome() {
  const pathname = usePathname();
  const { activeTheme } = useSeasonal();

  if (pathname.startsWith("/auth") || activeTheme) {
    return null;
  }

  return (
    <div className="maj-theme-ambient-shell" aria-hidden>
      {ORBS.map((className) => (
        <div key={className} className={className} />
      ))}
      <div className="maj-theme-ambient-grain" />
    </div>
  );
}
