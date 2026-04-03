"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_THEME,
  THEMES,
  buildRootThemeCssVars,
  migrateLegacyThemeId,
  type HomeScreenLayout,
  type ThemeId,
  type ThemeManifestV2,
} from "@/lib/theme-logic";
import { getActiveSeasonalTheme, type SeasonalTheme } from "@/lib/seasonal-home";

type ThemeContextValue = {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  /** True when a peak holiday overrides the user's theme choice. */
  seasonalLocked: boolean;
  /** Active seasonal theme (any phase), or null. */
  activeSeason: SeasonalTheme | null;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Persisted device theme; used by ThemeProfileSync to decide if DB theme may override. */
export const MAJAPPS_THEME_STORAGE_KEY = "majapps-theme";

function getInitialThemeId(): ThemeId {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const raw = localStorage.getItem(MAJAPPS_THEME_STORAGE_KEY);
    if (!raw) return DEFAULT_THEME;
    const resolved = migrateLegacyThemeId(raw);
    if (resolved !== raw) {
      localStorage.setItem(MAJAPPS_THEME_STORAGE_KEY, resolved);
    }
    return resolved;
  } catch {
    return DEFAULT_THEME;
  }
}

/**
 * Applies ThemeManifestV2 to the document root: semantic tokens, legacy aliases,
 * typography/radius/spacing, chrome vars, and `data-theme` / `data-layout-density` / `data-theme-motion` / `data-home-layout`.
 */
function applyThemeManifest(root: HTMLElement, m: ThemeManifestV2): void {
  const { style } = root;
  const vars = buildRootThemeCssVars(m);
  for (const [key, value] of Object.entries(vars)) {
    style.setProperty(key, value);
  }

  root.dataset.theme = m.id;
  root.dataset.layoutDensity = m.layoutDensity;
  root.dataset.themeMotion = m.motion;
  root.dataset.homeLayout = m.homeScreenLayout;

  const isDark = m.id === "forge";
  style.colorScheme = isDark ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(DEFAULT_THEME);
  const [activeSeason, setActiveSeason] = useState<SeasonalTheme | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setThemeIdState(getInitialThemeId());
      setActiveSeason(getActiveSeasonalTheme(new Date()));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const seasonalLocked = activeSeason?.phase === "peak";

  useEffect(() => {
    applyThemeManifest(document.documentElement, THEMES[themeId]);
    // Apply seasonal CSS hook on <html>
    if (activeSeason) {
      document.documentElement.dataset.season = activeSeason.id;
      document.documentElement.dataset.seasonPhase = activeSeason.phase;
    } else {
      delete document.documentElement.dataset.season;
      delete document.documentElement.dataset.seasonPhase;
    }
  }, [themeId, activeSeason]);

  const setThemeId = useCallback((id: ThemeId) => {
    // During peak holiday, block theme changes
    if (activeSeason?.phase === "peak") return;
    setThemeIdState(id);
    try {
      localStorage.setItem(MAJAPPS_THEME_STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, [activeSeason]);

  const value = useMemo(
    () => ({ themeId, setThemeId, seasonalLocked, activeSeason }),
    [themeId, setThemeId, seasonalLocked, activeSeason],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("ThemeProvider missing");
  return ctx;
}

/** Home dashboard layout id from the active theme (matches `html[data-home-layout]`). */
export function useHomeScreenLayout(): HomeScreenLayout {
  const { themeId } = useTheme();
  return THEMES[themeId].homeScreenLayout;
}
