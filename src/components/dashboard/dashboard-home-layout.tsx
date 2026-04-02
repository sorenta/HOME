"use client";

import type { ReactNode } from "react";
import type { ThemeId } from "@/lib/theme-logic";

export type DashboardHomeSlots = {
  header: ReactNode;
  notice: ReactNode;
  householdSummary: ReactNode;
  water: ReactNode;
  metrics: ReactNode;
  householdPanel: ReactNode;
  modules: ReactNode;
  feed: ReactNode;
};

type Props = {
  themeId: ThemeId;
  slots: DashboardHomeSlots;
};

/**
 * Theme-specific home composition: order, grouping, and density — not only wrappers.
 */
export function DashboardHomeLayout({ themeId, slots }: Props) {
  const { header, notice, householdSummary, water, metrics, householdPanel, modules, feed } =
    slots;

  if (themeId === "forge") {
    return (
      <div className="maj-dash-compose maj-dash-compose--forge">
        <div className="maj-forge-control-deck maj-section-gap">{header}</div>
        <section className="maj-forge-module-rail maj-section-gap" aria-label="Modules">
          {modules}
        </section>
        <div className="maj-forge-ops-stack maj-section-gap">
          {notice}
          <div className="maj-forge-ops-stack__metrics">{metrics}</div>
        </div>
        <div className="maj-section-gap">{householdSummary}</div>
        {water}
        <div className="maj-forge-sleeve maj-section-gap">{householdPanel}</div>
        <div className="maj-forge-sleeve maj-section-gap">{feed}</div>
      </div>
    );
  }

  if (themeId === "botanical") {
    return (
      <div className="maj-dash-compose maj-dash-compose--botanical">
        {header}
        <section className="maj-botanical-shelf maj-section-gap">
          <p className="maj-botanical-shelf-label">Spaces</p>
          <div className="maj-botanical-shelf-plate">{modules}</div>
        </section>
        <section className="maj-botanical-shelf maj-section-gap">
          <p className="maj-botanical-shelf-label">Today</p>
          <div className="maj-botanical-shelf-plate space-y-3">
            {notice}
            {water}
          </div>
        </section>
        <div className="maj-section-gap">{householdSummary}</div>
        <section className="maj-botanical-shelf maj-section-gap">
          <p className="maj-botanical-shelf-label">At a glance</p>
          <div className="maj-botanical-shelf-plate">{metrics}</div>
        </section>
        <div className="maj-section-gap">{householdPanel}</div>
        <section className="maj-botanical-shelf maj-section-gap">
          <p className="maj-botanical-shelf-label">Live</p>
          <div className="maj-botanical-shelf-plate">{feed}</div>
        </section>
      </div>
    );
  }

  if (themeId === "pulse") {
    return (
      <div className="maj-dash-compose maj-dash-compose--pulse">
        <div className="maj-pulse-hero-band" aria-hidden />
        {header}
        <div className="maj-section-gap border-b-2 border-[color:var(--color-border)] pb-4">
          {modules}
        </div>
        <div className="maj-section-gap">{notice}</div>
        <div className="maj-section-gap">{metrics}</div>
        <div className="maj-section-gap">{householdSummary}</div>
        {water}
        <div className="maj-section-gap">{householdPanel}</div>
        <div className="maj-section-gap">{feed}</div>
      </div>
    );
  }

  if (themeId === "lucent") {
    return (
      <div className="maj-dash-compose maj-dash-compose--lucent">
        {header}
        <div className="maj-section-gap">{modules}</div>
        <div className="maj-section-gap">{metrics}</div>
        <div className="maj-lucent-stack maj-section-gap space-y-3">
          {notice}
          {householdSummary}
        </div>
        {water}
        <div className="maj-lucent-float-panel maj-section-gap">{householdPanel}</div>
        {feed}
      </div>
    );
  }

  if (themeId === "hive") {
    return (
      <div className="maj-dash-compose maj-dash-compose--hive">
        {header}
        <div className="maj-section-gap">{modules}</div>
        <div className="maj-hive-metrics-honey maj-section-gap">{metrics}</div>
        <div className="maj-section-gap">{notice}</div>
        <div className="maj-section-gap">{householdSummary}</div>
        {water}
        <div className="maj-section-gap">{householdPanel}</div>
        <div className="maj-section-gap">{feed}</div>
      </div>
    );
  }

  return (
    <div className="maj-dash-compose maj-dash-compose--fallback">
      {header}
      <div className="maj-section-gap">{modules}</div>
      <div className="maj-forge-command maj-section-gap rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_92%,transparent)] p-3">
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
