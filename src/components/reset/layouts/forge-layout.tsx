import { GlassPanel } from "@/components/ui/glass-panel";
import { ResetDailySignalsForm } from "@/components/reset/reset-daily-signals-form";
import { ResetTrendsPanel } from "@/components/reset/reset-trends-panel";
import { ResetBodyTracking } from "@/components/reset/reset-body-tracking";
import { ResetAiPanel } from "@/components/reset/reset-ai-panel";
import { ResetHealthSourcesPanel } from "@/components/reset/reset-health-sources-panel";
import type { ResetWellnessV1, ResetDailySignalsRow } from "@/lib/reset-wellness";

type Props = {
  greetingText: string;
  hasTodayCheckIn: boolean;
  locale: "lv" | "en";
  userId: string | null;
  todaySignals: ResetDailySignalsRow | null;
  quickActions: any[];
  quickMetrics: any[];
  wellness: ResetWellnessV1;
  signalsRefreshToken: number;
  onSignalsSaved: () => void;
  onUpdate: (next: ResetWellnessV1) => void;
  onOpenQuestionnaire: () => void;
  moodLabel: string;
  moodScore: number;
  aiSignals: any[];
  quitPlan: any;
  quitDays: number | null;
  aiGoals: string[];
  goalLabel: string;
  metricPreview: string;
};

export function ForgeResetLayout({
  greetingText,
  hasTodayCheckIn,
  locale,
  userId,
  todaySignals,
  quickActions,
  quickMetrics,
  wellness,
  signalsRefreshToken,
  onSignalsSaved,
  onUpdate,
  onOpenQuestionnaire,
  moodLabel,
  moodScore,
  aiSignals,
  quitPlan,
  quitDays,
  aiGoals,
  goalLabel,
  metricPreview,
}: Props) {
  return (
    <div className="space-y-10">
      {/* SECTOR 01: VITAL_MONITORING */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-1 opacity-40">
          <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 01</span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Dzīvības signālu monitorings</span>
        </div>
        
        <GlassPanel className="space-y-4 border-primary/20 bg-black/40 rounded-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">
                STATUS: OPERATIONAL_OVERVIEW
              </p>
              <h2 className="text-2xl font-bold uppercase tracking-tight text-white font-(family-name:--font-rajdhani)">
                {greetingText}
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-white/60">
                {hasTodayCheckIn 
                  ? (locale === "lv" ? "Dati sinhronizēti un saglabāti arhīvā." : "Data synced and securely archived.")
                  : (locale === "lv" ? "Sistēma gaida dienas rādītāju ievadi." : "System awaits daily input.")}
              </p>
            </div>

            {!hasTodayCheckIn && (
              <button
                type="button"
                onClick={() => document.getElementById("reset-daily-signals")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex shrink-0 items-center justify-center rounded-sm border border-primary/30 bg-primary/10 px-4 py-2 text-[0.6rem] font-black uppercase tracking-widest text-primary hover:bg-primary/20 transition-all"
              >
                [ {locale === "lv" ? "Atvērt Check-in" : "Open Check-in"} ]
              </button>
            )}
          </div>

          <GlassPanel className="p-6 border-white/5 bg-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40 mb-2">
              {locale === "lv" ? "Mājas mikroklimats" : "Household Vibe"}
            </p>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <span className="text-xs font-bold text-primary">Tu</span>
              </div>
              <span className="text-sm font-medium text-white">
                {todaySignals?.mood != null ? (
                  todaySignals.mood >= 4 ? (locale === "lv" ? "Lieliski" : "Great") :
                  todaySignals.mood === 3 ? (locale === "lv" ? "Mierīgi" : "Calm") :
                  (locale === "lv" ? "Smagi" : "Tough")
                ) : (locale === "lv" ? "Nav datu" : "No data")}
              </span>
            </div>
          </GlassPanel>
        </GlassPanel>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="rounded-sm border border-white/5 bg-black/20 px-4 py-3 text-left transition hover:border-primary/30 group"
            >
              <p className="text-[0.6rem] font-black uppercase tracking-widest text-primary group-hover:animate-pulse">{action.label}</p>
              <p className="mt-1 text-[0.5rem] font-mono text-white/30 uppercase tracking-tighter">{action.hint}</p>
            </button>
          ))}
        </div>
      </div>

      {/* SECTOR 02: BIOMETRICS & LOGS */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-1 opacity-40">
          <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 02</span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Biometriskā datu plūsma</span>
        </div>
        
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
          <div className="space-y-4">
            <div id="reset-daily-signals">
              <ResetDailySignalsForm
                userId={userId}
                trackMetrics={quickMetrics}
                onSaved={onSignalsSaved}
              />
            </div>
            <div id="reset-trends-panel">
              <ResetTrendsPanel userId={userId} refreshToken={signalsRefreshToken} />
            </div>
          </div>
          <div className="space-y-4">
            <div id="reset-body-tracking">
              <ResetBodyTracking state={wellness} onUpdate={onUpdate} />
            </div>
            <ResetAiPanel
              mood={moodLabel}
              moodScore={moodScore}
              energy={todaySignals?.energy}
              signals={aiSignals}
              quitDays={quitPlan ? quitDays : null}
              goals={aiGoals}
            />
          </div>
        </div>
      </div>

      {/* SECTOR 03: ARCHIVE & CORE */}
      <div className="space-y-3 pb-12">
        <div className="flex items-center gap-3 px-1 opacity-40">
          <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 03</span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Arhīvs un konfigurācija</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div id="reset-health-sources">
            <ResetHealthSourcesPanel />
          </div>
          <GlassPanel className="space-y-3 border-white/5 bg-black/20 rounded-sm">
            <p className="text-[0.6rem] font-black uppercase tracking-[0.16em] text-primary">
              SYSTEM_PROFILE_CONFIG
            </p>
            <p className="text-lg font-bold text-white font-(family-name:--font-rajdhani)">{goalLabel.toUpperCase()}</p>
            <div className="rounded-sm border border-white/5 bg-white/5 p-3">
              <p className="text-[0.5rem] font-mono uppercase tracking-[0.12em] text-white/40">
                DATA_METRICS_STREAM
              </p>
              <p className="mt-1 text-xs font-mono text-white/80">
                {metricPreview.toUpperCase() || "NO_METRICS_ENABLED"}
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenQuestionnaire}
              className="w-full rounded-sm border border-white/10 bg-white/5 px-4 py-2 text-[0.6rem] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 transition-all"
            >
              [ REDIGJET_ANKETU ]
            </button>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
