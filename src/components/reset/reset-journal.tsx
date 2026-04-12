"use client";

import { useEffect, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useTheme } from "@/components/providers/theme-provider";
import { fetchRecentSignals, type ResetDailySignalHistoryRow } from "@/lib/reset-daily-signals";

type Props = {
  userId: string | null;
  refreshToken: number;
};

export function ResetJournal({ userId, refreshToken }: Props) {
  const { t, locale } = useI18n();
  const { themeId } = useTheme();
  const [history, setHistory] = useState<ResetDailySignalHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function loadHistory() {
      if (!userId) {
        setHistory([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const data = await fetchRecentSignals(userId, 14); // Pēdējās 14 dienas
      if (!alive) return;
      // Sort descending (newest first)
      setHistory(data.sort((a, b) => b.logged_on.localeCompare(a.logged_on)));
      setLoading(false);
    }

    void loadHistory();

    return () => {
      alive = false;
    };
  }, [userId, refreshToken]);

  if (!userId) return null;

  const entriesWithNotes = history.filter(row => 
    row.notes_private?.trim() || 
    row.mood != null || 
    row.energy != null || 
    row.sleep_wake_time != null
  );

  if (loading) {
    return (
      <GlassPanel className="p-5">
        <p className="text-sm text-(--color-text-secondary) animate-pulse">
          {locale === "lv" ? "Ielādē arhīvu..." : "Loading archive..."}
        </p>
      </GlassPanel>
    );
  }

  if (entriesWithNotes.length === 0) {
    return (
      <GlassPanel className="p-5 text-center">
        <p className="text-sm text-(--color-text-secondary)">
          {locale === "lv" 
            ? "Tavs arhīvs ir tukšs. Sāc fiksēt savu dienas ritmu, lai šeit redzētu vēsturi." 
            : "Your archive is empty. Start logging your daily rhythm to see history here."}
        </p>
      </GlassPanel>
    );
  }

  let title = locale === "lv" ? "Dienasgrāmata" : "Journal";
  if (themeId === "forge") title = locale === "lv" ? "Sistēmas žurnāls" : "System Log";
  if (themeId === "botanical") title = locale === "lv" ? "Ikdienas piezīmes" : "Daily Notes";
  if (themeId === "lucent") title = locale === "lv" ? "Pārdomas" : "Reflections";
  if (themeId === "pulse") title = locale === "lv" ? "Ritma arhīvs" : "Rhythm Log";

  return (
    <GlassPanel className="space-y-4 p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
          {title}
        </p>
        <span className="text-xs text-(--color-text-secondary)">
          {locale === "lv" ? "Pēdējās 14 dienas" : "Last 14 days"}
        </span>
      </div>

      <div className="space-y-4">
        {entriesWithNotes.map((entry) => {
          const date = new Date(entry.logged_on);
          const formattedDate = new Intl.DateTimeFormat(locale === "lv" ? "lv-LV" : "en-US", {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          }).format(date);

          // Pārvēršam "sleep wake time" atpakaļ uz 1-5 kvalitāti priekš UI
          const sleepQuality = entry.sleep_wake_time === "05:00" ? 1 : 
                               entry.sleep_wake_time === "06:00" ? 2 : 
                               entry.sleep_wake_time === "07:00" ? 3 :
                               entry.sleep_wake_time === "08:00" ? 4 :
                               entry.sleep_wake_time === "09:00" ? 5 : null;

          return (
            <div key={entry.logged_on} className="relative pl-4 border-l-2 border-(--color-surface-border) py-1">
              {/* Date & Core Metrics */}
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-xs font-semibold text-(--color-text-primary) w-20">
                  {formattedDate}
                </span>
                
                <div className="flex items-center gap-2 text-sm bg-background/50 rounded-full px-2 py-0.5 border border-(--color-surface-border)">
                  {entry.mood != null && (
                    <span title={t("reset.signals.mood")} className={entry.mood >= 4 ? "text-primary" : entry.mood <= 2 ? "text-rose-500" : "text-(--color-text-secondary)"}>
                      {entry.mood === 5 ? "😄" : entry.mood === 4 ? "🙂" : entry.mood === 3 ? "😐" : entry.mood === 2 ? "🙁" : "😞"}
                    </span>
                  )}
                  {entry.energy != null && (
                    <span title={t("reset.signals.energy")} className="opacity-80">
                      {entry.energy >= 4 ? "⚡" : entry.energy <= 2 ? "🔋" : "🔋"}
                    </span>
                  )}
                  {sleepQuality != null && (
                    <span title={t("reset.signals.groupSleep")} className="opacity-80">
                      {sleepQuality >= 4 ? "😌" : sleepQuality <= 2 ? "😫" : "😴"}
                    </span>
                  )}
                </div>
              </div>

              {/* Private Note */}
              {entry.notes_private?.trim() ? (
                <div className="mt-2 rounded-xl bg-(--color-surface)/50 p-3 text-sm text-(--color-text-secondary) italic">
                  &quot;{entry.notes_private}&quot;
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
}
