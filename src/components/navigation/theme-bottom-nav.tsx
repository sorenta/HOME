"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/providers/theme-provider";
import { useI18n } from "@/lib/i18n/i18n-context";
import { hapticTap } from "@/lib/haptic";
import type { ThemeId } from "@/lib/theme-logic";

type BottomNavId = "home" | "calendar" | "kitchen" | "finance" | "pharmacy" | "reset";

export const THEME_NAV_ICONS: Record<
  BottomNavId,
  Record<ThemeId, string>
> = {
  home: { forge: "⬛", canopy: "⌂", pulse: "◆", lucent: "◠", hive: "⬡" },
  calendar: { forge: "✦", canopy: "✿", pulse: "✺", lucent: "✽", hive: "✶" },
  kitchen: { forge: "▣", canopy: "❀", pulse: "▤", lucent: "◍", hive: "◈" },
  finance: { forge: "◆", canopy: "◎", pulse: "◫", lucent: "◌", hive: "◇" },
  pharmacy: { forge: "✚", canopy: "✚", pulse: "✚", lucent: "✚", hive: "✚" },
  reset: { forge: "⬡", canopy: "☽", pulse: "◇", lucent: "◎", hive: "✧" },
};

function useNavState() {
  const { t } = useI18n();
  const pathname = usePathname();
  const { themeId } = useTheme();

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
    if (href === "/events") {
      return pathname.startsWith("/events") || pathname.startsWith("/calendar");
    }
    return pathname.startsWith(href);
  };

  return { themeId, navItems, isActive };
}

