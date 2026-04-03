"use client";

import { useCallback, useEffect, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { useI18n } from "@/lib/i18n/i18n-context";
import { hapticTap } from "@/lib/haptic";
import {
  fetchTodaySignals,
  localDateIso,
  type ResetDailySignalsRow,
  upsertTodaySignals,
} from "@/lib/reset-daily-signals";
import { QuitStreakProgressRing } from "@/components/reset/QuitStreakProgressRing";

type Props = {
  userId: string | null;
  onSaved?: () => void;
};

function emptyForm(): ResetDailySignalsRow {
  return {
    steps: null,
    screen_time_minutes: null,
    meditation_minutes: null,
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

/* ── Shared input classes ── */
const inputCls =
  "mt-1 w-full rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-background)] px-3 py-2 text-sm text-[color:var(--color-text)]";

/* ── Info‑toggle button (?) ── */
function InfoToggle({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Info"
        className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-[color:var(--color-surface-border)] text-[10px] font-bold text-[color:var(--color-secondary)] hover:bg-[color:var(--color-primary)]/10 transition-colors"
      >
        ?
      </button>
      {open && (
        <p className="mt-1 text-xs leading-relaxed text-[color:var(--color-secondary)] animate-in fade-in duration-200">
          {text}
        </p>
      )}
    </>
  );
}

export function ResetDailySignalsForm({ userId, onSaved }: Props) {
  const { t } = useI18n();
  const [form, setForm] = useState<ResetDailySignalsRow>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<"ok" | "err" | null>(null);
  const loggedOn = localDateIso();

  const load = useCallback(async () => {
    if (!userId) {
      setForm(emptyForm());
      setLoading(false);
      return;
    }
    setLoading(true);
    const row = await fetchTodaySignals(userId, loggedOn);
    setForm(
      row ?? {
        steps: null,
        screen_time_minutes: null,
        meditation_minutes: null,
        mood: null,
        energy: null,
        notes_private: null,
      },
    );
    setLoading(false);
  }, [userId, loggedOn]);

  useEffect(() => {
    void load();
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
    if (ok) onSaved?.();
  }

  if (!userId) {
    return (
      <GlassPanel className="space-y-2">
        <SectionHeading title={t("reset.signals.title")} />
        <p className="text-sm text-[color:var(--color-secondary)]">
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
        <p className="text-sm text-[color:var(--color-secondary)]">{t("reset.signals.loading")}</p>
      ) : (
        <div className="space-y-5">
          {/* ── Block 1: Activity ── */}
          <div className="space-y-3 rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-background)]/40 p-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[color:var(--color-secondary)]">
              {t("reset.signals.groupActivity")}
            </p>
            <label className="block text-sm">
              <span className="font-medium text-[color:var(--color-text)]">
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
              <span className="font-medium text-[color:var(--color-text)]">
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
              <span className="font-medium text-[color:var(--color-text)]">
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

          {/* ── Block 2: Mood & Energy ── */}
          <div className="space-y-3 rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-background)]/40 p-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[color:var(--color-secondary)]">
              {t("reset.signals.groupFeeling")}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="font-medium text-[color:var(--color-text)]">
                  {t("reset.signals.mood")}
                </span>
                <select
                  className={inputCls}
                  value={form.mood ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      mood: e.target.value === "" ? null : Number(e.target.value),
                    }))
                  }
                >
                  <option value="">{t("reset.signals.skip")}</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="font-medium text-[color:var(--color-text)]">
                  {t("reset.signals.energy")}
                </span>
                <select
                  className={inputCls}
                  value={form.energy ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      energy: e.target.value === "" ? null : Number(e.target.value),
                    }))
                  }
                >
                  <option value="">{t("reset.signals.skip")}</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* ── Block 3: Private notes ── */}
          <div className="space-y-3 rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-background)]/40 p-3">
            <div className="flex items-center gap-1">
              <p className="text-xs font-bold uppercase tracking-widest text-[color:var(--color-secondary)]">
                {t("reset.signals.groupNotes")}
              </p>
              <InfoToggle text={t("reset.signals.notesCryptoHint")} />
            </div>
            <label className="block text-sm">
              <span className="font-medium text-[color:var(--color-text)]">
                {t("reset.signals.notes")}
              </span>
              <textarea
                rows={2}
                className={"mt-1 w-full resize-none rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-background)] px-3 py-2 text-sm text-[color:var(--color-text)]"}
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
            className="w-full rounded-xl bg-[color:var(--color-primary)] px-4 py-3 text-sm font-semibold text-[color:var(--color-background)] disabled:opacity-60"
          >
            {saving ? t("reset.signals.saving") : t("reset.signals.save")}
          </button>

          {message === "ok" ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">{t("reset.signals.saved")}</p>
          ) : null}
          {message === "err" ? (
            <p className="text-sm text-rose-600 dark:text-rose-400">{t("reset.signals.error")}</p>
          ) : null}
        </div>
      )}
    </GlassPanel>
  );
}
