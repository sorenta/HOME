type Props = {
  label: string;
  value: string | number;
  hint?: string;
  /**
   * default — full card (inner pages, dense stat grids).
   * compact — small stat cell for strips / pairs.
   * emphasis — single highlighted metric (dashboard home).
   */
  variant?: "default" | "compact" | "emphasis";
};

export function MetricCard({ label, value, hint, variant = "default" }: Props) {
  if (variant === "compact") {
    return (
      <div className="maj-metric-card maj-metric-card--compact">
        <p className="maj-metric-label">{label}</p>
        <p className="mt-1 font-[family-name:var(--font-theme-display)] text-lg font-semibold tabular-nums tracking-[var(--maj-hero-tracking)] text-[color:var(--color-text-primary)]">
          {value}
        </p>
        {hint ? (
          <p className="mt-0.5 text-[0.65rem] text-[color:var(--color-secondary)]">{hint}</p>
        ) : null}
      </div>
    );
  }

  if (variant === "emphasis") {
    return (
      <div className="maj-metric-card maj-metric-card--emphasis">
        <p className="maj-metric-label">{label}</p>
        <p className="mt-1 font-[family-name:var(--font-theme-display)] text-3xl font-semibold tabular-nums tracking-[var(--maj-hero-tracking)] text-[color:var(--color-text-primary)]">
          {value}
        </p>
        {hint ? (
          <p className="mt-1 text-xs text-[color:var(--color-secondary)]">{hint}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="maj-metric-card">
      <p className="maj-metric-label">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-theme-display)] text-2xl font-semibold tracking-[var(--maj-hero-tracking)] text-[color:var(--color-text-primary)]">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-[color:var(--color-secondary)]">{hint}</p>
      ) : null}
    </div>
  );
}
