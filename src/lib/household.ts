import { getBrowserClient } from "@/lib/supabase/client";

export type Household = {
  id: string;
  name: string;
  qr_code: string | null;
  subscription_type: string;
  subscription_status?: string | null;
  billing_provider?: string | null;
  trial_ends_at?: string | null;
  current_period_ends_at?: string | null;
  member_count?: number;
};

export type HouseholdMember = {
  id: string;
  display_name: string | null;
  role_label: string | null;
  is_me: boolean;
};

export async function fetchMyHouseholdSummary(): Promise<Household | null> {
  const supabase = getBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .rpc("get_my_household_summary")
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch household summary", error);
    return null;
  }

  return (data as Household | null) ?? null;
}

export async function createHousehold(name: string): Promise<string> {
  const supabase = getBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase.rpc("create_household_for_current_user", {
    p_name: name.trim(),
  });

  if (error) throw error;
  return data as string;
}

export async function joinHouseholdByCode(code: string): Promise<string> {
  const supabase = getBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase.rpc("join_household_by_code", {
    p_code: code.trim().toUpperCase(),
  });

  if (error) throw error;
  return data as string;
}

export async function fetchMyHouseholdMembers(): Promise<HouseholdMember[]> {
  const supabase = getBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase.rpc("get_my_household_members");

  if (error) {
    console.error("Failed to fetch household members", error);
    return [];
  }

  return (data as HouseholdMember[] | null) ?? [];
}

export function parseInviteCodeFromQr(payload: string): string | null {
  const value = payload.trim();
  if (!value) return null;

  try {
    const url = new URL(value);
    const code = url.searchParams.get("code");
    return code ? code.toUpperCase() : null;
  } catch {
    return /^[A-Z0-9-]+$/i.test(value) ? value.toUpperCase() : null;
  }
}
