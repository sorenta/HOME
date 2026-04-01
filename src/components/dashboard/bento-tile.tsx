"use client";

import { motion, type Transition } from "framer-motion";
import Link from "next/link";
import { hapticTap } from "@/lib/haptic";
import { THEMES, type ThemeId } from "@/lib/theme-logic";

type Props = {
  href: string;
  title: string;
  emoji: string;
  highlight?: boolean;
  /** Extra motion when tile should draw attention (e.g. RESET pending). */
  attention?: boolean;
  themeId: ThemeId;
  colSpan?: 1 | 2;
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
}: Props) {
  const t = transitionForTheme(themeId);

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
          "maj-bento-tile flex min-h-[5.5rem] flex-col justify-between bg-[color:var(--color-surface)] p-4 transition-[transform,box-shadow]",
          "active:scale-[0.98] hover:-translate-y-0.5",
          attention ? "maj-pulse-attention" : "",
          highlight
            ? "ring-2 ring-[color:var(--color-primary)] ring-offset-2 ring-offset-[color:var(--color-background)]"
            : "",
        ].join(" ")}
      >
        <span className="text-2xl" aria-hidden>
          {emoji}
        </span>
        <span className="text-sm font-semibold leading-tight text-[color:var(--color-text)]">
          {title}
        </span>
      </Link>
    </motion.div>
  );
}
