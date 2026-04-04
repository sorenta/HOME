import { GlassPanel } from "@/components/ui/glass-panel";

type WalletHeroProps = {
  title: string;
  subtitle: string;
  total: string;
  incomeShare: number;
  expenseShare: number;
  initials: string[];
};

export function WalletHero({
  title,
  subtitle,
  total,
  incomeShare,
  expenseShare,
  initials,
}: WalletHeroProps) {
  const leftInitial = initials[0] ?? "M";
  const rightInitial = initials[1] ?? "H";

  return (
    <GlassPanel
      className="space-y-4"
      style={{
        borderRadius: "var(--radius-card)",
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--color-surface) 88%, transparent), color-mix(in srgb, var(--color-surface-2) 84%, transparent))",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: "var(--color-accent)" }}
          >
            {title}
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {subtitle}
          </p>
        </div>

        <div className="inline-flex items-center gap-2">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
            style={{
              background: "color-mix(in srgb, var(--color-accent) 22%, transparent)",
              color: "var(--color-text-primary)",
              border: "1px solid color-mix(in srgb, var(--color-border) 56%, transparent)",
            }}
          >
            {leftInitial}
          </span>
          <span
            className="-ml-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
            style={{
              background: "color-mix(in srgb, var(--color-success) 20%, transparent)",
              color: "var(--color-text-primary)",
              border: "1px solid color-mix(in srgb, var(--color-border) 56%, transparent)",
            }}
          >
            {rightInitial}
          </span>
        </div>
      </div>

      <div>
        <p className="text-3xl font-semibold leading-none" style={{ color: "var(--color-text-primary)" }}>
          {total}
        </p>
      </div>

      <div className="space-y-1.5">
        <div
          className="h-2 w-full overflow-hidden"
          style={{
            borderRadius: "var(--radius-pill)",
            background: "color-mix(in srgb, var(--color-border) 36%, transparent)",
          }}
        >
          <div className="flex h-full w-full">
            <div
              className="h-full"
              style={{
                width: `${incomeShare}%`,
                background: "linear-gradient(90deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 65%, white))",
              }}
            />
            <div
              className="h-full"
              style={{
                width: `${expenseShare}%`,
                background:
                  "linear-gradient(90deg, color-mix(in srgb, var(--color-warning) 75%, var(--color-accent)), color-mix(in srgb, var(--color-warning) 94%, white))",
              }}
            />
          </div>
        </div>
        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
          Kopskats no majas dalibnieku ierakstiem
        </p>
      </div>
    </GlassPanel>
  );
}
