"use client";

import { getBrowserClient } from "@/lib/supabase/client";
import { type AiProvider } from "@/lib/ai/keys";

export type HouseholdKitchenAiMeta = {
  provider: AiProvider;
  key_last_four: string | null;
  updated_at: string | null;
};

export async function fetchHouseholdKitchenAiMeta(): Promise<HouseholdKitchenAiMeta | null> {
  const supabase = getBrowserClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) return null;

  const { data, error } = await supabase
    .from("user_kitchen_ai")
    .select("provider, key_last_four, updated_at")
    .eq("user_id", user.id)
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
  provider: AiProvider;
  apiKey: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: false, message: "SUPABASE_MISSING" };

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  if (!token) return { ok: false, message: "NO_AUTH" };

  const key = input.apiKey.trim();
  if (!key) return { ok: false, message: "KEY_MISSING" };

  const res = await fetch("/api/kitchen/credentials", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      provider: input.provider,
      apiKey: key,
    }),
  });

  const payload = (await res.json().catch(() => null)) as
    | { ok?: boolean; code?: string; message?: string }
    | null;

  if (!res.ok || !payload?.ok) {
    return {
      ok: false,
      message: payload?.code ?? payload?.message ?? "SAVE_FAILED",
    };
  }

  return { ok: true };
}

export async function deleteHouseholdKitchenAi(): Promise<boolean> {
  const supabase = getBrowserClient();
  if (!supabase) return false;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  if (!token) return false;

  const res = await fetch("/api/kitchen/credentials", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.ok;
}
