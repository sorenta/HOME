"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState, type ReactNode } from "react";
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
import { ThemeId } from "@/lib/theme-logic";

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
  settings: { href: "/settings", titleKey: "tile.settings", emoji: "⚙️", tier: "compact" },
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

// MAĢISKAIS PANEĻU STILOTĀJS (Piešķir tēmas identitāti lielajiem blokiem)
function getThemePanelClass(themeId: ThemeId) {
  const base = "bg-card text-card-foreground rounded-theme p-4 relative overflow-hidden transition-all duration-500 flex flex-col gap-3";
  if (themeId === "lucent") return `${base} border border-border/50 backdrop-blur-md shadow-theme`;
  if (themeId === "hive") return `${base} border-4 border-border shadow-sm`;
  if (themeId === "pulse") return `${base} border-4 border-black shadow-[6px_6px_0px_#000]`;
  if (themeId === "forge") return `${base} metal-gradient border-t-4 border-primary shadow-inner`;
  if (themeId === "botanical") return `${base} border border-border shadow-[inset_0_0_20px_rgba(255,255,255,0.3)]`;
  return `${base} border border-border`;
}

type DashboardCardProps = {
  title: string;
  badge?: string;
  children: ReactNode;
  className?: string;
};

function DashboardCard({ title, badge, children, className }: DashboardCardProps) {
  return (
    <section
      className={[
        "rounded-[1.1rem] border border-border/60 bg-background/70 p-4 shadow-[0_10px_35px_-25px_rgba(10,34,16,0.45)] backdrop-blur-sm",
        className ?? "",
      ].join(" ")}
    >
      <header className="mb-3 flex items-center justify-between gap-2 border-b border-border/40 pb-2">
        <h2 className="text-sm font-semibold tracking-wide text-foreground/90">{title}</h2>
        {badge ? (
          <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
            {badge}
          </span>
        ) : null}
      </header>
      {children}
    </section>
  );
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
    return () => { alive = false; };
  }, [profile?.household_id]);

  useEffect(() => {
    let alive = true;
    void fetchOpenHouseholdTaskCount(profile?.household_id ?? null).then((next) => {
      if (alive) setPendingCount(next);
    });
    return () => { alive = false; };
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
        const highlight = id === "reset" && !resetDoneToday ? true : undefined;
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
    () => buildHouseholdActivityFeed(activityRows, members, locale, t("household.membersList.member")),
    [activityRows, members, locale, t],
  );
  
  const headerSubtitle = household?.name
    ? `${household.name} • ${t("dashboard.subtitle")}`
    : t("dashboard.subtitle");
  const waterScopeId = household?.id ?? (user?.id ? `personal:${user.id}` : "personal:guest");

  const panelThemeClasses = getThemePanelClass(themeId);

  const metricsSlot = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="flex flex-col gap-3 relative z-10"
    >
      <div className="grid grid-cols-2 gap-3">
        <MetricCard variant="compact" label={t("dashboard.members")} value={members.length || household?.member_count || 0} />
        <MetricCard variant="compact" label={t("dashboard.pending")} value={pendingCount} />
      </div>
      <MetricCard variant="emphasis" label={t("dashboard.aiReady")} value={aiReady ? "ON" : "OFF"} />
    </motion.div>
  );

  const botanicalHouseholdPanelSlot = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid gap-3 sm:grid-cols-2"
    >
      <DashboardCard title={t("household.members")} badge={t("app.realtime")}>
        <ul className="flex flex-col gap-2">
          {members.length === 0 ? (
            <li className="text-sm italic text-foreground/50">{t("household.membersList.empty")}</li>
          ) : (
            members.slice(0, 4).map((member) => {
              const label = member.display_name ?? t("household.membersList.member");
              return (
                <li key={member.id} className="flex items-center gap-3 rounded-xl border border-border/40 bg-background/50 p-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                    {memberInitials(label)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{label}</p>
                    <p className="text-[11px] text-foreground/60">{member.role_label ?? t("household.membersList.member")}</p>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </DashboardCard>
      <DashboardCard title={t("dashboard.pending")} badge={t("app.smartAssistant")}>
        <div className="flex flex-wrap gap-2">
          <StatusPill tone={aiReady ? "good" : "neutral"}>{t("dashboard.aiReady")}</StatusPill>
          {!resetDoneToday ? (
            <StatusPill tone="critical">{t("dashboard.pendingReset")}</StatusPill>
          ) : (
            <StatusPill tone="good">{t("dashboard.resetOk")}</StatusPill>
          )}
          <StatusPill tone="neutral">{`${t("dashboard.members")}: ${members.length || household?.member_count || 0}`}</StatusPill>
        </div>
      </DashboardCard>
    </motion.div>
  );

  const defaultHouseholdPanelSlot = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid gap-3 sm:grid-cols-2"
    >
      <section className={`${panelThemeClasses} z-10`}>
        <div className="flex items-center justify-between border-b border-border/50 pb-2">
          <h2 className="text-base font-bold tracking-wide">{t("household.members")}</h2>
          <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded-full">
            {t("app.realtime")}
          </span>
        </div>
        <ul className="flex flex-col gap-2 pt-2">
          {members.length === 0 ? (
            <li className="text-sm text-foreground/50 italic">{t("household.membersList.empty")}</li>
          ) : (
            members.slice(0, 4).map((member) => {
              const label = member.display_name ?? t("household.membersList.member");
              return (
                <li key={member.id} className="flex items-center gap-3 bg-background/50 p-2.5 rounded-xl border border-border/30">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs">
                    {memberInitials(label)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{label}</p>
                      {member.is_me && <span className="text-[10px] bg-foreground/10 px-2 py-0.5 rounded-md uppercase font-bold text-foreground/70">{t("household.membersList.you")}</span>}
                    </div>
                    <p className="text-xs text-foreground/60 mt-0.5">{member.role_label ?? t("household.membersList.member")}</p>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </section>
      <section className={`${panelThemeClasses} z-10`}>
        <div className="flex items-center justify-between border-b border-border/50 pb-2">
          <h2 className="text-base font-bold tracking-wide">{t("dashboard.pending")}</h2>
          <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded-full">
            {t("app.smartAssistant")}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 pt-3">
          <StatusPill tone={aiReady ? "good" : "neutral"}>{t("dashboard.aiReady")}</StatusPill>
          {!resetDoneToday ? (
            <StatusPill tone="critical">{t("dashboard.pendingReset")}</StatusPill>
          ) : (
            <StatusPill tone="good">{t("dashboard.resetOk")}</StatusPill>
          )}
          <StatusPill tone="neutral">{`${t("dashboard.members")}: ${members.length || household?.member_count || 0}`}</StatusPill>
        </div>
      </section>
    </motion.div>
  );

  const modulesSlot = (
    <motion.div layout={themeId !== "lucent"} className="grid grid-cols-2 gap-3 relative z-10 my-2">
      {tiles}
    </motion.div>
  );

  const botanicalFeedSlot = (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14 }}
      className="grid gap-3 sm:grid-cols-2"
    >
      {homeFeed.length === 0 ? (
        <DashboardCard title={t("dashboard.feed")}>
          <p className="text-sm text-foreground/60">{t("household.membersList.empty")}</p>
        </DashboardCard>
      ) : (
        homeFeed.slice(0, 4).map((item) => (
          <DashboardCard key={item.id} title={item.time} badge={item.source === "db" ? t("dashboard.feedLive") : undefined}>
            <p className="text-sm font-medium">{item.line}</p>
          </DashboardCard>
        ))
      )}
    </motion.section>
  );

  const defaultFeedSlot = (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14 }}
      className="grid gap-3 sm:grid-cols-2"
    >
      {homeFeed.length === 0 ? (
        <section className={`${panelThemeClasses} z-10`}>
          <p className="text-sm text-foreground/60">{t("household.membersList.empty")}</p>
        </section>
      ) : (
        homeFeed.slice(0, 4).map((item) => (
          <section key={item.id} className={`${panelThemeClasses} z-10`}>
            <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
              <p className="text-xs text-foreground/60 font-mono">{item.time}</p>
              {item.source === "db" ? (
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  {t("dashboard.feedLive")}
                </span>
              ) : null}
            </div>
            <p className="text-sm font-medium pt-2">{item.line}</p>
          </section>
        ))
      )}
    </motion.section>
  );

  if (!profile?.household_id) {
    return (
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden p-4 gap-4">
        <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <AppMark size="sm" />
          <h1 className="text-3xl font-black mt-4 text-foreground tracking-tight">{greeting}</h1>
          <p className="text-foreground/70 mt-2 max-w-sm text-sm">{t("household.subtitle")}</p>
        </motion.header>
        <TimeOfDayNoticeCard />
        <HouseholdOnboarding />
      </div>
    );
  }

  const headerSlot = (
    <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 mb-3">
      <AppMark size="sm" />
      <h1 className="text-4xl font-black mt-4 text-foreground tracking-tighter">{greeting}</h1>
      <p className="text-foreground/70 mt-2 max-w-sm font-medium">{headerSubtitle}</p>
    </motion.header>
  );

  const householdPanelSlot = themeId === "botanical" ? botanicalHouseholdPanelSlot : defaultHouseholdPanelSlot;
  const feedSlot = themeId === "botanical" ? botanicalFeedSlot : defaultFeedSlot;

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-6 md:p-6 space-y-4">
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
            <HouseholdWaterWidget scopeId={waterScopeId} members={members} currentUserId={user?.id ?? null} />
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
