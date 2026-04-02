type Props = {
  label: string;
  value: string | number;
  hint?: string;
};

export function MetricCard({ label, value, hint }: Props) {
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
