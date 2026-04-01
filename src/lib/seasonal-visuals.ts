import type { SeasonalTheme, SeasonalThemeId } from "@/lib/seasonal-home";

export type SeasonalSpriteKind =
  | "egg"
  | "bunny"
  | "chick"
  | "catkin"
  | "heart"
  | "letter"
  | "flower"
  | "star"
  | "ornament"
  | "leaf"
  | "wreath"
  | "flag"
  | "ribbon"
  | "crest"
  | "ember"
  | "balloon"
  | "spark";

export type SeasonalVisualItem = {
  kind: SeasonalSpriteKind;
  x: number;
  y: number;
  size: number;
  driftX: number;
  driftY: number;
  rotate: number;
  duration: number;
  delay: number;
};

type CollectibleSprite = {
  kind: SeasonalSpriteKind;
  label: string;
};

const VISUALS_BY_THEME: Record<SeasonalThemeId, SeasonalVisualItem[]> = {
  easter: [
    { kind: "chick", x: 8, y: 18, size: 30, driftX: 10, driftY: 8, rotate: 8, duration: 6.4, delay: 0.1 },
    { kind: "bunny", x: 89, y: 20, size: 34, driftX: -12, driftY: 7, rotate: 10, duration: 7.2, delay: 0.5 },
    { kind: "egg", x: 12, y: 78, size: 26, driftX: 9, driftY: -8, rotate: 12, duration: 5.8, delay: 1.2 },
    { kind: "egg", x: 86, y: 74, size: 24, driftX: -8, driftY: -10, rotate: 10, duration: 6.1, delay: 0.8 },
    { kind: "catkin", x: 4, y: 42, size: 28, driftX: 3, driftY: 12, rotate: 7, duration: 8.6, delay: 0.3 },
    { kind: "catkin", x: 94, y: 46, size: 30, driftX: -3, driftY: 11, rotate: 6, duration: 8.2, delay: 1.1 },
    { kind: "catkin", x: 22, y: 6, size: 22, driftX: 5, driftY: 5, rotate: 5, duration: 7.5, delay: 0.6 },
    { kind: "chick", x: 79, y: 88, size: 24, driftX: -7, driftY: -6, rotate: 8, duration: 5.9, delay: 1.5 },
  ],
  valentine: [
    { kind: "heart", x: 10, y: 16, size: 26, driftX: 10, driftY: 9, rotate: 12, duration: 5.6, delay: 0.2 },
    { kind: "letter", x: 86, y: 20, size: 28, driftX: -8, driftY: 10, rotate: 8, duration: 6.4, delay: 0.7 },
    { kind: "heart", x: 15, y: 78, size: 22, driftX: 8, driftY: -7, rotate: 10, duration: 5.2, delay: 1.3 },
    { kind: "flower", x: 88, y: 72, size: 28, driftX: -6, driftY: -9, rotate: 11, duration: 7.1, delay: 1.1 },
    { kind: "spark", x: 34, y: 10, size: 18, driftX: 6, driftY: 5, rotate: 15, duration: 4.8, delay: 0.4 },
  ],
  christmas: [
    { kind: "star", x: 12, y: 14, size: 26, driftX: 7, driftY: 8, rotate: 12, duration: 5.5, delay: 0.1 },
    { kind: "ornament", x: 88, y: 18, size: 28, driftX: -6, driftY: 9, rotate: 8, duration: 6.6, delay: 0.8 },
    { kind: "ornament", x: 10, y: 78, size: 24, driftX: 8, driftY: -9, rotate: 10, duration: 6.1, delay: 1.5 },
    { kind: "leaf", x: 86, y: 74, size: 30, driftX: -5, driftY: -8, rotate: 10, duration: 7.3, delay: 1.2 },
    { kind: "spark", x: 28, y: 5, size: 18, driftX: 4, driftY: 6, rotate: 16, duration: 4.9, delay: 0.4 },
    { kind: "spark", x: 73, y: 7, size: 16, driftX: -4, driftY: 5, rotate: 15, duration: 4.6, delay: 1.7 },
  ],
  newyear: [
    { kind: "spark", x: 10, y: 16, size: 20, driftX: 12, driftY: 10, rotate: 20, duration: 4.8, delay: 0.1 },
    { kind: "spark", x: 88, y: 19, size: 18, driftX: -10, driftY: 9, rotate: 18, duration: 5.1, delay: 0.6 },
    { kind: "star", x: 18, y: 76, size: 24, driftX: 7, driftY: -10, rotate: 14, duration: 5.5, delay: 1.2 },
    { kind: "balloon", x: 83, y: 72, size: 30, driftX: -5, driftY: -12, rotate: 8, duration: 6.9, delay: 0.9 },
    { kind: "ribbon", x: 48, y: 6, size: 22, driftX: 6, driftY: 5, rotate: 18, duration: 5.2, delay: 1.5 },
  ],
  midsummer: [
    { kind: "leaf", x: 8, y: 18, size: 28, driftX: 8, driftY: 10, rotate: 11, duration: 6.8, delay: 0.2 },
    { kind: "wreath", x: 86, y: 18, size: 36, driftX: -5, driftY: 8, rotate: 8, duration: 7.5, delay: 0.7 },
    { kind: "leaf", x: 14, y: 77, size: 30, driftX: 7, driftY: -9, rotate: 10, duration: 6.2, delay: 1.2 },
    { kind: "flower", x: 88, y: 74, size: 24, driftX: -6, driftY: -8, rotate: 12, duration: 6.5, delay: 1.4 },
    { kind: "spark", x: 52, y: 7, size: 18, driftX: 3, driftY: 6, rotate: 14, duration: 4.7, delay: 0.5 },
  ],
  state: [
    { kind: "flag", x: 11, y: 16, size: 30, driftX: 8, driftY: 6, rotate: 8, duration: 5.7, delay: 0.2 },
    { kind: "ribbon", x: 88, y: 18, size: 28, driftX: -8, driftY: 8, rotate: 10, duration: 6.2, delay: 0.7 },
    { kind: "flag", x: 14, y: 78, size: 26, driftX: 7, driftY: -10, rotate: 9, duration: 5.9, delay: 1.2 },
    { kind: "star", x: 85, y: 74, size: 20, driftX: -5, driftY: -8, rotate: 13, duration: 4.8, delay: 1.5 },
  ],
  womensday: [
    { kind: "flower", x: 10, y: 18, size: 30, driftX: 8, driftY: 9, rotate: 9, duration: 6.2, delay: 0.1 },
    { kind: "heart", x: 88, y: 20, size: 22, driftX: -8, driftY: 7, rotate: 12, duration: 5.3, delay: 0.8 },
    { kind: "flower", x: 14, y: 79, size: 28, driftX: 7, driftY: -8, rotate: 10, duration: 6.6, delay: 1.3 },
    { kind: "spark", x: 85, y: 75, size: 16, driftX: -4, driftY: -6, rotate: 16, duration: 4.7, delay: 1.6 },
  ],
  mensday: [
    { kind: "crest", x: 12, y: 17, size: 30, driftX: 8, driftY: 8, rotate: 8, duration: 6.3, delay: 0.2 },
    { kind: "ember", x: 88, y: 18, size: 24, driftX: -8, driftY: 8, rotate: 14, duration: 5.1, delay: 0.7 },
    { kind: "crest", x: 14, y: 78, size: 26, driftX: 7, driftY: -9, rotate: 9, duration: 6.1, delay: 1.1 },
    { kind: "spark", x: 85, y: 74, size: 18, driftX: -5, driftY: -7, rotate: 16, duration: 4.6, delay: 1.4 },
  ],
  birthday: [
    { kind: "balloon", x: 11, y: 18, size: 32, driftX: 8, driftY: 12, rotate: 8, duration: 7.1, delay: 0.1 },
    { kind: "balloon", x: 88, y: 20, size: 28, driftX: -8, driftY: 10, rotate: 9, duration: 6.8, delay: 0.8 },
    { kind: "spark", x: 14, y: 79, size: 18, driftX: 5, driftY: -8, rotate: 18, duration: 4.6, delay: 1.4 },
    { kind: "star", x: 85, y: 75, size: 20, driftX: -5, driftY: -6, rotate: 15, duration: 5.2, delay: 1.1 },
  ],
  nameday: [
    { kind: "flower", x: 11, y: 18, size: 28, driftX: 8, driftY: 8, rotate: 10, duration: 6.5, delay: 0.2 },
    { kind: "letter", x: 88, y: 20, size: 24, driftX: -8, driftY: 8, rotate: 10, duration: 5.7, delay: 0.9 },
    { kind: "spark", x: 16, y: 79, size: 16, driftX: 5, driftY: -6, rotate: 17, duration: 4.4, delay: 1.3 },
    { kind: "heart", x: 84, y: 75, size: 18, driftX: -4, driftY: -7, rotate: 14, duration: 4.9, delay: 1.5 },
  ],
};

