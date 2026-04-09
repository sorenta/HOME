/**
 * Jest mock for @/lib/supabase/client
 * Used in unit tests to avoid real Supabase connections.
 * Supabase-dependent functions (fetch*, add*) are tested separately via integration tests.
 */
export function getBrowserClient() {
  return null;
}
