"use client";

import { useEffect, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { useI18n } from "@/lib/i18n/i18n-context";

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
    <GlassPanel className="space-y-3">
      <SectionHeading title={t("reset.health.title")} />
      <p className="text-sm leading-relaxed text-[color:var(--color-secondary)]">
        {t("reset.health.intro")}
      </p>
      {fitReady ? (
        <a
          href="/api/integrations/google-fit/authorize"
          className="inline-flex rounded-xl bg-[color:var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[color:var(--color-background)]"
        >
          {t("reset.health.googleConnect")}
        </a>
      ) : (
        <p className="text-xs leading-relaxed text-[color:var(--color-secondary)]">
          {t("reset.health.googleNeedsEnv")}
        </p>
      )}
      <p className="text-xs leading-relaxed text-[color:var(--color-secondary)]">
        {t("reset.health.samsung")}
      </p>
    </GlassPanel>
  );
}
