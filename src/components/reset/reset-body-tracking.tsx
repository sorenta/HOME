"use client";

import { useMemo, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { useI18n } from "@/lib/i18n/i18n-context";
import {
  type BodyArea,
  type MeasurementEntry,
  type ResetWellnessV1,
  type WeighInEntry,
  newId,
  sortedWeighIns,
} from "@/lib/reset-wellness";

const AREAS: BodyArea[] = ["waist", "hips", "chest", "arm", "thigh"];

type Props = {
  state: ResetWellnessV1;
  onUpdate: (next: ResetWellnessV1) => void;
};

function WeighSparkline({ entries }: { entries: WeighInEntry[] }) {
  const sorted = sortedWeighIns(entries);
  const last = sorted.slice(-14);
  if (last.length < 2) return null;

  const weights = last.map((e) => e.kg);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const pad = 4;
  const w = 280;
  const h = 72;
  const range = max - min || 1;

  const points = last.map((e, i) => {
    const x = pad + (i / (last.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (e.kg - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="mt-2 w-full max-w-full text-primary"
      aria-hidden
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.join(" ")}
      />
    </svg>
  );
}

export function ResetBodyTracking({ state, onUpdate }: Props) {
  const { t } = useI18n();
  const [kg, setKg] = useState("");
  const [area, setArea] = useState<BodyArea>("waist");
  const [cm, setCm] = useState("");

  const weighSorted = useMemo(() => sortedWeighIns(state.weighIns), [state.weighIns]);

  function addWeighIn() {
    const n = Number(kg.replace(",", "."));
    if (!Number.isFinite(n) || n <= 0 || n > 500) return;
    const entry: WeighInEntry = {
      id: newId(),
      at: new Date().toISOString(),
      kg: Math.round(n * 10) / 10,
    };
    onUpdate({ ...state, weighIns: [...state.weighIns, entry] });
    setKg("");
  }

  function addMeasurement() {
    const n = Number(cm.replace(",", "."));
    if (!Number.isFinite(n) || n <= 0 || n > 300) return;
    const entry: MeasurementEntry = {
      id: newId(),
      at: new Date().toISOString(),
      area,
      valueCm: Math.round(n * 10) / 10,
    };
    onUpdate({ ...state, measurements: [...state.measurements, entry] });
    setCm("");
  }

  const recentMeasures = [...state.measurements]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 8);

  return (
    <GlassPanel className="space-y-4">
      <SectionHeading title={t("reset.wellness.body.trackTitle")} />
      <p className="text-sm text-(--color-secondary)">
        {t("reset.wellness.body.trackHint")}
      </p>

      <div className="rounded-2xl border border-(--color-surface-border) bg-(--color-surface)/35 p-4">
        <p className="text-sm font-semibold text-(--color-text)">
          {t("reset.wellness.body.weighIn")}
        </p>
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={kg}
            onChange={(e) => setKg(e.target.value)}
            placeholder={t("reset.wellness.body.kgPlaceholder")}
            className="min-w-[6rem] flex-1 rounded-xl border border-(--color-surface-border) bg-background px-3 py-2 text-sm text-(--color-text)"
          />
          <button
            type="button"
            onClick={addWeighIn}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-background"
          >
            {t("reset.wellness.body.addWeighIn")}
          </button>
        </div>
        {weighSorted.length >= 2 ? (
          <div className="mt-3">
            <p className="text-xs uppercase tracking-[0.15em] text-(--color-secondary)">
              {t("reset.wellness.body.trend")}
            </p>
            <WeighSparkline entries={state.weighIns} />
          </div>
        ) : (
          <p className="mt-3 text-xs text-(--color-secondary)">
            {t("reset.wellness.body.trendNeedTwo")}
          </p>
        )}
        {weighSorted.length > 0 ? (
          <ul className="mt-2 space-y-1 text-xs text-(--color-secondary)">
            {weighSorted
              .slice(-5)
              .reverse()
              .map((e) => (
                <li key={e.id}>
                  {new Date(e.at).toLocaleDateString()} · {e.kg} kg
                </li>
              ))}
          </ul>
        ) : null}
      </div>

      <div className="rounded-2xl border border-(--color-surface-border) bg-(--color-surface)/35 p-4">
        <p className="text-sm font-semibold text-(--color-text)">
          {t("reset.wellness.body.measurements")}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <select
            value={area}
            onChange={(e) => setArea(e.target.value as BodyArea)}
            className="rounded-xl border border-(--color-surface-border) bg-background px-3 py-2 text-sm text-(--color-text)"
          >
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {t(`reset.wellness.body.area.${a}`)}
              </option>
            ))}
          </select>
          <input
            type="text"
            inputMode="decimal"
            value={cm}
            onChange={(e) => setCm(e.target.value)}
            placeholder={t("reset.wellness.body.cmPlaceholder")}
            className="min-w-[5rem] flex-1 rounded-xl border border-(--color-surface-border) bg-background px-3 py-2 text-sm text-(--color-text)"
          />
          <button
            type="button"
            onClick={addMeasurement}
            className="rounded-xl border border-(--color-surface-border) px-4 py-2 text-sm font-semibold text-(--color-text)"
          >
            {t("reset.wellness.body.addMeasure")}
          </button>
        </div>
        {recentMeasures.length > 0 ? (
          <ul className="mt-3 space-y-1 text-sm text-(--color-text)">
            {recentMeasures.map((m) => (
              <li key={m.id} className="flex justify-between gap-2">
                <span>{t(`reset.wellness.body.area.${m.area}`)}</span>
                <span className="text-(--color-secondary)">
                  {m.valueCm} cm · {new Date(m.at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </GlassPanel>
  );
}
