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
  type ThemeId,
  isThemeId,
} from "@/lib/theme-logic";

type ThemeContextValue = {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "majapps-theme";

function getInitialThemeId(): ThemeId {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw && isThemeId(raw) ? raw : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
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
    const manifest = THEMES[themeId];
    const root = document.documentElement;
    root.dataset.theme = themeId;
    root.style.setProperty("--color-text", manifest.colors.text);
    root.style.setProperty("--color-background", manifest.colors.background);
    root.style.setProperty("--color-primary", manifest.colors.primary);
    root.style.setProperty("--color-secondary", manifest.colors.secondary);
    root.style.setProperty("--color-accent", manifest.colors.accent);
    root.style.setProperty("--color-surface", manifest.colors.surface);
    root.style.setProperty(
      "--color-surface-border",
      manifest.colors.surfaceBorder,
    );
    root.style.setProperty("--theme-background-image", manifest.ui.backgroundImage);
    root.style.setProperty("--theme-panel-shadow", manifest.ui.panelShadow);
    root.style.setProperty("--theme-panel-highlight", manifest.ui.panelHighlight);
    root.style.setProperty("--theme-tile-shadow", manifest.ui.tileShadow);
    root.style.setProperty("--theme-header-glow", manifest.ui.headerGlow);
    root.style.setProperty("--theme-panel-radius", manifest.ui.panelRadius);
    root.style.setProperty("--theme-tile-radius", manifest.ui.tileRadius);
    root.style.setProperty("--theme-chip-radius", manifest.ui.chipRadius);
    root.style.setProperty("--theme-panel-border", manifest.ui.panelBorderStyle);
    root.style.setProperty("--theme-tile-border", manifest.ui.tileBorderStyle);
    root.style.setProperty("--font-theme-sans", manifest.fontVars.sans);
    root.style.setProperty("--font-theme-display", manifest.fontVars.display);
  }, [themeId]);

  const setThemeId = useCallback((id: ThemeId) => {
    setThemeIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
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
