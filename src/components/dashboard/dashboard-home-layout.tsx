"use client";

import type { ReactNode } from "react";
import type { ThemeId } from "@/lib/theme-logic";
import { ForgeHero } from "@/components/dashboard/forge/ForgeHero";
import { ForgeSatelliteComms } from "@/components/dashboard/forge/ForgeSatelliteComms";
import { ForgeMealDisplay } from "@/components/dashboard/forge/ForgeMealDisplay";
import { ForgeResourceMonitor } from "@/components/dashboard/forge/ForgeResourceMonitor";
import { ForgeAlertLog } from "@/components/dashboard/forge/ForgeAlertLog";
import { ForgeCargoManifest } from "@/components/dashboard/forge/ForgeCargoManifest";

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
    <div className={`maj-dash-compose maj-dash-compose--${themeId} space-y-10 pt-20 pb-12 px-4`}>
      {/* SECTOR 01: COMMAND & CONTROL */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-1 opacity-40">
          <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 01</span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Vadība un kontrole</span>
        </div>
        <div className="space-y-4">
          <ForgeHero />
          <ForgeSatelliteComms />
          <ForgeMealDisplay />
        </div>
      </div>

      {/* SECTOR 02: BIOMETRICS */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-1 opacity-40">
          <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 02</span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Biometrija un resursi</span>
        </div>
        <ForgeResourceMonitor />
      </div>

      {/* SECTOR 03: LOGISTICS & DATA */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-1 opacity-40">
          <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 03</span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Loģistika un operatīvie dati</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ForgeCargoManifest />
          <ForgeAlertLog />
        </div>
      </div>

      {/* Optional Feed (Module activity) */}
      {feed ? <div className="mt-8">{feed}</div> : null}
    </div>
  );
}
