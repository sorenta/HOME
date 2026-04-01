"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useTheme } from "@/components/providers/theme-provider";
import { BentoTile } from "./bento-tile";

export function BentoDashboard() {
  const { t } = useI18n();
  const { themeId } = useTheme();

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pb-28 pt-6">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-secondary)]">
          {t("app.tagline")}
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-theme-display)] text-3xl font-semibold text-[color:var(--color-text)]">
          {t("app.name")}
        </h1>
      </motion.header>

      <motion.div
        layout
        className="grid grid-cols-2 gap-3"
      >
        <BentoTile
          themeId={themeId}
          href="/calendar"
          title={t("tile.calendar")}
          emoji="📅"
        />
        <BentoTile
          themeId={themeId}
          href="/finance"
          title={t("tile.finance")}
          emoji="💰"
        />
        <BentoTile
          themeId={themeId}
          href="/reset"
          title={t("tile.reset")}
          emoji="🧘"
          highlight
        />
        <BentoTile
          themeId={themeId}
          href="/kitchen"
          title={t("tile.kitchen")}
          emoji="🍳"
          colSpan={2}
        />
        <BentoTile
          themeId={themeId}
          href="/pharmacy"
          title={t("tile.pharmacy")}
          emoji="💊"
        />
        <BentoTile
          themeId={themeId}
          href="/events"
          title={t("tile.events")}
          emoji="🎊"
        />
      </motion.div>
    </div>
  );
}

export function AppBottomNav() {
  const { t } = useI18n();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[color:var(--color-surface-border)] bg-[color:var(--color-background)]/95 backdrop-blur-md"
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        <Link
          href="/"
          className="flex flex-1 flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium text-[color:var(--color-primary)]"
        >
          <span className="text-lg" aria-hidden>
            ◎
          </span>
          {t("nav.home")}
        </Link>
        <Link
          href="/profile"
          className="flex flex-1 flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium text-[color:var(--color-secondary)]"
        >
          <span className="text-lg" aria-hidden>
            👤
          </span>
          {t("nav.profile")}
        </Link>
        <Link
          href="/settings"
          className="flex flex-1 flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium text-[color:var(--color-secondary)]"
        >
          <span className="text-lg" aria-hidden>
            ⚙
          </span>
          {t("nav.settings")}
        </Link>
      </div>
    </nav>
  );
}
