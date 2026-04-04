"use client";

import { getBrowserClient } from "@/lib/supabase/client";
import {
  defaultResetOnboardingProfile,
  loadWellnessState,
  saveWellnessState,
  type BodyArea,
  type BodyGoal,
  type MeasurementEntry,
  type QuitGoal,
  type QuitSubkind,
  type ResetWellnessV1,
  type WeighInEntry,
  type WellnessGoal,
} from "@/lib/reset-wellness";

const TRACK_METRICS = ["weight", "steps", "mood", "sleep"] as const;

function isTrackMetric(value: unknown): value is ResetWellnessV1["trackMetrics"][number] {
  return typeof value === "string" && TRACK_METRICS.includes(value as (typeof TRACK_METRICS)[number]);
}

function toOnboardingProfile(value: unknown, fallback: ResetWellnessV1["onboardingProfile"]) {
  const defaults = defaultResetOnboardingProfile();
  if (!value || typeof value !== "object") return fallback;

  const raw = value as Record<string, unknown>;
  const trackMetrics = Array.isArray(raw.trackMetrics)
    ? raw.trackMetrics.filter(isTrackMetric)
    : fallback.trackMetrics;

  const quitPlanRaw = raw.quitPlan;
  const quitPlan =
    quitPlanRaw && typeof quitPlanRaw === "object"
      ? {
          habit:
            quitPlanRaw &&
            typeof (quitPlanRaw as Record<string, unknown>).habit === "string" &&
            ["smoking", "sweets", "snacking", "other"].includes((quitPlanRaw as Record<string, unknown>).habit as string)
              ? ((quitPlanRaw as Record<string, unknown>).habit as "smoking" | "sweets" | "snacking" | "other")
              : fallback.quitPlan?.habit ?? null,
          startedOn:
            typeof (quitPlanRaw as Record<string, unknown>).startedOn === "string"
              ? ((quitPlanRaw as Record<string, unknown>).startedOn as string)
              : fallback.quitPlan?.startedOn ?? null,
          approach:
            typeof (quitPlanRaw as Record<string, unknown>).approach === "string" &&
            ["quit", "reduce"].includes((quitPlanRaw as Record<string, unknown>).approach as string)
              ? ((quitPlanRaw as Record<string, unknown>).approach as "quit" | "reduce")
              : fallback.quitPlan?.approach ?? null,
        }
      : fallback.quitPlan;

  return {
    primaryGoal:
      typeof raw.primaryGoal === "string" && ["weight", "wellbeing", "sleep", "stress"].includes(raw.primaryGoal)
        ? (raw.primaryGoal as "weight" | "wellbeing" | "sleep" | "stress")
        : fallback.primaryGoal ?? defaults.primaryGoal,
    profileType:
      typeof raw.profileType === "string" && ["desk", "active", "mixed"].includes(raw.profileType)
        ? (raw.profileType as "desk" | "active" | "mixed")
        : fallback.profileType ?? defaults.profileType,
    baselineMood:
      typeof raw.baselineMood === "string" && ["low", "steady", "high"].includes(raw.baselineMood)
        ? (raw.baselineMood as "low" | "steady" | "high")
        : fallback.baselineMood ?? defaults.baselineMood,
    trackMetrics: trackMetrics.length > 0 ? trackMetrics : defaults.trackMetrics,
    checkInFrequency:
      typeof raw.checkInFrequency === "string" && ["daily", "weekdays", "three_per_week"].includes(raw.checkInFrequency)
        ? (raw.checkInFrequency as "daily" | "weekdays" | "three_per_week")
        : fallback.checkInFrequency ?? defaults.checkInFrequency,
    quitPlan:
      quitPlan && quitPlan.habit && quitPlan.startedOn && quitPlan.approach
        ? {
            habit: quitPlan.habit,
            startedOn: quitPlan.startedOn,
            approach: quitPlan.approach,
          }
        : null,
  };
}

type GoalRow = {
  id: string;
  goal_kind: "quit" | "body";
  quit_subkind: QuitSubkind | null;
  custom_label: string | null;
  started_at: string | null;
  body_mode: BodyGoal["mode"] | null;
};

type MeasurementRow = {
  id: string;
  area: BodyArea;
  value_cm: number;
  measured_at: string;
};

type WeighInRow = {
  id: string;
  kg: number;
  weighed_at: string;
};

function isMissingRelation(error: unknown) {
  const message =
    typeof error === "object" && error
      ? `${(error as { message?: string }).message ?? ""}`.toLowerCase()
      : "";
  return (
    message.includes("does not exist") ||
    message.includes("could not find") ||
    (message.includes("column") && message.includes("does not exist"))
  );
}

function hasRemoteData(state: ResetWellnessV1) {
  return (
    state.onboardingDone ||
    state.goals.length > 0 ||
    state.measurements.length > 0 ||
    state.weighIns.length > 0 ||
    state.trainingWeekIndex > 0
  );
}

function mapGoal(row: GoalRow): WellnessGoal | null {
  if (row.goal_kind === "quit" && row.quit_subkind && row.started_at) {
    return {
      id: row.id,
      kind: "quit",
      subkind: row.quit_subkind,
      customLabel: row.custom_label ?? undefined,
      startedAt: row.started_at,
    } satisfies QuitGoal;
  }

  if (row.goal_kind === "body" && row.body_mode) {
    return {
      id: row.id,
      kind: "body",
      mode: row.body_mode,
    } satisfies BodyGoal;
  }

  return null;
}

function mapMeasurement(row: MeasurementRow): MeasurementEntry {
  return {
    id: row.id,
    area: row.area,
    valueCm: Number(row.value_cm),
    at: row.measured_at,
  };
}

