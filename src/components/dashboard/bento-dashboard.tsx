"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { HouseholdOnboarding } from "@/components/household/household-onboarding";
import { HouseholdSummary } from "@/components/household/household-summary";
import { useAuth } from "@/components/providers/auth-provider";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useTheme } from "@/components/providers/theme-provider";
import {
  getAdaptiveModuleOrder,
  type ModuleId,
} from "@/lib/bento-usage";
import { hapticTap } from "@/lib/haptic";
import {
  dashboardSnapshot,
  householdMembers,
  liveFeed,
  profileSummary,
} from "@/lib/demo-data";
import { useSeasonal } from "@/components/providers/seasonal-provider";
import { HiddenSeasonalCollectible } from "@/components/seasonal/hidden-seasonal-collectible";
import { SeasonalRewardModal } from "@/components/seasonal/seasonal-reward-modal";
import { hasResetCheckInToday } from "@/lib/reset-checkin";
import type { ThemeId } from "@/lib/theme-logic";
import { BentoTile } from "./bento-tile";
import { PeakHolidayCard } from "./peak-holiday-card";
import { SeasonalHomeBanner } from "./seasonal-home-banner";
import { TimeOfDayNoticeCard } from "./time-of-day-notice-card";

type GreetingPeriod = "morning" | "day" | "evening" | "night";
type BottomNavId = "home" | "kitchen" | "finance" | "events" | "profile";

const DEFAULT_ORDER: ModuleId[] = [
  "calendar",
  "finance",
  "reset",
  "kitchen",
  "pharmacy",
  "events",
];

const MODULE_META: Record<
  ModuleId,
  { href: string; titleKey: string; emoji: string; colSpan?: 1 | 2 }
> = {
  calendar: { href: "/calendar", titleKey: "tile.calendar", emoji: "📅" },
  finance: { href: "/finance", titleKey: "tile.finance", emoji: "💰" },
  reset: { href: "/reset", titleKey: "tile.reset", emoji: "🧘" },
  kitchen: {
    href: "/kitchen",
    titleKey: "tile.kitchen",
    emoji: "🍳",
    colSpan: 2,
  },
  pharmacy: { href: "/pharmacy", titleKey: "tile.pharmacy", emoji: "💊" },
  events: { href: "/events", titleKey: "tile.events", emoji: "🎊" },
};

const THEME_NAV_ICONS: Record<BottomNavId, Record<ThemeId, string>> = {
  home: {
    "forest-sunset": "⌂",
    "ocean-depth": "◈",
    "zephyr-soft": "◌",
    "calla-grace": "✦",
    "ember-wood": "⬢",
  },
  kitchen: {
    "forest-sunset": "◨",
    "ocean-depth": "◫",
    "zephyr-soft": "◡",
    "calla-grace": "❀",
    "ember-wood": "▣",
  },
  finance: {
    "forest-sunset": "◎",
    "ocean-depth": "◉",
    "zephyr-soft": "◍",
    "calla-grace": "◌",
    "ember-wood": "◆",
  },
  events: {
    "forest-sunset": "✶",
    "ocean-depth": "✺",
    "zephyr-soft": "✿",
    "calla-grace": "❋",
    "ember-wood": "✦",
  },
  profile: {
    "forest-sunset": "◔",
    "ocean-depth": "◑",
    "zephyr-soft": "◕",
    "calla-grace": "◡",
    "ember-wood": "⬡",
  },
};

function getGreetingPeriod(date: Date): GreetingPeriod {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "day";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}

