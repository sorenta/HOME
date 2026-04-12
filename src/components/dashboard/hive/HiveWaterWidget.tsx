"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/i18n-context";
import { hapticTap } from "@/lib/haptic";
import type { HouseholdMember } from "@/lib/household";
import {
  addWater,
  getMlForMember,
  todayIso,
  type HouseholdWaterV1,
} from "@/lib/household-water-local";
import {
  addWaterSynced,
  loadWaterStateSynced,
  subscribeHouseholdWater,
} from "@/lib/household-water-sync";
import hiveStyles from "@/components/theme/hive.module.css";

type Props = {
  scopeId: string;
  members: HouseholdMember[];
  currentUserId: string | null;
};

export function HiveWaterWidget({ scopeId, members, currentUserId }: Props) {
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
      <div
        className={`rounded-3xl ${hiveStyles.hiveCard} p-8 bg-[color-mix(in_srgb,var(--color-card)_85%,transparent)] backdrop-blur-md border-2 border-primary/20 animate-pulse`}
      />
    );
  }

  const goal = water.goalMl;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className={`relative overflow-hidden rounded-3xl ${hiveStyles.hiveCard} p-6 sm:p-8 bg-[color-mix(in_srgb,var(--color-card)_85%,transparent)] backdrop-blur-md border-2 border-primary/20 shadow-[0_12px_32px_rgba(217,119,6,0.1)]`}
    >
      {/* Background amber glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-primary/5 pointer-events-none" />
      
      {/* Decorative hexagon watermark */}
      <div 
        className="absolute -right-12 top-4 w-40 h-40 opacity-[0.06] pointer-events-none"
        style={{
          background: "currentColor",
          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          color: "var(--color-primary)"
        }}
      />

      <div className="relative z-10 flex flex-col gap-5">
        <div className="flex justify-between items-start border-b border-primary/20 pb-3">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 flex items-center justify-center bg-primary/20 border border-primary/30 text-primary" >
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
             </div>
             <div>
               <h2 className="text-base font-semibold text-(--color-text-primary) tracking-tight">
                 Ūdens krājumi
               </h2>
               <p className="text-xs font-medium text-(--color-text-secondary) mt-0.5 uppercase tracking-wider">
                 Rūpes par sevi
               </p>
             </div>
          </div>
          <span className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-primary/80 mt-1">
            {t("water.widget.eyebrow")}
          </span>
        </div>

        <ul className="flex flex-col gap-6">
          {effectiveMembers.map((m) => {
            const ml = getMlForMember(water, date, m.id);
            const pct = Math.min(100, Math.round((ml / goal) * 100));
            const isMe = m.is_me || m.id === currentUserId;
            
            return (
              <li key={m.id} className="flex flex-col gap-3">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm font-bold text-(--color-text-primary)">
                      {m.display_name?.trim() || t("household.membersList.member")}
                    </p>
                    <p className="text-[0.65rem] font-bold text-primary tracking-widest uppercase">
                      {ml} <span className="opacity-60 text-(--color-text-secondary)">/ {goal} ml</span>
                    </p>
                  </div>
                  
                  {isMe && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => addForMember(m.id, 250)}
                        className="rounded bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/20 transition-all shadow-[0_0_10px_rgba(251,191,36,0.1)] active:scale-95"
                      >
                        + Glāze
                      </button>
                      <button
                        type="button"
                        onClick={() => addForMember(m.id, 500)}
                        className="rounded bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 hover:bg-amber-500/30 transition-all shadow-[0_0_10px_rgba(245,158,11,0.15)] active:scale-95"
                      >
                        + Pudele
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  {/* Honey-styled progress bar */}
                  <div
                    className="relative h-3 overflow-hidden bg-primary/10 border border-primary/20"
                    
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ type: "spring", bounce: 0.1, duration: 1.5 }}
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 to-primary shadow-[0_0_12px_rgba(251,191,36,0.4)]"
                    >
                      {/* Top gloss reflection for honey */}
                      <div className="absolute top-0 left-0 w-full h-[30%] bg-white/40" />
                    </motion.div>
                  </div>
                  
                  <p className="text-[0.65rem] font-medium text-(--color-text-secondary) opacity-80 uppercase tracking-widest text-right">
                    {pct >= 100 
                      ? "Pārpilnība sasniegta" 
                      : pct >= 50 
                        ? "Puse stropa piepildīta" 
                        : "Turpini papildināt krājumus"}
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
);
}

