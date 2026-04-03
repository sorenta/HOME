"use client";

import { motion, useAnimationControls } from "framer-motion";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { hapticTap } from "@/lib/haptic";
import { useI18n } from "@/lib/i18n/i18n-context";

/* ─── Cartoon Easter Bunny SVG — closer to reference pose ─── */
function EasterBunny({ facingRight, blinking }: { facingRight: boolean; blinking: boolean }) {
  return (
    <svg
      width="72"
      height="78"
      viewBox="0 0 160 150"
      className="drop-shadow-lg"
      aria-hidden
      style={{ transform: facingRight ? "scaleX(1)" : "scaleX(-1)" }}
    >
      <defs>
        <linearGradient id="maj-eb-outline" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9d4b2f" />
          <stop offset="100%" stopColor="#7f341d" />
        </linearGradient>
        <radialGradient id="maj-eb-fur" cx="35%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#ffd9b8" />
          <stop offset="55%" stopColor="#f2b98d" />
          <stop offset="100%" stopColor="#d37a4a" />
        </radialGradient>
        <radialGradient id="maj-eb-fur-dark" cx="70%" cy="55%" r="75%">
          <stop offset="0%" stopColor="#e39b6d" />
          <stop offset="100%" stopColor="#c8622e" />
        </radialGradient>
        <radialGradient id="maj-eb-white" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f1e7dc" />
        </radialGradient>
        <linearGradient id="maj-eb-earpink" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#ffa8b7" />
          <stop offset="100%" stopColor="#ff708f" />
        </linearGradient>
      </defs>

      <ellipse cx="84" cy="144" rx="46" ry="5" fill="#00000012" />

      <g fill="none" stroke="url(#maj-eb-outline)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
        <ellipse cx="47" cy="28" rx="17" ry="34" fill="url(#maj-eb-fur)" />
        <ellipse cx="85" cy="23" rx="18" ry="39" fill="url(#maj-eb-fur)" />
        <ellipse cx="47" cy="29" rx="10" ry="25" fill="url(#maj-eb-earpink)" opacity="0.95" />
        <ellipse cx="85" cy="24" rx="11" ry="28" fill="url(#maj-eb-earpink)" opacity="0.95" />

        <path d="M42 75 C28 64 27 44 40 34 C50 27 63 31 70 42 C73 47 74 53 73 59 C72 69 61 77 42 75 Z" fill="url(#maj-eb-fur)" />
        <ellipse cx="98" cy="92" rx="45" ry="37" fill="url(#maj-eb-fur-dark)" />
        <ellipse cx="117" cy="101" rx="28" ry="30" fill="url(#maj-eb-fur-dark)" />
        <ellipse cx="89" cy="90" rx="26" ry="19" fill="url(#maj-eb-white)" />
        <path d="M66 88 C62 72 71 61 86 58 C101 55 114 61 122 71 C130 81 131 95 124 105 C114 118 89 122 72 111 C64 106 60 98 66 88 Z" fill="url(#maj-eb-fur)" />
        <path d="M77 70 C76 58 84 51 97 50 C109 49 119 56 123 67 C126 77 123 88 115 95 C106 103 90 104 81 96 C74 91 72 80 77 70 Z" fill="url(#maj-eb-fur)" />
        <path d="M81 80 C80 74 84 69 91 67 C100 65 111 67 117 74 C123 81 123 91 118 97 C113 103 105 104 99 103 C90 102 83 97 81 80 Z" fill="url(#maj-eb-white)" />

        <ellipse cx="140" cy="97" rx="12" ry="14" fill="url(#maj-eb-white)" />
        <ellipse cx="136" cy="95" rx="5" ry="6" fill="#ffffff" opacity="0.75" />

        <ellipse cx="56" cy="127" rx="16" ry="10" fill="url(#maj-eb-white)" />
        <ellipse cx="95" cy="128" rx="16" ry="10" fill="url(#maj-eb-white)" />
        <ellipse cx="121" cy="125" rx="17" ry="10" fill="url(#maj-eb-white)" />
      </g>

      <ellipse cx="78" cy="58" rx="14" ry="16" fill="url(#maj-eb-white)" />

      {blinking ? (
        <>
          <path d="M56 53 Q62 58 68 53" fill="none" stroke="#5b2416" strokeWidth="3" strokeLinecap="round" />
          <path d="M81 52 Q88 58 96 52" fill="none" stroke="#5b2416" strokeWidth="3" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="62" cy="53" rx="11" ry="13" fill="#ffffff" />
          <ellipse cx="63" cy="54" rx="7" ry="9" fill="#4a1d11" />
          <circle cx="66" cy="50" r="3.1" fill="#ffffff" />
          <circle cx="60" cy="57" r="1.5" fill="#ffffff" opacity="0.55" />
          <path d="M49 45 Q54 41 60 46" fill="none" stroke="#7f341d" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M50 43 Q54 39 58 43" fill="none" stroke="#7f341d" strokeWidth="1.8" strokeLinecap="round" />

          <ellipse cx="88" cy="52" rx="11" ry="13" fill="#ffffff" />
          <ellipse cx="89" cy="53" rx="7" ry="9" fill="#4a1d11" />
          <circle cx="92" cy="49" r="3.1" fill="#ffffff" />
          <circle cx="86" cy="56" r="1.5" fill="#ffffff" opacity="0.55" />
          <path d="M78 45 Q84 41 92 46" fill="none" stroke="#7f341d" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M82 43 Q86 39 90 43" fill="none" stroke="#7f341d" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}

      <ellipse cx="46" cy="67" rx="10" ry="7" fill="#ffb3c1" opacity="0.35" />
      <ellipse cx="104" cy="67" rx="10" ry="7" fill="#ffb3c1" opacity="0.35" />

      <path d="M73 66 C75 60 83 60 85 66 C84 70 80 72 79 72 C78 72 74 70 73 66 Z" fill="#ff8ca2" stroke="#d9657e" strokeWidth="1.6" />
      <path d="M74 73 Q79 78 84 73" fill="none" stroke="#8d3f28" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="79" cy="76" rx="4.5" ry="3" fill="#ff95aa" />

      <g stroke="#b86e47" strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
        <line x1="31" y1="71" x2="58" y2="72" />
        <line x1="31" y1="77" x2="58" y2="75" />
        <line x1="33" y1="83" x2="58" y2="78" />
        <line x1="100" y1="72" x2="127" y2="71" />
        <line x1="100" y1="75" x2="128" y2="77" />
        <line x1="100" y1="78" x2="126" y2="83" />
      </g>

      <g opacity="0.28" stroke="#ffffff" strokeWidth="3" strokeLinecap="round">
        <path d="M88 76 Q103 70 114 81" />
        <path d="M96 92 Q109 87 117 96" />
        <path d="M67 101 Q75 95 79 103" />
      </g>
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
