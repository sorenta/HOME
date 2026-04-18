"use client";

import { getBrowserClient } from "@/lib/supabase/client";

export type FixedCostRecord = {
  id: string;
  label: string;
  amount: number;
  due_day: number | null;
  category: string | null;
  is_active: boolean;
};

export type FinanceTransactionRecord = {
  id: string;
  fixed_cost_id: string | null;
  direction: "income" | "expense";
  amount: number;
  label: string;
  happened_at: string;
  metadata: Record<string, unknown> | null;
};

export type FinanceSavingsGoalRecord = {
  id: string;
  label: string;
  current_amount: number;
  target_amount: number;
  is_active: boolean;
};

export async function fetchFinanceSavingsGoals(householdId: string) {
  const supabase = getBrowserClient();
  if (!supabase) return [] as FinanceSavingsGoalRecord[];

  const { data, error } = await supabase
    .from("finance_savings_goals")
    .select("id, label, current_amount, target_amount, is_active, created_at")
    .eq("household_id", householdId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch finance savings goals", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    return [];
  }

  return ((data as FinanceSavingsGoalRecord[] | null) ?? []).map((row) => ({
    ...row,
    current_amount: Number(row.current_amount),
    target_amount: Number(row.target_amount),
  }));
}

export async function fetchFixedCosts(householdId: string) {
  const supabase = getBrowserClient();
  if (!supabase) return [] as FixedCostRecord[];

  const { data, error } = await supabase
    .from("fixed_costs")
    .select("id, label, amount, due_day, category, is_active")
    .eq("household_id", householdId)
    .eq("is_active", true)
    .order("due_day", { ascending: true });

  if (error) {
    console.error("Failed to fetch fixed costs", error);
    return [];
  }

  return ((data as FixedCostRecord[] | null) ?? []).map((row) => ({
    ...row,
    amount: Number(row.amount),
  }));
}

export async function fetchFinanceTransactions(householdId: string) {
  const supabase = getBrowserClient();
  if (!supabase) return [] as FinanceTransactionRecord[];

  const { data, error } = await supabase
    .from("finance_transactions")
    .select("id, fixed_cost_id, direction, amount, label, happened_at, metadata")
    .eq("household_id", householdId)
    .order("happened_at", { ascending: false })
    .limit(40);

  if (error) {
    console.error("Failed to fetch finance transactions", error);
    return [];
  }

  return ((data as FinanceTransactionRecord[] | null) ?? []).map((row) => ({
    ...row,
    amount: Number(row.amount),
  }));
}

export async function addFixedCost(input: {
  householdId: string;
  label: string;
  amount: number;
  dueDay: number | null;
  category?: string;
}) {
  const supabase = getBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("fixed_costs").insert({
    household_id: input.householdId,
    label: input.label.trim(),
    amount: input.amount,
    due_day: input.dueDay,
    category: input.category?.trim() || null,
    is_active: true,
  });

  if (error) throw error;
}

export async function addFinanceTransaction(input: {
  householdId: string;
  fixedCostId?: string | null;
  direction: "income" | "expense";
  amount: number;
  label: string;
  happenedAt?: string;
}) {
  const supabase = getBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("finance_transactions").insert({
    household_id: input.householdId,
    fixed_cost_id: input.fixedCostId ?? null,
    direction: input.direction,
    amount: input.amount,
    label: input.label.trim(),
    happened_at: input.happenedAt ?? new Date().toISOString(),
    metadata: {},
  });

  if (error) throw error;
}

export function formatEuro(value: number, locale: "lv" | "en") {
  return new Intl.NumberFormat(locale === "lv" ? "lv-LV" : "en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function monthKey(value: string) {
  return value.slice(0, 7);
}

export function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

export function summarizeFinance(transactions: FinanceTransactionRecord[]) {
  const currentMonth = currentMonthKey();
  let income = 0;
  let expense = 0;

  for (const transaction of transactions) {
    if (monthKey(transaction.happened_at) !== currentMonth) continue;
    if (transaction.direction === "income") {
      income += transaction.amount;
    } else {
      expense += transaction.amount;
    }
  }

  return {
    income,
    expense,
    balance: income - expense,
  };
}

export function buildFinanceBuckets(
  transactions: FinanceTransactionRecord[],
  locale: "lv" | "en",
) {
  const currentMonth = currentMonthKey();
  const totals = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.direction !== "expense") continue;
    if (monthKey(transaction.happened_at) !== currentMonth) continue;
    const category =
      typeof transaction.metadata?.category === "string"
        ? (transaction.metadata.category as string)
        : locale === "lv"
          ? "Citi tēriņi"
          : "Other spending";
    totals.set(category, (totals.get(category) ?? 0) + transaction.amount);
  }

  return [...totals.entries()]
    .map(([label, total]) => ({ id: label, label, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);
}

export function fixedCostPaidThisMonth(
  fixedCostId: string,
  transactions: FinanceTransactionRecord[],
) {
  const currentMonth = currentMonthKey();
  return transactions.some(
    (transaction) =>
      transaction.fixed_cost_id === fixedCostId &&
      transaction.direction === "expense" &&
      monthKey(transaction.happened_at) === currentMonth,
  );
}
