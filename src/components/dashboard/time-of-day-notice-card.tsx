"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getTimeNoticeSlice,
  shouldShowSleepHint,
  type TimeNoticeSlice,
} from "@/lib/dashboard-time";
import { useAuth } from "@/components/providers/auth-provider";
import { hapticTap } from "@/lib/haptic";
import { useI18n } from "@/lib/i18n/i18n-context";

function refreshSlices() {
  const now = new Date();
  return {
    slice: getTimeNoticeSlice(now),
    sleep: shouldShowSleepHint(now),
  };
}

export function TimeOfDayNoticeCard() {
  const { t } = useI18n();
  const { profile, user } = useAuth();
  const [{ slice, sleep }, setState] = useState<{
    slice: TimeNoticeSlice;
    sleep: boolean;
  }>(() => refreshSlices());

  useEffect(() => {
    const tick = () => setState(refreshSlices());
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const displayName =
    profile?.display_name ??
    (user?.user_metadata.display_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    t("app.name");

  function resolveCopy(key: string) {
    return t(key).replaceAll("{name}", displayName);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.03 }}
      className="maj-glass-panel maj-section-gap relative z-10 px-[length:var(--maj-space-card-pad)] py-3"
      aria-label={t("dashboard.timeNotice.aria")}
    >
      <p className="maj-theme-eyebrow">{t("dashboard.timeNotice.eyebrow")}</p>
      <h2 className="maj-theme-section-title mt-1">
        {resolveCopy(`dashboard.timeNotice.${slice}.title`)}
      </h2>
      <p className="maj-theme-subtitle mt-2 text-sm text-[color:var(--color-text-primary)]">
        {resolveCopy(`dashboard.timeNotice.${slice}.body`)}
      </p>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-[color:var(--color-border)] pt-3">
        <p className="maj-metric-label">{t("tile.reset")}</p>
        <Link
          href="/reset"
          onClick={() => hapticTap()}
          className="rounded-[var(--radius-button)] border border-[color:var(--color-border)] px-3 py-1.5 font-[family-name:var(--font-theme-sans)] text-xs font-semibold text-[color:var(--color-text-primary)]"
        >
          {sleep ? t("module.reset.checkin") : t("tile.reset")}
        </Link>
      </div>
      {sleep ? (
        <p className="maj-theme-subtitle mt-3 text-sm">
          {t("dashboard.timeNotice.sleepHint")}
        </p>
      ) : null}
    </motion.section>
  );
}
