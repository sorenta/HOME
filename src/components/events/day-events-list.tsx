"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useTheme } from "@/components/providers/theme-provider";

type EntryStyle = "shared" | "personal";

export type DayEntry = {
  id: string;
  sourceId: string;
  kind: "event" | "task";
  title: string;
  timeLabel: string;
  typeLabel: string;
  note: string;
  style: EntryStyle;
  done?: boolean;
};

type Props = {
  selectedDate: string;
  selectedDateLabel: string;
  items: DayEntry[];
  onToggleTask: (taskId: string, done: boolean) => void;
  onDeleteEvent: (eventId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditItem: (item: DayEntry) => void;
  onAddClick?: () => void;
};

export function DayEventsList({
  selectedDate,
  selectedDateLabel,
  items,
  onToggleTask,
  onDeleteEvent,
  onDeleteTask,
  onEditItem,
  onAddClick,
}: Props) {
  const { t, locale } = useI18n();
  const { themeId } = useTheme();

  if (themeId === "forge") {
    return (
      <section className="space-y-4 font-mono">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-primary/80">
            {selectedDateLabel}
          </p>
          <span className="text-[0.5rem] text-white/20">LOG_DEVICES_READY</span>
        </div>

        <div className="space-y-2">
          {/* Forge Add Button - Integrated as a log entry */}
          <button 
            onClick={onAddClick}
            className="w-full flex items-center gap-3 border border-dashed border-primary/30 bg-primary/5 p-3 rounded-sm hover:bg-primary/10 transition-colors group"
          >
            <span className="text-primary font-bold">[ + ]</span>
            <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-primary group-hover:translate-x-1 transition-transform">
              {locale === "lv" ? "Iniciēt jaunu operāciju" : "Initiate new operation"}
            </span>
          </button>

          <AnimatePresence mode="popLayout">
            {items.length === 0 ? (
              <div className="p-8 text-center border border-white/5 bg-black/20 rounded-sm">
                <p className="text-[0.6rem] text-white/30 uppercase tracking-widest">Šajā datumā operācijas nav reģistrētas</p>
              </div>
            ) : (
              items.map((item) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative border border-white/5 bg-black/20 p-3 rounded-sm group hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[0.55rem] text-white/30">[{item.timeLabel || "00:00"}]</span>
                        <span className={`text-[0.55rem] font-bold ${item.done ? 'text-emerald-500' : 'text-primary'}`}>
                          {item.done 
                            ? (locale === "lv" ? '[IZPILDIITS]' : '[COMPLETED]') 
                            : (locale === "lv" ? '[AKTIIVS]' : '[ACTIVE]')}
                        </span>
                      </div>
                      <p className={`text-[0.7rem] font-bold uppercase tracking-tight ${item.done ? 'text-white/40 line-through' : 'text-white/90'}`}>
                        {item.title}
                      </p>
                      {item.note && (
                        <p className="mt-1 text-[0.6rem] text-white/40 italic leading-tight">
                          {item.note}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className="text-[0.5rem] px-1 border border-white/10 text-white/30 uppercase">
                         {item.style === 'personal' 
                           ? (locale === "lv" ? 'PRIVAATS' : 'SECURE') 
                           : (locale === "lv" ? 'KOPIIGS' : 'SHARED')}
                       </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/5 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.kind === "task" && (
                      <button
                        onClick={() => onToggleTask(item.sourceId, !Boolean(item.done))}
                        className="text-[0.55rem] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400"
                      >
                        {item.done 
                          ? (locale === "lv" ? "> ATVEERT" : "> REOPEN") 
                          : (locale === "lv" ? "> IZPILDIIT" : "> EXECUTE")}
                      </button>
                    )}
                    <button
                      onClick={() => onEditItem(item)}
                      className="text-[0.55rem] font-black uppercase tracking-widest text-white/60 hover:text-white"
                    >
                      {locale === "lv" ? "> LABOT" : "> EDIT"}
                    </button>
                    <button
                      onClick={() => (item.kind === "event" ? onDeleteEvent(item.sourceId) : onDeleteTask(item.sourceId))}
                      className="text-[0.55rem] font-black uppercase tracking-widest text-primary hover:text-red-400"
                    >
                      {locale === "lv" ? "> LIKVIDEET" : "> PURGE"}
                    </button>
                  </div>
                </motion.article>
              ))
            )}
          </AnimatePresence>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--color-accent)" }}>
          {t("events.selectedDay")}
        </p>
        <p className="text-sm" style={{ color: "var(--color-foreground)" }}>
          {selectedDateLabel}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDate}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="space-y-2"
        >
          {items.length === 0 ? (
            <div
              className="rounded-theme border p-4 text-sm"
              style={{
                borderColor: "var(--color-border)",
                borderRadius: "var(--radius-md)",
                color: "color-mix(in srgb, var(--color-foreground) 70%, transparent)",
              }}
            >
              {t("events.noRecordsForDay")}
            </div>
            ) : (
            items.map((item) => (
              <article
                key={item.id}
                className="rounded-theme p-3 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{
                  borderRadius: "var(--radius-md)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      className={`text-sm font-semibold ${item.done ? 'line-through opacity-60' : ''}`}
                      style={{
                        color: "var(--color-foreground)",
                      }}
                    >
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: "color-mix(in srgb, var(--color-foreground) 70%, transparent)" }}>
                      {item.timeLabel}
                    </p>
                  </div>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[0.7rem] font-semibold"
                    style={{
                      border: "1px solid var(--color-border)",
                      color: "var(--color-foreground)",
                    }}
                  >
                    {item.style === "personal" ? "🔒" : "○"}
                    {item.style === "personal" ? t("events.personal") : t("events.shared")}
                  </span>
                </div>
                {item.note && (
                  <p className="mt-2 text-xs" style={{ color: "color-mix(in srgb, var(--color-foreground) 72%, transparent)" }}>
                    {item.note}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onEditItem(item)}
                    className="rounded-full px-2.5 py-1 text-[0.7rem] font-semibold"
                    style={{
                      border: "1px solid var(--color-border)",
                      color: "var(--color-foreground)",
                    }}
                  >
                    {t("events.edit")}
                  </button>

                  {item.kind === "task" ? (
                    <button
                      type="button"
                      onClick={() => onToggleTask(item.sourceId, !Boolean(item.done))}
                      className="rounded-full px-2.5 py-1 text-[0.7rem] font-semibold"
                      style={{
                        border: "1px solid var(--color-border)",
                        color: "var(--color-foreground)",
                      }}
                    >
                      {item.done ? t("events.markOpen") : t("events.markDone")}
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => (item.kind === "event" ? onDeleteEvent(item.sourceId) : onDeleteTask(item.sourceId))}
                    className="rounded-full px-2.5 py-1 text-[0.7rem] font-semibold"
                    style={{
                      border: "1px solid color-mix(in srgb, var(--color-accent) 45%, transparent)",
                      color: "var(--color-accent)",
                    }}
                  >
                    {t("events.delete")}
                  </button>
                </div>
              </article>
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
