"use client";

import { getBrowserClient } from "@/lib/supabase/client";

export type PharmacyInventoryRecord = {
  id: string;
  name: string;
  quantity: number;
  unit: string | null;
  expiry_date: string | null;
  status: string;
};

export async function fetchPharmacyInventory(householdId: string) {
  const supabase = getBrowserClient();
  if (!supabase) return [] as PharmacyInventoryRecord[];

  const { data, error } = await supabase
    .from("inventory_items")
    .select("id, name, quantity, unit, expiry_date, status")
    .eq("household_id", householdId)
    .eq("module", "pharmacy")
    .eq("owner_scope", "household")
    .order("expiry_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch pharmacy inventory", error);
    return [];
  }

  return data as PharmacyInventoryRecord[];
}

export async function addPharmacyInventoryItem(input: {
  householdId: string;
  name: string;
  quantity: number;
  unit?: string;
  expiryDate?: string;
}) {
  const supabase = getBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.from("inventory_items").insert({
    household_id: input.householdId,
    module: "pharmacy",
    name: input.name.trim(),
    quantity: input.quantity,
    unit: input.unit?.trim() || null,
    expiry_date: input.expiryDate || null,
    status: resolvePharmacyStatus(input.quantity, input.expiryDate),
    owner_scope: "household",
  });

  if (error) throw error;
}

export async function deletePharmacyInventoryItem(input: {
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
    .eq("module", "pharmacy")
    .eq("owner_scope", "household");

  if (error) throw error;
}

export function resolvePharmacyStatus(quantity: number, expiryDate?: string | null) {
  const qty = Number(quantity);
  const now = new Date();
  const expiry = expiryDate ? new Date(expiryDate) : null;
  if (expiry && !Number.isNaN(expiry.getTime())) {
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 14) return "critical";
    if (diffDays <= 45) return "warning";
  }

  if (qty <= 3) return "critical";
  if (qty <= 7) return "warning";
  return "ok";
}