function mapWeighIn(row: WeighInRow): WeighInEntry {
  return {
    id: row.id,
    kg: Number(row.kg),
    at: row.weighed_at,
  };
}

export async function loadWellnessStateSynced(userId: string | null): Promise<ResetWellnessV1> {
  const local = loadWellnessState();
  if (!userId) return local;

  const supabase = getBrowserClient();
  if (!supabase) return local;

  const [goalsRes, measurementsRes, weighInsRes, trainingRes] = await Promise.all([
    supabase
      .from("reset_wellness_goals")
      .select("id, goal_kind, quit_subkind, custom_label, started_at, body_mode")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
    supabase
      .from("reset_body_measurements")
      .select("id, area, value_cm, measured_at")
      .eq("user_id", userId)
      .order("measured_at", { ascending: false }),
    supabase
      .from("reset_weigh_ins")
      .select("id, kg, weighed_at")
      .eq("user_id", userId)
      .order("weighed_at", { ascending: false }),
    supabase
      .from("reset_training_state")
      .select("training_week_index, wellness_onboarding_done, wellness_onboarding_profile")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const firstError =
    goalsRes.error ?? measurementsRes.error ?? weighInsRes.error ?? trainingRes.error;

  if (firstError) {
    if (!isMissingRelation(firstError)) {
      console.error("Failed to load synced RESET wellness", firstError);
    }
    return local;
  }

  const trainingRow = trainingRes.data as {
    training_week_index?: number | null;
    wellness_onboarding_done?: boolean | null;
    wellness_onboarding_profile?: unknown;
  } | null;

  const remoteGoals = (goalsRes.data ?? [])
    .map(mapGoal)
    .filter((goal): goal is WellnessGoal => Boolean(goal));

  const remoteOnboarding =
    Boolean(trainingRow?.wellness_onboarding_done) || remoteGoals.length > 0;

  const defaults = defaultResetOnboardingProfile();
  const onboardingProfile = toOnboardingProfile(
    trainingRow?.wellness_onboarding_profile,
    local.onboardingProfile ?? defaults,
  );

  const remote: ResetWellnessV1 = {
    version: 1,
    onboardingDone: remoteOnboarding,
    onboardingProfile,
    trackMetrics: onboardingProfile.trackMetrics,
    quitPlan: onboardingProfile.quitPlan,
    goals: remoteGoals,
    measurements: (measurementsRes.data ?? []).map(mapMeasurement),
    weighIns: (weighInsRes.data ?? []).map(mapWeighIn),
    trainingWeekIndex: Number(trainingRow?.training_week_index ?? 0) % 4,
  };

  if (!hasRemoteData(remote)) {
    return local;
  }

  saveWellnessState(remote);
  return remote;
}

export async function persistWellnessStateSynced(
  userId: string | null,
  next: ResetWellnessV1,
): Promise<void> {
  saveWellnessState(next);
  if (!userId) return;

  const supabase = getBrowserClient();
  if (!supabase) return;

  const goalRows = next.goals.map((goal) => ({
    id: goal.id,
    user_id: userId,
    goal_kind: goal.kind,
    quit_subkind: goal.kind === "quit" ? goal.subkind : null,
    custom_label: goal.kind === "quit" ? goal.customLabel ?? null : null,
    started_at: goal.kind === "quit" ? goal.startedAt : null,
    body_mode: goal.kind === "body" ? goal.mode : null,
  }));

  const measurementRows = next.measurements.map((entry) => ({
    id: entry.id,
    user_id: userId,
    area: entry.area,
    value_cm: entry.valueCm,
    measured_at: entry.at,
  }));

  const weighInRows = next.weighIns.map((entry) => ({
    id: entry.id,
    user_id: userId,
    kg: entry.kg,
    weighed_at: entry.at,
  }));

  const deleteGoals = supabase.from("reset_wellness_goals").delete().eq("user_id", userId);
  const deleteMeasurements = supabase.from("reset_body_measurements").delete().eq("user_id", userId);
  const deleteWeighIns = supabase.from("reset_weigh_ins").delete().eq("user_id", userId);

  const [{ error: deleteGoalsError }, { error: deleteMeasurementsError }, { error: deleteWeighInsError }] =
    await Promise.all([deleteGoals, deleteMeasurements, deleteWeighIns]);

  const deleteError = deleteGoalsError ?? deleteMeasurementsError ?? deleteWeighInsError;
  if (deleteError) {
    if (!isMissingRelation(deleteError)) {
      console.error("Failed to clear synced RESET wellness", deleteError);
    }
    return;
  }

  const operations = [
    goalRows.length > 0
      ? supabase.from("reset_wellness_goals").insert(goalRows)
      : Promise.resolve({ error: null }),
    measurementRows.length > 0
      ? supabase.from("reset_body_measurements").insert(measurementRows)
      : Promise.resolve({ error: null }),
    weighInRows.length > 0
      ? supabase.from("reset_weigh_ins").insert(weighInRows)
      : Promise.resolve({ error: null }),
    supabase.from("reset_training_state").upsert({
      user_id: userId,
      training_week_index: next.trainingWeekIndex % 4,
      wellness_onboarding_done: next.onboardingDone,
      wellness_onboarding_profile: next.onboardingProfile,
      updated_at: new Date().toISOString(),
    }),
  ] as const;

  const [goalsWrite, measurementsWrite, weighInsWrite, trainingWrite] = await Promise.all(operations);
  const writeError =
    goalsWrite.error ?? measurementsWrite.error ?? weighInsWrite.error ?? trainingWrite.error;

  if (writeError && !isMissingRelation(writeError)) {
    console.error("Failed to persist synced RESET wellness", writeError);
  }
}
