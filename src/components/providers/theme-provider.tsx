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

type ThemeContextValue = {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
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

  const isDark = m.id === "forge" || m.id === "canopy";
  style.colorScheme = isDark ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setThemeIdState(getInitialThemeId());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    applyThemeManifest(document.documentElement, THEMES[themeId]);
  }, [themeId]);

  const setThemeId = useCallback((id: ThemeId) => {
    setThemeIdState(id);
    try {
      localStorage.setItem(MAJAPPS_THEME_STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ themeId, setThemeId }),
    [themeId, setThemeId],
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
