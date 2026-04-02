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
      className="maj-notice-strip relative z-10 rounded-[var(--radius-card)] border border-[color:color-mix(in_srgb,var(--color-border)_70%,transparent)] bg-[color:color-mix(in_srgb,var(--color-surface)_78%,transparent)] px-3 py-2.5"
      aria-label={t("dashboard.timeNotice.aria")}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[color:var(--color-text-secondary)]">
            {t("dashboard.timeNotice.eyebrow")}
          </p>
          <p className="mt-0.5 text-sm font-semibold leading-snug text-[color:var(--color-text-primary)]">
            {resolveCopy(`dashboard.timeNotice.${slice}.title`)}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[color:var(--color-text-secondary)]">
            {resolveCopy(`dashboard.timeNotice.${slice}.body`)}
          </p>
        </div>
        <Link
          href="/reset"
          onClick={() => hapticTap()}
          className="shrink-0 self-start rounded-[var(--radius-button)] border border-[color:var(--color-border)] px-2.5 py-1 font-[family-name:var(--font-theme-sans)] text-[0.7rem] font-semibold text-[color:var(--color-text-primary)] sm:mt-5"
        >
          {sleep ? t("module.reset.checkin") : t("tile.reset")}
        </Link>
      </div>
      {sleep ? (
        <p className="mt-2 border-t border-[color:color-mix(in_srgb,var(--color-border)_55%,transparent)] pt-2 text-xs text-[color:var(--color-text-secondary)]">
          {t("dashboard.timeNotice.sleepHint")}
        </p>
      ) : null}
    </motion.section>
  );
}
