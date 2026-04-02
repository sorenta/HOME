"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/providers/theme-provider";
import { useI18n } from "@/lib/i18n/i18n-context";
import { hapticTap } from "@/lib/haptic";
import type { ThemeId } from "@/lib/theme-logic";

type BottomNavId = "home" | "calendar" | "kitchen" | "finance" | "pharmacy" | "reset";

// Ikonas katrai tēmai (canopy aizvietots ar botanical)
export const THEME_NAV_ICONS: Record<BottomNavId, Record<ThemeId, string>> = {
  home: { forge: "⬛", botanical: "⌂", pulse: "◆", lucent: "☁", hive: "⬡" },
  calendar: { forge: "✦", botanical: "✿", pulse: "✺", lucent: "✽", hive: "✶" },
  kitchen: { forge: "▣", botanical: "❀", pulse: "▤", lucent: "◍", hive: "◈" },
  finance: { forge: "◆", botanical: "◎", pulse: "◫", lucent: "◌", hive: "◇" },
  pharmacy: { forge: "✚", botanical: "✚", pulse: "✚", lucent: "✚", hive: "✚" },
  reset: { forge: "⬡", botanical: "☽", pulse: "◇", lucent: "◎", hive: "✧" },
};

export function ThemeBottomNav() {
  const { t } = useI18n();
  const pathname = usePathname();
  const { themeId } = useTheme();

  // Nerādām navigāciju autentifikācijas lapā
  if (pathname.startsWith("/auth")) return null;

  const navItems = [
    { id: "home" as const, href: "/", label: t("nav.home") },
    { id: "calendar" as const, href: "/events", label: t("tile.calendar") },
    { id: "kitchen" as const, href: "/kitchen", label: t("tile.kitchen") },
    { id: "finance" as const, href: "/finance", label: t("tile.finance") },
    { id: "pharmacy" as const, href: "/pharmacy", label: t("tile.pharmacy") },
    { id: "reset" as const, href: "/reset", label: t("tile.reset") },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/events") return pathname.startsWith("/events") || pathname.startsWith("/calendar");
    return pathname.startsWith(href);
  };

  // 1. GUDRAIS KONTEINERS (Maina formu atkarībā no tēmas)
  let wrapperClass = "fixed w-full max-w-lg left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ";
  let innerClass = "flex items-center justify-between ";

  if (themeId === "lucent") {
    wrapperClass += "bottom-4 w-[calc(100%-2rem)] bg-card/60 backdrop-blur-xl border border-border/50 rounded-[2rem] shadow-theme";
    innerClass += "px-2 py-2 gap-1";
  } else if (themeId === "hive") {
    wrapperClass += "bottom-0 bg-background border-t-4 border-border shadow-[0_-4px_10px_rgba(0,0,0,0.05)]";
    innerClass += "px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 gap-1";
  } else if (themeId === "pulse") {
    wrapperClass += "bottom-4 w-[calc(100%-2rem)] bg-background border-4 border-black shadow-[6px_6px_0px_#000] rounded-xl";
    innerClass += "px-2 py-2 gap-1";
  } else if (themeId === "forge") {
    wrapperClass += "bottom-0 metal-gradient border-t-4 border-primary shadow-[0_-10px_30px_rgba(220,38,38,0.1)]";
    innerClass += "px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 gap-1";
  } else if (themeId === "botanical") {
    wrapperClass += "bottom-4 w-[calc(100%-2rem)] bg-card border border-border shadow-[inset_0_0_20px_rgba(255,255,255,0.3)] rounded-[3rem]";
    innerClass += "px-2 py-2 gap-1";
  }

  return (
    <nav className={wrapperClass} aria-label="Primary Navigation">
      <div className={innerClass}>
        {navItems.map((item) => {
          const active = isActive(item.href);
          
          // 2. BĀZES POGAS DIZAINS
          let itemClass = "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[0.65rem] font-bold transition-all duration-300 ";
          
          // 3. AKTĪVĀS POGAS TĒMAS ODZIŅA
          if (active) {
            if (themeId === "lucent") itemClass += "bg-primary/20 text-foreground shadow-inner scale-105";
            else if (themeId === "hive") itemClass += "octagon bg-primary text-primary-foreground scale-110 shadow-md";
            else if (themeId === "pulse") itemClass += "bg-primary text-primary-foreground border-2 border-black shadow-[2px_2px_0px_#000] -translate-y-1";
            else if (themeId === "forge") itemClass += "text-primary bg-black/50 shadow-inner scale-105";
            else if (themeId === "botanical") itemClass += "organic-shape bg-primary text-primary-foreground scale-110";
          } else {
            itemClass += "text-foreground/60 hover:text-foreground hover:bg-foreground/5";
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => hapticTap()}
              className={itemClass}
            >
              <span className="text-xl leading-none mb-0.5" aria-hidden>
                {THEME_NAV_ICONS[item.id][themeId]}
              </span>
              <span className="max-w-full truncate px-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Saglabājam eksportu saderībai ar pārējo kodu
export const AppBottomNav = ThemeBottomNav;