"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/providers/theme-provider";
import { useI18n } from "@/lib/i18n/i18n-context";
import { hapticTap } from "@/lib/haptic";
import hiveStyles from "@/components/theme/hive.module.css";
import { AppSectionIcon, type AppSectionId } from "@/components/icons";

export function ThemeBottomNav() {
  const { t } = useI18n();
  const pathname = usePathname();
  const { themeId } = useTheme();

  // Nerādām navigāciju autentifikācijas lapā un sandbox wrapper skatā
  if (pathname.startsWith("/auth") || pathname.startsWith("/sandbox")) return null;

  const navItems = [
    { id: "home" as const, href: "/", label: t("nav.home"), sectionId: "home" as AppSectionId },
    { id: "calendar" as const, href: "/events", label: t("tile.calendar"), sectionId: "calendar" as AppSectionId },
    { id: "kitchen" as const, href: "/kitchen", label: t("tile.kitchen"), sectionId: "kitchen" as AppSectionId },
    { id: "finance" as const, href: "/finance", label: t("tile.finance"), sectionId: "finance" as AppSectionId },
    { id: "pharmacy" as const, href: "/pharmacy", label: t("tile.pharmacy"), sectionId: "pharmacy" as AppSectionId },
    { id: "reset" as const, href: "/reset", label: t("tile.reset"), sectionId: "reset" as AppSectionId },
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
    wrapperClass += "bottom-4 w-[calc(100%-2rem)] bg-gradient-to-br from-white/95 to-[#FAF8F5]/95 dark:from-zinc-900/95 dark:to-zinc-950/95 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(220,210,200,0.4)] dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)]";
    innerClass += "px-2 py-2 gap-1";
  } else if (themeId === "hive") {
    wrapperClass += "bottom-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent backdrop-blur-[2px] border-none shadow-none pointer-events-none";
    innerClass += "px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-8 gap-2 pointer-events-auto justify-center max-w-sm mx-auto";
  } else if (themeId === "pulse") {
    wrapperClass += "bottom-4 w-[calc(100%-2rem)] bg-background border-4 border-black shadow-[6px_6px_0px_#000] rounded-xl";
    innerClass += "px-2 py-2 gap-1";
  } else if (themeId === "forge") {
    wrapperClass += "bottom-0 bg-black border-t border-white/10 shadow-[0_-10px_40px_rgba(225,29,46,0.15)]";
    innerClass += "px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 gap-1 relative";
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
          let itemClass = "flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl py-2 transition-all duration-300 ";
          
          if (themeId === "hive") {
            itemClass += "flex-none w-14 h-14 p-0 justify-center gap-0 "; // fixed square for perfect octagon
          } else {
            itemClass += "flex-1 text-xs font-bold "; // standard flex
          }

          // 3. AKTĪVĀS POGAS TĒMAS ODZIŅA
          if (active) {
            if (themeId === "lucent") itemClass += "bg-[#FAF8F5] dark:bg-zinc-800 text-amber-800 dark:text-amber-300 scale-105 font-bold shadow-[0_8px_16px_-6px_rgba(220,210,200,0.6)] dark:shadow-none border border-white/80 dark:border-white/5";
            else if (themeId === "hive") itemClass += `${hiveStyles.hiveOctagon} bg-primary text-primary-foreground scale-110 shadow-md`;
            else if (themeId === "pulse") itemClass += "bg-primary text-primary-foreground border-2 border-black shadow-[2px_2px_0px_#000] -translate-y-1";
            else if (themeId === "forge") itemClass += "text-primary bg-black/50 shadow-inner scale-105";
            else if (themeId === "botanical") itemClass += "organic-shape bg-primary text-primary-foreground scale-110";
          } else {
            if (themeId === "hive") {
              itemClass += "text-foreground/60 font-medium hover:text-foreground hover:bg-foreground/5 ";
            } else {
              itemClass += "text-foreground/50 font-medium hover:text-foreground/80 hover:bg-foreground/5 ";
            }
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => hapticTap()}
              className={`${itemClass} relative group`}
              aria-current={active ? "page" : undefined}
            >
              {/* Lucent: Soft glowing dot above the active icon */}
              {themeId === "lucent" && active && (
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              )}
              {/* Forge: Neon beam behind active icon */}
              {themeId === "forge" && active && (
                <div className="absolute inset-0 z-0 flex items-center justify-center">
                  <div className="h-full w-8 bg-gradient-to-t from-primary/20 via-primary/5 to-transparent blur-md" />
                  <div className="absolute top-0 h-px w-6 bg-primary shadow-[0_0_10px_var(--color-primary)]" />
                </div>
              )}

              <span className="relative z-10 flex min-h-6 items-center justify-center leading-none" aria-hidden>
                <AppSectionIcon
                  sectionId={item.sectionId}
                  themeId={themeId}
                  size={active ? (themeId === "hive" ? 28 : 24) : 22}
                  tone={active ? "active" : "inactive"}
                  className={active && themeId !== "hive" ? "scale-105" : ""}
                />
              </span>
              {!(themeId === "hive" && active) && (
                <span className="max-w-full truncate px-1 text-[0.75rem]">{item.label}</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Saglabājam eksportu saderībai ar pārējo kodu
export const AppBottomNav = ThemeBottomNav;
