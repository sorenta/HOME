"use client";

import { motion, useAnimationControls } from "framer-motion";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { hapticTap } from "@/lib/haptic";
import { useI18n } from "@/lib/i18n/i18n-context";

/** Brūns Lieldienu zaķis — skaists, apaļš, ar mīkstām proporcijām. */
function EasterBunny({ facingRight }: { facingRight: boolean }) {
  return (
    <svg
      width="52"
      height="62"
      viewBox="0 0 100 120"
      className="drop-shadow-md"
      aria-hidden
      style={{ transform: facingRight ? "scaleX(1)" : "scaleX(-1)" }}
    >
      <defs>
        <linearGradient id="maj-eb-body" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a1887f" />
          <stop offset="100%" stopColor="#795548" />
        </linearGradient>
        <linearGradient id="maj-eb-ear" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#bcaaa4" />
          <stop offset="100%" stopColor="#8d6e63" />
        </linearGradient>
        <radialGradient id="maj-eb-belly" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#efebe9" />
          <stop offset="100%" stopColor="#d7ccc8" />
        </radialGradient>
      </defs>

      {/* Ausis */}
      <motion.g
        style={{ transformOrigin: "50px 30px" }}
        animate={{ rotate: [0, 3, -2, 3, 0] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3, ease: "easeInOut" }}
      >
        {/* Kreisā auss */}
        <ellipse cx="32" cy="18" rx="9" ry="24" fill="url(#maj-eb-ear)" />
        <ellipse cx="32" cy="20" rx="5" ry="16" fill="#e8b4b8" opacity="0.6" />
        {/* Labā auss */}
        <ellipse cx="62" cy="14" rx="9" ry="26" fill="url(#maj-eb-ear)" />
        <ellipse cx="62" cy="16" rx="5" ry="18" fill="#e8b4b8" opacity="0.6" />
      </motion.g>

      {/* Ķermenis */}
      <ellipse cx="50" cy="78" rx="30" ry="24" fill="url(#maj-eb-body)" />
      {/* Vēderīņš */}
      <ellipse cx="50" cy="80" rx="20" ry="16" fill="url(#maj-eb-belly)" opacity="0.7" />

      {/* Galva */}
      <ellipse cx="48" cy="50" rx="28" ry="24" fill="url(#maj-eb-body)" />

      {/* Acis */}
      <ellipse cx="38" cy="48" rx="7" ry="8" fill="white" />
      <ellipse cx="58" cy="48" rx="7" ry="8" fill="white" />
      <ellipse cx="39" cy="49" rx="4.5" ry="5.5" fill="#3e2723" />
      <ellipse cx="59" cy="49" rx="4.5" ry="5.5" fill="#3e2723" />
      <circle cx="41" cy="47" r="2" fill="white" />
      <circle cx="61" cy="47" r="2" fill="white" />

      {/* Deguns */}
      <ellipse cx="48" cy="56" rx="4" ry="3" fill="#e8a0a0" />

      {/* Mute */}
      <path d="M42 60 Q48 64 54 60" fill="none" stroke="#5d4037" strokeWidth="1.5" strokeLinecap="round" />

      {/* Vaigi */}
      <circle cx="28" cy="54" r="5" fill="#e8b4b8" opacity="0.3" />
      <circle cx="68" cy="54" r="5" fill="#e8b4b8" opacity="0.3" />

      {/* Ūsas */}
      <line x1="18" y1="53" x2="34" y2="55" stroke="#8d6e63" strokeWidth="0.8" opacity="0.5" />
      <line x1="18" y1="57" x2="34" y2="57" stroke="#8d6e63" strokeWidth="0.8" opacity="0.5" />
      <line x1="62" y1="55" x2="78" y2="53" stroke="#8d6e63" strokeWidth="0.8" opacity="0.5" />
      <line x1="62" y1="57" x2="78" y2="57" stroke="#8d6e63" strokeWidth="0.8" opacity="0.5" />

      {/* Ķepiņas */}
      <ellipse cx="34" cy="96" rx="10" ry="6" fill="#8d6e63" />
      <ellipse cx="66" cy="96" rx="10" ry="6" fill="#8d6e63" />

      {/* Astiņa */}
      <circle cx="78" cy="76" r="6" fill="#efebe9" />
    </svg>
  );
}

/** Zaķis lēkā pa apakšējo joslu no kreisās uz labo (un atpakaļ). */
export function SpringRabbitCompanion() {
  const pathname = usePathname();
  const { t } = useI18n();
  const bodyCtrl = useAnimationControls();
  const hopCtrl = useAnimationControls();
  const hopping = useRef(false);
  const [leftPct, setLeftPct] = useState(10);
  const [facingRight, setFacingRight] = useState(true);

  // Hop to a new random position along the bottom strip
  const hopToNewSpot = useCallback(() => {
    const next = 8 + Math.random() * 78; // 8%–86%
    setFacingRight(next > leftPct);
    setLeftPct(next);
  }, [leftPct]);

  // Re-position on page change
  useEffect(() => {
    hopToNewSpot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Periodically hop while idle
  useEffect(() => {
    const id = setInterval(hopToNewSpot, 4000 + Math.random() * 3000);
    return () => clearInterval(id);
  }, [hopToNewSpot]);

  // Big jump when tapped
  const doJump = useCallback(async () => {
    if (hopping.current) return;
    hopping.current = true;
    hapticTap();
    try {
      await bodyCtrl.start({
        y: [0, 6, -70, -50, -10, 0],
        scaleY: [1, 0.7, 1.15, 1.05, 0.9, 1],
        scaleX: [1, 1.2, 0.88, 0.95, 1.05, 1],
        rotate: [0, 0, -8, 5, -2, 0],
        transition: {
          duration: 0.72,
          times: [0, 0.1, 0.32, 0.52, 0.78, 1],
          ease: [0.33, 1, 0.68, 1],
        },
      });
    } finally {
      hopping.current = false;
    }
  }, [bodyCtrl]);

  if (pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <motion.div
      className="pointer-events-none fixed z-[45]"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 60px)" }}
      initial={false}
      animate={{ left: `${leftPct}%` }}
      transition={{ type: "spring", stiffness: 100, damping: 16, mass: 0.8 }}
      aria-hidden
    >
      <motion.button
        type="button"
        onClick={() => void doJump()}
        className="pointer-events-auto relative flex cursor-pointer touch-manipulation items-center justify-center rounded-full p-0 outline-none ring-offset-2 ring-offset-[color:var(--color-background)] focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)]"
        aria-label={t("spring.rabbit.tapJump")}
      >
        <motion.div
          animate={bodyCtrl}
          initial={{ y: 0, scaleY: 1, scaleX: 1, rotate: 0 }}
          className="origin-bottom"
        >
          {/* Idle small hops */}
          <motion.div
            animate={hopCtrl}
            initial={{ y: 0 }}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 0.6,
                ease: "easeInOut",
                repeatDelay: 1.4,
              }}
            >
              <EasterBunny facingRight={facingRight} />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.button>
    </motion.div>
  );
}
