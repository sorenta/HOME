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
  const base = "bg-card text-card-foreground rounded-theme p-6 relative overflow-hidden transition-all duration-500 flex flex-col gap-4";
  if (themeId === "lucent") return `${base} border border-border/50 backdrop-blur-md shadow-theme`;
  if (themeId === "hive") return `${base} border-4 border-border shadow-sm`;
  if (themeId === "pulse") return `${base} border-4 border-black shadow-[6px_6px_0px_#000]`;
  if (themeId === "forge") return `${base} metal-gradient border-t-4 border-primary shadow-inner`;
  if (themeId === "botanical") return `${base} border border-border shadow-[inset_0_0_20px_rgba(255,255,255,0.3)]`;
  return `${base} border border-border`;
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
      className="flex flex-col gap-4 relative z-10"
    >
      <div className="grid grid-cols-2 gap-4">
        <MetricCard variant="compact" label={t("dashboard.members")} value={members.length || household?.member_count || 0} />
        <MetricCard variant="compact" label={t("dashboard.pending")} value={pendingCount} />
      </div>
      <MetricCard variant="emphasis" label={t("dashboard.aiReady")} value={aiReady ? "ON" : "OFF"} />
    </motion.div>
  );

  const householdPanelSlot = (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`${panelThemeClasses} z-10`}
    >
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <h2 className="text-lg font-bold tracking-wide">{t("household.members")}</h2>
        <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded-full">
          {t("app.realtime")}
        </span>
      </div>
      <ul className="flex flex-col gap-3 pt-2">
        {members.length === 0 ? (
          <li className="text-sm text-foreground/50 italic">{t("household.membersList.empty")}</li>
        ) : (
          members.map((member) => {
            const label = member.display_name ?? t("household.membersList.member");
            return (
              <li key={member.id} className="flex items-center gap-4 bg-background/50 p-3 rounded-xl border border-border/30">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm">
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
      <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50 mt-2">
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
    <motion.div layout={themeId !== "lucent"} className="grid grid-cols-2 gap-4 relative z-10 my-4">
      {tiles}
    </motion.div>
  );

  const feedSlot = (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14 }}
      className={`${panelThemeClasses} z-10 mt-4`}
    >
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <h2 className="text-lg font-bold tracking-wide">{t("dashboard.feed")}</h2>
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary animate-pulse">
          {t("dashboard.feedLive")}
        </span>
      </div>
      <ul className="flex flex-col relative pt-2">
        {/* Plūsmas vertikālā līnija */}
        <div className="absolute left-2.5 top-6 bottom-4 w-px bg-border/50" aria-hidden />
        
        {homeFeed.map((item) => (
          <li key={item.id} className="relative pl-8 py-3 group">
            <span className="absolute left-1.5 top-4.5 w-3 h-3 rounded-full bg-background border-2 border-primary group-hover:scale-125 transition-transform" aria-hidden />
            <div>
              <p className="text-sm font-medium">{item.line}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-foreground/60 font-mono">{item.time}</p>
                {item.source === "db" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </motion.section>
  );

  if (!profile?.household_id) {
    return (
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden p-6 gap-6">
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
    <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 mb-6">
      <AppMark size="sm" />
      <h1 className="text-4xl font-black mt-4 text-foreground tracking-tighter">{greeting}</h1>
      <p className="text-foreground/70 mt-2 max-w-sm font-medium">{headerSubtitle}</p>
    </motion.header>
  );

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-8 md:p-8 space-y-6">
      <DashboardHomeLayout
        themeId={themeId}
        slots={{
          header: headerSlot,
          notice: <TimeOfDayNoticeCard />,
          householdSummary: (
            <div className="relative z-10 mb-6">
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