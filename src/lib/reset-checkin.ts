const STORAGE_V2 = "majapps-reset-checkins-v2";
const LEGACY_KEY = "majapps-last-reset-date";

export const MAX_RESET_CHECKINS_PER_DAY = 3;

function todayLocalIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type DayBucket = { date: string; count: number };

function readBucket(): DayBucket {
  if (typeof window === "undefined") {
    return { date: todayLocalIso(), count: 0 };
  }
  migrateLegacyOnce();
  try {
    const raw = localStorage.getItem(STORAGE_V2);
    if (!raw) return { date: todayLocalIso(), count: 0 };
    const p = JSON.parse(raw) as { date?: string; count?: number };
    if (p.date !== todayLocalIso()) return { date: todayLocalIso(), count: 0 };
    const c = Number(p.count);
    return {
      date: p.date!,
      count: Math.min(MAX_RESET_CHECKINS_PER_DAY, Math.max(0, Number.isFinite(c) ? c : 0)),
    };
  } catch {
    return { date: todayLocalIso(), count: 0 };
  }
}

function migrateLegacyOnce(): void {
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy === todayLocalIso() && !localStorage.getItem(STORAGE_V2)) {
      localStorage.setItem(
        STORAGE_V2,
        JSON.stringify({ date: todayLocalIso(), count: 1 }),
      );
    }
  } catch {
    /* ignore */
  }
}

export function getTodayCheckInCount(): number {
  return readBucket().count;
}

export function canCheckInToday(): boolean {
  return getTodayCheckInCount() < MAX_RESET_CHECKINS_PER_DAY;
}

/** Vismaz viens check-in šodien (dashboard u.c.). */
export function hasResetCheckInToday(): boolean {
  return getTodayCheckInCount() > 0;
}

/** Sinhronizē lokālo skaitītāju ar serveri (ne mazāku par pašreizējo lokālo). */
export function setTodayCheckInCountFromServer(count: number): void {
  if (typeof window === "undefined") return;
  const c = Math.min(MAX_RESET_CHECKINS_PER_DAY, Math.max(0, count));
  try {
    const local = readBucket().count;
    const next = Math.max(local, c);
    localStorage.setItem(
      STORAGE_V2,
      JSON.stringify({ date: todayLocalIso(), count: next }),
    );
  } catch {
    /* ignore */
  }
}

export function appendCheckInLocal(): void {
  if (typeof window === "undefined") return;
  migrateLegacyOnce();
  try {
    const b = readBucket();
    const next = {
      date: todayLocalIso(),
      count: Math.min(MAX_RESET_CHECKINS_PER_DAY, b.count + 1),
    };
    localStorage.setItem(STORAGE_V2, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function markResetCheckInDone(): void {
  appendCheckInLocal();
}
