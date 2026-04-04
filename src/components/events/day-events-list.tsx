"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/i18n-context";

type EntryStyle = "shared" | "personal";

type DayEntry = {
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
};

export function DayEventsList({
  selectedDate,
  selectedDateLabel,
  items,
  onToggleTask,
  onDeleteEvent,
  onDeleteTask,
}: Props) {
  const { t } = useI18n();

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
                background: "color-mix(in srgb, var(--color-card) 75%, transparent)",
                color: "color-mix(in srgb, var(--color-foreground) 70%, transparent)",
              }}
            >
              {t("events.noRecordsForDay")}
            </div>
          ) : (
            items.map((item) => (
              <article
                key={item.id}
                className="rounded-theme border p-3"
                style={{
                  borderColor: "var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  background: "color-mix(in srgb, var(--color-card) 80%, transparent)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{
                        color: "var(--color-foreground)",
                        textDecoration: item.kind === "task" && item.done ? "line-through" : "none",
                        opacity: item.kind === "task" && item.done ? 0.64 : 1,
                      }}
                    >
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: "color-mix(in srgb, var(--color-foreground) 70%, transparent)" }}>
                      {item.timeLabel} · {item.typeLabel}
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
                <p className="mt-2 text-xs" style={{ color: "color-mix(in srgb, var(--color-foreground) 72%, transparent)" }}>
                  {item.note}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
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
