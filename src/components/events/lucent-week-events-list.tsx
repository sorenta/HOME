"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/i18n-context";
import { type DayEntry } from "@/components/events/day-events-list";

type Props = {
  selectedDate: string; // Used to determine the anchor week
  allEvents: any[]; // The raw events array from the page
  allTasks: any[]; // The raw tasks array from the page
  onToggleTask: (taskId: string, done: boolean) => void;
  onDeleteEvent: (eventId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditItem: (item: DayEntry) => void;
};

const WEEKDAY_LABELS = {
  lv: ["Svētdiena", "Pirmdiena", "Otrdiena", "Trešdiena", "Ceturtdiena", "Piektdiena", "Sestdiena"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
} as const;

export function LucentWeekEventsList({
  selectedDate,
  allEvents,
  allTasks,
  onToggleTask,
  onDeleteEvent,
  onDeleteTask,
  onEditItem,
}: Props) {
  const { t, locale } = useI18n();

  const groupedDays = useMemo(() => {
    const anchor = new Date(`${selectedDate}T00:00:00`);

    const days = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date(anchor);
      d.setDate(anchor.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const dayLabelIndex = d.getDay(); // 0 is Sunday, 1 is Monday

      // Filter events for this day
      const dayEvents = allEvents
        .filter((item) => item.date === iso)
        .map((item) => ({
          id: `event-${item.id}`,
          sourceId: item.id,
          kind: "event" as const,
          dateIso: iso,
          title: item.title,
          timeLabel: t("events.allDay"),
          typeLabel: "Notikums",
          note: "",
          style: item.style,
        }));

      // Filter tasks for this day
      const dayTasks = allTasks
        .filter((item) => item.dueDate === iso)
        .map((item) => ({
          id: `task-${item.id}`,
          sourceId: item.id,
          kind: "task" as const,
          dateIso: iso,
          title: item.title,
          timeLabel: t("events.byEndOfDay"),
          typeLabel: "Uzdevums",
          note: `${t("events.assigneePrefix")}: ${item.assigneeName}`,
          style: "shared" as const,
          done: item.done,
        }));

      const items = [...dayEvents, ...dayTasks];

      return {
        iso,
        dateObj: d,
        label: WEEKDAY_LABELS[locale][dayLabelIndex],
        items,
      };
    });

    return days.filter(day => day.items.length > 0);
  }, [selectedDate, allEvents, allTasks, locale, t]);

  const totalItems = groupedDays.reduce((acc, day) => acc + day.items.length, 0);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-foreground/5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em]" style={{ color: "var(--color-accent)" }}>
            Tuvākās dienas
          </p>
          <p className="text-sm font-medium text-foreground/70 mt-1">
            Gaidāmie notikumi un uzdevumi
          </p>
        </div>
        <div className="flex items-center justify-center px-3 py-1 rounded-full bg-[#FAF8F5] dark:bg-white/5 border border-white/80 dark:border-white/5 shadow-sm text-xs font-bold text-foreground/60">
          Kopā: {totalItems}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDate}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="space-y-6"
        >
          {totalItems === 0 ? (
            <div className="py-8 text-center bg-[#FAF8F5]/50 dark:bg-white/5 rounded-2xl border border-white/50 dark:border-white/5">
              <p className="text-sm text-foreground/40 italic">
                Šajā nedēļā nav ieplānotu notikumu.
              </p>
            </div>
          ) : (
            groupedDays.map((day) => {
              if (day.items.length === 0) return null;

              return (
                <div key={day.iso} className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">
                      {day.label}
                    </span>
                    <span className="text-[0.65rem] font-bold text-foreground/30">
                      {day.iso.split("-").slice(1).join(".")}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {day.items.map((item) => (
                      <article
                        key={item.id}
                        className="rounded-theme p-3 transition-colors bg-[#FCFBF8] dark:bg-zinc-800/80 border border-[#F3F0EA] dark:border-white/10 shadow-[0_2px_4px_rgba(210,200,190,0.2)] dark:shadow-none hover:shadow-[0_4px_8px_rgba(210,200,190,0.3)] dark:hover:bg-zinc-800"
                        style={{ borderRadius: "1rem" }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shadow-sm" />
                            <div>
                              <p className={`text-sm font-semibold ${"done" in item && item.done ? 'line-through opacity-60' : 'text-foreground/90'}`}>
                                {item.title}
                              </p>
                              <p className="text-[0.65rem] font-medium text-foreground/50 mt-0.5">
                                {item.timeLabel}
                              </p>
                            </div>
                          </div>
                          
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6rem] font-semibold border border-foreground/10 text-foreground/60 bg-white/50 dark:bg-black/20"
                          >
                            {item.style === "personal" ? "🔒" : "○"}
                            {item.style === "personal" ? t("events.personal") : t("events.shared")}
                          </span>
                        </div>
                        
                        {item.note && (
                          <p className="mt-2 text-[0.7rem] italic text-foreground/50 pl-3.5 border-l-2 border-amber-200/50 dark:border-amber-900/30">
                            {item.note}
                          </p>
                        )}
                        
                        <div className="mt-3 flex flex-wrap gap-2 pl-3.5">
                          <button
                            type="button"
                            onClick={() => onEditItem(item as any)}
                            className="rounded-full bg-white/80 dark:bg-white/5 border border-black/5 dark:border-white/10 px-2.5 py-1 text-[0.65rem] font-bold text-foreground/70 hover:bg-black/5 transition-colors"
                          >
                            {t("events.edit")}
                          </button>

                          {item.kind === "task" && (
                            <button
                              type="button"
                              onClick={() => onToggleTask(item.sourceId, !Boolean(item.done))}
                              className="rounded-full bg-white/80 dark:bg-white/5 border border-black/5 dark:border-white/10 px-2.5 py-1 text-[0.65rem] font-bold text-foreground/70 hover:bg-black/5 transition-colors"
                            >
                              {item.done ? t("events.markOpen") : t("events.markDone")}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => (item.kind === "event" ? onDeleteEvent(item.sourceId) : onDeleteTask(item.sourceId))}
                            className="rounded-full bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/30 px-2.5 py-1 text-[0.65rem] font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                          >
                            {t("events.delete")}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}