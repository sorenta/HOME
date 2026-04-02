"use client";

import { usePathname } from "next/navigation";

export function ThemeAmbientChrome() {
  const pathname = usePathname();

  if (pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <div className="maj-theme-ambient-shell" aria-hidden>
      <div className="maj-theme-ambient-glow" />
      <div className="maj-theme-ambient-glow maj-theme-ambient-glow--secondary" />
      <div className="maj-theme-ambient-grain" />
    </div>
  );
}
