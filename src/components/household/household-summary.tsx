"use client";

import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { fetchMyHouseholdSummary, type Household } from "@/lib/household";
import { normalizeHouseholdPlan } from "@/lib/billing/plans";
import { StatusPill } from "@/components/ui/status-pill";
import { useI18n } from "@/lib/i18n/i18n-context";

type Props = {
  householdId: string;
  showQr?: boolean;
};

export function HouseholdSummary({ householdId, showQr = false }: Props) {
  const { t } = useI18n();
  const [household, setHousehold] = useState<Household | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      const nextHousehold = await fetchMyHouseholdSummary();

      if (!alive) return;
      setHousehold(nextHousehold);
      setMemberCount(nextHousehold?.member_count ?? 0);
    };

    void load();

    return () => {
      alive = false;
    };
  }, [householdId]);

  const inviteUrl = useMemo(() => {
    if (typeof window === "undefined" || !household?.qr_code) return "";
    return `${window.location.origin}/household?code=${household.qr_code}`;
  }, [household?.qr_code]);
  const plan = normalizeHouseholdPlan(household?.subscription_type);

  async function copyInviteUrl() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  if (!household) {
    return (
      <div className="maj-surface-panel text-sm text-[color:var(--color-text-secondary)]">
        {t("household.loading")}
      </div>
    );
  }

  return (
    <div className="maj-glass-panel p-[length:var(--maj-space-card-pad)]">
      <p className="maj-theme-eyebrow">{t("app.household")}</p>
      <h2 className="maj-theme-section-title mt-2">{household.name}</h2>
      <div className="mt-4 flex flex-wrap gap-[var(--maj-space-stack)]">
        <StatusPill tone="good">
          {memberCount} {t("household.members")}
        </StatusPill>
        <StatusPill>{t(plan === "premium" ? "billing.plan.premium" : "billing.plan.free")}</StatusPill>
        {household.qr_code ? <StatusPill>{household.qr_code}</StatusPill> : null}
      </div>
      <p className="maj-theme-subtitle mt-3 text-sm text-[color:var(--color-text-secondary)]">
        {t("household.shareHint")}
      </p>
      {showQr && inviteUrl ? (
        <div className="maj-nested-surface mt-4 p-[length:var(--maj-space-card-pad)]">
          <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
            {t("household.qr.title")}
          </p>
          <p className="maj-theme-subtitle mt-1 text-xs">
            {t("household.qr.hint")}
          </p>
          <div className="mt-4 flex flex-col items-center gap-[var(--maj-space-stack)]">
            <div className="rounded-[var(--radius-card)] bg-[color:var(--color-card-elevated)] p-3">
              <QRCodeSVG
                value={inviteUrl}
                size={168}
                bgColor="#ffffff"
                fgColor="#111111"
                includeMargin
              />
            </div>
            <button
              type="button"
              onClick={copyInviteUrl}
              className="rounded-[var(--radius-button)] border border-[color:var(--color-border)] px-4 py-2 text-sm font-medium text-[color:var(--color-text-primary)]"
            >
              {copied ? t("household.qr.copied") : t("household.qr.copy")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
