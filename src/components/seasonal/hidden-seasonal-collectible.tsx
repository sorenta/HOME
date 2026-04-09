"use client";

import { motion } from "framer-motion";
import { useMemo, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { hapticTap } from "@/lib/haptic";
import { useAuth } from "@/components/providers/auth-provider";
import { useSeasonal } from "@/components/providers/seasonal-provider";
import { useI18n } from "@/lib/i18n/i18n-context";
import { easterCollectiblePosition } from "@/lib/seasonal-easter-placement";
import { SEASONAL_COLLECTIBLE_SPOTS } from "@/lib/seasonal-home";
import { getCollectibleSprite } from "@/lib/seasonal-visuals";

type Props = {
  spotId: string;
};

export function HiddenSeasonalCollectible({ spotId }: Props) {
  const { activeTheme, hasCollectedSpot, collectSpot } = useSeasonal();
  const { user } = useAuth();
  const { t } = useI18n();
  const [offset, setOffset] = useState({ x: 0, y: 0, rotate: 0 });
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const collectible = useMemo(
    () => (activeTheme ? getCollectibleSprite(activeTheme.id) : null),
    [activeTheme],
  );

  const isEaster = activeTheme?.id === "easter";

  const easterPos = useMemo(
    () =>
      activeTheme && isEaster
        ? easterCollectiblePosition(
            activeTheme.seasonKey,
            spotId,
            user?.id,
          )
        : null,
    [activeTheme, isEaster, spotId, user?.id],
  );

  if (
    !activeTheme ||
    !collectible ||
    !SEASONAL_COLLECTIBLE_SPOTS.includes(spotId as (typeof SEASONAL_COLLECTIBLE_SPOTS)[number]) ||
    hasCollectedSpot(spotId)
  ) {
    return null;
  }

  const ariaLabel =
    isEaster ? t("seasonal.collectible.easterEgg") : collectible.label;

  const runAway = () => {
    setOffset({
      x: Math.round((Math.random() - 0.5) * (isEaster ? 48 : 26)),
      y: Math.round((Math.random() - 0.5) * (isEaster ? 40 : 22)),
      rotate: Math.round((Math.random() - 0.5) * (isEaster ? 24 : 32)),
    });
  };

  const eggButton = (
    <motion.button
      type="button"
      aria-label={ariaLabel}
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
      className={[
        "maj-hidden-collectible transition active:scale-95",
        isEaster
          ? "fixed z-47 h-14 w-14 -translate-x-1/2 -translate-y-1/2"
          : "maj-hidden-collectible absolute left-2 top-2 h-12 w-12",
      ].join(" ")}
      style={
        isEaster && easterPos
          ? { left: `${easterPos.leftPct}%`, top: `${easterPos.topPct}%` }
          : undefined
      }
    >
      <span
        aria-hidden
        className={[
          "maj-hidden-collectible-core",
          "maj-seasonal-sprite",
          `maj-seasonal-sprite--${collectible.kind}`,
          isEaster ? "scale-110" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      />
    </motion.button>
  );

  if (isEaster) {
    if (!hydrated || typeof document === "undefined") return null;
    return createPortal(eggButton, document.body);
  }

  return <div className="relative h-12 w-12">{eggButton}</div>;
}
