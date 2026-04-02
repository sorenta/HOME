"use client";

import { useEffect, useMemo, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { QuitGoal } from "@/lib/reset-wellness";

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
};

export function ResetQuitStreak({ goals }: Props) {
  const { t } = useI18n();
  const [now, setNow] = useState(() => Date.now());

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

  if (goals.length === 0) return null;

  return (
    <GlassPanel className="space-y-3">
      <SectionHeading title={t("reset.wellness.quit.sectionTitle")} />
      <p className="text-sm text-[color:var(--color-secondary)]">
        {t("reset.wellness.quit.sectionHint")}
      </p>
      <ul className="space-y-3">
        {rows.map(({ goal, line }) => (
          <li
            key={goal.id}
            className="rounded-2xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]/40 px-4 py-3"
          >
            <p className="text-sm font-semibold text-[color:var(--color-text)]">
              {quitLabel(goal, t)}
            </p>
            <p
              className="mt-2 font-[family-name:var(--font-theme-display)] text-2xl font-semibold tabular-nums tracking-tight text-[color:var(--color-primary)]"
              aria-live="polite"
            >
              {line}
            </p>
            <p className="mt-1 text-xs text-[color:var(--color-secondary)]">
              {t("reset.wellness.quit.since")}{" "}
              {new Date(goal.startedAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </GlassPanel>
  );
}
