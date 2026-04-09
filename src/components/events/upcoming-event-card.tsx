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
      <div
        className="space-y-3 rounded-theme border p-4"
        style={{
          borderColor: "var(--color-border)",
          borderRadius: "var(--radius-lg)",
          background: "color-mix(in srgb, var(--color-card) 72%, transparent)",
        }}
      >
        <p className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>
          {t("events.noUpcomingTitle")}
        </p>
        <p className="text-sm" style={{ color: "color-mix(in srgb, var(--color-foreground) 72%, transparent)" }}>
          {t("events.noUpcomingBody")}
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold transition-transform active:scale-[0.98]"
          style={{
            borderRadius: "var(--radius-md)",
            background: "var(--color-accent)",
            color: "var(--color-accent-foreground)",
          }}
        >
          {t("events.add")}
        </button>
      </div>
    );
  }

  return (
    <div
      className="space-y-4 rounded-theme border p-4"
      style={{
        borderColor: "var(--color-border)",
        borderRadius: "var(--radius-lg)",
        background: "color-mix(in srgb, var(--color-card) 78%, transparent)",
      }}
    >
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
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            border: "1px solid var(--color-border)",
            color: "var(--color-foreground)",
            background: "color-mix(in srgb, var(--color-card) 82%, transparent)",
          }}
        >
          {event.countdownLabel}
        </span>
      </div>

      <div className="grid gap-2 text-sm sm:grid-cols-2">
        <p style={{ color: "color-mix(in srgb, var(--color-foreground) 78%, transparent)" }}>
          {t("events.meta.type")}: <span style={{ color: "var(--color-foreground)" }}>{event.typeLabel}</span>
        </p>
        <p style={{ color: "color-mix(in srgb, var(--color-foreground) 78%, transparent)" }}>
          {t("events.meta.visibility")}: <span style={{ color: "var(--color-foreground)" }}>{event.styleLabel}</span>
        </p>
        <p style={{ color: "color-mix(in srgb, var(--color-foreground) 78%, transparent)" }}>
          {t("events.meta.location")}: <span style={{ color: "var(--color-foreground)" }}>{event.location}</span>
        </p>
        <p style={{ color: "color-mix(in srgb, var(--color-foreground) 78%, transparent)" }}>
          {t("events.meta.note")}: <span style={{ color: "var(--color-foreground)" }}>{event.note}</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onOpen(event.id)}
          className="px-4 py-2 text-sm font-semibold"
          style={{
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            color: "var(--color-foreground)",
          }}
        >
          {t("events.open")}
        </button>
        <button
          type="button"
          onClick={() => onEdit(event.id)}
          className="px-4 py-2 text-sm font-semibold"
          style={{
            borderRadius: "var(--radius-md)",
            background: "color-mix(in srgb, var(--color-accent) 15%, transparent)",
            border: "1px solid var(--color-accent)",
            color: "var(--color-accent)",
          }}
        >
          {t("events.edit")}
        </button>
      </div>
    </div>
  );
}
