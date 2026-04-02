export type ThemeId = "forge" | "botanical" | "pulse" | "lucent" | "hive";

export type LegacyThemeId =
  | "soft-spa"
  | "forest-sunset"
  | "ocean-depth"
  | "zephyr-soft"
  | "calla-grace"
  | "ember-wood";

export type LayoutDensity = "compact" | "standard" | "comfortable" | "airy";

export type ThemeMotion = "organic" | "snappy" | "soft";

/**
 * Home dashboard structural personality (not just spacing).
 * Drives `data-home-layout` on `<html>` for CSS; components stay grid/flex-safe.
 */
export type HomeScreenLayout =
  | "forge-rail"
  | "botanical-shelf"
  | "pulse-poster"
  | "lucent-float"
  | "hive-cluster";

export type ThemeColorsV2 = {
  background: string;
  backgroundSecondary: string;
  surface: string;
  surface2: string;
  card: string;
  cardElevated: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderStrong: string;
  accent: string;
  accentHover: string;
  accentSoft: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  buttonPrimary: string;
  buttonPrimaryText: string;
  buttonSecondary: string;
  buttonSecondaryText: string;
  inputBackground: string;
  inputBorder: string;
  focusRing: string;
  navBackground: string;
  navActive: string;
  navInactive: string;
  heroGlow: string;
  panelShadow: string;
  authBackground: string;
  authCard: string;
  authBorder: string;
};

export type ThemeFontsV2 = {
  ui: string;
  display: string;
};

export type ThemeRadiusV2 = {
  card: string;
  button: string;
  input: string;
  nav: string;
  chip: string;
};

export type ThemeSpacingV2 = {
  /** Multiplier for section vertical rhythm (1 = baseline). */
  sectionScale: number;
  /** Base spacing unit in px (for derived gaps). */
  basePx: number;
};

export type ThemeUiChromeV2 = {
  backgroundImage: string;
  panelHighlight: string;
  tileShadow: string;
  headerGlow: string;
  panelBorderStyle: string;
  tileBorderStyle: string;
  /** Opacity 0–1 for `body` vignette overlays (dark themes use lower). */
  bodyOverlayStrength: number;
};

export type ThemeManifestV2 = {
  id: ThemeId;
  labelKey: string;
  emoji: string;
  colors: ThemeColorsV2;
  fonts: ThemeFontsV2;
  radius: ThemeRadiusV2;
  spacing: ThemeSpacingV2;
  layoutDensity: LayoutDensity;
  motion: ThemeMotion;
  /** Home (/) screen layout id — CSS adapts grids, shelves, float, poster, cluster. */
  homeScreenLayout: HomeScreenLayout;
  ui: ThemeUiChromeV2;
};

/** Maps persisted legacy `theme_id` / localStorage values to V2 ids. */
export const LEGACY_THEME_MIGRATION: Record<LegacyThemeId, ThemeId> = {
  "soft-spa": "lucent",
  "zephyr-soft": "lucent",
  "calla-grace": "hive",
  "forest-sunset": "botanical",
  "ocean-depth": "pulse",
  "ember-wood": "forge",
};

export const LEGACY_THEME_IDS = Object.keys(LEGACY_THEME_MIGRATION) as LegacyThemeId[];

export function migrateLegacyThemeId(value: string): ThemeId {
  if (isThemeId(value)) return value;
  if (value in LEGACY_THEME_MIGRATION) {
    return LEGACY_THEME_MIGRATION[value as LegacyThemeId];
  }
  return DEFAULT_THEME;
}

