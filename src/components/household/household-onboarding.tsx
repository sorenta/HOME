"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { QrJoinScanner } from "@/components/household/qr-join-scanner";
import { createHousehold, joinHouseholdByCode } from "@/lib/household";
import { hapticTap } from "@/lib/haptic";
import { useI18n } from "@/lib/i18n/i18n-context";

type Props = {
  compact?: boolean;
};

export function HouseholdOnboarding({ compact = false }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshProfile } = useAuth();
  const { t } = useI18n();
  const [householdName, setHouseholdName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<"create" | "join" | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;
    setInviteCode(code.toUpperCase());
  }, [searchParams]);

  async function handleCreate() {
    if (!householdName.trim()) return;

    setLoading("create");
    setError(null);
    setMessage(null);

    try {
      await createHousehold(householdName);
      await refreshProfile();
      hapticTap();
      setMessage(t("household.create.success"));
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("household.error.generic"));
    } finally {
      setLoading(null);
    }
  }

  async function handleJoin() {
    if (!inviteCode.trim()) return;

    setLoading("join");
    setError(null);
    setMessage(null);

    try {
      await joinHouseholdByCode(inviteCode);
      await refreshProfile();
      hapticTap();
      setMessage(t("household.join.success"));
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("household.error.generic"));
    } finally {
      setLoading(null);
    }
  }

  return (
    <div
      className={[
        "rounded-3xl border border-(--color-surface-border) bg-(--color-surface) p-5",
        compact ? "" : "w-full",
      ].join(" ")}
    >
      <p className="text-xs uppercase tracking-[0.2em] text-(--color-secondary)">
        {t("app.household")}
      </p>
      <h2 className="mt-2 font-(family-name:--font-theme-display) text-2xl font-semibold text-(--color-text)">
        {t("household.title")}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-(--color-secondary)">
        {t("household.subtitle")}
      </p>

      <div className="mt-5 space-y-4">
        <div className="rounded-2xl border border-(--color-surface-border) p-4">
          <p className="text-sm font-semibold text-(--color-text)">
            {t("household.create.title")}
          </p>
          <label className="mt-3 block text-sm text-(--color-text)">
            {t("household.field.name")}
            <input
              type="text"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-(--color-surface-border) bg-transparent px-3 py-2 text-sm"
              placeholder={t("household.field.namePlaceholder")}
            />
          </label>
          <button
            type="button"
            onClick={handleCreate}
            disabled={loading !== null || !householdName.trim()}
            className={[
              "mt-3 w-full rounded-xl px-4 py-3 text-sm font-semibold",
              loading !== null || !householdName.trim()
                ? "bg-(--color-surface-border) text-(--color-secondary)"
                : "bg-primary text-background",
            ].join(" ")}
          >
            {loading === "create"
              ? t("household.loading")
              : t("household.create.submit")}
          </button>
        </div>

        <div className="rounded-2xl border border-(--color-surface-border) p-4">
          <p className="text-sm font-semibold text-(--color-text)">
            {t("household.join.title")}
          </p>
          {inviteCode ? (
            <p className="mt-2 text-xs text-(--color-secondary)">
              {t("household.join.detected")}
            </p>
          ) : null}
          <label className="mt-3 block text-sm text-(--color-text)">
            {t("household.field.code")}
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="mt-1 w-full rounded-xl border border-(--color-surface-border) bg-transparent px-3 py-2 text-sm uppercase tracking-[0.18em]"
              placeholder={t("household.field.codePlaceholder")}
            />
          </label>
          <button
            type="button"
            onClick={handleJoin}
            disabled={loading !== null || !inviteCode.trim()}
            className={[
              "mt-3 w-full rounded-xl px-4 py-3 text-sm font-semibold",
              loading !== null || !inviteCode.trim()
                ? "bg-(--color-surface-border) text-(--color-secondary)"
                : "bg-primary text-background",
            ].join(" ")}
          >
            {loading === "join"
              ? t("household.loading")
              : inviteCode
                ? t("household.join.useDetected")
                : t("household.join.submit")}
          </button>
          <QrJoinScanner onDetected={setInviteCode} />
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl border border-rose-500/30 px-3 py-2 text-sm text-rose-300">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="mt-4 rounded-2xl border border-emerald-500/30 px-3 py-2 text-sm text-emerald-300">
          {message}
        </p>
      ) : null}
    </div>
  );
}
