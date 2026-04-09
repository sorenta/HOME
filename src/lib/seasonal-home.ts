export type SeasonalThemeId =
  | "easter"
  | "valentine"
  | "christmas"
  | "newyear"
  | "midsummer"
  | "state"
  | "womensday"
  | "mensday"
  | "birthday"
  | "nameday";
export type SeasonalThemePhase = "lead" | "peak" | "after";

export type SeasonalTheme = {
  id: SeasonalThemeId;
  phase: SeasonalThemePhase;
  seasonKey: string;
};

export type SeasonalProfileDates = {
  birthday_at?: string | null;
  name_day_at?: string | null;
};

export const SEASONAL_COLLECTIBLE_SPOTS = [
  "home",
  "household",
  "finance",
  "reset",
  "kitchen",
  "pharmacy",
  "events",
  "profile",
  "settings",
] as const;

export type SeasonalCollectibleSpot = (typeof SEASONAL_COLLECTIBLE_SPOTS)[number];

export function getActiveSeasonalTheme(
  _date = new Date(),
  _profileDates?: SeasonalProfileDates | null,
): SeasonalTheme | null {
  void _date;
  void _profileDates;
  // Seasonal themes temporarily disabled per request — always return null.
  // To re-enable, restore previous matching logic above.
  return null;
}
