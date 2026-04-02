"use client";

import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { BodyGoal, ResetWellnessV1 } from "@/lib/reset-wellness";
import { hapticTap } from "@/lib/haptic";

type DaySlot = { titleKey: string; detailKey: string };

const BULK_WEEK: DaySlot[] = [
  { titleKey: "reset.training.bulk.d0.title", detailKey: "reset.training.bulk.d0.detail" },
  { titleKey: "reset.training.bulk.d1.title", detailKey: "reset.training.bulk.d1.detail" },
  { titleKey: "reset.training.bulk.d2.title", detailKey: "reset.training.bulk.d2.detail" },
  { titleKey: "reset.training.bulk.d3.title", detailKey: "reset.training.bulk.d3.detail" },
  { titleKey: "reset.training.bulk.d4.title", detailKey: "reset.training.bulk.d4.detail" },
  { titleKey: "reset.training.bulk.d5.title", detailKey: "reset.training.bulk.d5.detail" },
  { titleKey: "reset.training.bulk.d6.title", detailKey: "reset.training.bulk.d6.detail" },
];

const LEAN_WEEK: DaySlot[] = [
  { titleKey: "reset.training.lean.d0.title", detailKey: "reset.training.lean.d0.detail" },
  { titleKey: "reset.training.lean.d1.title", detailKey: "reset.training.lean.d1.detail" },
  { titleKey: "reset.training.lean.d2.title", detailKey: "reset.training.lean.d2.detail" },
  { titleKey: "reset.training.lean.d3.title", detailKey: "reset.training.lean.d3.detail" },
  { titleKey: "reset.training.lean.d4.title", detailKey: "reset.training.lean.d4.detail" },
  { titleKey: "reset.training.lean.d5.title", detailKey: "reset.training.lean.d5.detail" },
  { titleKey: "reset.training.lean.d6.title", detailKey: "reset.training.lean.d6.detail" },
];

const DAY_INDEX_KEYS = [
  "reset.training.day0",
  "reset.training.day1",
  "reset.training.day2",
  "reset.training.day3",
  "reset.training.day4",
  "reset.training.day5",
  "reset.training.day6",
] as const;

type Props = {
  mode: BodyGoal["mode"];
  state: ResetWellnessV1;
  onUpdate: (next: ResetWellnessV1) => void;
};

export function ResetTrainingPlan({ mode, state, onUpdate }: Props) {
  const { t } = useI18n();
  const week = mode === "bulk" ? BULK_WEEK : LEAN_WEEK;
  const weekNum = state.trainingWeekIndex + 1;

  function prevWeek() {
    hapticTap();
    onUpdate({
      ...state,
      trainingWeekIndex: (state.trainingWeekIndex + 3) % 4,
    });
  }

  function nextWeek() {
    hapticTap();
    onUpdate({
      ...state,
      trainingWeekIndex: (state.trainingWeekIndex + 1) % 4,
    });
  }

  return (
    <GlassPanel className="space-y-4">
      <SectionHeading title={t("reset.training.title")} />
      <p className="text-sm text-[color:var(--color-secondary)]">{t("reset.training.hint")}</p>

      <div className="flex items-center justify-between gap-2 rounded-2xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]/35 px-3 py-2">
        <button
          type="button"
          onClick={prevWeek}
          className="rounded-xl border border-[color:var(--color-surface-border)] px-3 py-2 text-sm font-medium text-[color:var(--color-text)]"
          aria-label={t("reset.training.prevWeek")}
        >
          ←
        </button>
        <p className="text-sm font-semibold text-[color:var(--color-text)]">
          {t("reset.training.weekLabel", { n: String(weekNum) })}
        </p>
        <button
          type="button"
          onClick={nextWeek}
          className="rounded-xl border border-[color:var(--color-surface-border)] px-3 py-2 text-sm font-medium text-[color:var(--color-text)]"
          aria-label={t("reset.training.nextWeek")}
        >
          →
        </button>
      </div>

      <ol className="space-y-2">
        {week.map((slot, i) => (
          <li
            key={slot.titleKey}
            className="rounded-2xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]/25 px-3 py-3"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-secondary)]">
              {t(DAY_INDEX_KEYS[i])}
            </p>
            <p className="mt-1 text-sm font-semibold text-[color:var(--color-text)]">
              {t(slot.titleKey)}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[color:var(--color-secondary)]">
              {t(slot.detailKey)}
            </p>
          </li>
        ))}
      </ol>
    </GlassPanel>
  );
}
