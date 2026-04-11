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
      const isNewSlip = elapsed < 86400 * 1000; // Less than 1 day

      let empathyMsg = "";
      if (isNewSlip && g.lastSlipAt) {
         empathyMsg = t("locale") === "lv" 
           ? "Viens klupiens neizdzēš tavu progresu. Svarīgākais ir tas, ka tu turpini." 
           : "One slip doesn't erase your progress. The most important thing is that you keep going.";
      } else if (isNewSlip) {
         empathyMsg = t("locale") === "lv"
           ? "Katrs liels mērķis sākas ar pirmo dienu."
           : "Every big goal starts with day one.";
      }

      return { goal: g, elapsed, line: formatDuration(elapsed, t), empathyMsg };
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
        {rows.map(({ goal, line, elapsed, empathyMsg }) => (
          <li
            key={goal.id}
            className="rounded-2xl border border-(--color-surface-border) bg-(--color-surface)/40 px-4 py-3 relative overflow-hidden"
          >
            {/* Visual background progress indicator for the first 7 days to build momentum */}
            <div 
               className="absolute top-0 left-0 bottom-0 bg-(--color-accent-soft) transition-all duration-1000 -z-10" 
               style={{ width: `${Math.min((elapsed / (86400 * 1000 * 7)) * 100, 100)}%` }} 
            />

            <p className="text-sm font-semibold text-(--color-text)">
              {quitLabel(goal, t)}
            </p>
            <p
              className="mt-2 font-(family-name:--font-theme-display) text-2xl font-semibold tabular-nums tracking-tight text-primary"
              aria-live="polite"
            >
              {line}
            </p>
            
            {empathyMsg ? (
              <div className="mt-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5">
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-2">
                  <span className="text-base">🌱</span> {empathyMsg}
                </p>
              </div>
            ) : null}

            <p className="mt-2 text-xs text-(--color-secondary)">
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
