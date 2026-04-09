type Tone = "neutral" | "good" | "warn" | "critical";

const toneClass: Record<Tone, string> = {
  neutral:
    "border-(--color-surface-border) bg-(--color-surface)/45 text-(--color-text)",
  good:
    "border-emerald-500/25 bg-emerald-500/10 text-(--color-text)",
  warn:
    "border-amber-500/25 bg-amber-500/12 text-(--color-text)",
  critical:
    "border-rose-500/25 bg-rose-500/10 text-(--color-text)",
};

type Props = {
  children: React.ReactNode;
  tone?: Tone;
};

export function StatusPill({ children, tone = "neutral" }: Props) {
  return (
    <span
      className={[
        "inline-flex max-w-full items-center rounded-full border px-3 py-1.5 text-[0.75rem] font-medium leading-tight",
        toneClass[tone],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
