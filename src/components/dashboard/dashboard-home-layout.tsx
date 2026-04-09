"use client";

import type { ReactNode } from "react";
import type { ThemeId } from "@/lib/theme-logic";
import { ForgeHero } from "@/components/dashboard/forge/ForgeHero";
import { ForgeSatelliteComms } from "@/components/dashboard/forge/ForgeSatelliteComms";
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
};

type Props = {
  themeId: ThemeId;
  slots?: DashboardHomeSlots;
};

/**
 * Theme-specific home composition: order, grouping, and density — not only wrappers.
 */
export function DashboardHomeLayout({ themeId, slots = {} }: Props) {
  const {
    header = null,
    notice = null,
    focus = null,
    householdSummary = null,
    water = null,
    metrics = null,
    householdPanel = null,
    modules = null,
    feed = null,
  } = slots;

  if (themeId === "forge") {
    return (
      <div className="maj-dash-compose maj-dash-compose--forge space-y-10 pt-20 pb-12">
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

        {/* Visas sadaļas ir noņemtas pēc lietotāja pieprasījuma */}
      </div>
    );
  }

  if (themeId === "botanical") {
    return (
      <div className="maj-dash-compose maj-dash-compose--botanical">
        {header}
        <section className="maj-botanical-shelf maj-section-gap">
          <p className="maj-botanical-shelf-label">Fokuss</p>
          <div className="maj-botanical-shelf-plate min-w-0">
            {focus ? <div className="mb-3">{focus}</div> : null}
            {notice}
          </div>
        </section>
        <section className="maj-botanical-shelf maj-section-gap">
          <p className="maj-botanical-shelf-label">Moduļi</p>
          <div className="maj-botanical-shelf-plate min-w-0">{modules}</div>
        </section>
        <section className="maj-botanical-shelf maj-section-gap">
          <p className="maj-botanical-shelf-label">Ūdens un rādītāji</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="maj-botanical-shelf-plate min-w-0">{water}</div>
            <div className="maj-botanical-shelf-plate min-w-0">{metrics}</div>
          </div>
        </section>
        <section className="maj-botanical-shelf maj-section-gap">
          <p className="maj-botanical-shelf-label">Mājsaimniecība</p>
          <div className="maj-botanical-shelf-plate min-w-0">{householdSummary}</div>
        </section>
        {feed ? (
          <section className="maj-botanical-shelf maj-section-gap">
            <p className="maj-botanical-shelf-label">Plūsma</p>
            <div className="maj-botanical-shelf-plate min-w-0">{feed}</div>
          </section>
        ) : null}
      </div>
    );
  }

  if (themeId === "pulse") {
    return (
      <div className="maj-dash-compose maj-dash-compose--pulse">
        <div className="maj-pulse-hero-band" aria-hidden />
        {header ? <div className="maj-pulse-frame maj-section-gap">{header}</div> : null}
        {focus ? <div className="maj-section-gap px-4">{focus}</div> : null}
        <section className="maj-pulse-frame maj-section-gap min-w-0" aria-label="Šodiena">
          {notice}
        </section>
        <div className="grid gap-3 sm:grid-cols-2">
          <section className="maj-pulse-frame min-w-0">{modules}</section>
          <section className="maj-pulse-frame min-w-0">{metrics}</section>
        </div>
        <div className="maj-section-gap">{water}</div>
        <section className="maj-pulse-frame maj-section-gap min-w-0">{householdSummary}</section>
        {feed ? <section className="maj-pulse-frame maj-section-gap min-w-0">{feed}</section> : null}
      </div>
    );
  }

  if (themeId === "lucent") {
    return (
      <div className="maj-dash-compose maj-dash-compose--lucent">
        {header}
        <div className="maj-lucent-stack maj-section-gap space-y-3">
          {focus}
          {notice}
        </div>
        <div className="maj-section-gap">{modules}</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="maj-section-gap">{metrics}</div>
          <div className="maj-section-gap">{water}</div>
        </div>
        <div className="maj-lucent-stack maj-section-gap">
          {householdSummary}
        </div>
        {householdPanel ? <div className="maj-lucent-float-panel maj-section-gap">{householdPanel}</div> : null}
        {feed ? <div className="maj-section-gap">{feed}</div> : null}
      </div>
    );
  }

  if (themeId === "hive") {
    return (
      <div className="maj-dash-compose maj-dash-compose--hive">
        {header}
        {focus ? <div className="maj-section-gap">{focus}</div> : null}
        <div className="maj-section-gap">{notice}</div>
        <div className="maj-section-gap">{modules}</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="maj-hive-metrics-honey min-w-0">{metrics}</div>
          <div className="min-w-0">{water}</div>
        </div>
        <div className="maj-section-gap">{householdSummary}</div>
        {householdPanel ? <div className="maj-section-gap">{householdPanel}</div> : null}
        {feed ? <div className="maj-section-gap">{feed}</div> : null}
      </div>
    );
  }

  return (
    <div className="maj-dash-compose maj-dash-compose--fallback">
      {header}
      {focus ? <div className="maj-section-gap">{focus}</div> : null}
      <div className="maj-section-gap">{modules}</div>
      <div className="maj-forge-command maj-section-gap rounded-(--radius-card) border border-(--color-border) bg-[color-mix(in_srgb,var(--color-surface)_92%,transparent)] p-3">
        {notice}
        <div className="mt-3">{metrics}</div>
      </div>
      {householdSummary}
      {water}
      {householdPanel}
      {feed}
    </div>
  );
}
