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
      background: "#F0ECE1",
      backgroundSecondary: "#E8E4D8",
      surface: "rgba(252,249,242,0.88)",
      surface2: "rgba(252,249,242,0.65)",
      card: "rgba(255,252,246,0.80)",
      cardElevated: "rgba(255,252,246,0.92)",
      textPrimary: "#334229",
      textSecondary: "#687A5A",
      textMuted: "#8C9E7E",
      border: "rgba(90,107,74,0.14)",
      borderStrong: "rgba(90,107,74,0.28)",
      accent: "#5A6B4A",
      accentHover: "#4A5E3D",
      accentSoft: "rgba(90,107,74,0.18)",
      success: "#16A34A",
      warning: "#D97706",
      danger: "#DC2626",
      info: "#2563EB",
      buttonPrimary: "#5A6B4A",
      buttonPrimaryText: "#F0ECE1",
      buttonSecondary: "rgba(255,252,246,0.80)",
      buttonSecondaryText: "#334229",
      inputBackground: "rgba(255,252,246,0.92)",
      inputBorder: "rgba(90,107,74,0.18)",
      focusRing: "rgba(90,107,74,0.40)",
      navBackground: "rgba(240,236,225,0.92)",
      navActive: "#5A6B4A",
      navInactive: "#8C9E7E",
      heroGlow:
        "radial-gradient(ellipse 90% 55% at 50% -5%, rgba(140,158,126,0.22), transparent 55%)",
      panelShadow: "0 24px 56px rgba(51,66,41,0.10), inset 0 1px 0 rgba(255,255,255,0.4)",
      authBackground:
        "linear-gradient(180deg, #F0ECE1 0%, #EBE7DB 50%, #E5E0D4 100%)",
      authCard: "rgba(255,252,246,0.85)",
      authBorder: "rgba(90,107,74,0.12)",
    },
    fonts: {
      ui: "var(--font-manrope)",
      display: "var(--font-fraunces)",
    },
    radius: {
      card: "48px",
      button: "40px",
      input: "24px",
      nav: "36px",
      chip: "28px",
    },
    spacing: { sectionScale: 1.02, basePx: 4 },
    layoutDensity: "comfortable",
    motion: "organic",
    homeScreenLayout: "botanical-shelf",
    ui: {
      backgroundImage:
        "radial-gradient(circle at 22% 16%, rgba(140,158,126,0.18), transparent 32%), radial-gradient(circle at 80% 20%, rgba(200,195,170,0.14), transparent 28%), linear-gradient(180deg, #F0ECE1 0%, #EBE7DB 60%, #E5E0D4 100%)",
      panelHighlight: "rgba(255,252,246,0.65)",
      tileShadow: "0 18px 44px rgba(51,66,41,0.08)",
      headerGlow: "rgba(90,107,74,0.12)",
      panelBorderStyle: "1px solid rgba(90,107,74,0.14)",
      tileBorderStyle: "1px solid rgba(90,107,74,0.12)",
      bodyOverlayStrength: 0.35,
    },
  },
  pulse: {
    id: "pulse",
    labelKey: "theme.pulse",
    emoji: "◆",
    colors: {
      background: "#FFFFFF",
      backgroundSecondary: "#F2F2EA",
      surface: "#FFFFFF",
      surface2: "#F5F5EC",
      card: "#FFFFFF",
      cardElevated: "#FFFFFF",
      textPrimary: "#0A0A0F",
      textSecondary: "#2B2D42",
      textMuted: "#6B6E85",
      border: "#0A0A0F",
      borderStrong: "#0A0A0F",
      accent: "#D946EF",
      accentHover: "#E879F9",
      accentSoft: "rgba(217,70,239,0.15)",
      success: "#4ADE80",
      warning: "#FDE047",
      danger: "#E63946",
      info: "#22D3EE",
      buttonPrimary: "#D946EF",
      buttonPrimaryText: "#FFFFFF",
      buttonSecondary: "#FFFFFF",
      buttonSecondaryText: "#0A0A0F",
      inputBackground: "#FFFFFF",
      inputBorder: "#0A0A0F",
      focusRing: "rgba(217,70,239,0.45)",
      navBackground: "#FFFFFF",
      navActive: "#D946EF",
      navInactive: "#6B6E85",
      heroGlow:
        "radial-gradient(ellipse 70% 45% at 20% 10%, rgba(217,70,239,0.25), transparent 50%), radial-gradient(ellipse 60% 40% at 80% 15%, rgba(34,211,238,0.20), transparent 45%)",
      panelShadow: "6px 6px 0 #0A0A0F",
      authBackground:
        "linear-gradient(135deg, #FDE047 0%, #FFFFFF 40%, #22D3EE 100%)",
      authCard: "#FFFFFF",
      authBorder: "#0A0A0F",
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
        "radial-gradient(circle at 12% 20%, rgba(217,70,239,0.10), transparent 28%), radial-gradient(circle at 88% 12%, rgba(34,211,238,0.08), transparent 25%), linear-gradient(180deg, #FFFFFF, #F5F5EC)",
      panelHighlight: "rgba(255,255,255,0.95)",
      tileShadow: "4px 4px 0 #0A0A0F",
      headerGlow: "rgba(217,70,239,0.15)",
      panelBorderStyle: "3px solid #0A0A0F",
      tileBorderStyle: "3px solid #0A0A0F",
      bodyOverlayStrength: 0.10,
    },
  },
  lucent: {
    id: "lucent",
    labelKey: "theme.lucent",
    emoji: "✧",
    colors: {
      background: "#FAF8F5",
      backgroundSecondary: "#F2EDE6",
      surface: "rgba(255,255,255,0.75)",
      surface2: "rgba(255,255,255,0.55)",
      card: "rgba(255,255,255,0.70)",
      cardElevated: "rgba(255,255,255,0.82)",
      textPrimary: "#6E6458",
      textSecondary: "#9C9588",
      textMuted: "#B5AEA6",
      border: "rgba(180,162,140,0.16)",
      borderStrong: "rgba(180,162,140,0.28)",
      accent: "#C2A882",
      accentHover: "#AE9272",
      accentSoft: "rgba(194,168,130,0.18)",
      success: "#16A34A",
      warning: "#D97706",
      danger: "#E11D48",
      info: "#A16207",
      buttonPrimary: "#6E6458",
      buttonPrimaryText: "#FAF8F5",
      buttonSecondary: "rgba(255,255,255,0.88)",
      buttonSecondaryText: "#6E6458",
      inputBackground: "rgba(255,255,255,0.92)",
      inputBorder: "rgba(180,162,140,0.22)",
      focusRing: "rgba(110,100,88,0.35)",
      navBackground: "rgba(250,248,245,0.92)",
      navActive: "#6E6458",
      navInactive: "#B5AEA6",
      heroGlow:
        "radial-gradient(ellipse 100% 60% at 50% -15%, rgba(194,168,130,0.20), transparent 55%)",
      panelShadow: "0 24px 56px rgba(110,100,88,0.10), 0 0 0 1px rgba(255,255,255,0.5)",
      authBackground:
        "linear-gradient(180deg, #FAF8F5 0%, #F5F0E8 48%, #EDE7DD 100%)",
      authCard: "rgba(255,252,248,0.80)",
      authBorder: "rgba(255,255,255,0.5)",
    },
    fonts: {
      ui: "var(--font-inter)",
      display: "var(--font-playfair)",
    },
    radius: {
      card: "32px",
      button: "999px",
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
        "radial-gradient(circle at 20% 18%, rgba(240,230,216,0.65), transparent 30%), radial-gradient(circle at 80% 15%, rgba(230,222,210,0.55), transparent 26%), radial-gradient(circle at 50% 100%, rgba(255,250,244,0.80), transparent 38%), linear-gradient(180deg, #FAF8F5 0%, #F5F0E8 48%, #EDE7DD 100%)",
      panelHighlight: "rgba(255,255,255,0.75)",
      tileShadow: "0 16px 34px rgba(110,100,88,0.08)",
      headerGlow: "rgba(194,168,130,0.22)",
      panelBorderStyle: "1px solid rgba(255,255,255,0.55)",
      tileBorderStyle: "1px solid rgba(180,162,140,0.15)",
      bodyOverlayStrength: 0.50,
    },
  },
  hive: {
    id: "hive",
    labelKey: "theme.hive",
    emoji: "🍯",
    colors: {
      background: "#FFF9E6",
      backgroundSecondary: "#FFE9A8",
      surface: "#FFFFFF",
      surface2: "#FFF8E7",
      card: "#FFFFFF",
      cardElevated: "#FFFCF3",
      textPrimary: "#1A1200",
      textSecondary: "#4A4030",
      textMuted: "#7A7060",
      border: "rgba(245,184,0,0.30)",
      borderStrong: "rgba(245,184,0,0.55)",
      accent: "#F5B800",
      accentHover: "#E0A800",
      accentSoft: "rgba(245,184,0,0.22)",
      success: "#16A34A",
      warning: "#EA580C",
      danger: "#DC2626",
      info: "#2563EB",
      buttonPrimary: "#FBBF24",
      buttonPrimaryText: "#451A03",
      buttonSecondary: "#FFFFFF",
      buttonSecondaryText: "#1A1200",
      inputBackground: "#FFFFFF",
      inputBorder: "rgba(245,184,0,0.35)",
      focusRing: "rgba(245,184,0,0.55)",
      navBackground: "#FFF9E6",
      navActive: "#F5B800",
      navInactive: "#9A8F7A",
      heroGlow:
        "radial-gradient(ellipse 90% 55% at 50% -10%, rgba(245,184,0,0.28), transparent 50%)",
      panelShadow: "0 20px 44px rgba(120,90,20,0.14)",
      authBackground:
        "linear-gradient(180deg, #FFF8E1 0%, #FFFBF0 45%, #FFF3D6 100%)",
      authCard: "#FFFFFF",
      authBorder: "rgba(245,184,0,0.30)",
    },
    fonts: {
      ui: "var(--font-nunito)",
      display: "var(--font-nunito)",
    },
    radius: {
      card: "14px",
      button: "10px",
      input: "10px",
      nav: "14px",
      chip: "10px",
    },
    spacing: { sectionScale: 1.04, basePx: 4 },
    layoutDensity: "comfortable",
    motion: "soft",
    homeScreenLayout: "hive-cluster",
    ui: {
      backgroundImage:
        "radial-gradient(circle at 15% 20%, rgba(245,184,0,0.12), transparent 32%), radial-gradient(circle at 85% 10%, rgba(255,220,100,0.18), transparent 28%), linear-gradient(180deg, #FFF9E6, #FFF3D0)",
      panelHighlight: "rgba(255,255,255,0.85)",
      tileShadow: "0 14px 32px rgba(120,90,20,0.10)",
      headerGlow: "rgba(245,184,0,0.20)",
      panelBorderStyle: "2px solid rgba(245,184,0,0.35)",
      tileBorderStyle: "2px solid rgba(245,184,0,0.28)",
      bodyOverlayStrength: 0.40,
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

