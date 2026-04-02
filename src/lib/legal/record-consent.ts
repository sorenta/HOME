"use client";

import { getBrowserClient } from "@/lib/supabase/client";
import { PRIVACY_POLICY_VERSION } from "@/lib/legal/privacy-policy";

function isMissingTable(error: unknown) {
  const message =
    typeof error === "object" && error
      ? `${(error as { message?: string }).message ?? ""}`.toLowerCase()
      : "";
  return message.includes("does not exist") || message.includes("could not find");
}

/** Pierādāma piekrišana — darbojas tikai ar aktīvu sesiju (RLS). */
export async function recordPrivacyPolicyAcceptance(userId: string): Promise<void> {
  const supabase = getBrowserClient();
  if (!supabase) return;

  const { error } = await supabase.from("legal_consents").insert({
    user_id: userId,
    privacy_policy_version: PRIVACY_POLICY_VERSION,
  });

  if (error && !isMissingTable(error)) {
    console.warn("legal_consents insert failed", error);
  }
}