export const THEMES: Record<ThemeId, ThemeManifestV2> = {
  forge: {
    id: "forge",
    labelKey: "theme.forge",
    emoji: "⬛",
    colors: {
      background: "#050505",
      backgroundSecondary: "#0A0A0A",
      surface: "#0D0D0D",
      surface2: "#141414",
      card: "#121212",
      cardElevated: "#161616",
      textPrimary: "#F4F4F5",
      textSecondary: "#B0B0B5",
      textMuted: "#6B6E73",
      border: "rgba(255,255,255,0.08)",
      borderStrong: "rgba(255,255,255,0.16)",
      accent: "#E11D2E",
      accentHover: "#FF2E3E",
      accentSoft: "rgba(225,29,46,0.15)",
      success: "#22C55E",
      warning: "#F59E0B",
      danger: "#FB7185",
      info: "#38BDF8",
      buttonPrimary: "#E11D2E",
      buttonPrimaryText: "#FFFFFF",
      buttonSecondary: "transparent",
      buttonSecondaryText: "#F4F4F5",
      inputBackground: "#141414",
      inputBorder: "rgba(255,255,255,0.14)",
      focusRing: "rgba(225,29,46,0.45)",
      navBackground: "#040404",
      navActive: "#E11D2E",
      navInactive: "#6B6E73",
      heroGlow:
        "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(225,29,46,0.28), transparent 55%)",
      /* Plated panels: rim light + weight, not floating glass cards */
      panelShadow:
        "inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.55), 0 2px 0 rgba(0,0,0,0.45)",
      authBackground:
        "linear-gradient(165deg, #0A0A0A 0%, #050505 45%, #080303 100%), radial-gradient(ellipse 90% 60% at 50% 0%, rgba(225,29,46,0.2), transparent 50%)",
      authCard: "#121212",
      authBorder: "rgba(255,255,255,0.12)",
    },
    fonts: {
      /* Rajdhani: engineered UI rhythm; Barlow Condensed: authoritative module / hero titles */
      ui: "var(--font-rajdhani)",
      display: "var(--font-barlow-condensed)",
    },
    radius: {
      card: "10px",
      button: "8px",
      input: "8px",
      nav: "2px",
      chip: "8px",
    },
    spacing: { sectionScale: 0.82, basePx: 4 },
    layoutDensity: "compact",
    motion: "snappy",
    homeScreenLayout: "forge-rail",
    ui: {
      backgroundImage:
        "linear-gradient(180deg, #0B0B0B 0%, #050505 38%, #070303 100%), radial-gradient(ellipse 120% 45% at 50% -8%, rgba(225,29,46,0.14), transparent 52%), radial-gradient(ellipse 90% 35% at 50% 108%, rgba(225,29,46,0.08), transparent 50%)",
      panelHighlight: "rgba(255,255,255,0.035)",
      tileShadow:
        "inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -2px 4px rgba(0,0,0,0.35), 0 1px 0 rgba(0,0,0,0.5)",
      headerGlow: "rgba(225,29,46,0.14)",
      panelBorderStyle: "1px solid rgba(255,255,255,0.1)",
      tileBorderStyle: "1px solid rgba(255,255,255,0.09)",
      bodyOverlayStrength: 0.3,
    },
  },
  botanical: {
    id: "botanical",
    labelKey: "theme.botanical",
    emoji: "🌿",
    colors: {
      background: "#0C1210",
      backgroundSecondary: "#152018",
      surface: "#121A16",
      surface2: "#18241E",
      card: "#142018",
      cardElevated: "#1A2620",
      textPrimary: "#E8F0EC",
      textSecondary: "#A8B5AE",
      textMuted: "#6F7A74",
      border: "rgba(255,255,255,0.10)",
      borderStrong: "rgba(255,255,255,0.20)",
      accent: "#2EE6A8",
      accentHover: "#26D198",
      accentSoft: "rgba(46,230,168,0.15)",
      success: "#34D399",
      warning: "#FBBF24",
      danger: "#F87171",
      info: "#22D3EE",
      buttonPrimary: "#2EE6A8",
      buttonPrimaryText: "#041208",
      buttonSecondary: "rgba(255,255,255,0.06)",
      buttonSecondaryText: "#E8F0EC",
      inputBackground: "rgba(21,32,26,0.92)",
      inputBorder: "rgba(255,255,255,0.14)",
      focusRing: "rgba(46,230,168,0.40)",
      navBackground: "rgba(12,18,16,0.92)",
      navActive: "#2EE6A8",
      navInactive: "#6F7A74",
      heroGlow:
        "radial-gradient(ellipse 90% 55% at 50% -5%, rgba(46,230,168,0.22), transparent 55%)",
      panelShadow: "0 24px 56px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.06)",
      authBackground:
        "linear-gradient(180deg, #152018 0%, #0C1210 50%, #0E1612 100%), radial-gradient(ellipse 100% 70% at 50% 0%, rgba(46,230,168,0.15), transparent 45%)",
      authCard: "rgba(20,32,26,0.88)",
      authBorder: "rgba(255,255,255,0.14)",
    },
    fonts: {
      ui: "var(--font-manrope)",
      display: "var(--font-fraunces)",
    },
    radius: {
      card: "22px",
      button: "14px",
      input: "14px",
      nav: "20px",
      chip: "18px",
    },
    spacing: { sectionScale: 1.02, basePx: 4 },
    layoutDensity: "comfortable",
    motion: "organic",
    homeScreenLayout: "botanical-shelf",
    ui: {
      backgroundImage:
        "radial-gradient(circle at 20% 15%, rgba(46,230,168,0.08), transparent 35%), radial-gradient(circle at 85% 20%, rgba(34,211,238,0.06), transparent 30%), linear-gradient(180deg, rgba(21,32,26,0.5), transparent 50%)",
      panelHighlight: "rgba(255,255,255,0.06)",
      tileShadow: "0 18px 44px rgba(0,0,0,0.38)",
      headerGlow: "rgba(46,230,168,0.14)",
      panelBorderStyle: "1px solid rgba(255,255,255,0.10)",
      tileBorderStyle: "1px solid rgba(46,230,168,0.12)",
      bodyOverlayStrength: 0.4,
    },
  },
  pulse: {
    id: "pulse",
    labelKey: "theme.pulse",
    emoji: "◆",
    colors: {
      background: "#F2F2EA",
      backgroundSecondary: "#DCDCD2",
      surface: "#FFFFFF",
      surface2: "#E8E8E0",
      card: "#FFFFFF",
      cardElevated: "#FFFFFF",
      textPrimary: "#1E2035",
      textSecondary: "#383B52",
      textMuted: "#6B6E85",
      border: "#2B2D42",
      borderStrong: "#2B2D42",
      accent: "#FF6B6B",
      accentHover: "#FF8585",
      accentSoft: "rgba(255,107,107,0.2)",
      success: "#2ECC71",
      warning: "#FFE66D",
      danger: "#E63946",
      info: "#4ECDC4",
      buttonPrimary: "#2B2D42",
      buttonPrimaryText: "#FFFFFF",
      buttonSecondary: "#FFFFFF",
      buttonSecondaryText: "#2B2D42",
      inputBackground: "#FFFFFF",
      inputBorder: "#2B2D42",
      focusRing: "rgba(43,45,66,0.35)",
      navBackground: "#FFFFFF",
      navActive: "#2B2D42",
      navInactive: "#7A7C8F",
      heroGlow:
        "radial-gradient(ellipse 70% 45% at 20% 10%, rgba(255,107,107,0.25), transparent 50%), radial-gradient(ellipse 60% 40% at 80% 15%, rgba(78,205,196,0.2), transparent 45%)",
      panelShadow: "6px 6px 0 #2B2D42",
      authBackground:
        "linear-gradient(135deg, #FFE66D 0%, #F7F7F2 40%, #4ECDC4 100%)",
      authCard: "#FFFFFF",
      authBorder: "#2B2D42",
    },
    fonts: {
      ui: "var(--font-inter)",
      display: "var(--font-space-grotesk)",
    },
    radius: {
      card: "18px",
      button: "14px",
      input: "12px",
      nav: "18px",
      chip: "12px",
    },
    spacing: { sectionScale: 1.05, basePx: 4 },
    layoutDensity: "standard",
    motion: "snappy",
    homeScreenLayout: "pulse-poster",
    ui: {
      backgroundImage:
        "radial-gradient(circle at 12% 20%, rgba(255,107,107,0.14), transparent 28%), radial-gradient(circle at 88% 12%, rgba(78,205,196,0.12), transparent 25%), linear-gradient(180deg, #F2F2EA, #DCDCD2)",
      panelHighlight: "rgba(255,255,255,0.9)",
      tileShadow: "4px 4px 0 #2B2D42",
      headerGlow: "rgba(255,107,107,0.15)",
      panelBorderStyle: "2px solid #2B2D42",
      tileBorderStyle: "2px solid #2B2D42",
      bodyOverlayStrength: 0.15,
    },
  },
  lucent: {
    id: "lucent",
    labelKey: "theme.lucent",
    emoji: "✧",
    colors: {
      background: "#F4F0F6",
      backgroundSecondary: "#EDE8F0",
      surface: "rgba(255,255,255,0.72)",
      surface2: "rgba(255,255,255,0.55)",
      card: "rgba(255,255,255,0.65)",
      cardElevated: "rgba(255,255,255,0.78)",
      textPrimary: "#2A2430",
      textSecondary: "#5C5466",
      textMuted: "#8A8294",
      border: "rgba(90,70,100,0.12)",
      borderStrong: "rgba(90,70,100,0.22)",
      accent: "#B87A9A",
      accentHover: "#A56688",
      accentSoft: "rgba(184,122,154,0.18)",
      success: "#16A34A",
      warning: "#D97706",
      danger: "#E11D48",
      info: "#7C3AED",
      buttonPrimary: "#B87A9A",
      buttonPrimaryText: "#FFFFFF",
      buttonSecondary: "rgba(255,255,255,0.85)",
      buttonSecondaryText: "#5C5466",
      inputBackground: "rgba(255,255,255,0.9)",
      inputBorder: "rgba(90,70,100,0.18)",
      focusRing: "rgba(184,122,154,0.45)",
      navBackground: "rgba(255,255,255,0.82)",
      navActive: "#B87A9A",
      navInactive: "#8A8294",
      heroGlow:
        "radial-gradient(ellipse 100% 60% at 50% -15%, rgba(184,122,154,0.2), transparent 55%)",
      panelShadow: "0 24px 56px rgba(77,49,61,0.1), 0 0 0 1px rgba(255,255,255,0.5)",
      authBackground:
        "radial-gradient(circle at 18% 18%, rgba(255,228,235,0.85), transparent 32%), radial-gradient(circle at 82% 14%, rgba(233,228,245,0.75), transparent 28%), linear-gradient(180deg, #F8F2F8 0%, #F4F0F6 48%, #EFE8F0 100%)",
      authCard: "rgba(255,248,252,0.75)",
      authBorder: "rgba(255,255,255,0.5)",
    },
    fonts: {
      ui: "var(--font-inter)",
      display: "var(--font-playfair)",
    },
    radius: {
      card: "28px",
      button: "16px",
      input: "14px",
      nav: "24px",
      chip: "22px",
    },
    spacing: { sectionScale: 1.08, basePx: 4 },
    layoutDensity: "airy",
    motion: "soft",
    homeScreenLayout: "lucent-float",
    ui: {
      backgroundImage:
        "radial-gradient(circle at 18% 18%, rgba(255,228,235,0.72), transparent 28%), radial-gradient(circle at 82% 16%, rgba(233,228,245,0.68), transparent 26%), radial-gradient(circle at 50% 100%, rgba(255,247,251,0.86), transparent 38%), linear-gradient(180deg, #F8F4F8 0%, #F4F0F6 48%, #EFE8F0 100%)",
      panelHighlight: "rgba(255,255,255,0.72)",
      tileShadow: "0 16px 34px rgba(77,49,61,0.08)",
      headerGlow: "rgba(184,122,154,0.22)",
      panelBorderStyle: "1px solid rgba(255,255,255,0.5)",
      tileBorderStyle: "1px solid rgba(154,124,134,0.14)",
      bodyOverlayStrength: 0.55,
    },
  },
  hive: {
    id: "hive",
    labelKey: "theme.hive",
    emoji: "🍯",
    colors: {
      background: "#FFF8E5",
      backgroundSecondary: "#FFE9A8",
      surface: "#FFFFFF",
      surface2: "#FFF8E7",
      card: "#FFFFFF",
      cardElevated: "#FFFCF3",
      textPrimary: "#1A1A1A",
      textSecondary: "#4A4540",
      textMuted: "#7A7268",
      border: "rgba(26,26,26,0.08)",
      borderStrong: "rgba(26,26,26,0.16)",
      accent: "#F5B800",
      accentHover: "#E0A800",
      accentSoft: "rgba(245,184,0,0.22)",
      success: "#16A34A",
      warning: "#EA580C",
      danger: "#DC2626",
      info: "#2563EB",
      buttonPrimary: "#1A1A1A",
      buttonPrimaryText: "#FFFFFF",
      buttonSecondary: "#FFFFFF",
      buttonSecondaryText: "#1A1A1A",
      inputBackground: "#FFFFFF",
      inputBorder: "rgba(26,26,26,0.12)",
      focusRing: "rgba(245,184,0,0.5)",
      navBackground: "#FFF8E7",
      navActive: "#F5B800",
      navInactive: "#9A8F7A",
      heroGlow:
        "radial-gradient(ellipse 90% 55% at 50% -10%, rgba(245,184,0,0.28), transparent 50%)",
      panelShadow: "0 20px 44px rgba(120,90,40,0.12)",
      authBackground:
        "linear-gradient(180deg, #FFF8E1 0%, #FFFBF0 45%, #FFF3D6 100%)",
      authCard: "#FFFFFF",
      authBorder: "rgba(26,26,26,0.08)",
    },
    fonts: {
      ui: "var(--font-nunito)",
      display: "var(--font-nunito)",
    },
    radius: {
      card: "24px",
      button: "999px",
      input: "16px",
      nav: "22px",
      chip: "20px",
    },
    spacing: { sectionScale: 1.04, basePx: 4 },
    layoutDensity: "comfortable",
    motion: "soft",
    homeScreenLayout: "hive-cluster",
    ui: {
      backgroundImage:
        "radial-gradient(circle at 15% 20%, rgba(245,184,0,0.12), transparent 32%), radial-gradient(circle at 85% 10%, rgba(255,220,150,0.2), transparent 28%), linear-gradient(180deg, #FFFBF0, #FFF3D6)",
      panelHighlight: "rgba(255,255,255,0.85)",
      tileShadow: "0 14px 32px rgba(120,90,40,0.1)",
      headerGlow: "rgba(245,184,0,0.2)",
      panelBorderStyle: "1px solid rgba(26,26,26,0.08)",
      tileBorderStyle: "1px solid rgba(245,184,0,0.25)",
      bodyOverlayStrength: 0.45,
    },
  },
};

