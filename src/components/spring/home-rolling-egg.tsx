"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useCallback } from "react";
import { hapticTap } from "@/lib/haptic";
import { useI18n } from "@/lib/i18n/i18n-context";

export function HomeRollingEgg() {
  const { t } = useI18n();
  const controls = useAnimationControls();

  const roll = useCallback(async () => {
    hapticTap();
    await controls.start({
      x: [0, 130, -130, 0],
      rotate: [0, 180, 360, 540],
      transition: { duration: 2.2, ease: [0.45, 0, 0.55, 1] },
    });
    await controls.start({ rotate: 0, x: 0, transition: { duration: 0 } });
  }, [controls]);

  return (
    <div className="pointer-events-auto fixed bottom-[max(5.25rem,env(safe-area-inset-bottom,0px)+4.5rem)] left-1/2 z-[46] -translate-x-1/2">
      <motion.button
        type="button"
        onClick={() => void roll()}
        initial={{ x: 0, rotate: 0 }}
        animate={controls}
        whileTap={{ scale: 0.94 }}
        className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]/90 shadow-md backdrop-blur-sm"
        aria-label={t("spring.egg.roll")}
      >
        <span className="text-3xl select-none" aria-hidden>
          🥚
        </span>
      </motion.button>
    </div>
  );
}
