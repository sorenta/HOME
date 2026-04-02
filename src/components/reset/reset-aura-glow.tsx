"use client";

type Props = {
  scorePercent: number;
  scoreLabel: string;
  partnerLabel: string;
  partnerValue: string;
  partnerHint: string;
};

export function ResetAuraGlow({
  scorePercent,
  scoreLabel,
  partnerLabel,
  partnerValue,
  partnerHint,
}: Props) {
  return (
    <div className="relative grid grid-cols-1 gap-4 overflow-hidden rounded-2xl border border-[color:var(--color-primary)]/40 bg-[color:var(--color-surface)]/45 p-4 sm:grid-cols-2">
      <div
        className="maj-reset-aura-shine pointer-events-none absolute -inset-[20%] opacity-80"
        aria-hidden
      />
      <div className="relative z-[1] space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-secondary)]">
          {scoreLabel}
        </p>
        <p className="text-3xl font-semibold tabular-nums tracking-tight text-[color:var(--color-text)]">
          {scorePercent}%
        </p>
      </div>
      <div className="relative z-[1] space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-secondary)]">
          {partnerLabel}
        </p>
        <p className="text-lg font-semibold text-[color:var(--color-text)]">{partnerValue}</p>
        <p className="text-xs leading-relaxed text-[color:var(--color-secondary)]">{partnerHint}</p>
      </div>
    </div>
  );
}
