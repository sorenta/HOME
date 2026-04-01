"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { hapticTap } from "@/lib/haptic";
import { useSeasonal } from "@/components/providers/seasonal-provider";
import { SEASONAL_COLLECTIBLE_SPOTS } from "@/lib/seasonal-home";
import { getCollectibleSprite } from "@/lib/seasonal-visuals";

type Props = {
  spotId: string;
};

export function HiddenSeasonalCollectible({ spotId }: Props) {
  const { activeTheme, hasCollectedSpot, collectSpot } = useSeasonal();
  const [offset, setOffset] = useState({ x: 0, y: 0, rotate: 0 });

  const collectible = useMemo(
    () => (activeTheme ? getCollectibleSprite(activeTheme.id) : null),
    [activeTheme],
  );

  if (
    !activeTheme ||
    !collectible ||
    !SEASONAL_COLLECTIBLE_SPOTS.includes(spotId as (typeof SEASONAL_COLLECTIBLE_SPOTS)[number]) ||
    hasCollectedSpot(spotId)
  ) {
    return null;
  }

  const runAway = () => {
    setOffset({
      x: Math.round((Math.random() - 0.5) * 26),
      y: Math.round((Math.random() - 0.5) * 22),
      rotate: Math.round((Math.random() - 0.5) * 32),
    });
  };

  return (
    <div className="relative h-12 w-12">
      <motion.button
        type="button"
        aria-label={collectible.label}
        onMouseEnter={runAway}
        onFocus={runAway}
        onClick={() => {
          hapticTap();
          collectSpot(spotId);
        }}
        animate={{
          x: offset.x,
          y: offset.y,
          rotate: offset.rotate,
          scale: [1, 1.04, 1],
        }}
        transition={{
          x: { type: "spring", stiffness: 320, damping: 18 },
          y: { type: "spring", stiffness: 320, damping: 18 },
          rotate: { type: "spring", stiffness: 280, damping: 16 },
          scale: {
            duration: 2.8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          },
        }}
        className="maj-hidden-collectible absolute left-2 top-2 transition active:scale-95"
      >
        <span
          aria-hidden
          className={[
            "maj-hidden-collectible-core",
            "maj-seasonal-sprite",
            `maj-seasonal-sprite--${collectible.kind}`,
          ].join(" ")}
        />
      </motion.button>
    </div>
  );
}
