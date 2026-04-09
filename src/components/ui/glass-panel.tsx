"use client";

import React, { ReactNode } from "react";
import { useTheme } from "@/components/providers/theme-provider";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export function GlassPanel({ children, className = "", style, ...rest }: Props) {
  const { themeId } = useTheme();

  // Bāzes klases un maģiskais stils katrai tēmai
  let themeClass = "glass-panel bg-card text-card-foreground border border-border rounded-theme p-4 md:p-6";

  if (themeId === "lucent") {
    themeClass = "glass-panel bg-card/60 backdrop-blur-xl border border-border/50 shadow-theme rounded-theme p-4 md:p-6";
  } else if (themeId === "hive") {
    themeClass = "glass-panel bg-card border-4 border-border shadow-sm rounded-theme p-4 md:p-6 relative overflow-hidden";
  } else if (themeId === "pulse") {
    themeClass = "glass-panel bg-background border-4 border-black shadow-[6px_6px_0px_#000] rounded-xl p-4 md:p-6";
  } else if (themeId === "forge") {
    themeClass = "glass-panel metal-gradient border-t-4 border-primary shadow-inner rounded-sm p-4 md:p-6 text-foreground";
  } else if (themeId === "botanical") {
    themeClass = "glass-panel bg-card border border-border shadow-[inset_0_0_20px_rgba(255,255,255,0.3)] rounded-[2.5rem] p-4 md:p-6";
  }

  return (
    <div
      className={`${themeClass} transition-all duration-500 ${className}`}
      style={{
        backgroundColor: "var(--glass-bg, var(--color-surface))",
        borderRadius: "var(--radius-card)",
        borderColor: "var(--color-surface-border)",
        ...style,
      }}
      {...rest}
    >
      {/* Īpašās tēmu dekorācijas konteineriem */}
      {themeId === "hive" && (
        <div className="absolute -right-4 -top-4 w-12 h-12 bg-primary/10 theme-octagon rotate-12 pointer-events-none" />
      )}
      
      <div className="relative z-10">{children}</div>
    </div>
  );
}
