"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n/i18n-context";

type Props = {
  locale: "lv" | "en";
  selectedDate: string;
  todayIso: string;
  indicatorsByDate: Record<string, number>;
  onSelectDate: (iso: string) => void;
};

const WEEKDAY_LABELS = {
  lv: ["P", "O", "T", "C", "Pk", "S", "Sv"],
  en: ["M", "T", "W", "T", "F", "S", "S"],
} as const;

function isoForDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().slice(0, 10);
}

export function LucentWeeklyGrid({
  locale,
  selectedDate,
  todayIso,
  indicatorsByDate,
  onSelectDate,
}: Props) {
  const [viewAnchor, setViewAnchor] = useState(selectedDate);
  const { t } = useI18n();

  useEffect(() => {
    setViewAnchor(selectedDate);
  }, [selectedDate]);

  function shiftWeek(days: number) {
    const d = new Date(`${viewAnchor}T00:00:00`);
    d.setDate(d.getDate() + days);
    setViewAnchor(isoForDate(d));
  }

  const weekDays = useMemo(() => {
    const anchor = new Date(`${viewAnchor}T00:00:00`);
    const dayOfWeek = anchor.getDay(); 
    const diff = anchor.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1);

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(anchor);
      d.setDate(diff + i);
      return isoForDate(d);
    });
  }, [viewAnchor]);

  const monthLabel = useMemo(() => {
    const d = new Date(`${viewAnchor}T00:00:00`);
    // 'undefined' as locale falls back to the system locale so it's culturally appropriate for the user
    return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }, [viewAnchor]);

  return (
    <div className="flex flex-col justify-between gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold capitalize text-foreground/80 tracking-wide">
          {monthLabel}
        </h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => shiftWeek(-7)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FAF8F5] dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 transition-all border border-white/80 dark:border-white/5 shadow-sm text-foreground/60 hover:text-foreground"
          >
            ←
          </button>
          <button 
            onClick={() => {
              setViewAnchor(todayIso);
              onSelectDate(todayIso);
            }}
            className="text-[0.65rem] font-bold uppercase tracking-widest text-primary/70 hover:text-primary px-2"
          >
            {locale === "lv" ? "Šodien" : "Today"}
          </button>
          <button 
            onClick={() => shiftWeek(7)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FAF8F5] dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 transition-all border border-white/80 dark:border-white/5 shadow-sm text-foreground/60 hover:text-foreground"
          >
            →
          </button>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-2">
          {WEEKDAY_LABELS[locale].map((lbl, idx) => (
            <div key={idx} className="text-center text-[0.65rem] font-bold text-foreground/40">
              {lbl}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {weekDays.map((iso) => {
            const dateObj = new Date(`${iso}T00:00:00`);
            const dNum = dateObj.getDate();
            const isToday = iso === todayIso;
            const isSelected = iso === selectedDate;
            const count = indicatorsByDate[iso] || 0;

            return (
              <button
                key={iso}
                onClick={() => onSelectDate(iso)}
                className={`relative flex flex-col items-center justify-center h-16 sm:h-20 rounded-[1.25rem] sm:rounded-[1.5rem] transition-all border ${
                  isSelected 
                    ? "bg-gradient-to-b from-[#FFFDF0] to-[#FAF5E6] dark:from-amber-900/20 dark:to-rose-900/20 border-[#F3EAD5] dark:border-amber-700/40 shadow-[0_8px_16px_rgba(230,200,150,0.4)] scale-105" 
                    : "bg-[#FCFBF8] dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border-white/80 dark:border-white/5 shadow-sm hover:scale-105"
                }`}
              >
                {isToday && !isSelected && (
                  <div className="absolute top-2 w-1.5 h-1.5 rounded-full bg-primary/40" />
                )}
                {isToday && isSelected && (
                  <div className="absolute top-2 w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                )}

                <span className={`text-lg sm:text-xl font-semibold mt-1 ${isSelected ? 'text-amber-900 dark:text-amber-100' : isToday ? 'text-primary' : 'text-foreground/80'}`}>
                  {dNum}
                </span>
                
                <div className="flex gap-[3px] mt-1 h-1.5 items-center">
                  {Array.from({ length: Math.min(3, count) }).map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-primary/30'}`} 
                    />
                  ))}
                  {count > 3 && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-primary/40'}`} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
