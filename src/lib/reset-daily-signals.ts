"use client";

import { getBrowserClient } from "@/lib/supabase/client";
import { decryptResetNote, encryptResetNote } from "@/lib/reset-notes-crypto";

export type ResetDailySignalsRow = {
  steps: number | null;
  screen_time_minutes: number | null;
  meditation_minutes: number | null;
  sleep_bedtime: string | null;
  sleep_wake_time: string | null;
  mood: number | null;
  energy: number | null;
  notes_private: string | null;
};

export type ResetDailySignalHistoryRow = ResetDailySignalsRow & {
  logged_on: string;
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
      "steps, screen_time_minutes, meditation_minutes, sleep_bedtime, sleep_wake_time, mood, energy, notes_private",
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

  const rawNotes = data.notes_private as string | null;
  let notes_private: string | null = null;
  if (rawNotes) {
    if (rawNotes.startsWith("v1:")) {
      notes_private = await decryptResetNote(rawNotes);
    } else {
      notes_private = rawNotes;
    }
  }

  return {
    steps: data.steps != null ? Number(data.steps) : null,
    screen_time_minutes:
      data.screen_time_minutes != null ? Number(data.screen_time_minutes) : null,
    meditation_minutes:
      data.meditation_minutes != null ? Number(data.meditation_minutes) : null,
    sleep_bedtime:
      typeof data.sleep_bedtime === "string" && data.sleep_bedtime.length > 0
        ? data.sleep_bedtime
        : null,
    sleep_wake_time:
      typeof data.sleep_wake_time === "string" && data.sleep_wake_time.length > 0
        ? data.sleep_wake_time
        : null,
    mood: data.mood != null ? Number(data.mood) : null,
    energy: data.energy != null ? Number(data.energy) : null,
    notes_private,
  };
}

export async function fetchRecentSignals(
  userId: string | null,
  days: number,
): Promise<ResetDailySignalHistoryRow[]> {
  if (!userId) return [];
  const supabase = getBrowserClient();
  if (!supabase) return [];

  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  const sinceIso = since.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("reset_daily_signals")
    .select(
      "logged_on, steps, screen_time_minutes, meditation_minutes, sleep_bedtime, sleep_wake_time, mood, energy, notes_private",
    )
    .eq("user_id", userId)
    .gte("logged_on", sinceIso)
    .order("logged_on", { ascending: true });

  if (error) {
    if (!isMissingTable(error)) {
      console.error("fetchRecentSignals", error);
    }
    return [];
  }

  return Promise.all(
    (data ?? []).map(async (row) => {
      const rawNotes = row.notes_private as string | null;
      let notes_private: string | null = null;
      if (rawNotes) {
        notes_private = rawNotes.startsWith("v1:") ? await decryptResetNote(rawNotes) : rawNotes;
      }

      return {
        logged_on: row.logged_on as string,
        steps: row.steps != null ? Number(row.steps) : null,
        screen_time_minutes:
          row.screen_time_minutes != null ? Number(row.screen_time_minutes) : null,
        meditation_minutes:
          row.meditation_minutes != null ? Number(row.meditation_minutes) : null,
        sleep_bedtime:
          typeof row.sleep_bedtime === "string" && row.sleep_bedtime.length > 0
            ? row.sleep_bedtime
            : null,
        sleep_wake_time:
          typeof row.sleep_wake_time === "string" && row.sleep_wake_time.length > 0
            ? row.sleep_wake_time
            : null,
        mood: row.mood != null ? Number(row.mood) : null,
        energy: row.energy != null ? Number(row.energy) : null,
        notes_private,
      } satisfies ResetDailySignalHistoryRow;
    }),
  );
}

export function sleepDurationMinutes(
  input: Pick<ResetDailySignalsRow, "sleep_bedtime" | "sleep_wake_time"> | null,
): number | null {
  if (!input?.sleep_bedtime || !input.sleep_wake_time) return null;

  const [bedHour, bedMinute] = input.sleep_bedtime.split(":").map(Number);
  const [wakeHour, wakeMinute] = input.sleep_wake_time.split(":").map(Number);
  if (
    !Number.isInteger(bedHour) ||
    !Number.isInteger(bedMinute) ||
    !Number.isInteger(wakeHour) ||
    !Number.isInteger(wakeMinute)
  ) {
    return null;
  }

  const bedTotal = bedHour * 60 + bedMinute;
  const wakeTotal = wakeHour * 60 + wakeMinute;
  const delta = wakeTotal >= bedTotal ? wakeTotal - bedTotal : 24 * 60 - bedTotal + wakeTotal;
  return delta > 0 ? delta : null;
}

export async function upsertTodaySignals(input: {
  userId: string;
  loggedOn: string;
  payload: ResetDailySignalsRow;
}): Promise<{ ok: boolean }> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: false };

  let notesStored: string | null = null;
  const nt = input.payload.notes_private?.trim();
  if (nt) {
    notesStored = (await encryptResetNote(nt)) ?? nt;
  }

  const { error } = await supabase.from("reset_daily_signals").upsert(
    {
      user_id: input.userId,
      logged_on: input.loggedOn,
      steps: input.payload.steps,
      screen_time_minutes: input.payload.screen_time_minutes,
      meditation_minutes: input.payload.meditation_minutes,
      sleep_bedtime: input.payload.sleep_bedtime,
      sleep_wake_time: input.payload.sleep_wake_time,
      mood: input.payload.mood,
      energy: input.payload.energy,
      notes_private: notesStored,
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

/** Neliels modifikators mood % (pēc HOME.pdf — soļi / ekrāns / meditācija). */
export function signalsScoreDelta(s: ResetDailySignalsRow | null): number {
  if (!s) return 0;
  let d = 0;
  if (s.steps != null && s.steps >= 8000) d += 4;
  else if (s.steps != null && s.steps >= 5000) d += 2;
  if (s.meditation_minutes != null && s.meditation_minutes >= 10) d += 3;
  else if (s.meditation_minutes != null && s.meditation_minutes >= 1) d += 1;
  if (s.screen_time_minutes != null && s.screen_time_minutes >= 360) d -= 6;
  else if (s.screen_time_minutes != null && s.screen_time_minutes >= 240) d -= 3;
  const sleepMinutes = sleepDurationMinutes(s);
  if (sleepMinutes != null && sleepMinutes >= 420 && sleepMinutes <= 540) d += 3;
  else if (sleepMinutes != null && sleepMinutes < 360) d -= 4;
  if (s.mood != null && s.mood >= 4) d += 2;
  if (s.energy != null && s.energy <= 2) d -= 2;
  return Math.max(-12, Math.min(12, d));
}