const COLLECTIBLE_BY_THEME: Record<SeasonalThemeId, CollectibleSprite> = {
  easter: { kind: "egg", label: "Collect Easter surprise" },
  valentine: { kind: "heart", label: "Collect Valentine surprise" },
  christmas: { kind: "star", label: "Collect Christmas surprise" },
  newyear: { kind: "spark", label: "Collect New Year surprise" },
  midsummer: { kind: "wreath", label: "Collect Midsummer surprise" },
  state: { kind: "flag", label: "Collect State holiday surprise" },
  womensday: { kind: "flower", label: "Collect Women's day surprise" },
  mensday: { kind: "crest", label: "Collect Men's day surprise" },
  birthday: { kind: "balloon", label: "Collect birthday surprise" },
  nameday: { kind: "letter", label: "Collect nameday surprise" },
};

export function getSeasonalVisuals(theme: SeasonalTheme) {
  const base = VISUALS_BY_THEME[theme.id];

  if (theme.phase === "peak") {
    return base;
  }

  if (theme.phase === "after") {
    return base.slice(0, Math.max(3, base.length - 2));
  }

  return base.slice(0, Math.max(4, base.length - 1));
}

export function getCollectibleSprite(themeId: SeasonalThemeId) {
  return COLLECTIBLE_BY_THEME[themeId];
}
