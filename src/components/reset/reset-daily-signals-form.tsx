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
  if (form.sleep_bedtime && form.sleep_bedtime < "23:00" && form.energy && form.energy >= 4) {
    return locale === "lv"
      ? "Agrs miers izskatās atmaksājies ar labu enerģiju. Turpini šādi!"
      : "Early rest seems to pay off with good energy. Keep it up!";
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

/* ── Info‑toggle button (?) ── */
function InfoToggle({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Info"
        className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--color-surface-border) text-[10px] font-bold text-(--color-secondary) hover:bg-primary/10 transition-colors"
      >
        ?
      </button>
      {open && (
        <p className="mt-1 text-xs leading-relaxed text-(--color-secondary) animate-in fade-in duration-200">
          {text}
        </p>
      )}
    </>
  );
}

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
    setSaving(true);
    setMessage(null);
    const ok = await upsertTodaySignals({ userId, loggedOn, payload: form }).then(
      (r) => r.ok,
    );
    setSaving(false);
    setMessage(ok ? "ok" : "err");
    if (ok) {
      triggerThemeActionEffect({ kind: "save", label: t("reset.signals.title") });
      onSaved?.();
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
      {/* ── Header with ? info toggle ── */}
      <div className="flex items-start gap-1">
        <SectionHeading title={t("reset.signals.title")} />
        <InfoToggle text={t("reset.signals.intro")} />
      </div>

      {loading ? (
        <p className="text-sm text-(--color-secondary)">{t("reset.signals.loading")}</p>
      ) : (
        <div className="space-y-5">
          {/* ── Block 1: Activity ── */}
          {trackMetrics.includes("steps") && (
            <div className="space-y-3 rounded-xl border border-(--color-surface-border) bg-background/40 p-3">
              <p className="text-xs font-bold uppercase tracking-widest text-(--color-secondary)">
                {t("reset.signals.groupActivity")}
              </p>
              <label className="block text-sm">
                <span className="font-medium text-(--color-text)">
                  {t("reset.signals.steps")}
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  className={inputCls}
                  value={form.steps ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      steps: e.target.value === "" ? null : parseOptInt(e.target.value),
                    }))
                  }
                  placeholder={t("reset.signals.optional")}
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-(--color-text)">
                  {t("reset.signals.screen")}
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  className={inputCls}
                  value={form.screen_time_minutes ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      screen_time_minutes:
                        e.target.value === "" ? null : parseOptInt(e.target.value),
                    }))
                  }
                  placeholder={t("reset.signals.optional")}
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-(--color-text)">
                  {t("reset.signals.meditation")}
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  className={inputCls}
                  value={form.meditation_minutes ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      meditation_minutes:
                        e.target.value === "" ? null : parseOptInt(e.target.value),
                    }))
                  }
                  placeholder={t("reset.signals.optional")}
                />
              </label>
              <QuitStreakProgressRing progress={form.steps ? (form.steps / 10000) * 100 : 0} />
            </div>
          )}

          {/* ── Block: Sleep ── */}
          {trackMetrics.includes("sleep") && (
            <div className="space-y-3 rounded-xl border border-(--color-surface-border) bg-background/40 p-3">
              <p className="text-xs font-bold uppercase tracking-widest text-(--color-secondary)">
                {t("reset.signals.groupSleep")}
              </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium text-(--color-text)">
                  {t("reset.signals.sleepBedtime")}
                </span>
                <input
                  type="time"
                  className={inputCls}
                  value={form.sleep_bedtime ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sleep_bedtime: e.target.value || null,
                    }))
                  }
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-(--color-text)">
                  {t("reset.signals.sleepWake")}
                </span>
                <input
                  type="time"
                  className={inputCls}
                  value={form.sleep_wake_time ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sleep_wake_time: e.target.value || null,
                    }))
                  }
                />
              </label>
            </div>
            <p className="text-xs text-(--color-secondary)">
              {sleepMinutes != null
                ? t("reset.signals.sleepDuration", {
                    hours: String(Math.floor(sleepMinutes / 60)),
                    minutes: String(sleepMinutes % 60),
                  })
                : t("reset.signals.sleepHint")}
            </p>
          </div>
          )}

          {/* ── Block 2: Mood & Energy ── */}
          {trackMetrics.includes("mood") && (
            <div className="space-y-3 rounded-xl border border-(--color-surface-border) bg-background/40 p-3">
              <p className="text-xs font-bold uppercase tracking-widest text-(--color-secondary)">
                {t("reset.signals.groupFeeling")}
              </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-(--color-text)">{t("reset.signals.mood")}</span>
                  <span className="text-xs text-(--color-secondary)">
                    {form.mood === 1 ? "Ļoti slikti" : form.mood === 5 ? "Lieliski" : form.mood ? "Vidēji" : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={`mood-${n}`}
                      type="button"
                      onClick={() => {
                        hapticTap();
                        setForm((f) => ({ ...f, mood: f.mood === n ? null : n }));
                      }}
                      className={[
                        "flex h-10 flex-1 items-center justify-center rounded-xl border text-sm font-bold transition-all",
                        form.mood === n
                          ? "border-primary bg-primary/10 text-primary scale-[1.02] shadow-[0_0_10px_var(--color-primary-soft)]"
                          : "border-(--color-surface-border) bg-(--color-surface) text-(--color-secondary) hover:bg-(--color-surface-2)",
                      ].join(" ")}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-(--color-text)">{t("reset.signals.energy")}</span>
                  <span className="text-xs text-(--color-secondary)">
                    {form.energy === 1 ? "Izsmelts" : form.energy === 5 ? "Pārpilns" : form.energy ? "Normāli" : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={`energy-${n}`}
                      type="button"
                      onClick={() => {
                        hapticTap();
                        setForm((f) => ({ ...f, energy: f.energy === n ? null : n }));
                      }}
                      className={[
                        "flex h-10 flex-1 items-center justify-center rounded-xl border text-sm font-bold transition-all",
                        form.energy === n
                          ? "border-amber-500 bg-amber-500/10 text-amber-500 scale-[1.02] shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                          : "border-(--color-surface-border) bg-(--color-surface) text-(--color-secondary) hover:bg-(--color-surface-2)",
                      ].join(" ")}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          )}

          {/* ── Block 3: Private notes ── */}
          <div className="space-y-3 rounded-xl border border-(--color-surface-border) bg-background/40 p-3">
            <div className="flex items-center gap-1">
              <p className="text-xs font-bold uppercase tracking-widest text-(--color-secondary)">
                {t("reset.signals.groupNotes")}
              </p>
              <InfoToggle text={t("reset.signals.notesCryptoHint")} />
            </div>
            <label className="block text-sm">
              <span className="font-medium text-(--color-text)">
                {t("reset.signals.notes")}
              </span>
              <textarea
                rows={2}
                className={"mt-1 w-full resize-none rounded-xl border border-(--color-surface-border) bg-background px-3 py-2 text-sm text-(--color-text)"}
                value={form.notes_private ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes_private: e.target.value || null }))
                }
                placeholder={t("reset.signals.notesPlaceholder")}
              />
            </label>
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

          {message === "ok" ? (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30 p-3 mt-4 animate-in fade-in zoom-in-95 duration-300">
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                {generateQuickInsight(form, locale)}
              </p>
            </div>
          ) : null}
          {message === "err" ? (
            <p className="text-sm text-rose-600 dark:text-rose-400 mt-2">{t("reset.signals.error")}</p>
          ) : null}
        </div>
      )}
    </GlassPanel>
  );
}
