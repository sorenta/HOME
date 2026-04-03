"use client";

import { motion } from "framer-motion";
import { type SeasonalTheme } from "@/lib/seasonal-home";
import { useI18n } from "@/lib/i18n/i18n-context";

type Props = {
  theme: SeasonalTheme;
  displayName: string;
};

const HOLIDAY_EMOJI: Record<string, string> = {
  christmas: "🎄",
  easter: "🐣",
  valentine: "💖",
  newyear: "🎆",
  midsummer: "🌼",
  state: "🇱🇻",
  womensday: "💐",
  mensday: "🎩",
  birthday: "🎂",
  nameday: "🎉",
};

export function PeakHolidayCard({ theme, displayName }: Props) {
  const { t } = useI18n();
  if (theme.phase !== "peak") return null;

  const key = `seasonal.greeting.peak.${theme.id}`;
  const line = t(key, { name: displayName });
  if (line === key) return null;

  const emoji = HOLIDAY_EMOJI[theme.id] ?? "🎉";

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.02 }}
      className="relative z-10 mb-4 overflow-hidden rounded-2xl border border-[color:var(--seasonal-accent,var(--color-primary))]/35 bg-[color:var(--color-surface)] px-4 py-3 shadow-[0_0_24px_-8px_var(--seasonal-accent,var(--color-primary))]"
      aria-label={t("dashboard.peakHoliday.aria")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--seasonal-accent,var(--color-secondary))]">
            {t("dashboard.peakHoliday.eyebrow")}
          </p>
          <p className="mt-2 font-[family-name:var(--font-theme-display)] text-lg font-semibold leading-snug text-[color:var(--color-text)]">
            {line}
          </p>
        </div>
        <span className="text-3xl shrink-0" aria-hidden="true">{emoji}</span>
      </div>
    </motion.section>
  );
}
