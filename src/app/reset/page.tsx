"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ModuleShell } from "@/components/layout/module-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { GlassPanel } from "@/components/ui/glass-panel";
import { ResetMoodPanel } from "@/components/reset/reset-mood-panel";
import { ResetDailySignalsForm } from "@/components/reset/reset-daily-signals-form";
import { ResetBodyTracking } from "@/components/reset/reset-body-tracking";
import { ResetQuitStreak } from "@/components/reset/reset-quit-streak";
import { ResetTrainingPlan } from "@/components/reset/reset-training-plan";
import { ResetWellnessOnboarding } from "@/components/reset/reset-wellness-onboarding";
import { ResetHealthSourcesPanel } from "@/components/reset/reset-health-sources-panel";
import { HiddenSeasonalCollectible } from "@/components/seasonal/hidden-seasonal-collectible";
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
  scoreToMood,
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
import { ResetThemeLayer } from "@/components/reset/reset-theme-layer";
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
  const [checkInMessage, setCheckInMessage] = useState<"limit" | "rpc" | null>(null);
  const [empathyRecipientIds, setEmpathyRecipientIds] = useState<string[] | null>(null);

  useEffect(() => {
    let alive = true;
    const frame = requestAnimationFrame(() => {
      setCheckInCount(getTodayCheckInCount());
      setWellness(loadWellnessState());
      setHydrated(true);
    });

    void loadWellnessStateSynced(user?.id ?? null).then((next) => {
      if (alive) setWellness(next);
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
      if (alive) setMembers(next);
    });
    return () => { alive = false; };
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
    return () => { alive = false; };
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
    return () => { alive = false; };
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
  }, [bodies.length, quits.length, wellness.measurements.length, wellness.onboardingDone, wellness.weighIns.length]);

  const checkInBonus = Math.min(15, checkInCount * 5);

  const resetScoreValue = useMemo(
    () => Math.min(100, Math.max(0, baseWellnessScore + checkInBonus + signalsScoreDelta(todaySignals))),
    [baseWellnessScore, checkInBonus, todaySignals],
  );

  const partnerMood = useMemo(() => {
    if (resetScoreValue >= 75) return t("reset.mood.high");
    if (resetScoreValue >= 40) return t("reset.mood.steady");
    return t("reset.mood.low");
  }, [resetScoreValue, t]);

  const scoreAfterCheckIn = useMemo(() => {
    const d = signalsScoreDelta(todaySignals);
    if (!canCheckInToday()) return Math.min(100, baseWellnessScore + checkInBonus + d);
    const nextBonus = Math.min(15, (checkInCount + 1) * 5);
    return Math.min(100, baseWellnessScore + nextBonus + d);
  }, [baseWellnessScore, checkInCount, todaySignals]);

  const liveMetrics = useMemo((): Array<{
    label: string;
    value: string;
    tone: "neutral" | "good" | "warn" | "critical";
  }> => [
    { label: t("reset.metric.goals"), value: String(wellness.goals.length), tone: "good" },
    { label: t("reset.metric.quit"), value: String(quits.length), tone: quits.length > 0 ? "good" : "warn" },
    { label: t("reset.metric.body"), value: String(wellness.measurements.length + wellness.weighIns.length), tone: wellness.measurements.length + wellness.weighIns.length > 0 ? "good" : "warn" },
    { label: t("reset.metric.training"), value: String(trainingModes.length), tone: trainingModes.length > 0 ? "good" : "warn" },
  ], [quits.length, t, trainingModes.length, wellness.goals.length, wellness.measurements.length, wellness.weighIns.length]);

  async function onCheckIn() {
    if (!canCheckInToday()) return;
    hapticTap();
    setCheckInMessage(null);
    const mood = scoreToMood(scoreAfterCheckIn);
    if (user?.id) {
      const res = await submitResetCheckInToSupabase({
        householdId: profile?.household_id ?? null,
        score: scoreAfterCheckIn,
        mood,
        loggedOnLocal: localDateIso(),
      });
      if (!res.ok) {
        if (res.code === "LIMIT") setCheckInMessage("limit");
        else if (res.code === "RPC_UNAVAILABLE") setCheckInMessage("rpc");
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
    const base = members.length > 0 ? members : user ? [{ id: user.id, display_name: profile?.display_name ?? user.email?.split("@")[0] ?? null, role_label: profile?.role_label ?? null, is_me: true } satisfies HouseholdMember] : [];
    if (empathyRecipientIds != null && empathyRecipientIds.length > 0) return base.filter((m) => empathyRecipientIds.includes(m.id));
    return base;
  }, [empathyRecipientIds, members, profile?.display_name, profile?.role_label, user]);

  const showOnboarding = hydrated && (!wellness.onboardingDone || showGoalEditor);

  return (
    <ModuleShell title={t("tile.reset")} moduleId="reset">
     <ResetThemeLayer>
      <HiddenSeasonalCollectible spotId="reset" />
      {showOnboarding && (
        <ResetWellnessOnboarding
          onComplete={(goals) => onSurveyComplete(goals)}
          onSkip={onSurveySkip}
        />
      )}

      {hydrated && wellness.onboardingDone && (
        <GlassPanel className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <SectionHeading title={t("reset.wellness.summaryTitle")} />
            <button
              onClick={() => { hapticTap(); setShowGoalEditor(true); }}
              className="rounded-theme border border-border bg-background/50 px-4 py-2 text-xs font-bold text-foreground hover:bg-primary/5 transition-all"
            >
              {t("reset.wellness.editGoals")}
            </button>
          </div>
          {wellness.goals.length === 0 ? (
            <p className="text-sm text-foreground/60 italic">{t("reset.wellness.noGoalsHint")}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {wellness.goals.map((g) => (
                <StatusPill key={g.id} tone="neutral">
                  {g.kind === "quit"
                    ? (g.subkind === "custom" && g.customLabel ? g.customLabel : t(`reset.wellness.quit.${g.subkind}`))
                    : t(`reset.wellness.body.${g.mode}`)}
                </StatusPill>
              ))}
            </div>
          )}
        </GlassPanel>
      )}

      {hydrated && quits.length > 0 && <ResetQuitStreak goals={quits} />}
      {hydrated && bodies.length > 0 && <ResetBodyTracking state={wellness} onUpdate={persistWellness} />}
      
      {hydrated && hasTrainingRelevantBodyGoal(wellness.goals) && trainingModes.map((mode) => (
        <ResetTrainingPlan key={mode} mode={mode} state={wellness} onUpdate={persistWellness} />
      ))}

      {hydrated && wellness.onboardingDone && <ResetHealthSourcesPanel />}

      {hydrated && wellness.onboardingDone && (
        <ResetDailySignalsForm
          userId={user?.id ?? null}
          onSaved={() => setSignalsVersion((v) => v + 1)}
        />
      )}

      <GlassPanel className="space-y-4">
        <p className="text-sm leading-relaxed text-foreground/80">
          {t("module.reset.blurb")}
        </p>
        <ResetMoodPanel
          scorePercent={resetScoreValue}
          scoreLabel={t("reset.score")}
          partnerLabel={t("reset.partnerMood")}
          partnerValue={partnerMood}
          partnerHint={t("reset.partnerMoodHint")}
        />
      </GlassPanel>

      <GlassPanel className="space-y-4">
        <SectionHeading title={t("reset.metrics")} />
        <div className="grid gap-2">
          {liveMetrics.map((metric) => (
            <div
              key={metric.label}
              className="flex items-center justify-between gap-3 rounded-theme border border-border bg-background/40 px-4 py-3"
            >
              <p className="text-sm font-bold text-foreground">{metric.label}</p>
              <StatusPill tone={metric.tone}>{metric.value}</StatusPill>
            </div>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-4">
        <SectionHeading title={t("reset.privacy")} />
        <p className="text-sm leading-relaxed text-foreground/70">
          {t("reset.privacyBody")}
        </p>
        <div className="flex flex-wrap gap-2">
          {privacyMembers.map((member) => (
            <StatusPill key={member.id} tone="neutral">
              {member.display_name ?? t("household.membersList.member")} — {t("reset.seesMoodOnly")}
            </StatusPill>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-5">
        <div className="space-y-2">
          <SectionHeading title={t("reset.recommendation")} />
          <p className="text-sm leading-relaxed text-foreground">{t("reset.aiBody")}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">
            {t("reset.checkin.limitHint", { max: String(MAX_RESET_CHECKINS_PER_DAY) })}
          </p>
        </div>
        
        <button
          onClick={() => void onCheckIn()}
          disabled={!canCheckInToday()}
          className={[
            "w-full rounded-theme py-4 text-sm font-black tracking-tight transition-all shadow-md",
            !canCheckInToday()
              ? "bg-border text-foreground/40 cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98]",
          ].join(" ")}
        >
          {!canCheckInToday()
            ? t("module.reset.doneDay", { n: String(MAX_RESET_CHECKINS_PER_DAY) })
            : t("module.reset.checkinWithCount", {
                current: String(checkInCount + 1),
                max: String(MAX_RESET_CHECKINS_PER_DAY),
              })}
        </button>
        
        {checkInMessage && (
          <p className="text-xs font-bold text-center text-red-500">
            {checkInMessage === "limit" ? t("reset.checkin.limitReached") : t("reset.checkin.rpcUnavailable")}
          </p>
        )}
      </GlassPanel>
     </ResetThemeLayer>
    </ModuleShell>
  );
}