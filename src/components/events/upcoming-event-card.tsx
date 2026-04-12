"use client";

import { useI18n } from "@/lib/i18n/i18n-context";

type EventStyle = "shared" | "personal";

type UpcomingEventDetails = {
  id: string;
  title: string;
  dateLabel: string;
  countdownLabel: string;
  typeLabel: string;
  style: EventStyle;
  styleLabel: string;
  location: string;
  note: string;
  timeLabel: string;
};

type Props = {
  event: UpcomingEventDetails | null;
  onOpen: (eventId: string) => void;
  onEdit: (eventId: string) => void;
  onCreate: () => void;
};

export function UpcomingEventCard({ event, onOpen, onEdit, onCreate }: Props) {
  const { t } = useI18n();

  if (!event) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>
          {t("events.noUpcomingTitle")}
        </p>
        <p className="text-sm" style={{ color: "color-mix(in srgb, var(--color-foreground) 72%, transparent)" }}>
          {t("events.noUpcomingBody")}
        </p>
        <div className="mt-1">
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium transition-transform active:scale-[0.98]"
            style={{
              borderRadius: "var(--radius-md)",
              background: "var(--color-accent)",
              color: "var(--color-accent-foreground)",
            }}
          >
            {t("events.add")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--color-accent)" }}>
            {t("events.next")}
          </p>
          <h2 className="mt-1 text-xl font-semibold" style={{ color: "var(--color-foreground)" }}>
            {event.title}
          </h2>
          <p className="mt-1 text-sm" style={{ color: "color-mix(in srgb, var(--color-foreground) 70%, transparent)" }}>
            {event.dateLabel} · {event.timeLabel}
          </p>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold shadow-sm"
          style={{
            color: "var(--color-foreground)",
            background: "color-mix(in srgb, var(--color-surface) 60%, transparent)",
          }}
        >
          {event.countdownLabel}
        </span>
      </div>

      {event.note && (
        <p className="text-sm italic" style={{ color: "color-mix(in srgb, var(--color-foreground) 60%, transparent)" }}>
          "{event.note}"
        </p>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="button"
          onClick={() => onOpen(event.id)}
          className="px-4 py-2 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          style={{
            borderRadius: "var(--radius-md)",
            border: "1px solid color-mix(in srgb, var(--color-border) 60%, transparent)",
            color: "var(--color-foreground)",
          }}
        >
          {t("events.open")}
        </button>
        <button
          type="button"
          onClick={() => onEdit(event.id)}
          className="px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{
            borderRadius: "var(--radius-md)",
            background: "color-mix(in srgb, var(--color-accent) 15%, transparent)",
            border: "1px solid color-mix(in srgb, var(--color-accent) 60%, transparent)",
            color: "var(--color-accent)",
          }}
        >
          {t("events.edit")}
        </button>
      </div>
    </div>
  );
}
