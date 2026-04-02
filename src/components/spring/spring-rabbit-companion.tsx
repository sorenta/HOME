"use client";

import { motion, useAnimationControls } from "framer-motion";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { hapticTap } from "@/lib/haptic";
import { useI18n } from "@/lib/i18n/i18n-context";

/** Keep zaķis sānu joslās — mazāk šķērso vidu, kur parasti ir virsraksti un teksts. */
function randomEdgeSpot() {
  const left = Math.random() < 0.5;
  const x = left ? 5 + Math.random() * 11 : 84 + Math.random() * 11;
  const y = 36 + Math.random() * 30;
  return { x, y };
}

function CartoonRabbit() {
  return (
    <svg
      width="56"
      height="68"
      viewBox="0 0 100 120"
      className="drop-shadow-lg"
      aria-hidden
    >
      <defs>
        <linearGradient id="maj-bun-body" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d7ccc8" />
          <stop offset="100%" stopColor="#a1887f" />
        </linearGradient>
        <linearGradient id="maj-bun-ear" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#efebe9" />
          <stop offset="100%" stopColor="#bcaaa4" />
        </linearGradient>
      </defs>
      <motion.g
        style={{ transformOrigin: "50px 38px" }}
        animate={{ rotate: [0, 6, -5, 4, 0] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2.8, ease: "easeInOut" }}
      >
        <ellipse cx="34" cy="22" rx="10" ry="26" fill="url(#maj-bun-ear)" />
        <ellipse cx="66" cy="22" rx="10" ry="26" fill="url(#maj-bun-ear)" />
        <ellipse cx="34" cy="26" rx="5" ry="18" fill="#ffccbc" opacity="0.55" />
        <ellipse cx="66" cy="26" rx="5" ry="18" fill="#ffccbc" opacity="0.55" />
      </motion.g>
      <ellipse cx="50" cy="72" rx="28" ry="20" fill="url(#maj-bun-body)" />
      <ellipse cx="50" cy="48" rx="32" ry="30" fill="url(#maj-bun-body)" />
      <ellipse cx="50" cy="52" rx="30" ry="26" fill="#d7ccc8" opacity="0.35" />
      <ellipse cx="38" cy="46" rx="14" ry="16" fill="#fafafa" />
      <ellipse cx="62" cy="46" rx="14" ry="16" fill="#fafafa" />
      <ellipse cx="38" cy="48" rx="9" ry="11" fill="#424242" />
      <ellipse cx="62" cy="48" rx="9" ry="11" fill="#424242" />
      <circle cx="41" cy="45" r="3.5" fill="#fff" />
      <circle cx="65" cy="45" r="3.5" fill="#fff" />
      <circle cx="42" cy="46" r="1.6" fill="#90caf9" opacity="0.9" />
      <circle cx="66" cy="46" r="1.6" fill="#90caf9" opacity="0.9" />
      <ellipse cx="50" cy="58" rx="5" ry="3.5" fill="#ffab91" />
      <path
        d="M44 62 Q50 66 56 62"
        fill="none"
        stroke="#5d4037"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <ellipse cx="28" cy="56" rx="6" ry="4" fill="#ffab91" opacity="0.35" />
      <ellipse cx="72" cy="56" rx="6" ry="4" fill="#ffab91" opacity="0.35" />
      <ellipse cx="32" cy="88" rx="9" ry="6" fill="#8d6e63" />
      <ellipse cx="68" cy="88" rx="9" ry="6" fill="#8d6e63" />
    </svg>
  );
}

export function SpringRabbitCompanion() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [spot, setSpot] = useState(randomEdgeSpot);
  const bodyCtrl = useAnimationControls();
  const hopping = useRef(false);

  useEffect(() => {
    setSpot(randomEdgeSpot());
  }, [pathname]);

  const doJump = useCallback(async () => {
    if (hopping.current) return;
    hopping.current = true;
    hapticTap();
    try {
      await bodyCtrl.start({
        y: [0, 10, -52, -38, 0],
        scaleY: [1, 0.72, 1.08, 0.88, 1],
        scaleX: [1, 1.14, 0.92, 1.06, 1],
        rotate: [0, -6, 4, -2, 0],
        transition: {
          duration: 0.62,
          times: [0, 0.12, 0.35, 0.55, 1],
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
      className="pointer-events-none fixed z-[45] -translate-x-1/2 -translate-y-1/2"
      initial={false}
      animate={{
        left: `${spot.x}%`,
        top: `${spot.y}%`,
      }}
      transition={{ type: "spring", stiffness: 260, damping: 24, mass: 0.9 }}
      aria-hidden
    >
      <motion.button
        type="button"
        onClick={() => void doJump()}
        className="pointer-events-auto relative flex cursor-pointer touch-manipulation items-center justify-center rounded-full p-1 outline-none ring-offset-2 ring-offset-[color:var(--color-background)] focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)]"
        aria-label={t("spring.rabbit.tapJump")}
      >
        <motion.div
          animate={bodyCtrl}
          initial={{ y: 0, scaleY: 1, scaleX: 1, rotate: 0 }}
          className="origin-bottom"
        >
          <motion.div
            animate={{
              y: [0, -18, 0, -11, 0],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 0.48,
              ease: [0.25, 0.1, 0.25, 1],
              repeatDelay: 0.22,
            }}
          >
            <CartoonRabbit />
          </motion.div>
        </motion.div>
      </motion.button>
    </motion.div>
  );
}
