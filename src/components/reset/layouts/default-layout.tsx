import { motion } from "framer-motion";
import { useTheme } from "@/components/providers/theme-provider";
import { transitionForTheme } from "@/lib/theme-logic";
import { GlassPanel } from "@/components/ui/glass-panel";
import { ResetDailySignalsForm } from "@/components/reset/reset-daily-signals-form";
import { ResetTrendsPanel } from "@/components/reset/reset-trends-panel";
import { ResetJournal } from "@/components/reset/reset-journal";
import { ResetBodyTracking } from "@/components/reset/reset-body-tracking";
import { ResetTrainingPlan } from "@/components/reset/reset-training-plan";
import { ResetAiPanel } from "@/components/reset/reset-ai-panel";
import { ResetQuitStreak } from "@/components/reset/reset-quit-streak";
import { ResetHealthSourcesPanel } from "@/components/reset/reset-health-sources-panel";
import type { ResetWellnessV1 } from "@/lib/reset-wellness";
import type { ResetDailySignalsRow } from "@/lib/reset-daily-signals";

type Props = {
  locale: "lv" | "en";
  userId: string | null;
  todaySignals: ResetDailySignalsRow | null;
  quickMetrics: any[];
  wellness: ResetWellnessV1;
  signalsRefreshToken: number;
  onSignalsSaved: () => void;
  onUpdate: (next: ResetWellnessV1) => void;
  onOpenQuestionnaire: () => void;
  bodyMode: any;
  hasTodayCheckIn: boolean;
  moodLabel: string;
  moodScore: number;
  aiSignals: any[];
  quitPlan: any;
  quitDays: number | null;
  aiGoals: string[];
  activeQuitGoals: any[];
  goalLabel: string;
  metricPreview: string;
  t: (key: string) => string;
};

export function DefaultResetLayout({
  locale,
  userId,
  todaySignals,
  quickMetrics,
  wellness,
  signalsRefreshToken,
  onSignalsSaved,
  onUpdate,
  onOpenQuestionnaire,
  bodyMode,
  hasTodayCheckIn,
  moodLabel,
  moodScore,
  aiSignals,
  quitPlan,
  quitDays,
  aiGoals,
  activeQuitGoals,
  goalLabel,
  metricPreview,
  t,
}: Props) {
  const { themeId } = useTheme();
  const spring = transitionForTheme(themeId);

  // Animācijas varianti paneļiem
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  // Dinamisks mirdzums balstīts uz noskaņojumu
  const moodGlowColor = moodScore >= 74 ? "rgba(34, 197, 94, 0.15)" : moodScore >= 52 ? "rgba(184, 150, 106, 0.12)" : "rgba(220, 38, 38, 0.08)";

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-6 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] items-start pt-2 relative"
    >
      {/* Mood Glow Background */}
      <div 
        className="absolute inset-0 -z-10 blur-[100px] transition-colors duration-1000"
        style={{ backgroundColor: moodGlowColor }}
      />
      
      {/* LEFT COLUMN: Input & Deep Analytics */}
      <div className="space-y-6 min-w-0">
        <motion.div variants={item} id="reset-daily-signals">
          <ResetDailySignalsForm
            userId={userId}
            trackMetrics={quickMetrics}
            onSaved={onSignalsSaved}
          />
        </motion.div>

        <motion.div variants={item} id="reset-trends-panel">
          <ResetTrendsPanel userId={userId} refreshToken={signalsRefreshToken} />
        </motion.div>

        <motion.div variants={item} id="reset-journal">
          <ResetJournal userId={userId} refreshToken={signalsRefreshToken} />
        </motion.div>

        <motion.div variants={item} className="grid gap-6 md:grid-cols-2 items-start">
          <div id="reset-body-tracking">
            <ResetBodyTracking state={wellness} onUpdate={onUpdate} />
          </div>
          {bodyMode ? (
            <div id="reset-training">
              <ResetTrainingPlan mode={bodyMode} state={wellness} onUpdate={onUpdate} />
            </div>
          ) : null}
        </motion.div>
      </div>

      {/* RIGHT COLUMN: Quick Status, AI & Config */}
      <div className="space-y-6">
        <motion.div variants={item} className="flex items-center justify-end px-2 pb-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              {hasTodayCheckIn ? (
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              ) : (
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
              )}
            </span>
            <p className="text-[10px] uppercase tracking-widest text-(--color-text-secondary)">
              {hasTodayCheckIn 
                ? (locale === "lv" ? "Sinhronizēts arhīvā" : "Synced to archive")
                : (locale === "lv" ? "Gaida datus" : "Awaiting logs")}
            </p>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <GlassPanel className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
                {locale === "lv" ? "Mājas mikroklimats" : "Household Vibe"}
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                    <span className="text-xs font-bold text-primary">Tu</span>
                  </div>
                  <span className="text-sm font-medium text-(--color-text-primary)">
                    {todaySignals?.mood != null ? (
                      todaySignals.mood >= 4 ? (locale === "lv" ? "Lieliski" : "Great") :
                      todaySignals.mood === 3 ? (locale === "lv" ? "Mierīgi" : "Calm") :
                      (locale === "lv" ? "Smagi" : "Tough")
                    ) : (locale === "lv" ? "Nav datu" : "No data")}
                  </span>
                </div>
              </div>
            </div>
          </GlassPanel>
        </motion.div>

        <motion.div variants={item}>
          <ResetAiPanel
            mood={moodLabel}
            moodScore={moodScore}
            energy={todaySignals?.energy}
            signals={aiSignals}
            quitDays={quitPlan ? quitDays : null}
            goals={aiGoals}
          />
        </motion.div>

        {activeQuitGoals.length > 0 && (
          <motion.div variants={item} id="reset-quit-streak">
            <ResetQuitStreak goals={activeQuitGoals} state={wellness} onUpdate={onUpdate} />
          </motion.div>
        )}

        <motion.div variants={item}>
          <GlassPanel className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
                  {locale === "lv" ? "Profils" : "Profile"}
                </p>
                <p className="text-sm font-semibold text-(--color-text-primary)">{goalLabel}</p>
              </div>
              <button
                type="button"
                onClick={onOpenQuestionnaire}
                className="shrink-0 rounded-full border border-(--color-surface-border) bg-(--color-surface) px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-(--color-text-secondary) transition hover:text-(--color-text-primary)"
              >
                {locale === "lv" ? "Labot" : "Edit"}
              </button>
            </div>
            <div id="reset-health-sources" className="pt-2">
              <ResetHealthSourcesPanel />
            </div>
          </GlassPanel>
        </motion.div>
      </div>
    </motion.div>
  );
}
