"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n/i18n-context";
import { hapticTap } from "@/lib/haptic";
import type { HouseholdMember } from "@/lib/household";
import {
  addWater,
  getMlForMember,
  todayIso,
  yesterdayIso,
  type HouseholdWaterV1,
} from "@/lib/household-water-local";
import {
  addWaterSynced,
  loadWaterStateSynced,
  subscribeHouseholdWater,
} from "@/lib/household-water-sync";

type Props = {
  scopeId: string;
  members: HouseholdMember[];
  currentUserId: string | null;
};

export function LucentWaterWidget({ scopeId, members, currentUserId }: Props) {
  const { t } = useI18n();
  const [water, setWater] = useState<HouseholdWaterV1 | null>(null);
  const householdId = scopeId.startsWith("personal:") ? null : scopeId;

  const effectiveMembers = useMemo(() => {
    if (members.length > 0) return members;
    if (currentUserId) {
      return [
        {
          id: currentUserId,
          display_name: null,
          role_label: null,
          is_me: true,
        } satisfies HouseholdMember,
      ];
    }
    return [];
  }, [members, currentUserId]);

  useEffect(() => {
    let alive = true;
    void loadWaterStateSynced({ scopeId, householdId, currentUserId }).then((res) => {
      if (alive) setWater(res.state);
    });
    return () => { alive = false; };
  }, [currentUserId, householdId, scopeId]);

  useEffect(() => {
    let alive = true;
    const unsubscribe = subscribeHouseholdWater(householdId, () => {
      void loadWaterStateSynced({ scopeId, householdId, currentUserId }).then((res) => {
        if (!alive) return;
        setWater(res.state);
      });
    });
    return () => {
      alive = false;
      unsubscribe?.();
    };
  }, [currentUserId, householdId, scopeId]);

  const date = todayIso();

  const addForMember = useCallback((memberId: string, ml: number) => {
    if (!water) return;
    hapticTap();
    const before = water;
    setWater(addWater(before, date, memberId, ml));
    void addWaterSynced({
      scopeId,
      householdId,
      currentUserId,
      memberId,
      date,
      deltaMl: ml,
      currentState: before,
    }).then((res) => {
      setWater(res.state);
    });
  }, [currentUserId, date, householdId, scopeId, water]);

  if (!water || effectiveMembers.length === 0) {
    return (
      <div className="h-40 rounded-[2.5rem] bg-[#FCFBF8] dark:bg-zinc-900/90 p-8 shadow-[0_30px_60px_-15px_rgba(210,200,190,0.5),inset_0_1px_2px_rgba(255,255,255,1)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.05)] border border-[#F3F0EA] dark:border-zinc-800/80 animate-pulse" />
    );
  }

  const goal = water.goalMl;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative overflow-hidden rounded-[2.5rem] bg-[#FCFBF8] dark:bg-zinc-900/90 p-6 sm:p-8 shadow-[0_30px_60px_-15px_rgba(210,200,190,0.5),inset_0_1px_2px_rgba(255,255,255,1)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.05)] border border-[#F3F0EA] dark:border-zinc-800/80"
    >
      {/* Soft water-like background elements - smaller and subtler with warm, sandy/peach tones */}
      <motion.div 
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.2, 0.4, 0.2],
          rotate: [0, 3, 0]
        }}
        transition={{ 
          duration: 14, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
        className="absolute -top-12 -right-12 w-40 h-40 bg-amber-200/30 dark:bg-amber-500/10 rounded-full blur-[40px] pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.3, 0.15] 
        }}
        transition={{ 
          duration: 18, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1 
        }}
        className="absolute -bottom-16 -left-16 w-48 h-48 bg-rose-200/30 dark:bg-rose-500/10 rounded-full blur-[48px] pointer-events-none" 
      />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-medium text-foreground tracking-tight">
              Rūpes par sevi
            </h2>
            <p className="text-xs font-light text-foreground/50 mt-0.5">
              Neaizmirsti padzerties.
            </p>
          </div>
          <span className="text-[0.6rem] font-medium uppercase tracking-[0.15em] text-amber-700/70 dark:text-amber-400/70">
            {t("water.widget.eyebrow")}
          </span>
        </div>

        <ul className="flex flex-col gap-4">
          {effectiveMembers.map((m) => {
            const ml = getMlForMember(water, date, m.id);
            const pct = Math.min(100, Math.round((ml / goal) * 100));
            const isMe = m.is_me || m.id === currentUserId;
            
            return (
              <li key={m.id} className="flex flex-col gap-2.5">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm font-medium text-foreground/90">
                      {m.display_name?.trim() || t("household.membersList.member")}
                    </p>
                    <p className="text-[0.65rem] font-medium text-foreground/40 tracking-wider">
                      {ml} <span className="opacity-60">/ {goal} ml</span>
                    </p>
                  </div>
                  
                  {isMe && (
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => addForMember(m.id, 250)}
                        className="rounded-full bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 border border-amber-900/10 dark:border-amber-100/10 px-2.5 py-1 text-[0.65rem] font-semibold text-amber-950 dark:text-amber-100 transition-all shadow-sm backdrop-blur-md active:scale-95"
                      >
                        + Glāze
                      </button>
                      <button
                        type="button"
                        onClick={() => addForMember(m.id, 500)}
                        className="rounded-full bg-rose-100/80 dark:bg-rose-900/40 hover:bg-rose-200/90 dark:hover:bg-rose-900/60 border border-rose-900/10 dark:border-rose-100/10 px-2.5 py-1 text-[0.65rem] font-semibold text-rose-950 dark:text-rose-100 transition-all shadow-sm backdrop-blur-md active:scale-95"
                      >
                        + Pudele
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div
                    className="relative h-2.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-inner"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ type: "spring", bounce: 0.1, duration: 1.5 }}
                      className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-amber-300/80 to-rose-300/80 shadow-[0_0_10px_rgba(251,191,36,0.2)]"
                    >
                      {/* Subtler light reflection on water */}
                      <div className="absolute top-0 left-0 w-full h-[40%] bg-white/30 rounded-t-full" />
                    </motion.div>
                  </div>
                  
                  <p className="text-[0.6rem] font-light text-foreground/40 italic">
                    {pct >= 100 
                      ? "Tavs ķermenis tev saka paldies." 
                      : pct >= 50 
                        ? "Turpini uzturēt ritmu." 
                        : "Katrs malks ir svarīgs."}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </motion.section>
  );
}
