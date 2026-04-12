"use client";

import { useEffect, useMemo, useState } from "react";
import { ResetAiPanel } from "@/components/reset/reset-ai-panel";
import { ResetBodyTracking } from "@/components/reset/reset-body-tracking";
import { ResetDailySignalsForm } from "@/components/reset/reset-daily-signals-form";
import { ResetHealthSourcesPanel } from "@/components/reset/reset-health-sources-panel";
import { ResetMoodPanel } from "@/components/reset/reset-mood-panel";
import { ResetQuitStreak } from "@/components/reset/reset-quit-streak";
import { ResetTrendsPanel } from "@/components/reset/reset-trends-panel";
import { ResetTrainingPlan } from "@/components/reset/reset-training-plan";
import { ResetJournal } from "@/components/reset/reset-journal";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useTheme } from "@/components/providers/theme-provider";
import {
  fetchTodaySignals,
  localDateIso,
  signalsScoreDelta,
  type ResetDailySignalsRow,
} from "@/lib/reset-daily-signals";
import {
  bodyGoals,
  quitGoals,
  type QuitGoal,
  type ResetTrackMetric,
  type ResetWellnessV1,
} from "@/lib/reset-wellness";

type Props = {
  wellness: ResetWellnessV1;
  userId: string | null;
  onOpenQuestionnaire: () => void;
  onUpdate: (next: ResetWellnessV1) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function countCompletedSignals(signals: ResetDailySignalsRow | null, trackMetrics: ResetTrackMetric[]) {
  if (!signals) return { count: 0, total: trackMetrics.length };

  let count = 0;
  if (trackMetrics.includes("steps") && signals.steps != null) count++;
  if (trackMetrics.includes("mood") && signals.mood != null) count++;
  if (trackMetrics.includes("sleep") && signals.sleep_bedtime != null && signals.sleep_wake_time != null) count++;
  // Add 1 extra point if they filled notes (bonus)
  if (signals.notes_private?.trim()) count++;

  // Minimum total is 1 just so we don't divide by 0 if they selected nothing but weight
  const baseTotal = trackMetrics.filter(m => m === "steps" || m === "mood" || m === "sleep").length;
  const total = baseTotal > 0 ? baseTotal : 1; 

  return { count, total };
}

function scrollToSection(id: string) {
  if (typeof document === "undefined") return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function ResetDashboard({ wellness, userId, onOpenQuestionnaire, onUpdate }: Props) {
  const { t, locale } = useI18n();
  const { themeId } = useTheme();
  const [todayMs] = useState(() => Date.now());
  const [todaySignals, setTodaySignals] = useState<ResetDailySignalsRow | null>(null);
  const [signalsLoading, setSignalsLoading] = useState(true);
  const [signalsRefreshToken, setSignalsRefreshToken] = useState(0);
  const [activeTab, setActiveTab] = useState<"today" | "progress" | "system">("today");
  const quickMetrics = wellness.trackMetrics;
  const quitPlan = wellness.quitPlan;

  const lastWeight = wellness.weighIns[0]?.kg ?? null;

  const quitDays = quitPlan
    ? Math.max(
        0,
        Math.floor(
          (todayMs - new Date(quitPlan.startedOn).getTime()) / (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  const metricLabel = useMemo(
    () => ({
      weight: t("reset.dashboard.metric.weight"),
      steps: t("reset.dashboard.metric.steps"),
      mood: t("reset.dashboard.metric.mood"),
      sleep: t("reset.dashboard.metric.sleep"),
    }),
    [t],
  );

  useEffect(() => {
    let alive = true;

    async function loadSignals() {
      setSignalsLoading(true);
      const next = await fetchTodaySignals(userId, localDateIso());
      if (!alive) return;
      setTodaySignals(next);
      setSignalsLoading(false);
    }

    void loadSignals();

    return () => {
      alive = false;
    };
  }, [signalsRefreshToken, userId]);

  const goalLabel =
    wellness.onboardingProfile.primaryGoal === "wellbeing"
      ? t("reset.dashboard.goal.wellbeing")
      : wellness.onboardingProfile.primaryGoal === "weight"
        ? t("reset.dashboard.goal.weight")
        : wellness.onboardingProfile.primaryGoal === "sleep"
          ? t("reset.dashboard.goal.sleep")
          : t("reset.dashboard.goal.stress");

  const profileLabel =
    wellness.onboardingProfile.profileType === "desk"
      ? locale === "lv"
        ? "Sēdošs ritms"
        : "Desk rhythm"
      : wellness.onboardingProfile.profileType === "active"
        ? locale === "lv"
          ? "Aktīva diena"
          : "Active days"
        : locale === "lv"
          ? "Jaukts ritms"
          : "Mixed rhythm";

  const frequencyLabel =
    wellness.onboardingProfile.checkInFrequency === "daily"
      ? locale === "lv"
        ? "Katru dienu"
        : "Daily"
      : wellness.onboardingProfile.checkInFrequency === "weekdays"
        ? locale === "lv"
          ? "Darba dienās"
          : "Weekdays"
        : locale === "lv"
          ? "Trīs reizes nedēļā"
          : "Three times weekly";

  const bodyMode = useMemo(() => {
    const trainingGoal = bodyGoals(wellness.goals).find(
      (goal) => goal.mode === "bulk" || goal.mode === "lean",
    );

    return trainingGoal?.mode ?? null;
  }, [wellness.goals]);

  const activeQuitGoals = useMemo<QuitGoal[]>(() => {
    const explicitGoals = quitGoals(wellness.goals);
    if (explicitGoals.length > 0) return explicitGoals;
    if (!quitPlan) return [];

    const startedAtValue = new Date(quitPlan.startedOn);
    const startedAt = Number.isNaN(startedAtValue.getTime())
      ? new Date().toISOString()
      : startedAtValue.toISOString();

    const fallbackLabel =
      quitPlan.habit === "smoking"
        ? t("reset.dashboard.habit.smoking")
        : quitPlan.habit === "sweets"
          ? t("reset.dashboard.habit.sweets")
          : quitPlan.habit === "snacking"
            ? t("reset.dashboard.habit.snacking")
            : t("reset.dashboard.habit.other");

    return [
      {
        id: "active-quit-plan",
        kind: "quit",
        subkind:
          quitPlan.habit === "smoking"
            ? "smoking"
            : quitPlan.habit === "sweets"
              ? "sugar"
              : "custom",
        customLabel:
          quitPlan.habit === "smoking" || quitPlan.habit === "sweets" ? undefined : fallbackLabel,
        startedAt,
        intensity: quitPlan.approach === "reduce" ? "reduce" : "hard",
      },
    ];
  }, [quitPlan, t, wellness.goals]);

  const { count: completedSignals, total: expectedSignals } = useMemo(
    () => countCompletedSignals(todaySignals, quickMetrics),
    [todaySignals, quickMetrics]
  );
  const hasTodayCheckIn = completedSignals > 0 || (todaySignals?.mood != null);

  const moodScore = useMemo(() => {
    const baseMoodScore =
      todaySignals?.mood != null
        ? 28 + todaySignals.mood * 12
        : wellness.onboardingProfile.baselineMood === "low"
          ? 46
          : wellness.onboardingProfile.baselineMood === "steady"
            ? 64
            : 80;

    const energyAdjustment = todaySignals?.energy != null ? (todaySignals.energy - 3) * 4 : 0;
    const engagementAdjustment = hasTodayCheckIn ? 3 : 0;
    const score =
      baseMoodScore +
      energyAdjustment +
      signalsScoreDelta(todaySignals) +
      engagementAdjustment;

    return clamp(Math.round(score), 18, 96);
  }, [hasTodayCheckIn, todaySignals, wellness.onboardingProfile.baselineMood]);

  const moodBand = moodScore >= 74 ? "high" : moodScore >= 52 ? "steady" : "low";
  const moodLabel = t(`reset.mood.${moodBand}`);

  const aiSignals = useMemo(
    () =>
      [
        todaySignals?.steps != null
          ? { label: t("reset.signals.steps"), value: todaySignals.steps }
          : null,
        todaySignals?.screen_time_minutes != null
          ? { label: t("reset.signals.screen"), value: todaySignals.screen_time_minutes }
          : null,
        todaySignals?.meditation_minutes != null
          ? { label: t("reset.signals.meditation"), value: todaySignals.meditation_minutes }
          : null,
        todaySignals?.mood != null
          ? { label: t("reset.signals.mood"), value: todaySignals.mood }
          : null,
        todaySignals?.energy != null
          ? { label: t("reset.signals.energy"), value: todaySignals.energy }
          : null,
      ].filter((entry): entry is { label: string; value: number } => Boolean(entry)),
    [t, todaySignals],
  );

  const aiGoals = useMemo(() => {
    const labels = new Set<string>([goalLabel]);
    quickMetrics.forEach((metric) => labels.add(metricLabel[metric]));
    if (quitPlan) {
      labels.add(
        quitPlan.habit === "smoking"
          ? t("reset.dashboard.habit.smoking")
          : quitPlan.habit === "sweets"
            ? t("reset.dashboard.habit.sweets")
            : quitPlan.habit === "snacking"
              ? t("reset.dashboard.habit.snacking")
              : t("reset.dashboard.habit.other"),
      );
    }
    return [...labels];
  }, [goalLabel, metricLabel, quickMetrics, quitPlan, t]);

  const todayDayOfWeek = new Date().getDay(); // 0 is Sunday
  const isSunday = todayDayOfWeek === 0;

  const greetingText = useMemo(() => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? (locale === "lv" ? "Labrīt" : "Good morning") :
                         hour < 18 ? (locale === "lv" ? "Labdien" : "Good afternoon") :
                         (locale === "lv" ? "Labvakar" : "Good evening");
    
    if (!hasTodayCheckIn) {
       return `${timeGreeting}! ${locale === "lv" ? "Kāds ir tavs šodienas ritms?" : "What's your rhythm today?"}`;
    }
    if (isSunday) {
       return locale === "lv" ? "Svētdienas miers. Lieliska nedēļa!" : "Sunday calm. Great week!";
    }
    return `${timeGreeting}! ${locale === "lv" ? "Tavs dienas ritms ir fiksēts." : "Your daily rhythm is logged."}`;
  }, [locale, hasTodayCheckIn, isSunday]);

  const quickActions = useMemo(
    () => [
      {
        label: locale === "lv" ? "Šodienas check-in" : "Today’s check-in",
        hint: locale === "lv" ? "Noskaņojums, enerģija, soļi" : "Mood, energy, steps",
        onClick: () => {
          setActiveTab("today");
          setTimeout(() => scrollToSection("reset-daily-signals"), 100);
        },
      },
      {
        label: locale === "lv" ? "Body tracking" : "Body tracking",
        hint: locale === "lv" ? "Svars un mērījumi" : "Weight and measurements",
        onClick: () => {
          setActiveTab("progress");
          setTimeout(() => scrollToSection("reset-body-tracking"), 100);
        },
      },
      {
        label: locale === "lv" ? "Veselības avoti" : "Health sources",
        hint: locale === "lv" ? "Google Fit un sensori" : "Google Fit and sensors",
        onClick: () => {
          setActiveTab("system");
          setTimeout(() => scrollToSection("reset-health-sources"), 100);
        },
      },
      {
        label: locale === "lv" ? "Anketa" : "Questionnaire",
        hint: locale === "lv" ? "Mērķi un ikdienas ritms" : "Goals and daily rhythm",
        onClick: onOpenQuestionnaire,
      },
    ],
    [locale, onOpenQuestionnaire],
  );

  const metricPreview = quickMetrics.map((metric) => metricLabel[metric as ResetTrackMetric]).join(" · ");
  const isForge = themeId === "forge";

  return (
    <div className={isForge ? "space-y-10 pt-4 pb-12" : "space-y-4"}>
      {isForge ? (
        <>
          {/* SECTOR 01: VITAL_MONITORING */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-1 opacity-40">
              <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 01</span>
              <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
              <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Dzīvības signālu monitorings</span>
            </div>
            
            <GlassPanel className="space-y-4 border-primary/20 bg-black/40">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">
                    STATUS: OPERATIONAL_OVERVIEW
                  </p>
                  <h2 className="text-2xl font-bold uppercase tracking-tight text-white font-(family-name:--font-rajdhani)">
                    {greetingText}
                  </h2>
                  <p className="max-w-2xl text-sm leading-relaxed text-white/60">
                    {hasTodayCheckIn 
                      ? (locale === "lv" ? "Dati sinhronizēti un saglabāti arhīvā." : "Data synced and securely archived.")
                      : (locale === "lv" ? "Sistēma gaida dienas rādītāju ievadi." : "System awaits daily input.")}
                  </p>
                </div>

                {!hasTodayCheckIn && (
                  <button
                    type="button"
                    onClick={() => scrollToSection("reset-daily-signals")}
                    className="inline-flex shrink-0 items-center justify-center rounded-sm border border-primary/30 bg-primary/10 px-4 py-2 text-[0.6rem] font-black uppercase tracking-widest text-primary hover:bg-primary/20 transition-all"
                  >
                    [ {locale === "lv" ? "Atvērt Check-in" : "Open Check-in"} ]
                  </button>
                )}
              </div>

              {/* Mājienu bloks Forge tēmai vai cits modulis šeit */}
              <GlassPanel className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary) mb-2">
                  {locale === "lv" ? "Mājas mikroklimats" : "Household Vibe"}
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                    <span className="text-xs font-bold text-primary">Tu</span>
                  </div>
                  <span className="text-sm font-medium text-white">
                    {todaySignals?.mood != null ? (
                      todaySignals.mood >= 4 ? (locale === "lv" ? "Lieliski" : "Great") :
                      todaySignals.mood === 3 ? (locale === "lv" ? "Mierīgi" : "Calm") :
                      (locale === "lv" ? "Smagi" : "Tough")
                    ) : (locale === "lv" ? "Nav datu" : "No data")}
                  </span>
                </div>
              </GlassPanel>
            </GlassPanel>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className="rounded-sm border border-white/5 bg-black/20 px-4 py-3 text-left transition hover:border-primary/30 group"
                >
                  <p className="text-[0.6rem] font-black uppercase tracking-widest text-primary group-hover:animate-pulse">{action.label}</p>
                  <p className="mt-1 text-[0.5rem] font-mono text-white/30 uppercase tracking-tighter">{action.hint}</p>
                </button>
              ))}
            </div>
          </div>

          {/* SECTOR 02: BIOMETRICS & LOGS */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-1 opacity-40">
              <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 02</span>
              <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
              <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Biometriskā datu plūsma</span>
            </div>
            
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
              <div className="space-y-4">
                <div id="reset-daily-signals">
                  <ResetDailySignalsForm
                    userId={userId}
                    trackMetrics={quickMetrics}
                    onSaved={() => setSignalsRefreshToken((value) => value + 1)}
                  />
                </div>
                <div id="reset-trends-panel">
                  <ResetTrendsPanel userId={userId} refreshToken={signalsRefreshToken} />
                </div>
              </div>
              <div className="space-y-4">
                <div id="reset-body-tracking">
                  <ResetBodyTracking state={wellness} onUpdate={onUpdate} />
                </div>
                <ResetAiPanel
                  mood={moodLabel}
                  moodScore={moodScore}
                  energy={todaySignals?.energy}
                  signals={aiSignals}
                  quitDays={quitPlan ? quitDays : null}
                  goals={aiGoals}
                />              </div>
            </div>
          </div>

          {/* SECTOR 03: ARCHIVE & CORE */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-1 opacity-40">
              <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 03</span>
              <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
              <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Arhīvs un konfigurācija</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div id="reset-health-sources">
                <ResetHealthSourcesPanel />
              </div>
              <GlassPanel className="space-y-3 border-white/5 bg-black/20">
                <p className="text-[0.6rem] font-black uppercase tracking-[0.16em] text-primary">
                  SYSTEM_PROFILE_CONFIG
                </p>
                <p className="text-lg font-bold text-white font-(family-name:--font-rajdhani)">{goalLabel.toUpperCase()}</p>
                <div className="rounded-sm border border-white/5 bg-white/5 p-3">
                  <p className="text-[0.5rem] font-mono uppercase tracking-[0.12em] text-white/40">
                    DATA_METRICS_STREAM
                  </p>
                  <p className="mt-1 text-xs font-mono text-white/80">
                    {metricPreview.toUpperCase() || "NO_METRICS_ENABLED"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenQuestionnaire}
                  className="w-full rounded-sm border border-white/10 bg-white/5 px-4 py-2 text-[0.6rem] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 transition-all"
                >
                  [ REDIGJET_ANKETU ]
                </button>
              </GlassPanel>
            </div>
          </div>
        </>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] items-start pt-2">
          
          {/* LEFT COLUMN: Input & Deep Analytics */}
          <div className="space-y-6 min-w-0">
            {/* BOX 1: The Form */}
            <div id="reset-daily-signals" className="w-full">
              <ResetDailySignalsForm
                userId={userId}
                trackMetrics={quickMetrics}
                onSaved={() => setSignalsRefreshToken((value) => value + 1)}
              />
            </div>

            {/* BOX 2: Trends & Analytics */}
            <div id="reset-trends-panel" className="w-full">
              <ResetTrendsPanel userId={userId} refreshToken={signalsRefreshToken} />
            </div>

            {/* BOX 2B: Journal Archive */}
            <div id="reset-journal" className="w-full">
              <ResetJournal userId={userId} refreshToken={signalsRefreshToken} />
            </div>

            {/* BOX 3: Body & Training (Side by Side) */}
            <div className="grid gap-6 md:grid-cols-2 items-start">
              <div id="reset-body-tracking">
                <ResetBodyTracking state={wellness} onUpdate={onUpdate} />
              </div>
              {bodyMode ? (
                <div id="reset-training">
                  <ResetTrainingPlan mode={bodyMode} state={wellness} onUpdate={onUpdate} />
                </div>
              ) : null}
            </div>
          </div>

          {/* RIGHT COLUMN: Quick Status, AI & Config */}
          <div className="space-y-6">
            
            {/* Status Line */}
            <div className="flex items-center justify-end px-2 pb-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  {hasTodayCheckIn ? (
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  ) : (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                    </>
                  )}
                </span>
                <p className="text-[10px] uppercase tracking-widest text-(--color-text-secondary)">
                  {hasTodayCheckIn 
                    ? (locale === "lv" ? "Sinhronizēts arhīvā" : "Synced to archive")
                    : (locale === "lv" ? "Gaida datus" : "Awaiting logs")}
                </p>
              </div>
            </div>

            {/* BOX 4: Household Vibe (replaces private mood index) */}
            <GlassPanel className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
                  {locale === "lv" ? "Mājas mikroklimats" : "Household Vibe"}
                </p>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
              </div>
              <div className="space-y-4">
                {/* Current user */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                      <span className="text-xs font-bold text-primary">Tu</span>
                    </div>
                    <span className="text-sm font-medium text-(--color-text-primary)">
                      {todaySignals?.mood != null ? (
                        todaySignals.mood >= 4 ? (locale === "lv" ? "Lieliski" : "Great") :
                        todaySignals.mood === 3 ? (locale === "lv" ? "Mierīgi" : "Calm") :
                        (locale === "lv" ? "Smagi" : "Tough")
                      ) : (locale === "lv" ? "Nav datu" : "No data")}
                    </span>
                  </div>
                  {todaySignals?.mood != null && (
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={`h-1.5 w-4 rounded-full ${i < todaySignals.mood! ? 'bg-primary' : 'bg-(--color-surface-border)'}`} />
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Partner Placeholder (Real integration would map household members here) */}
                <div className="flex items-center justify-between opacity-50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-(--color-surface-2) flex items-center justify-center border border-(--color-surface-border)">
                      <span className="text-xs font-bold text-(--color-text-secondary)">P</span>
                    </div>
                    <span className="text-sm font-medium text-(--color-text-secondary)">
                      {locale === "lv" ? "Nav datu" : "No data"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-1.5 w-4 rounded-full bg-(--color-surface-border)" />
                    ))}
                  </div>
                </div>
              </div>
            </GlassPanel>

            {/* BOX 5: Proactive AI */}
            <div className="w-full">
              <ResetAiPanel
                mood={moodLabel}
                moodScore={moodScore}
                energy={todaySignals?.energy}
                signals={aiSignals}
                quitDays={quitPlan ? quitDays : null}
                goals={aiGoals}
              />
            </div>

            {/* BOX 6: Streaks (If any) */}
            {activeQuitGoals.length > 0 ? (
              <div id="reset-quit-streak">
                <ResetQuitStreak goals={activeQuitGoals} state={wellness} onUpdate={onUpdate} />
              </div>
            ) : null}

            {/* BOX 7: Settings / System */}
            <GlassPanel className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
                    {locale === "lv" ? "Profils" : "Profile"}
                  </p>
                  <p className="text-sm font-semibold text-(--color-text-primary)">{goalLabel}</p>
                </div>
                <button
                  type="button"
                  onClick={onOpenQuestionnaire}
                  className="shrink-0 rounded-full border border-(--color-surface-border) bg-(--color-surface) px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-(--color-text-secondary) transition hover:text-(--color-text-primary)"
                >
                  {locale === "lv" ? "Labot" : "Edit"}
                </button>
              </div>
              <div className="rounded-xl border border-(--color-surface-border) bg-background/50 p-3">
                <p className="text-xs uppercase tracking-widest text-(--color-text-secondary)">
                  {locale === "lv" ? "Sekotie signāli" : "Tracked signals"}
                </p>
                <p className="mt-1 text-sm font-medium text-(--color-text-primary)">
                  {metricPreview || t("reset.dashboard.noMetrics")}
                </p>
              </div>
              <div id="reset-health-sources" className="pt-2">
                <ResetHealthSourcesPanel />
              </div>
            </GlassPanel>

          </div>
        </div>
      )}
    </div>
  );
}
