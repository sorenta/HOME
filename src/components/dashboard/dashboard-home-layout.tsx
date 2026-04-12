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

  // We unify all themes to use the exact same structural layout as Forge
  // but keeping the theme-specific class for CSS context (backgrounds, etc.)
  return (
    <div className={`maj-dash-compose maj-dash-compose--${themeId} ${themeId === "lucent" ? "space-y-4 pt-24 pb-28 px-4" : "space-y-10 pt-20 pb-12 px-4"}`}>
      {/* SECTOR 01: COMMAND & CONTROL */}
      <div className={themeId === "lucent" ? "space-y-4" : "space-y-3"}>
        {themeId !== "lucent" && (
          <div className="flex items-center gap-3 px-1 opacity-40">
            <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 01</span>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
            <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Vadība un kontrole</span>
          </div>
        )}
        <div className={themeId === "lucent" ? "flex flex-col gap-4" : "space-y-4"}>
          {themeId === "lucent" ? <LucentHero /> : <ForgeHero />}
          {themeId === "lucent" ? <LucentCalendarCard /> : <ForgeSatelliteComms />}
        </div>
      </div>

      {/* SECTOR 02: BIOMETRICS */}
      <div className={themeId === "lucent" ? "space-y-4" : "space-y-3"}>
        {themeId !== "lucent" && (
          <div className="flex items-center gap-3 px-1 opacity-40">
            <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 02</span>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
            <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Biometrija un resursi</span>
          </div>
        )}
        {themeId === "lucent" && slots.water ? slots.water : <ForgeResourceMonitor />}
      </div>

      {/* SECTOR 03: LOGISTICS & DATA */}
      <div className={themeId === "lucent" ? "space-y-4" : "space-y-3"}>
        {themeId !== "lucent" && (
          <div className="flex items-center gap-3 px-1 opacity-40">
            <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 03</span>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
            <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Loģistika un operatīvie dati</span>
          </div>
        )}
        <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
          {themeId === "lucent" ? <LucentCargoManifest /> : <ForgeCargoManifest />}
          {themeId === "lucent" ? <LucentAlertLog /> : <ForgeAlertLog />}
        </div>
      </div>

      {/* Optional Feed (Module activity) */}
      {feed ? <div className="mt-8">{feed}</div> : null}
    </div>
  );
}
