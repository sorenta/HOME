import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

let browserClient: SupabaseClient | null | undefined;

export function createClient(): SupabaseClient | null {
  const env = getSupabasePublicEnv();
  if (!env) {
    return null;
  }

  return createSupabaseClient(env.url, env.publishableKey);
}

export function getBrowserClient(): SupabaseClient | null {
  if (typeof window === "undefined") {
    return createClient();
  }

  if (browserClient !== undefined) {
    return browserClient;
  }

  browserClient = createClient();
  return browserClient;
}
