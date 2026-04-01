type Tone = "neutral" | "good" | "warn" | "critical";

const toneClass: Record<Tone, string> = {
  neutral: "border-[color:var(--color-surface-border)] text-[color:var(--color-secondary)]",
  good: "border-emerald-500/30 text-emerald-300",
  warn: "border-amber-500/30 text-amber-200",
  critical: "border-rose-500/30 text-rose-200",
};

type Props = {
  children: React.ReactNode;
  tone?: Tone;
};

export function StatusPill({ children, tone = "neutral" }: Props) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[0.7rem] font-medium",
        toneClass[tone],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
