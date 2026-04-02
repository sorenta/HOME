"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { HouseholdOnboarding } from "@/components/household/household-onboarding";
import { HouseholdSummary } from "@/components/household/household-summary";
import { useAuth } from "@/components/providers/auth-provider";
import {
  buildHouseholdActivityFeed,
  fetchHouseholdActivityFeed,
  subscribeHouseholdActivity,
  type ActivityFeedRow,
} from "@/lib/household-activity";
import {
  fetchMyHouseholdMembers,
  fetchMyHouseholdSummary,
  type Household,
  type HouseholdMember,
} from "@/lib/household";
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
import { hasResetCheckInToday } from "@/lib/reset-checkin";
import type { ThemeId } from "@/lib/theme-logic";
import { getGeminiKeyFromStorage, getOpenAIKeyFromStorage } from "@/lib/ai/keys";
import { fetchOpenHouseholdTaskCount } from "@/lib/events-sync";
import { BentoTile } from "./bento-tile";
import { AppMark } from "@/components/branding/app-mark";
import { HouseholdWaterWidget } from "./household-water-widget";
import { TimeOfDayNoticeCard } from "./time-of-day-notice-card";

type GreetingPeriod = "morning" | "day" | "evening" | "night";
type BottomNavId = "home" | "calendar" | "kitchen" | "finance" | "pharmacy" | "reset";

const DEFAULT_ORDER: ModuleId[] = [
  "calendar",
  "kitchen",
  "finance",
  "reset",
  "pharmacy",
];

const MODULE_META: Record<
  ModuleId,
  { href: string; titleKey: string; emoji: string; colSpan?: 1 | 2 }
> = {
  calendar: { href: "/events", titleKey: "tile.calendar", emoji: "📅" },
  finance: { href: "/finance", titleKey: "tile.finance", emoji: "💰" },
  reset: { href: "/reset", titleKey: "tile.reset", emoji: "🧘" },
  kitchen: {
    href: "/kitchen",
    titleKey: "tile.kitchen",
    emoji: "🍳",
    colSpan: 2,
  },
  pharmacy: { href: "/pharmacy", titleKey: "tile.pharmacy", emoji: "💊" },
};

const THEME_NAV_ICONS: Record<BottomNavId, Record<ThemeId, string>> = {
  home: {
    forge: "⬛",
    canopy: "⌂",
    pulse: "◆",
    lucent: "◠",
    hive: "⬡",
  },
  calendar: {
    forge: "✦",
    canopy: "✿",
    pulse: "✺",
    lucent: "✽",
    hive: "✶",
  },
  kitchen: {
    forge: "▣",
    canopy: "❀",
    pulse: "▤",
    lucent: "◍",
    hive: "◈",
  },
  finance: {
    forge: "◆",
    canopy: "◎",
    pulse: "◫",
    lucent: "◌",
    hive: "◇",
  },
  pharmacy: {
    forge: "✚",
    canopy: "✚",
    pulse: "✚",
    lucent: "✚",
    hive: "✚",
  },
  reset: {
    forge: "⬡",
    canopy: "☽",
    pulse: "◇",
    lucent: "◎",
    hive: "✧",
  },
};

function memberInitials(name: string | null | undefined): string {
  const trimmed = name?.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]?.[0];
    const b = parts[1]?.[0];
    if (a && b) return `${a}${b}`.toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

function getGreetingPeriod(date: Date): GreetingPeriod {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "day";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}