export function BentoDashboard() {
  const { t } = useI18n();
  const { themeId } = useTheme();
  const { profile, user } = useAuth();
  const { activeTheme } = useSeasonal();
  const [order, setOrder] = useState<ModuleId[]>(DEFAULT_ORDER);
  const [resetDoneToday, setResetDoneToday] = useState(true);
  const [greetingPeriod, setGreetingPeriod] = useState<GreetingPeriod>("day");

  const displayName =
    profile?.display_name ??
    (user?.user_metadata.display_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    t("app.name");
  const greeting = `${t(`dashboard.greeting.${greetingPeriod}`)}, ${displayName}`;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setOrder(getAdaptiveModuleOrder());
      setResetDoneToday(hasResetCheckInToday());
      setGreetingPeriod(getGreetingPeriod(new Date()));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const tiles = useMemo(
    () =>
      order.map((id) => {
        const meta = MODULE_META[id];
        const highlight =
          id === "reset" && !resetDoneToday ? true : undefined;
        return (
          <BentoTile
            key={id}
            themeId={themeId}
            href={meta.href}
            title={t(meta.titleKey)}
            emoji={meta.emoji}
            highlight={highlight}
            colSpan={meta.colSpan ?? 1}
            attention={highlight}
          />
        );
      }),
    [order, resetDoneToday, t, themeId],
  );

  if (!profile?.household_id) {
    return (
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-28 pt-6">
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mb-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-secondary)]">
                {t("app.tagline")}
              </p>
              <h1 className="mt-1 font-[family-name:var(--font-theme-display)] text-3xl font-semibold text-[color:var(--color-text)]">
                {greeting}
              </h1>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-[color:var(--color-secondary)]">
                {t("household.subtitle")}
              </p>
            </div>
            <HiddenSeasonalCollectible spotId="home" />
          </div>
        </motion.header>
        {activeTheme ? <PeakHolidayCard theme={activeTheme} displayName={displayName} /> : null}
        {activeTheme ? <SeasonalHomeBanner theme={activeTheme} /> : null}
        <TimeOfDayNoticeCard />
        <HouseholdOnboarding />
        <SeasonalRewardModal />
      </div>
    );
  }

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-28 pt-6">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-secondary)]">
              {t("app.tagline")}
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-theme-display)] text-3xl font-semibold text-[color:var(--color-text)]">
              {greeting}
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-[color:var(--color-secondary)]">
              {t("dashboard.subtitle")}
            </p>
          </div>
          <HiddenSeasonalCollectible spotId="home" />
        </div>
      </motion.header>

      {activeTheme ? <PeakHolidayCard theme={activeTheme} displayName={displayName} /> : null}
      {activeTheme ? <SeasonalHomeBanner theme={activeTheme} /> : null}
      <TimeOfDayNoticeCard />

      <div className="relative z-10 mb-4">
        <HouseholdSummary householdId={profile.household_id} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative z-10 mb-4 grid grid-cols-3 gap-3"
      >
        <MetricCard
          label={t("dashboard.members")}
          value={householdMembers.length}
        />
        <MetricCard
          label={t("dashboard.pending")}
          value={dashboardSnapshot.pendingCount}
        />
        <MetricCard
          label={t("dashboard.aiReady")}
          value={dashboardSnapshot.aiReady ? "ON" : "OFF"}
        />
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 mb-4 rounded-3xl border border-[color:var(--color-surface-border)] bg-[linear-gradient(180deg,var(--color-surface),transparent)] p-4"
      >
        <SectionHeading
          eyebrow={t("app.household")}
          title={dashboardSnapshot.householdName}
          detail={t("app.realtime")}
        />
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-text)]">
          {dashboardSnapshot.todayFocus}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {householdMembers.map((member) => (
            <StatusPill
              key={member.id}
              tone={
                member.aura === "high"
                  ? "good"
                  : member.aura === "low"
                    ? "critical"
                    : "warn"
              }
            >
              {member.name} · {member.role}
            </StatusPill>
          ))}
          <StatusPill tone={dashboardSnapshot.aiReady ? "good" : "neutral"}>
            {t("app.smartAssistant")}
          </StatusPill>
          {!resetDoneToday ? (
            <StatusPill tone="critical">{t("dashboard.pendingReset")}</StatusPill>
          ) : null}
        </div>
      </motion.section>

      <motion.div layout className="relative z-10 grid grid-cols-2 gap-3">
        {tiles}
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        className="relative z-10 mt-4 rounded-3xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-4"
      >
        <SectionHeading
          eyebrow={t("dashboard.adaptive")}
          title={t("dashboard.focus")}
          detail={profileSummary.streak}
        />
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-text)]">
          {dashboardSnapshot.adaptiveHint}
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="relative z-10 mt-4 rounded-3xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-4"
      >
        <SectionHeading title={t("dashboard.feed")} detail={liveFeed.length.toString()} />
        <div className="mt-3 space-y-3">
          {liveFeed.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[color:var(--color-surface-border)] px-3 py-3"
            >
              <p className="text-sm text-[color:var(--color-text)]">
                <span className="font-semibold">{item.actor}</span> {item.action}{" "}
                <span className="font-medium">{item.target}</span>
              </p>
              <p className="mt-1 text-xs text-[color:var(--color-secondary)]">
                {item.time}
              </p>
            </div>
          ))}
        </div>
      </motion.section>
      <SeasonalRewardModal />
    </div>
  );
}

export function AppBottomNav() {
  const { t } = useI18n();
  const pathname = usePathname();
  const { themeId } = useTheme();

  if (pathname.startsWith("/auth")) {
    return null;
  }

  const navItems = [
    { id: "home" as const, href: "/", label: t("nav.home") },
    { id: "kitchen" as const, href: "/kitchen", label: t("tile.kitchen") },
    { id: "finance" as const, href: "/finance", label: t("tile.finance") },
    { id: "events" as const, href: "/events", label: t("tile.events") },
    { id: "profile" as const, href: "/profile", label: t("nav.profile") },
  ];

  const linkClass = (href: string) => {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return [
      "relative flex min-w-0 flex-1 basis-0 flex-col items-center gap-1 px-2 py-2 text-[0.68rem] font-medium transition-colors",
      active
        ? "text-[color:var(--color-primary)]"
        : "text-[color:var(--color-secondary)]",
    ].join(" ");
  };

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 border-t border-[color:var(--color-surface-border)] bg-[color:var(--color-background)]/95 backdrop-blur-md"
      aria-label="Primary"
    >
      <div className="px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        <div className="flex items-stretch gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => hapticTap()}
              className={linkClass(item.href)}
            >
              {(item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)) ? (
                <motion.span
                  layoutId="maj-bottom-nav-active"
                  className="absolute inset-0 rounded-[var(--theme-chip-radius)] bg-[color:var(--color-surface)]"
                  transition={{ type: "spring", stiffness: 360, damping: 30 }}
                />
              ) : null}
              <motion.span
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="relative z-10 flex flex-col items-center gap-1"
              >
                <span
                  className="flex h-9 w-9 items-center justify-center border text-base"
                  style={{
                    borderRadius: "var(--theme-chip-radius)",
                    borderColor: "var(--color-surface-border)",
                    background:
                      (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href))
                        ? "color-mix(in srgb, var(--color-surface) 88%, transparent)"
                        : "transparent",
                  }}
                  aria-hidden
                >
                  {THEME_NAV_ICONS[item.id][themeId]}
                </span>
                <span>{item.label}</span>
              </motion.span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
