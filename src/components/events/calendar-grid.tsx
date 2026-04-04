"use client";

import { useMemo, useState } from "react";

type Props = {
  locale: "lv" | "en";
  calendarMonth: Date;
  selectedDate: string;
  todayIso: string;
  indicatorsByDate: Record<string, number>;
  onSelectDate: (iso: string) => void;
  onShiftMonth: (offset: number) => void;
  onGoToToday: () => void;
  monthDays: (Date | null)[];
};

const WEEKDAY_LABELS = {
  lv: ["P", "O", "T", "C", "Pk", "S", "Sv"],
  en: ["M", "T", "W", "T", "F", "S", "S"],
} as const;

function isoForDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().slice(0, 10);
}

export function CalendarGrid({
  locale,
  calendarMonth,
  selectedDate,
  todayIso,
  indicatorsByDate,
  onSelectDate,
  onShiftMonth,
  onGoToToday,
  monthDays,
}: Props) {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "lv" ? "lv-LV" : "en-US", {
        month: "long",
        year: "numeric",
      }).format(calendarMonth),
    [calendarMonth, locale],
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onShiftMonth(-1)}
          className="h-10 w-10 text-sm font-semibold"
          style={{
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            color: "var(--color-foreground)",
          }}
          aria-label={locale === "lv" ? "Iepriekšējais mēnesis" : "Previous month"}
        >
          ←
        </button>

        <p className="text-sm font-semibold capitalize" style={{ color: "var(--color-foreground)" }}>
          {monthLabel}
        </p>

        <button
          type="button"
          onClick={() => onShiftMonth(1)}
          className="h-10 w-10 text-sm font-semibold"
          style={{
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            color: "var(--color-foreground)",
          }}
          aria-label={locale === "lv" ? "Nākamais mēnesis" : "Next month"}
        >
          →
        </button>
      </div>

      <button
        type="button"
        onClick={onGoToToday}
        className="px-3 py-1.5 text-xs font-semibold"
        style={{
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--color-border)",
          color: "color-mix(in srgb, var(--color-foreground) 88%, transparent)",
        }}
      >
        {locale === "lv" ? "Šodiena" : "Today"}
      </button>

      <div
        className="grid grid-cols-7 gap-2"
        onTouchStart={(event) => setTouchStartX(event.changedTouches[0]?.clientX ?? null)}
        onTouchEnd={(event) => {
          if (touchStartX === null) return;
          const endX = event.changedTouches[0]?.clientX ?? touchStartX;
          const delta = endX - touchStartX;
          if (Math.abs(delta) > 42) {
            onShiftMonth(delta < 0 ? 1 : -1);
          }
          setTouchStartX(null);
        }}
      >
        {WEEKDAY_LABELS[locale].map((label, index) => (
          <p
            key={`${label}-${index}`}
            className="text-center text-[0.68rem] font-semibold uppercase tracking-[0.12em]"
            style={{ color: "color-mix(in srgb, var(--color-foreground) 58%, transparent)" }}
          >
            {label}
          </p>
        ))}

        {monthDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" aria-hidden />;
          }

          const dayIso = isoForDate(day);
          const isSelected = dayIso === selectedDate;
          const isToday = dayIso === todayIso;
          const indicatorCount = indicatorsByDate[dayIso] ?? 0;

          return (
            <button
              key={dayIso}
              type="button"
              onClick={() => onSelectDate(dayIso)}
              className="aspect-square p-2 text-left transition-transform active:scale-[0.98]"
              style={{
                borderRadius: "var(--radius-md)",
                border: `1px solid ${isSelected ? "var(--color-accent)" : "var(--color-border)"}`,
                background: isSelected
                  ? "color-mix(in srgb, var(--color-accent) 16%, transparent)"
                  : "color-mix(in srgb, var(--color-card) 78%, transparent)",
                boxShadow: isSelected ? "0 0 0 1px color-mix(in srgb, var(--color-accent) 55%, transparent)" : "none",
              }}
            >
              <div className="flex h-full flex-col">
                <span
                  className="inline-flex h-6 w-6 items-center justify-center text-sm font-semibold"
                  style={{
                    borderRadius: "999px",
                    color: isToday ? "var(--color-accent)" : "var(--color-foreground)",
                    background: isToday
                      ? "color-mix(in srgb, var(--color-accent) 14%, transparent)"
                      : "transparent",
                  }}
                >
                  {day.getDate()}
                </span>

                {indicatorCount > 0 ? (
                  <div className="mt-auto flex items-center gap-1">
                    {Array.from({ length: Math.min(indicatorCount, 3) }).map((_, dotIndex) => (
                      <span
                        key={`${dayIso}-dot-${dotIndex}`}
                        className="h-1.5 w-1.5"
                        style={{
                          borderRadius: "999px",
                          background: "var(--color-accent)",
                          opacity: 1 - dotIndex * 0.24,
                        }}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
