"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getBrowserClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  display_name: string | null;
  household_id: string | null;
  role_label: string | null;
  preferred_locale: string;
  theme_id: string;
  reset_score: number;
  birthday_at?: string | null;
  name_day_at?: string | null;
};

export type EnsureProfileResult = {
  profile: Profile | null;
  /** Set when profile row could not be loaded or created; user can retry via refreshProfile. */
  error: string | null;
};

type AuthContextValue = {
  ready: boolean;
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  /** Last profile load failure for the signed-in user; cleared on success or sign-out. */
  profileLoadError: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Dedupe concurrent ensureProfile calls per user id (auth churn + getSession + onAuthStateChange). */
const ensureProfileInFlight = new Map<string, Promise<EnsureProfileResult>>();

function formatProfileError(prefix: string, error: unknown): string {
  const msg =
    error && typeof error === "object" && "message" in error
      ? String((error as { message: string }).message)
      : String(error);
  return `${prefix}: ${msg}`;
}

function profileSeed(user: User) {
  return {
    id: user.id,
    display_name:
      (user.user_metadata.display_name as string | undefined) ??
      (user.user_metadata.name as string | undefined) ??
      user.email?.split("@")[0] ??
      "Member",
    preferred_locale: "lv",
    theme_id: "lucent",
  };
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

async function runEnsureProfile(user: User): Promise<EnsureProfileResult> {
  const supabase = getBrowserClient();
  if (!supabase) {
    return { profile: null, error: null };
  }

  const seed = profileSeed(user);

  const { error: upsertError } = await supabase
    .from("profiles")
    .upsert(seed, { onConflict: "id", ignoreDuplicates: true });

  if (upsertError) {
    return {
      profile: null,
      error: formatProfileError("profiles upsert", upsertError),
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, display_name, household_id, role_label, preferred_locale, theme_id, reset_score, birthday_at, name_day_at",
    )
    .eq("id", user.id)
    .single();

  if (!error) {
    return { profile: data satisfies Profile, error: null };
  }

  const { data: fallbackData, error: fallbackError } = await supabase
    .from("profiles")
    .select(
      "id, display_name, household_id, role_label, preferred_locale, theme_id, reset_score",
    )
    .eq("id", user.id)
    .single();

  if (fallbackError) {
    return {
      profile: null,
      error: formatProfileError("profiles select", fallbackError),
    };
  }

  return {
    profile: {
      ...(fallbackData satisfies Omit<Profile, "birthday_at" | "name_day_at">),
      birthday_at: null,
      name_day_at: null,
    },
    error: null,
  };
}

function ensureProfile(user: User): Promise<EnsureProfileResult> {
  const existing = ensureProfileInFlight.get(user.id);
  if (existing) {
    return existing;
  }

  const p = runEnsureProfile(user).finally(() => {
    ensureProfileInFlight.delete(user.id);
  });
  ensureProfileInFlight.set(user.id, p);
  return p;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(() => getBrowserClient() === null);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoadError, setProfileLoadError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setProfileLoadError(null);
      return;
    }

    setProfileLoadError(null);
    try {
      const result = await ensureProfile(user);
      setProfile(result.profile);
      setProfileLoadError(result.error);
    } catch (error) {
      setProfile(null);
      setProfileLoadError(formatProfileError("profiles refresh", error));
    }
  }, [user]);

  useEffect(() => {
    const supabase = getBrowserClient();
    if (!supabase) {
      return;
    }

    let alive = true;

    const bootstrap = async () => {
      try {
        const currentSession = await withTimeout(
          supabase.auth.getSession().then(({ data }) => data.session),
          8000,
          "auth getSession",
        );

        if (!alive) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          setProfileLoadError(null);
          const result = await ensureProfile(currentSession.user);
          if (!alive) return;
          setProfile(result.profile);
          setProfileLoadError(result.error);
        } else {
          setProfile(null);
        }
      } catch (error) {
        if (!alive) return;
        setSession(null);
        setUser(null);
        setProfile(null);
        setProfileLoadError(formatProfileError("auth bootstrap", error));
      } finally {
        if (alive) {
          setReady(true);
        }
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setProfile(null);
        setProfileLoadError(null);
        return;
      }

      queueMicrotask(async () => {
        setProfileLoadError(null);
        try {
          const result = await ensureProfile(nextSession.user);
          if (alive) {
            setProfile(result.profile);
            setProfileLoadError(result.error);
          }
        } catch (error) {
          if (alive) {
            setProfile(null);
            setProfileLoadError(formatProfileError("auth state change", error));
          }
        }
      });
    });

    void bootstrap();

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getBrowserClient();
    if (!supabase) return;
    setProfileLoadError(null);
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({
      ready,
      user,
      session,
      profile,
      profileLoadError,
      signOut,
      refreshProfile,
    }),
    [ready, user, session, profile, profileLoadError, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthProvider missing");
  return ctx;
}
