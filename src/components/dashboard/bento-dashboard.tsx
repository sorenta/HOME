"use client";

import { motion } from "framer-motion";
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
import { StatusPill } from "@/components/ui/status-pill";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useTheme } from "@/components/providers/theme-provider";
import {
  getAdaptiveModuleOrder,
  type ModuleId,
} from "@/lib/bento-usage";
import { hasResetCheckInToday } from "@/lib/reset-checkin";
import { getGeminiKeyFromStorage, getOpenAIKeyFromStorage } from "@/lib/ai/keys";
import { fetchOpenHouseholdTaskCount } from "@/lib/events-sync";
import { BentoTile, type BentoTileTier } from "./bento-tile";
import { AppMark } from "@/components/branding/app-mark";
import { DashboardHomeLayout } from "@/components/dashboard/dashboard-home-layout";
import { HouseholdWaterWidget } from "./household-water-widget";
import { TimeOfDayNoticeCard } from "./time-of-day-notice-card";

export { ThemeBottomNav as AppBottomNav } from "@/components/navigation/theme-bottom-nav";

type GreetingPeriod = "morning" | "day" | "evening" | "night";

const DEFAULT_ORDER: ModuleId[] = [
  "calendar",
  "kitchen",
  "finance",
  "reset",
  "pharmacy",
];

const MODULE_META: Record<
  ModuleId,
  { href: string; titleKey: string; emoji: string; colSpan?: 1 | 2; tier: BentoTileTier }
> = {
  calendar: { href: "/events", titleKey: "tile.calendar", emoji: "📅", tier: "featured" },
  finance: { href: "/finance", titleKey: "tile.finance", emoji: "💰", tier: "compact" },
  reset: { href: "/reset", titleKey: "tile.reset", emoji: "🧘", tier: "compact" },
  kitchen: {
    href: "/kitchen",
    titleKey: "tile.kitchen",
    emoji: "🍳",
    colSpan: 2,
    tier: "featured",
  },
  pharmacy: { href: "/pharmacy", titleKey: "tile.pharmacy", emoji: "💊", tier: "compact" },
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
            tier={meta.tier}
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

  const metricsSlot = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="maj-dashboard-metrics maj-dashboard-metrics--split relative z-10"
    >
      <div className="maj-dashboard-metrics-pair">
        <MetricCard
          variant="compact"
          label={t("dashboard.members")}
          value={members.length || household?.member_count || 0}
        />
        <MetricCard variant="compact" label={t("dashboard.pending")} value={pendingCount} />
      </div>
      <MetricCard
        variant="emphasis"
        label={t("dashboard.aiReady")}
        value={aiReady ? "ON" : "OFF"}
      />
    </motion.div>
  );

  const householdPanelSlot = (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`maj-panel-lite maj-shell-household maj-shell-household--${themeId} relative z-10`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="maj-theme-section-title">{t("household.members")}</h2>
        <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-[color:var(--color-text-secondary)]">
          {t("app.realtime")}
        </span>
      </div>
      <ul className="maj-divider-list mt-3">
        {members.length === 0 ? (
          <li className="maj-divider-list-item border-none py-1 text-sm text-[color:var(--color-secondary)]">
            {t("household.membersList.empty")}
          </li>
        ) : (
          members.map((member) => {
            const label = member.display_name ?? t("household.membersList.member");
            return (
              <li key={member.id} className="maj-divider-list-item">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-button)] text-xs font-semibold tracking-tight text-[color:var(--color-primary)]"
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
                      <p className="font-[family-name:var(--font-theme-display)] text-sm font-semibold text-[color:var(--color-text-primary)]">
                        {label}
                      </p>
                      {member.is_me ? (
                        <StatusPill tone="neutral">{t("household.membersList.you")}</StatusPill>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-xs text-[color:var(--color-secondary)]">
                      {member.role_label ?? t("household.membersList.member")}
                    </p>
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2 border-t border-[color:color-mix(in_srgb,var(--color-border)_80%,transparent)] pt-3">
        <StatusPill tone={aiReady ? "good" : "neutral"}>{t("app.smartAssistant")}</StatusPill>
        {!resetDoneToday ? (
          <StatusPill tone="critical">{t("dashboard.pendingReset")}</StatusPill>
        ) : (
          <StatusPill tone="good">{t("dashboard.resetOk")}</StatusPill>
        )}
      </div>
    </motion.section>
  );

  const modulesSlot = (
    <motion.div
      layout={themeId !== "lucent"}
      className="maj-dashboard-modules relative z-10"
    >
      {tiles}
    </motion.div>
  );

  const feedSlot = (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14 }}
      className={`maj-dashboard-feed maj-panel-lite maj-feed-shell maj-shell-feed maj-shell-feed--${themeId} relative z-10 mt-[length:var(--maj-space-section-y)]`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="maj-theme-section-title">{t("dashboard.feed")}</h2>
        <span className="text-[0.68rem] font-medium text-[color:var(--color-text-secondary)]">
          {t("dashboard.feedLive")}
        </span>
      </div>
      <p className="maj-theme-subtitle mt-1 text-xs text-[color:var(--color-text-secondary)]">
        {t("dashboard.feedHint")}
      </p>
      <ul className="maj-feed-timeline mt-3">
        {homeFeed.map((item) => (
          <li key={item.id} className="maj-feed-timeline-item">
            <span className="maj-feed-timeline-dot" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug text-[color:var(--color-text)]">{item.line}</p>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-xs text-[color:var(--color-secondary)]">{item.time}</p>
                {item.source === "db" ? (
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500/80"
                    title="Realtime"
                  />
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </motion.section>
  );

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

  const headerSlot = (
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
  );

  return (
    <div className="maj-dashboard-root maj-page-shell relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden">
      <DashboardHomeLayout
        themeId={themeId}
        slots={{
          header: headerSlot,
          notice: <TimeOfDayNoticeCard />,
          householdSummary: (
            <div className="relative z-10">
              <HouseholdSummary householdId={profile.household_id} density="compact" />
            </div>
          ),
          water: (
            <HouseholdWaterWidget
              scopeId={waterScopeId}
              members={members}
              currentUserId={user?.id ?? null}
            />
          ),
          metrics: metricsSlot,
          householdPanel: householdPanelSlot,
          modules: modulesSlot,
          feed: feedSlot,
        }}
      />
    </div>
  );
}
