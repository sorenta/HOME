"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useTheme } from "@/components/providers/theme-provider";
import { transitionForTheme } from "@/lib/theme-logic";
import { hapticTheme } from "@/lib/haptic";
import { newId, type QuitGoal, type ResetWellnessV1 } from "@/lib/reset-wellness";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeading } from "@/components/ui/section-heading";

function formatDuration(ms: number, t: (k: string, v?: Record<string, string>) => string): string {
  if (ms < 0) ms = 0;
  const sec = Math.floor(ms / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (d > 0) {
    return t("reset.wellness.quit.elapsed.dhm", {
      d: String(d),
      h: String(h),
      m: String(m),
    });
  }
  if (h > 0) {
    return t("reset.wellness.quit.elapsed.hms", {
      h: String(h),
      m: String(m),
      s: String(s),
    });
  }
  return t("reset.wellness.quit.elapsed.ms", { m: String(m), s: String(s) });
}

function quitLabel(goal: QuitGoal, t: (k: string) => string): string {
  if (goal.subkind === "custom" && goal.customLabel) return goal.customLabel;
  return t(`reset.wellness.quit.${goal.subkind}`);
}

type Props = {
  goals: QuitGoal[];
  state: ResetWellnessV1;
  onUpdate: (next: ResetWellnessV1) => void;
};

export function ResetQuitStreak({ goals, state, onUpdate }: Props) {
  const { t } = useI18n();
  const { themeId } = useTheme();
  const spring = transitionForTheme(themeId);
  const [now, setNow] = useState(() => Date.now());
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  const [slipReason, setSlipReason] = useState("");

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const rows = useMemo(() => {
    return goals.map((g) => {
      const start = new Date(g.startedAt).getTime();
      const elapsed = now - start;
      const isNewSlip = elapsed < 86400 * 1000; // Less than 1 day

      let empathyMsg = "";
      if (isNewSlip && g.lastSlipAt) {
         empathyMsg = t("locale") === "lv" 
           ? "Viens klupiens neizdzēš tavu progresu. Svarīgākais ir tas, ka tu turpini." 
           : "One slip doesn't erase your progress. The most important thing is that you keep going.";
      } else if (isNewSlip) {
         empathyMsg = t("locale") === "lv"
           ? "Katrs liels mērķis sākas ar pirmo dienu."
           : "Every big goal starts with day one.";
      }

      return { goal: g, elapsed, line: formatDuration(elapsed, t), empathyMsg };
    });
  }, [goals, now, t]);

  function submitSlip(goal: QuitGoal) {
    const nowIso = new Date().toISOString();
    const trimmedReason = slipReason.trim();
    let hasUpdated = false;

    onUpdate({
      ...state,
      goals: state.goals.map((existingGoal) => {
        if (existingGoal.kind !== "quit" || existingGoal.id !== goal.id) return existingGoal;
        hasUpdated = true;
        return {
          ...existingGoal,
          startedAt: nowIso,
          lastSlipAt: nowIso,
          lastSlipReason: trimmedReason || undefined,
        };
      }).concat(
        hasUpdated
          ? []
          : [
              {
                ...goal,
                id: goal.id === "active-quit-plan" ? newId() : goal.id,
                startedAt: nowIso,
                lastSlipAt: nowIso,
                lastSlipReason: trimmedReason || undefined,
              },
            ],
      ),
    });

    setActiveGoalId(null);
    setSlipReason("");
  }

  if (goals.length === 0) return null;

  return (
    <GlassPanel className="space-y-4">
      <div className="space-y-1">
        <SectionHeading title={t("reset.wellness.quit.sectionTitle")} />
        <p className="text-xs text-(--color-text-muted) leading-relaxed">
          {t("reset.wellness.quit.sectionHint")}
        </p>
      </div>

      <ul className="space-y-4">
        {rows.map(({ goal, line, elapsed, empathyMsg }) => {
          const progressDays = Math.min((elapsed / (86400 * 1000 * 7)) * 100, 100);
          const isBotanical = themeId === "botanical";
          
          return (
            <motion.li
              key={goal.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-3xl border border-(--color-border) bg-background/40 px-5 py-4 relative overflow-hidden group transition-all hover:bg-background/60 shadow-sm"
            >
              {/* Visual background progress indicator */}
              <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${progressDays}%` }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
                 className={`absolute top-0 left-0 bottom-0 bg-primary/10 transition-all -z-10 ${isBotanical ? 'liquid-shape' : ''}`}
                 style={{ 
                   background: `linear-gradient(90deg, transparent, var(--color-accent-soft))` 
                 }}
              />

              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">
                  {quitLabel(goal, t)}
                </p>
                {progressDays >= 100 && (
                   <span className="text-base animate-bounce">🏆</span>
                )}
              </div>

              <div className="mt-3">
                <p
                  className="font-(family-name:--font-display) text-3xl font-black tabular-nums tracking-tighter text-(--color-text-primary) drop-shadow-sm"
                  aria-live="polite"
                >
                  {line}
                </p>
              </div>
              
              <AnimatePresence>
                {empathyMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 rounded-2xl bg-amber-500/5 border border-amber-500/10 p-3"
                  >
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 font-bold flex items-center gap-2">
                      <span className="text-lg">🌿</span> {empathyMsg}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-4 flex items-center justify-between">
                 <div className="space-y-0.5">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-(--color-text-muted)">
                      {t("reset.wellness.quit.since")}
                    </p>
                    <p className="text-[10px] font-medium text-(--color-text-secondary)">
                      {new Date(goal.startedAt).toLocaleDateString()}
                    </p>
                 </div>
                 
                 <button
                    type="button"
                    onClick={() => {
                      hapticTheme(themeId);
                      setActiveGoalId((current) => (current === goal.id ? null : goal.id));
                    }}
                    className="rounded-full border border-(--color-border) bg-background/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-(--color-text-primary) transition-all hover:bg-primary hover:text-primary-foreground active:scale-95"
                  >
                    {t("reset.dashboard.markSlip")}
                  </button>
              </div>

              <AnimatePresence>
                {activeGoalId === goal.id && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-4 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-(--color-text-muted) px-1">
                        {t("reset.wellness.quit.slipReasonLabel")}
                      </label>
                      <textarea
                        rows={2}
                        value={slipReason}
                        onChange={(event) => setSlipReason(event.target.value)}
                        placeholder={t("reset.wellness.quit.slipReasonPlaceholder")}
                        className="w-full resize-none rounded-2xl border border-(--color-border) bg-background px-4 py-3 text-sm text-(--color-text-primary) focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/40 outline-none transition-all"
                        maxLength={220}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => submitSlip(goal)}
                        className="flex-1 rounded-2xl bg-rose-500 px-4 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-rose-500/20 active:scale-95"
                      >
                        {t("reset.wellness.quit.restartNow")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveGoalId(null);
                          setSlipReason("");
                        }}
                        className="rounded-2xl border border-(--color-border) px-4 py-3 text-xs font-black uppercase tracking-widest text-(--color-text-primary) active:scale-95"
                      >
                        {t("reset.wellness.quit.cancelSlip")}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          );
        })}
      </ul>
    </GlassPanel>
  );
}
