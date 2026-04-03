"use client";

import { motion, useAnimationControls } from "framer-motion";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { hapticTap } from "@/lib/haptic";
import { useI18n } from "@/lib/i18n/i18n-context";

/* ─── Premium cute mascot bunny ─── */
function EasterBunny({ facingRight, blinking }: { facingRight: boolean; blinking: boolean }) {
  return (
    <svg
      width="70"
      height="82"
      viewBox="0 0 140 160"
      className="drop-shadow-lg"
      aria-hidden
      style={{ transform: facingRight ? "scaleX(1)" : "scaleX(-1)" }}
    >
      <defs>
        <linearGradient id="maj-eb-fur" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A9744F" />
          <stop offset="100%" stopColor="#8B5E3C" />
        </linearGradient>
        <linearGradient id="maj-eb-fur-dark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5E3C" />
          <stop offset="100%" stopColor="#6B442B" />
        </linearGradient>
        <radialGradient id="maj-eb-belly" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#F6F1EA" />
        </radialGradient>
        <linearGradient id="maj-eb-earpink" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#E4C4BA" />
          <stop offset="100%" stopColor="#D9B3A5" />
        </linearGradient>
      </defs>

      <ellipse cx="72" cy="153" rx="36" ry="5" fill="#00000012" />

      {/* Long, droopy ears */}
      <motion.g
        animate={{ rotate: [0, 2, 0, -2, 0] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3.6, ease: "easeInOut" }}
        style={{ transformOrigin: "70px 54px" }}
      >
        <ellipse cx="46" cy="42" rx="11" ry="33" transform="rotate(-28 46 42)" fill="url(#maj-eb-fur)" />
        <ellipse cx="94" cy="42" rx="11" ry="33" transform="rotate(28 94 42)" fill="url(#maj-eb-fur)" />
        <ellipse cx="47" cy="44" rx="6" ry="22" transform="rotate(-28 47 44)" fill="url(#maj-eb-earpink)" />
        <ellipse cx="93" cy="44" rx="6" ry="22" transform="rotate(28 93 44)" fill="url(#maj-eb-earpink)" />
      </motion.g>

      {/* Head ~40% of figure */}
      <ellipse cx="70" cy="67" rx="31" ry="30" fill="url(#maj-eb-fur)" />
      {/* Darker chin shadow for depth */}
      <ellipse cx="70" cy="80" rx="21" ry="9" fill="#6B442B" opacity="0.18" />

      {/* Body: pear-shaped */}
      <path
        d="M41 98 C41 79 55 71 70 71 C87 71 100 82 101 99 C102 121 88 138 70 138 C52 138 38 121 41 98 Z"
        fill="url(#maj-eb-fur-dark)"
      />

      {/* Warm white belly */}
      <ellipse cx="70" cy="110" rx="20" ry="24" fill="url(#maj-eb-belly)" />

      {blinking ? (
        <>
          <path d="M56 66 Q61 68 66 66" fill="none" stroke="#2A211C" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M74 66 Q79 68 84 66" fill="none" stroke="#2A211C" strokeWidth="2.2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="61" cy="66" r="4.3" fill="#2A211C" />
          <circle cx="79" cy="66" r="4.3" fill="#2A211C" />
          <circle cx="62.3" cy="64.9" r="1.2" fill="#ffffff" opacity="0.9" />
          <circle cx="80.3" cy="64.9" r="1.2" fill="#ffffff" opacity="0.9" />
        </>
      )}

      {/* Soft blush */}
      <ellipse cx="49" cy="76" rx="7" ry="5" fill="#D9B3A5" opacity="0.35" />
      <ellipse cx="91" cy="76" rx="7" ry="5" fill="#D9B3A5" opacity="0.35" />

      {/* Nose + minimal smile */}
      <ellipse cx="70" cy="74" rx="3.3" ry="2.5" fill="#A06C6C" />
      <path d="M67 79 Q70 81 73 79" fill="none" stroke="#6B442B" strokeWidth="1.5" strokeLinecap="round" />

      {/* Front paws together */}
      <ellipse cx="64" cy="130" rx="10" ry="8" fill="#F6F1EA" />
      <ellipse cx="76" cy="130" rx="10" ry="8" fill="#F6F1EA" />
      <path d="M60 130 h8 M72 130 h8" stroke="#D9CEC0" strokeWidth="1.2" strokeLinecap="round" />

      {/* Soft, turned-out feet */}
      <ellipse cx="52" cy="142" rx="12" ry="7" transform="rotate(-8 52 142)" fill="#F6F1EA" />
      <ellipse cx="88" cy="142" rx="12" ry="7" transform="rotate(8 88 142)" fill="#F6F1EA" />

      {/* Small fluffy tail */}
      <circle cx="106" cy="113" r="8" fill="#F6F1EA" />
      <circle cx="108" cy="111" r="3.5" fill="#ffffff" opacity="0.6" />
    </svg>
  );
}

