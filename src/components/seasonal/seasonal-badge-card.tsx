"use client";

import { useSeasonal } from "@/components/providers/seasonal-provider";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { useI18n } from "@/lib/i18n/i18n-context";

function iconForTheme(themeId: string) {
  switch (themeId) {
    case "easter":
      return "Pavasara talismans";
    case "valentine":
      return "Sirds talismans";
    case "christmas":
      return "Svētku siltuma talismans";
    case "newyear":
      return "Jaunā sākuma talismans";
    case "birthday":
      return "Dzimšanas dienas talismans";
    case "midsummer":
      return "Jāņu vainaga talismans";
    case "state":
      return "Kopības talismans";
    case "womensday":
      return "Pateicības talismans";
    case "mensday":
      return "Vīrišķīgās kopības talismans";
    default:
      return "Vārda dienas talismans";
  }
}

export function SeasonalBadgeCard() {
  const { t } = useI18n();
  const { activeTheme, collectedCount, totalSpots, isUnlocked } = useSeasonal();

  if (!activeTheme) return null;

  return (
    <GlassPanel className="maj-seasonal-badge-card space-y-3">
      <SectionHeading
        title={t("profile.reward.title")}
        detail={`${collectedCount}/${totalSpots}`}
      />
      {isUnlocked ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone="good">{t("profile.reward.unlocked")}</StatusPill>
            <StatusPill tone="good">{t("profile.reward.skinActive")}</StatusPill>
          </div>
          <div className="rounded-2xl border border-[color:var(--color-surface-border)] px-4 py-4">
            <p className="text-sm font-semibold text-[color:var(--color-text)]">
              {iconForTheme(activeTheme.id)}
            </p>
            <p className="mt-1 text-sm text-[color:var(--color-secondary)]">
              {t(`seasonal.reward.${activeTheme.id}.title`)}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-text)]">
              {t("profile.reward.unlockedBody")}
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone="warn">{t("profile.reward.inProgress")}</StatusPill>
          </div>
          <p className="text-sm leading-relaxed text-[color:var(--color-text)]">
            {t("profile.reward.lockedBody")}
          </p>
        </>
      )}
    </GlassPanel>
  );
}
