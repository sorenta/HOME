"use client";

import { useCallback, useEffect, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { useI18n } from "@/lib/i18n/i18n-context";
import { hapticTap } from "@/lib/haptic";
import {
  fetchTodaySignals,
  localDateIso,
  sleepDurationMinutes,
  type ResetDailySignalsRow,
  upsertTodaySignals,
} from "@/lib/reset-daily-signals";
import { QuitStreakProgressRing } from "@/components/reset/QuitStreakProgressRing";
import { useThemeActionEffects } from "@/components/theme/theme-action-effects";
import { ThemedFeedback } from "@/components/ui/themed-feedback";

import { type ResetTrackMetric } from "@/lib/reset-wellness";

type Props = {
  userId: string | null;
  trackMetrics: ResetTrackMetric[];
  onSaved?: () => void;
};

function emptyForm(): ResetDailySignalsRow {
  return {
    steps: null,
    screen_time_minutes: null,
    meditation_minutes: null,
    sleep_bedtime: null,
    sleep_wake_time: null,
    mood: null,
    energy: null,
    notes_private: null,
  };
}

function parseOptInt(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number(t.replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

function generateQuickInsight(form: ResetDailySignalsRow, locale: string): string {
  if (form.mood && form.mood >= 4) {
    return locale === "lv" 
      ? "Paldies! Izskatās, ka šī bija laba diena. Tavi rādītāji iedvesmo." 
      : "Thank you! Looks like a great day. Your stats are inspiring.";
  }
  if (form.sleep_wake_time && form.sleep_wake_time >= "08:00" && form.energy && form.energy >= 4) {
    return locale === "lv"
      ? "Lielisks miegs izskatās atmaksājies ar labu enerģiju. Turpini šādi!"
      : "Great sleep seems to pay off with good energy. Keep it up!";
  }
  if (form.steps && form.steps > 8000) {
    return locale === "lv"
      ? "Aktīva diena! Tavs ķermenis pateiksies par šo kustību."
      : "Active day! Your body will thank you for the movement.";
  }
  if (form.meditation_minutes && form.meditation_minutes > 0) {
    return locale === "lv"
      ? "Lieliski, ka atradi laiku mirklim miera."
      : "Great job finding time for a moment of peace.";
  }
  return locale === "lv"
    ? "Paldies! Šodienas ritms ir saglabāts tavā privātajā arhīvā."
    : "Thank you! Today's rhythm is safely stored in your private archive.";
}

/* ── Shared input classes ── */
const inputCls =
  "mt-1 w-full rounded-xl border border-(--color-surface-border) bg-background px-3 py-2 text-sm text-(--color-text)";

export function ResetDailySignalsForm({ userId, trackMetrics, onSaved }: Props) {
  const { t, locale } = useI18n();
  const { triggerThemeActionEffect } = useThemeActionEffects();
  const [form, setForm] = useState<ResetDailySignalsRow>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<"ok" | "err" | null>(null);
  const loggedOn = localDateIso();

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!userId) {
      if (signal?.aborted) return;
      setForm(emptyForm());
      setLoading(false);
      return;
    }
    if (signal?.aborted) return;
    setLoading(true);
    const row = await fetchTodaySignals(userId, loggedOn);
    if (signal?.aborted) return;
    setForm(
      row ?? {
        steps: null,
        screen_time_minutes: null,
        meditation_minutes: null,
        sleep_bedtime: null,
        sleep_wake_time: null,
        mood: null,
        energy: null,
        notes_private: null,
      },
    );
    setLoading(false);
  }, [userId, loggedOn]);

  const sleepMinutes = sleepDurationMinutes(form);

  useEffect(() => {
    const controller = new AbortController();
    const frame = requestAnimationFrame(() => {
      void load(controller.signal);
    });

    return () => {
      controller.abort();
      cancelAnimationFrame(frame);
    };
  }, [load]);

  async function save() {
    if (!userId) return;
    hapticTap();
    
    // 1. OPTIMISTIC UPDATE: Trigger effect immediately
    triggerThemeActionEffect({ kind: "save", label: t("reset.signals.title") });
    
    setSaving(true);
    setMessage(null);
    
    // 2. BACKGROUND SYNC: Save to database
    const { ok } = await upsertTodaySignals({ userId, loggedOn, payload: form });
    
    setSaving(false);
    if (ok) {
      setMessage("ok");
      onSaved?.();
    } else {
      setMessage("err");
    }
  }

  if (!userId) {
    return (
      <GlassPanel className="space-y-2">
        <SectionHeading title={t("reset.signals.title")} />
        <p className="text-sm text-(--color-secondary)">
          {t("reset.signals.needAuth")}
        </p>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="space-y-5">
      {/* ── Header ── */}
      <SectionHeading title={t("reset.signals.title")} />

      {loading ? (
        <p className="text-sm text-(--color-secondary)">{t("reset.signals.loading")}</p>
      ) : (
        <div className="space-y-4">
          <div className="space-y-5 rounded-xl border border-(--color-surface-border) bg-background/40 p-4 sm:p-5">
            
            {/* ── 1. Sleep ── */}
            {trackMetrics.includes("sleep") && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-(--color-text)">
                    {t("reset.signals.groupSleep")}
                  </span>
                  <span className="text-xs font-semibold text-(--color-secondary)">
                    {!form.sleep_wake_time ? "" :
                     form.sleep_wake_time === "05:00" ? "Ļoti slikti" : 
                     form.sleep_wake_time === "06:00" ? "Vāji" : 
                     form.sleep_wake_time === "07:00" ? "Vidēji" :
                     form.sleep_wake_time === "08:00" ? "Labi" :
                     form.sleep_wake_time === "09:00" ? "Izcili" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl grayscale opacity-70">😫</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    aria-label={t("reset.signals.groupSleep")}
                    value={
                      form.sleep_wake_time === "05:00" ? 1 : 
                      form.sleep_wake_time === "06:00" ? 2 : 
                      form.sleep_wake_time === "07:00" ? 3 :
                      form.sleep_wake_time === "08:00" ? 4 :
                      form.sleep_wake_time === "09:00" ? 5 : 3
                    }
                    onChange={(e) => {
                      hapticTap();
                      const val = parseInt(e.target.value, 10);
                      const wake = val === 1 ? "05:00" : val === 2 ? "06:00" : val === 3 ? "07:00" : val === 4 ? "08:00" : "09:00";
                      setForm((f) => ({
                        ...f,
                        sleep_bedtime: "00:00",
                        sleep_wake_time: wake,
                      }));
                    }}
                    className="flex-1 maj-themed-slider"
                  />
                  <span className="text-xl">😌</span>
                </div>
              </div>
            )}

            {/* ── 2. Mood ── */}
            {trackMetrics.includes("mood") && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-(--color-text)">{t("reset.signals.mood")}</span>
                  <span className="text-xs font-semibold text-(--color-secondary)">
                    {!form.mood ? "" : form.mood === 1 ? "Ļoti slikti" : form.mood === 5 ? "Lieliski" : "Vidēji"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl grayscale opacity-70">😞</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    aria-label={t("reset.signals.mood")}
                    value={form.mood ?? 3}
                    onChange={(e) => {
                      hapticTap();
                      setForm((f) => ({ ...f, mood: parseInt(e.target.value, 10) }));
                    }}
                    className="flex-1 maj-themed-slider"
                  />
                  <span className="text-xl">😄</span>
                </div>
              </div>
            )}

            {/* ── 3. Energy ── */}
            {trackMetrics.includes("mood") && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-(--color-text)">{t("reset.signals.energy")}</span>
                  <span className="text-xs font-semibold text-(--color-secondary)">
                    {!form.energy ? "" : form.energy === 1 ? "Izsmelts" : form.energy === 5 ? "Pārpilns" : "Normāli"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl grayscale opacity-70">🔋</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    aria-label={t("reset.signals.energy")}
                    value={form.energy ?? 3}
                    onChange={(e) => {
                      hapticTap();
                      setForm((f) => ({ ...f, energy: parseInt(e.target.value, 10) }));
                    }}
                    className="flex-1 maj-themed-slider"
                  />
                  <span className="text-xl">⚡</span>
                </div>
              </div>
            )}
            
            {/* ── Notes Toggle ── */}
            <div className="pt-2 border-t border-(--color-surface-border)">
              <button
                type="button"
                onClick={() => {
                  hapticTap();
                  if (form.notes_private !== null) {
                    setForm(f => ({ ...f, notes_private: null }));
                  } else {
                    setForm(f => ({ ...f, notes_private: "" }));
                  }
                }}
                className="text-xs font-semibold uppercase tracking-widest flex items-center gap-2 transition-colors text-(--color-text-secondary) hover:text-(--color-text-primary)"
              >
                {form.notes_private !== null ? "− Slēpt piezīmes" : "+ Pievienot piezīmi"}
              </button>
              {form.notes_private !== null && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <textarea
                    rows={2}
                    className={"w-full resize-none rounded-xl border border-(--color-surface-border) bg-background px-3 py-2 text-sm text-(--color-text)"}
                    value={form.notes_private}
                    onChange={(e) => setForm((f) => ({ ...f, notes_private: e.target.value }))}
                    placeholder={t("reset.signals.notesPlaceholder")}
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── Save ── */}
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-background disabled:opacity-60 transition-all active:scale-[0.98]"
          >
            {saving ? t("reset.signals.saving") : t("reset.signals.save")}
          </button>

          {message === "ok" && (
            <div className="mt-4">
              <ThemedFeedback
                type="success"
                title={locale === "lv" ? "Sinhronizēts" : "Synced"}
                message={generateQuickInsight(form, locale)}
              />
            </div>
          )}

          {message === "err" && (
            <div className="mt-4">
              <ThemedFeedback
                type="error"
                title={locale === "lv" ? "Kļūda" : "Error"}
                message={locale === "lv" ? "Neizdevās saglabāt datus. Lūdzu, mēģiniet vēlreiz." : "Failed to save data. Please try again."}
                action={{
                  label: locale === "lv" ? "Mēģināt vēlreiz" : "Try Again",
                  onClick: () => save()
                }}
              />
            </div>
          )}
        </div>
      )}
    </GlassPanel>
  );
}
