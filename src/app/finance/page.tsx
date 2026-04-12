"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useCallback } from "react";
import { ModuleShell } from "@/components/layout/module-shell";
import { HiddenSeasonalCollectible } from "@/components/seasonal/hidden-seasonal-collectible";
import { GlassPanel } from "@/components/ui/glass-panel";
import { FinanceThemeLayer } from "@/components/finance/finance-theme-layer";
import { LucentFinanceLayout } from "@/components/finance/layouts/lucent-layout";
import { ForgeFinanceLayout } from "@/components/finance/layouts/forge-layout";
import { PulseFinanceLayout } from "@/components/finance/layouts/pulse-layout";
import { BotanicalFinanceLayout } from "@/components/finance/layouts/botanical-layout";
import { HiveFinanceLayout } from "@/components/finance/layouts/hive-layout";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useAuth } from "@/components/providers/auth-provider";
import { useTheme } from "@/components/providers/theme-provider";
import {
  addFinanceTransaction,
  fetchFinanceTransactions,
  fetchFixedCosts,
  fixedCostPaidThisMonth,
  formatEuro,
  summarizeFinance,
  type FixedCostRecord,
  type FinanceTransactionRecord,
} from "@/lib/finance";
import { FinanceSavingsGoals } from "@/components/finance/FinanceSavingsGoals";
import { useThemeActionEffects } from "@/components/theme/theme-action-effects";

type BillPreview = {
  id: string;
  label: string;
  amount: number;
  amountLabel: string;
  dueInDays: number;
  dueLabel: string;
  ownerLabel: string | null;
};

function daysUntilDue(dueDay: number | null) {
  if (!dueDay) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const clampedDay = Math.min(Math.max(dueDay, 1), daysInMonth);

  let dueDate = new Date(today.getFullYear(), today.getMonth(), clampedDay);
  if (dueDate < today) {
    dueDate = new Date(today.getFullYear(), today.getMonth() + 1, clampedDay);
  }

  const diff = dueDate.getTime() - today.getTime();
  return Math.round(diff / 86400000);
}

function dueLabel(days: number, locale: "lv" | "en") {
  if (days <= 0) return locale === "lv" ? "sodien" : "today";
  if (days === 1) return locale === "lv" ? "rit" : "tomorrow";
  return locale === "lv" ? `pec ${days} dienam` : `in ${days} days`;
}

import { useSearchParams } from "next/navigation";

