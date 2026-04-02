"use client";

import { getBrowserClient } from "@/lib/supabase/client";
import {
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
      .select("training_week_index, wellness_onboarding_done")
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
  } | null;

  const remoteGoals = (goalsRes.data ?? [])
    .map(mapGoal)
    .filter((goal): goal is WellnessGoal => Boolean(goal));

  const remoteOnboarding =
    Boolean(trainingRow?.wellness_onboarding_done) || remoteGoals.length > 0;

  const remote: ResetWellnessV1 = {
    version: 1,
    onboardingDone: remoteOnboarding,
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
