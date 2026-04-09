"use client";

import { GlassPanel } from "@/components/ui/glass-panel";
import { useI18n } from "@/lib/i18n/i18n-context";

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
  const { locale } = useI18n();
  const totalMedals = medals.gold + medals.silver + medals.bronze;

  return (
    <GlassPanel className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--color-text-secondary)">
          {locale === "lv" ? "Mans kopsavilkums" : "My summary"}
        </p>
        <p className="mt-1 text-sm text-(--color-text-primary)">
          {locale === "lv"
            ? `Šomēneša ritms: RESET ${resetScore}%, ${totalMedals} medaļas, ${householdMemberCount} household biedri.`
            : `This month: RESET ${resetScore}%, ${totalMedals} medals, ${householdMemberCount} household members.`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-(--radius-card) border border-(--color-border) bg-[color-mix(in_srgb,var(--color-surface)_84%,transparent)] p-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-(--color-text-secondary)">RESET</p>
          <p className="mt-1 text-xl font-black text-(--color-text-primary)">{resetScore}%</p>
        </div>
        <div className="rounded-(--radius-card) border border-(--color-border) bg-[color-mix(in_srgb,var(--color-surface)_84%,transparent)] p-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-(--color-text-secondary)">
            {locale === "lv" ? "Medaļas" : "Medals"}
          </p>
          <p className="mt-1 text-xl font-black text-(--color-text-primary)">{totalMedals}</p>
        </div>
        <div className="rounded-(--radius-card) border border-(--color-border) bg-[color-mix(in_srgb,var(--color-surface)_84%,transparent)] p-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-(--color-text-secondary)">
            {locale === "lv" ? "Svarīgie datumi" : "Special dates"}
          </p>
          <p className="mt-1 text-xl font-black text-(--color-text-primary)">{celebrationsCount}</p>
        </div>
        <div className="rounded-(--radius-card) border border-(--color-border) bg-[color-mix(in_srgb,var(--color-surface)_84%,transparent)] p-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-(--color-text-secondary)">Household</p>
          <p className="mt-1 text-xl font-black text-(--color-text-primary)">{householdMemberCount}</p>
        </div>
      </div>

      <div className="rounded-(--radius-card) border border-(--color-border) bg-[color-mix(in_srgb,var(--color-surface)_84%,transparent)] p-3">
        <p className="text-[11px] uppercase tracking-[0.12em] text-(--color-text-secondary)">
          {locale === "lv" ? "Medaļas" : "Medals"}
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full border border-(--color-border) bg-(--color-surface-2) px-2.5 py-1">🥇 {medals.gold}</span>
          <span className="rounded-full border border-(--color-border) bg-(--color-surface-2) px-2.5 py-1">🥈 {medals.silver}</span>
          <span className="rounded-full border border-(--color-border) bg-(--color-surface-2) px-2.5 py-1">🥉 {medals.bronze}</span>
        </div>
      </div>
    </GlassPanel>
  );
}
