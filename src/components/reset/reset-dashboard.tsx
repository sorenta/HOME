"use client";

import Link from "next/link";
import { useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { ResetWellnessV1 } from "@/lib/reset-wellness";

type Props = {
  wellness: ResetWellnessV1;
  onOpenQuestionnaire: () => void;
};

export function ResetDashboard({ wellness, onOpenQuestionnaire }: Props) {
  const { t, locale } = useI18n();
  const [todayMs] = useState(() => Date.now());
  const quickMetrics = wellness.trackMetrics;
  const quitPlan = wellness.quitPlan;

  const lastWeight = wellness.weighIns[0]?.kg ?? null;
  const lastMeasurement = wellness.measurements[0] ?? null;

  const quitDays = quitPlan
    ? Math.max(
        0,
        Math.floor(
          (todayMs - new Date(quitPlan.startedOn).getTime()) / (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  const metricLabel = {
    weight: t("reset.dashboard.metric.weight"),
    steps: t("reset.dashboard.metric.steps"),
    mood: t("reset.dashboard.metric.mood"),
    sleep: t("reset.dashboard.metric.sleep"),
  } as const;

  const goalLabel =
    wellness.onboardingProfile.primaryGoal === "wellbeing"
      ? t("reset.dashboard.goal.wellbeing")
      : wellness.onboardingProfile.primaryGoal === "weight"
        ? t("reset.dashboard.goal.weight")
        : wellness.onboardingProfile.primaryGoal === "sleep"
          ? t("reset.dashboard.goal.sleep")
          : t("reset.dashboard.goal.stress");

  return (
    <div className="space-y-4">
      <GlassPanel className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-secondary)]">
          {locale === "lv" ? "RESET anketa" : "RESET questionnaire"}
        </p>
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          {locale === "lv"
            ? "Anketa ir pieejama jebkurā laikā. Atver to, lai atjaunotu savus mērķus un atbildes."
            : "The questionnaire is available anytime. Open it to update your goals and answers."}
        </p>
        <button
          type="button"
          onClick={onOpenQuestionnaire}
          className="inline-flex rounded-full border border-[color:var(--color-accent)] bg-[color:var(--color-surface-2)] px-4 py-2 text-sm font-semibold text-[color:var(--color-text-primary)]"
        >
          {locale === "lv" ? "Atvērt anketu" : "Open questionnaire"}
        </button>
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-secondary)]">
          {t("reset.dashboard.todayStatus")}
        </p>
        <h2 className="text-xl font-semibold text-[color:var(--color-text-primary)]">
          {t("reset.dashboard.howFeel")}
        </h2>
        <div className="flex gap-2">
          {[t("reset.dashboard.state.calm"), t("reset.dashboard.state.steady"), t("reset.dashboard.state.energetic")].map((state) => (
            <button
              type="button"
              key={state}
              className="rounded-full border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] px-4 py-2 text-sm text-[color:var(--color-text-secondary)]"
            >
              {state}
            </button>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-secondary)]">
          {t("reset.dashboard.quickActions")}
        </p>
        <div className="flex snap-x gap-2 overflow-x-auto pb-1">
          {quickMetrics.map((metric) => (
            <button
              key={metric}
              type="button"
              className="shrink-0 rounded-full border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] px-4 py-2 text-sm font-medium text-[color:var(--color-text-primary)]"
            >
              {t("reset.dashboard.addMetric")}: {metricLabel[metric]}
            </button>
          ))}
          {quickMetrics.length === 0 && (
            <p className="text-sm text-[color:var(--color-text-secondary)]">
              {t("reset.dashboard.noMetrics")}
            </p>
          )}
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-secondary)]">
          {t("reset.dashboard.activeGoal")}
        </p>
        <p className="text-lg font-semibold text-[color:var(--color-text-primary)]">
          {goalLabel}
        </p>
        <div className="space-y-2">
          <div className="h-2 w-full rounded-full bg-[color:var(--color-surface)]">
            <div
              className="h-2 rounded-full bg-[color:var(--color-accent)]"
              style={{ width: "42%" }}
              aria-hidden
            />
          </div>
          <p className="text-sm text-[color:var(--color-text-secondary)]">
            {t("reset.dashboard.weekProgress", { percent: "42" })}
          </p>
        </div>
      </GlassPanel>

      {quitPlan && (
        <GlassPanel className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-secondary)]">
            {t("reset.dashboard.habitProgress")}
          </p>
          <p className="text-sm text-[color:var(--color-text-secondary)]">
            {quitPlan.habit === "smoking"
              ? t("reset.dashboard.habit.smoking")
              : quitPlan.habit === "sweets"
                ? t("reset.dashboard.habit.sweets")
                : quitPlan.habit === "snacking"
                  ? t("reset.dashboard.habit.snacking")
                  : t("reset.dashboard.habit.other")}
            : {quitPlan.approach === "quit" ? t("reset.dashboard.approach.quit") : t("reset.dashboard.approach.reduce")}
          </p>
          <p className="text-2xl font-semibold text-[color:var(--color-text-primary)]">{t("reset.dashboard.daysCount", { n: String(quitDays) })}</p>
          <button
            type="button"
            className="rounded-full border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] px-4 py-2 text-sm text-[color:var(--color-text-secondary)]"
          >
            {t("reset.dashboard.markSlip")}
          </button>
        </GlassPanel>
      )}

      <GlassPanel className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-secondary)]">
          {t("reset.dashboard.latestMeasurements")}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-[var(--radius-card)] border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-3">
            <p className="text-xs text-[color:var(--color-text-secondary)]">{t("reset.dashboard.lastWeight")}</p>
            <p className="text-lg font-semibold text-[color:var(--color-text-primary)]">
              {lastWeight != null ? `${lastWeight.toFixed(1)} kg` : t("reset.dashboard.noData")}
            </p>
          </div>
          <div className="rounded-[var(--radius-card)] border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-3">
            <p className="text-xs text-[color:var(--color-text-secondary)]">{t("reset.dashboard.lastMeasurement")}</p>
            <p className="text-lg font-semibold text-[color:var(--color-text-primary)]">
              {lastMeasurement ? `${lastMeasurement.area}: ${lastMeasurement.valueCm} cm` : t("reset.dashboard.noData")}
            </p>
          </div>
        </div>

        <Link
          href="/reset?view=history"
          className="inline-flex rounded-full border border-[color:var(--color-accent)] bg-[color:var(--color-surface-2)] px-4 py-2 text-sm font-semibold text-[color:var(--color-text-primary)]"
        >
          {t("reset.dashboard.openFullOverview")}
        </Link>
      </GlassPanel>
    </div>
  );
}
