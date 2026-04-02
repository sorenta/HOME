"use client";

import { getBrowserClient } from "@/lib/supabase/client";
import { getKeyLastFour, type AiProvider } from "@/lib/ai/keys";

export type HouseholdKitchenAiMeta = {
  provider: AiProvider;
  key_last_four: string | null;
  updated_at: string | null;
};

export async function fetchHouseholdKitchenAiMeta(
  householdId: string,
): Promise<HouseholdKitchenAiMeta | null> {
  const supabase = getBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("household_kitchen_ai")
    .select("provider, key_last_four, updated_at")
    .eq("household_id", householdId)
    .maybeSingle();

  if (error) {
    if (!`${error.message}`.toLowerCase().includes("does not exist")) {
      console.error("fetchHouseholdKitchenAiMeta", error);
    }
    return null;
  }

  if (!data) return null;

  const provider = data.provider === "openai" || data.provider === "gemini" ? data.provider : null;
  if (!provider) return null;

  return {
    provider,
    key_last_four: data.key_last_four ?? null,
    updated_at: data.updated_at ?? null,
  };
}

export async function upsertHouseholdKitchenAi(input: {
  householdId: string;
  userId: string;
  provider: AiProvider;
  apiKey: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: false, message: "SUPABASE_MISSING" };

  const key = input.apiKey.trim();
  if (!key) return { ok: false, message: "KEY_MISSING" };

  const { error } = await supabase.from("household_kitchen_ai").upsert(
    {
      household_id: input.householdId,
      provider: input.provider,
      api_key: key,
      key_last_four: getKeyLastFour(key),
      updated_by: input.userId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "household_id" },
  );

  if (error) {
    console.error("upsertHouseholdKitchenAi", error);
    if (`${error.message}`.toLowerCase().includes("does not exist")) {
      return { ok: false, message: "SCHEMA_MISSING" };
    }
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export async function deleteHouseholdKitchenAi(householdId: string): Promise<boolean> {
  const supabase = getBrowserClient();
  if (!supabase) return false;

  const { error } = await supabase.from("household_kitchen_ai").delete().eq("household_id", householdId);

  if (error) {
    console.error("deleteHouseholdKitchenAi", error);
    return false;
  }

  return true;
}
