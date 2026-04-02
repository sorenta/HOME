"use client";

import { getBrowserClient } from "@/lib/supabase/client";

export type ResetDailySignalsRow = {
  steps: number | null;
  screen_time_minutes: number | null;
  meditation_minutes: number | null;
  mood: number | null;
  energy: number | null;
  notes_private: string | null;
};

export function localDateIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isMissingTable(error: unknown) {
  const message =
    typeof error === "object" && error
      ? `${(error as { message?: string }).message ?? ""}`.toLowerCase()
      : "";
  return message.includes("does not exist") || message.includes("could not find");
}

export async function fetchTodaySignals(
  userId: string | null,
  loggedOn: string,
): Promise<ResetDailySignalsRow | null> {
  if (!userId) return null;
  const supabase = getBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("reset_daily_signals")
    .select(
      "steps, screen_time_minutes, meditation_minutes, mood, energy, notes_private",
    )
    .eq("user_id", userId)
    .eq("logged_on", loggedOn)
    .maybeSingle();

  if (error) {
    if (!isMissingTable(error)) {
      console.error("fetchTodaySignals", error);
    }
    return null;
  }

  if (!data) return null;

  return {
    steps: data.steps != null ? Number(data.steps) : null,
    screen_time_minutes:
      data.screen_time_minutes != null ? Number(data.screen_time_minutes) : null,
    meditation_minutes:
      data.meditation_minutes != null ? Number(data.meditation_minutes) : null,
    mood: data.mood != null ? Number(data.mood) : null,
    energy: data.energy != null ? Number(data.energy) : null,
    notes_private: data.notes_private ?? null,
  };
}

export async function upsertTodaySignals(input: {
  userId: string;
  loggedOn: string;
  payload: ResetDailySignalsRow;
}): Promise<{ ok: boolean }> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: false };

  const { error } = await supabase.from("reset_daily_signals").upsert(
    {
      user_id: input.userId,
      logged_on: input.loggedOn,
      steps: input.payload.steps,
      screen_time_minutes: input.payload.screen_time_minutes,
      meditation_minutes: input.payload.meditation_minutes,
      mood: input.payload.mood,
      energy: input.payload.energy,
      notes_private: input.payload.notes_private?.trim() || null,
      source: "manual",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,logged_on" },
  );

  if (error) {
    if (!isMissingTable(error)) {
      console.error("upsertTodaySignals", error);
    }
    return { ok: false };
  }

  return { ok: true };
}

/** Neliels modifikators aura % (pēc HOME.pdf — soļi / ekrāns / meditācija). */
export function signalsScoreDelta(s: ResetDailySignalsRow | null): number {
  if (!s) return 0;
  let d = 0;
  if (s.steps != null && s.steps >= 8000) d += 4;
  else if (s.steps != null && s.steps >= 5000) d += 2;
  if (s.meditation_minutes != null && s.meditation_minutes >= 10) d += 3;
  else if (s.meditation_minutes != null && s.meditation_minutes >= 1) d += 1;
  if (s.screen_time_minutes != null && s.screen_time_minutes >= 360) d -= 6;
  else if (s.screen_time_minutes != null && s.screen_time_minutes >= 240) d -= 3;
  if (s.mood != null && s.mood >= 4) d += 2;
  if (s.energy != null && s.energy <= 2) d -= 2;
  return Math.max(-12, Math.min(12, d));
}
