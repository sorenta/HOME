"use client";

import { useSeasonal } from "@/components/providers/seasonal-provider";
import { SpringRabbitCompanion } from "@/components/spring/spring-rabbit-companion";

/**
 * Renders season-specific ambient overlays.
 * Easter: rabbit companion hopping along the bottom.
 */
export function SeasonalOverlays() {
  const { activeTheme } = useSeasonal();

  if (!activeTheme) return null;

  if (activeTheme.id === "easter") {
    return <SpringRabbitCompanion />;
  }

  return null;
}
