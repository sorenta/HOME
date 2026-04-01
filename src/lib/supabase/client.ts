import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

let browserClient: SupabaseClient | null | undefined;

export function createClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createSupabaseClient(url, key);
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
