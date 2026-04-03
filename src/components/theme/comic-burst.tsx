"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import { useTheme } from "@/components/providers/theme-provider";

const COMIC_WORDS = ["BUM!", "WOW!", "POW!", "YES!", "BAM!"];

/**
 * Pulse theme: comic book burst overlay on save/done actions.
 * Returns a trigger function and the animated overlay element.
 *
 * Usage:
 *   const { triggerBurst, ComicBurstOverlay } = useComicBurst();
 *   <button onClick={() => { doSave(); triggerBurst(); }}>Save</button>
 *   <ComicBurstOverlay />
 */
export function useComicBurst() {
  const { themeId } = useTheme();
  const [burst, setBurst] = useState<{ word: string; key: number } | null>(null);

  const triggerBurst = useCallback(() => {
    if (themeId !== "pulse") return;
    const word = COMIC_WORDS[Math.floor(Math.random() * COMIC_WORDS.length)];
    setBurst({ word, key: Date.now() });
  }, [themeId]);

  function ComicBurstOverlay() {
    if (themeId !== "pulse") return null;
    return (
      <AnimatePresence>
        {burst && (
          <motion.div
            key={burst.key}
            initial={{ scale: 0.3, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 1.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            onAnimationComplete={() => setBurst(null)}
            className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center"
          >
            <span
              className="text-6xl font-black text-black drop-shadow-[3px_3px_0_#fff] select-none"
              style={{
                WebkitTextStroke: "2px #000",
                paintOrder: "stroke fill",
                textShadow: "4px 4px 0 #fbbf24, -2px -2px 0 #ef4444",
              }}
            >
              {burst.word}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return { triggerBurst, ComicBurstOverlay };
}
