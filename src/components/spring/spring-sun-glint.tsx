"use client";

import { motion } from "framer-motion";

/**
 * Soft, occasional sunlight glint in the corner during spring season.
 */
export function SpringSunGlint() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed right-0 top-0 z-9994 h-44 w-44"
      animate={{
        opacity: [0, 0, 0.28, 0.15, 0, 0],
        scale: [0.94, 0.94, 1, 1.03, 1, 0.96],
      }}
      transition={{
        duration: 14,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
      style={{
        background:
          "radial-gradient(circle at top right, rgba(255,235,160,0.75) 0%, rgba(255,235,160,0.28) 35%, rgba(255,235,160,0.09) 55%, transparent 72%)",
      }}
    />
  );
}
