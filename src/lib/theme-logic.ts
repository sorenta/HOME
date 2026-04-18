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
  /** Custom liquid/organic border shape (e.g. for botanical theme) */
  liquid?: string;
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

export type ThemeMotionConfigV2 = {
  stiffness: number;
  damping: number;
  mass?: number;
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
  motionConfig: ThemeMotionConfigV2;
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
      /* 2026: True OLED black base, chromatic steel-blue tinted darks, precision red */
      background: "#000000",
      backgroundSecondary: "#080A0C",
      surface: "#0C0E10",
      surface2: "#12151A",
      card: "#0F1115",
      cardElevated: "#161A20",
      textPrimary: "#F0F2F5",
      textSecondary: "#B8BDC8",
      textMuted: "#6E7585",
      border: "rgba(240,242,245,0.10)",
      borderStrong: "rgba(240,242,245,0.20)",
      /* Precision engineering red — Pantone 186 C grade */
      accent: "#D91F26",
      accentHover: "#F52530",
      accentSoft: "rgba(217,31,38,0.18)",
      success: "#16DB65",
      warning: "#F5A623",
      danger: "#FF4757",
      info: "#00C2FF",
      buttonPrimary: "#D91F26",
      buttonPrimaryText: "#FFFFFF",
      buttonSecondary: "rgba(240,242,245,0.06)",
      buttonSecondaryText: "#F0F2F5",
      inputBackground: "#0C0E10",
      inputBorder: "rgba(240,242,245,0.14)",
      focusRing: "rgba(217,31,38,0.55)",
      navBackground: "#000000",
      navActive: "#D91F26",
      navInactive: "#4A5060",
      heroGlow:
        "radial-gradient(ellipse 90% 55% at 50% -15%, rgba(217,31,38,0.35), transparent 52%), radial-gradient(ellipse 60% 30% at 80% 100%, rgba(0,194,255,0.08), transparent 50%)",
      panelShadow:
        "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.70), 0 4px 16px rgba(0,0,0,0.60), 0 1px 0 rgba(0,0,0,0.80)",
      authBackground:
        "linear-gradient(165deg, #080A0C 0%, #000000 45%, #080204 100%), radial-gradient(ellipse 90% 60% at 50% 0%, rgba(217,31,38,0.25), transparent 50%)",
      authCard: "#0F1115",
      authBorder: "rgba(240,242,245,0.14)",
    },
    fonts: {
      ui: "var(--font-rajdhani)",
      display: "var(--font-barlow-condensed)",
    },
    radius: {
      card: "8px",
      button: "6px",
      input: "6px",
      nav: "2px",
      chip: "6px",
    },
    spacing: { sectionScale: 0.80, basePx: 4 },
    layoutDensity: "compact",
    motion: "snappy",
    motionConfig: { stiffness: 450, damping: 24, mass: 1 },
    homeScreenLayout: "forge-rail",
    ui: {
      backgroundImage:
        "linear-gradient(180deg, #080A0C 0%, #000000 40%, #050204 100%), radial-gradient(ellipse 130% 50% at 50% -10%, rgba(217,31,38,0.18), transparent 50%), radial-gradient(ellipse 80% 40% at 50% 110%, rgba(217,31,38,0.06), transparent 50%)",
      panelHighlight: "rgba(255,255,255,0.03)",
      tileShadow:
        "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -2px 6px rgba(0,0,0,0.50), 0 2px 0 rgba(0,0,0,0.70)",
      headerGlow: "rgba(217,31,38,0.18)",
      panelBorderStyle: "1px solid rgba(240,242,245,0.09)",
      tileBorderStyle: "1px solid rgba(240,242,245,0.07)",
      bodyOverlayStrength: 0.25,
    },
  },
  botanical: {
    id: "botanical",
    labelKey: "theme.botanical",
    emoji: "🌿",
    colors: {
      /* 2026: Bio-digital Greenhouse — deep forest moss, soft sage, rich earth tones */
      background: "#0D140F",
      backgroundSecondary: "#141D17",
      surface: "rgba(20, 29, 23, 0.85)",
      surface2: "rgba(28, 38, 31, 0.75)",
      card: "rgba(22, 33, 26, 0.90)",
      cardElevated: "rgba(30, 45, 35, 0.95)",
      textPrimary: "#E8F0E9",
      textSecondary: "#A8BDB0",
      textMuted: "#6B8275",
      border: "rgba(168, 189, 176, 0.12)",
      borderStrong: "rgba(168, 189, 176, 0.22)",
      /* Vibrant Sage Green — fresh and modern */
      accent: "#4ADE80",
      accentHover: "#22C55E",
      accentSoft: "rgba(74, 222, 128, 0.15)",
      success: "#16DB65",
      warning: "#FACC15",
      danger: "#F87171",
      info: "#60A5FA",
      buttonPrimary: "#22C55E",
      buttonPrimaryText: "#0D140F",
      buttonSecondary: "rgba(168, 189, 176, 0.08)",
      buttonSecondaryText: "#E8F0E9",
      inputBackground: "rgba(13, 20, 15, 0.6)",
      inputBorder: "rgba(168, 189, 176, 0.18)",
      focusRing: "rgba(74, 222, 128, 0.45)",
      navBackground: "rgba(13, 20, 15, 0.92)",
      navActive: "#4ADE80",
      navInactive: "#6B8275",
      heroGlow:
        "radial-gradient(ellipse 100% 60% at 50% -10%, rgba(34, 197, 94, 0.2), transparent 55%), radial-gradient(circle at 15% 90%, rgba(74, 222, 128, 0.08), transparent 35%)",
      panelShadow: "0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      authBackground:
        "linear-gradient(180deg, #0D140F 0%, #141D17 100%)",
      authCard: "rgba(22, 33, 26, 0.95)",
      authBorder: "rgba(168, 189, 176, 0.15)",
    },
    fonts: {
      ui: "var(--font-manrope)",
      display: "var(--font-fraunces)",
    },
    radius: {
      card: "32px",
      button: "999px",
      input: "16px",
      nav: "32px",
      chip: "24px",
      liquid: "60% 40% 70% 30% / 40% 60% 30% 70%",
    },
    spacing: { sectionScale: 1.02, basePx: 4 },
    layoutDensity: "standard",
    motion: "organic",
    motionConfig: { stiffness: 280, damping: 28, mass: 1 },
    homeScreenLayout: "botanical-shelf",
    ui: {
      backgroundImage:
        "radial-gradient(circle at 10% 10%, rgba(34, 197, 94, 0.05), transparent 30%), radial-gradient(circle at 90% 90%, rgba(74, 222, 128, 0.05), transparent 30%), linear-gradient(180deg, #0D140F 0%, #080C09 100%)",
      panelHighlight: "rgba(255, 255, 255, 0.02)",
      tileShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
      headerGlow: "rgba(34, 197, 94, 0.12)",
      panelBorderStyle: "1px solid rgba(168, 189, 176, 0.1)",
      tileBorderStyle: "1px solid rgba(168, 189, 176, 0.08)",
      bodyOverlayStrength: 0.15,
    },
  },
  pulse: {
    id: "pulse",
    labelKey: "theme.pulse",
    emoji: "◆",
    colors: {
      /* 2026: Neobrutalism 3.0 — electric violet + acid lemon, extreme contrast, zero compromise */
      background: "#FAFAFA",
      backgroundSecondary: "#F0F0E8",
      surface: "#FFFFFF",
      surface2: "#F5F5EE",
      card: "#FFFFFF",
      cardElevated: "#FFFFFF",
      textPrimary: "#050508",
      textSecondary: "#15172A",
      textMuted: "#40435A",
      border: "#050508",
      borderStrong: "#050508",
      /* Ultra-Electric violet */
      accent: "#8B5CF6",
      accentHover: "#7C3AED",
      accentSoft: "rgba(139,92,246,0.18)",
      success: "#10B981",
      /* Acid lemon — maximum energy */
      warning: "#FDE047",
      danger: "#EF4444",
      info: "#0EA5E9",
      buttonPrimary: "#8B5CF6",
      buttonPrimaryText: "#FFFFFF",
      buttonSecondary: "#FFFFFF",
      buttonSecondaryText: "#050508",
      inputBackground: "#FFFFFF",
      inputBorder: "#050508",
      focusRing: "rgba(139,92,246,0.60)",
      navBackground: "#FAFAFA",
      navActive: "#8B5CF6",
      navInactive: "#40435A",
      heroGlow:
        "radial-gradient(ellipse 75% 55% at 15% 5%, rgba(139,92,246,0.30), transparent 50%), radial-gradient(ellipse 70% 45% at 85% 15%, rgba(253,224,71,0.35), transparent 48%)",
      panelShadow: "5px 5px 0 #050508",
      authBackground:
        "linear-gradient(135deg, #FDE047 0%, #FAFAFA 42%, #8B5CF6 100%)",
      authCard: "#FFFFFF",
      authBorder: "#050508",
    },
    fonts: {
      ui: "var(--font-inter)",
      display: "var(--font-space-grotesk)",
    },
    radius: {
      card: "16px",
      button: "12px",
      input: "10px",
      nav: "16px",
      chip: "10px",
    },
    spacing: { sectionScale: 1.05, basePx: 4 },
    layoutDensity: "standard",
    motion: "snappy",
    motionConfig: { stiffness: 520, damping: 32, mass: 1 },
    homeScreenLayout: "pulse-poster",
    ui: {
      backgroundImage:
        "radial-gradient(circle at 10% 18%, rgba(124,58,237,0.08), transparent 26%), radial-gradient(circle at 90% 10%, rgba(234,179,8,0.10), transparent 24%), linear-gradient(180deg, #FAFAFA, #F0F0E8)",
      panelHighlight: "rgba(255,255,255,0.98)",
      tileShadow: "4px 4px 0 #050508",
      headerGlow: "rgba(124,58,237,0.14)",
      panelBorderStyle: "2.5px solid #050508",
      tileBorderStyle: "2.5px solid #050508",
      bodyOverlayStrength: 0.08,
    },
  },
  lucent: {
    id: "lucent",
    labelKey: "theme.lucent",
    emoji: "✧",
    colors: {
      /* 2026: Quiet luxury — champagne alabaster, warm platinum, refined glassmorphism */
      background: "#F8F4EE",
      backgroundSecondary: "#EFE9DE",
      surface: "rgba(255,252,248,0.90)",
      surface2: "rgba(255,252,248,0.76)",
      card: "rgba(255,253,250,0.86)",
      cardElevated: "rgba(255,255,255,0.94)",
      textPrimary: "#3A3028",
      textSecondary: "#5E5448",
      textMuted: "#7E7468",
      border: "rgba(160,140,118,0.22)",
      borderStrong: "rgba(160,140,118,0.36)",
      /* Champagne gold — warm, not brassy */
      accent: "#B8966A",
      accentHover: "#A4834F",
      accentSoft: "rgba(184,150,106,0.16)",
      success: "#2E7D52",
      warning: "#B45309",
      danger: "#C0392B",
      info: "#8B6914",
      buttonPrimary: "#5C5248",
      buttonPrimaryText: "#F8F4EE",
      buttonSecondary: "rgba(255,253,250,0.90)",
      buttonSecondaryText: "#5C5248",
      inputBackground: "rgba(255,253,250,0.94)",
      inputBorder: "rgba(160,140,118,0.28)",
      focusRing: "rgba(92,82,72,0.32)",
      navBackground: "rgba(248,244,238,0.94)",
      navActive: "#5C5248",
      navInactive: "#7E7468",
      heroGlow:
        "radial-gradient(ellipse 110% 65% at 50% -18%, rgba(184,150,106,0.22), transparent 52%), radial-gradient(circle at 90% 85%, rgba(200,180,155,0.12), transparent 32%)",
      panelShadow: "0 28px 64px rgba(92,82,72,0.09), 0 0 0 1px rgba(255,255,255,0.55)",
      authBackground:
        "linear-gradient(180deg, #F8F4EE 0%, #F2EBE0 48%, #EAE0D3 100%)",
      authCard: "rgba(255,253,250,0.92)",
      authBorder: "rgba(160,140,118,0.20)",
    },
    fonts: {
      ui: "var(--font-inter)",
      display: "var(--font-playfair)",
    },
    radius: {
      card: "36px",
      button: "999px",
      input: "16px",
      nav: "28px",
      chip: "24px",
    },
    spacing: { sectionScale: 1.10, basePx: 4 },
    layoutDensity: "airy",
    motion: "soft",
    motionConfig: { stiffness: 140, damping: 22, mass: 1 },
    homeScreenLayout: "lucent-float",
    ui: {
      backgroundImage:
        "radial-gradient(circle at 22% 16%, rgba(220,205,182,0.60), transparent 28%), radial-gradient(circle at 78% 14%, rgba(210,196,172,0.50), transparent 24%), radial-gradient(circle at 50% 98%, rgba(240,232,218,0.70), transparent 35%), linear-gradient(180deg, #F8F4EE 0%, #F2EBE0 48%, #EAE0D3 100%)",
      panelHighlight: "rgba(255,255,255,0.78)",
      tileShadow: "0 18px 38px rgba(92,82,72,0.07)",
      headerGlow: "rgba(184,150,106,0.24)",
      panelBorderStyle: "1px solid rgba(255,255,255,0.58)",
      tileBorderStyle: "1px solid rgba(160,140,118,0.14)",
      bodyOverlayStrength: 0.45,
    },
  },
  hive: {
    id: "hive",
    labelKey: "theme.hive",
    emoji: "🍯",
    colors: {
      /* 2026: Scandinavian wabi-sabi — deep amber richness, raw honey tones, warm cream contrast */
      background: "#FFF6D6",
      backgroundSecondary: "#FFE89A",
      surface: "#FFFDF5",
      surface2: "#FFF8E0",
      card: "#FFFEFB",
      cardElevated: "#FFFFF8",
      textPrimary: "#120D00",
      textSecondary: "#2E2410",
      textMuted: "#5C5030",
      border: "rgba(200,148,0,0.36)",
      borderStrong: "rgba(200,148,0,0.58)",
      /* Deep honey amber — richer than before */
      accent: "#D97706",
      accentHover: "#B45309",
      accentSoft: "rgba(217,119,6,0.18)",
      success: "#15803D",
      warning: "#C2410C",
      danger: "#B91C1C",
      info: "#1D4ED8",
      buttonPrimary: "#D97706",
      buttonPrimaryText: "#FFF6D6",
      buttonSecondary: "#FFFEFB",
      buttonSecondaryText: "#120D00",
      inputBackground: "#FFFEFB",
      inputBorder: "rgba(200,148,0,0.40)",
      focusRing: "rgba(217,119,6,0.52)",
      navBackground: "rgba(255,246,214,0.96)",
      navActive: "#D97706",
      navInactive: "#5C5030",
      heroGlow:
        "radial-gradient(ellipse 95% 60% at 50% -12%, rgba(217,119,6,0.30), transparent 50%), radial-gradient(circle at 20% 90%, rgba(255,200,50,0.10), transparent 30%)",
      panelShadow: "0 22px 50px rgba(100,70,10,0.16)",
      authBackground:
        "linear-gradient(180deg, #FFF5CC 0%, #FFF9E8 45%, #FFF0C0 100%)",
      authCard: "#FFFEFB",
      authBorder: "rgba(200,148,0,0.28)",
    },
    fonts: {
      ui: "var(--font-nunito)",
      display: "var(--font-nunito)",
    },
    radius: {
      card: "16px",
      button: "12px",
      input: "12px",
      nav: "16px",
      chip: "12px",
    },
    spacing: { sectionScale: 1.04, basePx: 4 },
    layoutDensity: "comfortable",
    motion: "soft",
    motionConfig: { stiffness: 380, damping: 30, mass: 1 },
    homeScreenLayout: "hive-cluster",
    ui: {
      backgroundImage:
        "radial-gradient(circle at 14% 18%, rgba(217,119,6,0.13), transparent 30%), radial-gradient(circle at 84% 10%, rgba(255,200,50,0.20), transparent 26%), radial-gradient(circle at 50% 96%, rgba(200,148,0,0.08), transparent 28%), linear-gradient(180deg, #FFF6D6, #FFEDAC)",
      panelHighlight: "rgba(255,255,255,0.88)",
      tileShadow: "0 16px 36px rgba(100,70,10,0.12)",
      headerGlow: "rgba(217,119,6,0.22)",
      panelBorderStyle: "2px solid rgba(200,148,0,0.32)",
      tileBorderStyle: "2px solid rgba(200,148,0,0.26)",
      bodyOverlayStrength: 0.38,
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
    "--color-accent-oklch": legacy.accent.startsWith("#") ? `oklch(from ${legacy.accent} l c h)` : legacy.accent,
    "--color-surface": legacy.surface,
    "--color-surface-border": legacy.surfaceBorder,
    "--glass-bg": c.surface,
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
    "--radius-liquid": r.liquid || r.card,
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

/**
 * Returns Framer Motion transition props tailored to the theme's personality.
 * Also useful for performance throttling based on `motion` mode.
 */
export function transitionForTheme(themeId: ThemeId) {
  const config = THEMES[themeId].motionConfig;
  return { type: "spring" as const, ...config };
}
