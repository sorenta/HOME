"use client";

import { useEffect, useMemo, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { useI18n } from "@/lib/i18n/i18n-context";
import { newId, type QuitGoal, type ResetWellnessV1 } from "@/lib/reset-wellness";

function formatDuration(ms: number, t: (k: string, v?: Record<string, string>) => string): string {
  if (ms < 0) ms = 0;
  const sec = Math.floor(ms / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (d > 0) {
    return t("reset.wellness.quit.elapsed.dhm", {
      d: String(d),
      h: String(h),
      m: String(m),
    });
  }
  if (h > 0) {
    return t("reset.wellness.quit.elapsed.hms", {
      h: String(h),
      m: String(m),
      s: String(s),
    });
  }
  return t("reset.wellness.quit.elapsed.ms", { m: String(m), s: String(s) });
}

function quitLabel(goal: QuitGoal, t: (k: string) => string): string {
  if (goal.subkind === "custom" && goal.customLabel) return goal.customLabel;
  return t(`reset.wellness.quit.${goal.subkind}`);
}

type Props = {
  goals: QuitGoal[];
  state: ResetWellnessV1;
  onUpdate: (next: ResetWellnessV1) => void;
};

export function ResetQuitStreak({ goals, state, onUpdate }: Props) {
  const { t } = useI18n();
  const [now, setNow] = useState(() => Date.now());
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  const [slipReason, setSlipReason] = useState("");

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const rows = useMemo(() => {
    return goals.map((g) => {
      const start = new Date(g.startedAt).getTime();
      const elapsed = now - start;
      return { goal: g, elapsed, line: formatDuration(elapsed, t) };
    });
  }, [goals, now, t]);

  function submitSlip(goal: QuitGoal) {
    const nowIso = new Date().toISOString();
    const trimmedReason = slipReason.trim();
    let hasUpdated = false;

    onUpdate({
      ...state,
      goals: state.goals.map((existingGoal) => {
        if (existingGoal.kind !== "quit" || existingGoal.id !== goal.id) return existingGoal;
        hasUpdated = true;
        return {
          ...existingGoal,
          startedAt: nowIso,
          lastSlipAt: nowIso,
          lastSlipReason: trimmedReason || undefined,
        };
      }).concat(
        hasUpdated
          ? []
          : [
              {
                ...goal,
                id: goal.id === "active-quit-plan" ? newId() : goal.id,
                startedAt: nowIso,
                lastSlipAt: nowIso,
                lastSlipReason: trimmedReason || undefined,
              },
            ],
      ),
    });

    setActiveGoalId(null);
    setSlipReason("");
  }

  if (goals.length === 0) return null;

  return (
    <GlassPanel className="space-y-3">
      <SectionHeading title={t("reset.wellness.quit.sectionTitle")} />
      <p className="text-sm text-(--color-secondary)">
        {t("reset.wellness.quit.sectionHint")}
      </p>
      <ul className="space-y-3">
        {rows.map(({ goal, line }) => (
          <li
            key={goal.id}
            className="rounded-2xl border border-(--color-surface-border) bg-(--color-surface)/40 px-4 py-3"
          >
            <p className="text-sm font-semibold text-(--color-text)">
              {quitLabel(goal, t)}
            </p>
            <p
              className="mt-2 font-(family-name:--font-theme-display) text-2xl font-semibold tabular-nums tracking-tight text-primary"
              aria-live="polite"
            >
              {line}
            </p>
            <p className="mt-1 text-xs text-(--color-secondary)">
              {t("reset.wellness.quit.since")}{" "}
              {new Date(goal.startedAt).toLocaleString()}
            </p>
            {goal.lastSlipAt ? (
              <p className="mt-1 text-xs text-(--color-secondary)">
                {t("reset.wellness.quit.lastSlipAt", {
                  date: new Date(goal.lastSlipAt).toLocaleString(),
                })}
              </p>
            ) : null}
            {goal.lastSlipReason ? (
              <p className="mt-1 text-xs italic text-(--color-secondary)">
                &ldquo;{goal.lastSlipReason}&rdquo;
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveGoalId((current) => (current === goal.id ? null : goal.id))}
                className="rounded-xl border border-(--color-surface-border) px-3 py-2 text-sm font-medium text-(--color-text)"
              >
                {t("reset.dashboard.markSlip")}
              </button>
            </div>
            {activeGoalId === goal.id ? (
              <div className="mt-3 space-y-3 rounded-xl border border-(--color-surface-border) bg-background/50 p-3">
                <label className="block text-sm text-(--color-text)">
                  <span className="font-medium">{t("reset.wellness.quit.slipReasonLabel")}</span>
                  <textarea
                    rows={2}
                    value={slipReason}
                    onChange={(event) => setSlipReason(event.target.value)}
                    placeholder={t("reset.wellness.quit.slipReasonPlaceholder")}
                    className="mt-1 w-full resize-none rounded-xl border border-(--color-surface-border) bg-background px-3 py-2 text-sm text-(--color-text)"
                    maxLength={220}
                  />
                </label>
                <p className="text-xs text-(--color-secondary)">
                  {t("reset.wellness.quit.slipHint")}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => submitSlip(goal)}
                    className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-background"
                  >
                    {t("reset.wellness.quit.restartNow")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveGoalId(null);
                      setSlipReason("");
                    }}
                    className="rounded-xl border border-(--color-surface-border) px-3 py-2 text-sm font-medium text-(--color-text)"
                  >
                    {t("reset.wellness.quit.cancelSlip")}
                  </button>
                </div>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </GlassPanel>
  );
}
