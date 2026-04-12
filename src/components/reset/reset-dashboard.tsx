"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useTheme } from "@/components/providers/theme-provider";
import { ForgeResetLayout } from "@/components/reset/layouts/forge-layout";
import { DefaultResetLayout } from "@/components/reset/layouts/default-layout";
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
  if (signals.notes_private?.trim()) count++;

  const baseTotal = trackMetrics.filter(m => m === "steps" || m === "mood" || m === "sleep").length;
  const total = baseTotal > 0 ? baseTotal : 1; 

  return { count, total };
}

export function ResetDashboard({ wellness, userId, onOpenQuestionnaire, onUpdate }: Props) {
  const { t, locale } = useI18n();
  const { themeId } = useTheme();
  const [todayMs] = useState(() => Date.now());
  const [todaySignals, setTodaySignals] = useState<ResetDailySignalsRow | null>(null);
  const [signalsLoading, setSignalsLoading] = useState(true);
  const [signalsRefreshToken, setSignalsRefreshToken] = useState(0);
  
  const quickMetrics = wellness.trackMetrics;
  const quitPlan = wellness.quitPlan;

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
    return () => { alive = false; };
  }, [signalsRefreshToken, userId]);

  const goalLabel =
    wellness.onboardingProfile.primaryGoal === "wellbeing"
      ? t("reset.dashboard.goal.wellbeing")
      : wellness.onboardingProfile.primaryGoal === "weight"
        ? t("reset.dashboard.goal.weight")
        : wellness.onboardingProfile.primaryGoal === "sleep"
          ? t("reset.dashboard.goal.sleep")
          : t("reset.dashboard.goal.stress");

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

    return [
      {
        id: "active-quit-plan",
        kind: "quit",
        subkind: quitPlan.habit === "smoking" ? "smoking" : quitPlan.habit === "sweets" ? "sugar" : "custom",
        startedAt,
        intensity: quitPlan.approach === "reduce" ? "reduce" : "hard",
      },
    ];
  }, [quitPlan, wellness.goals]);

  const { count: completedSignals } = useMemo(
    () => countCompletedSignals(todaySignals, quickMetrics),
    [todaySignals, quickMetrics]
  );
  const hasTodayCheckIn = completedSignals > 0 || (todaySignals?.mood != null);

  const moodScore = useMemo(() => {
    const baseMoodScore =
      todaySignals?.mood != null
        ? 28 + todaySignals.mood * 12
        : wellness.onboardingProfile.baselineMood === "low" ? 46 : wellness.onboardingProfile.baselineMood === "steady" ? 64 : 80;

    const energyAdjustment = todaySignals?.energy != null ? (todaySignals.energy - 3) * 4 : 0;
    const score = baseMoodScore + energyAdjustment + signalsScoreDelta(todaySignals) + (hasTodayCheckIn ? 3 : 0);
    return clamp(Math.round(score), 18, 96);
  }, [hasTodayCheckIn, todaySignals, wellness.onboardingProfile.baselineMood]);

  const moodBand = moodScore >= 74 ? "high" : moodScore >= 52 ? "steady" : "low";
  const moodLabel = t(`reset.mood.${moodBand}`);

  const aiSignals = useMemo(
    () => [
        todaySignals?.steps != null ? { label: t("reset.signals.steps"), value: todaySignals.steps } : null,
        todaySignals?.mood != null ? { label: t("reset.signals.mood"), value: todaySignals.mood } : null,
        todaySignals?.energy != null ? { label: t("reset.signals.energy"), value: todaySignals.energy } : null,
      ].filter((entry): entry is { label: string; value: number } => Boolean(entry)),
    [t, todaySignals],
  );

  const aiGoals = useMemo(() => {
    const labels = new Set<string>([goalLabel]);
    quickMetrics.forEach((metric) => labels.add(metricLabel[metric as ResetTrackMetric]));
    return [...labels];
  }, [goalLabel, metricLabel, quickMetrics]);

  const greetingText = useMemo(() => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? (locale === "lv" ? "Labrīt" : "Good morning") :
                         hour < 18 ? (locale === "lv" ? "Labdien" : "Good afternoon") :
                         (locale === "lv" ? "Labvakar" : "Good evening");
    return `${timeGreeting}! ${hasTodayCheckIn ? (locale === "lv" ? "Tavs ritms ir fiksēts." : "Your rhythm is logged.") : (locale === "lv" ? "Kāds ir tavs šodienas ritms?" : "What's your rhythm today?")}`;
  }, [locale, hasTodayCheckIn]);

  const quickActions = useMemo(
    () => [
      {
        label: locale === "lv" ? "Šodienas check-in" : "Today’s check-in",
        hint: locale === "lv" ? "Noskaņojums, enerģija" : "Mood, energy",
        onClick: () => document.getElementById("reset-daily-signals")?.scrollIntoView({ behavior: "smooth" }),
      },
      {
        label: locale === "lv" ? "Body tracking" : "Body tracking",
        hint: locale === "lv" ? "Svars un mērījumi" : "Weight and measures",
        onClick: () => document.getElementById("reset-body-tracking")?.scrollIntoView({ behavior: "smooth" }),
      },
    ],
    [locale],
  );

  const metricPreview = quickMetrics.map((metric) => metricLabel[metric as ResetTrackMetric]).join(" · ");
  const isForge = themeId === "forge";

  const layoutProps = {
    locale, userId, todaySignals, quickMetrics, wellness, signalsRefreshToken,
    onSignalsSaved: () => setSignalsRefreshToken(v => v + 1),
    onUpdate, onOpenQuestionnaire, bodyMode, hasTodayCheckIn, moodLabel, moodScore,
    aiSignals, quitPlan, quitDays: quitPlan ? Math.max(0, Math.floor((todayMs - new Date(quitPlan.startedOn).getTime()) / 86400000)) : null,
    aiGoals, activeQuitGoals, goalLabel, metricPreview, greetingText, quickActions, t
  };

  return (
    <div className={isForge ? "space-y-10 pt-4 pb-12" : "space-y-4"}>
      {isForge ? <ForgeResetLayout {...layoutProps} /> : <DefaultResetLayout {...layoutProps} />}
    </div>
  );
}
