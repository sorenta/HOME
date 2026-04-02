"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ModuleShell } from "@/components/layout/module-shell";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { GlassPanel } from "@/components/ui/glass-panel";
import { ResetBodyTracking } from "@/components/reset/reset-body-tracking";
import { ResetQuitStreak } from "@/components/reset/reset-quit-streak";
import { ResetTrainingPlan } from "@/components/reset/reset-training-plan";
import { ResetWellnessOnboarding } from "@/components/reset/reset-wellness-onboarding";
import {
  dashboardSnapshot,
  householdMembers,
  resetMetrics,
} from "@/lib/demo-data";
import { useI18n } from "@/lib/i18n/i18n-context";
import { hapticTap } from "@/lib/haptic";
import { hasResetCheckInToday, markResetCheckInDone } from "@/lib/reset-checkin";
import {
  bodyGoals,
  defaultWellnessState,
  hasTrainingRelevantBodyGoal,
  hasWeightLossGoal,
  loadWellnessState,
  quitGoals,
  saveWellnessState,
  type ResetWellnessV1,
  type WellnessGoal,
} from "@/lib/reset-wellness";

export default function ResetPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [doneToday, setDoneToday] = useState(true);
  const [wellness, setWellness] = useState<ResetWellnessV1>(defaultWellnessState);
  const [hydrated, setHydrated] = useState(false);
  const [showGoalEditor, setShowGoalEditor] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setDoneToday(hasResetCheckInToday());
      setWellness(loadWellnessState());
      setHydrated(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const persistWellness = useCallback((next: ResetWellnessV1) => {
    saveWellnessState(next);
    setWellness(next);
  }, []);

  const onSurveyComplete = useCallback(
    (goals: WellnessGoal[]) => {
      persistWellness({
        ...wellness,
        goals,
        onboardingDone: true,
      });
      setShowGoalEditor(false);
    },
    [persistWellness, wellness],
  );

  const onSurveySkip = useCallback(() => {
    persistWellness({
      ...wellness,
      onboardingDone: true,
    });
    setShowGoalEditor(false);
  }, [persistWellness, wellness]);

  const quits = useMemo(() => quitGoals(wellness.goals), [wellness.goals]);
  const bodies = useMemo(() => bodyGoals(wellness.goals), [wellness.goals]);
  const trainingModes = useMemo(() => {
    const modes = bodies
      .filter((b) => b.mode === "bulk" || b.mode === "lean")
      .map((b) => b.mode);
    return [...new Set(modes)];
  }, [bodies]);

  function onCheckIn() {
    hapticTap();
    markResetCheckInDone();
    setDoneToday(true);
    router.push("/");
  }

  const showOnboarding = hydrated && (!wellness.onboardingDone || showGoalEditor);

  return (
    <ModuleShell title={t("tile.reset")} moduleId="reset">
      {showOnboarding ? (
        <ResetWellnessOnboarding
          onComplete={(goals) => onSurveyComplete(goals)}
          onSkip={onSurveySkip}
        />
      ) : null}

      {hydrated && wellness.onboardingDone ? (
        <GlassPanel className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <SectionHeading title={t("reset.wellness.summaryTitle")} />
            <button
              type="button"
              onClick={() => {
                hapticTap();
                setShowGoalEditor(true);
              }}
              className="rounded-xl border border-[color:var(--color-surface-border)] px-3 py-2 text-xs font-semibold text-[color:var(--color-text)]"
            >
              {t("reset.wellness.editGoals")}
            </button>
          </div>
          {wellness.goals.length === 0 ? (
            <p className="text-sm text-[color:var(--color-secondary)]">
              {t("reset.wellness.noGoalsHint")}
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {wellness.goals.map((g) => (
                <StatusPill key={g.id} tone="neutral">
                  {g.kind === "quit"
                    ? g.subkind === "custom" && g.customLabel
                      ? g.customLabel
                      : t(`reset.wellness.quit.${g.subkind}`)
                    : t(`reset.wellness.body.${g.mode}`)}
                </StatusPill>
              ))}
            </ul>
          )}
        </GlassPanel>
      ) : null}

      {hydrated && quits.length > 0 ? <ResetQuitStreak goals={quits} /> : null}

      {hydrated && hasWeightLossGoal(wellness.goals) ? (
        <ResetBodyTracking state={wellness} onUpdate={persistWellness} />
      ) : null}

      {hydrated && hasTrainingRelevantBodyGoal(wellness.goals)
        ? trainingModes.map((mode) => (
            <ResetTrainingPlan
              key={mode}
              mode={mode}
              state={wellness}
              onUpdate={persistWellness}
            />
          ))
        : null}

      <GlassPanel className="space-y-3">
        <p className="text-sm leading-relaxed text-[color:var(--color-secondary)]">
          {t("module.reset.blurb")}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label={t("reset.score")}
            value={`${dashboardSnapshot.resetScore}%`}
          />
          <MetricCard
            label={t("reset.partnerAura")}
            value={t("reset.partnerAuraDemo")}
            hint={t("reset.partnerAuraHint")}
          />
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <SectionHeading title={t("reset.metrics")} />
        <div className="space-y-2">
          {resetMetrics.map((metric) => (
            <div
              key={metric.label}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]/35 px-3 py-3"
            >
              <p className="text-sm font-medium text-[color:var(--color-text)]">{metric.label}</p>
              <StatusPill tone={metric.tone === "good" ? "good" : "warn"}>
                {metric.value}
              </StatusPill>
            </div>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <SectionHeading title={t("reset.privacy")} />
        <p className="text-sm leading-relaxed text-[color:var(--color-text)]">
          {t("reset.privacyBody")}
        </p>
        <div className="flex flex-wrap gap-2">
          {householdMembers.map((member) => (
            <StatusPill key={member.id} tone="neutral">
              {member.name} — {t("reset.seesAuraOnly")}
            </StatusPill>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-4">
        <SectionHeading title={t("reset.recommendation")} />
        <p className="text-sm leading-relaxed text-[color:var(--color-text)]">{t("reset.aiBody")}</p>
        <button
          type="button"
          onClick={onCheckIn}
          disabled={doneToday}
          className={[
            "w-full rounded-xl px-4 py-3 text-sm font-semibold transition-opacity",
            doneToday
              ? "cursor-default bg-[color:var(--color-surface-border)] text-[color:var(--color-secondary)]"
              : "bg-[color:var(--color-primary)] text-[color:var(--color-background)]",
          ].join(" ")}
        >
          {doneToday ? t("module.reset.done") : t("module.reset.checkin")}
        </button>
      </GlassPanel>
    </ModuleShell>
  );
}
