export type ThemeId =
  | "forest-sunset"
  | "ocean-depth"
  | "zephyr-soft"
  | "calla-grace"
  | "ember-wood";

export type ThemeManifest = {
  id: ThemeId;
  labelKey: string;
  emoji: string;
  colors: {
    text: string;
    background: string;
    primary: string;
    secondary: string;
    accent: string;
    surface: string;
    surfaceBorder: string;
  };
  fontVars: {
    sans: string;
    display: string;
  };
  ui: {
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
  motion: "organic" | "snappy" | "soft";
};

export const THEMES: Record<ThemeId, ThemeManifest> = {
  "forest-sunset": {
    id: "forest-sunset",
    labelKey: "theme.forest",
    emoji: "🌿",
    colors: {
      text: "#ead68b",
      background: "#2b3101",
      primary: "#d9b504",
      secondary: "#c7ce82",
      accent: "#bf7e04",
      surface: "rgba(217, 181, 4, 0.16)",
      surfaceBorder: "rgba(234, 214, 139, 0.28)",
    },
    fontVars: {
      sans: "var(--font-manrope)",
      display: "var(--font-playfair)",
    },
    ui: {
      backgroundImage:
        "radial-gradient(circle at top, rgba(217, 181, 4, 0.16), transparent 28%), radial-gradient(circle at 82% 12%, rgba(191, 126, 4, 0.16), transparent 20%), linear-gradient(180deg, rgba(90, 72, 5, 0.12), transparent 40%)",
      panelShadow: "0 20px 54px rgba(8, 10, 0, 0.28)",
      panelHighlight: "rgba(250, 232, 171, 0.12)",
      tileShadow: "0 14px 34px rgba(8, 10, 0, 0.22)",
      headerGlow: "rgba(217, 181, 4, 0.2)",
      panelRadius: "26px",
      tileRadius: "22px",
      chipRadius: "18px",
      panelBorderStyle: "1px solid rgba(234, 214, 139, 0.24)",
      tileBorderStyle: "1px solid rgba(234, 214, 139, 0.22)",
    },
    motion: "organic",
  },
  "ocean-depth": {
    id: "ocean-depth",
    labelKey: "theme.ocean",
    emoji: "🌊",
    colors: {
      text: "#E8EEF5",
      background: "#09131F",
      primary: "#78A6D6",
      secondary: "#A9C1DA",
      accent: "#B7D7F2",
      surface: "rgba(120, 166, 214, 0.2)",
      surfaceBorder: "rgba(183, 215, 242, 0.3)",
    },
    fontVars: {
      sans: "var(--font-manrope)",
      display: "var(--font-playfair)",
    },
    ui: {
      backgroundImage:
        "radial-gradient(circle at top, rgba(183, 215, 242, 0.18), transparent 26%), radial-gradient(circle at 78% 10%, rgba(120, 166, 214, 0.18), transparent 22%), linear-gradient(180deg, rgba(16, 40, 58, 0.28), transparent 42%)",
      panelShadow: "0 22px 60px rgba(3, 10, 18, 0.32)",
      panelHighlight: "rgba(232, 238, 245, 0.1)",
      tileShadow: "0 16px 36px rgba(3, 10, 18, 0.24)",
      headerGlow: "rgba(183, 215, 242, 0.2)",
      panelRadius: "18px",
      tileRadius: "14px",
      chipRadius: "14px",
      panelBorderStyle: "1px solid rgba(183, 215, 242, 0.3)",
      tileBorderStyle: "1px solid rgba(120, 166, 214, 0.34)",
    },
    motion: "snappy",
  },
  "zephyr-soft": {
    id: "zephyr-soft",
    labelKey: "theme.zephyr",
    emoji: "☁️",
    colors: {
      text: "#110b0e",
      background: "#faf7f8",
      primary: "#84536c",
      secondary: "#765d67",
      accent: "#b99692",
      surface: "rgba(132, 83, 108, 0.12)",
      surfaceBorder: "rgba(17, 11, 14, 0.14)",
    },
    fontVars: {
      sans: "var(--font-lora)",
      display: "var(--font-playfair)",
    },
    ui: {
      backgroundImage:
        "radial-gradient(circle at top, rgba(185, 150, 146, 0.18), transparent 26%), radial-gradient(circle at 88% 8%, rgba(132, 83, 108, 0.12), transparent 18%), linear-gradient(180deg, rgba(255, 255, 255, 0.58), transparent 38%)",
      panelShadow: "0 18px 42px rgba(77, 49, 61, 0.14)",
      panelHighlight: "rgba(255, 255, 255, 0.62)",
      tileShadow: "0 14px 28px rgba(77, 49, 61, 0.12)",
      headerGlow: "rgba(185, 150, 146, 0.2)",
      panelRadius: "28px",
      tileRadius: "26px",
      chipRadius: "20px",
      panelBorderStyle: "1px solid rgba(255, 255, 255, 0.56)",
      tileBorderStyle: "1px solid rgba(132, 83, 108, 0.14)",
    },
    motion: "soft",
  },
  "calla-grace": {
    id: "calla-grace",
    labelKey: "theme.calla",
    emoji: "🤍",
    colors: {
      text: "#3f2b33",
      background: "#fff9f6",
      primary: "#b87a92",
      secondary: "#7e6470",
      accent: "#8fa86d",
      surface: "rgba(184, 122, 146, 0.12)",
      surfaceBorder: "rgba(63, 43, 51, 0.14)",
    },
    fontVars: {
      sans: "var(--font-lora)",
      display: "var(--font-playfair)",
    },
    ui: {
      backgroundImage:
        "radial-gradient(circle at 14% 12%, rgba(184, 122, 146, 0.16), transparent 22%), radial-gradient(circle at 85% 8%, rgba(143, 168, 109, 0.18), transparent 20%), linear-gradient(180deg, rgba(255, 255, 255, 0.72), transparent 34%)",
      panelShadow: "0 18px 46px rgba(95, 62, 74, 0.14)",
      panelHighlight: "rgba(255, 255, 255, 0.74)",
      tileShadow: "0 14px 30px rgba(95, 62, 74, 0.12)",
      headerGlow: "rgba(184, 122, 146, 0.24)",
      panelRadius: "30px",
      tileRadius: "24px",
      chipRadius: "22px",
      panelBorderStyle: "1px solid rgba(255, 255, 255, 0.68)",
      tileBorderStyle: "1px solid rgba(184, 122, 146, 0.16)",
    },
    motion: "soft",
  },
  "ember-wood": {
    id: "ember-wood",
    labelKey: "theme.ember",
    emoji: "🪵",
    colors: {
      text: "#f6e6d4",
      background: "#3b1f18",
      primary: "#d85b45",
      secondary: "#dfbfa2",
      accent: "#f0ae4b",
      surface: "rgba(216, 91, 69, 0.18)",
      surfaceBorder: "rgba(246, 230, 212, 0.24)",
    },
    fontVars: {
      sans: "var(--font-manrope)",
      display: "var(--font-playfair)",
    },
    ui: {
      backgroundImage:
        "radial-gradient(circle at 14% 12%, rgba(216, 91, 69, 0.24), transparent 22%), radial-gradient(circle at 88% 10%, rgba(240, 174, 75, 0.2), transparent 18%), linear-gradient(180deg, rgba(93, 46, 33, 0.28), transparent 38%)",
      panelShadow: "0 22px 56px rgba(22, 9, 6, 0.32)",
      panelHighlight: "rgba(255, 214, 184, 0.08)",
      tileShadow: "0 16px 36px rgba(22, 9, 6, 0.24)",
      headerGlow: "rgba(216, 91, 69, 0.24)",
      panelRadius: "20px",
      tileRadius: "16px",
      chipRadius: "16px",
      panelBorderStyle: "1px solid rgba(246, 230, 212, 0.2)",
      tileBorderStyle: "1px solid rgba(240, 174, 75, 0.24)",
    },
    motion: "organic",
  },
};

export const DEFAULT_THEME: ThemeId = "forest-sunset";

export function isThemeId(value: string): value is ThemeId {
  return value in THEMES;
}
