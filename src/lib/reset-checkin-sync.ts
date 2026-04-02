"use client";

import { getBrowserClient } from "@/lib/supabase/client";
import { localDateIso } from "@/lib/reset-daily-signals";

function isMissingSchema(error: unknown) {
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

export type ResetAuraLevel = "low" | "steady" | "high";

export function scoreToAura(score: number): ResetAuraLevel {
  if (score >= 75) return "high";
  if (score >= 40) return "steady";
  return "low";
}

export async function fetchTodayCheckInCount(input: {
  userId: string;
  loggedOnLocal: string;
}): Promise<number> {
  const supabase = getBrowserClient();
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from("reset_checkins")
    .select("*", { count: "exact", head: true })
    .eq("user_id", input.userId)
    .eq("logged_on_local", input.loggedOnLocal);

  if (error) {
    if (!isMissingSchema(error)) {
      console.error("fetchTodayCheckInCount", error);
    }
    return 0;
  }

  return count ?? 0;
}

export async function submitResetCheckInToSupabase(input: {
  userId: string;
  householdId: string | null;
  score: number;
  aura: ResetAuraLevel;
  loggedOnLocal?: string;
}): Promise<{ ok: boolean; code?: "LIMIT" }> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: false };

  const day = input.loggedOnLocal ?? localDateIso();

  const { count: beforeRaw, error: countError } = await supabase
    .from("reset_checkins")
    .select("*", { count: "exact", head: true })
    .eq("user_id", input.userId)
    .eq("logged_on_local", day);

  let before = beforeRaw ?? 0;
  if (countError) {
    if (isMissingSchema(countError)) {
      before = 0;
    } else {
      console.error("RESET check-in count failed", countError);
      return { ok: false };
    }
  }

  if (before >= 3) {
    return { ok: false, code: "LIMIT" };
  }

  const row: Record<string, unknown> = {
    user_id: input.userId,
    household_id: input.householdId,
    score: input.score,
    aura: input.aura,
    happened_at: new Date().toISOString(),
    logged_on_local: day,
  };

  const { error: insertError } = await supabase.from("reset_checkins").insert(row);

  if (insertError) {
    if (isMissingSchema(insertError)) {
      const { error: legacyInsert } = await supabase.from("reset_checkins").insert({
        user_id: input.userId,
        household_id: input.householdId,
        score: input.score,
        aura: input.aura,
        happened_at: new Date().toISOString(),
      });
      if (legacyInsert) {
        console.error("RESET check-in insert failed", legacyInsert);
        return { ok: false };
      }
    } else {
      console.error("RESET check-in insert failed", insertError);
      return { ok: false };
    }
  }

  const { data: scores, error: scoresError } = await supabase
    .from("reset_checkins")
    .select("score")
    .eq("user_id", input.userId)
    .eq("logged_on_local", day);

  let avg = input.score;
  if (!scoresError && scores?.length) {
    const sum = scores.reduce((a, r) => a + Number((r as { score: number }).score), 0);
    avg = Math.round(sum / scores.length);
  } else if (scoresError && isMissingSchema(scoresError)) {
    avg = input.score;
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      reset_score: avg,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.userId);

  if (profileError) {
    console.error("RESET profile score update failed", profileError);
    return { ok: false };
  }

  return { ok: true };
}
