"use client";

import { GlassPanel } from "@/components/ui/glass-panel";

type AiProfileCardProps = {
  providerLabel: string;
  domains: string[];
  summary: string;
};

export function AiProfileCard({ providerLabel, domains, summary }: AiProfileCardProps) {
  return (
    <GlassPanel
      className="space-y-3 border-[color:color-mix(in_srgb,var(--color-border)_76%,transparent)]"
      style={{ background: "var(--color-surface-2, var(--color-surface2))" }}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-text-secondary)]">AI profils</p>
        <h3 className="mt-1 text-base font-bold text-[color:var(--color-text-primary)]">{providerLabel} Assistant Active</h3>
      </div>

      <p className="text-sm text-[color:var(--color-text-primary)]">{summary}</p>

      <div className="flex flex-wrap gap-2">
        {domains.map((domain) => (
          <span
            key={domain}
            className="rounded-full border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_72%,transparent)] px-2.5 py-1 text-xs font-semibold text-[color:var(--color-text-primary)]"
          >
            {domain}
          </span>
        ))}
      </div>
    </GlassPanel>
  );
}
