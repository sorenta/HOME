"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ModuleShell } from "@/components/layout/module-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { GlassPanel } from "@/components/ui/glass-panel";
import { ResetAuraGlow } from "@/components/reset/reset-aura-glow";
import { ResetDailySignalsForm } from "@/components/reset/reset-daily-signals-form";
import { ResetBodyTracking } from "@/components/reset/reset-body-tracking";
import { ResetQuitStreak } from "@/components/reset/reset-quit-streak";
import { ResetTrainingPlan } from "@/components/reset/reset-training-plan";
import { ResetWellnessOnboarding } from "@/components/reset/reset-wellness-onboarding";
import { ResetHealthSourcesPanel } from "@/components/reset/reset-health-sources-panel";
import { useI18n } from "@/lib/i18n/i18n-context";
import { hapticTap } from "@/lib/haptic";
import {
  appendCheckInLocal,
  canCheckInToday,
  getTodayCheckInCount,
  MAX_RESET_CHECKINS_PER_DAY,
  setTodayCheckInCountFromServer,
} from "@/lib/reset-checkin";
import {
  fetchTodayCheckInCount,
  scoreToAura,
  submitResetCheckInToSupabase,
} from "@/lib/reset-checkin-sync";
import {
  fetchTodaySignals,
  localDateIso,
  signalsScoreDelta,
  type ResetDailySignalsRow,
} from "@/lib/reset-daily-signals";
import {
  loadWellnessStateSynced,
  persistWellnessStateSynced,
} from "@/lib/reset-wellness-sync";
import { useAuth } from "@/components/providers/auth-provider";
import { fetchMyHouseholdMembers, type HouseholdMember } from "@/lib/household";
import {
  bodyGoals,
  defaultWellnessState,
  hasTrainingRelevantBodyGoal,
  loadWellnessState,
  quitGoals,
  type ResetWellnessV1,
  type WellnessGoal,
} from "@/lib/reset-wellness";
import { getBrowserClient } from "@/lib/supabase/client";

