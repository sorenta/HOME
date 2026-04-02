/**
 * Daily household water competition — local-first only.
 * Scoped by household id or `personal:${userId}` so data stays partitioned.
 * Medals for yesterday are settled once per calendar day when the app loads.
 */

const STORAGE_KEY = "majapps-household-water-v1";

export type WaterAchievementCounts = {
  gold: number;
  silver: number;
  bronze: number;
};

export type HouseholdWaterV1 = {
  version: 1;
  scopeId: string;
  goalMl: number;
  /** YYYY-MM-DD -> memberId -> ml logged */
  byDate: Record<string, Record<string, number>>;
  achievements: Record<string, WaterAchievementCounts>;
  /** Dates for which yesterday-style medal settlement was applied */
  settledForDay: string[];
};

export function defaultWaterState(scopeId: string): HouseholdWaterV1 {
  return {
    version: 1,
    scopeId,
    goalMl: 2000,
    byDate: {},
    achievements: {},
    settledForDay: [],
  };
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function todayIso(): string {
  return isoDate(new Date());
}

export function yesterdayIso(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return isoDate(d);
}

function parse(raw: string | null, scopeId: string): HouseholdWaterV1 {
  if (!raw) return defaultWaterState(scopeId);
  try {
    const data = JSON.parse(raw) as Partial<HouseholdWaterV1>;
    if (data.version !== 1) return defaultWaterState(scopeId);
    return {
      version: 1,
      scopeId: data.scopeId === scopeId ? scopeId : scopeId,
      goalMl: typeof data.goalMl === "number" && data.goalMl > 0 ? data.goalMl : 2000,
      byDate: typeof data.byDate === "object" && data.byDate ? data.byDate : {},
      achievements:
        typeof data.achievements === "object" && data.achievements ? data.achievements : {},
      settledForDay: Array.isArray(data.settledForDay) ? data.settledForDay : [],
    };
  } catch {
    return defaultWaterState(scopeId);
  }
}

export function loadWaterState(scopeId: string): HouseholdWaterV1 {
  if (typeof window === "undefined") return defaultWaterState(scopeId);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = parse(raw, scopeId);
    if (parsed.scopeId !== scopeId) {
      return defaultWaterState(scopeId);
    }
    return parsed;
  } catch {
    return defaultWaterState(scopeId);
  }
}

export function saveWaterState(next: HouseholdWaterV1): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function getMlForMember(state: HouseholdWaterV1, date: string, memberId: string): number {
  return state.byDate[date]?.[memberId] ?? 0;
}

export function addWater(
  state: HouseholdWaterV1,
  date: string,
  memberId: string,
  deltaMl: number,
): HouseholdWaterV1 {
  const day = { ...(state.byDate[date] ?? {}) };
  const prev = day[memberId] ?? 0;
  day[memberId] = Math.max(0, prev + deltaMl);
  return {
    ...state,
    byDate: { ...state.byDate, [date]: day },
  };
}

function emptyAchievements(): WaterAchievementCounts {
  return { gold: 0, silver: 0, bronze: 0 };
}

/**
 * Award 🥇🥈🥉 for `targetDate` based on totals; idempotent per `settlementKey`
 * (typically today's iso so we only run once per app-day).
 */
export function settleMedalsForDate(
  state: HouseholdWaterV1,
  targetDate: string,
  memberIds: string[],
  settlementKey: string,
): HouseholdWaterV1 {
  if (state.settledForDay.includes(settlementKey)) return state;

  const totals = memberIds.map((id) => ({
    id,
    ml: getMlForMember(state, targetDate, id),
  }));
  totals.sort((a, b) => b.ml - a.ml);

  const achievements = { ...state.achievements };
  for (const m of memberIds) {
    if (!achievements[m]) achievements[m] = emptyAchievements();
  }

  const ranked = totals.filter((t) => t.ml > 0);
  if (ranked.length > 0) {
    const first = ranked[0]?.ml;
    const goldIds = ranked.filter((t) => t.ml === first).map((t) => t.id);
    for (const id of goldIds) {
      achievements[id] = { ...achievements[id]!, gold: achievements[id]!.gold + 1 };
    }
    const rest = ranked.filter((t) => !goldIds.includes(t.id));
    if (rest.length > 0) {
      const second = rest[0]?.ml;
      const silverIds = rest.filter((t) => t.ml === second).map((t) => t.id);
      for (const id of silverIds) {
        achievements[id] = { ...achievements[id]!, silver: achievements[id]!.silver + 1 };
      }
      const rest2 = rest.filter((t) => !silverIds.includes(t.id));
      if (rest2.length > 0) {
        const third = rest2[0]?.ml;
        const bronzeIds = rest2.filter((t) => t.ml === third).map((t) => t.id);
        for (const id of bronzeIds) {
          achievements[id] = { ...achievements[id]!, bronze: achievements[id]!.bronze + 1 };
        }
      }
    }
  }

  return {
    ...state,
    achievements,
    settledForDay: [...state.settledForDay, settlementKey],
  };
}

/** Call on dashboard mount: settle yesterday's podium once per local day */
export function runDailyMedalSettlement(
  state: HouseholdWaterV1,
  memberIds: string[],
): HouseholdWaterV1 {
  const y = yesterdayIso();
  const t = todayIso();
  const settlementKey = `settled-yesterday-${y}-on-${t}`;
  return settleMedalsForDate(state, y, memberIds, settlementKey);
}
