"use client";

import { useEffect, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { useI18n } from "@/lib/i18n/i18n-context";
import { getBrowserClient } from "@/lib/supabase/client";

function InfoToggle({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Info"
        className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--color-surface-border) text-xs font-bold text-(--color-secondary) hover:bg-primary/10 transition-colors"
      >
        ?
      </button>
      {open && (
        <p className="mt-1 text-xs leading-relaxed text-(--color-secondary) animate-in fade-in duration-200">
          {text}
        </p>
      )}
    </>
  );
}

export function ResetHealthSourcesPanel() {
  const { t } = useI18n();
  const [fitReady, setFitReady] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/integrations/google-fit/status", { signal: controller.signal })
      .then((r) => r.json())
      .then((d: { authorizeAvailable?: boolean }) => setFitReady(Boolean(d.authorizeAvailable)))
      .catch(() => {
        if (!controller.signal.aborted) {
          setFitReady(false);
        }
      });

    return () => controller.abort();
  }, []);

  async function connectGoogleFit() {
    setConnectError(null);
    setConnecting(true);
    try {
      const supabase = getBrowserClient();
      if (!supabase) {
        setConnectError("Supabase client unavailable.");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setConnectError(t("auth.session.required"));
        return;
      }

      const response = await fetch("/api/integrations/google-fit/authorize?mode=json", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;

      if (!response.ok || !payload?.url) {
        setConnectError(payload?.error ?? "Could not start Google Fit OAuth.");
        return;
      }

      window.location.assign(payload.url);
    } catch {
      setConnectError("Could not start Google Fit OAuth.");
    } finally {
      setConnecting(false);
    }
  }

  return (
    <GlassPanel className="space-y-4">
      {/* ── Header with ? info toggle ── */}
      <div className="flex items-start gap-1">
        <SectionHeading title={t("reset.health.title")} />
        <InfoToggle text={t("reset.health.intro")} />
      </div>

      {/* ── Google Fit block ── */}
      <div className="space-y-2 rounded-xl border border-(--color-surface-border) bg-background/40 p-3">
        <p className="text-xs font-bold uppercase tracking-widest text-(--color-secondary)">
          Google Fit
        </p>
        {fitReady ? (
          <button
            type="button"
            onClick={() => void connectGoogleFit()}
            disabled={connecting}
            className="inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-background transition-transform active:scale-[0.97] disabled:opacity-60"
          >
            {connecting ? `${t("reset.health.googleConnect")}...` : t("reset.health.googleConnect")}
          </button>
        ) : (
          <div className="flex items-start gap-1">
            <p className="text-xs leading-relaxed text-(--color-secondary)">
              {t("reset.health.googleNotReady")}
            </p>
            <InfoToggle text={t("reset.health.googleNeedsEnv")} />
          </div>
        )}
        {connectError ? (
          <p className="text-xs text-(--color-danger)">{connectError}</p>
        ) : null}
      </div>

      {/* ── Samsung Health / Health Connect block ── */}
      <div className="space-y-2 rounded-xl border border-(--color-surface-border) bg-background/40 p-3">
        <p className="text-xs font-bold uppercase tracking-widest text-(--color-secondary)">
          Samsung Health
        </p>
        <p className="text-xs leading-relaxed text-(--color-secondary)">
          {t("reset.health.samsung")}
        </p>
      </div>
    </GlassPanel>
  );
}
