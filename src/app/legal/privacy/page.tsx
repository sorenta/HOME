"use client";

import Link from "next/link";
import { ModuleShell } from "@/components/layout/module-shell";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useI18n } from "@/lib/i18n/i18n-context";
import {
  getPrivacySections,
  PRIVACY_POLICY_VERSION,
} from "@/lib/legal/privacy-policy";

export default function LegalPrivacyPage() {
  const { t, locale } = useI18n();
  const sections = getPrivacySections(locale === "en" ? "en" : "lv");
  const contact = process.env.NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL?.trim() || null;

  return (
    <>
      <a
        aria-label="Settings"
        className="pointer-events-auto absolute top-[max(1.5rem,env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full border text-base backdrop-blur-xl transition right-4 bg-(--color-surface)/82 text-(--color-text)"
        style={{ borderColor: "var(--color-surface-border)", boxShadow: "0 12px 28px color-mix(in srgb, var(--color-primary) 12%, transparent)" }}
        href="/settings"
      >
        <span aria-hidden="true">⚙</span>
      </a>

      <div className="pt-20">
        <ModuleShell
          title={t("legal.privacy.title")}
          sectionId="legal"
          description={
            locale === "lv"
              ? "Kā tiek apstrādāti dati un kur sazināties privātuma jautājumos."
              : "How data is handled and where to reach out about privacy."
          }
          requireAuth={false}
        >
          <GlassPanel className="space-y-3">
            <p className="border-b border-border pb-2 text-xs font-bold uppercase tracking-widest text-foreground/50">
              {t("legal.privacy.version", { version: PRIVACY_POLICY_VERSION })}
            </p>
            <p className="text-sm leading-relaxed text-foreground">
              {t("legal.privacy.intro")}
            </p>
            <div className="pt-2">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-foreground/50">
                {t("legal.privacy.contactLabel")}
              </p>
              {contact ? (
                <a
                  href={`mailto:${contact}`}
                  className="text-sm font-bold text-primary underline transition-colors hover:text-primary/80"
                >
                  {contact}
                </a>
              ) : (
                <p className="text-sm italic text-foreground/60">
                  {t("legal.privacy.contactMissing")}
                </p>
              )}
            </div>
          </GlassPanel>

          {sections.map((s) => (
            <GlassPanel key={s.id} className="space-y-3">
              <h2 id={s.id} className="scroll-mt-24 text-lg font-bold text-foreground">
                {s.title}
              </h2>
              <div className="space-y-2">
                {s.paragraphs.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-foreground/70">
                    {p}
                  </p>
                ))}
              </div>
            </GlassPanel>
          ))}

          <p className="px-1 pb-4 text-center text-xs text-foreground/60">
            <Link href="/settings" className="font-bold text-primary underline transition-colors hover:text-primary/80">
              {t("legal.privacy.backSettings")}
            </Link>
          </p>
        </ModuleShell>
      </div>
    </>
  );
}
