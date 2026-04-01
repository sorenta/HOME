"use client";

import { useMemo, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import {
  KITCHEN_ONBOARDING_CATEGORIES,
  type KitchenOnboardingCategoryId,
} from "@/lib/kitchen-onboarding";
import { useI18n } from "@/lib/i18n/i18n-context";

type Props = {
  onComplete: (
    items: Array<{ name: string; unit?: string; category: KitchenOnboardingCategoryId }>,
  ) => Promise<void>;
  onSkip: () => void;
  saving: boolean;
};

export function KitchenOnboardingSurvey({ onComplete, onSkip, saving }: Props) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  const currentCategory = KITCHEN_ONBOARDING_CATEGORIES[step];
  const isLastStep = step === KITCHEN_ONBOARDING_CATEGORIES.length - 1;

  const selectedCount = useMemo(
    () => Object.values(selectedIds).filter(Boolean).length,
    [selectedIds],
  );

  function toggle(id: string) {
    setSelectedIds((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  async function handleNext() {
    if (isLastStep) {
      const selectedItems = KITCHEN_ONBOARDING_CATEGORIES.flatMap((category) =>
        category.options
          .filter((option) => selectedIds[option.id])
          .map((option) => ({
            name: option.label,
            unit: option.unit,
            category: category.id,
          })),
      );

      await onComplete(selectedItems);
      return;
    }

    setStep((current) => current + 1);
  }

  return (
    <GlassPanel className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-secondary)]">
            {t("kitchen.onboarding.eyebrow")}
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-theme-display)] text-xl font-semibold text-[color:var(--color-text)]">
            {t("kitchen.onboarding.title")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-secondary)]">
            {t("kitchen.onboarding.subtitle")}
          </p>
        </div>
        <span className="rounded-full border border-[color:var(--color-surface-border)] px-3 py-1 text-xs font-medium text-[color:var(--color-secondary)]">
          {step + 1}/{KITCHEN_ONBOARDING_CATEGORIES.length}
        </span>
      </div>

      <div className="space-y-3 rounded-[var(--theme-tile-radius)] border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-4">
        <div>
          <p className="text-sm font-semibold text-[color:var(--color-text)]">
            {t("kitchen.onboarding.question")}
          </p>
          <p className="mt-1 text-sm text-[color:var(--color-secondary)]">
            {t(currentCategory.titleKey)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {currentCategory.options.map((option) => {
            const active = Boolean(selectedIds[option.id]);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggle(option.id)}
                className={[
                  "rounded-full border px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-[color:var(--color-background)]"
                    : "border-[color:var(--color-surface-border)] text-[color:var(--color-text)]",
                ].join(" ")}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-sm text-[color:var(--color-secondary)]">
        <span>{t("kitchen.onboarding.selected", { count: selectedCount.toString() })}</span>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-xl border border-[color:var(--color-surface-border)] px-3 py-2 text-sm font-medium text-[color:var(--color-secondary)]"
        >
          {t("kitchen.onboarding.skip")}
        </button>
      </div>

      <button
        type="button"
        onClick={() => void handleNext()}
        disabled={saving}
        className="w-full rounded-xl bg-[color:var(--color-primary)] px-4 py-3 text-sm font-semibold text-[color:var(--color-background)] disabled:opacity-60"
      >
        {saving
          ? t("kitchen.onboarding.saving")
          : isLastStep
            ? t("kitchen.onboarding.finish")
            : t("kitchen.onboarding.next")}
      </button>
    </GlassPanel>
  );
}
