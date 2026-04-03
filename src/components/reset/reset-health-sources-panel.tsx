"use client";

import { useEffect, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { useI18n } from "@/lib/i18n/i18n-context";

function InfoToggle({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Info"
        className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-[color:var(--color-surface-border)] text-[10px] font-bold text-[color:var(--color-secondary)] hover:bg-[color:var(--color-primary)]/10 transition-colors"
      >
        ?
      </button>
      {open && (
        <p className="mt-1 text-xs leading-relaxed text-[color:var(--color-secondary)] animate-in fade-in duration-200">
          {text}
        </p>
      )}
    </>
  );
}

export function ResetHealthSourcesPanel() {
  const { t } = useI18n();
  const [fitReady, setFitReady] = useState(false);

  useEffect(() => {
    void fetch("/api/integrations/google-fit/status")
      .then((r) => r.json())
      .then((d: { authorizeAvailable?: boolean }) => setFitReady(Boolean(d.authorizeAvailable)))
      .catch(() => setFitReady(false));
  }, []);

  return (
    <GlassPanel className="space-y-4">
      {/* ── Header with ? info toggle ── */}
      <div className="flex items-start gap-1">
        <SectionHeading title={t("reset.health.title")} />
        <InfoToggle text={t("reset.health.intro")} />
      </div>

      {/* ── Google Fit block ── */}
      <div className="space-y-2 rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-background)]/40 p-3">
        <p className="text-xs font-bold uppercase tracking-widest text-[color:var(--color-secondary)]">
          Google Fit
        </p>
        {fitReady ? (
          <a
            href="/api/integrations/google-fit/authorize"
            className="inline-flex rounded-xl bg-[color:var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[color:var(--color-background)]"
          >
            {t("reset.health.googleConnect")}
          </a>
        ) : (
          <div className="flex items-start gap-1">
            <p className="text-xs leading-relaxed text-[color:var(--color-secondary)]">
              {t("reset.health.googleNotReady")}
            </p>
            <InfoToggle text={t("reset.health.googleNeedsEnv")} />
          </div>
        )}
      </div>

      {/* ── Samsung Health / Health Connect block ── */}
      <div className="space-y-2 rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-background)]/40 p-3">
        <p className="text-xs font-bold uppercase tracking-widest text-[color:var(--color-secondary)]">
          Samsung Health
        </p>
        <p className="text-xs leading-relaxed text-[color:var(--color-secondary)]">
          {t("reset.health.samsung")}
        </p>
      </div>
    </GlassPanel>
  );
}
