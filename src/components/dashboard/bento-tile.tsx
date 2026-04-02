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
  attention?: boolean;
  themeId: ThemeId;
  colSpan?: 1 | 2;
  tier?: BentoTileTier;
};

function transitionForTheme(themeId: ThemeId): Transition {
  if (themeId === "botanical") return { type: "spring", stiffness: 280, damping: 28 };
  if (themeId === "pulse") return { type: "spring", stiffness: 520, damping: 32 };
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

  // 1. BĀZES KLASE (Strādā automātiski visām tēmām)
  const baseClass = "group relative flex overflow-hidden bg-card text-card-foreground rounded-theme shadow-theme transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]";

  // 2. TĒMAS SPECIFIKA (Mūsu dizaina odziņas)
  let themeClass = "border border-border"; // Noklusējums
  if (themeId === "lucent") themeClass = "border border-border/50 backdrop-blur-md bg-card/60";
  if (themeId === "hive") themeClass = "border-4 border-border";
  if (themeId === "pulse") themeClass = "border-4 border-black hover:shadow-[6px_6px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5";
  if (themeId === "forge") themeClass = "metal-gradient border-t-4 border-primary shadow-inner";
  if (themeId === "botanical") themeClass = "border border-border shadow-[inset_0_0_20px_rgba(255,255,255,0.3)]";

  // 3. IZMĒRS UN IZKĀRTOJUMS
  const layoutClass = isFeatured
    ? "min-h-[5.25rem] flex-col justify-between gap-2 p-4"
    : "min-h-0 flex-row items-center gap-3 px-4 py-3";

  const highlightClass = highlight ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "";
  const attentionClass = attention ? "animate-pulse" : "";

  const featuredBody = (
    <>
      <span className="text-2xl drop-shadow-sm transition-transform group-hover:scale-110" aria-hidden>
        {emoji}
      </span>
      <span className="font-bold text-sm tracking-wide z-10">{title}</span>
    </>
  );

  const compactBody = (
    <>
      <span className="text-xl drop-shadow-sm transition-transform group-hover:scale-110" aria-hidden>
        {emoji}
      </span>
      <span className="font-medium min-w-0 flex-1 text-sm tracking-wide z-10">{title}</span>
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
        className={[baseClass, themeClass, layoutClass, highlightClass, attentionClass].join(" ")}
      >
        {isFeatured ? featuredBody : compactBody}

        {/* --- DEKORĀCIJAS TĒMĀM --- */}
        {/* Pulse fona spīdums */}
        {themeId === "pulse" && isFeatured && (
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-primary rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
        )}
        {/* Forge spidometra līnija */}
        {themeId === "forge" && isFeatured && (
          <div className="absolute top-3 right-3 flex gap-1 opacity-50">
            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_var(--color-primary)]"></div>
          </div>
        )}
      </Link>
    </motion.div>
  );
}