/* ─── Main component ─── */
export function SpringRabbitCompanion() {
  const pathname = usePathname();
  const { t } = useI18n();
  const bodyCtrl = useAnimationControls();
  const hopping = useRef(false);
  const [leftPct, setLeftPct] = useState(10);
  const [facingRight, setFacingRight] = useState(true);
  const [blinking, setBlinking] = useState(false);

  // Blink every 4-6 seconds for calmer expression
  useEffect(() => {
    const blink = () => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 180);
    };
    const id = setInterval(blink, 4000 + Math.random() * 2000);
    return () => clearInterval(id);
  }, []);

  // Hop to a new random position along the bottom strip
  const hopToNewSpot = useCallback(() => {
    const next = 8 + Math.random() * 78;
    setFacingRight(next > leftPct);
    setLeftPct(next);
  }, [leftPct]);

  // Re-position on page change
  useEffect(() => {
    hopToNewSpot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Periodically hop while idle (every 5-9 seconds)
  useEffect(() => {
    const id = setInterval(hopToNewSpot, 5000 + Math.random() * 4000);
    return () => clearInterval(id);
  }, [hopToNewSpot]);

  // Big jump when tapped — cartoon squash & stretch
  const doJump = useCallback(async () => {
    if (hopping.current) return;
    hopping.current = true;
    hapticTap();
    try {
      await bodyCtrl.start({
        y: [0, 8, -80, -60, -20, 4, 0],
        scaleY: [1, 0.6, 1.25, 1.1, 0.85, 1.05, 1],
        scaleX: [1, 1.3, 0.82, 0.92, 1.1, 0.97, 1],
        rotate: [0, 0, -12, 8, -4, 1, 0],
        transition: {
          duration: 0.85,
          times: [0, 0.08, 0.3, 0.48, 0.7, 0.88, 1],
          ease: [0.33, 1, 0.68, 1],
        },
      });
    } finally {
      hopping.current = false;
    }
  }, [bodyCtrl]);

  if (pathname.startsWith("/auth")) return null;

  return (
    <motion.div
      className="pointer-events-none fixed z-[45]"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 60px)" }}
      initial={false}
      animate={{ left: `${leftPct}%` }}
      transition={{ type: "spring", stiffness: 80, damping: 14, mass: 1 }}
      aria-hidden
    >
      <motion.button
        type="button"
        onClick={() => void doJump()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="pointer-events-auto relative flex cursor-pointer touch-manipulation items-center justify-center rounded-full p-0 outline-none ring-offset-2 ring-offset-[color:var(--color-background)] focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)]"
        aria-label={t("spring.rabbit.tapJump")}
      >
        <motion.div
          animate={bodyCtrl}
          initial={{ y: 0, scaleY: 1, scaleX: 1, rotate: 0 }}
          className="origin-bottom"
        >
          {/* Calm idle motion */}
          <motion.div
            animate={{
              y: [0, -2, 0],
              scaleY: [1, 1.01, 1],
              scaleX: [1, 0.995, 1],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 2.2,
              ease: "easeInOut",
              repeatDelay: 0.5,
            }}
            className="origin-bottom"
          >
            <EasterBunny facingRight={facingRight} blinking={blinking} />
          </motion.div>
        </motion.div>
      </motion.button>
    </motion.div>
  );
}
