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
    cart = null,
    reminders = null,
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

        {/* Visas sadaļas ir noņemtas pēc lietotāja pieprasījuma */}
      </div>
    );
  }

  if (themeId === "botanical") {
    return (
      <div className="maj-dash-compose maj-dash-compose--botanical space-y-10 pt-20 pb-12">
        {/* Ātrā izvēlne */}
        <div className="px-2">{header}</div>

        {/* AUDZE 01: DZĪVĪBAS KODOLS */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2 opacity-60">
            <span className="text-[0.6rem] font-black text-accent uppercase tracking-[0.3em]">Audze 01</span>
            <div className="h-px flex-1 bg-gradient-to-r from-accent/40 to-transparent" />
            <span className="text-[0.6rem] font-bold text-accent uppercase tracking-widest italic">Dzīvības kodols un nodoms</span>
          </div>
          <section className="maj-botanical-hero relative overflow-hidden rounded-[2.5rem]">
            <div className="maj-botanical-shelf-plate p-8 border-none bg-gradient-to-br from-white/[0.08] to-transparent backdrop-blur-xl">
              {focus ? <div className="mb-8">{focus}</div> : null}
              {notice}
            </div>
          </section>
        </div>

        {/* AUDZE 02: VITALITĀTE (Ūdens Izaicinājums + Labsajūta) */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2 opacity-60">
            <span className="text-[0.6rem] font-black text-accent uppercase tracking-[0.3em]">Audze 02</span>
            <div className="h-px flex-1 bg-gradient-to-r from-accent/40 to-transparent" />
            <span className="text-[0.6rem] font-bold text-accent uppercase tracking-widest italic">Vitalitātes mērījumi</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8">
              {water}
            </div>
            <div className="lg:col-span-4">
              {metrics}
            </div>
          </div>
        </div>

        {/* AUDZE 03: MĀJSAIMNIECĪBA (Grozs + Atgādinājumi) */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2 opacity-60">
            <span className="text-[0.6rem] font-black text-accent uppercase tracking-[0.3em]">Audze 03</span>
            <div className="h-px flex-1 bg-gradient-to-r from-accent/40 to-transparent" />
            <span className="text-[0.6rem] font-bold text-accent uppercase tracking-widest italic">Operatīvā darbība</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7">
              <div className="maj-botanical-shelf-plate">
                <p className="maj-botanical-shelf-label mb-4">Iepirkumu grozs</p>
                {cart}
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="maj-botanical-shelf-plate">
                <p className="maj-botanical-shelf-label mb-4">Atgādinājumi</p>
                {reminders}
              </div>
            </div>
          </div>
        </div>

        {/* Papildus plūsma, ja nepieciešams */}
        {feed ? (
          <div className="space-y-4 pt-6">
            <p className="maj-botanical-shelf-label px-2">Notikumu hronika</p>
            <div className="maj-botanical-shelf-plate">{feed}</div>
          </div>
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