export function BentoDashboard() {
  const { t, locale } = useI18n();
  const { themeId } = useTheme();
  const { profile, user } = useAuth();
  const [order, setOrder] = useState<ModuleId[]>(DEFAULT_ORDER);
  const [resetDoneToday, setResetDoneToday] = useState(true);
  const [greetingPeriod, setGreetingPeriod] = useState<GreetingPeriod>("day");
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [activityRows, setActivityRows] = useState<ActivityFeedRow[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [aiReady, setAiReady] = useState(false);

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
      setAiReady(Boolean(getGeminiKeyFromStorage() || getOpenAIKeyFromStorage()));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let alive = true;

    const loadHousehold = async () => {
      const [nextHousehold, nextMembers] = await Promise.all([
        fetchMyHouseholdSummary(),
        fetchMyHouseholdMembers(),
      ]);

      if (!alive) return;
      setHousehold(nextHousehold);
      setMembers(nextMembers);
    };

    void loadHousehold();

    return () => {
      alive = false;
    };
  }, [profile?.household_id]);

  useEffect(() => {
    let alive = true;
    void fetchOpenHouseholdTaskCount(profile?.household_id ?? null).then((next) => {
      if (alive) {
        setPendingCount(next);
      }
    });
    return () => {
      alive = false;
    };
  }, [profile?.household_id]);

  useEffect(() => {
    const householdId = profile?.household_id;
    if (!householdId) return;

    let alive = true;

    const loadActivity = async () => {
      const rows = await fetchHouseholdActivityFeed(householdId);
      if (!alive) return;
      setActivityRows(rows);
    };

    void loadActivity();
    const unsubscribe = subscribeHouseholdActivity(householdId, () => {
      void loadActivity();
    });

    return () => {
      alive = false;
      unsubscribe?.();
    };
  }, [profile?.household_id]);

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

  const homeFeed = useMemo(
    () =>
      buildHouseholdActivityFeed(
        activityRows,
        members,
        locale,
        t("household.membersList.member"),
      ),
    [activityRows, members, locale, t],
  );
  const headerSubtitle = household?.name
    ? `${household.name} · ${t("dashboard.subtitle")}`
    : t("dashboard.subtitle");
  const waterScopeId = household?.id ?? (user?.id ? `personal:${user.id}` : "personal:guest");

  if (!profile?.household_id) {
    return (
      <div className="maj-dashboard-root maj-page-shell relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden">
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="maj-section-gap relative z-10"
        >
          <div>
            <div className="flex items-center gap-2">
              <AppMark size="sm" />
            </div>
            <h1 className="maj-theme-hero-title mt-1 text-[color:var(--color-text-primary)]">
              {greeting}
            </h1>
            <p className="maj-theme-subtitle mt-2 max-w-sm text-sm">
              {t("household.subtitle")}
            </p>
          </div>
        </motion.header>
        <TimeOfDayNoticeCard />
        <HouseholdOnboarding />
      </div>
    );
  }

  return (
    <div className="maj-dashboard-root maj-page-shell relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="maj-section-gap relative z-10"
      >
        <div>
          <div className="flex items-center gap-2">
            <AppMark size="sm" />
          </div>
          <h1 className="maj-theme-hero-title mt-1 text-[color:var(--color-text-primary)]">
            {greeting}
          </h1>
          <p className="maj-theme-subtitle mt-2 max-w-sm text-sm">{headerSubtitle}</p>
        </div>
      </motion.header>

      <TimeOfDayNoticeCard />

      <div className="maj-section-gap relative z-10">
        <HouseholdSummary householdId={profile.household_id} />
      </div>

      <HouseholdWaterWidget
        scopeId={waterScopeId}
        members={members}
        currentUserId={user?.id ?? null}
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="maj-dashboard-metrics maj-section-gap relative z-10"
      >
        <MetricCard
          label={t("dashboard.members")}
          value={members.length || household?.member_count || 0}
        />
        <MetricCard
          label={t("dashboard.pending")}
          value={pendingCount}
        />
        <MetricCard
          label={t("dashboard.aiReady")}
          value={aiReady ? "ON" : "OFF"}
        />
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="maj-glass-panel maj-section-gap relative z-10 p-[length:var(--maj-space-card-pad)]"
      >
        <SectionHeading
          eyebrow={t("app.household")}
          title={household?.name ?? t("app.household")}
          detail={t("app.realtime")}
        />
        <p className="maj-theme-subtitle mt-3 text-sm text-[color:var(--color-text-primary)]">
          {t("dashboard.householdHint")}
        </p>
        <div className="mt-4 flex flex-wrap gap-[var(--maj-space-stack)]">
          <StatusPill tone={aiReady ? "good" : "neutral"}>
            {t("app.smartAssistant")}
          </StatusPill>
          {!resetDoneToday ? (
            <StatusPill tone="critical">{t("dashboard.pendingReset")}</StatusPill>
          ) : (
            <StatusPill tone="good">{t("dashboard.resetOk")}</StatusPill>
          )}
        </div>
        <div className="maj-bento-grid mt-4 grid sm:grid-cols-2">
          {members.length === 0 ? (
            <p className="text-sm text-[color:var(--color-secondary)] sm:col-span-2">
              {t("household.membersList.empty")}
            </p>
          ) : (
            members.map((member) => {
              const label = member.display_name ?? t("household.membersList.member");
              return (
                <div
                  key={member.id}
                  className="maj-nested-surface flex items-start gap-3 px-3 py-3"
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] text-sm font-semibold tracking-tight text-[color:var(--color-primary)]"
                    style={{
                      background:
                        "color-mix(in srgb, var(--color-primary) 14%, var(--color-surface))",
                    }}
                    aria-hidden
                  >
                    {memberInitials(label)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-[family-name:var(--font-theme-display)] font-semibold text-[color:var(--color-text-primary)]">
                        {label}
                      </p>
                      {member.is_me ? (
                        <StatusPill tone="neutral">{t("household.membersList.you")}</StatusPill>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-sm text-[color:var(--color-secondary)]">
                      {member.role_label ?? t("household.membersList.member")}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.section>

      <motion.div layout className="maj-dashboard-modules relative z-10">
        {tiles}
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        className="maj-dashboard-feed maj-surface-panel maj-section-gap relative z-10 mt-[length:var(--maj-space-section-y)]"
      >
        <SectionHeading
          title={t("dashboard.feed")}
          detail={t("dashboard.feedLive")}
        />
        <p className="maj-theme-subtitle mt-1 text-xs text-[color:var(--color-text-secondary)]">
          {t("dashboard.feedHint")}
        </p>
        <div className="mt-3 space-y-[var(--maj-space-stack)]">
          {homeFeed.map((item) => (
            <div
              key={item.id}
              className="maj-nested-surface px-3 py-3"
            >
              <p className="text-sm leading-snug text-[color:var(--color-text)]">{item.line}</p>
              <div className="mt-2 flex items-center gap-2">
                <p className="text-xs text-[color:var(--color-secondary)]">{item.time}</p>
                {item.source === "db" ? (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500/80" title="Realtime" />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </motion.section>
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

  const linkClass = (href: string) => {
    const active = isActive(href);
    return [
      "relative flex min-w-[4.75rem] shrink-0 flex-col items-center gap-1 px-2 py-2 font-[family-name:var(--font-theme-sans)] text-[0.68rem] font-medium transition-colors",
      active
        ? "text-[color:var(--color-primary)]"
        : "text-[color:var(--color-secondary)]",
    ].join(" ");
  };

  return (
    <nav
      className="maj-bottom-nav fixed bottom-0 left-1/2 z-50 w-full max-w-lg -translate-x-1/2"
      aria-label="Primary"
    >
      <div className="px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        <div className="flex items-stretch gap-1 overflow-x-auto pb-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => hapticTap()}
              className={linkClass(item.href)}
            >
              {isActive(item.href) ? (
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
                      isActive(item.href)
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
