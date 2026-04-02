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
  getLegacyFontVars,
  getLegacyThemeColors,
  getLegacyThemeUi,
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

const STORAGE_KEY = "majapps-theme";

function getInitialThemeId(): ThemeId {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_THEME;
    const resolved = migrateLegacyThemeId(raw);
    if (resolved !== raw) {
      localStorage.setItem(STORAGE_KEY, resolved);
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
  const c = m.colors;
  const r = m.radius;
  const s = m.spacing;
  const legacy = getLegacyThemeColors(m);
  const legacyUi = getLegacyThemeUi(m);
  const fonts = getLegacyFontVars(m);

  root.dataset.theme = m.id;
  root.dataset.layoutDensity = m.layoutDensity;
  root.dataset.themeMotion = m.motion;
  root.dataset.homeLayout = m.homeScreenLayout;

  const isDark = m.id === "forge" || m.id === "canopy";
  style.colorScheme = isDark ? "dark" : "light";

  /* Legacy migration aliases (pre–ThemeManifestV2 components) */
  style.setProperty("--color-text", legacy.text);
  style.setProperty("--color-background", legacy.background);
  style.setProperty("--color-primary", legacy.primary);
  style.setProperty("--color-secondary", legacy.secondary);
  style.setProperty("--color-accent", legacy.accent);
  style.setProperty("--color-surface", legacy.surface);
  style.setProperty("--color-surface-border", legacy.surfaceBorder);

  /* Semantic palette */
  style.setProperty("--color-background-secondary", c.backgroundSecondary);
  style.setProperty("--color-surface-2", c.surface2);
  style.setProperty("--color-card", c.card);
  style.setProperty("--color-card-elevated", c.cardElevated);
  style.setProperty("--color-text-primary", c.textPrimary);
  style.setProperty("--color-text-secondary", c.textSecondary);
  style.setProperty("--color-text-muted", c.textMuted);
  style.setProperty("--color-border", c.border);
  style.setProperty("--color-border-strong", c.borderStrong);
  style.setProperty("--color-accent-hover", c.accentHover);
  style.setProperty("--color-accent-soft", c.accentSoft);
  style.setProperty("--color-success", c.success);
  style.setProperty("--color-warning", c.warning);
  style.setProperty("--color-danger", c.danger);
  style.setProperty("--color-info", c.info);
  style.setProperty("--color-button-primary", c.buttonPrimary);
  style.setProperty("--color-button-primary-text", c.buttonPrimaryText);
  style.setProperty("--color-button-secondary", c.buttonSecondary);
  style.setProperty("--color-button-secondary-text", c.buttonSecondaryText);
  style.setProperty("--color-input-background", c.inputBackground);
  style.setProperty("--color-input-border", c.inputBorder);
  style.setProperty("--color-focus-ring", c.focusRing);
  style.setProperty("--color-nav-background", c.navBackground);
  style.setProperty("--color-nav-active", c.navActive);
  style.setProperty("--color-nav-inactive", c.navInactive);
  style.setProperty("--color-auth-background", c.authBackground);
  style.setProperty("--color-auth-card", c.authCard);
  style.setProperty("--color-auth-border", c.authBorder);

  /* Effects / elevation */
  style.setProperty("--effect-hero-glow", c.heroGlow);
  style.setProperty("--shadow-panel", c.panelShadow);

  /* Typography tokens */
  style.setProperty("--font-theme-sans", fonts.sans);
  style.setProperty("--font-theme-display", fonts.display);
  style.setProperty("--font-ui", m.fonts.ui);
  style.setProperty("--font-display", m.fonts.display);

  /* Radius & spacing */
  style.setProperty("--radius-card", r.card);
  style.setProperty("--radius-button", r.button);
  style.setProperty("--radius-input", r.input);
  style.setProperty("--radius-nav", r.nav);
  style.setProperty("--radius-chip", r.chip);
  style.setProperty("--spacing-section-scale", String(s.sectionScale));
  style.setProperty("--spacing-base-px", `${s.basePx}px`);
  const scale = s.sectionScale;
  style.setProperty("--maj-space-page-x", `${Math.round(16 * scale)}px`);
  style.setProperty("--maj-space-section-y", `${Math.round(16 * scale)}px`);
  style.setProperty("--maj-space-bento-gap", `${Math.round(12 * scale)}px`);
  style.setProperty("--maj-space-card-pad", `${Math.round(16 * scale)}px`);
  style.setProperty("--maj-space-stack", `${Math.round(12 * scale)}px`);
  style.setProperty(
    "--maj-page-padding-top",
    `${Math.round(72 * scale)}px`,
  );
  style.setProperty(
    "--maj-page-padding-bottom",
    `${Math.round(112 * scale)}px`,
  );
  style.setProperty("--layout-density", m.layoutDensity);
  style.setProperty("--theme-motion", m.motion);

  /* App chrome (globals.css, glass / bento) */
  style.setProperty("--theme-background-image", legacyUi.backgroundImage);
  style.setProperty("--theme-panel-shadow", legacyUi.panelShadow);
  style.setProperty("--theme-panel-highlight", legacyUi.panelHighlight);
  style.setProperty("--theme-tile-shadow", legacyUi.tileShadow);
  style.setProperty("--theme-header-glow", legacyUi.headerGlow);
  style.setProperty("--theme-panel-radius", legacyUi.panelRadius);
  style.setProperty("--theme-tile-radius", legacyUi.tileRadius);
  style.setProperty("--theme-chip-radius", legacyUi.chipRadius);
  style.setProperty("--theme-panel-border", legacyUi.panelBorderStyle);
  style.setProperty("--theme-tile-border", legacyUi.tileBorderStyle);
  style.setProperty(
    "--theme-body-overlay-strength",
    String(m.ui.bodyOverlayStrength),
  );
  const strength = m.ui.bodyOverlayStrength;
  style.setProperty(
    "--body-overlay-before-opacity",
    String(0.9 * strength),
  );
  style.setProperty(
    "--body-overlay-after-opacity",
    String(0.65 * strength),
  );

  /* Aliases: same value, alternate names used during migration */
  style.setProperty("--theme-id", m.id);
  style.setProperty("--panel-shadow", c.panelShadow);
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

/** Home dashboard layout id from the active theme (matches `html[data-home-layout]`). */
export function useHomeScreenLayout(): HomeScreenLayout {
  const { themeId } = useTheme();
  return THEMES[themeId].homeScreenLayout;
}
