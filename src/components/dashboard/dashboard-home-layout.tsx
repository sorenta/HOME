"use client";

import type { ReactNode } from "react";
import type { ThemeId } from "@/lib/theme-logic";
import { ForgeHero } from "@/components/dashboard/forge/ForgeHero";
import { LucentHero } from "@/components/dashboard/lucent/LucentHero";
import { ForgeSatelliteComms } from "@/components/dashboard/forge/ForgeSatelliteComms";
import { LucentCalendarCard } from "@/components/dashboard/lucent/LucentCalendarCard";
import { ForgeResourceMonitor } from "@/components/dashboard/forge/ForgeResourceMonitor";
import { ForgeAlertLog } from "@/components/dashboard/forge/ForgeAlertLog";
import { LucentAlertLog } from "@/components/dashboard/lucent/LucentAlertLog";
import { ForgeCargoManifest } from "@/components/dashboard/forge/ForgeCargoManifest";
import { LucentCargoManifest } from "@/components/dashboard/lucent/LucentCargoManifest";
import { HiveHero } from "@/components/dashboard/hive/HiveHero";
import { HiveCalendarCard } from "@/components/dashboard/hive/HiveCalendarCard";
import { HiveCargoManifest } from "@/components/dashboard/hive/HiveCargoManifest";
import { HiveAlertLog } from "@/components/dashboard/hive/HiveAlertLog";

export type DashboardHomeSlots = {
  header?: ReactNode;
  notice?: ReactNode;
  focus?: ReactNode;
  householdSummary?: ReactNode;
  water?: ReactNode;
  metrics?: ReactNode;
  householdPanel?: ReactNode;
  modules?: ReactNode;
  feed?: ReactNode;
  cart?: ReactNode;
  reminders?: ReactNode;
};

type Props = {
  themeId: ThemeId;
  slots?: DashboardHomeSlots;
};

export function DashboardHomeLayout({ themeId, slots = {} }: Props) {
  const {
    feed = null,
  } = slots;

  // Themes without the "Sektors 01/02" cyberpunk headers
  const isOrganicTheme = themeId === "lucent" || themeId === "hive";

  return (
    <div className={`maj-dash-compose maj-dash-compose--${themeId} ${isOrganicTheme ? "space-y-4 pt-24 pb-28 px-4" : "space-y-10 pt-20 pb-12 px-4"}`}>
      {/* SECTOR 01: COMMAND & CONTROL */}
      <div className={isOrganicTheme ? "space-y-4" : "space-y-3"}>
        {!isOrganicTheme && (
          <div className="flex items-center gap-3 px-1 opacity-40">
            <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 01</span>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
            <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Vadība un kontrole</span>
          </div>
        )}
        <div className={isOrganicTheme ? "flex flex-col gap-4" : "space-y-4"}>
          {themeId === "lucent" ? <LucentHero /> : themeId === "hive" ? <HiveHero /> : <ForgeHero />}
          {themeId === "lucent" ? <LucentCalendarCard /> : themeId === "hive" ? <HiveCalendarCard /> : <ForgeSatelliteComms />}
        </div>
      </div>

      {/* SECTOR 02: BIOMETRICS */}
      <div className={isOrganicTheme ? "space-y-4" : "space-y-3"}>
        {!isOrganicTheme && (
          <div className="flex items-center gap-3 px-1 opacity-40">
            <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 02</span>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
            <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Biometrija un resursi</span>
          </div>
        )}
        {isOrganicTheme && slots.water ? slots.water : <ForgeResourceMonitor />}
      </div>

      {/* SECTOR 03: LOGISTICS & DATA */}
      <div className={isOrganicTheme ? "space-y-4" : "space-y-3"}>
        {!isOrganicTheme && (
          <div className="flex items-center gap-3 px-1 opacity-40">
            <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 03</span>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
            <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Loģistika un operatīvie dati</span>
          </div>
        )}
        <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
          {themeId === "lucent" ? <LucentCargoManifest /> : themeId === "hive" ? <HiveCargoManifest /> : <ForgeCargoManifest />}
          {themeId === "lucent" ? <LucentAlertLog /> : themeId === "hive" ? <HiveAlertLog /> : <ForgeAlertLog />}
        </div>
      </div>

      {/* Optional Feed (Module activity) */}
      {feed ? <div className="mt-8">{feed}</div> : null}
    </div>
  );
}
