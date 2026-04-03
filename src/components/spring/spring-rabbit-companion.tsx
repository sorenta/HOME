"use client";

import { motion, useAnimationControls } from "framer-motion";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { hapticTap } from "@/lib/haptic";
import { useI18n } from "@/lib/i18n/i18n-context";

/* ─── Cartoon Easter Bunny SVG ─── */
function EasterBunny({ facingRight, blinking }: { facingRight: boolean; blinking: boolean }) {
  return (
    <svg
      width="56"
      height="68"
      viewBox="0 0 100 120"
      className="drop-shadow-lg"
      aria-hidden
      style={{ transform: facingRight ? "scaleX(1)" : "scaleX(-1)" }}
    >
      <defs>
        <radialGradient id="maj-eb-fur" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#c4a882" />
          <stop offset="100%" stopColor="#8d6e63" />
        </radialGradient>
        <radialGradient id="maj-eb-belly2" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#fff8f0" />
          <stop offset="100%" stopColor="#e8ddd0" />
        </radialGradient>
        <radialGradient id="maj-eb-cheek" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f8a4b8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#f8a4b8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Shadow under bunny */}
      <ellipse cx="50" cy="112" rx="26" ry="5" fill="#00000015" />

      {/* Left ear */}
      <ellipse cx="34" cy="14" rx="10" ry="28" fill="url(#maj-eb-fur)" />
      <ellipse cx="34" cy="16" rx="6" ry="20" fill="#f0b4bb" opacity="0.55" />
      {/* Right ear — slightly tilted */}
      <g transform="rotate(8 62 14)">
        <ellipse cx="62" cy="10" rx="10" ry="30" fill="url(#maj-eb-fur)" />
        <ellipse cx="62" cy="12" rx="6" ry="22" fill="#f0b4bb" opacity="0.55" />
      </g>

      {/* Body — round and soft */}
      <ellipse cx="50" cy="82" rx="32" ry="28" fill="url(#maj-eb-fur)" />
      {/* Belly patch */}
      <ellipse cx="50" cy="84" rx="22" ry="18" fill="url(#maj-eb-belly2)" />

      {/* Head — big and round (cartoon proportions) */}
      <circle cx="49" cy="52" r="26" fill="url(#maj-eb-fur)" />

      {/* Inner head highlight */}
      <circle cx="44" cy="44" r="12" fill="white" opacity="0.08" />

      {/* Eyes */}
      {blinking ? (
        <>
          <path d="M36 50 Q40 53 44 50" fill="none" stroke="#3e2723" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M54 50 Q58 53 62 50" fill="none" stroke="#3e2723" strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* Left eye */}
          <ellipse cx="40" cy="49" rx="8" ry="9" fill="white" />
          <ellipse cx="41" cy="50" rx="5" ry="6" fill="#2d1b12" />
          <circle cx="43" cy="47" r="2.5" fill="white" />
          <circle cx="38" cy="52" r="1.2" fill="white" opacity="0.6" />
          {/* Right eye */}
          <ellipse cx="58" cy="49" rx="8" ry="9" fill="white" />
          <ellipse cx="59" cy="50" rx="5" ry="6" fill="#2d1b12" />
          <circle cx="61" cy="47" r="2.5" fill="white" />
          <circle cx="56" cy="52" r="1.2" fill="white" opacity="0.6" />
        </>
      )}

      {/* Cheek blush */}
      <circle cx="28" cy="56" r="7" fill="url(#maj-eb-cheek)" />
      <circle cx="70" cy="56" r="7" fill="url(#maj-eb-cheek)" />

      {/* Nose — pink triangle */}
      <path d="M46 57 L49 53 L52 57 Z" fill="#e8838f" />

      {/* Mouth — cute W shape */}
      <path d="M44 59 Q46.5 62 49 59.5 Q51.5 62 54 59" fill="none" stroke="#6d4c41" strokeWidth="1.4" strokeLinecap="round" />

      {/* Whiskers */}
      <line x1="17" y1="54" x2="32" y2="56" stroke="#a1887f" strokeWidth="0.8" opacity="0.6" />
      <line x1="17" y1="58" x2="32" y2="58" stroke="#a1887f" strokeWidth="0.8" opacity="0.6" />
      <line x1="17" y1="62" x2="33" y2="60" stroke="#a1887f" strokeWidth="0.8" opacity="0.5" />
      <line x1="66" y1="56" x2="81" y2="54" stroke="#a1887f" strokeWidth="0.8" opacity="0.6" />
      <line x1="66" y1="58" x2="81" y2="58" stroke="#a1887f" strokeWidth="0.8" opacity="0.6" />
      <line x1="65" y1="60" x2="81" y2="62" stroke="#a1887f" strokeWidth="0.8" opacity="0.5" />

      {/* Front paws */}
      <ellipse cx="34" cy="102" rx="10" ry="7" fill="#a1887f" />
      <ellipse cx="66" cy="102" rx="10" ry="7" fill="#a1887f" />
      {/* Paw pads */}
      <ellipse cx="34" cy="103" rx="5" ry="3.5" fill="#d7bfab" />
      <ellipse cx="66" cy="103" rx="5" ry="3.5" fill="#d7bfab" />

      {/* Tail — fluffy white puff */}
      <circle cx="80" cy="80" r="8" fill="#fff8f0" />
      <circle cx="82" cy="78" r="4" fill="white" opacity="0.5" />
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

  // Blink every 2-5 seconds
  useEffect(() => {
    const blink = () => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 180);
    };
    const id = setInterval(blink, 2000 + Math.random() * 3000);
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
        className="pointer-events-auto relative flex cursor-pointer touch-manipulation items-center justify-center rounded-full p-0 outline-none ring-offset-2 ring-offset-[color:var(--color-background)] focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)]"
        aria-label={t("spring.rabbit.tapJump")}
      >
        <motion.div
          animate={bodyCtrl}
          initial={{ y: 0, scaleY: 1, scaleX: 1, rotate: 0 }}
          className="origin-bottom"
        >
          {/* Idle breathing + tiny hops */}
          <motion.div
            animate={{
              y: [0, -4, 0, -8, 0],
              scaleY: [1, 1.02, 1, 0.95, 1],
              scaleX: [1, 0.99, 1, 1.03, 1],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 2.4,
              ease: "easeInOut",
              repeatDelay: 0.8,
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
