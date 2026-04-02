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
 * Theme-specific home composition (order + wrappers), not decoration-only.
 */
export function DashboardHomeLayout({ themeId, slots }: Props) {
  const { header, notice, householdSummary, water, metrics, householdPanel, modules, feed } =
    slots;

  if (themeId === "forge") {
    return (
      <div className="maj-dash-compose maj-dash-compose--forge">
        {header}
        <div className="maj-forge-command maj-section-gap rounded-[var(--radius-card)] border border-[color:var(--color-border-strong)] bg-[color:color-mix(in_srgb,var(--color-surface)_94%,transparent)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          {notice}
          <div className="mt-3">{metrics}</div>
        </div>
        <div className="maj-section-gap">{householdSummary}</div>
        {water}
        <div className="maj-section-gap">{householdPanel}</div>
        <div className="maj-section-gap">{modules}</div>
        {feed}
      </div>
    );
  }

  if (themeId === "canopy") {
    return (
      <div className="maj-dash-compose maj-dash-compose--canopy">
        {header}
        <section className="maj-canopy-shelf maj-section-gap">
          <p className="maj-canopy-shelf-label">Today</p>
          <div className="maj-canopy-shelf-plate space-y-3">
            {notice}
            {water}
          </div>
        </section>
        <div className="maj-section-gap">{householdSummary}</div>
        <section className="maj-canopy-shelf maj-section-gap">
          <p className="maj-canopy-shelf-label">At a glance</p>
          <div className="maj-canopy-shelf-plate">{metrics}</div>
        </section>
        <div className="maj-section-gap">{householdPanel}</div>
        <section className="maj-canopy-shelf maj-section-gap">
          <p className="maj-canopy-shelf-label">Spaces</p>
          <div className="maj-canopy-shelf-plate">{modules}</div>
        </section>
        <section className="maj-canopy-shelf maj-section-gap">
          <p className="maj-canopy-shelf-label">Live</p>
          <div className="maj-canopy-shelf-plate">{feed}</div>
        </section>
      </div>
    );
  }

  if (themeId === "pulse") {
    return (
      <div className="maj-dash-compose maj-dash-compose--pulse">
        <div className="maj-pulse-hero-band" aria-hidden />
        {header}
        <div className="maj-section-gap">{notice}</div>
        <div className="maj-section-gap">{householdSummary}</div>
        {water}
        <div className="maj-section-gap">{metrics}</div>
        <div className="maj-section-gap">{householdPanel}</div>
        <div className="maj-section-gap border-t-2 border-[color:var(--color-border)] pt-4">
          {modules}
        </div>
        <div className="maj-section-gap">{feed}</div>
      </div>
    );
  }

  if (themeId === "lucent") {
    return (
      <div className="maj-dash-compose maj-dash-compose--lucent">
        {header}
        <div className="maj-lucent-stack maj-section-gap space-y-4">
          {notice}
          {householdSummary}
        </div>
        {water}
        <div className="maj-section-gap">{metrics}</div>
        <div className="maj-lucent-float-panel maj-section-gap">{householdPanel}</div>
        <div className="maj-section-gap">{modules}</div>
        {feed}
      </div>
    );
  }

  if (themeId === "hive") {
    return (
      <div className="maj-dash-compose maj-dash-compose--hive">
        {header}
        <div className="maj-section-gap">{notice}</div>
        <div className="maj-hive-metrics-honey maj-section-gap">{metrics}</div>
        <div className="maj-section-gap">{householdSummary}</div>
        {water}
        <div className="maj-section-gap">{householdPanel}</div>
        <div className="maj-hive-modules maj-section-gap">{modules}</div>
        <div className="maj-section-gap">{feed}</div>
      </div>
    );
  }

  return (
    <div className="maj-dash-compose maj-dash-compose--fallback">
      {header}
      {notice}
      {householdSummary}
      {water}
      {metrics}
      {householdPanel}
      {modules}
      {feed}
    </div>
  );
}
