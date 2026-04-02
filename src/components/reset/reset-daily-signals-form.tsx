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
    <GlassPanel className="space-y-4">
      <div>
        <SectionHeading title={t("reset.signals.title")} />
        <p className="mt-1 text-sm leading-relaxed text-[color:var(--color-secondary)]">
          {t("reset.signals.intro")}
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-[color:var(--color-secondary)]">{t("reset.signals.loading")}</p>
      ) : (
        <div className="space-y-4">
          <label className="block text-sm">
            <span className="font-medium text-[color:var(--color-text)]">
              {t("reset.signals.steps")}
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              className="mt-1 w-full rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-background)] px-3 py-2 text-sm text-[color:var(--color-text)]"
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
              className="mt-1 w-full rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-background)] px-3 py-2 text-sm text-[color:var(--color-text)]"
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
              className="mt-1 w-full rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-background)] px-3 py-2 text-sm text-[color:var(--color-text)]"
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

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="font-medium text-[color:var(--color-text)]">
                {t("reset.signals.mood")}
              </span>
              <select
                className="mt-1 w-full rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-background)] px-3 py-2 text-sm text-[color:var(--color-text)]"
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
                className="mt-1 w-full rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-background)] px-3 py-2 text-sm text-[color:var(--color-text)]"
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

          <label className="block text-sm">
            <span className="font-medium text-[color:var(--color-text)]">
              {t("reset.signals.notes")}
            </span>
            <textarea
              rows={2}
              className="mt-1 w-full resize-none rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-background)] px-3 py-2 text-sm text-[color:var(--color-text)]"
              value={form.notes_private ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes_private: e.target.value || null }))
              }
              placeholder={t("reset.signals.notesPlaceholder")}
            />
          </label>

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
