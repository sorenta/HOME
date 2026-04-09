"use client";

import { useMemo, useState, useEffect } from "react";

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

export function ForgeWeeklyGrid({
  locale,
  selectedDate,
  todayIso,
  indicatorsByDate,
  onSelectDate,
}: Props) {
  const [viewAnchor, setViewAnchor] = useState(selectedDate);

  // Sinhronizēt ar ārējo selectedDate, ja tas mainās (piem., noklikšķinot uz kalendāra sākuma lapā)
  useEffect(() => {
    setViewAnchor(selectedDate);
  }, [selectedDate]);

  function shiftWeek(days: number) {
    const d = new Date(`${viewAnchor}T00:00:00`);
    d.setDate(d.getDate() + days);
    setViewAnchor(isoForDate(d));
  }

  // Izrēķinām nedēļas dienas, pamatojoties uz viewAnchor
  const weekDays = useMemo(() => {
    const anchor = new Date(`${viewAnchor}T00:00:00`);
    const dayOfWeek = anchor.getDay(); // 0 = Sv, 1 = P...
    const diff = anchor.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(anchor);
      d.setDate(diff + i);
      return d;
    });
  }, [viewAnchor]);

  const monthLabel = useMemo(() => {
    const d = new Date(`${viewAnchor}T00:00:00`);
    return new Intl.DateTimeFormat(locale === "lv" ? "lv-LV" : "en-US", {
      month: "long",
      year: "numeric",
    }).format(d);
  }, [viewAnchor, locale]);

  return (
    <div className="space-y-4">
      {/* Navigācijas galvene */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
        <button
          onClick={() => shiftWeek(-7)}
          className="h-8 w-8 flex items-center justify-center rounded-sm bg-black/40 border border-white/10 text-white/60 hover:text-white hover:border-primary/50 transition-colors active:scale-95"
          aria-label={locale === "lv" ? "Iepriekšējā nedēļa" : "Previous week"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="butt" strokeLinejoin="miter">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>

        <p className="text-[0.65rem] font-bold uppercase tracking-widest text-primary/80">
          {monthLabel}
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setViewAnchor(todayIso);
              onSelectDate(todayIso);
            }}
            className="px-3 h-8 flex items-center justify-center rounded-sm bg-black/40 border border-white/10 text-[0.55rem] font-black uppercase tracking-[0.2em] text-white/60 hover:text-primary hover:border-primary/50 transition-colors active:scale-95"
          >
            {locale === "lv" ? "Šodien" : "Today"}
          </button>
          <button
            onClick={() => shiftWeek(7)}
            className="h-8 w-8 flex items-center justify-center rounded-sm bg-black/40 border border-white/10 text-white/60 hover:text-white hover:border-primary/50 transition-colors active:scale-95"
            aria-label={locale === "lv" ? "Nākamā nedēļa" : "Next week"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="butt" strokeLinejoin="miter">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Dienu režģis */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const dayIso = isoForDate(day);
          const isSelected = dayIso === selectedDate;
          const isToday = dayIso === todayIso;
          const hasEvents = (indicatorsByDate[dayIso] ?? 0) > 0;
          const label = WEEKDAY_LABELS[locale][index];

          return (
            <button
              key={dayIso}
              onClick={() => onSelectDate(dayIso)}
              className={`relative flex flex-col items-center py-3 px-1 rounded-sm border transition-all active:scale-[0.95] ${
                isSelected 
                  ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(225,29,46,0.2)]" 
                  : "bg-black/40 border-white/5 hover:border-white/20"
              }`}
            >
              <span className={`text-[0.55rem] font-black uppercase tracking-tighter mb-1 ${
                isSelected ? "text-primary" : "text-white/30"
              }`}>
                {label}
              </span>
              <span className={`font-(family-name:--font-rajdhani) text-lg font-bold leading-none ${
                isSelected ? "text-white" : isToday ? "text-primary" : "text-white/70"
              }`}>
                {day.getDate()}
              </span>

              {/* Event Indicator */}
              {hasEvents && (
                <div className={`absolute bottom-1.5 w-4 h-[2px] rounded-full ${
                  isSelected ? "bg-white" : "bg-primary"
                } shadow-[0_0_5px_currentColor]`} />
              )}

              {/* Today indicator dot */}
              {isToday && !isSelected && (
                <div className="absolute top-1 right-1 w-1 h-1 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
