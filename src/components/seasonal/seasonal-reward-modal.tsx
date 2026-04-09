"use client";

import { useSeasonal } from "@/components/providers/seasonal-provider";
import { useI18n } from "@/lib/i18n/i18n-context";

export function SeasonalRewardModal() {
  const { activeTheme, showReward, dismissReward } = useSeasonal();
  const { t } = useI18n();

  if (!activeTheme || !showReward) return null;

  return (
    <div className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-md rounded-3xl border border-(--color-surface-border) bg-background/96 p-4 shadow-2xl backdrop-blur-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-secondary)">
        {t("seasonal.reward.unlocked")}
      </p>
      <h3 className="mt-2 font-(family-name:--font-theme-display) text-xl font-semibold text-(--color-text)">
        {t(`seasonal.reward.${activeTheme.id}.title`)}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-(--color-text)">
        {t(`seasonal.reward.${activeTheme.id}.body`)}
      </p>
      <button
        type="button"
        onClick={dismissReward}
        className="mt-4 w-full rounded-xl border border-primary bg-(--color-surface) px-4 py-3 text-sm font-semibold text-(--color-text)"
      >
        {t("seasonal.reward.cta")}
      </button>
    </div>
  );
}
