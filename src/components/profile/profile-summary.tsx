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
  const { locale, t } = useI18n();
  const { themeId } = useTheme();
  const isForge = themeId === "forge";
  const totalMedals = medals.gold + medals.silver + medals.bronze;

  if (isForge) {
    return (
      <GlassPanel className="p-0 overflow-hidden font-mono">
        <div className="border-b border-white/5 bg-white/5 px-4 py-3">
          <h2 className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-white/80">Analītiskais_Kopsavilkums</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-white/5 bg-black/20 p-3">
              <p className="text-[0.5rem] font-black text-primary uppercase tracking-widest">RESET_SCORE</p>
              <p className="mt-1 text-lg font-black text-white">{resetScore}%</p>
            </div>
            <div className="border border-white/5 bg-black/20 p-3">
              <p className="text-[0.5rem] font-black text-primary uppercase tracking-widest">UNIT_COUNT</p>
              <p className="mt-1 text-lg font-black text-white">{householdMemberCount}</p>
            </div>
            <div className="border border-white/5 bg-black/20 p-3">
              <p className="text-[0.5rem] font-black text-primary uppercase tracking-widest">MEDALS_TOTAL</p>
              <p className="mt-1 text-lg font-black text-white">{totalMedals}</p>
            </div>
            <div className="border border-white/5 bg-black/20 p-3">
              <p className="text-[0.5rem] font-black text-primary uppercase tracking-widest">EVENT_MARKERS</p>
              <p className="mt-1 text-lg font-black text-white">{celebrationsCount}</p>
            </div>
          </div>

          <div className="border border-white/5 bg-black/20 p-3">
            <p className="text-[0.5rem] font-black text-primary uppercase tracking-widest mb-3">ACHIEVEMENT_LOG</p>
            <div className="flex flex-wrap gap-3">
              <span className="flex items-center gap-2 text-[0.6rem] font-bold text-white/60">
                <span className="text-lg">🥇</span> {medals.gold}
              </span>
              <span className="flex items-center gap-2 text-[0.6rem] font-bold text-white/60">
                <span className="text-lg">🥈</span> {medals.silver}
              </span>
              <span className="flex items-center gap-2 text-[0.6rem] font-bold text-white/60">
                <span className="text-lg">🥉</span> {medals.bronze}
              </span>
            </div>
          </div>
        </div>
      </GlassPanel>
    );
  }

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
