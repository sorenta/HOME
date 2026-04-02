const AUTOFILL_VERSION = "v1";

export type KitchenAutofillEntry = {
  name: string;
  category: string;
  count: number;
};

function storageKey(householdId: string) {
  return `majapps-kitchen-autofill-${AUTOFILL_VERSION}-${householdId}`;
}

export function readKitchenAutofill(householdId: string): KitchenAutofillEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(householdId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((row) => {
        if (!row || typeof row !== "object") return null;
        const o = row as Record<string, unknown>;
        const name = typeof o.name === "string" ? o.name.trim() : "";
        const category = typeof o.category === "string" ? o.category.trim() : "";
        const count = typeof o.count === "number" && o.count > 0 ? o.count : 1;
        if (!name) return null;
        return { name, category, count };
      })
      .filter(Boolean) as KitchenAutofillEntry[];
  } catch {
    return [];
  }
}

function writeAutofill(householdId: string, entries: KitchenAutofillEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(householdId), JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

export function recordKitchenAutofillUsage(input: {
  householdId: string;
  name: string;
  category?: string | null;
}) {
  const name = input.name.trim();
  if (!name) return;

  const entries = readKitchenAutofill(input.householdId);
  const cat = (input.category ?? "").trim();
  const idx = entries.findIndex(
    (e) => e.name.toLowerCase() === name.toLowerCase() && e.category === cat,
  );

  if (idx >= 0) {
    entries[idx] = { ...entries[idx], count: entries[idx].count + 1 };
  } else {
    entries.push({ name, category: cat, count: 1 });
  }

  entries.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  writeAutofill(input.householdId, entries.slice(0, 200));
}

export function kitchenAutofillDatalistId(householdId: string) {
  return `kitchen-autofill-${householdId.slice(0, 8)}`;
}

export function kitchenAutofillOptions(householdId: string, categoryFilter?: string) {
  const entries = readKitchenAutofill(householdId);
  const filtered =
    categoryFilter && categoryFilter !== "__all__"
      ? entries.filter((e) => e.category === categoryFilter)
      : entries;
  const names = [...new Set(filtered.map((e) => e.name))];
  return names.slice(0, 40);
}
