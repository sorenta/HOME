"use client";

import { getBrowserClient } from "@/lib/supabase/client";

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

export async function submitResetCheckInToSupabase(input: {
  userId: string;
  householdId: string | null;
  score: number;
  aura: ResetAuraLevel;
}): Promise<{ ok: boolean }> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: false };

  const { error: insertError } = await supabase.from("reset_checkins").insert({
    user_id: input.userId,
    household_id: input.householdId,
    score: input.score,
    aura: input.aura,
    happened_at: new Date().toISOString(),
  });

  if (insertError) {
    if (!isMissingSchema(insertError)) {
      console.error("RESET check-in insert failed", insertError);
    }
    return { ok: false };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      reset_score: input.score,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.userId);

  if (profileError) {
    console.error("RESET profile score update failed", profileError);
    return { ok: false };
  }

  return { ok: true };
}
