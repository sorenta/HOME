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
    <ModuleShell title={t("legal.privacy.title")} requireAuth={false}>
      <GlassPanel className="space-y-2">
        <p className="text-xs text-[color:var(--color-secondary)]">
          {t("legal.privacy.version", { version: PRIVACY_POLICY_VERSION })}
        </p>
        <p className="text-sm leading-relaxed text-[color:var(--color-text)]">
          {t("legal.privacy.intro")}
        </p>
        <p className="text-sm font-medium text-[color:var(--color-text)]">{t("legal.privacy.contactLabel")}</p>
        {contact ? (
          <a href={`mailto:${contact}`} className="text-sm text-[color:var(--color-primary)] underline">
            {contact}
          </a>
        ) : (
          <p className="text-sm text-[color:var(--color-secondary)]">{t("legal.privacy.contactMissing")}</p>
        )}
      </GlassPanel>

      {sections.map((s) => (
        <GlassPanel key={s.id} className="space-y-2">
          <h2 id={s.id} className="text-base font-semibold text-[color:var(--color-text)] scroll-mt-24">
            {s.title}
          </h2>
          {s.paragraphs.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-[color:var(--color-secondary)]">
              {p}
            </p>
          ))}
        </GlassPanel>
      ))}

      <p className="px-1 pb-4 text-center text-xs text-[color:var(--color-secondary)]">
        <Link href="/settings" className="text-[color:var(--color-primary)] underline">
          {t("legal.privacy.backSettings")}
        </Link>
      </p>
    </ModuleShell>
  );
}
