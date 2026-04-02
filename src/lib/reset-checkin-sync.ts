"use client";

import { getBrowserClient } from "@/lib/supabase/client";
import { localDateIso } from "@/lib/reset-daily-signals";
import { MAX_RESET_CHECKINS_PER_DAY } from "@/lib/reset-checkin";

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

function isRpcUnavailable(error: unknown) {
  const message =
    typeof error === "object" && error
      ? `${(error as { message?: string }).message ?? ""}`.toLowerCase()
      : "";
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";
  return (
    code === "PGRST202" ||
    message.includes("submit_reset_checkin") ||
    (message.includes("function") && message.includes("does not exist"))
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

  return Math.min(MAX_RESET_CHECKINS_PER_DAY, count ?? 0);
}

type RpcPayload = {
  ok?: boolean;
  code?: string;
};

export async function submitResetCheckInToSupabase(input: {
  householdId: string | null;
  score: number;
  aura: ResetAuraLevel;
  loggedOnLocal?: string;
}): Promise<{ ok: boolean; code?: "LIMIT" | "RPC_UNAVAILABLE" }> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: false };

  const day = input.loggedOnLocal ?? localDateIso();

  const { data, error } = await supabase.rpc("submit_reset_checkin", {
    p_household_id: input.householdId,
    p_score: input.score,
    p_aura: input.aura,
    p_logged_on_local: day,
  });

  if (error) {
    if (isRpcUnavailable(error)) {
      console.error(
        "RESET check-in: run supabase/reset_checkin_atomic_submit.sql so submit_reset_checkin exists.",
        error,
      );
      return { ok: false, code: "RPC_UNAVAILABLE" };
    }
    if (!isMissingSchema(error)) {
      console.error("RESET check-in RPC failed", error);
    }
    return { ok: false };
  }

  const payload = data as RpcPayload | null;
  if (!payload || payload.ok === false) {
    if (payload?.code === "LIMIT") {
      return { ok: false, code: "LIMIT" };
    }
    return { ok: false };
  }

  return { ok: true };
}
