"use client";

import { useEffect, useMemo, useState } from "react";
import { ModuleShell } from "@/components/layout/module-shell";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useAuth } from "@/components/providers/auth-provider";
import { formatAppDate } from "@/lib/date-format";
import {
  addFinanceTransaction,
  addFixedCost,
  buildFinanceBuckets,
  fetchFinanceTransactions,
  fetchFixedCosts,
  fixedCostPaidThisMonth,
  formatEuro,
  summarizeFinance,
  type FinanceTransactionRecord,
  type FixedCostRecord,
} from "@/lib/finance";

export default function FinancePage() {
  const { t, locale } = useI18n();
  const { profile } = useAuth();
  const [fixedCosts, setFixedCosts] = useState<FixedCostRecord[]>([]);
  const [transactions, setTransactions] = useState<FinanceTransactionRecord[]>([]);
  const [billTitle, setBillTitle] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [billDueDay, setBillDueDay] = useState("");
  const [billCategory, setBillCategory] = useState("");
  const [txnTitle, setTxnTitle] = useState("");
  const [txnAmount, setTxnAmount] = useState("");
  const [txnDate, setTxnDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [txnDirection, setTxnDirection] = useState<"income" | "expense">("expense");
  const [txnFixedCostId, setTxnFixedCostId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.household_id) {
      setFixedCosts([]);
      setTransactions([]);
      return;
    }

    let alive = true;

    void Promise.all([
      fetchFixedCosts(profile.household_id),
      fetchFinanceTransactions(profile.household_id),
    ]).then(([costs, txns]) => {
      if (!alive) return;
      setFixedCosts(costs);
      setTransactions(txns);
    });

    return () => {
      alive = false;
    };
  }, [profile?.household_id]);

  const summary = useMemo(() => summarizeFinance(transactions), [transactions]);
  const plannedSpend = useMemo(
    () => fixedCosts.reduce((total, item) => total + item.amount, 0),
    [fixedCosts],
  );
  const buckets = useMemo(() => buildFinanceBuckets(transactions, locale), [transactions, locale]);
  const topBucket = buckets[0]?.label ?? (locale === "lv" ? "mājas ikdiena" : "home routines");
  const insight = t("finance.autoInsight", {
    top: topBucket,
    planned: formatEuro(plannedSpend, locale),
  });

  async function reloadFinance() {
    if (!profile?.household_id) return;
    const [costs, txns] = await Promise.all([
      fetchFixedCosts(profile.household_id),
      fetchFinanceTransactions(profile.household_id),
    ]);
    setFixedCosts(costs);
    setTransactions(txns);
  }

  async function handleAddBill(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile?.household_id || !billTitle.trim() || !billAmount.trim()) return;

    setSaving(true);
    setError(null);
    try {
      await addFixedCost({
        householdId: profile.household_id,
        label: billTitle,
        amount: Number(billAmount),
        dueDay: billDueDay ? Number(billDueDay) : null,
        category: billCategory,
      });
      await reloadFinance();
      setBillTitle("");
      setBillAmount("");
      setBillDueDay("");
      setBillCategory("");
    } catch (nextError) {
      console.error(nextError);
      setError(t("finance.form.error"));
    } finally {
      setSaving(false);
    }
  }

  async function handleAddTransaction(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile?.household_id || !txnTitle.trim() || !txnAmount.trim()) return;

    setSaving(true);
    setError(null);
    try {
      await addFinanceTransaction({
        householdId: profile.household_id,
        fixedCostId: txnFixedCostId || null,
        direction: txnDirection,
        amount: Number(txnAmount),
        label: txnTitle,
        happenedAt: `${txnDate}T12:00:00.000Z`,
      });
      await reloadFinance();
      setTxnTitle("");
      setTxnAmount("");
      setTxnFixedCostId("");
      setTxnDirection("expense");
    } catch (nextError) {
      console.error(nextError);
      setError(t("finance.form.error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModuleShell title={t("tile.finance")} moduleId="finance">
      <GlassPanel className="space-y-4">
        <SectionHeading title={t("finance.overview")} />
        <p className="text-sm leading-relaxed text-[color:var(--color-secondary)]">
          {t("finance.overviewHint")}
        </p>
        <div className="grid grid-cols-3 gap-3">
          <MetricCard label={t("finance.wallet")} value={formatEuro(summary.balance, locale)} />
          <MetricCard label={t("finance.form.income")} value={formatEuro(summary.income, locale)} />
          <MetricCard
            label={t("finance.cashflow")}
            value={formatEuro(summary.expense, locale)}
            hint={formatEuro(plannedSpend, locale)}
          />
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-4">
        <SectionHeading title={t("finance.buckets")} />
        <p className="text-xs text-[color:var(--color-secondary)]">{t("finance.bucketsHint")}</p>
        {buckets.length === 0 ? (
          <p className="text-sm text-[color:var(--color-secondary)]">{t("finance.empty")}</p>
        ) : (
          <div className="space-y-4">
            {buckets.map((bucket) => (
              <div key={bucket.id}>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-[color:var(--color-text)]">{bucket.label}</p>
                  <p className="text-sm font-semibold text-[color:var(--color-primary)]">
                    {formatEuro(bucket.total, locale)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <SectionHeading title={t("finance.bills")} />
        <form onSubmit={handleAddBill} className="grid gap-3 rounded-2xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]/30 p-3 sm:grid-cols-2">
          <input
            type="text"
            value={billTitle}
            onChange={(e) => setBillTitle(e.target.value)}
            placeholder={t("finance.form.billTitle")}
            className="w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={billAmount}
            onChange={(e) => setBillAmount(e.target.value)}
            placeholder={t("finance.form.amount")}
            className="w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm"
          />
          <input
            type="number"
            min="1"
            max="31"
            value={billDueDay}
            onChange={(e) => setBillDueDay(e.target.value)}
            placeholder={t("finance.form.dueDay")}
            className="w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={billCategory}
            onChange={(e) => setBillCategory(e.target.value)}
            placeholder={t("finance.form.category")}
            className="w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm"
          />
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving || !profile?.household_id}
              className="w-full rounded-xl border border-[color:var(--color-primary)] bg-[color:var(--color-surface)] px-4 py-3 text-sm font-semibold text-[color:var(--color-text)] disabled:opacity-60"
            >
              {t("finance.form.addBill")}
            </button>
          </div>
        </form>
        <div className="space-y-2">
          {fixedCosts.length === 0 ? (
            <p className="text-sm text-[color:var(--color-secondary)]">{t("finance.empty")}</p>
          ) : (
            fixedCosts.map((bill) => {
              const paid = fixedCostPaidThisMonth(bill.id, transactions);
              return (
                <div
                  key={bill.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]/35 px-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[color:var(--color-text)]">{bill.label}</p>
                    <p className="text-xs text-[color:var(--color-secondary)]">
                      {formatEuro(bill.amount, locale)}
                      {bill.due_day ? ` · ${bill.due_day}.` : ""}
                      {bill.category ? ` · ${bill.category}` : ""}
                    </p>
                  </div>
                  <StatusPill tone={paid ? "good" : "warn"}>
                    {paid ? t("finance.billPaid") : t("finance.billPending")}
                  </StatusPill>
                </div>
              );
            })
          )}
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <SectionHeading title={t("finance.activity")} />
        <form onSubmit={handleAddTransaction} className="grid gap-3 rounded-2xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]/30 p-3 sm:grid-cols-2">
          <input
            type="text"
            value={txnTitle}
            onChange={(e) => setTxnTitle(e.target.value)}
            placeholder={t("finance.form.transactionTitle")}
            className="w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={txnAmount}
            onChange={(e) => setTxnAmount(e.target.value)}
            placeholder={t("finance.form.amount")}
            className="w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm"
          />
          <select
            value={txnDirection}
            onChange={(e) => setTxnDirection(e.target.value as "income" | "expense")}
            className="w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm"
          >
            <option value="expense">{t("finance.form.expense")}</option>
            <option value="income">{t("finance.form.income")}</option>
          </select>
          <input
            type="date"
            lang={locale === "lv" ? "lv-LV" : "en-US"}
            value={txnDate}
            onChange={(e) => setTxnDate(e.target.value)}
            className="w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm"
          />
          <select
            value={txnFixedCostId}
            onChange={(e) => setTxnFixedCostId(e.target.value)}
            className="sm:col-span-2 w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm"
          >
            <option value="">{t("finance.form.none")}</option>
            {fixedCosts.map((bill) => (
              <option key={bill.id} value={bill.id}>
                {bill.label}
              </option>
            ))}
          </select>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving || !profile?.household_id}
              className="w-full rounded-xl bg-[color:var(--color-primary)] px-4 py-3 text-sm font-semibold text-[color:var(--color-background)] disabled:opacity-60"
            >
              {t("finance.form.addTransaction")}
            </button>
          </div>
        </form>
        {error ? <p className="text-sm text-[color:var(--color-danger)]">{error}</p> : null}
        <div className="space-y-2">
          {transactions.length === 0 ? (
            <p className="text-sm text-[color:var(--color-secondary)]">{t("finance.activityEmpty")}</p>
          ) : (
            transactions.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]/35 px-3 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm leading-snug text-[color:var(--color-text)]">
                    {item.label}
                  </p>
                  <StatusPill tone={item.direction === "income" ? "good" : "warn"}>
                    {item.direction === "income" ? "+" : "-"}
                    {formatEuro(item.amount, locale)}
                  </StatusPill>
                </div>
                <p className="mt-1 text-xs text-[color:var(--color-secondary)]">
                  {formatAppDate(item.happened_at, locale)}
                </p>
              </div>
            ))
          )}
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <SectionHeading title={t("finance.insight")} />
        <p className="text-sm leading-relaxed text-[color:var(--color-text)]">
          {insight}
        </p>
        <p className="text-xs leading-relaxed text-[color:var(--color-secondary)]">
          {t("finance.partnerHint")}
        </p>
      </GlassPanel>
    </ModuleShell>
  );
}
