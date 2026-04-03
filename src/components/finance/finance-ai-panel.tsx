"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/lib/i18n/i18n-context";
import { hapticTap } from "@/lib/haptic";
import type { FinanceTransactionRecord, FixedCostRecord } from "@/lib/finance";

type Props = {
  householdId: string;
  transactions: FinanceTransactionRecord[];
  fixedCosts: FixedCostRecord[];
  balance: number;
};

export function FinanceAiPanel({ householdId, transactions, fixedCosts, balance }: Props) {
  const { t, locale } = useI18n();
  const { session } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [tips, setTips] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function runAdvisor() {
    setError(null);
    setReply(null);
    setTips([]);
    setWarnings([]);
    const token = session?.access_token;
    if (!token) {
      setError(t("kitchen.ai.error.auth"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/finance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          householdId,
          locale,
          prompt: prompt.trim() || undefined,
          transactions: transactions.slice(0, 50).map((r) => ({
            direction: r.direction,
            amount: r.amount,
            label: r.label,
            happened_at: r.happened_at,
          })),
          fixedCosts: fixedCosts.map((r) => ({
            label: r.label,
            amount: r.amount,
            due_day: r.due_day,
          })),
          balance,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        code?: string;
        message?: string;
        reply?: string;
        tips?: string[];
        warnings?: string[];
      };

      if (!res.ok || !data.ok) {
        const code = data.code ?? "UNKNOWN";
        if (code === "NO_HOUSEHOLD_AI") setError(t("kitchen.ai.error.noKey"));
        else if (code === "NOT_MEMBER") setError(t("kitchen.ai.error.notMember"));
        else setError(data.message ?? t("kitchen.ai.error.generic"));
        return;
      }

      setReply(data.reply ?? "");
      setTips(data.tips ?? []);
      setWarnings(data.warnings ?? []);
      hapticTap();
    } catch {
      setError(t("kitchen.ai.error.generic"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]/35 p-3 space-y-3">
      <p className="text-sm font-semibold text-[color:var(--color-text)]">
        {t("finance.ai.title")}
      </p>
      <p className="text-xs text-[color:var(--color-secondary)]">
        {t("finance.ai.hint")}
      </p>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={2}
        placeholder={t("finance.ai.placeholder")}
        className="w-full resize-none rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm text-[color:var(--color-text)]"
      />
      <button
        type="button"
        disabled={loading}
        onClick={() => void runAdvisor()}
        className="w-full rounded-xl bg-[color:var(--color-primary)] px-4 py-3 text-sm font-semibold text-[color:var(--color-background)] disabled:opacity-50"
      >
        {loading ? t("kitchen.ai.thinking") : t("finance.ai.run")}
      </button>
      {error ? <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
      {reply ? (
        <div className="space-y-2 border-t border-[color:var(--color-surface-border)] pt-3">
          <p className="text-sm leading-relaxed text-[color:var(--color-text)]">{reply}</p>
          {tips.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-secondary)]">
                {t("finance.ai.tips")}
              </p>
              <ul className="mt-1 list-inside list-disc text-sm text-[color:var(--color-text)]">
                {tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {warnings.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
                {t("finance.ai.warnings")}
              </p>
              <ul className="mt-1 list-inside list-disc text-sm text-rose-600 dark:text-rose-300">
                {warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
