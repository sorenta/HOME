"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useCallback, useRef } from "react";
import { hapticTap } from "@/lib/haptic";
import { useI18n } from "@/lib/i18n/i18n-context";

function EggStriped({ id }: { id: string }) {
  return (
    <svg width="40" height="52" viewBox="0 0 40 52" aria-hidden>
      <defs>
        <linearGradient id={`${id}-g`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd54f" />
          <stop offset="45%" stopColor="#ff8a65" />
          <stop offset="100%" stopColor="#e040fb" />
        </linearGradient>
      </defs>
      <ellipse cx="20" cy="28" rx="17" ry="22" fill={`url(#${id}-g)`} />
      <path
        d="M8 20 Q20 14 32 20 M7 28 Q20 22 33 28 M8 36 Q20 30 32 36"
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <ellipse cx="20" cy="10" rx="6" ry="4" fill="#aed581" opacity="0.9" />
    </svg>
  );
}

function EggSpotted({ id }: { id: string }) {
  return (
    <svg width="40" height="52" viewBox="0 0 40 52" aria-hidden>
      <defs>
        <linearGradient id={`${id}-g2`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4dd0e1" />
          <stop offset="50%" stopColor="#81c784" />
          <stop offset="100%" stopColor="#9575cd" />
        </linearGradient>
      </defs>
      <ellipse cx="20" cy="28" rx="17" ry="22" fill={`url(#${id}-g2)`} />
      <circle cx="14" cy="24" r="3.2" fill="rgba(255,255,255,0.75)" />
      <circle cx="26" cy="30" r="2.6" fill="rgba(255,255,255,0.65)" />
      <circle cx="18" cy="34" r="2.2" fill="rgba(255,255,255,0.55)" />
      <circle cx="24" cy="22" r="2" fill="#fff59d" opacity="0.9" />
      <ellipse cx="20" cy="10" rx="6" ry="4" fill="#90caf9" opacity="0.85" />
    </svg>
  );
}

export function HomeRollingEgg() {
  const { t } = useI18n();
  const left = useAnimationControls();
  const right = useAnimationControls();
  const busy = useRef(false);

  const duel = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    hapticTap();
    try {
      await Promise.all([
        left.start({
          x: [0, 26, 30, 0],
          rotate: [0, 8, -6, 0],
          scale: [1, 1.06, 1.12, 1],
          transition: { duration: 0.42, times: [0, 0.38, 0.48, 1], ease: "easeInOut" },
        }),
        right.start({
          x: [0, -26, -30, 0],
          rotate: [0, -8, 6, 0],
          scale: [1, 1.06, 1.12, 1],
          transition: { duration: 0.42, times: [0, 0.38, 0.48, 1], ease: "easeInOut" },
        }),
      ]);
      hapticTap();
    } finally {
      busy.current = false;
    }
  }, [left, right]);

  return (
    <div
      className="pointer-events-auto fixed bottom-[max(5.25rem,env(safe-area-inset-bottom,0px)+4.5rem)] left-1/2 z-[46] -translate-x-1/2"
      role="group"
      aria-label={t("spring.eggs.duel")}
    >
      <div className="flex flex-row items-end justify-center gap-7 px-2">
        <motion.button
          type="button"
          initial={{ x: 0, rotate: 0, scale: 1 }}
          animate={left}
          onClick={() => void duel()}
          whileTap={{ scale: 0.96 }}
          className="relative flex cursor-pointer items-end justify-center rounded-2xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]/85 p-1.5 shadow-md backdrop-blur-sm touch-manipulation"
          aria-label={t("spring.eggs.tapLeft")}
        >
          <EggStriped id="maj-egg-a" />
        </motion.button>
        <motion.button
          type="button"
          initial={{ x: 0, rotate: 0, scale: 1 }}
          animate={right}
          onClick={() => void duel()}
          whileTap={{ scale: 0.96 }}
          className="relative flex cursor-pointer items-end justify-center rounded-2xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]/85 p-1.5 shadow-md backdrop-blur-sm touch-manipulation"
          aria-label={t("spring.eggs.tapRight")}
        >
          <EggSpotted id="maj-egg-b" />
        </motion.button>
      </div>
    </div>
  );
}
