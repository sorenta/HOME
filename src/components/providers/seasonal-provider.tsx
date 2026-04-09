"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import {
  type SeasonalCollectibleSpot,
  type SeasonalTheme,
  SEASONAL_COLLECTIBLE_SPOTS,
  getActiveSeasonalTheme,
} from "@/lib/seasonal-home";

type SeasonalProgress = {
  collectedSpots: SeasonalCollectibleSpot[];
  rewardSeen: boolean;
};

type SeasonalContextValue = {
  activeTheme: SeasonalTheme | null;
  totalSpots: number;
  collectedCount: number;
  isUnlocked: boolean;
  showReward: boolean;
  hasCollectedSpot: (spot: string) => boolean;
  collectSpot: (spot: string) => void;
  dismissReward: () => void;
};

const SeasonalContext = createContext<SeasonalContextValue | null>(null);

function storageKey(userId: string | null | undefined, theme: SeasonalTheme | null) {
  if (!userId || !theme) return null;
  return `majapps-seasonal-${userId}-${theme.seasonKey}`;
}

function readProgress(key: string | null): SeasonalProgress {
  const fallback: SeasonalProgress = {
    collectedSpots: [],
    rewardSeen: false,
  };

  if (!key || typeof window === "undefined") return fallback;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<SeasonalProgress>;
    return {
      collectedSpots: (parsed.collectedSpots ?? []).filter((spot): spot is SeasonalCollectibleSpot =>
        SEASONAL_COLLECTIBLE_SPOTS.includes(spot as SeasonalCollectibleSpot),
      ),
      rewardSeen: Boolean(parsed.rewardSeen),
    };
  } catch {
    return fallback;
  }
}

function writeProgress(key: string | null, progress: SeasonalProgress) {
  if (!key || typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(progress));
  } catch {
    /* ignore */
  }
}

export function SeasonalProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState<SeasonalProgress>({
    collectedSpots: [],
    rewardSeen: false,
  });
  const activeTheme = useMemo(() => {
    if (!mounted) return null;

    return getActiveSeasonalTheme(new Date(), {
      birthday_at: profile?.birthday_at,
      name_day_at: profile?.name_day_at,
    });
  }, [mounted, profile?.birthday_at, profile?.name_day_at]);
  const key = storageKey(user?.id, activeTheme);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setProgress(readProgress(key));
    });

    return () => cancelAnimationFrame(frame);
  }, [key, pathname]);

  const totalSpots = SEASONAL_COLLECTIBLE_SPOTS.length;
  const collectedCount = progress.collectedSpots.length;
  const isUnlocked = activeTheme !== null && collectedCount >= totalSpots;
  const showReward = isUnlocked && !progress.rewardSeen;

  const hasCollectedSpot = useCallback(
    (spot: string) => progress.collectedSpots.includes(spot as SeasonalCollectibleSpot),
    [progress.collectedSpots],
  );

  const collectSpot = useCallback(
    (spot: string) => {
      if (!activeTheme) return;
      if (!SEASONAL_COLLECTIBLE_SPOTS.includes(spot as SeasonalCollectibleSpot)) return;

      setProgress((current) => {
        if (current.collectedSpots.includes(spot as SeasonalCollectibleSpot)) {
          return current;
        }

        const next: SeasonalProgress = {
          ...current,
          collectedSpots: [
            ...current.collectedSpots,
            spot as SeasonalCollectibleSpot,
          ],
        };

        writeProgress(key, next);
        return next;
      });
    },
    [activeTheme, key],
  );

  const dismissReward = useCallback(() => {
    setProgress((current) => {
      const next = {
        ...current,
        rewardSeen: true,
      };
      writeProgress(key, next);
      return next;
    });
  }, [key]);

  const value = useMemo(
    () => ({
      activeTheme,
      totalSpots,
      collectedCount,
      isUnlocked,
      showReward,
      hasCollectedSpot,
      collectSpot,
      dismissReward,
    }),
    [
      activeTheme,
      totalSpots,
      collectedCount,
      isUnlocked,
      showReward,
      hasCollectedSpot,
      collectSpot,
      dismissReward,
    ],
  );

  return (
    <SeasonalContext.Provider value={value}>{children}</SeasonalContext.Provider>
  );
}

export function useSeasonal() {
  const ctx = useContext(SeasonalContext);
  if (!ctx) throw new Error("SeasonalProvider missing");
  return ctx;
}
