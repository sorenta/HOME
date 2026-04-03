"use client";

import { useSeasonal } from "@/components/providers/seasonal-provider";
import { SpringRabbitCompanion } from "@/components/spring/spring-rabbit-companion";
import { PussyWillow } from "@/components/spring/pussy-willow";

/**
 * Renders season-specific ambient overlays.
 * Easter: rabbit companion hopping along the bottom + pussy willow branches.
 */
export function SeasonalOverlays() {
  const { activeTheme } = useSeasonal();

  if (!activeTheme) return null;

  if (activeTheme.id === "easter") {
    return (
      <>
        <PussyWillow side="right" />
        <PussyWillow side="left" />
        <SpringRabbitCompanion />
      </>
    );
  }

  return null;
}