export default function ResetPage() {
  const { t } = useI18n();
  const { user, profile, refreshProfile } = useAuth();
  const [checkInCount, setCheckInCount] = useState(0);
  const [wellness, setWellness] = useState<ResetWellnessV1>(defaultWellnessState);
  const [hydrated, setHydrated] = useState(false);
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [todaySignals, setTodaySignals] = useState<ResetDailySignalsRow | null>(null);
  const [signalsVersion, setSignalsVersion] = useState(0);
  const [checkInMessage, setCheckInMessage] = useState<"limit" | null>(null);
  const [empathyRecipientIds, setEmpathyRecipientIds] = useState<string[] | null>(null);

  useEffect(() => {
    let alive = true;
    const frame = requestAnimationFrame(() => {
      setCheckInCount(getTodayCheckInCount());
      setWellness(loadWellnessState());
      setHydrated(true);
    });

    void loadWellnessStateSynced(user?.id ?? null).then((next) => {
      if (alive) {
        setWellness(next);
      }
    });

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const day = localDateIso();
    void fetchTodayCheckInCount({ userId: user.id, loggedOnLocal: day }).then((n) => {
      setTodayCheckInCountFromServer(n);
      setCheckInCount(getTodayCheckInCount());
    });
  }, [user?.id]);

  useEffect(() => {
    let alive = true;
    void fetchMyHouseholdMembers().then((next) => {
      if (alive) {
        setMembers(next);
      }
    });
    return () => {
      alive = false;
    };
  }, [profile?.household_id]);

  useEffect(() => {
    if (!user?.id) {
      setEmpathyRecipientIds(null);
      return;
    }
    const supabase = getBrowserClient();
    if (!supabase) return;
    let alive = true;
    void supabase
      .from("notification_preferences")
      .select("reset_empathy_recipient_ids")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!alive) return;
        if (error || !data) {
          setEmpathyRecipientIds([]);
          return;
        }
        const raw = (data as { reset_empathy_recipient_ids?: string[] | null })
          .reset_empathy_recipient_ids;
        setEmpathyRecipientIds(Array.isArray(raw) ? raw : []);
      });
    return () => {
      alive = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setTodaySignals(null);
      return;
    }
    let alive = true;
    const day = localDateIso();
    void fetchTodaySignals(user.id, day).then((row) => {
      if (alive) setTodaySignals(row);
    });
    return () => {
      alive = false;
    };
  }, [user?.id, signalsVersion]);

  const persistWellness = useCallback((next: ResetWellnessV1) => {
    setWellness(next);
    void persistWellnessStateSynced(user?.id ?? null, next);
  }, [user?.id]);

  const onSurveyComplete = useCallback(
    (goals: WellnessGoal[]) => {
      setWellness((prev) => {
        const next = { ...prev, goals, onboardingDone: true };
        void persistWellnessStateSynced(user?.id ?? null, next);
        return next;
      });
      setShowGoalEditor(false);
    },
    [user?.id],
  );

  const onSurveySkip = useCallback(() => {
    setWellness((prev) => {
      const next = { ...prev, onboardingDone: true };
      void persistWellnessStateSynced(user?.id ?? null, next);
      return next;
    });
    setShowGoalEditor(false);
  }, [user?.id]);

  const quits = useMemo(() => quitGoals(wellness.goals), [wellness.goals]);
  const bodies = useMemo(() => bodyGoals(wellness.goals), [wellness.goals]);
  const trainingModes = useMemo(() => {
    const modes = bodies
      .filter((b) => b.mode === "bulk" || b.mode === "lean")
      .map((b) => b.mode);
    return [...new Set(modes)];
  }, [bodies]);

  const baseWellnessScore = useMemo(() => {
    let score = wellness.onboardingDone ? 20 : 0;
    score += quits.length * 15;
    score += bodies.length * 15;
    score += Math.min(20, wellness.measurements.length * 4);
    score += Math.min(20, wellness.weighIns.length * 5);
    return score;
  }, [
    bodies.length,
    quits.length,
    wellness.measurements.length,
    wellness.onboardingDone,
    wellness.weighIns.length,
  ]);

  const checkInBonus = Math.min(15, checkInCount * 5);

  const resetScoreValue = useMemo(
    () =>
      Math.min(
        100,
        Math.max(0, baseWellnessScore + checkInBonus + signalsScoreDelta(todaySignals)),
      ),
    [baseWellnessScore, checkInBonus, todaySignals],
  );

  const partnerGlow = useMemo(() => {
    if (resetScoreValue >= 75) return t("reset.aura.high");
    if (resetScoreValue >= 40) return t("reset.aura.steady");
    return t("reset.aura.low");
  }, [resetScoreValue, t]);

  const scoreAfterCheckIn = useMemo(() => {
    const d = signalsScoreDelta(todaySignals);
    if (!canCheckInToday()) {
      return Math.min(100, baseWellnessScore + checkInBonus + d);
    }
    const nextBonus = Math.min(15, (checkInCount + 1) * 5);
    return Math.min(100, baseWellnessScore + nextBonus + d);
  }, [baseWellnessScore, checkInCount, todaySignals]);

  const liveMetrics = useMemo(
    () => [
      { label: t("reset.metric.goals"), value: String(wellness.goals.length), tone: "good" as const },
      { label: t("reset.metric.quit"), value: String(quits.length), tone: quits.length > 0 ? ("good" as const) : ("warn" as const) },
      {
        label: t("reset.metric.body"),
        value: String(wellness.measurements.length + wellness.weighIns.length),
        tone:
          wellness.measurements.length + wellness.weighIns.length > 0
            ? ("good" as const)
            : ("warn" as const),
      },
      {
        label: t("reset.metric.training"),
        value: String(trainingModes.length),
        tone: trainingModes.length > 0 ? ("good" as const) : ("warn" as const),
      },
    ],
    [
      quits.length,
      t,
      trainingModes.length,
      wellness.goals.length,
      wellness.measurements.length,
      wellness.weighIns.length,
    ],
  );

  async function onCheckIn() {
    if (!canCheckInToday()) return;
    hapticTap();
    setCheckInMessage(null);
    const aura = scoreToAura(scoreAfterCheckIn);
    if (user?.id) {
      const res = await submitResetCheckInToSupabase({
        userId: user.id,
        householdId: profile?.household_id ?? null,
        score: scoreAfterCheckIn,
        aura,
        loggedOnLocal: localDateIso(),
      });
      if (!res.ok) {
        if (res.code === "LIMIT") {
          setCheckInMessage("limit");
        }
        return;
      }
      appendCheckInLocal();
      setCheckInCount(getTodayCheckInCount());
      await refreshProfile();
      return;
    }
    appendCheckInLocal();
    setCheckInCount(getTodayCheckInCount());
  }

  const privacyMembers = useMemo(() => {
    const base =
      members.length > 0
        ? members
        : user
          ? [
              {
                id: user.id,
                display_name: profile?.display_name ?? user.email?.split("@")[0] ?? null,
                role_label: profile?.role_label ?? null,
                is_me: true,
              } satisfies HouseholdMember,
            ]
          : [];
    if (empathyRecipientIds != null && empathyRecipientIds.length > 0) {
      return base.filter((m) => empathyRecipientIds.includes(m.id));
    }
    return base;
  }, [empathyRecipientIds, members, profile?.display_name, profile?.role_label, user]);

  const showOnboarding = hydrated && (!wellness.onboardingDone || showGoalEditor);

  return (
    <ModuleShell title={t("tile.reset")} moduleId="reset">
      {showOnboarding ? (
        <ResetWellnessOnboarding
          onComplete={(goals, _startedAtIso) => onSurveyComplete(goals)}
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

      {hydrated && bodyGoals(wellness.goals).length > 0 ? (
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

      {hydrated && wellness.onboardingDone ? <ResetHealthSourcesPanel /> : null}

      {hydrated && wellness.onboardingDone ? (
        <ResetDailySignalsForm
          userId={user?.id ?? null}
          onSaved={() => setSignalsVersion((v) => v + 1)}
        />
      ) : null}

      <GlassPanel className="space-y-3">
        <p className="text-sm leading-relaxed text-[color:var(--color-secondary)]">
          {t("module.reset.blurb")}
        </p>
        <ResetAuraGlow
          scorePercent={resetScoreValue}
          scoreLabel={t("reset.score")}
          partnerLabel={t("reset.partnerAura")}
          partnerValue={partnerGlow}
          partnerHint={t("reset.partnerAuraHint")}
        />
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <SectionHeading title={t("reset.metrics")} />
        <div className="space-y-2">
          {liveMetrics.map((metric) => (
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
          {privacyMembers.map((member) => (
            <StatusPill key={member.id} tone="neutral">
              {member.display_name ?? t("household.membersList.member")} — {t("reset.seesGlowOnly")}
            </StatusPill>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-4">
        <SectionHeading title={t("reset.recommendation")} />
        <p className="text-sm leading-relaxed text-[color:var(--color-text)]">{t("reset.aiBody")}</p>
        <p className="text-xs text-[color:var(--color-secondary)]">
          {t("reset.checkin.limitHint", { max: String(MAX_RESET_CHECKINS_PER_DAY) })}
        </p>
        <button
          type="button"
          onClick={() => void onCheckIn()}
          disabled={!canCheckInToday()}
          className={[
            "w-full rounded-xl px-4 py-3 text-sm font-semibold transition-opacity",
            !canCheckInToday()
              ? "cursor-default bg-[color:var(--color-surface-border)] text-[color:var(--color-secondary)]"
              : "bg-[color:var(--color-primary)] text-[color:var(--color-background)]",
          ].join(" ")}
        >
          {!canCheckInToday()
            ? t("module.reset.doneDay", { n: String(MAX_RESET_CHECKINS_PER_DAY) })
            : t("module.reset.checkinWithCount", {
                current: String(checkInCount + 1),
                max: String(MAX_RESET_CHECKINS_PER_DAY),
              })}
        </button>
        {checkInMessage === "limit" ? (
          <p className="text-sm text-rose-600 dark:text-rose-400">{t("reset.checkin.limitReached")}</p>
        ) : null}
      </GlassPanel>
    </ModuleShell>
  );
}
