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

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function diffInDays(from: Date, to: Date) {
  return Math.round(
    (startOfDay(to).getTime() - startOfDay(from).getTime()) / 86_400_000,
  );
}

function getWindowPhase(date: Date, target: Date): SeasonalThemePhase | null {
  const start = addDays(target, -7);
  const end = addDays(target, 2);

  if (date < start || date > end) return null;

  const offset = diffInDays(target, date);

  if (offset < 0) return "lead";
  if (offset === 0) return "peak";
  return "after";
}

function getWesternEaster(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}

function getEasterTheme(date: Date): SeasonalTheme | null {
  const easter = getWesternEaster(date.getFullYear());
  const phase = getWindowPhase(date, easter);
  return phase
    ? { id: "easter", phase, seasonKey: `easter-${easter.getFullYear()}` }
    : null;
}

function getMultiDayTheme(
  date: Date,
  id: Extract<SeasonalThemeId, "midsummer">,
  startMonth: number,
  startDay: number,
  endMonth: number,
  endDay: number,
): SeasonalTheme | null {
  const year = date.getFullYear();
  const leadStart = new Date(year, startMonth - 1, startDay - 7);
  const peakStart = new Date(year, startMonth - 1, startDay);
  const peakEnd = new Date(year, endMonth - 1, endDay);
  const afterEnd = addDays(peakEnd, 2);

  if (date < leadStart || date > afterEnd) return null;

  if (date >= peakStart && date <= peakEnd) {
    return { id, phase: "peak", seasonKey: `${id}-${year}` };
  }

  if (date < peakStart) {
    return { id, phase: "lead", seasonKey: `${id}-${year}` };
  }

  return { id, phase: "after", seasonKey: `${id}-${year}` };
}

function getFixedHolidayTheme(
  date: Date,
  id: Exclude<SeasonalThemeId, "easter" | "birthday" | "nameday">,
  month: number,
  day: number,
) {
  const candidates = [
    new Date(date.getFullYear() - 1, month - 1, day),
    new Date(date.getFullYear(), month - 1, day),
    new Date(date.getFullYear() + 1, month - 1, day),
  ];

  for (const candidate of candidates) {
    const phase = getWindowPhase(date, candidate);
    if (phase) {
      return {
        id,
        phase,
        seasonKey: `${id}-${candidate.getFullYear()}`,
      } satisfies SeasonalTheme;
    }
  }

  return null;
}

function parseMonthDay(value: string | null | undefined) {
  if (!value) return null;

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;

  return {
    month: parsed.getMonth() + 1,
    day: parsed.getDate(),
  };
}

function getRecurringProfileTheme(
  date: Date,
  id: Extract<SeasonalThemeId, "birthday" | "nameday">,
  storedDate: string | null | undefined,
) {
  const parts = parseMonthDay(storedDate);
  if (!parts) return null;

  const candidates = [
    new Date(date.getFullYear() - 1, parts.month - 1, parts.day),
    new Date(date.getFullYear(), parts.month - 1, parts.day),
    new Date(date.getFullYear() + 1, parts.month - 1, parts.day),
  ];

  for (const candidate of candidates) {
    const phase = getWindowPhase(date, candidate);
    if (phase) {
      return {
        id,
        phase,
        seasonKey: `${id}-${candidate.getFullYear()}`,
      } satisfies SeasonalTheme;
    }
  }

  return null;
}

export function getActiveSeasonalTheme(
  date = new Date(),
  profileDates?: SeasonalProfileDates | null,
): SeasonalTheme | null {
  // Seasonal themes temporarily disabled per request — always return null.
  // To re-enable, restore previous matching logic above.
  return null;
}
