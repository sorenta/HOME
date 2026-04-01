"use client";

import { motion } from "framer-motion";
import { type SeasonalTheme } from "@/lib/seasonal-home";
import { useI18n } from "@/lib/i18n/i18n-context";

type Props = {
  theme: SeasonalTheme;
  displayName: string;
};

export function PeakHolidayCard({ theme, displayName }: Props) {
  const { t } = useI18n();
  if (theme.phase !== "peak") return null;

  const key = `seasonal.greeting.peak.${theme.id}`;
  const line = t(key, { name: displayName });
  if (line === key) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.02 }}
      className="relative z-10 mb-4 overflow-hidden rounded-2xl border border-[color:var(--color-primary)]/35 bg-[color:var(--color-surface)] px-4 py-3 shadow-[0_0_24px_-8px_var(--color-primary)]"
      aria-label={t("dashboard.peakHoliday.aria")}
    >
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-secondary)]">
        {t("dashboard.peakHoliday.eyebrow")}
      </p>
      <p className="mt-2 font-[family-name:var(--font-theme-display)] text-lg font-semibold leading-snug text-[color:var(--color-text)]">
        {line}
      </p>
    </motion.section>
  );
}
