"use client";

import { motion, type Transition } from "framer-motion";
import Link from "next/link";
import { hapticTap } from "@/lib/haptic";
import { THEMES, type ThemeId } from "@/lib/theme-logic";

export type BentoTileTier = "compact" | "featured";

type Props = {
  href: string;
  title: string;
  emoji: string;
  highlight?: boolean;
  /** Extra motion when tile should draw attention (e.g. RESET pending). */
  attention?: boolean;
  themeId: ThemeId;
  colSpan?: 1 | 2;
  /** Compact = dense utility row; featured = primary destinations (larger, more presence). */
  tier?: BentoTileTier;
};

function transitionForTheme(themeId: ThemeId): Transition {
  const kind = THEMES[themeId].motion;
  if (kind === "organic") {
    return { type: "spring", stiffness: 280, damping: 28 };
  }
  if (kind === "snappy") {
    return { type: "spring", stiffness: 520, damping: 32 };
  }
  return { type: "spring", stiffness: 200, damping: 36 };
}

export function BentoTile({
  href,
  title,
  emoji,
  highlight,
  attention,
  themeId,
  colSpan = 1,
  tier = "compact",
}: Props) {
  const t = transitionForTheme(themeId);
  const isFeatured = tier === "featured";

  const shell = isFeatured
    ? `maj-bento-tile maj-dashboard-tile maj-tile-shell maj-tile-shell--${themeId}`
    : `maj-bento-tile maj-bento-tile--compact maj-dashboard-tile maj-dashboard-tile--compact maj-tile-shell maj-tile-shell--${themeId}`;

  const featuredBody = (
    <>
      <span className="text-2xl" aria-hidden>
        {emoji}
      </span>
      <span className="maj-tile-title text-sm leading-tight text-[color:var(--color-text)]">
        {title}
      </span>
    </>
  );

  const compactBody = (
    <>
      <span className="text-lg leading-none" aria-hidden>
        {emoji}
      </span>
      <span className="maj-tile-title min-w-0 flex-1 text-sm leading-snug text-[color:var(--color-text)]">
        {title}
      </span>
    </>
  );

  return (
    <motion.div
      layout
      transition={t}
      className={colSpan === 2 ? "col-span-2" : "col-span-1"}
    >
      <Link
        href={href}
        onClick={() => hapticTap()}
        className={[
          shell,
          isFeatured
            ? "flex min-h-[5.25rem] flex-col justify-between gap-2 bg-[color:var(--color-surface)] p-4 transition-[transform,box-shadow]"
            : "flex min-h-0 flex-row items-center gap-2.5 bg-[color:var(--color-surface)] px-3 py-2.5 transition-[transform,box-shadow]",
          "active:scale-[0.98] hover:-translate-y-0.5",
          attention ? "maj-pulse-attention" : "",
          highlight
            ? "ring-2 ring-[color:var(--color-primary)] ring-offset-2 ring-offset-[color:var(--color-background)]"
            : "",
        ].join(" ")}
      >
        {isFeatured ? featuredBody : compactBody}
      </Link>
    </motion.div>
  );
}
