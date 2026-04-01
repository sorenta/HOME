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
      <div className="rounded-3xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-5 text-sm text-[color:var(--color-secondary)]">
        {t("household.loading")}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-secondary)]">
        {t("app.household")}
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-theme-display)] text-2xl font-semibold text-[color:var(--color-text)]">
        {household.name}
      </h2>
      <div className="mt-4 flex flex-wrap gap-2">
        <StatusPill tone="good">
          {memberCount} {t("household.members")}
        </StatusPill>
        <StatusPill>{t(plan === "premium" ? "billing.plan.premium" : "billing.plan.free")}</StatusPill>
        {household.qr_code ? <StatusPill>{household.qr_code}</StatusPill> : null}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-secondary)]">
        {t("household.shareHint")}
      </p>
      {showQr && inviteUrl ? (
        <div className="mt-4 rounded-2xl border border-[color:var(--color-surface-border)] p-4">
          <p className="text-sm font-semibold text-[color:var(--color-text)]">
            {t("household.qr.title")}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[color:var(--color-secondary)]">
            {t("household.qr.hint")}
          </p>
          <div className="mt-4 flex flex-col items-center gap-3">
            <div className="rounded-2xl bg-white p-3">
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
              className="rounded-xl border border-[color:var(--color-surface-border)] px-4 py-2 text-sm font-medium text-[color:var(--color-text)]"
            >
              {copied ? t("household.qr.copied") : t("household.qr.copy")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
