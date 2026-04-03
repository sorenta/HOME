"use client";

import { motion } from "framer-motion";

/**
 * Decorative pussy willow (pūpoli) branch — traditional Latvian Easter symbol.
 * Renders a subtle SVG branch with soft catkins, positioned at the edge of a page.
 * `side` controls which corner the branch appears in.
 */
export function PussyWillow({
  side = "right",
}: {
  side?: "left" | "right";
}) {
  const isLeft = side === "left";

  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
      className="pointer-events-none fixed z-[9997]"
      style={{
        top: 60,
        [isLeft ? "left" : "right"]: 0,
        transform: isLeft ? "scaleX(-1)" : undefined,
      }}
    >
      <svg
        width="54"
        height="220"
        viewBox="0 0 54 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.08))" }}
      >
        {/* Main branch */}
        <path
          d="M48 220 C46 190, 40 160, 38 130 C36 100, 32 70, 28 40 C26 25, 24 12, 22 4"
          stroke="#7c6650"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* Secondary thin branch */}
        <path
          d="M38 130 C34 118, 28 108, 18 96"
          stroke="#8b7560"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Small twig */}
        <path
          d="M42 165 C38 158, 32 154, 24 148"
          stroke="#8b7560"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Catkins (pūpolu pumpuri) — soft fuzzy ovals */}
        {/* Top catkin */}
        <ellipse cx="22" cy="8" rx="5" ry="7" fill="#d4cec4" />
        <ellipse cx="22" cy="8" rx="4" ry="5.5" fill="#e8e2d8" opacity="0.8" />
        {/* Catkin 2 */}
        <ellipse cx="26" cy="30" rx="5.5" ry="7.5" fill="#d4cec4" />
        <ellipse cx="26" cy="30" rx="4" ry="5.5" fill="#e8e2d8" opacity="0.8" />
        {/* Catkin 3 */}
        <ellipse cx="30" cy="55" rx="5" ry="7" fill="#d4cec4" />
        <ellipse cx="30" cy="55" rx="3.5" ry="5" fill="#e8e2d8" opacity="0.8" />
        {/* Catkin 4 */}
        <ellipse cx="34" cy="82" rx="5.5" ry="7.5" fill="#d4cec4" />
        <ellipse cx="34" cy="82" rx="4" ry="5.5" fill="#e8e2d8" opacity="0.8" />
        {/* Catkin 5 — on secondary branch */}
        <ellipse cx="19" cy="98" rx="5" ry="6.5" fill="#d4cec4" />
        <ellipse cx="19" cy="98" rx="3.5" ry="4.5" fill="#e8e2d8" opacity="0.8" />
        {/* Catkin 6 */}
        <ellipse cx="36" cy="115" rx="5" ry="7" fill="#d4cec4" />
        <ellipse cx="36" cy="115" rx="3.5" ry="5" fill="#e8e2d8" opacity="0.8" />
        {/* Catkin 7 — on small twig */}
        <ellipse cx="25" cy="150" rx="5" ry="6.5" fill="#d4cec4" />
        <ellipse cx="25" cy="150" rx="3.5" ry="4.5" fill="#e8e2d8" opacity="0.8" />
        {/* Catkin 8 */}
        <ellipse cx="40" cy="145" rx="5" ry="7" fill="#d4cec4" />
        <ellipse cx="40" cy="145" rx="3.5" ry="5" fill="#e8e2d8" opacity="0.8" />

        {/* Tiny fur texture dots on catkins */}
        <circle cx="20" cy="6" r="1" fill="#c4beb4" opacity="0.5" />
        <circle cx="24" cy="10" r="0.8" fill="#c4beb4" opacity="0.4" />
        <circle cx="28" cy="28" r="1" fill="#c4beb4" opacity="0.5" />
        <circle cx="32" cy="53" r="0.8" fill="#c4beb4" opacity="0.4" />
        <circle cx="36" cy="80" r="1" fill="#c4beb4" opacity="0.5" />
        <circle cx="21" cy="96" r="0.8" fill="#c4beb4" opacity="0.4" />
        <circle cx="38" cy="113" r="1" fill="#c4beb4" opacity="0.5" />
        <circle cx="27" cy="148" r="0.8" fill="#c4beb4" opacity="0.4" />
      </svg>
    </motion.div>
  );
}