export default function FinancePage() {
  const { t, locale } = useI18n();
  const { profile } = useAuth();
  const { themeId } = useTheme();
  const { triggerThemeActionEffect } = useThemeActionEffects();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fixedCosts, setFixedCosts] = useState<FixedCostRecord[]>([]);
  const [transactions, setTransactions] = useState<FinanceTransactionRecord[]>([]);
  const [payingBillId, setPayingBillId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const householdId = profile?.household_id;

  const loadFinanceData = useCallback(async () => {
    if (!householdId) {
      setFixedCosts([]);
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const [costs, txns] = await Promise.all([
      fetchFixedCosts(householdId),
      fetchFinanceTransactions(householdId),
    ]);
    setFixedCosts(costs);
    setTransactions(txns);
    setLoading(false);
  }, [householdId]);

  useEffect(() => {
    void loadFinanceData();
  }, [loadFinanceData]);

  const handleAddExpense = useCallback(() => {
    if (!householdId) return;
    void (async () => {
      try {
        await addFinanceTransaction({
          householdId,
          direction: "expense",
          amount: 15,
          label: "Pirkums (Quick)",
        });
        await loadFinanceData();
        triggerThemeActionEffect({ kind: "add", label: "15 €" });
      } catch (e) {
        console.error(e);
        setError(locale === "lv" ? "Neizdevās pievienot tēriņu." : "Could not add expense.");
      }
    })();
  }, [householdId, loadFinanceData, locale, triggerThemeActionEffect]);

  useEffect(() => {
    if (loading || !householdId) return;
    const action = searchParams.get("action");
    if (action === "add-expense") {
      handleAddExpense();
      window.history.replaceState({}, "", "/finance");
    }
  }, [loading, householdId, searchParams, handleAddExpense]);

  const summary = useMemo(() => summarizeFinance(transactions), [transactions]);
  const householdInitials = useMemo(() => {
    const profileInitial =
      profile?.display_name?.trim().slice(0, 1).toUpperCase() ??
      (locale === "lv" ? "M" : "H");
    const pairInitial = locale === "lv" ? "K" : "W";
    return [profileInitial, pairInitial];
  }, [locale, profile?.display_name]);

  const billPreview = useMemo(() => {
    return fixedCosts
      .filter((item) => !fixedCostPaidThisMonth(item.id, transactions))
      .map((item) => {
        const nextDueIn = daysUntilDue(item.due_day);
        return {
          id: item.id,
          label: item.label,
          amount: item.amount,
          amountLabel: formatEuro(item.amount, locale),
          dueInDays: nextDueIn ?? 99,
          dueLabel:
            nextDueIn === null
              ? locale === "lv"
                ? "bez termina"
                : "no due date"
              : dueLabel(nextDueIn, locale),
          ownerLabel: item.category,
        } satisfies BillPreview;
      })
      .sort((a, b) => a.dueInDays - b.dueInDays);
  }, [fixedCosts, locale, transactions]);

  const urgentBills = useMemo(
    () => billPreview.filter((item) => item.dueInDays <= 5).slice(0, 4),
    [billPreview],
  );

  const plannedBills = useMemo(
    () => billPreview.filter((item) => item.dueInDays > 5).slice(0, 4),
    [billPreview],
  );

  const incomeVsExpense = useMemo(() => {
    const totalFlow = summary.income + summary.expense;
    if (totalFlow <= 0) {
      return { incomeShare: 50, expenseShare: 50 };
    }
    const incomeShare = Math.max(22, Math.round((summary.income / totalFlow) * 100));
    return {
      incomeShare,
      expenseShare: Math.max(8, 100 - incomeShare),
    };
  }, [summary.expense, summary.income]);

  async function reloadFinance() {
    if (!profile?.household_id) return;
    const [costs, txns] = await Promise.all([
      fetchFixedCosts(profile.household_id),
      fetchFinanceTransactions(profile.household_id),
    ]);
    setFixedCosts(costs);
    setTransactions(txns);
  }

  async function handleMarkPaid(billId: string) {
    if (!profile?.household_id) return;
    const target = fixedCosts.find((item) => item.id === billId);
    if (!target) return;

    setPayingBillId(billId);
    setError(null);
    try {
      await addFinanceTransaction({
        householdId: profile.household_id,
        fixedCostId: target.id,
        direction: "expense",
        amount: target.amount,
        label: target.label,
      });
      await reloadFinance();
      triggerThemeActionEffect({ kind: "done", label: target.label });
    } catch (nextError) {
      console.error(nextError);
      setError(locale === "lv" ? "Neizdevas atzimet maksajumu." : "Could not mark payment.");
    } finally {
      setPayingBillId(null);
    }
  }

  const primaryUrgentBill = urgentBills[0]?.id ?? null;

  const layoutProps = {
    summary,
    urgentBills,
    plannedBills,
    householdInitials,
    incomeVsExpense,
    locale,
    primaryUrgentBill,
    payingBillId,
    onAddExpense: () => router.push("/finance?action=add-expense"),
    onAddPayment: () => router.push("/finance?action=add-payment"),
    onMarkPaid: (billId?: string) => {
      if (billId) {
        void handleMarkPaid(billId);
      } else {
        router.push("/finance?action=mark-paid");
      }
    },
    onEdit: () => router.push("/finance?action=edit"),
  };

  return (
    <ModuleShell
      title={t("tile.finance")}
      moduleId="finance"
      sectionId="finance"
      description={
        locale === "lv"
          ? "Rēķini, plūsma un mājas naudas ritms vienā pārskatāmā skatā."
          : "Bills, cash flow, and your household money rhythm in one clear view."
      }
    >
      <FinanceThemeLayer>
        <HiddenSeasonalCollectible spotId="finance" />

        {themeId === "forge" ? (
          <ForgeFinanceLayout {...layoutProps} />
        ) : themeId === "pulse" ? (
          <PulseFinanceLayout {...layoutProps} />
        ) : themeId === "botanical" ? (
          <BotanicalFinanceLayout {...layoutProps} />
        ) : themeId === "hive" ? (
          <HiveFinanceLayout {...layoutProps} />
        ) : (
          <LucentFinanceLayout {...layoutProps} />
        )}

        <div className="pt-4 pb-12 px-2 sm:px-4">
          <GlassPanel
            className="space-y-3"
            style={{
              borderRadius: themeId === "forge" ? "2px" : "var(--radius-card)", 
              background: "color-mix(in srgb, var(--color-surface) 90%, transparent)",
              border: themeId === "forge" ? "1px solid rgba(255,255,255,0.1)" : undefined
            }}
          >
            <p className={`text-xs uppercase tracking-[0.12em] ${themeId === "forge" ? "text-primary font-black" : "text-[var(--color-accent)]"}`}>
              {locale === "lv" ? "Pilnais finanšu pārskats" : "Full finance overview"}
            </p>
            <p className="text-sm opacity-70">
              {locale === "lv"
                ? "Atver pilnu vēsturi, kategorijas un detalizētu rediģēšanu atsevišķā skatījumā."
                : "Open full history, categories, and detailed editing in a dedicated view."}
            </p>

            <Link
              href="/finance"
              className={`inline-flex w-full items-center justify-center border px-4 py-2.5 text-sm font-semibold transition-all ${
                themeId === "forge"
                  ? "border-primary/30 bg-primary/10 text-primary font-mono hover:bg-primary/20 rounded-sm"
                  : "rounded-xl border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)]"    
              }`}
            >
              {locale === "lv" ? "Skatīt visu vēsturi un pārskatus" : "View full history and reports"}
            </Link>
          </GlassPanel>
        </div>

        {error ? <p className="px-4 text-sm font-medium text-red-500">{error}</p> : null}
      </FinanceThemeLayer>
    </ModuleShell>
  );
}
