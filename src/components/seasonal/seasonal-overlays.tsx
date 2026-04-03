"use client";

import { useSeasonal } from "@/components/providers/seasonal-provider";
import { HomeRollingEgg } from "@/components/spring/home-rolling-egg";
import { SpringRabbitCompanion } from "@/components/spring/spring-rabbit-companion";

/**
 * Renders season-specific ambient overlays.
 * Easter: rolling eggs + rabbit companion.
 */
export function SeasonalOverlays() {
  const { activeTheme } = useSeasonal();

  if (!activeTheme) return null;

  if (activeTheme.id === "easter") {
    return (
      <>
        <HomeRollingEgg />
        <SpringRabbitCompanion />
      </>
    );
  }

  return null;
}
