"use client";

import { motion, type Transition } from "framer-motion";
import Link from "next/link";
import { hapticTap } from "@/lib/haptic";
import { type ThemeId, transitionForTheme } from "@/lib/theme-logic";
import hiveStyles from "@/components/theme/hive.module.css";
import { AppSectionIcon, type AppSectionId } from "@/components/icons";

export type BentoTileTier = "compact" | "featured";

type Props = {
  href: string;
  title: string;
  sectionId?: AppSectionId;
  emoji?: string;
  highlight?: boolean;
  attention?: boolean;
  themeId: ThemeId;
  colSpan?: 1 | 2;
  tier?: BentoTileTier;
};

export function BentoTile({
  href,
  title,
  sectionId,
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
  let baseClass = "bento-tile group relative flex overflow-hidden bg-card text-card-foreground rounded-theme shadow-theme transition-all duration-300 hover:-translate-y-1 active:scale-[0.97]";
  if (themeId === "forge") {
    baseClass = "bento-tile group relative flex overflow-hidden bg-card text-card-foreground rounded-theme shadow-theme transition-all duration-200 active:scale-[0.97]";
  }

  // 2. TĒMAS SPECIFIKA (Mūsu dizaina odziņas)
  let themeClass = "border border-border"; // Noklusējums
  if (themeId === "lucent") themeClass = "border border-white/40 backdrop-blur-xl bg-gradient-to-br from-white/60 to-white/20 shadow-[0_8px_32px_rgba(200,180,160,0.15)] hover:shadow-[0_16px_48px_rgba(200,180,160,0.25)]";
  if (themeId === "hive") themeClass = "maj-hive-bento-depth bg-gradient-to-br from-[#FFFDF5] to-[#FFF8E0] hover:brightness-105";
  if (themeId === "pulse") themeClass = "maj-pulse-neo-shadow bg-white hover:bg-[#FDFDFD]";
  if (themeId === "forge") themeClass = "maj-forge-scanline bg-[#0F1115] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_16px_rgba(0,0,0,0.6)] hover:brightness-110";
  if (themeId === "botanical") themeClass = "liquid-shape border border-white/20 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:border-white/40";


  // 3. IZMĒRS UN IZKĀRTOJUMS
  const layoutClass = isFeatured
    ? "min-h-[5.25rem] flex-col justify-between gap-2 p-4"
    : "min-h-0 flex-row items-center gap-3 px-4 py-3";

  const highlightClass = highlight ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "";
  const attentionClass = attention
    ? themeId === "forge"
      ? "maj-forge-neon-pulse"
      : "animate-pulse"
    : "";

  const iconTone = highlight || attention ? "active" : "default";
  const iconClass = `${themeId === "forge" ? "text-primary drop-shadow-[0_0_8px_var(--color-primary)]" : ""} ${themeId === "pulse" ? "rotate-[-4deg]" : ""}`;
  const iconNode = sectionId ? (
    <AppSectionIcon
      sectionId={sectionId}
      themeId={themeId}
      size={isFeatured ? 30 : 24}
      tone={iconTone}
      className={`transition-transform group-hover:scale-110 ${iconClass}`.trim()}
    />
  ) : (
    <span className={`transition-transform group-hover:scale-110 ${iconClass}`.trim()} aria-hidden>
      {emoji}
    </span>
  );

  const featuredBody = (
    <>
      <span className="flex items-center justify-center" aria-hidden>{iconNode}</span>
      <span className={`font-bold text-sm tracking-wide z-10 ${themeId === "forge" ? "uppercase tracking-[0.14em]" : ""} ${themeId === "pulse" ? "font-black uppercase tracking-[0.08em]" : ""}`}>{title}</span>
    </>
  );

  const compactBody = (
    <>
      <span className="flex items-center justify-center" aria-hidden>{iconNode}</span>
      <span className={`font-medium min-w-0 flex-1 text-sm tracking-wide z-10 ${themeId === "forge" ? "uppercase tracking-[0.12em]" : ""} ${themeId === "pulse" ? "font-black uppercase tracking-[0.08em]" : ""}`}>{title}</span>
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
          <>
            <div className="absolute -right-4 -bottom-4 h-16 w-16 rounded-full bg-primary opacity-20 blur-2xl transition-opacity group-hover:opacity-40" />
            <div className="absolute right-3 top-3 rounded-full border-2 border-black bg-[#ffec66] px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-[0.08em] text-black shadow-[2px_2px_0px_#00000022]" aria-hidden>
              Pow
            </div>
          </>
        )}
        {/* Forge spidometra līnija un stūra mirdzums */}
        {themeId === "forge" && isFeatured && (
          <>
            <div className="absolute top-3 right-3 flex gap-1 opacity-70" aria-hidden>
              <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_var(--color-primary)]"></div>
              <div className="w-6 h-px self-center bg-gradient-to-r from-primary via-primary/60 to-transparent shadow-[0_0_8px_var(--color-primary)]"></div>
            </div>
            {/* Corner highlight */}
            <div className="absolute top-0 right-0 h-4 w-4 bg-gradient-to-bl from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 h-full w-px bg-gradient-to-t from-primary/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </>
        )}
        {/* Hive: honey cap + drips on featured tiles */}
        {themeId === "hive" && isFeatured && (
          <div className={hiveStyles.honeyCap} aria-hidden>
            <svg viewBox="0 0 800 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 70 C80 20, 160 100, 260 70 C360 40, 420 90, 520 70 C620 50, 720 96, 800 70 L800 200 L0 200 Z" fill="var(--color-primary)" opacity="0.96" />
            </svg>
            <div style={{ position: 'relative', width: '100%', height: 0 }}>
              <span className={`${hiveStyles.drip} ${hiveStyles.dripSlow}`} style={{ left: '12%' }} />
              <span className={`${hiveStyles.drip} ${hiveStyles.dripMed}`} style={{ left: '46%' }} />
              <span className={`${hiveStyles.drip} ${hiveStyles.dripFast}`} style={{ left: '78%' }} />
            </div>
          </div>
        )}
      </Link>
    </motion.div>
  );
}