export const DEFAULT_THEME: ThemeId = "lucent";

export function isThemeId(value: string): value is ThemeId {
  return value in THEMES;
}

/** Interim bridge: existing components use legacy 7-color + ui radii. */
export type LegacyThemeColors = {
  text: string;
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  surfaceBorder: string;
};

export function getLegacyThemeColors(m: ThemeManifestV2): LegacyThemeColors {
  return {
    text: m.colors.textPrimary,
    background: m.colors.background,
    primary: m.colors.buttonPrimary,
    secondary: m.colors.textSecondary,
    accent: m.colors.accent,
    surface: m.colors.surface,
    surfaceBorder: m.colors.border,
  };
}

export type LegacyThemeUi = {
  backgroundImage: string;
  panelShadow: string;
  panelHighlight: string;
  tileShadow: string;
  headerGlow: string;
  panelRadius: string;
  tileRadius: string;
  chipRadius: string;
  panelBorderStyle: string;
  tileBorderStyle: string;
};

export function getLegacyThemeUi(m: ThemeManifestV2): LegacyThemeUi {
  return {
    backgroundImage: m.ui.backgroundImage,
    panelShadow: m.colors.panelShadow,
    panelHighlight: m.ui.panelHighlight,
    tileShadow: m.ui.tileShadow,
    headerGlow: m.ui.headerGlow,
    panelRadius: m.radius.card,
    tileRadius: m.radius.card,
    chipRadius: m.radius.chip,
    panelBorderStyle: m.ui.panelBorderStyle,
    tileBorderStyle: m.ui.tileBorderStyle,
  };
}

