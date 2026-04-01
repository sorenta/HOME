"use client";

import { motion } from "framer-motion";
import { type SeasonalTheme } from "@/lib/seasonal-home";
import { useSeasonal } from "@/components/providers/seasonal-provider";
import { StatusPill } from "@/components/ui/status-pill";
import { useI18n } from "@/lib/i18n/i18n-context";

type Props = {
  theme: SeasonalTheme;
};

function titleKeyForTheme(theme: SeasonalTheme) {
  return `seasonal.${theme.id}.title.${theme.phase}`;
}

function bodyKeyForTheme(theme: SeasonalTheme) {
  return `seasonal.${theme.id}.body.${theme.phase}`;
}

export function SeasonalHomeBanner({ theme }: Props) {
  const { t } = useI18n();
  const { collectedCount, totalSpots, isUnlocked } = useSeasonal();

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 }}
      className={`maj-seasonal-banner maj-seasonal-banner--${theme.id} relative mb-4 overflow-hidden rounded-3xl border border-[color:var(--color-surface-border)] px-4 py-4`}
    >
      <div className="maj-seasonal-banner-top" />
      <div className="maj-seasonal-banner-bottom" />
      <div className="relative z-10 max-w-[18rem]">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--color-secondary)]">
            {t("seasonal.active")}
          </p>
          <StatusPill tone={isUnlocked ? "good" : "neutral"}>
            {collectedCount}/{totalSpots}
          </StatusPill>
          {isUnlocked ? (
            <StatusPill tone="good">{t("seasonal.reward.ready")}</StatusPill>
          ) : null}
        </div>
        <h2 className="mt-2 font-[family-name:var(--font-theme-display)] text-xl font-semibold text-[color:var(--color-text)]">
          {t(titleKeyForTheme(theme))}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-text)]">
          {t(bodyKeyForTheme(theme))}
        </p>
      </div>
    </motion.section>
  );
}
