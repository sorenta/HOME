type Props = {
  label: string;
  value?: string | number;
  hint?: string;
  /** Custom content (e.g. animated odometer) — replaces `value` when provided. */
  children?: React.ReactNode;
  /**
   * default — full card (inner pages, dense stat grids).
   * compact — small stat cell for strips / pairs.
   * emphasis — single highlighted metric (dashboard home).
   */
  variant?: "default" | "compact" | "emphasis";
};

export function MetricCard({ label, value, hint, children, variant = "default" }: Props) {
  if (variant === "compact") {
    return (
      <div className="maj-metric-card maj-metric-card--compact">
        <p className="maj-metric-label">{label}</p>
        <p className="maj-metric-value maj-metric-value--compact mt-1 font-(family-name:--font-theme-display) text-lg font-semibold tabular-nums tracking-(--maj-hero-tracking) text-(--color-text-primary)">
          {value}
        </p>
        {hint ? (
          <p className="mt-0.5 text-xs text-(--color-secondary)">{hint}</p>
        ) : null}
      </div>
    );
  }

  if (variant === "emphasis") {
    return (
      <div className="maj-metric-card maj-metric-card--emphasis">
        <p className="maj-metric-label">{label}</p>
        <p className="maj-metric-value maj-metric-value--emphasis mt-1 font-(family-name:--font-theme-display) text-3xl font-semibold tabular-nums tracking-(--maj-hero-tracking) text-(--color-text-primary)">
          {value}
        </p>
        {hint ? (
          <p className="mt-1 text-xs text-(--color-secondary)">{hint}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="maj-metric-card">
      <p className="maj-metric-label">{label}</p>
      {children ? (
        <div className="maj-metric-value maj-metric-value--default mt-2 font-(family-name:--font-theme-display) tracking-(--maj-hero-tracking)">
          {children}
        </div>
      ) : (
        <p className="maj-metric-value maj-metric-value--default mt-2 font-(family-name:--font-theme-display) text-2xl font-semibold tracking-(--maj-hero-tracking) text-(--color-text-primary)">
          {value}
        </p>
      )}
      {hint ? (
        <p className="mt-1 text-xs text-(--color-secondary)">{hint}</p>
      ) : null}
    </div>
  );
}