export type LegacyFontVars = { sans: string; display: string };

export function getLegacyFontVars(m: ThemeManifestV2): LegacyFontVars {
  return { sans: m.fonts.ui, display: m.fonts.display };
}

/**
 * All theme CSS custom properties for `document.documentElement` / `<html style>`.
 * Used by ThemeProvider (client) and RootLayout (SSR) so tokens exist before hydration.
 */
export function buildRootThemeCssVars(m: ThemeManifestV2): Record<string, string> {
  const c = m.colors;
  const r = m.radius;
  const s = m.spacing;
  const legacy = getLegacyThemeColors(m);
  const legacyUi = getLegacyThemeUi(m);
  const fonts = getLegacyFontVars(m);
  const scale = s.sectionScale;
  const strength = m.ui.bodyOverlayStrength;

  const out: Record<string, string> = {
    "--color-text": legacy.text,
    "--color-background": legacy.background,
    "--color-primary": legacy.primary,
    "--color-secondary": legacy.secondary,
    "--color-accent": legacy.accent,
    "--color-surface": legacy.surface,
    "--color-surface-border": legacy.surfaceBorder,
    "--color-background-secondary": c.backgroundSecondary,
    "--color-surface-2": c.surface2,
    "--color-card": c.card,
    "--color-card-elevated": c.cardElevated,
    "--color-text-primary": c.textPrimary,
    "--color-text-secondary": c.textSecondary,
    "--color-text-muted": c.textMuted,
    "--color-border": c.border,
    "--color-border-strong": c.borderStrong,
    "--color-accent-hover": c.accentHover,
    "--color-accent-soft": c.accentSoft,
    "--color-success": c.success,
    "--color-warning": c.warning,
    "--color-danger": c.danger,
    "--color-info": c.info,
    "--color-button-primary": c.buttonPrimary,
    "--color-button-primary-text": c.buttonPrimaryText,
    "--color-button-secondary": c.buttonSecondary,
    "--color-button-secondary-text": c.buttonSecondaryText,
    "--color-input-background": c.inputBackground,
    "--color-input-border": c.inputBorder,
    "--color-focus-ring": c.focusRing,
    "--color-nav-background": c.navBackground,
    "--color-nav-active": c.navActive,
    "--color-nav-inactive": c.navInactive,
    "--color-auth-background": c.authBackground,
    "--color-auth-card": c.authCard,
    "--color-auth-border": c.authBorder,
    "--effect-hero-glow": c.heroGlow,
    "--shadow-panel": c.panelShadow,
    "--font-theme-sans": fonts.sans,
    "--font-theme-display": fonts.display,
    "--font-ui": m.fonts.ui,
    "--font-display": m.fonts.display,
    "--radius-card": r.card,
    "--radius-button": r.button,
    "--radius-input": r.input,
    "--radius-nav": r.nav,
    "--radius-chip": r.chip,
    "--spacing-section-scale": String(s.sectionScale),
    "--spacing-base-px": `${s.basePx}px`,
    "--maj-space-page-x": `${Math.round(16 * scale)}px`,
    "--maj-space-section-y": `${Math.round(16 * scale)}px`,
    "--maj-space-bento-gap": `${Math.round(12 * scale)}px`,
    "--maj-space-card-pad": `${Math.round(16 * scale)}px`,
    "--maj-space-stack": `${Math.round(12 * scale)}px`,
    "--maj-page-padding-top": `${Math.round(72 * scale)}px`,
    "--maj-page-padding-bottom": `${Math.round(112 * scale)}px`,
    "--layout-density": m.layoutDensity,
    "--theme-motion": m.motion,
    "--theme-background-image": legacyUi.backgroundImage,
    "--theme-panel-shadow": legacyUi.panelShadow,
    "--theme-panel-highlight": legacyUi.panelHighlight,
    "--theme-tile-shadow": legacyUi.tileShadow,
    "--theme-header-glow": legacyUi.headerGlow,
    "--theme-panel-radius": legacyUi.panelRadius,
    "--theme-tile-radius": legacyUi.tileRadius,
    "--theme-chip-radius": legacyUi.chipRadius,
    "--theme-panel-border": legacyUi.panelBorderStyle,
    "--theme-tile-border": legacyUi.tileBorderStyle,
    "--theme-body-overlay-strength": String(m.ui.bodyOverlayStrength),
    "--body-overlay-before-opacity": String(0.9 * strength),
    "--body-overlay-after-opacity": String(0.65 * strength),
    "--theme-id": m.id,
    "--panel-shadow": c.panelShadow,
  };

  return out;
}

