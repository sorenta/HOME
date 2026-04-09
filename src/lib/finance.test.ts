import {
  summarizeFinance,
  formatEuro,
  monthKey,
  currentMonthKey,
  fixedCostPaidThisMonth,
  buildFinanceBuckets,
  type FinanceTransactionRecord,
} from "./finance";

// Helper to create a transaction in the current month
function makeTx(
  overrides: Partial<FinanceTransactionRecord> = {},
): FinanceTransactionRecord {
  return {
    id: Math.random().toString(36).slice(2),
    fixed_cost_id: null,
    direction: "expense",
    amount: 100,
    label: "Test",
    happened_at: new Date().toISOString(),
    metadata: null,
    ...overrides,
  };
}

// Helper to create a transaction in a past month
function makePastTx(
  overrides: Partial<FinanceTransactionRecord> = {},
): FinanceTransactionRecord {
  return makeTx({
    happened_at: "2020-01-15T10:00:00.000Z",
    ...overrides,
  });
}

// ─── monthKey ────────────────────────────────────────────────────────────────

describe("monthKey", () => {
  it("extracts YYYY-MM from ISO string", () => {
    expect(monthKey("2026-04-07T14:30:00.000Z")).toBe("2026-04");
  });

  it("works for the first day of month", () => {
    expect(monthKey("2026-01-01T00:00:00.000Z")).toBe("2026-01");
  });
});

// ─── currentMonthKey ─────────────────────────────────────────────────────────

describe("currentMonthKey", () => {
  it("returns current year and month in YYYY-MM format", () => {
    const result = currentMonthKey();
    expect(result).toMatch(/^\d{4}-\d{2}$/);
  });

  it("matches today's date", () => {
    const today = new Date().toISOString().slice(0, 7);
    expect(currentMonthKey()).toBe(today);
  });
});

// ─── formatEuro ──────────────────────────────────────────────────────────────

describe("formatEuro", () => {
  it("formats positive amount in lv locale", () => {
    const result = formatEuro(1500, "lv");
    expect(result).toContain("1");
    expect(result).toContain("500");
    expect(result).toContain("€");
  });

  it("formats positive amount in en locale", () => {
    const result = formatEuro(1500, "en");
    expect(result).toContain("€");
    expect(result).toContain("1,500");
  });

  it("formats zero correctly", () => {
    const result = formatEuro(0, "lv");
    expect(result).toContain("0");
  });

  it("formats negative amounts", () => {
    const result = formatEuro(-250, "en");
    expect(result).toContain("250");
  });

  it("rounds to no decimal places (maximumFractionDigits: 0)", () => {
    const result = formatEuro(19.99, "en");
    expect(result).not.toContain(".");
    expect(result).toContain("20");
  });
});

// ─── summarizeFinance ────────────────────────────────────────────────────────

describe("summarizeFinance", () => {
  it("returns zeros for empty transactions", () => {
    expect(summarizeFinance([])).toEqual({ income: 0, expense: 0, balance: 0 });
  });

  it("sums income and expense for current month", () => {
    const txns = [
      makeTx({ direction: "income", amount: 1000 }),
      makeTx({ direction: "expense", amount: 300 }),
      makeTx({ direction: "expense", amount: 200 }),
    ];
    expect(summarizeFinance(txns)).toEqual({
      income: 1000,
      expense: 500,
      balance: 500,
    });
  });

  it("ignores transactions from past months", () => {
    const txns = [
      makeTx({ direction: "income", amount: 1000 }),
      makePastTx({ direction: "income", amount: 9999 }),
      makePastTx({ direction: "expense", amount: 9999 }),
    ];
    expect(summarizeFinance(txns)).toEqual({
      income: 1000,
      expense: 0,
      balance: 1000,
    });
  });

  it("calculates negative balance when expenses exceed income", () => {
    const txns = [
      makeTx({ direction: "income", amount: 200 }),
      makeTx({ direction: "expense", amount: 500 }),
    ];
    const result = summarizeFinance(txns);
    expect(result.balance).toBe(-300);
  });
});

// ─── fixedCostPaidThisMonth ──────────────────────────────────────────────────

describe("fixedCostPaidThisMonth", () => {
  const costId = "cost-abc-123";

  it("returns false when no transactions exist", () => {
    expect(fixedCostPaidThisMonth(costId, [])).toBe(false);
  });

  it("returns true when cost was paid this month", () => {
    const txns = [
      makeTx({ fixed_cost_id: costId, direction: "expense" }),
    ];
    expect(fixedCostPaidThisMonth(costId, txns)).toBe(true);
  });

  it("returns false when cost was paid in a previous month", () => {
    const txns = [
      makePastTx({ fixed_cost_id: costId, direction: "expense" }),
    ];
    expect(fixedCostPaidThisMonth(costId, txns)).toBe(false);
  });

  it("returns false when different cost id was paid", () => {
    const txns = [
      makeTx({ fixed_cost_id: "other-cost-id", direction: "expense" }),
    ];
    expect(fixedCostPaidThisMonth(costId, txns)).toBe(false);
  });

  it("returns false when income transaction exists (not expense)", () => {
    const txns = [
      makeTx({ fixed_cost_id: costId, direction: "income" }),
    ];
    expect(fixedCostPaidThisMonth(costId, txns)).toBe(false);
  });
});

// ─── buildFinanceBuckets ─────────────────────────────────────────────────────

describe("buildFinanceBuckets", () => {
  it("returns empty array for empty transactions", () => {
    expect(buildFinanceBuckets([], "lv")).toEqual([]);
  });

  it("groups expenses by category and sorts descending", () => {
    const txns = [
      makeTx({ amount: 200, metadata: { category: "Pārtika" } }),
      makeTx({ amount: 100, metadata: { category: "Pārtika" } }),
      makeTx({ amount: 500, metadata: { category: "Komunālie" } }),
    ];
    const buckets = buildFinanceBuckets(txns, "lv");
    expect(buckets).toHaveLength(2);
    expect(buckets[0]).toMatchObject({ label: "Komunālie", total: 500 });
    expect(buckets[1]).toMatchObject({ label: "Pārtika", total: 300 });
  });

  it("ignores income transactions", () => {
    const txns = [
      makeTx({ direction: "income", amount: 1000, metadata: { category: "Alga" } }),
      makeTx({ direction: "expense", amount: 50, metadata: { category: "Kafija" } }),
    ];
    const buckets = buildFinanceBuckets(txns, "lv");
    expect(buckets).toHaveLength(1);
    expect(buckets[0].label).toBe("Kafija");
  });

  it("ignores past month transactions", () => {
    const txns = [
      makePastTx({ amount: 9999, metadata: { category: "Vecs" } }),
      makeTx({ amount: 50, metadata: { category: "Šomēnes" } }),
    ];
    const buckets = buildFinanceBuckets(txns, "lv");
    expect(buckets).toHaveLength(1);
    expect(buckets[0].label).toBe("Šomēnes");
  });

  it("limits to top 4 categories", () => {
    const txns = Array.from({ length: 10 }, (_, i) =>
      makeTx({ amount: i + 1, metadata: { category: `Cat-${i}` } }),
    );
    expect(buildFinanceBuckets(txns, "lv")).toHaveLength(4);
  });

  it("falls back to locale default category when metadata.category is missing", () => {
    const txns = [makeTx({ amount: 50, metadata: null })];
    const buckets = buildFinanceBuckets(txns, "lv");
    expect(buckets[0].label).toBe("Citi tēriņi");

    const bucketsEn = buildFinanceBuckets(txns, "en");
    expect(bucketsEn[0].label).toBe("Other spending");
  });
});
