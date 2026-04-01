type Props = {
  label: string;
  value: string | number;
  hint?: string;
};

export function MetricCard({ label, value, hint }: Props) {
  return (
    <div className="rounded-2xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-secondary)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-[color:var(--color-text)]">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-[color:var(--color-secondary)]">{hint}</p>
      ) : null}
    </div>
  );
}
