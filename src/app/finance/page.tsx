"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ModuleShell } from "@/components/layout/module-shell";
import { HiddenSeasonalCollectible } from "@/components/seasonal/hidden-seasonal-collectible";
import { GlassPanel } from "@/components/ui/glass-panel";
import { FinanceThemeLayer } from "@/components/finance/finance-theme-layer";
import { FinanceQuickActions } from "@/components/finance/FinanceQuickActions";
import { PlannedBillsPreview } from "@/components/finance/PlannedBillsPreview";
import { UrgentBillsCard } from "@/components/finance/UrgentBillsCard";
import { WalletHero } from "@/components/finance/WalletHero";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useAuth } from "@/components/providers/auth-provider";
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

export default function FinancePage() {
  const { t, locale } = useI18n();
  const { profile } = useAuth();
  const router = useRouter();
  const [fixedCosts, setFixedCosts] = useState<FixedCostRecord[]>([]);
  const [transactions, setTransactions] = useState<FinanceTransactionRecord[]>([]);
  const [payingBillId, setPayingBillId] = useState<string | null>(null);
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
    } catch (nextError) {
      console.error(nextError);
      setError(locale === "lv" ? "Neizdevas atzimet maksajumu." : "Could not mark payment.");
    } finally {
      setPayingBillId(null);
    }
  }

  const primaryUrgentBill = urgentBills[0]?.id ?? null;

  return (
    <ModuleShell title={t("tile.finance")} moduleId="finance">
      <FinanceThemeLayer>
        <HiddenSeasonalCollectible spotId="finance" />

        <section className="space-y-4">
          <WalletHero
            title={locale === "lv" ? "Musu macins" : "Household wallet"}
            subtitle={
              locale === "lv"
                ? "Mierigs kopskats par majas naudas ritmu"
                : "A calm, shared view of your household money flow"
            }
            total={formatEuro(summary.balance, locale)}
            incomeShare={incomeVsExpense.incomeShare}
            expenseShare={incomeVsExpense.expenseShare}
            initials={householdInitials}
          />

          <FinanceQuickActions
            onAddExpense={() => router.push("/finance?action=add-expense")}
            onAddPayment={() => router.push("/finance?action=add-payment")}
            onMarkPaid={() => {
              if (primaryUrgentBill) {
                void handleMarkPaid(primaryUrgentBill);
                return;
              }
              router.push("/finance?action=mark-paid");
            }}
            onEdit={() => router.push("/finance?action=edit")}
          />
        </section>

        <UrgentBillsCard
          title={locale === "lv" ? "Tuvakie maksajumi" : "Upcoming bills"}
          subtitle={
            locale === "lv"
              ? "Pavelc pa labi, lai atzimetu ka apmaksatu"
              : "Swipe right to mark as paid"
          }
          emptyLabel={
            locale === "lv"
              ? "Visi tuvakie rekinI ir apmaksati."
              : "All near-term bills are paid."
          }
          items={urgentBills}
          onSwipePay={(billId) => {
            void handleMarkPaid(billId);
          }}
          payingBillId={payingBillId}
        />

        <PlannedBillsPreview
          title={locale === "lv" ? "Planotie maksajumi" : "Planned bills"}
          subtitle={
            locale === "lv"
              ? "Kas vel gaidams saja menesi"
              : "A quick look at later monthly payments"
          }
          emptyLabel={
            locale === "lv"
              ? "Sobrid nav citu planotu maksajumu."
              : "No additional planned payments right now."
          }
          items={plannedBills}
        />

        <GlassPanel
          className="space-y-3"
          style={{
            borderRadius: "var(--radius-card)",
            background: "color-mix(in srgb, var(--color-surface) 90%, transparent)",
          }}
        >
          <p className="text-xs uppercase tracking-[0.12em]" style={{ color: "var(--color-accent)" }}>
            {locale === "lv" ? "Pilnais finansu parskats" : "Full finance overview"}
          </p>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {locale === "lv"
              ? "Atver pilnu vesturi, kategorijas un detalizetu redigesanu atseviska skatijuma."
              : "Open full history, categories, and detailed editing in a dedicated view."}
          </p>

          <Link
            href="/finance"
            className="inline-flex w-full items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-semibold"
            style={{
              borderColor: "color-mix(in srgb, var(--color-border) 64%, transparent)",
              background: "color-mix(in srgb, var(--color-surface-2) 84%, transparent)",
              color: "var(--color-text-primary)",
            }}
          >
            {locale === "lv" ? "Skatit visu vesturi un parskatus" : "View full history and reports"}
          </Link>
        </GlassPanel>

        {error ? <p className="text-sm font-medium text-red-500">{error}</p> : null}
      </FinanceThemeLayer>
    </ModuleShell>
  );
}