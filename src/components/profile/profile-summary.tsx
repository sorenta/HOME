"use client";

import Link from "next/link";
import { GlassPanel } from "@/components/ui/glass-panel";

type MedalSet = {
  gold: number;
  silver: number;
  bronze: number;
};

type ProfileSummaryProps = {
  resetScore: number;
  celebrationsCount: number;
  householdMemberCount: number;
  medals: MedalSet;
};

export function ProfileSummary({ resetScore, celebrationsCount, householdMemberCount, medals }: ProfileSummaryProps) {
  const totalMedals = medals.gold + medals.silver + medals.bronze;

  return (
    <GlassPanel className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-text-secondary)]">Mans kopsavilkums</p>
        <p className="mt-1 text-sm text-[color:var(--color-text-primary)]">
          Šomēneša ritms: RESET {resetScore}%, {totalMedals} medaļas, {householdMemberCount} household biedri.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_84%,transparent)] p-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[color:var(--color-text-secondary)]">RESET</p>
          <p className="mt-1 text-xl font-black text-[color:var(--color-text-primary)]">{resetScore}%</p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_84%,transparent)] p-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[color:var(--color-text-secondary)]">Medaļas</p>
          <p className="mt-1 text-xl font-black text-[color:var(--color-text-primary)]">{totalMedals}</p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_84%,transparent)] p-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[color:var(--color-text-secondary)]">Svētku datumi</p>
          <p className="mt-1 text-xl font-black text-[color:var(--color-text-primary)]">{celebrationsCount}</p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_84%,transparent)] p-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[color:var(--color-text-secondary)]">Household</p>
          <p className="mt-1 text-xl font-black text-[color:var(--color-text-primary)]">{householdMemberCount}</p>
        </div>
      </div>

      <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_84%,transparent)] p-3">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[color:var(--color-text-secondary)]">Medaļas un collectibles</p>
        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-2.5 py-1">🥇 {medals.gold}</span>
          <span className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-2.5 py-1">🥈 {medals.silver}</span>
          <span className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-2.5 py-1">🥉 {medals.bronze}</span>
          <span className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-2.5 py-1">🧿 Seasonal</span>
        </div>
      </div>

      <Link
        href="/profile?view=stats"
        className="inline-flex rounded-[var(--radius-button)] border border-[color:var(--color-border)] px-3 py-2 text-sm font-semibold text-[color:var(--color-text-primary)]"
      >
        Skatīt detalizētu statistiku
      </Link>
    </GlassPanel>
  );
}
