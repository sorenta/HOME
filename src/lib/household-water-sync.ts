"use client";

import { getBrowserClient } from "@/lib/supabase/client";
import {
  addWater,
  defaultWaterState,
  loadWaterState,
  saveWaterState,
  type HouseholdWaterV1,
  type WaterAchievementCounts,
} from "@/lib/household-water-local";

type WaterLogRow = {
  logged_on: string;
  user_id: string;
  ml: number;
};

type WaterMedalRow = {
  user_id: string;
  gold_count: number;
  silver_count: number;
  bronze_count: number;
  last_settled_on: string | null;
};

function isMissingRelation(error: unknown) {
  const message =
    typeof error === "object" && error
      ? `${(error as { message?: string }).message ?? ""}`.toLowerCase()
      : "";
  return message.includes("does not exist") || message.includes("could not find");
}

function emptyAchievements(): WaterAchievementCounts {
  return { gold: 0, silver: 0, bronze: 0 };
}

function hasLocalWaterData(state: HouseholdWaterV1) {
  return (
    Object.keys(state.byDate).length > 0 ||
    Object.keys(state.achievements).length > 0 ||
    state.settledForDay.length > 0
  );
}

function buildRemoteWaterState(
  scopeId: string,
  logs: WaterLogRow[],
  medals: WaterMedalRow[],
): HouseholdWaterV1 {
  const state = defaultWaterState(scopeId);

  for (const row of logs) {
    const day = state.byDate[row.logged_on] ?? {};
    day[row.user_id] = Number(row.ml);
    state.byDate[row.logged_on] = day;
  }

  for (const row of medals) {
    state.achievements[row.user_id] = {
      gold: Number(row.gold_count ?? 0),
      silver: Number(row.silver_count ?? 0),
      bronze: Number(row.bronze_count ?? 0),
    };
    if (row.last_settled_on) {
      state.settledForDay.push(`remote-${row.last_settled_on}`);
    }
  }

  return state;
}

export async function loadWaterStateSynced(input: {
  scopeId: string;
  householdId: string | null;
  currentUserId: string | null;
}): Promise<HouseholdWaterV1> {
  const local = loadWaterState(input.scopeId);
  if (!input.householdId || !input.currentUserId) {
    return local;
  }

  const supabase = getBrowserClient();
  if (!supabase) return local;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayIso = yesterday.toISOString().slice(0, 10);

  const settleRes = await supabase.rpc("settle_household_water_medals", {
    p_household_id: input.householdId,
    p_target_date: yesterdayIso,
  });

  if (settleRes.error && !isMissingRelation(settleRes.error)) {
    console.error("Failed to settle household water medals", settleRes.error);
  }

  const [logsRes, medalsRes] = await Promise.all([
    supabase
      .from("household_water_logs")
      .select("logged_on, user_id, ml")
      .eq("household_id", input.householdId),
    supabase
      .from("household_water_medals")
      .select("user_id, gold_count, silver_count, bronze_count, last_settled_on")
      .eq("household_id", input.householdId),
  ]);

  const firstError = logsRes.error ?? medalsRes.error;
  if (firstError) {
    if (!isMissingRelation(firstError)) {
      console.error("Failed to load synced household water", firstError);
    }
    return local;
  }

  const remote = buildRemoteWaterState(input.scopeId, logsRes.data ?? [], medalsRes.data ?? []);
  if (!hasLocalWaterData(remote) && hasLocalWaterData(local)) {
    return local;
  }

  saveWaterState(remote);
  return remote;
}

export async function addWaterSynced(input: {
  scopeId: string;
  householdId: string | null;
  currentUserId: string | null;
  memberId: string;
  date: string;
  deltaMl: number;
  currentState: HouseholdWaterV1;
}): Promise<HouseholdWaterV1> {
  const optimistic = addWater(input.currentState, input.date, input.memberId, input.deltaMl);
  saveWaterState(optimistic);

  if (!input.householdId || !input.currentUserId || input.memberId !== input.currentUserId) {
    return optimistic;
  }

  const supabase = getBrowserClient();
  if (!supabase) return optimistic;

  const rpcRes = await supabase.rpc("add_household_water", {
    p_household_id: input.householdId,
    p_delta_ml: input.deltaMl,
    p_logged_on: input.date,
  });

  if (rpcRes.error) {
    if (!isMissingRelation(rpcRes.error)) {
      console.error("Failed to sync household water", rpcRes.error);
    }
    return optimistic;
  }

  return loadWaterStateSynced({
    scopeId: input.scopeId,
    householdId: input.householdId,
    currentUserId: input.currentUserId,
  });
}

export async function loadUserWaterMedals(input: {
  scopeId: string;
  householdId: string | null;
  userId: string;
}): Promise<WaterAchievementCounts> {
  const local = loadWaterState(input.scopeId).achievements[input.userId] ?? emptyAchievements();
  if (!input.householdId) return local;

  const supabase = getBrowserClient();
  if (!supabase) return local;

  const { data, error } = await supabase
    .from("household_water_medals")
    .select("gold_count, silver_count, bronze_count")
    .eq("household_id", input.householdId)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (error) {
    if (!isMissingRelation(error)) {
      console.error("Failed to load household water medals", error);
    }
    return local;
  }

  return data
    ? {
        gold: Number(data.gold_count ?? 0),
        silver: Number(data.silver_count ?? 0),
        bronze: Number(data.bronze_count ?? 0),
      }
    : local;
}

export function subscribeHouseholdWater(
  householdId: string | null,
  onChange: () => void,
): (() => void) | null {
  if (!householdId) return null;
  const supabase = getBrowserClient();
  if (!supabase) return null;

  const channel = supabase
    .channel(`household-water:${householdId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "household_water_logs",
        filter: `household_id=eq.${householdId}`,
      },
      onChange,
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "household_water_medals",
        filter: `household_id=eq.${householdId}`,
      },
      onChange,
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
