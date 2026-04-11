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

  const focusCard = useMemo(() => {
    if (isSunday && hasTodayCheckIn) {
      return {
        title: locale === "lv" ? "Svētdienas kopsavilkums" : "Sunday Summary",
        body: locale === "lv" 
          ? "Lieliska nedēļa! Paņem mirkli, lai apskatītu savus trendus un sagatavotos jaunai nedēļai." 
          : "Great week! Take a moment to review your trends and prep for the week ahead.",
        cta: locale === "lv" ? "Apskatīt trendus" : "View trends",
        onClick: () => {
          setActiveTab("progress");
          setTimeout(() => scrollToSection("reset-trends-panel"), 100);
        },
      };
    }

    if (!hasTodayCheckIn) {
      return {
        title:
          locale === "lv"
            ? "Piefiksē šodienas privātos signālus"
            : "Log today’s private signals",
        body:
          locale === "lv"
            ? "RESET sadaļa kļūst noderīga tikai tad, kad tajā ir šodienas ritms: noskaņojums, enerģija un daži ikdienas dati." 
            : "RESET becomes useful when today’s rhythm is present: mood, energy, and a few daily signals.",
        cta: locale === "lv" ? "Atvērt check-in" : "Open check-in",
        onClick: () => {
          setActiveTab("today");
          setTimeout(() => scrollToSection("reset-daily-signals"), 100);
        },
      };
    }

    if (quitPlan && quitDays < 7) {
      return {
        title:
          locale === "lv"
            ? "Nosargā pirmās 7 dienas"
            : "Protect the first 7 days",
        body:
          locale === "lv"
            ? "Pirmajā nedēļā svarīgākais ir konsekvence. Paturi streak redzamu un vakarā pievieno īsu piezīmi sev." 
            : "Consistency matters most during the first week. Keep the streak visible and leave yourself a short note tonight.",
        cta: locale === "lv" ? "Skatīt streak" : "View streak",
        onClick: () => {
          setActiveTab("progress");
          setTimeout(() => scrollToSection("reset-quit-streak"), 100);
        },
      };
    }

    if (quickMetrics.includes("weight") && lastWeight == null) {
      return {
        title:
          locale === "lv"
            ? "Pievieno pirmo ķermeņa ierakstu"
            : "Add your first body log",
        body:
          locale === "lv"
            ? "Ja izvēlējies svaru vai ķermeņa mērījumus, viens sākuma punkts padara progresu daudz skaidrāku jau pēc dažām dienām." 
            : "If you track weight or measurements, one baseline entry makes progress clearer within a few days.",
        cta: locale === "lv" ? "Atvērt body tracking" : "Open body tracking",
        onClick: () => {
          setActiveTab("progress");
          setTimeout(() => scrollToSection("reset-body-tracking"), 100);
        },
      };
    }

    return {
      title: locale === "lv" ? "Turpini mierīgu ritmu" : "Keep a calm rhythm",
      body:
        locale === "lv"
          ? "Šodienas RESET jau ir kustībā. Vari pielabot anketu, pieslēgt veselības avotus vai palūgt AI īsu ieteikumu." 
          : "Today’s RESET is already in motion. You can refine the questionnaire, connect health sources, or ask AI for a short suggestion.",
      cta: locale === "lv" ? "Atvērt anketu" : "Open questionnaire",
      onClick: onOpenQuestionnaire,
    };
  }, [hasTodayCheckIn, isSunday, lastWeight, locale, onOpenQuestionnaire, quickMetrics, quitDays, quitPlan]);

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
                    {focusCard.title}
                  </h2>
                  <p className="max-w-2xl text-sm leading-relaxed text-white/60">
                    {focusCard.body}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={focusCard.onClick}
                  className="inline-flex shrink-0 items-center justify-center rounded-sm border border-primary/30 bg-primary/10 px-4 py-2 text-[0.6rem] font-black uppercase tracking-widest text-primary hover:bg-primary/20 transition-all"
                >
                  [ {focusCard.cta} ]
                </button>
              </div>

              <ResetMoodPanel
                scorePercent={moodScore}
                scoreLabel={t("reset.score")}
              />
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
        <div className="space-y-6">
          {/* TAB NAVIGATION */}
          <div className="flex p-1 bg-(--color-surface)/50 border border-(--color-surface-border) rounded-full w-max mx-auto mb-2 relative z-10 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab("today")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${
                activeTab === "today"
                  ? "bg-(--color-surface-2) text-(--color-text-primary) shadow-sm"
                  : "text-(--color-text-secondary) hover:text-(--color-text-primary)"
              }`}
            >
              {locale === "lv" ? "Šodiena" : "Today"}
            </button>
            <button
              onClick={() => setActiveTab("progress")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${
                activeTab === "progress"
                  ? "bg-(--color-surface-2) text-(--color-text-primary) shadow-sm"
                  : "text-(--color-text-secondary) hover:text-(--color-text-primary)"
              }`}
            >
              {locale === "lv" ? "Dinamika" : "Progress"}
            </button>
            <button
              onClick={() => setActiveTab("system")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${
                activeTab === "system"
                  ? "bg-(--color-surface-2) text-(--color-text-primary) shadow-sm"
                  : "text-(--color-text-secondary) hover:text-(--color-text-primary)"
              }`}
            >
              {locale === "lv" ? "Sistēma" : "System"}
            </button>
          </div>

          {/* TAB CONTENT: TODAY */}
          {activeTab === "today" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid gap-4 lg:grid-cols-[1fr_minmax(320px,1.2fr)]">
                <GlassPanel className="space-y-4 border border-(--color-surface-border) bg-[color-mix(in_srgb,var(--color-card)_92%,white_8%)] p-5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
                      {locale === "lv" ? "RESET pārskats" : "RESET overview"}
                    </p>
                    <h2 className="text-2xl font-semibold text-(--color-text-primary)">
                      {focusCard.title}
                    </h2>
                    <p className="max-w-md text-sm leading-relaxed text-(--color-text-secondary)">
                      {focusCard.body}
                    </p>
                  </div>
                  <div className="pt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={focusCard.onClick}
                      className="inline-flex shrink-0 items-center justify-center rounded-full border border-(--color-accent) bg-(--color-surface-2) px-4 py-2 text-sm font-semibold text-(--color-text-primary) shadow-sm transition hover:bg-(--color-surface-border)"
                    >
                      {focusCard.cta}
                    </button>
                  </div>
                </GlassPanel>
                <ResetAiPanel
                  mood={moodLabel}
                  moodScore={moodScore}
                  energy={todaySignals?.energy}
                  signals={aiSignals}
                  quitDays={quitPlan ? quitDays : null}
                  goals={aiGoals}
                />
              </div>
              <div id="reset-daily-signals" className="max-w-4xl mx-auto w-full">
                <ResetDailySignalsForm
                  userId={userId}
                  trackMetrics={quickMetrics}
                  onSaved={() => setSignalsRefreshToken((value) => value + 1)}
                />
              </div>
            </div>
          )}

          {/* TAB CONTENT: PROGRESS */}
          {activeTab === "progress" && (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.85fr)] items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-(--color-surface-border) bg-[color-mix(in_srgb,var(--color-surface)_70%,transparent)] p-4 backdrop-blur-md">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-(--color-text-secondary)">
                      {locale === "lv" ? "Šodienas dati" : "Today's logs"}
                    </p>
                    <p className="mt-1 text-xl font-bold text-(--color-text-primary)">
                      {signalsLoading
                        ? "..."
                        : completedSignals >= expectedSignals
                          ? (locale === "lv" ? "Pabeigts" : "Done")
                          : `${completedSignals}/${expectedSignals}`}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-(--color-surface-border) bg-[color-mix(in_srgb,var(--color-surface)_70%,transparent)] p-4 backdrop-blur-md">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-(--color-text-secondary)">
                      {t("reset.dashboard.activeGoal")}
                    </p>
                    <p className="mt-1 text-xl font-bold text-(--color-text-primary) truncate">
                      {goalLabel}
                    </p>
                  </div>
                </div>
                <div id="reset-trends-panel">
                  <ResetTrendsPanel userId={userId} refreshToken={signalsRefreshToken} />
                </div>
                {activeQuitGoals.length > 0 ? (
                  <div id="reset-quit-streak">
                    <ResetQuitStreak goals={activeQuitGoals} state={wellness} onUpdate={onUpdate} />
                  </div>
                ) : null}
              </div>
              <div className="space-y-6">
                <ResetMoodPanel
                  scorePercent={moodScore}
                  scoreLabel={t("reset.score")}
                />
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
          )}

          {/* TAB CONTENT: SYSTEM */}
          {activeTab === "system" && (
            <div className="max-w-2xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <GlassPanel className="space-y-3 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
                  {locale === "lv" ? "Anketas iestatījumi" : "Questionnaire config"}
                </p>
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-(--color-text-primary)">{goalLabel}</p>
                  <p className="text-sm text-(--color-text-secondary)">
                    {locale === "lv"
                      ? `Ritms: ${profileLabel.toLowerCase()}, check-in ${frequencyLabel.toLowerCase()}.`
                      : `Rhythm: ${profileLabel.toLowerCase()}, check-ins ${frequencyLabel.toLowerCase()}.`}
                  </p>
                </div>
                <div className="rounded-(--radius-card) border border-(--color-surface-border) bg-(--color-surface) p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-(--color-text-secondary)">
                    {locale === "lv" ? "Izvēlētie signāli" : "Selected signals"}
                  </p>
                  <p className="mt-1 text-sm text-(--color-text-primary)">
                    {metricPreview || t("reset.dashboard.noMetrics")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenQuestionnaire}
                  className="w-full justify-center inline-flex rounded-full border border-(--color-surface-border) bg-(--color-surface) px-4 py-2 text-sm font-medium text-(--color-text-secondary) transition hover:text-(--color-text-primary)"
                >
                  {locale === "lv" ? "Mainīt uzstādījumus" : "Change settings"}
                </button>
              </GlassPanel>
              <div id="reset-health-sources">
                <ResetHealthSourcesPanel />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
