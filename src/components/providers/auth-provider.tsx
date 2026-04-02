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

type AuthContextValue = {
  ready: boolean;
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function profileSeed(user: User) {
  return {
    id: user.id,
    display_name:
      (user.user_metadata.display_name as string | undefined) ??
      (user.user_metadata.name as string | undefined) ??
      user.email?.split("@")[0] ??
      "Member",
    preferred_locale: "lv",
    theme_id: "soft-spa",
  };
}

async function ensureProfile(user: User): Promise<Profile | null> {
  const supabase = getBrowserClient();
  if (!supabase) return null;

  const seed = profileSeed(user);

  const { error: upsertError } = await supabase
    .from("profiles")
    .upsert(seed, { onConflict: "id", ignoreDuplicates: true });

  if (upsertError) {
    console.error("Failed to ensure profile", upsertError);
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, display_name, household_id, role_label, preferred_locale, theme_id, reset_score, birthday_at, name_day_at",
    )
    .eq("id", user.id)
    .single();

  if (!error) {
    return data satisfies Profile;
  }

  const { data: fallbackData, error: fallbackError } = await supabase
    .from("profiles")
    .select(
      "id, display_name, household_id, role_label, preferred_locale, theme_id, reset_score",
    )
    .eq("id", user.id)
    .single();

  if (fallbackError) {
    console.error("Failed to ensure profile", fallbackError);
    return null;
  }

  return {
    ...(fallbackData satisfies Omit<Profile, "birthday_at" | "name_day_at">),
    birthday_at: null,
    name_day_at: null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(() => getBrowserClient() === null);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    const nextProfile = await ensureProfile(user);
    setProfile(nextProfile);
  }, [user]);

  useEffect(() => {
    const supabase = getBrowserClient();
    if (!supabase) {
      return;
    }

    let alive = true;

    const bootstrap = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!alive) return;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const nextProfile = await ensureProfile(currentSession.user);
        if (!alive) return;
        setProfile(nextProfile);
      }

      if (alive) {
        setReady(true);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setProfile(null);
        return;
      }

      queueMicrotask(async () => {
        const nextProfile = await ensureProfile(nextSession.user);
        if (alive) {
          setProfile(nextProfile);
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
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({ ready, user, session, profile, signOut, refreshProfile }),
    [ready, user, session, profile, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthProvider missing");
  return ctx;
}
