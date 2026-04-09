"use client";

import { useEffect, useMemo, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { useI18n } from "@/lib/i18n/i18n-context";
import {
  fetchRecentSignals,
  sleepDurationMinutes,
  type ResetDailySignalHistoryRow,
} from "@/lib/reset-daily-signals";

type Props = {
  userId: string | null;
  refreshToken?: number;
};

type RangeKey = 7 | 30;
type MetricKey = "mood" | "energy" | "steps" | "sleep";

function formatShortDate(dateIso: string, locale: string) {
  return new Date(dateIso).toLocaleDateString(locale === "lv" ? "lv-LV" : "en-US", {
    month: "short",
    day: "numeric",
  });
}

function polyline(values: number[]) {
  const width = 320;
  const height = 120;
  const pad = 10;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = pad + (index / Math.max(values.length - 1, 1)) * (width - pad * 2);
      const y = pad + (1 - (value - min) / range) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");
}

export function ResetTrendsPanel({ userId, refreshToken = 0 }: Props) {
  const { t, locale } = useI18n();
  const [range, setRange] = useState<RangeKey>(7);
  const [metric, setMetric] = useState<MetricKey>("mood");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ResetDailySignalHistoryRow[]>([]);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      const next = await fetchRecentSignals(userId, range);
      if (!alive) return;
      setRows(next);
      setLoading(false);
    }

    void load();

    return () => {
      alive = false;
    };
  }, [range, refreshToken, userId]);

  const metricOptions = useMemo(
    () => [
      { key: "mood", label: t("reset.trends.metric.mood") },
      { key: "energy", label: t("reset.trends.metric.energy") },
      { key: "steps", label: t("reset.trends.metric.steps") },
      { key: "sleep", label: t("reset.trends.metric.sleep") },
    ] satisfies { key: MetricKey; label: string }[],
    [t],
  );

  const series = useMemo(() => {
    const mapped = rows
      .map((row) => {
        const sleepHours = sleepDurationMinutes(row);
        const value =
          metric === "mood"
            ? row.mood
            : metric === "energy"
              ? row.energy
              : metric === "steps"
                ? row.steps
                : sleepHours != null
                  ? Math.round((sleepHours / 60) * 10) / 10
                  : null;

        return value != null
          ? {
              date: row.logged_on,
              value,
            }
          : null;
      })
      .filter((entry): entry is { date: string; value: number } => Boolean(entry));

    return mapped;
  }, [metric, rows]);

  const summary = useMemo(() => {
    if (series.length === 0) return null;
    const values = series.map((entry) => entry.value);
    const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
    const last = values[values.length - 1];
    const first = values[0];
    return {
      average: avg,
      delta: last - first,
      last,
    };
  }, [series]);

  return (
    <GlassPanel className="space-y-4">
      <SectionHeading title={t("reset.trends.title")} detail={t("reset.trends.detail", { days: String(range) })} />
      <p className="text-sm text-(--color-secondary)">{t("reset.trends.intro")}</p>

      <div className="flex flex-wrap gap-2">
        {[7, 30].map((days) => (
          <button
            key={days}
            type="button"
            onClick={() => setRange(days as RangeKey)}
            className={[
              "rounded-full border px-3 py-1.5 text-sm transition",
              range === days
                ? "border-(--color-accent) bg-(--color-surface-2) text-(--color-text-primary)"
                : "border-(--color-surface-border) bg-(--color-surface) text-(--color-text-secondary)",
            ].join(" ")}
          >
            {t("reset.trends.range", { days: String(days) })}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {metricOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setMetric(option.key)}
            className={[
              "rounded-full border px-3 py-1.5 text-sm transition",
              metric === option.key
                ? "border-(--color-accent) bg-(--color-surface-2) text-(--color-text-primary)"
                : "border-(--color-surface-border) bg-(--color-surface) text-(--color-text-secondary)",
            ].join(" ")}
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-(--color-secondary)">{t("reset.signals.loading")}</p>
      ) : series.length === 0 ? (
        <p className="text-sm text-(--color-secondary)">{t("reset.trends.empty")}</p>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-(--color-surface-border) bg-(--color-surface) p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-(--color-text-secondary)">{t("reset.trends.average")}</p>
              <p className="mt-1 text-lg font-semibold text-(--color-text-primary)">
                {summary?.average.toFixed(metric === "steps" ? 0 : 1)}
              </p>
            </div>
            <div className="rounded-xl border border-(--color-surface-border) bg-(--color-surface) p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-(--color-text-secondary)">{t("reset.trends.last")}</p>
              <p className="mt-1 text-lg font-semibold text-(--color-text-primary)">
                {summary?.last.toFixed(metric === "steps" ? 0 : 1)}
              </p>
            </div>
            <div className="rounded-xl border border-(--color-surface-border) bg-(--color-surface) p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-(--color-text-secondary)">{t("reset.trends.delta")}</p>
              <p className="mt-1 text-lg font-semibold text-(--color-text-primary)">
                {summary && summary.delta > 0 ? "+" : ""}
                {summary?.delta.toFixed(metric === "steps" ? 0 : 1)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-(--color-surface-border) bg-(--color-surface)/35 p-3">
            <svg viewBox="0 0 320 120" className="h-32 w-full" aria-hidden>
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-(--color-accent)"
                points={polyline(series.map((entry) => entry.value))}
              />
            </svg>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-(--color-text-secondary)">
              {series.map((entry) => (
                <span key={entry.date}>
                  {formatShortDate(entry.date, locale)}: {entry.value}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </GlassPanel>
  );
}