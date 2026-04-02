import { getBrowserClient } from "@/lib/supabase/client";

export type KitchenInventoryRecord = {
  id: string;
  name: string;
  quantity: number;
  unit: string | null;
  expiry_date: string | null;
  status: string;
  category: string | null;
};

export type ShoppingRecord = {
  id: string;
  title: string;
  quantity: number;
  unit: string | null;
  status: string;
  category: string | null;
  suggested_by_ai: boolean;
};

export async function fetchKitchenInventory(householdId: string) {
  const supabase = getBrowserClient();
  if (!supabase) return [] as KitchenInventoryRecord[];

  const { data, error } = await supabase
    .from("inventory_items")
    .select("id, name, quantity, unit, expiry_date, status, category")
    .eq("household_id", householdId)
    .eq("module", "kitchen")
    .eq("owner_scope", "household")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch kitchen inventory", error);
    return [];
  }

  return (data as KitchenInventoryRecord[]).map((row) => ({
    ...row,
    category: row.category ?? null,
  }));
}

export async function fetchShoppingItems(householdId: string) {
  const supabase = getBrowserClient();
  if (!supabase) return [] as ShoppingRecord[];

  const { data, error } = await supabase
    .from("shopping_items")
    .select("id, title, quantity, unit, status, category, suggested_by_ai")
    .eq("household_id", householdId)
    .neq("status", "archived")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch shopping items", error);
    return [];
  }

  return (data as ShoppingRecord[]).map((row) => ({
    ...row,
    category: row.category ?? null,
    suggested_by_ai: Boolean(row.suggested_by_ai),
  }));
}

export async function addKitchenInventoryItem(input: {
  householdId: string;
  name: string;
  quantity: number;
  unit?: string;
  expiryDate?: string;
  category?: string | null;
}) {
  const supabase = getBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.from("inventory_items").insert({
    household_id: input.householdId,
    module: "kitchen",
    name: input.name.trim(),
    category: input.category?.trim() || null,
    quantity: input.quantity,
    unit: input.unit?.trim() || null,
    expiry_date: input.expiryDate || null,
    status: "in_stock",
    owner_scope: "household",
  });

  if (error) throw error;
}

export async function addKitchenInventoryItems(
  householdId: string,
  items: Array<{
    name: string;
    quantity?: number;
    unit?: string | null;
    category?: string | null;
  }>,
) {
  const supabase = getBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const payload = items
    .map((item) => ({
      household_id: householdId,
      module: "kitchen" as const,
      name: item.name.trim(),
      category: item.category?.trim() || null,
      quantity: item.quantity ?? 1,
      unit: item.unit?.trim() || null,
      status: "in_stock" as const,
      owner_scope: "household" as const,
    }))
    .filter((item) => item.name.length > 0);

  if (payload.length === 0) return;

  const { error } = await supabase.from("inventory_items").insert(payload);

  if (error) throw error;
}

export async function addShoppingItem(input: {
  householdId: string;
  title: string;
  quantity: number;
  unit?: string;
  category?: string | null;
  suggestedByAi?: boolean;
}) {
  const supabase = getBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.from("shopping_items").insert({
    household_id: input.householdId,
    title: input.title.trim(),
    quantity: input.quantity,
    unit: input.unit?.trim() || null,
    category: input.category?.trim() || null,
    status: "open",
    suggested_by_ai: input.suggestedByAi ?? false,
  });

  if (error) throw error;
}

export async function updateShoppingItemStatus(input: {
  householdId: string;
  itemId: string;
  status: "open" | "picked" | "archived";
}) {
  const supabase = getBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase
    .from("shopping_items")
    .update({ status })
    .eq("id", input.itemId)
    .eq("household_id", input.householdId);

  if (error) throw error;
}

/** RPC validates membership; householdId is required at call sites for defense-in-depth and clarity. */
export async function moveShoppingItemToInventory(input: {
  householdId: string;
  itemId: string;
}) {
  const supabase = getBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  if (!input.householdId) {
    throw new Error("householdId is required.");
  }

  const { error } = await supabase.rpc("move_shopping_item_to_inventory", {
    p_item_id: input.itemId,
  });

  if (error) throw error;
}

export async function deleteKitchenInventoryItem(input: {
  householdId: string;
  itemId: string;
}) {
  const supabase = getBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase
    .from("inventory_items")
    .delete()
    .eq("id", input.itemId)
    .eq("household_id", input.householdId)
    .eq("module", "kitchen")
    .eq("owner_scope", "household");

  if (error) throw error;
}

export function formatQuantity(value: number, unit: string | null) {
  return unit ? `${value} ${unit}` : `${value}`;
}

export function inventoryTone(status: string): "good" | "warn" | "critical" {
  if (status === "low_stock" || status === "expiring") return "warn";
  if (status === "out" || status === "expired") return "critical";
  return "good";
}

export function shoppingTone(status: string): "good" | "warn" | "neutral" {
  if (status === "picked") return "good";
  if (status === "open") return "warn";
  return "neutral";
}