/** Dense control strip: equal columns, top accent for active — no floating pill. */
function ForgeBottomNav() {
  const { themeId, navItems, isActive } = useNavState();
  return (
    <nav
      className="maj-forge-bottom-nav fixed bottom-0 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 border-t border-[color:color-mix(in_srgb,var(--color-border)_80%,transparent)]"
      aria-label="Primary"
    >
      <div className="grid grid-cols-6 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-0">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => hapticTap()}
              className={[
                "relative flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 px-0.5 pt-1 text-[0.58rem] font-semibold leading-tight",
                active
                  ? "text-[color:var(--color-primary)]"
                  : "text-[color:var(--color-nav-inactive)]",
              ].join(" ")}
            >
              {active ? (
                <span className="absolute left-1 right-1 top-0 h-0.5 rounded-full bg-[color:var(--color-primary)]" />
              ) : null}
              <span className="text-base leading-none" aria-hidden>
                {THEME_NAV_ICONS[item.id][themeId]}
              </span>
              <span className="max-w-[4.2rem] truncate text-center">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Rounded dock inside the bar — botanical “tray”. */
function CanopyBottomNav() {
  const { themeId, navItems, isActive } = useNavState();
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 bg-gradient-to-t from-[color:var(--color-background)] via-[color:var(--color-background)] to-transparent pt-2"
      aria-label="Primary"
    >
      <div className="px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))]">
        <div className="flex items-stretch justify-between gap-1 rounded-[1.35rem] border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_92%,transparent)] px-1 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => hapticTap()}
                className={[
                  "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-[1rem] px-1 py-1 text-[0.62rem] font-medium",
                  active
                    ? "bg-[color:color-mix(in_srgb,var(--color-accent)_16%,var(--color-surface))] text-[color:var(--color-accent)]"
                    : "text-[color:var(--color-nav-inactive)]",
                ].join(" ")}
              >
                <span className="text-[1.05rem] leading-none" aria-hidden>
                  {THEME_NAV_ICONS[item.id][themeId]}
                </span>
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

/** Poster / brutal: lighter strip — chips stay readable without dominating the canvas. */
function PulseBottomNav() {
  const { themeId, navItems, isActive } = useNavState();
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 border-t border-[color:var(--color-border)] bg-[color:var(--color-nav-background)] shadow-[0_-6px_24px_rgba(43,45,66,0.06)]"
      aria-label="Primary"
    >
      <div className="scrollbar-none flex gap-1.5 overflow-x-auto px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => hapticTap()}
              className={[
                "flex min-w-[3.85rem] shrink-0 flex-col items-center gap-0.5 border border-[color:var(--color-border)] px-1.5 py-1.5 text-[0.6rem] font-bold leading-tight",
                active
                  ? "bg-[color:color-mix(in_srgb,var(--color-border)_88%,var(--color-background))] text-[color:var(--color-background)] shadow-[2px_2px_0_rgba(255,107,107,0.22)]"
                  : "bg-[color:var(--color-surface)] text-[color:var(--color-text-primary)] shadow-[1px_1px_0_rgba(43,45,66,0.08)]",
              ].join(" ")}
              style={{ borderRadius: "var(--radius-button)" }}
            >
              <span className="text-base leading-none" aria-hidden>
                {THEME_NAV_ICONS[item.id][themeId]}
              </span>
              <span className="max-w-[4.5rem] text-center leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** One frosted capsule — single backdrop layer, inset from screen edge. */
function LucentBottomNav() {
  const { themeId, navItems, isActive } = useNavState();
  return (
    <nav
      className="pointer-events-none fixed bottom-3 left-1/2 z-50 w-[min(calc(100%-1.25rem),28rem)] -translate-x-1/2"
      aria-label="Primary"
    >
      <div
        className="pointer-events-auto flex items-stretch gap-0.5 rounded-[2rem] border border-white/45 bg-[color:color-mix(in_srgb,var(--color-nav-background)_88%,transparent)] px-1.5 py-1.5 shadow-[0_12px_40px_rgba(77,49,61,0.12)] backdrop-blur-md"
        style={{ WebkitBackdropFilter: "blur(14px)" }}
      >
        {navItems.map((item) => {
          const act = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => hapticTap()}
              className={[
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-[1.35rem] px-1 py-1.5 text-[0.6rem] font-medium",
                act
                  ? "bg-[color:color-mix(in_srgb,var(--color-primary)_18%,#fff)] text-[color:var(--color-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
                  : "text-[color:var(--color-nav-inactive)]",
              ].join(" ")}
            >
              <span className="text-[1.1rem] leading-none" aria-hidden>
                {THEME_NAV_ICONS[item.id][themeId]}
              </span>
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" aria-hidden />
    </nav>
  );
}

/** Warm modular cells — slimmer rail so content stays primary. */
function HiveBottomNav() {
  const { themeId, navItems, isActive } = useNavState();
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 rounded-t-[1.35rem] border-x border-t border-[color:color-mix(in_srgb,var(--color-accent)_28%,var(--color-border))] bg-[color:var(--color-nav-background)] shadow-[0_-6px_22px_rgba(120,90,40,0.1)]"
      aria-label="Primary"
    >
      <div className="h-0.5 w-full rounded-t-[1.35rem] bg-[color:color-mix(in_srgb,var(--color-accent)_45%,transparent)]" aria-hidden />
      <div className="flex items-stretch justify-between gap-0.5 px-1.5 pb-[max(0.45rem,env(safe-area-inset-bottom))] pt-1.5">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => hapticTap()}
              className={[
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1 text-[0.58rem] font-bold",
                active
                  ? "bg-[color:var(--color-surface)] text-[color:var(--color-primary)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-accent)_38%,transparent)]"
                  : "text-[color:var(--color-nav-inactive)]",
              ].join(" ")}
            >
              <span
                className="flex h-8 w-8 items-center justify-center text-[0.95rem]"
                style={{
                  borderRadius: "30%",
                  background: active
                    ? "color-mix(in srgb, var(--color-accent) 18%, var(--color-surface))"
                    : "transparent",
                }}
                aria-hidden
              >
                {THEME_NAV_ICONS[item.id][themeId]}
              </span>
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function ThemeBottomNav() {
  const pathname = usePathname();
  const { themeId } = useTheme();

  if (pathname.startsWith("/auth")) {
    return null;
  }

  switch (themeId) {
    case "forge":
      return <ForgeBottomNav />;
    case "canopy":
      return <CanopyBottomNav />;
    case "pulse":
      return <PulseBottomNav />;
    case "lucent":
      return <LucentBottomNav />;
    case "hive":
      return <HiveBottomNav />;
    default:
      return <ForgeBottomNav />;
  }
}

/** @deprecated Use ThemeBottomNav — alias for layout imports */
export const AppBottomNav = ThemeBottomNav;
